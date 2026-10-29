import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { playbackPosition } from "../src/program/playback.js";

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

let nextHarness = 0;
async function harness(overrides={}) {
  const { expectedBpm, reducedMotion = false, ...playerOverrides } = overrides;
  const descriptors=new Map(["window","requestAnimationFrame","cancelAnimationFrame"].map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  Object.defineProperties(globalThis,{
    window:{configurable:true,value:Object.assign(new EventTarget(),{matchMedia:query=>({matches:query==="(prefers-reduced-motion: reduce)"&&reducedMotion})})},
    requestAnimationFrame:{configurable:true,value:()=>1},
    cancelAnimationFrame:{configurable:true,value:()=>{}},
  });
  const env=globalThis.__woodshedReviewEnvironment={runs:[],saved:[],practice:{activeLesson:null,setCoursePlaying(){},metro:{stop(){}}}};
  env.practice.setActiveLesson=value=>{env.practice.activeLesson=typeof value==="function"?value(env.practice.activeLesson):value;};
  const props={exercise,reviewMode:true,defaultMinutes:3,draftKey:`review-player-harness-${++nextHarness}`,onLog:async entry=>{env.saved.push(entry);},...playerOverrides};
  const hooks={cursor:0,slots:[],effects:[],dirty:false};
  const unmount=()=>{for(const slot of hooks.slots)slot?.cleanup?.();};
  const h={env,props,tree:null,unmount,render(){
    let count=0;
    do {
      assert.ok(++count<25,"player rendering did not settle");
      globalThis.__woodshedReviewHooks=hooks;hooks.cursor=0;hooks.dirty=false;
      h.tree=Player(props);
      for(const effect of hooks.effects.splice(0))effect();
    }while(hooks.dirty);
    return h.tree;
  },async save(){await find(h.tree,node=>node.type==="form").props.onSubmit({preventDefault(){}});h.render();},async reopen(overrides={}){
    unmount();
    hooks.slots=[];hooks.effects=[];hooks.dirty=false;
    const { expectedBpm, ...nextProps } = overrides;
    Object.assign(props,nextProps);
    h.render();await new Promise(resolve=>setImmediate(resolve));h.render();
    if(expectedBpm!==undefined)assert.equal(tempo(h.tree),expectedBpm,"the reopened player exposes its restored or default tempo");
    return h;
  },close(){
    unmount();
    for(const [name,descriptor] of descriptors)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
    delete globalThis.__woodshedReviewEnvironment;delete globalThis.__woodshedReviewHooks;
  }};
  h.render();await new Promise(resolve=>setImmediate(resolve));h.render();
  assert.equal(tempo(h.tree),expectedBpm??(props.reviewMode&&!props.transferMode&&props.previousAttempt?.bpm>0?Math.max(20,Math.min(160,props.previousAttempt.bpm)):60));
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
  find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="From bar").props.onChange({target:{value:"2"}});h.render();
  find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="Through bar").props.onChange({target:{value:"3"}});h.render();
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

await test("unfinished notes, minutes, passage, tempo, hands and self-assessment restore after leaving a lesson",async h=>{
  find(h.tree,node=>node.type==="textarea").props.onChange({target:{value:"Keep the bass held through beat four."}});
  find(h.tree,node=>node.type==="input"&&node.props.type==="number").props.onChange({target:{value:"7"}});
  find(h.tree,node=>node.type==="input"&&node.props.type==="range").props.onChange({target:{value:"72"}});h.render();
  button(h.tree,"Left hand").props.onClick();h.render();
  find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="From bar").props.onChange({target:{value:"2"}});h.render();
  find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="Through bar").props.onChange({target:{value:"3"}});
  find(h.tree,node=>node.type==="input"&&node.props.type==="radio"&&node.props.value==="unsure").props.onChange();
  const checkLabel=find(h.tree,node=>node.type==="label"&&text(node)==="Bass stayed held");
  find(checkLabel,node=>node.type==="input").props.onChange({target:{checked:true}});h.render();
  await h.reopen({expectedBpm:72});
  assert.match(text(h.tree),/Unfinished practice restored/);
  assert.equal(find(h.tree,node=>node.type==="textarea").props.value,"Keep the bass held through beat four.");
  assert.equal(find(h.tree,node=>node.type==="input"&&node.props.type==="number").props.value,"7");
  assert.equal(find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="From bar").props.value,2);
  assert.equal(find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="Through bar").props.value,3);
  assert.equal(button(h.tree,"Left hand").props["aria-pressed"],true);
  assert.equal(find(h.tree,node=>node.type==="input"&&node.props.type==="radio"&&node.props.value==="unsure").props.checked,true);
  assert.equal(find(find(h.tree,node=>node.type==="label"&&text(node)==="Bass stayed held"),node=>node.type==="input").props.checked,true);
  await h.save();
  assert.deepEqual(h.env.saved[0].checks,["Bass stayed held"]);
  assert.equal(h.env.saved[0].minutes,7);
  assert.equal(h.env.saved[0].assessment,"unsure");
},{exercise:{...exercise,checks:["Bass stayed held"]}});

