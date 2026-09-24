import { useRef, useState, useCallback, useEffect } from "react";
import { detectPitch, noteFromFrequency } from "./audio/dsp.js";

// Microphone listener: a thin shell around the pure DSP in ./audio/dsp.js.
// It owns the browser bits (getUserMedia, AnalyserNode, the rAF loop) and feeds
// each frame into the shared detectors, so the same logic that runs live can be
// tested headlessly against real recordings. Honest scope is unchanged: pitch is
// reliable for single clear notes, not chords or accordion reeds.
export function useListener() {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null); // { name, octave, cents }
  const [freq, setFreq] = useState(0);

  const ac = useRef(null), analyser = useRef(null), stream = useRef(null), raf = useRef(null), buf = useRef(null);
  const quietFrames = useRef(0), session = useRef(0);

  const loop = () => {
    const a = analyser.current;
    if (!a || !ac.current) return;
    a.getFloatTimeDomainData(buf.current);
    const f = detectPitch(buf.current, ac.current.sampleRate);

    if (f > 0) {
      quietFrames.current = 0;
      setFreq(f);
      setNote(noteFromFrequency(f));
    } else if (++quietFrames.current > 12) {
      setNote(null); setFreq(0);
    }
    raf.current = requestAnimationFrame(loop);
  };

  const start = useCallback(async () => {
    const id = ++session.current; // stop, unmount or a newer start bump this while the mic request is pending
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("This browser doesn't support microphone access.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (id !== session.current) { s.getTracks().forEach((t) => t.stop()); return; }
      stream.current = s;
      ac.current = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.current.createMediaStreamSource(stream.current);
      analyser.current = ac.current.createAnalyser();
      analyser.current.fftSize = 2048;
      buf.current = new Float32Array(analyser.current.fftSize);
      src.connect(analyser.current);
      quietFrames.current = 0;
      setListening(true);
      raf.current = requestAnimationFrame(loop);
    } catch (e) {
      if (id === session.current) setError(e && e.name === "NotAllowedError" ? "Microphone permission was denied." : "Couldn't access the microphone.");
    }
  }, []);

  const stop = useCallback(() => {
    session.current++;
    cancelAnimationFrame(raf.current);
    if (stream.current) stream.current.getTracks().forEach((t) => t.stop());
    if (ac.current && ac.current.state !== "closed") ac.current.close();
    analyser.current = null; ac.current = null; stream.current = null;
    setListening(false); setNote(null); setFreq(0);
  }, []);

  useEffect(() => () => {
    session.current++;
    cancelAnimationFrame(raf.current);
    if (stream.current) stream.current.getTracks().forEach((t) => t.stop());
    if (ac.current && ac.current.state !== "closed") ac.current.close();
  }, []);

  return { listening, error, note, freq, start, stop };
}
