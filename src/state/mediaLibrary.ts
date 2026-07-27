// 媒体库：上传过的音频/封面/背景素材统一入库（内存 zustand + IndexedDB 持久化）
// 拼接队列（playlist）是有序音频 id 列表，用于需求 4 的多音频拼接。
import { create } from 'zustand';
import { idb, type MediaRecord } from './idb';

export interface MediaItem {
  id: string;
  kind: 'audio' | 'image' | 'video';
  name: string;
  /** 音频/视频时长（秒） */
  duration?: number;
  /** 缩略图（图片/视频为 dataURL；音频无） */
  thumb?: string;
  /** 音频元数据（入库时解析） */
  meta?: { title: string; artist: string };
  /** 运行时对象 URL（blob 本体存 IndexedDB） */
  objectUrl: string;
  blob: Blob;
  /** 音频内嵌封面 object URL */
  embeddedCoverUrl?: string;
  addedAt: number;
}

interface MediaLibraryState {
  items: MediaItem[];
  loaded: boolean;
  /** 拼接队列：音频 item id 有序列表 */
  playlist: string[];
  /** 队列预览模式开关 */
  queuePreview: boolean;

  init: () => Promise<void>;
  addMedia: (kind: MediaItem['kind'], blob: Blob, name: string, extra?: Partial<MediaItem>) => Promise<MediaItem>;
  removeMedia: (id: string) => void;
  addToPlaylist: (id: string) => void;
  removeFromPlaylist: (id: string) => void;
  moveInPlaylist: (id: string, dir: -1 | 1) => void;
  setQueuePreview: (v: boolean) => void;
}

let seq = 0;
const newId = () => `m-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** 取图片/视频缩略图与时长（视频抽首帧） */
async function probeMedia(kind: 'image' | 'video', url: string): Promise<{ thumb?: string; duration?: number }> {
  return new Promise((resolve) => {
    if (kind === 'image') {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const s = 96 / Math.max(img.naturalWidth, img.naturalHeight);
        c.width = Math.max(1, Math.round(img.naturalWidth * s));
        c.height = Math.max(1, Math.round(img.naturalHeight * s));
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve({ thumb: c.toDataURL('image/jpeg', 0.7) });
      };
      img.onerror = () => resolve({});
      img.src = url;
    } else {
      const v = document.createElement('video');
      v.muted = true;
      v.preload = 'metadata';
      v.onloadeddata = () => {
        v.currentTime = Math.min(0.1, (v.duration || 1) / 2);
      };
      v.onseeked = () => {
        try {
          const c = document.createElement('canvas');
          const s = 96 / Math.max(v.videoWidth, v.videoHeight);
          c.width = Math.max(1, Math.round(v.videoWidth * s));
          c.height = Math.max(1, Math.round(v.videoHeight * s));
          c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
          resolve({ thumb: c.toDataURL('image/jpeg', 0.7), duration: v.duration });
        } catch {
          resolve({ duration: v.duration });
        }
      };
      v.onerror = () => resolve({});
      v.src = url;
    }
  });
}

export const useMediaLibrary = create<MediaLibraryState>((set, get) => ({
  items: [],
  loaded: false,
  playlist: [],
  queuePreview: false,

  /** 启动时从 IndexedDB 恢复列表 */
  init: async () => {
    if (get().loaded) return;
    try {
      const records = await idb.getAll();
      const items: MediaItem[] = [];
      for (const r of records.sort((a, b) => a.addedAt - b.addedAt)) {
        const objectUrl = URL.createObjectURL(r.blob);
        const embeddedCoverUrl = r.coverBlob ? URL.createObjectURL(r.coverBlob) : undefined;
        const probe = r.kind !== 'audio' ? await probeMedia(r.kind, objectUrl) : {};
        items.push({
          id: r.id,
          kind: r.kind,
          name: r.name,
          duration: r.duration ?? probe.duration,
          meta: r.meta,
          thumb: probe.thumb,
          objectUrl,
          blob: r.blob,
          embeddedCoverUrl,
          addedAt: r.addedAt,
        });
      }
      set({ items, loaded: true });
    } catch {
      set({ loaded: true }); // IndexedDB 不可用时退化为纯内存
    }
  },

  addMedia: async (kind, blob, name, extra) => {
    const id = newId();
    const objectUrl = URL.createObjectURL(blob);
    const probe = kind !== 'audio' ? await probeMedia(kind, objectUrl) : {};
    const item: MediaItem = {
      id,
      kind,
      name,
      objectUrl,
      blob,
      duration: extra?.duration ?? probe.duration,
      thumb: extra?.thumb ?? probe.thumb,
      meta: extra?.meta,
      embeddedCoverUrl: extra?.embeddedCoverUrl,
      addedAt: Date.now(),
    };
    set((s) => ({ items: [...s.items, item] }));
    // 异步持久化（失败不影响内存态）
    const rec: MediaRecord = { id, kind, name, duration: item.duration, meta: item.meta, addedAt: item.addedAt, blob };
    if (item.embeddedCoverUrl) {
      try {
        rec.coverBlob = await (await fetch(item.embeddedCoverUrl)).blob();
      } catch {
        /* 内嵌封面持久化失败可忽略 */
      }
    }
    void idb.put(rec).catch(() => {});
    return item;
  },

  removeMedia: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      URL.revokeObjectURL(item.objectUrl);
      if (item.embeddedCoverUrl) URL.revokeObjectURL(item.embeddedCoverUrl);
    }
    set((s) => ({
      items: s.items.filter((i) => i.id !== id),
      playlist: s.playlist.filter((p) => p !== id),
    }));
    void idb.remove(id).catch(() => {});
  },

  addToPlaylist: (id) =>
    set((s) => (s.playlist.includes(id) ? s : { playlist: [...s.playlist, id] })),
  removeFromPlaylist: (id) => set((s) => ({ playlist: s.playlist.filter((p) => p !== id) })),
  moveInPlaylist: (id, dir) =>
    set((s) => {
      const idx = s.playlist.indexOf(id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= s.playlist.length) return s;
      const next = [...s.playlist];
      [next[idx], next[to]] = [next[to], next[idx]];
      return { playlist: next };
    }),
  setQueuePreview: (v) => set({ queuePreview: v }),
}));
