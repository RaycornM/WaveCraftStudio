// 音频分析引擎：FFT 取值、频段能量分离、节拍检测、帧间平滑
import type { AudioFrameData } from '@/types';

/** 分析用 FFT 大小（频谱分辨率足够覆盖 20Hz 低频） */
export const FFT_SIZE = 8192;
/** 离线分析采样帧率（Hz），节拍与频谱逐帧缓存的时间步长 */
export const ANALYSIS_FPS = 60;
/**
 * AnalyserNode dB 范围：默认 -100/-30 下多数音乐的 bin 值挤在低段、
 * 归一化后起伏很小。收窄到 -85/-25 让强弱对比拉开。
 */
export const ANALYSER_MIN_DB = -85;
export const ANALYSER_MAX_DB = -25;
/** 显示频谱的感知 gamma：>1 压低弱信号、突出强信号，增强视觉对比 */
const SPECTRUM_GAMMA = 1.35;

/** 频段边界（Hz） */
const BASS_RANGE: [number, number] = [20, 250];
const MID_RANGE: [number, number] = [250, 4000];
const HIGH_RANGE: [number, number] = [4000, 16000];

/** 频率 → FFT bin 索引（线性 bin 映射，保证物理频率准确） */
export function freqToBin(freq: number, fftSize: number, sampleRate: number): number {
  return Math.round((freq * fftSize) / sampleRate);
}

/** 频段平均能量（输入为 getByteFrequencyData 的 0..255 数据），输出 0..1 */
function bandEnergy(data: Uint8Array, fromBin: number, toBin: number): number {
  const lo = Math.max(1, Math.min(fromBin, data.length - 1));
  const hi = Math.max(lo + 1, Math.min(toBin, data.length));
  let sum = 0;
  for (let i = lo; i < hi; i++) sum += data[i];
  return sum / ((hi - lo) * 255);
}

/**
 * 节拍检测器：能量法 onset detection。
 * 原理：低频能量的短期滑动平均作为基准，当前能量突增超过均值 × 阈值、
 * 且距上次触发已过 refractory 不应期时判定为节拍。
 * 输出脉冲强度：触发瞬间为 1，随后按指数衰减（tau 为衰减时间常数）。
 */
export class BeatDetector {
  /** 阈值：当前低频能量 > 滑动均值 × threshold（1.3–1.5 可调） */
  threshold: number;
  /** 不应期（秒），防止同一鼓点重复触发 */
  refractory = 0.2;
  /** 脉冲指数衰减时间常数（秒） */
  tau = 0.16;

  /** 能量历史环形缓冲（约 0.7s @ 60fps） */
  private history: number[] = [];
  private historySize = 43;
  private lastBeatTime = -Infinity;
  private pulse = 0;
  private lastT: number | null = null;

  constructor(threshold = 1.4) {
    this.threshold = threshold;
  }

  reset() {
    this.history = [];
    this.lastBeatTime = -Infinity;
    this.pulse = 0;
    this.lastT = null;
  }

  /**
   * 喂入一帧的低频能量，返回当前节拍脉冲强度 0..1。
   * 必须按时间轴顺序调用（预览逐帧 / 离线分析顺序遍历均满足）。
   */
  update(t: number, bassEnergy: number): number {
    const dt = this.lastT === null ? 1 / 60 : Math.max(0, t - this.lastT);
    this.lastT = t;

    // 脉冲指数衰减
    this.pulse *= Math.exp(-dt / this.tau);
    if (this.pulse < 0.001) this.pulse = 0;

    // 滑动平均（历史填满后才判定，避免开头误触发）
    const avg =
      this.history.length > 0
        ? this.history.reduce((a, b) => a + b, 0) / this.history.length
        : 0;

    if (
      this.history.length >= this.historySize / 2 &&
      bassEnergy > avg * this.threshold &&
      bassEnergy > 0.02 && // 绝对能量下限，避免静音段噪声触发
      t - this.lastBeatTime >= this.refractory
    ) {
      this.lastBeatTime = t;
      this.pulse = 1;
    }

    this.history.push(bassEnergy);
    if (this.history.length > this.historySize) this.history.shift();

    return this.pulse;
  }
}

/**
 * 帧平滑器：攻击快、释放慢的不对称 lerp。
 * 鼓点瞬态（上升沿）必须快速跟上，缓慢释放防止抖动——
 * 对称强平滑会把鼓点瞬态直接抹平（Bug：频谱像播预设动画）。
 */
