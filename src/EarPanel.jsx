import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCoach } from "./useCoach.js";
import { createEarSession, mulberry32 } from "./ear.js";
import { playSequence, stop as stopAudio } from "./lessonAudio.js";

const STATUS_CLASS = { caught: "ok", missed: "bad", pending: "" };

// Call-and-response surface in the lesson sheet. The session machine (ear.js)
// owns the flow; this component drives it: play the prompt with the mic OFF
// (the coach must never grade the synth), then listen, then reveal. Targets
// stay hidden until reveal — pips show status only, and there is deliberately
// no "looking for X" hint (it would name the answer).
export default function EarPanel({ item, lesson, sessions = [], onLog }) {
  const [open, setOpen] = useState(false);
  const [runToken, setRunToken] = useState(0);
  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);
  const session = useRef(null);
  const rng = useRef(null);
  const timer = useRef(null);

  const st = session.current ? session.current.state : { phase: "idle" };
  const targets = st.current ? st.current.targets : [];
  const coach = useCoach({ mode: "line", targets, octaveStrict: false, inst: item.inst });
  const r = coach.result;

  // Start the mic only after the prompt has finished and targets have settled
  // (same runToken discipline as CoachPanel).
  useEffect(() => {
    if (runToken === 0) return;
    coach.reset();
    coach.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runToken]);

  const playPrompt = () => {
    const cur = session.current.state.current;
    coach.stop();
    const ms = playSequence(cur.promptVoices, { bpm: cur.bpm });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      session.current.promptEnded();
      setRunToken((n) => n + 1);
      rerender();
    }, ms + 250);
    rerender();
  };

  const begin = () => {
    rng.current = mulberry32(Date.now() >>> 0);
    session.current = createEarSession({ diff: item.diff, ear: lesson.ear });
    session.current.begin(rng.current);
    playPrompt();
  };

  const finishRound = () => {
    coach.stop();
    session.current.roundGraded(coach.result);
    rerender();
  };

  // A round grades itself the moment the line completes.
  useEffect(() => {
    if (coach.listening && session.current && session.current.state.phase === "listen" && r.done) finishRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.done, coach.listening]);

  const replay = () => { if (session.current.replay()) playPrompt(); };
  const next = () => {
    session.current.next(rng.current);
    if (session.current.state.phase === "prompt") playPrompt();
    else rerender();
  };

  useEffect(() => () => { clearTimeout(timer.current); stopAudio(); }, []);

  // Same trouble-spot memory as CoachPanel — here the labels are intervals.
  const trouble = useMemo(() => {
    const counts = {};
    for (const s of sessions) if (s.coached && Array.isArray(s.missed)) for (const m of s.missed) counts[m] = (counts[m] || 0) + 1;
    return Object.entries(counts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
  }, [sessions]);

  if (!open) {
    return (
      <button className="ws-btn ghost sm ws-coach-open" onClick={() => setOpen(true)}>
        ◉ Train your ear
      </button>
    );
  }

  const listen = st.phase === "listen";
  const reveal = st.phase === "reveal";
  const done = st.phase === "done";
  // During prompt, r may still hold the previous round (reset happens at mic
  // start) — render neutral pips from the new targets instead.
  const pips = listen || reveal ? r.results : targets.map((t) => ({ status: "pending", target: t }));
  const lastRound = st.rounds && st.rounds.length ? st.rounds[st.rounds.length - 1] : null;
  const sum = done ? session.current.summary() : null;

  return (
    <div className="ws-coach" aria-live="polite">
      {st.phase !== "idle" && !done && (
        <>
          <div className="ws-coach-hint mono">
            round {st.round} of {st.total}
            {item.diff <= 2 && targets.length ? ` · starts on ${targets[0].label}` : ""}
          </div>
          <div className="ws-coach-seq" role="img" aria-label={`Ear round ${st.round}: ${pips.filter((x) => x.status === "caught").length} of ${targets.length} caught`}>
            {pips.map((x, i) => (
              <span key={i} className={`ws-coach-chip ${STATUS_CLASS[x.status] || ""} ${listen && i === r.cursor ? "now" : ""}`}>
                {reveal ? x.target.label : "●"}
              </span>
            ))}
          </div>
        </>
      )}

      {coach.error ? (
        <div className="ws-listen-err">{coach.error}</div>
      ) : st.phase === "idle" ? (
        <div className="ws-coach-start">
          {trouble.length > 0 && <div className="ws-coach-trouble">Trouble spots last time: {trouble.join(", ")}</div>}
          <button className="ws-btn primary sm full" onClick={begin}>● Start</button>
        </div>
      ) : st.phase === "prompt" ? (
        <div className="ws-coach-hint mono">listen…</div>
      ) : listen ? (
        <>
          <div className="ws-coach-hint mono">
            {r.lastHeard ? `hearing ${r.lastHeard.name}${r.lastHeard.octave}` : "play it back…"}
          </div>
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={replay} disabled={st.replaysLeft <= 0}>
              ↻ Replay{Number.isFinite(st.replaysLeft) ? ` (${st.replaysLeft})` : ""}
            </button>
            <button className="ws-btn ghost sm" onClick={finishRound}>Reveal</button>
          </div>
        </>
      ) : reveal ? (
        <div className="ws-coach-summary">
          <div className="ws-coach-score mono"><b>{lastRound.accuracy}</b>% this round</div>
          <div className="ws-coach-actions">
            <button className="ws-btn primary sm" onClick={next}>{st.round >= st.total ? "Finish" : "Next →"}</button>
          </div>
        </div>
      ) : done ? (
        <div className="ws-coach-summary">
          <div className="ws-coach-band">
            {sum.accuracy >= 90 ? "Sharp ears" : sum.accuracy >= 60 ? "Getting there — a few slipped past" : "Keep at it — ears take reps"}
          </div>
          <div className="ws-coach-score mono"><b>{sum.accuracy}</b>% over {sum.rounds.length} rounds</div>
          {sum.missed.length > 0 && <div className="ws-coach-missed">to revisit: {sum.missed.join(", ")}</div>}
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={begin}>↻ Try again</button>
            <button className="ws-btn primary sm" onClick={() => onLog({ accuracy: sum.accuracy, missed: sum.missed })}>Log it →</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