await test("failed saves retain unfinished work across reopening and successful saves clear the draft",async h=>{
  find(h.tree,node=>node.type==="textarea").props.onChange({target:{value:"Retry this note after storage returns."}});h.render();
  h.props.onLog=async()=>{throw new Error("storage unavailable");};h.render();
  await h.save();assert.match(text(h.tree),/Your practice could not be saved/);
  await h.reopen({expectedBpm:60});
  assert.equal(find(h.tree,node=>node.type==="textarea").props.value,"Retry this note after storage returns.");
  h.props.onLog=async entry=>h.env.saved.push(entry);h.render();await h.save();
  assert.equal(h.env.saved.length,1);
  await h.reopen({expectedBpm:60});
  assert.equal(find(h.tree,node=>node.type==="textarea").props.value,"");
  assert.doesNotMatch(text(h.tree),/Unfinished practice restored/);
});

await test("separate session contexts keep independent drafts for the same exercise",async h=>{
  const firstKey=h.props.draftKey;
  find(h.tree,node=>node.type==="textarea").props.onChange({target:{value:"First session's repair."}});
  find(h.tree,node=>node.type==="input"&&node.props.type==="range").props.onChange({target:{value:"68"}});h.render();
  await h.reopen({draftKey:`${firstKey}:other-session`,expectedBpm:60});
  assert.equal(find(h.tree,node=>node.type==="textarea").props.value,"");
  find(h.tree,node=>node.type==="textarea").props.onChange({target:{value:"Other session's repair."}});h.render();
  await h.reopen({draftKey:firstKey,expectedBpm:68});
  assert.equal(find(h.tree,node=>node.type==="textarea").props.value,"First session's repair.");
});

await test("first-return evidence remains immutable after reopening and repairing the passage",async h=>{
  button(h.tree,"Needs more work").props.onClick();h.render();
  await h.reopen({expectedBpm:60});
  assert.equal(button(h.tree,"Felt steady"),null);
  assert.match(text(h.tree),/First return: needs more work/);
  await button(h.tree,"Hear slowly").props.onClick();h.render();
  find(h.tree,node=>node.type==="input"&&node.props.type==="radio"&&node.props.value==="ready").props.onChange();h.render();
  await h.save();
  assert.deepEqual(h.env.saved[0].reviewCheck,{assessment:"practising",beforeDemo:true,bpm:60,hands:"both",fromBar:1,toBar:4});
  assert.equal(h.env.saved[0].assessment,"ready");
});

await test("listening before leaving a lesson cannot become an unassisted first return on reopening",async h=>{
  await button(h.tree,"Hear reference").props.onClick();h.render();
  await h.reopen({expectedBpm:60});
  button(h.tree,"Felt steady").props.onClick();h.render();await h.save();
  assert.equal(h.env.saved[0].reviewCheck.beforeDemo,false);
});

