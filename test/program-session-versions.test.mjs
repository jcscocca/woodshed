import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveSessionVersions } from "../src/program/sessionVersions.js";
import { normalizeProgress, recordAttempt, sessionProgress } from "../src/program/progress.js";
import { guidedSessionPlan } from "../src/program/sessionPlan.js";
import { clearAllPracticeDrafts, clearPracticeDraft, findPracticeDraftForSession, hasPracticeDraftForSession, readPracticeDraft, writePracticeDraft } from "../src/program/drafts.js";

const legacy = { id:"saved-day-1-b",unitId:"original-unit",day:1,slot:"B",title:"The music visit",blocks:[
  {exerciseId:"old-chord",minutes:4},{exerciseId:"same-piece",minutes:8},{exerciseId:"old-reading",minutes:4},{exerciseId:"same-listening",minutes:4},
] };
const revised = { ...legacy,id:`${legacy.id}:music-v2`,legacySessionId:legacy.id,planVersion:"music-v2",blocks:[
  {exerciseId:"new-music-preparation",minutes:4},{exerciseId:"same-piece",minutes:10},{exerciseId:"new-harmony-context",minutes:3},{exerciseId:"same-listening",minutes:3},
] };
const unchanged = { id:"unchanged-day-2-a",unitId:"original-unit",blocks:[{exerciseId:"unchanged-reading",minutes:20}] };
const report = (patch={}) => ({exerciseId:"old-chord",sessionId:legacy.id,blockIndex:0,section:"guided",minutes:4,assessment:"practising",date:"2026-10-01",note:"Keep the original hand crossing.",...patch});
const select = (p,options) => resolveSessionVersions(p,[revised,unchanged],[legacy,unchanged],options);
const due = [{exercise:{id:"earlier-study",section:"guided"},dueDate:"2026-10-01",previousAttempt:{date:"2026-09-28",minutes:3,assessment:"ready"}}];

function withDraftStorage(fn) {
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,"sessionStorage"),values=new Map();
  const storage={get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  Object.defineProperty(globalThis,"sessionStorage",{configurable:true,value:storage});
  clearAllPracticeDrafts();
  try{return fn(storage,values);}finally{clearAllPracticeDrafts();if(descriptor)Object.defineProperty(globalThis,"sessionStorage",descriptor);else delete globalThis.sessionStorage;}
}

test("new learners get the revised sequence while unchanged visits keep their identity",()=>{
  const result=select({});
  assert.equal(result[0],revised);
  assert.equal(result[1],unchanged);
  assert.equal(sessionProgress({},revised).completed,0);
});

test("saved partial practice resumes its original exercise, index and minute allocation",()=>{
  const p=recordAttempt({},report()),before=JSON.stringify(p);
  const result=select(p)[0];
  assert.equal(result.id,legacy.id);
  assert.deepEqual(result.blocks,legacy.blocks);
  assert.equal(result.retainedPlan,true);
  assert.equal(result.retainedPlanReason,"saved-practice");
  assert.equal(result.currentSessionId,revised.id);
  assert.equal(sessionProgress(p,result).nextBlock,1);
  assert.equal(sessionProgress(p,revised).completed,0);
  assert.equal(guidedSessionPlan(p,result,due,{today:"2026-10-04"}).reviewMinutes,0);
  assert.equal(guidedSessionPlan(p,result,due,{today:"2026-10-04"}).blocks.reduce((n,b)=>n+b.minutes,0),20);
  assert.equal(JSON.stringify(p),before,"choosing a plan does not rewrite saved progress");
});

test("completion-only imports keep old completion without granting any revised task",()=>{
  const p=normalizeProgress({completedBlocks:{[legacy.id]:[0,1,2,3]},placement:{"place-reading":"ready"}}),before=JSON.stringify(p);
  const chosen=select(p)[0];
  assert.equal(chosen.retainedPlanReason,"completed");
  assert.equal(sessionProgress(p,chosen).done,true);
  assert.equal(sessionProgress(p,revised).done,false);
  assert.deepEqual(sessionProgress(p,revised).completedBlocks,[]);
  assert.equal(JSON.stringify(p),before);
});

test("an original session's saved integrated review retains its original seventeen-minute allocation",()=>{
  const p=recordAttempt({},{exerciseId:"earlier-study",section:"review",reviewForSession:legacy.id,minutes:3,assessment:"ready",date:"2026-10-01",reviewCheck:{assessment:"practising",beforeDemo:true,bpm:44,hands:"R",fromBar:1,toBar:2,techniqueScope:"chunk"}});
  const chosen=select(p)[0],plan=guidedSessionPlan(p,chosen,due,{today:"2026-10-04"});
  assert.equal(chosen.id,legacy.id);
  assert.equal(plan.reviewDone,true);
  assert.equal(plan.blocks.reduce((n,b)=>n+b.minutes,0),17);
  assert.equal(sessionProgress(p,chosen).completed,0);
  assert.equal(p.attempts[0].reviewCheck.assessment,"practising");
});

