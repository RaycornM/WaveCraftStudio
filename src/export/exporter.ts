// 高质量导出：离线逐帧渲染（非实时录制）
// 视频：固定帧步长驱动同一 renderFrame → VideoEncoder(H.264) → mp4-muxer
// 音频：OfflineAudioContext 渲染整段 PCM → AudioEncoder(AAC)
// encodeTimeline 为编码核心，单曲导出与多音频拼接导出（concatExport）共用。
import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import type { AudioFrameData, ExportProgress, ExportSettings, RenderAssets, VisualConfig } from '@/types';
import { LAYOUTS } from '@/render/layouts';
import { renderFrame } from '@/render/renderer';
import { analyzeOffline, frameAt, type OfflineAnalysisResult } from '@/audio/offlineAnalysis';
import { seekVideoFrame } from '@/state/bgVideo';

/** 浏览器编码能力探测 */
export function checkEncoderSupport(): { video: boolean; audio: boolean; message: string | null } {
  const video = typeof VideoEncoder !== 'undefined';
  const audio = typeof AudioEncoder !== 'undefined';
  if (!video) {
    return { video, audio, message: '当前浏览器不支持 WebCodecs 视频编码，请使用 Chrome / Edge 94+ 导出视频。' };
  }
  if (!audio) {
    return { video, audio, message: '当前浏览器不支持 AudioEncoder，导出的视频将没有声音（建议 Chrome / Edge 最新版）。' };
  }
  return { video, audio, message: null };
}

/** 按规格选 H.264 codec 字符串（High Profile，level 随分辨率/帧率） */
function avcCodecString(resolution: '720p' | '1080p', fps: number): string {
  // High Profile = 64 00 xx；level: 720p→3.1(1f)，1080p30→4.0(28)，1080p60→4.2(2a)
  if (resolution === '720p') return fps > 30 ? 'avc1.640028' : 'avc1.64001f';
  return fps > 30 ? 'avc1.64002a' : 'avc1.640028';
}

export interface ExportJob {
  promise: Promise<Blob>;
  cancel: () => void;
}

/** 拼接时间线上的曲目段落（导出时标题/封面按段落切换） */
export interface TimelineSegment {
  start: number;
  end: number;
  title: string;
  artist: string;
  /** 该曲目专属封面（无则用全局背景图） */
  cover?: HTMLImageElement;
}

interface EncodeTimelineOpts {
  /** 逐帧音频分析（时间戳与导出时间线一致） */
  analysis: OfflineAnalysisResult;
  /** 整段 PCM（null 表示无音轨降级） */
  pcmBuffer: AudioBuffer | null;
  duration: number;
  config: VisualConfig;
  assets: RenderAssets;
  settings: ExportSettings;
  onProgress: (p: ExportProgress) => void;
  /** 拼接导出的段落表；单曲导出不传 */
  segments?: TimelineSegment[];
}

/**
 * 单曲导出入口。
 * @param start 起始时间（秒）；loop 模式为区间起点
 * @param duration 导出时长（秒）；full 模式 = 整曲，loop 模式 = 8
 */
export function exportVideo(opts: {
  audioBuffer: AudioBuffer;
  config: VisualConfig;
  assets: RenderAssets;
  settings: ExportSettings;
  start: number;
  duration: number;
  onProgress: (p: ExportProgress) => void;
}): ExportJob {
  const abort = new AbortController();
  const promise = runExport(opts, abort.signal);
  return { promise, cancel: () => abort.abort() };
}

async function runExport(
  opts: {
    audioBuffer: AudioBuffer;
    config: VisualConfig;
    assets: RenderAssets;
    settings: ExportSettings;
    start: number;
    duration: number;
    onProgress: (p: ExportProgress) => void;
  },
  signal: AbortSignal,
): Promise<Blob> {
  const { audioBuffer, config, settings, start, duration, onProgress } = opts;
  const throwIfAborted = () => {
    if (signal.aborted) throw new DOMException('导出已取消', 'AbortError');
  };

  // ---------- 1. 离线音频分析（逐帧 audioData 缓存） ----------
  onProgress({ ratio: 0, stage: '正在分析音频…', etaSeconds: 0 });
  let analysis: OfflineAnalysisResult;
  try {
    analysis = await analyzeOffline(audioBuffer, {
      beatThreshold: config.analysis.beatThreshold,
      analyserSmoothing: config.analysis.analyserSmoothing,
      onProgress: (r) => onProgress({ ratio: r * 0.2, stage: '正在分析音频…', etaSeconds: 0 }),
      signal,
    });
  } catch (e) {
    if ((e as DOMException).name === 'AbortError') throw e;
    throw new Error('音频分析失败，请重试或更换音频文件。');
  }
  throwIfAborted();

  // ---------- 2. 音轨 PCM：OfflineAudioContext 渲染 [start, start+duration) ----------
  onProgress({ ratio: 0.22, stage: '正在渲染音轨…', etaSeconds: 0 });
  const support = checkEncoderSupport();
  let pcmBuffer: AudioBuffer | null = null;
  if (support.audio) {
    const sr = 44100;
    const channels = Math.min(2, audioBuffer.numberOfChannels);
    const offline = new OfflineAudioContext(channels, Math.ceil(duration * sr), sr);
    const src = offline.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(offline.destination);
    src.start(0, start, duration);
    pcmBuffer = await offline.startRendering();
    throwIfAborted();
  }

  // 单曲导出：分析帧时间戳是绝对音频时间，frameAt 按 start+t 索引——
  // 通过把 analysis 时间轴平移成导出线（减去 start）交给统一核心。
  const shifted = shiftAnalysis(analysis, -start);
  return encodeTimeline(
    { analysis: shifted, pcmBuffer, duration, config, assets: opts.assets, settings, onProgress },
    signal,
  );
}

