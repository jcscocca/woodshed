// Continuing minor-key technique. These are original practice settings of
// standard scale/arpeggio patterns, rather than transcriptions of a method book.
// Fingering facts were checked against Margaret Denton's minor-scale charts
// and Eastern Illinois University's scale/arpeggio appendix (see sources).
const TRACK = "continuing-scales";
const DENTON = "https://margaretdentonpiano.com/MInors%20natural%20harmonic%20melodic.pdf";
const EIU = "https://www.eiu.edu/music/student_resources/2204_Scales.Arpeggios.pdf";
const MIAMI = "https://www.cs.miami.edu/home/burt/music/finger-charts.html";
const LETTERS = "CDEFGAB";
const NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const digits = (value) => [...value].map(Number);
const display = (value) => value.replace(/#/g, "♯").replace(/b/g, "♭");
const slug = (value) => value[0].toLowerCase() + value.slice(1).replace(/#/g, "sharp").replace(/b/g, "flat");

// Each row gives one repeatable seven-note cycle, followed by the endpoint.
// LH white-tonic scales start with 5 (or B with 4), then use continuation thumb
// on the internal tonic; copying a one-octave endpoint would break this join.
// C#/F# melodic RH uses a different ascent and returns with natural-minor fingers.
export const MINOR_KEYS = [
  { tonic: "A", notes: ["A", "B", "C", "D", "E", "F", "G"], r: "1231234", rEnd: 5, l: "1432132", lStart: 5 },
  { tonic: "D", notes: ["D", "E", "F", "G", "A", "Bb", "C"], r: "1231234", rEnd: 5, l: "1432132", lStart: 5 },
  { tonic: "E", notes: ["E", "F#", "G", "A", "B", "C", "D"], r: "1231234", rEnd: 5, l: "1432132", lStart: 5 },
  { tonic: "G", notes: ["G", "A", "Bb", "C", "D", "Eb", "F"], r: "1231234", rEnd: 5, l: "1432132", lStart: 5 },
  { tonic: "B", notes: ["B", "C#", "D", "E", "F#", "G", "A"], r: "1231234", rEnd: 5, l: "1321432", lStart: 4 },
  { tonic: "C", notes: ["C", "D", "Eb", "F", "G", "Ab", "Bb"], r: "1231234", rEnd: 5, l: "1432132", lStart: 5 },
  { tonic: "F", notes: ["F", "G", "Ab", "Bb", "C", "Db", "Eb"], r: "1234123", rEnd: 4, l: "1432132", lStart: 5 },
  { tonic: "F#", notes: ["F#", "G#", "A", "B", "C#", "D", "E"], r: "3412312", rEnd: 3, l: "4321321", lStart: 4, melodicR: "2312341" },
  { tonic: "C#", notes: ["C#", "D#", "E", "F#", "G#", "A", "B"], r: "3412312", rEnd: 3, l: "3214321", lStart: 3, melodicR: "2312341" },
  { tonic: "G#", notes: ["G#", "A#", "B", "C#", "D#", "E", "F#"], r: "3412312", rEnd: 3, l: "3213214", lStart: 3, harmonicL: "3214321" },
  { tonic: "Bb", notes: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"], r: "4123123", rEnd: 4, l: "2132143", lStart: 2 },
  { tonic: "Eb", notes: ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"], r: "3123412", rEnd: 3, l: "2143213", lStart: 2 },
];

const FORMS = ["natural", "harmonic", "melodic"];
const HANDS = ["R", "L", "both"];
const handName = (hand) => hand === "R" ? "right hand" : hand === "L" ? "left hand" : "hands together";
const accidental = (name) => [...name.slice(1)].reduce((n, value) => n + (value === "#" ? 1 : -1), 0);
const raised = (name) => {
  const alter = accidental(name) + 1;
  return name[0] + (alter > 0 ? "#".repeat(alter) : "b".repeat(-alter));
};
const midi = (name, octave) => 12 * (octave + 1) + NATURAL[name[0]] + accidental(name);
const named = (name, octave) => `${display(name)}${octave}`;

function scaleNotes(key, form, octaves, startOctave) {
  const rising = key.notes.map((name, degree) => form === "harmonic" && degree === 6
    || form === "melodic" && degree >= 5 ? raised(name) : name);
  const falling = form === "melodic" ? key.notes : rising;
  const tonicLetter = LETTERS.indexOf(key.tonic[0]);
  const event = (names, index) => {
    const degree = index % 7;
    const octave = startOctave + Math.floor(index / 7) + (LETTERS.indexOf(names[degree][0]) < tonicLetter ? 1 : 0);
    const name = names[degree];
    return { name, octave, midi: midi(name, octave) };
  };
  const peak = octaves * 7;
  return [...Array.from({ length: peak + 1 }, (_, i) => event(rising, i)),
    ...Array.from({ length: peak }, (_, i) => event(falling, peak - 1 - i))];
}

function scaleFingers(key, form, octaves) {
  const expand = (cycle, end, start) => {
    const values = Array.from({ length: octaves }, () => digits(cycle)).flat();
    if (start !== undefined) values[0] = start;
    return [...values, end];
  };
  const naturalR = expand(key.r, key.rEnd);
  const upR = expand(form === "melodic" && key.melodicR ? key.melodicR : key.r, key.rEnd);
  const naturalL = expand(key.l, Number(key.l[0]), key.lStart);
  const risingL = form !== "natural" && key.harmonicL ? key.harmonicL : key.l;
  const upL = expand(risingL, Number(risingL[0]), key.lStart);
  return {
    R: { up: upR, down: [...naturalR].reverse() },
    L: { up: upL, down: [...(form === "melodic" ? naturalL : upL)].reverse() },
  };
}

// Accidentals are tracked within a bar and octave. A descending melodic-minor
// natural is written explicitly when it cancels the ascent in the same bar.
// Standard fingering decorations are part of the score as well as the text.
function voiceBars(events, fingers, key) {
  const signature = Object.fromEntries(key.notes.map((name) => [name[0], accidental(name)]));
  const count = Math.ceil(events.length / 4) * 4;
  const bars = [], notes = [];
  let state = {};
  events.forEach((event, index) => {
    if (index % 4 === 0) state = {};
    const duration = index === events.length - 1 ? count - events.length + 1 : 1;
    const letter = event.name[0], actual = accidental(event.name), identity = `${letter}${event.octave}`;
    const current = state[identity] ?? signature[letter] ?? 0;
    const prefix = actual === current ? "" : actual > 0 ? "^".repeat(actual) : actual < 0 ? "_".repeat(-actual) : "=";
    state[identity] = actual;
    const pitch = event.octave >= 5 ? letter.toLowerCase() + "'".repeat(event.octave - 5) : letter + ",".repeat(4 - event.octave);
    notes.push(`!${fingers[index]}!${prefix}${pitch}${duration === 1 ? "" : duration}`);
    if (index % 4 === 3 || index === events.length - 1) {
      bars.push(notes.splice(0).join(" "));
    }
  });
  return bars;
}

function abc(title, key, right, left, fingerings, hand) {
  const rightFingers = [...fingerings.R.up, ...fingerings.R.down.slice(1)];
  const leftFingers = [...fingerings.L.up, ...fingerings.L.down.slice(1)];
  const r = voiceBars(right, rightFingers, key), l = voiceBars(left, leftFingers, key);
  const lines = [];
  for (let index = 0; index < r.length; index += 4) {
    const end = index + 4 >= r.length ? " |]" : " |";
    lines.push(`[V:1] ${(hand === "L" ? r.map(() => "z4") : r).slice(index, index + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${(hand === "R" ? l.map(() => "z4") : l).slice(index, index + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title.replace(/♯/g, " sharp").replace(/♭/g, " flat")}\nM:4/4\nL:1/4\nK:${key.tonic}m\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
}

const formExplanation = (key, form) => form === "natural"
  ? `${display(key.tonic)} natural minor keeps the key signature in both directions: ${key.notes.map(display).join("–")}. Its spacing is whole–half–whole–whole–half–whole–whole.`
  : form === "harmonic"
    ? `Keep degree 6 (${display(key.notes[5])}) and raise degree 7 from ${display(key.notes[6])} to ${display(raised(key.notes[6]))} in BOTH directions. Hear the larger gap between degrees 6 and 7 without inserting a pause.`
    : `Use classical melodic minor: raise degree 6 to ${display(raised(key.notes[5]))} and degree 7 to ${display(raised(key.notes[6]))} ascending. Descend with ${display(key.notes[5])} and ${display(key.notes[6])}, the natural-minor form. The form changes while the tonic and key signature stay the same.`;

function fingeringText(key, form, octaves, fingers, arpeggio = false) {
  const range = octaves === 1 ? "one octave" : "two octaves";
  const text = ["R", "L"].map((hand) => `${hand === "R" ? "RH" : "LH"} ${named(key.tonic, hand === "R" ? 4 : 2)}–${named(key.tonic, (hand === "R" ? 4 : 2) + octaves)}: up ${fingers[hand].up.join("–")}; down ${fingers[hand].down.join("–")}.`).join(" ");
  const join = octaves === 2 ? ` At the internal tonic, RH uses ${fingers.R.up[arpeggio ? 3 : 7]} and LH ${fingers.L.up[arpeggio ? 3 : 7]}; these are continuation fingers, not a stop followed by a reset.` : " Stop on the upper tonic, then follow the descending numbers; do not add a repeated top note.";
  const exception = form === "melodic" && key.melodicR ? ` The RH starts with 2 ascending, but uses 3 at the top to begin the natural-minor descent; the ascending and descending patterns deliberately differ.`
    : key.tonic === "G#" && !arpeggio ? form === "natural" ? " The LH uses 4 on F♯ and 1 on E; this differs from G♯ harmonic minor."
      : form === "harmonic" ? " The LH uses 4 on C♯ and 1 on F𝄪 (the white key G); do not copy the natural-minor LH pattern."
        : " The LH uses 4 on C♯ going up, then 4 on F♯ coming down. The restored natural-minor notes require their own descending fingers." : "";
  return `${text} Each hand travels ${range}; when combined the hands remain two octaves apart.${join}${exception}`;
}

function minorScale(key, form, octaves, hand, stageId) {
  const fingers = scaleFingers(key, form, octaves);
  const right = scaleNotes(key, form, octaves, 4), left = scaleNotes(key, form, octaves, 2);
  const title = `${display(key.tonic)} ${form} minor: ${octaves === 1 ? "one octave" : "two octaves"}, ${handName(hand)}`;
  const black = /[#b]/.test(key.tonic);
  return {
    id: `sc-minor-${slug(key.tonic)}-${form}-${octaves}-${hand.toLowerCase()}`,
    section: "scales", unitId: TRACK, trackId: TRACK, stageId, key: `${key.tonic} minor`, title,
    summary: octaves === 1 ? `Find this minor form, learn its ${handName(hand)} crossings and build from a short chunk to a complete octave.` : "Continue through the middle tonic without resetting the hand, then return with the correct form and fingering.",
    minutes: 5, bpm: 40, targetBpm: 64, hands: hand,
    abc: abc(title, key, right, left, fingers, hand),
    fingering: fingeringText(key, form, octaves, fingers),
    steps: [
      `Before playing, find ${named(key.tonic, 4)} for RH and ${named(key.tonic, 2)} for LH, then say the key signature's altered letters. ${formExplanation(key, form)}`,
      `Trace the written finger numbers, then play a three- or four-note group around each thumb crossing with one hand. ${black ? "The tonic is a black key: retain its stated starting finger rather than borrowing C minor's thumb start." : "Move the hand with the arm; a crossing should not twist a fixed wrist or force a stretch."}`,
      hand === "both" ? "Recall each hand once, then pair only four notes. Listen for simultaneous attacks through each hand's different crossing; extend the paired chunk only when the pulse stays comfortable." : `Play ${handName(hand)} slowly, one attack per click. If the turn adds a pause, stop and work just the two notes either side of it; then reconnect the short group.`,
      octaves === 2 ? "Isolate the three notes before and after the middle tonic. Keep its continuation finger in motion instead of finishing a one-octave scale and restarting. Join the full ascent before practising the descent as its own line." : "Join the ascent, then the descent, before combining the written round trip. Keep the final tonic for its written length. A secure chunk is useful practice; record whether today's scope was a chunk or the whole octave.",
      form === "harmonic" ? `Hear ${display(raised(key.notes[6]))} resolving upward to ${display(key.tonic)}. Play just those two notes, then find the same raised seventh in the dominant chord before joining the scale again.` : form === "melodic" ? `Sing or imagine ${display(raised(key.notes[5]))}–${display(raised(key.notes[6]))}–${display(key.tonic)} rising, then ${display(key.tonic)}–${display(key.notes[6])}–${display(key.notes[5])} falling. Make a short answering phrase with that different return; a held tonic in the other hand can help you hear home.` : `Sing or imagine the final ${display(key.notes[6])}–${display(key.tonic)} step. Compare its whole-step approach with harmonic minor's raised-seventh half step; make a short three-note answer that returns to the tonic.`,
      "Play once softly and once at a comfortably fuller tone without changing pace. On a later day try your chosen scope before playback, name one uneven crossing, and repair that detail before adding range or speed.",
    ],
    listenFor: ["The thumb crossing has the same tone and timing as its neighbours.", form === "melodic" ? "The raised sixth and seventh are heard on ascent and restored on descent." : "The chosen minor form stays consistent in both directions.", "A longer range does not make the second half faster or louder."],
    checks: ["I can name the changed notes and follow the written fingers at a comfortable pulse.", "I can describe my actual scope: a crossing chunk, full ascent, or full round trip.", "I will try the same scope on another day before calling it reliable."],
    skillIds: [`${form}-minor`, "scale-fingering", octaves === 2 ? "scale-continuation" : "thumb-crossing", hand === "both" ? "coordination" : "even-touch"],
    source: { label: key.tonic === "G#" ? "Original Woodshed minor-scale practice; fingering reference: University of Miami lesson chart" : "Original Woodshed minor-scale practice; fingering reference: Margaret Denton", url: key.tonic === "G#" ? MIAMI : DENTON, scope: "Standard scale notes and fingering facts were checked against Margaret Denton's teaching chart, Eastern Illinois University's harmonic-minor appendix, and the linked Miami chart for G-sharp's changing LH pattern. Woodshed supplies the notation setting, register, pacing and self-checks; this is not an exam-grade claim." },
    technique: { pattern: `${form}-minor`, tonic: key.tonic, quality: "minor", octaves, tonicMidi: { R: right[0].midi, L: left[0].midi }, fingerings: fingers },
  };
}

function arpeggioFingers(key, octaves) {
  let r = [1, 2, 3], endR = 5, l = [1, 4, 2], startL = 5;
  if (["C#", "F#", "G#"].includes(key.tonic)) { r = [4, 1, 2]; endR = 4; l = [2, 1, 4]; startL = 2; }
  if (key.tonic === "Bb") { r = [2, 3, 1]; endR = 2; l = [3, 2, 1]; startL = 3; }
  if (key.tonic === "Eb") { l = [1, 3, 2]; startL = 5; }
  const upR = [...Array.from({ length: octaves }, () => r).flat(), endR];
  const upL = [...Array.from({ length: octaves }, () => l).flat(), l[0]];
  upL[0] = startL;
  return { R: { up: upR, down: [...upR].reverse() }, L: { up: upL, down: [...upL].reverse() } };
}

function minorArpeggio(key, octaves, hand, stageId) {
  const notes = (startOctave) => {
    const line = scaleNotes(key, "natural", octaves, startOctave).slice(0, octaves * 7 + 1);
    const rising = line.filter((_, index) => index % 7 === 0 || index % 7 === 2 || index % 7 === 4);
    return [...rising, ...rising.slice(0, -1).reverse()];
  };
  const right = notes(4), left = notes(2), fingers = arpeggioFingers(key, octaves);
  const title = `${display(key.tonic)} minor arpeggio: ${octaves === 1 ? "one octave" : "two octaves"}, ${handName(hand)}`;
  return {
    id: `sc-arpeggio-${slug(key.tonic)}-minor-${octaves}-${hand.toLowerCase()}`,
    section: "scales", unitId: TRACK, trackId: TRACK, stageId, key: `${key.tonic} minor`, title,
    summary: "Travel through root, minor third and fifth, releasing and carrying the hand instead of holding an octave stretch.",
    minutes: 5, bpm: 40, targetBpm: 60, hands: hand,
    abc: abc(title, key, right, left, fingers, hand),
    fingering: fingeringText(key, "arpeggio", octaves, fingers, true),
    steps: [
      `Name the triad ${[key.notes[0], key.notes[2], key.notes[4]].map(display).join("–")}. Find the starting ${named(key.tonic, 4)} for RH or ${named(key.tonic, 2)} for LH. An arpeggio uses chord tones, not every note of the scale.`,
      "Play just root–third–fifth, then release and silently carry the hand toward the next tonic. Learn the next position without keeping the previous fingers stretched down; do not force an octave span.",
      `${hand === "both" ? "Recall both hands separately, then pair one three-note group before joining the next tonic." : "Join one chord-tone group to its next tonic with the written fingers."} Play one note per comfortable beat, with the crossing as even as the other moves.`,
      octaves === 2 ? "At the internal tonic keep the continuation finger, then play the next third and fifth. The middle tonic belongs to the continuous line; save the endpoint finger for the top. Practise the descent separately before joining the round trip." : "Pause after the ascending octave, then work the descent with the written reverse fingers. Join the written round trip only when both directions feel comfortable.",
      "Choose one chord-tone group and make it quietly even. In a later musical study, find the same root/third/fifth shape in a broken accompaniment; on another day try the arpeggio before hearing the model.",
    ],
    listenFor: ["Each chord tone has a clear, even attack through the hand travel.", "The third sounds minor; extra scale notes have not crept into the pattern.", "Joining a new position does not add a thinking pause or a louder thumb."],
    checks: ["I can name the root, minor third and fifth and use their written fingers.", "I can carry the hand between groups without holding a stretched shape.", "I can state whether I played a group, an ascending octave, or the full written round trip."],
    skillIds: ["minor-arpeggio", "chord-tones", octaves === 2 ? "arpeggio-continuation" : "hand-travel", hand === "both" ? "coordination" : "even-touch"],
    source: { label: "Original Woodshed arpeggio practice; fingering reference: Eastern Illinois University", url: EIU, scope: "Root-position minor-arpeggio notes and one/two-octave fingering facts follow the university chart. This setting supplies its own register, rhythm, teaching guidance and self-checks. E-flat minor deliberately uses thumb on black keys, as in the chart; the all-black triad differs from the other black-tonic families." },
    technique: { pattern: "arpeggio", tonic: key.tonic, quality: "minor", octaves, tonicMidi: { R: right[0].midi, L: left[0].midi }, fingerings: fingers },
  };
}

const definitions = [
  { id: "sc-minor-neighbours-natural", title: "Minor neighbours: A, D, E and G", description: "Begin with natural minor and connect each key to its familiar relative major: C, F, G and B-flat.", prerequisites: ["Recall a comfortable one-octave scale in one hand; the original A-minor unit is a useful starting point."], keys: MINOR_KEYS.slice(0, 4), forms: ["natural"], octaves: 1 },
  { id: "sc-minor-neighbours-harmonic", title: "Hear the raised seventh", description: "Return to A, D, E and G minor with a raised seventh in both directions, connecting the sound to a major dominant chord.", prerequisites: ["Name the natural-minor notes and play a comfortable chunk in the chosen key."], keys: MINOR_KEYS.slice(0, 4), forms: ["harmonic"], octaves: 1 },
  { id: "sc-minor-neighbours-melodic", title: "A different way down", description: "Learn classical melodic minor in A, D, E and G: raised sixth/seventh upward, natural minor downward.", prerequisites: ["Distinguish natural and harmonic minor by their seventh; keep one-octave fingerings comfortable."], keys: MINOR_KEYS.slice(0, 4), forms: ["melodic"], octaves: 1 },
  { id: "sc-minor-more-white", title: "More minor colours: B, C and F", description: "Extend the three forms to three more white-tonic keys, noticing B's left-hand start and F's right-hand turn.", prerequisites: ["Recall the difference among the three minor forms before playback in one familiar key."], keys: MINOR_KEYS.slice(4, 7), forms: FORMS, octaves: 1 },
  { id: "sc-minor-black", title: "Minor keys beginning on black keys", description: "Complete the twelve minor tonics with F-sharp, C-sharp, G-sharp, B-flat and E-flat; learn the fingering family as well as the notes.", prerequisites: ["Keep separate-hand crossings even and read the selected key signature; take one key and form at a time."], keys: MINOR_KEYS.slice(7), forms: FORMS, octaves: 1 },
  { id: "sc-minor-two-octaves", title: "Continue minor scales through two octaves", description: "Return to each learned key and form with the continuation finger at the middle tonic. Range grows before tempo.", prerequisites: ["Recall the chosen one-octave form and fingerings on another day; a chunk or one-hand visit remains useful."], keys: MINOR_KEYS, forms: FORMS, octaves: 2 },
  { id: "sc-minor-arpeggios-one", title: "Minor triads become arpeggios", description: "Begin with A, D, E and G, then transfer the root–third–fifth pattern across all twelve minor tonics over one octave.", prerequisites: ["Name the chosen minor triad and move between its positions without holding a stretch."], keys: MINOR_KEYS, arpeggio: true, octaves: 1 },
  { id: "sc-minor-arpeggios-two", title: "Carry minor arpeggios through two octaves", description: "Join the middle tonic without resetting, preserving the key's own arpeggio fingering rather than its scale fingering.", prerequisites: ["Recall a comfortable one-octave arpeggio in the chosen key, then learn the internal-tonic continuation."], keys: MINOR_KEYS, arpeggio: true, octaves: 2 },
];

export const MINOR_SCALE_EXERCISES = definitions.flatMap((stage) => stage.keys.flatMap((key) => stage.arpeggio
  ? HANDS.map((hand) => minorArpeggio(key, stage.octaves, hand, stage.id))
  : stage.forms.flatMap((form) => HANDS.map((hand) => minorScale(key, form, stage.octaves, hand, stage.id)))));

export const MINOR_SCALE_STAGES = definitions.map(({ id, title, description, prerequisites }) => ({
  id, title, description, prerequisites,
  exerciseIds: MINOR_SCALE_EXERCISES.filter((exercise) => exercise.stageId === id).map((exercise) => exercise.id),
}));
