import assert from "node:assert/strict";
import abcjs from "abcjs";
const { parseChord, parseChordLine } = await import("../src/score/chords.js");
const { parseScore } = await import("../src/score/scoreModel.js");
const { PATTERNS } = await import("../src/score/patterns.js");
const { chartToAbc } = await import("../src/score/chartToAbc.js");
const rhByBar = (abc) => { const s = parseScore(abc, abcjs), out = {}; for (const n of s.notes) if (n.hand === "R") (out[n.bar] ??= []).push(n.midi); return out; };

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };
const spelled = (c) => c.tones.map((t) => t.letter + (t.acc > 0 ? "#".repeat(t.acc) : "b".repeat(-t.acc))).join(" ");

test("parseChord spells every quality from its root's letter", () => {
  assert.equal(spelled(parseChord("C")), "C E G");
  assert.equal(spelled(parseChord("Am")), "A C E");
  assert.equal(spelled(parseChord("F#m")), "F# A C#");
  assert.equal(spelled(parseChord("Bb")), "Bb D F");
  assert.equal(spelled(parseChord("C7")), "C E G Bb");
  assert.equal(spelled(parseChord("Fmaj7")), "F A C E");
  assert.equal(spelled(parseChord("Dm7")), "D F A C");
  assert.equal(spelled(parseChord("Gsus4")), "G C D");
  assert.equal(spelled(parseChord("Dsus2")), "D E A");
  assert.equal(spelled(parseChord("Bdim")), "B D F");
  assert.equal(spelled(parseChord("Ebdim")), "Eb Gb Bbb");
  const s = parseChord("C/E");
  assert.equal(s.bass.letter, "E"); assert.equal(s.bass.pc, 4); assert.equal(s.name, "C/E");
  for (const t of ["H", "Cm9", "c", "C/H", ""]) assert.equal(parseChord(t), null, t);
});

test("parseChordLine splits bars, halves 4/4 bars, and names the bad bar", () => {
  const r = parseChordLine("C | G | Am F | G7", 4);
  assert.equal(r.bars.length, 4);
  assert.deepEqual(r.bars[2].map((x) => [x.chord.name, x.beats]), [["Am", 2], ["F", 2]]);
  assert.deepEqual(r.bars[0].map((x) => x.beats), [4]);
  assert.equal(parseChordLine("| C | G |", 4).bars.length, 2);
  assert.equal(parseChordLine("C | G", 3).bars[1][0].beats, 3);
  const bad = parseChordLine("C | Hm | G", 4).error;
  assert.equal(bad.bar, 2); assert.equal(bad.token, "Hm");
  assert.equal(bad.message, "bar 2: 'Hm' isn't a chord I know");
  assert.equal(parseChordLine("C | | G", 4).error.message, "bar 2 is empty");
  assert.equal(parseChordLine("C G | F", 3).error.message, "bar 1: one chord a bar in 3/4");
  assert.equal(parseChordLine("C G F", 4).error.message, "bar 1: up to two chords a bar in 4/4");
  assert.ok(parseChordLine("   ", 4).error);
});

test("every pattern writes only chord tones, in range, in every key", () => {
  for (const [name, p] of Object.entries(PATTERNS)) for (const m of p.metres) for (const key of ["C", "F", "G", "Bb", "Am", "Em", "Dm", "E"]) {
    const chords = m === 4 ? "C | G7 | Am F | Dm7 G | E7 C | Bb/D | Fmaj7 | Csus4 C" : "C | G7 | Am | F | E7 | Bb | Fmaj7 | Csus2";
    const bars = chords.split("|").map((b) => b.trim().split(/\s+/));
    const s = parseScore(chartToAbc({ key, meter: `${m}/4`, chords, pattern: name }), abcjs);
    assert.equal(s.bars.length, 8, `${name} ${m}/4 ${key}`);
    for (const n of s.notes) {
      const i = n.bar - 1, half = bars[i].length === 2 && n.beat - i * m >= 2 ? 1 : 0, c = parseChord(bars[i][half]);
      const pcs = new Set([...c.tones.map((t) => t.pc), ...(c.bass ? [c.bass.pc] : []), ...(name === "boogie" ? [(c.root.pc + 9) % 12] : [])]);
      assert.ok(pcs.has(n.midi % 12), `${name} ${key} bar ${n.bar}: ${n.midi} not in ${bars[i][half]}`);
      if (n.hand === "R") assert.ok(n.midi >= 55 && n.midi <= 79, `${name} RH ${n.midi}`);
      else assert.ok(n.midi >= 36 && n.midi <= 60, `${name} LH ${n.midi}`);
    }
  }
});

