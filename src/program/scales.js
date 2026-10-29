import { diatonicLine, displayKey, fingerText, fingersForReturn, fromName, keyAccidentals, midiForNote, noteName, returnLine, reverse, scoreForLines } from "./scaleNotation.js";
import { MINOR_SCALE_EXERCISES, MINOR_SCALE_STAGES } from "./minorScales.js";

export const SCALE_TRACK = {
  id: "continuing-scales",
  title: "Your continuing scales path",
  description: "Add one manageable technical goal alongside your music. Explore all twelve major keys, the three minor forms, arpeggios and new kinds of motion at your own pace.",
  guidance: "Choose a four-note crossing first, then a complete octave. Extend to two octaves before adding speed. Return on another day before playback to check what stayed available; a logged visit is practice, not measured mastery. All stages remain open.",
};

// The full two-octave ascending fingerings were checked visually against
// Eastern Illinois University's Scale and Arpeggio Fingering Charts, p.1.
// This is one consistent published choice, not a claim that alternative
// teacher-selected starting fingers are wrong.
const SOURCE_URL = "https://www.eiu.edu/music/student_resources/2204_Scales.Arpeggios.pdf";
const SOURCE = {
  label: "Original Woodshed scale notation and practice guidance; fingering checked against Eastern Illinois University's published chart",
  url: SOURCE_URL,
  scope: "Straight quarter-note teaching patterns use one published fingering choice. They are a continuing technical path, rather than an exam syllabus or a prescribed number of weeks. A teacher may adapt a starting finger to your hand or musical context.",
};
const digits = (value) => [...value].map(Number);
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const MAJOR_KEYS = [
  { tonic: "C", r: "123123412312345", l: "543213214321321", arpR: "1231235", arpL: "5421421", family: "The familiar RH 3–1 and LH 1–3 joins occur at different degrees." },
  { tonic: "G", r: "123123412312345", l: "543213214321321", arpR: "1231235", arpL: "5421421", family: "Keep F sharp in the signature; the familiar crossing fingers still apply." },
  { tonic: "F", r: "123412312341234", l: "543213214321321", arpR: "1231235", arpL: "5421421", family: "The RH uses finger 4 on B flat and turns to thumb on C. A final F uses 4; an internal F uses 1." },
  { tonic: "D", r: "123123412312345", l: "543213214321321", arpR: "1231235", arpL: "5321321", family: "F sharp and C sharp stay under the long fingers; recall each hand's own crossing." },
  { tonic: "A", r: "123123412312345", l: "543213214321321", arpR: "1231235", arpL: "5321321", family: "Name F sharp, C sharp and G sharp before playing; three sharps do not require three pauses." },
  { tonic: "E", r: "123123412312345", l: "543213214321321", arpR: "1231235", arpL: "5321321", family: "Read all four sharps, including D sharp, while keeping the familiar crossing family." },
  { tonic: "Bb", r: "412312341231234", l: "321432132143213", arpR: "4124124", arpL: "3213213", family: "Begin RH on 4 at B flat, then thumb on C; LH begins on 3 and crosses to 4 on E flat. This consistent cyclic choice differs from some introductory starting-finger alternatives." },
  { tonic: "Eb", r: "312341231234123", l: "321432132143213", arpR: "4124124", arpL: "2142142", family: "Both hands start on 3. RH thumb plays F and C; RH 4 plays B flat. LH 4 plays A flat." },
  { tonic: "B", r: "123123412312345", l: "432143213214321", arpR: "1231235", arpL: "5321321", family: "The RH keeps its familiar family, but the LH begins on 4. LH thumb plays E and B; LH 4 plays F sharp after E." },
  { tonic: "Ab", r: "341231234123123", l: "321432132143213", arpR: "4124124", arpL: "2142142", family: "Start each hand on 3 at A flat. RH 4 belongs to B flat; LH 4 belongs to D flat. Thumbs land on white-key C and F." },
  { tonic: "Db", r: "231234123123412", l: "321432132143213", arpR: "4124124", arpL: "2142142", family: "Start RH 2 and LH 3 on D flat. RH 4 plays B flat and LH 4 plays G flat; thumbs use F and C." },
  { tonic: "Gb", r: "234123123412312", l: "432132143213214", arpR: "1231235", arpL: "5321321", family: "Start RH 2 and LH 4. C flat is the white key also called B: keep the written letter C because every scale degree needs its own letter. G flat major shares piano keys with F sharp major. The same two white keys are spelled C flat and F here, and B and E sharp in F sharp major." },
];
const byTonic = Object.fromEntries(MAJOR_KEYS.map((key) => [key.tonic, key]));
const foundation = ["C", "G", "F", "D", "A", "E"];
const flatBridge = ["Bb", "Eb"];
const later = ["B", "Ab", "Db", "Gb"];
const handsList = ["R", "L", "both"];
const handLabel = { R: "right hand", L: "left hand", both: "hands together" };
const slug = (tonic) => tonic.toLowerCase().replaceAll("#", "s");
const name = (tonic) => `${displayKey(tonic)} major`;
const majorStageIds = {
  flat: "sc-flat-bridge", foundation: "sc-octave-foundations", two: "sc-two-octave-bridge",
  b: "sc-b-major-family", black: "sc-black-key-families", arp: "sc-major-arpeggio-foundations",
  arpBlack: "sc-major-arpeggio-families", arpTwo: "sc-major-arpeggio-continuation", motion: "sc-motion-and-chromatic",
};

