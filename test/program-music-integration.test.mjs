import assert from "node:assert/strict";
import { test } from "node:test";
import abcjs from "abcjs";
import { UNITS, SESSIONS, LEGACY_SESSIONS, EXERCISES, HISTORY_EXERCISES, ALL_SESSIONS, sessionsForUnit } from "../src/program/curriculum.js";
import { INTEGRATED_EXERCISES } from "../src/program/musicIntegration.js";
import { ARCHIVED_EXERCISES, ARCHIVED_SESSIONS, REMOVED_UNIT_REPLACEMENTS } from "../src/program/legacyPractice.js";
import { parseScore } from "../src/score/scoreModel.js";
import { recordAttempt, sessionProgress } from "../src/program/progress.js";
import { guidedSessionPlan } from "../src/program/sessionPlan.js";
import { freshData } from "../src/engine.js";
import { migrate } from "../src/storage.js";
import { QUESTION_BY_ID, normalizeKnowledge, knowledgeForExercise } from "../src/program/knowledge.js";

const byId=new Map(EXERCISES.map(e=>[e.id,e]));
const score=e=>parseScore(e.abc,abcjs);
const distinct=values=>[...new Set(values)].sort((a,b)=>a-b);
const passage = (id, hand, fromBar, toBar) => {
  const s=score(byId.get(id)),start=s.bars.find(b=>b.n===fromBar).beat,end=s.bars.find(b=>b.n===toBar+1)?.beat??s.endBeat;
  return s.notes.filter(n=>n.hand===hand&&n.beat>=start&&n.beat<end).map(n=>({midi:n.midi,beat:n.beat-start,dur:n.dur}));
};

test("the existing eight-unit course is revised in place without separate bridge units or visits",()=>{
  assert.equal(UNITS.length,8);assert.equal(SESSIONS.length,80);assert.equal(LEGACY_SESSIONS.length,80);
  assert.ok(UNITS.every(u=>!u.id.startsWith("bridge-") && u.kind!=="bridge"));
  assert.ok(SESSIONS.every(s=>!s.id.startsWith("bridge-")));
  assert.ok(EXERCISES.every(e=>!e.id.startsWith("bridge-")));
  const old=new Map(LEGACY_SESSIONS.map(s=>[s.id,s]));
  assert.ok(SESSIONS.some(s=>s.legacySessionId),"actual existing visits must change, rather than append an optional course");
  for(const current of SESSIONS) {
    const previous=old.get(current.legacySessionId||current.id);
    assert.ok(previous,current.id);
    assert.deepEqual([current.unitId,current.day,current.slot],[previous.unitId,previous.day,previous.slot]);
    assert.equal(current.blocks.reduce((n,b)=>n+b.minutes,0),20,current.id);
    for(const b of current.blocks) assert.ok(byId.has(b.exerciseId),`${current.id}: ${b.exerciseId}`);
    if(current.legacySessionId) {
      assert.notEqual(current.id,previous.id,"new teaching tasks cannot reuse old completion marks");
      assert.equal(current.planVersion,"music-v2");
      assert.ok(current.blocks.some(b=>b.goal),`${current.id}: explain the preparation's use in the music`);
    }
  }
});

test("only three focused new preparations are introduced and each precedes its named destination",()=>{
  assert.equal(INTEGRATED_EXERCISES.length,3);
  for(const e of INTEGRATED_EXERCISES) {
    assert.ok(EXERCISES.includes(e),e.id);
    const occurrences=SESSIONS.filter(s=>s.blocks.some(b=>b.exerciseId===e.id));
    assert.ok(occurrences.length,e.id);
    for(const link of e.musicConnections) {
      const applications=occurrences.filter(s=>s.blocks.some(b=>b.exerciseId===link.exerciseId));
      assert.ok(applications.length,`${e.id}: its named destination ${link.exerciseId} must receive an application visit`);
      for(const s of applications)assert.ok(s.blocks.findIndex(b=>b.exerciseId===e.id)<s.blocks.findIndex(b=>b.exerciseId===link.exerciseId),`${s.id}: ${e.id} must occur before ${link.exerciseId}, not merely before an unrelated final activity`);
    }
  }
});

