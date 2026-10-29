import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { newSong } from "../src/score/songs.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: { contents: "export {default} from './src/score/SongEditor.jsx'; export * from './src/program/drafts.js';", resolveDir: root },
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "song-editor-hooks", setup(builder) {
    builder.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "hooks" }));
    builder.onLoad({ filter: /.*/, namespace: "hooks" }, () => ({ contents: `
      const hooks=()=>globalThis.__songEditorHooks;
      const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
      export function useState(initial){const h=hooks(),i=h.cursor++;if(!(i in h.slots))h.slots[i]=typeof initial==='function'?initial():initial;return[h.slots[i],value=>{const next=typeof value==='function'?value(h.slots[i]):value;if(!Object.is(next,h.slots[i])){h.slots[i]=next;h.dirty=true;}}];}
      export function useRef(value){const h=hooks(),i=h.cursor++;if(!(i in h.slots))h.slots[i]={current:value};return h.slots[i];}
      export function useEffect(fn,deps){const h=hooks(),i=h.cursor++,previous=h.slots[i];if(!previous||!same(previous.deps,deps))h.effects.push(()=>{previous?.cleanup?.();h.slots[i]={deps,cleanup:fn()};});}
      export default {Fragment:'fragment',createElement(type,props,...children){return{type,props:{...props,children}}}};
    ` }));
  } }],
});
const { default: SongEditor, clearAllPracticeDrafts, readPracticeDraft } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const clone = value => structuredClone(value);
const find = (node, predicate) => Array.isArray(node) ? (node.map(child => find(child, predicate)).find(Boolean) ?? null) : !node || typeof node !== "object" ? null : predicate(node) ? node : find(node.props?.children, predicate);
const text = node => Array.isArray(node) ? node.map(text).join("") : node && typeof node === "object" ? text(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const deferred = () => { let resolve; return { promise: new Promise(done => { resolve = done; }), resolve: value => resolve(value) }; };

function harness(songs = [newSong("one"), { ...newSong("two"), title: "Second song" }]) {
  clearAllPracticeDrafts();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { confirm: () => true } });
  const hooks = { cursor: 0, slots: [], effects: [], dirty: false };
  const h = { saved: clone(songs), calls: [], selections: [], tree: null, props: { songs: clone(songs), songId: songs[0]?.id ?? null, disabled: false },
    render() {
      let count = 0;
      do {
        assert.ok(++count < 15, "editor state settles");
        globalThis.__songEditorHooks = hooks; hooks.cursor = 0; hooks.effects = []; hooks.dirty = false;
        h.tree = SongEditor(h.props);
        for (const effect of hooks.effects.splice(0)) effect();
      } while (hooks.dirty);
      return h.tree;
    },
    field(label) { return find(h.tree, node => node.props?.["aria-label"] === label); },
    button(label) { return find(h.tree, node => node.type === "button" && text(node) === label); },
    edit(label, value) { h.field(label).props.onChange({ target: { value } }); h.render(); },
    click(label) { const result = h.button(label).props.onClick(); h.render(); return result; },
    async settle() { for (let i = 0; i < 8; i++) { await Promise.resolve(); h.render(); } },
    adopt(songs) { h.props.songs = clone(songs); h.render(); },
    reopen(songs = h.saved) { for (const slot of hooks.slots) slot?.cleanup?.(); hooks.slots = []; h.props.songs = clone(songs); h.props.songId = songs[0]?.id ?? null; h.render(); h.render(); },
    close() { for (const slot of hooks.slots) slot?.cleanup?.(); clearAllPracticeDrafts(); if (previous) Object.defineProperty(globalThis, "window", previous); else delete globalThis.window; delete globalThis.__songEditorHooks; },
  };
  h.props.onSelect = id => { h.selections.push(id); h.props.songId = id; };
  h.persist = async (next, expected) => {
    if (JSON.stringify(expected) !== JSON.stringify(h.saved)) return null;
    h.saved = clone(next); return { songs: clone(next) };
  };
  h.props.onSongs = async (next, expected) => { h.calls.push({ next: clone(next), expected: clone(expected) }); return h.persist(next, expected); };
  h.render(); return h;
}

