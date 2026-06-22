import { useRef, useState, useEffect, useCallback } from "react";

// A sample-accurate metronome. The trick (per the classic "Tale of Two Clocks"
// pattern): a coarse setInterval wakes up often and schedules click sounds a
// little ahead of time against the AudioContext's own clock, which is precise.
// setInterval alone drifts and stutters; this does not.
export function useMetronome(initialBpm = 90, initialBeats = 4) {
  const [bpm, setBpm] = useState(initialBpm);
  const [beatsPer, setBeatsPer] = useState(initialBeats);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(-1); // which beat is sounding now (for the flash)

  const ac = useRef(null);
  const nextNote = useRef(0);
  const counter = useRef(0);
  const tickInterval = useRef(null);
  const raf = useRef(null);
  const queue = useRef([]); // {beat, time} waiting to be shown
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beatsPer);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsRef.current = beatsPer; }, [beatsPer]);

  const click = (beatNumber, time) => {
    const ctx = ac.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const accent = beatNumber % beatsRef.current === 0;
    osc.frequency.value = accent ? 1600 : 1000;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.6 : 0.32, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.06);
    queue.current.push({ beat: beatNumber % beatsRef.current, time });
  };

  const schedule = () => {
    const ctx = ac.current;
    if (!ctx) return;
    while (nextNote.current < ctx.currentTime + 0.1) {
      click(counter.current, nextNote.current);
      nextNote.current += 60 / bpmRef.current;
      counter.current += 1;
    }
  };

  const draw = () => {
    const ctx = ac.current;
    if (!ctx) return;
    while (queue.current.length && queue.current[0].time <= ctx.currentTime) {
      setBeat(queue.current[0].beat);
      queue.current.shift();
    }
    raf.current = requestAnimationFrame(draw);
  };

  const start = useCallback(() => {
    if (!ac.current) ac.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.current.state === "suspended") ac.current.resume();
    counter.current = 0;
    queue.current = [];
    nextNote.current = ac.current.currentTime + 0.06;
    tickInterval.current = setInterval(schedule, 25);
    raf.current = requestAnimationFrame(draw);
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    clearInterval(tickInterval.current);
    cancelAnimationFrame(raf.current);
    tickInterval.current = null;
    queue.current = [];
    setBeat(-1);
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (tickInterval.current) stop();
    else start();
  }, [start, stop]);

  // tap a steady pulse to set the tempo
  const taps = useRef([]);
  const tap = useCallback(() => {
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      setBpm(Math.max(40, Math.min(240, Math.round(60000 / avg))));
    }
  }, []);

  // clean up if the component using this unmounts mid-play
  useEffect(() => () => {
    clearInterval(tickInterval.current);
    cancelAnimationFrame(raf.current);
    if (ac.current && ac.current.state !== "closed") ac.current.close();
  }, []);

  return { bpm, setBpm, beatsPer, setBeatsPer, playing, beat, start, stop, toggle, tap };
}
