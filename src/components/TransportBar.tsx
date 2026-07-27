// 底部播放控制条：播放/暂停、进度、时间、循环试听开关
import { Pause, Play, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { audioEngine } from '@/audio/AudioEngine';
import { formatTime } from '@/render/progressBar';
import { LOOP_DURATION } from '@/export/loopExport';
import { useStore } from '@/state/store';
import { useMediaLibrary } from '@/state/mediaLibrary';
import { usePlayback } from '@/state/playback';

export function TransportBar() {
  const playing = usePlayback((s) => s.playing);
  const currentTime = usePlayback((s) => s.currentTime);
  const hasAudio = useStore((s) => s.session.hasAudio);
  const duration = useStore((s) => s.session.duration);
  const loopPreview = useStore((s) => s.session.loopPreview);
  const loopStart = useStore((s) => s.session.exportSettings.loopStart);
  const exportMode = useStore((s) => s.session.exportSettings.mode);
  const trimStart = useStore((s) => s.session.exportSettings.trimStart);
  const trimEnd = useStore((s) => s.session.exportSettings.trimEnd);
  const setSession = useStore((s) => s.setSession);
  // 队列连播与 8s 循环试听互斥
  const queuePreview = useMediaLibrary((s) => s.queuePreview);

  // 裁剪模式：播放条上叠加浅色区间标记
  const trimEndEff = trimEnd > 0 ? Math.min(trimEnd, duration) : duration;
  const showTrimMark = exportMode === 'trim' && hasAudio && duration > 0 && trimEndEff - trimStart >= 0.5;

  const togglePlay = () => {
    if (!hasAudio) return;
    if (audioEngine.playing) audioEngine.pause();
    else audioEngine.play();
  };

  const toggleLoop = () => {
    const next = !loopPreview;
    setSession({ loopPreview: next });
    if (next) {
      const start = Math.min(loopStart, Math.max(0, duration - LOOP_DURATION));
      audioEngine.setLoopRange({ start, len: LOOP_DURATION });
      audioEngine.play(start);
    } else {
      audioEngine.setLoopRange(null);
    }
  };

  return (
    <div className="flex h-14 shrink-0 items-center gap-4 border-t border-white/[0.08] bg-[#0c0c0e] px-4">
      <button
        onClick={togglePlay}
        disabled={!hasAudio}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D3FD50] text-black transition-opacity hover:opacity-85 disabled:opacity-25"
        aria-label={playing ? '暂停' : '播放'}
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>

      <span className="w-12 shrink-0 text-right font-mono text-[12px] tabular-nums text-[#8a8a93]">
        {formatTime(currentTime)}
      </span>
      <div className="relative min-w-0 flex-1">
        <Slider
          className="transport-slider"
          min={0}
          max={Math.max(0.01, duration)}
          step={0.01}
          value={[Math.min(currentTime, duration)]}
          disabled={!hasAudio}
          onValueChange={([v]) => audioEngine.seek(v)}
        />
        {showTrimMark && (
          <div
            className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#D3FD50]/15 ring-1 ring-[#D3FD50]/35"
            style={{
              left: `${(trimStart / duration) * 100}%`,
              width: `${((trimEndEff - trimStart) / duration) * 100}%`,
            }}
          />
        )}
      </div>
      <span className="w-12 shrink-0 font-mono text-[12px] tabular-nums text-[#8a8a93]">{formatTime(duration)}</span>

      <button
        onClick={toggleLoop}
        disabled={!hasAudio || duration < LOOP_DURATION || queuePreview}
        title={
          queuePreview
            ? '队列连播中，关闭连播后可循环试听'
            : duration < LOOP_DURATION
              ? '音频不足 8 秒，无法循环试听'
              : '循环试听 8 秒区间（验证无缝衔接）'
        }
        className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] transition-colors disabled:opacity-25 ${
          loopPreview
            ? 'border-[#D3FD50]/50 bg-[#D3FD50]/10 text-[#D3FD50]'
            : 'border-white/10 text-[#8a8a93] hover:text-[#EBEBEB]'
        }`}
      >
        <Repeat className="h-3.5 w-3.5" />
        循环试听
      </button>
    </div>
  );
}