test("rapid edits and a selection switch preserve every local field while saves serialize against their accepted base", async () => {
  const h = harness(), first = deferred();
  let inflight = 0, maxInflight = 0;
  h.persist = async (next, expected) => {
    inflight++; maxInflight = Math.max(maxInflight, inflight);
    if (h.calls.length === 1) await first.promise;
    assert.deepEqual(expected, h.saved);
    h.saved = clone(next); inflight--;
    return { songs: clone(h.saved) };
  };
  try {
    h.edit("Title", "F"); h.edit("Title", "Fast typed title");
    h.edit("Chords, bars split by |", "Dm | G | C | C"); h.edit("Key", "F");
    h.edit("Song", "two"); h.edit("Title", "A changed second title");
    assert.equal(h.field("Title").props.value, "A changed second title");
    h.edit("Song", "one"); assert.equal(h.field("Title").props.value, "Fast typed title");
    assert.equal(h.field("Chords, bars split by |").props.value, "Dm | G | C | C");
    assert.equal(h.calls.length, 1);
    first.resolve(); await h.settle();
    assert.equal(maxInflight, 1); assert.equal(h.calls.length, 2);
    assert.equal(h.saved[0].title, "Fast typed title"); assert.equal(h.saved[0].key, "F");
    assert.equal(h.saved[1].title, "A changed second title");
    assert.deepEqual(h.calls[1].expected, h.calls[0].next, "queue does not depend on a parent rerender to advance its comparison base");
    assert.equal(h.props.songs[0].title, "New song", "parent props intentionally stayed stale during the queue");
    h.adopt(h.saved); assert.equal(h.field("Title").props.value, "Fast typed title");
  } finally { h.close(); }
});

test("the queue uses the latest persistence callback after each durable save", async () => {
  const h = harness(), first = deferred(); let newerCalls = 0;
  h.persist = async next => { await first.promise; h.saved = clone(next); return { songs: clone(next) }; };
  try {
    h.edit("Title", "First"); h.edit("Title", "Final");
    h.props.onSongs = async (next, expected) => { newerCalls++; assert.deepEqual(expected, h.saved); h.saved = clone(next); return { songs: clone(next) }; };
    h.render(); first.resolve(); await h.settle();
    assert.equal(newerCalls, 1); assert.equal(h.saved[0].title, "Final");
  } finally { h.close(); }
});

test("a rejected save keeps edits visible, stops automatic retries, and explicitly retries the complete latest draft", async () => {
  const h = harness(); h.persist = async () => null;
  try {
    h.edit("Title", "Unsaved title"); await h.settle();
    assert.equal(h.field("Title").props.value, "Unsaved title"); assert.match(text(h.tree), /could not be saved/);
    h.edit("Chords, bars split by |", "F | G | C | C"); await h.settle();
    assert.equal(h.calls.length, 1, "typing after a failure must not silently retry");
    h.persist = async (next, expected) => { assert.deepEqual(expected, h.saved); h.saved = clone(next); return { songs: clone(next) }; };
    h.click("Retry save"); await h.settle();
    assert.equal(h.saved[0].title, "Unsaved title"); assert.equal(h.saved[0].chords, "F | G | C | C");
    assert.equal(h.button("Retry save"), null);
  } finally { h.close(); }
});

test("external changes and reset conflicts retain the draft without rebasing or resurrecting saved data", async () => {
  const h = harness(), first = deferred();
  h.persist = async (next, expected) => {
    await first.promise;
    if (JSON.stringify(expected) !== JSON.stringify(h.saved)) return null;
    h.saved = clone(next); return { songs: clone(next) };
  };
  try {
    h.edit("Title", "My local draft");
    const external = [{ ...newSong("external"), title: "Other tab's song" }];
    h.saved = clone(external); h.adopt(external);
    assert.equal(h.field("Title").props.value, "My local draft"); assert.match(text(h.tree), /changed in another tab/);
    first.resolve(); await h.settle();
    h.click("Retry save"); await h.settle();
    assert.deepEqual(h.saved, external); assert.equal(h.calls.length, 2);
    assert.equal(h.calls[1].expected[0].id, "one", "explicit retry still compares to the original accepted base");
    h.click("Use saved songs"); await h.settle();
    assert.equal(h.field("Title").props.value, "Other tab's song"); assert.equal(h.props.songId, "external");
    h.saved = []; h.adopt([]); assert.equal(h.field("Title"), null);
    assert.equal(h.calls.length, 2, "adopting an external reset cannot write or resurrect a song");
  } finally { h.close(); }
});