function octaveFingers(twoOctave, octaves, stride = 7) {
  const full = digits(twoOctave);
  const up = octaves === 2 ? full : [...full.slice(0, stride), full.at(-1)];
  return { up, down: reverse(up) };
}
function scaleNotes(tonic, octave, octaves) {
  const offsets = Array.from({ length: 7 * octaves + 1 }, (_, index) => 12 * Math.floor(index / 7) + (MAJOR_INTERVALS[index % 7] || 0));
  return diatonicLine(tonic, octave, offsets);
}
function startOctave(tonic, hand) {
  if (hand === "L") return 2;
  return ["G", "A", "B", "Bb", "Ab", "Gb"].includes(tonic) ? 3 : 4;
}
function instructionFingers(lines, fingerings, hands) {
  return (hands === "both" ? ["R", "L"] : [hands]).map((hand) => `${hand === "R" ? "RH" : "LH"} ${noteName(lines[hand][0])}–${noteName(lines[hand].at(-1))}: up ${fingerText(fingerings[hand].up)}; down ${fingerText(fingerings[hand].down)}.`).join(" ");
}
const base = (stageId, value) => ({ unitId: SCALE_TRACK.id, trackId: SCALE_TRACK.id, section: "scales", stageId, source: SOURCE, minutes: 5, bpm: 40, targetBpm: 64, ...value });

