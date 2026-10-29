import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Run the real player handlers with its score parser. Replace only rendering,
// physical recording and sound output; first-return evidence stays in the UI.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/program/PracticePlayer.jsx", import.meta.url))],
  bundle: true, write: false, format: "esm", platform: "node",
  plugins: [{ name: "review-player-boundaries", setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "hooks" }));
    b.onLoad({ filter: /.*/, namespace: "hooks" }, () => ({ contents: `
      const current = () => globalThis.__woodshedReviewHooks;
      const same = (a,b) => a && b && a.length === b.length && a.every((v,i) => Object.is(v,b[i]));
      export function useState(initial) {
        const h=current(), i=h.cursor++;
        if (!(i in h.slots)) h.slots[i]=typeof initial==='function'?initial():initial;
        return [h.slots[i],value=>{const next=typeof value==='function'?value(h.slots[i]):value;if(!Object.is(next,h.slots[i])){h.slots[i]=next;h.dirty=true;}}];
      }
      export function useMemo(fn,deps) {
        const h=current(),i=h.cursor++;
        if(!h.slots[i]||!same(deps,h.slots[i].deps))h.slots[i]={deps,value:fn()};
        return h.slots[i].value;
      }
      export const useRef=initial=>useMemo(()=>({current:initial}),[]);
      export const useId=()=>useMemo(()=>'review-test-id',[]);
      export function useEffect(fn,deps) {
        const h=current(),i=h.cursor++,previous=h.slots[i];
        if(!previous||!same(deps,previous.deps))h.effects.push(()=>{previous?.cleanup?.();h.slots[i]={deps,cleanup:fn()};});
      }
      export const useLayoutEffect=useEffect;
      export default {Fragment:'fragment',createElement(type,props,...children){return {type,props:{...props,children}};}};
    ` }));
    b.onResolve({ filter: /PracticeProvider\.jsx$/ }, () => ({ path: "practice", namespace: "boundary" }));
    b.onResolve({ filter: /(?:PracticeRecorder|KnowledgeChecks)\.jsx$/ }, args => ({ path: args.path, namespace: "boundary" }));
    b.onResolve({ filter: /lessonAudio\.js$/ }, () => ({ path: "legacy-audio", namespace: "boundary" }));
    b.onResolve({ filter: /^\.\/playback\.js$/ }, args => args.importer.endsWith("PracticePlayer.jsx") ? ({ path: "playback", namespace: "boundary" }) : null);
    b.onLoad({ filter: /.*/, namespace: "boundary" }, args => ({ contents: {
      practice: "export const usePractice=()=>globalThis.__woodshedReviewEnvironment.practice;",
      "legacy-audio": "export const stop=()=>{};",
      playback: `export {planPlayback} from ${JSON.stringify(fileURLToPath(new URL("../src/program/playback.js", import.meta.url)))};
        export function createLessonPlayback(){const env=globalThis.__woodshedReviewEnvironment;return {async start(plan,callbacks){env.runs.push({plan,callbacks});if(env.playError)throw new Error('Playback unavailable');},stop(){},close(){}};}`,
    }[args.path] || "export default function Child(){}", resolveDir: root }));
    b.onLoad({ filter: /\.css$/ }, () => ({ contents: "", loader: "js" }));
  } }],
});
const { default: Player } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const find = (node, predicate) => {
  if (Array.isArray(node)) { for (const item of node) { const found=find(item,predicate); if(found)return found; } }
  if (!node || typeof node !== "object") return null;
  return predicate(node) ? node : find(node.props?.children,predicate);
};
const text = node => Array.isArray(node) ? node.map(text).join("") : node && typeof node === "object" ? text(node.props?.children) : node == null || typeof node === "boolean" ? "" : String(node);
const button = (tree,label) => find(tree,node=>node.type==="button"&&text(node).includes(label));
const tempo = tree => find(tree,node=>node.type==="input"&&node.props.type==="range").props.value;
const exercise = { id:"return-player-test", title:"Return player test", section:"scales", key:"C major", bpm:60, hands:"both", checks:[],
  abc:"X:1\nM:4/4\nL:1/4\nK:C\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] C4|D4|E4|F4|]\n[V:2] C,4|D,4|E,4|F,4|]" };

