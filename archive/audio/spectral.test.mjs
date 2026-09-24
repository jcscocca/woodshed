// Tests for the archived spectral detector, cut from test/coach.test.mjs.
// Not part of npm test. Run: node archive/audio/spectral.test.mjs
import assert from "node:assert/strict";
import { fft, detectPitchSpectral } from "./spectral.js";
import { noteFromFrequency } from "../../src/audio/dsp.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("fft: a pure cosine peaks at its bin", () => {
  const N = 64, k = 8;
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let n = 0; n < N; n++) re[n] = Math.cos(2 * Math.PI * k * n / N);
  fft(re, im);
  let maxBin = 0, maxMag = 0;
  for (let b = 0; b < N / 2; b++) { const m = Math.hypot(re[b], im[b]); if (m > maxMag) { maxMag = m; maxBin = b; } }
  assert.equal(maxBin, k);
});

const SRX = 44100;
const sineBuf = (f, n = 2048, a = 0.5) => { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = a * Math.sin(2 * Math.PI * f * i / SRX); return b; };
// musette: 3 reeds detuned in cents around `f`, each = fundamental + 2 harmonics.
const musetteBuf = (f, cents = [0, 12, -9], n = 2048) => {
  const b = new Float32Array(n);
  const reeds = cents.map((c) => f * Math.pow(2, c / 1200));
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const rf of reeds) s += Math.sin(2 * Math.PI * rf * i / SRX) + 0.4 * Math.sin(2 * Math.PI * 2 * rf * i / SRX) + 0.2 * Math.sin(2 * Math.PI * 3 * rf * i / SRX);
    b[i] = 0.15 * s;
  }
  return b;
};

test("detectPitchSpectral: clean sine resolves to the right note", () => {
  const d = detectPitchSpectral(sineBuf(440), SRX);
  const nn = noteFromFrequency(d.freq);
  assert.equal(`${nn.name}${nn.octave}`, "A4");
});
test("detectPitchSpectral: musette (3 detuned reeds) reads the center note A4", () => {
  const d = detectPitchSpectral(musetteBuf(440), SRX);
  const nn = noteFromFrequency(d.freq);
  assert.equal(`${nn.name}${nn.octave}`, "A4");
  assert.ok(d.clarity >= 0.5, `clarity ${d.clarity} should clear the note-stream floor`);
});
test("detectPitchSpectral: musette around C4 reads C4", () => {
  const d = detectPitchSpectral(musetteBuf(261.63), SRX);
  const nn = noteFromFrequency(d.freq);
  assert.equal(`${nn.name}${nn.octave}`, "C4");
});
test("detectPitchSpectral: silence returns -1", () => {
  assert.equal(detectPitchSpectral(new Float32Array(2048), SRX).freq, -1);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
