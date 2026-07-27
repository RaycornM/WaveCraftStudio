// 背景渲染：封面高斯模糊放大垫底（离屏缓存）+ 暗角 + 亮度/饱和度
// 模糊背景一次性降采样缓存，不做每帧高成本 filter。
import type { BgParams } from '@/types';

/** 模糊底缓存 key 组成：图片 + 尺寸 + 参数 */
let cache: {
  img: HTMLImageElement | null;
  w: number;
  h: number;
  blur: number;
  brightness: number;
  saturation: number;
  canvas: HTMLCanvasElement | null;
} = { img: null, w: 0, h: 0, blur: -1, brightness: -1, saturation: -1, canvas: null };

/**
 * 注意（GIF）：HTMLImageElement 加载的动图在 drawImage 时只画当前播放帧。
 * 预览时 gif 按真实时间自然播放；离屏导出时逐帧绘制取的是导出时刻的实时帧，
 * 与导出帧时间戳非严格对齐——这是可接受行为，gif 动效在导出中仍然可见。
 */

/** cover 填充绘制的矩形计算（保持比例裁切，返回源图采样区） */
export function coverRect(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const boxRatio = boxW / boxH;
  const imgRatio = imgW / imgH;
  let sw = imgW;
  let sh = imgH;
  if (imgRatio > boxRatio) {
    sw = imgH * boxRatio;
  } else {
    sh = imgW / boxRatio;
  }
  return { sx: (imgW - sw) / 2, sy: (imgH - sh) / 2, sw, sh };
}

/** 生成/复用模糊垫底背景（离屏 1/8 降采样，一次性 filter） */
function getBlurredBg(
  img: HTMLImageElement,
  w: number,
  h: number,
  params: BgParams,
): HTMLCanvasElement {
  if (
    cache.canvas &&
    cache.img === img &&
    cache.w === w &&
    cache.h === h &&
    cache.blur === params.blur &&
    cache.brightness === params.brightness &&
    cache.saturation === params.saturation
  ) {
    return cache.canvas;
  }
  const scale = 1 / 8; // 降采样：模糊放大后肉眼无差
  const cw = Math.max(2, Math.round(w * scale));
  const ch = Math.max(2, Math.round(h * scale));
  const off = document.createElement('canvas');
  off.width = cw;
  off.height = ch;
  const octx = off.getContext('2d')!;
  const blurPx = Math.round(2 + params.blur * 14); // 降采样画布上的模糊半径
  octx.filter = `blur(${blurPx}px) brightness(${params.brightness}) saturate(${params.saturation})`;
  const r = coverRect(img.naturalWidth, img.naturalHeight, cw, ch);
  // 略微放大避免模糊边缘透明
  octx.drawImage(img, r.sx, r.sy, r.sw, r.sh, -cw * 0.05, -ch * 0.05, cw * 1.1, ch * 1.1);
  octx.filter = 'none';
  cache = { img, w, h, blur: params.blur, brightness: params.brightness, saturation: params.saturation, canvas: off };
  return off;
}

/** 噪点纹理（无封面时的微妙质感，一次性生成） */
let noiseCanvas: HTMLCanvasElement | null = null;
function getNoise(): HTMLCanvasElement {
  if (noiseCanvas) return noiseCanvas;
  const n = document.createElement('canvas');
  n.width = 128;
  n.height = 128;
  const nctx = n.getContext('2d')!;
  const data = nctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() * 255;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 10; // 极淡
  }
  nctx.putImageData(data, 0, 0);
  noiseCanvas = n;
  return n;
}

/**
 * 绘制视频背景帧：cover 填充 + 亮度/饱和度 + 暗角。
 * 视频内容每帧变化无法走离屏缓存，只做单次 GPU filter 绘制（成本可控），
 * cover 填充无留边，故不需要模糊垫底。
 */
export function drawVideoBackground(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  w: number,
  h: number,
  params: BgParams,
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw > 0 && vh > 0) {
    const r = coverRect(vw, vh, w, h);
    ctx.save();
    ctx.filter = `brightness(${params.brightness * 0.9}) saturate(${params.saturation})`;
    ctx.drawImage(video, r.sx, r.sy, r.sw, r.sh, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
  }
  // 暗角（与图片背景同一参数）
  if (params.vignette > 0) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.hypot(cx, cy);
    const vg = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(0,0,0,${0.55 * params.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}

/** 绘制背景层：模糊垫底（或深色渐变 + 噪点）+ 暗角 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cover: HTMLImageElement | undefined,
  params: BgParams,
) {
  if (cover) {
    const bg = getBlurredBg(cover, w, h, params);
    ctx.drawImage(bg, 0, 0, w, h);
  } else {
    // 默认：深色对角渐变 + 噪点
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#0a0a0c');
    g.addColorStop(0.55, '#050505');
    g.addColorStop(1, '#0c0c10');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = 0.5;
    const pattern = ctx.createPattern(getNoise(), 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  // 暗角
  if (params.vignette > 0) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.hypot(cx, cy);
    const vg = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(0,0,0,${0.55 * params.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}

/** 绘制清晰前景封面（cover 填充 + 圆角 + 微妙描边/投影） */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  beat: number,
) {
  const r = coverRect(img.naturalWidth, img.naturalHeight, w, h);
  const radius = Math.min(w, h) * 0.04;
  // 节拍脉冲：封面缩放呼吸，鼓点处清晰可见（1.0 → 1.06）
  const pulse = 1 + beat * 0.06;
  const dw = w * pulse;
  const dh = h * pulse;
  const dx = x - (dw - w) / 2;
  const dy = y - (dh - h) / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = Math.min(w, h) * 0.08;
  ctx.shadowOffsetY = Math.min(w, h) * 0.02;
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, radius);
  ctx.clip();
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, dx, dy, dw, dh);
  ctx.restore();

  // 1px 内描边提升精致感
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.003);
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, radius);
  ctx.stroke();
  ctx.restore();
}