function majorExercise(tonic, octaves, hands, stageId) {
  const key = byTonic[tonic], label = name(tonic), range = octaves === 1 ? "one octave" : "two octaves";
  const lines = { R: scaleNotes(tonic, startOctave(tonic, "R"), octaves), L: scaleNotes(tonic, startOctave(tonic, "L"), octaves) };
  const fingerings = { R: octaveFingers(key.r, octaves), L: octaveFingers(key.l, octaves) };
  const title = `${label}: ${range}, ${handLabel[hands]}`;
  const continuation = octaves === 2
    ? `At the middle tonic, RH uses ${fingerings.R.up[7]} and LH uses ${fingerings.L.up[7]}; those are continuation fingers. Keep moving into the second octave instead of stopping with the one-octave endpoint fingers. Practice the two notes before and after that tonic in each direction.`
    : "First join a four-note group, then the join between groups. The last tonic is the turning point, played once before descending; the final lower tonic is held for its written length.";
  return base(stageId, {
    id: `sc-major-${slug(tonic)}-${octaves}-${hands.toLowerCase()}`, key: label, hands, title,
    summary: octaves === 1 ? `Find ${label}'s note pattern and each hand's crossing; extend a secure chunk into a complete octave.` : `Carry ${label} through the middle tonic using continuation fingering, then return without a rhythmic gap.`,
    abc: scoreForLines(title, tonic, hands === "L" ? null : returnLine(lines.R), hands === "R" ? null : returnLine(lines.L), { signature: keyAccidentals(tonic), fingers: { R: fingersForReturn(fingerings.R), L: fingersForReturn(fingerings.L) } }),
    fingering: `${instructionFingers(lines, fingerings, hands)} ${key.family} Finger numbers are thumb 1 through little finger 5.`,
    steps: [
      `Name the seven letters before playback: ${lines.R.slice(0, 7).map((note) => displayKey(noteName(note).replace(/\d+$/, ""))).join("–")}. Use whole–whole–half–whole–whole–whole–half spacing to check the keyboard shape. ${key.family}`,
      hands === "both" ? "Recall the written pattern in each hand separately. Pair four attacks, noticing that one hand may cross while the other continues. Join more notes only while both attacks stay together." : `Locate the written starting ${displayKey(tonic)} in the correct register, then isolate each thumb crossing with the notes immediately before and after it. Let the hand travel comfortably rather than stretching a fixed span.`,
      continuation,
      "Play one slow pass with even note lengths and a quiet thumb. Change just one feature on a second pass: softer tone or a gentle rise and fall in sound. Keep the count and fingering unchanged.",
      `Choose three notes from this scale for a short question-and-answer phrase. Let the answer settle on ${displayKey(tonic)} and listen to the seventh degree leading home. On a later day, name the signature and try your chosen ${octaves === 2 ? "middle-tonic join" : "chunk or complete octave"} before the demo. Save the actual hands, bar range and next repair; increase range before tempo.`,
    ],
    listenFor: ["A thumb crossing or middle tonic does not add a pause or a louder note.", hands === "both" ? "Both attacks arrive together even when the hands change fingers at different moments." : "Descending remains as even and deliberate as ascending.", "The soft pass changes the tone without changing the pulse."],
    checks: [`I can identify my current scope: a chunk, a complete octave${octaves === 2 ? ", or the full two-octave route" : ""}.`, octaves === 2 ? "I can name each hand's middle-tonic continuation finger and play through that join." : "I can name my hand's crossing and find the changed notes without the demo.", "I know which join to retrieve on another day; this practice log does not claim measured fluency."],
    skillIds: ["major-scale", "thumb-crossing", octaves === 2 ? "scale-continuation" : "scale-construction", hands === "both" ? "coordination" : "even-touch"],
    technique: { pattern: "major", tonic, octaves, tonicMidi: { R: midiForNote(lines.R[0]), L: midiForNote(lines.L[0]) }, fingerings },
  });
}

