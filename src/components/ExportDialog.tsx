// 导出面板：规格选择 / 循环片段 / 拼接队列 / 进度 + 预计剩余时间 + 取消
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { audioEngine } from '@/audio/AudioEngine';
import { checkEncoderSupport, exportVideo, type ExportJob } from '@/export/exporter';
import { exportQueue } from '@/export/concatExport';
import { LOOP_DURATION, maxLoopStart } from '@/export/loopExport';
import { formatTime } from '@/render/progressBar';
import { useStore } from '@/state/store';
import { useMediaLibrary, type MediaItem } from '@/state/mediaLibrary';
import { renderAssetsStore } from '@/state/assets';
import type { ExportProgress } from '@/types';

type Phase = 'config' | 'running' | 'done' | 'error';

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const config = useStore((s) => s.config);
  const settings = useStore((s) => s.session.exportSettings);
  const duration = useStore((s) => s.session.duration);
  const patchExport = useStore((s) => s.patchExport);
  const playlist = useMediaLibrary((s) => s.playlist);
  const libraryItems = useMediaLibrary((s) => s.items);

  const [phase, setPhase] = useState<Phase>('config');
  const [progress, setProgress] = useState<ExportProgress>({ ratio: 0, stage: '', etaSeconds: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const jobRef = useRef<ExportJob | null>(null);

  const support = checkEncoderSupport();
  const loopMax = maxLoopStart(duration);
  const canLoop = duration >= LOOP_DURATION;

  // 裁剪区间：trimEnd 为 0 表示未设置（按整曲末尾）
  const trimStart = Math.min(settings.trimStart, Math.max(0, duration - 0.1));
  const trimEndEff = settings.trimEnd > 0 ? Math.min(settings.trimEnd, duration) : duration;
  const canTrim = duration > 0.5;
  const trimValid = canTrim && trimEndEff - trimStart >= 0.5;

  // 拼接队列：按 playlist 顺序取库内音频
  const queueItems = playlist
    .map((id) => libraryItems.find((i) => i.id === id))
    .filter((i): i is MediaItem => !!i && i.kind === 'audio');
  const queueDuration = queueItems.reduce((a, i) => a + (i.duration ?? 0), 0);
  const canQueue = queueItems.length >= 2;

  useEffect(() => {
    return () => {
      jobRef.current?.cancel();
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startExport = () => {
    const isLoop = settings.mode === 'loop';
    const isQueue = settings.mode === 'queue';

    let job: ExportJob;
    let suffix: string;
    audioEngine.pause();

    if (isQueue) {
      // 拼接导出：队列曲目串成整段时间线
      if (!canQueue) return;
      job = exportQueue({
        items: queueItems,
        config,
        assets: {
          cover: renderAssetsStore.coverImage ?? undefined,
          bgVideo: renderAssetsStore.bgVideo ?? undefined,
          duration: queueDuration,
        },
        settings,
        onProgress: setProgress,
      });
      suffix = `-queue${queueItems.length}`;
    } else {
      const buffer = audioEngine.buffer;
      if (!buffer) return;
      const isTrim = settings.mode === 'trim';
      if (isTrim && !trimValid) return;
      const start = isLoop ? Math.min(settings.loopStart, loopMax) : isTrim ? trimStart : 0;
      const dur = isLoop ? LOOP_DURATION : isTrim ? trimEndEff - trimStart : duration;
      // 循环片段（Spotify Canvas 模式）固定 9:16 竖版
      const exportConfig = isLoop ? { ...config, layout: '9:16' as const } : config;
      job = exportVideo({
        audioBuffer: buffer,
        config: exportConfig,
        assets: {
          cover: renderAssetsStore.coverImage ?? undefined,
          bgVideo: renderAssetsStore.bgVideo ?? undefined,
          duration: dur,
          loopPeriod: isLoop ? LOOP_DURATION : undefined,
        },
        settings,
        start,
        duration: dur,
        onProgress: setProgress,
      });
      suffix = isLoop ? '-loop8s' : settings.mode === 'trim' ? '-trim' : '';
    }

    setPhase('running');
    setProgress({ ratio: 0, stage: '准备中…', etaSeconds: 0 });
    jobRef.current = job;

    job.promise
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setPhase('done');
        // 自动触发下载
        const a = document.createElement('a');
        a.href = url;
        const base = (config.title.title || 'wavecraft').replace(/[\\/:*?"<>|]/g, '_');
        a.download = `${base}-${config.layout.replace(':', 'x')}${suffix}.mp4`;
        a.click();
      })
      .catch((e: unknown) => {
        if ((e as DOMException)?.name === 'AbortError') {
          setPhase('config');
          return;
        }
        setErrorMsg(e instanceof Error ? e.message : '导出失败，请重试。');
        setPhase('error');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={phase === 'config' || phase === 'error' ? onClose : undefined}>
      <div
        className="w-[400px] rounded-xl border border-white/10 bg-[#111113] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#EBEBEB]">导出 MP4</h2>
          <button onClick={onClose} className="text-[#8a8a93] transition-colors hover:text-[#EBEBEB]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!support.video && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {support.message}
          </div>
        )}
        {support.video && !support.audio && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {support.message}
          </div>
        )}

        {phase === 'config' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[#8a8a93]">导出模式</span>
              <div className="grid grid-cols-2 overflow-hidden rounded-md border border-white/10">
                {(
                  [
                    { v: 'full' as const, label: '完整曲目' },
                    { v: 'trim' as const, label: '自定义区间' },
                    { v: 'loop' as const, label: '循环 (8s)' },
                    { v: 'queue' as const, label: `拼接队列${queueItems.length > 0 ? ` (${queueItems.length})` : ''}` },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.v}
                    disabled={(o.v === 'loop' && !canLoop) || (o.v === 'queue' && !canQueue) || (o.v === 'trim' && !canTrim)}
                    onClick={() => patchExport({ mode: o.v })}
                    className={`px-2 py-2 text-[12px] transition-colors disabled:opacity-30 ${
                      settings.mode === o.v ? 'bg-[#D3FD50] font-medium text-black' : 'text-[#8a8a93] hover:bg-white/5'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {settings.mode === 'trim' && canTrim && (
                <>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#8a8a93]">导出区间</span>
                    <span className="font-mono text-[11px] tabular-nums text-[#EBEBEB]">
                      {formatTime(trimStart)} – {formatTime(trimEndEff)} · 共 {formatTime(trimEndEff - trimStart)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={Math.max(0.01, duration)}
                    step={0.1}
                    minStepsBetweenThumbs={1}
                    value={[trimStart, trimEndEff]}
                    onValueChange={([a, b]) => patchExport({ trimStart: a, trimEnd: b })}
                  />
                  {!trimValid && <p className="text-[11px] text-amber-300">区间至少 0.5 秒，请拉开起止点。</p>}
                  <p className="text-[10px] leading-relaxed text-[#8a8a93]">
                    只导出选中起止区间；底部播放条会以浅色标出当前选中段。
                  </p>
                </>
              )}
              {settings.mode === 'loop' && canLoop && (
                <>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#8a8a93]">循环区间起点</span>
                    <span className="font-mono text-[11px] tabular-nums text-[#EBEBEB]">
                      {formatTime(settings.loopStart)} – {formatTime(settings.loopStart + LOOP_DURATION)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={Math.max(0.01, loopMax)}
                    step={0.1}
                    value={[Math.min(settings.loopStart, loopMax)]}
                    onValueChange={([v]) => patchExport({ loopStart: v })}
                  />
                  <p className="text-[10px] leading-relaxed text-[#8a8a93]">
                    无缝循环：9:16 竖版 · 8 秒整 · 首尾帧视觉一致，建议导出前用底部「循环试听」验证。
                  </p>
                </>
              )}
              {settings.mode === 'loop' && !canLoop && (
                <p className="text-[11px] text-amber-300">音频不足 8 秒，无法使用循环模式。</p>
              )}
              {settings.mode === 'queue' && canQueue && (
                <p className="text-[10px] leading-relaxed text-[#8a8a93]">
                  {queueItems.length} 首曲目依次拼接，总时长 {formatTime(queueDuration)}；标题与封面随曲目自动切换。
                </p>
              )}
              {settings.mode === 'queue' && !canQueue && (
                <p className="text-[11px] text-amber-300">拼接队列不足 2 首，请先在左侧媒体库把音频加入队列。</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[#8a8a93]">分辨率</span>
              <div className="flex overflow-hidden rounded-md border border-white/10">
                {(['720p', '1080p'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => patchExport({ resolution: r })}
                    className={`flex-1 px-2 py-2 text-[12px] transition-colors ${
                      settings.resolution === r ? 'bg-[#D3FD50] font-medium text-black' : 'text-[#8a8a93] hover:bg-white/5'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-[#8a8a93]">帧率</span>
                <div className="flex overflow-hidden rounded-md border border-white/10">
                  {([30, 60] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => patchExport({ fps: f })}
                      className={`flex-1 px-2 py-2 text-[12px] transition-colors ${
                        settings.fps === f ? 'bg-[#D3FD50] font-medium text-black' : 'text-[#8a8a93] hover:bg-white/5'
                      }`}
                    >
                      {f}fps
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-[#8a8a93]">码率</span>
                <div className="flex overflow-hidden rounded-md border border-white/10">
                  {([8, 12, 20] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => patchExport({ bitrate: b })}
                      className={`flex-1 px-2 py-2 text-[12px] transition-colors ${
                        settings.bitrate === b ? 'bg-[#D3FD50] font-medium text-black' : 'text-[#8a8a93] hover:bg-white/5'
                      }`}
                    >
                      {b}M
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startExport}
              disabled={
                !support.video ||
                (settings.mode === 'loop' && !canLoop) ||
                (settings.mode === 'queue' && !canQueue) ||
                (settings.mode === 'trim' && !trimValid)
              }
              className="mt-1 flex h-10 items-center justify-center rounded-md bg-[#D3FD50] text-[13px] font-medium text-black transition-opacity hover:opacity-85 disabled:opacity-30"
            >
              开始导出
            </button>
          </div>
        )}

        {phase === 'running' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#EBEBEB]">{progress.stage}</span>
              <span className="font-mono tabular-nums text-[#D3FD50]">{Math.round(progress.ratio * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#D3FD50] transition-[width] duration-200"
                style={{ width: `${progress.ratio * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tabular-nums text-[#8a8a93]">
                预计剩余 {progress.etaSeconds > 0 ? `${Math.ceil(progress.etaSeconds)}s` : '—'}
              </span>
              <button
                onClick={() => jobRef.current?.cancel()}
                className="rounded-md border border-white/15 px-3 py-1.5 text-[12px] text-[#EBEBEB] transition-colors hover:bg-white/5"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] text-[#EBEBEB]">导出完成，文件已开始下载。</p>
            {resultUrl && (
              <a href={resultUrl} download className="text-[12px] text-[#D3FD50] underline underline-offset-2">
                重新下载
              </a>
            )}
            <button onClick={onClose} className="mt-1 h-9 rounded-md border border-white/15 text-[13px] text-[#EBEBEB] hover:bg-white/5">
              关闭
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-[12px] text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
            <button onClick={() => setPhase('config')} className="h-9 rounded-md border border-white/15 text-[13px] text-[#EBEBEB] hover:bg-white/5">
              返回重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
