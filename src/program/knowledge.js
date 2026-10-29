// Short concept checks belong inside the existing lessons. These assess an
// answer about music, never the learner's physical piano performance.
const staff = (notes, clef = "treble", key = "C") => `X:1\nM:4/4\nL:1/4\nK:${key} clef=${clef}\n${notes}|]`;
const question = (id, prompt, options, answer, explanation, extra = {}) => ({ id, version: 1, prompt, options, answer, explanation, ...extra });

// Retain these definitions to interpret answers in earlier saved practice.
// They are historical metadata; the removed units are not an active course.
const ARCHIVED_QUESTIONS = [
  question("bridge-bb-signature", "Which letters are flattened by B-flat major's key signature?", ["B and E", "B only", "B, E and A"], 0, "B-flat major has two flats: B-flat and E-flat. They apply in both clefs and every octave unless an accidental changes a particular note."),
  question("bridge-eb-signature", "Which letters are flattened by E-flat major's key signature?", ["B and E", "B, E and A", "E, A and D"], 1, "E-flat major has B-flat, E-flat and A-flat. The order of flats begins B, E, A, D, G, C, F."),
  question("bridge-dm-signature", "D minor has which key signature, before any harmonic-minor accidentals?", ["One flat: B-flat", "One sharp: C-sharp", "No sharps or flats"], 0, "D natural minor shares F major's one-flat signature. Harmonic minor raises C to C-sharp with an accidental; C-sharp is not part of the D-minor key signature."),
  question("bridge-em-signature", "Which note is in E minor's key signature?", ["D-sharp", "F-sharp", "B-flat"], 1, "E minor shares G major's F-sharp signature. Harmonic minor separately raises D to D-sharp as an accidental."),
  question("bridge-gm-signature", "Which notes belong to G minor's key signature?", ["F-sharp and C-sharp", "B-flat only", "B-flat and E-flat"], 2, "G minor shares B-flat major's two flats. Harmonic minor raises F to F-sharp with an accidental; that does not replace the two-flat signature."),
  question("bridge-bb-cadence", "Which route is I–IV–V7–I in B-flat major?", ["Bb–Eb–F7–Bb", "Bb–D–F–Bb", "Bbm–Ebm–F7–Bbm"], 0, "The roots are B-flat, E-flat and F. F7 contains F–A–C–E-flat, including its seventh E-flat, before returning to B-flat major."),
  question("bridge-eb-cadence", "Which route is I–IV–V7–I in E-flat major?", ["Eb–G–Bb–Eb", "Eb–Ab–Bb7–Eb", "Ebm–Abm–Bb7–Ebm"], 1, "The roots are E-flat, A-flat and B-flat. Bb7 contains B-flat–D–F–A-flat, including the A-flat seventh."),
  question("bridge-dm-cadence", "Which dominant seventh helps lead home to D minor?", ["Am7: A–C–E–G", "A7: A–C#–E–G", "D7: D–F#–A–C"], 1, "D minor's i–iv–V7–i route is Dm–Gm–A7–Dm. C-sharp is A7's major third and leads upward by a half step to D."),
  question("bridge-em-cadence", "Which dominant seventh helps lead home to E minor?", ["B7: B–D#–F#–A", "Bm7: B–D–F#–A", "E7: E–G#–B–D"], 0, "Em–Am–B7–Em uses D-sharp in B7. That raised seventh approaches E by a half step; F-sharp still comes from the E-minor signature."),
  question("bridge-gm-cadence", "Which dominant seventh helps lead home to G minor?", ["Dm7: D–F–A–C", "G7: G–B–D–F", "D7: D–F#–A–C"], 2, "Gm–Cm–D7–Gm uses F-sharp in D7. Its F-sharp approaches G by a half step; the key signature keeps B-flat and E-flat."),
  question("bridge-bb-ear", "Listen to the simultaneous tonic chord. Which quality do you hear?", ["Major triad", "Minor triad", "A single note"], 0, "B-flat3–D4–F4 is B-flat major. B-flat to D spans four semitones; lowering D to D-flat would make the triad minor.", { audio: [58, 62, 65].map((midi) => ({ midi, beat: 0, dur: 2, hand: "R" })), audioBeats: 2.5 }),
  question("bridge-eb-ear", "Listen to the simultaneous tonic chord. Which quality do you hear?", ["Minor triad", "Major triad", "A single note"], 1, "E-flat4–G4–B-flat4 is E-flat major. E-flat to G spans four semitones; lowering G to G-flat would make the triad minor.", { audio: [63, 67, 70].map((midi) => ({ midi, beat: 0, dur: 2, hand: "R" })), audioBeats: 2.5 }),
  ...[
    ["dm", "D", "C", "C-sharp", 72, 73, 74],
    ["em", "E", "D", "D-sharp", 74, 75, 76],
    ["gm", "G", "F", "F-sharp", 77, 78, 79],
  ].map(([id, tonic, seventh, raised, naturalMidi, raisedMidi, tonicMidi]) => question(`bridge-${id}-ear`, "Listen to the two approaches to the same upper tonic. How far below the tonic is the first note of the second pair?", ["A half step", "A whole step", "A perfect fifth"], 0, `The first pair is ${seventh}–${tonic}, a whole step. The second pair raises ${seventh} to ${raised}, making the final approach to ${tonic} a half step. Sing both pairs before finding them on the piano.`, { audio: [[naturalMidi, 0], [tonicMidi, 1.25], [raisedMidi, 3], [tonicMidi, 4.25]].map(([midi, beat]) => ({ midi, beat, dur: 0.75, hand: "R" })), audioBeats: 5.5 })),
];

