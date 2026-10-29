import assert from "node:assert/strict";
import { installWebLocks } from "./web-locks-harness.mjs";
import { test } from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { freshData } from "../src/engine.js";

// Exercise the actual App replacement handlers together with its draft store.
// Replace React's rendering boundary so a changed Program key is observable.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: { contents: `export { default as App } from './src/App.jsx';
    export * from './src/program/drafts.js';`, resolveDir: root, loader: "js" },
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "draft-reset-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "boundary" }));
    b.onResolve({ filter: /useIsDesktop\.js$/ }, () => ({ path: "desktop", namespace: "boundary" }));
    b.onResolve({ filter: /useShortcuts\.js$/ }, () => ({ path: "shortcuts", namespace: "boundary" }));
    b.onResolve({ filter: /\.jsx$/ }, args => args.importer.endsWith("App.jsx") ? { path: args.path, namespace: "boundary" } : null);
    b.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => ({ contents: path === "react" ? `
      export function useState(initial) {
        const h = globalThis.__draftResetHooks, i = h.cursor++;
        if (!(i in h.slots)) h.slots[i] = typeof initial === 'function' ? initial() : initial;
        return [h.slots[i], value => { h.slots[i] = typeof value === 'function' ? value(h.slots[i]) : value; }];
      }
      export function useRef(initial) {
        const h = globalThis.__draftResetHooks, i = h.cursor++;
        if (!(i in h.slots)) h.slots[i] = { current: initial };
        return h.slots[i];
      }
      export function useEffect() {}
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
const { App, readPracticeDraft, writePracticeDraft, clearPracticeDraft, clearAllPracticeDrafts } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const result = find(item, predicate); if (result) return result; } }
  return !node || typeof node !== "object" ? null : predicate(node) ? node : find(node.props?.children, predicate);
};
const program = tree => find(tree, node => typeof node.props?.onAttempt === "function");
function appHarness() {
  const hooks = { cursor: 0, slots: [freshData()] };
  const h = { render() { globalThis.__draftResetHooks = hooks; hooks.cursor = 0; return App(); },
    settings() {
      find(h.render(), node => typeof node.props?.onSettings === "function").props.onSettings();
      return find(h.render(), node => typeof node.props?.onImport === "function");
    }, data: () => hooks.slots[0] };
  return h;
}
async function withStorage(fn) {
  const restoreLocks = installWebLocks();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const previousLocal = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  const storage = { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: storage });
  const durable = new Map();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: key => durable.get(key) ?? null, setItem: (key, value) => durable.set(key, value) } });
  clearAllPracticeDrafts();
  try { await fn(storage, values); }
  finally {
    restoreLocks();
    clearAllPracticeDrafts(); delete globalThis.__draftResetHooks;
    if (previous) Object.defineProperty(globalThis, "sessionStorage", previous); else delete globalThis.sessionStorage;
    if (previousLocal) Object.defineProperty(globalThis, "localStorage", previousLocal); else delete globalThis.localStorage;
  }
}

test("clear-all removes every lesson context and keeps unrelated browser data", async () => withStorage((_storage, values) => {
  values.set("other-app-value", "keep me");
  writePracticeDraft("review:session-a", "score-a", { note: "Old return", reviewCheck: { assessment: "ready", beforeDemo: true } });
  writePracticeDraft("lesson:session-b", "score-b", { note: "Old lesson" });
  assert.equal(readPracticeDraft("review:session-a", "score-a").note, "Old return");
  clearAllPracticeDrafts();
  assert.equal(readPracticeDraft("review:session-a", "score-a"), null);
  assert.equal(readPracticeDraft("lesson:session-b", "score-b"), null);
  assert.deepEqual([...values], [["other-app-value", "keep me"]]);
}));

test("clear-all also erases the in-memory fallback when session storage is unavailable", async () => withStorage(storage => {
  storage.getItem = storage.setItem = () => { throw new Error("Storage blocked"); };
  writePracticeDraft("fallback", "score", { note: "Stored in memory" });
  assert.equal(readPracticeDraft("fallback", "score").note, "Stored in memory");
  clearAllPracticeDrafts();
  assert.equal(readPracticeDraft("fallback", "score"), null);
}));

test("a newer in-memory draft wins when a storage write fails over an older persisted draft", async () => withStorage((storage, values) => {
  writePracticeDraft("quota", "score", { note: "Older persisted note" });
  storage.setItem = () => { throw new Error("Quota exceeded"); };
  writePracticeDraft("quota", "score", { note: "Latest unfinished edit", playbackRequested: true });
  assert.match([...values.values()][0], /Older persisted note/, "the failed write leaves the prior sessionStorage value in place");
  assert.deepEqual(readPracticeDraft("quota", "score"), { note: "Latest unfinished edit", playbackRequested: true }, "reopening in this tab preserves the latest work and playback evidence");
}));

test("a draft persisted before reload is read when this module has no in-memory entry", async () => withStorage((_storage, values) => {
  values.set("woodshed:lesson-draft:v1:reloaded", JSON.stringify({ abc: "score", draft: { note: "Before reloading" } }));
  assert.deepEqual(readPracticeDraft("reloaded", "score"), { note: "Before reloading" });
  assert.equal(readPracticeDraft("reloaded", "changed score"), null, "a different score cannot inherit the old draft");
}));

test("Reset everything clears unfinished work and remounts the active Program", async () => withStorage(async () => {
  const h = appHarness(), before = program(h.render()).props.key;
  writePracticeDraft("active-session", "score", { note: "Erase this", knowledgeResults: [{ correct: true }] });
  assert.equal(await h.settings().props.onReset(), true);
  assert.equal(readPracticeDraft("active-session", "score"), null);
  assert.notEqual(program(h.render()).props.key, before, "React unmounts the old player instead of letting it write erased work back");
  assert.deepEqual(h.data().programProgress.attempts, []);
  assert.equal(find(h.render(), node => typeof node.props?.onImport === "function"), null, "reset closes Settings");
}));

test("a successful backup replacement clears prior drafts and remounts Program", async () => withStorage(async () => {
  const h = appHarness(), before = program(h.render()).props.key;
  writePracticeDraft("active-session", "score", { note: "From another history" });
  const backup = freshData(); backup.settings.target = 30;
  assert.equal(await h.settings().props.onImport(backup), true);
  assert.equal(readPracticeDraft("active-session", "score"), null);
  assert.notEqual(program(h.render()).props.key, before);
  assert.equal(h.data().settings.target, 30);
}));

test("a rejected backup leaves existing unfinished work and Program intact", async () => withStorage(async () => {
  const h = appHarness(), before = program(h.render()).props.key;
  writePracticeDraft("active-session", "score", { note: "Still my unfinished work" });
  assert.equal(await h.settings().props.onImport({ items: "invalid" }), false);
  assert.equal(readPracticeDraft("active-session", "score").note, "Still my unfinished work");
  assert.equal(program(h.render()).props.key, before);
  clearPracticeDraft("active-session");
}));
