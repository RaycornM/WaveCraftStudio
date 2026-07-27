// 极简 IndexedDB 封装：媒体库 blob 持久化（刷新后列表不丢）
const DB_NAME = 'wavecraft-media';
const STORE = 'media';

export interface MediaRecord {
  id: string;
  kind: 'audio' | 'image' | 'video';
  name: string;
  duration?: number;
  meta?: { title: string; artist: string };
  addedAt: number;
  blob: Blob;
  /** 音频内嵌封面（原图 blob，拼接导出分段封面用） */
  coverBlob?: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export const idb = {
  put: (rec: MediaRecord) => tx('readwrite', (s) => s.put(rec)),
  remove: (id: string) => tx('readwrite', (s) => s.delete(id)),
  getAll: () => tx('readonly', (s) => s.getAll() as IDBRequest<MediaRecord[]>),
};
