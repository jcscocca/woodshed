import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Exercise the real component handlers together. Only React's rendering
// boundary, physical MIDI access, and sound output are replaced. These checks
// do not request a microphone, connect hardware, or claim to measure audio.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    contents: `export { default as Player } from './src/program/PracticePlayer.jsx';
      export { ShortcutBridge } from './src/useShortcuts.js';
      export { MidiProvider } from './src/midi/MidiProvider.jsx';
      export { default as MidiBand } from './src/midi/MidiBand.jsx';`,
    resolveDir: root, loader: "js",
  },
  bundle: true, write: false, format: "esm", platform: "node",
  define: { "import.meta.env.DEV": "false" },
  plugins: [{ name: "audio-control-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "hooks" }));
    b.onLoad({ filter: /.*/, namespace: "hooks" }, () => ({ contents: `
      const current = () => globalThis.__woodshedAudioHooks;
      const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
      export function useState(initial) {
        const h = current(), i = h.cursor++;
        if (!(i in h.slots)) h.slots[i] = typeof initial === 'function' ? initial() : initial;
        return [h.slots[i], value => {
          const next = typeof value === 'function' ? value(h.slots[i]) : value;
          if (!Object.is(next, h.slots[i])) { h.slots[i] = next; h.dirty = true; }
        }];
      }
      export function useMemo(fn, deps) {
        const h = current(), i = h.cursor++;
        if (!h.slots[i] || !same(deps, h.slots[i].deps)) h.slots[i] = { deps, value: fn() };
        return h.slots[i].value;
      }
      export const useCallback = (fn, deps) => useMemo(() => fn, deps);
      export const useRef = initial => useMemo(() => ({ current: initial }), []);
      export const useId = () => useMemo(() => 'audio-test-id', []);
      export function useEffect(fn, deps) {
        const h = current(), i = h.cursor++, previous = h.slots[i];
        if (!previous || !same(deps, previous.deps)) h.effects.push(() => {
          previous?.cleanup?.(); h.slots[i] = { deps, cleanup: fn() };
        });
      }
      export const useLayoutEffect = useEffect;
      export function createContext(value) { const c = { value }; c.Provider = { context: c }; return c; }
      export const useContext = context => context.value;
      export const useSyncExternalStore = (_subscribe, snapshot) => snapshot();
      export default { Fragment: 'fragment', createElement(type, props, ...children) { return { type, props: { ...props, children } }; } };
    ` }));
    b.onResolve({ filter: /PracticeProvider\.jsx$/ }, () => ({ path: "practice", namespace: "boundary" }));
    b.onResolve({ filter: /(?:PracticeRecorder|KnowledgeChecks)\.jsx$/ }, args => ({ path: args.path, namespace: "boundary" }));
    b.onResolve({ filter: /lessonAudio\.js$/ }, () => ({ path: "legacy-audio", namespace: "boundary" }));
    b.onResolve({ filter: /connection\.js$/ }, () => ({ path: "connection", namespace: "boundary" }));
    b.onResolve({ filter: /^\.\/playback\.js$/ }, args => args.importer.endsWith("PracticePlayer.jsx") ? ({ path: "lesson-playback", namespace: "boundary" }) : null);
    b.onLoad({ filter: /.*/, namespace: "boundary" }, args => ({ contents: {
      practice: "export const usePractice = () => globalThis.__woodshedAudioEnvironment.practice;",
      "legacy-audio": `export const playTake = notes => { const e = globalThis.__woodshedAudioEnvironment; e.played.push(notes); e.legacyPlaying = true; };
        export const stop = () => { const e = globalThis.__woodshedAudioEnvironment; e.legacyStops++; e.legacyPlaying = false; };`,
      connection: `export function createMidiConnection() { return globalThis.__woodshedAudioEnvironment.connection; }`,
      "lesson-playback": `export { planPlayback } from ${JSON.stringify(fileURLToPath(new URL("../src/program/playback.js", import.meta.url)))};
        export function createLessonPlayback() {
          const e = globalThis.__woodshedAudioEnvironment;
          return { async start(plan, callbacks) { e.lessonRuns.push({ plan, callbacks }); }, stop() { e.lessonStops++; }, close() { e.lessonCloses++; } };
        }`,
    }[args.path] || "export default function Child() {}", resolveDir: root }));
    b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const components = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const found = find(item, predicate); if (found) return found; } }
  if (!node || typeof node !== "object") return null;
  return predicate(node) ? node : find(node.props?.children, predicate);
};
const content = node => Array.isArray(node) ? node.map(content).join("") : node && typeof node === "object" ? content(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const button = (tree, name) => find(tree, node => node.type === "button" && content(node).includes(name));
const scalar = tree => find(tree, node => node.type === "input" && node.props.type === "range" && node.props.min === "20").props.value;
const makeRunner = (Component, props) => {
  const h = { cursor: 0, slots: [], effects: [], dirty: false };
  const runner = {
    tree: null,
    render() {
      let renders = 0;
      do {
        assert.ok(++renders < 25, "component did not settle");
        globalThis.__woodshedAudioHooks = h; h.cursor = 0; h.dirty = false;
        runner.tree = Component(props);
        if (runner.tree?.type?.context) runner.tree.type.context.value = runner.tree.props.value;
        for (const effect of h.effects.splice(0)) effect();
      } while (h.dirty);
      return runner.tree;
    },
    close() { for (const slot of h.slots) slot?.cleanup?.(); },
  };
  return runner;
};

let nextHarness = 0;
async function harness() {
  const savedGlobals = new Map(["window", "document", "navigator", "performance", "requestAnimationFrame", "cancelAnimationFrame"].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const env = globalThis.__woodshedAudioEnvironment = { now: 0, played: [], legacyPlaying: false, legacyStops: 0, lessonRuns: [], lessonStops: 0, lessonCloses: 0, railTaps: 0, metroStops: 0 };
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: new EventTarget() },
    document: { configurable: true, value: { querySelector: () => null } },
    navigator: { configurable: true, value: {} },
    performance: { configurable: true, value: { now: () => env.now } },
    requestAnimationFrame: { configurable: true, value: () => 1 },
    cancelAnimationFrame: { configurable: true, value: () => {} },
  });
  env.practice = {
    coursePlaying: false,
    setCoursePlaying(value) { env.practice.coursePlaying = value; },
    metro: { stop() { env.metroStops++; }, tap() { env.railTaps++; } },
  };
  const subscribers = new Set();
  env.connection = {
    status: "connected", deviceName: "Test keyboard",
    onStatus() { return () => {}; }, onMessage(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
    autoConnect() {}, connect() {}, close() {},
    emit(data, at) { for (const fn of subscribers) fn(data, at, "test-keyboard"); },
  };
  const midi = makeRunner(components.MidiProvider, { enabled: true });
  const player = makeRunner(components.Player, {
    draftKey: `audio-controls-harness-${++nextHarness}`,
    exercise: { id: "audio-control-test", title: "Audio control test", bpm: 60, hands: "both", section: "guided", checks: [],
      abc: "X:1\nM:4/4\nL:1/4\nK:C\nC4|]" },
    onLog: async () => {},
  });
  const bridge = makeRunner(components.ShortcutBridge, { onAction() {} });
  const band = makeRunner(components.MidiBand, {});
  midi.render(); player.render(); bridge.render(); band.render();
  await new Promise(resolve => setImmediate(resolve));
  player.render(); midi.render(); bridge.render(); band.render();
  assert.equal(scalar(player.tree), 60, "the actual score loaded and exposes tempo controls");
  env.connection.emit([0x90, 60, 100], 0);
  env.connection.emit([0x80, 60, 0], 500);
  const sync = () => { player.render(); midi.render(); bridge.render(); band.render(); };
  const key = (key, at = env.now) => {
    env.now = at;
    const event = new Event("keydown", { cancelable: true }); Object.assign(event, { key });
    window.dispatchEvent(event); sync(); return event;
  };
  return { env, midi, player, band, sync, key,
    recorder: () => find(player.tree, node => typeof node.props?.onActivityChange === "function"),
    knowledge: () => find(player.tree, node => typeof node.props?.onHear === "function"),
    close() {
      bridge.close(); band.close(); player.close(); midi.close();
      for (const [name, descriptor] of savedGlobals) if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
      delete globalThis.__woodshedAudioEnvironment; delete globalThis.__woodshedAudioHooks;
    },
  };
}

let failures = 0;
const test = async (name, fn) => {
  const h = await harness();
  try { await fn(h); console.log(`ok   ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}\n     ${error.stack}`); }
  finally { h.close(); }
};

await test("T changes the open lesson tempo, leaves rail tempo alone, and resets after a pause", h => {
  assert.equal(h.key("t", 0).defaultPrevented, true);
  h.key("t", 750); assert.equal(scalar(h.player.tree), 80);
  h.key("t", 1500); assert.equal(scalar(h.player.tree), 80);
  h.key("t", 6000); assert.equal(scalar(h.player.tree), 80, "one fresh tap does not reuse stale intervals");
  h.key("t", 9000); assert.equal(scalar(h.player.tree), 20, "slow quarter-note taps reach the lesson minimum");
  h.key("t", 14000); h.key("t", 14010);
  assert.equal(scalar(h.player.tree), 160, "very fast taps respect the lesson maximum");
  assert.equal(h.env.railTaps, 0);
});

await test("recording blocks P, stale MIDI callbacks and band buttons, then releases ownership", h => {
  const oldPlayback = h.midi.tree.props.value.playLastTake;
  h.key("p"); assert.equal(h.env.played.length, 1);
  assert.equal(h.env.played[0][0].midi, 60, "a real parsed MIDI take reaches the mocked sound output");
  h.recorder().props.onBeforeRecord();
  assert.equal(h.env.legacyPlaying, false, "preexisting legacy sound is stopped before the microphone request");
  h.recorder().props.onActivityChange(true); h.sync();
  assert.equal(h.env.practice.coursePlaying, true);
  h.key("p"); oldPlayback();
  const bandPlayback = button(h.band.tree, "Play back");
  assert.equal(bandPlayback.props.disabled, true);
  bandPlayback.props.onClick();
  assert.equal(h.env.played.length, 1, "the playback owner guards button and old callback paths too");
  h.key("t", 0); h.key("t", 500);
  assert.equal(scalar(h.player.tree), 60, "capture does not accept tempo changes through T");
  h.recorder().props.onActivityChange(false); h.sync();
  h.key("p"); assert.equal(h.env.played.length, 2, "finishing capture restores MIDI replay");
  assert.equal(button(h.band.tree, "Play back").props.disabled, false);
});

await test("reference playback stops legacy sound and rejects MIDI playback until Stop", async h => {
  h.key("p"); assert.equal(h.env.legacyPlaying, true);
  await button(h.player.tree, "Hear slowly").props.onClick(); h.sync();
  assert.equal(h.env.legacyPlaying, false);
  assert.equal(h.env.lessonRuns.length, 1);
  assert.equal(h.env.practice.coursePlaying, true);
  h.key("p"); assert.equal(h.env.played.length, 1);
  button(h.player.tree, "Stop playback").props.onClick(); h.sync();
  assert.equal(h.env.practice.coursePlaying, false);
  h.key("p"); assert.equal(h.env.played.length, 2);
});

await test("a listening question owns the same audio lock and releases it on completion", async h => {
  h.key("p");
  await h.knowledge().props.onHear({ audio: [{ midi: 60, hand: "R", beat: 0, dur: 1 }], audioBeats: 2 }); h.sync();
  assert.equal(h.env.legacyPlaying, false);
  assert.equal(h.env.practice.coursePlaying, true);
  h.key("p"); assert.equal(h.env.played.length, 1);
  h.env.lessonRuns.at(-1).callbacks.onEnd(); h.sync();
  assert.equal(h.env.practice.coursePlaying, false);
  h.key("p"); assert.equal(h.env.played.length, 2);
});

await test("changing course ownership stops an already-playing MIDI take at the provider", h => {
  h.key("p"); const previousStops = h.env.legacyStops;
  h.env.practice.coursePlaying = true; h.midi.render();
  assert.ok(h.env.legacyStops > previousStops);
  assert.equal(h.env.legacyPlaying, false);
  h.midi.tree.props.value.playLastTake(); assert.equal(h.env.played.length, 1);
});

if (failures) process.exitCode = 1;
else console.log("\nall audio-control integration checks green");
