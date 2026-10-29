// Finite fresh studies for the three passage-specific preparations. Keep each
// source's notes, registers, fingerings and durations; change their order so a
// delayed check needs the musical skill rather than memory of the old phrase.
const COUNT = 8;
const source = { label: "Original Woodshed transfer material", scope: "A fresh short study of an already-practised skill, in a familiar key." };
const families = {
  "d-canon-minor-lh-prep": "canon-travel",
  "a6-mozart-key-shape": "mozart-position",
  "e7-blues-sevenths": "blues-sevenths",
};
const familyFor = (exercise) => exercise && exercise.section !== "placement" && !exercise.archived
  && Object.hasOwn(families, exercise.id) ? families[exercise.id] : null;
export const supportsIntegratedTransfer = (exercise) => !!familyFor(exercise);
const grand = (title, key, right, left) => `X:1\nT:${title}\nM:4/4\nL:1/4\nK:${key}\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] ${right.join(" | ")} |]\n[V:2] ${left.join(" | ")} |]`;
const rests = ["z4", "z4", "z4", "z4"];
const CANON_ORDERS = [[0,1,0,1],[1,0,1,0],[0,1,1,0],[1,0,0,1],[0,0,1,0],[1,1,0,1],[0,1,1,1],[1,0,0,0]];
const CANON_CELLS = ['"Bm"!5!B,, [D,F,B,] !5!B,, [D,F,B,]', '"F#m"!5!F,, [A,,C,F,] !5!F,, [A,,C,F,]'];
const MOZART_PITCHES = ["A", "B", "c", "d", "e"];
const MOZART_ORDERS = [[2,3,2,4],[1,2,3,1],[4,2,3,1],[0,2,1,3],[3,4,2,0],[2,0,3,4],[1,3,4,2],[4,1,2,0]];
const mozartBar = (order) => order.map(i=>`!${i+1}!${MOZART_PITCHES[i]}`).join(" ");
const BLUES_ORDERS = [[2,0,1,3],[1,2,0,3],[0,2,1,3],[3,1,0,2],[2,1,3,0],[1,3,2,0],[3,0,2,1],[0,3,1,2]];
const BLUES_CELLS = [
  { right:'"E7"!1!E !2!G !3!B !5!=d', left:"!5!E,,4" },
  { right:'"A7"!1!A !3!c !5!e !1!=G', left:"!5!A,,4" },
  { right:'"B7"!1!F !2!A !5!d !3!B', left:"!5!B,,4" },
  { right:'"E7"!2!G !3!B !5!=d !1!E', left:"!5!E,,4" },
];

export function integratedTransferForExercise(exercise, variant = 0) {
  const family = familyFor(exercise);
  if (!family) return null;
  const index = Number.isSafeInteger(variant) && variant >= 0 ? variant : 0;
  if (index >= COUNT) return null;
  const key = family === "canon-travel" ? "D" : family === "mozart-position" ? "A" : "E";
  const tempo = Math.max(20,Math.min(72,Number.isFinite(exercise.bpm)?exercise.bpm:40));
  const common = {
    id: exercise.id, unitId: exercise.unitId, key: `${key} major`, section: "transfer", minutes: 3,
    transferId: `transfer-v1:${family}:${key.toLowerCase()}:${index}`, transferFamily: family, transferVariant: index,
    bpm: tempo, targetBpm: tempo, source,
    checks: ["I tried the fresh example before hearing its model.", "I can name one detail that transferred and one detail to repair."],
  };
  if (family === "canon-travel") {
    const title = "Fresh Canon minor-chord travel";
    return { ...common, title, hands: "L", abc: grand(title,key,rests,CANON_ORDERS[index].map(i=>CANON_CELLS[i])),
      summary: "Read a new ordering of the two released LH bass-to-chord movements used by Canon bars 3–4.",
      fingering: "LH B2 uses 5, then D3–F#3–B3 uses 5–3–1. LH F#2 uses 5, then A2–C#3–F#3 uses 5–3–1. Release each bass before travelling to its upper chord; keep the RH resting. The upper chords are separate placements, not a held span from the low root.",
      steps: ["Before playback, name each written minor chord and locate its low root and upper placement. The shapes are familiar; their four-bar order is new.", "Try the whole short route once without the model. Play bass–chord–bass–chord on four equal quarter-note counts, releasing and moving between placements. Report that first attempt separately.", "Listen afterward and repair one late move or incorrect register. Keep the same written route and comfortable pulse on the next attempt; this is movement transfer, not another Canon arrangement."],
      listenFor: ["The released hand movement does not insert a fifth beat.", "Both Bm and F#m keep their written minor thirds and actual bass registers."],
      skillIds: ["canon-minor-harmony","bass-chord-travel","released-movement"],
    };
  }
  if (family === "mozart-position") {
    const title = "Fresh melody in Mozart's five-note position";
    const right = [0,2,4].map(offset=>mozartBar(MOZART_ORDERS[(index+offset)%COUNT])).concat(mozartBar([2,1,0,0]));
    return { ...common, title, hands: "R", abc: grand(title,key,right,rests),
      summary: "Read a new quarter-note melody in the same stationary A4–E5 position, keeping the learned fingers.",
      fingering: "RH A4–B4–C#5–D5–E5 stays on 1–2–3–4–5. The printed finger always belongs to the same pitch: A4(1), B4(2), C#5(3), D5(4), E5(5). The LH rests, and no thumb crossing or wider position is added.",
      steps: ["Before playback, locate A4–E5 and name C#5 from the signature. Read the new order while keeping one finger assigned to each of the five notes.", "Try all four bars before hearing the model, one quarter note per beat. The new melody checks the familiar position; it does not reproduce or replace Mozart's dotted rhythm. Report that first reading separately.", "Compare with playback afterward. Repair one pitch or hesitant finger, then replay this same melody at the same pulse with a gentle phrase ending."],
      listenFor: ["A changed note order does not force a scale-style thumb crossing.", "Quarter-note attacks stay even while the hand remains in its learned position."],
      skillIds: ["a-major-five-note-shape","register","fixed-position-reading"],
    };
  }
  const title = "Fresh seventh-chord colours for Switchyard", cells = BLUES_ORDERS[index].map(i=>BLUES_CELLS[i]);
  return { ...common, title, hands: "both", abc: grand(title,key,cells.map(c=>c.right),cells.map(c=>c.left)),
    summary: "Identify E7, A7 and B7 in a new order while retaining the learned chord-tone lines and held roots.",
    fingering: "RH E4–G#4–B4–D5 uses 1–2–3–5; G#4–B4–D5–E4 uses 2–3–5–1 with released travel. A4–C#5–E5 uses 1–3–5, then release and move down to G4 on 1. F#4–A4–D#5–B4 uses 1–2–5–3. LH E2/A2/B2 roots use a comfortable 5. No four-note RH chord or wide span has to be held.",
    steps: ["Before playback, name each written harmony and locate its held root. Recall D natural in E7, G natural in A7 and D# as B7's third; the individual note signs remain part of the reading.", "Try the new four-bar order once without the model. Keep RH quarters even above each held LH whole note, releasing and travelling at the familiar position changes. Report the first result separately.", "Listen afterward and repair one natural/sharp or hand move. Keep the written order on the next pass; the exercise checks harmonic colour in new music, rather than replacing Switchyard's melody or rhythm."],
    listenFor: ["The complete root and RH line sound all four tones of each named seventh chord.", "A changed harmonic order does not erase the written naturals or cause an extra pause."],
    skillIds: ["dominant-sevenths","blues-harmony","released-movement"],
  };
}