test("dated imports retain their recorded context instead of being remapped to new blocks",()=>{
  const p=recordAttempt({},report({date:"2099-12-31",minutes:0}));
  const chosen=select(p)[0];
  assert.equal(chosen.id,legacy.id,"an explicit old block mark remains associated with that old plan");
  assert.equal(p.attempts[0].date,"2099-12-31");
  assert.equal(p.attempts[0].minutes,0);
  assert.equal(sessionProgress(p,revised).completed,0);
  assert.equal(select({completedBlocks:{[legacy.id]:[999]}})[0],revised,"an out-of-range mark does not identify a real old block");
});

test("reports in the revised session never silently complete the old visit",()=>{
  const p=recordAttempt({},report({exerciseId:revised.blocks[0].exerciseId,sessionId:revised.id}));
  assert.equal(select(p)[0],revised);
  assert.equal(sessionProgress(p,legacy).completed,0);
  assert.equal(sessionProgress(p,revised).completed,1);
});

test("completing the revised visit advances the course while an earlier partial plan stays available",()=>{
  let p=recordAttempt({},report());
  for(const [blockIndex,block] of revised.blocks.entries()) p=recordAttempt(p,report({exerciseId:block.exerciseId,sessionId:revised.id,blockIndex}));
  const before=JSON.stringify(p),chosen=select(p)[0];
  assert.equal(chosen.id,revised.id);
  assert.equal(sessionProgress(p,chosen).done,true);
  assert.equal(chosen.retainedPlan,undefined,"the selected visit is the explicitly completed revised plan");
  assert.equal(chosen.retainedEarlierPlan.id,legacy.id);
  assert.deepEqual(chosen.retainedEarlierPlan.blocks,legacy.blocks);
  assert.equal(chosen.retainedEarlierPlan.retainedPlanReason,"saved-practice");
  assert.equal(sessionProgress(p,chosen.retainedEarlierPlan).done,false);
  assert.deepEqual(sessionProgress(p,chosen.retainedEarlierPlan).completedBlocks,[0]);
  assert.equal(sessionProgress(p,chosen.retainedEarlierPlan).nextBlock,1);
  assert.equal(JSON.stringify(p),before,"selection never rewrites either version's marks or reports");
});

test("a completed revised visit counts even while an original lesson draft remains untouched",()=>withDraftStorage(()=>{
  const key=`${legacy.blocks[1].exerciseId}:lesson:${legacy.id}:1`,abc="X:1\nK:C\nC4|]",draft={note:"Keep my earlier unfinished interpretation",bpm:41,minutes:6,range:{from:2,to:3}};
  writePracticeDraft(key,abc,draft);
  const p=normalizeProgress({completedBlocks:{[revised.id]:[0,1,2,3]}}),before=JSON.stringify(p);
  const chosen=select(p,{hasDraft:findPracticeDraftForSession})[0];
  assert.equal(chosen.id,revised.id);
  assert.equal(sessionProgress(p,chosen).done,true);
  assert.equal(chosen.retainedEarlierPlan.id,legacy.id);
  assert.equal(chosen.retainedEarlierPlan.retainedPlanReason,"unfinished-draft");
  assert.equal(chosen.retainedEarlierPlan.retainedDraftBlockIndex,1);
  assert.equal(chosen.retainedEarlierPlan.retainedDraftKind,"lesson");
  assert.equal(sessionProgress(p,chosen.retainedEarlierPlan).completed,0,"a draft is still not a completion mark");
  assert.deepEqual(readPracticeDraft(key,abc),draft);
  assert.equal(JSON.stringify(p),before);
}));

test("completed original visits remain completed when the revised plan is only partial",()=>{
  const p=normalizeProgress({completedBlocks:{[legacy.id]:[0,1,2,3],[revised.id]:[0]}}),before=JSON.stringify(p);
  const chosen=select(p)[0];
  assert.equal(chosen.id,legacy.id);
  assert.equal(chosen.retainedPlanReason,"completed");
  assert.equal(sessionProgress(p,chosen).done,true);
  assert.equal(sessionProgress(p,revised).done,false);
  assert.deepEqual(sessionProgress(p,revised).completedBlocks,[0]);
  assert.equal(JSON.stringify(p),before);
});

test("partial marks from different plans never combine to complete either version",()=>{
  const p=normalizeProgress({completedBlocks:{[legacy.id]:[0,1],[revised.id]:[2,3]}}),before=JSON.stringify(p);
  const chosen=select(p)[0];
  assert.equal(chosen.id,legacy.id);
  assert.equal(sessionProgress(p,chosen).done,false);
  assert.equal(sessionProgress(p,revised).done,false);
  assert.deepEqual(sessionProgress(p,chosen).completedBlocks,[0,1]);
  assert.deepEqual(sessionProgress(p,revised).completedBlocks,[2,3]);
  assert.equal(chosen.retainedEarlierPlan,undefined);
  assert.equal(JSON.stringify(p),before);
});