function arpeggioExercise(tonic, octaves, hands, stageId) {
  const key = byTonic[tonic], label = name(tonic), scaleR = scaleNotes(tonic, startOctave(tonic, "R"), octaves), scaleL = scaleNotes(tonic, startOctave(tonic, "L"), octaves);
  const degrees = Array.from({ length: octaves * 3 + 1 }, (_, index) => Math.floor(index / 3) * 7 + [0, 2, 4][index % 3]);
  const lines = { R: degrees.map((degree) => scaleR[degree]), L: degrees.map((degree) => scaleL[degree]) };
  const fingerings = { R: octaveFingers(key.arpR, octaves, 3), L: octaveFingers(key.arpL, octaves, 3) };
  const title = `${label} arpeggio: ${octaves === 1 ? "one octave" : "two octaves"}, ${handLabel[hands]}`;
  return base(stageId, {
    id: `sc-arpeggio-${slug(tonic)}-major-${octaves}-${hands.toLowerCase()}`, key: label, title, hands, bpm: 36, targetBpm: 56,
    summary: "Carry root–third–fifth through the octave without holding a stretched chord shape. Add range after a relaxed join.",
    abc: scoreForLines(title, tonic, hands === "L" ? null : returnLine(lines.R), hands === "R" ? null : returnLine(lines.L), { signature: keyAccidentals(tonic), fingers: { R: fingersForReturn(fingerings.R), L: fingersForReturn(fingerings.L) } }),
    fingering: `${instructionFingers(lines, fingerings, hands)} This is root position: ${lines.R.slice(0, 3).map((note) => displayKey(noteName(note).replace(/\d+$/, ""))).join("–")}. ${tonic === "Gb" ? "All three chord tones are black keys; this published arpeggio fingering intentionally uses a thumb on a black key. The scale's white-key-thumb pattern does not apply to this arpeggio." : "Use the written arpeggio fingers rather than borrowing the scale fingering."}`,
    steps: [
      `Name the root, major third and fifth of ${label}, then locate their repeated registers. Play a quiet three-note chord only if comfortable; release it before moving. You do not need to hold its span while travelling.`,
      "Play root–third–fifth slowly in one hand and release the fingers that are finished. Let the arm carry the hand toward the next tonic; isolate the fingering change over two or three notes.",
      octaves === 2 ? `The middle tonic uses RH ${fingerings.R.up[3]} and LH ${fingerings.L.up[3]}. Practice into and out of that tonic before connecting both octaves; the highest tonic uses the endpoint finger instead.` : "Add the upper tonic, then descend on the written reversed fingers. A relaxed root-to-fifth chunk is a useful first result; extend it before increasing speed.",
      hands === "both" ? "Recall each hand independently before pairing attacks. Start with two paired notes, then a complete root–third–fifth group; stop and simplify if one hand waits for the other." : "Use the click as one note per beat. Keep the high tonic's direction change on time, and hold the final low tonic for its written duration.",
      "Make a small musical answer from root–third–fifth–third–root at an easy pulse, giving the highest note a gentle shape and the return a quieter ending. Then play or imagine the same notes as a chord: hear how the travelling line belongs to one harmony. On another day, name the chord and retrieve the chosen join before listening; record the actual range and next step.",
    ],
    listenFor: ["The next tonic arrives in time without a stretched or snatched attack.", "The third and fifth remain as clear as the root on the way down."],
    checks: ["I can name the actual three chord tones and locate the starting register.", "I can release and travel through one comfortable join without holding a wide span.", octaves === 2 ? "I can distinguish the middle-tonic continuation from the highest endpoint." : "I can state whether I practised a small chunk or the complete octave."],
    skillIds: ["arpeggio", "major-triad", "hand-travel", hands === "both" ? "coordination" : "even-touch"],
    technique: { pattern: "arpeggio", quality: "major", tonic, octaves, tonicMidi: { R: midiForNote(lines.R[0]), L: midiForNote(lines.L[0]) }, fingerings },
  });
}

