import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { freshData } from "../src/engine.js";
import { addDays, todayStr } from "../src/dateUtils.js";
import { EXERCISES, SESSIONS, UNITS, sessionsForUnit } from "../src/program/curriculum.js";
import { contextForExercise, nextSession, normalizeProgress, recordAttempt, sessionProgress } from "../src/program/progress.js";

// Keep the real Program/App handlers, curriculum, scheduler and progress model.
// Replace rendering, physical UI boundaries and storage; no flow is duplicated.
const root = fileURLToPath(new URL("../", import.meta.url));
const react = `
  export function useState(initial) {
    const h = globalThis.__woodshedCumulativeHooks, index = h.cursor++;
    if (!(index in h.slots)) h.slots[index] = typeof initial === 'function' ? initial() : initial;
    return [h.slots[index], value => { h.slots[index] = typeof value === 'function' ? value(h.slots[index]) : value; }];
  }
  export function useRef(initial) {
    const h = globalThis.__woodshedCumulativeHooks, index = h.cursor++;
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
  plugins: [{ name: "cumulative-program-boundaries", setup(b) {
    commonBoundaries(b);
    b.onResolve({ filter: /(?:PracticePlayer|ConceptReview)\.jsx$/ }, () => ({ path: "player", namespace: "boundary" }));
    b.onLoad({ filter: /.*/, namespace: "boundary" }, () => ({ contents: "export default function PracticePlayer() {}" }));
  } }],
});
const { default: Program, ProgramProgress } = await import(`data:text/javascript;base64,${Buffer.from(programBundle.outputFiles[0].text).toString("base64")}`);

const progressPath = fileURLToPath(new URL("../src/program/progress.js", import.meta.url));
const appBundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/App.jsx", import.meta.url))],
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "cumulative-app-boundaries", setup(b) {
    commonBoundaries(b);
    b.onResolve({ filter: /\.\/program\/progress\.js$/ }, () => ({ path: "progress", namespace: "app-progress" }));
    b.onLoad({ filter: /.*/, namespace: "app-progress" }, () => ({ contents: `
      export { normalizeProgress, recordAttempt } from ${JSON.stringify(progressPath)};
      import { contextForExercise as actualContext } from ${JSON.stringify(progressPath)};
      export function contextForExercise(...args) {
        globalThis.__woodshedCumulativeApp.inferred.push(args);
        return actualContext(...args);
      }
    `, resolveDir: root }));
    b.onResolve({ filter: /storage\.js$/ }, () => ({ path: "storage", namespace: "app-boundary" }));
    b.onResolve({ filter: /useIsDesktop\.js$/ }, () => ({ path: "desktop", namespace: "app-boundary" }));
    b.onResolve({ filter: /useShortcuts\.js$/ }, () => ({ path: "shortcuts", namespace: "app-boundary" }));
    b.onResolve({ filter: /\.jsx$/ }, args => args.importer.endsWith("App.jsx") ? { path: args.path, namespace: "app-boundary" } : null);
    b.onLoad({ filter: /.*/, namespace: "app-boundary" }, args => ({ contents: args.path === "storage" ? `
      export async function saveState(value) {
        const env = globalThis.__woodshedCumulativeApp;
        env.writes.push(JSON.parse(JSON.stringify(value)));
        return env.saveOk;
      }
      export async function mutateState(base,updater) {
        const env=globalThis.__woodshedCumulativeApp, state=updater(env.latest || base);
        if(!(await saveState(state)))return {ok:false,error:new Error("storage unavailable")};
        env.latest=state;return {ok:true,state};
      }
      export const replaceState=(base,next)=>mutateState(base,()=>next);
      export const stateRevision=()=>0, stateGeneration=()=>"legacy", subscribeState=()=>()=>{};
      export class StateConflictError extends Error {}
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

