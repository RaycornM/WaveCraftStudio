// 左上角浮动曲目信息 + 上传入口
import { ImagePlus, Music } from 'lucide-react';
import { useStore } from '@/state/store';

interface Props {
  onAudioFile: (f: File) => void;
  /** 统一背景媒体入口（图片 + 视频，按 MIME 分发） */
  onBgMediaFile: (f: File) => void;
}

export function TrackInfo({ onAudioFile, onBgMediaFile }: Props) {
  const hasAudio = useStore((s) => s.session.hasAudio);
  const title = useStore((s) => s.config.title.title);
  const artist = useStore((s) => s.config.title.artist);
  const fileName = useStore((s) => s.session.fileName);

  if (!hasAudio) return null;

  return (
    <div className="absolute left-4 top-4 z-10 flex max-w-[340px] flex-col gap-2.5">
      <div className="rounded-lg border border-white/[0.08] bg-[#111113]/85 px-3.5 py-2.5 backdrop-blur-md">
        <p className="truncate text-[13px] font-medium text-[#EBEBEB]">{title || fileName}</p>
        {artist && <p className="mt-0.5 truncate text-[11px] text-[#8a8a93]">{artist}</p>}
      </div>
      <div className="flex gap-2">
        <label
          title="更换音频"
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#111113]/85 px-2.5 py-1.5 text-[11px] text-[#8a8a93] backdrop-blur-md transition-colors hover:text-[#EBEBEB]"
        >
          <Music className="h-3.5 w-3.5" />
          音频
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onAudioFile(e.target.files[0])}
          />
        </label>
        <label
          title="上传背景媒体（图片 jpg/png/webp/gif/avif 或视频 mp4/webm）"
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#111113]/85 px-2.5 py-1.5 text-[11px] text-[#8a8a93] backdrop-blur-md transition-colors hover:text-[#EBEBEB]"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          背景
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onBgMediaFile(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
}
