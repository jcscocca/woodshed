import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { normalizeProgress, recordAttempt, sessionProgress } from "../src/program/progress.js";
import { SESSIONS, LEGACY_SESSIONS, EXERCISES, PLACEMENT } from "../src/program/curriculum.js";
import { transferForExercise, TRANSFER_VARIANT_COUNT } from "../src/program/transfer.js";
import { knowledgeForExercise, QUESTION_BY_ID } from "../src/program/knowledge.js";
import { todayStr, addDays } from "../src/dateUtils.js";

// Exercise the actual component's click/save handlers. The harness replaces
// React's rendering boundary and the player, rather than copying flow logic.
globalThis.__woodshedProgramHooks = { cursor: 0, slots: [] };
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/program/Program.jsx", import.meta.url))],
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "component-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "harness" }));
    b.onLoad({ filter: /.*/, namespace: "harness" }, () => ({ contents: `
      export function useState(initial) {
        const h = globalThis.__woodshedProgramHooks, index = h.cursor++;
        if (!(index in h.slots)) h.slots[index] = typeof initial === 'function' ? initial() : initial;
        return [h.slots[index], value => { h.slots[index] = typeof value === 'function' ? value(h.slots[index]) : value; }];
      }
      export function useRef(initial) {
        const h = globalThis.__woodshedProgramHooks, index = h.cursor++;
        if (!(index in h.slots)) h.slots[index] = { current: initial };
        return h.slots[index];
      }
      export function useEffect() {}
      export default { Fragment:'fragment', createElement(type,props,...children) { return { type,props:{...props,children} }; } };
    ` }));
    b.onResolve({ filter: /(?:PracticePlayer|ConceptReview)\.jsx$/ }, () => ({ path: "player", namespace: "player" }));
    b.onLoad({ filter: /.*/, namespace: "player" }, () => ({ contents: "export default function PracticePlayer() {}" }));
    b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const { default: Program, ProgramProgress } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const found = find(item, predicate); if (found) return found; } }
  if (!node || typeof node !== "object") return null;
  return predicate(node) ? node : find(node.props?.children, predicate);
};
const text = node => Array.isArray(node) ? node.map(text).join("") : node && typeof node === "object" ? text(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const session = SESSIONS[0];
function harness(completed = [], reject = false) {
  globalThis.__woodshedProgramHooks = { cursor: 0, slots: [] };
  let progress = normalizeProgress({ completedBlocks: { [session.id]: completed } });
  const render = () => {
    globalThis.__woodshedProgramHooks.cursor = 0;
    return Program({ section: "guided", unitId: session.unitId, progress, onAttempt: async entry => {
      if (reject) throw new Error("storage unavailable");
      progress = recordAttempt(progress, entry);
    } });
  };
  return { render, progress: () => progress };
}
function versionHarness(target, initial, beforeSave) {
  globalThis.__woodshedProgramHooks = { cursor: 0, slots: [] };
  let progress = normalizeProgress(initial);
  return {
    progress: () => progress,
    render() {
      globalThis.__woodshedProgramHooks.cursor = 0;
      return Program({ section: "guided", unitId: target.unitId, progress, onAttempt: async entry => { await beforeSave?.(entry); progress = recordAttempt(progress, entry); return progress; } });
    },
  };
}
function progressText(progress) {
  const hooks = globalThis.__woodshedProgramHooks;
  globalThis.__woodshedProgramHooks = { cursor: 0, slots: [] };
  try { return text(ProgramProgress({ progress })); }
  finally { globalThis.__woodshedProgramHooks = hooks; }
}
async function withDraftStorage(draftKey, abc, fn) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const values = new Map([[`woodshed:lesson-draft:v1:${draftKey}`, JSON.stringify({ abc, draft: { note: "Keep my unfinished first check", minutes: 3, reviewCheck: { assessment: "unsure", beforeDemo: true } } })]]);
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: {
    get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key),
  } });
  try { await fn(); }
  finally { if (descriptor) Object.defineProperty(globalThis, "sessionStorage", descriptor); else delete globalThis.sessionStorage; }
}
const button = (tree, name) => find(tree, node => node.type === "button" && text(node) === name);
const player = tree => find(tree, node => node.props?.exercise);
const save = current => current.props.onLog({ assessment: "practising", minutes: 3 });
let failures = 0;
const test = async (name, fn) => { try { await fn(); console.log(`ok   ${name}`); } catch (error) { failures++; console.error(`FAIL ${name}\n     ${error.stack}`); } };

