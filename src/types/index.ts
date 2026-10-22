// WaveCraft 全局类型定义

/** 频谱预设标识 */
export type PresetId = 'bars' | 'radial' | 'waveform' | 'particles' | 'studio';

/** 布局比例 */
export type LayoutId = '16:9' | '9:16' | '1:1' | '4:5';

/** 标题入场动画 */
export type TitleAnimation = 'fade' | 'typewriter' | 'slide';

/** 标题位置 */
export type TitlePosition = 'top' | 'center' | 'bottom';

/** 字体选择（中文必须正常渲染，禁用斜体） */
export type TitleFont = 'sans' | 'serif' | 'handwriting';

/**
 * 单帧音频分析数据。
 * 预览路径（实时 AnalyserNode）与导出路径（离线分析数组）产出完全同构的数据，
 * 共同喂给同一个 renderFrame，保证所见即所得。
 */
export interface AudioFrameData {
  /** 帧时间戳（秒） */
  t: number;
  /** 归一化频谱 0..1，长度 = 采样 bin 数 */
  spectrum: Float32Array;
  /** 频段能量 0..1：低频 20–250Hz */
  bass: number;
  /** 中频 250Hz–4kHz */
  mid: number;
  /** 高频 4k–16kHz */
  high: number;
  /** 整体响度 0..1 */
  level: number;
  /** 节拍脉冲强度 0..1（触发瞬间为 1，随后指数衰减） */
  beat: number;
}

/** 频谱样式参数（参数层） */
export interface SpectrumParams {
  /** 柱数/采样密度 */
  barCount: number;
  /** 灵敏度（增益） */
  sensitivity: number;
  /** 帧间平滑系数 0..0.95（lerp 防抖动） */
  smoothing: number;
  /** 频率映射方式 */
  freqMapping: 'linear' | 'log';
  /** 主色 */
  colorPrimary: string;
  /** 辅色（双色渐变） */
  colorSecondary: string;
  /** 光晕强度 0..1 */
  glow: number;
  /** 镜像对称 */
  mirror: boolean;
  /** 线条粗细（px，1080p 基准） */
  lineWidth: number;
  /** 柱条圆角 0..1 */
  roundness: number;
  /** 频谱整体缩放 0.3–2.0（叠加在布局基准区域上） */
  scale: number;
  /** 水平偏移 -0.5–+0.5（相对画布宽） */
  offsetX: number;
  /** 垂直偏移 -0.5–+0.5（相对画布高） */
  offsetY: number;
  /** 峰值帽开关（演播室预设：柱顶悬浮峰值标记，缓慢回落） */
  peakCaps: boolean;
  /** 倒影强度 0..1（演播室预设：柱群下方镜像渐隐） */
  reflection: number;
}

/** 粒子/光晕特效层参数 */
export interface FxParams {
  enabled: boolean;
  /** 粒子数量 */
  particleCount: number;
  /** 粒子颜色 */
  particleColor: string;
  /** 粒子强度（尺寸/亮度联动低频能量的幅度）0..1 */
  particleIntensity: number;
  /** 光晕强度 0..1 */
  haloIntensity: number;
  /** 光晕颜色 */
  haloColor: string;
}

/** 标题参数 */
export interface TitleParams {
  enabled: boolean;
  title: string;
  artist: string;
  position: TitlePosition;
  /**
   * 自由定位锚点（比例坐标 0..1；null = 跟随布局模板 position）。
   * 用户在预览画布拖拽标题时写入；选择模板位置时重置为 null。
   */
  freeX: number | null;
  freeY: number | null;
  /** 文本对齐（自由定位时生效；模板模式跟随布局的 titleAlign） */
  align: CanvasTextAlign;
  /** 字号（相对画布短边的比例，0.01–0.1） */
  fontSize: number;
  color: string;
  font: TitleFont;
  animation: TitleAnimation;
  /** 显示时长（秒）；0 表示全程显示 */
  showDuration: number;
  /** 入场动画时长 0.6–1s */
  animationDuration: number;
  /**
   * 标题计时起点的偏移（秒）：拼接导出/队列连播时，
   * 每首曲目段落起点不同，t - startOffset 才是该曲目标题的本地时间。
   */
  startOffset: number;
}

/** 专辑图形状 */
export type AlbumArtShape = 'rounded' | 'square' | 'circle';

/**
 * 专辑图图层参数（独立于背景媒体的一层，可自由摆放）。
 * x/y/size 为 null 时跟随布局模板的封面区；拖拽后写入自由坐标。
 */
