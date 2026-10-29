import assert from "node:assert/strict";
import { test } from "node:test";
import { EXERCISES, SESSIONS } from "../src/program/curriculum.js";
import { QUESTIONS, QUESTION_BY_ID } from "../src/program/knowledge.js";
import { normalizeProgress, recordAttempt, editAttempt, removeAttempt, exerciseProgress, sessionProgress } from "../src/program/progress.js";
import { reviewQueue } from "../src/program/review.js";
import { guidedSessionPlan } from "../src/program/sessionPlan.js";
import { conceptReviewQueue } from "../src/program/conceptReview.js";
import { reviewWorkload, makeReviewVisit, reviewVisitProgress, readReviewVisit, saveReviewVisit, clearReviewVisit } from "../src/program/reviewVisits.js";
import { techniqueBarCount, techniqueCheckpoint } from "../src/program/techniqueProgress.js";
import { clearAllPracticeDrafts } from "../src/program/drafts.js";
import { addDays } from "../src/dateUtils.js";
import { migrate } from "../src/storage.js";
import { freshData } from "../src/engine.js";

const today="2026-10-28";
const sample=EXERCISES.filter(exercise=>exercise.section!=="placement").slice(0,7);
const due=sample.map((exercise,index)=>({exercise,dueDate:addDays(today,-index),previousAttempt:{date:addDays(today,-10),minutes:3,assessment:"ready"}}));
const visit=()=>makeReviewVisit(due,{today,id:"review-visit:2026-10-28:test"});
const report=(exerciseId,patch={})=>({exerciseId,date:today,minutes:4,assessment:"ready",section:"review",...patch});
const knowledge=(choice,patch={})=>({exerciseId:"g-key-f-sharp",date:today,section:"knowledge",minutes:0,assessment:"unsure",knowledgeResults:[{questionId:"g-signature",version:1,choice}],...patch});

function withStorage(fn){
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,"sessionStorage"),values=new Map();
  Object.defineProperty(globalThis,"sessionStorage",{configurable:true,value:{get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)}});
  clearAllPracticeDrafts();
  try{return fn(values);}finally{clearAllPracticeDrafts();if(descriptor)Object.defineProperty(globalThis,"sessionStorage",descriptor);else delete globalThis.sessionStorage;}
}

test("review workload exposes the whole valid backlog and recommends consolidation at the documented thresholds",()=>{
  assert.deepEqual(reviewWorkload(due,{today}),{dueCount:7,estimatedMinutes:21,oldestDaysOverdue:6,consolidationRecommended:true});
  assert.equal(reviewWorkload(due.slice(0,4),{today}).consolidationRecommended,false);
  const old=due.slice(0,3).map(item=>({...item,dueDate:addDays(today,-7)}));
  assert.equal(reviewWorkload(old,{today}).consolidationRecommended,true);
  assert.equal(reviewWorkload(old.slice(0,2),{today}).consolidationRecommended,false);
  const mixed=[...due,{dueDate:"2099-01-01"},{dueDate:"2026-02-30"},{},null];
  assert.deepEqual(reviewWorkload(mixed,{today}),reviewWorkload(due,{today}));
  assert.equal(reviewWorkload(mixed,{today:"not-a-day"}).dueCount,0);
});

test("consolidation plans use at most five distinct original passages in exactly twenty minutes",()=>{
  for(let count=1;count<=7;count++){
    const current=makeReviewVisit([...due.slice(0,count),due[0]],{today,id:`review-visit:test:${count}`});
    assert.deepEqual(current.exerciseIds,due.slice(0,Math.min(count,5)).map(item=>item.exercise.id));
    assert.equal(current.minutes.reduce((sum,value)=>sum+value,0),20);
    assert.ok(current.minutes.every(value=>Number.isInteger(value)&&value>=4));
    assert.equal(new Set(current.exerciseIds).size,current.exerciseIds.length);
  }
  for(const invalid of [null,{},[],[null,{}, {exercise:{id:"bad id"}}]])assert.equal(makeReviewVisit(invalid,{today}),null);
});