const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const found = find(item, predicate); if (found) return found; } }
  if (!node || typeof node !== "object") return null;
  return predicate(node) ? node : find(node.props?.children, predicate);
};
const text = node => Array.isArray(node) ? node.map(text).join("") : node && typeof node === "object" ? text(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const reviewSection = tree => find(tree, node => node.props?.["aria-label"] === "Cumulative review");
const player = tree => find(tree, node => node.props?.exercise);
const button = (tree, name) => find(tree, node => node.type === "button" && text(node) === name);
const reviewCard = (tree, exercise) => find(reviewSection(tree), node => node.type === "li" && text(node).includes(exercise.title));
const picker = tree => find(tree, node => node.type?.name === "UnitPicker");
const today = todayStr(), tenDaysAgo = addDays(today, -10), twentyDaysAgo = addDays(today, -20);
const cSession = sessionsForUnit(UNITS[0].id)[0], gUnit = UNITS[1];
const cExercise = EXERCISES.find(exercise => exercise.id === cSession.blocks[0].exerciseId);
const gExercise = EXERCISES.find(exercise => exercise.id === sessionsForUnit(gUnit.id)[0].blocks[0].exerciseId);
const report = (exercise = cExercise, patch = {}) => ({
  exerciseId: exercise.id, skillIds: exercise.skillIds, section: "guided", minutes: 3,
  assessment: "ready", date: tenDaysAgo, bpm: 58, hands: "R", fromBar: 2, toBar: 3,
  note: "Keep the held note through the bass change.", ...patch,
});

function programHarness(attempts = [], { reject = false, unitId = gUnit.id } = {}) {
  const hooks = { cursor: 0, slots: [] };
  let progress = normalizeProgress({ attempts });
  const changes = [], entries = [];
  return {
    changes, entries,
    progress: () => progress,
    render() {
      globalThis.__woodshedCumulativeHooks = hooks; hooks.cursor = 0;
      return Program({ section: "guided", unitId, progress, onUnitChange: id => changes.push(id), onAttempt: async entry => {
        if (reject) throw new Error("storage unavailable");
        entries.push(entry); progress = recordAttempt(progress, entry);
      } });
    },
  };
}

function appHarness() {
  const data = freshData();
  data.programUnitId = gUnit.id;
  data.programProgress = normalizeProgress({ attempts: [report()] });
  const hooks = { cursor: 0, slots: [data] };
  const env = { writes: [], inferred: [], saveOk: true };
  return {
    env,
    data: () => hooks.slots[0],
    render() {
      globalThis.__woodshedCumulativeHooks = hooks; hooks.cursor = 0;
      globalThis.__woodshedCumulativeApp = env;
      return App();
    },
    onAttempt() {
      const program = find(this.render(), node => typeof node.props?.onAttempt === "function");
      assert.ok(program, "the actual App exposes its course callback");
      return program.props.onAttempt;
    },
  };
}

let failures = 0;
const test = async (name, fn) => { try { await fn(); console.log(`ok   ${name}`); } catch (error) { failures++; console.error(`FAIL ${name}\n     ${error.stack}`); } };

await test("a C-major return appears before new work in G and opens the latest dated passage without changing units", () => {
  const newest = report(), olderAppended = report(cExercise, { date: twentyDaysAgo, bpm: 42, fromBar: 1, toBar: 1 });
  const h = programHarness([newest, olderAppended]);
  const tree = h.render(), card = reviewCard(tree, cExercise);
  assert.ok(card); assert.match(text(card), /C major/);
  assert.ok(text(tree).indexOf("Keep earlier skills alive") < text(tree).indexOf("Up next"));
  assert.equal(picker(tree).props.unitId, gUnit.id);
  button(card, "Start return check").props.onClick();
  const current = player(h.render());
  assert.equal(current.props.exercise.id, cExercise.id);
  assert.equal(current.props.reviewMode, true);
  assert.equal(current.props.defaultMinutes, 3);
  assert.equal(current.props.previousAttempt.date, tenDaysAgo);
  assert.equal(current.props.previousAttempt.bpm, 58);
  assert.deepEqual(current.props.defaultRange, { from: 2, to: 3 });
  assert.deepEqual(h.changes, []);
});

await test("saving cumulative review preserves its initial result, leaves the plan untouched and removes only that item today", async () => {
  const h = programHarness([report(), report(gExercise)]);
  const nextC = nextSession(h.progress(), sessionsForUnit(UNITS[0].id)).id;
  const nextG = nextSession(h.progress(), sessionsForUnit(gUnit.id)).id;
  button(reviewCard(h.render(), cExercise), "Start return check").props.onClick();
  const firstCheck = { assessment: "practising", beforeDemo: true, bpm: 58, hands: "R", fromBar: 2, toBar: 3 };
  await player(h.render()).props.onLog({ assessment: "ready", minutes: 3, reviewCheck: firstCheck });
  const entry = h.entries[0];
  assert.equal(entry.section, "review");
  assert.deepEqual(entry.reviewCheck, firstCheck);
  assert.equal(entry.sessionId, undefined); assert.equal(entry.blockIndex, undefined);
  assert.deepEqual(h.progress().completedBlocks, {});
  assert.ok(SESSIONS.every(session => !sessionProgress(h.progress(), session).started));
  assert.equal(nextSession(h.progress(), sessionsForUnit(UNITS[0].id)).id, nextC);
  assert.equal(nextSession(h.progress(), sessionsForUnit(gUnit.id)).id, nextG);
  const tree = h.render();
  assert.equal(player(tree), null);
  assert.equal(reviewCard(tree, cExercise), null);
  assert.ok(reviewCard(tree, gExercise));
  assert.equal(picker(tree).props.unitId, gUnit.id);
  assert.deepEqual(h.changes, []);
});

await test("a failed cumulative-review save leaves the lesson and due return available", async () => {
  const h = programHarness([report()], { reject: true });
  button(reviewCard(h.render(), cExercise), "Start return check").props.onClick();
  const current = player(h.render());
  await assert.rejects(current.props.onLog({ assessment: "ready", minutes: 3 }), /storage unavailable/);
  assert.equal(player(h.render()).props.exercise.id, cExercise.id);
  assert.equal(h.progress().attempts.length, 1);
  player(h.render()).props.onClose();
  assert.ok(reviewCard(h.render(), cExercise));
  assert.deepEqual(h.changes, []);
});

await test("fresh and not-yet-due histories keep new guided work available without invented return checks", () => {
  const fresh = programHarness();
  assert.equal(reviewSection(fresh.render()), null);
  assert.ok(button(fresh.render(), "Start 20-minute session"));
  const recent = programHarness([report(cExercise, { date: today })]);
  assert.match(text(reviewSection(recent.render())), /No return checks are due today/);
  assert.equal(button(reviewSection(recent.render()), "Start return check"), null);
  assert.ok(button(recent.render(), "Start 20-minute session"));
});

await test("history distinguishes a difficult first return from final readiness and a skipped first check", () => {
  const progress = normalizeProgress({ attempts: [
    report(cExercise, { section: "review", assessment: "ready", date: today, reviewCheck: { assessment: "practising", beforeDemo: true, hands: "L", bpm: 42, fromBar: 1, toBar: 2 } }),
    report(gExercise, { section: "review", assessment: "ready", date: today }),
  ] });
  globalThis.__woodshedCumulativeHooks = { cursor: 0, slots: [] };
  const tree = ProgramProgress({ progress });
  assert.match(text(tree), /First return before playback: needed more work/);
  assert.match(text(tree), /Self-reported, separately from the final practice assessment/);
  assert.match(text(tree), /Self-reported ready/);
  assert.match(text(tree), /First check: LH · 42 bpm · bars 1–2/, "initial scope remains distinct from final repaired practice");
  assert.match(text(tree), /no first-attempt check recorded/);
});

await test("the actual App bypasses completion inference for review but retains direct-practice credit", async () => {
  const h = appHarness();
  assert.deepEqual(contextForExercise(h.data().programProgress, sessionsForUnit(UNITS[0].id), cExercise.id), { sessionId: cSession.id, blockIndex: 0 }, "the exercise really matches the next guided block");
  const firstCheck = { assessment: "practising", beforeDemo: true, bpm: 58, hands: "R", fromBar: 2, toBar: 3 };
  await h.onAttempt()({ ...report(), section: "review", assessment: "ready", date: today, reviewCheck: firstCheck });
  assert.equal(h.env.inferred.length, 0, "App must skip context lookup, not rely on later sanitation");
  assert.equal(h.env.writes.length, 1);
  const saved = h.env.writes[0].programProgress;
  assert.equal(saved.attempts.at(-1).section, "review");
  assert.deepEqual(saved.attempts.at(-1).reviewCheck, firstCheck);
  assert.deepEqual(saved.completedBlocks, {});
  assert.equal(h.data().programUnitId, gUnit.id);
  assert.equal(sessionProgress(h.data().programProgress, cSession).nextBlock, 0);
  await h.onAttempt()({ ...report(), section: "chords", date: today });
  assert.equal(h.env.inferred.length, 1, "ordinary direct practice still calls the real inference function");
  assert.deepEqual(h.data().programProgress.completedBlocks[cSession.id], [0]);
});

await test("the actual App retains durable progress when cumulative-review storage rejects the save", async () => {
  const h = appHarness(), before = JSON.stringify(h.data().programProgress);
  h.env.saveOk = false;
  await assert.rejects(h.onAttempt()({ ...report(), section: "review", date: today }), /could not be saved/);
  assert.equal(JSON.stringify(h.data().programProgress), before);
  assert.equal(h.env.inferred.length, 0);
  assert.equal(h.env.writes.length, 1, "the real handler tried to persist before updating application state");
});

delete globalThis.__woodshedCumulativeHooks;
delete globalThis.__woodshedCumulativeApp;
if (failures) process.exitCode = 1;
else console.log("\nall cumulative-review integration checks green");
