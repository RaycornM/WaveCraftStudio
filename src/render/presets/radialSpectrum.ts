// 预设②：环形频谱（radial，绕封面缓慢旋转）
import type { AudioFrameData, SpectrumParams } from '@/types';
import { hexToRgba, sampleSpectrum } from './common';
import { qp } from '../loopUtil';

export function drawRadialSpectrum(
  ctx: CanvasRenderingContext2D,
  data: AudioFrameData,
  params: SpectrumParams,
  cx: number,
  cy: number,
  baseRadius: number,
  scale: number,
  loopPeriod?: number,
) {
  const count = Math.max(16, Math.round(params.barCount * 1.5));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);

  // 缓慢旋转（约 40s 一圈），与节拍/光晕错开周期；循环模式下周期量化保证无缝
  const rotation = (data.t / qp(40, loopPeriod)) * Math.PI * 2;
  const maxLen = baseRadius * 0.55;
  const lineW = Math.max(1.5, params.lineWidth * scale * 0.8);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.8 * params.glow);
    ctx.shadowBlur = 20 * params.glow * scale;
  }
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';

  const beatBoost = 1 + data.beat * 0.28;
  const inner = baseRadius + lineW;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const v = bins[i];
    const len = Math.max(lineW, v * maxLen * beatBoost);
    // 双色渐变：按角度位置在主辅色间插值
    const mix = i / count;
    ctx.strokeStyle = mix < 0.5 ? params.colorPrimary : params.colorSecondary;
    ctx.globalAlpha = 0.35 + v * 0.65;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(c * inner, s * inner);
    ctx.lineTo(c * (inner + len), s * (inner + len));
    if (params.mirror) {
      // 镜像：同时向内画
      ctx.moveTo(c * (inner - lineW * 2), s * (inner - lineW * 2));
      ctx.lineTo(c * (inner - lineW * 2 - len * 0.4), s * (inner - lineW * 2 - len * 0.4));
    }
    ctx.stroke();
  }
  ctx.restore();
}