await test("restored concept choices and checked results are supplied to the knowledge child and saved",async h=>{
  let knowledge=find(h.tree,node=>typeof node.props?.onHear==="function");
  const answers={"half-step":0},results=[{questionId:"half-step",version:1,choice:0,correct:true}];
  knowledge.props.onAnswersChange(answers);knowledge.props.onResultsChange(results);knowledge.props.onEdited();h.render();
  await h.reopen({expectedBpm:60});
  knowledge=find(h.tree,node=>typeof node.props?.onHear==="function");
  assert.deepEqual(knowledge.props.initialAnswers,answers);
  assert.deepEqual(knowledge.props.initialResults,results);
  await h.save();assert.deepEqual(h.env.saved[0].knowledgeResults,results);
},{exercise:{...exercise,knowledgeIds:["half-step"]}});

await test("each playback option alone creates a draft and restores its choice",async h=>{
  const baseKey=h.props.draftKey;
  const options=[["One-bar count-in",true],["Repeat the excerpt",false],["Include reference while I play",false],["Follow score while playing",true]];
  for(const [index,[label,initial]] of options.entries()){
    await h.reopen({draftKey:`${baseKey}:option-${index}`,expectedBpm:60});
    const option=()=>find(find(h.tree,node=>node.type==="label"&&text(node)===label),node=>node.type==="input");
    assert.equal(option().props.checked,initial);
    option().props.onChange({target:{checked:!initial}});h.render();
    await h.reopen({expectedBpm:60});
    assert.equal(option().props.checked,!initial,`${label} is retained without another edit`);
    assert.match(text(h.tree),/Unfinished practice restored/);
    assert.equal(find(h.tree,node=>node.type==="textarea").props.value,"");
  }
});

await test("registered rail tempo and keyboard shortcuts control the same lesson tempo",async h=>{
  const registered=h.env.practice.activeLesson;
  assert.equal(registered.title,exercise.title);
  assert.equal(registered.bpm,60);
  assert.equal(registered.beatsPer,4);
  assert.equal(registered.disabled,false);
  registered.setBpm(77);h.render();
  assert.equal(tempo(h.tree),77);
  assert.equal(h.env.practice.activeLesson.bpm,77);
  const event=new Event("woodshed:program-shortcut",{cancelable:true});
  event.detail={action:"bpm",delta:5};window.dispatchEvent(event);h.render();
  assert.equal(event.defaultPrevented,true);
  assert.equal(tempo(h.tree),82);
  assert.equal(h.env.practice.activeLesson.bpm,82);
  registered.setBpm(999);h.render();assert.equal(tempo(h.tree),160,"even an older rail callback uses the lesson's tempo bounds");
});

await test("registered rail start and stop use the current lesson playback plan and playback state",async h=>{
  const registered=h.env.practice.activeLesson;
  registered.setBpm(74);h.render();
  button(h.tree,"Left hand").props.onClick();h.render();
  await registered.start();h.render();
  const railRun=h.env.runs.at(-1);
  assert.equal(railRun.plan.bpm,74,"the retained rail callback reads the latest lesson tempo");
  assert.equal(railRun.plan.hands,"L");
  assert.equal(h.env.practice.activeLesson.playing,true);
  railRun.callbacks.onFrame({phase:"playing",beat:5,count:0,activeSignature:"",onsetBeat:5,progress:0.25,pass:1,bar:2});h.render();
  assert.equal(h.env.practice.activeLesson.beat,1);
  registered.stop();h.render();
  assert.equal(h.env.practice.activeLesson.playing,false);
  assert.equal(h.env.practice.activeLesson.beat,-1);
  await button(h.tree,"Play along").props.onClick();h.render();
  assert.deepEqual(h.env.runs.at(-1).plan,railRun.plan,"the lesson button and rail use identical score, passage, hands, count-in and click settings");
});

await test("lesson cleanup clears its registered controller without clearing another owner's controller",async h=>{
  assert.ok(h.env.practice.activeLesson);
  h.unmount();
  assert.equal(h.env.practice.activeLesson,null);
  await h.reopen({expectedBpm:60});
  const replacement={id:"another-lesson-owner",bpm:100};
  h.env.practice.setActiveLesson(replacement);
  h.unmount();
  assert.equal(h.env.practice.activeLesson,replacement);
});

