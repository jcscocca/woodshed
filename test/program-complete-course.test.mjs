import assert from "node:assert/strict";
import abcjs from "abcjs";
import { EXERCISES } from "../src/program/curriculum.js";
import { parseScore } from "../src/score/scoreModel.js";

// Musical-content regressions, not a claim of instructional validation. Source
// expectations below were transcribed from inspected scores, not generated from
// the curriculum's ABC. The original form/voicing tables were separately read
// from the written music. Generic schema/bar checks live in program-content.
let count = 0, failures = 0;
const test = (name, fn) => {
  try { fn(); count++; console.log(`ok   ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}\n${error.stack}`); }
};
const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const cache = new Map();
const exercise = (id) => {
  assert.ok(byId.has(id), `missing exercise ${id}`);
  return byId.get(id);
};
const score = (id) => {
  if (!cache.has(id)) cache.set(id, parseScore(exercise(id).abc, abcjs));
  return cache.get(id);
};
const barEvents = (id, hand, bar) => {
  const s = score(id), start = s.bars[bar - 1]?.beat;
  assert.notEqual(start, undefined, `${id}: missing bar ${bar}`);
  return s.notes.filter((n) => n.hand === hand && n.bar === bar).map((n) => [n.midi, n.beat - start, n.dur]);
};
const assertBars = (id, hand, expected, firstBar = 1) => expected.forEach((events, i) => {
  assert.deepEqual(barEvents(id, hand, firstBar + i), events, `${id}, ${hand}, bar ${firstBar + i}`);
});
const soundingAt = (id, beat, hand) => score(id).notes.filter((n) => (!hand || n.hand === hand) && n.beat <= beat && n.beat + n.dur > beat).map((n) => n.midi).sort((a, b) => a - b);
const pitchClasses = (pitches) => [...new Set(pitches.map((n) => n % 12))].sort((a, b) => a - b);
const intervals = [0, 2, 4, 5, 7, 9, 11, 12];
const majorLine = (tonic) => [...intervals, ...intervals.slice(0, -1).reverse()].map((n) => tonic + n);
const fingers = (id) => exercise(id).fingering.replace(/[^\d]/g, "");

// Mutopia 614, Stelios Samelis, Breitkopf & Härtel source, public domain:
// https://www.mutopiaproject.org/ftp/MozartWA/KV331/KV331_1_1_tema/KV331_1_1_tema.ly
// PDF was independently inspected too. These are the UPPERMOST melody notes;
// the source has extra RH voices/chords and a much richer original LH.
// Entries are [MIDI pitch, quarter-note offset in bar, quarter-note duration].
const mozart1 = [[73, 0, 0.75], [74, 0.75, 0.25], [73, 1, 0.5], [76, 1.5, 1], [76, 2.5, 0.5]];
const mozart2 = [[71, 0, 0.75], [73, 0.75, 0.25], [71, 1, 0.5], [74, 1.5, 1], [74, 2.5, 0.5]];
const mozartRight = [
  mozart1,
  mozart2,
  [[69, 0, 1], [69, 1, 0.5], [71, 1.5, 1], [71, 2.5, 0.5]],
  [[73, 0, 1], [76, 1, 0.25], [74, 1.25, 0.25], [73, 1.5, 1], [71, 2.5, 0.5]],
  mozart1,
  mozart2,
  [[69, 0, 1], [71, 1, 0.5], [73, 1.5, 1], [74, 2.5, 0.5]],
  [[73, 0, 1], [71, 1, 0.5], [69, 1.5, 1]],
];

test("all three Mozart versions preserve the inspected first-strain upper melody, register, onsets and lengths", () => {
  for (const id of ["a6-mozart-melody", "a6-mozart-held", "a6-mozart-two-pulse"]) {
    const s = score(id);
    assert.deepEqual(s.meter, [6, 8], id);
    assert.equal(s.key, "A", id);
    assert.equal(s.bars.length, 8, id);
    assert.equal(s.endBeat, 24, id);
    assert.deepEqual(s.bars.map((b) => b.beat), [0, 3, 6, 9, 12, 15, 18, 21], id);
    assertBars(id, "R", mozartRight);
    assert.ok(!s.notes.some((n) => n.hand === "R" && n.beat < 24 && n.beat + n.dur > 23.5), `${id}: final eighth must be silent in RH`);
    assert.match(exercise(id).source.url, /id=614$/);
  }
  assert.ok(score("a6-mozart-melody").notes.every((n) => n.hand === "R"), "melody preparation must not silently add the source LH");
});