export interface AlbumArtParams {
  enabled: boolean;
  /** 中心点 x（比例 0..1，相对画布宽） */
  x: number | null;
  /** 中心点 y（比例 0..1，相对画布高） */
  y: number | null;
  /** 边长（相对画布短边比例 0.05–1.5） */
  size: number | null;
  shape: AlbumArtShape;
  /** 圆角半径（shape=rounded 生效，相对边长 0–0.25） */
  cornerRadius: number;
  /** 旋转动画（黑胶模式，circle 形状下最有感觉） */
  spin: boolean;
  /** 旋转一圈的秒数 */
  spinPeriod: number;
  /** 节拍脉冲缩放 */
  beatPulse: boolean;
  /** 内描边 */
  border: boolean;
  borderColor: string;
  /** 投影强度 0..1 */
  shadow: number;
}

/** 背景参数 */
export interface BgParams {
  /** 毛玻璃模糊强度 0..1 */
  blur: number;
  /** 亮度 0.2–1.5 */
  brightness: number;
  /** 饱和度 0–2 */
  saturation: number;
  /** 暗角强度 0..1 */
  vignette: number;
}

/** 进度条参数 */
export interface ProgressParams {
  enabled: boolean;
  /** 显示时间文本 */
  showTime: boolean;
}

/** 音频分析参数 */
export interface AnalysisParams {
  /** AnalyserNode smoothingTimeConstant 0..0.95 */
  analyserSmoothing: number;
  /** 节拍检测阈值（能量 > 均值 × 阈值），1.3–1.5 */
  beatThreshold: number;
}

/** 完整可视化配置（renderFrame 的 config 入参） */
export interface VisualConfig {
  preset: PresetId;
  layout: LayoutId;
  spectrum: SpectrumParams;
  fx: FxParams;
  title: TitleParams;
  albumArt: AlbumArtParams;
  bg: BgParams;
  progress: ProgressParams;
  analysis: AnalysisParams;
}

/** 曲目元数据 */
export interface TrackMeta {
  title: string;
  artist: string;
  album: string;
  /** 内嵌封面（转为 object URL） */
  embeddedCoverUrl?: string;
}

/** 渲染资产（预览与导出共用） */
export interface RenderAssets {
  /** 用户上传或内嵌封面图（用作模糊背景） */
  cover?: HTMLImageElement;
  /** 专辑图图层（独立前景元素；缺省回退到内嵌封面） */
  albumArt?: HTMLImageElement;
  /** 背景视频（与图片互斥；设置后替代图片背景与前景封面） */
  bgVideo?: HTMLVideoElement;
  /** 总时长（秒） */
  duration: number;
  /** 无缝循环时长（秒）；设置后所有时间驱动的动效周期量化到整除它 */
  loopPeriod?: number;
}

/** 布局描述：各区域的矩形（相对画布宽高的比例 0..1） */
export interface LayoutRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutSpec {
  id: LayoutId;
  label: string;
  /** 导出宽高基准 */
  width: number;
  height: number;
  /** 封面区域（比例） */
  cover: LayoutRegion;
  /** 标题基线位置（比例 y 坐标，含对齐方式） */
  titleY: number;
  titleAlign: CanvasTextAlign;
  titleX: number;
  /** 频谱区域（比例） */
  spectrum: LayoutRegion;
  /** 频谱环绕中心（radial 预设使用，比例坐标） */
  radialCenter: { x: number; y: number };
  /** radial 基准半径（相对短边） */
  radialRadius: number;
}

/** 导出规格 */
export interface ExportSettings {
  resolution: '720p' | '1080p';
  fps: 30 | 60;
  /** Mbps */
  bitrate: 8 | 12 | 20;
  /** full=当前整曲；trim=自定义起止区间；loop=8 秒无缝循环；queue=媒体库拼接队列 */
  mode: 'full' | 'trim' | 'loop' | 'queue';
  /** 循环模式：8 秒区间起点 */
  loopStart: number;
  /** 裁剪模式：区间起点（秒） */
  trimStart: number;
  /** 裁剪模式：区间终点（秒）；0 表示未设置（按整曲末尾处理） */
  trimEnd: number;
}

/** 导出进度回调 */
export interface ExportProgress {
  /** 0..1 */
  ratio: number;
  /** 当前阶段描述 */
  stage: string;
  /** 预计剩余秒数 */
  etaSeconds: number;
}
