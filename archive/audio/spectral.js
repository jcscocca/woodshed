// Spectral pitch detector for accordion (musette) — archived out of the build
// with bass and accordion (see archive/README.md). Cut verbatim from
// src/audio/dsp.js, where useCoach routed inst === "accordion" to it.

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
