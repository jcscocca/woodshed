import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { EXERCISES, SESSIONS, LEGACY_SESSIONS } from "../../src/program/curriculum.js";
import { freshData } from "../../src/engine.js";
import { recordAttempt } from "../../src/program/progress.js";

const key="woodshed-state-v1";
const byId=new Map(EXERCISES.map(e=>[e.id,e]));
const old=LEGACY_SESSIONS.find(s=>s.id==="c1-d4-b");
const current=SESSIONS.find(s=>s.legacySessionId===old.id);
const card=page=>page.locator(".pg-session-grid .pg-card").filter({has:page.getByRole("heading",{name:old.title,exact:true})});
const note=page=>page.getByRole("textbox",{name:"One thing to try next time",exact:true});
const minutes=page=>page.getByRole("spinbutton",{name:"Minutes practised",exact:true});
const seed=async(page,state)=>page.addInitScript(({key,state})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));},{key,state});
const choose=async page=>{
  await page.getByRole("combobox",{name:"Piano unit",exact:true}).selectOption(old.unitId);
  await expect(page.getByRole("combobox",{name:"Piano unit",exact:true}).locator("option")).toHaveCount(8);
  await expect(page.getByRole("option",{name:/Bridge/})).toHaveCount(0);
};
test.beforeEach(async({page})=>{page.__integrationErrors=[];page.on("pageerror",e=>page.__integrationErrors.push(e.message));});
test.afterEach(async({page})=>expect(page.__integrationErrors).toEqual([]));

test("new practice connects the actual broken-chord preparation to After the rain in the existing course",async({page})=>{
  expect(current).toBeTruthy();
  await page.goto("./");await choose(page);
  await expect(page.locator("#ws-main .ws-main")).toHaveCSS("opacity","1");
  const a11y=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  await card(page).getByRole("button",{name:"Open session",exact:true}).click();
  for(let i=0;i<current.blocks.length;i++) {
    const block=current.blocks[i],e=byId.get(block.exerciseId);
    await expect(page.getByRole("heading",{name:e.title,exact:true})).toBeVisible();
    await expect(page.locator(".ws-player-goal")).toHaveText(`This visit: ${block.goal}`);
    await minutes(page).fill("1");await note(page).fill(`Integrated lesson UI fixture block ${i+1}; no piano performance measured.`);
    await page.getByRole("button",{name:"Save practice",exact:true}).click();
    await expect.poll(()=>page.evaluate(({key,sessionId,blockIndex})=>{
      const saved=JSON.parse(localStorage.getItem(key));
      return saved?.programProgress?.completedBlocks?.[sessionId]?.includes(blockIndex)??false;
    },{key,sessionId:current.id,blockIndex:i})).toBe(true);
    if(i+1<current.blocks.length)await expect(page.getByRole("heading",{name:byId.get(current.blocks[i+1].exerciseId).title,exact:true})).toBeVisible();
    if(i===0) {
      await page.reload();await choose(page);
      await card(page).getByRole("button",{name:"Resume · 1/4 blocks",exact:true}).click();
    }
  }
  await expect(page.locator(".pg-notice")).toContainText("Session B saved");
  const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  expect(state.programProgress.attempts.every(a=>a.sessionId===current.id)).toBe(true);
  expect(state.programProgress.completedBlocks[current.id]).toEqual([0,1,2,3]);
  expect(state.programProgress.completedBlocks[old.id]).toBeUndefined();
  await page.getByRole("button",{name:"Progress",exact:true}).click();
  await expect(page.getByText("1/80",{exact:true})).toBeVisible();
  await expect(page.getByRole("region",{name:"Guided bridge progress",exact:true})).toHaveCount(0);
});

test("an existing partial visit resumes the original music block and its eight-minute allocation",async({page})=>{
  const state=freshData();state.programUnitId=old.unitId;
  state.programProgress=recordAttempt(state.programProgress,{exerciseId:old.blocks[0].exerciseId,sessionId:old.id,blockIndex:0,section:"guided",date:"2026-10-01",minutes:3,assessment:"practising",note:"Keep this old chord report."});
  await seed(page,state);await page.goto("./");await choose(page);
  await expect(page.getByRole("region",{name:"Saved lesson plans",exact:true})).toBeVisible();
  await card(page).getByRole("button",{name:"Resume · 1/4 blocks",exact:true}).click();
  await expect(page.getByRole("heading",{name:byId.get(old.blocks[1].exerciseId).title,exact:true})).toBeVisible();
  await expect(minutes(page)).toHaveValue(String(old.blocks[1].minutes));
  await expect(page.locator(".pg-plan-note")).toContainText("retained");
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  expect(saved.programProgress.completedBlocks[old.id]).toEqual([0]);
  expect(saved.programProgress.completedBlocks[current.id]).toBeUndefined();
  await page.reload();await choose(page);
  await card(page).getByRole("button",{name:"Resume · 1/4 blocks",exact:true}).click();
  await expect(page.getByRole("heading",{name:byId.get(old.blocks[1].exerciseId).title,exact:true})).toBeVisible();
});

