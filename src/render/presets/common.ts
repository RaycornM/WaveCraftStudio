// 频谱预设共用工具：频段采样（线性/对数映射）、渐变构建
import type { AudioFrameData } from '@/types';

/**
 * 将 FFT 频谱采样为 N 个显示单元。
 * log 映射：低频细节多（人耳对数感知），高频合并。
 * 忽略直流与最低 bin（index 0 常为直流偏移）。
 */
export function sampleSpectrum(
  data: AudioFrameData,
  count: number,
  mapping: 'linear' | 'log',
  sensitivity: number,
  out?: Float32Array,
): Float32Array {
  const spec = data.spectrum;
  const result = out && out.length === count ? out : new Float32Array(count);
  const usable = Math.floor(spec.length * 0.72); // 16kHz 以上能量通常极弱，弃用
  for (let i = 0; i < count; i++) {
    let from: number;
    let to: number;
    if (mapping === 'log') {
      // 对数映射：bin 边界按指数增长
      from = Math.floor(Math.pow(usable, i / count));
      to = Math.floor(Math.pow(usable, (i + 1) / count));
    } else {
      from = Math.floor((i / count) * usable);
      to = Math.floor(((i + 1) / count) * usable);
    }
    to = Math.max(from + 1, Math.min(to, spec.length));
    let peak = 0;
    for (let j = from; j < to; j++) {
      if (spec[j] > peak) peak = spec[j];
    }
    // 灵敏度增益 + 软压缩（tanh 防爆顶）
    result[i] = Math.tanh(peak * sensitivity * 1.6);
  }
  return result;
}

/** 垂直/线性双色渐变（缓存 key 由调用方保证简单场景） */
export function makeGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  c1: string,
  c2: string,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

/** hex 颜色转 rgba 字符串 */
export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