test("reused exact preparations match the destination's actual notes, rhythm and register",()=>{
  for(const [prep,destination,prepStart,destinationStart,hands] of [
    ["g-coord-broken-under","g-music-first-train",1,1,["L"]],
    ["f3-chord-ballad","f3-music-paper-boats",1,1,["L"]],
    ["a6-coord-left-melody","a6-two-rooms",1,5,["L"]],
    ["m8-bass-led-reading","m8-form-ab",1,5,["R","L"]],
  ])for(const hand of hands)assert.deepEqual(passage(prep,hand,prepStart,prepStart+3),passage(destination,hand,destinationStart,destinationStart+3),`${prep}: ${hand} must match the actual ${destination} passage`);
  assert.deepEqual(passage("d-canon-minor-lh-prep","L",1,1),passage("d-canon-bass-chords","L",3,3));
  assert.deepEqual(passage("d-canon-minor-lh-prep","L",3,3),passage("d-canon-bass-chords","L",4,4));
  const voicings=id=>{
    const groups=new Map();
    for(const n of score(byId.get(id)).notes.filter(n=>n.hand==="R")){
      if(!groups.has(n.beat))groups.set(n.beat,[]);groups.get(n.beat).push(n.midi);
    }
    return new Set([...groups.values()].map(notes=>distinct(notes).join(",")));
  };
  assert.deepEqual(voicings("m8-cadence-transfer"),new Set(["64,67,72","65,69,72","62,65,71"]));
  const destination=passage("m8-form-ab","R",5,8),groups=new Map();
  for(const n of destination){if(!groups.has(n.beat))groups.set(n.beat,[]);groups.get(n.beat).push(n.midi);}
  assert.deepEqual(new Set([...groups.values()].map(notes=>distinct(notes).join(","))),voicings("m8-cadence-transfer"));
});

test("C4B explains the unchanged worksheet's reordered chords and the destination's different G bar",()=>{
  assert.deepEqual(passage("coord-broken-chords","L",1,3),passage("music-after-rain","L",1,3));
  assert.deepEqual(passage("coord-broken-chords","L",4,4),[{midi:43,beat:0,dur:1},{midi:47,beat:1,dur:1},{midi:48,beat:2,dur:2}]);
  assert.deepEqual(passage("music-after-rain","L",4,4),[{midi:43,beat:0,dur:1},{midi:47,beat:1,dur:1},{midi:50,beat:2,dur:1},{midi:47,beat:3,dur:1}]);
  const session=SESSIONS.find(s=>s.legacySessionId==="c1-d4-b"),chords=byId.get("chord-pop-loop");
  assert.deepEqual(score(chords).notes.filter(n=>n.hand==="L").map(n=>n.midi),[48,43,45,41],"the saved C–G–Am–F worksheet is unchanged");
  assert.match(session.blocks[0].goal,/C–G–Am–F.*reorder.*C–Am–F–G/);
  assert.match(session.blocks[1].goal,/G2–B2–C3.*G2–B2–D3–B2.*5–3–1–3/);
  assert.match(session.blocks[2].goal,/bar 4 with LH alone.*four quarters/);
  assert.match(byId.get("coord-broken-chords").steps.at(-1),/Only bars 1–3.*two beats.*5–2–1.*four quarters.*5–3–1–3/);
  assert.match(byId.get("music-after-rain").steps.at(-1),/select bar 4 with LH alone.*G2–B2–D3–B2.*5–3–1–3/i);
});

test("Canon preparation sounds the actual B-minor and F-sharp-minor LH root/upper shapes",()=>{
  const e=INTEGRATED_EXERCISES.find(e=>e.unitId==="d-major-foundations-5");
  const s=score(e),left=s.notes.filter(n=>n.hand==="L");
  assert.deepEqual(distinct(left.map(n=>n.midi)),[42,45,47,49,50,54,59]);
  for(const chord of [[50,54,59],[45,49,54]]) {
    assert.ok(left.some(n=>JSON.stringify(distinct(left.filter(m=>m.beat===n.beat).map(m=>m.midi)))===JSON.stringify(chord)),`${e.id}: upper chord ${chord}`);
  }
});

