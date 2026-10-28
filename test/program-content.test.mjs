import assert from "node:assert/strict";
import abcjs from "abcjs";
import { COURSE, UNITS, EXERCISES, SESSIONS, PLACEMENT, CATALOGUE } from "../src/program/curriculum.js";
import { parseScore } from "../src/score/scoreModel.js";
import { guideForUnit } from "../src/program/guides.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.stack}`); } };
const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const scores = new Map();

test("every key unit has ten ordered, twenty-minute sessions", () => {
  assert.equal(COURSE.key, "C major");
  assert.equal(COURSE.daysPerWeek, 5);
  assert.equal(COURSE.sessionsPerDay, 2);
  assert.equal(COURSE.sessionMinutes, 20);
  assert.deepEqual(UNITS.map((u) => [u.id, u.key, u.number]), [
    ["c-major-foundations-1", "C major", 1],
    ["g-major-foundations-2", "G major", 2],
    ["f-major-foundations-3", "F major", 3],
    ["a-minor-foundations-4", "A minor", 4],
    ["d-major-foundations-5", "D major", 5],
    ["a-major-foundations-6", "A major", 6],
    ["e-major-foundations-7", "E major", 7],
    ["musicianship-capstone-8", "Across keys", 8],
  ]);
  assert.equal(COURSE.id, UNITS[0].id, "the legacy COURSE metadata continues to identify C major");
  assert.equal(SESSIONS.length, UNITS.length * 10);
  assert.equal(new Set(SESSIONS.map((s) => s.id)).size, SESSIONS.length);
  for (const unit of UNITS) {
    const sessions = SESSIONS.filter((s) => s.unitId === unit.id);
    assert.equal(sessions.length, 10, unit.id);
    sessions.forEach((s, i) => {
      assert.equal(s.day, Math.floor(i / 2) + 1, s.id);
      assert.equal(s.slot, i % 2 === 0 ? "A" : "B", s.id);
      assert.equal(s.blocks.reduce((n, b) => n + b.minutes, 0), 20, s.id);
      for (const b of s.blocks) {
        assert.ok(byId.has(b.exerciseId), `${s.id}: unknown exercise ${b.exerciseId}`);
        assert.ok(Number.isInteger(b.minutes) && b.minutes > 0, s.id);
      }
    });
  }
  assert.ok(SESSIONS.every((s) => UNITS.some((u) => u.id === s.unitId)), "a session has an unknown unit");
});

test("adding units preserves C exercise IDs, placement and saved block positions", () => {
  const cIds = [
    "place-pulse", "place-reading", "place-coordination", "rhythm-long-short", "rhythm-eighths", "rhythm-rests", "rhythm-ties", "rhythm-dotted",
    "read-family-c", "read-bass-neighbors", "read-treble-neighbors", "read-ledger-transfer", "read-new-phrase",
    "coord-held-bass", "coord-half-bass", "coord-two-to-one", "coord-broken-chords", "coord-offbeat-melody",
    "scale-c-five-r", "scale-c-five-l", "scale-c-octave-r", "scale-c-octave-l", "scale-c-octave-both",
    "chord-c", "chord-f-g", "chord-inversions", "chord-pop-loop", "chord-ballad",
    "music-night-windows", "music-evening-signals", "music-lantern-walk", "music-ode-opening", "music-after-rain", "music-dawn-drive",
    "create-question-answer", "create-bass-story", "create-new-ending",
  ];
  assert.deepEqual(EXERCISES.filter((e) => e.unitId === COURSE.id).map((e) => e.id), cIds);
  assert.deepEqual(PLACEMENT, ["place-pulse", "place-reading", "place-coordination"]);
  const blocks = [
    ["rhythm-long-short", "read-family-c", "coord-held-bass", "scale-c-five-r"],
    ["chord-c", "music-night-windows", "create-question-answer", "read-family-c"],
    ["rhythm-eighths", "read-bass-neighbors", "coord-half-bass", "scale-c-five-l"],
    ["chord-f-g", "music-lantern-walk", "create-bass-story", "rhythm-eighths"],
    ["rhythm-rests", "read-treble-neighbors", "coord-two-to-one", "scale-c-octave-r"],
    ["chord-inversions", "music-ode-opening", "create-question-answer", "rhythm-rests"],
    ["rhythm-ties", "read-ledger-transfer", "coord-broken-chords", "scale-c-octave-l"],
    ["chord-pop-loop", "music-after-rain", "create-bass-story", "rhythm-ties"],
    ["rhythm-dotted", "read-ledger-transfer", "coord-offbeat-melody", "scale-c-octave-both"],
    ["chord-ballad", "music-dawn-drive", "create-new-ending", "read-new-phrase"],
  ];
  const cSessions = SESSIONS.filter((s) => s.unitId === COURSE.id);
  assert.deepEqual(cSessions.map((s) => s.id), ["c1-d1-a", "c1-d1-b", "c1-d2-a", "c1-d2-b", "c1-d3-a", "c1-d3-b", "c1-d4-a", "c1-d4-b", "c1-d5-a", "c1-d5-b"]);
  assert.deepEqual(cSessions.map((s) => s.blocks.map((b) => b.exerciseId)), blocks);
});

