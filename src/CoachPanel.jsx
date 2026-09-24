import React, { useEffect, useMemo, useRef, useState } from "react";
import { shapeToTargets, midiToNote } from "./audio/notes.js";
import { useCoach } from "./useCoach.js";
import { useMidiCoach } from "./midi/useMidiCoach.js";
import { useMidi } from "./midi/MidiProvider.jsx";
import { overlay } from "./midi/overlay.js";
import { nameChord } from "./midi/chords.js";

const STATUS_CLASS = { caught: "ok", missed: "bad", rang: "warn", "muted-ok": "mute", pending: "" };
const noteNames = (ms) => ms.map((m) => { const n = midiToNote(m); return `${n.name}${n.octave}`; }).join(" ");

// Statuses per band key, matched by pitch: a hands-together pair marks its
// right-hand key, or both hands' keys once the lesson puts both on the band.
// at[i] lists result i's keys (both hands', for a pair on the band).
function toBand(results, keys) {
  const statuses = keys.map(() => "pending"), at = [], used = new Set();
  results.forEach((x, i) => {
    at[i] = [];
    for (const m of x.target.midis || [x.target.midi]) {
      const j = keys.findIndex((k, n) => k.midi === m && !used.has(n));
      if (j >= 0) { used.add(j); statuses[j] = x.status; at[i].push(j); }
    }
  });
  return { statuses, at };
}