test("a new song changes selection only after durable success, and failed creation can retry the same ID", async () => {
  const h = harness(), first = deferred(); h.persist = async () => first.promise;
  try {
    h.click("New song"); const candidate = h.calls[0].next;
    assert.equal(h.props.songId, "one"); assert.equal(h.saved.length, 2);
    assert.equal(h.field("Title").props.disabled, true);
    first.resolve(null); await h.settle();
    assert.equal(h.props.songId, "one"); assert.equal(h.field("Title").props.value, "New song");
    h.persist = async (next, expected) => { assert.deepEqual(expected, h.saved); h.saved = clone(next); return { songs: clone(next) }; };
    h.click("Retry save"); await h.settle();
    assert.equal(h.saved.length, 3); assert.equal(h.props.songId, candidate[2].id);
    assert.equal(h.calls[1].next[2].id, candidate[2].id); assert.equal(h.field("Title").props.value, "New song");
  } finally { h.close(); }
});

test("delete failure retains the old song and selection; retry changes selection only after persistence", async () => {
  const h = harness(), first = deferred(); h.persist = async () => first.promise;
  try {
    h.click("Delete song"); assert.equal(h.props.songId, "one"); assert.equal(h.field("Title").props.value, "New song");
    first.resolve(null); await h.settle();
    assert.equal(h.saved.length, 2); assert.equal(h.props.songId, "one");
    h.persist = async (next, expected) => { assert.deepEqual(expected, h.saved); h.saved = clone(next); return { songs: clone(next) }; };
    h.click("Retry save"); await h.settle();
    assert.deepEqual(h.saved.map(s => s.id), ["two"]); assert.equal(h.props.songId, "two");
    assert.equal(h.field("Title").props.value, "Second song");
  } finally { h.close(); }
});

test("canceling a failed delete keeps data, while declined confirmations make no persistence call", async () => {
  const h = harness(); h.persist = async () => { throw new Error("Quota"); };
  try {
    h.click("Delete song"); await h.settle(); h.click("Cancel change");
    assert.equal(h.button("Retry save"), null); assert.equal(h.field("Title").props.disabled, false);
    assert.equal(h.saved.length, 2); assert.equal(h.props.songId, "one");
    window.confirm = () => false; h.click("Delete song");
    assert.equal(h.calls.length, 1);
  } finally { h.close(); }
});

test("tempo text stays controlled during edits and commits a valid numeric tempo without losing other fields", async () => {
  const h = harness();
  try {
    h.edit("Start tempo", ""); assert.equal(h.field("Start tempo").props.value, "");
    h.edit("Title", "Tempo song"); await h.settle();
    assert.equal(h.field("Start tempo").props.value, "");
    h.field("Start tempo").props.onBlur({ target: { value: "240" } }); h.render(); await h.settle();
    assert.equal(h.field("Start tempo").props.value, "200"); assert.equal(h.saved[0].bpm, 200); assert.equal(h.saved[0].title, "Tempo song");
    h.edit("Pattern", "ballad"); h.edit("Metre", "3/4"); await h.settle();
    assert.equal(h.saved[0].meter, "3/4"); assert.equal(h.saved[0].pattern, "block");
  } finally { h.close(); }
});

test("failed edits and uncommitted tempo restore across navigation with their exact comparison base, then clear after a durable retry", async () => {
  const h = harness(); h.persist = async () => null;
  try {
    h.edit("Song", "two"); h.edit("Title", "Draft for the second song"); await h.settle();
    h.edit("Start tempo", "91");
    const stored = readPracticeDraft("song-editor", "song-editor:v1");
    assert.equal(stored.draft[1].title, "Draft for the second song"); assert.deepEqual(stored.accepted, h.saved);
    h.reopen(); assert.equal(h.props.songId, "two");
    assert.equal(h.field("Title").props.value, "Draft for the second song"); assert.equal(h.field("Start tempo").props.value, "91");
    assert.match(text(h.tree), /draft has been restored/); assert.equal(h.calls.length, 1, "restoring never automatically submits an old draft");
    h.persist = async (next, expected) => { assert.deepEqual(expected, h.saved); h.saved = clone(next); return { songs: clone(next) }; };
    h.click("Retry save"); await h.settle();
    assert.equal(h.saved[1].title, "Draft for the second song"); assert.equal(h.saved[1].bpm, 91);
    assert.equal(readPracticeDraft("song-editor", "song-editor:v1"), null);
  } finally { h.close(); }
});