const INTEGRATION_QUESTIONS = [
  question("canon-minor-travel", "Which two released LH moves match these Canon preparations?", [
    "B2 to D3–F#3–B3; F#2 to A2–C#3–F#3",
    "B2 to D3–F3–B3; F#2 to A2–C3–F#3",
    "B3 to D4–F#4–B4; F#3 to A3–C#4–F#4",
  ], 0, "The low B2 moves to the upper B-minor shape D3–F#3–B3. The low F#2 moves to A2–C#3–F#3, the F#-minor shape. Release each bass before travelling; the low root and upper chord are separate placements.", { abc: staff("B,, [D,F,B,] F,, [A,,C,F,]", "bass", "D") }),
  question("mozart-opening-position", "Which RH fingers keep this opening pitch gesture in its prepared A4–E5 position?", [
    "3–1–3–5, crossing the thumb onto D5",
    "3–4–3–5, with no thumb crossing",
    "1–2–1–3, moving the thumb onto C#5",
  ], 1, "Keep A4–B4–C#5–D5–E5 under fingers 1–2–3–4–5. C#5–D5–C#5–E5 therefore uses 3–4–3–5. This shows the pitches only; preserve Mozart's already-prepared dotted rhythm when applying them to the melody.", { abc: staff("c d c e", "treble", "A") }),
  question("switchyard-sevenths", "Which notes match E7's seventh, A7's seventh and B7's third in Switchyard?", [
    "D natural, G natural, D#",
    "D#, G#, D natural",
    "D natural, G#, D natural",
  ], 0, "E7 is E–G#–B–D, so its seventh is D natural. A7 is A–C#–E–G, with G natural as its seventh. B7 is B–D#–F#–A: D# is its third, while A is its seventh. The written naturals and sharps follow the current harmony.", { abc: staff("=d2 =G ^d", "treble", "E") }),
  question("switchyard-tone-listening", "Listen to the highest note of two chords: E7, then B7. How does that note change?", [
    "D5 stays natural in both chords",
    "D5 falls a whole step to C5",
    "D5 rises a half step to D#5",
  ], 2, "The highest voice moves from D5 in E7 to D#5 in B7. Sing that half-step rise, then find the written D natural in Switchyard's E7 call and D# in its B7 turn. These are seventh and third chord tones respectively; both choices belong to the printed blues harmony.", {
    audio: [[64, 0], [68, 0], [71, 0], [74, 0], [59, 3], [66, 3], [69, 3], [75, 3]].map(([midi, beat]) => ({ midi, beat, dur: 1.75, hand: "R" })), audioBeats: 5.5,
  }),
];

