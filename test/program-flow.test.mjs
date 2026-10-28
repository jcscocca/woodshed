import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { normalizeProgress, recordAttempt, sessionProgress } from "../src/program/progress.js";
import { SESSIONS, EXERCISES } from "../src/program/curriculum.js";

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
        if (!(index in h.slots)) h.slots[index] = initial;
        return [h.slots[index], value => { h.slots[index] = typeof value === 'function' ? value(h.slots[index]) : value; }];
      }
      export default { Fragment:'fragment', createElement(type,props,...children) { return { type,props:{...props,children} }; } };
    ` }));
    b.onResolve({ filter: /PracticePlayer\.jsx$/ }, () => ({ path: "player", namespace: "player" }));
    b.onLoad({ filter: /.*/, namespace: "player" }, () => ({ contents: "export default function PracticePlayer() {}" }));
    b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const { default: Program } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
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

delete globalThis.__woodshedProgramHooks;
if (failures) process.exitCode = 1;
else console.log("\nall green");