export class FrameSmoother {
  private spectrum: Float32Array | null = null;
  private bands = { bass: 0, mid: 0, high: 0, level: 0 };

  /** smoothing: 0（不平滑）~ 0.95（强平滑），只影响释放速度 */
  apply(spectrum: Float32Array, bass: number, mid: number, high: number, level: number, smoothing: number) {
    const s = Math.min(0.95, Math.max(0, smoothing));
    const kAttack = Math.max(0.55, 1 - s); // 上升沿：至少 55% 步长，保住瞬态
    const kRelease = (1 - s) * 0.35; // 下降沿：慢释放
    if (!this.spectrum || this.spectrum.length !== spectrum.length) {
      this.spectrum = new Float32Array(spectrum);
    } else {
      for (let i = 0; i < spectrum.length; i++) {
        const cur = this.spectrum[i];
        const k = spectrum[i] > cur ? kAttack : kRelease;
        this.spectrum[i] = cur + (spectrum[i] - cur) * k;
      }
    }
    const b = this.bands;
    b.bass += (bass - b.bass) * (bass > b.bass ? kAttack : kRelease);
    b.mid += (mid - b.mid) * (mid > b.mid ? kAttack : kRelease);
    b.high += (high - b.high) * (high > b.high ? kAttack : kRelease);
    b.level += (level - b.level) * (level > b.level ? kAttack : kRelease);
    return { spectrum: this.spectrum, ...b };
  }

  reset() {
    this.spectrum = null;
    this.bands = { bass: 0, mid: 0, high: 0, level: 0 };
  }
}

/**
 * 频段自适应归一化：低频能量通常远大于高频，同一尺度下高频几乎不动。
 * 跟踪各路近期峰值（指数衰减），输出相对映射，让低/中/高频都有可见起伏。
 * 预览与离线分析共用，保证两条路径同构。
 */
export class BandNormalizer {
  private peaks = { bass: 0.1, mid: 0.1, high: 0.1, level: 0.1 };
  /** 峰值衰减系数（每帧），约 3s 内跟踪到新的峰值水平 */
  private decay = 0.995;

  private norm(key: keyof typeof this.peaks, v: number): number {
    const p = this.peaks;
    p[key] = Math.max(p[key] * this.decay, v, 0.05); // 下限防止除零与静音爆闪
    // 相对峰值的 1.2 倍映射（留 20% 头部空间避免削顶）
    return Math.min(1, v / (p[key] * 1.2));
  }

  apply(bass: number, mid: number, high: number, level: number) {
    return {
      bass: this.norm('bass', bass),
      mid: this.norm('mid', mid),
      high: this.norm('high', high),
      level: this.norm('level', level),
    };
  }

  reset() {
    this.peaks = { bass: 0.1, mid: 0.1, high: 0.1, level: 0.1 };
  }
}

/** 从原始 byte 频谱构建一帧分析数据（不平滑，平滑由调用方处理） */
export function buildFrame(
  t: number,
  byteSpectrum: Uint8Array,
  sampleRate: number,
  beat: number,
): AudioFrameData {
  const fftSize = FFT_SIZE;
  const spectrum = new Float32Array(byteSpectrum.length);
  let levelSum = 0;
  for (let i = 0; i < byteSpectrum.length; i++) {
    const v = byteSpectrum[i] / 255;
    // 感知 gamma：压低弱信号、拉开强弱对比（预览与导出必须一致，在此统一处理）
    spectrum[i] = Math.pow(v, SPECTRUM_GAMMA);
    levelSum += byteSpectrum[i];
  }
  const level = levelSum / (byteSpectrum.length * 255);
  const bass = bandEnergy(byteSpectrum, freqToBin(BASS_RANGE[0], fftSize, sampleRate), freqToBin(BASS_RANGE[1], fftSize, sampleRate));
  const mid = bandEnergy(byteSpectrum, freqToBin(MID_RANGE[0], fftSize, sampleRate), freqToBin(MID_RANGE[1], fftSize, sampleRate));
  const high = bandEnergy(byteSpectrum, freqToBin(HIGH_RANGE[0], fftSize, sampleRate), freqToBin(HIGH_RANGE[1], fftSize, sampleRate));
  return { t, spectrum, bass, mid, high, level, beat };
}
