// 播放状态（rAF 循环写入，TransportBar 订阅；currentTime 节流 ~15Hz）
import { create } from 'zustand';

interface PlaybackState {
  playing: boolean;
  currentTime: number;
  set: (p: Partial<PlaybackState>) => void;
}

export const usePlayback = create<PlaybackState>((set) => ({
  playing: false,
  currentTime: 0,
  set: (p) => set(p),
}));
