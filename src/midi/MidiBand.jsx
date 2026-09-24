import React, { useEffect, useRef, useState } from "react";
import { useMidi, useOverlay } from "./MidiProvider.jsx";
import { createKeyState } from "./midiModel.js";
import { nameChord, spellChord, ROOTS } from "./chords.js";
import { midiToNote } from "../audio/notes.js";

// A0–C8: 52 white keys by percentage; a black key straddles its left white key's right edge.
const W = 100 / 52;
const KEYS = [];
for (let m = 21, w = 0; m <= 108; m++) {
  if ([1, 3, 6, 8, 10].includes(m % 12)) KEYS.push({ m, black: true, left: (w - 0.3) * W, width: 0.6 * W });
  else KEYS.push({ m, black: false, left: w++ * W, width: W });
}

// a spelled note's octave follows its letter: Cb4 is MIDI 59, B#3 is MIDI 60
const withOctave = (name, m) => `${name}${midiToNote(m + (name[1] === "b" ? name.length - 1 : 1 - name.length)).octave}`;

function Keys({ label, held, ov }) {
  const mark = {};
  if (!ov.hideTargets) ov.targets.forEach((t, i) => {
    const k = mark[t.midi] || (mark[t.midi] = { finger: t.finger });
    if (ov.next.includes(i)) { k.next = true; if (t.finger) k.finger = t.finger; }
    const s = ov.statuses && ov.statuses[i];
    if (s === "missed" || (s === "caught" && !k.status)) k.status = s;
  });
  const vel = new Map(held.map((h) => [h.note, h.velocity]));
  const key = (m) => KEYS[Math.min(108, Math.max(21, m)) - 21];
  const range = !ov.hideTargets && ov.range && [key(ov.range[0]), key(ov.range[1])];
  return (
    <div className="ws-midi-keys" role="img" aria-label={`Keyboard: ${label ? `${label} held` : "nothing held"}`}>
      {KEYS.map(({ m, black, left, width }) => {
        const k = mark[m], v = vel.get(m);
        return (
          <div
            key={m}
            className={["ws-midi-key", black && "b", k && "t", k && k.next && "next", k && k.status].filter(Boolean).join(" ")}
            style={{ left: `${left}%`, width: `${width}%`, backgroundColor: v && `color-mix(in srgb, var(--gold) ${Math.round(45 + 55 * v / 127)}%, ${black ? "#211e1a" : "#d8d0c0"})` }}
          >
            {k && k.finger ? <span className="ws-midi-finger">{k.finger}</span> : null}
            {m % 12 === 0 && <span className={`ws-midi-c ${m === 60 ? "c4" : ""}`}>C{m / 12 - 1}</span>}
          </div>
        );
      })}
      {range && <div className="ws-midi-range" style={{ left: `${range[0].left}%`, width: `${range[1].left + range[1].width - range[0].left}%` }} />}
    </div>
  );
}

// The keyboard band under the desktop layout: 88 keys lit by velocity, and a
// readout under the rail. Held keys live here, so playing never re-renders App.
export default function MidiBand() {
  const midi = useMidi();
  const ov = useOverlay();
  const [held, setHeld] = useState([]);
  const connected = !!midi && midi.status === "connected";
  const subscribe = midi && midi.subscribe, setBandOpen = midi && midi.setBandOpen;
  const open = connected && midi.bandOpen;
  const chev = useRef(null), refocus = useRef(false);

  useEffect(() => {
    if (!connected) return;
    const keys = createKeyState();
    const off = subscribe((m) => { if (m.type !== "pedal") { keys.apply(m); setHeld(keys.held()); } });
    return () => { off(); setHeld([]); };
  }, [connected, subscribe]);

  useEffect(() => { if (connected) setBandOpen(true); }, [connected, setBandOpen]);

  // the chevron is a different button open vs collapsed; keep focus on it across its own toggle
  useEffect(() => { if (refocus.current && chev.current) chev.current.focus(); refocus.current = false; }, [open]);

  if (!midi || midi.status === "unsupported") return null;
  const notes = held.map((h) => h.note);
  const chord = nameChord(notes);
  const names = spellChord(notes) || notes.map((m) => ROOTS[((m % 12) + 12) % 12]);
  const named = names.map((n, i) => withOctave(n, notes[i])).join(" ");
  const head = (ov.readout && ov.readout.head) || chord || named || "—";
  const toggle = (e) => { refocus.current = e.currentTarget === document.activeElement; setBandOpen((o) => !o); };
  const device = <span className="ws-midi-device"><span className="ws-midi-dot">●</span> {midi.deviceName}{open ? "" : ` · ${head} ·`}</span>;
  return (
    <div className={`ws-midi-band ${open ? "" : "collapsed"}`}>
      {open && <Keys label={named} held={held} ov={ov} />}
      <div className="ws-midi-readout">
        {open ? (
          <>
            <div className="ws-midi-head">{head}</div>
            <div className="ws-midi-line mono">{(ov.readout && ov.readout.line) || [...new Set(names)].join(" ")}</div>
            <div className="ws-midi-row">
              <button className="ws-btn ghost sm" onClick={midi.playLastTake}>▶ Play back</button>
              {device}
              <button className="ws-x" ref={chev} onClick={toggle} aria-label="Hide keyboard" aria-expanded="true">⌄</button>
            </div>
          </>
        ) : connected ? (
          <>
            {device}
            <button className="ws-x" onClick={midi.playLastTake} aria-label="Play back">▶</button>
            <button className="ws-x" ref={chev} onClick={toggle} aria-label="Show keyboard" aria-expanded="false">⌃</button>
          </>
        ) : midi.status === "disconnected" ? (
          <span className="ws-midi-off">○ Keyboard disconnected</span>
        ) : (
          <>
            <button className="ws-btn ghost sm" onClick={midi.connect}>Connect keyboard</button>
            {midi.status === "denied" && <span className="ws-midi-off">— allow MIDI in the site settings</span>}
          </>
        )}
        <div className="ws-midi-live" aria-live="polite">{chord}</div>
      </div>
    </div>
  );
}
