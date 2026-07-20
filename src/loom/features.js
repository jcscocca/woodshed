export function midiFromFreq(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

export function makeFrame(t, detected, level, centroid) {
  const pitched = detected && detected.freq > 0;
  return {
    t,
    midi: pitched ? midiFromFreq(detected.freq) : null,
    clarity: pitched ? Math.max(0, Math.min(1, detected.clarity)) : 0,
    level,
    centroid,
    onset: false,
  };
}