test("the two disclosed Mozart accompaniments retain their distinct low-register movement and shared closing rest", () => {
  assertBars("a6-mozart-held", "L", [
    [[45, 0, 3]], [[44, 0, 3]], [[42, 0, 3]], [[45, 0, 1.5], [40, 1.5, 1.5]],
    [[45, 0, 3]], [[44, 0, 3]], [[42, 0, 3]], [[40, 0, 1.5], [45, 1.5, 1]],
  ]);
  // In bars 1–7 these are the source lower voice at each large-beat start,
  // lowered one octave with NEW dotted-quarter lengths. Bar 8 is rewritten.
  assertBars("a6-mozart-two-pulse", "L", [
    [[45, 0, 1.5], [49, 1.5, 1.5]], [[44, 0, 1.5], [47, 1.5, 1.5]],
    [[42, 0, 1.5], [44, 1.5, 1.5]], [[45, 0, 1.5], [40, 1.5, 1.5]],
    [[45, 0, 1.5], [49, 1.5, 1.5]], [[44, 0, 1.5], [47, 1.5, 1.5]],
    [[42, 0, 1.5], [45, 1.5, 1.5]], [[40, 0, 1.5], [45, 1.5, 1]],
  ]);
  for (const id of ["a6-mozart-held", "a6-mozart-two-pulse"]) assert.ok(!score(id).notes.some((n) => n.beat + n.dur > 23.5), `${id}: both hands leave the final eighth rest`);
});

// Grieg, Peters plate 7188, IMSLP file 912194, printed music p.1/PDF p.5:
// https://ks15.imslp.org/files/imglnks/usimg/c/c0/IMSLP912194-PMLP2533-grieg_peer_gynt_suite_no.1_peters.pdf
// Read from the actual flute staff. Main notes only, one octave down; the small
// grace ornaments are intentionally omitted in the declared student version.
const griegRight = [
  [[71, 0, 0.5], [68, 0.5, 0.5], [66, 1, 0.5], [64, 1.5, 0.5], [66, 2, 0.5], [68, 2.5, 0.5]],
  [[71, 0, 0.5], [68, 0.5, 0.5], [66, 1, 0.5], [64, 1.5, 0.5], [66, 2, 0.25], [68, 2.25, 0.25], [66, 2.5, 0.25], [68, 2.75, 0.25]],
  [[71, 0, 0.5], [68, 0.5, 0.5], [71, 1, 0.5], [73, 1.5, 0.5], [68, 2, 0.5], [73, 2.5, 0.5]],
  [[71, 0, 0.5], [68, 0.5, 0.5], [66, 1, 0.5], [64, 1.5, 1]],
];

test("both Grieg versions preserve the inspected four flute bars after octave lowering, including the final rest window", () => {
  for (const id of ["e7-morning-melody", "e7-morning-arrangement"]) {
    const s = score(id);
    assert.deepEqual(s.meter, [6, 8], id);
    assert.equal(s.key, "E", id);
    assert.equal(s.bars.length, 4, id);
    assert.equal(s.endBeat, 12, id);
    assertBars(id, "R", griegRight);
    assert.ok(!s.notes.some((n) => n.hand === "R" && n.beat < 12 && n.beat + n.dur > 11.5), `${id}: RH rest occupies [11.5, 12)`);
  }
  assert.ok(score("e7-morning-melody").notes.every((n) => n.hand === "R"));
  assertBars("e7-morning-arrangement", "L", [[[52, 0, 3]], [[52, 0, 3]], [[47, 0, 3]], [[52, 0, 3]]]);
  assert.deepEqual(soundingAt("e7-morning-arrangement", 11.75), [52], "new bass continues through the source RH rest");
});

