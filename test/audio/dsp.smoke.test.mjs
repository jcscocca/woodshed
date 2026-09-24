// Fast synthetic smoke test (no fixtures). Catches gross breakage in the DSP.
// NOT a substitute for the real-audio suite. Run: npm run test:smoke
import { detectPitch, detectPitchDetailed, noteFromFrequency } from "../../src/audio/dsp.js";
const SR = 44100;
const sine = (f, n, a = 0.6, sr = SR) => { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = a * Math.sin(2 * Math.PI * f * i / sr); return b; };
let failed = 0;
for (const [f, want] of [[440, "A4"], [261.63, "C4"], [82.41, "E2"]]) {
  const d = detectPitch(sine(f, 2048), SR); const n = d > 0 ? noteFromFrequency(d) : null;
  const ok = n && `${n.name}${n.octave}` === want; if (!ok) failed++;
  console.log(`  sine ${f}Hz -> ${n ? n.name + n.octave : "—"} ${ok ? "ok" : "FAIL"}`);
}
const noise = Float32Array.from({ length: 2048 }, () => Math.random() * 2 - 1);
const nd = detectPitch(noise, SR); if (nd > 0) failed++;
console.log(`  white noise -> ${nd < 0 ? "rejected ok" : "FALSE NOTE FAIL"}`);
const det = detectPitchDetailed(sine(440, 2048), SR);
const clarityOk = det.freq > 0 && det.clarity > 0.35;
if (!clarityOk) failed++;
console.log(`  detail 440Hz -> clarity ${det.clarity.toFixed(2)} ${clarityOk ? "ok" : "FAIL"}`);
// Low bass at the default range: the curve is still low at minLag, which used to read as ~1500Hz (F#6).
for (const sr of [44100, 48000]) for (const [f, name] of [[41.2, "E1"], [43.65, "F1"]]) for (const h2 of [0, 0.3, 1.2]) {
  const b = sine(f, 2048, 0.4, sr), h = sine(2 * f, 2048, 0.4 * h2, sr); for (let i = 0; i < b.length; i++) b[i] += h[i];
  const d = detectPitch(b, sr); const c = d > 0 ? 1200 * Math.log2(d / f) : NaN; const ok = Math.abs(c) < 20; if (!ok) failed++;
  console.log(`  ${name}${h2 ? ` + 2nd harmonic x${h2}` : ""} @${sr} -> ${d > 0 ? d.toFixed(1) + "Hz" : "—"} ${ok ? "ok" : "FAIL"}`);
}
// ...but a real dip right at minLag (F#6 at 48k, period ~32.4 vs minLag 32) must not be skipped.
const top = detectPitch(sine(1480, 2048, 0.6, 48000), 48000); const tn = top > 0 ? noteFromFrequency(top) : null;
const topOk = tn && `${tn.name}${tn.octave}` === "F#6"; if (!topOk) failed++;
console.log(`  F#6 @48000 -> ${tn ? tn.name + tn.octave : "—"} ${topOk ? "ok" : "FAIL"}`);
process.exit(failed ? 1 : 0);
