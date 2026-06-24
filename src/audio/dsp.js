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

// In-place iterative radix-2 FFT (Cooley–Tukey). re/im are Float64Array of equal
// length, a power of two; transformed in place. Pure — same input, same output,
// so the spectral detector below is testable headlessly.
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { const tr = re[i]; re[i] = re[j]; re[j] = tr; const ti = im[i]; im[i] = im[j]; im[j] = ti; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + half], bi = im[i + k + half];
        const vr = br * cr - bi * ci, vi = br * ci + bi * cr;
        re[i + k] = ar + vr; im[i + k] = ai + vi;
        re[i + k + half] = ar - vr; im[i + k + half] = ai - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
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

// Spectral pitch detector for multi-reed (musette accordion) sound, where the
// time-domain AMDF fails: 2–3 detuned reeds per note beat with no single period.
// Hann-window + zero-padded FFT, Harmonic Product Spectrum to find the
// fundamental (and kill octave errors), then the magnitude-weighted centroid of
// the detuned cluster (±50 cents) as the center pitch. Same { freq, clarity }
// contract as detectPitchDetailed. clarity is normalized so a clear note clears
// the note-stream floor (0.5).
export function detectPitchSpectral(buf, sampleRate, { minF = 40, maxF = 1500 } = {}) {
  let pk = 0;
  for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > pk) pk = a; }
  if (pk < 0.004) return { freq: -1, clarity: 0 };
  if (buf.length < 2) return { freq: -1, clarity: 0 }; // guard the Hann's (M-1) divisor

  const N = 8192, half = N >> 1;
  const re = new Float64Array(N), im = new Float64Array(N);
  const M = Math.min(buf.length, N);
  for (let i = 0; i < M; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (M - 1)); re[i] = buf[i] * w; }
  fft(re, im);

  const mag = new Float64Array(half);
  let magMean = 0;
  for (let b = 0; b < half; b++) { mag[b] = Math.hypot(re[b], im[b]); magMean += mag[b]; }
  magMean /= half;
  if (magMean <= 0) return { freq: -1, clarity: 0 };

  const binToFreq = (b) => (b * sampleRate) / N;
  const minBin = Math.max(1, Math.floor((minF * N) / sampleRate));
  const maxBin = Math.min(half - 1, Math.ceil((maxF * N) / sampleRate));

  // Find the spectral peak in range — this is the strongest individual frequency.
  let peakBin = minBin;
  for (let b = minBin + 1; b <= maxBin; b++) { if (mag[b] > mag[peakBin]) peakBin = b; }

  // Harmonic Product Spectrum: score each candidate bin by summing log-magnitudes
  // of its harmonics, gated by the candidate's own magnitude (so bins with no
  // energy can't win by coincidentally landing a harmonic on a strong peak).
  // Weight = fundamentalMag^0.5 * sum(log(1+harmonic mags)) keeps pure tones
  // from being pulled down to their subharmonics.
  // Assumes a strong fundamental (true for accordion reeds): if the 2nd harmonic
  // materially exceeds the fundamental, the score can pick the octave up — so this
  // detector is routed for accordion only.
  const hpsScore = (b) => {
    const fund = mag[b];
    if (fund < magMean * 0.01) return 0; // gate: candidate must have some energy
    let p = 0;
    for (let h = 2; h <= 4; h++) { const hb = b * h; if (hb >= half) break; p += Math.log1p(mag[hb]); }
    return Math.sqrt(fund) * (Math.log1p(fund) + p);
  };
  // Seed the search from the strongest bin so the winning score must beat a real candidate.
  let bestBin = peakBin, bestHps = hpsScore(peakBin);
  for (let b = minBin; b <= maxBin; b++) {
    const s = hpsScore(b);
    if (s > bestHps) { bestHps = s; bestBin = b; }
  }
  if (bestBin < 0 || bestHps <= 0) return { freq: -1, clarity: 0 };

  // Parabolic interpolation for sub-bin accuracy.
  let peak = bestBin;
  if (bestBin > 0 && bestBin < half - 1) {
    const a = mag[bestBin - 1], b0 = mag[bestBin], c = mag[bestBin + 1], denom = a - 2 * b0 + c;
    if (denom) peak = bestBin + (0.5 * (a - c)) / denom;
  }
  const f0 = binToFreq(peak);

  // Cluster-centroid: weighted mean of bins within ±50 cents of f0.
  const loB = Math.max(1, Math.floor((f0 * Math.pow(2, -50 / 1200) * N) / sampleRate));
  const hiB = Math.min(half - 1, Math.ceil((f0 * Math.pow(2, 50 / 1200) * N) / sampleRate));
  let wsum = 0, fsum = 0;
  for (let b = loB; b <= hiB; b++) { wsum += mag[b]; fsum += mag[b] * binToFreq(b); }
  const freq = wsum > 0 ? fsum / wsum : f0;

  // clarity: prominence of the fundamental over the mean spectrum, squashed to 0..1.
  const clarity = Math.max(0, Math.min(1, (mag[bestBin] / magMean - 1) / 8));
  return { freq, clarity };
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
