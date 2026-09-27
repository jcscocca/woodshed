import assert from "node:assert/strict";
import abcjs from "abcjs";
const { parseScore, inSection, forHands } = await import("../src/score/scoreModel.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

const MINI = `X:1
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] [G,B,D]4 A,2 | B,6 | C6 | B,6 |`;

test("parseScore: metre, key, bars", () => {
  const s = parseScore(MINI, abcjs);
  assert.deepEqual(s.meter, [3, 4]); assert.equal(s.beatsPerBar, 3); assert.equal(s.key, "G");
  assert.deepEqual(s.bars.map((b) => b.beat), [0, 3, 6, 9]);
});
test("parseScore: right-hand pitches, beats and the key signature's F#", () => {
  const rh = parseScore(MINI, abcjs).notes.filter((n) => n.hand === "R" && n.bar <= 3);
  assert.deepEqual(rh.map((n) => n.midi), [74, 67, 69, 71, 72, 74, 67, 67, 76, 72, 74, 76, 78]);
  assert.deepEqual(rh.slice(0, 5).map((n) => n.beat), [0, 1, 1.5, 2, 2.5]);
});
test("parseScore: a left-hand chord is one onset", () => {
  const s = parseScore(MINI, abcjs);
  const first = s.notes.filter((n) => n.beat === 0);
  assert.deepEqual(first.map((n) => `${n.hand}${n.midi}`), ["L55", "L59", "L62", "R74"]);
  assert.ok(first.every((n) => n.onset === 0));
});
test("parseScore: durations in beats and bar numbers", () => {
  const lh = parseScore(MINI, abcjs).notes.filter((n) => n.hand === "L");
  assert.deepEqual(lh.map((n) => [n.midi, n.beat, n.dur, n.bar]), [[55, 0, 2, 1], [59, 0, 2, 1], [62, 0, 2, 1], [57, 2, 1, 1], [59, 3, 3, 2], [60, 6, 3, 3], [59, 9, 3, 4]]);
});
test("parseScore: a one-voice bass-clef score is the left hand", () => {
  const s = parseScore("X:1\nM:4/4\nL:1/4\nK:C clef=bass\nC, D, E, F,|G,4|", abcjs);
  assert.ok(s.notes.every((n) => n.hand === "L")); assert.equal(s.notes[0].midi, 48);
});
test("inSection and forHands filter notes", () => {
  const s = parseScore(MINI, abcjs);
  assert.ok(inSection(s.notes, 2, 3).every((n) => n.bar >= 2 && n.bar <= 3));
  assert.ok(forHands(s.notes, "L").every((n) => n.hand === "L"));
  assert.equal(forHands(s.notes, "both").length, s.notes.length);
});
test("parseScore: bars count trailing rests, not just the last note", () => {
  const s = parseScore("X:1\nM:4/4\nL:1/4\nK:C\nC D E F|z z z z|", abcjs);
  assert.equal(s.bars.length, 2);
  assert.deepEqual(parseScore(MINI, abcjs).bars.map((b) => b.beat), [0, 3, 6, 9]);
});

const { gradeTimed, ON_MS, WINDOW_MS } = await import("../src/score/timedGrade.js");
const { createWaitRun } = await import("../src/score/waitGrade.js");
const T = (midi, beat, bar = 1) => ({ midi, beat, bar });
const E = (midi, tStart) => ({ midi, tStart });
// 60 bpm: one beat = 1000 ms; t0 = 10000
const opts = (now = Infinity) => ({ t0: 10000, bpm: 60, beatsPerBar: 4, now });

test("gradeTimed: on, early, late at the 60 and 180 ms edges", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2), T(65, 3)];
  const r = gradeTimed(targets, [E(60, 10060), E(62, 10939), E(64, 12180), E(65, 13181)], opts());
  assert.deepEqual(r.statuses, ["on", "early", "late", "missed"]);
  assert.equal(ON_MS, 60); assert.equal(WINDOW_MS, 180);
});
test("gradeTimed: pending before a window closes, missed after", () => {
  const targets = [T(60, 0), T(62, 1)];
  assert.deepEqual(gradeTimed(targets, [], opts(11100)).statuses, ["missed", "pending"]);
  assert.equal(gradeTimed(targets, [], opts(11100)).done, false);
  assert.equal(gradeTimed(targets, [], opts(11181)).done, true);
});
test("gradeTimed: a slip doesn't shift later notes", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2), T(65, 3)];
  const r = gradeTimed(targets, [E(61, 10000), E(62, 11000), E(64, 12000), E(65, 13000)], opts());
  assert.deepEqual(r.statuses, ["missed", "on", "on", "on"]);
  assert.deepEqual(r.extras, [{ midi: 61, bar: 1 }]);
});
test("gradeTimed: repeated notes and chords each match their own press", () => {
  const targets = [T(60, 0), T(64, 0), T(67, 0), T(60, 1), T(60, 2)];
  const r = gradeTimed(targets, [E(67, 10010), E(60, 10020), E(64, 10030), E(60, 11010), E(60, 12100)], opts());
  assert.deepEqual(r.statuses, ["on", "on", "on", "on", "late"]);
});
test("gradeTimed: notes % and rhythm %, clean pass, revisit bars", () => {
  const targets = [T(60, 0, 1), T(62, 1, 1), T(64, 4, 2), T(65, 5, 2), T(67, 8, 3)];
  const r = gradeTimed(targets, [E(60, 10000), E(62, 11100), E(64, 14000), E(65, 15000)], opts());
  assert.equal(r.notesPct, 80); assert.equal(r.rhythmPct, 75); assert.equal(r.clean, false);
  assert.deepEqual(r.revisitBars, [1, 3]);
  const clean = gradeTimed(targets, targets.map((t) => E(t.midi, 10000 + t.beat * 1000)), opts());
  assert.equal(clean.notesPct, 100); assert.equal(clean.rhythmPct, 100); assert.equal(clean.clean, true);
});
test("gradeTimed: the section's first beat lands at t0", () => {
  const targets = [T(60, 9, 4), T(62, 10, 4)];
  assert.deepEqual(gradeTimed(targets, [E(60, 10000), E(62, 11000)], opts()).statuses, ["on", "on"]);
});
test("gradeTimed: cursor is the first pending target in time", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2)];
  assert.equal(gradeTimed(targets, [E(60, 10000)], opts(10500)).cursor, 1);
  assert.equal(gradeTimed(targets, targets.map((t) => E(t.midi, 10000 + t.beat * 1000)), opts()).cursor, -1);
});
test("gradeTimed: overlapping windows match globally nearest-first, not per-target greedy", () => {
  const targets = [T(60, 0), T(60, 0.15)];
  const r = gradeTimed(targets, [E(60, 10130)], opts());
  assert.deepEqual(r.statuses, ["missed", "on"]);
  const r2 = gradeTimed(targets, [E(60, 10005), E(60, 10160)], opts());
  assert.deepEqual(r2.statuses, ["on", "on"]);
});
test("createWaitRun: a chord advances only when all its notes are pressed, rolled is fine", () => {
  const run = createWaitRun([T(60, 0), T(64, 0), T(67, 0), T(62, 1)]);
  assert.equal(run.press(64), "held"); assert.equal(run.press(60), "held"); assert.equal(run.cursor, 0);
  assert.equal(run.press(67), "advance"); assert.equal(run.cursor, 1);
  assert.equal(run.press(62), "done"); assert.equal(run.done, true);
});
test("createWaitRun: a wrong press flashes but never advances", () => {
  const run = createWaitRun([T(60, 0, 1), T(62, 1, 1), T(64, 4, 2)]);
  assert.equal(run.press(61), "wrong"); assert.equal(run.cursor, 0);
  run.press(60); run.press(62); run.press(65);
  assert.deepEqual(run.result(), { found: 2, total: 3, wrong: 2, wrongBars: [1, 2] });
});

