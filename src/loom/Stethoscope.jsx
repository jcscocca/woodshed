import React, { useEffect, useRef, useState } from "react";
import { noteFromFrequency } from "../audio/dsp.js";
import { COLOR_HEX, INSTRUMENTS } from "../seed.js";
import { CALIBRATION, estimateOffset, loadOffset, saveOffset } from "./latency.js";
import { useLoomInput } from "./useLoomInput.js";

const INSTRUMENT_KEYS = ["piano", "guitar", "bass", "accordion"];

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const drawSparkline = (canvas, points, color, maxValue) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(243,238,229,.09)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, height - 0.5); ctx.lineTo(width, height - 0.5); ctx.stroke();
  if (!points.length) return;

  const end = points[points.length - 1].t;
  const start = end - 10000;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  let drawing = false;
  for (const point of points) {
    if (point.value == null) { drawing = false; continue; }
    const x = Math.max(0, Math.min(width, (point.t - start) / 10000 * width));
    const y = height - 2 - Math.max(0, Math.min(1, point.value / maxValue)) * (height - 4);
    if (drawing) ctx.lineTo(x, y); else { ctx.moveTo(x, y); drawing = true; }
  }
  ctx.stroke();
};

export default function Stethoscope({ initialInstrument = "piano", metronomePlaying = false, beatTimesRef, onClose }) {
  const [instrument, setInstrument] = useState(INSTRUMENT_KEYS.includes(initialInstrument) ? initialInstrument : "piano");
  const { frame, running, error } = useLoomInput({ enabled: true, instrument });
  const [onsetLit, setOnsetLit] = useState(false);
  const [offset, setOffset] = useState(loadOffset);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationStatus, setCalibrationStatus] = useState("");

  const levelCanvas = useRef(null), clarityCanvas = useRef(null);
  const levelHistory = useRef([]), clarityHistory = useRef([]), onsetTimes = useRef([]);
  const onsetTimer = useRef(null), calibration = useRef(null), calibrationAudio = useRef(null), calibrationTimers = useRef([]);

  useEffect(() => {
    levelHistory.current = [];
    clarityHistory.current = [];
    onsetTimes.current = [];
    drawSparkline(levelCanvas.current, [], COLOR_HEX[instrument], 0.25);
    drawSparkline(clarityCanvas.current, [], COLOR_HEX[instrument], 1);
  }, [instrument]);

  useEffect(() => {
    if (!frame) return;
    levelHistory.current = [...levelHistory.current.filter((p) => frame.t - p.t <= 10000), { t: frame.t, value: frame.level }];
    clarityHistory.current = [...clarityHistory.current.filter((p) => frame.t - p.t <= 10000), { t: frame.t, value: frame.midi == null ? null : frame.clarity }];
    drawSparkline(levelCanvas.current, levelHistory.current, COLOR_HEX[instrument], 0.25);
    drawSparkline(clarityCanvas.current, clarityHistory.current, COLOR_HEX[instrument], 1);

    if (frame.onset) {
      onsetTimes.current = [...onsetTimes.current.slice(-63), frame.t];
      if (calibration.current) calibration.current.onsets.push(frame.t);
      setOnsetLit(true);
      clearTimeout(onsetTimer.current);
      onsetTimer.current = setTimeout(() => setOnsetLit(false), 120);
    }
  }, [frame, instrument]);

  useEffect(() => () => {
    clearTimeout(onsetTimer.current);
    calibrationTimers.current.forEach(clearTimeout);
    if (calibrationAudio.current && calibrationAudio.current.state !== "closed") calibrationAudio.current.close();
  }, []);

  const runCalibration = async () => {
    if (!running) { setCalibrationStatus("The microphone isn't ready yet."); return; }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { setCalibrationStatus("Audio playback isn't supported in this browser."); return; }

    calibrationTimers.current.forEach(clearTimeout);
    calibrationTimers.current = [];
    if (calibrationAudio.current && calibrationAudio.current.state !== "closed") await calibrationAudio.current.close();

    const ctx = new AudioContextClass();
    calibrationAudio.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    const lead = 0.12;
    const clickTimes = [];
    const run = { clickTimes, onsets: [] };
    calibration.current = run;
    setCalibrating(true);
    setCalibrationProgress(0);
    setCalibrationStatus("");

    for (let i = 0; i < CALIBRATION.clicks; i++) {
      const time = ctx.currentTime + lead + i * CALIBRATION.intervalMs / 1000;
      clickTimes.push(performance.now() + (time - ctx.currentTime) * 1000);
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.value = 1000;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.35, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
      osc.start(time); osc.stop(time + 0.03);
      calibrationTimers.current.push(setTimeout(() => setCalibrationProgress(i + 1), lead * 1000 + i * CALIBRATION.intervalMs));
    }

    const finishMs = lead * 1000 + (CALIBRATION.clicks - 1) * CALIBRATION.intervalMs + 300;
    calibrationTimers.current.push(setTimeout(() => {
      if (calibration.current !== run) return;
      const result = estimateOffset(run.clickTimes, run.onsets);
      calibration.current = null;
      setCalibrating(false);
      if (result == null) {
        setCalibrationStatus("Couldn't hear enough clicks — try again.");
      } else {
        saveOffset(result);
        setOffset(result);
        setCalibrationStatus(`Saved ${result} ms round-trip offset.`);
      }
      if (ctx.state !== "closed") ctx.close();
    }, finishMs));
  };

  const frequency = frame?.midi == null ? null : 440 * Math.pow(2, (frame.midi - 69) / 12);
  const note = frequency == null ? null : noteFromFrequency(frequency);
  const levelPercent = Math.min(100, (frame?.level || 0) / 0.25 * 100);
  const clarityPercent = (frame?.clarity || 0) * 100;
  const beats = beatTimesRef?.current || [];
  const now = frame?.t ?? performance.now();
  const freshBeats = metronomePlaying && beats.length > 0 && now - beats[beats.length - 1] < 2000;
  const currentOnsets = beats.length ? onsetTimes.current.filter((t) => t >= beats[0] - 250).slice(-16) : [];
  const beatOffsets = currentOnsets.map((onset) => {
    const nearest = beats.reduce((best, beat) => Math.abs(onset - beat) < Math.abs(onset - best) ? beat : best, beats[0]);
    return onset - nearest - (offset ?? 0);
  });
  const beatOffset = median(beatOffsets);
  const beatLabel = beatOffset == null ? "waiting for an onset…"
    : Math.round(beatOffset) === 0 ? "0 ms · on the click"
    : beatOffset < 0 ? `−${Math.abs(Math.round(beatOffset))} ms · early`
    : `+${Math.round(beatOffset)} ms · late`;

  return (
    <div className="ws-loom-inner">
      <div className="ws-practice-head">
        <h2 className="ws-sheet-title" style={{ margin: 0 }}>Loom stethoscope <span className="ws-beta">beta</span></h2>
        <button className="ws-x" onClick={onClose} aria-label="Close Loom stethoscope" autoFocus>✕</button>
      </div>

      <div className="ws-loom-chips" aria-label="Instrument">
        {INSTRUMENT_KEYS.map((key) => (
          <button key={key} className={`ws-loom-chip ${instrument === key ? "on" : ""}`} style={{ "--accent": INSTRUMENTS[key].color }} aria-pressed={instrument === key} onClick={() => setInstrument(key)}>
            <span />{INSTRUMENTS[key].name}
          </button>
        ))}
      </div>

      {error ? <div className="ws-listen-err">{error}</div> : (
        <>
          <div className="ws-loom-live" style={{ "--accent": INSTRUMENTS[instrument].color }}>
            <div className="ws-loom-note" aria-label={note ? `${note.name}${note.octave}, MIDI ${frame.midi.toFixed(1)}` : "No pitch detected"}>
              {note ? <>{note.name}<span>{note.octave}</span><small className="mono">MIDI {frame.midi.toFixed(1)}</small></> : <><b>—</b><small>{running ? "play a note…" : "starting microphone…"}</small></>}
            </div>
            <div className="ws-loom-measures">
              <div className="ws-loom-measure">
                <div><span>Clarity</span><span className="mono">{(frame?.clarity || 0).toFixed(2)}</span></div>
                <div className="ws-loom-meter"><span style={{ width: `${clarityPercent}%` }} /></div>
              </div>
              <div className="ws-loom-measure">
                <div><span>Level</span><span className="mono">{(frame?.level || 0).toFixed(3)}</span></div>
                <div className="ws-loom-meter"><span style={{ width: `${levelPercent}%` }} /></div>
              </div>
              <div className="ws-loom-centroid"><span>Centroid</span><strong className="mono">{Math.round(frame?.centroid || 0)} Hz</strong></div>
              <div className="ws-loom-onset"><span>Onset</span><i className={onsetLit ? "on" : ""} aria-label={onsetLit ? "Onset detected" : "No onset"} /></div>
            </div>
          </div>

          <div className="ws-loom-sparks">
            <div><div className="ws-loom-spark-label"><span>Level</span><span>last 10 seconds</span></div><canvas ref={levelCanvas} width="640" height="60" role="img" aria-label="Level over the last 10 seconds" /></div>
            <div><div className="ws-loom-spark-label"><span>Clarity</span><span>gaps are unpitched</span></div><canvas ref={clarityCanvas} width="640" height="60" role="img" aria-label="Pitch clarity over the last 10 seconds" /></div>
          </div>
        </>
      )}

      <div className="ws-loom-block">
        <div className="ws-loom-block-head"><div><span>Latency calibration</span><strong className="mono">{offset == null ? "not calibrated" : `${offset} ms`}</strong></div><button className="ws-btn ghost sm" onClick={runCalibration} disabled={calibrating || !running}>Calibrate</button></div>
        <p>Plays eight short beeps and measures when the microphone hears them.</p>
        {calibrating && <div className="ws-loom-status mono">listening… {calibrationProgress}/{CALIBRATION.clicks}</div>}
        {!calibrating && calibrationStatus && <div className="ws-loom-status">{calibrationStatus}</div>}
      </div>

      {freshBeats && (
        <div className="ws-loom-block ws-loom-offset">
          <div className="ws-loom-block-head"><div><span>You vs the click</span><strong className="mono">{beatLabel}</strong></div></div>
          {offset == null && <p>(uncalibrated — includes mic delay)</p>}
        </div>
      )}
    </div>
  );
}
