// 四种比例的独立排版模板（非机械裁切，每种比例单独设计构图）
import type { LayoutId, LayoutSpec } from '@/types';

export const LAYOUTS: Record<LayoutId, LayoutSpec> = {
  // 16:9 横版：封面左侧方形，标题右侧，频谱横贯底部
  '16:9': {
    id: '16:9',
    label: '横版 16:9',
    width: 1920,
    height: 1080,
    cover: { x: 0.09, y: 0.22, w: 0.31, h: 0.56 },
    titleY: 0.42,
    titleAlign: 'left',
    titleX: 0.46,
    spectrum: { x: 0.04, y: 0.8, w: 0.92, h: 0.16 },
    radialCenter: { x: 0.245, y: 0.5 },
    radialRadius: 0.42,
  },
  // 9:16 竖版：封面居中偏上占宽 70%，标题在封面下，频谱贴底
  '9:16': {
    id: '9:16',
    label: '竖版 9:16',
    width: 1080,
    height: 1920,
    cover: { x: 0.15, y: 0.14, w: 0.7, h: 0.394 },
    titleY: 0.6,
    titleAlign: 'center',
    titleX: 0.5,
    spectrum: { x: 0.05, y: 0.86, w: 0.9, h: 0.11 },
    radialCenter: { x: 0.5, y: 0.337 },
    radialRadius: 0.5,
  },
  // 1:1 方形：封面居中占宽 60%，标题下方，频谱贴底
  '1:1': {
    id: '1:1',
    label: '方形 1:1',
    width: 1080,
    height: 1080,
    cover: { x: 0.2, y: 0.12, w: 0.6, h: 0.6 },
    titleY: 0.8,
    titleAlign: 'center',
    titleX: 0.5,
    spectrum: { x: 0.05, y: 0.9, w: 0.9, h: 0.08 },
    radialCenter: { x: 0.5, y: 0.42 },
    radialRadius: 0.44,
  },
  // 4:5 竖方形：封面居中占宽 68%，标题下方，频谱贴底
  '4:5': {
    id: '4:5',
    label: '竖版 4:5',
    width: 1080,
    height: 1350,
    cover: { x: 0.16, y: 0.13, w: 0.68, h: 0.544 },
    titleY: 0.74,
    titleAlign: 'center',
    titleX: 0.5,
    spectrum: { x: 0.05, y: 0.88, w: 0.9, h: 0.09 },
    radialCenter: { x: 0.5, y: 0.402 },
    radialRadius: 0.47,
  },
};

export const LAYOUT_LIST: LayoutSpec[] = [LAYOUTS['16:9'], LAYOUTS['9:16'], LAYOUTS['1:1'], LAYOUTS['4:5']];