await test("a whole completed-session revisit visits every block once before returning home", async () => {
  const h = harness(session.blocks.map((_, index) => index));
  button(h.render(), "Revisit session").props.onClick();
  for (let index = 0; index < session.blocks.length; index++) {
    const current = player(h.render());
    assert.equal(current.props.exercise.id, session.blocks[index].exerciseId);
    await save(current);
  }
  assert.equal(player(h.render()), null);
  assert.equal(h.progress().attempts.length, session.blocks.length);
  assert.equal(sessionProgress(h.progress(), session).completed, session.blocks.length);
});

await test("ordinary partial resume skips completed blocks and finishes the remaining plan", async () => {
  const h = harness([0, 2]);
  button(h.render(), "Resume · 2/4 blocks").props.onClick();
  assert.equal(player(h.render()).props.exercise.id, session.blocks[1].exerciseId);
  await save(player(h.render()));
  assert.equal(player(h.render()).props.exercise.id, session.blocks[3].exerciseId);
  await save(player(h.render()));
  assert.equal(player(h.render()), null);
  assert.equal(h.progress().attempts.length, 2);
});

await test("session completion reveals and focuses its saved notice instead of retaining lesson scroll", async () => {
  const h = harness([0, 1, 2]);
  button(h.render(), "Resume · 3/4 blocks").props.onClick();
  await save(player(h.render()));
  const notice = find(h.render(), node => node.props?.role === "status");
  assert.match(text(notice), /Session A saved/);
  assert.equal(notice.props.tabIndex, -1);
  const actions = [];
  notice.props.ref({ focus: options => actions.push(["focus", options]), scrollIntoView: options => actions.push(["scroll", options]) });
  assert.deepEqual(actions, [["focus", { preventScroll: true }], ["scroll", { block: "start" }]]);
  assert.equal(find(h.render(), node => node.props?.role === "status").props.ref, notice.props.ref, "ordinary rerenders keep the same ref and do not repeat the focus transition");
  button(h.render(), "Continue to Day 1 · Session B").props.onClick();
  assert.equal(player(h.render()).props.exercise.id, SESSIONS.find((candidate) => candidate.unitId === session.unitId && candidate.day === 1 && candidate.slot === "B").blocks[0].exerciseId);
});

await test("placement completion reveals its saved guidance while between-block notices leave focus to the player", async () => {
  const h = harness();
  button(h.render(), "Start placement · 5–10 min").props.onClick();
  for (let index = 0; index < PLACEMENT.length; index++) await save(player(h.render()));
  const notice = find(h.render(), node => node.props?.role === "status");
  assert.match(text(notice), /Placement saved/);
  assert.equal(notice.props.tabIndex, -1);
  assert.equal(typeof notice.props.ref, "function");

  const continuing = harness();
  button(continuing.render(), "Start 20-minute session").props.onClick();
  await save(player(continuing.render()));
  assert.ok(player(continuing.render()), "the next block remains open");
  const betweenBlocks = find(continuing.render(), node => node.props?.role === "status");
  assert.equal(betweenBlocks.props.ref, undefined, "the new lesson owns its own focus");
});

