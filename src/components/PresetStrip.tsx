// 预设横向缩略图条：小 canvas 实时绘制（伪音频数据驱动），点击切换预设
import { useEffect, useRef } from 'react';
import { renderFrame } from '@/render/renderer';
import { BUILTIN_PRESETS } from '@/state/presets';
import { useStore } from '@/state/store';
import type { AudioFrameData } from '@/types';

/** 生成伪音频帧（正弦组合 + 假节拍），让缩略图动起来 */
function fakeFrame(t: number): AudioFrameData {
  const n = 512;
  const spectrum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    spectrum[i] =
      0.55 * Math.exp(-x * 5) * (0.6 + 0.4 * Math.sin(t * 2.1 + x * 9)) +
      0.25 * Math.abs(Math.sin(x * 22 + t * 3.3));
  }
  const beatPhase = t % 0.85;
  const beat = Math.exp(-beatPhase * 6);
  return {
    t,
    spectrum,
    bass: 0.5 + 0.4 * Math.sin(t * 1.7),
    mid: 0.4 + 0.3 * Math.sin(t * 2.3 + 1),
    high: 0.3 + 0.25 * Math.sin(t * 3.1 + 2),
    level: 0.45,
    beat,
  };
}

export function PresetStrip() {
  const activePreset = useStore((s) => s.config.preset);
  const applyConfig = useStore((s) => s.applyConfig);
  const currentConfig = useStore((s) => s.config);
  const refs = useRef<Array<HTMLCanvasElement | null>>([]);
  const activeRef = useRef(activePreset);
  activeRef.current = activePreset;

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const t = (performance.now() - t0) / 1000;
      BUILTIN_PRESETS.forEach((p, i) => {
        const canvas = refs.current[i];
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // 缩略图固定 16:9 构图，展示预设风格
        const cfg = { ...p.config, layout: '16:9' as const, title: { ...p.config.title, enabled: false }, progress: { ...p.config.progress, enabled: false } };
        renderFrame(ctx, t, fakeFrame(t), cfg, { duration: 0 });
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {BUILTIN_PRESETS.map((p, i) => {
        const active = p.id === activePreset;
        return (
          <button
            key={p.id}
            onClick={() => {
              // 应用预设：保留用户当前标题文本与布局
              applyConfig({
                ...p.config,
                layout: currentConfig.layout,
                title: { ...p.config.title, title: currentConfig.title.title, artist: currentConfig.title.artist },
              });
            }}
            className={`group shrink-0 overflow-hidden rounded-md border transition-all duration-200 ${
              active ? 'border-[#D3FD50] ring-1 ring-[#D3FD50]/40' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <canvas
              ref={(el) => {
                refs.current[i] = el;
              }}
              width={144}
              height={81}
              className="block h-[54px] w-[96px] transition-[transform,filter] duration-200 group-hover:scale-[1.04] group-hover:brightness-110"
            />
            <span
              className={`block py-1 text-center text-[10px] ${active ? 'text-[#D3FD50]' : 'text-[#8a8a93] group-hover:text-[#EBEBEB]'}`}
            >
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