test("an unfinished original lesson draft pins its actual version and block without becoming saved history",()=>withDraftStorage(()=>{
  const key=`${legacy.blocks[1].exerciseId}:lesson:${legacy.id}:1`,abc="X:1\nK:C\nC4|]",draft={note:"An unfinished musical join",minutes:6,bpm:41,hands:"R",range:{from:2,to:3}};
  writePracticeDraft(key,abc,draft);
  const chosen=select({}, {hasDraft:findPracticeDraftForSession})[0];
  assert.equal(chosen.id,legacy.id);
  assert.equal(chosen.retainedPlanReason,"unfinished-draft");
  assert.equal(chosen.retainedDraftBlockIndex,1);
  assert.equal(chosen.retainedDraftKind,"lesson");
  assert.equal(sessionProgress({},chosen).completed,0);
  assert.deepEqual(readPracticeDraft(key,abc),draft);
  const plan=guidedSessionPlan({},chosen,due,{today:"2026-10-04"});
  assert.equal(plan.review,null,"a newly due return does not displace an unfinished lesson");
  assert.equal(plan.blocks.reduce((n,b)=>n+b.minutes,0),20);
  clearPracticeDraft(key);
  assert.equal(select({}, {hasDraft:findPracticeDraftForSession})[0],revised);
}));

test("persisted return/fresh drafts pin their session while preserving the integrated review budget",()=>withDraftStorage((storage)=>{
  for(const middle of ["review","transfer-v1:pulse:c:0"]) {
    const key=`earlier-study:${middle}:${legacy.id}:`;
    storage.setItem(`woodshed:lesson-draft:v1:${key}`,JSON.stringify({abc:"X:1\nK:C\nC4|]",draft:{note:"First check still needs a save",reviewCheck:{assessment:"unsure",beforeDemo:true}}}));
    const chosen=select({}, {hasDraft:findPracticeDraftForSession})[0];
    assert.equal(chosen.id,legacy.id);
    assert.equal(chosen.retainedDraftKind,"review");
    assert.equal(chosen.retainedDraftBlockIndex,undefined);
    assert.equal(guidedSessionPlan({},chosen,due,{today:"2026-10-04"}).reviewMinutes,3);
    storage.removeItem(`woodshed:lesson-draft:v1:${key}`);
  }
}));

test("new-version and unrelated drafts cannot accidentally pin an older session",()=>withDraftStorage((storage)=>{
  const abc="X:1\nK:C\nC4|]";
  writePracticeDraft(`new-music-preparation:lesson:${revised.id}:0`,abc,{note:"New version"});
  writePracticeDraft("unrelated:lesson:other-day:0",abc,{note:"Other session"});
  storage.setItem(`woodshed:lesson-draft:v1:${legacy.blocks[0].exerciseId}:lesson:${legacy.id}:0`,"{broken");
  assert.equal(hasPracticeDraftForSession(legacy),false);
  assert.equal(select({}, {hasDraft:findPracticeDraftForSession})[0],revised);
}));

test("disabled draft storage retains newer in-memory work and cannot prevent durable history from loading",()=>withDraftStorage((storage)=>{
  storage.getItem=()=>{throw new Error("Storage denied");};
  storage.setItem=()=>{throw new Error("Storage denied");};
  const key=`${legacy.blocks[0].exerciseId}:lesson:${legacy.id}:0`;
  writePracticeDraft(key,"X:1\nK:C\nC4|]",{note:"Retain memory after a denied write"});
  assert.equal(hasPracticeDraftForSession(legacy),true);
  assert.equal(select({}, {hasDraft:findPracticeDraftForSession})[0].id,legacy.id);
  const p=recordAttempt({},report());
  assert.equal(select(p,{hasDraft:()=>{throw new Error("No storage");}})[0].id,legacy.id);
}));

test("removed bridge navigation preserves its practice, completion, notes and first-check evidence",async()=>{
  const [{freshData},{migrate},{REMOVED_UNIT_REPLACEMENTS}]=await Promise.all([import("../src/engine.js"),import("../src/storage.js"),import("../src/program/legacyPractice.js")]);
  for(const [removed,replacement] of Object.entries(REMOVED_UNIT_REPLACEMENTS)) {
    const state=freshData();state.programUnitId=removed;
    state.programProgress=recordAttempt({},report({exerciseId:`${removed}-piece`,sessionId:`${removed}-d1-a`,note:"Keep my earlier bridge practice."}));
    state.programProgress=recordAttempt(state.programProgress,{exerciseId:`${removed}-piece`,section:"review",minutes:3,date:"2026-10-04",assessment:"ready",reviewCheck:{assessment:"unsure",beforeDemo:true,techniqueScope:"chunk"},note:"First return and later repair stay separate."});
    const before=JSON.stringify(state.programProgress),loaded=migrate(JSON.parse(JSON.stringify(state)));
    assert.equal(loaded.programUnitId,replacement,removed);
    assert.equal(JSON.stringify(loaded.programProgress),before,removed);
  }
});
