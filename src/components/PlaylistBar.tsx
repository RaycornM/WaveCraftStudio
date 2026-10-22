// 播放列表轨道条：多歌视频的曲目时间线（位于预览区与播放控制条之间）。
// 卡片宽度 ∝ 曲目时长；点击跳播/加载，横向拖拽实时排序；连播时高亮当前曲目并显示段落进度。
import { useEffect, useMemo, useRef, useState } from 'react';
import { ListMusic, Music, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { formatTime } from '@/render/progressBar';
import { useMediaLibrary, type MediaItem } from '@/state/mediaLibrary';
import { usePlayback } from '@/state/playback';
import { useStore } from '@/state/store';

interface Props {
  /** 点击曲目卡片：连播中跳到该首；单曲模式下加载为当前曲目 */
  onJump: (item: MediaItem, index: number) => void;
}

export function PlaylistBar({ onJump }: Props) {
  const items = useMediaLibrary((s) => s.items);
  const playlist = useMediaLibrary((s) => s.playlist);
  const queuePreview = useMediaLibrary((s) => s.queuePreview);
  const { removeFromPlaylist, moveInPlaylistTo, setQueuePreview } = useMediaLibrary.getState();
  const currentAudioId = useStore((s) => s.session.currentAudioId);
  const currentTime = usePlayback((s) => s.currentTime);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const dragRef = useRef<{ id: string; startX: number; moved: boolean } | null>(null);

  const queueItems = useMemo(
    () => playlist.map((id) => items.find((i) => i.id === id)).filter((i): i is MediaItem => !!i),
    [playlist, items],
  );
  const totalDuration = queueItems.reduce((acc, i) => acc + (i.duration ?? 0), 0);

  // 各曲目的全局起点（与 AudioEngine 队列偏移同源：按时长累计）
  const offsets = useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const i of queueItems) {
      out.push(acc);
      acc += i.duration ?? 0;
    }
    return out;
  }, [queueItems]);

  // 连播切歌时滚动到当前卡片
  useEffect(() => {
    if (!queuePreview || !currentAudioId) return;
    cardRefs.current.get(currentAudioId)?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [currentAudioId, queuePreview]);

  if (queueItems.length === 0) return null;

  /* ---------- 拖拽排序（指针移动超过阈值才判定为拖拽，否则视为点击） ---------- */

  const onCardPointerDown = (e: React.PointerEvent, item: MediaItem) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current = { id: item.id, startX: e.clientX, moved: false };

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved) {
        if (Math.abs(ev.clientX - d.startX) < 6) return;
        d.moved = true;
        setDraggingId(d.id);
      }
      // 目标下标：在“排除被拖卡片”的序列中，指针越过了几张卡的中线
      const ids = useMediaLibrary.getState().playlist.filter((pid) => pid !== d.id);
      let insert = 0;
      for (const pid of ids) {
        const el = cardRefs.current.get(pid);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (ev.clientX > r.left + r.width / 2) insert++;
      }
      moveInPlaylistTo(d.id, insert);
    };
    const onUp = (ev: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDraggingId(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (d && !d.moved) {
        const idx = useMediaLibrary.getState().playlist.indexOf(d.id);
        onJump(item, idx);
      }
      void ev;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="flex h-[76px] shrink-0 items-stretch border-t border-white/[0.08] bg-[#0c0c0e]">
      {/* 左侧固定栏：标题 + 连播开关 */}
      <div className="flex w-[132px] shrink-0 flex-col justify-center gap-1.5 border-r border-white/[0.08] px-3">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#EBEBEB]">
          <ListMusic className="h-3.5 w-3.5 text-[#D3FD50]" />
          播放列表
        </span>
        <span className="text-[10px] tabular-nums text-[#8a8a93]">
          {queueItems.length} 首 · {formatTime(totalDuration)}
        </span>
        <label className="flex items-center gap-1.5 text-[10px] text-[#8a8a93]">
          <Switch checked={queuePreview} onCheckedChange={setQueuePreview} className="scale-[0.8] origin-left" />
          连播预览
        </label>
      </div>

      {/* 曲目轨道 */}
      <div className="flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto p-2">
        {queueItems.map((item, idx) => {
          const active = queuePreview && item.id === currentAudioId;
          const dur = item.duration ?? 0;
          const progress =
            active && dur > 0 ? Math.min(1, Math.max(0, (currentTime - offsets[idx]) / dur)) : 0;
          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) cardRefs.current.set(item.id, el);
                else cardRefs.current.delete(item.id);
              }}
              onPointerDown={(e) => onCardPointerDown(e, item)}
              title={`${item.meta?.title || item.name}（点击${queuePreview ? '跳播' : '加载'}，拖拽排序）`}
              className={`group relative flex min-w-[84px] cursor-grab select-none items-center gap-2 overflow-hidden rounded-md border px-2 transition-colors duration-200 active:cursor-grabbing ${
                draggingId === item.id
                  ? 'border-[#D3FD50]/70 opacity-50'
                  : active
                    ? 'border-[#D3FD50]/70 bg-[#D3FD50]/[0.07]'
                    : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20'
              }`}
              style={{ flexGrow: Math.max(1, dur), flexBasis: 0 }}
            >
              {/* 连播进度：当前曲目段落内进度铺底 */}
              {active && progress > 0 && (
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 bg-[#D3FD50]/[0.10]"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
              <span className="w-3.5 shrink-0 text-center font-mono text-[10px] tabular-nums text-[#8a8a93]">
                {idx + 1}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-white/[0.06]">
                {item.embeddedCoverUrl ? (
                  <img src={item.embeddedCoverUrl} alt="" className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <Music className="h-3.5 w-3.5 text-[#8a8a93]" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[11px] ${active ? 'text-[#D3FD50]' : 'text-[#EBEBEB]'}`}>
                  {item.meta?.title || item.name}
                </span>
                <span className="block truncate text-[9px] tabular-nums text-[#8a8a93]">
                  {item.meta?.artist ? `${item.meta.artist} · ` : ''}
                  {dur > 0 ? formatTime(dur) : '--:--'}
                </span>
              </span>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => removeFromPlaylist(item.id)}
                title="移出播放列表"
                className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded bg-black/50 text-[#8a8a93] opacity-0 transition-opacity duration-200 hover:text-red-400 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
