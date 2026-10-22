// 主题套装选择器：按 华丽/简约/科技/高级 分组的实时缩略图网格。
// 缩略图用伪音频帧 + 程序生成的占位专辑图渲染完整主题（含标题样式与专辑图形状），
// 点击应用整套配置（保留用户当前标题文本与画面比例）。
import { useEffect, useRef } from 'react';
import { renderFrame } from '@/render/renderer';
import { fakeFrame } from '@/render/fakeFrame';
import { THEME_CATEGORIES, THEME_PACKS, type ThemePack } from '@/state/presets';
import { useStore } from '@/state/store';

/** 程序生成的占位专辑图（渐变 + 高光），让缩略图能展示专辑图图层的形状/旋转/描边 */
let dummyArt: HTMLImageElement | null = null;
function getDummyArt(): HTMLImageElement | null {
  if (dummyArt) return dummyArt.complete ? dummyArt : null;
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 160;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 160, 160);
  grad.addColorStop(0, '#3a3a42');
  grad.addColorStop(0.5, '#6b5b7a');
  grad.addColorStop(1, '#23232a');
  g.fillStyle = grad;
  g.fillRect(0, 0, 160, 160);
  // 斜向高光
  const hl = g.createLinearGradient(20, 0, 100, 160);
  hl.addColorStop(0, 'rgba(255,255,255,0.22)');
  hl.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.fillStyle = hl;
  g.fillRect(0, 0, 160, 160);
  // 装饰圆
  g.beginPath();
  g.arc(108, 52, 26, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.14)';
  g.fill();
  const img = new Image();
  img.src = c.toDataURL('image/png');
  dummyArt = img;
  return img.complete ? img : null;
}

/** 单个主题缩略图卡片（实时渲染） */
function ThemeCard({ pack, onApply }: { pack: ThemePack; onApply: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const t = (performance.now() - t0) / 1000;
      // 缩略图固定 16:9；示例标题展示主题字体/颜色；进度条关闭
      const cfg = {
        ...pack.config,
        layout: '16:9' as const,
        title: { ...pack.config.title, enabled: true, title: '歌名', artist: '艺术家', startOffset: 0 },
        progress: { ...pack.config.progress, enabled: false },
      };
      renderFrame(ctx, t, fakeFrame(t), cfg, { duration: 0, albumArt: getDummyArt() ?? undefined });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [pack]);

  return (
    <button
      onClick={onApply}
      className="group shrink-0 overflow-hidden rounded-md border border-white/10 text-left transition-all duration-200 hover:border-[#D3FD50]/60"
    >
      <canvas
        ref={canvasRef}
        width={176}
        height={99}
        className="block h-[62px] w-[110px] transition-[transform,filter] duration-200 group-hover:scale-[1.03] group-hover:brightness-110"
      />
      <span className="block px-1.5 py-1 text-[10px] text-[#8a8a93] group-hover:text-[#EBEBEB]">{pack.name}</span>
    </button>
  );
}

export function ThemeGrid() {
  const applyConfig = useStore((s) => s.applyConfig);
  const currentConfig = useStore((s) => s.config);

  const applyTheme = (pack: ThemePack) => {
    // 应用主题：保留用户当前标题文本、艺术家与画面比例
    applyConfig({
      ...pack.config,
      layout: currentConfig.layout,
      title: {
        ...pack.config.title,
        title: currentConfig.title.title,
        artist: currentConfig.title.artist,
        startOffset: currentConfig.title.startOffset,
        freeX: null, // 主题自带排版，清掉自由定位
        freeY: null,
      },
      albumArt: { ...pack.config.albumArt, x: null, y: null, size: null },
    });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {THEME_CATEGORIES.map((cat) => (
        <div key={cat} className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.12em] text-[#8a8a93]/80">{cat}</span>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_PACKS.filter((p) => p.category === cat).map((p) => (
              <ThemeCard key={p.id} pack={p} onApply={() => applyTheme(p)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
