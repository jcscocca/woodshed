// Fast synthetic smoke test (no fixtures). Catches gross breakage in the DSP.
// NOT a substitute for the real-audio suite. Run: npm run test:smoke
import { detectPitch, detectPitchDetailed, noteFromFrequency } from "../../src/audio/dsp.js";
const SR = 44100;
const sine = (f, n, a = 0.6) => { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = a * Math.sin(2 * Math.PI * f * i / SR); return b; };
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
process.exit(failed ? 1 : 0);
