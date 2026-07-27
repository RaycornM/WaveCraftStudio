// 预设①：经典频谱柱（竖条，可镜像、圆角、双色渐变、光晕）
import type { AudioFrameData, SpectrumParams } from '@/types';
import { hexToRgba, makeGradient, sampleSpectrum } from './common';

export function drawBarSpectrum(
  ctx: CanvasRenderingContext2D,
  data: AudioFrameData,
  params: SpectrumParams,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
) {
  const count = Math.max(8, Math.round(params.barCount));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const gap = w / count;
  const barW = gap * 0.62;
  const radius = (barW / 2) * params.roundness;

  ctx.save();
  // 光晕
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.8 * params.glow);
    ctx.shadowBlur = 24 * params.glow * scale;
  }

  const grad = params.mirror
    ? makeGradient(ctx, 0, y + h / 2, 0, y, params.colorSecondary, params.colorPrimary)
    : makeGradient(ctx, 0, y + h, 0, y, params.colorSecondary, params.colorPrimary);
  ctx.fillStyle = grad;
  ctx.lineCap = 'round';

  // 节拍脉冲：鼓点处频谱整体明显增高 + 亮度闪动
  const beatBoost = 1 + data.beat * 0.35;
  ctx.globalAlpha = Math.min(1, 0.85 + data.beat * 0.15);

  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const v = bins[i];
    const bh = Math.max(barW * 0.4, v * h * beatBoost);
    const bx = x + i * gap + (gap - barW) / 2;
    if (params.mirror) {
      const half = bh / 2;
      ctx.roundRect(bx, y + h / 2 - half, barW, half, [radius, radius, 0, 0]);
      ctx.roundRect(bx, y + h / 2, barW, half, [0, 0, radius, radius]);
    } else {
      ctx.roundRect(bx, y + h - bh, barW, bh, [radius, radius, 0, 0]);
    }
  }
  ctx.fill();
  ctx.restore();
}
