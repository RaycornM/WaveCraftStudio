// 预设⑤：演播室频谱（复刻看板黑胶播放器的监听屏效果）
// 视觉配方（来源 reference-player-widget.html 的 tick()，参数按其源码复刻）：
//   竖条圆角柱 · 纵向三段渐变（柱顶亮/柱底暗）· 柱顶悬浮峰值帽（缓慢回落）
//   柱群下方镜像倒影渐隐 · 扫描线纹理 · 角落 HUD 标注
// 分析侧（不改全局 analyzer，在预设内部对 AudioFrameData.spectrum 做它的分桶）：
//   bin 映射 idx = floor(pow(i/(n-1), 1.7) * bins * 0.72) —— 指数 1.7，只用前 72% bin
//   柱体惯性 vals += (target - vals) * 0.5（参考为 0.45，上游已平滑故略加快）
//   峰值帽 attack/decay：瞬时跟随（attack 立即），线性回落 0.006/帧@60fps = 0.36/s，下限 0.04
import type { AudioFrameData, SpectrumParams } from '@/types';
import { hexToRgba } from './common';

/** 参考实现的分桶映射指数（低频疏/高频密的类对数分布） */
const MAP_EXP = 1.7;
/** 只使用前 72% 的 bin（16kHz 以上能量极弱） */
const BIN_RATIO = 0.72;
/** 柱体惯性系数（每帧 lerp 步长） */
const VAL_LERP = 0.5;
/** 峰值帽线性回落速度（每秒）；参考 = 0.006/帧 × 60fps */
const PEAK_DECAY_PER_SEC = 0.36;
/** 峰值帽下限 */
const PEAK_FLOOR = 0.04;

/** 跨帧状态：峰值帽需要缓慢回落，按渲染上下文隔离（预览与导出各自独立，WeakMap 自动回收） */
interface StudioState {
  vals: Float32Array | null;
  peaks: Float32Array | null;
  lastT: number | null;
}
const states = new WeakMap<CanvasRenderingContext2D, StudioState>();

function stateFor(ctx: CanvasRenderingContext2D): StudioState {
  let s = states.get(ctx);
  if (!s) {
    s = { vals: null, peaks: null, lastT: null };
    states.set(ctx, s);
  }
  return s;
}

