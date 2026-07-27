// 右侧固定参数面板（300px）：分组折叠 —— 样式预设 / 参数 / 特效层 / 标题 / 背景 / 布局与导出
import { useRef, useState } from 'react';
import { ChevronDown, Download, Save, Trash2, Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PresetStrip } from './PresetStrip';
import { ExportDialog } from './ExportDialog';
import { LAYOUT_LIST } from '@/render/layouts';
import { useStore } from '@/state/store';
import { useMediaLibrary } from '@/state/mediaLibrary';
import {
  deleteCustomPreset,
  exportPresetJson,
  importPresetJson,
  loadCustomPresets,
  saveCustomPreset,
  type NamedPreset,
} from '@/state/presets';
import type { TitleAnimation, TitleFont, TitlePosition } from '@/types';

/* ---------- 基础小控件 ---------- */

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.08]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-[11px] font-medium tracking-[0.1em] text-[#8a8a93] transition-colors hover:bg-white/[0.03] hover:text-[#EBEBEB]"
      >
        {title}
        <ChevronDown className={`h-3.5 w-3.5 text-[#8a8a93] transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </div>
  );
}

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#8a8a93]">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-[#EBEBEB]">{format ? format(value) : value}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[#8a8a93]">{label}</span>
      <label className="relative h-6 w-10 cursor-pointer overflow-hidden rounded border border-white/15">
        <span className="absolute inset-0" style={{ backgroundColor: value }} />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
    </div>
  );
}

function Seg<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: Array<{ v: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-[11px] text-[#8a8a93]">{label}</span>}
      <div className="flex overflow-hidden rounded-md border border-white/10">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`flex-1 px-1 py-1.5 text-[11px] transition-colors duration-150 ${
              value === o.v ? 'bg-[#D3FD50] font-medium text-black' : 'text-[#8a8a93] hover:bg-white/5 hover:text-[#EBEBEB]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[#8a8a93]">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ---------- 我的预设 ---------- */

function CustomPresets() {
  const config = useStore((s) => s.config);
  const applyConfig = useStore((s) => s.applyConfig);
  const [list, setList] = useState<NamedPreset[]>(() => loadCustomPresets());
  const [name, setName] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2 border-t border-white/[0.08] pt-3">
      <span className="text-[11px] font-medium text-[#8a8a93]">我的预设</span>
      <div className="flex gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="命名当前配置…"
          className="h-7 min-w-0 flex-1 rounded-md border border-white/10 bg-transparent px-2 text-[11px] text-[#EBEBEB] outline-none placeholder:text-[#8a8a93]/60 focus:border-[#D3FD50]/50"
        />
        <button
          onClick={() => {
            setList(saveCustomPreset(name, config));
            setName('');
          }}
          title="保存为我的预设"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-[#8a8a93] hover:text-[#D3FD50]"
        >
          <Save className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => importRef.current?.click()}
          title="导入预设 JSON"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-[#8a8a93] hover:text-[#D3FD50]"
        >
          <Upload className="h-3.5 w-3.5" />
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            const cfg = importPresetJson(await f.text());
            if (cfg) applyConfig(cfg);
          }}
        />
      </div>
      {list.map((p) => (
        <div key={p.id} className="flex items-center gap-1.5">
          <button
            onClick={() => applyConfig({ ...p.config, title: { ...p.config.title, title: config.title.title, artist: config.title.artist } })}
            className="h-7 min-w-0 flex-1 truncate rounded-md border border-white/10 px-2 text-left text-[11px] text-[#EBEBEB] hover:border-[#D3FD50]/50"
          >
            {p.name}
          </button>
          <button onClick={() => exportPresetJson(p)} title="导出 JSON" className="text-[#8a8a93] hover:text-[#EBEBEB]">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setList(deleteCustomPreset(p.id))} title="删除" className="text-[#8a8a93] hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- 背景媒体管理（图片 / 视频 / 无，互斥，可分别移除） ---------- */

function BackgroundMediaRow() {
  const coverUrl = useStore((s) => s.session.coverUrl);
  const bgVideoUrl = useStore((s) => s.session.bgVideoUrl);
  const setSession = useStore((s) => s.setSession);

  /** 与 App.onBgMediaFile 同路：统一入媒体库，会话引用库内 objectUrl */
  const onFile = (f: File) => {
    const kind = f.type.startsWith('video/') ? ('video' as const) : f.type.startsWith('image/') ? ('image' as const) : null;
    if (!kind) return;
    void useMediaLibrary
      .getState()
      .addMedia(kind, f, f.name)
      .then((item) => {
        if (kind === 'video') setSession({ bgVideoUrl: item.objectUrl, coverUrl: null, currentBgId: item.id });
        else setSession({ coverUrl: item.objectUrl, bgVideoUrl: null, currentBgId: item.id });
      });
  };

  const type = bgVideoUrl ? '视频' : coverUrl ? '图片' : '无';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#8a8a93]">当前背景</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] ${bgVideoUrl ? 'bg-[#D3FD50]/15 text-[#D3FD50]' : 'bg-white/[0.08] text-[#EBEBEB]'}`}>
          {type}
        </span>
      </div>
      <div className="flex gap-1.5">
        <label className="flex h-7 flex-1 cursor-pointer items-center justify-center rounded-md border border-white/10 text-[11px] text-[#8a8a93] transition-colors hover:text-[#EBEBEB]">
          上传背景媒体
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) onFile(f);
            }}
          />
        </label>
        {(coverUrl || bgVideoUrl) && (
          <button
            onClick={() => setSession({ coverUrl: null, bgVideoUrl: null, currentBgId: null })}
            className="flex h-7 items-center gap-1 rounded-md border border-white/10 px-2 text-[11px] text-[#8a8a93] transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            移除
          </button>
        )}
      </div>
      {bgVideoUrl && <p className="text-[10px] leading-relaxed text-[#8a8a93]">视频背景与图片互斥；导出时逐帧同步，较慢但逐帧精确。</p>}
    </div>
  );
}

/* ---------- 主面板 ---------- */

export function ControlPanel() {
  const config = useStore((s) => s.config);
  const hasAudio = useStore((s) => s.session.hasAudio);
  const {
    setLayout,
    patchSpectrum,
    patchFx,
    patchTitle,
    patchBg,
    patchProgress,
    patchAnalysis,
  } = useStore.getState();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-white/[0.08] bg-[#111113]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
        <span className="text-[13px] font-semibold tracking-wide text-[#EBEBEB]">
          Wave<span className="text-[#D3FD50]">Craft</span>
        </span>
        <span className="text-[10px] text-[#8a8a93]">音频可视化工作室</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="样式预设" defaultOpen>
          <PresetStrip />
          <CustomPresets />
        </Section>

        <Section title="参数">
          <ParamSlider label="柱数 / 密度" value={config.spectrum.barCount} min={16} max={128} step={1} onChange={(v) => patchSpectrum({ barCount: v })} />
          <ParamSlider label="灵敏度" value={config.spectrum.sensitivity} min={0.2} max={3} step={0.05} onChange={(v) => patchSpectrum({ sensitivity: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="平滑度" value={config.spectrum.smoothing} min={0} max={0.95} step={0.01} onChange={(v) => patchSpectrum({ smoothing: v })} format={(v) => v.toFixed(2)} />
          <Seg
            label="频段映射"
            value={config.spectrum.freqMapping}
            options={[
              { v: 'log' as const, label: '对数' },
              { v: 'linear' as const, label: '线性' },
            ]}
            onChange={(v) => patchSpectrum({ freqMapping: v })}
          />
          <ColorField label="主色" value={config.spectrum.colorPrimary} onChange={(v) => patchSpectrum({ colorPrimary: v })} />
          <ColorField label="辅色" value={config.spectrum.colorSecondary} onChange={(v) => patchSpectrum({ colorSecondary: v })} />
          <ParamSlider label="光晕强度" value={config.spectrum.glow} min={0} max={1} step={0.01} onChange={(v) => patchSpectrum({ glow: v })} format={(v) => v.toFixed(2)} />
          <ToggleRow label="镜像对称" checked={config.spectrum.mirror} onChange={(v) => patchSpectrum({ mirror: v })} />
          <ParamSlider label="线条粗细" value={config.spectrum.lineWidth} min={1} max={10} step={0.5} onChange={(v) => patchSpectrum({ lineWidth: v })} format={(v) => v.toFixed(1)} />
          <ParamSlider label="圆角" value={config.spectrum.roundness} min={0} max={1} step={0.01} onChange={(v) => patchSpectrum({ roundness: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="频谱缩放" value={config.spectrum.scale} min={0.3} max={2} step={0.01} onChange={(v) => patchSpectrum({ scale: v })} format={(v) => `${Math.round(v * 100)}%`} />
          <ParamSlider label="水平位置" value={config.spectrum.offsetX} min={-0.5} max={0.5} step={0.005} onChange={(v) => patchSpectrum({ offsetX: v })} format={(v) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}%`} />
          <ParamSlider label="垂直位置" value={config.spectrum.offsetY} min={-0.5} max={0.5} step={0.005} onChange={(v) => patchSpectrum({ offsetY: v })} format={(v) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}%`} />
          <ToggleRow label="峰值帽（演播室）" checked={config.spectrum.peakCaps} onChange={(v) => patchSpectrum({ peakCaps: v })} />
          <ParamSlider label="倒影强度（演播室）" value={config.spectrum.reflection} min={0} max={1} step={0.01} onChange={(v) => patchSpectrum({ reflection: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="节拍阈值" value={config.analysis.beatThreshold} min={1.3} max={1.5} step={0.01} onChange={(v) => patchAnalysis({ beatThreshold: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="分析平滑" value={config.analysis.analyserSmoothing} min={0} max={0.95} step={0.01} onChange={(v) => patchAnalysis({ analyserSmoothing: v })} format={(v) => v.toFixed(2)} />
        </Section>

        <Section title="特效层">
          <ToggleRow label="启用粒子 / 光晕" checked={config.fx.enabled} onChange={(v) => patchFx({ enabled: v })} />
          <ParamSlider label="粒子数量" value={config.fx.particleCount} min={0} max={200} step={5} onChange={(v) => patchFx({ particleCount: v })} />
          <ColorField label="粒子颜色" value={config.fx.particleColor} onChange={(v) => patchFx({ particleColor: v })} />
          <ParamSlider label="粒子强度" value={config.fx.particleIntensity} min={0} max={1} step={0.01} onChange={(v) => patchFx({ particleIntensity: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="光晕强度" value={config.fx.haloIntensity} min={0} max={1} step={0.01} onChange={(v) => patchFx({ haloIntensity: v })} format={(v) => v.toFixed(2)} />
          <ColorField label="光晕颜色" value={config.fx.haloColor} onChange={(v) => patchFx({ haloColor: v })} />
        </Section>

        <Section title="标题">
          <ToggleRow label="显示标题" checked={config.title.enabled} onChange={(v) => patchTitle({ enabled: v })} />
          <input
            value={config.title.title}
            onChange={(e) => patchTitle({ title: e.target.value })}
            placeholder="标题文本"
            className="h-7 rounded-md border border-white/10 bg-transparent px-2 text-[11px] text-[#EBEBEB] outline-none placeholder:text-[#8a8a93]/60 focus:border-[#D3FD50]/50"
          />
          <input
            value={config.title.artist}
            onChange={(e) => patchTitle({ artist: e.target.value })}
            placeholder="艺术家"
            className="h-7 rounded-md border border-white/10 bg-transparent px-2 text-[11px] text-[#EBEBEB] outline-none placeholder:text-[#8a8a93]/60 focus:border-[#D3FD50]/50"
          />
          <Seg
            label="位置"
            value={config.title.position}
            options={[
              { v: 'top' as TitlePosition, label: '上' },
              { v: 'center' as TitlePosition, label: '中' },
              { v: 'bottom' as TitlePosition, label: '下' },
            ]}
            onChange={(v) => patchTitle({ position: v })}
          />
          <ParamSlider label="字号" value={config.title.fontSize} min={0.02} max={0.09} step={0.001} onChange={(v) => patchTitle({ fontSize: v })} format={(v) => `${Math.round(v * 1080)}px`} />
          <ColorField label="颜色" value={config.title.color} onChange={(v) => patchTitle({ color: v })} />
          <Seg
            label="字体"
            value={config.title.font}
            options={[
              { v: 'sans' as TitleFont, label: '黑体' },
              { v: 'serif' as TitleFont, label: '衬线' },
              { v: 'handwriting' as TitleFont, label: '手写' },
            ]}
            onChange={(v) => patchTitle({ font: v })}
          />
          <Seg
            label="入场动画"
            value={config.title.animation}
            options={[
              { v: 'fade' as TitleAnimation, label: '淡入' },
              { v: 'typewriter' as TitleAnimation, label: '打字机' },
              { v: 'slide' as TitleAnimation, label: '滑入' },
            ]}
            onChange={(v) => patchTitle({ animation: v })}
          />
          <ParamSlider
            label="显示时长（0 = 全程）"
            value={config.title.showDuration}
            min={0}
            max={30}
            step={0.5}
            onChange={(v) => patchTitle({ showDuration: v })}
            format={(v) => (v === 0 ? '全程' : `${v.toFixed(1)}s`)}
          />
          <ParamSlider label="动画时长" value={config.title.animationDuration} min={0.6} max={1} step={0.05} onChange={(v) => patchTitle({ animationDuration: v })} format={(v) => `${v.toFixed(2)}s`} />
        </Section>

        <Section title="背景">
          <BackgroundMediaRow />
          <ParamSlider label="模糊强度" value={config.bg.blur} min={0} max={1} step={0.01} onChange={(v) => patchBg({ blur: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="亮度" value={config.bg.brightness} min={0.2} max={1.5} step={0.01} onChange={(v) => patchBg({ brightness: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="饱和度" value={config.bg.saturation} min={0} max={2} step={0.01} onChange={(v) => patchBg({ saturation: v })} format={(v) => v.toFixed(2)} />
          <ParamSlider label="暗角" value={config.bg.vignette} min={0} max={1} step={0.01} onChange={(v) => patchBg({ vignette: v })} format={(v) => v.toFixed(2)} />
          <div className="border-t border-white/[0.08] pt-3">
            <ToggleRow label="画面进度条" checked={config.progress.enabled} onChange={(v) => patchProgress({ enabled: v })} />
            <div className="h-2" />
            <ToggleRow label="显示时间文本" checked={config.progress.showTime} onChange={(v) => patchProgress({ showTime: v })} />
          </div>
        </Section>

        <Section title="布局与导出" defaultOpen>
          <div className="grid grid-cols-4 gap-1.5">
            {LAYOUT_LIST.map((l) => (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 transition-colors ${
                  config.layout === l.id ? 'border-[#D3FD50] text-[#D3FD50]' : 'border-white/10 text-[#8a8a93] hover:border-white/25'
                }`}
              >
                <span
                  className="block rounded-[2px] border border-current"
                  style={{
                    width: l.id === '16:9' ? 22 : l.id === '9:16' ? 11 : l.id === '1:1' ? 15 : 14,
                    height: l.id === '16:9' ? 12 : l.id === '9:16' ? 20 : l.id === '1:1' ? 15 : 17,
                  }}
                />
                <span className="text-[9px]">{l.id}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setExportOpen(true)}
            disabled={!hasAudio}
            className="mt-1 flex h-9 items-center justify-center gap-2 rounded-md bg-[#D3FD50] text-[13px] font-medium text-black transition-opacity hover:opacity-85 disabled:opacity-25"
          >
            <Download className="h-4 w-4" />
            导出 MP4
          </button>
        </Section>
      </div>

      {exportOpen && <ExportDialog onClose={() => setExportOpen(false)} />}
    </aside>
  );
}
