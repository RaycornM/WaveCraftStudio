// 整段音频离线分析：OfflineAudioContext + suspend 分块采样 FFT，
// 按 ANALYSIS_FPS 固定帧率产出逐帧 AudioFrameData 数组（与预览同构）。
// 节拍检测状态机按时间轴顺序跑一遍。
import { ANALYSER_MAX_DB, ANALYSER_MIN_DB, ANALYSIS_FPS, BandNormalizer, BeatDetector, FFT_SIZE, buildFrame } from './analyzer';
import type { AudioFrameData } from '@/types';

export interface OfflineAnalysisResult {
  frames: AudioFrameData[];
  fps: number;
  duration: number;
}

/**
 * 对整段 buffer 做离线分析。
 * 原理：OfflineAudioContext 中 source -> analyser -> destination，
 * 预先在每个采样时间点调用 suspend()，挂起时读取 analyser 频谱后 resume()。
 * @param onProgress 可选进度回调 0..1
 */
export async function analyzeOffline(
  buffer: AudioBuffer,
  opts: {
    beatThreshold: number;
    analyserSmoothing: number;
    onProgress?: (ratio: number) => void;
    signal?: AbortSignal;
  },
): Promise<OfflineAnalysisResult> {
  const sampleRate = 44100;
  const duration = buffer.duration;
  const fps = ANALYSIS_FPS;
  const totalFrames = Math.max(1, Math.floor(duration * fps));

  const offline = new OfflineAudioContext(1, Math.ceil(duration * sampleRate) + sampleRate, sampleRate);
  const src = offline.createBufferSource();
  src.buffer = buffer;
  const analyser = offline.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = opts.analyserSmoothing;
  analyser.minDecibels = ANALYSER_MIN_DB;
  analyser.maxDecibels = ANALYSER_MAX_DB;
  src.connect(analyser);
  analyser.connect(offline.destination);
  src.start(0);

  const detector = new BeatDetector(opts.beatThreshold);
  const rawFrames: AudioFrameData[] = new Array(totalFrames);
  const byteData = new Uint8Array(analyser.frequencyBinCount);
  let sampled = 0;

  // 预先排好所有 suspend 时间点，挂起即采样
  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    void offline.suspend(t).then(() => {
      analyser.getByteFrequencyData(byteData);
      // 先以 beat=0 建帧，频段能量取出后跑节拍状态机
      const frame = buildFrame(t, byteData, sampleRate, 0);
      frame.beat = detector.update(t, frame.bass);
      rawFrames[i] = frame;
      sampled++;
      opts.onProgress?.(sampled / totalFrames);
      // 必须 resume（包括最后一帧），否则 startRendering 永远不会完成
      void offline.resume();
    });
  }

  if (opts.signal?.aborted) throw new DOMException('已取消', 'AbortError');
  await offline.startRendering();
  if (opts.signal?.aborted) throw new DOMException('已取消', 'AbortError');

  // 末尾时间戳补全保护（suspend 时间点可能因精度丢失个别帧）
  for (let i = 0; i < totalFrames; i++) {
    if (!rawFrames[i]) {
      const t = i / fps;
      rawFrames[i] = i > 0 ? { ...rawFrames[i - 1], t } : buildFrame(t, new Uint8Array(analyser.frequencyBinCount), sampleRate, 0);
    }
  }

  // 帧间不对称平滑（攻击快/释放慢，与预览 FrameSmoother 等效）
  smoothFrames(rawFrames);
  // 频段自适应归一化（与预览 BandNormalizer 同一算法，保证同构）
  const normalizer = new BandNormalizer();
  for (const f of rawFrames) {
    const n = normalizer.apply(f.bass, f.mid, f.high, f.level);
    f.bass = n.bass;
    f.mid = n.mid;
    f.high = n.high;
    f.level = n.level;
  }

  return { frames: rawFrames, fps, duration };
}

/** 对离线帧数组做攻击快/释放慢的不对称平滑（就地修改） */
function smoothFrames(frames: AudioFrameData[]) {
  if (frames.length < 2) return;
  const kAttack = 0.65;
  const kRelease = 0.22;
  const n = frames[0].spectrum.length;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const cur = frames[i];
    for (let j = 0; j < n; j++) {
      const p = prev.spectrum[j];
      const k = cur.spectrum[j] > p ? kAttack : kRelease;
      cur.spectrum[j] = p + (cur.spectrum[j] - p) * k;
    }
    cur.bass = prev.bass + (cur.bass - prev.bass) * (cur.bass > prev.bass ? kAttack : kRelease);
    cur.mid = prev.mid + (cur.mid - prev.mid) * (cur.mid > prev.mid ? kAttack : kRelease);
    cur.high = prev.high + (cur.high - prev.high) * (cur.high > prev.high ? kAttack : kRelease);
    cur.level = prev.level + (cur.level - prev.level) * (cur.level > prev.level ? kAttack : kRelease);
  }
}

/** 按时间戳从离线帧数组取帧（最近邻 + 线性插值频段/节拍脉冲由节拍帧自带） */
export function frameAt(analysis: OfflineAnalysisResult, t: number): AudioFrameData {
  const idx = Math.max(0, Math.min(analysis.frames.length - 1, Math.round(t * analysis.fps)));
  return analysis.frames[idx];
}
