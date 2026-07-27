// 多音频拼接导出：媒体库队列曲目串成一条时间线
// 流程：逐首解码 → 每首单独离线分析并按累计偏移平移合并 → OfflineAudioContext
// 串行渲染整段 PCM → 交给 encodeTimeline（segments 机制按段落切换标题/封面）。
import type { ExportProgress, ExportSettings, RenderAssets, VisualConfig } from '@/types';
import { analyzeOffline } from '@/audio/offlineAnalysis';
import { checkEncoderSupport, encodeTimeline, shiftAnalysis, type ExportJob, type TimelineSegment } from './exporter';
import { loadImage } from '@/state/assets';
import type { MediaItem } from '@/state/mediaLibrary';

/**
 * 拼接导出入口。
 * @param items 队列中的音频 item（有序，至少 1 首）
 */
export function exportQueue(opts: {
  items: MediaItem[];
  config: VisualConfig;
  assets: RenderAssets;
  settings: ExportSettings;
  onProgress: (p: ExportProgress) => void;
}): ExportJob {
  const abort = new AbortController();
  const promise = run(opts, abort.signal);
  return { promise, cancel: () => abort.abort() };
}

async function run(
  opts: {
    items: MediaItem[];
    config: VisualConfig;
    assets: RenderAssets;
    settings: ExportSettings;
    onProgress: (p: ExportProgress) => void;
  },
  signal: AbortSignal,
): Promise<Blob> {
  const { items, config, settings, onProgress } = opts;
  const throwIfAborted = () => {
    if (signal.aborted) throw new DOMException('导出已取消', 'AbortError');
  };

  // ---------- 1. 解码全部队列曲目 ----------
  onProgress({ ratio: 0, stage: '正在解码队列音频…', etaSeconds: 0 });
  const decodeCtx = new AudioContext();
  const buffers: AudioBuffer[] = [];
  try {
    for (const item of items) {
      const arr = await item.blob.arrayBuffer();
      buffers.push(await decodeCtx.decodeAudioData(arr));
      throwIfAborted();
    }
  } catch (e) {
    void decodeCtx.close();
    if ((e as DOMException).name === 'AbortError') throw e;
    throw new Error('队列中存在无法解码的音频，请检查媒体库。');
  }
  void decodeCtx.close();

  // ---------- 2. 逐首离线分析，时间轴平移后合并 ----------
  const allFrames: import('@/types').AudioFrameData[] = [];
  const offsets: number[] = [];
  let analysisFps = 30;
  let acc = 0;
  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i];
    offsets.push(acc);
    try {
      const res = await analyzeOffline(buf, {
        beatThreshold: config.analysis.beatThreshold,
        analyserSmoothing: config.analysis.analyserSmoothing,
        onProgress: (r) =>
          onProgress({
            ratio: ((i + r) / buffers.length) * 0.2,
            stage: `正在分析音频… (${i + 1}/${buffers.length})`,
            etaSeconds: 0,
          }),
        signal,
      });
      analysisFps = res.fps;
      shiftAnalysis(res, acc);
      allFrames.push(...res.frames);
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') throw e;
      throw new Error(`第 ${i + 1} 首音频分析失败，请重试。`);
    }
    acc += buf.duration;
    throwIfAborted();
  }
  const duration = acc;

  // ---------- 3. 整段 PCM：各 buffer 按偏移排入 OfflineAudioContext ----------
  onProgress({ ratio: 0.22, stage: '正在渲染音轨…', etaSeconds: 0 });
  let pcmBuffer: AudioBuffer | null = null;
  if (checkEncoderSupport().audio) {
    const sr = 44100;
    const channels = Math.min(2, Math.max(...buffers.map((b) => b.numberOfChannels)));
    const offline = new OfflineAudioContext(channels, Math.ceil(duration * sr), sr);
    buffers.forEach((buf, i) => {
      const src = offline.createBufferSource();
      src.buffer = buf;
      src.connect(offline.destination);
      src.start(offsets[i]);
    });
    pcmBuffer = await offline.startRendering();
    throwIfAborted();
  }

  // ---------- 4. 段落表：标题/艺术家/每首内嵌封面 ----------
  const segments: TimelineSegment[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let cover: HTMLImageElement | undefined;
    if (item.embeddedCoverUrl) {
      try {
        cover = await loadImage(item.embeddedCoverUrl);
      } catch {
        /* 封面加载失败则沿用全局背景 */
      }
    }
    segments.push({
      start: offsets[i],
      end: offsets[i] + buffers[i].duration,
      title: item.meta?.title || item.name.replace(/\.[a-z0-9]+$/i, ''),
      artist: item.meta?.artist || '',
      cover,
    });
  }

  // ---------- 5. 统一编码核心 ----------
  return encodeTimeline(
    {
      analysis: { frames: allFrames, fps: analysisFps, duration },
      pcmBuffer,
      duration,
      config,
      assets: opts.assets,
      settings,
      onProgress,
      segments,
    },
    signal,
  );
}