test("only dated reports for the exact consolidation identity/index complete its checks, without guided credit",()=>{
  const plan=visit(),first=plan.exerciseIds[0];
  let p=recordAttempt({},report(first,{reviewVisitId:plan.id,reviewVisitIndex:0,sessionId:SESSIONS[0].id,blockIndex:0}));
  assert.deepEqual(reviewVisitProgress(p,plan,{today}),{completed:[0],nextIndex:1,done:false});
  assert.deepEqual(p.completedBlocks,{});
  const impostors=[
    report(plan.exerciseIds[1],{reviewVisitId:"review-visit:other",reviewVisitIndex:1}),
    report(first,{reviewVisitId:plan.id,reviewVisitIndex:1}),
    report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1,section:"transfer"}),
    report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1,section:"knowledge"}),
    report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1,minutes:0}),
    report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1,date:"2099-01-01"}),
    report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1,date:undefined}),
    report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1,date:"2026-02-30"}),
  ];
  // Normalize imported records directly: recordAttempt deliberately supplies
  // today's date for a new valid user action that omits it.
  p=normalizeProgress({...p,attempts:[...p.attempts,...impostors]});
  assert.deepEqual(reviewVisitProgress(p,plan,{today}).completed,[0]);
  assert.deepEqual(reviewVisitProgress(p,plan,{today:"bad"}),{completed:[],nextIndex:-1,done:false});
  for(const malformed of [null,{}, {...plan,exerciseIds:undefined}, {...plan,minutes:[20]}, {...plan,exerciseIds:[first,first]}])
    assert.deepEqual(reviewVisitProgress(p,malformed,{today}),{completed:[],nextIndex:-1,done:false});
  for(let index=1;index<plan.exerciseIds.length;index++)p=recordAttempt(p,report(plan.exerciseIds[index],{reviewVisitId:plan.id,reviewVisitIndex:index}));
  assert.equal(reviewVisitProgress(p,plan,{today}).done,true);
  assert.deepEqual(p.completedBlocks,{});
  assert.equal(SESSIONS.some(session=>sessionProgress(p,session).done),false);
});

test("saved consolidation plans resume the same checks, and correction/removal reopens only the affected report",()=>withStorage(values=>{
  const plan=visit();values.set("unrelated-preference","keep");saveReviewVisit(plan);
  assert.deepEqual(readReviewVisit(EXERCISES),plan);
  let p=recordAttempt({},report(plan.exerciseIds[0],{reviewVisitId:plan.id,reviewVisitIndex:0}));
  p=recordAttempt(p,report(plan.exerciseIds[1],{reviewVisitId:plan.id,reviewVisitIndex:1}));
  const corrected=editAttempt(p,0,{minutes:2,assessment:"practising",note:"Repair this exact return."});
  assert.deepEqual(reviewVisitProgress(corrected,readReviewVisit(EXERCISES),{today}).completed,[0,1]);
  const future=editAttempt(corrected,0,{date:"2099-01-01"});
  assert.deepEqual(reviewVisitProgress(future,plan,{today}).completed,[1]);
  const removed=removeAttempt(corrected,0);
  assert.deepEqual(reviewVisitProgress(removed,plan,{today}),{completed:[1],nextIndex:0,done:false});
  assert.deepEqual(readReviewVisit(EXERCISES),plan,"correction does not silently rebuild the saved exercise ordering");
  assert.equal(readReviewVisit(EXERCISES.filter(exercise=>exercise.id!==plan.exerciseIds[0])),null);
  assert.equal(readReviewVisit(EXERCISES.map(exercise=>exercise.id===plan.exerciseIds[0]?{...exercise,archived:true}:exercise)),null);
  clearReviewVisit();assert.equal(readReviewVisit(EXERCISES),null);assert.equal(values.get("unrelated-preference"),"keep");
}));

test("concept mistakes have an independent same-day repair and next-day confirmation loop",()=>{
  let p=recordAttempt({},knowledge(0,{section:"guided",minutes:5,assessment:"ready",date:"2026-10-01"}));
  const before=exerciseProgress(p,"g-key-f-sharp");
  assert.equal(conceptReviewQueue(p,EXERCISES,{today:"2026-10-01"}).length,1);
  p=recordAttempt(p,knowledge(1,{date:"2026-10-01"}));
  assert.equal(conceptReviewQueue(p,EXERCISES,{today:"2026-10-01"}).length,0);
  const upcoming=conceptReviewQueue(p,EXERCISES,{today:"2026-10-01",includeUpcoming:true});
  assert.equal(upcoming[0].dueDate,"2026-10-02");assert.equal(upcoming[0].repairedToday,true);
  assert.equal(conceptReviewQueue(p,EXERCISES,{today:"2026-10-02"}).length,1);
  p=recordAttempt(p,knowledge(1,{date:"2026-10-02"}));
  assert.deepEqual(conceptReviewQueue(p,EXERCISES,{today:"2026-10-02",includeUpcoming:true}),[]);
  const after=exerciseProgress(p,"g-key-f-sharp");
  for(const key of ["practiceCount","minutes","status","lastPractised"])assert.deepEqual(after[key],before[key],key);
  assert.deepEqual(reviewQueue(p,EXERCISES,{today:"2026-10-04"}).map(item=>[item.exercise.id,item.dueDate]),[["g-key-f-sharp","2026-10-04"]]);
  p=recordAttempt(p,knowledge(0,{date:"2026-10-03"}));
  assert.equal(conceptReviewQueue(p,EXERCISES,{today:"2026-10-03"})[0].dueDate,"2026-10-03","a later error reopens that idea");
});