test("voiceled moves to the closest inversion; block stays in root position", () => {
  assert.deepEqual(Object.values(rhByBar(chartToAbc({ key: "C", chords: "C | G | Am | F", pattern: "voiceled" }))), [[60, 64, 67], [59, 62, 67], [60, 64, 69], [60, 65, 69]]);
  assert.deepEqual(Object.values(rhByBar(chartToAbc({ key: "C", chords: "C | G | Am | F", pattern: "block" }))), [[60, 64, 67], [55, 59, 62], [57, 60, 64], [65, 69, 72]]);
});

test("spelling follows the key, and an accidental carries to the bar line", () => {
  assert.ok(chartToAbc({ key: "F", chords: "Bb", pattern: "block" }).includes("[B,DF]"));
  assert.ok(chartToAbc({ key: "Eb", chords: "Ab", pattern: "block" }).includes("[A,CE]"));
  const abc = chartToAbc({ key: "Am", chords: "E7 C | Am", pattern: "voiceled" });
  assert.ok(abc.includes("^G") && abc.includes("=G"), abc);
  const bar1 = parseScore(abc, abcjs).notes.filter((n) => n.hand === "R" && n.bar === 1);
  assert.deepEqual(bar1.filter((n) => n.beat === 0).map((n) => n.midi), [59, 62, 68]);
  assert.deepEqual(bar1.filter((n) => n.beat === 2).map((n) => n.midi), [60, 64, 67]);
});

test("slash chords put the named bass in the left hand; symbols ride the right hand", () => {
  const abc = chartToAbc({ key: "C", chords: "C/E | Am", pattern: "block" });
  assert.equal(parseScore(abc, abcjs).notes.find((n) => n.hand === "L").midi, 40);
  assert.ok(/\[V:1\] "C\/E"/.test(abc) && abc.includes('"Am"'));
});

test("a lead sheet keeps its melody, puts symbols on the left hand, and must match the chords", () => {
  const melody = "E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | E3D D4 |]";
  const abc = chartToAbc({ key: "C", chords: "C | G | C | G", pattern: "ballad", melody });
  const s = parseScore(abc, abcjs);
  assert.deepEqual(s.notes.filter((n) => n.hand === "R").map((n) => n.midi), [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62]);
  assert.ok(/\[V:2\] "C"/.test(abc));
  assert.throws(() => chartToAbc({ key: "C", chords: "C | G | C | G | C", pattern: "ballad", melody }), /melody has 1 lines for 5 bars/);
  const waltz = chartToAbc({ key: "G", meter: "3/4", chords: "G | D", pattern: "waltz", melody: "z4D2 | d6 |]" });
  assert.deepEqual(parseScore(waltz, abcjs).notes.filter((n) => n.hand === "L" && n.bar === 1).map((n) => [n.beat, n.midi]), [[0, 43], [1, 47], [1, 50], [1, 55], [2, 47], [2, 50], [2, 55]]);
});

test("patterns refuse a metre they don't fit", () => {
  assert.throws(() => chartToAbc({ key: "C", meter: "3/4", chords: "C", pattern: "ballad" }), /doesn't fit 3\/4/);
  assert.throws(() => chartToAbc({ key: "C", meter: "4/4", chords: "C", pattern: "waltz" }), /doesn't fit 4\/4/);
  assert.throws(() => chartToAbc({ key: "C", chords: "C", pattern: "polka" }), /unknown pattern/);
  assert.throws(() => chartToAbc({ key: "C", chords: "C | Hm", pattern: "block" }), /'Hm' isn't a chord I know/);
});

const { newSong, songError, songScore, lineSections, SONG_KEYS } = await import("../src/score/songs.js");

test("a song becomes a score: sections per 4-bar line, errors named by bar", () => {
  const s = { ...newSong("s1"), chords: "C | G | Am | F | C | G | F C | G | C" };
  assert.equal(songError(s), null);
  const S = songScore(s);
  assert.equal(parseScore(S.abc, abcjs).bars.length, 9);
  assert.deepEqual(S.sections.map((x) => [x.name, x.from, x.to]), [["1–4", 1, 4], ["5–8", 5, 8], ["9", 9, 9]]);
  assert.equal(S.bpm, 70); assert.equal(S.target, 120);
  assert.equal(songError({ ...s, chords: "C | Hm" }).message, "bar 2: 'Hm' isn't a chord I know");
  assert.equal(songScore({ ...s, chords: "C | Hm" }), null);
  assert.deepEqual(lineSections(4).map((x) => x.name), ["1–4"]);
  assert.ok(SONG_KEYS.includes("Bb") && SONG_KEYS.includes("F#m"));
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
