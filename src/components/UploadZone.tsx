// 空状态上传引导：拖拽 / 点击上传音频与图片
import { useCallback, useState } from 'react';
import { Music, ImagePlus, UploadCloud } from 'lucide-react';

interface Props {
  onAudioFile: (f: File) => void;
  /** 统一背景媒体入口（图片 jpg/png/webp/gif/avif + 视频 mp4/webm），按 MIME 分发 */
  onBgMediaFile: (f: File) => void;
  hasAudio: boolean;
}

export function UploadZone({ onAudioFile, onBgMediaFile, hasAudio }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (file.type.startsWith('audio/')) onAudioFile(file);
      else if (file.type.startsWith('image/') || file.type.startsWith('video/')) onBgMediaFile(file);
    },
    [onAudioFile, onBgMediaFile],
  );

  if (hasAudio) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-[#050505]/85 backdrop-blur-sm transition-opacity duration-300"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div
        className={`flex w-[min(480px,80%)] flex-col items-center gap-6 rounded-2xl border border-dashed px-10 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.55)] transition-colors duration-200 ${
          dragOver ? 'border-[#D3FD50] bg-[#D3FD50]/5' : 'border-white/20 bg-[#111113]'
        }`}
      >
        <UploadCloud className={`h-10 w-10 transition-colors duration-200 ${dragOver ? 'text-[#D3FD50]' : 'text-[#8a8a93]'}`} strokeWidth={1.5} />
        <div className="text-center">
          <p className="text-[15px] font-medium text-[#EBEBEB]">拖入音频文件开始创作</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[#8a8a93]">
            MP3 / WAV / FLAC / M4A · 所有处理均在本地完成，文件不会离开设备
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-[#D3FD50] px-4 py-2 text-[13px] font-medium text-black transition-opacity hover:opacity-85">
            <Music className="h-4 w-4" />
            选择音频
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onAudioFile(e.target.files[0])}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2 text-[13px] text-[#EBEBEB] transition-colors hover:bg-white/5">
            <ImagePlus className="h-4 w-4" />
            背景媒体
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onBgMediaFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