test("placement takes five to ten minutes and lessons carry usable self-guidance", () => {
  assert.equal(byId.size, EXERCISES.length, "duplicate exercise id");
  const minutes = PLACEMENT.reduce((n, id) => {
    const e = byId.get(id);
    assert.ok(e && e.section === "placement", id);
    return n + e.minutes;
  }, 0);
  assert.ok(minutes >= 5 && minutes <= 10);
  for (const e of EXERCISES) {
    assert.ok(UNITS.some((u) => u.id === e.unitId), `${e.id}: missing or unknown unit`);
    assert.ok(["guided", "chords", "scales", "placement"].includes(e.section), e.id);
    assert.ok(["R", "L", "both"].includes(e.hands), e.id);
    for (const field of ["title", "summary", "fingering"]) assert.ok(typeof e[field] === "string" && e[field].trim(), `${e.id}: ${field}`);
    for (const field of ["steps", "listenFor", "checks", "skillIds"]) assert.ok(Array.isArray(e[field]) && e[field].length >= 2 && e[field].every((s) => typeof s === "string" && s.trim()), `${e.id}: ${field}`);
    assert.ok(e.steps.length >= 3, `${e.id}: needs actual practice steps`);
    assert.ok(e.bpm > 0 && e.targetBpm >= e.bpm, `${e.id}: tempos`);
    assert.ok(e.source && e.source.label, `${e.id}: source`);
  }
});

// Checking the total duration alone misses a short bar followed by an overfull
// bar. Validate every individual notated bar in each voice, including rests.
test("every exercise score parses and BOTH hands match every written bar, including declared pickups", () => {
  for (const e of EXERCISES) {
    assert.ok(typeof e.abc === "string" && e.abc.length, `${e.id}: no score`);
    const [tune] = abcjs.parseOnly(e.abc);
    assert.ok(!tune.warnings?.length, `${e.id}: ${tune.warnings}`);
    const meter = tune.getMeterFraction();
    const barBeats = (meter.num * 4) / meter.den;
    const elapsed = [], bars = [];
    for (const line of tune.lines) {
      let v = 0;
      for (const staff of line.staff || []) for (const voice of staff.voices) {
        let beat = elapsed[v] || 0;
        for (const el of voice) {
          if (el.el_type === "note" && el.duration && el.rest?.type !== "spacer") beat += el.duration * 4;
          if (el.el_type === "bar" && beat > 0) {
            const expected = e.partialBars?.[(bars[v] || 0) + 1] ?? barBeats;
            assert.ok(expected > 0 && expected <= barBeats);
            assert.ok(Math.abs(beat - expected) < 1e-8, `${e.id}: voice ${v + 1}, bar ${(bars[v] || 0) + 1} has ${beat} beats; expected ${expected}`);
            bars[v] = (bars[v] || 0) + 1;
            beat = 0;
          }
        }
        elapsed[v++] = beat;
      }
    }
    assert.equal(bars.length, 2, `${e.id}: needs a right and left voice`);
    assert.equal(bars[0], bars[1], `${e.id}: hands have different bar counts`);
    assert.ok(elapsed.every((b) => b === 0), `${e.id}: unterminated bar`);
    const s = parseScore(e.abc, abcjs);
    if (e.pickup) assert.ok(e.partialBars?.[1] > 0 && e.partialBars[1] < barBeats, `${e.id}: pickup must declare its actual duration`);
    assert.equal(s.bars.length, bars[0], e.id);
    assert.ok(s.notes.length > 0 && s.notes.every((n) => n.midi >= 21 && n.midi <= 108), `${e.id}: piano range`);
    if (e.hands === "R") assert.ok(s.notes.every((n) => n.hand === "R"), `${e.id}: unexpected LH notes`);
    if (e.hands === "L") assert.ok(s.notes.every((n) => n.hand === "L"), `${e.id}: unexpected RH notes`);
    scores.set(e.id, s);
  }
});

