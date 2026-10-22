// 专辑图图层：独立于背景媒体的前景元素。
// 支持方形 / 圆角 / 圆形（黑胶）三种形状、旋转动画、节拍脉冲、描边与投影。
// 预览与导出共用（同一 renderFrame 调用），无缝循环模式下旋转周期量化到整除 loopPeriod。
import type { AlbumArtParams } from '@/types';
import { coverRect } from './background';
import { hexToRgba } from './presets/common';

/** 生成图层的裁剪路径（以中心为原点，边长 size 的正方形区域） */
function shapePath(ctx: CanvasRenderingContext2D, params: AlbumArtParams, size: number) {
  const half = size / 2;
  ctx.beginPath();
  switch (params.shape) {
    case 'circle':
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(-half, -half, size, size);
      break;
    case 'rounded': {
      const r = Math.max(0, Math.min(0.25, params.cornerRadius)) * size;
      ctx.roundRect(-half, -half, size, size, r);
      break;
    }
  }
}

/**
 * 绘制专辑图。
 * @param cx/cy 中心点（画布像素坐标）
 * @param size  边长（画布像素）
 * @param t     当前时间（驱动旋转动画）
 * @param beat  节拍脉冲 0..1
 * @param loopPeriod 无缝循环周期（设置时旋转角度量化，保证首尾相接）
 */
export function drawAlbumArt(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  params: AlbumArtParams,
  cx: number,
  cy: number,
  size: number,
  t: number,
  beat: number,
  loopPeriod?: number,
) {
  if (size <= 0) return;

  // 节拍脉冲：1.0 → 1.05
  const pulse = params.beatPulse ? 1 + beat * 0.05 : 1;
  const s = size * pulse;

  // 旋转角度
  let angle = 0;
  if (params.spin) {
    const period = Math.max(2, params.spinPeriod);
    if (loopPeriod && loopPeriod > 0) {
      // 无缝循环：每循环整数圈
      const rotations = Math.max(1, Math.round(loopPeriod / period));
      angle = ((t % loopPeriod) / loopPeriod) * Math.PI * 2 * rotations;
    } else {
      angle = (t / period) * Math.PI * 2;
    }
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // 投影（旋转前应用在路径裁剪之外，随图层一起转也无妨——投影均匀）
  if (params.shadow > 0) {
    ctx.shadowColor = `rgba(0,0,0,${0.5 * params.shadow})`;
    ctx.shadowBlur = s * 0.08 * params.shadow;
    ctx.shadowOffsetY = s * 0.02 * params.shadow;
  }

  // 裁剪 + 绘制（cover 填充正方形）
  const r = coverRect(img.naturalWidth, img.naturalHeight, s, s);
  ctx.save();
  shapePath(ctx, params, s);
  ctx.clip();
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, -s / 2, -s / 2, s, s);
  ctx.restore();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 黑胶细节（circle 专属）：沟槽环 + 中心孔
  if (params.shape === 'circle') {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, s * (0.28 + i * 0.07), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = Math.max(1, s * 0.003);
      ctx.stroke();
    }
    // 中心孔
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.055, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5,5,6,0.92)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.055, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = Math.max(1, s * 0.004);
    ctx.stroke();
    ctx.restore();
  }

  // 内描边
  if (params.border) {
    ctx.save();
    shapePath(ctx, params, s);
    ctx.strokeStyle = hexToRgba(params.borderColor, 0.28);
    ctx.lineWidth = Math.max(1, s * 0.004);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
