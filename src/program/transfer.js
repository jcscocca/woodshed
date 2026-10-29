// Bounded transfer studies reuse learned pitches, hand positions and chord
// voicings while changing their order or rhythm. They are new studies, not
// transpositions of repertoire or claims of whole-piece mastery.
import { integratedTransferForExercise, supportsIntegratedTransfer } from "./integratedTransfer.js";
const VERSION = "transfer-v1";
export const TRANSFER_VARIANT_COUNT = 8;
const VARIANTS = TRANSFER_VARIANT_COUNT;
const source = { label: "Original Woodshed transfer material", scope: "A fresh short study of an already-practised skill, in a familiar key." };
const normalVariant = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const grand = (title, right, left, key, unit = "1/4") => `X:1\nT:${title}\nM:4/4\nL:${unit}\nK:${key}\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] ${right.join(" | ")} |]\n[V:2] ${left.join(" | ")} |]`;
const rests = (unit = "1/4") => Array(4).fill(unit === "1/8" ? "z8" : "z4");
const names = { C: "C major", G: "G major", F: "F major", Am: "A minor", D: "D major", A: "A major", E: "E major" };
const DURATION_ORDERS = [[0, 1, 3], [1, 3, 2], [3, 0, 1], [2, 1, 0], [1, 4, 3], [4, 0, 2], [2, 3, 4], [3, 2, 0]];
const PULSE = [[2, 1, 1], [1, 2, 1], [1, 1, 2], [2, 2], [1, 1, 1, 1]];
// Each eighth-note pair occupies one complete beat; no new offbeat held
// figure, tie, rest or dotted duration is introduced in this family.
const EIGHTHS = [[1, 1, 2, 2, 2], [2, 1, 1, 2, 2], [2, 2, 1, 1, 2], [2, 2, 2, 1, 1], [1, 1, 1, 1, 2, 2]];
const ORDER = [[1, 3, 0, 2], [2, 0, 3, 1], [3, 1, 2, 0], [0, 2, 1, 3], [2, 1, 0, 3], [1, 0, 3, 2], [3, 2, 0, 1], [0, 3, 2, 1]];
const MELODY = [[1, 3, 2, 0], [2, 4, 3, 1], [3, 2, 0, 1], [4, 2, 1, 3], [1, 0, 2, 3], [3, 4, 2, 1], [2, 1, 3, 4], [0, 2, 4, 3]];
const singleNote = (note, durations) => durations.map((duration) => `${note}${duration === 1 ? "" : duration}`).join(" ");
const line = (notes, indexes) => indexes.map((index) => notes[index]).join(" ");

