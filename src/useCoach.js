import { useRef, useState, useCallback, useEffect } from "react";
import { detectPitchDetailed, detectPitchSpectral, rms } from "./audio/dsp.js";
import { midiToFreq } from "./audio/notes.js";
import { createNoteStream, gradeLine, gradeArpeggio } from "./coach.js";

// Mic listener for coaching: a thin shell (getUserMedia + rAF) around the pure
// coach core. Given an exercise's { mode, targets } and octave policy, it grades
// live and exposes the running result. Same honest scope as the tuner: one clear
// note at a time. Detection is clamped to the exercise's pitch span (cheap, and
// it keeps out-of-range octave artifacts from registering).
export function useCoach({ mode, targets, octaveStrict, inst }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { results, cursor, accuracy, done, missed, lastHeard }

  const ac = useRef(null), analyser = useRef(null), stream = useRef(null), raf = useRef(null), buf = useRef(null);
  const streamer = useRef(null), events = useRef([]);

  // Clamp detection to the exercise's pitch span (cheap, and keeps out-of-range
  // octave artifacts out). Guard the empty case (a hypothetical all-muted shape).
  const pitched = targets.filter((t) => !t.muted).map((t) => t.midi);
  const minF = pitched.length ? midiToFreq(Math.min(...pitched) - 3) : 80;
  const maxF = pitched.length ? midiToFreq(Math.max(...pitched) + 3) : 1500;
  const detect = inst === "accordion" ? detectPitchSpectral : detectPitchDetailed;

  const grade = () => (mode === "arpeggio" ? gradeArpeggio(targets, events.current) : gradeLine(targets, events.current, { octaveStrict }));

  // loop captures minF/maxF/grade from the render that called start(); safe
  // because targets only change via launch() in CoachPanel, which requires
  // !listening — so the rAF is always torn down before targets change.
  const loop = () => {
    const a = analyser.current;
    if (!a || !ac.current) return;
    a.getFloatTimeDomainData(buf.current);
    const { freq, clarity } = detect(buf.current, ac.current.sampleRate, { minF, maxF });
    const ev = streamer.current.push({ freq, clarity, level: rms(buf.current), t: performance.now() });
    if (ev) { events.current = [...events.current, ev]; setResult(grade()); }
    raf.current = requestAnimationFrame(loop);
  };

  const start = useCallback(async () => {
    if (listening) return; // never open a second mic stream
    setError(null); events.current = []; setResult(grade());
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setError("This browser doesn't support microphone access."); return; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      ac.current = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.current.createMediaStreamSource(stream.current);
      analyser.current = ac.current.createAnalyser();
      analyser.current.fftSize = 2048;
      buf.current = new Float32Array(analyser.current.fftSize);
      src.connect(analyser.current);
      streamer.current = createNoteStream();
      setListening(true);
      raf.current = requestAnimationFrame(loop);
    } catch (e) {
      setError(e && e.name === "NotAllowedError" ? "Microphone permission was denied." : "Couldn't access the microphone.");
    }
  }, [listening, mode, octaveStrict, targets]);

  const teardown = () => {
    cancelAnimationFrame(raf.current);
    if (stream.current) stream.current.getTracks().forEach((t) => t.stop());
    if (ac.current && ac.current.state !== "closed") ac.current.close();
    analyser.current = null; ac.current = null; stream.current = null;
  };
  const stop = useCallback(() => { teardown(); setListening(false); }, []);
  const reset = useCallback(() => { events.current = []; setResult(grade()); }, [mode, targets, octaveStrict]);

  useEffect(() => () => teardown(), []);

  return { listening, error, result: result || grade(), start, stop, reset };
}
