// Piano MIDI, pure: raw messages -> note events, held keys, chords and takes.
import { midiToNote } from "../audio/notes.js";

export function parseMidi(data, t, inputId = "") {
  const status = data[0] & 0xf0, d1 = data[1], d2 = data[2];
  if (status === 0x90 && d2 > 0) return { type: "on", note: d1, velocity: d2, t, inputId };
  if (status === 0x80 || status === 0x90) return { type: "off", note: d1, t, inputId };
  if (status === 0xb0 && d1 === 64) return { type: "pedal", down: d2 >= 64, t, inputId };
  return null;
}

export function createKeyState() {
  const keys = new Map(); // "input:note" -> { note, velocity }
  let pedal = false;
  return {
    apply(m) {
      if (!m) return;
      if (m.type === "on") keys.set(`${m.inputId}:${m.note}`, { note: m.note, velocity: m.velocity });
      else if (m.type === "off") keys.delete(`${m.inputId}:${m.note}`);
      else pedal = m.down;
    },
    held() {
      const byNote = new Map();
      for (const k of keys.values()) byNote.set(k.note, Math.max(byNote.get(k.note) || 0, k.velocity));
      return [...byNote].sort((a, b) => a[0] - b[0]).map(([note, velocity]) => ({ note, velocity }));
    },
    get pedal() { return pedal; },
    clear() { keys.clear(); pedal = false; },
  };
}

export const toNoteEvent = (m) => ({ ...midiToNote(m.note), tStart: m.t, peak: m.velocity / 127 });

export function groupChords(events, windowMs = 60) {
  const out = [];
  for (const e of events) {
    const last = out[out.length - 1];
    if (last && e.tStart - last.tStart <= windowMs) { if (!last.midis.includes(e.midi)) last.midis.push(e.midi); last.peaks.push(e.peak); }
    else out.push({ midis: [e.midi], tStart: e.tStart, peaks: [e.peak] });
  }
  for (const c of out) c.midis.sort((a, b) => a - b);
  return out;
}

// Always-on recorder: raw messages for the last windowMs; lastTake() replays
// them into notes (durations extended by the sustain pedal) and keeps only the
// notes after the last gap of >= gapMs with no key physically held.
export function createTakeBuffer({ windowMs = 60000, gapMs = 3000 } = {}) {
  const log = [];
  let pedalAtStart = false;
  return {
    push(m, now = m && m.t) {
      if (!m) return;
      log.push(m);
      while (log.length && log[0].t < now - windowMs) {
        const evicted = log.shift();
        if (evicted.type === "pedal") pedalAtStart = evicted.down;
      }
    },
    lastTake() {
      const notes = [], open = new Map(), sustained = [];
      let pedal = pedalAtStart;
      const end = (n, t) => { n.dur = t - n.t0; };
      for (const m of log) {
        const k = `${m.inputId}:${m.note}`;
        if (m.type === "on") { const n = { midi: m.note, t0: m.t, dur: 0, velocity: m.velocity, up: Infinity }; notes.push(n); open.set(k, n); }
        else if (m.type === "off") { const n = open.get(k); if (!n) continue; open.delete(k); n.up = m.t; if (pedal) sustained.push(n); else end(n, m.t); }
        else { pedal = m.down; if (!pedal) { for (const n of sustained) end(n, m.t); sustained.length = 0; } }
      }
      const last = log.length ? log[log.length - 1].t : 0;
      for (const n of [...open.values(), ...sustained]) end(n, Math.max(last, n.up === Infinity ? last : n.up));
      let start = 0, heldUntil = -Infinity;
      notes.forEach((n, i) => { if (n.t0 - heldUntil >= gapMs) start = i; heldUntil = Math.max(heldUntil, n.up === Infinity ? last : n.up); });
      const take = notes.slice(start);
      const t0 = take.length ? take[0].t0 : 0;
      return take.map((n) => ({ midi: n.midi, t0: n.t0 - t0, dur: n.dur, velocity: n.velocity }));
    },
  };
}
