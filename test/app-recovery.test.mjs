import assert from "node:assert/strict";
import { createWebLocks } from "./web-locks-harness.mjs";
import { test } from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { freshData } from "../src/engine.js";
import { recordAttempt, removeAttempt } from "../src/program/progress.js";

// Keep the actual App, recovery/settings handlers, migration and storage. Only
// rendering and browser file/download boundaries are replaced.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: { contents: `export { default as App } from './src/App.jsx'; export * from './src/program/drafts.js';`, resolveDir: root, loader: "js" },
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "recovery-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "boundary" }));
    b.onResolve({ filter: /useIsDesktop\.js$/ }, () => ({ path: "desktop", namespace: "boundary" }));
    b.onResolve({ filter: /useShortcuts\.js$/ }, () => ({ path: "shortcuts", namespace: "boundary" }));
    b.onResolve({ filter: /\.jsx$/ }, args => args.importer.endsWith("App.jsx") ? { path: args.path, namespace: "boundary" } : null);
    b.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => ({ contents: path === "react" ? `
      const current = () => globalThis.__recoveryHooks;
      const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
      export function useState(initial) {
        const h = current(), i = h.cursor++;
        if (!(i in h.slots)) {
          const slot = h.slots[i] = { value: typeof initial === 'function' ? initial() : initial };
          slot.set = value => { const next = typeof value === 'function' ? value(slot.value) : value; if (!Object.is(next, slot.value)) { slot.value = next; h.dirty = true; } };
        }
        return [h.slots[i].value, h.slots[i].set];
      }
      export function useRef(initial) { const h = current(), i = h.cursor++; return h.slots[i] || (h.slots[i] = { current: initial }); }
      export function useEffect(fn, deps) {
        const h = current(), i = h.cursor++, previous = h.slots[i];
        if (!previous || !same(previous.deps, deps)) h.effects.push(() => { previous?.cleanup?.(); h.slots[i] = { deps, cleanup: fn() }; });
      }
      export default { Fragment: 'fragment', createElement(type, props, ...children) { return { type, props: { ...props, children } }; } };
    ` : path === "desktop" ? "export const useIsDesktop = () => true;" : `
      export default function Boundary() {}
      export function LessonBody() {}
      export function PracticeProvider() {}
      export function PracticeSheet() {}
      export function ListenSheet() {}
      export function ShortcutBridge() {}
      export function MidiProvider() {}
      export const VIEWS = [];
    ` }));
    b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const { App, readPracticeDraft, writePracticeDraft, clearAllPracticeDrafts } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const content = node => Array.isArray(node) ? node.map(content).join("") : node && typeof node === "object" ? content(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const found = find(item, predicate); if (found) return found; } }
  return !node || typeof node !== "object" ? null : predicate(node) ? node : find(node.props?.children, predicate);
};
const button = (tree, name) => find(tree, node => node.type === "button" && content(node) === name);
const program = tree => find(tree, node => typeof node.props?.onAttempt === "function");
const recovery = tree => find(tree, node => node.type?.name === "RecoveryScreen");
function runner(Component, props = {}) {
  const hooks = { cursor: 0, slots: [], effects: [], dirty: true };
  const h = { tree: null, props,
    render() {
      let passes = 0;
      do {
        assert.ok(++passes < 20, "component effects must settle");
        globalThis.__recoveryHooks = hooks; hooks.cursor = 0; hooks.dirty = false;
        h.tree = Component(h.props);
        for (const effect of hooks.effects.splice(0)) effect();
      } while (hooks.dirty);
      return h.tree;
    },
    async flush() { await new Promise(resolve => setImmediate(resolve)); h.render(); },
    close() { for (const slot of hooks.slots) slot?.cleanup?.(); },
  };
  return h;
}
async function harness(raw, options = {}) {
  const names = ["localStorage", "sessionStorage", "window", "document", "navigator", "FileReader", "setInterval", "clearInterval", "setTimeout"];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const urlCreate = URL.createObjectURL, urlRevoke = URL.revokeObjectURL, warn = console.warn;
  const values = new Map(raw === undefined ? [] : [["woodshed-state-v1", raw]]), drafts = new Map();
  const env = { values, writes: [], denied: !!options.denied, failWrites: false, downloads: [], readers: [] };
  const localStorage = { getItem(key) { if (env.denied) throw new Error("Storage blocked"); return values.get(key) ?? null; },
    setItem(key, value) { env.writes.push(value); if (env.failWrites) throw new Error("Quota exceeded"); values.set(key, value); } };
  const sessionStorage = { get length() { return drafts.size; }, key: i => [...drafts.keys()][i] ?? null, getItem: k => drafts.get(k) ?? null, setItem: (k, v) => drafts.set(k, v), removeItem: k => drafts.delete(k) };
  const document = new EventTarget(); document.visibilityState = "visible"; document.body = { appendChild() {} }; document.createElement = () => ({ click() { env.downloads.at(-1).filename = this.download; }, remove() {} });
  const globals = { localStorage, sessionStorage, window: new EventTarget(), document, navigator: { locks: options.noLocks ? undefined : createWebLocks() },
    FileReader: class { readAsText(file) { env.readers.push(file); this.result = file.contents; this.onload?.(); } },
    setInterval: () => 1, clearInterval() {}, setTimeout: () => 1 };
  for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  URL.createObjectURL = blob => { env.downloads.push({ blob }); return "blob:recovery-test"; }; URL.revokeObjectURL = () => {};
  console.warn = () => {};
  clearAllPracticeDrafts();
  const app = runner(App); app.render(); await app.flush();
  const children = [];
  const child = node => { assert.ok(node); const h = runner(node.type, node.props); h.render(); children.push(h); return h; };
  const settings = () => { find(app.tree, node => typeof node.props?.onSettings === "function").props.onSettings(); app.render(); return child(find(app.tree, node => typeof node.props?.onImport === "function")); };
  return { env, app, child, settings,
    select(h, label, backup) { find(h.tree, node => node.type === "input" && node.props["aria-label"] === label).props.onChange({ target: { files: [{ contents: JSON.stringify(backup) }], value: "selected" } }); h.render(); },
    close() {
      for (const h of children) h.close(); app.close(); clearAllPracticeDrafts();
      for (const [name, descriptor] of previous) if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
      URL.createObjectURL = urlCreate; URL.revokeObjectURL = urlRevoke; console.warn = warn; delete globalThis.__recoveryHooks;
    },
  };
}
async function withApp(raw, fn, options) { const h = await harness(raw, options); try { await fn(h); } finally { h.close(); } }

