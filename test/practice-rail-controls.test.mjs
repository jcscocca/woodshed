import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Render the actual provider and rail controls; replace only React's renderer
// and the standalone metronome's physical audio boundary.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: { contents: `export { PracticeProvider } from './src/PracticeProvider.jsx';
    export { default as Tools } from './src/PracticeTools.jsx';
    export { default as Rail } from './src/PracticeRail.jsx';
    export { PracticeSheet as MobileSheet } from './src/PracticeSheet.jsx';`, resolveDir: root, loader: "js" },
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "rail-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "boundary" }));
    b.onResolve({ filter: /useMetronome\.js$/ }, () => ({ path: "metro", namespace: "boundary" }));
    b.onResolve({ filter: /useRun\.js$/ }, () => ({ path: "run", namespace: "boundary" }));
    b.onResolve({ filter: /PracticeSheet\.jsx$/ }, args => args.importer.endsWith("PracticeRail.jsx") ? { path: "sheet", namespace: "boundary" } : null);
    b.onResolve({ filter: /useDialog\.js$/ }, () => ({ path: "dialog", namespace: "boundary" }));
    b.onResolve({ filter: /useListener\.js$/ }, () => ({ path: "listener", namespace: "boundary" }));
    b.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => ({ contents: {
      react: `const current = () => globalThis.__railHooks;
        const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
        export function useState(initial) {
          const h = current(), i = h.cursor++;
          if (!(i in h.slots)) h.slots[i] = typeof initial === 'function' ? initial() : initial;
          return [h.slots[i], value => { h.slots[i] = typeof value === 'function' ? value(h.slots[i]) : value; }];
        }
        export function useEffect(fn, deps) {
          const h = current(), i = h.cursor++, previous = h.slots[i];
          if (!previous || !same(deps, previous.deps)) h.effects.push(() => {
            previous?.cleanup?.(); h.slots[i] = { deps, cleanup: fn() };
          });
        }
        export function createContext(value) { const context = { value }; context.Provider = { context }; return context; }
        export const useContext = context => context.value;
        export default { Fragment: 'fragment', createElement(type, props, ...children) { return { type, props: { ...props, children } }; } };`,
      metro: "export const useMetronome = () => globalThis.__railEnvironment.metro;",
      run: "export const useRun = () => ({ run: globalThis.__railEnvironment.run });",
      sheet: "export function ListenPanel() {}",
      dialog: "export const useDialog = () => ({ current: null });",
      listener: "export const useListener = () => ({});",
    }[path] }));
  } }],
});
const { PracticeProvider, Tools, Rail, MobileSheet } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const content = node => Array.isArray(node) ? node.map(content).join("") : node && typeof node === "object" ? content(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const all = (node, predicate) => Array.isArray(node) ? node.flatMap(item => all(item, predicate)) : !node || typeof node !== "object" ? [] : [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
const find = (tree, predicate) => all(tree, predicate)[0];
const button = (tree, name) => find(tree, node => node.type === "button" && (node.props["aria-label"] || content(node)) === name);
const range = tree => find(tree, node => node.type === "input" && node.props.type === "range");
function runner(Component, props = {}) {
  const h = { cursor: 0, slots: [], effects: [] };
  return { tree: null, render() {
    globalThis.__railHooks = h; h.cursor = 0;
    this.tree = Component(props);
    if (this.tree?.type?.context) this.tree.type.context.value = this.tree.props.value;
    for (const effect of h.effects.splice(0)) effect();
    return this.tree;
  }, close() { for (const slot of h.slots) slot?.cleanup?.(); } };
}
function harness() {
  const env = globalThis.__railEnvironment = { run: { state: "idle" }, metroStops: 0, metroStarts: 0, metroTaps: 0, lessonStarts: 0, lessonStops: 0, lessonTaps: 0, tunerOpens: 0 };
  env.metro = { bpm: 90, beatsPer: 4, beat: -1, playing: false,
    setBpm(value) { this.bpm = value; }, setBeatsPer(value) { this.beatsPer = value; },
    start() { env.metroStarts++; }, stop() { env.metroStops++; }, tap() { env.metroTaps++; } };
  env.lesson = { id: "test-lesson", title: "Long and short notes", bpm: 56, beatsPer: 3, beat: -1, playing: false, disabled: false,
    setBpm(value) { env.lesson = { ...env.lesson, bpm: value }; },
    start() { env.lessonStarts++; }, stop() { env.lessonStops++; }, tap() { env.lessonTaps++; } };
  const provider = runner(PracticeProvider), tools = runner(Tools, { hints: true }), rail = runner(Rail, { onOpenTuner() { env.tunerOpens++; } });
  const mobile = runner(MobileSheet, { onClose() {}, onOpenListen() { env.tunerOpens++; } });
  const sync = () => { provider.render(); tools.render(); rail.render(); mobile.render(); };
  sync();
  const setLesson = (value = env.lesson) => { provider.tree.props.value.setActiveLesson(value); sync(); };
  return { env, provider, tools, rail, mobile, sync, setLesson, close() { provider.close(); tools.close(); rail.close(); mobile.close(); delete globalThis.__railEnvironment; delete globalThis.__railHooks; } };
}
let failures = 0;
function test(name, fn) { const h = harness(); try { fn(h); console.log(`ok   ${name}`); } catch (error) { failures++; console.error(`FAIL ${name}\n${error.stack}`); } finally { h.close(); } }

test("standalone controls retain their tempo, range, and meter choices", h => {
  assert.equal(range(h.tools.tree).props.value, 90);
  assert.equal(range(h.tools.tree).props.min, "40");
  assert.equal(range(h.tools.tree).props.max, "240");
  button(h.tools.tree, "Faster").props.onClick(); h.sync();
  assert.equal(range(h.tools.tree).props.value, 91);
  button(h.tools.tree, "3/4 · 3 beats per bar").props.onClick(); h.sync();
  assert.equal(h.env.metro.beatsPer, 3);
  button(h.tools.tree, "Start").props.onClick();
  assert.equal(h.env.metroStarts, 1);
});

test("meter buttons keep their visible time signature in the accessible name", h => {
  const buttons = all(h.tools.tree, node => node.type === "button" && node.props.className?.includes("ws-sig-btn"));
  assert.equal(buttons.length, 3);
  for (const current of buttons) assert.ok(current.props["aria-label"].startsWith(content(current)));
});

test("an open lesson supplies the rail tempo, transport, tap and hint", h => {
  h.setLesson();
  assert.equal(h.env.metroStops, 1, "opening a lesson stops a preexisting standalone click");
  assert.equal(range(h.tools.tree).props.value, 56);
  assert.equal(range(h.tools.tree).props.min, "20");
  assert.equal(range(h.tools.tree).props.max, "160");
  assert.match(content(h.rail.tree), /Controls for Long and short notes/);
  assert.doesNotMatch(content(h.rail.tree), /Open a lesson/);
  assert.match(content(h.tools.tree), /Lesson meter · 3 beats/);
  assert.equal(button(h.tools.tree, "3/4 · 3 beats per bar"), undefined);
  button(h.tools.tree, "Faster").props.onClick(); h.setLesson();
  assert.equal(range(h.tools.tree).props.value, 57);
  assert.equal(h.env.metro.bpm, 90, "lesson controls never mutate the unrelated standalone tempo");
  button(h.tools.tree, "Tap tempoT").props.onClick();
  assert.equal(h.env.lessonTaps, 1); assert.equal(h.env.metroTaps, 0);
  button(h.tools.tree, "Play along").props.onClick();
  assert.equal(h.env.lessonStarts, 1); assert.equal(h.env.metroStarts, 0);
  assert.equal(h.env.metroStops, 1, "tempo updates do not repeatedly stop the standalone click");
});

test("lesson playback locks edits while keeping Stop available", h => {
  h.env.lesson = { ...h.env.lesson, playing: true };
  h.setLesson();
  h.provider.tree.props.value.setCoursePlaying(true); h.sync();
  assert.equal(range(h.tools.tree).props.disabled, true);
  assert.equal(button(h.tools.tree, "Faster").props.disabled, true);
  assert.equal(button(h.tools.tree, "Tap tempoT").props.disabled, true);
  assert.equal(button(h.tools.tree, "Stop").props.disabled, false);
  button(h.tools.tree, "Stop").props.onClick(); assert.equal(h.env.lessonStops, 1);
});

test("capture and saving disable the lesson transport", h => {
  h.env.lesson = { ...h.env.lesson, disabled: true }; h.setLesson();
  assert.equal(range(h.tools.tree).props.disabled, true);
  assert.equal(button(h.tools.tree, "Play along").props.disabled, true);
  assert.equal(find(h.rail.tree, node => node.type === Tools).props.stopwatchExtra.props.disabled, true, "the tuner cannot open a competing microphone input during capture");
});

test("lesson tempo nudges respect 20–160 and close restores standalone controls", h => {
  h.env.lesson = { ...h.env.lesson, bpm: 20 }; h.setLesson();
  button(h.tools.tree, "Slower").props.onClick(); h.setLesson();
  assert.equal(range(h.tools.tree).props.value, 20);
  h.env.lesson = { ...h.env.lesson, bpm: 160 }; h.setLesson();
  button(h.tools.tree, "Faster").props.onClick(); h.setLesson();
  assert.equal(range(h.tools.tree).props.value, 160);
  h.setLesson(null);
  assert.equal(range(h.tools.tree).props.value, 90);
  assert.match(content(h.rail.tree), /Open a lesson/);
  assert.ok(button(h.tools.tree, "4/4 · 4 beats per bar"));
});

test("opening the tuner stops both lesson and standalone audio owners", h => {
  h.setLesson();
  const tuner = find(h.rail.tree, node => node.type === Tools).props.stopwatchExtra;
  tuner.props.onClick();
  assert.equal(h.env.lessonStops, 1);
  assert.equal(h.env.metroStops, 2);
  assert.equal(h.env.tunerOpens, 1);
});

test("mobile tuner respects the recording/saving lock even if a stale handler is invoked", h => {
  h.env.lesson = { ...h.env.lesson, disabled: true }; h.setLesson();
  const tuner = find(h.mobile.tree, node => node.type === "button" && node.props.className === "ws-listen-open");
  assert.equal(tuner.props.disabled, true);
  const stops = h.env.metroStops;
  tuner.props.onClick();
  assert.equal(h.env.tunerOpens, 0); assert.equal(h.env.lessonStops, 0); assert.equal(h.env.metroStops, stops);
});

test("mobile tuner stops the owned lesson playback before opening another microphone tool", h => {
  h.env.lesson = { ...h.env.lesson, playing: true }; h.setLesson();
  const tuner = find(h.mobile.tree, node => node.type === "button" && node.props.className === "ws-listen-open");
  assert.equal(tuner.props.disabled, false);
  tuner.props.onClick();
  assert.equal(h.env.lessonStops, 1); assert.equal(h.env.metroStops, 2); assert.equal(h.env.tunerOpens, 1);
});

test("a scored play-along retains its metronome lock", h => {
  h.env.run = { state: "running", play: true }; h.sync();
  assert.equal(range(h.tools.tree).props.disabled, true);
  assert.equal(button(h.tools.tree, "Start").props.disabled, true);
});

if (failures) process.exitCode = 1;
else console.log("\nall rail-control checks green");
