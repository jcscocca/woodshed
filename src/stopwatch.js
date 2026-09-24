// Wall-clock stopwatch state { startedAt: ms | null, acc: ms }: survives hidden
// tabs and unmounts because time is read from the clock, not counted.
export const RESET_WATCH = { startedAt: null, acc: 0 };

export const toggleWatch = (w, now = Date.now()) =>
  w.startedAt != null ? { startedAt: null, acc: w.acc + now - w.startedAt } : { startedAt: now, acc: w.acc };

export const elapsedSec = (w, now = Date.now()) =>
  Math.floor((w.acc + (w.startedAt != null ? now - w.startedAt : 0)) / 1000);
