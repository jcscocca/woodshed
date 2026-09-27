import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { parseScore, walkTune } from "./scoreModel.js";
import { runStore } from "./runStore.js";
import { useRun } from "./useRun.js";

// The open piece in the main pane. abcjs only draws it (one SVG per system) and
// maps notes to drawn elements; run statuses, the cursor and the section are
// painted on as classes, so a run never redraws the music.
const SYSTEM_H = 205, SCALE = 1.25, PAD = 6;
const RANK = { on: 1, early: 2, late: 2, missed: 3 };
const PAINT = ["ws-score-on", "ws-score-off", "ws-score-miss", "ws-score-cur"];
const MODES = { m: "minor", Dor: "dorian", Phr: "phrygian", Lyd: "lydian", Mix: "mixolydian", Loc: "locrian" };
const keyName = (k) => { const m = /(m|Dor|Phr|Lyd|Mix|Loc)$/.exec(k); return m ? `${k.slice(0, m.index)} ${MODES[m[1]]}` : `${k} major`; };
let shownId = null;

export default function ScoreStage({ item, lesson, abc }) {
  const st = useRun();
  const drill = !!lesson.sightread, src = abc || (drill ? st.drill : lesson.score?.abc);
  const [abcjs, setAbcjs] = useState(null);
  const [size, setSize] = useState(null);
  const [drawn, setDrawn] = useState(null);
  const stageRef = useRef(null), paperRef = useRef(null), base = useRef(0), lastTop = useRef(0), wheel = useRef(0), scroll = useRef(null);
  const score = useMemo(() => (abcjs && src ? parseScore(src, abcjs) : null), [abcjs, src]);
  const running = st.run.state === "countin" || st.run.state === "running";

  useEffect(() => {
    if (shownId !== item.id) { shownId = item.id; runStore.set({ section: null, window: 0, hands: "both", mode: "play" }); }
  }, [item.id]);

  useEffect(() => {
    if (!src) return;
    let live = true;
    import("abcjs").then((mod) => { if (live) setAbcjs(mod.default ?? mod); });
    return () => { live = false; };
  }, [src]);

  useLayoutEffect(() => {
    const el = stageRef.current, measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!score || !size) return;
    const paper = paperRef.current, lines = {};
    const pick = (el, an, ev) => {
      if (drill || el.el_type !== "note" || !lines[an.line] || an.measure == null) return;
      const r = runStore.get();
      if (r.run.state === "countin" || r.run.state === "running") return;
      const bar = lines[an.line].from + an.measure, cur = r.section, from = cur ? cur.from : 1;
      runStore.set({ section: ev.shiftKey ? { from: Math.min(from, bar), to: Math.max(from, bar) } : { from: bar, to: cur && cur.to >= bar ? cur.to : score.bars.length } });
    };
    const fg = getComputedStyle(paper).getPropertyValue("--text").trim();
    // a drill is one system; 2-bar drills take half the width
    const w = drill && score.bars.length <= 2 ? size.w / 2 : size.w;
    const [tune] = abcjs.renderAbc(paper, src.replace(/^K:/m, "%%barnumbers 1\nK:"), {
      oneSvgPerLine: true, add_classes: true, scale: SCALE, staffwidth: w / SCALE - 30, foregroundColor: fg, selectionColor: fg,
      clickListener: (el, _n, _c, an, _d, ev) => pick(el, an, ev),
      ...(!drill && window.innerWidth < 1280 && { wrap: { preferredMeasuresPerLine: 2, minSpacing: 1.8, maxSpacing: 2.7 } }),
    });

    // Crop each system to its music and bake the measured (scaled) box into the SVG.
    const systems = [];
    for (const div of paper.children) {
      const svg = div.querySelector("svg"), g = svg && svg.querySelector(".abcjs-staff-wrapper");
      div.removeAttribute("style");
      if (!g) { div.hidden = true; continue; }
      const b = g.getBBox();
      svg.setAttribute("viewBox", `0 ${b.y - PAD} ${svg.viewBox.baseVal.width} ${b.height + 2 * PAD}`);
      svg.setAttribute("height", b.height + 2 * PAD);
      const r = svg.getBoundingClientRect(), k = Math.min(1, size.w / r.width);
      svg.removeAttribute("style");
      svg.setAttribute("width", r.width * k);
      svg.setAttribute("height", r.height * k);
      div.className = "ws-score-sys";
      systems.push({ div, svg, line: +g.getAttribute("class").match(/abcjs-l(\d+)/)[1] });
    }

    // Key each drawn note by hand and beat with parseScore's own walk, so every target finds its element.
    const byKey = new Map(), handOf = [];
    walkTune(tune, ({ line, voice, el, beat, hand, bar }) => {
      const r = lines[line] || (lines[line] = { from: bar, to: bar });
      r.to = Math.max(r.to, bar);
      handOf[voice] = hand;
      if (el.rest || !el.abselem) return;
      const key = hand + beat;
      const e = byKey.get(key) || byKey.set(key, { els: [], hand, bar, sys: systems.findIndex((s) => s.line === line) }).get(key);
      e.els.push(...el.abselem.elemset);
    });
    // beams, rests, ties and slurs are drawn apart from the notes; they only dim
    const marks = [...byKey.values()];
    for (const el of paper.querySelectorAll(".abcjs-beam-elem, .abcjs-rest, .abcjs-tie, .abcjs-slur")) {
      const [l, m, v] = ["l", "m", "v"].map((x) => +el.getAttribute("class").match(new RegExp(`abcjs-${x}(\\d+)`))[1]);
      marks.push({ els: [el], hand: handOf[v], bar: lines[l].from + m });
    }
    for (const s of systems) {
      Object.assign(s, lines[s.line]);
      s.svg.setAttribute("role", "img");
      s.svg.setAttribute("aria-label", `bars ${s.from}–${s.to}`);
      const title = s.svg.querySelector("title");
      if (title) title.textContent = `bars ${s.from}–${s.to}`;
    }
    setDrawn({ systems, byKey, marks });
  }, [score, size && size.w]);

  const S = size ? Math.max(1, Math.floor(size.h / SYSTEM_H)) : 3;
  const maxTop = drawn ? Math.max(0, drawn.systems.length - S) : 0;
  const top = Math.min(st.window, maxTop);
  const { targets, statuses, cursor, flash } = st.run;
  const curNote = drawn && targets && cursor >= 0 && targets[cursor] ? drawn.byKey.get(targets[cursor].hand + targets[cursor].beat) : null;

  // During a run, the cursor reaching the last visible system refills the ones above it.
  useEffect(() => {
    if (!drawn || !running || !curNote) return;
    const i = curNote.sys;
    if (i < top || i >= top + S - 1) {
      const next = Math.min(i, maxTop);
      if (next !== top) runStore.set({ window: next });
    }
  });

  useEffect(() => {
    if (!drawn || !st.section || running) return;
    const i = drawn.systems.findIndex((s) => s.to >= st.section.from);
    if (i >= 0 && (i < top || i >= top + S)) runStore.set({ window: Math.min(i, maxTop) });
  }, [st.section, drawn]);

  useLayoutEffect(() => {
    if (!drawn) return;
    const { section } = st, hands = drill ? "both" : st.hands;
    const revisit = (st.run.state === "done" && st.run.result && st.run.result.revisitBars) || [];
    for (const e of drawn.marks) { e.rank = 0; e.cur = false; }
    if (targets && statuses) targets.forEach((t, i) => {
      const e = drawn.byKey.get(t.hand + t.beat);
      if (!e) return;
      e.rank = Math.max(e.rank, RANK[statuses[i]] || 0);
      if (cursor >= 0 && targets[cursor] && t.beat === targets[cursor].beat && statuses[i] === "pending") e.cur = true;
    });
    for (const e of drawn.marks) {
      const dim = (section && (e.bar < section.from || e.bar > section.to)) || (hands !== "both" && e.hand !== hands);
      const paint = e.cur ? (flash ? "ws-score-miss" : "ws-score-cur") : PAINT[e.rank - 1];
      for (const g of e.els) {
        g.classList.toggle("ws-score-dim", !!dim);
        g.classList.toggle("ws-score-revisit", !dim && revisit.includes(e.bar));
        for (const c of PAINT) g.classList.toggle(c, c === paint);
      }
    }
    // Systems keep their slot (index mod S) during a run, so the current line never moves.
    if (!running && top !== lastTop.current) base.current = top;
    lastTop.current = top;
    const curSys = curNote ? curNote.sys : section ? drawn.systems.findIndex((s) => s.to >= section.from) : top;
    drawn.systems.forEach((s, i) => {
      s.div.style.display = i < top || i >= top + S ? "none" : "";
      s.div.style.order = (((i - base.current) % S) + S) % S;
      s.div.classList.toggle("cur", i === curSys);
    });
  });

  const move = (d) => runStore.set({ window: Math.max(0, Math.min(maxTop, top + d)) });
  const onWheel = (e) => {
    if (!drawn || running) return;
    wheel.current += e.deltaMode ? e.deltaY * 40 : e.deltaY;
    if (Math.abs(wheel.current) < 50) return;
    move(Math.sign(wheel.current));
    wheel.current = 0;
  };
  // ↑/↓ from the shortcut bridge
  scroll.current = (d) => { if (drawn && !running) move(d); };
  useEffect(() => {
    const onKey = (e) => { if (e.detail.type === "scroll") { e.preventDefault(); scroll.current(e.detail.delta); } };
    window.addEventListener("woodshed:score", onKey);
    return () => window.removeEventListener("woodshed:score", onKey);
  }, []);

  const sec = st.section || (score && { from: 1, to: score.bars.length });
  return (
    <div className={`ws-score${drill ? " drill" : ""}`} tabIndex={-1} onWheel={onWheel}>
      <div className="ws-score-head">
        <span className="ws-score-title">{item.title}</span>
        {score && <span className="ws-score-meta mono">{keyName(score.key)} · {score.meter.join("/")} · bars {sec.from}–{sec.to}</span>}
      </div>
      <div className="ws-score-stage" ref={stageRef} style={size ? { "--slot": `${Math.floor(size.h / S)}px` } : undefined}>
        {src && !drawn && <><div className="ws-score-slab" /><div className="ws-score-slab" /><div className="ws-score-slab" /></>}
        <div className="ws-score-paper" ref={paperRef} />
      </div>
    </div>
  );
}