await test("a six-eight lesson shares two dotted-quarter rail pulses with its actual playback plan",async h=>{
  assert.equal(h.env.practice.activeLesson.meterLabel,"6/8");
  assert.equal(h.env.practice.activeLesson.beatsPer,2);
  await h.env.practice.activeLesson.start();h.render();
  const {plan,callbacks}=h.env.runs.at(-1);
  assert.equal(plan.pulse,1.5);
  const countInClicks=plan.events.filter(event=>event.type==="click"&&event.at<plan.countInDuration);
  const musicClicks=plan.events.filter(event=>event.type==="click"&&event.at>=plan.countInDuration);
  assert.equal(countInClicks.length,h.env.practice.activeLesson.beatsPer);
  assert.equal(musicClicks.length,plan.bars.length*h.env.practice.activeLesson.beatsPer);
  for(const [elapsed,expected] of [[0,0],[1.5,1],[3,0],[4.5,1],[6,0],[7.5,1]]){
    callbacks.onFrame(playbackPosition(plan,elapsed));h.render();
    assert.equal(h.env.practice.activeLesson.beat,expected,`6/8 rail pulse at ${elapsed}s matches the dotted-quarter click`);
  }
},{reviewMode:false,exercise:{...exercise,hands:"R",abc:"X:1\nM:6/8\nL:1/8\nK:C\nCDE FGA|Bcd efg|]"}});

await test("rail pulses restart at the written downbeat after a four-four pickup",async h=>{
  assert.equal(h.env.practice.activeLesson.meterLabel,"4/4");
  assert.equal(h.env.practice.activeLesson.beatsPer,4);
  await h.env.practice.activeLesson.start();h.render();
  const {plan,callbacks}=h.env.runs.at(-1);
  assert.equal(plan.pickup,true);
  assert.deepEqual(plan.bars.map(bar=>bar.beat),[0,1,5]);
  assert.equal(plan.events.filter(event=>event.type==="click"&&event.at<plan.countInDuration).length,3,"three missing beats are counted before the one-beat pickup");
  callbacks.onFrame(playbackPosition(plan,plan.countInDuration));h.render();
  assert.equal(h.env.practice.activeLesson.beat,3,"the pickup occupies beat four after the three missing beats");
  const fullBarClicks=plan.events.filter(event=>event.type==="click"&&event.at>=plan.countInDuration+plan.secondsPerBeat&&event.at<plan.countInDuration+5*plan.secondsPerBeat);
  assert.equal(fullBarClicks.length,h.env.practice.activeLesson.beatsPer);
  for(const [musicBeat,expected] of [[0,3],[1,0],[2,1],[3,2],[4,3],[5,0],[6,1]]){
    const frame=playbackPosition(plan,plan.countInDuration+musicBeat*plan.secondsPerBeat);
    callbacks.onFrame(frame);h.render();
    assert.equal(h.env.practice.activeLesson.beat,expected,`written bar ${frame.bar} pulse at score beat ${musicBeat} stays aligned after the pickup`);
  }
},{reviewMode:false,exercise:{...exercise,pickup:true,hands:"R",abc:"X:1\nM:4/4\nL:1/4\nK:C\nG|C D E F|G A B c|]"}});

await test("reduced-motion preference starts with score following off while an explicit choice survives reopening",async h=>{
  const follow=()=>find(find(h.tree,node=>node.type==="label"&&text(node)==="Follow score while playing"),node=>node.type==="input");
  assert.equal(follow().props.checked,false);
  follow().props.onChange({target:{checked:true}});h.render();
  await h.reopen({expectedBpm:60});
  assert.equal(follow().props.checked,true,"the learner's explicit choice takes precedence over the initial preference");
},{reducedMotion:true});