function contraryExercise(tonic, octaves) {
  const key = byTonic[tonic], stageId = majorStageIds.motion;
  const r = scaleNotes(tonic, 4, octaves), low = scaleNotes(tonic, 3 - octaves, octaves), outwardL = reverse(low);
  const fingerings = { R: octaveFingers(key.r, octaves), L: octaveFingers(key.l, octaves) };
  const title = `${name(tonic)} contrary motion: ${octaves === 1 ? "one octave" : "two octaves"}`;
  return base(stageId, {
    id: `sc-contrary-${slug(tonic)}-${octaves}`, title, key: name(tonic), hands: "both", bpm: 36, targetBpm: 56,
    summary: "The RH rises while the LH falls through complete scales, then both return toward their separate starting tonics.",
    abc: scoreForLines(title, tonic, returnLine(r), returnLine(outwardL), { signature: keyAccidentals(tonic), fingers: { R: fingersForReturn(fingerings.R), L: fingersForReturn({ up: fingerings.L.down, down: fingerings.L.up }) } }),
    fingering: `Start RH ${noteName(r[0])} and LH ${noteName(outwardL[0])}, one octave apart. Outward RH rises on ${fingerText(fingerings.R.up)}; outward LH falls on ${fingerText(fingerings.L.down)}. Return RH down ${fingerText(fingerings.R.down)}, LH up ${fingerText(fingerings.L.up)}. ${octaves === 2 ? "At the middle octave, use the continuation fingers in these full sequences, rather than inserting one-octave endpoint fingers." : "These are complete octave scales with crossings, beyond the course's five-note motion comparison."}`,
    steps: [
      `Trace the staves before playing. RH travels from ${noteName(r[0])} up to ${noteName(r.at(-1))}; LH travels from ${noteName(outwardL[0])} down to ${noteName(outwardL.at(-1))}. The starting notes are separate piano keys, so the hands never need to share one key.`,
      "Recall the RH ascent and LH descent independently. Pair four outward attacks at a slow pulse and identify the crossings, then practice the return as its own short task.",
      "Extend the paired chunk to the octave before adding speed. At the furthest point, play the turning note once and reverse direction on the next beat; the written final tonic holds to complete the last bar.",
      "Try a quieter return while keeping both attacks together. Then play each line alone and sing or imagine its direction before combining; listen for the widening sound to return to the starting tonics. On another day, first say which hand rises and which falls, retrieve the chosen route before the demo, and save one specific repair.",
    ],
    listenFor: ["Both attacks arrive together while the hands move in opposite directions.", "The change of direction keeps the same note-to-note pulse."],
    checks: ["I can identify the separate starting registers and both directions before playing.", "I can report a secure chunk or full range without confusing this with parallel motion."],
    skillIds: ["contrary-motion", "major-scale", "coordination", "thumb-crossing"],
    technique: { pattern: "contrary", quality: "major", tonic, octaves, tonicMidi: { R: midiForNote(r[0]), L: midiForNote(outwardL[0]) }, outwardDirections: { R: 1, L: -1 }, fingerings },
  });
}

