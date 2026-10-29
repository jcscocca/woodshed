import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { freshData } from "../src/engine.js";
import { addDays, todayStr } from "../src/dateUtils.js";
import { EXERCISES, UNITS, sessionsForUnit } from "../src/program/curriculum.js";
import { contextForExercise, exerciseProgress, normalizeProgress, recordAttempt, sessionProgress } from "../src/program/progress.js";
import { transferForExercise, TRANSFER_VARIANT_COUNT } from "../src/program/transfer.js";

// Keep the real Program/App handlers, curriculum, scheduler and progress model.
// Replace rendering, physical UI boundaries and storage; no flow is duplicated.
const root = fileURLToPath(new URL("../", import.meta.url));
const react = `
  export function useState(initial) {
    const h = globalThis.__woodshedGuidedReviewHooks, index = h.cursor++;
    if (!(index in h.slots)) h.slots[index] = typeof initial === 'function' ? initial() : initial;
    return [h.slots[index], value => { h.slots[index] = typeof value === 'function' ? value(h.slots[index]) : value; }];
  }
  export function useRef(initial) {
    const h = globalThis.__woodshedGuidedReviewHooks, index = h.cursor++;
    if (!(index in h.slots)) h.slots[index] = { current: initial };
    return h.slots[index];
  }
  export function useEffect() {}
  export const useLayoutEffect = useEffect;
  export default { Fragment:'fragment', createElement(type,props,...children) { return { type,props:{...props,children} }; } };
`;
const commonBoundaries = b => {
  b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "hooks" }));
  b.onLoad({ filter: /.*/, namespace: "hooks" }, () => ({ contents: react }));
  b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
};
const programBundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/program/Program.jsx", import.meta.url))],
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "guided-review-program-boundaries", setup(b) {
    commonBoundaries(b);
    b.onResolve({ filter: /PracticePlayer\.jsx$/ }, () => ({ path: "player", namespace: "boundary" }));
    b.onLoad({ filter: /.*/, namespace: "boundary" }, () => ({ contents: "export default function PracticePlayer() {}" }));
  } }],
});
const { default: Program } = await import(`data:text/javascript;base64,${Buffer.from(programBundle.outputFiles[0].text).toString("base64")}`);

const progressPath = fileURLToPath(new URL("../src/program/progress.js", import.meta.url));
const appBundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/App.jsx", import.meta.url))],
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "guided-review-app-boundaries", setup(b) {
    commonBoundaries(b);
    b.onResolve({ filter: /\.\/program\/progress\.js$/ }, () => ({ path: "progress", namespace: "app-progress" }));
    b.onLoad({ filter: /.*/, namespace: "app-progress" }, () => ({ contents: `
      export { normalizeProgress, recordAttempt } from ${JSON.stringify(progressPath)};
      import { contextForExercise as actualContext } from ${JSON.stringify(progressPath)};
      export function contextForExercise(...args) {
        globalThis.__woodshedGuidedReviewApp.inferred.push(args);
        return actualContext(...args);
      }
    `, resolveDir: root }));
    b.onResolve({ filter: /storage\.js$/ }, () => ({ path: "storage", namespace: "app-boundary" }));
    b.onResolve({ filter: /useIsDesktop\.js$/ }, () => ({ path: "desktop", namespace: "app-boundary" }));
    b.onResolve({ filter: /useShortcuts\.js$/ }, () => ({ path: "shortcuts", namespace: "app-boundary" }));
    b.onResolve({ filter: /\.jsx$/ }, args => args.importer.endsWith("App.jsx") ? { path: args.path, namespace: "app-boundary" } : null);
    b.onLoad({ filter: /.*/, namespace: "app-boundary" }, args => ({ contents: args.path === "storage" ? `
      export async function saveState(value) {
        const env = globalThis.__woodshedGuidedReviewApp;
        env.writes.push(JSON.parse(JSON.stringify(value)));
        return env.saveOk;
      }
      export async function loadState() { return null; }
      export const migrate = value => value;
    ` : args.path === "desktop" ? "export const useIsDesktop = () => true;" : `
      export default function Boundary() {}
      export function LessonBody() {}
      export function PracticeProvider() {}
      export function PracticeSheet() {}
      export function ListenSheet() {}
      export function ShortcutBridge() {}
      export function MidiProvider() {}
      export const VIEWS = [];
    ` }));
  } }],
});
const { default: App } = await import(`data:text/javascript;base64,${Buffer.from(appBundle.outputFiles[0].text).toString("base64")}`);

