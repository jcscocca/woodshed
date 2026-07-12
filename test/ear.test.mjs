import assert from "node:assert/strict";
import { mulberry32, intervalLabel, generateRound } from "../src/ear.js";
import { midiToFreq } from "../src/audio/notes.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("mulberry32: deterministic for a seed, values in [0,1)", () => {
  const a = mulberry32(42), b = mulberry32(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  for (const v of seqA) assert.ok(v >= 0 && v < 1);
});

test("mulberry32: different seeds diverge", () => {
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test("intervalLabel: names and directions", () => {
  assert.equal(intervalLabel(60, 63), "↑m3");
  assert.equal(intervalLabel(63, 60), "↓m3");
  assert.equal(intervalLabel(60, 72), "↑P8");
  assert.equal(intervalLabel(60, 67), "↑P5");
  assert.equal(intervalLabel(60, 60), "P1");
});

const EAR = { range: [60, 79], keys: ["C", "G", "F"], bpm: 80, rounds: 5 };

test("generateRound: same seed, same round", () => {
  const a = generateRound({ diff: 1, ear: EAR, rng: mulberry32(7) });
  const b = generateRound({ diff: 1, ear: EAR, rng: mulberry32(7) });
  assert.deepEqual(a, b);
});

test("generateRound diff 1: two notes, small-interval set, in range", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 1, ear: EAR, rng: mulberry32(s) });
    assert.equal(r.targets.length, 2);
    const gap = Math.abs(r.targets[1].midi - r.targets[0].midi);
    assert.ok([2, 3, 4, 5, 7].includes(gap), `seed ${s}: gap ${gap}`);
    for (const t of r.targets) assert.ok(t.midi >= 60 && t.midi <= 79, `seed ${s}: midi ${t.midi}`);
  }
});

test("generateRound diff 2: any interval up to an octave, both directions drawn", () => {
  const gaps = new Set();
  let down = 0;
  for (let s = 0; s < 300; s++) {
    const r = generateRound({ diff: 2, ear: EAR, rng: mulberry32(s) });
    const d = r.targets[1].midi - r.targets[0].midi;
    assert.ok(Math.abs(d) >= 1 && Math.abs(d) <= 12);
    gaps.add(Math.abs(d));
    if (d < 0) down++;
  }
  assert.ok(gaps.size >= 8, `variety expected, saw ${gaps.size} distinct intervals`);
  assert.ok(down > 50, "descending intervals should be common");
});

test("generateRound: targets, prompt, bpm, labels agree", () => {
  const r = generateRound({ diff: 1, ear: EAR, rng: mulberry32(3) });
  assert.equal(r.promptVoices.length, r.targets.length);
  assert.ok(Math.abs(r.promptVoices[0][0] - midiToFreq(r.targets[0].midi)) < 1e-9);
  assert.equal(r.bpm, 80);
  for (const t of r.targets) assert.match(t.label, /^[A-G]#?\d$/);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