await test("opening a completed block individually does not start a whole-session revisit", async () => {
  const h = harness(session.blocks.map((_, index) => index));
  const title = EXERCISES.find(exercise => exercise.id === session.blocks[0].exerciseId).title;
  const actual = find(h.render(), node => node.type === "button" && text(node).includes(title) && text(node).endsWith(`${session.blocks[0].minutes}m`));
  assert.ok(actual);
  actual.props.onClick();
  assert.equal(player(h.render()).props.exercise.id, session.blocks[0].exerciseId);
  await save(player(h.render()));
  assert.equal(player(h.render()), null);
  assert.equal(h.progress().attempts.length, 1);
});

await test("a failed review save does not advance or consume a review block", async () => {
  const h = harness(session.blocks.map((_, index) => index), true);
  button(h.render(), "Revisit session").props.onClick();
  await assert.rejects(save(player(h.render())), /storage unavailable/);
  assert.equal(player(h.render()).props.exercise.id, session.blocks[0].exerciseId);
  assert.equal(h.progress().attempts.length, 0);
});

await test("an unfinished earlier plan resumes its actual old block without crediting the revision", async () => {
  const revised = SESSIONS.find((candidate) => candidate.legacySessionId);
  assert.ok(revised, "at least one music-specific visit is revised");
  const earlier = LEGACY_SESSIONS.find((candidate) => candidate.id === revised.legacySessionId);
  const h = versionHarness(earlier, { completedBlocks: { [earlier.id]: [0] } });
  assert.match(text(h.render()), /earlier practice is kept on its original lesson plan/);
  button(h.render(), `Resume · 1/${earlier.blocks.length} blocks`).props.onClick();
  assert.equal(player(h.render()).props.exercise.id, earlier.blocks[1].exerciseId);
  await save(player(h.render()));
  assert.equal(h.progress().attempts.at(-1).sessionId, earlier.id);
  assert.equal(sessionProgress(h.progress(), revised).started, false);
});