async function harness(overrides={}) {
  const descriptors=new Map(["window","requestAnimationFrame","cancelAnimationFrame"].map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  Object.defineProperties(globalThis,{
    window:{configurable:true,value:new EventTarget()},
    requestAnimationFrame:{configurable:true,value:()=>1},
    cancelAnimationFrame:{configurable:true,value:()=>{}},
  });
  const env=globalThis.__woodshedReviewEnvironment={runs:[],saved:[],practice:{setCoursePlaying(){},metro:{stop(){}}}};
  const props={exercise,reviewMode:true,defaultMinutes:3,onLog:async entry=>{env.saved.push(entry);},...overrides};
  const hooks={cursor:0,slots:[],effects:[],dirty:false};
  const h={env,props,tree:null,render(){
    let count=0;
    do {
      assert.ok(++count<25,"player rendering did not settle");
      globalThis.__woodshedReviewHooks=hooks;hooks.cursor=0;hooks.dirty=false;
      h.tree=Player(props);
      for(const effect of hooks.effects.splice(0))effect();
    }while(hooks.dirty);
    return h.tree;
  },async save(){await find(h.tree,node=>node.type==="form").props.onSubmit({preventDefault(){}});h.render();},close(){
    for(const slot of hooks.slots)slot?.cleanup?.();
    for(const [name,descriptor] of descriptors)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
    delete globalThis.__woodshedReviewEnvironment;delete globalThis.__woodshedReviewHooks;
  }};
  h.render();await new Promise(resolve=>setImmediate(resolve));h.render();
  assert.equal(tempo(h.tree),props.reviewMode&&!props.transferMode&&props.previousAttempt?.bpm>0?Math.max(20,Math.min(160,props.previousAttempt.bpm)):60);
  return h;
}

let failures=0;
async function test(name,fn,overrides){
  const h=await harness(overrides);
  try{await fn(h);console.log(`ok   ${name}`);}
  catch(error){failures++;console.error(`FAIL ${name}\n     ${error.stack}`);}
  finally{h.close();}
}

await test("the first return is saved separately from later repaired readiness",async h=>{
  const staleSteady=button(h.tree,"Felt steady");
  button(h.tree,"Needs more work").props.onClick();
  staleSteady.props.onClick();
  h.render();
  assert.equal(button(h.tree,"Felt steady"),null,"the initial report is not replaceable by another try");
  await button(h.tree,"Hear reference").props.onClick();h.render();
  find(h.tree,node=>node.type==="input"&&node.props.value==="ready").props.onChange({target:{value:"ready"}});h.render();
  await h.save();
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"practising",beforeDemo:true,bpm:60,hands:"both",fromBar:1,toBar:4});
  assert.equal(h.env.saved[0].assessment,"ready");
});

await test("a skipped first report saves practice without invented return evidence",async h=>{
  await h.save();
  assert.equal("reviewCheck" in h.env.saved[0],false);
  assert.equal(h.env.saved[0].assessment,"practising");
});

await test("a playback request before the answer records a supported return, even before rendering",async h=>{
  const staleAnswer=button(h.tree,"Felt steady");
  const started=button(h.tree,"Hear slowly").props.onClick();
  staleAnswer.props.onClick();
  await started;h.render();await h.save();
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"ready",beforeDemo:false,bpm:60,hands:"both",fromBar:1,toBar:4});
});

await test("play along and listening questions also mark playback before a first answer",async h=>{
  await button(h.tree,"Play along").props.onClick();h.render();
  h.env.runs.at(-1).callbacks.onEnd();h.render();
  const knowledge=find(h.tree,node=>typeof node.props?.onHear==="function");
  await knowledge.props.onHear({audio:[{midi:60,hand:"R",beat:0,dur:1}],audioBeats:2});h.render();
  h.env.runs.at(-1).callbacks.onEnd();h.render();
  button(h.tree,"Not sure yet").props.onClick();h.render();await h.save();
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"unsure",beforeDemo:false,bpm:60,hands:"both",fromBar:1,toBar:4});
});

await test("listening after a reported first return preserves that initial evidence",async h=>{
  button(h.tree,"Felt steady").props.onClick();h.render();
  const knowledge=find(h.tree,node=>typeof node.props?.onHear==="function");
  await knowledge.props.onHear({audio:[{midi:60,hand:"R",beat:0,dur:1}],audioBeats:2});h.render();
  await h.save();
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"ready",beforeDemo:true,bpm:60,hands:"both",fromBar:1,toBar:4});
});

await test("a failed save retains the first result and can retry without changing it",async h=>{
  button(h.tree,"Felt steady").props.onClick();h.render();
  h.props.onLog=async()=>{throw new Error("storage unavailable");};h.render();
  await h.save();assert.ok(text(h.tree).includes("Your practice could not be saved"));
  assert.equal(h.env.saved.length,0);
  h.props.onLog=async entry=>h.env.saved.push(entry);h.render();await h.save();
  assert.equal(h.env.saved.length,1);
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"ready",beforeDemo:true,bpm:60,hands:"both",fromBar:1,toBar:4});
});

