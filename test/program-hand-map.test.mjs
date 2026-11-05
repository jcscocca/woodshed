import assert from "node:assert/strict";
import { test } from "node:test";
import abcjs from "abcjs";
import { EXERCISES } from "../src/program/curriculum.js";
import { parseScore } from "../src/score/scoreModel.js";
import { CHORD_FINGERS } from "../src/program/chordFingers.js";
import { fingerErrors, handShapes } from "../src/program/handMap.js";

const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const score = (id) => parseScore(byId.get(id).abc, abcjs);
const shapes = (id, opts) => handShapes(score(id), { exerciseId: id, ...opts });
const view = (step) => step.keys.map((k) => `${k.hand}${k.midi}${k.fingers.length ? `:${k.fingers.join("/")}` : ""}`).join(" ");

test("every chord lesson without written fingering has transcribed fingers", () => {
  const missing = EXERCISES.filter((e) => e.section === "chords" && !/![1-5]!/.test(e.abc) && !CHORD_FINGERS[e.id]).map((e) => e.id);
  assert.deepEqual(missing, []);
});

test("transcribed fingers match their scores attack for attack", () => {
  for (const [id, fingers] of Object.entries(CHORD_FINGERS)) {
    assert.ok(byId.has(id), `${id} is not a course exercise`);
    assert.deepEqual(fingerErrors(score(id), fingers), [], id);
  }
});

test("every right-hand chord-lesson attack has a finger", () => {
  for (const [id, fingers] of Object.entries(CHORD_FINGERS)) if (fingers.R) assert.ok(!fingers.R.split(/\s+/).includes("-"), id);
});

test("written score fingering reaches the keyboard map", () => {
  const scale = EXERCISES.find((e) => e.technique?.pattern === "major" && e.technique.tonic === "G" && e.technique.octaves === 1 && e.hands === "R");
  const { steps } = handShapes(parseScore(scale.abc, abcjs), { exerciseId: scale.id });
  assert.equal(steps.length, 1);
  assert.equal(view(steps[0]), "R55:1 R57:2 R59:3 R60:1 R62:2 R64:3 R66:4 R67:5");
});

test("chord lessons step through one shape per chord, with both hands", () => {
  const { steps, low, high } = shapes("chord-f-g");
  assert.deepEqual(steps.map((s) => s.label), ["C", "F", "G", "C"]);
  assert.equal(view(steps[1]), "L41:5 R65:1 R69:3 R72:5");
  assert.deepEqual([low, high], [41, 74]);
});

test("repeated bars merge and a broken chord stays one map", () => {
  const { steps } = shapes("chord-c");
  assert.deepEqual(steps.map((s) => s.label), ["Bar 1", "Bar 2"]);
  assert.equal(view(steps[0]), "R60:1 R64:3 R67:5");
  assert.equal(view(steps[1]), "L48:5 R60:1 R64:3 R67:5");
});

test("a shape change inside a bar splits the map", () => {
  assert.deepEqual(shapes("m8-inversion-transfer").steps.slice(0, 2).map((s) => [s.label, view(s)]), [
    ["Bar 1", "L48 R60:1 R64:3 R67:5"],
    ["Bar 1, beat 3", "R64:1 R67:2 R72:5"],
  ]);
  assert.deepEqual(shapes("d-chords-minor").steps.map((s) => s.label), ["Bm", "F♯m", "Bm", "F♯m", "G"]);
});

test("unstated fingers stay blank instead of guessed", () => {
  assert.equal(view(shapes("chord-inversions").steps[0]), "L48 R60:1 R64:3 R67:5");
});

test("hands and bar range narrow the map", () => {
  assert.deepEqual(shapes("chord-f-g", { hands: "L" }).steps.map((s) => [s.label, view(s)]), [["C", "L48:5"], ["F", "L41:5"], ["G", "L43:5"], ["C", "L48:5"]]);
  assert.deepEqual(shapes("chord-f-g", { from: 2, to: 3 }).steps.map((s) => s.label), ["F", "G"]);
});
