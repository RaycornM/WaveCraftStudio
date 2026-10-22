// 预览画布：rAF 循环 60fps，实时 AnalyserNode → AudioFrameData → renderFrame
// 与导出共用同一 renderFrame（导出喂离线分析帧），所见即所得。
import { useEffect, useRef } from 'react';
import { audioEngine } from '@/audio/AudioEngine';
import { BandNormalizer, BeatDetector, FFT_SIZE, FrameSmoother, buildFrame } from '@/audio/analyzer';
import { renderFrame } from '@/render/renderer';
import { LAYOUTS } from '@/render/layouts';
import { useStore } from '@/state/store';
import { renderAssetsStore } from '@/state/assets';
import { syncVideoPlayback } from '@/state/bgVideo';
import { usePlayback } from '@/state/playback';
import { LayerOverlay } from './LayerOverlay';
import type { AudioFrameData } from '@/types';

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const layout = useStore((s) => s.config.layout);

  // 画布尺寸随容器与布局等比缩放
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const spec = LAYOUTS[layout];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const pad = 24;
      const availW = Math.max(50, rect.width - pad * 2);
      const availH = Math.max(50, rect.height - pad * 2);
      const ratio = spec.width / spec.height;
      let cssW = availW;
      let cssH = cssW / ratio;
      if (cssH > availH) {
        cssH = availH;
        cssW = cssH * ratio;
      }
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      // 背板分辨率：不超过 1080p 基准 × dpr，避免过度渲染
      const backingScale = Math.min(1, 1080 / spec.height) * dpr;
      canvas.width = Math.round(spec.width * backingScale);
      canvas.height = Math.round(spec.height * backingScale);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [layout]);

  // rAF 渲染主循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const detector = new BeatDetector();
    const smoother = new FrameSmoother();
    const normalizer = new BandNormalizer();
    let byteData: Uint8Array<ArrayBuffer> | null = null;
    let raf = 0;
    let lastUiSync = 0;
    let lastPlaying = false;
    let silentT0 = performance.now();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { config, session } = useStore.getState();
      const engine = audioEngine;
      const hasAudio = session.hasAudio && engine.buffer;

      let frame: AudioFrameData;
      let t: number;

      if (hasAudio) {
        const analyser = engine.getAnalyser();
        t = engine.currentTime;
        if (analyser) {
          if (!byteData || byteData.length !== analyser.frequencyBinCount) {
            byteData = new Uint8Array(analyser.frequencyBinCount);
          }
          analyser.getByteFrequencyData(byteData);
          const raw = buildFrame(t, byteData, engine.sampleRate, 0);
          detector.threshold = config.analysis.beatThreshold;
          const beat = detector.update(t, raw.bass);
          const smooth = smoother.apply(raw.spectrum, raw.bass, raw.mid, raw.high, raw.level, config.spectrum.smoothing);
          // 频段自适应归一化（与离线分析同一算法）：低/中/高频各自有可见起伏
          const norm = normalizer.apply(smooth.bass, smooth.mid, smooth.high, smooth.level);
          frame = { t, spectrum: smooth.spectrum, bass: norm.bass, mid: norm.mid, high: norm.high, level: norm.level, beat };
        } else {
          frame = emptyFrame(t);
        }
      } else {
        // 空状态：静默帧 + 持续时钟，保持背景/标题预览鲜活
        t = (performance.now() - silentT0) / 1000;
        frame = emptyFrame(t);
        if (detector) detector.reset();
      }

      // 背景视频：与音频播放状态/进度同步（暂停时停在对应帧）
      const bgVideo = renderAssetsStore.bgVideo;
      if (bgVideo) {
        syncVideoPlayback(bgVideo, hasAudio ? engine.playing : false, hasAudio ? t : 0);
      }

      renderFrame(ctx, t, frame, config, {
        cover: renderAssetsStore.coverImage ?? undefined,
        albumArt: renderAssetsStore.albumArtImage ?? undefined,
        bgVideo: bgVideo ?? undefined,
        duration: hasAudio ? engine.duration : 0,
      });

      // 播放状态同步（节流 15Hz，变化时立即同步）
      const now = performance.now();
      const playing = engine.playing;
      if (playing !== lastPlaying || now - lastUiSync > 66) {
        lastPlaying = playing;
        lastUiSync = now;
        usePlayback.getState().set({ playing, currentTime: hasAudio ? t : 0 });
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div ref={wrapRef} className="relative">
        <canvas
          ref={canvasRef}
          className="block rounded-md shadow-[0_8px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
        />
        <LayerOverlay wrapRef={wrapRef} />
      </div>
    </div>
  );
}

// 静默帧的频谱数组复用（避免空状态每帧分配大对象）
const SILENT_SPECTRUM = new Float32Array(FFT_SIZE / 2);

function emptyFrame(t: number): AudioFrameData {
  return {
    t,
    spectrum: SILENT_SPECTRUM,
    bass: 0,
    mid: 0,
    high: 0,
    level: 0,
    beat: 0,
  };
}
