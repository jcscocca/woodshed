import assert from "node:assert/strict";
import { mulberry32, intervalLabel, generateRound, createEarSession, REPLAYS } from "../src/ear.js";
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

const EAR = { mode: "intervals", range: [60, 79], keys: ["C", "G", "F"], bpm: 80, rounds: 5 };
const PHR = { ...EAR, mode: "phrases" };

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
  for (const t of r.targets) assert.match(t.label, /^[A-G][#b]?\d$/);
});

test("generateRound: flat keys spell black keys as flats (F major reveals Bb, never A#)", () => {
  let sawBb = false;
  for (let s = 0; s < 200; s++) {
    for (const diff of [3, 4, 5]) {
      const r = generateRound({ diff, ear: { ...PHR, keys: ["F"] }, rng: mulberry32(s) });
      for (const t of r.targets) {
        assert.ok(!t.label.includes("#"), `seed ${s} diff ${diff}: ${t.label} in F major`);
        if (t.midi % 12 === 10) { assert.match(t.label, /^Bb\d$/); sawBb = true; }
      }
    }
  }
  assert.ok(sawBb, "F-major phrases should include Bb somewhere");
});

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const ROOTS = { C: 0, G: 7, F: 5 };
const inKey = (midi, root) => MAJOR_STEPS.includes((((midi - root) % 12) + 12) % 12);
const gaps = (r) => r.targets.slice(1).map((t, i) => Math.abs(t.midi - r.targets[i].midi));

test("generateRound diff 3: three diatonic notes, steps and thirds, no repeats", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 3, ear: PHR, rng: mulberry32(s) });
    assert.equal(r.targets.length, 3, `seed ${s}`);
    assert.ok(r.targets.every((t) => t.midi >= 60 && t.midi <= 79), `seed ${s}: out of range`);
    assert.ok(Object.values(ROOTS).some((root) => r.targets.every((t) => inKey(t.midi, root))), `seed ${s}: not in any configured key`);
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 4, `seed ${s}: gap ${g} beyond steps/thirds`);
  }
});

test("generateRound diff 4: four-to-five notes, leaps to a sixth", () => {
  const lens = new Set();
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 4, ear: PHR, rng: mulberry32(s) });
    lens.add(r.targets.length);
    assert.ok(r.targets.length >= 4 && r.targets.length <= 5, `seed ${s}`);
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 9, `seed ${s}: gap ${g} beyond a sixth`);
    assert.ok(Object.values(ROOTS).some((root) => r.targets.every((t) => inKey(t.midi, root))), `seed ${s}: diff 4 stays diatonic`);
  }
  assert.deepEqual([...lens].sort(), [4, 5], "both lengths should occur");
});

test("generateRound diff 5: five-to-six notes, leaps to an octave, chromatics allowed", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 5, ear: PHR, rng: mulberry32(s) });
    assert.ok(r.targets.length >= 5 && r.targets.length <= 6, `seed ${s}`);
    assert.ok(r.targets.every((t) => t.midi >= 60 && t.midi <= 79), `seed ${s}: out of range`);
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 12, `seed ${s}: gap ${g} beyond an octave`);
  }
});

test("generateRound: mode keeps the item's identity at every difficulty", () => {
  for (let diff = 1; diff <= 5; diff++) {
    for (let s = 0; s < 100; s++) {
      assert.equal(generateRound({ diff, ear: EAR, rng: mulberry32(s) }).targets.length, 2, `intervals diff ${diff} seed ${s}`);
      const p = generateRound({ diff, ear: PHR, rng: mulberry32(s) });
      assert.ok(p.targets.length >= 3, `phrases diff ${diff} seed ${s}: ${p.targets.length} notes`);
      if (diff < 5) assert.ok(Object.values(ROOTS).some((root) => p.targets.every((t) => inKey(t.midi, root))), `phrases diff ${diff} seed ${s}: not in key`);
    }
  }
});

test("generateRound phrases diff 1: steps only", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 1, ear: PHR, rng: mulberry32(s) });
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 2, `seed ${s}: gap ${g} is more than a step`);
  }
});

// gradeLine-shaped stub: only .accuracy and .results[].status are read.
const graded = (accuracy, statuses) => ({ accuracy, results: statuses.map((st) => ({ status: st })) });

test("session: idle -> prompt -> listen -> reveal -> ... -> done", () => {
  const s = createEarSession({ diff: 1, ear: { ...EAR, rounds: 2 } });
  assert.equal(s.state.phase, "idle");
  s.begin(mulberry32(1));
  assert.equal(s.state.phase, "prompt");
  assert.equal(s.state.round, 1);
  assert.equal(s.state.total, 2);
  assert.equal(s.state.current.targets.length, 2);
  s.promptEnded();
  assert.equal(s.state.phase, "listen");
  s.roundGraded(graded(100, ["caught", "caught"]));
  assert.equal(s.state.phase, "reveal");
  s.next(mulberry32(2));
  assert.equal(s.state.phase, "prompt");
  assert.equal(s.state.round, 2);
  s.promptEnded();
  s.roundGraded(graded(50, ["caught", "missed"]));
  s.next(mulberry32(3));
  assert.equal(s.state.phase, "done");
});

test("session: out-of-phase calls are ignored", () => {
  const s = createEarSession({ diff: 1, ear: EAR });
  s.promptEnded(); s.roundGraded(graded(0, [])); s.next(mulberry32(1));
  assert.equal(s.state.phase, "idle");
  s.begin(mulberry32(1));
  s.roundGraded(graded(0, [])); // not listening yet
  assert.equal(s.state.phase, "prompt");
});

test("session: replay budget — unlimited at diff 1, one at diff 5, resets per round", () => {
  assert.equal(REPLAYS[1], Infinity);
  const s5 = createEarSession({ diff: 5, ear: { ...PHR, rounds: 2 } });
  s5.begin(mulberry32(1)); s5.promptEnded();
  assert.equal(s5.replay(), true);   // back to prompt, budget spent
  s5.promptEnded();
  assert.equal(s5.replay(), false);  // exhausted
  s5.roundGraded(graded(0, ["missed", "missed", "missed", "missed", "missed"]));
  s5.next(mulberry32(2)); s5.promptEnded();
  assert.equal(s5.replay(), true);   // fresh budget in round 2

  const s1 = createEarSession({ diff: 1, ear: EAR });
  s1.begin(mulberry32(1)); s1.promptEnded();
  for (let i = 0; i < 10; i++) { assert.equal(s1.replay(), true); s1.promptEnded(); }
});

test("session: summary averages rounds; missed become interval labels", () => {
  const s = createEarSession({ diff: 1, ear: { ...EAR, rounds: 2 } });
  s.begin(mulberry32(1)); s.promptEnded();
  s.roundGraded(graded(100, ["caught", "caught"]));
  s.next(mulberry32(2)); s.promptEnded();
  s.roundGraded(graded(0, ["missed", "pending"]));
  s.next(mulberry32(3));
  assert.equal(s.state.phase, "done");
  const sum = s.summary();
  assert.equal(sum.accuracy, 50);
  assert.equal(sum.rounds.length, 2);
  assert.ok(sum.missed.includes("first note"));
  assert.ok(sum.missed.some((m) => /^[↑↓](m|M|P|TT)/.test(m)), `interval label expected, got ${JSON.stringify(sum.missed)}`);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
