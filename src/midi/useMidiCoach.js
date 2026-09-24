import { useRef, useState, useCallback, useEffect } from "react";
import { useMidi } from "./MidiProvider.jsx";
import { toNoteEvent, groupChords } from "./midiModel.js";
import { gradeLine, gradeArpeggio, gradeChords, evenness, touchEvenness } from "../coach.js";

// Hands together: each hand's touch on its own (a chord's lowest note is the left
// hand, its highest the right), reporting the worse hand.
function handsTouch(chords, events) {
  const lh = [], rh = [];
  let k = 0;
  for (const c of chords) {
    const notes = events.slice(k, (k += c.peaks.length)); // groupChords keeps one peak per event, in order
    lh.push(notes.reduce((a, b) => (b.midi < a.midi ? b : a)));
    rh.push(notes.reduce((a, b) => (b.midi > a.midi ? b : a)));
  }
  const l = touchEvenness(lh), r = touchEvenness(rh);
  return l && r && (l.cv >= r.cv ? l : r);
}

// useCoach's API fed by the keyboard: every note-on is one event (no stabilizer —
// MIDI pitch is exact). Chord targets (hands together) grade the notes struck
// together, via groupChords; a keyboard block shape is rolled, so it grades in order.
export function useMidiCoach({ mode, targets, octaveStrict }) {
  const midi = useMidi();
  const status = midi ? midi.status : "off";
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const off = useRef(null), events = useRef([]);

  const compute = () => {
    const ev = events.current, chords = mode === "chords" && groupChords(ev);
    const graded = chords ? gradeChords(targets, chords) : mode === "arpeggio" ? gradeArpeggio(targets, ev) : gradeLine(targets, ev, { octaveStrict });
    // timing reads the gaps between chords, not the few ms inside one
    return { ...graded, timing: evenness(chords || ev), touch: chords ? handsTouch(chords, ev) : touchEvenness(ev) };
  };

  // The handler captures compute from the render that called start(), as in useCoach.
  const start = useCallback(() => {
    if (off.current) return; // already listening (the ref is set synchronously; the state isn't)
    setError(null); events.current = []; setResult(compute());
    if (status !== "connected") { setError("Connect your keyboard to coach this."); return; }
    off.current = midi.subscribe((m) => {
      if (m.type !== "on") return;
      events.current = [...events.current, toNoteEvent(m)];
      setResult(compute());
    });
    setListening(true);
  }, [midi, mode, octaveStrict, targets]);

  const teardown = () => { if (off.current) off.current(); off.current = null; };
  const stop = useCallback(() => { teardown(); setListening(false); }, []);
  const reset = useCallback(() => { events.current = []; setResult(compute()); }, [mode, targets, octaveStrict]);

  useEffect(() => { if (listening && status !== "connected") { stop(); setError("Keyboard disconnected."); } }, [listening, status]);
  useEffect(() => () => teardown(), []);

  return { listening, error, result: result || compute(), start, stop, reset };
}