test("a missing save opens fresh practice, while corrupt JSON is preserved without any autosave", async () => {
  await withApp(undefined, async h => { assert.ok(program(h.app.tree)); assert.ok(h.env.writes.length > 0); });
  await withApp("{damaged original", async h => {
    assert.equal(program(h.app.tree), null); assert.equal(h.env.writes.length, 0);
    assert.equal(h.env.values.get("woodshed-state-v1"), "{damaged original");
    const screen = h.child(recovery(h.app.tree));
    assert.match(content(screen.tree), /Your saved practice needs attention/);
    button(screen.tree, "Download original saved data").props.onClick();
    assert.equal(await h.env.downloads[0].blob.text(), "{damaged original");
    assert.match(h.env.downloads[0].filename, /^woodshed-recovery-original-/);
    assert.ok(button(screen.tree, "Retry loading"));
  });
});

test("blocked storage opens recovery rather than silently creating a new profile", async () => withApp(undefined, async h => {
  const screen = h.child(recovery(h.app.tree));
  assert.match(content(screen.tree), /Allow site storage, then retry/);
  assert.equal(button(screen.tree, "Download original saved data"), null);
  assert.equal(h.env.writes.length, 0);
  h.env.denied = false;
  await button(screen.tree, "Retry loading").props.onClick(); await h.app.flush();
  assert.ok(program(h.app.tree));
}, { denied: true }));

test("retry loads repaired saved history and keeps its actual progress", async () => withApp("{broken", async h => {
  const state = freshData(); state.settings.target = 45;
  h.env.values.set("woodshed-state-v1", JSON.stringify(state));
  await recovery(h.app.tree).props.onRetry(); await h.app.flush();
  assert.ok(program(h.app.tree)); assert.equal(recovery(h.app.tree), null);
  assert.equal(JSON.parse(h.env.values.get("woodshed-state-v1")).settings.target, 45);
}));