test("a remounted failed draft detects changed saved songs and cannot resurrect songs after reset", async () => {
  const h = harness(); h.persist = async () => null;
  try {
    h.edit("Title", "Retained before reset"); await h.settle();
    h.saved = []; h.reopen([]);
    assert.equal(h.field("Title").props.value, "Retained before reset"); assert.match(text(h.tree), /changed in another tab/);
    assert.equal(h.calls.length, 1);
    h.persist = async (next, expected) => JSON.stringify(expected) === JSON.stringify(h.saved) ? { songs: next } : null;
    h.click("Retry save"); await h.settle();
    assert.deepEqual(h.saved, []); assert.equal(h.calls[1].expected[0].id, "one");
    h.click("Use saved songs"); await h.settle();
    assert.equal(h.field("Title"), null); assert.equal(readPracticeDraft("song-editor", "song-editor:v1"), null);
  } finally { h.close(); }
});

test("a stale retry handler cannot submit a failed create action twice while the first retry is pending", async () => {
  const h = harness(); h.persist = async () => null;
  try {
    h.click("New song"); await h.settle();
    const retry = h.button("Retry save").props.onClick, wait = deferred();
    h.persist = async next => { await wait.promise; h.saved = clone(next); return { songs: clone(next) }; };
    retry(); retry(); h.render(); assert.equal(h.calls.length, 2);
    wait.resolve(); await h.settle(); assert.equal(h.saved.length, 3); assert.equal(h.button("Retry save"), null);
  } finally { h.close(); }
});

test("an external change cannot discard an uncommitted tempo field", () => {
  const h = harness();
  try {
    h.edit("Start tempo", "93");
    const external = h.saved.map(song => ({ ...song, title: "Saved elsewhere" }));
    h.saved = clone(external); h.adopt(external);
    assert.equal(h.field("Start tempo").props.value, "93"); assert.equal(h.field("Title").props.value, "New song");
    assert.match(text(h.tree), /changed in another tab/); assert.equal(h.calls.length, 0);
  } finally { h.close(); }
});

test("a pending failed creation cannot rewrite a draft cleared by profile replacement before unmount",async()=>{
  const h=harness([]),wait=deferred();h.persist=()=>wait.promise;
  try {
    h.click("New song");assert.ok(readPracticeDraft("song-editor","song-editor:v1"));
    clearAllPracticeDrafts();assert.equal(readPracticeDraft("song-editor","song-editor:v1"),null);
    wait.resolve(null);await h.settle();
    assert.equal(readPracticeDraft("song-editor","song-editor:v1"),null,"the still-mounted old owner cannot recreate discarded work");
    h.reopen([]);assert.equal(h.button("Retry save"),null);assert.equal(h.field("Title"),null);
    assert.equal(h.calls.length,1);assert.deepEqual(h.saved,[]);
  } finally { h.close(); }
});

test("a late successful edit after replacement cannot drain newer queued edits or restore its old draft",async()=>{
  const h=harness(),wait=deferred();h.persist=()=>wait.promise;
  try {
    h.edit("Title","First pending edit");h.edit("Title","Later queued edit");
    const oldSaved=h.calls[0].next;
    clearAllPracticeDrafts();h.saved=[];
    wait.resolve({songs:oldSaved});await h.settle();
    assert.equal(h.calls.length,1,"replacement cancels the old owner's remaining queue before another write");
    assert.equal(readPracticeDraft("song-editor","song-editor:v1"),null);
    h.reopen([]);assert.equal(h.field("Title"),null);assert.deepEqual(h.saved,[]);
  } finally { h.close(); }
});

test("a synchronously thrown persistence callback releases the queue for an explicit retry",async()=>{
  const h=harness();let failed=0;
  try {
    h.props.onSongs=()=>{failed++;throw new Error("Synchronous save failure");};h.render();
    h.edit("Title","Retained after a synchronous failure");await h.settle();
    assert.equal(failed,1);assert.match(text(h.tree),/could not be saved/);
    h.props.onSongs=async(next,expected)=>{assert.deepEqual(expected,h.saved);h.saved=clone(next);return{songs:clone(next)};};h.render();
    h.click("Retry save");await h.settle();
    assert.equal(h.saved[0].title,"Retained after a synchronous failure");assert.equal(h.button("Retry save"),null);
  } finally { h.close(); }
});