await test("enlarged notation is keyboard-scrollable and its size restores with the unfinished lesson",async h=>{
  const size=()=>find(h.tree,node=>node.type==="select"&&node.props.id?.endsWith("-score-size"));
  assert.equal(size().props.value,1);
  size().props.onChange({target:{value:"1.5"}});h.render();
  let region=find(h.tree,node=>node.props?.["aria-label"]==="Enlarged written score");
  assert.equal(region.props.tabIndex,0);
  const paper=find(region,node=>node.props?.className==="ws-player-paper");
  assert.equal(paper.props.style.width,"150%");
  const captured=[];
  for(const key of ["ArrowLeft","ArrowRight"," ","PageDown"])region.props.onKeyDown({key,stopPropagation(){captured.push(key);}});
  region.props.onKeyDown({key:"Tab",stopPropagation(){assert.fail("Tab must continue to the next control");}});
  assert.deepEqual(captured,["ArrowLeft","ArrowRight"," ","PageDown"],"native scroll keys do not reach playback shortcuts");
  await h.reopen({expectedBpm:60});
  assert.equal(size().props.value,1.5);
});

await test("screen-reader playback announcements change at transport transitions rather than each counted beat",async h=>{
  const announcement=()=>find(h.tree,node=>node.props?.className==="ws-sr-only"&&node.props.role==="status");
  await button(h.tree,"Play along").props.onClick();h.render();
  assert.equal(text(announcement()),"Play along started.");
  const run=h.env.runs.at(-1);
  for(const elapsed of [0,1,2,3,4,5]){run.callbacks.onFrame(playbackPosition(run.plan,elapsed));h.render();assert.equal(text(announcement()),"Play along started.");}
  const visual=find(h.tree,node=>node.props?.className==="ws-player-position");
  assert.equal(visual.props["aria-live"],undefined,"bar and count updates remain readable without repeated announcements");
  h.env.practice.activeLesson.stop();h.render();
  assert.equal(text(announcement()),"Playback stopped. Ready to listen or play.");
});

await test("a direct scale repair reuses its saved tempo, hands and passage without claiming a return check",async h=>{
  assert.equal(tempo(h.tree),44);
  assert.equal(button(h.tree,"Right hand").props["aria-pressed"],true);
  await h.save();
  assert.equal(h.env.saved[0].bpm,44);
  assert.equal(h.env.saved[0].hands,"R");
  assert.equal(h.env.saved[0].fromBar,2);
  assert.equal(h.env.saved[0].toBar,3);
  assert.equal("reviewCheck" in h.env.saved[0],false);
},{reviewMode:false,reusePreviousScope:true,previousAttempt:{date:"2026-10-01",minutes:5,assessment:"practising",bpm:44,hands:"R",fromBar:2,toBar:3},defaultRange:{from:2,to:3},expectedBpm:44});

await test("technique scope is explicit, survives a draft and keeps the first report immutable",async h=>{
  const scope=()=>find(h.tree,node=>node.type==="select"&&node.props["aria-label"]==="What did you actually play?");
  assert.equal(scope().props.value,"chunk","opening a complete score cannot assert that the full range was played");
  scope().props.onChange({target:{value:"round-trip"}});h.render();
  button(h.tree,"Felt steady").props.onClick();h.render();
  scope().props.onChange({target:{value:"chunk"}});h.render();
  await h.reopen({expectedBpm:60});
  assert.equal(scope().props.value,"chunk");
  await h.save();
  assert.equal(h.env.saved[0].techniqueScope,"chunk");
  assert.equal(h.env.saved[0].reviewCheck.techniqueScope,"round-trip");
},{exercise:{...exercise,technique:{pattern:"major",octaves:1}}});

await test("passage and technique controls include their visible labels in their accessible names",async h=>{
  for(const name of ["From bar","Through bar","What did you actually play?"]) {
    const label=find(h.tree,node=>node.type==="label"&&!!find(node,child=>child.type==="select"&&child.props["aria-label"]===name));
    assert.ok(label,`a visible label surrounds ${name}`);
    const visible=label.props.children.filter(child=>typeof child==="string").join("").trim();
    assert.ok(visible.length>0);
    assert.ok(name.toLowerCase().includes(visible.toLowerCase()),`${name} contains the visible label ${visible}`);
  }
},{exercise:{...exercise,technique:{pattern:"major",octaves:1}}});

if(failures)process.exitCode=1;
else console.log("\nall first-return player checks green");
