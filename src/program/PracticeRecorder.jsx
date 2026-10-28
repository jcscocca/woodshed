import React, { useEffect, useId, useRef, useState } from "react";
import { createPracticeRecorder, recordingFilename, RECORDING_ACTIVE } from "./recording.js";
import "./recorder.css";

const duration = (ms) => { const s = Math.floor(Math.max(0, ms) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

// Optional learner review, independent of the score and assessment. The take is
// deliberately not passed to onLog or saved with progress.
export default function PracticeRecorder({ onBeforeRecord, onActivityChange, onStop, disabled = false, fileName = "woodshed-practice" }) {
  const id = useId(), controller = useRef(null), audio = useRef(null), callbacks = useRef({});
  callbacks.current = { onBeforeRecord, onActivityChange, onStop };
  const [state, setState] = useState(null), [reviewed, setReviewed] = useState(false);
  const active = useRef(false);

  useEffect(() => {
    // Create per effect lifetime so StrictMode's setup/cleanup/setup cycle does
    // not leave a permanently closed controller in component state.
    const recorder = createPracticeRecorder();
    controller.current = recorder;
    const update = () => {
      const next = recorder.getSnapshot(), busy = RECORDING_ACTIVE.has(next.status);
      setState(next);
      if (busy !== active.current) { active.current = busy; callbacks.current.onActivityChange?.(busy); }
    };
    const off = recorder.subscribe(update);
    update();
    return () => {
      off(); audio.current?.pause(); recorder.close();
      if (controller.current === recorder) controller.current = null;
      if (active.current) { active.current = false; callbacks.current.onActivityChange?.(false); }
    };
  }, []);

  useEffect(() => { if (disabled) audio.current?.pause(); }, [disabled]);

  const busy = !!state && RECORDING_ACTIVE.has(state.status);
  const record = () => {
    if (disabled || !controller.current || busy) return;
    audio.current?.pause(); setReviewed(false);
    void controller.current.start({
      beforeStart: () => callbacks.current.onBeforeRecord?.(),
      onStop: (result) => callbacks.current.onStop?.(result),
    });
  };
  const discard = () => { audio.current?.pause(); controller.current?.discard(); setReviewed(false); };
  const status = !state ? "Preparing the recorder…" : state.status === "requesting" ? "Waiting for microphone permission…" : state.status === "recording" ? "Recording your practice" : state.status === "stopping" ? "Finishing your take; the microphone is off…" : state.take ? "Your take is ready to review" : "Record a short attempt when you want a listening check";

  return <section className="ws-recorder" aria-labelledby={`${id}-title`}>
    <div className="ws-recorder-heading"><h3 id={`${id}-title`}>Hear your own attempt</h3><span className="ws-recorder-optional">Optional · ungraded</span></div>
    <p className="ws-recorder-copy">The microphone opens only when you press Record. Audio stays in this lesson’s memory, with no upload. It is separate from your saved practice log.</p>
    <div className="ws-recorder-status" role="status" aria-live="polite" aria-atomic="true"><span className={state?.status === "recording" ? "ws-recorder-live" : ""}>{status}</span></div>
    <div className="ws-recorder-controls">
      <button type="button" className="ws-player-button" disabled={disabled || !state?.supported || busy} onClick={record}>{state?.take ? "Record another take" : "● Record an attempt"}</button>
      {state?.status === "requesting" && <button type="button" className="ws-player-button" onClick={() => controller.current?.stop()}>Cancel request</button>}
      {(state?.status === "recording" || state?.status === "stopping") && <button type="button" className="ws-player-button" disabled={state.status === "stopping"} onClick={() => controller.current?.stop()}>■ Stop recording</button>}
      {state && <span className="ws-recorder-time" role="timer" aria-label={`Take time ${duration(state.elapsedMs)}, maximum ${duration(state.maxDurationMs)}`}>{duration(state.elapsedMs)} / {duration(state.maxDurationMs)}</span>}
    </div>
    {state?.status === "recording" && <p className="ws-recorder-copy">Stops after {duration(state.maxDurationMs)}. Play one short section, then stop and listen for one specific thing.</p>}
    {state?.limitReached && <p className="ws-recorder-copy">The {duration(state.maxDurationMs)} limit was reached and recording stopped. Review this section before making another take.</p>}
    {state?.error && <p className="ws-player-error" role="alert">{state.error}</p>}
    {state?.take && <div className="ws-recorder-take">
      <p><strong>Your local take · {duration(state.take.durationMs)}</strong></p>
      <audio ref={audio} controls={!busy && !disabled} src={state.take.url} preload="metadata" aria-label="Your recorded practice attempt" onPlay={(event) => { if (busy || disabled) event.currentTarget.pause(); }} onEnded={() => setReviewed(true)} />
      {(busy || disabled) && <p className="ws-recorder-copy">Listen-back is paused while other playback or saving is active.</p>}
      <p className="ws-recorder-copy">{reviewed ? "After listening, note one thing that stayed steady and one change for your next attempt." : "Listen once for the beat through rests, held-note lengths, or the balance between your hands. Choose one focus rather than judging everything at once."}</p>
      <div className="ws-recorder-controls">
        <a className="ws-player-button" href={state.take.url} download={recordingFilename(state.take.mimeType, fileName)}>Download take</a>
        <button type="button" className="ws-player-button" disabled={busy} onClick={discard}>Discard take</button>
      </div>
      <p className="ws-recorder-copy ws-recorder-retention">Download before closing this lesson if you want to keep the audio. Saving practice records your assessment and notes; it does not save this take.</p>
    </div>}
  </section>;
}
