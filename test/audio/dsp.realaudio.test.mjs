// Real-audio regression suite for the tuner/listener DSP.
// Runs the app's ACTUAL shipped detectors (../../src/audio/dsp.js) against real
// recorded instrument audio, checked vs ground truth with pitchfinder as an
// independent oracle. Exits non-zero on any failure.  Run: npm run test:audio
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import WavDecoder from "wav-decoder";
import Pitchfinder from "pitchfinder";
import { detectPitch, noteFromFrequency, createOnsetTracker, bpmFromOnsets, rms } from "../../src/audio/dsp.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(here, "fixtures");
if (!fs.existsSync(FIX) || !fs.readdirSync(FIX).some((f) => f.endsWith(".wav"))) {
  console.error("\nNo audio fixtures in test/audio/fixtures/. Generate them once:\n  npm run fixtures\n(Requires timidity + python3 with the 'mido' package — see test/audio/README.md)\n");
  process.exit(1);
}
const load = (f) => { const d = WavDecoder.decode.sync(fs.readFileSync(path.join(FIX, f))); return { sr: d.sampleRate, ch: d.channelData[0] }; };
const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
const frame = (ch, p, n) => Float32Array.from(ch.subarray(p, p + n));
const nn = (x) => (x ? `${x.name}${x.octave}` : "—");
function pitchOf(ch, sr, detect) {
  const win = 2048, hop = 1024, s = Math.floor(0.15 * sr), e = Math.min(ch.length - win, Math.floor(1.3 * sr)), fr = [];
  for (let p = s; p < e; p += hop) { const f = detect(frame(ch, p, win)); if (f && f > 0) fr.push(f); }
  const f = median(fr); return f ? noteFromFrequency(f) : null;
}
let failed = 0;
console.log("PITCH — app detector vs ground truth (oracle: pitchfinder AMDF)");
for (const [file, want] of [["piano_A4.wav", "A4"], ["piano_C4.wav", "C4"], ["violin_A4.wav", "A4"], ["flute_A4.wav", "A4"], ["acguitar_E2.wav", "E2"], ["acguitar_E4.wav", "E4"]]) {
  const { sr, ch } = load(file);
  const app = pitchOf(ch, sr, (b) => detectPitch(b, sr));
  const orc = pitchOf(ch, sr, Pitchfinder.AMDF({ sampleRate: sr }));
  const ok = app && nn(app) === want; if (!ok) failed++;
  console.log(`  ${file.padEnd(16)} want ${want.padEnd(4)} app ${nn(app).padEnd(5)} oracle ${nn(orc).padEnd(5)} ${ok ? "PASS" : "FAIL"}`);
}
console.log("\nTEMPO — app onset tracker vs ground truth");
for (const bpm of [90, 120, 144]) {
  const { sr, ch } = load(`drum_${bpm}.wav`);
  const win = 2048, hop = 735, tr = createOnsetTracker(), on = [];
  for (let p = 0; p + win <= ch.length; p += hop) { const t = (p / sr) * 1000; if (tr.step(rms(frame(ch, p, win)), t)) on.push(t); }
  const got = bpmFromOnsets(on); const ok = got !== null && Math.abs(got - bpm) <= 3; if (!ok) failed++;
  console.log(`  ${("drum_" + bpm).padEnd(14)} want ${bpm} got ${got} ${ok ? "PASS" : "FAIL"}`);
}
console.log(failed ? `\n${failed} test(s) FAILED` : "\nAll real-audio tests passed.");
process.exit(failed ? 1 : 0);
