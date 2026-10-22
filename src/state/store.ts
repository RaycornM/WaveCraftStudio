// zustand 全局状态：可视化配置 + 会话状态
import { create } from 'zustand';
import type {
  AlbumArtParams,
  BgParams,
  ExportSettings,
  FxParams,
  LayoutId,
  PresetId,
  ProgressParams,
  SpectrumParams,
  TitleParams,
  TrackMeta,
  AnalysisParams,
  VisualConfig,
} from '@/types';

export const DEFAULT_CONFIG: VisualConfig = {
  preset: 'bars',
  layout: '16:9',
  spectrum: {
    barCount: 64,
    sensitivity: 1.3,
    smoothing: 0.5,
    freqMapping: 'log',
    colorPrimary: '#D3FD50',
    colorSecondary: '#2b7fff',
    glow: 0.5,
    mirror: false,
    lineWidth: 3,
    roundness: 0.5,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    peakCaps: true,
    reflection: 0.6,
  },
  fx: {
    enabled: true,
    particleCount: 60,
    particleColor: '#D3FD50',
    particleIntensity: 0.6,
    haloIntensity: 0.5,
    haloColor: '#D3FD50',
  },
  title: {
    enabled: true,
    title: '',
    artist: '',
    position: 'center',
    freeX: null,
    freeY: null,
    align: 'center',
    fontSize: 0.045,
    color: '#EBEBEB',
    font: 'sans',
    animation: 'fade',
    showDuration: 0, // 0 = 全程显示
    animationDuration: 0.8,
    startOffset: 0,
  },
  albumArt: {
    enabled: true,
    x: null,
    y: null,
    size: null,
    shape: 'rounded',
    cornerRadius: 0.04,
    spin: false,
    spinPeriod: 12,
    beatPulse: true,
    border: true,
    borderColor: '#FFFFFF',
    shadow: 0.5,
  },
  bg: {
    blur: 0.6,
    brightness: 0.55,
    saturation: 1.1,
    vignette: 0.5,
  },
  progress: {
    enabled: true,
    showTime: true,
  },
  analysis: {
    analyserSmoothing: 0.75,
    beatThreshold: 1.4,
  },
};

interface SessionState {
  /** 是否已加载音频 */
  hasAudio: boolean;
  duration: number;
  fileName: string;
  meta: TrackMeta | null;
  /** 封面图（用户上传优先，其次内嵌封面；用作模糊背景） */
  coverUrl: string | null;
  /** 自定义专辑图（null = 自动使用当前曲目的内嵌封面） */
  albumArtUrl: string | null;
  /** 背景视频（与图片互斥，后传覆盖前者） */
  bgVideoUrl: string | null;
  /** 当前音频对应的媒体库 item id（媒体库高亮用；非库来源为 null） */
  currentAudioId: string | null;
  /** 当前背景媒体对应的媒体库 item id（图片或视频） */
  currentBgId: string | null;
  /** 循环试听开关 */
  loopPreview: boolean;
  exportSettings: ExportSettings;
}

interface WaveCraftState {
  config: VisualConfig;
  session: SessionState;

  setPreset: (p: PresetId) => void;
  setLayout: (l: LayoutId) => void;
  patchSpectrum: (p: Partial<SpectrumParams>) => void;
  patchFx: (p: Partial<FxParams>) => void;
  patchTitle: (p: Partial<TitleParams>) => void;
  patchAlbumArt: (p: Partial<AlbumArtParams>) => void;
  patchBg: (p: Partial<BgParams>) => void;
  patchProgress: (p: Partial<ProgressParams>) => void;
  patchAnalysis: (p: Partial<AnalysisParams>) => void;
  patchExport: (p: Partial<ExportSettings>) => void;
  setSession: (p: Partial<SessionState>) => void;
  /** 整体替换配置（加载预设/导入 JSON） */
  applyConfig: (c: VisualConfig) => void;
}

export const useStore = create<WaveCraftState>((set) => ({
  config: DEFAULT_CONFIG,
  session: {
    hasAudio: false,
    duration: 0,
    fileName: '',
    meta: null,
    coverUrl: null,
    albumArtUrl: null,
    bgVideoUrl: null,
    currentAudioId: null,
    currentBgId: null,
    loopPreview: false,
    exportSettings: {
      resolution: '1080p',
      fps: 30,
      bitrate: 12,
      mode: 'full',
      loopStart: 0,
      trimStart: 0,
      trimEnd: 0,
    },
  },

  setPreset: (preset) => set((s) => ({ config: { ...s.config, preset } })),
  setLayout: (layout) => set((s) => ({ config: { ...s.config, layout } })),
  patchSpectrum: (p) => set((s) => ({ config: { ...s.config, spectrum: { ...s.config.spectrum, ...p } } })),
  patchFx: (p) => set((s) => ({ config: { ...s.config, fx: { ...s.config.fx, ...p } } })),
  patchTitle: (p) => set((s) => ({ config: { ...s.config, title: { ...s.config.title, ...p } } })),
  patchAlbumArt: (p) => set((s) => ({ config: { ...s.config, albumArt: { ...s.config.albumArt, ...p } } })),
  patchBg: (p) => set((s) => ({ config: { ...s.config, bg: { ...s.config.bg, ...p } } })),
  patchProgress: (p) => set((s) => ({ config: { ...s.config, progress: { ...s.config.progress, ...p } } })),
  patchAnalysis: (p) => set((s) => ({ config: { ...s.config, analysis: { ...s.config.analysis, ...p } } })),
  patchExport: (p) =>
    set((s) => ({ session: { ...s.session, exportSettings: { ...s.session.exportSettings, ...p } } })),
  setSession: (p) => set((s) => ({ session: { ...s.session, ...p } })),
  /** 与默认配置深度合并，兼容旧版预设/JSON 缺失的新字段 */
  applyConfig: (c) =>
    set(() => ({
      config: {
        ...DEFAULT_CONFIG,
        ...c,
        spectrum: { ...DEFAULT_CONFIG.spectrum, ...c.spectrum },
        fx: { ...DEFAULT_CONFIG.fx, ...c.fx },
        title: { ...DEFAULT_CONFIG.title, ...c.title },
        albumArt: { ...DEFAULT_CONFIG.albumArt, ...c.albumArt },
        bg: { ...DEFAULT_CONFIG.bg, ...c.bg },
        progress: { ...DEFAULT_CONFIG.progress, ...c.progress },
        analysis: { ...DEFAULT_CONFIG.analysis, ...c.analysis },
      },
    })),
}));
