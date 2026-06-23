// Web Audio demo synth for lessons. Oscillator-based — no audio files.
// One lazily-created AudioContext (needs a user gesture to start).
let ctx = null;
const live = new Set();

const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };

function pluck(ac, freq, t, dur, gain = 0.18) {
  const osc = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  lp.type = "lowpass";
  lp.frequency.value = Math.min(4000, freq * 6);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(lp); lp.connect(g); g.connect(ac.destination);
  osc.start(t); osc.stop(t + dur + 0.05);
  live.add(osc); osc.onended = () => live.delete(osc);
}

export function stop() {
  for (const o of live) { try { o.stop(); } catch {} }
  live.clear();
}

// voices: array of freq-arrays. Each voice is one bar of two beats; its notes
// are strummed (slightly staggered). For chord progressions.
export function playChords(voices, { bpm = 70 } = {}) {
  stop();
  const ac = getCtx(); if (ac.state === "suspended") ac.resume();
  const bar = (60 / bpm) * 2;
  let t = ac.currentTime + 0.06;
  for (const v of voices) { v.forEach((f, i) => pluck(ac, f, t + i * 0.025, bar * 0.95)); t += bar; }
  return (t - ac.currentTime) * 1000;
}

// voices: array of freq-arrays, one note each, played one per beat. For scales.
export function playSequence(voices, { bpm = 80 } = {}) {
  stop();
  const ac = getCtx(); if (ac.state === "suspended") ac.resume();
  const beat = 60 / bpm;
  let t = ac.currentTime + 0.06;
  for (const v of voices) { pluck(ac, v[0], t, beat * 0.9); t += beat; }
  return (t - ac.currentTime) * 1000;
}

// A bar of metronome clicks at bpm, for prescribe-only drills.
export function playClick({ bpm = 80, beats = 8 } = {}) {
  stop();
  const ac = getCtx(); if (ac.state === "suspended") ac.resume();
  const beat = 60 / bpm;
  let t = ac.currentTime + 0.06;
  for (let i = 0; i < beats; i++) {
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.frequency.value = i % 4 === 0 ? 1500 : 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.06);
    live.add(osc); osc.onended = () => live.delete(osc);
    t += beat;
  }
  return (t - ac.currentTime) * 1000;
}
