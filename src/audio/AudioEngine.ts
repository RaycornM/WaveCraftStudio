// AudioEngine：AudioContext 生命周期、解码、播放控制、seek
// 预览播放使用 AudioBufferSourceNode + AnalyserNode 实时分析。
import { ANALYSER_MAX_DB, ANALYSER_MIN_DB, FFT_SIZE } from './analyzer';

/** 拼接队列曲目（预览连播用） */
export interface QueueTrack {
  id: string;
  name: string;
  title: string;
  artist: string;
  blob: Blob;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;

  buffer: AudioBuffer | null = null;

  private startCtxTime = 0; // 当前 source 启动时的 ctx.currentTime
  private startOffset = 0; // 当前 source 启动时对应的 buffer 偏移（秒）
  private _playing = false;
  /** 循环试听模式：只播放 [loopStart, loopStart+loopLen] 区间 */
  private loopRange: { start: number; len: number } | null = null;

  /** 拼接队列状态：非空表示处于队列连播模式 */
  private queue: {
    tracks: QueueTrack[];
    buffers: AudioBuffer[];
    /** 各曲目在总时间线的起始偏移（秒） */
    offsets: number[];
    index: number;
    /** 暂停时记录的全局时间 */
    pausedT: number;
  } | null = null;

  onEnded: (() => void) | null = null;
  /** 队列连播切换到新曲目时触发（参数：新曲目索引、全局起点偏移、曲目信息） */
  onQueueTrackChange: ((index: number, globalStartOffset: number, track: QueueTrack) => void) | null = null;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = FFT_SIZE;
      this.analyser.smoothingTimeConstant = 0.75;
      // 收窄 dB 范围拉开强弱对比（默认 -100/-30 下 bin 值挤在低段）
      this.analyser.minDecibels = ANALYSER_MIN_DB;
      this.analyser.maxDecibels = ANALYSER_MAX_DB;
      this.gain = this.ctx.createGain();
      // source -> analyser -> gain -> destination（分析节点不消耗信号）
      this.analyser.connect(this.gain);
      this.gain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** 解码音频文件（整个文件进入内存，浏览器本地处理不上传）；单曲模式，退出队列 */
  async load(file: File | Blob): Promise<AudioBuffer> {
    const ctx = this.ensureCtx();
    const arr = await file.arrayBuffer();
    this.stopInternal();
    this.queue = null;
    this.buffer = await ctx.decodeAudioData(arr);
    return this.buffer;
  }

  /** 解码 Blob（队列曲目用，不替换当前 buffer） */
  private async decodeBlob(blob: Blob): Promise<AudioBuffer> {
    const ctx = this.ensureCtx();
    const arr = await blob.arrayBuffer();
    return ctx.decodeAudioData(arr);
  }

  /**
   * 进入队列连播模式：解码全部曲目，从 startIndex 的 offset 秒开始播。
   * 一首自然结束自动切下一首；总时长为各曲目之和。
   */
  async playQueue(tracks: QueueTrack[], startIndex = 0, offset = 0, autoplay = true): Promise<void> {
    if (tracks.length === 0) return;
    const buffers: AudioBuffer[] = [];
    for (const tr of tracks) {
      buffers.push(await this.decodeBlob(tr.blob));
    }
    const offsets: number[] = [];
    let acc = 0;
    for (const b of buffers) {
      offsets.push(acc);
      acc += b.duration;
    }
    this.stopInternal();
    this.loopRange = null;
    this.queue = { tracks, buffers, offsets, index: Math.min(startIndex, tracks.length - 1), pausedT: offsets[Math.min(startIndex, tracks.length - 1)] + offset };
    this.buffer = buffers[this.queue.index];
    if (autoplay) this.playQueueIndex(this.queue.index, offset);
  }

  /** 退出队列模式 */
  exitQueue() {
    this.stopInternal();
    this.queue = null;
  }

  get queueActive(): boolean {
    return this.queue !== null;
  }

  /** 队列信息（UI 显示当前第几首/共几首/曲目名） */
  get queueInfo(): { index: number; count: number; id: string; name: string; startOffset: number } | null {
    if (!this.queue) return null;
    return {
      index: this.queue.index,
      count: this.queue.tracks.length,
      id: this.queue.tracks[this.queue.index].id,
      name: this.queue.tracks[this.queue.index].title || this.queue.tracks[this.queue.index].name,
      startOffset: this.queue.offsets[this.queue.index],
    };
  }

  /** 连播中跳转到第 index 首从头播放（复用已解码 buffer，不重建队列） */
  seekQueueTrack(index: number) {
    const q = this.queue;
    if (!q || index < 0 || index >= q.tracks.length) return;
    q.pausedT = q.offsets[index];
    this.onQueueTrackChange?.(index, q.offsets[index], q.tracks[index]);
    this.playQueueIndex(index, 0);
  }

