import { useEffect, useState } from "react";
import { detectPitchDetailed, detectPitchSpectral, rms, spectralCentroid, createOnsetTracker } from "../audio/dsp.js";
import { makeFrame } from "./features.js";

// Microphone shell for Loom. Feature extraction stays in the pure DSP modules;
// this hook only owns browser audio resources and assembles live frames.
export function useLoomInput({ enabled, instrument }) {
  const [frame, setFrame] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false, stream = null, context = null, raf = null;

    if (!enabled) {
      setRunning(false);
      setFrame(null);
      setError(null);
      return undefined;
    }

    const start = async () => {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("This browser doesn't support microphone access.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false },
        });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }

        context = new (window.AudioContext || window.webkitAudioContext)();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const timeData = new Float32Array(analyser.fftSize);
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const tracker = createOnsetTracker();
        const detector = instrument === "accordion" ? detectPitchSpectral : detectPitchDetailed;

        const loop = () => {
          analyser.getFloatTimeDomainData(timeData);
          const detected = detector(timeData, context.sampleRate);
          const level = rms(timeData);
          analyser.getByteFrequencyData(freqData);
          const centroid = spectralCentroid(freqData, context.sampleRate, analyser.fftSize);
          const t = performance.now();
          const next = makeFrame(t, detected.freq > 0 ? detected : null, level, centroid);
          next.onset = tracker.step(level, t);
          setFrame(next);
          raf = requestAnimationFrame(loop);
        };

        setRunning(true);
        raf = requestAnimationFrame(loop);
      } catch (e) {
        if (stream) stream.getTracks().forEach((track) => track.stop());
        if (context && context.state !== "closed") context.close();
        stream = null; context = null;
        if (!cancelled) {
          setRunning(false);
          setError(e && e.name === "NotAllowedError" ? "Microphone permission was denied." : "Couldn't access the microphone.");
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (context && context.state !== "closed") context.close();
      setRunning(false);
    };
  }, [enabled, instrument]);

  return { frame, running, error };
}
