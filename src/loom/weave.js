export const WEAVE_TUNING = {
  bleedWindowMs: 30,
  bleedLevelMax: 0.06,
  shearWindow: 8,
  shearMaxMs: 90,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function alignment(onsetTimeMs, beatTimesMs, offsetMs) {
  if (!Number.isFinite(onsetTimeMs) || !Array.isArray(beatTimesMs)) return null;
  const correction = Number.isFinite(offsetMs) ? offsetMs : 0;
  let nearest = null;

  beatTimesMs.forEach((beatTime, beatIndex) => {
    if (!Number.isFinite(beatTime)) return;
    const deltaMs = onsetTimeMs - (beatTime + correction);
    if (!nearest || Math.abs(deltaMs) < Math.abs(nearest.deltaMs)) {
      nearest = { deltaMs, beatIndex };
    }
  });

  return nearest && Math.abs(nearest.deltaMs) <= 400 ? nearest : null;
}

export function isBleed(onsetTimeMs, level, beatTimesMs, offsetMs) {
  if (!Number.isFinite(level) || level >= WEAVE_TUNING.bleedLevelMax) return false;
  const nearest = alignment(onsetTimeMs, beatTimesMs, offsetMs);
  return !!nearest && Math.abs(nearest.deltaMs) <= WEAVE_TUNING.bleedWindowMs;
}

export function shearState(prev, deltaMs) {
  const deltas = [
    ...(Array.isArray(prev?.deltas) ? prev.deltas : []),
    Number.isFinite(deltaMs) ? deltaMs : 0,
  ].slice(-WEAVE_TUNING.shearWindow);
  const meanMs = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
  return {
    deltas,
    meanMs,
    shear: clamp(meanMs / WEAVE_TUNING.shearMaxMs, -1, 1),
  };
}

export function weaveColumns(beatTimesMs, nowMs, viewSpanMs) {
  if (!Array.isArray(beatTimesMs) || !Number.isFinite(nowMs) || !Number.isFinite(viewSpanMs) || viewSpanMs <= 0) return [];
  const windowStart = nowMs - viewSpanMs;
  return beatTimesMs
    .filter((beatTime) => Number.isFinite(beatTime) && beatTime >= windowStart && beatTime <= nowMs)
    .map((beatTime) => ({
      xRatio: (beatTime - windowStart) / viewSpanMs,
      ageMs: nowMs - beatTime,
    }));
}
