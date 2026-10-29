import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { QUESTIONS } from "../src/program/knowledge.js";

const root=fileURLToPath(new URL("../",import.meta.url));
const bundle=await build({
  stdin:{contents:`export {default as ConceptReview} from './src/program/ConceptReview.jsx'; export * from './src/program/drafts.js';`,resolveDir:root},
  bundle:true,write:false,format:"esm",platform:"node",
  plugins:[{name:"concept-boundaries",setup(b){
    b.onResolve({filter:/^react$/},()=>({path:"react",namespace:"boundary"}));
    b.onResolve({filter:/PracticeProvider\.jsx$/},()=>({path:"practice",namespace:"boundary"}));
    b.onResolve({filter:/KnowledgeChecks\.jsx$/},()=>({path:"knowledge",namespace:"boundary"}));
    b.onResolve({filter:/lessonAudio\.js$/},()=>({path:"legacy",namespace:"boundary"}));
    b.onResolve({filter:/playback\.js$/},args=>args.importer.endsWith("ConceptReview.jsx")?{path:"playback",namespace:"boundary"}:null);
    b.onLoad({filter:/.*/,namespace:"boundary"},({path})=>({resolveDir:root,contents:{
      react:`const hooks=()=>globalThis.__conceptHooks;
        const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
        export function useState(initial){const h=hooks(),i=h.cursor++;if(!(i in h.slots))h.slots[i]=typeof initial==='function'?initial():initial;return[h.slots[i],value=>{const next=typeof value==='function'?value(h.slots[i]):value;if(!Object.is(next,h.slots[i])){h.slots[i]=next;h.dirty=true;}}];}
        export function useRef(value){const h=hooks(),i=h.cursor++;if(!(i in h.slots))h.slots[i]={current:value};return h.slots[i];}
        export const useId=()=>globalThis.__conceptEnv.id;
        export function useEffect(fn,deps){const h=hooks(),i=h.cursor++,previous=h.slots[i];if(!previous||!same(previous.deps,deps))h.effects.push(()=>{previous?.cleanup?.();h.slots[i]={deps,cleanup:fn()};});}
        export default {Fragment:'fragment',createElement(type,props,...children){return{type,props:{...props,children}}}};`,
      practice:"export const usePractice=()=>globalThis.__conceptEnv.practice;",
      knowledge:"export default function KnowledgeChecks() {}",
      legacy:"export const stop=()=>globalThis.__conceptEnv.legacyStops++;",
      playback:`export {planPlayback} from './src/program/playback.js';
        export function createLessonPlayback(){const e=globalThis.__conceptEnv;const controller={stop(){e.stops++;},close(){e.closes++;},async start(plan,callbacks){e.runs.push({plan,callbacks});if(e.audioFailure)throw new Error('Audio unavailable');}};return controller;}`,
    }[path]}));
  }}],
});
const {ConceptReview,readPracticeDraft,clearAllPracticeDrafts}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const find=(node,predicate)=>Array.isArray(node)?node.map(child=>find(child,predicate)).find(Boolean):!node||typeof node!=="object"?null:predicate(node)?node:find(node.props?.children,predicate);
const text=node=>Array.isArray(node)?node.map(text).join(""):node&&typeof node==="object"?text(node.props?.children):node==null||typeof node==="boolean"?"":String(node);
const question=QUESTIONS.find(q=>q.id==="g-signature"),exercise={id:"g-key-f-sharp",title:"Read G major"};
let nextId=0;
function harness(overrides={}){
  const descriptors=new Map(["window","requestAnimationFrame","cancelAnimationFrame","sessionStorage"].map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const values=new Map(),storage={get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  for(const [name,value] of Object.entries({window:new EventTarget(),requestAnimationFrame:()=>1,cancelAnimationFrame(){},sessionStorage:storage}))Object.defineProperty(globalThis,name,{configurable:true,value});
  clearAllPracticeDrafts();
  const env=globalThis.__conceptEnv={id:`concept-${++nextId}`,saved:[],runs:[],stops:0,closes:0,metroStops:0,legacyStops:0,practice:{activeLesson:null,setCoursePlaying(){}}};
  env.practice.metro={stop(){env.metroStops++;}};
  env.practice.setActiveLesson=value=>{env.practice.activeLesson=typeof value==="function"?value(env.practice.activeLesson):value;};
  const props={question,exercise,onLog:async entry=>env.saved.push(entry),onClose(){env.closed=true;},...overrides};
  const hooks={cursor:0,slots:[],effects:[],dirty:false};let identity;
  const unmount=()=>{for(const slot of hooks.slots)slot?.cleanup?.();};
  const h={env,props,tree:null,render(){
    let passes=0;
    do{
      assert.ok(++passes<15,"concept state settles");
      const child=ConceptReview(props);
      if(identity!==child.props.key){unmount();hooks.slots=[];identity=child.props.key;}
      globalThis.__conceptHooks=hooks;hooks.cursor=0;hooks.effects=[];hooks.dirty=false;
      h.tree=child.type(child.props);
      for(const effect of hooks.effects.splice(0))effect();
    }while(hooks.dirty);
    return h.tree;
  },knowledge(){return find(h.tree,node=>node.props?.questions?.length===1);},button(){return find(h.tree,node=>node.type==="button"&&/understanding check/i.test(text(node))&& !/^Close/.test(text(node)));},
  answer(choice,checked=true){const child=h.knowledge();child.props.onAnswersChange({[props.question.id]:choice});child.props.onResultsChange(checked?[{questionId:props.question.id,version:props.question.version,choice}]:[]);child.props.onEdited();h.render();},
  async save(){await h.button().props.onClick();h.render();},
  reopen(overrides={}){unmount();hooks.slots=[];identity=undefined;Object.assign(props,overrides);h.render();},
  close(){unmount();clearAllPracticeDrafts();for(const[name,d]of descriptors)if(d)Object.defineProperty(globalThis,name,d);else delete globalThis[name];delete globalThis.__conceptEnv;delete globalThis.__conceptHooks;}};
  h.render();return h;
}

test("only a checked concept result can save, and it contributes no piano assessment or session credit",async()=>{
  const h=harness();try{
    assert.equal(h.button().props.disabled,true);await h.save();assert.equal(h.env.saved.length,0);
    h.answer(0,false);assert.equal(h.button().props.disabled,true);
    h.answer(0);assert.equal(h.button().props.disabled,false);await h.save();
    assert.deepEqual(h.env.saved,[{exerciseId:exercise.id,section:"knowledge",minutes:0,assessment:"unsure",knowledgeResults:[{questionId:question.id,version:question.version,choice:0,correct:false}]}]);
    assert.equal(h.button().props.disabled,true);
    assert.equal(readPracticeDraft(`${exercise.id}:knowledge:${question.id}`,JSON.stringify(question)),null);
  }finally{h.close();}
});

test("changing an answer invalidates its checked result even for a stale save handler",async()=>{
  const h=harness();try{
    h.answer(0);const save=h.button().props.onClick;
    h.knowledge().props.onAnswersChange({[question.id]:1});h.knowledge().props.onResultsChange([]);h.knowledge().props.onEdited();
    await save();h.render();assert.equal(h.env.saved.length,0);assert.equal(h.button().props.disabled,true);
  }finally{h.close();}
});

test("a failed durable save retains exact answers/results for same-tab resume and successful retry",async()=>{
  const h=harness({onLog:async()=>{throw new Error("Quota");}});try{
    h.answer(0);await h.save();assert.match(text(h.tree),/could not be saved/);
    h.reopen({onLog:async entry=>h.env.saved.push(entry)});
    assert.deepEqual(h.knowledge().props.initialAnswers,{[question.id]:0});
    assert.equal(h.knowledge().props.initialResults[0].correct,false);
    h.answer(1);await h.save();assert.equal(h.env.saved[0].knowledgeResults[0].correct,true);
    assert.equal(readPracticeDraft(`${exercise.id}:knowledge:${question.id}`,JSON.stringify(question)),null);
  }finally{h.close();}
});

test("question wording/version changes cannot inherit a previous checked draft",()=>{
  const h=harness();try{
    h.answer(0);h.reopen({question:{...question,version:question.version+1,prompt:"A revised musical question"}});
    assert.equal(h.knowledge().props.initialAnswers,undefined);assert.equal(h.knowledge().props.initialResults,undefined);assert.equal(h.button().props.disabled,true);
    assert.equal(readPracticeDraft(`${exercise.id}:knowledge:${question.id}`,JSON.stringify(question)).results[0].choice,0,"the prior source remains stored until new edits replace it");
  }finally{h.close();}
});

test("a pending or completed save cannot append a duplicate understanding report",async()=>{
  let resolve;
  const wait=new Promise(done=>{resolve=done;});let calls=0;
  const h=harness({onLog:async()=>{calls++;await wait;}});try{
    h.answer(1);const save=h.button().props.onClick,first=save();await save();assert.equal(calls,1);
    resolve();await first;h.render();await save();assert.equal(calls,1);
  }finally{h.close();}
});

test("listening owns and releases audio without starting a global metronome or another microphone tool",async()=>{
  const audio=QUESTIONS.find(q=>q.audio&&!q.archived),h=harness({question:audio});try{
    assert.equal(h.env.practice.activeLesson.disabled,true);
    const shortcut=new Event("woodshed:program-shortcut",{cancelable:true});Object.defineProperty(shortcut,"detail",{value:{type:"metronome"}});
    assert.equal(window.dispatchEvent(shortcut),false,"global metronome shortcuts are consumed by the concept check");
    await h.knowledge().props.onHear(audio);h.render();
    assert.equal(h.env.runs.length,1);assert.equal(h.env.runs[0].plan.countInDuration,0);
    assert.equal(h.env.metroStops,1);assert.equal(h.env.legacyStops,1);assert.equal(h.env.practice.activeLesson.playing,true);
    h.env.runs[0].callbacks.onEnd();h.render();assert.equal(h.env.practice.activeLesson.playing,false);
    h.env.practice.activeLesson={id:"different-owner"};
  }finally{h.close();}
  assert.equal(h.env.closes,1);assert.equal(h.env.practice.activeLesson.id,"different-owner","unmount cannot clear a newer owner");
});

test("failed listening leaves written understanding checks usable",async()=>{
  const audio=QUESTIONS.find(q=>q.audio&&!q.archived),h=harness({question:audio});try{
    h.env.audioFailure=true;await h.knowledge().props.onHear(audio);h.render();
    assert.match(text(h.tree),/listening example could not start/);assert.equal(h.env.practice.activeLesson.playing,false);
    h.answer(audio.answer);await h.save();assert.equal(h.env.saved[0].knowledgeResults[0].correct,true);
  }finally{h.close();}
});
