// 预设③：波形线（示波器风格柔滑曲线，双层描边发光）
import type { AudioFrameData, SpectrumParams } from '@/types';
import { hexToRgba, sampleSpectrum } from './common';
import { qw } from '../loopUtil';

export function drawWaveform(
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
  const count = Math.max(32, Math.round(params.barCount * 2));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const midY = y + h / 2;
  const lineW = Math.max(1.5, params.lineWidth * scale);

  ctx.save();
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.9 * params.glow);
    ctx.shadowBlur = 22 * params.glow * scale;
  }

  const layers: Array<{ amp: number; alpha: number; color: string; width: number }> = [
    { amp: 0.5, alpha: 0.35, color: params.colorSecondary, width: lineW * 1.8 },
    { amp: 1, alpha: 1, color: params.colorPrimary, width: lineW },
  ];

  const beatBoost = 1 + data.beat * 0.35;

  for (const layer of layers) {
    ctx.strokeStyle = hexToRgba(layer.color, layer.alpha);
    ctx.lineWidth = layer.width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Catmull-Rom 样条转贝塞尔，保证曲线柔滑
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < count; i++) {
      const px = x + (i / (count - 1)) * w;
      const amp = bins[i] * h * 0.5 * layer.amp * beatBoost;
      // 镜像开启时上下对称包络，关闭时单向起伏（角速度量化保证循环无缝）
      const py = params.mirror
        ? midY - amp * Math.sin((i / count) * Math.PI * 6 + data.t * qw(2, loopPeriod))
        : midY - amp + Math.sin(i * 0.7 + data.t * qw(3, loopPeriod)) * amp * 0.15;
      pts.push([px, py]);
    }
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
    }
    ctx.stroke();
  }
  ctx.restore();
}