test("an unfinished draft with no saved block retains its exact original lesson and edits",async({page})=>{
  const e=byId.get(old.blocks[1].exerciseId),state=freshData();state.programUnitId=old.unitId;
  await seed(page,state);
  const draftKey=`woodshed:lesson-draft:v1:${e.id}:lesson:${old.id}:1`;
  const value={abc:e.abc,draft:{note:"Unfinished original-plan UI fixture.",minutes:3,bpm:44,hands:e.hands,range:{from:1,to:2}}};
  await page.addInitScript(({draftKey,value})=>{if(!sessionStorage.getItem(draftKey))sessionStorage.setItem(draftKey,JSON.stringify(value));},{draftKey,value});
  await page.goto("./");await choose(page);
  await card(page).getByRole("button",{name:"Resume · 0/4 blocks",exact:true}).click();
  await expect(page.getByRole("heading",{name:e.title,exact:true})).toBeVisible();
  await expect(note(page)).toHaveValue(value.draft.note);await expect(minutes(page)).toHaveValue("3");
  await expect(page.getByLabel("Through bar",{exact:true})).toHaveValue("2");
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  expect(saved.programProgress.attempts).toEqual([]);expect(saved.programProgress.completedBlocks).toEqual({});
});

test("a completed updated visit counts once while its earlier partial plan remains resumable",async({page})=>{
  const state=freshData();state.programUnitId=old.unitId;
  state.programProgress=recordAttempt({}, {exerciseId:old.blocks[0].exerciseId,sessionId:old.id,blockIndex:0,section:"guided",date:"2026-10-01",minutes:3,assessment:"practising",note:"Original partial plan."});
  for(let blockIndex=0;blockIndex<current.blocks.length;blockIndex++)state.programProgress=recordAttempt(state.programProgress,{exerciseId:current.blocks[blockIndex].exerciseId,sessionId:current.id,blockIndex,section:"guided",date:"2026-10-02",minutes:1,assessment:"practising",note:"Completed updated-plan UI fixture; no piano performance measured."});
  await seed(page,state);await page.goto("./");await choose(page);
  await expect(card(page).getByRole("button",{name:"Revisit session",exact:true})).toBeVisible();
  await page.getByText("Preview updated preparation",{exact:true}).click();
  await page.getByRole("region",{name:"Saved lesson plans",exact:true}).getByRole("button",{name:"Resume earlier Day 4 · Session B",exact:true}).click();
  await expect(page.getByRole("heading",{name:byId.get(old.blocks[1].exerciseId).title,exact:true})).toBeVisible();
  await expect(minutes(page)).toHaveValue("8");
  await page.getByRole("button",{name:"Close lesson",exact:true}).click();
  await page.getByRole("button",{name:"Progress",exact:true}).click();
  await expect(page.getByText("1/80",{exact:true})).toBeVisible();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  expect(saved.programProgress.completedBlocks[old.id]).toEqual([0]);
  expect(saved.programProgress.completedBlocks[current.id]).toEqual([0,1,2,3]);
});

test("an unfinished return resumes its first-check evidence even when that source is no longer due",async({page})=>{
  const e=byId.get("rhythm-long-short"),state=freshData();state.programUnitId=old.unitId;
  const today=new Date().toLocaleDateString("en-CA");
  state.programProgress=recordAttempt({}, {exerciseId:e.id,section:"guided",date:today,minutes:3,assessment:"ready",note:"Recently reviewed source; no longer due."});
  await seed(page,state);
  const draftKey=`woodshed:lesson-draft:v1:${e.id}:review:${old.id}:`;
  const value={abc:e.abc,draft:{note:"Retain my unsaved return.",minutes:3,bpm:44,hands:e.hands,range:{from:1,to:1},reviewCheck:{assessment:"unsure",beforeDemo:true,bpm:44,hands:e.hands,fromBar:1,toBar:1}}};
  await page.addInitScript(({draftKey,value})=>{if(!sessionStorage.getItem(draftKey))sessionStorage.setItem(draftKey,JSON.stringify(value));},{draftKey,value});
  await page.goto("./");await choose(page);
  await card(page).getByRole("button",{name:"Resume · 0/4 blocks",exact:true}).click();
  await expect(page.getByRole("heading",{name:e.title,exact:true})).toBeVisible();
  await expect(note(page)).toHaveValue(value.draft.note);
  await expect(page.locator(".pg-session-bar")).toContainText("Cumulative review · 3 of 20 min");
  await page.getByRole("button",{name:"Save practice",exact:true}).click();
  await expect(page.getByRole("heading",{name:byId.get(old.blocks[0].exerciseId).title,exact:true})).toBeVisible();
  await expect(minutes(page)).toHaveValue("4");
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),last=saved.programProgress.attempts.at(-1);
  expect(last.reviewForSession).toBe(old.id);expect(last.reviewCheck.assessment).toBe("unsure");expect(last.reviewCheck.beforeDemo).toBe(true);
  expect(saved.programProgress.completedBlocks[old.id]).toBeUndefined();
});
