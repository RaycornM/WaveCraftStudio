// 8 秒无缝循环导出（Spotify Canvas 模式）
// 渲染时长严格 8s 整，帧数 = 8 × fps，末尾不淡出；
// 所有时间驱动动效的周期已量化整除 8s（见 render/loopUtil.ts），首尾帧视觉一致。
import type { ExportProgress, ExportSettings, RenderAssets, VisualConfig } from '@/types';
import { exportVideo, type ExportJob } from './exporter';

export const LOOP_DURATION = 8;

export function exportLoop(opts: {
  audioBuffer: AudioBuffer;
  config: VisualConfig;
  assets: RenderAssets;
  settings: ExportSettings;
  onProgress: (p: ExportProgress) => void;
}): ExportJob {
  const start = Math.max(0, Math.min(opts.settings.loopStart, opts.audioBuffer.duration - LOOP_DURATION));
  return exportVideo({
    ...opts,
    settings: { ...opts.settings, mode: 'loop' },
    start,
    duration: LOOP_DURATION,
  });
}

/** 可导出的循环区间上限（音频不足 8s 时从 0 开始截断提示由 UI 处理） */
export function maxLoopStart(duration: number): number {
  return Math.max(0, duration - LOOP_DURATION);
}
