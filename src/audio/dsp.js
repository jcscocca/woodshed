// ============================================================
// Pure audio DSP — no browser, no React. This is the code the
// tuner/listener actually runs; useListener.js is a thin shell
// that feeds microphone frames into these functions. Keeping the
// math here (the "humble object" pattern) is what lets it be
// tested headlessly against real recorded audio in Node.
// ============================================================

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// RMS level of a frame.
export function rms(buf) {
  let s = 0;
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
  return Math.sqrt(s / buf.length);
}

// Classic autocorrelation pitch detector (returns { freq, rms }; freq is -1 if
// the frame is too quiet or no clear period is found). Same algorithm family as
// cwilso/PitchDetect, which is what the app shipped with.
export function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  const level = rms(buf);
  if (level < 0.01) return { freq: -1, rms: level };

  let r1 = 0, r2 = SIZE - 1;
  const thr = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thr) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thr) { r2 = SIZE - i; break; }
  const b = buf.slice(r1, r2);
  SIZE = b.length;
  if (SIZE < 8) return { freq: -1, rms: level };

  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE - i; j++) c[i] += b[j] * b[j + i];

  let d = 0;
  while (d < SIZE - 1 && c[d] > c[d + 1]) d++;
  let max = -1, pos = -1;
  for (let i = d; i < SIZE; i++) if (c[i] > max) { max = c[i]; pos = i; }
  let T0 = pos;
  if (T0 > 0 && T0 < SIZE - 1) {
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, bb = (x3 - x1) / 2;
    if (a) T0 = T0 - bb / (2 * a);
  }
  if (T0 <= 0) return { freq: -1, rms: level };
  return { freq: sampleRate / T0, rms: level };
}

// Frequency -> nearest equal-tempered note (A440), with cents offset.
export function noteFromFrequency(freq) {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const refF = 440 * Math.pow(2, (midi - 69) / 12);
  return {
    midi,
    name: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    cents: Math.floor(1200 * Math.log2(freq / refF)),
  };
}

// AMDF (Average Magnitude Difference Function) pitch detector. Two things make
// it robust where the naive autocorrelation above failed real recordings:
//  1. Each frame is normalized to unit level, so a quietly-played or
//     far-from-the-mic note is detected the same as a loud one. (The old
//     rms<0.01 gate silently dropped quiet real notes — e.g. acoustic-guitar
//     E2/E4 and piano C4 in testing.)
//  2. It gates on *periodicity*, not loudness: a frame is only accepted if the
//     AMDF dip is clearly below the average, so room noise and hiss can't
//     produce a phantom note.
// AMDF detector that also returns its periodicity "clarity" (how far the dip
// sits below the mean — a 0..~1 confidence). detectPitch keeps its old contract
// (just the frequency) by reading .freq off this.
export function detectPitchDetailed(buf, sampleRate, { minF = 40, maxF = 1500, sensitivity = 0.1, clarity = 0.35 } = {}) {
  let pk = 0;
  for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > pk) pk = a; }
  if (pk < 0.004) return { freq: -1, clarity: 0 }; // genuine silence
  const b = Float32Array.from(buf, (v) => v / pk); // normalize to unit peak

  const n = b.length;
  const minLag = Math.max(2, Math.floor(sampleRate / maxF));
  const maxLag = Math.min(n - 1, Math.floor(sampleRate / minF));
  if (maxLag <= minLag) return { freq: -1, clarity: 0 };

  let lo = Infinity, hi = -Infinity, mean = 0, cnt = 0;
  const d = new Float64Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < n; i++) sum += Math.abs(b[i] - b[i + lag]);
    sum /= (n - lag);
    d[lag] = sum; mean += sum; cnt++;
    if (sum < lo) lo = sum;
    if (sum > hi) hi = sum;
  }
  mean /= cnt;
  if (hi <= lo) return { freq: -1, clarity: 0 };

  const thresh = lo + sensitivity * (hi - lo);
  let lag = minLag;
  while (lag <= maxLag && d[lag] > thresh) lag++;
  if (lag > maxLag) return { freq: -1, clarity: 0 };
  while (lag + 1 <= maxLag && d[lag + 1] < d[lag]) lag++;

  const clarityVal = (mean - d[lag]) / mean;
  if (clarityVal < clarity) return { freq: -1, clarity: clarityVal }; // not periodic enough

  let T = lag; // parabolic interpolation for sub-sample accuracy
  if (lag > minLag && lag < maxLag) {
    const a = d[lag - 1], bb = d[lag], c = d[lag + 1];
    const denom = a - 2 * bb + c;
    if (denom) T = lag + 0.5 * (a - c) / denom;
  }
  return { freq: T > 0 ? sampleRate / T : -1, clarity: clarityVal };
}

// Frequency in Hz, or -1 when silent/unpitched. Thin wrapper over the detailed form.
export function detectPitch(buf, sampleRate, opts) {
  return detectPitchDetailed(buf, sampleRate, opts).freq;
}

// Onset detector: an EWMA of the level, with a relative threshold and a
// refractory gap. Stateful by design (it runs frame-by-frame on the live mic),
// but pure — feed it the same frames offline and you get the same onsets.
export function createOnsetTracker({ floor = 0.03, ratio = 1.6, refractoryMs = 160 } = {}) {
  let avg = 0, last = -Infinity;
  return {
    step(level, tMs) {
      avg = avg * 0.92 + level * 0.08;
      if (level > floor && level > avg * ratio && tMs - last > refractoryMs) {
        last = tMs;
        return true;
      }
      return false;
    },
  };
}

// Onset timestamps (ms) -> tempo estimate via the median inter-onset interval.
export function bpmFromOnsets(times, { min = 40, max = 240 } = {}) {
  if (times.length < 4) return null;
  const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
  const med = gaps[Math.floor(gaps.length / 2)];
  const bpm = Math.round(60000 / med);
  return bpm >= min && bpm <= max ? bpm : null;
}
