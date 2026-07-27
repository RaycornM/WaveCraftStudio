// 预设体系：内置精调预设 + "我的预设"（localStorage）+ 导入/导出 JSON
import type { PresetId, VisualConfig } from '@/types';
import { DEFAULT_CONFIG } from './store';

export interface NamedPreset {
  id: string;
  name: string;
  builtin: boolean;
  config: VisualConfig;
}

function makeBuiltin(id: PresetId, patch: Partial<VisualConfig['spectrum']>, extra?: Partial<VisualConfig>): VisualConfig {
  return {
    ...DEFAULT_CONFIG,
    ...extra,
    preset: id,
    spectrum: { ...DEFAULT_CONFIG.spectrum, ...patch },
    fx: { ...DEFAULT_CONFIG.fx, ...extra?.fx },
    title: { ...DEFAULT_CONFIG.title, ...extra?.title },
    bg: { ...DEFAULT_CONFIG.bg, ...extra?.bg },
    progress: { ...DEFAULT_CONFIG.progress, ...extra?.progress },
    analysis: { ...DEFAULT_CONFIG.analysis, ...extra?.analysis },
  };
}

/** 内置精调预设（≥4） */
export const BUILTIN_PRESETS: NamedPreset[] = [
  {
    id: 'bars',
    name: '频谱柱',
    builtin: true,
    config: makeBuiltin('bars', {
      barCount: 64,
      mirror: false,
      glow: 0.5,
      roundness: 0.5,
      colorPrimary: '#D3FD50',
      colorSecondary: '#2b7fff',
    }),
  },
  {
    id: 'radial',
    name: '环形频谱',
    builtin: true,
    config: makeBuiltin('radial', {
      barCount: 72,
      glow: 0.6,
      mirror: true,
      lineWidth: 3,
      colorPrimary: '#ff6ec7',
      colorSecondary: '#7a5cff',
    }),
  },
  {
    id: 'waveform',
    name: '波形线',
    builtin: true,
    config: makeBuiltin('waveform', {
      barCount: 96,
      smoothing: 0.75,
      lineWidth: 3.5,
      mirror: true,
      glow: 0.7,
      colorPrimary: '#5ce1e6',
      colorSecondary: '#2b7fff',
    }),
  },
  {
    id: 'particles',
    name: '粒子频谱',
    builtin: true,
    config: makeBuiltin(
      'particles',
      {
        barCount: 48,
        lineWidth: 4,
        glow: 0.8,
        colorPrimary: '#ffd166',
        colorSecondary: '#ff5c5c',
      },
      { fx: { ...DEFAULT_CONFIG.fx, particleCount: 90, particleIntensity: 0.8 } },
    ),
  },
  {
    id: 'studio',
    name: '演播室',
    builtin: true,
    config: makeBuiltin(
      'studio',
      {
        // 复刻参考实现：46 柱、青蓝三段渐变、全圆角柱顶、峰值帽 + 倒影
        barCount: 46,
        sensitivity: 1.2,
        smoothing: 0.5,
        glow: 0.6,
        roundness: 0.9,
        colorPrimary: '#91D4FF',
        colorSecondary: '#C4E5FF',
        peakCaps: true,
        reflection: 0.6,
      },
      { fx: { ...DEFAULT_CONFIG.fx, enabled: false } },
    ),
  },
];

const STORAGE_KEY = 'wavecraft.customPresets.v1';

/** 读取我的预设 */
export function loadCustomPresets(): NamedPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as NamedPreset[];
    return Array.isArray(list) ? list.filter((p) => p && p.config) : [];
  } catch {
    return [];
  }
}

/** 保存当前配置为"我的预设" */
export function saveCustomPreset(name: string, config: VisualConfig): NamedPreset[] {
  const list = loadCustomPresets();
  const preset: NamedPreset = {
    id: `custom-${Date.now()}`,
    name: name.trim() || `预设 ${list.length + 1}`,
    builtin: false,
    config: JSON.parse(JSON.stringify(config)) as VisualConfig,
  };
  list.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

/** 删除我的预设 */
export function deleteCustomPreset(id: string): NamedPreset[] {
  const list = loadCustomPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

/** 导出预设为 JSON 文件 */
export function exportPresetJson(preset: NamedPreset) {
  const blob = new Blob([JSON.stringify(preset.config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wavecraft-${preset.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 从 JSON 文本导入配置（校验关键字段） */
export function importPresetJson(text: string): VisualConfig | null {
  try {
    const obj = JSON.parse(text) as Partial<VisualConfig>;
    if (!obj || typeof obj !== 'object' || !obj.spectrum || !obj.preset) return null;
    // 与默认配置合并，缺失字段自动补齐
    return {
      ...DEFAULT_CONFIG,
      ...obj,
      spectrum: { ...DEFAULT_CONFIG.spectrum, ...obj.spectrum },
      fx: { ...DEFAULT_CONFIG.fx, ...obj.fx },
      title: { ...DEFAULT_CONFIG.title, ...obj.title },
      bg: { ...DEFAULT_CONFIG.bg, ...obj.bg },
      progress: { ...DEFAULT_CONFIG.progress, ...obj.progress },
      analysis: { ...DEFAULT_CONFIG.analysis, ...obj.analysis },
    };
  } catch {
    return null;
  }
}
