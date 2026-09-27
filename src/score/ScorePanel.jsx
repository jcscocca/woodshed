import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseScore, inSection, forHands } from "./scoreModel.js";
import { gradeTimed } from "./timedGrade.js";
import { createWaitRun } from "./waitGrade.js";
import { generateDrill, drillBpm, LEVELS } from "./sightread.js";
import { runStore } from "./runStore.js";
import { useRun } from "./useRun.js";
import { usePractice } from "../PracticeProvider.jsx";
import { useMidi } from "../midi/MidiProvider.jsx";
import { overlay } from "../midi/overlay.js";
import { toNoteEvent } from "../midi/midiModel.js";
import { midiToNote } from "../audio/notes.js";

// The open piece's controls in the rail. A run lives outside React: its MIDI
// subscription (and, in play-along, a frame loop) writes the stage's colours to
// runStore and the band's readout to overlay; the panel renders the summary.
const IDLE = { state: "idle", statuses: null, cursor: -1, result: null, targets: null, flash: false };
const HANDS = [["both", "Both"], ["R", "RH"], ["L", "LH"]];
const MODES = [["wait", "Wait"], ["play", "Play-along"]];
const setRun = (patch) => runStore.set({ run: { ...runStore.get().run, ...patch } });
const noteNames = (notes) => notes.map((n) => { const x = midiToNote(n.midi); return `${x.name}${x.octave}`; }).join(" ");
const barList = (bars) => `bar${bars.length > 1 ? "s" : ""} ${bars.join(", ")}`;
const waitLine = (r) => `found ${r.found} of ${r.total} · ${r.wrong} wrong press${r.wrong === 1 ? "" : "es"}${r.wrongBars.length ? ` (${barList(r.wrongBars)})` : ""}`;
const bandOf = (r) => (r.clean ? "Clean run" : r.notesPct >= 60 ? "Solid run — a couple to clean up" : "Keep at it — this one needs reps");
const seed = () => Math.floor(Math.random() * 2 ** 28);