test("unit guides and scheduled passages refer to real playable material", () => {
  for (const unit of UNITS) {
    const guide = guideForUnit(unit);
    assert.ok(guide.materialNote?.length > 40, unit.id);
    assert.ok(guide.prerequisites?.length && guide.moveOn?.length && guide.support?.length, unit.id);
    for (const id of guide.musicIds || []) assert.ok(byId.has(id), `${unit.id}: unknown destination ${id}`);
  }
  const validateRange = (label, from, to, exercise) => {
    assert.ok(Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to <= scores.get(exercise.id).bars.length, label);
  };
  for (const e of EXERCISES) for (const p of e.passages || []) validateRange(`${e.id}: ${p.label}`, p.from, p.to, e);
  for (const s of SESSIONS) for (const b of s.blocks) if (b.fromBar !== undefined || b.toBar !== undefined) validateRange(s.id, b.fromBar, b.toBar, byId.get(b.exerciseId));
});

test("standalone chord and scale lessons are shared with their unit's guided practice", () => {
  for (const e of EXERCISES.filter((x) => x.section === "chords" || x.section === "scales")) {
    const used = new Set(SESSIONS.filter((s) => s.unitId === e.unitId).flatMap((s) => s.blocks.map((b) => b.exerciseId)));
    assert.ok(used.has(e.id), `${e.id} is duplicated outside the guided curriculum`);
    assert.ok(CATALOGUE.some((c) => c.exerciseId === e.id && c.kind === "built-in"), `${e.id}: missing catalogue entry`);
  }
});

test("one hand never needs to re-strike a key still held by the other", () => {
  for (const [id, s] of scores) {
    for (let i = 0; i < s.notes.length; i++) for (let j = i + 1; j < s.notes.length; j++) {
      const a = s.notes[i], b = s.notes[j];
      if (a.hand === b.hand || a.midi !== b.midi) continue;
      const overlap = Math.min(a.beat + a.dur, b.beat + b.dur) - Math.max(a.beat, b.beat);
      assert.ok(overlap <= 1e-6, `${id}: both hands need MIDI ${a.midi} at beat ${Math.max(a.beat, b.beat)}`);
    }
  }
});

test("G-major scales sound F sharp in both hands with the stated crossing fingering", () => {
  const up = [0, 2, 4, 5, 7, 9, 11, 12];
  const line = (tonic) => [...up, ...up.slice(0, -1).reverse()].map((n) => tonic + n);
  const cases = [["g-scale-r", "R", 67, "12312345"], ["g-scale-l", "L", 43, "54321321"]];
  for (const [id, hand, tonic, fingers] of cases) {
    const e = byId.get(id), s = scores.get(id);
    assert.ok(e && s, `${id}: missing canonical scale`);
    assert.equal(s.key, "G", id);
    assert.deepEqual(s.notes.filter((n) => n.hand === hand).map((n) => n.midi), line(tonic), id);
    assert.ok(e.fingering.replace(/[^\d]/g, "").includes(fingers), `${id}: missing stated fingering ${fingers}`);
  }
  const both = scores.get("g-scale-both");
  assert.ok(both, "missing two-hand G scale");
  assert.deepEqual(both.notes.filter((n) => n.hand === "R").map((n) => n.midi), line(67));
  assert.deepEqual(both.notes.filter((n) => n.hand === "L").map((n) => n.midi), line(43));
  const signature = scores.get("g-read-f-sharp"), contrast = scores.get("g-key-f-sharp");
  assert.ok(signature?.notes.some((n) => n.midi % 12 === 6), "the G signature reading lesson must actually sound F sharp");
  assert.ok(signature.notes.every((n) => n.midi % 12 !== 5), "an implicit F under K:G is not F natural");
  assert.ok(contrast?.notes.some((n) => n.midi % 12 === 5) && contrast.notes.some((n) => n.midi % 12 === 6), "the natural/sharp contrast needs both sounding pitches");
});

