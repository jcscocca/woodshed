import assert from "node:assert/strict";
import abcjs from "abcjs";
import { QUESTIONS, ACTIVE_QUESTIONS, QUESTION_BY_ID, knowledgeForExercise, normalizeKnowledge, knowledgeProgress } from "../src/program/knowledge.js";
import { EXERCISES } from "../src/program/curriculum.js";
import { normalizeProgress, recordAttempt, editAttempt, removeAttempt } from "../src/program/progress.js";
import { parseScore } from "../src/score/scoreModel.js";
import { planPlayback } from "../src/program/playback.js";
import { freshData } from "../src/engine.js";
import { migrate } from "../src/storage.js";

const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };

test("active concept checks belong to real lessons and historical answers remain interpretable", () => {
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
  const assigned = new Set(EXERCISES.flatMap((e) => knowledgeForExercise(e).map((q) => q.id)));
  for (const q of QUESTIONS) {
    assert.ok(q.archived || assigned.has(q.id), `${q.id}: no actual lesson`);
    assert.ok(q.prompt && q.explanation && q.version === 1);
    assert.ok(q.options.length >= 2 && new Set(q.options).size === q.options.length);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
  }
  for (const e of EXERCISES) for (const id of e.knowledgeIds || []) assert.ok(QUESTION_BY_ID[id], `${e.id}: unknown concept ${id}`);
});

test("written note and interval answers match their actual displayed pitches and clefs", () => {
  const cases = [["ledger-bass-e", [40]], ["ledger-middle-c", [60]], ["ledger-treble-a", [81]], ["sixth-number", [60, 69]], ["seventh-number", [62, 72]], ["harmonic-interval", [64, 72]], ["canon-minor-travel", [47,50,54,59,42,45,49,54]], ["mozart-opening-position", [73,74,73,76]], ["switchyard-sevenths", [74,67,75]]];
  for (const [id, pitches] of cases) {
    const q = QUESTION_BY_ID[id], [tune] = abcjs.parseOnly(q.abc);
    assert.ok(!tune.warnings?.length, id);
    assert.deepEqual(parseScore(q.abc, abcjs).notes.map((n) => n.midi), pitches, id);
  }
  const common = parseScore(QUESTION_BY_ID["common-time"].abc, abcjs);
  assert.deepEqual(common.meter, [4, 4]); assert.equal(common.endBeat, 4);
  assert.ok(!abcjs.parseOnly(QUESTION_BY_ID["repeat-endings"].abc)[0].warnings?.length);
});

test("listening examples sound the intervals and minor chord identified by their feedback", () => {
  for (const [id, pitches] of [["ear-third", [57, 60]], ["ear-fifth", [60, 67]], ["ear-sixth", [60, 69]], ["ear-seventh", [60, 71]], ["ear-minor", [57, 60, 64]], ["switchyard-tone-listening", [64,68,71,74,59,66,69,75]]]) {
    const q = QUESTION_BY_ID[id];
    assert.deepEqual(q.audio.map((n) => n.midi), pitches, id);
    const plan = planPlayback({ meter: [4, 4], beatsPerBar: 4, bars: [{ n: 1, beat: 0 }], endBeat: q.audioBeats, notes: q.audio }, { bpm: 60, countIn: false });
    assert.deepEqual(plan.events.map((event) => event.midi), pitches);
    assert.ok(plan.events.every((event) => event.type === "note"));
    assert.equal(plan.countInDuration, 0);
  }
  assert.equal(new Set(QUESTION_BY_ID["ear-minor"].audio.map((n) => n.beat)).size, 1, "a harmonic chord must sound together");
});

test("the three new musical preparations have focused feedback with correct source notes", () => {
  assert.equal(ACTIVE_QUESTIONS.length,50);
  assert.equal(QUESTIONS.filter(q=>q.archived).length,15);
  for(const [exerciseId,ids] of [
    ["d-canon-minor-lh-prep",["canon-minor-travel"]],
    ["a6-mozart-key-shape",["mozart-opening-position"]],
    ["e7-blues-sevenths",["switchyard-sevenths","switchyard-tone-listening"]],
  ])assert.deepEqual(knowledgeForExercise(EXERCISES.find(e=>e.id===exerciseId)).map(q=>q.id),ids);
  for(const [id,answer] of [["canon-minor-travel",0],["mozart-opening-position",1],["switchyard-sevenths",0],["switchyard-tone-listening",2]]){
    assert.equal(QUESTION_BY_ID[id].answer,answer);
    assert.equal(normalizeKnowledge([{questionId:id,choice:answer}])[0].correct,true);
    assert.equal(normalizeKnowledge([{questionId:id,choice:(answer+1)%3}])[0].correct,false);
  }
  const q=QUESTION_BY_ID["switchyard-tone-listening"],chords=[0,3].map(beat=>q.audio.filter(n=>n.beat===beat).map(n=>n.midi));
  assert.deepEqual(chords,[[64,68,71,74],[59,66,69,75]]);
  assert.equal(Math.max(...chords[1])-Math.max(...chords[0]),1,"the heard upper voice rises by exactly one semitone");
});

test("answer import recalculates correctness and rejects unknown, stale or malformed answers", () => {
  const results = normalizeKnowledge([
    { questionId: "sixth-number", choice: 0, correct: true },
    { questionId: "constructor", choice: 0 }, { questionId: "__proto__", choice: 0 },
    { questionId: "g-signature", choice: -1 }, { questionId: "g-signature", choice: "1" },
    { questionId: "g-signature", choice: 1, version: 99 }, null,
  ]);
  assert.deepEqual(results, [{ questionId: "sixth-number", version: 1, choice: 0, correct: false }]);
  assert.deepEqual(normalizeKnowledge({}), []);
  assert.equal(normalizeKnowledge([{ questionId: "sixth-number", choice: 0 }, { questionId: "sixth-number", choice: 1 }])[0].correct, true, "latest duplicate answer wins");
  assert.equal(knowledgeProgress({ attempts: "bad import" }, "sixth-number").count, 0);
});

test("concept evidence persists separately from practical readiness and supports correction/removal", () => {
  const raw = { exerciseId: "a6-interval-sixths", skillIds: ["sixths"], section: "guided", assessment: "unsure", minutes: 4, date: "2026-10-27", knowledgeResults: [{ questionId: "sixth-number", choice: 1, correct: false }] };
  let p = recordAttempt(null, raw);
  assert.equal(p.attempts[0].assessment, "unsure");
  assert.equal(p.attempts[0].knowledgeResults[0].correct, true);
  assert.ok(!("accuracy" in p.attempts[0]));
  const state = freshData(); state.programProgress = p;
  const migrated = migrate(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(migrated.programProgress, p);
  p = editAttempt(p, 0, { minutes: 7, assessment: "practising" });
  assert.equal(knowledgeProgress(p, "sixth-number").latest.correct, true);
  assert.equal(p.attempts[0].assessment, "practising");
  p = recordAttempt(p, { ...raw, knowledgeResults: [{ questionId: "sixth-number", choice: 0 }] });
  assert.equal(knowledgeProgress(p, "sixth-number").latest.correct, false);
  p = removeAttempt(p, 1);
  assert.equal(knowledgeProgress(p, "sixth-number").count, 1);
  assert.equal(knowledgeProgress(p, "sixth-number").latest.correct, true);
  assert.deepEqual(normalizeProgress({ attempts: [raw] }).attempts[0].knowledgeResults, [{ questionId: "sixth-number", version: 1, choice: 1, correct: true }]);
});

console.log("\nall concept-check tests green");
