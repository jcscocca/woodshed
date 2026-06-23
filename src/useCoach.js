import { useRef, useState, useCallback, useEffect } from "react";
import { detectPitchDetailed, rms } from "./audio/dsp.js";
import { midiToFreq } from "./audio/notes.js";
import { createNoteStream, gradeLine, gradeArpeggio } from "./coach.js";

// Mic listener for coaching: a thin shell (getUserMedia + rAF) around the pure
// coach core. Given an exercise's { mode, targets } and octave policy, it grades
// live and exposes the running result. Same honest scope as the tuner: one clear
// note at a time. Detection is clamped to the exercise's pitch span (cheap, and
// it keeps out-of-range octave artifacts from registering).
export function useCoach({ mode, targets, octaveStrict }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { results, cursor, accuracy, done, missed, lastHeard }

  const ac = useRef(null), analyser = useRef(null), stream = useRef(null), raf = useRef(null), buf = useRef(null);
  const streamer = useRef(null), events = useRef([]);

  const pitched = targets.filter((t) => !t.muted).map((t) => t.midi);
  const minF = midiToFreq(Math.min(...pitched) - 3);
  const maxF = midiToFreq(Math.max(...pitched) + 3);

  const grade = () => (mode === "arpeggio" ? gradeArpeggio(targets, events.current) : gradeLine(targets, events.current, { octaveStrict }));

  const loop = () => {
    const a = analyser.current;
    if (!a || !ac.current) return;
    a.getFloatTimeDomainData(buf.current);
    const { freq, clarity } = detectPitchDetailed(buf.current, ac.current.sampleRate, { minF, maxF });
    const ev = streamer.current.push({ freq, clarity, level: rms(buf.current), t: performance.now() });
    if (ev) { events.current = [...events.current, ev]; setResult(grade()); }
    raf.current = requestAnimationFrame(loop);
  };

  const start = useCallback(async () => {
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
  }, [mode, octaveStrict, targets]);

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
