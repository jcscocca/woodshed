import React, { useEffect, useState } from "react";
import { usePractice } from "./PracticeProvider.jsx";
import { toggleWatch, elapsedSec, RESET_WATCH } from "./stopwatch.js";
import { useRun } from "./score/useRun.js";

export default function PracticeTools({ hints = false, compact = false, stopwatchExtra = null }) {
  const { metro: m, watch, setWatch } = usePractice();
  const [, tick] = useState(0);
  const running = watch.startedAt != null;
  // a live play-along run owns the metronome
  const { state, play } = useRun().run, locked = !!play && (state === "countin" || state === "running");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  const sec = elapsedSec(watch);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <>
      <div className="ws-metro">
        <div className="ws-beatdots">
          {Array.from({ length: m.beatsPer }).map((_, i) => (
            <span key={i} className={`ws-beatdot ${i === 0 ? "accent" : ""} ${m.beat === i ? "on" : ""}`} />
          ))}
        </div>
        <div className="ws-bpm"><span className="mono ws-bpm-num">{m.bpm}</span><span className="ws-bpm-label">bpm</span></div>
        <input className="ws-bpm-range" type="range" min="40" max="240" value={m.bpm} disabled={locked}
          onChange={(e) => m.setBpm(Number(e.target.value))} aria-label="Tempo" />
        <div className="ws-metro-row">
          <button className="ws-round" disabled={locked} onClick={() => m.setBpm(Math.max(40, m.bpm - 1))} aria-label="Slower">−</button>
          <button className={`ws-btn ${m.playing ? "ghost" : "primary"} ws-metro-go`} disabled={locked} onClick={m.playing ? m.stop : m.start}>
            {m.playing ? "Stop" : "Start"}
          </button>
          <button className="ws-round" disabled={locked} onClick={() => m.setBpm(Math.min(240, m.bpm + 1))} aria-label="Faster">+</button>
        </div>
        {hints && <div className="ws-hint-keys"><kbd className="ws-kbd">Space</kbd> start / stop · <kbd className="ws-kbd">← →</kbd> tempo</div>}
        <div className="ws-metro-row2">
          <button className="ws-chip" disabled={locked} onClick={m.tap}>Tap tempo{hints && <kbd className="ws-kbd" aria-hidden="true">T</kbd>}</button>
          <div className="ws-sig">
            {[2, 3, 4].map((n) => (
              <button key={n} className={`ws-sig-btn ${m.beatsPer === n ? "on" : ""}`} aria-pressed={m.beatsPer === n} aria-label={`${n} beats per bar`} disabled={locked} onClick={() => m.setBeatsPer(n)}>{n}/4</button>
            ))}
          </div>
        </div>
      </div>

      <div className={compact ? "ws-stop ws-stop-compact" : "ws-stop"}>
        <div className="ws-stop-time mono">{compact && <span aria-hidden="true">⏱ </span>}{mm}:{ss}</div>
        <div className="ws-stop-row">
          <button className="ws-btn ghost sm" onClick={() => setWatch(toggleWatch)}>{running ? "Pause" : sec > 0 ? "Resume" : "Start"}{hints && <kbd className="ws-kbd" aria-hidden="true">S</kbd>}</button>
          <button className="ws-btn ghost sm" onClick={() => setWatch(RESET_WATCH)}>Reset</button>
          {stopwatchExtra}
        </div>
        {!compact && <p className="ws-stop-note">Time your session here, then enter the minutes when you log.</p>}
      </div>
    </>
  );
}
