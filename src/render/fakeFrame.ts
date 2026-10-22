// 伪音频帧生成：正弦组合 + 假节拍，供预设/主题缩略图在无真实音频时保持动画。
import type { AudioFrameData } from '@/types';

export function fakeFrame(t: number): AudioFrameData {
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