test("A/E scales retain their sounding octave, sharps, return and each hand's crossing fingering", () => {
  for (const [prefix, key, rightTonic, leftTonic] of [["a6", "A", 69, 45], ["e7", "E", 64, 40]]) {
    for (const [suffix, hand, tonic, up, down] of [["r", "R", rightTonic, "12312345", "54321321"], ["l", "L", leftTonic, "54321321", "12312345"]]) {
      const id = `${prefix}-scale-${suffix}`, s = score(id);
      assert.equal(s.key, key, id);
      assert.deepEqual(s.notes.filter((n) => n.hand === hand).map((n) => n.midi), majorLine(tonic), id);
      assert.ok(s.notes.every((n) => n.hand === hand), `${id}: unexpected other hand`);
      assert.ok(fingers(id).includes(up) && fingers(id).includes(down), `${id}: wrong stated crossing or descent`);
      assert.deepEqual(s.notes.map((n) => n.dur), [...Array(14).fill(1), 2], `${id}: last tonic keeps its two counts`);
    }
    const both = `${prefix}-scale-both`;
    assert.deepEqual(score(both).notes.filter((n) => n.hand === "R").map((n) => n.midi), majorLine(rightTonic), both);
    assert.deepEqual(score(both).notes.filter((n) => n.hand === "L").map((n) => n.midi), majorLine(leftTonic), both);
    assert.ok(fingers(both).includes("12312345") && fingers(both).includes("54321321"), both);
  }
});

test("new primary/relative harmony spells complete E7/B7 and the intended minor thirds in actual registers", () => {
  const cases = [
    ["a6-chords-primary", [[45, 61, 64, 69], [50, 62, 66, 69], [40, 62, 68, 71], [45, 61, 64, 69]]],
    ["e7-chords-primary", [[40, 64, 68, 71], [45, 64, 69, 73], [47, 54, 63, 69, 71], [40, 64, 68, 71]]],
    ["e7-chords-relative", [[40, 64, 68, 71], [49, 64, 68, 73], [45, 64, 69, 73], [47, 54, 63, 69, 71]]],
  ];
  for (const [id, chords] of cases) chords.forEach((expected, bar) => assert.deepEqual(soundingAt(id, bar * 4), expected, `${id}: bar ${bar + 1}`));
  assert.deepEqual(soundingAt("a6-chords-relative", 0), [45, 61, 64, 69]);
  assert.deepEqual(soundingAt("a6-chords-relative", 2), [42, 61, 66, 69], "F#m has A natural, not A sharp");
  assert.deepEqual(pitchClasses(soundingAt("a6-chords-primary", 8)), [2, 4, 8, 11], "E7 = E G# B D");
  assert.deepEqual(pitchClasses(soundingAt("e7-chords-primary", 8)), [3, 6, 9, 11], "B7 = B D# F# A");
});

test("sixth/seventh reading tasks sound their stated sizes and hold the resolution bass rather than reattacking it", () => {
  const sixth = score("a6-interval-sixths");
  for (const [beat, semitones] of [[0, 9], [2, 9], [4, 8], [6, 9], [8, 9], [10, 8], [12, 8]]) {
    const pair = soundingAt("a6-interval-sixths", beat);
    assert.equal(pair.length, 2);
    assert.equal(pair[1] - pair[0], semitones, `sixth at ${beat}`);
  }
  assert.equal(sixth.endBeat, 16);
  for (const [beat, semitones] of [[0, 11], [2, 12], [4, 10], [6, 9], [8, 10], [10, 9], [12, 12]]) {
    const pair = soundingAt("a6-interval-sevenths", beat);
    assert.equal(pair[1] - pair[0], semitones, `seventh/resolution at ${beat}`);
  }
  assert.deepEqual(barEvents("a6-interval-sevenths", "L", 3), [[52, 0, 4]], "E3 is held under D4–C#4");
  assertBars("m8-sixth-seventh", "R", [[[60, 0, 2], [69, 2, 2]], [[60, 0, 2], [71, 2, 2]], [], []]);
  assertBars("m8-sixth-seventh", "L", [[], [], [[48, 0, 2], [57, 2, 2]], [[50, 0, 2], [60, 2, 2]]]);
});

test("Two Rooms is a complete eight-bar AB with a different melody hand and detached RH replies in B", () => {
  const id = "a6-two-rooms", s = score(id);
  assert.equal(s.bars.length, 8);
  assert.equal(s.endBeat, 24);
  assertBars(id, "R", [
    [[76, 0, 1], [73, 1, 0.5], [71, 1.5, 1], [69, 2.5, 0.5]],
    [[73, 0, 1.5], [71, 1.5, 1.5]],
    [[69, 0, 1], [73, 1, 0.5], [74, 1.5, 1], [73, 2.5, 0.5]],
    [[71, 0, 3]],
  ]);
  assertBars(id, "L", [[[57, 0, 3]], [[50, 0, 3]], [[52, 0, 3]], [[52, 0, 3]]]);
  assertBars(id, "L", [
    [[57, 0, 1], [61, 1, 0.5], [64, 1.5, 1], [61, 2.5, 0.5]],
    [[54, 0, 1], [57, 1, 0.5], [61, 1.5, 1], [57, 2.5, 0.5]],
    [[52, 0, 1], [56, 1, 0.5], [59, 1.5, 1], [62, 2.5, 0.5]],
    [[57, 0, 3]],
  ], 5);
  assert.deepEqual(barEvents(id, "R", 5), [[73, 0, 1], [76, 0, 1], [73, 1.5, 1], [76, 1.5, 1]], "RH leaves gaps while LH melody continues");
  assert.deepEqual(soundingAt(id, 23), [57, 73, 76], "the complete B section closes on A major");
});

