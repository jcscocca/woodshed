import React from "react";
import { useDialog } from "./useDialog.js";
import { useListener } from "./useListener.js";
import { usePractice } from "./PracticeProvider.jsx";
import PracticeTools from "./PracticeTools.jsx";

/* ----------------------- practice tools (metronome + timer) ----------------------- */
export function PracticeSheet({ onClose, onOpenListen }) {
  const { metro } = usePractice();
  const close = () => { metro.stop(); onClose(); };
  const dlgRef = useDialog(close);

  return (
    <div className="ws-sheet-wrap ws-practice-wrap">
      <div className="ws-sheet ws-practice" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Practice tools" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <div className="ws-practice-head">
          <h2 className="ws-sheet-title" style={{ margin: 0 }}>Practice</h2>
          <button className="ws-x" onClick={close} aria-label="Close">✕</button>
        </div>
        <PracticeTools />
        <button className="ws-listen-open" onClick={() => { metro.stop(); onOpenListen(); }}>
          <span className="ws-listen-dot" /> Tuner <span className="ws-beta">beta</span>
        </button>
      </div>
    </div>
  );
}

/* ----------------------- tuner (beta) ----------------------- */
export function ListenPanel() {
  const l = useListener();
  const cents = l.note?.cents ?? 0;
  const clamped = Math.max(-50, Math.min(50, cents));
  const inTune = l.note && Math.abs(cents) <= 5;

  if (l.error) return <div className="ws-listen-err">{l.error}</div>;
  if (!l.listening)
    return (
      <div className="ws-listen-intro">
        <p>Uses your microphone to show pitch. It works best on single, clearly-sounding notes — tuning a string, or a monophonic line. Chords are unreliable here.</p>
        <button className="ws-btn primary" onClick={l.start}>Start listening</button>
      </div>
    );
  return (
    <>
      <div className="ws-tuner">
        <div className={`ws-tuner-note ${inTune ? "in" : ""}`} aria-live="polite" aria-label={l.note ? `${l.note.name}${l.note.octave}, ${cents > 0 ? "+" : ""}${cents} cents${inTune ? ", in tune" : ""}` : "no note detected"}>
          {l.note ? <>{l.note.name}<span className="ws-tuner-oct">{l.note.octave}</span></> : <span className="ws-tuner-idle">—</span>}
        </div>
        <div className="ws-tuner-meter" role="img" aria-label={l.note ? (inTune ? "In tune" : cents > 0 ? "Sharp" : "Flat") : "Tuning meter"}>
          <div className="ws-tuner-center" />
          {l.note && <div className={`ws-tuner-needle ${inTune ? "in" : ""}`} style={{ left: `${50 + clamped}%` }} />}
        </div>
        <div className="ws-tuner-cents mono">{l.note ? `${cents > 0 ? "+" : ""}${cents}¢ · ${Math.round(l.freq)} Hz` : "play a note…"}</div>
      </div>
      <button className="ws-btn ghost full" onClick={l.stop}>Stop listening</button>
    </>
  );
}

export function ListenSheet({ onClose }) {
  const dlgRef = useDialog(onClose);
  return (
    <div className="ws-sheet-wrap ws-practice-wrap">
      <div className="ws-sheet ws-practice" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Tuner" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <div className="ws-practice-head">
          <h2 className="ws-sheet-title" style={{ margin: 0 }}>Tuner <span className="ws-beta">beta</span></h2>
          <button className="ws-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <ListenPanel />
      </div>
    </div>
  );
}