test("recovery restore waits for durable storage and keeps original bytes and drafts on failure", async () => withApp("{original", async h => {
  const screen = h.child(recovery(h.app.tree)), backup = freshData(); backup.settings.target = 30;
  writePracticeDraft("unfinished", "score", { note: "Keep me until restore succeeds" });
  h.select(screen, "Choose a recovery backup", backup);
  h.env.failWrites = true;
  await button(screen.tree, "Restore backup").props.onClick(); screen.render(); await h.app.flush();
  assert.match(content(screen.tree), /The backup could not be saved/);
  assert.match(content(screen.tree), /Backup selected/);
  assert.equal(h.env.values.get("woodshed-state-v1"), "{original");
  assert.equal(readPracticeDraft("unfinished", "score").note, "Keep me until restore succeeds");
  assert.ok(recovery(h.app.tree));
  h.env.failWrites = false;
  await button(screen.tree, "Restore backup").props.onClick(); await h.app.flush();
  assert.ok(program(h.app.tree)); assert.equal(readPracticeDraft("unfinished", "score"), null);
  assert.equal(JSON.parse(h.env.values.get("woodshed-state-v1")).settings.target, 30);
}));

test("Settings replacement preserves pending backup and active Program when storage rejects it", async () => withApp(JSON.stringify(freshData()), async h => {
  const settings = h.settings(), before = program(h.app.tree).props.key, backup = freshData(); backup.settings.target = 45;
  assert.match(content(settings.tree), /App version local/, "direct Node component consumers have a version without a Vite define");
  writePracticeDraft("unfinished", "score", { note: "Do not lose this" });
  h.select(settings, "Choose a backup to import", backup); h.env.failWrites = true;
  const replace = button(settings.tree, "Replace").props.onClick;
  const first = replace(), second = replace(); settings.render();
  assert.ok(button(settings.tree, "Replacing…"));
  assert.equal(button(settings.tree, "Replacing…").props.disabled, true);
  await Promise.all([first, second]); settings.render(); await h.app.flush();
  assert.equal(h.env.writes.length, 2, "one initial autosave and one replacement attempt; double click cannot retry concurrently");
  assert.ok(button(settings.tree, "Replace"));
  assert.match(content(settings.tree), /current practice and unfinished work are unchanged/);
  assert.equal(program(h.app.tree).props.key, before);
  assert.equal(readPracticeDraft("unfinished", "score").note, "Do not lose this");
  assert.equal(JSON.parse(h.env.values.get("woodshed-state-v1")).settings.target, 20);
  h.env.failWrites = false;
  await button(settings.tree, "Replace").props.onClick(); settings.render(); await h.app.flush();
  assert.match(content(settings.tree), /Backup restored/); assert.equal(button(settings.tree, "Replace"), null);
  assert.notEqual(program(h.app.tree).props.key, before);
  assert.equal(readPracticeDraft("unfinished", "score"), null);
  assert.equal(JSON.parse(h.env.values.get("woodshed-state-v1")).settings.target, 45);
}));

test("Reset refuses to erase in-memory practice or drafts when the fresh state cannot be saved", async () => withApp(JSON.stringify(freshData()), async h => {
  const settings = h.settings(), before = program(h.app.tree).props.key;
  writePracticeDraft("unfinished", "score", { note: "Keep after failed reset" });
  button(settings.tree, "Reset everything").props.onClick(); settings.render(); h.env.failWrites = true;
  await button(settings.tree, "Erase").props.onClick(); settings.render(); await h.app.flush();
  assert.match(content(settings.tree), /Your practice could not be reset/);
  assert.ok(button(settings.tree, "Erase"));
  assert.equal(program(h.app.tree).props.key, before);
  assert.equal(readPracticeDraft("unfinished", "score").note, "Keep after failed reset");
  assert.ok(find(h.app.tree, node => typeof node.props?.onImport === "function"), "Settings stays open after failure");
}));