export const QUESTIONS = [
  question("half-step", "Which pair of white keys is a half step apart?", ["E–F", "C–D", "F–G"], 0, "E–F are adjacent piano keys with no black key between. C–D and F–G each contain two semitones, a whole step."),
  question("whole-step", "Starting on C, a whole step upward reaches…", ["C#", "D", "E"], 1, "C–C# is one semitone; C#–D is another. Two semitones make a whole step."),
  question("major-pattern", "Which sequence builds a major scale? W = whole step, H = half step.", ["W W H W W W H", "W H W W H W W", "W W W H W W H"], 0, "A major scale follows whole–whole–half–whole–whole–whole–half. C major's half steps are E–F and B–C.", { teach: "A whole step spans two semitones; a half step spans one adjacent keyboard key, including black keys." }),
  question("tetrachords", "Which two tetrachords form A major, with a whole step between them?", ["A B C# D / E F# G# A", "A B C D / E F G A", "A B C# D# / E F# G# A"], 0, "Each group of four is W–W–H: A–B–C#–D and E–F#–G#–A. D–E is the whole-step link.", { teach: "A major scale contains two four-note groups, called tetrachords. Each has whole–whole–half spacing, with a whole step connecting the groups." }),
  question("sixth-number", "Count both endpoints: what interval number is C up to A?", ["Fifth", "Sixth", "Seventh"], 1, "C D E F G A contains six letter positions. The interval number counts the starting and ending notes.", { abc: staff("C2 A2"), teach: "Interval numbers count letter positions inclusively, whether the notes sound one after another or together." }),
  question("seventh-number", "What interval number is D up to C in the next octave?", ["Sixth", "Seventh", "Octave"], 1, "D E F G A B C contains seven letter positions. Do not count only the gaps.", { abc: staff("D2 c2") }),
  question("harmonic-interval", "The two written notes sound together. What interval number do they make?", ["Third", "Sixth", "Seventh"], 1, "E F G A B C is six letter positions, so E4–C5 is a harmonic sixth.", { abc: staff("[Ec]4"), teach: "A melodic interval is heard successively; a harmonic interval is heard simultaneously." }),
  question("sharp-order", "The first four sharps in key signatures appear in which order?", ["F# C# G# D#", "C# F# D# G#", "F# G# A# B#"], 0, "Sharp signatures add F, C, G, D, A, E, B in that order. A uses the first three; E uses the first four."),
  question("g-signature", "In G major, an F with no accidental sounds as…", ["F natural", "F sharp", "G flat"], 1, "The F-sharp signature applies to every F in either clef and register unless an accidental overrides it."),
  question("f-signature", "Which note changes in the F-major signature?", ["B becomes B flat", "F becomes F sharp", "E becomes E flat"], 0, "F major has one flat: B flat. The right-hand scale crosses after finger 4 so the thumb arrives on C."),
  question("d-signature", "Which changed notes belong to D major?", ["F# and C#", "F# and G#", "B flat and E flat"], 0, "D major has F sharp and C sharp in every octave."),
  question("a-signature", "Which notes are sharpened in A major?", ["F# C# G#", "F# C# D#", "C# D# G#"], 0, "A major adds G sharp to D major's F sharp and C sharp."),
  question("e-signature", "Which new sharp does E major add to A major's signature?", ["A#", "D#", "E#"], 1, "E major has F#, C#, G# and D#. D# lies a half step below the tonic E."),
  question("minor-leading", "Which note changes from A natural minor to A harmonic minor?", ["F becomes F#", "G becomes G#", "C becomes C#"], 1, "Harmonic minor raises the seventh degree: G# leads by a half step to A. Natural minor keeps G natural."),
  question("triad-inversion", "E–G–C contains which chord, and what is its lowest note?", ["C major, with E lowest", "E minor, with E lowest", "G major, with C lowest"], 0, "C–E–G remains C major when reordered E–G–C. E is the bass of the upper voicing; C remains the chord root.", { abc: staff("[EGc]4"), teach: "Inverting a triad changes the lowest chord tone, not its three note names or root." }),
  question("a-primary", "In A major, which chords are I, IV and V7?", ["A, D, E7", "A, C, G7", "Am, Dm, E7"], 0, "Build on scale degrees 1, 4 and 5: A, D and E7. E7 spells E–G#–B–D."),
  question("c-primary", "In C major, which route is I–IV–V7–I?", ["C–F–G7–C", "C–G–Am–F", "Am–Dm–E7–Am"], 0, "The primary route uses C, F and G7 before returning to C. G7 contains G–B–D–F; it is more than the G-major triad."),
  question("g-primary", "Which dominant seventh returns toward G major?", ["D7: D–F#–A–C", "D minor: D–F–A", "G7: G–B–D–F"], 0, "G major's V7 is D7. Its F sharp and C guide the return to G and B."),
  question("f-primary", "Which dominant seventh belongs in F major's I–IV–V7 route?", ["C7: C–E–G–Bb", "C major: C–E–G only", "F7: F–A–C–Eb"], 0, "F–Bb–C7 uses the primary roots F, Bb and C. C7 adds B flat, the key's one flat."),
  question("e-primary", "Which notes make the complete B7 chord used as V7 in E?", ["B D# F# A", "B D F# A", "B D# F# A#"], 0, "B7 is B–D#–F#–A. D# is its major third and A its minor seventh; both guide the return to E."),
  question("d-primary", "The chord A–C#–E–G is…", ["A major", "A7", "A minor"], 1, "Adding G to A–C#–E makes A7, the dominant seventh used to return to D."),
  question("dotted-quarter", "A dotted quarter lasts how many eighth notes?", ["Two", "Three", "Four"], 1, "A dot adds half the original value. A quarter is two eighths; its dot adds one more."),
  question("tie-attack", "Two equal-pitch notes are joined by a tie. At the second written note you…", ["Strike the key again", "Keep holding without a new attack", "Always release the key"], 1, "A tie combines written durations into one sound. Keep counting across its second note even though there is no new attack."),
  question("six-eight", "In a typical 6/8 bar, what are the two main beats?", ["Two dotted quarters, each containing three eighths", "Two quarters, each containing two eighths", "Six half notes"], 0, "6/8 normally groups six eighths as 3+3. The main pulse is the dotted quarter: ONE-la-li TWO-la-li."),
  question("three-eight", "A 3/8 bar contains how many sixteenth-note units?", ["Three", "Six", "Eight"], 1, "Each eighth contains two sixteenths, so three eighths contain six. The Für Elise pickup contains only the final two of those units."),
  question("ledger-bass-e", "Name the note shown on the ledger line below the bass staff.", ["E2", "G2", "C3"], 0, "The bottom bass line is G2; the ledger line immediately below is E2. Find it as a landmark instead of counting from middle C.", { abc: staff("E,,4", "bass") }),
  question("ledger-middle-c", "Name the note on the ledger line above this bass staff.", ["C3", "C4 (middle C)", "E4"], 1, "The ledger line immediately above the bass staff is middle C, C4. The same key is below the treble staff.", { abc: staff("C4", "bass") }),
  question("ledger-treble-a", "Name the note on the first ledger line above the treble staff.", ["F5", "A5", "C6"], 1, "The treble staff ends at F5; the space above is G5 and the first ledger line above is A5.", { abc: staff("a4") }),
  question("binary-form", "A complete piece has two contrasting sections, A then B. Repeating each gives A A B B. Its basic form is…", ["Binary (AB)", "Ternary (ABA)", "A scale"], 0, "The repeats do not create new sections. Two contrasting sections make binary form, AB."),
  question("ternary-form", "After contrasting section B, the opening A returns. The basic plan A–B–A is…", ["Binary", "Ternary", "A chord inversion"], 1, "Ternary form presents an opening, a contrast, and a recognizable return. A varied return can be labeled A′."),
  question("repeat-endings", "On the second pass through this repeated section, what do the 1/2 ending brackets mean?", ["Play both endings again", "Skip the first ending and take the second", "Start the piece from the very beginning"], 1, "The first ending belongs to the first pass; on the repeated pass, skip it and play the second ending.", { abc: "X:1\nM:4/4\nL:1/4\nK:C\n|: C D E F |[1 G4 :|[2 C4 |]" }),
  question("common-time", "What does the C-shaped time-signature symbol in this example mean?", ["Common time: four quarter-note beats per bar", "Three eighth-note beats per bar", "Play only C notes"], 0, "Common time is another notation for 4/4. The C-shaped symbol describes the meter, not the key or the note names.", { abc: "X:1\nM:C\nL:1/4\nK:C\nC D E F|]" }),
  question("crescendo", "A crescendo asks for…", ["Gradually louder sound", "Gradually faster tempo", "Sudden silence"], 0, "Crescendo changes loudness, not the underlying tempo. Keep the beat steady while shaping the phrase."),
  question("ritardando", "Ritardando asks for…", ["Gradually softer sound", "Gradually slower tempo", "Short detached notes"], 1, "Ritardando is a gradual slowing. It is different from diminuendo, which means gradually softer."),
  question("articulation", "Which description matches staccato while preserving rhythm?", ["Release notes early to leave space; keep attacks on time", "Rush every short note", "Hold every key until the next bar"], 0, "Staccato concerns separation and release. It does not remove counted time or move the next attack."),
  question("pedal-change", "For a clear connected pedal change, which sequence is useful?", ["Play the new harmony, release the old pedal, press again while the keys are held", "Keep the pedal down through every harmony", "Lift all keys and pedal well before every new chord"], 0, "Hold the newly played keys while the pedal clears the previous harmony, then depress again. Without a sustain pedal, use the written releases and finger connection."),
  question("fermata", "A fermata above a final note means…", ["Hold it beyond its usual written duration, shaped by the musical ending", "Always double the tempo", "Repeat the note three times"], 0, "A fermata extends a note or rest. Its exact length is a musical choice; count the written value first, then let the ending settle."),
  question("parallel-motion", "Both hands play the same pattern an octave apart, moving upward together. This is…", ["Parallel motion", "Contrary motion", "Staccato"], 0, "Parallel motion keeps the same interval between the hands as they move in the same direction. Their finger crossings may still occur at different times."),
  question("contrary-motion", "The RH moves up while the LH moves down. This is…", ["Parallel motion", "Contrary motion", "A repeated note"], 1, "In contrary motion the hands move in opposite directions. Begin with a short five-note span so the direction, not speed, is the goal."),
  question("question-answer", "Which plan can make a question-and-answer phrase in C?", ["Let the first phrase lean on G harmony and the answer settle on C", "Stop counting whenever a phrase ends", "Make every phrase end at a random point in the bar"], 0, "An open dominant ending can suggest continuation, while a tonic ending can sound settled. This is one useful phrase design, not a rule for every melody."),
  question("blues-four", "In an E-major twelve-bar blues, which chord is IV?", ["A", "B", "C#m"], 0, "IV is built on the fourth degree, A. Blues arrangements may use dominant-seventh colors, but the root relationships remain E/A/B."),
  question("ear-third", "Listen to the two successive notes. Which interval number do you hear?", ["Second", "Third", "Fifth"], 1, "The example is A3 up to C4, a third. Sing the two notes back and compare with the letter span A–B–C.", { audio: [{ midi: 57, beat: 0, dur: 0.75, hand: "R" }, { midi: 60, beat: 1.25, dur: 0.75, hand: "R" }], audioBeats: 2.5 }),
  question("ear-fifth", "Listen to the two successive notes. Which interval number do you hear?", ["Third", "Fourth", "Fifth"], 2, "The example is C4 up to G4, a fifth. After answering, find the two keys and sing the space between them.", { audio: [{ midi: 60, beat: 0, dur: 0.75, hand: "R" }, { midi: 67, beat: 1.25, dur: 0.75, hand: "R" }], audioBeats: 2.5 }),
  question("ear-sixth", "Listen to the two successive notes. Which interval number do you hear?", ["Fourth", "Sixth", "Octave"], 1, "The example is C4 up to A4, a sixth. Sing the two notes and then compare the letter span C–D–E–F–G–A.", { audio: [{ midi: 60, beat: 0, dur: 0.75, hand: "R" }, { midi: 69, beat: 1.25, dur: 0.75, hand: "R" }], audioBeats: 2.5 }),
  question("ear-seventh", "Listen to the two successive notes. Which interval number do you hear?", ["Fifth", "Sixth", "Seventh"], 2, "The example is C4 up to B4, a seventh. Compare it with C4–C5: the upper B lies one half step below that octave.", { audio: [{ midi: 60, beat: 0, dur: 0.75, hand: "R" }, { midi: 71, beat: 1.25, dur: 0.75, hand: "R" }], audioBeats: 2.5 }),
  question("ear-minor", "Listen to the simultaneous chord. Which quality is it?", ["Major triad", "Minor triad", "A single note"], 1, "A3–C4–E4 is an A-minor triad. Its root-to-third distance is three semitones; compare A–C#–E to hear major.", { audio: [57, 60, 64].map((midi) => ({ midi, beat: 0, dur: 2, hand: "R" })), audioBeats: 2.5 }),
  ...INTEGRATION_QUESTIONS,
  ...ARCHIVED_QUESTIONS.map((question) => ({ ...question, archived: true })),
];
export const ACTIVE_QUESTIONS = QUESTIONS.filter((question) => !question.archived);

