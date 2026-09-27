import assert from "node:assert/strict";
import abcjs from "abcjs";
const { parseScore, walkTune, inSection, forHands } = await import("../src/score/scoreModel.js");
const { LESSONS } = await import("../src/lessons/index.js");

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

// The 16-bar simplified Minuet the app shipped before the full piece, frozen here, and its
// targets as parsed before they came from the walk (setUpAudio's tracks), a bar per row: hand, midi @ beat + dur.
const MINUET_ABC = `X:1
T:Minuet in G
C:Christian Petzold (arr. simplified)
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] G,,6 | B,,6 | C,6 | B,,6 |
[V:1] c2 dcBA | B2 cBAG | F2 GABG | A6 |
[V:2] A,,6 | G,,6 | D,6 | D,6 |
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] G,,6 | B,,6 | C,6 | B,,6 |
[V:1] c2 dcBA | B2 cBAG | A2 BAGF | G6 |
[V:2] A,,6 | G,,6 | D,6 | G,,6 |`;
const MINUET_TARGETS = [
  "L43@0+3 R74@0+1 R67@1+0.5 R69@1.5+0.5 R71@2+0.5 R72@2.5+0.5", "L47@3+3 R74@3+1 R67@4+1 R67@5+1",
  "L48@6+3 R76@6+1 R72@7+0.5 R74@7.5+0.5 R76@8+0.5 R78@8.5+0.5", "L47@9+3 R79@9+1 R67@10+1 R67@11+1",
  "L45@12+3 R72@12+1 R74@13+0.5 R72@13.5+0.5 R71@14+0.5 R69@14.5+0.5", "L43@15+3 R71@15+1 R72@16+0.5 R71@16.5+0.5 R69@17+0.5 R67@17.5+0.5",
  "L50@18+3 R66@18+1 R67@19+0.5 R69@19.5+0.5 R71@20+0.5 R67@20.5+0.5", "L50@21+3 R69@21+3",
  "L43@24+3 R74@24+1 R67@25+0.5 R69@25.5+0.5 R71@26+0.5 R72@26.5+0.5", "L47@27+3 R74@27+1 R67@28+1 R67@29+1",
  "L48@30+3 R76@30+1 R72@31+0.5 R74@31.5+0.5 R76@32+0.5 R78@32.5+0.5", "L47@33+3 R79@33+1 R67@34+1 R67@35+1",
  "L45@36+3 R72@36+1 R74@37+0.5 R72@37.5+0.5 R71@38+0.5 R69@38.5+0.5", "L43@39+3 R71@39+1 R72@40+0.5 R71@40.5+0.5 R69@41+0.5 R67@41.5+0.5",
  "L50@42+3 R69@42+1 R71@43+0.5 R69@43.5+0.5 R67@44+0.5 R66@44.5+0.5", "L43@45+3 R67@45+3",
];
test("parseScore: the Minuet's targets are unchanged by the walk", () => {
  const s = parseScore(MINUET_ABC, abcjs);
  assert.deepEqual(s.bars.map((b) => s.notes.filter((n) => n.bar === b.n).map((n) => `${n.hand}${n.midi}@${n.beat}+${n.dur}`).join(" ")), MINUET_TARGETS);
});