test("F-major scales sound B flat and teach its distinct right-hand fingering", () => {
  const up = [0, 2, 4, 5, 7, 9, 11, 12];
  const line = (tonic) => [...up, ...up.slice(0, -1).reverse()].map((n) => tonic + n);
  for (const [id, hand, tonic, fingers] of [["f3-scale-octave-r", "R", 65, "12341234"], ["f3-scale-octave-l", "L", 41, "54321321"]]) {
    const e = byId.get(id), s = scores.get(id);
    assert.ok(e && s, `${id}: missing canonical scale`);
    assert.equal(s.key, "F", id);
    assert.deepEqual(s.notes.filter((n) => n.hand === hand).map((n) => n.midi), line(tonic), id);
    assert.ok(e.fingering.replace(/[^\d]/g, "").includes(fingers), `${id}: missing stated fingering ${fingers}`);
  }
  const both = scores.get("f3-scale-octave-both");
  assert.ok(both, "missing two-hand F scale");
  assert.deepEqual(both.notes.filter((n) => n.hand === "R").map((n) => n.midi), line(65));
  assert.deepEqual(both.notes.filter((n) => n.hand === "L").map((n) => n.midi), line(41));
  const signature = scores.get("f3-read-b-flat");
  assert.ok(signature?.notes.some((n) => n.midi % 12 === 10), "the F signature reading lesson must actually sound B flat");
  assert.ok(signature.notes.every((n) => n.midi % 12 !== 11), "an implicit B under K:F is not B natural");
});

test("new-key dominant seventh examples sound their stated full two-hand harmonies", () => {
  const pitches = (id, bar) => scores.get(id)?.notes.filter((n) => n.bar === bar).map((n) => n.midi).sort((a, b) => a - b);
  assert.deepEqual(pitches("g-chords-gcd7", 3), [50, 66, 69, 72], "D3 root plus F#4/A4/C5 makes D7 in G");
  assert.deepEqual(pitches("f3-chord-b-flat-c7", 1), [46, 65, 70, 74], "Bb2 root plus F4/Bb4/D5 makes Bb major");
  assert.deepEqual(pitches("f3-chord-b-flat-c7", 2), [48, 64, 67, 70], "C3 root plus E4/G4/Bb4 makes C7 in F");
});

test("curated alternatives explicitly match the target exercise's goal and difficulty", () => {
  assert.equal(new Set(CATALOGUE.map((c) => c.id)).size, CATALOGUE.length);
  const substitutions = CATALOGUE.filter((c) => c.substitutesFor);
  assert.ok(substitutions.length >= 1);
  for (const c of CATALOGUE) {
    assert.ok(["built-in", "external"].includes(c.kind));
    if (c.kind === "built-in") assert.ok(byId.has(c.exerciseId), c.id);
    else assert.ok(/^https:\/\//.test(c.url), c.id);
  }
  for (const c of substitutions) {
    const alt = byId.get(c.exerciseId);
    for (const id of c.substitutesFor) {
      const target = byId.get(id);
      assert.ok(target && target !== alt, `${c.id}: invalid substitution target`);
      assert.equal(alt.unitId, target.unitId, `${c.id}: substitution changes the unit's key`);
      assert.deepEqual([...alt.skillIds].sort(), [...target.skillIds].sort(), `${c.id}: different learning goal`);
      assert.deepEqual([...c.skills].sort(), [...target.skillIds].sort());
      assert.equal(alt.hands, target.hands);
      assert.equal(alt.bpm, target.bpm);
      assert.equal(alt.targetBpm, target.targetBpm);
      assert.equal(alt.minutes, target.minutes);
      assert.equal(scores.get(alt.id)?.bars.length, scores.get(target.id)?.bars.length);
      assert.ok(SESSIONS.some((s) => s.blocks.some((b) => b.exerciseId === id)), `${c.id}: substitution target is not in the plan`);
    }
  }
});

process.on("exit", () => { if (failures) process.exit(1); });