test("future, malformed and historical answers cannot populate the active concept queue",()=>{
  const historical=QUESTIONS.find(question=>question.archived),base=knowledge(0);
  const attempts=[
    {...base,date:"2099-01-01"}, {...base,date:"2026-02-30"}, {...base,date:undefined},
    {...base,exerciseId:"unknown-exercise"},
    {...base,knowledgeResults:[{questionId:"unknown-question",choice:0}]},
    {...base,knowledgeResults:[{questionId:"g-signature",version:99,choice:0}]},
    {...base,knowledgeResults:[{questionId:"g-signature",version:1,choice:999}]},
    {...base,knowledgeResults:[{questionId:historical.id,version:historical.version,choice:(historical.answer+1)%historical.options.length}]},
  ];
  assert.deepEqual(conceptReviewQueue({attempts},EXERCISES,{today}),[]);
  assert.deepEqual(conceptReviewQueue({attempts:[base]},EXERCISES,{today:"bad"}),[]);
  assert.equal(normalizeProgress({attempts}).attempts.at(-1).knowledgeResults[0].questionId,historical.id,"historical answers remain interpretable in saved history");
});

test("knowledge-only records cannot create piano readiness, technique range, review work or guided marks",()=>{
  const technique=EXERCISES.find(exercise=>exercise.technique),bars=techniqueBarCount(technique);
  const p=recordAttempt({},knowledge(0,{exerciseId:technique.id,minutes:50,assessment:"ready",hands:"both",bpm:80,fromBar:1,toBar:bars,techniqueScope:"round-trip",sessionId:SESSIONS[0].id,blockIndex:0,reviewVisitId:"review-visit:forged",reviewVisitIndex:0}));
  const summary=exerciseProgress(p,technique.id);
  assert.equal(summary.practiceCount,0);assert.equal(summary.minutes,0);assert.equal(summary.status,"new");assert.equal(summary.lastAttempt,null);
  assert.equal(techniqueCheckpoint(p,technique,{today}).kind,"new");
  assert.deepEqual(reviewQueue(p,EXERCISES,{today:addDays(today,10)}),[]);
  assert.deepEqual(p.completedBlocks,{});
  assert.equal(p.attempts[0].sessionId,undefined);assert.equal(p.attempts[0].reviewVisitId,undefined);
});

test("new learning repair fields survive backup migration without rewriting original completion or old concept answers",()=>{
  const state=freshData(),session=SESSIONS[0],plan=visit(),historical=QUESTIONS.find(question=>question.archived);
  state.programProgress=recordAttempt({},report(session.blocks[0].exerciseId,{section:"guided",sessionId:session.id,blockIndex:0,note:"Keep this earlier report.",knowledgeResults:[{questionId:historical.id,version:historical.version,choice:historical.answer}]}));
  state.programProgress=recordAttempt(state.programProgress,report(plan.exerciseIds[0],{reviewVisitId:plan.id,reviewVisitIndex:0,reviewCheck:{assessment:"practising",beforeDemo:true,bpm:44,hands:"R",fromBar:1,toBar:1}}));
  state.programProgress=recordAttempt(state.programProgress,knowledge(0));
  const before=JSON.stringify(state.programProgress),loaded=migrate(JSON.parse(JSON.stringify(state)));
  assert.equal(JSON.stringify(loaded.programProgress),before);
  assert.deepEqual(loaded.programProgress.completedBlocks,{[session.id]:[0]});
  assert.equal(loaded.programProgress.attempts[1].reviewCheck.assessment,"practising");
  assert.equal(loaded.programProgress.attempts[0].knowledgeResults[0].questionId,historical.id);
});