// Explicit compatible source IDs avoid assigning an unrelated simpler task
// merely because a broad tag such as pulse occurs on an advanced piece.
const RHYTHM = {
  "rhythm-long-short": { family: "pulse", key: "C", note: "C", pitch: "C4" },
  "f3-rhythm-pulse": { family: "pulse", key: "F", note: "F", pitch: "F4" },
  "rhythm-eighths": { family: "subdivision", key: "C", note: "C", pitch: "C4" },
  "g-rhythm-eighth-walk": { family: "subdivision", key: "G", note: "G", pitch: "G4" },
  "f3-rhythm-eighths": { family: "subdivision", key: "F", note: "F", pitch: "F4" },
};
const READING = {
  "read-bass-neighbors": { key: "C", hands: "L", left: ["A,", "B,", "C", "E"], fingers: "LH A3–B3–C4–E4 uses 5–4–3–1 within the learned A3–E4 position." },
  "read-treble-neighbors": { key: "C", hands: "R", right: ["A,", "B,", "C", "E"], fingers: "RH A3–B3–C4–E4 uses 1–2–3–5 within the learned A3–E4 position." },
  "read-ledger-transfer": { key: "C", hands: "both", right: ["A,", "B,", "C", "E"], left: ["A,", "B,", "C", "E"], fingers: "In the learned A3–E4 position, RH A3/B3/C4/E4 uses 1/2/3/5; LH uses 5/4/3/1. The hands take turns in the same register." },
  "a4-read-home": { key: "Am", hands: "R", right: ["A,", "B,", "C", "E"], fingers: "RH A3/B3/C4/E4 uses 1/2/3/5 in the learned A3–E4 position. A3 is below middle C, not A4." },
  "g-read-f-sharp": { key: "G", hands: "both", right: ["E", "F", "G", "A"], left: ["D,", "E,", "F,", "G,"], fingers: "RH E4/F#4/G4/A4 uses 1/2/3/4. LH D3/E3/F#3/G3 uses 4/3/2/1. F stays sharp in both clefs." },
  "f3-read-signature": { key: "F", hands: "both", right: ["F", "A", "B", "c"], left: ["F,", "A,", "B,", "C"], fingers: "In the learned F five-finger positions, RH F4/A4/Bb4/C5 uses 1/3/4/5; LH F3/A3/Bb3/C4 uses 5/3/2/1. Both written Bs are flat." },
  "a6-read-ledgers": { key: "A", hands: "both", right: ["e", "f", "g", "a"], left: ["G,", "A,", "B,", "C"], fingers: "RH E5/F#5/G#5/A5 uses 1/2/3/4. LH G#3/A3/B3/C#4 uses 4/3/2/1. The hands take turns; release before each planned move." },
};
const COORDINATION = {
  "coord-held-bass": { family: "held-bass", key: "C", right: ["C", "D", "E", "F", "G"], bass: ["C,", "G,,", "C,", "C,"], tonic: 0, fingers: "RH C4–G4 uses 1–2–3–4–5. LH moves between C3 and G2 using a comfortable finger 5 after releasing; no fixed stretch." },
  "g-coord-held-tonic": { family: "held-bass", key: "G", right: ["E", "F", "G", "A", "B"], bass: ["G,,", "D,", "E,", "G,,"], tonic: 2, fingers: "RH E4–B4 uses 1–2–3–4–5, including F#4 on 2 and G4 on 3. LH G2, D3 and E3 use released whole-hand moves with a comfortable finger 5." },
  "f3-coord-held-bass": { family: "held-bass", key: "F", right: ["F", "G", "A", "B", "c"], bass: ["F,", "C,", "B,,", "F,"], tonic: 0, fingers: "RH F4–C5 uses 1–2–3–4–5, with Bb4 on 4. LH F3, C3 and Bb2 use released whole-hand moves with a comfortable finger 5." },
  "coord-two-to-one": { family: "two-to-one", key: "C", right: ["C", "D", "E", "F", "G"], bass: ["C,", "G,,", "C,", "C,"], tonic: 0, fingers: "RH C4–G4 uses 1–2–3–4–5. LH C3/G2 uses 1/5 within the learned fifth; release when repositioning." },
  "g-coord-melody-bass": { family: "two-to-one", key: "G", right: ["E", "F", "G", "A", "B"], bass: ["G,,", "D,", "E,", "G,,"], tonic: 2, fingers: "RH E4–B4 uses 1–2–3–4–5, with F#4 on 2. LH G2/D3 uses 5/1, then move to E3 with 1 and back to G2 with 5." },
};

