// 特效层：漂浮粒子（密度/尺寸联动低频能量）+ 中心光晕呼吸（随节拍脉冲）
// 全部粒子为时间无状态函数，保证预览 = 导出。加色混合 'lighter' 保证发光质感。
import type { AudioFrameData, FxParams } from '@/types';
import { hexToRgba } from '../presets/common';
import { qp } from '../loopUtil';

function hash(i: number, salt: number): number {
  let h = i * 2246822519 + salt * 3266489917;
  h = (h ^ (h >> 15)) * 2654435761;
  return ((h ^ (h >> 13)) >>> 0) / 4294967295;
}

/** 中心光晕：径向渐变圆，随节拍脉冲缩放/增亮（呼吸周期独立于节拍，叠加两层不同周期） */
export function drawHalo(
  ctx: CanvasRenderingContext2D,
  data: AudioFrameData,
  params: FxParams,
  cx: number,
  cy: number,
  baseRadius: number,
  loopPeriod?: number,
) {
  if (params.haloIntensity <= 0) return;
  // 慢呼吸（7s 周期，循环模式下量化）+ 节拍脉冲叠加，避免与粒子/旋转同频
  const breathe = 0.5 + 0.5 * Math.sin((data.t / qp(7, loopPeriod)) * Math.PI * 2);
  const pulse = data.beat;
  const radius = baseRadius * (0.9 + breathe * 0.15 + pulse * 0.45);
  const alpha = params.haloIntensity * (0.10 + breathe * 0.05 + pulse * 0.38);

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, hexToRgba(params.haloColor, Math.min(1, alpha)));
  g.addColorStop(0.6, hexToRgba(params.haloColor, Math.min(1, alpha * 0.35)));
  g.addColorStop(1, hexToRgba(params.haloColor, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** 漂浮粒子：缓慢上升漂移（11s/17s 双周期错开），数量由参数控制，尺寸亮度联动低频 */
export function drawFloatingParticles(
  ctx: CanvasRenderingContext2D,
  data: AudioFrameData,
  params: FxParams,
  w: number,
  h: number,
  scale: number,
  loopPeriod?: number,
) {
  const count = Math.max(0, Math.round(params.particleCount));
  if (count === 0 || params.particleIntensity <= 0) return;

  ctx.fillStyle = params.particleColor;
  for (let i = 0; i < count; i++) {
    // 双周期混合，漂移轨迹不重复感更强；周期量化保证循环模式首尾衔接
    const periodA = qp(11 + hash(i, 1) * 6, loopPeriod);
    const periodB = qp(17 + hash(i, 2) * 8, loopPeriod);
    const phaseA = (data.t / periodA + hash(i, 3)) % 1;
    const drift = Math.sin((data.t / periodB) * Math.PI * 2 + hash(i, 4) * Math.PI * 2);

    const px = hash(i, 5) * w + drift * w * 0.02;
    const py = h - phaseA * h * 1.1; // 从底部缓慢升起
    // 低频能量联动尺寸与亮度
    const energy = data.bass * params.particleIntensity;
    const size = (0.8 + hash(i, 6) * 2 + energy * 4) * scale;
    const alpha = (0.08 + hash(i, 7) * 0.2 + energy * 0.5) * (0.3 + 0.7 * Math.sin(phaseA * Math.PI));
    if (alpha <= 0.01) continue;
    ctx.fillStyle = hexToRgba(params.particleColor, Math.min(1, alpha));
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.4, size), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 特效层总入口（调用方需保证已设置 lighter 混合或内部设置） */
export function drawFxLayer(
  ctx: CanvasRenderingContext2D,
  data: AudioFrameData,
  params: FxParams,
  w: number,
  h: number,
  haloCx: number,
  haloCy: number,
  haloRadius: number,
  scale: number,
  loopPeriod?: number,
) {
  if (!params.enabled) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawHalo(ctx, data, params, haloCx, haloCy, haloRadius, loopPeriod);
  drawFloatingParticles(ctx, data, params, w, h, scale, loopPeriod);
  ctx.restore();
}
