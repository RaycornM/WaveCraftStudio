// WaveCraft 主界面：单视口工具形态（不滚动）
// 左侧媒体库抽屉 · 左上浮动曲目信息 · 中央预览画布 · 右侧参数面板 · 底部播放控制条
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import { UploadZone } from '@/components/UploadZone';
import { TrackInfo } from '@/components/TrackInfo';
import { TransportBar } from '@/components/TransportBar';
import { ControlPanel } from '@/components/ControlPanel';
import { MediaLibrary } from '@/components/MediaLibrary';
import { audioEngine } from '@/audio/AudioEngine';
import { extractMetadata } from '@/audio/metadata';
import { checkEncoderSupport } from '@/export/exporter';
import { LOOP_DURATION } from '@/export/loopExport';
import { useStore } from '@/state/store';
import { useMediaLibrary, type MediaItem } from '@/state/mediaLibrary';
import { loadImage, renderAssetsStore } from '@/state/assets';
import { clearBgVideo, loadBgVideo } from '@/state/bgVideo';
import { usePlayback } from '@/state/playback';

/** 媒体库音频条目 → QueueTrack 列表（当前播放列表顺序） */
function queueTracksFromLibrary(): Array<{ id: string; name: string; title: string; artist: string; blob: Blob }> {
  const ml = useMediaLibrary.getState();
  return ml.playlist
    .map((id) => ml.items.find((i) => i.id === id))
    .filter((i): i is MediaItem => !!i && i.kind === 'audio')
    .map((i) => ({
      id: i.id,
      name: i.name,
      title: i.meta?.title || i.name.replace(/\.[a-z0-9]+$/i, ''),
      artist: i.meta?.artist || '',
      blob: i.blob,
    }));
}