// The coaching surface inside the lesson sheet. "Coach me" opens it; the target
// chips light up as you play; a calm summary follows. Restraint by design: the
// only live cue is the pulsing current target and a single hint line.
export default function CoachPanel({ item, lesson, sessions = [], onLog, source }) {
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState("up");
  const [runToken, setRunToken] = useState(0);
  const base = useMemo(() => shapeToTargets(lesson.shape), [lesson.shape]);
  const mode = base.mode;
  const targets = useMemo(() => (mode === "arpeggio" && dir === "down" ? [...base.targets].reverse() : base.targets), [base, mode, dir]);
  const octaveStrict = mode === "arpeggio" || item.inst === "piano";
  const viaMidi = source === "midi";
  const midi = useMidi();
  const useInput = viaMidi ? useMidiCoach : useCoach; // fixed per mount: LessonBody keys the panel by source
  const coach = useInput({ mode, targets, octaveStrict });
  const r = coach.result;
  // Over MIDI the note to play stays pending until the run ends — a stray only
  // marks it missed provisionally (gradeLine's end-of-attempt rule).
  const shown = viaMidi && coach.listening ? r.results.map((x, i) => (i === r.cursor ? { ...x, status: "pending" } : x)) : r.results;
  const summary = useRef(null);

  // Launch a run only after `dir` (hence `targets`) has settled, so a reversed
  // down-pass never starts against the old order.
  useEffect(() => {
    if (runToken === 0) return;
    if (viaMidi) midi.setBandOpen(true);
    coach.reset();
    coach.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runToken]);
  const launch = (d) => { setDir(d); setRunToken((n) => n + 1); };

  // Over MIDI the band carries the run: hits and misses, the next key, and the readout.
  useEffect(() => {
    if (!viaMidi || runToken === 0) return;
    const keys = overlay.get().targets, { statuses, at } = toBand(shown, keys);
    if (!coach.listening) { overlay.set({ statuses, next: [], readout: null, busy: false }); return; }
    const cur = r.results[r.cursor], next = at[r.cursor] || [], finger = next.length > 0 && keys[next[next.length - 1]].finger;
    const readout = !cur ? null : mode === "chords" ? { head: nameChord(cur.target.midis) || cur.target.label } : {
      head: finger ? `${cur.target.label} · ${finger}` : cur.target.label,
      line: `${r.cursor} / ${r.results.length}`,
    };
    overlay.set({ statuses, next, readout, busy: true });
  }, [r, coach.listening]);
  useEffect(() => { if (viaMidi && coach.listening && r.done) coach.stop(); }, [r.done, coach.listening]);
  useEffect(() => () => { if (viaMidi) overlay.set({ statuses: null, next: [], readout: null, busy: false }); }, []);

  useEffect(() => {
    if (!viaMidi) return;
    const toggle = () => { if (coach.listening) coach.stop(); else { setOpen(true); launch("up"); } };
    window.addEventListener("woodshed:coach", toggle);
    return () => window.removeEventListener("woodshed:coach", toggle);
  }, [coach.listening]);

  const ended = !coach.listening && r.results.some((x) => x.status !== "pending");
  useEffect(() => { if (viaMidi && ended && summary.current) summary.current.scrollIntoView({ block: "nearest" }); }, [ended]);

  // per-string / per-note memory: what this exercise's past coached sessions
  // most often flagged, surfaced as "trouble spots" before you start.
  const trouble = useMemo(() => {
    const counts = {};
    for (const s of sessions) if (s.coached && Array.isArray(s.missed)) for (const m of s.missed) counts[m] = (counts[m] || 0) + 1;
    return Object.entries(counts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
  }, [sessions]);

  if (!open) {
    return (
      <button className="ws-btn ghost sm ws-coach-open" onClick={() => setOpen(true)}>
        ◉ Coach me
      </button>
    );
  }

  const band = r.accuracy >= 90 ? "Clean run" : r.accuracy >= 60 ? "Solid run — a couple to clean up" : "Keep at it — this one needs reps";
  const cur = r.cursor;
  // a wrong chord names what was missing and what didn't belong (a clean skip carries neither)
  const slip = mode === "chords" && r.results[cur - 1];
  const diff = slip && [["missing", slip.missing], ["extra", slip.extra]].filter(([, ms]) => ms && ms.length).map(([k, ms]) => `${k} ${noteNames(ms)}`).join(" · ");

  return (
    <div className="ws-coach" aria-live="polite">
      <div className="ws-coach-seq" role="img" aria-label={`Coaching ${item.title}`}>
        {shown.map((x, i) => (
          <span key={i} className={`ws-coach-chip ${STATUS_CLASS[x.status]} ${coach.listening && i === cur ? "now" : ""}`}>
            {x.target.muted ? "×" : x.target.label}
            {x.target.string != null && !x.target.muted && <small>{x.target.fret === 0 ? "0" : x.target.fret}</small>}
          </span>
        ))}
      </div>

      {coach.error ? (
        <div className="ws-listen-err">{coach.error}</div>
      ) : coach.listening ? (
        <>
          <div className="ws-coach-hint mono">
            {r.lastHeard ? `hearing ${r.lastHeard.name} · looking for ${r.results[cur]?.target.label ?? "—"}` : diff ? `${slip.target.label}: ${diff}` : r.done ? "done — nice" : "play along…"}
          </div>
          <button className="ws-btn ghost sm full" onClick={coach.stop}>■ Stop</button>
        </>
      ) : ended ? (
        <div className="ws-coach-summary" ref={summary}>
          <div className="ws-coach-band">{band}</div>
          <div className="ws-coach-score mono"><b>{r.results.filter((x) => x.status === "caught").length}</b> / {r.results.filter((x) => !x.target.muted).length} clean</div>
          {r.missed.length > 0 && <div className="ws-coach-missed">to revisit: {r.missed.join(", ")}</div>}
          {r.timing && <div className="ws-coach-timing mono">timing: {r.timing.band} · rough</div>}
          {r.touch && <div className="ws-coach-timing mono">touch: {r.touch.band === "uneven" ? "a little uneven" : "even"}</div>}
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={() => launch("up")}>↻ Try again</button>
            {mode === "arpeggio" && dir === "up" && r.done && (
              <button className="ws-btn ghost sm" onClick={() => launch("down")}>↓ once more</button>
            )}
            <button className="ws-btn primary sm" onClick={() => onLog({ accuracy: r.accuracy, missed: r.missed })}>Log it →</button>
          </div>
        </div>
      ) : (
        <div className="ws-coach-start">
          {trouble.length > 0 && <div className="ws-coach-trouble">Trouble spots last time: {trouble.join(", ")}</div>}
          <button className="ws-btn primary sm full" onClick={() => launch("up")}>● Start</button>
        </div>
      )}
    </div>
  );
}