test("choosing an invalid file discards the previously selected backup instead of restoring the wrong one", async () => {
  await withApp(JSON.stringify(freshData()), async h => {
    const settings = h.settings();
    h.select(settings, "Choose a backup to import", freshData()); assert.ok(button(settings.tree, "Replace"));
    h.select(settings, "Choose a backup to import", { unrelated: true });
    assert.equal(button(settings.tree, "Replace"), null);
    assert.match(content(settings.tree), /Choose a Woodshed JSON export/);
  });
  await withApp("{original", async h => {
    const screen = h.child(recovery(h.app.tree));
    h.select(screen, "Choose a recovery backup", freshData()); assert.equal(button(screen.tree, "Restore backup").props.disabled, false);
    h.select(screen, "Choose a recovery backup", { unrelated: true });
    assert.equal(button(screen.tree, "Restore backup").props.disabled, true);
    assert.equal(h.env.values.get("woodshed-state-v1"), "{original");
  });
});

const report=(note)=>({exerciseId:"rhythm-long-short",section:"guided",minutes:3,assessment:"practising",date:"2026-10-28",note});
const durable=h=>JSON.parse(h.env.values.get("woodshed-state-v1"));
async function secondTab(h) { const peer=h.child({type:App,props:{}});await peer.flush();return peer; }
function settingsNode(app) {
  find(app.tree,node=>typeof node.props?.onSettings==="function").props.onSettings();app.render();
  return find(app.tree,node=>typeof node.props?.onImport==="function");
}

test("two stale actual App instances append both reports and return the latest durable progress", async () => withApp(JSON.stringify(freshData()),async h=>{
  const peer=await secondTab(h),saveA=program(h.app.tree).props.onAttempt,saveB=program(peer.tree).props.onAttempt;
  const [a,b]=await Promise.all([saveA(report("Tab A")),saveB(report("Tab B"))]);
  assert.equal(a.attempts.length,1);assert.equal(b.attempts.length,2);
  assert.deepEqual(durable(h).programProgress.attempts.map(a=>a.note),["Tab A","Tab B"]);
}));

test("a stale unit/settings action preserves another tab's newly saved history", async () => withApp(JSON.stringify(freshData()),async h=>{
  const peer=await secondTab(h),choose=program(peer.tree).props.onUnitChange,settings=settingsNode(peer);
  await program(h.app.tree).props.onAttempt(report("Keep this report"));
  await choose("g-major-foundations-2");
  await settings.props.onChange({weeklyGoal:5});
  assert.equal(durable(h).programUnitId,"g-major-foundations-2");assert.equal(durable(h).settings.weeklyGoal,5);
  assert.deepEqual(durable(h).programProgress.attempts.map(a=>a.note),["Keep this report"]);
}));

test("stale correction/removal rejects safely, then deliberate deletion stays deleted after a stale selection", async () => {
  const initial=freshData();initial.programProgress=recordAttempt({},report("Original"));
  await withApp(JSON.stringify(initial),async h=>{
    const peer=await secondTab(h),old=program(peer.tree),staleChoose=program(h.app.tree).props.onUnitChange;
    await program(h.app.tree).props.onAttempt(report("Other tab's new report"));
    await assert.rejects(old.props.onChangeProgress(removeAttempt(old.props.progress,0)),/changed in another tab/);
    assert.equal(durable(h).programProgress.attempts.length,2);
    await peer.flush();const latest=program(peer.tree);
    const saved=await latest.props.onChangeProgress(removeAttempt(latest.props.progress,0));
    assert.deepEqual(saved.attempts.map(a=>a.note),["Other tab's new report"]);
    await staleChoose("f-major-foundations-3");
    assert.deepEqual(durable(h).programProgress.attempts.map(a=>a.note),["Other tab's new report"]);
  });
});

test("reset/import are explicit generation changes and old App actions cannot resurrect prior history", async () => {
  const initial=freshData();initial.programProgress=recordAttempt({},report("Before reset"));
  await withApp(JSON.stringify(initial),async h=>{
    const peer=await secondTab(h),old=program(peer.tree),staleSettings=settingsNode(peer);
    assert.equal(await settingsNode(h.app).props.onReset(),true);
    await assert.rejects(old.props.onAttempt(report("Stale replay")),/replaced in another tab/);
    await old.props.onUnitChange("g-major-foundations-2");
    assert.deepEqual(durable(h).programProgress.attempts,[]);
    assert.equal(await staleSettings.props.onImport(initial),false,"a stale import cannot silently replace intervening reset");
    await peer.flush();const backup=freshData();backup.programProgress=recordAttempt({},report("Imported history"));
    assert.equal(await settingsNode(peer).props.onImport(backup),true);
    await assert.rejects(old.props.onAttempt(report("Replay after import")),/replaced in another tab/);
    assert.deepEqual(durable(h).programProgress.attempts.map(a=>a.note),["Imported history"]);
  });
});

