// 冒烟测试入口（临时文件，测完删除）：
// T5 演播室预设：鼓点序列驱动渲染 → 峰值帽悬浮/倒影像素校验 + 页面截图（等 driver __go=1 再放行 T6）
// T6 裁剪导出：5s WAV 裁 [1s,3s) → MP4 时长≈2s、vide+soun 双轨
import { renderFrame } from '@/render/renderer';
import { BUILTIN_PRESETS } from '@/state/presets';
import { exportVideo } from '@/export/exporter';
import type { AudioFrameData, VisualConfig } from '@/types';

declare global {
  interface Window {
    __r: Record<string, unknown>;
    __e2e?: string;
    __err?: string;
    __go?: number;
  }
}

const R: Record<string, unknown> = {};
window.__r = R;

/** 生成带鼓点的 WAV（每 0.5s 一个低频脉冲 + 持续中频） */
function makeBeatWav(seconds: number): Blob {
  const sr = 22050;
  const n = Math.floor(seconds * sr);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const ws = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  ws(0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  ws(36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const beatPhase = t % 0.5;
    const kick = beatPhase < 0.12 ? Math.sin(t * 55 * 2 * Math.PI) * Math.exp(-beatPhase * 25) : 0;
    const tone = 0.25 * Math.sin(t * 440 * 2 * Math.PI) + 0.15 * Math.sin(t * 1320 * 2 * Math.PI);
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, kick * 0.9 + tone)) * 32767, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

/** MP4 box 解析（ftyp/moov/mdat、hdlr、mvhd 时长） */
function parseMp4(buf: ArrayBuffer) {
  const v = new DataView(buf);
  const str = (o: number, n: number) => {
    let s = '';
    for (let i = 0; i < n; i++) s += String.fromCharCode(v.getUint8(o + i));
    return s;
  };
  const boxes: string[] = [];
  const handlers: string[] = [];
  let mvhdDuration = 0;
  let mvhdTimescale = 1;
  const walk = (start: number, end: number, depth: number) => {
    let p = start;
    while (p + 8 <= end) {
      const size = v.getUint32(p);
      const type = str(p + 4, 4);
      if (size < 8 || p + size > end) break;
      if (depth === 0) boxes.push(type);
      if (type === 'hdlr') handlers.push(str(p + 16, 4));
      if (type === 'mvhd') {
        const ver = v.getUint8(p + 8);
        if (ver === 1) {
          mvhdTimescale = v.getUint32(p + 28);
          mvhdDuration = Number(v.getBigUint64(p + 32));
        } else {
          mvhdTimescale = v.getUint32(p + 20);
          mvhdDuration = v.getUint32(p + 24);
        }
      }
      if (type === 'moov' || type === 'trak' || type === 'mdia') walk(p + 8, p + size, depth + 1);
      p += size;
    }
  };
  walk(0, buf.byteLength, 0);
  return { boxes, handlers, durationSec: mvhdDuration / mvhdTimescale, bytes: buf.byteLength };
}

/** 鼓点假帧：每 0.5s 一次节拍脉冲 */
function beatFrame(t: number): AudioFrameData {
  const n = 512;
  const spectrum = new Float32Array(n);
  const beatPhase = t % 0.5;
  const kickEnv = Math.exp(-beatPhase * 9);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    spectrum[i] =
      kickEnv * 0.9 * Math.exp(-x * 6) +
      0.35 * Math.exp(-x * 2.2) * (0.6 + 0.4 * Math.sin(t * 2 + x * 10)) +
      0.12 * Math.abs(Math.sin(x * 25 + t * 3));
  }
  const beat = beatPhase < 0.05 ? 1 : Math.exp(-(beatPhase - 0.05) * 8);
  return { t, spectrum, bass: Math.min(1, kickEnv), mid: 0.5, high: 0.35, level: 0.55, beat };
}