// A sight-reading lesson (lesson.sightread) plays generated drills instead: always
// play-along, both hands as written, no sections or ladder; the drill's ABC goes
// to runStore for the stage.
export default function ScorePanel({ item, lesson, ladder = {}, sightLevel, onLadder, onSightLevel, onResult, onRequestLog }) {
  const { metro } = usePractice();
  const midi = useMidi();
  const st = useRun();
  const [abcjs, setAbcjs] = useState(null);
  const [say, setSay] = useState("");
  const [lastClean, setLastClean] = useState({});
  const [streak, setStreak] = useState(0);
  const live = useRef(null), metroRef = useRef(metro), passes = useRef({}), shownKey = useRef(null), toggle = useRef(null), onKey = useRef(null), graded = useRef(false), picked = useRef(false);
  metroRef.current = metro;
  const sight = !!lesson.sightread, level = sightLevel;
  const spec = lesson.score || {};
  const src = sight ? st.drill : spec.abc;
  const score = useMemo(() => (abcjs && src ? parseScore(src, abcjs) : null), [abcjs, src]);
  const n = score ? score.bars.length : 0;
  const sec = (!sight && st.section) || { from: 1, to: n };
  const hands = sight ? "both" : st.hands, mode = sight ? "play" : st.mode;
  const preset = !sight && spec.sections.find((s) => s.from === sec.from && s.to === sec.to);
  const key = sight ? `level ${level}` : preset ? preset.name : sec.from === 1 && sec.to === n ? "all" : `${sec.from}-${sec.to}`;
  const targets = useMemo(() => (score ? forHands(inSection(score.notes, sec.from, sec.to), hands) : []), [score, sec.from, sec.to, hands]);
  const connected = !!midi && midi.status === "connected";
  const running = st.run.state === "countin" || st.run.state === "running";

  useEffect(() => {
    runStore.set({ run: IDLE });
    let on = true;
    import("abcjs").then((mod) => { if (on) setAbcjs(mod.default ?? mod); });
    const onCoach = () => toggle.current();
    const onScore = (e) => onKey.current(e.detail);
    window.addEventListener("woodshed:coach", onCoach);
    window.addEventListener("woodshed:score", onScore);
    return () => {
      on = false;
      window.removeEventListener("woodshed:coach", onCoach);
      window.removeEventListener("woodshed:score", onScore);
      if (live.current) live.current.cancel();
      if (sight) runStore.set({ drill: null });
    };
  }, []);

  // A new drill (fresh seed, never the one showing) starts from a clean stage.
  const newDrill = () => {
    if (live.current) return;
    let abc;
    do abc = generateDrill(level, seed()); while (abc === runStore.get().drill);
    graded.current = false;
    runStore.set({ drill: abc, run: IDLE });
  };
  useEffect(() => {
    if (!sight) return;
    metro.setBpm(drillBpm(level));
    newDrill();
  }, [level]);
  const setLevel = (l) => { setStreak(0); onSightLevel(l); };

  // Opening a section restores the tempo its ladder reached (else the piece's start tempo).
  useEffect(() => {
    if (!score) return;
    if (sight) { metro.setBeatsPer(score.beatsPerBar); return; }
    if (shownKey.current == null) metro.setBeatsPer(score.beatsPerBar);
    else setSay(sec.from === sec.to ? `Bar ${sec.from}` : `${preset ? `Section ${preset.name}, bars` : "Bars"} ${sec.from}–${sec.to}`);
    shownKey.current = key;
    metro.setBpm(ladder[key] ?? spec.bpm);
  }, [score, key]);

  useEffect(() => { if (!connected && live.current) { live.current.stop(); setSay("Keyboard disconnected."); } }, [connected]);

  // hands separately: keys only the other hand plays in this section are ignored
  const ignored = () => new Set(hands === "both" ? [] : inSection(score.notes, sec.from, sec.to)
    .filter((x) => x.hand !== hands && !targets.some((t) => t.midi === x.midi)).map((x) => x.midi));

  function startWait(ignore) {
    const run = createWaitRun(targets);
    let timer = 0;
    const statuses = () => { const found = new Set(run.groups.slice(0, run.cursor).flatMap((g) => g.notes)); return targets.map((t) => (found.has(t) ? "on" : "pending")); };
    const show = () => {
      const g = run.groups[run.cursor];
      setRun({ statuses: statuses(), cursor: targets.indexOf(g.notes[0]) });
      overlay.set({ targets: g.notes.map((x) => ({ midi: x.midi, finger: null })), range: null, statuses: null, next: g.notes.map((_, i) => i), readout: { head: noteNames(g.notes), line: `bar ${g.bar} · ${run.cursor + 1} of ${run.groups.length}` }, busy: true, hideTargets: false });
    };
    const teardown = () => { off(); clearTimeout(timer); overlay.reset(); live.current = null; };
    const end = () => {
      teardown();
      const result = { wait: true, ...run.result() };
      setRun({ state: "done", statuses: statuses(), cursor: -1, flash: false, result });
      setSay(waitLine(result));
    };
    const off = midi.subscribe((m) => {
      if (m.type !== "on" || ignore.has(m.note)) return;
      const r = run.press(m.note);
      if (r === "wrong") { clearTimeout(timer); setRun({ flash: true }); timer = setTimeout(() => setRun({ flash: false }), 300); }
      else if (r === "advance") show();
      else if (r === "done") end();
    });
    runStore.set({ run: { ...IDLE, state: "running", targets } });
    show();
    live.current = { stop: end, cancel: () => { teardown(); runStore.set({ run: IDLE }); } };
  }

  function startPlay(ignore) {
    const mt = metroRef.current, bpb = score.beatsPerBar, { from, to } = sec, k = key;
    const beat0 = targets[0].beat - score.bars[from - 1].beat;
    if (mt.playing) mt.stop();
    const startedAt = performance.now();
    mt.start({ countIn: bpb });
    const pass = (passes.current[k] = (passes.current[k] || 0) + 1), events = [];
    let t0 = null, bpm = mt.timeline().bpm, raf = 0, sig = "", head = "";
    const off = midi.subscribe((m) => { if (m.type === "on" && !ignore.has(m.note)) events.push(toNoteEvent(m)); });
    const grade = (now) => gradeTimed(targets, events, { t0: t0 + (beat0 * 60000) / bpm, bpm, beatsPerBar: bpb, now });
    const teardown = () => { cancelAnimationFrame(raf); off(); overlay.reset(); metroRef.current.stop(); live.current = null; };
    const finish = (g, complete) => {
      teardown();
      setRun({ state: "done", statuses: g.statuses, cursor: -1, result: { ...g, bpm, section: k } });
      // a drill counts toward the level-up streak once, on its first graded pass; any pass that isn't clean resets it
      if (sight) { if (!complete || !g.clean) setStreak(0); else if (!graded.current) setStreak((s) => s + 1); graded.current = true; }
      else if (complete && g.clean) {
        const up = Math.max(bpm, Math.min(spec.target, bpm + 4));
        onLadder(k, up);
        metroRef.current.setBpm(up);
        setLastClean((c) => ({ ...c, [k]: bpm }));
      }
      setSay(`${bandOf(g)}: notes ${g.notesPct}% · rhythm ${g.rhythmPct}%`);
    };
    const frame = () => {
      const now = performance.now();
      // Re-read the timeline through the count-in: until audio output (re)starts its clock mapping
      // is stale (t0 lands before the count-in could end), and its tempo is the one clicking.
      if (t0 == null || now < t0) { const tl = metroRef.current.timeline(); if (tl && tl.t0 >= startedAt + (bpb * 60000) / tl.bpm) ({ t0, bpm } = tl); }
      if (t0 != null) {
        const ms = 60000 / bpm, g = grade(now), counting = now < t0;
        const s = `${counting}${g.cursor}${g.statuses}`;
        if (s !== sig) { sig = s; setRun({ state: counting ? "countin" : "running", statuses: g.statuses, cursor: g.cursor }); }
        const h = counting
          ? Array.from({ length: Math.max(1, Math.min(bpb, Math.floor((now - t0) / ms) + bpb + 1)) }, (_, i) => i + 1).join(" ")
          : `bar ${Math.min(to, from + Math.floor((now - t0) / (ms * bpb)))}`;
        if (h !== head) { head = h; overlay.set({ targets: [], statuses: null, next: [], readout: { head, line: `pass ${pass} · ${bpm} bpm` }, busy: true }); }
        if (g.done) return finish(g, true);
      }
      raf = requestAnimationFrame(frame);
    };
    runStore.set({ run: { ...IDLE, state: "countin", targets, play: true } });
    setSay(`Count-in, ${bpm} bpm`);
    raf = requestAnimationFrame(frame);
    live.current = {
      stop: () => (t0 == null || performance.now() < t0 ? live.current.cancel() : finish(grade(Infinity), false)),
      cancel: () => { teardown(); runStore.set({ run: IDLE }); },
    };
  }

  const start = () => {
    if (live.current || !connected || !targets.length) return;
    (mode === "wait" ? startWait : startPlay)(ignored());
  };
  toggle.current = () => (live.current ? live.current.stop() : start());

  const setSection = (s) => runStore.set({ section: s });
  const sections = [...(spec.sections || []), null];
  // W / H / N / [ ] from the shortcut bridge; the controls they mirror are locked mid-run
  onKey.current = (a) => {
    if (running) return;
    if (sight) { if (a.type === "drill") newDrill(); return; }
    if (a.type === "mode") runStore.set({ mode: st.mode === "wait" ? "play" : "wait" });
    else if (a.type === "hands") runStore.set({ hands: HANDS[(HANDS.findIndex(([v]) => v === st.hands) + 1) % HANDS.length][0] });
    else if (a.type === "section" && score) {
      const i = sections.findIndex((s) => (s ? s.name : "all") === key);
      const p = sections[i < 0 ? (a.delta > 0 ? 0 : sections.length - 1) : (i + a.delta + sections.length) % sections.length];
      setSection(p ? { from: p.from, to: p.to } : null);
    }
  };
  const commit = (e, end) => {
    const cur = end ? sec.to : sec.from, b = Math.max(1, Math.min(n, Math.round(Number(e.target.value)) || cur));
    e.target.value = b;
    if (b !== cur) setSection(end ? { from: Math.min(sec.from, b), to: b } : { from: b, to: Math.max(sec.to, b) });
  };
  const seg = (value, options, set) => options.map(([v, label]) => (
    <button key={v} className={`ws-sig-btn ${value === v ? "on" : ""}`} aria-pressed={value === v} disabled={running} onClick={() => set(v)}>{label}</button>
  ));
  const num = (end) => (
    <input key={end ? `t${sec.to}` : `f${sec.from}`} className="ws-score-num mono" type="number" min={1} max={n} defaultValue={end ? sec.to : sec.from}
      aria-label={end ? "To bar" : "From bar"} disabled={running || !score}
      onBlur={(e) => commit(e, end)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
  );

  const r = st.run.state === "done" && st.run.result;
  const next = r && Math.min(spec.target, r.bpm + 4);
  const revisit = r && !r.wait ? r.revisitBars.filter((b) => b >= sec.from && b <= sec.to) : [];
  const note = !connected && (midi && midi.status === "unsupported" ? "MIDI needs Chrome or Edge."
    : `${midi && midi.status === "disconnected" ? "Keyboard disconnected. Plug it back in" : "Connect your keyboard"} to practise this.`);
  const logIt = () => {
    onResult(r.wait ? null : { accuracy: r.notesPct, rhythm: r.rhythmPct, section: r.section, bpm: r.bpm, missed: r.revisitBars.map((b) => `bar ${b}`) });
    onRequestLog();
  };

  const go = (
    <button className={`ws-btn ${running ? "ghost" : "primary"} sm full`} disabled={!running && (!connected || !targets.length)} onClick={() => toggle.current()}>
      {running ? "■ Stop" : "● Start"}<kbd className="ws-kbd" aria-hidden="true">C</kbd>
    </button>
  );

  return (
    <div className="ws-score-panel">
      <h2 className="ws-sheet-title">{item.title}</h2>
      {sight ? (
        <div className="ws-score-row">
          <span className="ws-lesson-label">Level</span>
          <select className="ws-score-level" aria-label="Level" value={level} disabled={running}
            onPointerDown={() => { picked.current = true; }} onKeyDown={() => { picked.current = false; }}
            onChange={(e) => { setLevel(Number(e.target.value)); if (picked.current) e.currentTarget.blur(); }}>
            {LEVELS.map((l, i) => <option key={i} value={i + 1}>{i + 1} · {l.name}</option>)}
          </select>
        </div>
      ) : (
        <>
          <div className="ws-score-row">
            <span className="ws-lesson-label">Section</span>
            <div className="ws-sig">
              {seg(key, [...spec.sections.map((s) => [s.name, s.name]), ["all", "all"]], (v) => {
                const p = spec.sections.find((s) => s.name === v);
                setSection(p ? { from: p.from, to: p.to } : null);
              })}
            </div>
            <span className="ws-score-range">{num(false)}–{num(true)}</span>
          </div>
          <div className="ws-score-row"><span className="ws-lesson-label">Hands</span><div className="ws-sig">{seg(st.hands, HANDS, (hands) => runStore.set({ hands }))}</div></div>
          <div className="ws-score-row"><span className="ws-lesson-label">Mode</span><div className="ws-sig">{seg(st.mode, MODES, (mode) => runStore.set({ mode }))}</div></div>
        </>
      )}
      <div className="ws-score-row">
        <span className="ws-lesson-label">Tempo</span>
        <span className="ws-score-tempo mono">{sight ? `${metro.bpm} bpm` : `${metro.bpm} → ${spec.target}${lastClean[key] ? ` · last clean ${lastClean[key]}` : ""}`}</span>
      </div>
      {sight ? (
        <div className="ws-score-go">
          {go}
          <button className="ws-btn ghost sm" disabled={running} onClick={newDrill}>New drill<kbd className="ws-kbd" aria-hidden="true">N</kbd></button>
        </div>
      ) : go}
      {note && <p className="ws-midi-connect-note ws-score-note">{note}</p>}

      {r && (
        <div className="ws-coach-summary">
          {r.wait ? <div className="ws-score-pct mono">{waitLine(r)}</div> : (
            <>
              <div className="ws-coach-band">{bandOf(r)}</div>
              <div className="ws-score-pct mono">notes <b>{r.notesPct}%</b> · rhythm <b>{r.rhythmPct}%</b></div>
              {r.extras.length > 0 && <div className="ws-coach-timing mono">{r.extras.length} extra note{r.extras.length === 1 ? "" : "s"}</div>}
              {!sight && revisit.length > 0 && (
                <div className="ws-coach-missed">to revisit: bar{revisit.length > 1 ? "s" : ""}
                  {revisit.map((b) => <button key={b} className="ws-score-bar mono" aria-label={`Practise bar ${b}`} onClick={() => setSection({ from: b, to: b })}>{b}</button>)}
                </div>
              )}
            </>
          )}
          {sight && streak >= 3 && r.clean && level < LEVELS.length && (
            <button className="ws-btn primary sm full ws-score-up" onClick={() => setLevel(level + 1)}>Level up →</button>
          )}
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={start} disabled={!connected}>↻ again</button>
            {!sight && !r.wait && next > metro.bpm && (
              <button className="ws-btn ghost sm" disabled={!connected} onClick={() => { metro.setBpm(next); requestAnimationFrame(() => toggle.current()); }}>↑ {next}</button>
            )}
            <button className="ws-btn primary sm" onClick={logIt}>Log it →</button>
          </div>
        </div>
      )}

      <div className="ws-lesson-sec">
        <div className="ws-lesson-label">Notes</div>
        <ol className="ws-lesson-steps">{lesson.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>
      <div className="ws-score-live" aria-live="polite">{say}</div>
    </div>
  );
}