const { generateDrill, drillBpm, LEVELS } = await import("../src/score/sightread.js");
const SCALE = { C: [0, 2, 4, 5, 7, 9, 11], G: [7, 9, 11, 0, 2, 4, 6], F: [5, 7, 9, 10, 0, 2, 4], D: [2, 4, 6, 7, 9, 11, 1], Bb: [10, 0, 2, 3, 5, 7, 9] };
const TONIC = { C: 0, G: 7, F: 5, D: 2, Bb: 10 };
const drillCache = {};
const drills = (level, n = 150) => (drillCache[`${level}:${n}`] ??= Array.from({ length: n }, (_, seed) => { const abc = generateDrill(level, seed); return { seed, abc, s: parseScore(abc, abcjs) }; }));
const perBarFull = (s) => [..."RL"].every((h) => {
  const ns = s.notes.filter((x) => x.hand === h);
  if (!ns.length) return true;
  return ns.every((x) => Math.floor(x.beat / s.beatsPerBar + 1e-9) === Math.floor((x.beat + x.dur - 1e-6) / s.beatsPerBar));
});

test("sightread: 10 levels; tempo 60 rising to 72", () => {
  assert.equal(LEVELS.length, 10); assert.equal(drillBpm(1), 60); assert.equal(drillBpm(10), 72);
  for (let l = 2; l <= 10; l++) assert.ok(drillBpm(l) >= drillBpm(l - 1));
});
test("sightread: deterministic per seed, varied across seeds", () => {
  for (let l = 1; l <= 10; l++) {
    assert.equal(generateDrill(l, 7), generateDrill(l, 7));
    assert.ok(new Set(Array.from({ length: 40 }, (_, s) => generateDrill(l, s))).size >= 20, `level ${l} varies`);
  }
});
test("sightread: every drill parses, has the right bar count, no note crosses a barline, the melody ends on the tonic", () => {
  for (let l = 1; l <= 10; l++) for (const { s } of drills(l)) {
    assert.equal(s.bars.length, l >= 9 ? 4 : 2, `level ${l} bars`);
    assert.ok(perBarFull(s), `level ${l} barlines`);
    // levels 1-3: the last note of all (one hand, or the hands taking turns); 4+: the right hand's last note
    const mel = l >= 4 ? s.notes.filter((n) => n.hand === "R") : s.notes;
    assert.equal(((mel[mel.length - 1].midi % 12) + 12) % 12, TONIC[s.key], `level ${l} ends on tonic`);
  }
});
test("sightread: ranges, hands and keys per level", () => {
  for (const { s } of drills(1)) { assert.ok(s.notes.every((n) => n.hand === "R" && n.midi >= 60 && n.midi <= 67)); assert.equal(s.key, "C"); }
  for (const { s } of drills(2)) assert.ok(s.notes.every((n) => n.hand === "L" && n.midi >= 48 && n.midi <= 55));
  for (const { s } of drills(3)) {
    const beatsR = new Set(s.notes.filter((n) => n.hand === "R").map((n) => n.bar)), beatsL = new Set(s.notes.filter((n) => n.hand === "L").map((n) => n.bar));
    assert.ok(beatsR.size && beatsL.size && [...beatsR].every((b) => !beatsL.has(b)), "level 3 alternates by bar");
  }
  for (const l of [4, 5, 6, 7, 8]) for (const { s } of drills(l)) {
    const lh = s.notes.filter((n) => n.hand === "L");
    assert.ok(lh.length && lh.every((n) => n.beat % s.beatsPerBar === 0), `level ${l} LH on downbeats`);
  }
  for (const { s } of drills(6)) assert.deepEqual(s.meter, [3, 4]);
  for (const { s } of drills(7)) assert.equal(s.key, "G");
  for (const { s } of drills(8)) assert.equal(s.key, "F");
  for (const l of [1, 2, 3, 4, 5, 6, 7, 8, 9]) for (const { s } of drills(l)) {
    const sc = SCALE[s.key]; assert.ok(s.notes.every((n) => sc.includes(((n.midi % 12) + 12) % 12)), `level ${l} stays in key`);
  }
});
test("sightread: rhythm features appear where the ladder adds them", () => {
  const has = (l, pred) => drills(l).some(({ s }) => s.notes.some(pred));
  assert.ok(!has(4, (n) => n.hand === "R" && n.dur === 0.5), "no eighths before level 5");
  assert.ok(has(5, (n) => n.hand === "R" && n.dur === 0.5), "eighths at level 5");
  assert.ok(has(6, (n) => n.dur === 3), "dotted halves at level 6");
  assert.ok(has(8, (n) => n.dur === 1.5), "dotted quarters at level 8");
  assert.ok(drills(9).every(({ s }) => s.notes.filter((n) => n.hand === "L").every((n) => n.dur === 1)), "level 9 LH quarters");
  assert.ok(drills(10).some(({ s }) => s.notes.some((n) => !SCALE[s.key].includes(((n.midi % 12) + 12) % 12))), "level 10 accidentals");
});
test("sightread: melodies move mostly by step", () => {
  for (let l = 1; l <= 10; l++) for (const { s } of drills(l, 60)) {
    const top = s.notes.filter((n) => n.hand === (l === 2 ? "L" : "R"));
    const steps = top.slice(1).filter((n, i) => Math.abs(n.midi - top[i].midi) <= 2).length;
    assert.ok(top.length < 3 || steps / (top.length - 1) >= 0.6, `level ${l} stepwise`);
  }
});

const { migrate } = await import("../src/storage.js");
const { freshData, SCHEMA_VERSION } = await import("../src/engine.js");
test("schema 7: ladder and sightLevel default to {}", () => {
  assert.equal(SCHEMA_VERSION, 7);
  const f = freshData(); assert.deepEqual(f.ladder, {}); assert.deepEqual(f.sightLevel, {});
  const m = migrate({ version: 6, items: [], sessions: [], settings: {} });
  assert.deepEqual(m.ladder, {}); assert.deepEqual(m.sightLevel, {}); assert.equal(m.version, 7);
  const kept = migrate({ version: 7, items: [], sessions: [], settings: {}, ladder: { "pno-minuet": { A: 80 } }, sightLevel: { "pno-sight": 3 } });
  assert.deepEqual(kept.ladder, { "pno-minuet": { A: 80 } }); assert.deepEqual(kept.sightLevel, { "pno-sight": 3 });
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
