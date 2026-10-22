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
    albumArt: { ...DEFAULT_CONFIG.albumArt, ...extra?.albumArt },
    bg: { ...DEFAULT_CONFIG.bg, ...extra?.bg },
    progress: { ...DEFAULT_CONFIG.progress, ...extra?.progress },
    analysis: { ...DEFAULT_CONFIG.analysis, ...extra?.analysis },
  };
}

/** 与默认配置深度合并：兼容旧存档/旧 JSON 缺失的新字段 */
function normalizeConfig(obj: Partial<VisualConfig>): VisualConfig {
  return {
    ...DEFAULT_CONFIG,
    ...obj,
    spectrum: { ...DEFAULT_CONFIG.spectrum, ...obj.spectrum },
    fx: { ...DEFAULT_CONFIG.fx, ...obj.fx },
    title: { ...DEFAULT_CONFIG.title, ...obj.title },
    albumArt: { ...DEFAULT_CONFIG.albumArt, ...obj.albumArt },
    bg: { ...DEFAULT_CONFIG.bg, ...obj.bg },
    progress: { ...DEFAULT_CONFIG.progress, ...obj.progress },
    analysis: { ...DEFAULT_CONFIG.analysis, ...obj.analysis },
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

/* ---------- 主题套装：频谱 + 配色 + 标题 + 专辑图 + 背景的一整套风格 ---------- */

export type ThemeCategory = '华丽' | '简约' | '科技' | '高级';

export interface ThemePack {
  id: string;
  name: string;
  category: ThemeCategory;
  config: VisualConfig;
}

export const THEME_PACKS: ThemePack[] = [
  // ── 华丽 ──
  {
    id: 'theme-neon',
    name: '霓虹派对',
    category: '华丽',
    config: makeBuiltin(
      'particles',
      { barCount: 48, lineWidth: 4, glow: 0.85, colorPrimary: '#FF4ECD', colorSecondary: '#7A5CFF' },
      {
        fx: { enabled: true, particleCount: 120, particleColor: '#FFD166', particleIntensity: 0.8, haloIntensity: 0.7, haloColor: '#FF4ECD' },
        title: { ...DEFAULT_CONFIG.title, font: 'handwriting', color: '#FFFFFF', fontSize: 0.05, position: 'center' },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'circle', spin: true, spinPeriod: 10, borderColor: '#FF4ECD', shadow: 0.7 },
        bg: { blur: 0.7, brightness: 0.5, saturation: 1.3, vignette: 0.55 },
      },
    ),
  },
  {
    id: 'theme-gilded',
    name: '鎏金',
    category: '华丽',
    config: makeBuiltin(
      'bars',
      { barCount: 72, mirror: true, glow: 0.8, roundness: 0.6, colorPrimary: '#FFD166', colorSecondary: '#FF7A1A' },
      {
        fx: { enabled: true, particleCount: 80, particleColor: '#FFD166', particleIntensity: 0.6, haloIntensity: 0.5, haloColor: '#FFB347' },
        title: { ...DEFAULT_CONFIG.title, font: 'serif', color: '#FFE8B3', position: 'bottom' },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'rounded', cornerRadius: 0.08, borderColor: '#FFD166', shadow: 0.7 },
        bg: { blur: 0.6, brightness: 0.5, saturation: 1.2, vignette: 0.6 },
      },
    ),
  },
  // ── 简约 ──
  {
    id: 'theme-blanc',
    name: '素白',
    category: '简约',
    config: makeBuiltin(
      'waveform',
      { barCount: 96, lineWidth: 2.5, mirror: true, smoothing: 0.8, glow: 0.15, colorPrimary: '#EDEDED', colorSecondary: '#8A8A93' },
      {
        fx: { ...DEFAULT_CONFIG.fx, enabled: false },
        title: { ...DEFAULT_CONFIG.title, font: 'sans', color: '#EBEBEB', fontSize: 0.038, position: 'bottom' },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'square', beatPulse: false, borderColor: '#FFFFFF', shadow: 0.3 },
        bg: { blur: 0.3, brightness: 0.45, saturation: 0.6, vignette: 0.35 },
      },
    ),
  },
  {
    id: 'theme-mist',
    name: '薄雾',
    category: '简约',
    config: makeBuiltin(
      'bars',
      { barCount: 32, roundness: 1, mirror: false, glow: 0.3, colorPrimary: '#A8B2C1', colorSecondary: '#5B6472' },
      {
        fx: { enabled: true, particleCount: 0, particleColor: '#A8B2C1', particleIntensity: 0, haloIntensity: 0.4, haloColor: '#A8B2C1' },
        title: { ...DEFAULT_CONFIG.title, font: 'sans', color: '#C9D1DC', fontSize: 0.034, position: 'bottom' },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'rounded', cornerRadius: 0.12, shadow: 0.4, border: false },
        bg: { blur: 0.85, brightness: 0.5, saturation: 0.8, vignette: 0.4 },
      },
    ),
  },
  // ── 科技 ──
  {
    id: 'theme-terminal',
    name: '终端',
    category: '科技',
    config: makeBuiltin(
      'studio',
      { barCount: 46, sensitivity: 1.2, smoothing: 0.5, glow: 0.6, roundness: 0.9, colorPrimary: '#00E5A0', colorSecondary: '#7DF9FF', peakCaps: true, reflection: 0.6 },
      {
        fx: { ...DEFAULT_CONFIG.fx, enabled: false },
        title: { ...DEFAULT_CONFIG.title, font: 'sans', color: '#D7FFE9', fontSize: 0.04 },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'square', borderColor: '#00E5A0', shadow: 0.4 },
        bg: { blur: 0.5, brightness: 0.4, saturation: 1.2, vignette: 0.55 },
      },
    ),
  },
  {
    id: 'theme-orbit',
    name: '轨道环',
    category: '科技',
    config: makeBuiltin(
      'radial',
      { barCount: 96, mirror: true, lineWidth: 2, glow: 0.6, colorPrimary: '#22D3EE', colorSecondary: '#818CF8' },
      {
        fx: { enabled: true, particleCount: 40, particleColor: '#22D3EE', particleIntensity: 0.4, haloIntensity: 0.5, haloColor: '#22D3EE' },
        title: { ...DEFAULT_CONFIG.title, font: 'sans', color: '#CFFAFE', fontSize: 0.04 },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'circle', spin: true, spinPeriod: 20, borderColor: '#22D3EE', shadow: 0.5 },
        bg: { blur: 0.6, brightness: 0.45, saturation: 1.1, vignette: 0.5 },
      },
    ),
  },
  // ── 高级 ──
  {
    id: 'theme-vinyl-night',
    name: '黑胶之夜',
    category: '高级',
    config: makeBuiltin(
      'radial',
      { barCount: 72, mirror: true, glow: 0.5, colorPrimary: '#E8C468', colorSecondary: '#8C6A3F' },
      {
        fx: { enabled: true, particleCount: 30, particleColor: '#E8C468', particleIntensity: 0.4, haloIntensity: 0.35, haloColor: '#E8C468' },
        title: { ...DEFAULT_CONFIG.title, font: 'serif', color: '#F0DFC0', fontSize: 0.048 },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'circle', spin: true, spinPeriod: 16, beatPulse: true, borderColor: '#E8C468', shadow: 0.8 },
        bg: { blur: 0.7, brightness: 0.5, saturation: 1.05, vignette: 0.65 },
      },
    ),
  },
  {
    id: 'theme-velvet',
    name: '丝绒',
    category: '高级',
    config: makeBuiltin(
      'waveform',
      { barCount: 72, lineWidth: 5, mirror: true, glow: 0.5, colorPrimary: '#C94F6D', colorSecondary: '#7A2E4D' },
      {
        fx: { enabled: true, particleCount: 40, particleColor: '#C94F6D', particleIntensity: 0.5, haloIntensity: 0.4, haloColor: '#C94F6D' },
        title: { ...DEFAULT_CONFIG.title, font: 'serif', color: '#F3DDE2', fontSize: 0.044, position: 'bottom' },
        albumArt: { ...DEFAULT_CONFIG.albumArt, shape: 'rounded', cornerRadius: 0.06, borderColor: '#C94F6D', shadow: 0.7 },
        bg: { blur: 0.6, brightness: 0.5, saturation: 1.15, vignette: 0.6 },
      },
    ),
  },
];

export const THEME_CATEGORIES: ThemeCategory[] = ['华丽', '简约', '科技', '高级'];

const STORAGE_KEY = 'wavecraft.customPresets.v1';

/** 读取我的预设 */
export function loadCustomPresets(): NamedPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as NamedPreset[];
    return Array.isArray(list)
      ? list.filter((p) => p && p.config).map((p) => ({ ...p, config: normalizeConfig(p.config) }))
      : [];
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
    return normalizeConfig(obj);
  } catch {
    return null;
  }
}
