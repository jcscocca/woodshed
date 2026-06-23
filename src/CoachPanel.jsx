import React, { useMemo, useState } from "react";
import { shapeToTargets } from "./audio/notes.js";
import { useCoach } from "./useCoach.js";

const STATUS_CLASS = { caught: "ok", missed: "bad", rang: "warn", "muted-ok": "mute", pending: "" };

// The coaching surface inside the lesson sheet. "Coach me" opens it; the target
// chips light up as you play; a calm summary follows. Restraint by design: the
// only live cue is the pulsing current target and a single hint line.
export default function CoachPanel({ item, lesson, onLog }) {
  const [open, setOpen] = useState(false);
  const { mode, targets } = useMemo(() => shapeToTargets(lesson.shape), [lesson.shape]);
  const octaveStrict = mode === "arpeggio" || item.inst === "piano";
  const coach = useCoach({ mode, targets, octaveStrict });
  const r = coach.result;

  if (!open) {
    return (
      <button className="ws-btn ghost sm ws-coach-open" onClick={() => setOpen(true)}>
        ◉ Coach me
      </button>
    );
  }

  const ended = !coach.listening && r.results.some((x) => x.status !== "pending");
  const band = r.accuracy >= 90 ? "Clean run" : r.accuracy >= 60 ? "Solid run — a couple to clean up" : "Keep at it — this one needs reps";
  const cur = r.cursor;

  return (
    <div className="ws-coach" aria-live="polite">
      <div className="ws-coach-seq" role="img" aria-label={`Coaching ${item.title}`}>
        {r.results.map((x, i) => (
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
            {r.lastHeard ? `hearing ${r.lastHeard.name} · looking for ${targets[cur]?.label ?? "—"}` : r.done ? "done — nice" : "play along…"}
          </div>
          <button className="ws-btn ghost sm full" onClick={coach.stop}>■ Stop</button>
        </>
      ) : ended ? (
        <div className="ws-coach-summary">
          <div className="ws-coach-band">{band}</div>
          <div className="ws-coach-score mono"><b>{r.results.filter((x) => x.status === "caught").length}</b> / {targets.filter((t) => !t.muted).length} clean</div>
          {r.missed.length > 0 && <div className="ws-coach-missed">to revisit: {r.missed.join(", ")}</div>}
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={() => { coach.reset(); coach.start(); }}>↻ Try again</button>
            <button className="ws-btn primary sm" onClick={() => onLog({ accuracy: r.accuracy, missed: r.missed })}>Log it →</button>
          </div>
        </div>
      ) : (
        <button className="ws-btn primary sm full" onClick={coach.start}>● Start</button>
      )}
    </div>
  );
}