test("Two-part Conversation contains both complete four-bar sections and an actual LH melody beneath held RH chords", () => {
  const id = "m8-form-ab", s = score(id);
  assert.equal(s.bars.length, 8);
  assert.equal(s.endBeat, 32);
  assertBars(id, "R", [
    [[60, 0, 1], [62, 1, 1], [64, 2, 1], [67, 3, 1]],
    [[69, 0, 2], [67, 2, 2]],
    [[64, 0, 1], [65, 1, 1], [67, 2, 1], [64, 3, 1]],
    [[62, 0, 2], [67, 2, 2]],
  ]);
  assertBars(id, "L", [[[48, 0, 4]], [[41, 0, 4]], [[48, 0, 4]], [[43, 0, 4]]]);
  const leftAnswer = [
    [[52, 0, 1], [55, 1, 1], [52, 2, 1], [48, 3, 1]],
    [[53, 0, 1], [57, 1, 1], [55, 2, 1], [53, 3, 1]],
    [[55, 0, 1], [53, 1, 1], [52, 2, 1], [50, 3, 1]],
    [[48, 0, 4]],
  ];
  assertBars(id, "L", leftAnswer, 5);
  assertBars("m8-bass-led-reading", "L", leftAnswer);
  for (const [i, chord] of [[64, 67, 72], [65, 69, 72], [62, 65, 71], [64, 67, 72]].entries()) {
    assert.deepEqual(barEvents(id, "R", i + 5), chord.map((midi) => [midi, 0, 4]), `held B-section harmony ${i + 1}`);
  }
  assert.deepEqual(soundingAt(id, 31), [48, 64, 67, 72], "AB has its own tonic close, without needing an A return");
});

test("Return Dance is the full twelve-bar ABA, with the literal pitch/rhythm return in BOTH hands", () => {
  const id = "m8-form-aba", s = score(id);
  assert.deepEqual(s.meter, [3, 4]);
  assert.equal(s.key, "G");
  assert.equal(s.bars.length, 12);
  assert.equal(s.endBeat, 36);
  const opening = [
    [[67, 0, 1], [71, 1, 1], [74, 2, 1]], [[72, 0, 2], [71, 2, 1]],
    [[69, 0, 1], [71, 1, 1], [69, 2, 1]], [[67, 0, 3]],
  ];
  const openingBass = [[[43, 0, 3]], [[48, 0, 3]], [[50, 0, 3]], [[43, 0, 3]]];
  assertBars(id, "R", opening);
  assertBars(id, "L", openingBass);
  assertBars(id, "R", opening, 9);
  assertBars(id, "L", openingBass, 9);
  assertBars(id, "R", [
    [[71, 0, 1], [69, 1, 1], [67, 2, 1]], [[66, 0, 2], [69, 2, 1]],
    [[72, 0, 1], [71, 1, 1], [69, 2, 1]], [[62, 0, 3]],
  ], 5);
  assertBars(id, "L", [[[52, 0, 3]], [[47, 0, 3]], [[45, 0, 3]], [[50, 0, 3]]], 5);
});

test("the unfolded first/second ending roadmap sounds opening–first ending–opening–second ending", () => {
  const id = "m8-repeat-endings", s = score(id);
  assert.equal(s.bars.length, 8);
  assert.equal(s.endBeat, 32);
  const opening = [[[60, 0, 1], [62, 1, 1], [64, 2, 1], [65, 3, 1]], [[67, 0, 2], [64, 2, 2]]];
  const firstEnding = [[[62, 0, 1], [64, 1, 1], [65, 2, 1], [67, 3, 1]], [[67, 0, 4]]];
  const secondEnding = [[[64, 0, 1], [62, 1, 1], [60, 2, 2]], [[60, 0, 4]]];
  // This is the performed order of compact source bars 1 2 3 4 / 1 2 5 6.
  // The app deliberately writes it out; it does not promise repeat unfolding.
  assertBars(id, "R", [...opening, ...firstEnding, ...opening, ...secondEnding]);
  assertBars(id, "L", [48, 48, 43, 43, 48, 48, 43, 48].map((midi) => [[midi, 0, 4]]));
});