export const QUESTION_BY_ID = Object.freeze(Object.assign(Object.create(null), Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))));
const LINKS = {
  "scale-c-five-r": ["half-step", "whole-step"],
  "scale-c-octave-r": ["major-pattern"], "scale-c-octave-l": ["major-pattern"],
  "chord-inversions": ["triad-inversion"], "chord-c": ["ear-fifth"],
  "rhythm-dotted": ["dotted-quarter"], "rhythm-ties": ["tie-attack"],
  "read-family-c": ["ledger-middle-c"], "read-bass-neighbors": ["ledger-middle-c"],
  "g-key-f-sharp": ["g-signature"], "g-read-f-sharp": ["g-signature"],
  "g-scale-r": ["major-pattern"], "g-chords-gcd7": ["g-primary", "triad-inversion"],
  "f3-read-b-flat": ["f-signature"], "f3-scale-octave-r": ["f-signature"], "f3-chord-b-flat-c7": ["f-primary"],
  "m8-cadence-transfer": ["c-primary"],
  "m8-expression-lab": ["common-time"],
  "a6-interval-sixths": ["ear-sixth"], "a6-interval-sevenths": ["ear-seventh"],
  "a4-hear-g-sharp": ["minor-leading", "ear-minor"], "a4-rhythm-three-eighths": ["three-eight"],
  "a4-read-bass-landmarks": ["ledger-bass-e"], "a4-chord-am": ["ear-minor"],
  "d-signature": ["d-signature", "sharp-order"], "d-chords-home": ["d-primary"],
  "d-six-eight-pulse": ["six-eight"], "d-first-read-b": ["ledger-middle-c"],
};

