// 媒体库抽屉：左侧可收起面板，集中管理上传过的素材
// 三个标签页：音频 / 封面（图片）/ 背景（视频）；点击条目设为当前素材；
// 音频可加入拼接队列（有序，支持上移/下移/移除），队列连播开关驱动需求 4 预览。
import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Film,
  Image as ImageIcon,
  Library,
  Music,
  Plus,
  Trash2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { formatTime } from '@/render/progressBar';
import { useMediaLibrary, type MediaItem } from '@/state/mediaLibrary';
import { useStore } from '@/state/store';

type TabId = 'audio' | 'image' | 'video';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'audio', label: '音频' },
  { id: 'image', label: '封面' },
  { id: 'video', label: '背景' },
];

function KindIcon({ kind, className }: { kind: MediaItem['kind']; className?: string }) {
  if (kind === 'audio') return <Music className={className} />;
  if (kind === 'video') return <Film className={className} />;
  return <ImageIcon className={className} />;
}

interface Props {
  /** 点击音频条目：加载为当前曲目 */
  onSelectAudio: (item: MediaItem) => void;
  /** 点击封面/背景条目：设为当前背景媒体 */
  onSelectBg: (item: MediaItem) => void;
}

export function MediaLibrary({ onSelectAudio, onSelectBg }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<TabId>('audio');
  const items = useMediaLibrary((s) => s.items);
  const playlist = useMediaLibrary((s) => s.playlist);
  const queuePreview = useMediaLibrary((s) => s.queuePreview);
  const { removeMedia, addToPlaylist, removeFromPlaylist, moveInPlaylist, setQueuePreview } =
    useMediaLibrary.getState();
  const currentAudioId = useStore((s) => s.session.currentAudioId);
  const currentBgId = useStore((s) => s.session.currentBgId);
  const setSession = useStore((s) => s.setSession);

  const byKind = useMemo(
    () => ({
      audio: items.filter((i) => i.kind === 'audio'),
      image: items.filter((i) => i.kind === 'image'),
      video: items.filter((i) => i.kind === 'video'),
    }),
    [items],
  );
  const queueItems = useMemo(
    () => playlist.map((id) => items.find((i) => i.id === id)).filter((i): i is MediaItem => !!i),
    [playlist, items],
  );
  const queueDuration = queueItems.reduce((acc, i) => acc + (i.duration ?? 0), 0);

  /** 删除条目：若删除的是当前使用中的素材，同步清掉会话引用 */
  const handleRemove = (item: MediaItem) => {
    removeMedia(item.id);
    if (item.id === currentBgId) setSession({ coverUrl: null, bgVideoUrl: null, currentBgId: null });
    if (item.id === currentAudioId) setSession({ currentAudioId: null });
  };

  // 收起态：窄条 + 图标 + 计数
  if (collapsed) {
    return (
      <div className="flex w-11 shrink-0 flex-col items-center gap-2 border-r border-white/[0.08] bg-[#0c0c0e] py-3">
        <button
          onClick={() => setCollapsed(false)}
          title="展开媒体库"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#8a8a93] transition-colors duration-200 hover:bg-white/5 hover:text-[#EBEBEB]"
        >
          <Library className="h-4 w-4" />
        </button>
        {items.length > 0 && (
          <span className="rounded-full bg-[#D3FD50]/15 px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-[#D3FD50]">
            {items.length}
          </span>
        )}
        <button
          onClick={() => setCollapsed(false)}
          className="mt-auto flex h-8 w-8 items-center justify-center rounded-md text-[#8a8a93] transition-colors duration-200 hover:text-[#EBEBEB]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-60 shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e]">
      {/* 头部 */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-3">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#EBEBEB]">
          <Library className="h-3.5 w-3.5 text-[#D3FD50]" />
          媒体库
        </span>
        <button
          onClick={() => setCollapsed(true)}
          title="收起媒体库"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#8a8a93] transition-colors duration-200 hover:bg-white/5 hover:text-[#EBEBEB]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex shrink-0 gap-1 border-b border-white/[0.08] p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-1 py-1.5 text-[11px] transition-colors duration-200 ${
              tab === t.id ? 'bg-[#D3FD50] font-medium text-black' : 'text-[#8a8a93] hover:bg-white/5 hover:text-[#EBEBEB]'
            }`}
          >
            {t.label}
            {byKind[t.id].length > 0 && <span className="ml-1 tabular-nums opacity-70">{byKind[t.id].length}</span>}
          </button>
        ))}
      </div>

      {/* 条目列表 */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
        {byKind[tab].length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] leading-relaxed text-[#8a8a93]">
            暂无{tab === 'audio' ? '音频' : tab === 'image' ? '封面图' : '背景视频'}
            <br />
            上传后自动收入媒体库
          </p>
        )}
        {byKind[tab].map((item) => {
          const active = item.kind === 'audio' ? item.id === currentAudioId : item.id === currentBgId;
          const inQueue = playlist.includes(item.id);
          return (
            <div
              key={item.id}
              className={`group flex items-center gap-2 rounded-md border p-1.5 transition-colors duration-200 ${
                active ? 'border-[#D3FD50]/70 bg-[#D3FD50]/[0.06]' : 'border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <button
                onClick={() => (item.kind === 'audio' ? onSelectAudio(item) : onSelectBg(item))}
                title={active ? '当前使用中' : '点击使用'}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {/* 缩略图 / 类型图标 */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-white/[0.06]">
                  {item.thumb ? (
                    <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                  ) : item.embeddedCoverUrl ? (
                    <img src={item.embeddedCoverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <KindIcon kind={item.kind} className="h-3.5 w-3.5 text-[#8a8a93]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[11px] ${active ? 'text-[#D3FD50]' : 'text-[#EBEBEB]'}`}>
                    {item.meta?.title || item.name}
                  </span>
                  <span className="block truncate text-[10px] text-[#8a8a93]">
                    {item.kind === 'audio' && item.meta?.artist ? `${item.meta.artist} · ` : ''}
                    {item.duration ? formatTime(item.duration) : item.kind === 'audio' ? '音频' : item.kind === 'video' ? '视频' : '图片'}
                  </span>
                </span>
              </button>
              {/* 行内操作（hover 显现） */}
              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.kind === 'audio' &&
                  (inQueue ? (
                    <span title="已在拼接队列中" className="flex h-6 w-6 items-center justify-center rounded text-[#D3FD50]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <button
                      onClick={() => addToPlaylist(item.id)}
                      title="加入拼接队列"
                      className="flex h-6 w-6 items-center justify-center rounded text-[#8a8a93] transition-colors duration-200 hover:bg-white/10 hover:text-[#D3FD50]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  ))}
                <button
                  onClick={() => handleRemove(item)}
                  title="从媒体库删除"
                  className="flex h-6 w-6 items-center justify-center rounded text-[#8a8a93] transition-colors duration-200 hover:bg-white/10 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {/* 拼接队列（音频标签页底部） */}
      {tab === 'audio' && (
        <div className="flex max-h-[45%] shrink-0 flex-col border-t border-white/[0.08]">
          <div className="flex items-center justify-between px-3 pt-2.5">
            <span className="text-[11px] font-medium text-[#EBEBEB]">
              拼接队列
              {queueItems.length > 0 && (
                <span className="ml-1.5 text-[10px] font-normal tabular-nums text-[#8a8a93]">
                  {queueItems.length} 首 · {formatTime(queueDuration)}
                </span>
              )}
            </span>
            <label className="flex items-center gap-1.5 text-[10px] text-[#8a8a93]">
              连播
              <Switch
                checked={queuePreview}
                disabled={queueItems.length === 0}
                onCheckedChange={setQueuePreview}
              />
            </label>
          </div>
          <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto p-2">
            {queueItems.length === 0 && (
              <p className="px-1 pb-1.5 text-[10px] leading-relaxed text-[#8a8a93]">
                点音频条目的 + 加入队列；开启连播可多首连放，导出时可选拼接模式。
              </p>
            )}
            {queueItems.map((item, idx) => (
              <div
                key={item.id}
                className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors duration-200 hover:bg-white/[0.04]"
              >
                <span className="w-4 shrink-0 text-center font-mono text-[10px] tabular-nums text-[#8a8a93]">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-[#EBEBEB]">
                  {item.meta?.title || item.name}
                </span>
                <span className="flex shrink-0 items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    onClick={() => moveInPlaylist(item.id, -1)}
                    disabled={idx === 0}
                    title="上移"
                    className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a93] transition-colors duration-200 hover:text-[#EBEBEB] disabled:opacity-25"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveInPlaylist(item.id, 1)}
                    disabled={idx === queueItems.length - 1}
                    title="下移"
                    className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a93] transition-colors duration-200 hover:text-[#EBEBEB] disabled:opacity-25"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeFromPlaylist(item.id)}
                    title="移出队列"
                    className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a93] transition-colors duration-200 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