async function main() {
  // ---------- T5 演播室预设渲染 ----------
  const studio = BUILTIN_PRESETS.find((p) => p.id === 'studio');
  if (!studio) throw new Error('studio 预设未注册');
  const W = 1280;
  const H = 720;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;';
  document.body.style.margin = '0';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  const cfg: VisualConfig = {
    ...studio.config,
    layout: '16:9',
    title: { ...studio.config.title, enabled: true, title: 'Studio Smoke', artist: 'WaveCraft' },
  };
  // 连续渲染到 t=2.7s（鼓点后 0.2s：柱体回落中、峰值帽仍悬浮）
  const FRAMES = Math.round(2.7 * 60);
  for (let i = 0; i <= FRAMES; i++) {
    const t = i / 60;
    renderFrame(ctx, t, beatFrame(t), cfg, { duration: 2.7 });
  }

  // 像素校验：区域 y≈536、baseY≈657、倒影区 657~691（@1280×720）
  const img = ctx.getImageData(0, 0, W, H).data;
  const isBlue = (px: number) => img[px + 2] > 150 && img[px + 1] > 120 && img[px + 2] > img[px];
  let blueCount = 0;
  for (let p = 0; p < img.length; p += 4) if (isBlue(p)) blueCount++;

  // 峰值帽悬浮校验：扫全部列，统计"帽（最上方亮蓝点）与柱顶（连续亮蓝段起点）间隙 >4px"的柱列数
  let floatingCols = 0;
  let sampleCapY = -1;
  let sampleTopY = -1;
  for (let colX = Math.round(W * 0.06); colX < Math.round(W * 0.95); colX++) {
    let cCap = -1;
    let cTop = -1;
    let gapRun = 0;
    for (let yy = Math.round(H * 0.55); yy < Math.round(H * 0.92); yy++) {
      const px = (yy * W + colX) * 4;
      if (isBlue(px)) {
        if (cCap < 0) cCap = yy;
        if (cCap >= 0 && gapRun > 3 && cTop < 0) cTop = yy;
        gapRun = 0;
      } else if (cCap >= 0 && cTop < 0) {
        gapRun++;
      }
    }
    if (cCap > 0 && cTop > 0 && cTop - cCap > 4) {
      floatingCols++;
      if (sampleCapY < 0) {
        sampleCapY = cCap;
        sampleTopY = cTop;
      }
    }
  }

  // 倒影校验：基线（≈657 @720p）以下倒影区有蓝色微光（倒影 alpha 低，用低阈值 b>r+6）
  let refCount = 0;
  for (let yy = 662; yy < 692; yy++) {
    for (let xx = Math.round(W * 0.1); xx < Math.round(W * 0.9); xx++) {
      const px = (yy * W + xx) * 4;
      if (img[px + 2] > 25 && img[px + 2] > img[px] + 6) refCount++;
    }
  }

  R.t5 = {
    presetRegistered: true,
    bluePixels: blueCount,
    floatingCols,
    sampleCapY,
    sampleTopY,
    capFloats: floatingCols >= 5,
    reflectionPixels: refCount,
    hasReflection: refCount > 50,
  };
  // canvas 留在页面供截图；等 driver 放行（__go=1）再跑 T6
  window.__e2e = 't5-done';
  for (let i = 0; i < 600 && window.__go !== 1; i++) {
    await new Promise((r) => setTimeout(r, 200));
  }

  // ---------- T6 裁剪导出 ----------
  const audioCtx = new AudioContext();
  const wav = makeBeatWav(5);
  const audioBuffer = await audioCtx.decodeAudioData(await wav.arrayBuffer());
  void audioCtx.close();
  const blob = await exportVideo({
    audioBuffer,
    config: { ...cfg, title: { ...cfg.title, enabled: false } },
    assets: { duration: 2 },
    settings: { resolution: '720p', fps: 30, bitrate: 8, mode: 'trim', loopStart: 0, trimStart: 1, trimEnd: 3 },
    start: 1,
    duration: 2,
    onProgress: () => {},
  }).promise;
  const mp4 = parseMp4(await blob.arrayBuffer());
  R.t6 = {
    bytes: mp4.bytes,
    boxes: mp4.boxes,
    handlers: mp4.handlers,
    durationSec: Math.round(mp4.durationSec * 100) / 100,
    hasVide: mp4.handlers.includes('vide'),
    hasSoun: mp4.handlers.includes('soun'),
    durationOk: Math.abs(mp4.durationSec - 2) < 0.3,
  };

  window.__e2e = 'done';
}

main().catch((e) => {
  window.__err = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
  window.__e2e = 'error';
});
