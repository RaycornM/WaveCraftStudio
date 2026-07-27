// 预设④：粒子频谱（频段驱动粒子喷发）
// 粒子为时间的无状态函数（哈希定位 + 时间漂移），保证预览与导出逐帧一致。
import type { AudioFrameData, SpectrumParams } from '@/types';
import { hexToRgba, sampleSpectrum } from './common';
import { qhz } from '../loopUtil';

/** 确定性伪随机哈希（同 index 永远同结果） */
function hash(i: number, salt: number): number {
  let h = i * 374761393 + salt * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function drawParticleSpectrum(
  ctx: CanvasRenderingContext2D,
  data: AudioFrameData,
  params: SpectrumParams,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
  loopPeriod?: number,
) {
  const count = Math.max(16, Math.round(params.barCount));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const particlesPerBin = Math.max(2, Math.round(params.lineWidth)); // 复用线条粗细参数控制每柱粒子数

  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; // 加色混合发光
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.7 * params.glow);
    ctx.shadowBlur = 14 * params.glow * scale;
  }

  const beatBoost = 1 + data.beat * 0.4;
  const slotW = w / count;

  for (let i = 0; i < count; i++) {
    const energy = bins[i];
    if (energy < 0.03) continue;
    const columnX = x + i * slotW + slotW / 2;
    const emitH = energy * h * beatBoost;

    for (let p = 0; p < particlesPerBin; p++) {
      const id = i * 1000 + p;
      // 每个粒子有固定的水平抖动与上升周期，能量决定上升高度
      const jitter = (hash(id, 1) - 0.5) * slotW * 0.9;
      // 上升速度量化为每循环整数次，保证首尾帧一致
      const speed = qhz(0.4 + hash(id, 2) * 0.8, loopPeriod);
      const phase = hash(id, 3);
      // 0..1 的生命周期位置，随时间循环上升
      const life = (phase + data.t * speed) % 1;
      const px = columnX + jitter * (0.5 + life);
      const py = y + h - life * emitH - hash(id, 4) * h * 0.05;
      const size = (1 + energy * 5) * (1 - life * 0.7) * scale * (0.5 + hash(id, 5));
      const alpha = (1 - life) * (0.25 + energy * 0.75);
      const color = life < 0.5 ? params.colorPrimary : params.colorSecondary;
      ctx.fillStyle = hexToRgba(color, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