export function drawStudioSpectrum(
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
  const spec = data.spectrum;
  const state = stateFor(ctx);
  if (!state.vals || state.vals.length !== count) {
    state.vals = new Float32Array(count).fill(0.08);
    state.peaks = new Float32Array(count).fill(0.1);
    state.lastT = null;
  }
  const vals = state.vals;
  const peaks = state.peaks!;

  // 帧间隔（峰值帽按真实 dt 回落：预览 ~60fps、导出固定 fps 均一致）
  const dt = state.lastT === null ? 1 / 60 : Math.max(0, Math.min(0.1, data.t - state.lastT));
  state.lastT = data.t;

  // ---------- 分析侧：参考同款分桶 + 惯性 + 峰值帽 ----------
  const usable = Math.floor(spec.length * BIN_RATIO);
  for (let i = 0; i < count; i++) {
    const idx = Math.min(spec.length - 1, Math.floor(Math.pow(i / (count - 1), MAP_EXP) * usable));
    const target = Math.min(1, 0.05 + 0.93 * spec[idx] * params.sensitivity);
    vals[i] += (target - vals[i]) * VAL_LERP;
    if (vals[i] > peaks[i]) peaks[i] = vals[i];
    else peaks[i] = Math.max(PEAK_FLOOR, peaks[i] - PEAK_DECAY_PER_SEC * dt);
  }

  const bass = data.bass;
  const beat = data.beat;

  // ---------- 几何：基线 78% 处，柱群在上、倒影区在下，顶部留 HUD 行 ----------
  const hudH = 14 * scale;
  const baseY = y + h * 0.78;
  const barAreaH = baseY - (y + hudH); // 柱群可用高度
  const refH = y + h - baseY; // 倒影区高度
  const gap = Math.max(1, w * 0.008);
  const bw = (w - gap * (count - 1)) / count;
  const radius = (bw / 2) * Math.min(1, Math.max(0, params.roundness));

  ctx.save();

  // 背景辉光：以基线中点为圆心的径向渐变，强度随低频能量（参考同款配方）
  const glowR = Math.max(10, w * (0.24 + bass * 0.42));
  const glow = ctx.createRadialGradient(x + w / 2, baseY, 0, x + w / 2, baseY, glowR);
  glow.addColorStop(0, hexToRgba(params.colorPrimary, (0.1 + bass * 0.24) * 0.9));
  glow.addColorStop(1, hexToRgba(params.colorPrimary, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);

  // ---------- 柱体：纵向三段渐变（底 50% 透明 → 0.6 主色 → 顶亮色），节拍增高/增亮 ----------
  const beatBoost = 1 + beat * 0.3;
  const grad = ctx.createLinearGradient(0, baseY, 0, baseY - barAreaH);
  grad.addColorStop(0, hexToRgba(params.colorPrimary, 0.5));
  grad.addColorStop(0.6, params.colorPrimary);
  grad.addColorStop(1, params.colorSecondary);
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, Math.min(1, (0.3 + bass * 0.5) * params.glow * 1.3));
    ctx.shadowBlur = (5 + bass * 16 + beat * 10) * params.glow * scale;
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const bh = Math.max(2 * scale, vals[i] * barAreaH * beatBoost);
    const bx = x + i * (bw + gap);
    ctx.roundRect(bx, baseY - bh, bw, bh, [radius, radius, 0, 0]);
  }
  ctx.fill();
  ctx.shadowBlur = 0;

  // ---------- 峰值帽：悬浮在柱顶上方，鼓点处提亮 ----------
  if (params.peakCaps) {
    const capH = 2 * scale + beat * 1.5 * scale;
    ctx.fillStyle = hexToRgba(params.colorSecondary, Math.min(1, 0.75 + beat * 0.25));
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const py = baseY - Math.max(3 * scale, peaks[i] * barAreaH * beatBoost);
      ctx.rect(x + i * (bw + gap), Math.max(y + hudH, py - capH), bw, capH);
    }
    ctx.fill();
  }

  // ---------- 倒影：基线下方镜像，高度为柱高 35%，随距离渐隐 ----------
  if (params.reflection > 0) {
    const rgrad = ctx.createLinearGradient(0, baseY, 0, baseY + refH);
    rgrad.addColorStop(0, hexToRgba(params.colorPrimary, 0.28 * params.reflection));
    rgrad.addColorStop(1, hexToRgba(params.colorPrimary, 0));
    ctx.fillStyle = rgrad;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const rh = Math.min(refH - 2 * scale, vals[i] * barAreaH * 0.35 * beatBoost);
      if (rh > 1) ctx.rect(x + i * (bw + gap), baseY + 2 * scale, bw, rh);
    }
    ctx.fill();
  }

  // ---------- 扫描线纹理（1px 线 / 3px 间隔，2.4% 白） ----------
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  const scanStep = Math.max(2, 3 * scale);
  for (let yy = y; yy < y + h; yy += scanStep) {
    ctx.fillRect(x, yy, w, 1);
  }

  // ---------- 角落 HUD：左上单色等宽标注 + 右上状态点（第三个常亮发光） ----------
  const hudY = y + hudH * 0.72;
  ctx.font = `${10 * scale}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // 字距：canvas 无 letter-spacing，逐字绘制开销大——用空格模拟加宽
  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  ctx.fillText('STUDIO_ANLZR · CH-05', x + 2 * scale, hudY);
  const dotR = 2.5 * scale;
  const dotY = hudY - 3 * scale;
  for (let d = 0; d < 3; d++) {
    const dx = x + w - (3 - d) * 10 * scale;
    ctx.beginPath();
    ctx.arc(dx, dotY, dotR, 0, Math.PI * 2);
    if (d === 2) {
      ctx.fillStyle = hexToRgba(params.colorPrimary, 0.9);
      ctx.shadowColor = hexToRgba(params.colorPrimary, 0.9);
      ctx.shadowBlur = 6 * scale;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
