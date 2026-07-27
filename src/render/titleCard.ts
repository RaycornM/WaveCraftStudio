// 标题渲染：入场动画（淡入/打字机/下上滑入）、限时显示、字体/颜色/位置
// 中文使用黑体/宋体/楷体栈，绝不使用斜体。
import type { TitleParams } from '@/types';
import { hexToRgba } from './presets/common';

const FONT_STACKS: Record<TitleParams['font'], string> = {
  sans: `-apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`,
  serif: `"Songti SC", "STSong", "SimSun", "Noto Serif SC", serif`,
  handwriting: `"Kaiti SC", "STKaiti", "KaiTi", "TW-Kai", cursive`,
};

/** ease-out cubic */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * 计算标题在 t 时刻的可见度与文本进度。
 * 返回 null 表示该时刻不显示。
 * 计时使用本地时间 lt = t - startOffset（拼接段落各自重新入场）。
 */
function visibility(params: TitleParams, t: number): { alpha: number; progress: number } | null {
  const lt = t - params.startOffset;
  if (lt < 0) return null; // 段落未开始
  const dur = Math.max(0.6, Math.min(1, params.animationDuration));
  const showDur = params.showDuration;

  // 仅前 N 秒显示：末尾 0.6s 淡出
  if (showDur > 0 && lt > showDur) {
    const fadeOut = 1 - Math.min(1, (lt - showDur) / 0.6);
    if (fadeOut <= 0) return null;
    return { alpha: fadeOut, progress: 1 };
  }

  const inT = Math.min(1, lt / dur);
  const eased = easeOut(inT);
  switch (params.animation) {
    case 'fade':
      return { alpha: eased, progress: 1 };
    case 'slide':
      return { alpha: eased, progress: eased };
    case 'typewriter':
      return { alpha: 1, progress: Math.min(1, lt / (dur * 1.2)) };
  }
}

/** 绘制标题 + 艺术家 */
export function drawTitle(
  ctx: CanvasRenderingContext2D,
  params: TitleParams,
  t: number,
  x: number,
  y: number,
  maxWidth: number,
  align: CanvasTextAlign,
  canvasShortSide: number,
  beat: number,
) {
  if (!params.enabled || !params.title.trim()) return;
  const vis = visibility(params, t);
  if (!vis) return;

  const fontStack = FONT_STACKS[params.font];
  const titleSize = Math.round(canvasShortSide * params.fontSize);
  const artistSize = Math.round(titleSize * 0.52);

  // 打字机：按 progress 截取字符
  let titleText = params.title;
  if (params.animation === 'typewriter') {
    const n = Math.ceil(titleText.length * vis.progress);
    titleText = titleText.slice(0, n);
  }

  // 滑入：从下方 40px 上移
  const slideOffset = params.animation === 'slide' ? (1 - vis.progress) * titleSize * 1.2 : 0;

  // 节拍呼吸：字距/亮度微闪（极微弱，避免廉价感）
  const beatGlow = beat * 0.12;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = vis.alpha;

  // 主标题
  ctx.font = `600 ${titleSize}px ${fontStack}`;
  ctx.fillStyle = params.color;
  ctx.shadowColor = hexToRgba(params.color, 0.35 + beatGlow);
  ctx.shadowBlur = (12 + beat * 18) * (titleSize / 60);
  ctx.fillText(titleText, x, y + slideOffset, maxWidth);

  // 打字机光标
  if (params.animation === 'typewriter' && vis.progress < 1 && titleText.length > 0) {
    const wText = ctx.measureText(titleText).width;
    const cursorX = align === 'center' ? x + wText / 2 + titleSize * 0.15 : align === 'right' ? x + titleSize * 0.15 : x + wText + titleSize * 0.15;
    if (Math.floor(t * 2.5) % 2 === 0) {
      ctx.fillRect(cursorX, y + slideOffset - titleSize * 0.38, titleSize * 0.06, titleSize * 0.76);
    }
  }

  // 艺术家（副行）
  if (params.artist.trim()) {
    ctx.shadowBlur = 0;
    ctx.font = `400 ${artistSize}px ${fontStack}`;
    ctx.globalAlpha = vis.alpha * 0.72;
    ctx.fillText(params.artist, x, y + slideOffset + titleSize * 0.95, maxWidth);
  }

  ctx.restore();
}
