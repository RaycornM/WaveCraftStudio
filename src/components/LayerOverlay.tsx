// 图层直接操纵层：标题 / 专辑图在预览画布上的选中、拖拽移动、右下角手柄缩放。
// 纯 DOM 覆盖层（不进 renderFrame），不会影响导出画面。
import { useEffect, useRef, useState } from 'react';
import { LAYOUTS } from '@/render/layouts';
import { renderAssetsStore } from '@/state/assets';
import { useStore } from '@/state/store';

type LayerId = 'title' | 'albumArt';

interface DragState {
  layer: LayerId;
  mode: 'move' | 'scale';
  /** move：抓取点与锚点的比例坐标差 */
  grabDX: number;
  grabDY: number;
  /** scale：起点到锚点的距离（px）与起始尺寸 */
  anchorX: number;
  anchorY: number;
  startDist: number;
  origSize: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function LayerOverlay({ wrapRef }: { wrapRef: React.RefObject<HTMLDivElement | null> }) {
  const config = useStore((s) => s.config);
  // 订阅会影响图层是否存在的会话字段（专辑图源、音频加载），驱动重渲染
  const albumArtUrl = useStore((s) => s.session.albumArtUrl);
  const embeddedCover = useStore((s) => s.session.meta?.embeddedCoverUrl);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState<LayerId | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // 包裹元素（= 画布 CSS 尺寸）随布局/窗口缩放
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wrapRef]);

  // Esc 取消选中
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { w: W, h: H } = size;
  if (W <= 0 || H <= 0) return <div className="absolute inset-0" />;

  const layout = LAYOUTS[config.layout];
  const shortCss = Math.min(W, H);

  /* ---------- 图层几何（CSS px，与 renderFrame 的比例换算保持一致） ---------- */

  // 专辑图
  const aa = config.albumArt;
  const aaActive = aa.enabled && !!(renderAssetsStore.albumArtImage || albumArtUrl || embeddedCover);
  const aaCx = (aa.x ?? layout.cover.x + layout.cover.w / 2) * W;
  const aaCy = (aa.y ?? layout.cover.y + layout.cover.h / 2) * H;
  const aaTemplateRatio = Math.min(layout.cover.w * W, layout.cover.h * H) / shortCss;
  const aaRatio = aa.size ?? aaTemplateRatio;
  const aaSize = aaRatio * shortCss;

  // 标题
  const tp = config.title;
  const titleActive = tp.enabled && tp.title.trim().length > 0;
  const freePos = tp.freeX != null && tp.freeY != null;
  const posOffset = tp.position === 'top' ? -0.06 : tp.position === 'bottom' ? 0.07 : 0;
  const tAnchorX = (freePos ? tp.freeX! : layout.titleX) * W;
  const tAnchorY = (freePos ? tp.freeY! : clamp(layout.titleY + posOffset, 0.06, 0.95)) * H;
  const tAlign = freePos ? tp.align : layout.titleAlign;
  const fs = tp.fontSize * shortCss;
  const titleLen = tp.title.trim().length;
  const artistLen = tp.artist.trim().length;
  const maxW = W * (tAlign === 'left' ? 0.48 : 0.86);
  const estW = Math.min(Math.max(titleLen * fs * 0.85, artistLen * fs * 0.45, fs), maxW);
  const estH = fs * (artistLen > 0 ? 2.1 : 1.4);
  const tBoxX = tAlign === 'center' ? tAnchorX - estW / 2 : tAlign === 'right' ? tAnchorX - estW : tAnchorX;
  const tBoxY = tAnchorY - fs * 0.7;

  /* ---------- 拖拽 ---------- */

  const beginDrag = (e: React.PointerEvent, state: DragState) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = state;

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      const el = wrapRef.current;
      if (!d || !el) return;
      const rect = el.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const st = useStore.getState();

      if (d.mode === 'move') {
        const nx = clamp(px / rect.width - d.grabDX, 0, 1);
        const ny = clamp(py / rect.height - d.grabDY, 0, 1);
        if (d.layer === 'title') st.patchTitle({ freeX: nx, freeY: ny });
        else st.patchAlbumArt({ x: nx, y: ny });
      } else {
        const dist = Math.max(8, Math.hypot(px - d.anchorX, py - d.anchorY));
        const ratio = dist / d.startDist;
        if (d.layer === 'title') {
          st.patchTitle({ fontSize: clamp(d.origSize * ratio, 0.01, 0.15) });
        } else {
          st.patchAlbumArt({ size: clamp(d.origSize * ratio, 0.05, 1.5) });
        }
      }
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startMove = (e: React.PointerEvent, layer: LayerId) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    setSelected(layer);
    if (layer === 'title') {
      const st = useStore.getState();
      const anchorRx = tAnchorX / W;
      const anchorRy = tAnchorY / H;
      // 首次拖拽时继承当前布局的对齐方式，视觉位置不跳变
      if (!freePos) st.patchTitle({ align: layout.titleAlign });
      beginDrag(e, {
        layer,
        mode: 'move',
        grabDX: rx - anchorRx,
        grabDY: ry - anchorRy,
        anchorX: 0,
        anchorY: 0,
        startDist: 1,
        origSize: 0,
      });
    } else {
      beginDrag(e, {
        layer,
        mode: 'move',
        grabDX: rx - aaCx / W,
        grabDY: ry - aaCy / H,
        anchorX: 0,
        anchorY: 0,
        startDist: 1,
        origSize: 0,
      });
    }
  };

  const startScale = (e: React.PointerEvent, layer: LayerId) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const anchorX = layer === 'title' ? tAnchorX : aaCx;
    const anchorY = layer === 'title' ? tAnchorY : aaCy;
    beginDrag(e, {
      layer,
      mode: 'scale',
      grabDX: 0,
      grabDY: 0,
      anchorX,
      anchorY,
      startDist: Math.max(8, Math.hypot(px - anchorX, py - anchorY)),
      origSize: layer === 'title' ? config.title.fontSize : aaRatio,
    });
  };

  /* ---------- 命中测试 ---------- */

  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // 专辑图优先（视觉层级更高）
    if (aaActive && Math.abs(px - aaCx) <= aaSize / 2 && Math.abs(py - aaCy) <= aaSize / 2) {
      startMove(e, 'albumArt');
      return;
    }
    if (titleActive && px >= tBoxX && px <= tBoxX + estW && py >= tBoxY && py <= tBoxY + estH) {
      startMove(e, 'title');
      return;
    }
    setSelected(null);
  };

  /* ---------- 渲染 ---------- */

  const selectionBox = (layer: LayerId, x: number, y: number, w: number, h: number) => (
    <div
      key={layer}
      className="pointer-events-none absolute border border-[#D3FD50]/90"
      style={{
        left: `${(x / W) * 100}%`,
        top: `${(y / H) * 100}%`,
        width: `${(w / W) * 100}%`,
        height: `${(h / H) * 100}%`,
      }}
    >
      <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-[#D3FD50] px-1 py-px text-[9px] font-medium text-black">
        {layer === 'title' ? '标题' : '专辑图'}
      </span>
      <div
        data-testid={`scale-handle-${layer}`}
        onPointerDown={(e) => startScale(e, layer)}
        className="pointer-events-auto absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-[3px] bg-[#D3FD50] shadow"
        title="拖拽缩放"
      />
    </div>
  );

  return (
    <div className="absolute inset-0 select-none" onPointerDown={onOverlayPointerDown}>
      {selected === 'albumArt' && aaActive && selectionBox('albumArt', aaCx - aaSize / 2, aaCy - aaSize / 2, aaSize, aaSize)}
      {selected === 'title' && titleActive && selectionBox('title', tBoxX, tBoxY, estW, estH)}
    </div>
  );
}