test("Mozart preparation uses the real stationary A4–E5 shape instead of a scale crossing",()=>{
  const e=INTEGRATED_EXERCISES.find(e=>e.unitId==="a-major-foundations-6");
  const pitches=score(e).notes.filter(n=>n.hand==="R").map(n=>n.midi);
  assert.deepEqual(distinct(pitches),[69,71,73,74,76]);
  assert.ok(e.fingering.replace(/[^1-5]/g,"").includes("12345"),e.id);
});

test("the blues preparation teaches all four tones of E7, A7 and B7",()=>{
  const e=INTEGRATED_EXERCISES.find(e=>e.unitId==="e-major-foundations-7");
  const s=score(e);
  for(const pcs of [[2,4,8,11],[1,4,7,9],[3,6,9,11]]) {
    assert.ok(s.bars.some((bar,index)=>{
      const end=s.bars[index+1]?.beat??s.endBeat;
      return JSON.stringify(distinct(s.notes.filter(n=>n.beat>=bar.beat&&n.beat<end).map(n=>n.midi%12)))===JSON.stringify(pcs);
    }),`${e.id}: complete seventh chord ${pcs}`);
  }
  const original=byId.get("e7-switchyard-blues");
  assert.ok(score(original).notes.some(n=>n.hand==="R"&&n.midi%12===7),"written G naturals remain a deliberate part of the original blues");
});

test("old completion and unfinished blocks are preserved without crediting new preparation",()=>{
  const updated=SESSIONS.find(s=>s.legacySessionId&&s.blocks[0].exerciseId!==LEGACY_SESSIONS.find(old=>old.id===s.legacySessionId).blocks[0].exerciseId);
  assert.ok(updated,"an actual preparation replacement is present");
  const old=LEGACY_SESSIONS.find(s=>s.id===updated.legacySessionId);
  const p=recordAttempt({},{exerciseId:old.blocks[0].exerciseId,sessionId:old.id,blockIndex:0,section:"guided",minutes:3,assessment:"practising",date:"2026-10-01",note:"Keep my saved next step."});
  const before=JSON.stringify(p),selected=sessionsForUnit(old.unitId,p).find(s=>s.day===old.day&&s.slot===old.slot);
  assert.equal(selected.id,old.id);assert.deepEqual(selected.blocks,old.blocks);
  assert.equal(sessionProgress(p,selected).nextBlock,1);assert.equal(sessionProgress(p,updated).completed,0);
  const plan=guidedSessionPlan(p,selected,[{exercise:byId.get(old.blocks[0].exerciseId),dueDate:"2026-10-02"}],{today:"2026-10-10"});
  assert.equal(plan.reviewMinutes,0);assert.equal(plan.totalMinutes,20);
  assert.equal(JSON.stringify(p),before);
});

test("removed-unit reports and concept answers remain readable after backup migration",()=>{
  const state=freshData();state.programUnitId="bridge-bb-major";
  const entry={exerciseId:"bridge-bb-major-read",section:"guided",sessionId:"bridge-bb-major-d1-a",blockIndex:0,date:"2026-10-01",minutes:4,assessment:"practising",note:"Preserve this earlier report.",knowledgeResults:[{questionId:"bridge-bb-signature",choice:0}]};
  state.programProgress=recordAttempt(state.programProgress,entry);
  const before=JSON.stringify(state.programProgress),loaded=migrate(JSON.parse(JSON.stringify(state)));
  assert.equal(loaded.programUnitId,REMOVED_UNIT_REPLACEMENTS[state.programUnitId]);
  assert.equal(JSON.stringify(loaded.programProgress),before);
  assert.ok(HISTORY_EXERCISES.some(e=>e.id===entry.exerciseId&&e.title&&e.archived));
  assert.equal(ARCHIVED_EXERCISES.length,27);assert.equal(ARCHIVED_SESSIONS.length,32);
  assert.ok(ALL_SESSIONS.some(s=>s.id===entry.sessionId&&s.title&&s.archived));
  assert.equal(QUESTION_BY_ID["bridge-bb-signature"].archived,true);
  assert.equal(normalizeKnowledge(entry.knowledgeResults)[0].correct,true);
  assert.deepEqual(knowledgeForExercise({id:entry.exerciseId}),[],"historical questions cannot appear as a new active course");
});
