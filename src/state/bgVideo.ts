// 背景视频元素管理：单例 HTMLVideoElement（muted / playsInline / loop）
// 预览时与音频播放状态同步；导出时逐帧 seek 后 drawImage。
import { renderAssetsStore } from './assets';

/** 加载背景视频 → 存入渲染资产单例；返回元素（readyState >= 2 后 resolve） */
export function loadBgVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    const onReady = () => {
      cleanup();
      renderAssetsStore.bgVideo = video;
      resolve(video);
    };
    const onError = () => {
      cleanup();
      reject(new Error('视频加载失败（仅支持浏览器可播格式，如 H.264 MP4 / WebM）'));
    };
    const cleanup = () => {
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('canplay', onReady);
    video.addEventListener('error', onError);
    video.src = url;
  });
}

/** 清除背景视频 */
export function clearBgVideo() {
  const v = renderAssetsStore.bgVideo;
  if (v) {
    v.pause();
    v.removeAttribute('src');
    v.load();
  }
  renderAssetsStore.bgVideo = null;
}

/**
 * 预览播放同步：根据音频引擎状态驱动视频 play/pause 与进度对齐。
 * 在 rAF 循环中每帧调用（内部有阈值，不会频繁操作）。
 */
export function syncVideoPlayback(video: HTMLVideoElement, playing: boolean, audioTime: number) {
  const vd = video.duration || 1;
  const target = audioTime % vd;
  // 进度漂移超过 0.35s 才校正，避免每帧 seek 抖动
  if (Math.abs(video.currentTime - target) > 0.35) {
    try {
      video.currentTime = target;
    } catch {
      /* 元数据未就绪 */
    }
  }
  if (playing && video.paused) {
    void video.play().catch(() => {
      /* 自动播放策略拒绝时静默（muted 一般不会） */
    });
  } else if (!playing && !video.paused) {
    video.pause();
  }
}

/**
 * 导出逐帧 seek：设置 currentTime 并等待 seeked，带超时兜底（超时沿用上一帧）。
 */
export function seekVideoFrame(video: HTMLVideoElement, time: number, timeoutMs = 500): Promise<void> {
  return new Promise((resolve) => {
    if (video.readyState < 2) return resolve(); // 数据未就绪：沿用当前帧
    if (Math.abs(video.currentTime - time) < 0.001) return resolve();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener('seeked', finish);
      resolve();
    };
    video.addEventListener('seeked', finish);
    setTimeout(finish, timeoutMs);
    try {
      video.currentTime = time;
    } catch {
      finish();
    }
  });
}