// These are the upper voicings and basses explicitly taught in each source.
// In particular, C's first primary-chord task retains G major (not G7), and
// the later C cadence includes all four G7 tones across the two hands.
const CADENCES = {
  "chord-f-g": { key: "C", labels: ["C", "F", "G"], upper: ["CEG", "FAc", "GBd"], bass: ["C,", "F,,", "G,,"], fingers: "RH C4/E4/G4, F4/A4/C5 and G4/B4/D5 each use 1/3/5 after moving. LH roots C3/F2/G2 use a comfortable finger 5 after a released move." },
  "g-chords-gcd7": { key: "G", labels: ["G", "C", "D7"], upper: ["GBd", "CEG", "FAc"], bass: ["G,,", "C,", "D,"], fingers: "RH G4/B4/D5, C4/E4/G4 and F#4/A4/C5 use 1/3/5. LH G2/C3/D3 supplies the roots; D3 plus F#4/A4/C5 forms the complete D7." },
  "f3-chord-cadence": { key: "F", labels: ["F", "Bb", "C7"], upper: ["FAc", "FBd", "EGB"], bass: ["F,", "B,,", "C,"], fingers: "RH F4/A4/C5, F4/Bb4/D5 and E4/G4/Bb4 use 1/3/5. LH F3/Bb2/C3 supplies the roots; C3 plus E4/G4/Bb4 forms the complete C7." },
  "a4-chord-cadence": { key: "Am", labels: ["Am", "Dm", "E7"], upper: ["CEA", "DFA", "D^GB"], bass: ["A,,", "D,", "E,,"], fingers: "RH Am C4/E4/A4 uses 1/2/5; Dm D4/F4/A4 and E7 D4/G#4/B4 use 1/3/5. LH A2/D3/E2 supplies the roots. G# belongs to E7; the key signature itself has no sharps." },
  "d-chords-home": { key: "D", labels: ["D", "G", "A7"], upper: ["DFA", "DGB", "CEG"], bass: ["D,", "G,,", "A,,"], fingers: "RH D4/F#4/A4, D4/G4/B4 and C#4/E4/G4 use 1/3/5. LH D3/G2/A2 supplies the roots, with released whole-hand moves." },
  "a6-chords-primary": { key: "A", labels: ["A", "D", "E7"], upper: ["CEA", "DFA", "DGB"], bass: ["A,,", "D,", "E,,"], fingers: "RH A C#4/E4/A4 uses 1/2/5; D D4/F#4/A4 and E7 D4/G#4/B4 use 1/3/5. LH A2/D3/E2 supplies the roots, with released whole-hand moves." },
  "e7-chords-primary": { key: "E", labels: ["E", "A", "B7"], upper: ["EGB", "EAc", "DAB"], bass: ["E,,", "A,,", "[B,,F,]"], fingers: "RH E4/G#4/B4 and E4/A4/C#5 use 1/3/5; B7 D#4/A4/B4 uses 1/4/5. LH E2/A2 uses released moves; B7 uses B2/F#3 with 5/1. Together the B7 notes are B, D#, F# and A." },
  "m8-cadence-transfer": { key: "C", labels: ["C", "F", "G7"], upper: ["EGc", "FAc", "DFB"], bass: ["C,", "F,,", "G,,"], fingers: "RH C E4/G4/C5 and G7 D4/F4/B4 use 1/2/5; F F4/A4/C5 uses 1/3/5. LH C3/F2/G2 supplies the roots; G2 plus D4/F4/B4 forms all four G7 tones." },
};
const ROUTES = [
  [[[0, 2], [2, 2]], [[1, 4]], [[2, 2], [1, 2]], [[2, 2], [0, 2]]],
  [[[1, 2], [0, 2]], [[2, 4]], [[0, 2], [1, 2]], [[2, 2], [0, 2]]],
  [[[0, 4]], [[2, 2], [0, 2]], [[1, 2], [2, 2]], [[0, 4]]],
  [[[2, 2], [0, 2]], [[1, 2], [0, 2]], [[2, 4]], [[0, 4]]],
  [[[1, 4]], [[0, 2], [2, 2]], [[1, 2], [2, 2]], [[0, 4]]],
  [[[0, 2], [1, 2]], [[0, 2], [2, 2]], [[1, 4]], [[2, 2], [0, 2]]],
  [[[2, 4]], [[0, 2], [1, 2]], [[0, 2], [2, 2]], [[0, 4]]],
  [[[1, 2], [2, 2]], [[0, 4]], [[1, 2], [0, 2]], [[2, 2], [0, 2]]],
];

function profileFor(exercise) {
  if (!exercise || typeof exercise.id !== "string" || exercise.section === "placement") return null;
  const lookup = (profiles) => Object.prototype.hasOwnProperty.call(profiles, exercise.id) ? profiles[exercise.id] : null;
  const rhythm = lookup(RHYTHM);
  if (rhythm) return rhythm;
  const reading = lookup(READING);
  if (reading) return { family: "landmarks", ...reading };
  const coordination = lookup(COORDINATION);
  if (coordination) return coordination;
  const cadence = lookup(CADENCES);
  return cadence ? { family: "cadence", ...cadence } : null;
}