export default function App() {
  const hasAudio = useStore((s) => s.session.hasAudio);
  const coverUrl = useStore((s) => s.session.coverUrl);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const support = checkEncoderSupport();

  // 启动：恢复媒体库（IndexedDB → 内存）
  useEffect(() => {
    void useMediaLibrary.getState().init();
  }, []);

  // 音频加载：解码 + 元数据 + 内嵌封面回退 + 入媒体库
  const onAudioFile = useCallback(async (file: File) => {
    setLoadError(null);
    // 上传新单曲即退出队列连播
    useMediaLibrary.getState().setQueuePreview(false);
    const { setSession, patchTitle, config } = useStore.getState();
    try {
      const buffer = await audioEngine.load(file);
      audioEngine.setAnalyserSmoothing(config.analysis.analyserSmoothing);
      const meta = await extractMetadata(file);
      patchTitle({ title: meta.title, artist: meta.artist, startOffset: 0 });
      setSession({
        hasAudio: true,
        duration: buffer.duration,
        fileName: file.name,
        meta,
        albumArtUrl: null, // 新曲目回到“自动使用内嵌封面”
        exportSettings: { ...useStore.getState().session.exportSettings, loopStart: 0, trimStart: 0, trimEnd: 0 },
      });
      // 用户未传图时使用内嵌封面
      if (meta.embeddedCoverUrl && !useStore.getState().session.coverUrl) {
        setSession({ coverUrl: meta.embeddedCoverUrl });
      }
      // 入媒体库（持久化到 IndexedDB）
      const item = await useMediaLibrary.getState().addMedia('audio', file, file.name, {
        duration: buffer.duration,
        meta: { title: meta.title, artist: meta.artist },
        embeddedCoverUrl: meta.embeddedCoverUrl,
      });
      setSession({ currentAudioId: item.id });
      // 加载完自动播放
      audioEngine.play(0);
    } catch {
      setLoadError('无法解码该音频文件，请更换格式（MP3 / WAV / FLAC / M4A）。');
    }
  }, []);

  /**
   * 统一背景媒体入口：同一上传口接受图片（jpg/png/webp/gif/avif）与视频（mp4/webm），
   * 按 MIME 分发到图片/视频两条渲染路径；图片与视频互斥，后传覆盖前者。
   * 素材统一入媒体库，会话直接引用库内 objectUrl。
   */
  const onBgMediaFile = useCallback((file: File) => {
    setLoadError(null);
    const kind = file.type.startsWith('video/') ? ('video' as const) : file.type.startsWith('image/') ? ('image' as const) : null;
    if (!kind) {
      setLoadError('不支持的背景媒体格式（图片：jpg/png/webp/gif/avif；视频：mp4/webm 等）。');
      return;
    }
    void useMediaLibrary
      .getState()
      .addMedia(kind, file, file.name)
      .then((item) => {
        if (kind === 'video') {
          useStore.getState().setSession({ bgVideoUrl: item.objectUrl, coverUrl: null, currentBgId: item.id });
        } else {
          useStore.getState().setSession({ coverUrl: item.objectUrl, bgVideoUrl: null, currentBgId: item.id });
        }
      });
  }, []);

  /** 媒体库点选音频：加载为当前曲目（退出队列连播） */
  const onSelectAudio = useCallback(async (item: MediaItem) => {
    const cur = useStore.getState().session;
    if (cur.currentAudioId === item.id && cur.hasAudio && !audioEngine.queueActive) return;
    setLoadError(null);
    useMediaLibrary.getState().setQueuePreview(false);
    try {
      const buffer = await audioEngine.load(item.blob);
      audioEngine.setAnalyserSmoothing(useStore.getState().config.analysis.analyserSmoothing);
      const title = item.meta?.title || item.name.replace(/\.[a-z0-9]+$/i, '');
      const artist = item.meta?.artist || '';
      const { patchTitle, setSession } = useStore.getState();
      patchTitle({ title, artist, startOffset: 0 });
      setSession({
        hasAudio: true,
        duration: buffer.duration,
        fileName: item.name,
        meta: { title, artist, album: '', embeddedCoverUrl: item.embeddedCoverUrl },
        currentAudioId: item.id,
        albumArtUrl: null,
        exportSettings: { ...useStore.getState().session.exportSettings, loopStart: 0, trimStart: 0, trimEnd: 0 },
      });
      if (item.embeddedCoverUrl && !useStore.getState().session.coverUrl) {
        setSession({ coverUrl: item.embeddedCoverUrl });
      }
      audioEngine.play(0);
    } catch {
      setLoadError('无法解码该音频，文件可能已损坏，建议从媒体库删除。');
    }
  }, []);

  /** 媒体库点选封面/背景：设为当前背景媒体（图片与视频互斥） */
  const onSelectBg = useCallback((item: MediaItem) => {
    if (item.kind === 'video') {
      useStore.getState().setSession({ bgVideoUrl: item.objectUrl, coverUrl: null, currentBgId: item.id });
    } else {
      useStore.getState().setSession({ coverUrl: item.objectUrl, bgVideoUrl: null, currentBgId: item.id });
    }
  }, []);

  // 队列连播开关：进入时快照当前播放列表逐首连播；退出时回到单曲模式
  const queuePreview = useMediaLibrary((s) => s.queuePreview);
  useEffect(() => {
    if (!queuePreview) {
      if (!audioEngine.queueActive) return;
      const info = audioEngine.queueInfo;
      audioEngine.exitQueue();
      // 恢复单曲会话：停留在连播中断的那首
      const st = useStore.getState();
      st.patchTitle({ startOffset: 0 });
      if (info) {
        const item = useMediaLibrary.getState().items.find((i) => i.id === info.id);
        st.setSession({
          duration: audioEngine.buffer?.duration ?? 0,
          currentAudioId: info.id,
          fileName: item?.name ?? info.name,
        });
      }
      return;
    }
    const tracks = queueTracksFromLibrary();
    if (tracks.length === 0) {
      useMediaLibrary.getState().setQueuePreview(false);
      return;
    }
    // 连播与循环试听互斥
    useStore.getState().setSession({ loopPreview: false });
    audioEngine.setLoopRange(null);
    void audioEngine.playQueue(tracks, 0, 0, true).then(() => {
      const first = tracks[0];
      const st = useStore.getState();
      st.patchTitle({ title: first.title, artist: first.artist, startOffset: 0 });
      st.setSession({
        hasAudio: true,
        duration: audioEngine.duration, // 队列总时长 → TransportBar 进度条
        fileName: first.name,
        currentAudioId: first.id,
      });
    });
    // 仅在开关切换时重进/退出；连播中调整队列顺序不打断播放
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuePreview]);

  // 连播切歌：标题/艺术家随曲目切换，startOffset 让标题动画每首重新入场；
  // 专辑图在“自动”模式（albumArtUrl 为 null）下跟随当前曲目的内嵌封面
  useEffect(() => {
    audioEngine.onQueueTrackChange = (_index, startOffset, track) => {
      const st = useStore.getState();
      const title = track.title || track.name.replace(/\.[a-z0-9]+$/i, '');
      const item = useMediaLibrary.getState().items.find((i) => i.id === track.id);
      st.patchTitle({ title, artist: track.artist, startOffset });
      st.setSession({
        fileName: track.name,
        currentAudioId: track.id,
        meta: { title, artist: track.artist, album: '', embeddedCoverUrl: item?.embeddedCoverUrl },
      });
    };
    return () => {
      audioEngine.onQueueTrackChange = null;
    };
  }, []);

  // 封面 URL → HTMLImageElement（渲染循环直接读取）
  useEffect(() => {
    if (!coverUrl) {
      renderAssetsStore.coverImage = null;
      return;
    }
    let cancelled = false;
    loadImage(coverUrl)
      .then((img) => {
        if (!cancelled) renderAssetsStore.coverImage = img;
      })
      .catch(() => {
        renderAssetsStore.coverImage = null;
      });
    return () => {
      cancelled = true;
    };
  }, [coverUrl]);

  // 专辑图 URL（自定义上传优先，否则自动用内嵌封面）→ HTMLImageElement（渲染循环直接读取）
  const albumArtUrl = useStore((s) => s.session.albumArtUrl);
  const embeddedCoverUrl = useStore((s) => s.session.meta?.embeddedCoverUrl);
  useEffect(() => {
    const url = albumArtUrl ?? embeddedCoverUrl ?? null;
    if (!url) {
      renderAssetsStore.albumArtImage = null;
      return;
    }
    let cancelled = false;
    loadImage(url)
      .then((img) => {
        if (!cancelled) renderAssetsStore.albumArtImage = img;
      })
      .catch(() => {
        renderAssetsStore.albumArtImage = null;
      });
    return () => {
      cancelled = true;
    };
  }, [albumArtUrl, embeddedCoverUrl]);

  // 背景视频 URL → HTMLVideoElement
  const bgVideoUrl = useStore((s) => s.session.bgVideoUrl);
  useEffect(() => {
    if (!bgVideoUrl) {
      clearBgVideo();
      return;
    }
    let cancelled = false;
    loadBgVideo(bgVideoUrl).catch(() => {
      if (!cancelled) {
        clearBgVideo();
        setLoadError('视频加载失败，请使用浏览器可播格式（H.264 MP4 / WebM）。');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [bgVideoUrl]);

  // 分析平滑参数同步到实时 AnalyserNode
  const analyserSmoothing = useStore((s) => s.config.analysis.analyserSmoothing);
  useEffect(() => {
    audioEngine.setAnalyserSmoothing(analyserSmoothing);
  }, [analyserSmoothing]);

  // 播完归位
  useEffect(() => {
    audioEngine.onEnded = () => usePlayback.getState().set({ playing: false, currentTime: 0 });
    return () => {
      audioEngine.onEnded = null;
    };
  }, []);

  // 键盘快捷键：空格 播放/暂停 · ←/→ 快退/快进 5s · L 循环试听
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      ) {
        return;
      }
      const st = useStore.getState();
      if (!st.session.hasAudio) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (audioEngine.playing) audioEngine.pause();
        else audioEngine.play();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audioEngine.seek(audioEngine.currentTime - 5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioEngine.seek(audioEngine.currentTime + 5);
      } else if (e.code === 'KeyL') {
        if (audioEngine.queueActive) return; // 连播模式不支持 8s 循环试听
        const dur = st.session.duration;
        if (dur < LOOP_DURATION) return;
        const next = !st.session.loopPreview;
        st.setSession({ loopPreview: next });
        if (next) {
          const start = Math.min(st.session.exportSettings.loopStart, Math.max(0, dur - LOOP_DURATION));
          audioEngine.setLoopRange({ start, len: LOOP_DURATION });
          audioEngine.play(start);
        } else {
          audioEngine.setLoopRange(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#050505] text-[#EBEBEB]">
      {!support.video && !bannerDismissed && (
        <div className="flex shrink-0 items-center gap-2 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[12px] text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{support.message}（预览功能不受影响）</span>
          <button onClick={() => setBannerDismissed(true)} className="text-amber-200/70 hover:text-amber-100">
            知道了
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <MediaLibrary onSelectAudio={onSelectAudio} onSelectBg={onSelectBg} />
        <div className="relative min-w-0 flex-1">
          <PreviewCanvas />
          <UploadZone onAudioFile={onAudioFile} onBgMediaFile={onBgMediaFile} hasAudio={hasAudio} />
          <TrackInfo onAudioFile={onAudioFile} onBgMediaFile={onBgMediaFile} />
          {loadError && (
            <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-md border border-red-500/30 bg-red-500/15 px-4 py-2 text-[12px] text-red-200">
              {loadError}
            </div>
          )}
        </div>
        <ControlPanel />
      </div>

      <TransportBar />
    </div>
  );
}