test("quota failure in a stale App keeps durable history and unfinished work, then retry appends once", async () => withApp(JSON.stringify(freshData()),async h=>{
  const peer=await secondTab(h),save=program(peer.tree).props.onAttempt;
  await program(h.app.tree).props.onAttempt(report("Already durable"));
  const raw=h.env.values.get("woodshed-state-v1");writePracticeDraft("unfinished-concurrent","score",{note:"Retain my draft"});
  h.env.failWrites=true;
  await assert.rejects(save(report("Retry me")),error=>/could not be saved/.test(error.message)&&/Quota/.test(error.cause?.message));
  assert.equal(h.env.values.get("woodshed-state-v1"),raw);assert.equal(readPracticeDraft("unfinished-concurrent","score").note,"Retain my draft");
  h.env.failWrites=false;await save(report("Retry me"));
  assert.deepEqual(durable(h).programProgress.attempts.map(a=>a.note),["Already durable","Retry me"]);
}));

test("storage events adopt ordinary practice without remounting, but remount after another tab replaces history", async () => withApp(JSON.stringify(freshData()),async h=>{
  const peer=await secondTab(h),before=program(peer.tree).props.key;
  const publish=()=>{const event=new Event("storage");Object.defineProperty(event,"key",{value:"woodshed-state-v1"});window.dispatchEvent(event);};
  await program(h.app.tree).props.onAttempt(report("External update"));publish();await peer.flush();
  assert.equal(program(peer.tree).props.progress.attempts.length,1);assert.equal(program(peer.tree).props.key,before);
  await h.app.flush();assert.equal(await settingsNode(h.app).props.onReset(),true);publish();await peer.flush();
  assert.deepEqual(program(peer.tree).props.progress.attempts,[]);assert.notEqual(program(peer.tree).props.key,before);
}));

test("a browser without Web Locks opens existing practice readably and explicitly refuses unsafe saves", async ()=>withApp(JSON.stringify(freshData()),async h=>{
  assert.ok(program(h.app.tree));assert.equal(h.env.writes.length,0);
  await assert.rejects(program(h.app.tree).props.onAttempt(report("Must not overwrite")),error=>error.code==="locking-unavailable");
  await h.app.flush();assert.match(content(h.app.tree),/Saving needs a browser with Web Locks/);assert.equal(h.env.writes.length,0);
},{noLocks:true}));

test("concept-only answers bypass session inference and remain distinct from piano practice",async()=>withApp(JSON.stringify(freshData()),async h=>{
  await program(h.app.tree).props.onAttempt({...report("Concept repair"),section:"knowledge",minutes:0,assessment:"unsure"});
  const saved=durable(h).programProgress;
  assert.equal(saved.attempts[0].section,"knowledge");assert.equal(saved.attempts[0].sessionId,undefined);
  assert.deepEqual(saved.completedBlocks,{});
}));

function todayNode(app) {
  find(app.tree,node=>typeof node.props?.onView==="function").props.onView("today");app.render();
  return find(app.tree,node=>typeof node.props?.onStartLog==="function");
}

test("legacy session saves wait for durability, reject double-clicks and retain the form after quota failure",async()=>withApp(JSON.stringify(freshData()),async h=>{
  todayNode(h.app).props.onStartLog();h.app.render();
  const log=()=>find(h.app.tree,node=>typeof node.props?.onCommit==="function");
  const entries=[{done:true,itemId:durable(h).items[0].id,minutes:5,rating:"good"}];
  h.env.failWrites=true;assert.equal(await log().props.onCommit(entries,"Retry this legacy note"),false);await h.app.flush();
  assert.ok(log(),"the unsaved form remains open");assert.deepEqual(durable(h).sessions,[]);
  h.env.failWrites=false;const commit=log().props.onCommit;
  assert.deepEqual(await Promise.all([commit(entries,"One durable save"),commit(entries,"One durable save")]),[true,false]);
  await h.app.flush();assert.equal(log(),null);assert.equal(durable(h).sessions.length,1);
}));