test("the C/G upper inversion map preserves the tonic's pitches, inversion order and separate sustained roots", () => {
  const id = "m8-inversion-transfer";
  const expected = [[60, 64, 67], [64, 67, 72], [67, 72, 76], [60, 64, 67], [55, 59, 62], [59, 62, 67], [62, 67, 71], [55, 59, 62]];
  expected.forEach((chord, i) => {
    assert.deepEqual(soundingAt(id, i * 2, "R"), chord, `upper inversion ${i + 1}`);
    assert.deepEqual(pitchClasses(chord), i < 4 ? [0, 4, 7] : [2, 7, 11]);
    assert.deepEqual(soundingAt(id, i * 2, "L"), [i < 4 ? 48 : 43], "root stays below the reordered upper tones");
  });
});

test("F's LH tonic map contains three real inversions and the matching broken chord tones", () => {
  const id = "m8-inversion-f-l";
  [[41, 45, 48], [45, 48, 53], [48, 53, 57], [41, 45, 48]].forEach((expected, i) => {
    assert.deepEqual(soundingAt(id, i * 2, "L"), expected);
    assert.deepEqual(pitchClasses(expected), [0, 5, 9]);
  });
  assert.ok(score(id).notes.every((n) => n.hand === "L"), "no hidden RH root may turn the actual bass into a tonic again");
  assertBars(id, "L", [[[41, 0, 1], [45, 1, 1], [48, 2, 1]], [[45, 0, 1], [48, 1, 1], [53, 2, 1]]], 3);
});

test("D/A/E tonic inversion maps keep their altered thirds in every written register", () => {
  const id = "m8-inversion-sharp-keys";
  const expected = [
    [62, 66, 69], [66, 69, 74], [69, 74, 78], [62, 66, 69],
    [57, 61, 64], [61, 64, 69], [64, 69, 73], [57, 61, 64],
    [64, 68, 71], [68, 71, 76], [71, 76, 80], [64, 68, 71],
  ];
  const classes = [[2, 6, 9], [1, 4, 9], [4, 8, 11]];
  expected.forEach((chord, i) => {
    assert.deepEqual(soundingAt(id, i * 2, "R"), chord, `tonic position ${i + 1}`);
    assert.deepEqual(pitchClasses(chord), classes[Math.floor(i / 4)]);
  });
  assert.ok(score(id).notes.every((n) => n.hand === "R"));
});

test("the earlier close-voicing lessons sound their declared C/G/F/D/A/E harmony and actual bass root", () => {
  const cases = [
    ["chord-inversions", [48, 41, 43, 48], [[0, 4, 7], [0, 5, 9], [2, 7, 11], [0, 4, 7]]],
    ["g-chords-close", [43, 48, 50, 43], [[2, 7, 11], [0, 4, 7], [0, 2, 6, 9], [2, 7, 11]]],
    ["f3-chord-close-voicings", [41, 46, 48, 41], [[0, 5, 9], [2, 5, 10], [0, 4, 7, 10], [0, 5, 9]]],
    ["d-chords-home", [50, 43, 45, 50], [[2, 6, 9], [2, 7, 11], [1, 4, 7, 9], [2, 6, 9]]],
    ["a6-chords-primary", [45, 50, 40, 45], [[1, 4, 9], [2, 6, 9], [2, 4, 8, 11], [1, 4, 9]]],
    ["e7-chords-primary", [40, 45, 47, 40], [[4, 8, 11], [1, 4, 9], [3, 6, 9, 11], [4, 8, 11]]],
  ];
  for (const [id, roots, harmonies] of cases) harmonies.forEach((expected, bar) => {
    const sounding = soundingAt(id, bar * 4);
    assert.equal(sounding[0], roots[bar], `${id}: actual bass root in bar ${bar + 1}`);
    assert.deepEqual(pitchClasses(sounding), expected, `${id}: full two-hand tonal identity in bar ${bar + 1}`);
  });
});

if (failures) { console.error(`\n${count} complete-course musical regressions passed; ${failures} failed`); process.exitCode = 1; }
else console.log(`\n${count} complete-course musical regressions green`);
