import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { freshData } from "../src/engine.js";

// Run the actual App, Program and recorder under a small React boundary. The
// host renderer keeps hooks/effects by component type, key and tree position,
// so changing an ancestor genuinely unmounts the recorder and releases its take.
// Audio devices and score drawing are the physical boundaries replaced here.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: { contents: `export { default as App } from './src/App.jsx'; export { default as ScalePath } from './src/program/ScalePath.jsx';`, resolveDir: root },
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "responsive-state-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "boundary" }));
    b.onResolve({ filter: /useIsDesktop\.js$/ }, () => ({ path: "desktop", namespace: "boundary" }));
    b.onResolve({ filter: /useShortcuts\.js$/ }, () => ({ path: "shortcuts", namespace: "boundary" }));
    b.onResolve({ filter: /(?:PracticePlayer|ConceptReview)\.jsx$/ }, () => ({ path: "player", namespace: "boundary" }));
    b.onResolve({ filter: /\.jsx$/ }, (args) => args.importer.endsWith("App.jsx") && !args.path.endsWith("Program.jsx")
      ? { path: args.path, namespace: "boundary" } : null);
    b.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => ({ resolveDir: root, loader: "jsx", contents: path === "react" ? `
      const frame = () => globalThis.__responsiveRenderer.current;
      const equal = (a,b) => a && b && a.length === b.length && a.every((v,i) => Object.is(v,b[i]));
      export function useState(initial) {
        const f=frame(), i=f.cursor++;
        if (!(i in f.hooks)) f.hooks[i]={value:f.type===globalThis.__responsiveApp && i===0 ? globalThis.__responsiveData : typeof initial==='function' ? initial() : initial};
        return [f.hooks[i].value, value => {
          const next=typeof value==='function' ? value(f.hooks[i].value) : value;
          if (!Object.is(next,f.hooks[i].value)) { f.hooks[i].value=next; globalThis.__responsiveRenderer.dirty=true; }
        }];
      }
      export function useRef(value) { const f=frame(),i=f.cursor++; if (!(i in f.hooks))f.hooks[i]={current:value}; return f.hooks[i]; }
      export function useId() { const f=frame(),i=f.cursor++; return f.id+':'+i; }
      export function useEffect(effect,deps) {
        const f=frame(),i=f.cursor++,previous=f.hooks[i];
        // App persistence and browser listeners are outside this layout probe.
        if (f.type===globalThis.__responsiveApp) return;
        if (!previous || !equal(previous.deps,deps)) globalThis.__responsiveRenderer.effects.push(() => {
          previous?.cleanup?.(); f.hooks[i]={deps,cleanup:effect()};
        });
      }
      export default {Fragment:'fragment',createElement(type,props,...children) { return {type,props:{...props,children}}; }};
    ` : path === "desktop" ? "export const useIsDesktop=()=>globalThis.__responsiveDesktop;"
      : path === "player" ? `import React from 'react'; import Recorder from './src/program/PracticeRecorder.jsx';
          export default function Player({exercise}) { return <section data-active-exercise={exercise.id}><Recorder fileName={exercise.id}/></section>; }`
        : `export default function Boundary({children}) { return children || null; }
          export function LessonBody() { return null; }
          export function PracticeProvider({children}) { return children; }
          export function MidiProvider({children}) { return children; }
          export function PracticeSheet() { return null; }
          export function ListenSheet() { return null; }
          export function ShortcutBridge() { return null; }
          export const VIEWS=[];` }));
    b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const { App, ScalePath } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const text = (node) => Array.isArray(node) ? node.map(text).join("") : node && typeof node === "object" ? text(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const all = (node, predicate) => Array.isArray(node) ? node.flatMap((item) => all(item, predicate))
  : !node || typeof node !== "object" ? [] : [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];

test("the scale selector's accessible name contains its visible label", () => {
  const tree=ScalePath({ progress: {}, stageId: "major:1", keyFilter: "C major", preferredKey: "C major", reviews: [] });
  const label=all(tree,node=>node.type === "label" && node.props.children[0] === "Pattern and range")[0];
  assert.ok(label,"the spoken control name is tested against its visible label");
  const select=all(label,node=>node.type === "select")[0];
  assert.equal(select.props["aria-label"],label.props.children[0]);
});

function renderer(Component) {
  const frames = new Map(), types = new Map();
  const env = { current: null, dirty: true, effects: [], tree: null };
  let seen;
  const visit = (node, path) => {
    if (Array.isArray(node)) return node.map((child,index) => visit(child, `${path}/${index}`));
    if (!node || typeof node !== "object") return node;
    if (typeof node.type === "function") {
      if (!types.has(node.type)) types.set(node.type, types.size);
      const id = `${path}:${types.get(node.type)}:${node.props?.key || ""}`;
      if (!frames.has(id)) frames.set(id, { id, type: node.type, cursor: 0, hooks: [] });
      const frame = frames.get(id); seen.add(id); frame.cursor = 0;
      env.current = frame;
      const result = node.type(node.props || {});
      return visit(result, `${id}/render`);
    }
    return { ...node, props: { ...node.props, children: visit(node.props?.children, `${path}/${String(node.type)}`) } };
  };
  env.flush = () => {
    let passes = 0;
    do {
      assert.ok(++passes < 10, "component updates settle");
      env.dirty = false; env.effects = []; seen = new Set(); globalThis.__responsiveRenderer = env;
      env.tree = visit({ type: Component, props: {} }, "root");
      for (const [id,frame] of frames) if (!seen.has(id)) {
        for (const hook of frame.hooks) hook?.cleanup?.();
        frames.delete(id);
      }
      for (const effect of env.effects) effect();
    } while (env.dirty);
    return env.tree;
  };
  env.close = () => { for (const frame of frames.values()) for (const hook of frame.hooks) hook?.cleanup?.(); frames.clear(); };
  return env;
}

test("a lesson and its active recording/local take survive both responsive transitions", async () => {
  const descriptors = new Map(["navigator", "MediaRecorder", "URL", "localStorage", "sessionStorage"].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis,name)]));
  const revoked = [], recorders = [], tracks = [{ stops: 0, stop() { this.stops++; } }];
  class Recorder {
    static isTypeSupported() { return true; }
    constructor() { this.state="inactive"; this.mimeType="audio/webm"; recorders.push(this); }
    start() { this.state="recording"; }
    stop() { this.state="inactive"; queueMicrotask(() => { this.ondataavailable?.({data:new Blob(["piano take"],{type:this.mimeType})}); this.onstop?.(); }); }
  }
  const values = new Map(), storage = { get length() { return values.size; }, key: (i) => [...values.keys()][i] ?? null, getItem: (key) => values.get(key) ?? null, setItem: (key,value) => values.set(key,String(value)), removeItem: (key) => values.delete(key) };
  for (const [name,value] of Object.entries({ navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => tracks }) } }, MediaRecorder: Recorder,
    URL: { createObjectURL: () => "blob:responsive-take", revokeObjectURL: (url) => revoked.push(url) }, localStorage: storage, sessionStorage: storage })) {
    Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  }
  globalThis.__responsiveApp=App; globalThis.__responsiveData=freshData(); globalThis.__responsiveDesktop=true;
  const ui = renderer(App), find = (predicate) => all(ui.tree,predicate)[0];
  const button = (name) => find((node) => node.type === "button" && text(node) === name);
  const settle = async () => { for (let i=0;i<4;i++) await Promise.resolve(); ui.flush(); };
  try {
    ui.flush(); button("Start 20-minute session").props.onClick(); ui.flush();
    const exercise = find((node) => node.props?.["data-active-exercise"]).props["data-active-exercise"];
    assert.equal(exercise,"rhythm-long-short");
    button("● Record an attempt").props.onClick(); await settle();
    assert.equal(recorders[0].state,"recording");
    globalThis.__responsiveDesktop=false; ui.flush();
    assert.equal(find((node) => node.props?.["data-active-exercise"]).props["data-active-exercise"],exercise);
    assert.equal(recorders.length,1); assert.equal(recorders[0].state,"recording"); assert.equal(tracks[0].stops,0);
    button("■ Stop recording").props.onClick(); await settle();
    assert.equal(find((node) => node.type === "audio").props.src,"blob:responsive-take");
    globalThis.__responsiveDesktop=true; ui.flush();
    assert.equal(find((node) => node.props?.["data-active-exercise"]).props["data-active-exercise"],exercise);
    assert.equal(find((node) => node.type === "audio").props.src,"blob:responsive-take");
    assert.equal(recorders.length,1); assert.deepEqual(revoked,[]);
  } finally {
    ui.close();
    for (const [name,descriptor] of descriptors) if (descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
    for (const name of ["__responsiveRenderer","__responsiveApp","__responsiveData","__responsiveDesktop"]) delete globalThis[name];
  }
  assert.deepEqual(revoked,["blob:responsive-take"],"the take is released on actual unmount, not on a layout change");
});