  /** 播放队列中第 index 首的 offset 秒处 */
  private playQueueIndex(index: number, offset: number) {
    const q = this.queue;
    if (!q) return;
    const ctx = this.ensureCtx();
    this.stopInternal();
    q.index = index;
    this.buffer = q.buffers[index];
    const src = ctx.createBufferSource();
    src.buffer = this.buffer;
    src.connect(this.analyser!);
    src.onended = () => {
      if (!this._playing || !this.queue) return;
      const next = index + 1;
      if (next < q.tracks.length) {
        // 自然连播下一首
        this.onQueueTrackChange?.(next, q.offsets[next], q.tracks[next]);
        this.playQueueIndex(next, 0);
      } else {
        // 全部播完：退出到队首待命
        this._playing = false;
        this.queue.pausedT = 0;
        this.onEnded?.();
      }
    };
    src.start(0, Math.min(offset, this.buffer.duration));
    this.source = src;
    this.startCtxTime = ctx.currentTime;
    this.startOffset = Math.min(offset, this.buffer.duration);
    this._playing = true;
  }

  get playing(): boolean {
    return this._playing;
  }

  /** 总时长（队列模式为各曲目之和） */
  get duration(): number {
    if (this.queue) {
      const q = this.queue;
      const last = q.buffers.length - 1;
      return q.offsets[last] + q.buffers[last].duration;
    }
    return this.buffer?.duration ?? 0;
  }

  /** 当前播放位置（秒；队列模式为全局时间线） */
  get currentTime(): number {
    if (!this.buffer) return 0;
    if (!this._playing || !this.ctx) {
      return this.queue ? this.queue.pausedT : this.startOffset;
    }
    let t = this.startOffset + (this.ctx.currentTime - this.startCtxTime);
    if (this.loopRange) {
      // 循环区间内回绕
      const { start, len } = this.loopRange;
      if (t >= start + len) {
        // 已自然回绕（source 设置了 loop），校正显示值
        t = start + ((t - start) % len);
      }
    }
    const local = Math.min(t, this.buffer.duration);
    return this.queue ? this.queue.offsets[this.queue.index] + local : local;
  }

  setAnalyserSmoothing(v: number) {
    if (this.analyser) this.analyser.smoothingTimeConstant = v;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? 44100;
  }

  private stopInternal() {
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch {
        /* 已停止 */
      }
      this.source.disconnect();
      this.source = null;
    }
    this._playing = false;
  }

  play(offset?: number) {
    // 队列模式：从暂停的全局时间点续播
    if (this.queue && offset === undefined) {
      const q = this.queue;
      this.playQueueIndex(q.index, Math.max(0, q.pausedT - q.offsets[q.index]));
      return;
    }
    if (!this.buffer) return;
    const ctx = this.ensureCtx();
    this.stopInternal();
    const startAt = offset ?? Math.min(this.startOffset, this.duration);
    const src = ctx.createBufferSource();
    src.buffer = this.buffer;
    if (this.loopRange) {
      src.loop = true;
      src.loopStart = this.loopRange.start;
      src.loopEnd = this.loopRange.start + this.loopRange.len;
    }
    src.connect(this.analyser!);
    src.onended = () => {
      // 自然播完（非手动 stop）：归位
      if (this._playing) {
        this._playing = false;
        this.startOffset = 0;
        this.onEnded?.();
      }
    };
    src.start(0, Math.min(startAt, this.duration));
    this.source = src;
    this.startCtxTime = ctx.currentTime;
    this.startOffset = Math.min(startAt, this.duration);
    this._playing = true;
  }

  pause() {
    if (!this._playing) return;
    if (this.queue) {
      this.queue.pausedT = this.currentTime;
    } else {
      this.startOffset = this.currentTime;
    }
    this.stopInternal();
  }

  /** seek：若正在播放则从新位置续播，画面随下一帧同步跳转；队列模式按全局时间线定位曲目 */
  seek(t: number) {
    const wasPlaying = this._playing;
    const clamped = Math.max(0, Math.min(t, this.duration));
    if (this.queue) {
      const q = this.queue;
      // 定位曲目段
      let index = q.offsets.length - 1;
      for (let i = 0; i < q.offsets.length; i++) {
        if (clamped < q.offsets[i] + q.buffers[i].duration || i === q.offsets.length - 1) {
          index = i;
          break;
        }
      }
      const local = Math.max(0, clamped - q.offsets[index]);
      q.pausedT = clamped;
      const prevIndex = q.index;
      if (wasPlaying) {
        if (index !== prevIndex) this.onQueueTrackChange?.(index, q.offsets[index], q.tracks[index]);
        this.playQueueIndex(index, local);
      } else {
        q.index = index;
        this.buffer = q.buffers[index];
        if (index !== prevIndex) this.onQueueTrackChange?.(index, q.offsets[index], q.tracks[index]);
      }
      return;
    }
    this.startOffset = clamped;
    if (wasPlaying) this.play(this.startOffset);
  }

  /** 开关循环试听（8 秒无缝循环验证用） */
  setLoopRange(range: { start: number; len: number } | null) {
    this.loopRange = range;
    if (this._playing) this.play(range ? range.start : this.startOffset);
  }

  get loopEnabled(): boolean {
    return this.loopRange !== null;
  }

  dispose() {
    this.stopInternal();
    void this.ctx?.close();
    this.ctx = null;
    this.analyser = null;
    this.buffer = null;
  }
}

/** 全局单例（预览引擎） */
export const audioEngine = new AudioEngine();