function chromaticExercise(octaves, hands) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const downNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const chromaticUp = (octave) => Array.from({ length: 12 * octaves + 1 }, (_, index) => fromName(names[index % 12], octave + Math.floor(index / 12)));
  const chromaticDown = (octave) => Array.from({ length: 12 * octaves + 1 }, (_, index) => {
    const semitone = 12 * octaves - index;
    return fromName(downNames[semitone % 12], octave + Math.floor(semitone / 12));
  });
  // The standard chromatic fingering puts 3 on every black key. Direction
  // matters: RH uses 2 at F/C going up, LH at E/B going up.
  // The first RH C can start on 1; every later C is 2 after thumb B.
  const rUpCycle = [2, 3, 1, 3, 1, 2, 3, 1, 3, 1, 3, 1];
  const lUpCycle = [1, 3, 1, 3, 2, 1, 3, 1, 3, 1, 3, 2];
  const fingerings = Object.fromEntries([["R", rUpCycle], ["L", lUpCycle]].map(([hand, cycle]) => {
    const up = Array.from({ length: 12 * octaves + 1 }, (_, index) => index === 0 ? 1 : cycle[index % 12]);
    return [hand, { up, down: reverse(up) }];
  }));
  const up = { R: chromaticUp(4), L: chromaticUp(2) }, down = { R: chromaticDown(4), L: chromaticDown(2) };
  const lines = { R: [...up.R, ...down.R.slice(1)], L: [...up.L, ...down.L.slice(1)] };
  const title = `Chromatic from C: ${octaves === 1 ? "one octave" : "two octaves"}, ${handLabel[hands]}`;
  return base(majorStageIds.motion, {
    id: `sc-chromatic-c-${octaves}-${hands.toLowerCase()}`, key: "Chromatic", title, hands, bpm: 36, targetBpm: 56,
    source: { label: "Original Woodshed chromatic notation and guidance; fingering checked against John Wiles's teaching chart", url: "https://www.swindonpianolessons.co.uk/general/scale-fingering-chromatic/", scope: "Uses finger 3 on black keys and a direction-specific 1–2 join at neighboring white keys. Written sharps going up and flats going down name the same piano keys. This is one consistent introductory fingering choice." },
    summary: "Every adjacent piano key is a half step. Practice small groups and the two neighboring white-key joins without changing the pulse.",
    abc: scoreForLines(title, "C", hands === "L" ? null : lines.R, hands === "R" ? null : lines.L, { explicit: true, fingers: { R: fingersForReturn(fingerings.R), L: fingersForReturn(fingerings.L) } }),
    fingering: `${instructionFingers(up, fingerings, hands)} Finger 3 plays every black key. RH ascending uses E–F on 1–2 and B–C on 1–2; its first C starts on 1, later Cs use 2. LH ascending uses E–F on 2–1 and B–C on 2–1. Reverse each written sequence on the way down.`,
    steps: ["Find adjacent white/black keys C–C sharp–D, then the adjacent white keys E–F and B–C. A half step is the next key, not a particular color combination.", "Use finger 3 on each black key. Isolate the E–F and B–C white-key pairs using the written fingers; let the hand travel in small groups rather than twisting a fixed wrist.", "Read the written sharps ascending and flats descending: these are alternate spellings of the same piano keys. Accidentals are explicit so every intended pitch is visible.", "Join a chosen group at one note per beat, then repeat it softly or gently detached without changing the pace. Make a tiny melodic answer by approaching C through B, or D through C sharp: listen to the half step settling on its destination. On another day, retrieve that group before playback and record the actual scope and next repair."],
    listenFor: ["The neighboring white-key pairs do not produce a hesitation or an extra accent.", "Every step has the same note-to-note duration, including the reversal."],
    checks: ["I can find a half step without assuming it must involve a black key.", "I can identify the white-key join I need to revisit and keep one short chromatic group even."],
    skillIds: ["chromatic-scale", "half-steps", "even-touch", hands === "both" ? "coordination" : "hand-travel"],
    technique: { pattern: "chromatic", tonic: "C", octaves, tonicMidi: { R: midiForNote(up.R[0]), L: midiForNote(up.L[0]) }, fingerings },
  });
}

