import assert from "node:assert/strict";
import { TOPIC_COVERAGE, ADDITIONAL_LEARNING } from "../src/program/coverage.js";
import { UNITS, EXERCISES, SESSIONS } from "../src/program/curriculum.js";
import { QUESTION_BY_ID, knowledgeForExercise } from "../src/program/knowledge.js";

const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const scheduled = new Set(SESSIONS.flatMap((s) => s.blocks.map((b) => b.exerciseId)));
const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };

test("every benchmark topic has scheduled instruction, practical criteria and relevant concept checks", () => {
  assert.equal(TOPIC_COVERAGE.length, 29);
  const ids = [...TOPIC_COVERAGE, ...ADDITIONAL_LEARNING].map((topic) => topic.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const topic of [...TOPIC_COVERAGE, ...ADDITIONAL_LEARNING]) {
    assert.ok(topic.title && topic.source && topic.practicalCheck.length > 50, topic.id);
    for (const id of topic.lessonIds) {
      assert.ok(byId.has(id), `${topic.id}: missing lesson ${id}`);
      assert.ok(scheduled.has(id), `${topic.id}: no guided opportunity for ${id}`);
      assert.ok(byId.get(id).steps.length >= 3 && byId.get(id).checks.length >= 2, id);
    }
    const questions = new Set(topic.lessonIds.flatMap((id) => knowledgeForExercise(byId.get(id)).map((q) => q.id)));
    for (const id of topic.questionIds) {
      assert.ok(QUESTION_BY_ID[id], `${topic.id}: unknown question ${id}`);
      assert.ok(questions.has(id), `${topic.id}: concept ${id} not attached to its instruction`);
    }
  }
});

test("six major keys retain separate-hand and two-hand scale practice, not just signature labels", () => {
  const scales = [
    ["scale-c-octave", "r", "l", "both"], ["g-scale", "r", "l", "both"],
    ["f3-scale-octave", "r", "l", "both"], ["d-scale", "r", "l", "both"],
    ["a6-scale", "r", "l", "both"], ["e7-scale", "r", "l", "both"],
  ];
  for (const [prefix, ...suffixes] of scales) for (const suffix of suffixes) {
    const e = byId.get(`${prefix}-${suffix}`);
    assert.ok(e && e.section === "scales" && e.abc && scheduled.has(e.id), `${prefix}-${suffix}`);
  }
});

test("D/A/E inversion maps each get their own guided passage and saved visit goal", () => {
  const blocks = SESSIONS.flatMap((s) => s.blocks.filter((b) => b.exerciseId === "m8-inversion-sharp-keys"));
  assert.deepEqual(blocks.map((b) => [b.fromBar, b.toBar]), [[1, 2], [3, 4], [5, 6]]);
  assert.ok(blocks.every((b) => b.goal && b.minutes >= 4));
});

test("the program keeps its original sections, key sequence and two daily twenty-minute visits", () => {
  assert.deepEqual(UNITS.slice(0, 5).map((u) => u.key), ["C major", "G major", "F major", "A minor", "D major"]);
  assert.deepEqual(UNITS.slice(5).map((u) => u.key), ["A major", "E major", "Across keys"]);
  assert.ok(EXERCISES.every((e) => ["guided", "chords", "scales", "placement"].includes(e.section)));
  for (const unit of UNITS) {
    assert.equal(unit.daysPerWeek, 5); assert.equal(unit.sessionsPerDay, 2); assert.equal(unit.sessionMinutes, 20);
    const sessions = SESSIONS.filter((s) => s.unitId === unit.id);
    assert.equal(sessions.length, 10);
    assert.deepEqual(sessions.map((s) => s.slot), ["A", "B", "A", "B", "A", "B", "A", "B", "A", "B"]);
    assert.ok(sessions.every((s) => s.blocks.reduce((sum, b) => sum + b.minutes, 0) === 20));
  }
});

console.log("\nall topic-coverage checks green");