const probe = (body) => parseScore(`X:1\nM:4/4\nL:1/8\nK:C\n${body}`, abcjs);
const at = (s) => s.notes.map((n) => `${n.midi}@${n.beat}`);
test("parseScore: a triplet keeps the beats after it exact", () => {
  const s = probe("(3CDE F2 G2 A2 | c8 |");
  assert.deepEqual(at(s), ["60@0", "62@0.333", "64@0.667", "65@1", "67@2", "69@3", "72@4"]);
  assert.equal(s.bars.length, 2);
});
test("parseScore: chord symbols and decorations add no targets", () => {
  const s = probe('"C"C2 E2 "G"G2 E2 | "F"F8 |');
  assert.deepEqual(at(s), ["60@0", "64@1", "67@2", "64@3", "65@4"]);
  assert.ok(s.notes.every((n) => n.hand === "R"));
  assert.deepEqual(at(probe("!trill!C4 D4 | E8 |")), ["60@0", "62@2", "64@4"]);
});
test("parseScore: a grace note is no target; its main note keeps its beat and length", () => {
  assert.deepEqual(probe("{g}c2 d2 e2 f2 | g8 |").notes.slice(0, 2).map((n) => [n.midi, n.beat, n.dur]), [[72, 0, 1], [74, 1, 1]]);
});
test("parseScore: a tie across a barline is one target", () => {
  assert.deepEqual(probe("C2 D2 E2 G2- | G2 A2 B2 c2 |").notes.map((n) => [n.midi, n.beat, n.dur]),
    [[60, 0, 1], [62, 1, 1], [64, 2, 1], [67, 3, 2], [69, 5, 1], [71, 6, 1], [72, 7, 1]]);
});
test("parseScore: a y spacer takes no time", () => {
  assert.deepEqual(at(probe("C2 y D2 E2 F2 | G8 |")), ["60@0", "62@1", "64@2", "65@3", "67@4"]);
});
test("parseScore: a tuplet left open at a line end doesn't squeeze the next line", () => {
  const s = probe("C2 D2 E2 (3FG |\nA2 B2 c2 d2 |");
  assert.deepEqual(s.notes.map((n) => n.beat), [0, 1, 2, 3, 3.333, 3.667, 4.667, 5.667, 6.667]);
  assert.deepEqual(s.notes.slice(-4).map((n) => n.dur), [1, 1, 1, 1]);
});
test("parseScore: repeats are graded as written, once", () => {
  const s = probe("|: C2 D2 E2 F2 :| G8 |");
  assert.deepEqual(at(s), ["60@0", "62@1", "64@2", "65@3", "67@4"]);
  assert.equal(s.bars.length, 2);
});
test("walkTune: the stage's keys (hand + beat) are parseScore's, after tuplets too", () => {
  const abc = "X:1\nM:4/4\nL:1/8\nK:C\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] (3cde (3fga b2 c'2 | d'8 |\n[V:2] C,4 G,,4 | C,8 |";
  const keys = new Set();
  walkTune(abcjs.parseOnly(abc)[0], ({ el, hand, beat }) => { if (!el.rest) keys.add(hand + beat); });
  const s = parseScore(abc, abcjs);
  assert.deepEqual([...keys].sort(), [...new Set(s.notes.map((n) => n.hand + n.beat))].sort());
  assert.deepEqual(s.notes.filter((n) => n.hand === "R").map((n) => n.beat), [0, 0.333, 0.667, 1, 1.333, 1.667, 2, 3, 4]);
  assert.deepEqual(s.notes.filter((n) => n.hand === "L").map((n) => n.beat), [0, 2, 4]);
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
test("gradeTimed: extras before or after the section count in its first or last bar", () => {
  const targets = [T(60, 0, 1), T(62, 1, 1), T(64, 4, 2)];
  const r = gradeTimed(targets, [E(67, 8000), E(60, 10000), E(62, 11000), E(64, 14000), E(65, 18500)], opts());
  assert.deepEqual(r.extras, [{ midi: 67, bar: 1 }, { midi: 65, bar: 2 }]);
  assert.deepEqual(r.revisitBars, [1, 2]);
});
test("gradeTimed: one press answers a unison written in both hands", () => {
  const targets = [{ ...T(55, 0), hand: "R" }, { ...T(55, 0), hand: "L" }, { ...T(71, 0), hand: "R" }, T(62, 1)];
  const r = gradeTimed(targets, [E(71, 10000), E(55, 10020), E(62, 11100)], opts());
  assert.deepEqual(r.statuses, ["on", "on", "on", "late"]);
  assert.deepEqual(r.offsets.slice(0, 2), [20, 20]);
  assert.equal(r.notesPct, 100); assert.deepEqual(r.extras, []); assert.equal(r.cursor, -1);
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
test("sightread: no right-hand quarter or longer sits a semitone from the left hand under it", () => {
  for (let l = 4; l <= 10; l++) for (const { seed, s } of drills(l, 300)) {
    const lh = s.notes.filter((n) => n.hand === "L");
    for (const n of s.notes.filter((x) => x.hand === "R" && x.dur >= 1))
      for (const b of lh.filter((b) => b.beat <= n.beat && n.beat < b.beat + b.dur))
        assert.ok(![1, 11].includes((((n.midi - b.midi) % 12) + 12) % 12), `level ${l} seed ${seed}: ${n.midi} over ${b.midi} at beat ${n.beat}`);
  }
});
test("sightread: no tritone leaps in the melody's hand", () => {
  for (let l = 1; l <= 10; l++) for (const { seed, s } of drills(l, 300)) {
    const mel = s.notes.filter((n) => n.hand === (l === 2 ? "L" : "R"));
    assert.ok(mel.length, `level ${l} seed ${seed}: melody`);
    assert.ok(mel.slice(1).every((n, i) => Math.abs(n.midi - mel[i].midi) !== 6), `level ${l} seed ${seed}`);
  }
});

const { migrate } = await import("../src/storage.js");
const { freshData, SCHEMA_VERSION } = await import("../src/engine.js");
test("schema 8: ladder and sightLevel default to {}", () => {
  assert.equal(SCHEMA_VERSION, 8);
  const f = freshData(); assert.deepEqual(f.ladder, {}); assert.deepEqual(f.sightLevel, {});
  const m = migrate({ version: 7, items: [], sessions: [], settings: {} });
  assert.deepEqual(m.ladder, {}); assert.deepEqual(m.sightLevel, {}); assert.equal(m.version, 8);
  const kept = migrate({ version: 8, items: [], sessions: [], settings: {}, ladder: { "pno-minuet": { A: 80 } }, sightLevel: { "pno-sight": 3 } });
  assert.deepEqual(kept.ladder, { "pno-minuet": { A: 80 } }); assert.deepEqual(kept.sightLevel, { "pno-sight": 3 });
  const arrays = migrate({ version: 8, items: [], sessions: [], settings: {}, ladder: [], sightLevel: [3] });
  assert.deepEqual(arrays.ladder, {}); assert.deepEqual(arrays.sightLevel, {});
});
const { runStore } = await import("../src/score/runStore.js");
test("runStore.reset hands out a fresh state, never the shared initial one", () => {
  runStore.reset();
  const a = runStore.get();
  a.run.state = "running"; a.hands = "L";
  runStore.reset();
  assert.equal(runStore.get().run.state, "idle"); assert.equal(runStore.get().hands, "both");
  assert.notEqual(runStore.get(), a); assert.notEqual(runStore.get().run, a.run);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