test("a stale saved-song replacement cannot erase a song added by another App instance",async()=>withApp(JSON.stringify(freshData()),async h=>{
  const peer=await secondTab(h),item=durable(h).items.find(item=>item.id==="pno-song");assert.ok(item);
  const open=(app)=>{todayNode(app).props.onLearn(item);app.render();return find(app.tree,node=>typeof node.props?.onOpenTuner==="function").props.lesson.props.onSongs;};
  const a=open(h.app),b=open(peer);
  const first=await a([{id:"a",title:"Song from A"}]);assert.ok(first);
  assert.ok(await a([{id:"a",title:"Song from A, edited"}],first.songs),"a serialized same-tab edit can use its accepted baseline before a parent rerender");
  assert.equal(await b([{id:"b",title:"Song from stale B"}]),null);
  assert.deepEqual(durable(h).songs,[{id:"a",title:"Song from A, edited"}]);
  await peer.flush();assert.match(content(peer.tree),/changed in another tab/);
}));

test("a stale App export includes the latest durable reports from the other instance",async()=>withApp(JSON.stringify(freshData()),async h=>{
  const peer=await secondTab(h),exportOld=settingsNode(peer).props.onExport;
  await program(h.app.tree).props.onAttempt(report("Include this in the backup"));
  await exportOld();
  const exported=JSON.parse(await h.env.downloads.at(-1).blob.text());
  assert.deepEqual(exported.programProgress.attempts.map(a=>a.note),["Include this in the backup"]);
}));

function libraryNode(app) {
  find(app.tree,node=>typeof node.props?.onView==="function").props.onView("library");app.render();
  return find(app.tree,node=>typeof node.props?.onAdd==="function");
}
const itemEditor=app=>find(app.tree,node=>node.type?.name==="ItemForm");
const sessionEditor=app=>find(app.tree,node=>node.type?.name==="SessionEdit");
const titleInput=child=>find(child.tree,node=>node.type==="input"&&node.props.placeholder==="e.g. Drop-D riff");

test("the actual custom exercise form retains fields after quota failure and closes only after one durable add",async()=>withApp(JSON.stringify(freshData()),async h=>{
  libraryNode(h.app).props.onAdd();h.app.render();const editor=h.child(itemEditor(h.app));
  titleInput(editor).props.onChange({target:{value:"Keep this new exercise"}});editor.render();
  find(editor.tree,node=>node.type==="textarea").props.onChange({target:{value:"Keep these unsaved instructions"}});editor.render();
  h.env.failWrites=true;assert.equal(await button(editor.tree,"Add").props.onClick(),false);editor.render();await h.app.flush();
  assert.ok(itemEditor(h.app));assert.equal(titleInput(editor).props.value,"Keep this new exercise");
  assert.equal(find(editor.tree,node=>node.type==="textarea").props.value,"Keep these unsaved instructions");
  assert.match(content(editor.tree),/edits are kept here/);assert.equal(durable(h).items.some(i=>i.title==="Keep this new exercise"),false);
  h.env.failWrites=false;const save=button(editor.tree,"Add").props.onClick,first=save();editor.render();
  assert.equal(button(editor.tree,"Saving…").props.disabled,true);assert.equal(titleInput(editor).props.disabled,true);
  await save();await first;await h.app.flush();
  assert.equal(itemEditor(h.app),null);assert.equal(durable(h).items.filter(i=>i.title==="Keep this new exercise").length,1);
}));

test("exercise edit/delete failures keep the editor and entered fields instead of closing prematurely",async()=>{
  const initial=freshData(),item={id:"custom-persist-form",inst:"piano",title:"Original title",type:"technique",diff:1,min:5,desc:"Original notes",hidden:false,custom:true};initial.items.push(item);
  await withApp(JSON.stringify(initial),async h=>{
    libraryNode(h.app).props.onOpen(item);h.app.render();const editor=h.child(itemEditor(h.app));
    titleInput(editor).props.onChange({target:{value:"Edited title"}});editor.render();
    h.env.failWrites=true;await button(editor.tree,"Save").props.onClick();editor.render();await h.app.flush();
    assert.ok(itemEditor(h.app));assert.equal(titleInput(editor).props.value,"Edited title");assert.equal(durable(h).items.find(i=>i.id===item.id).title,"Original title");
    await button(editor.tree,"Delete").props.onClick();editor.render();await h.app.flush();assert.ok(itemEditor(h.app));assert.ok(durable(h).items.some(i=>i.id===item.id));
    h.env.failWrites=false;await button(editor.tree,"Save").props.onClick();await h.app.flush();assert.equal(itemEditor(h.app),null);assert.equal(durable(h).items.find(i=>i.id===item.id).title,"Edited title");
    libraryNode(h.app).props.onOpen(durable(h).items.find(i=>i.id===item.id));h.app.render();const deleting=h.child(itemEditor(h.app));
    await button(deleting.tree,"Delete").props.onClick();await h.app.flush();assert.equal(itemEditor(h.app),null);assert.equal(durable(h).items.some(i=>i.id===item.id),false);
  });
});

