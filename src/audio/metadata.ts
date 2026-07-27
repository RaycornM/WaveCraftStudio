// ID3 元数据解析 + 文件名智能清洗
import { parseBlob } from 'music-metadata-browser';
import type { TrackMeta } from '@/types';

/**
 * 文件名清洗：
 * `01 - Artist - Title (Official Audio).mp3` → 去序号、扩展名、括号尾巴，按 `-` 拆分
 */
export function cleanFilename(filename: string): { title: string; artist: string } {
  let name = filename.replace(/\.[a-z0-9]+$/i, ''); // 去扩展名
  name = name.replace(/^\s*\d{1,3}[\s.\-_]+/, ''); // 去开头序号
  name = name.replace(/[([【].*?(official|audio|video|mv|lyric|歌词|官方|hd|4k).*?[)\]】]/gi, ''); // 去括号尾巴
  name = name.replace(/\s{2,}/g, ' ').trim();

  const parts = name.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { artist: parts[0], title: parts.slice(1).join(' - ') };
  }
  return { artist: '', title: name };
}

/** 解析音频文件元数据；失败时回退到文件名清洗 */
export async function extractMetadata(file: File): Promise<TrackMeta> {
  const fallback = cleanFilename(file.name);
  try {
    const meta = await parseBlob(file, { duration: false, skipCovers: false });
    const { common } = meta;
    let embeddedCoverUrl: string | undefined;
    const pic = common.picture?.[0];
    if (pic) {
      const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format || 'image/jpeg' });
      embeddedCoverUrl = URL.createObjectURL(blob);
    }
    return {
      title: common.title?.trim() || fallback.title,
      artist: common.artist?.trim() || common.artists?.[0]?.trim() || fallback.artist,
      album: common.album?.trim() || '',
      embeddedCoverUrl,
    };
  } catch {
    return { ...fallback, album: '' };
  }
}
