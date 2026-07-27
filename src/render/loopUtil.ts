// 无缝循环工具：把任意周期/频率量化到能整除循环时长，保证首尾帧视觉连续
// 用于 8 秒无缝循环导出（Spotify Canvas 模式）。

/**
 * 周期量化：返回一个能整除 loopPeriod、且最接近 desired 的周期。
 * 例：loop=8, desired=7 → 8/round(8/7)=8 → 呼吸节奏略变慢但完美循环。
 */
export function qp(desired: number, loopPeriod: number | undefined): number {
  if (!loopPeriod || loopPeriod <= 0) return desired;
  const cycles = Math.max(1, Math.round(loopPeriod / desired));
  return loopPeriod / cycles;
}

/**
 * 角速度量化（rad/s → 每循环整数圈）：
 * 把 `t * w` 形式的相位替换为 `t * qw(w, loop)`，保证 t=loop 时相位差为 2π 整数倍。
 */
export function qw(omega: number, loopPeriod: number | undefined): number {
  if (!loopPeriod || loopPeriod <= 0) return omega;
  const cycles = Math.max(1, Math.round((omega * loopPeriod) / (Math.PI * 2)));
  return (cycles * Math.PI * 2) / loopPeriod;
}

/**
 * 频率量化（Hz → 每循环整数次）：用于 `(phase + t * speed) % 1` 形式的循环相位。
 */
export function qhz(speed: number, loopPeriod: number | undefined): number {
  if (!loopPeriod || loopPeriod <= 0) return speed;
  const cycles = Math.max(1, Math.round(speed * loopPeriod));
  return cycles / loopPeriod;
}