test("legacy session correction/deletion keeps its form and edited minutes until durable success",async()=>{
  const initial=freshData(),session={id:"legacy-form-report",itemId:initial.items[0].id,inst:initial.items[0].inst,date:"2026-10-28",minutes:5,rating:"good"};initial.sessions.push(session);
  await withApp(JSON.stringify(initial),async h=>{
    find(h.app.tree,node=>typeof node.props?.onView==="function").props.onView("progress");h.app.render();
    find(h.app.tree,node=>typeof node.props?.onEditSession==="function").props.onEditSession(session);h.app.render();const editor=h.child(sessionEditor(h.app));
    button(editor.tree,"+").props.onClick();editor.render();h.env.failWrites=true;
    await button(editor.tree,"Save").props.onClick();editor.render();await h.app.flush();
    assert.ok(sessionEditor(h.app));assert.match(content(editor.tree),/10m/);assert.equal(durable(h).sessions[0].minutes,5);
    await button(editor.tree,"Delete").props.onClick();editor.render();await h.app.flush();assert.ok(sessionEditor(h.app));assert.equal(durable(h).sessions.length,1);
    h.env.failWrites=false;await button(editor.tree,"Save").props.onClick();await h.app.flush();assert.equal(sessionEditor(h.app),null);assert.equal(durable(h).sessions[0].minutes,10);
    find(h.app.tree,node=>typeof node.props?.onEditSession==="function").props.onEditSession(durable(h).sessions[0]);h.app.render();const deleting=h.child(sessionEditor(h.app));
    await button(deleting.tree,"Delete").props.onClick();await h.app.flush();assert.equal(sessionEditor(h.app),null);assert.deepEqual(durable(h).sessions,[]);
  });
});

test("successful profile replacement closes old legacy forms and scored-song work as well as guided drafts",async()=>{
  for(const kind of ["item","session","log","song"]) {
    const initial=freshData();initial.sessions.push({id:"legacy-replace-form",itemId:initial.items[0].id,inst:initial.items[0].inst,date:"2026-10-28",minutes:5,rating:"good"});
    await withApp(JSON.stringify(initial),async h=>{
      if(kind==="item"){libraryNode(h.app).props.onAdd();h.app.render();assert.ok(itemEditor(h.app));}
      if(kind==="session"){
        find(h.app.tree,node=>typeof node.props?.onView==="function").props.onView("progress");h.app.render();
        find(h.app.tree,node=>typeof node.props?.onEditSession==="function").props.onEditSession(initial.sessions[0]);h.app.render();assert.ok(sessionEditor(h.app));
      }
      if(kind==="log"){todayNode(h.app).props.onStartLog();h.app.render();assert.ok(find(h.app.tree,node=>typeof node.props?.onCommit==="function"));}
      if(kind==="song"){todayNode(h.app).props.onLearn(initial.items.find(i=>i.id==="pno-song"));h.app.render();assert.ok(find(h.app.tree,node=>typeof node.props?.onOpenTuner==="function").props.lesson);}
      const settings=settingsNode(h.app);
      assert.equal(kind==="session"?await settings.props.onImport(freshData()):await settings.props.onReset(),true);
      await h.app.flush();
      assert.equal(itemEditor(h.app),null);assert.equal(sessionEditor(h.app),null);assert.equal(find(h.app.tree,node=>typeof node.props?.onCommit==="function"),null);
      assert.equal(find(h.app.tree,node=>typeof node.props?.onOpenTuner==="function").props.lesson,null);
    });
  }
});
