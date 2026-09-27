// A chord chart written out as two-voice ABC, pure: chords + a pattern (and, for a lead
// sheet, a melody in place of the right hand) -> a score the engine grades like any other.
import { parseChordLine, above } from "./chords.js";
import { PATTERNS, closeVoicings, pickVoicing } from "./patterns.js";

const NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ORDER = { 1: "FCGDAEB", "-1": "BEADGCF" };
const FIFTHS = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, "F#": 6, "C#": 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
const RELATIVE = { Am: "C", Em: "G", Bm: "D", "F#m": "A", "C#m": "E", "G#m": "B", Dm: "F", Gm: "Bb", Cm: "Eb", Fm: "Ab", Bbm: "Db", Ebm: "Gb" };
const ACC = { "-2": "__", "-1": "_", 0: "=", 1: "^", 2: "^^" };

// letter -> +1 / -1 for the key's sharps or flats
export function keySignature(key) {
  const n = FIFTHS[RELATIVE[key] || key];
  if (n === undefined) throw new Error(`unknown key: ${key}`);
  const sig = {};
  for (let i = 0; i < Math.abs(n); i++) sig[ORDER[Math.sign(n)][i]] = Math.sign(n);
  return sig;
}

// One pitch in ABC. An accidental is written when the key signature would give another
// pitch, and for every later note of that letter in the bar once one has been written.
function pitch(n, sig, bar) {
  const explicit = n.acc !== (sig[n.letter] || 0) || bar.has(n.letter);
  if (explicit) bar.add(n.letter);
  const oct = (n.midi - NAT[n.letter] - n.acc) / 12 - 1;
  const name = oct >= 5 ? n.letter.toLowerCase() + "'".repeat(oct - 5) : n.letter + ",".repeat(4 - oct);
  return (explicit ? ACC[n.acc] : "") + name;
}

const dur = (e) => (e === 1 ? "" : String(e));

function token(slot, e, v) {
  if (slot === "rest") return `z${dur(e)}`;
  const notes = slot === "chord" ? v.rh.notes : slot === "lhchord" ? v.lhChord.notes : typeof slot === "number" ? [v.rh.notes[slot]] : [v.lh[slot]];
  const text = notes.map((n) => pitch(n, v.sig, v.bar)).join("");
  return (notes.length > 1 ? `[${text}]` : text) + dur(e);
}

// Left-hand single notes: the root (or slash bass) between C2 and B2, and the chord's
// fifth, the octave and the root's sixth above it.
function lhNotes(chord) {
  const b = chord.bass || chord.root, root = { ...b, midi: 36 + b.pc };
  const up = (t) => { let m = root.midi + 1; while (m % 12 !== t.pc) m++; return { ...t, midi: m }; };
  return { root, fifth: up(chord.tones[2]), octave: { ...b, midi: root.midi + 12 }, sixth: up(above(chord.root, 9, 5)) };
}

// eighths joined into beats, a space at each beat and around longer notes
function join(tokens) {
  let pos = 0, s = "";
  for (const t of tokens) { if (s && (pos % 2 === 0 || t.len > 1)) s += " "; s += t.text; pos += t.len; }
  return s;
}

export function chartToAbc({ key, meter = "4/4", chords, pattern, melody, title }) {
  const beats = Number(meter.split("/")[0]), p = PATTERNS[pattern];
  if (!p) throw new Error(`unknown pattern: ${pattern}`);
  if (!p.metres.includes(beats)) throw new Error(`${pattern} doesn't fit ${meter}`);
  const parsed = parseChordLine(chords, beats);
  if (parsed.error) throw new Error(parsed.error.message);
  const sig = keySignature(key), lead = !!melody, symbols = lead ? "lh" : "rh";
  const bars = { rh: [], lh: [] };
  let prevRh = null, prevLh = null;
  for (const bar of parsed.bars) {
    const out = { rh: [], lh: [] }, mem = { rh: new Set(), lh: new Set() };
    for (const { chord, beats: b } of bar) {
      const e = b * 2;
      prevRh = pickVoicing(closeVoicings(chord.tones.length > 3 ? chord.tones.slice(1) : chord.tones, 55, 79), prevRh, { rootPosition: !!p.rootPosition });
      prevLh = pickVoicing(closeVoicings(chord.tones.slice(0, 3), 43, 60), prevLh, { anchor: 48 });
      const parts = { rh: lead ? [] : p.rh(e), lh: (lead && p.leadLh ? p.leadLh : p.lh)(e) };
      for (const v of ["rh", "lh"]) parts[v].forEach(([slot, len], i) => {
        const text = token(slot, len, { rh: prevRh, lhChord: prevLh, lh: lhNotes(chord), sig, bar: mem[v] });
        out[v].push({ text: (i === 0 && v === symbols ? `"${chord.name}"` : "") + text, len });
      });
    }
    bars.rh.push(join(out.rh));
    bars.lh.push(join(out.lh));
  }
  const tune = lead ? melody.trim().split("\n").map((l) => l.trim()) : null;
  if (lead && tune.length !== Math.ceil(bars.lh.length / 4)) throw new Error(`the melody has ${tune.length} lines for ${bars.lh.length} bars of chords`);
  const lines = [];
  for (let i = 0; i < bars.lh.length; i += 4) {
    const end = i + 4 >= bars.lh.length ? " |]" : " |";
    lines.push(`[V:1] ${lead ? tune[i / 4] : bars.rh.slice(i, i + 4).join(" | ") + end}`, `[V:2] ${bars.lh.slice(i, i + 4).join(" | ")}${end}`);
  }
  return ["X:1", ...(title ? [`T:${title}`] : []), `M:${meter}`, "L:1/8", `K:${key}`, "%%staves {1 2}", "V:1 clef=treble", "V:2 clef=bass", ...lines].join("\n");
}