/** 平移分析帧时间轴（拼接/切片对齐用） */
export function shiftAnalysis(analysis: OfflineAnalysisResult, dt: number): OfflineAnalysisResult {
  if (dt === 0) return analysis;
  for (const f of analysis.frames) f.t += dt;
  return analysis;
}

/**
 * 编码核心：分析与 PCM 就绪后的 mux/encode/逐帧渲染全流程。
 * 支持 segments（拼接导出）：按帧时间取当前段落的标题与封面。
 */
export async function encodeTimeline(opts: EncodeTimelineOpts, signal: AbortSignal): Promise<Blob> {
  const { analysis, config, settings, duration, onProgress, segments } = opts;
  const t0 = performance.now();
  const throwIfAborted = () => {
    if (signal.aborted) throw new DOMException('导出已取消', 'AbortError');
  };

  // ---------- 输出规格 ----------
  const layout = LAYOUTS[config.layout];
  const scaleFactor = settings.resolution === '720p' ? 720 / layout.height : 1;
  // H.264 要求偶数宽高（如 9:16@720p → 405×720 必须修约为偶数）
  const toEven = (n: number) => Math.max(2, Math.round(n) & ~1);
  const outW = toEven(layout.width * scaleFactor);
  const outH = toEven(layout.height * scaleFactor);
  const fps = settings.fps;
  const totalFrames = Math.round(duration * fps);
  const isLoop = settings.mode === 'loop';

  // ---------- 音轨编码准备 ----------
  onProgress({ ratio: 0.24, stage: '正在准备编码器…', etaSeconds: 0 });
  const support = checkEncoderSupport();
  let muxerAudio: { codec: 'aac'; sampleRate: number; numberOfChannels: number } | undefined;
  let pcmBuffer = opts.pcmBuffer;

  if (support.audio && pcmBuffer) {
    const sr = pcmBuffer.sampleRate;
    const channels = pcmBuffer.numberOfChannels;
    const audioConfig: AudioEncoderConfig = {
      codec: 'mp4a.40.2',
      sampleRate: sr,
      numberOfChannels: channels,
      bitrate: 192_000,
    };
    const audioSupport = await AudioEncoder.isConfigSupported(audioConfig);
    if (audioSupport.supported) {
      muxerAudio = { codec: 'aac', sampleRate: sr, numberOfChannels: channels };
    } else {
      pcmBuffer = null; // 明确降级：无音轨导出
    }
  } else {
    pcmBuffer = null;
  }

  // ---------- Muxer 与编码器 ----------
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: outW, height: outH, frameRate: fps },
    audio: muxerAudio,
    fastStart: 'in-memory',
  });

  // 用对象持有错误，避免 TS 对闭包内赋值的窄化误判
  const errBox: { e: Error | null } = { e: null };
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      errBox.e = e;
    },
  });

  const bitrate = settings.bitrate * 1_000_000;
  const videoConfig: VideoEncoderConfig = {
    codec: avcCodecString(settings.resolution, fps),
    width: outW,
    height: outH,
    bitrate,
    framerate: fps,
  };
  // 编码能力回退：依次尝试 High → Main → Baseline
  let configured = false;
  for (const candidate of [videoConfig.codec, 'avc1.4d002a', 'avc1.42002a']) {
    try {
      const res = await VideoEncoder.isConfigSupported({ ...videoConfig, codec: candidate });
      if (res.supported) {
        videoEncoder.configure({ ...videoConfig, codec: candidate });
        configured = true;
        break;
      }
    } catch {
      /* 尝试下一档 */
    }
  }
  if (!configured) throw new Error('当前浏览器不支持所需的 H.264 编码配置，请更换浏览器或降低导出规格。');

  let audioEncoder: AudioEncoder | null = null;
  if (muxerAudio && pcmBuffer) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: () => {
        /* 音频失败不阻断视频，降级为无声 */
      },
    });
    audioEncoder.configure({
      codec: 'mp4a.40.2',
      sampleRate: muxerAudio.sampleRate,
      numberOfChannels: muxerAudio.numberOfChannels,
      bitrate: 192_000,
    });
  }

  // ---------- 送入音频帧（整块 PCM 分片编码） ----------
  if (audioEncoder && pcmBuffer && muxerAudio) {
    const sr = muxerAudio.sampleRate;
    const ch = muxerAudio.numberOfChannels;
    const chunkFrames = 4096;
    const total = pcmBuffer.length;
    for (let offset = 0; offset < total; offset += chunkFrames) {
      throwIfAborted();
      const frames = Math.min(chunkFrames, total - offset);
      // f32-planar：声道数据平面拼接
      const data = new Float32Array(frames * ch);
      for (let c = 0; c < ch; c++) {
        const channelData = pcmBuffer.getChannelData(c);
        data.set(channelData.subarray(offset, offset + frames), c * frames);
      }
      const audioData = new AudioData({
        format: 'f32-planar',
        sampleRate: sr,
        numberOfFrames: frames,
        numberOfChannels: ch,
        timestamp: Math.round((offset / sr) * 1_000_000),
        data: data.buffer,
      });
      audioEncoder.encode(audioData);
      audioData.close();
      if (audioEncoder.encodeQueueSize > 8) {
        await new Promise((r) => audioEncoder!.addEventListener('dequeue', r, { once: true }));
      }
    }
    await audioEncoder.flush();
    audioEncoder.close();
  }
  throwIfAborted();
  onProgress({ ratio: 0.3, stage: '正在逐帧渲染…', etaSeconds: 0 });

  // ---------- 逐帧渲染 + 视频编码 ----------
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const renderAssets: RenderAssets = {
    ...opts.assets,
    duration,
    loopPeriod: isLoop ? duration : undefined,
  };

  const frameDurationUs = Math.round(1_000_000 / fps);
  const bgVideo = renderAssets.bgVideo ?? null;
  if (bgVideo) bgVideo.pause(); // 导出时逐帧 seek，不走连续播放

  let lastSegIdx = -1;
  for (let i = 0; i < totalFrames; i++) {
    throwIfAborted();
    if (errBox.e) throw new Error(`视频编码失败：${errBox.e.message}`);

    const t = i / fps; // 导出时间线本地时间
    // 背景视频：逐帧 seek 到与音频同步的时间点（带超时兜底，超时沿用上一帧）
    if (bgVideo) {
      const vd = bgVideo.duration || duration;
      await seekVideoFrame(bgVideo, t % vd, 400);
    }

    // 拼接导出：定位当前帧所在曲目段，切换标题与封面（红线不变：仍是同一 renderFrame）
    let frameConfig = config;
    let frameAssets = renderAssets;
    if (segments && segments.length > 0) {
      let segIdx = segments.findIndex((s) => t >= s.start && t < s.end);
      if (segIdx < 0) segIdx = segments.length - 1;
      const seg = segments[segIdx];
      frameConfig = {
        ...config,
        title: { ...config.title, title: seg.title, artist: seg.artist, startOffset: seg.start },
      };
      if (seg.cover) frameAssets = { ...renderAssets, albumArt: seg.cover }; // 每首曲目切自己的专辑图，背景保持统一
      if (segIdx !== lastSegIdx) lastSegIdx = segIdx;
    }

    const audioFrame: AudioFrameData = frameAt(analysis, t);
    renderFrame(ctx, t, audioFrame, frameConfig, frameAssets);

    const frame = new VideoFrame(canvas, { timestamp: i * frameDurationUs, duration: frameDurationUs });
    // 每 2 秒一个关键帧
    videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();

    // 背压控制 + 让出主线程
    if (videoEncoder.encodeQueueSize > 6) {
      await new Promise((r) => videoEncoder.addEventListener('dequeue', r, { once: true }));
    }
    if (i % 10 === 0) {
      const elapsed = (performance.now() - t0) / 1000;
      const ratio = 0.3 + (i / totalFrames) * 0.68;
      const eta = i > 0 ? (elapsed / i) * (totalFrames - i) : 0;
      onProgress({ ratio, stage: `正在逐帧渲染… ${i}/${totalFrames}`, etaSeconds: eta });
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  await videoEncoder.flush();
  videoEncoder.close();
  throwIfAborted();

  // ---------- 封装 ----------
  onProgress({ ratio: 0.99, stage: '正在封装 MP4…', etaSeconds: 0 });
  muxer.finalize();
  const { buffer } = muxer.target;
  onProgress({ ratio: 1, stage: '完成', etaSeconds: 0 });
  return new Blob([buffer], { type: 'video/mp4' });
}
