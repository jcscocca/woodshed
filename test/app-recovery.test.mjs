import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { freshData } from "../src/engine.js";

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
  const names = ["localStorage", "sessionStorage", "window", "document", "FileReader", "setInterval", "clearInterval", "setTimeout"];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const urlCreate = URL.createObjectURL, urlRevoke = URL.revokeObjectURL, warn = console.warn;
  const values = new Map(raw === undefined ? [] : [["woodshed-state-v1", raw]]), drafts = new Map();
  const env = { values, writes: [], denied: !!options.denied, failWrites: false, downloads: [], readers: [] };
  const localStorage = { getItem(key) { if (env.denied) throw new Error("Storage blocked"); return values.get(key) ?? null; },
    setItem(key, value) { env.writes.push(value); if (env.failWrites) throw new Error("Quota exceeded"); values.set(key, value); } };
  const sessionStorage = { get length() { return drafts.size; }, key: i => [...drafts.keys()][i] ?? null, getItem: k => drafts.get(k) ?? null, setItem: (k, v) => drafts.set(k, v), removeItem: k => drafts.delete(k) };
  const document = new EventTarget(); document.visibilityState = "visible"; document.body = { appendChild() {} }; document.createElement = () => ({ click() { env.downloads.at(-1).filename = this.download; }, remove() {} });
  const globals = { localStorage, sessionStorage, window: new EventTarget(), document,
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
