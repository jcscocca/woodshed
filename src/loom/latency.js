export const CALIBRATION = { clicks: 8, intervalMs: 500 };

export function estimateOffset(clickTimesMs, onsetTimesMs) {
  const offsets = [];
  for (const click of clickTimesMs) {
    let nearest = null;
    for (const onset of onsetTimesMs) {
      if (onset <= click || onset > click + 250) continue;
      if (nearest == null || onset < nearest) nearest = onset;
    }
    if (nearest != null) offsets.push(nearest - click);
  }
  if (offsets.length < 5) return null;
  offsets.sort((a, b) => a - b);
  const mid = Math.floor(offsets.length / 2);
  const median = offsets.length % 2 ? offsets[mid] : (offsets[mid - 1] + offsets[mid]) / 2;
  return Math.round(median);
}

export function loadOffset() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("loom.latencyMs");
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch { return null; }
}

export function saveOffset(ms) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem("loom.latencyMs", String(ms)); } catch { /* ignore */ }
}