const majorScales = [
  ...flatBridge.flatMap((tonic) => handsList.map((hands) => majorExercise(tonic, 1, hands, majorStageIds.flat))),
  ...foundation.flatMap((tonic) => handsList.map((hands) => majorExercise(tonic, 1, hands, majorStageIds.foundation))),
  ...[...foundation, ...flatBridge].flatMap((tonic) => handsList.map((hands) => majorExercise(tonic, 2, hands, majorStageIds.two))),
  ...later.flatMap((tonic) => [1, 2].flatMap((octaves) => handsList.map((hands) => majorExercise(tonic, octaves, hands, tonic === "B" ? majorStageIds.b : majorStageIds.black)))),
];
const majorArpeggios = [
  ...[...foundation, ...flatBridge].flatMap((tonic) => handsList.map((hands) => arpeggioExercise(tonic, 1, hands, majorStageIds.arp))),
  ...later.flatMap((tonic) => handsList.map((hands) => arpeggioExercise(tonic, 1, hands, majorStageIds.arpBlack))),
  ...MAJOR_KEYS.flatMap(({ tonic }) => handsList.map((hands) => arpeggioExercise(tonic, 2, hands, majorStageIds.arpTwo))),
];
const motion = [contraryExercise("C", 1), contraryExercise("G", 1), contraryExercise("C", 2), ...[1, 2].flatMap((octaves) => handsList.map((hands) => chromaticExercise(octaves, hands)))];
export const SCALE_EXERCISES = [...majorScales, ...MINOR_SCALE_EXERCISES, ...majorArpeggios, ...motion];
const stage = (id, title, description, prerequisites) => ({ id, title, description, prerequisites, exerciseIds: SCALE_EXERCISES.filter((exercise) => exercise.stageId === id).map((exercise) => exercise.id) });
const majorStages = [
  stage(majorStageIds.flat, "Add B♭ and E♭", "Extend F's flat-key reading to two and three flats. Each key has its own starting fingers; begin with RH, then LH, then paired chunks.", ["Find each written starting note from its clef.", "Recall a comfortable C/G/F one-octave crossing or revisit the foundation stage below."]),
  stage(majorStageIds.foundation, "Recall the six foundation keys", "Retrieve C, G, F, D, A and E across a complete octave, keeping each hand's pattern independent. These are bridge lessons, alongside the existing guided units.", ["Use a small chunk whenever a complete octave disrupts the pulse."]),
  stage(majorStageIds.two, "Carry familiar scales through two octaves", "The middle tonic is a continuation, not an endpoint. Practice that new join in C/G/F/D/A/E and B♭/E♭ before increasing tempo.", ["A complete single octave feels manageable separately in each hand.", "Identify a relaxed crossing and retrieve it on a later visit."]),
  stage(majorStageIds.b, "B major: a different LH beginning", "Five sharps fit a familiar RH pattern, but the LH begins on 4. Learn the new first join before extending the range.", ["Read F♯, C♯, G♯, D♯ and A♯ deliberately.", "Separate new fingering from new range; the first lesson stays within one octave."]),
  stage(majorStageIds.black, "A♭, D♭ and G♭: black-key families", "Learn the starting fingers and white-key thumb locations in each family. G♭/F♯ are enharmonic piano-key routes; the written spelling still matters.", ["Recall B♭ and E♭ in a manageable scope.", "Locate each key's thumb notes before playing; do not transpose C's finger numbers blindly."]),
  stage(majorStageIds.arp, "Root-position major arpeggios", "Build root–third–fifth patterns in the eight familiar keys. Travel and release through a single octave before extending the span.", ["Name the three notes of a major triad.", "Release and move the hand rather than holding an uncomfortable chord span."]),
  stage(majorStageIds.arpBlack, "Arpeggios in the remaining major keys", "B, A♭, D♭ and G♭ introduce different root-position grips and crossing fingers. The scale's fingering is not an arpeggio fingering.", ["A slow root-to-fifth arpeggio chunk stays comfortable.", "Read the selected key's signature and find its chord tones."]),
  stage(majorStageIds.arpTwo, "Continue major arpeggios through two octaves", "Carry each of the twelve major arpeggios through the middle root on its continuation finger, then reverse at the highest root.", ["Play the chosen key's one-octave arpeggio in the actual hand being extended.", "Keep the root-to-root travel relaxed before adding speed."]),
  stage(majorStageIds.motion, "Contrary motion and chromatic travel", "Move full scales in opposite directions, then explore every adjacent piano key. Begin with one short join; the longer versions are later goals.", ["Recall the selected major scale separately in each hand.", "Keep quarter-note attacks even through one crossing before adding opposite motion or a new finger pattern."]),
];

// Minor stages are interleaved after the first flat-key expansion. The UI
// renders one stage at a time and all stages remain freely available.
const minorStage = (id) => MINOR_SCALE_STAGES.find((candidate) => candidate.id === id);
export const SCALE_STAGES = [
  majorStages[0], minorStage("sc-minor-neighbours-natural"), minorStage("sc-minor-neighbours-harmonic"),
  majorStages[1], majorStages[2], minorStage("sc-minor-neighbours-melodic"),
  majorStages[3], majorStages[4], minorStage("sc-minor-more-white"), minorStage("sc-minor-black"), minorStage("sc-minor-two-octaves"),
  majorStages[5], minorStage("sc-minor-arpeggios-one"), majorStages[6], majorStages[7], minorStage("sc-minor-arpeggios-two"), majorStages[8],
].filter(Boolean);