export const supportsTransfer = (exercise) => !!profileFor(exercise) || supportsIntegratedTransfer(exercise);

export function transferForExercise(exercise, variant = 0) {
  if (supportsIntegratedTransfer(exercise)) return integratedTransferForExercise(exercise, variant);
  const profile = profileFor(exercise);
  if (!profile) return null;
  const index = normalVariant(variant), key = names[profile.key];
  // Once the finite bank has been used, return to ordinary review rather than
  // presenting a repeated study as an unfamiliar transfer example.
  if (index >= VARIANTS) return null;
  const tempo = Math.max(20, Math.min(72, Number.isFinite(exercise.bpm) ? exercise.bpm : 48));
  const common = {
    id: exercise.id, transferId: `${VERSION}:${profile.family}:${profile.key.toLowerCase()}:${index}`,
    transferFamily: profile.family, transferVariant: index, section: "transfer", minutes: 3,
    unitId: exercise.unitId, key, bpm: tempo, targetBpm: tempo, source,
    checks: ["I tried the fresh example before hearing its model.", "I can name one detail that transferred and one detail to repair."],
  };
  if (profile.family === "pulse" || profile.family === "subdivision") {
    const eighths = profile.family === "subdivision", unit = eighths ? "1/8" : "1/4";
    const patterns = eighths ? EIGHTHS : PULSE;
    const right = DURATION_ORDERS[index].map((pattern) => singleNote(profile.note, patterns[pattern]));
    right.push(singleNote(profile.note, eighths ? [1, 1, 2, 4] : [4]));
    const title = `Fresh ${eighths ? "subdivision" : "pulse"} in ${key}`;
    return { ...common, title, hands: "R", abc: grand(title, right, rests(unit), profile.key, unit),
      summary: `Keep the count through a new ${eighths ? "eighth-note" : "long-and-short"} pattern on one familiar key.`,
      fingering: `RH finger 2 on ${profile.pitch}. One key keeps the task focused on rhythm; do not add hand travel.`,
      steps: [eighths ? "Before playback, say 1 and 2 and 3 and 4 and; point to each pair that fits inside one beat." : "Before playback, count four steady beats in each bar. Mark which attacks begin one-, two- or four-beat notes.", "Tap the fresh rhythm once, then play the complete four bars at a comfortable pulse without a model. Report that first attempt separately.", "Listen afterward to compare. Repair one late entry or shortened hold, then try the phrase again without changing the underlying beat."],
      listenFor: ["Long notes keep their full written length without an extra attack.", eighths ? "Each eighth-note pair fills one beat while the main pulse stays unchanged." : "A new pattern does not add a pause at the barline."],
      skillIds: eighths ? ["pulse", "eighth-subdivision"] : ["pulse", "note-lengths"],
    };
  }
  if (profile.family === "landmarks") {
    const order = ORDER[index], answer = ORDER[(index + 3) % VARIANTS];
    const bars = (notes, sequence) => [sequence.slice(0, 2).map((n) => `${notes[n]}2`).join(" "), sequence.slice(2).map((n) => `${notes[n]}2`).join(" ")];
    const right = profile.right ? bars(profile.right, order) : [], left = profile.left ? bars(profile.left, answer) : [];
    const rh = profile.hands === "R" ? [...right, ...bars(profile.right, answer)] : profile.hands === "both" ? [...right, "z4", "z4"] : rests();
    const lh = profile.hands === "L" ? [...left, ...bars(profile.left, order)] : profile.hands === "both" ? ["z4", "z4", ...left] : rests();
    const title = `Fresh landmarks in ${key}`;
    return { ...common, title, hands: profile.hands, abc: grand(title, rh, lh, profile.key),
      summary: "Read a different ordering of familiar notes without borrowing the old phrase's hand memory.",
      fingering: profile.fingers,
      steps: ["Before playback, name the clef, first pitch and octave for each hand. Check the key signature before naming altered notes.", "Make one uninterrupted four-bar reading at a comfortable pace. Each written half note lasts two beats; when the hands take turns, keep counting through the handover.", "Report your first reading, then compare with playback. Choose one register or signature detail to repair; later attempts revisit this example rather than count as another unseen reading."],
      listenFor: ["The sounding octave matches the staff even when the note order changes.", "The key signature keeps applying after a barline, and every handover stays in time."],
      skillIds: ["staff-reading", "register", "interval-reading"],
    };
  }
  if (profile.family === "held-bass" || profile.family === "two-to-one") {
    const eighths = profile.family === "two-to-one", unit = eighths ? "1/8" : "1/4", title = `Fresh ${eighths ? "two-to-one phrase" : "melody over held bass"} in ${key}`;
    const right = Array.from({ length: 3 }, (_, n) => {
      const notes = MELODY[(index + n * 2) % VARIANTS];
      return line(profile.right, eighths ? [...notes, ...MELODY[(index + n * 2 + 3) % VARIANTS]] : notes);
    });
    right.push(eighths ? `${line(profile.right, MELODY[(index + 1) % VARIANTS])} ${profile.right[profile.tonic]}4` : `${profile.right[profile.tonic + 2]} ${profile.right[profile.tonic + 1]} ${profile.right[profile.tonic]}2`);
    const bass = [...profile.bass.slice(index % 3), ...profile.bass.slice(0, index % 3)].slice(0, 3).concat(profile.bass[3]);
    const left = bass.map((note, bar) => eighths ? singleNote(note, bar === 3 ? [2, 2, 4] : [2, 2, 2, 2]) : `${note}4`);
    return { ...common, title, hands: "both", abc: grand(title, right, left, profile.key, unit),
      summary: eighths ? "Keep one LH attack per numbered beat while a new RH phrase divides the beat in two." : "Keep the bass sounding while a different familiar-position melody moves above it.",
      fingering: profile.fingers,
      steps: ["Before playback, locate both starting notes and trace the hand positions. Tap each layer separately once, keeping the same underlying count.", eighths ? "Try the fresh phrase once with LH on the numbered beats and RH eighths evenly between them. The last bar settles into a held ending; do not force extra LH attacks under it." : "Try the fresh phrase once, giving each LH whole note four full counts while the RH moves. Change the bass only at its next written attack.", "Report that first attempt, then listen to compare. Repair a single coordinated beat or handover, and finish with one complete phrase at the same comfortable pulse."],
      listenFor: [eighths ? "The LH does not copy the RH eighth notes." : "The bass is not re-struck whenever the melody moves.", "Adding the second hand does not introduce a pause or a louder, rushed melody."],
      skillIds: eighths ? ["two-to-one", "coordination", "eighth-subdivision"] : ["held-bass", "coordination", "pulse"],
    };
  }
  const route = ROUTES[index], title = `Fresh chord route in ${key}`;
  return { ...common, title, hands: "both", abc: grand(title,
    route.map((bar) => bar.map(([chord, duration]) => `"${profile.labels[chord]}"[${profile.upper[chord]}]${duration}`).join(" ")),
    route.map((bar) => bar.map(([chord, duration]) => `${profile.bass[chord]}${duration}`).join(" ")), profile.key),
    summary: "Use already-learned chord shapes in a different route and rhythm, then hear the return home.",
    fingering: profile.fingers,
    steps: [`Before playback, spell ${profile.labels.join(", ")} and locate their familiar upper voicings and bass roots. Read the half-bar changes before joining the hands.`, "Try the new four-bar route once without a model, counting four beats in every bar. The last chord returns home; each half-note change arrives after two counts.", "Report the first attempt, then compare with playback. Repair one change by releasing and placing the next shape slowly; return to the written route at a comfortable pulse."],
    listenFor: ["The upper voicing and bass together form the named chord, including any dominant seventh.", "The chord changes do not add time, and the final tonic sounds settled."],
    skillIds: [profile.key === "Am" ? "minor-cadence" : "primary-chords", "chord-changes", "cadence"],
  };
}