await test("review returns to the last tempo, hand and supplied passage and surfaces the next step",async h=>{
  assert.ok(text(h.tree).includes("Hold the bass through beat four."));
  const hand=find(h.tree,node=>node.type==="button"&&text(node)==="Left hand");
  assert.equal(hand.props["aria-pressed"],true);
  await h.save();
  assert.equal(h.env.saved[0].bpm,84);assert.equal(h.env.saved[0].hands,"L");
  assert.equal(h.env.saved[0].fromBar,2);assert.equal(h.env.saved[0].toBar,3);
},{previousAttempt:{bpm:84,hands:"L",note:"Hold the bass through beat four."},defaultRange:{from:2,to:3}});

await test("review tempo is clamped and unsupported hand settings fall back to the lesson",async h=>{
  await h.save();assert.equal(h.env.saved[0].bpm,160);assert.equal(h.env.saved[0].hands,"both");
},{previousAttempt:{bpm:300,hands:"separate"}});

await test("the first check keeps its original passage, tempo and hands during a later repair",async h=>{
  button(h.tree,"Felt steady").props.onClick();h.render();
  button(h.tree,"Left hand").props.onClick();h.render();
  find(h.tree,node=>node.type==="input"&&node.props.type==="range").props.onChange({target:{value:"48"}});h.render();
  find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="First bar").props.onChange({target:{value:"2"}});h.render();
  find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="Last bar").props.onChange({target:{value:"3"}});h.render();
  await h.save();
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"ready",beforeDemo:true,bpm:60,hands:"both",fromBar:1,toBar:4});
  assert.equal(h.env.saved[0].bpm,48);assert.equal(h.env.saved[0].hands,"L");
  assert.equal(h.env.saved[0].fromBar,2);assert.equal(h.env.saved[0].toBar,3);
});

await test("imported passage bounds and a hand absent from the score are made playable",async h=>{
  button(h.tree,"Felt steady").props.onClick();h.render();await h.save();
  assert.equal(h.env.saved[0].hands,"R");
  assert.equal(h.env.saved[0].fromBar,1);assert.equal(h.env.saved[0].toBar,1);
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"ready",beforeDemo:true,bpm:60,hands:"R",fromBar:1,toBar:1});
},{exercise:{...exercise,hands:"R",abc:"X:1\nM:4/4\nL:1/4\nK:C\nC4|]"},previousAttempt:{bpm:60,hands:"L"},defaultRange:{from:9999,to:-8}});

await test("ordinary lessons retain their defaults and never add first-return evidence",async h=>{
  assert.equal(button(h.tree,"Felt steady"),null);
  await h.save();assert.equal(h.env.saved[0].bpm,60);assert.equal(h.env.saved[0].hands,"both");
  assert.equal("reviewCheck" in h.env.saved[0],false);
},{reviewMode:false,previousAttempt:{bpm:84,hands:"L"}});

const freshProps={transferMode:true,exercise:{...exercise,section:"transfer",transferId:"transfer-v1-pulse-c-0"}};
await test("a fresh example saves transfer evidence separately from original-passage return evidence",async h=>{
  assert.ok(text(h.tree).includes("Try the new example before playback"));
  assert.equal(find(h.tree,node=>typeof node.props?.onHear==="function"),null,"the old lesson's concept answers are not reused for new music");
  button(h.tree,"Needs more work").props.onClick();h.render();
  find(h.tree,node=>node.type==="input"&&node.props.value==="ready").props.onChange({target:{value:"ready"}});h.render();
  await h.save();
  assert.equal(h.env.saved[0].transferId,freshProps.exercise.transferId);
  assert.equal(h.env.saved[0].section,"transfer");
  assert.equal(h.env.saved[0].assessment,"ready");
  assert.deepEqual(h.env.saved[0].transferCheck,{assessment:"practising",beforeDemo:true,bpm:60,hands:"both",fromBar:1,toBar:4});
  assert.equal("reviewCheck" in h.env.saved[0],false);
},freshProps);

await test("a fresh example uses its own setup and can save practice without invented transfer results",async h=>{
  const hand=find(h.tree,node=>node.type==="button"&&text(node)==="Both hands");
  assert.equal(hand.props["aria-pressed"],true);
  await h.save();
  assert.equal(h.env.saved[0].bpm,60);assert.equal(h.env.saved[0].hands,"both");
  assert.equal(h.env.saved[0].transferId,freshProps.exercise.transferId);
  assert.equal("transferCheck" in h.env.saved[0],false);
  assert.equal("reviewCheck" in h.env.saved[0],false);
},{...freshProps,previousAttempt:{bpm:84,hands:"L"}});

if(failures)process.exitCode=1;
else console.log("\nall first-return player checks green");