export function knowledgeForExercise(exercise) {
  const ids = [...new Set([...(Object.hasOwn(LINKS, exercise.id) ? LINKS[exercise.id] : []), ...(exercise.knowledgeIds || [])])];
  return ids.map((id) => QUESTION_BY_ID[id]).filter((question) => question && !question.archived);
}

export function normalizeKnowledge(raw) {
  const out = new Map();
  for (const item of Array.isArray(raw) ? raw : []) {
    const q = item && QUESTION_BY_ID[item.questionId];
    if (!q || (item.version !== undefined && item.version !== q.version) || !Number.isInteger(item.choice) || item.choice < 0 || item.choice >= q.options.length) continue;
    out.set(q.id, { questionId: q.id, version: q.version, choice: item.choice, correct: item.choice === q.answer });
  }
  return [...out.values()];
}

export function knowledgeProgress(progress, questionId) {
  const evidence = (Array.isArray(progress?.attempts) ? progress.attempts : []).filter(Boolean).flatMap((attempt) => normalizeKnowledge(attempt.knowledgeResults).filter((result) => result.questionId === questionId).map((result) => ({ ...result, date: attempt.date, exerciseId: attempt.exerciseId })));
  return { count: evidence.length, latest: evidence.at(-1) || null, evidence };
}