await test("previewing an updated visit leaves earlier completion intact and saves only explicit new context", async () => {
  const revised = SESSIONS.find((candidate) => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find((candidate) => candidate.id === revised.legacySessionId);
  const oldMarks = earlier.blocks.map((_, index) => index);
  const h = versionHarness(earlier, { completedBlocks: { [earlier.id]: oldMarks } });
  button(h.render(), `Open updated Day ${revised.day} · Session ${revised.slot}`).props.onClick();
  assert.equal(player(h.render()).props.exercise.id, revised.blocks[0].exerciseId);
  await save(player(h.render()));
  assert.equal(h.progress().attempts.at(-1).sessionId, revised.id);
  assert.deepEqual(h.progress().completedBlocks[earlier.id], oldMarks);
  assert.equal(sessionProgress(h.progress(), earlier).done, true);
  assert.equal(sessionProgress(h.progress(), revised).completed, 1);
});

await test("a completed explicit revision counts once while its earlier partial plan remains resumable", async () => {
  const revised = SESSIONS.find(candidate => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find(candidate => candidate.id === revised.legacySessionId);
  const newMarks = revised.blocks.map((_, index) => index);
  const h = versionHarness(earlier, { completedBlocks: { [earlier.id]: [0], [revised.id]: newMarks } });
  assert.match(progressText(h.progress()), /1\/80/);
  assert.match(text(h.render()), /updated Day .* is complete and counts once/);
  button(h.render(), `Resume earlier Day ${earlier.day} · Session ${earlier.slot}`).props.onClick();
  assert.equal(player(h.render()).props.exercise.id, earlier.blocks[1].exerciseId);
  assert.equal(player(h.render()).props.defaultMinutes, earlier.blocks[1].minutes);
  assert.match(text(h.render()), /earlier lesson plan is retained/);
  await save(player(h.render()));
  assert.equal(h.progress().attempts.at(-1).sessionId, earlier.id);
  assert.deepEqual(h.progress().completedBlocks[revised.id], newMarks);
  assert.match(progressText(h.progress()), /1\/80/);
});

await test("a completed revision keeps an unfinished earlier draft reachable at its exact block", async () => {
  const revised = SESSIONS.find(candidate => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find(candidate => candidate.id === revised.legacySessionId);
  const index = 1, exercise = EXERCISES.find(candidate => candidate.id === earlier.blocks[index].exerciseId);
  const draftKey = `${exercise.id}:lesson:${earlier.id}:${index}`;
  await withDraftStorage(draftKey, exercise.abc, async () => {
    const h = versionHarness(earlier, { completedBlocks: { [revised.id]: revised.blocks.map((_, i) => i) } });
    assert.match(progressText(h.progress()), /1\/80/);
    button(h.render(), `Resume earlier Day ${earlier.day} · Session ${earlier.slot}`).props.onClick();
    assert.equal(player(h.render()).props.exercise.id, exercise.id);
    assert.equal(player(h.render()).props.draftKey, draftKey);
    assert.equal(player(h.render()).props.defaultMinutes, earlier.blocks[index].minutes);
    assert.equal(sessionProgress(h.progress(), earlier).completed, 0);
  });
});

await test("old completion survives an incomplete preview and separate partial plans never combine", async () => {
  const revised = SESSIONS.find(candidate => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find(candidate => candidate.id === revised.legacySessionId);
  const complete = versionHarness(earlier, { completedBlocks: { [earlier.id]: earlier.blocks.map((_, index) => index), [revised.id]: [0] } });
  assert.match(progressText(complete.progress()), /1\/80/);
  assert.equal(button(complete.render(), `Resume earlier Day ${earlier.day} · Session ${earlier.slot}`), null);
  const partial = versionHarness(earlier, { completedBlocks: { [earlier.id]: [0], [revised.id]: revised.blocks.map((_, i) => i).slice(1) } });
  assert.match(progressText(partial.progress()), /0\/80/);
  assert.ok(button(partial.render(), `Resume · 1/${earlier.blocks.length} blocks`));
});

await test("an unfinished integrated return resumes its actual draft after the due queue becomes empty", async () => {
  const revised = SESSIONS.find(candidate => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find(candidate => candidate.id === revised.legacySessionId);
  const exercise = EXERCISES.find(candidate => candidate.id === "rhythm-long-short");
  const draftKey = `${exercise.id}:review:${earlier.id}:`;
  await withDraftStorage(draftKey, exercise.abc, async () => {
    const h = versionHarness(earlier, {});
    button(h.render(), `Resume · 0/${earlier.blocks.length} blocks`).props.onClick();
    const current = player(h.render());
    assert.equal(current.props.exercise.id, exercise.id);
    assert.equal(current.props.reviewMode, true);
    assert.equal(current.props.draftKey, draftKey);
    assert.equal(current.props.defaultMinutes, 3);
    await save(current);
    assert.equal(h.progress().attempts.at(-1).section, "review");
    assert.equal(h.progress().attempts.at(-1).reviewForSession, earlier.id);
    assert.equal(player(h.render()).props.exercise.id, earlier.blocks[0].exerciseId);
    assert.equal(sessionProgress(h.progress(), earlier).completed, 0);
  });
});

await test("skipping an unfinished return keeps all twenty core minutes without discarding its draft", async () => {
  const revised = SESSIONS.find(candidate => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find(candidate => candidate.id === revised.legacySessionId);
  const exercise = EXERCISES.find(candidate => candidate.id === "rhythm-long-short");
  const draftKey = `${exercise.id}:review:${earlier.id}:`;
  const previous = SESSIONS.slice(0, SESSIONS.indexOf(revised)).filter(candidate => candidate.unitId === earlier.unitId);
  await withDraftStorage(draftKey, exercise.abc, async () => {
    const h = versionHarness(earlier, { completedBlocks: Object.fromEntries(previous.map(candidate => [candidate.id, candidate.blocks.map((_, i) => i)])) });
    button(h.render(), "Start without review").props.onClick();
    assert.equal(player(h.render()).props.exercise.id, earlier.blocks[0].exerciseId);
    assert.equal(player(h.render()).props.defaultMinutes, earlier.blocks[0].minutes);
    assert.equal(player(h.render()).props.reviewMode, false);
    assert.ok(sessionStorage.getItem(`woodshed:lesson-draft:v1:${draftKey}`), "skipping leaves the unfinished return stored");
    await save(player(h.render()));
    assert.equal(player(h.render()).props.defaultMinutes, earlier.blocks[1].minutes);
    assert.equal(h.progress().attempts.at(-1).reviewForSession, undefined);
  });
});

await test("an unfinished fresh check restores its exact generated variant and draft key", async () => {
  const revised = SESSIONS.find(candidate => candidate.legacySessionId);
  const earlier = LEGACY_SESSIONS.find(candidate => candidate.id === revised.legacySessionId);
  const exercise = EXERCISES.find(candidate => candidate.id === "rhythm-long-short");
  const transfer = transferForExercise(exercise, TRANSFER_VARIANT_COUNT - 1);
  assert.ok(transfer, "the source supports a later generated variant");
  const draftKey = `${exercise.id}:${transfer.transferId}:${earlier.id}:`;
  await withDraftStorage(draftKey, transfer.abc, async () => {
    const h = versionHarness(earlier, {});
    button(h.render(), `Resume · 0/${earlier.blocks.length} blocks`).props.onClick();
    const current = player(h.render());
    assert.equal(current.props.exercise.transferId, transfer.transferId);
    assert.equal(current.props.exercise.abc, transfer.abc);
    assert.equal(current.props.transferMode, true);
    assert.equal(current.props.draftKey, draftKey);
    await save(current);
    assert.equal(h.progress().attempts.at(-1).section, "transfer");
    assert.equal(h.progress().attempts.at(-1).transferId, transfer.transferId);
    assert.equal(h.progress().attempts.at(-1).reviewForSession, earlier.id);
  });
});

await test("current and unchanged plans resume an exact later-block draft without saved completion", async () => {
  for (const target of [SESSIONS.find(s => s.legacySessionId), SESSIONS[0]]) {
    const index = 2, exercise = EXERCISES.find(e => e.id === target.blocks[index].exerciseId);
    const draftKey = `${exercise.id}:lesson:${target.id}:${index}`;
    await withDraftStorage(draftKey, exercise.abc, async () => {
      const h = versionHarness(target, {});
      button(h.render(), `Resume · 0/${target.blocks.length} blocks`).props.onClick();
      assert.equal(player(h.render()).props.exercise.id, exercise.id);
      assert.equal(player(h.render()).props.draftKey, draftKey);
      assert.equal(player(h.render()).props.defaultMinutes, target.blocks[index].minutes);
      assert.deepEqual(h.progress().completedBlocks, {});
    });
  }
});

await test("a consolidation visit resumes after navigation and saves only its actual return checks", async () => {
  const exercises = [...new Map(EXERCISES.filter(e => e.section !== "placement" && e.abc).map(e => [e.unitId, e])).values()].slice(0, 9);
  const initial = { attempts: exercises.map(e => ({ exerciseId: e.id, section: "guided", date: addDays(todayStr(), -20), minutes: 3, assessment: "ready", hands: e.hands, bpm: 40, fromBar: 1, toBar: 1 })) };
  const h = versionHarness(SESSIONS[0], initial);
  assert.match(text(h.render()), /9 skill checks due/);
  button(h.render(), "Start 20-minute consolidation visit").props.onClick();
  const firstKey = player(h.render()).props.draftKey;
  await assert.rejects(player(h.render()).props.onLog({ assessment: "invalid", minutes: 4 }));
  assert.equal(player(h.render()).props.draftKey, firstKey);
  player(h.render()).props.onClose();
  button(h.render(), "Resume consolidation visit").props.onClick();
  assert.equal(player(h.render()).props.draftKey, firstKey);
  for (let index = 0; index < 5; index++) {
    const current = player(h.render());
    assert.equal(current.props.reviewMode, true);
    assert.equal(current.props.defaultMinutes, 4);
    assert.match(current.props.draftKey, /:review-visit:/);
    await current.props.onLog({ assessment: "ready", minutes: 4, reviewCheck: { assessment: "ready", beforeDemo: true, hands: current.props.exercise.hands, bpm: 40, fromBar: 1, toBar: 1 } });
  }
  assert.equal(player(h.render()), null);
  assert.match(text(h.render()), /Consolidation visit saved/);
  const returns = h.progress().attempts.filter(a => a.reviewVisitId);
  assert.equal(returns.length, 5);
  assert.equal(new Set(returns.map(a => a.reviewVisitId)).size, 1);
  assert.deepEqual(returns.map(a => a.reviewVisitIndex), [0, 1, 2, 3, 4]);
  assert.equal(returns.reduce((sum, a) => sum + a.minutes, 0), 20);
  assert.ok(returns.every(a => a.section === "review" && !a.sessionId && !a.reviewForSession));
  assert.deepEqual(h.progress().completedBlocks, {});
  assert.equal(button(h.render(), "Start 20-minute consolidation visit"), null, "a second new consolidation is not recommended on the same day");
  assert.match(text(h.render()), /already made room for consolidation today/);
  assert.match(button(h.render(), "Start 20-minute session").props.className, /primary/, "the ordinary lesson remains the primary next action");
});

await test("concept repair saves separately without changing piano readiness, minutes or block completion", async () => {
  const question = QUESTION_BY_ID["g-signature"], exercise = EXERCISES.find(e => knowledgeForExercise(e).some(q => q.id === question.id));
  const wrong = (question.answer + 1) % question.options.length;
  const h = versionHarness({ unitId: exercise.unitId }, { attempts: [{ exerciseId: exercise.id, section: "guided", date: addDays(todayStr(), -20), minutes: 3, assessment: "ready", knowledgeResults: [{ questionId: question.id, choice: wrong }] }] });
  button(h.render(), "Revisit this idea").props.onClick();
  const concept = player(h.render());
  assert.equal(concept.props.question.id, question.id);
  await concept.props.onLog({ exerciseId: exercise.id, section: "knowledge", minutes: 0, assessment: "unsure", knowledgeResults: [{ questionId: question.id, choice: question.answer }] });
  assert.equal(h.progress().attempts.at(-1).section, "knowledge");
  assert.equal(h.progress().attempts.at(-1).minutes, 0);
  assert.deepEqual(h.progress().completedBlocks, {});
  assert.equal(button(h.render(), "Revisit this idea"), null, "the corrected idea returns on a later day");
  assert.match(progressText(h.progress()), /Understanding check:/);
  assert.doesNotMatch(progressText(h.progress()), /0 min/);
});

await test("a delayed durable save cannot replace a newer lesson opened while it was pending", async () => {
  let release;
  const waiting = new Promise(resolve => { release = resolve; });
  const h = versionHarness(SESSIONS[0], {}, () => waiting);
  button(h.render(), "Start 20-minute session").props.onClick();
  const original = player(h.render()), saving = save(original);
  original.props.onClose();
  const nextExercise = EXERCISES.find(e => e.id === SESSIONS[0].blocks[3].exerciseId);
  const direct = find(h.render(), node => node.type === "button" && text(node).startsWith(nextExercise.title) && text(node).endsWith(`${SESSIONS[0].blocks[3].minutes}m`));
  direct.props.onClick();
  assert.equal(player(h.render()).props.exercise.id, nextExercise.id);
  release(); await saving;
  assert.equal(player(h.render()).props.exercise.id, nextExercise.id);
  assert.equal(h.progress().attempts.length, 1, "navigation does not discard the successful durable report");
});

delete globalThis.__woodshedProgramHooks;
if (failures) process.exitCode = 1;
else console.log("\nall green");