import { guidedSessionPlan } from "../src/program/sessionPlan.js";


const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const found = find(item, predicate); if (found) return found; } }
  if (!node || typeof node !== "object") return null;
  return predicate(node) ? node : find(node.props?.children, predicate);
};
const text = node => Array.isArray(node) ? node.map(text).join("") : node && typeof node === "object" ? text(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const player = tree => find(tree, node => node.props?.exercise);
const button = (tree, name) => find(tree, node => node.type === "button" && text(node) === name);
const sessionCard = (tree, session) => find(tree, node => node.type === "article" && text(node).includes(session.title));
const today = todayStr(), oldDay = addDays(today, -40);
const cSession = sessionsForUnit(UNITS[0].id)[0], gSession = sessionsForUnit(UNITS[1].id)[0];
const source = EXERCISES.find(exercise => exercise.id === cSession.blocks[0].exerciseId);
const firstCheck = { assessment: "ready", beforeDemo: true, bpm: 56, hands: "R", fromBar: 1, toBar: 4 };
const report = (patch = {}) => ({ exerciseId: source.id, skillIds: source.skillIds, section: "guided", assessment: "ready",
  minutes: 3, date: oldDay, bpm: 56, hands: "R", fromBar: 1, toBar: 4, note: "Keep the count going.", ...patch });
const successfulReturns = () => [report(),
  report({ date: addDays(today, -35), section: "review", reviewCheck: firstCheck }),
  report({ date: addDays(today, -25), section: "review", reviewCheck: firstCheck })];

function harness(progress = { attempts: [report()] }, { reject = false, unitId = gSession.unitId } = {}) {
  const hooks = { cursor: 0, slots: [] }, entries = [], changes = [];
  let currentProgress = normalizeProgress(progress);
  const h = {
    entries, changes, reject,
    progress: () => currentProgress,
    render() {
      globalThis.__woodshedGuidedReviewHooks = hooks; hooks.cursor = 0;
      return Program({ section: "guided", unitId, progress: currentProgress, onUnitChange: value => changes.push(value), onAttempt: async entry => {
        if (h.reject) throw new Error("storage unavailable");
        entries.push(entry); currentProgress = recordAttempt(currentProgress, entry);
      } });
    },
  };
  return h;
}

function appHarness() {
  const data = freshData();
  data.programUnitId = gSession.unitId;
  data.programProgress = normalizeProgress({ attempts: [report()] });
  const hooks = { cursor: 0, slots: [data] }, env = { writes: [], inferred: [], saveOk: true };
  return {
    env, data: () => hooks.slots[0],
    onAttempt() {
      globalThis.__woodshedGuidedReviewHooks = hooks; hooks.cursor = 0;
      globalThis.__woodshedGuidedReviewApp = env;
      const tree = App(), component = find(tree, node => typeof node.props?.onAttempt === "function");
      assert.ok(component, "the actual App renders its course callback");
      return component.props.onAttempt;
    },
  };
}

let failures = 0;
const test = async (name, fn) => { try { await fn(); console.log("ok   " + name); } catch (error) { failures++; console.error("FAIL " + name + "\n     " + error.stack); } };
const start = h => { const control = button(h.render(), "Start 20-minute session"); assert.ok(control); control.props.onClick(); return player(h.render()); };
const saveCore = async h => {
  const current = player(h.render());
  assert.ok(current && !current.props.reviewMode, "a real core block is open");
  await current.props.onLog({ assessment: "practising", minutes: current.props.defaultMinutes });
};

await test("a new guided session begins with one due earlier-unit return inside its twenty-minute budget", () => {
  const h = harness(), current = start(h);
  assert.ok(current);
  assert.equal(current.props.exercise.id, source.id);
  assert.equal(current.props.reviewMode, true);
  assert.equal(!!current.props.transferMode, false);
  assert.equal(current.props.defaultMinutes, 3);
  assert.deepEqual(current.props.defaultRange, { from: 1, to: 4 });
  assert.match(text(h.render()), /20/);
  assert.deepEqual(h.changes, [], "review does not change the selected G-major unit");
  assert.equal(h.progress().attempts.length, 1, "opening a return makes no durable completion claim");
});

await test("saving the integrated return starts the original core goals with seventeen allocated minutes", async () => {
  const h = harness(), current = start(h);
  await current.props.onLog({ assessment: "ready", minutes: 3, reviewCheck: firstCheck });
  assert.equal(h.entries[0].section, "review");
  assert.equal(h.entries[0].reviewForSession, gSession.id);
  assert.equal(h.entries[0].sessionId, undefined);
  assert.equal(h.entries[0].blockIndex, undefined);
  assert.deepEqual(h.entries[0].reviewCheck, firstCheck);
  assert.equal(sessionProgress(h.progress(), gSession).started, true);
  assert.equal(sessionProgress(h.progress(), gSession).completed, 0);
  const expected = guidedSessionPlan(h.progress(), gSession).blocks;
  assert.equal(expected.reduce((sum, block) => sum + block.minutes, 0), 17);
  for (let index = 0; index < gSession.blocks.length; index++) {
    const core = player(h.render());
    assert.equal(core.props.exercise.id, gSession.blocks[index].exerciseId);
    assert.equal(core.props.defaultMinutes, expected[index].minutes);
    await saveCore(h);
  }
  assert.equal(player(h.render()), null);
  assert.equal(h.entries.reduce((sum, entry) => sum + entry.minutes, 0), 20);
  assert.deepEqual(h.entries.slice(1).map(entry => entry.blockIndex), gSession.blocks.map((_, index) => index));
  assert.equal(sessionProgress(h.progress(), gSession).done, true);
});

await test("a saved return-only session and partial core resume after reload without a duplicate review", async () => {
  const h = harness();
  await start(h).props.onLog({ assessment: "ready", minutes: 3, reviewCheck: firstCheck });
  const restored = harness(JSON.parse(JSON.stringify(h.progress())));
  button(restored.render(), "Resume session").props.onClick();
  let current = player(restored.render());
  assert.equal(!!current.props.reviewMode, false);
  assert.equal(current.props.exercise.id, gSession.blocks[0].exerciseId);
  assert.equal(current.props.defaultMinutes, guidedSessionPlan(restored.progress(), gSession).blocks[0].minutes);
  await saveCore(restored);
  const resumed = harness(JSON.parse(JSON.stringify(restored.progress())));
  button(resumed.render(), "Resume session").props.onClick();
  current = player(resumed.render());
  assert.equal(!!current.props.reviewMode, false);
  assert.equal(current.props.exercise.id, gSession.blocks[1].exerciseId);
  assert.equal(current.props.defaultMinutes, guidedSessionPlan(resumed.progress(), gSession).blocks[1].minutes);
  assert.equal(resumed.progress().attempts.filter(entry => entry.reviewForSession === gSession.id).length, 1);
  assert.deepEqual(sessionProgress(resumed.progress(), gSession).completedBlocks, [0]);
});

await test("a failed integrated-review save keeps the same return and never consumes its budget", async () => {
  const h = harness(undefined, { reject: true }), current = start(h);
  await assert.rejects(current.props.onLog({ assessment: "ready", minutes: 3, reviewCheck: firstCheck }), /storage unavailable/);
  assert.equal(player(h.render()).props.exercise.id, source.id);
  assert.equal(player(h.render()).props.reviewMode, true);
  assert.equal(h.progress().attempts.length, 1);
  assert.equal(sessionProgress(h.progress(), gSession).started, false);
  assert.equal(h.progress().attempts.some(entry => entry.reviewForSession), false);
  h.reject = false;
  await player(h.render()).props.onLog({ assessment: "ready", minutes: 3, reviewCheck: firstCheck });
  assert.equal(h.entries.length, 1);
  assert.equal(player(h.render()).props.exercise.id, gSession.blocks[0].exerciseId);
});

await test("skipping integrated review retains twenty core minutes and does not insert it on partial resume", async () => {
  const h = harness();
  const skip = button(h.render(), "Start without review");
  assert.ok(skip, "the learner can choose the existing guided plan");
  skip.props.onClick();
  assert.equal(!!player(h.render()).props.reviewMode, false);
  assert.equal(player(h.render()).props.defaultMinutes, gSession.blocks[0].minutes);
  await saveCore(h);
  const restored = harness(JSON.parse(JSON.stringify(h.progress())));
  button(restored.render(), "Resume session").props.onClick();
  assert.equal(player(restored.render()).props.exercise.id, gSession.blocks[1].exerciseId);
  assert.equal(player(restored.render()).props.defaultMinutes, gSession.blocks[1].minutes);
  assert.equal(restored.progress().attempts.some(entry => entry.reviewForSession), false);
  assert.equal(guidedSessionPlan(restored.progress(), gSession).reviewMinutes, 0);
});

await test("completed-session revisits keep their original core plan and receive no extra prelude", () => {
  const progress = { attempts: [report(), report({ section: "review", date: addDays(today, -5), reviewForSession: gSession.id })],
    completedBlocks: { [gSession.id]: gSession.blocks.map((_, index) => index) } };
  const h = harness(progress), card = sessionCard(h.render(), gSession);
  assert.ok(card);
  button(card, "Revisit session").props.onClick();
  const current = player(h.render());
  assert.equal(!!current.props.reviewMode, false);
  assert.equal(current.props.exercise.id, gSession.blocks[0].exerciseId);
  assert.equal(current.props.defaultMinutes, gSession.blocks[0].minutes);
});

await test("two qualified returns introduce a fresh transfer example and preserve its separate evidence", async () => {
  const h = harness({ attempts: successfulReturns() });
  const previous = exerciseProgress(h.progress(), source.id);
  const current = start(h);
  assert.equal(current.props.reviewMode, true);
  assert.equal(current.props.transferMode, true);
  assert.ok(current.props.exercise.transferId);
  assert.notEqual(current.props.exercise.abc, source.abc, "transfer is different musical material rather than a new label");
  assert.equal(current.props.exercise.key, source.key, "a transfer cannot silently introduce an unlearned key");
  assert.equal(current.props.previousAttempt, null, "a fresh score does not inherit an old performance setup");
  assert.equal(current.props.defaultRange, undefined, "the old passage range cannot clip a new example");
  const transferCheck = { assessment: "practising", beforeDemo: true, bpm: current.props.exercise.bpm,
    hands: current.props.exercise.hands, fromBar: 1, toBar: 4 };
  await current.props.onLog({ assessment: "ready", minutes: 3, transferCheck });
  const entry = h.entries[0];
  assert.equal(entry.section, "transfer");
  assert.equal(entry.reviewForSession, gSession.id);
  assert.equal(entry.transferId, current.props.exercise.transferId);
  assert.deepEqual(entry.transferCheck, transferCheck);
  assert.equal(entry.reviewCheck, undefined);
  assert.equal(entry.sessionId, undefined);
  const after = exerciseProgress(h.progress(), source.id);
  assert.equal(after.status, previous.status);
  assert.deepEqual(after.lastAttempt, previous.lastAttempt, "fresh-example evidence does not rewrite readiness for the original passage");
  assert.equal(player(h.render()).props.exercise.id, gSession.blocks[0].exerciseId);
  assert.equal(guidedSessionPlan(h.progress(), gSession).reviewMinutes, 3);
  assert.equal(sessionProgress(h.progress(), gSession).completed, 0);
});

await test("the real App skips guided completion inference for transfer and persists its session association", async () => {
  const h = appHarness();
  assert.deepEqual(contextForExercise(h.data().programProgress, sessionsForUnit(cSession.unitId), source.id), { sessionId: cSession.id, blockIndex: 0 });
  const transferCheck = { ...firstCheck, assessment: "practising" };
  await h.onAttempt()({ ...report(), section: "transfer", date: today, transferId: "fresh-rhythm-v1-0", reviewForSession: gSession.id, transferCheck });
  assert.equal(h.env.inferred.length, 0);
  assert.equal(h.env.writes.length, 1);
  const saved = h.data().programProgress.attempts.at(-1);
  assert.equal(saved.section, "transfer");
  assert.equal(saved.reviewForSession, gSession.id);
  assert.deepEqual(saved.transferCheck, transferCheck);
  assert.deepEqual(h.data().programProgress.completedBlocks, {});
  assert.equal(sessionProgress(h.data().programProgress, gSession).started, true);
  assert.equal(sessionProgress(h.data().programProgress, gSession).completed, 0);
  assert.equal(h.data().programUnitId, gSession.unitId);
});

await test("direct lesson times match their cards before a session reserves review time", () => {
  const h = harness(), card = sessionCard(h.render(), gSession), block = gSession.blocks[0];
  const title = EXERCISES.find(exercise => exercise.id === block.exerciseId).title;
  const control = find(card, node => node.type === "button" && text(node).includes(title) && text(node).endsWith(`${block.minutes}m`));
  assert.ok(control, "the card displays the direct lesson's original allocation");
  control.props.onClick();
  assert.equal(player(h.render()).props.defaultMinutes, block.minutes);
  assert.equal(!!player(h.render()).props.reviewMode, false);
});

await test("used transfer IDs are skipped and an exhausted bank falls back to a return", () => {
  const used = variant => report({ section: "transfer", date: addDays(today, -39), transferId: transferForExercise(source, variant).transferId });
  let h = harness({ attempts: [...successfulReturns(), used(0)] });
  assert.equal(start(h).props.exercise.transferId, transferForExercise(source, 1).transferId);
  h = harness({ attempts: [...successfulReturns(), ...Array.from({ length: TRANSFER_VARIANT_COUNT }, (_, variant) => used(variant))] });
  const current = start(h);
  assert.equal(current.props.transferMode, false);
  assert.equal(current.props.exercise.abc, source.abc);
});

await test("a difficult fresh example carries its repair forward without rewriting the original visit", () => {
  const note = "Tap the new eighth-note entry before joining the hands.";
  const h = harness({ attempts: [...successfulReturns(), report({ section: "transfer", date: addDays(today, -5),
    transferId: transferForExercise(source).transferId, assessment: "ready", note,
    transferCheck: { ...firstCheck, assessment: "practising" } })] });
  assert.match(text(h.render()), /Fresh-example repair: Tap the new eighth-note entry/);
  const current = start(h);
  assert.equal(current.props.transferMode, false);
  assert.equal(current.props.reviewNote, `From your fresh example: ${note}`);
  assert.equal(current.props.previousAttempt.note, "Keep the count going.");
});

delete globalThis.__woodshedGuidedReviewHooks;
delete globalThis.__woodshedGuidedReviewApp;
if (failures) process.exitCode = 1;
else console.log("\nall guided-review budget and transfer flow checks green");
