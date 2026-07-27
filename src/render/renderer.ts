// 统一渲染入口：预览与导出共用的同一个 renderFrame。
// 叠层顺序：模糊垫底背景 → 清晰封面 → 频谱主层 → 粒子光晕层(lighter) → 标题/进度条
import type { AudioFrameData, RenderAssets, VisualConfig } from '@/types';
import { LAYOUTS } from './layouts';
import { drawBackground, drawCover, drawVideoBackground } from './background';
import { drawBarSpectrum } from './presets/barSpectrum';
import { drawRadialSpectrum } from './presets/radialSpectrum';
import { drawWaveform } from './presets/waveform';
import { drawParticleSpectrum } from './presets/particleSpectrum';
import { drawStudioSpectrum } from './presets/studioSpectrum';
import { drawFxLayer } from './fx/particles';
import { drawTitle } from './titleCard';
import { drawProgressBar } from './progressBar';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  audioData: AudioFrameData,
  config: VisualConfig,
  assets: RenderAssets,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const layout = LAYOUTS[config.layout];
  const shortSide = Math.min(w, h);
  const scale = shortSide / 1080; // 1080p 为参数基准的分辨率无关缩放
  const loopPeriod = assets.loopPeriod; // 无缝循环模式：各动效周期量化到整除该值

  ctx.clearRect(0, 0, w, h);

  // 1. 背景：视频 > 图片模糊垫底 > 深色渐变噪点
  const hasVideo = !!assets.bgVideo && assets.bgVideo.readyState >= 2;
  if (hasVideo) {
    drawVideoBackground(ctx, assets.bgVideo!, w, h, config.bg);
  } else {
    drawBackground(ctx, w, h, assets.cover, config.bg);
  }

  // 2. 清晰封面（视频背景模式下不画前景封面，让视频成为视觉主体）
  const coverX = layout.cover.x * w;
  const coverY = layout.cover.y * h;
  const coverW = layout.cover.w * w;
  const coverH = layout.cover.h * h;
  if (assets.cover && !hasVideo) {
    drawCover(ctx, assets.cover, coverX, coverY, coverW, coverH, audioData.beat);
  }

  // 3. 频谱主层（用户缩放/偏移叠加在布局基准区域上，save/restore 不影响其他层）
  const sx = layout.spectrum.x * w;
  const sy = layout.spectrum.y * h;
  const sw = layout.spectrum.w * w;
  const sh = layout.spectrum.h * h;
  ctx.save();
  // 以频谱区域中心为缩放原点；偏移按画布宽高比例
  const specCx = sx + sw / 2;
  const specCy = sy + sh / 2;
  ctx.translate(specCx + config.spectrum.offsetX * w, specCy + config.spectrum.offsetY * h);
  ctx.scale(config.spectrum.scale, config.spectrum.scale);
  ctx.translate(-specCx, -specCy);
  switch (config.preset) {
    case 'bars':
      drawBarSpectrum(ctx, audioData, config.spectrum, sx, sy, sw, sh, scale);
      break;
    case 'radial':
      drawRadialSpectrum(
        ctx,
        audioData,
        config.spectrum,
        layout.radialCenter.x * w,
        layout.radialCenter.y * h,
        layout.radialRadius * shortSide * (assets.cover ? 1 : 0.7),
        scale,
        loopPeriod,
      );
      break;
    case 'waveform':
      drawWaveform(ctx, audioData, config.spectrum, sx, sy, sw, sh * 1.6, scale, loopPeriod);
      break;
    case 'particles':
      drawParticleSpectrum(ctx, audioData, config.spectrum, sx, sy - sh * 2, sw, sh * 3, scale, loopPeriod);
      break;
    case 'studio':
      // 演播室：监听屏气质需要更高区域（柱群 + 峰值帽 + 倒影），向上扩展 35%
      drawStudioSpectrum(ctx, audioData, config.spectrum, sx, sy - sh * 0.35, sw, sh * 1.35, scale);
      break;
  }
  ctx.restore();

  // 4. 粒子/光晕特效层（lighter 混合）
  const haloCx = layout.radialCenter.x * w;
  const haloCy = layout.radialCenter.y * h;
  drawFxLayer(
    ctx,
    audioData,
    config.fx,
    w,
    h,
    haloCx,
    haloCy,
    layout.radialRadius * shortSide * 0.9,
    scale,
    loopPeriod,
  );

  // 5. 标题（位置参数在布局基准 y 上微调）
  const titleOffset = config.title.position === 'top' ? -0.06 : config.title.position === 'bottom' ? 0.07 : 0;
  const titleY = Math.min(0.95, Math.max(0.06, layout.titleY + titleOffset)) * h;
  drawTitle(
    ctx,
    config.title,
    t,
    layout.titleX * w,
    titleY,
    w * (layout.titleAlign === 'left' ? 0.48 : 0.86),
    layout.titleAlign,
    shortSide,
    audioData.beat,
  );

  // 6. 画面内进度条
  drawProgressBar(ctx, config.progress, t, assets.duration, w, h, scale);
}
