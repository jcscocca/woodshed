import assert from "node:assert/strict";
import { test } from "node:test";
import { SCALE_EXERCISES } from "../src/program/scales.js";
import { techniqueCheckpoint, techniqueBarCount, techniquePreparation } from "../src/program/techniqueProgress.js";
import { scaleSuggestion } from "../src/program/scalePathProgress.js";

const today = "2026-11-05", options = { today }, byId = new Map(SCALE_EXERCISES.map((exercise) => [exercise.id, exercise]));
const cR = byId.get("sc-major-c-1-r"), cL = byId.get("sc-major-c-1-l"), cBoth = byId.get("sc-major-c-1-both"), cTwo = byId.get("sc-major-c-2-r");
const report = (exercise = cR, patch = {}) => ({ exerciseId: exercise.id, section: "scales", date: "2026-11-01", assessment: "ready", minutes: 5,
  hands: exercise.hands, bpm: 40, fromBar: 1, toBar: 4, techniqueScope: "round-trip", ...patch });
const returned = (exercise = cR, patch = {}, checkPatch = {}) => report(exercise, { section: "review", date: "2026-11-04",
  reviewCheck: { assessment: "ready", beforeDemo: true, hands: exercise.hands, bpm: 40, fromBar: 1, toBar: 4, techniqueScope: "round-trip", ...checkPatch }, ...patch });
const progress = (...attempts) => ({ attempts });
const checkpoint = (...attempts) => techniqueCheckpoint(progress(...attempts), cR, options);

test("written scale and arpeggio scopes come from their actual first-voice bars", () => {
  assert.equal(techniqueBarCount(cR), 4);
  assert.equal(techniqueBarCount(cTwo), 8);
  assert.equal(techniqueBarCount(byId.get("sc-arpeggio-c-major-1-r")), 2);
  assert.equal(techniqueBarCount({}), 0);
  const empty = checkpoint();
  assert.equal(empty.kind, "new"); assert.equal(empty.requiredBars, 4); assert.equal(empty.fullRangeReported, false);
});

test("selecting the whole score cannot turn an explicitly small chunk or old log into a round trip", () => {
  for (const techniqueScope of [undefined, "chunk", "ascent"]) {
    const state = checkpoint(report(cR, { techniqueScope }));
    assert.equal(state.kind, "chunk", String(techniqueScope)); assert.equal(state.fullRangeReported, false);
  }
});

test("full range also requires the actual complete passage and intended hands", () => {
  for (const patch of [{toBar:2},{toBar:99},{fromBar:2},{hands:"L"},{hands:undefined}]) assert.equal(checkpoint(report(cR,patch)).fullRangeReported,false,JSON.stringify(patch));
  assert.equal(checkpoint(report(cR,{hands:"both"})).fullRangeReported,true);
  assert.equal(techniqueCheckpoint(progress(report(cBoth,{hands:"R"})),cBoth,options).fullRangeReported,false);
  assert.equal(techniqueCheckpoint(progress(report(cBoth,{hands:"separate"})),cBoth,options).fullRangeReported,false);
});

test("a full ready visit reports range without inventing delayed recall", () => {
  const state=checkpoint(report());
  assert.equal(state.kind,"full-range"); assert.equal(state.steadyFullRangeReported,true); assert.equal(state.delayedSteadyReported,false);
  assert.equal(checkpoint(report(),returned(cR,{date:"2026-11-01"})).delayedSteadyReported,false);
});

test("a comparable first full return on a later day supplies only a learner-reported checkpoint", () => {
  const p=progress(report(),returned(cR,{}, {bpm:44})), snapshot=JSON.stringify(p);
  const state=techniqueCheckpoint(p,cR,options);
  assert.equal(state.kind,"delayed-steady"); assert.equal(state.delayedSteadyReported,true);
  assert.equal(state.label,"Steady full return reported"); assert.equal("mastered" in state,false); assert.equal(JSON.stringify(p),snapshot);
});

test("assistance, slower tempo, narrower range, wrong hand or incomplete actual route cannot earn a full return", () => {
  for (const patch of [{beforeDemo:false},{bpm:36},{toBar:2},{hands:"L"},{techniqueScope:"ascent"},{techniqueScope:"chunk"},{techniqueScope:undefined}]) {
    assert.equal(checkpoint(report(),returned(cR,{},patch)).delayedSteadyReported,false,JSON.stringify(patch));
  }
  assert.equal(techniqueCheckpoint(progress(report(cBoth),returned(cBoth,{}, {hands:"R",bpm:80})),cBoth,options).delayedSteadyReported,false,"higher tempo in one hand cannot cover the two-hand setup");
});

test("ordinary practice before the first check and difficult first results survive a same-day repair", () => {
  assert.equal(checkpoint(report(),report(cR,{date:"2026-11-04"}),returned()).delayedSteadyReported,false);
  const difficult=returned(cR,{}, {assessment:"practising"});
  const state=checkpoint(report(),difficult,report(cR,{date:"2026-11-04"}));
  assert.equal(state.delayedSteadyReported,false); assert.equal(state.steadyFullRangeReported,false);
  assert.equal(scaleSuggestion(progress(report(),difficult,report(cR,{date:"2026-11-04"})),[cR,cL],[],options).kind,"repair");
});

test("zero-minute, placement, fresh-example, future and invalid reports cannot create scope evidence", () => {
  const state=checkpoint(...[{minutes:0},{section:"placement"},{section:"transfer"},{date:"2026-11-06"},{date:"2026-02-30"}].map(patch=>report(cR,patch)));
  assert.equal(state.kind,"new"); assert.equal(state.lastAttempt,null);
});

test("two-octave advice returns to the matching one-octave hand and its delayed scope", () => {
  let prep=techniquePreparation(progress(report()),cTwo,SCALE_EXERCISES,options);
  assert.equal(prep.exercise,cR); assert.equal(prep.delayed,true);
  prep=techniquePreparation(progress(report(),returned()),cTwo,SCALE_EXERCISES,options);
  assert.equal(prep,null);
  const onlyLeft=progress(report(cL),returned(cL));
  assert.equal(techniquePreparation(onlyLeft,cTwo,SCALE_EXERCISES,options).exercise,cR);
});

test("suggestions extend partial work, allow the next hand, and keep longer-range preparation optional", () => {
  assert.equal(scaleSuggestion(progress(report(cR,{techniqueScope:"chunk"})),[cR,cL],[],options).kind,"extend");
  assert.deepEqual(scaleSuggestion(progress(report()),[cR,cL],[],options),{kind:"new",exercise:cL});
  const prep=scaleSuggestion(progress(report()),[cTwo],[],{...options,allExercises:SCALE_EXERCISES});
  assert.equal(prep.kind,"prepare"); assert.equal(prep.exercise,cR); assert.equal(prep.targetExercise,cTwo);
  assert.equal(scaleSuggestion(progress(report(),returned()),[cTwo],[],{...options,allExercises:SCALE_EXERCISES}).kind,"new");
  assert.equal(scaleSuggestion(progress(report()),[cR],[],options).kind,"recall");
});
