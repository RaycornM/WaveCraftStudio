// 画面内进度条：底部细线，已播放部分强调色点亮，可选时间文本
import type { ProgressParams } from '@/types';

const ACCENT = '#D3FD50'; // 与 UI 强调色一致（青柠绿）

export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  params: ProgressParams,
  t: number,
  duration: number,
  w: number,
  h: number,
  scale: number,
) {
  if (!params.enabled || duration <= 0) return;
  const margin = w * 0.04;
  const barH = Math.max(2, 3 * scale);
  const y = h - margin * 0.6;
  const progress = Math.min(1, t / duration);

  ctx.save();
  // 轨道
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.roundRect(margin, y - barH / 2, w - margin * 2, barH, barH / 2);
  ctx.fill();

  // 已播放部分
  if (progress > 0) {
    ctx.fillStyle = ACCENT;
    ctx.shadowColor = 'rgba(211,253,80,0.6)';
    ctx.shadowBlur = 8 * scale;
    ctx.beginPath();
    ctx.roundRect(margin, y - barH / 2, (w - margin * 2) * progress, barH, barH / 2);
    ctx.fill();
  }

  // 时间文本（等宽数字）
  if (params.showTime) {
    ctx.shadowBlur = 0;
    const fontSize = Math.round(13 * scale);
    ctx.font = `500 ${fontSize}px ui-monospace, "SF Mono", Consolas, monospace`;
    ctx.fillStyle = 'rgba(235,235,235,0.75)';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(t), margin, y - barH * 2);
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(duration), w - margin, y - barH * 2);
  }
  ctx.restore();
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
