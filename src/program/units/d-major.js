export const UNIT = {
  id: "d-major-foundations-5", number: 5, key: "D major",
  title: "D major: build a Canon bass and chord arrangement",
  description: "Five practice days, two twenty-minute visits per day. Return to one sourced harmonic project: Pachelbel's eight-note Canon bass, stretched into a student piano arrangement. Learn D's two sharps, close harmony and a bass-and-chord texture; prepare compound meter separately. Repeat a passage before adding another layer.",
  daysPerWeek: 5, sessionsPerDay: 2, sessionMinutes: 20,
  materialNote: "The Canon bass is derived from Michael Fischer v. Mollard's Mutopia 2047 edition (CC BY 4.0). The chord voicings, piano melody, rhythms, dynamics and practice versions are new student arrangements, not a transcription of Pachelbel's violin counterpoint or an original Canon piano version. The short reading and 6/8 examples are original exercises.",
  prerequisites: ["Keep an easy four-beat pulse through rests and held notes, and read a short phrase in both clefs.", "Find major/minor triads and move the whole hand between simple bass positions without forcing a stretch.", "Try a held-bass version before a moving LH pattern; no keyboard connection is required."],
  moveOn: ["Read C sharp and F sharp from the signature and name the changing bass roots without a model.", "Play a chosen Canon passage with a continuing count, a quieter accompaniment and a clear plan for the next join.", "On a later visit, read a different short example before playback and describe the specific issue to repair. Completion time is not a mastery test."],
  support: ["If two new sharps distract from coordination, practice only the signature and bass map, then return to the held-chord version.", "Keep the LH single-note answer instead of full chords until its travel is comfortable. Release before moving; do not hold an octave stretch.", "6/8 is a separate preparation. Stay with counting and tapping if the two groups of three are not clear; it is not a condition for enjoying the 4/4 Canon project."],
  musicIds: ["d-canon-blocks", "d-canon-bass-chords"],
};

const original = { label: "Original Woodshed D-major exercise", scope: "Short original studies prepare the key signature, bass patterns and meter used in this unit." };
const canon = {
  label: "Pachelbel Canon bass; source edition by Michael Fischer v. Mollard, Mutopia-2015/09/02-2047 (CC BY 4.0)",
  url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047",
  scope: "Derived from the inspected cello part and LilyPond source for Canon per 3 Violini e Basso. Edition license: Creative Commons Attribution 4.0, https://creativecommons.org/licenses/by/4.0/. Only the eight-note bass is quoted; chord symbols and piano realizations are instructional additions.",
  changes: "The source has D3–A2–B2–F sharp2 | G2–D2–G2–A2 as quarter notes in two 4/4 bars. The expanded arrangement preserves those bass pitches but gives each a full bar, adds original upper parts and expression, and adds a held D3 closing bar. It omits the three canonic violin parts and the remaining cycles.",
};
const grand = (title, r, l, { unit = "1/4", meter = "4/4" } = {}) => {
  if (r.length !== l.length) throw new Error(`Unmatched hands: ${title}`);
  const lines = [];
  for (let i = 0; i < r.length; i += 4) {
    const end = i + 4 >= r.length ? " |]" : " |";
    lines.push(`[V:1] ${r.slice(i, i + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${l.slice(i, i + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:${meter}\nL:${unit}\nK:D\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
};
const rests = (n, value = "z4") => Array(n).fill(value);
const ex = (x) => ({ unitId: UNIT.id, key: UNIT.key, section: "guided", minutes: 4, bpm: 48, targetBpm: 64, hands: "both", source: original, ...x });
const bass = ["D,", "A,,", "B,,", "F,,", "G,,", "D,,", "G,,", "A,,"];
const chord = ["[DFA]", "[CEA]", "[DFB]", "[CFA]", "[DGB]", "[DFA]", "[DGB]", "[CEA]"];
const labels = ["D", "A", "Bm", "F#m", "G", "D", "G", "A"];
const upperLH = ["[F,A,D]", "[C,E,A,]", "[D,F,B,]", "[A,,C,F,]", "[B,,D,G,]", "[F,,A,,D,]", "[B,,D,G,]", "[C,E,A,]"];

export const EXERCISES = [
  ex({
    id: "d-signature", title: "Two sharps, not two accidents", summary: "D major keeps G's F sharp and adds C sharp. Read both from the signature in different registers.", hands: "both",
    abc: grand("The two-sharp map", ["!mp!C D F2", "=C2 ^C D", "z4", "z4"], ["z4", "z4", "C, D, F,2", "A,, C, D,2"]),
    fingering: "RH C sharp4–D4–F sharp4: 1–2–4; bar 2 C natural4–C sharp4–D4 can use 1–2–3 after repositioning. LH C sharp3–D3–F sharp3 = 4–3–1; A2–C sharp3–D3 = 5–3–2 after moving the hand.",
    steps: ["Find F sharp4 and C sharp4 on the black keys. The signature changes every F and C in either clef, unless a written accidental overrides it.", "Listen and compare bar 2's C natural with C sharp. The natural lasts only within its bar; the signature resumes after the barline.", "Name the bass-register sharps before playing the LH answer. Then read the four bars with continuous counting through the other hand's rests."],
    listenFor: ["C sharp is a half step below D.", "F sharp and C sharp remain clear in the lower register too."],
    checks: ["I can find both changed note letters without listening first.", "I can explain why a barline does not remove the key signature."], skillIds: ["key-signature", "c-sharp", "f-sharp", "register"],
  }),
  ex({
    id: "d-geography", title: "Read the notes inside D's close chords", summary: "Use middle C as a landmark for C sharp4, D4 and the neighboring chord tones.", hands: "R",
    abc: grand("Close-chord geography", ["D F A2", "C E A2", "D G B2", "C E G2"], rests(4)),
    fingering: "RH D4–F sharp4–A4 = 1–3–5; C sharp4–E4–A4 = 1–2–5; D4–G4–B4 = 1–3–5; C sharp4–E4–G4 = 1–3–5. Move to each new shape; the thumb is not fixed on C.",
    steps: ["Before playback, name each bar's first note with its octave. The C on the ledger line below treble is C sharp in this key.", "Play each broken shape, then block its three notes with playback stopped. Name D, A, G and the upper three tones of A7.", "Move between only two shapes at a time. Keep the printed half-note endings for two full counts before continuing."],
    listenFor: ["C sharp changes the A harmony; it is not C natural by habit.", "The three tones can sound connected without gripping a fixed position."],
    checks: ["I can locate C sharp4 from its written staff position.", "I can prepare one close chord change without a thinking pause."], skillIds: ["ledger-landmarks", "chord-reading", "c-sharp"],
  }),
  ex({
    id: "d-scale-r", section: "scales", title: "D major, right hand", summary: "One octave with the familiar 1–2–3 / 1–2–3–4–5 fingering and two black keys.", minutes: 5, hands: "R", bpm: 46, targetBpm: 72,
    abc: grand("D major - RH", ["D E F G", "A B c d", "c B A G", "F E D2"], rests(4)),
    fingering: "RH D4→D5: 1–2–3–1–2–3–4–5. Coming down from C sharp5: 4–3–2–1–3–2–1. F sharp4 uses 3; C sharp5 uses 4.",
    steps: ["Find D4 and both black-key targets before starting. Say the pitches up once: D E F sharp G A B C sharp D.", "Practice F sharp4–G4–A4 with 3–1–2, then B4–C sharp5–D5 with 3–4–5. Let the hand travel comfortably.", "Play up and back in quarter notes. Continue through the top D on the next beat instead of adding a pause."],
    listenFor: ["The black keys are part of the same even line.", "The thumb crossing does not create a bump in tone or timing."],
    checks: ["I can find both sharps while following the fingering.", "I can keep a comfortable pulse for the whole octave or one four-note chunk."], skillIds: ["major-scale", "thumb-crossing", "c-sharp", "f-sharp"],
  }),
  ex({
    id: "d-scale-l", section: "scales", title: "D major, left hand", summary: "Learn D3–D4 and the LH crossing onto B3 after thumb A3.", minutes: 5, hands: "L", bpm: 46, targetBpm: 72,
    abc: grand("D major - LH", rests(4), ["D, E, F, G,", "A, B, C D", "C B, A, G,", "F, E, D,2"]),
    fingering: "LH D3→D4: 5–4–3–2–1–3–2–1. Descending C sharp4→D3: 2–3–1–2–3–4–5. F sharp3 uses 3; C sharp4 uses 2.",
    steps: ["Find D3 and the F sharp3/C sharp4 in the written register. C sharp4 sits on the same ledger line as middle C above the bass staff; the sharp changes the key to play, not its staff height.", "Play A3–B3–C sharp4–D4 with 1–3–2–1 slowly, then reverse it. This crossing belongs to the LH pattern, not the RH's.", "Join the octave at an easy count. Keep the long final D sounding for its two written beats."],
    listenFor: ["The crossing after A3 is even and comfortable.", "The phrase returns to D3 rather than drifting an octave up."],
    checks: ["I can recall the LH crossing without copying the RH.", "I read the top C as C sharp from the signature."], skillIds: ["major-scale", "thumb-crossing", "bass-reading", "c-sharp"],
  }),
  ex({
    id: "d-scale-both", section: "scales", title: "D major: join four-note chunks", summary: "Bring the hands together an octave apart without demanding a complete scale on the first visit.", minutes: 5, bpm: 42, targetBpm: 64,
    abc: grand("D major together", ["D E F G", "A B c d", "c B A G", "F E D2"], ["D, E, F, G,", "A, B, C D", "C B, A, G,", "F, E, D,2"]),
    fingering: "RH starts D4 with 1: 1–2–3–1–2–3–4–5. LH starts D3 with 5: 5–4–3–2–1–3–2–1. Reverse these sequences descending. The hands are one octave apart.",
    steps: ["Recall each hand separately, then pair only D–E–F sharp–G. The RH crosses onto G while the LH continues 5–4–3–2.", "Pair A–B–C sharp–D, noticing the LH crossing onto B. Keep the other hand moving normally.", "Join the two chunks slowly, then work downward. A relaxed four-note chunk is a useful result; extending it comes before speeding it up."],
    listenFor: ["The paired notes start together.", "One hand does not wait while the other crosses."],
    checks: ["I can coordinate one chunk while counting aloud.", "I can identify the exact join to revisit next time."], skillIds: ["major-scale", "coordination", "thumb-crossing"],
  }),
  ex({
    id: "d-chords-home", section: "chords", title: "D, G and A7: a complete sentence", summary: "Find I, IV and V7 in D, keeping each chord's root in the bass.", minutes: 6,
    abc: grand("Home and dominant in D", ["!mp!\"D\"[DFA]4", "\"G\"[DGB]4", "\"A7\"[CEG]4", "\"D\"[DFA]4"], ["!p!D,4", "G,,4", "A,,4", "D,4"]),
    fingering: "RH D4–F sharp4–A4 = 1–3–5; D4–G4–B4 = 1–3–5; C sharp4–E4–G4 = 1–3–5. LH roots D3, G2, A2, D3, using comfortable whole-hand moves. A7's root A is in the LH.",
    steps: ["Build D–F sharp–A and G–B–D. A7 has A–C sharp–E–G; the RH supplies its upper three tones over bass A2.", "Play the RH shapes alone, then the bass roots. Count four beats for every chord; prepare the next location between attempts.", "Join the hands with a quiet bass and a clearer upper sound. Compare A7 with A major by replacing the RH G4 with A4 (C sharp4–E4–A4)."],
    listenFor: ["A7's G adds tension before the return to D.", "D major keeps both F sharp and C sharp in their proper harmonies."],
    checks: ["I can name the tones of D, G and A7.", "I can distinguish the A-major triad from A7 without assuming every A chord contains G."], skillIds: ["primary-chords", "seventh-chords", "c-sharp"],
  }),
  ex({
    id: "d-chords-minor", section: "chords", title: "The two minor colors inside the Canon loop", summary: "Read B minor and F sharp minor before encountering them in the complete bass cycle.", minutes: 5,
    abc: grand("Bm and F sharp minor", ["\"Bm\"[DFB]4", "\"F#m\"[CFA]4", "\"Bm\"[DFB]2 \"F#m\"[CFA]2", "\"G\"[DGB]4"], ["B,,4", "F,,4", "B,,2 F,,2", "G,,4"]),
    fingering: "RH Bm is D4–F sharp4–B4, fingers 1–2–5; F#m is C sharp4–F sharp4–A4, 1–3–5; G is D4–G4–B4, 1–3–5. LH roots B2, F sharp2, then G2.",
    steps: ["Build B–D–F sharp and F sharp–A–C sharp from their roots, then find the written inversions. The bass tells you which root is home for each shape.", "Locate low F sharp2 carefully before starting. It is the black key just below G2, not the F sharp near middle C.", "Change one whole bar at a time, then try bar 3's two-beat changes. Hear the common F sharp while D moves down to C sharp and B moves down to A. Release and reset the hand comfortably: the suggested fingering changes the finger on F sharp, so it need not stay physically held across the change."],
    listenFor: ["Both minor chords have their own color; F#m is not F sharp major.", "The low black-key root stays in the written octave."],
    checks: ["I can name Bm and F#m from their tones, not only the picture.", "I can find F sharp2 and prepare the next bass move."], skillIds: ["minor-triad", "inversions", "register"],
  }),
  ex({
    id: "d-canon-source-bass", title: "Inspect the Canon's actual two-bar bass", summary: "Eight source notes, in their source register and quarter-note rhythm; listen once before slowing them down for the student project.", minutes: 7, hands: "L", bpm: 44, targetBpm: 64,
    abc: grand("Canon source bass - one cycle", rests(2), ["D, A,, B,, F,,", "G,, D,, G,, A,,"]),
    fingering: "LH source pitches: D3, A2, B2, F sharp2 | G2, D2, G2, A2. Try 1–5–4–5 | 4–5–2–1, allowing whole-hand repositioning before F sharp2 and D2; use a more comfortable planned fingering if needed.",
    steps: ["Look at the two bars before playback. Count 1 2 3 4 in each; this inspected edition writes four bass notes per bar, not one whole-note chord per bar.", "Locate each key without time pressure, especially F sharp2 and the low D2. Play only the first four roots, then the second four.", "Play the cycle slowly with the count. The student version spreads these same eight pitches over eight bars; that change is deliberate, not the source's notation."],
    listenFor: ["The low D2 in the second bar is an octave below the opening D3.", "The last A points back to D when the cycle repeats."],
    checks: ["I can read the eight roots in order with their registers.", "I can distinguish this source rhythm from the slower arrangement."], skillIds: ["bass-reading", "canon-bass", "register"],
    source: { ...canon, changes: "This exercise quotes one two-bar bass cycle with the inspected edition's pitches/registers and quarter-note durations. It omits the remaining repetitions, violin parts and final D. Practice tempos are student choices, not an edition tempo." },
    why: "The recognizable project starts from a specific inspected musical source, so its arrangement changes can be heard and explained.",
  }),
  ex({
    id: "d-canon-bass-map", title: "Make room for the eight bass destinations", summary: "The same source bass now has one full bar per note, giving time to locate each new register.", minutes: 5, hands: "L", bpm: 46,
    abc: grand("Canon bass - expanded map", rests(8), bass.map((n, i) => `${i === 0 ? "!p!" : ""}${n}4`)),
    fingering: "LH D3–A2–B2–F sharp2–G2–D2–G2–A2. Start D3 with 1; after moving down, A2/B2 can use 5/4. Reposition for F sharp2/G2, then move the whole hand to D2; do not hold a large stretch between roots.",
    steps: ["Say the eight roots as a route: D A B F sharp, G D G A. The sixth root is low D2; it is not the same register as the first D3.", "Count each root for four beats. Release at the change and move the hand with enough preparation to reach the next root comfortably.", "Practice bars 1–4, then 5–8. Join the bar 4–5 and bar 8–1 transitions separately before attempting a continuous cycle."],
    listenFor: ["The pitch route is unchanged even though its notated duration is four times longer.", "No extra beat is added while locating the low D2."],
    checks: ["I can prepare one four-root section with a continuing count.", "I know which register move needs another visit."], skillIds: ["canon-bass", "bass-reading", "pulse"], source: canon,
    why: "A slower harmonic rhythm lets bass geography become familiar before adding upper chords.",
  }),
  ex({
    id: "d-canon-blocks", title: "Canon bass and chord arrangement: held harmony", summary: "A nine-bar student destination: the eight-note bass cycle with original close RH chords, then a closing D. This is a harmonic arrangement, not the original Canon piano version.", minutes: 8, bpm: 46, targetBpm: 64,
    abc: grand("Canon bass and chord arrangement - held harmony", [...chord.map((c, i) => `${i === 0 ? "!mp!(" : i === 4 ? "!mf!(" : ""}\"${labels[i]}\"${c}4${i === 3 || i === 7 ? ")" : ""}`), "!p!\"D\"[DFA]4"], [...bass.map((n, i) => `${i === 0 ? "!p!" : ""}${n}4`), "D,4"]),
    fingering: "RH D: D4–F sharp4–A4 (1–3–5); A: C sharp4–E4–A4 (1–2–5); Bm: D4–F sharp4–B4 (1–2–5); F#m: C sharp4–F sharp4–A4 (1–3–5); G: D4–G4–B4 (1–3–5). LH follows D3/A2/B2/F sharp2/G2/D2/G2/A2, then closing D3, using planned whole-hand moves.",
    steps: ["Work only the passage named in today's goal. Read its chord names and find the corresponding bass roots before starting either hand in time.", "Learn RH alone, then LH. Notice D to A: upper A4 stays at the same pitch while D4 descends to C sharp4 and F sharp4 descends to E4. This close movement is voice leading; the chord does not need to jump to its root position.", "Join just the first chord and root, holding for four counts without repeating on each click. Join two bars, then four; prepare the next voicing during the hold and keep the LH quiet.", "Treat bars 1–4 and 5–8 as two phrase arcs. The score marks the second a little fuller, then a quiet closing D in bar 9. These are your expressive choices; the simple synthetic reference mainly checks pitches and timing."],
    listenFor: ["A and F#m contain C sharp; Bm contains D natural.", "Bar 8 on A leans onward; bar 9 on D makes a clear ending."],
    checks: ["I can play my selected passage with a count and no unexplained pauses.", "I can keep the bass quieter and explain which harmony or join to revisit."], skillIds: ["canon-bass", "inversions", "coordination", "phrase-shape"], source: canon,
    why: "A returning harmonic project links reading, bass geography, chord-chart skills and a recognizable musical progression without claiming to reproduce the violin counterpoint.",
  }),
  ex({
    id: "d-lh-offbeat-prep", title: "The left hand can enter between the clicks", summary: "Keep one held RH chord while the LH taps only the eighth-note offbeats; no hand travel is added yet.", minutes: 4, bpm: 42, targetBpm: 60,
    abc: grand("Left-hand offbeat preparation", ["!mp![DFA]8", "[DFA]8", "[DFA]8", "[DFA]8"], ["!p!z D, z D, z D, z D,", "z D, z D, z D, z D,", "z D, z D, z D, z D,", "D,8"], { unit: "1/8" }),
    fingering: "RH D4–F sharp4–A4 = 1–3–5, held for the bar. LH finger 2 on D3, released on every rest. Both hands begin together only in the final bar.",
    steps: ["Say 1 and 2 and 3 and 4 and. Tap the main numbers with the RH and the and counts with the LH, starting slowly.", "Play LH D3 on the ands only. The first click is silent for the LH; do not shift its first note onto beat 1.", "Add the RH held chord on beat 1. Keep it sounding while the LH releases and reattacks; finish the last bar with both hands together."],
    listenFor: ["The LH attacks halfway between the main clicks.", "LH rests release the sound without releasing the held RH chord."],
    checks: ["I can tap the two layers before playing them.", "I can maintain the offbeat for one bar without adding a LH attack on beat 1."], skillIds: ["offbeat-left-hand", "eighth-subdivision", "coordination"],
  }),
  ex({
    id: "d-bass-single-answer", title: "Bass, answer: a small movement before chords", summary: "Alternate one bass note with one higher LH answer on beats 2 and 4. This is the simpler version of the bass-and-chord texture.", minutes: 6, bpm: 44, targetBpm: 64,
    abc: grand("Bass and one-note answer", ["!mp!A4", "A4", "B4", "A4"], ["!p!D, A, D, A,", "A,, E, A,, E,", "B,, F, B,, F,", "F,, C, F,, C,"]),
    fingering: "RH A4 finger 4 or 5, B4 finger 5 after shifting as needed. LH bass/answer pairs: D3–A3 (5–1), A2–E3 (5–1), B2–F sharp3 (5–1), F sharp2–C sharp3 (5–1). Release each note before returning to the bass.",
    steps: ["Count bass–answer–bass–answer as 1 2 3 4. The upper answer is on the weaker beats 2 and 4, not an eighth-note offbeat in this exercise.", "Play the LH first without the RH. Keep its movement comfortable; each pair spans a fifth, with no octave stretch.", "Add the long RH note. Join one bar, then two, keeping the LH softer and the count unchanged."],
    listenFor: ["Four even quarter-note attacks in the LH.", "The RH long note does not bounce with the accompaniment."],
    checks: ["I can distinguish these weak-beat answers from the previous eighth-note offbeats.", "I can alternate one pair comfortably before adding a fuller chord."], skillIds: ["bass-and-chord", "coordination", "balance"],
  }),
  ex({
    id: "d-bass-chord-prep", title: "Bass, chord: move and release rather than stretch", summary: "Add a compact LH chord on beats 2 and 4, with a simple held RH note above it.", minutes: 6, bpm: 40, targetBpm: 60,
    abc: grand("Bass-and-chord preparation", ["!mp!A4", "A4", "E4", "E4"], ["!p!D, [F,A,D] D, [F,A,D]", "D, [F,A,D] D, [F,A,D]", "A,, [C,E,A,] A,, [C,E,A,]", "A,, [C,E,A,] A,, [C,E,A,]"]),
    fingering: "RH holds A4 then E4 with a comfortable finger. LH D3 bass with 5, then F sharp3–A3–D4 chord with 5–3–1 after moving the hand up; return after release. For A2 bass, upper chord is C sharp3–E3–A3, 5–3–1. Do not keep the bass pressed while reaching the chord.",
    steps: ["Locate the LH bass and upper chord as two separate hand placements. Move between them silently first; keep the arm free to travel.", "Play just bass on 1 and chord on 2, then stop. Return to the single-note-answer version if the movement feels strained or unclear.", "Add beats 3–4 only when the first pair feels comfortable. Then hold the RH above one bar, counting evenly; repeated quiet chord releases give the accompaniment its light character."],
    listenFor: ["Bass and upper chord alternate instead of blurring into one sustained stretch.", "The chord arrives on the beat with no extra attack from the RH."],
    checks: ["I can move after releasing, without fixing the hand in an octave stretch.", "I can play one light bass–chord pair at a chosen slow pulse."], skillIds: ["bass-and-chord", "hand-moves", "coordination"],
  }),
  ex({
    id: "d-canon-bass-chords", title: "Canon bass and chord arrangement: a moving accompaniment", summary: "Return to the same source bass and harmony with original LH bass-and-chord accompaniment and a simple new upper melody. Begin with two bars; the held-harmony version remains a complete alternative.", minutes: 8, bpm: 40, targetBpm: 60,
    abc: grand("Canon bass and chord arrangement - bass and chord", ["!mp!(A2 F2", "A2 E2", "F2 B2", "A2 F2)", "!mf!(G2 B2", "A2 F2", "B2 G2", "A2 E2)", "!p!(F E D2)"], [...bass.map((n, i) => `${i === 0 ? "!p!" : ""}\"${labels[i]}\"${n} ${upperLH[i]} ${n} ${upperLH[i]}`), "D,4"]),
    fingering: "RH starts A4(5)–F sharp4(3), then A4(5)–E4(2). Reposition for F sharp4(1)–B4(4), A4(3)–F sharp4(1), G4(2)–B4(4), A4(3)–F sharp4(1), B4(4)–G4(2), A4(3)–E4(1); final F sharp4–E4–D4 uses 3–2–1 after moving down. LH bass then upper chord (5–3–1): D3 / F sharp3–A3–D4; A2 / C sharp3–E3–A3; B2 / D3–F sharp3–B3; F sharp2 / A2–C sharp3–F sharp3; G2 / B2–D3–G3; low D2 / F sharp2–A2–D3. Repeat G and A placements, then close on D3.",
    steps: ["Use only today's passage. Locate its bass and chord placements without time pressure, then play the RH melody alone with the marked phrase arc.", "Play the LH without the RH: bass on 1/3, upper chord on 2/4. Release before moving; if it is effortful, use the single-note-answer pattern or the held-harmony arrangement instead.", "Join only bass plus the first RH note, then one bass–chord pair, then the whole bar. Hold each RH half note while the LH changes underneath.", "Across several visits, join two bars, then four, then the eight-bar route plus closing D. Keep the LH quiet, let the second phrase grow a little, and make the final D a calm full-bar ending."],
    listenFor: ["The upper melody remains connected while LH chords release lightly.", "The sixth bass is low D2; the last ninth-bar D3 is an added closing destination."],
    checks: ["I can play my chosen small passage with a comfortable movement and continuing count.", "I can hear the melody above the accompaniment and choose a specific join to revisit."], skillIds: ["canon-bass", "bass-and-chord", "balance", "phrase-shape"],
    source: { ...canon, changes: `${canon.changes} This second version further divides each expanded bass bar into alternating LH bass and chord attacks on beats 1/3 and 2/4; its RH half-note melody is original and does not quote the Canon's violin tune.` },
    why: "The same harmony can support different accompaniment patterns. Reusing the project makes the new LH movement the main change rather than requiring another unrelated piece.",
  }),
  ex({
    id: "d-six-eight-pulse", title: "Before 6/8: hear two groups of three", summary: "Prepare compound meter by speaking, tapping and playing on one key. This is not a new Canon version.", minutes: 5, hands: "R", bpm: 72, targetBpm: 90,
    abc: grand("Two groups of three", ["!mp!D3 D3", "DEF AFE", "D2 E F2 E", "D6"], rests(4, "z6"), { unit: "1/8", meter: "6/8" }),
    fingering: "RH D4–E4–F sharp4–G4–A4 uses 1–2–3–4–5. For the first pass, replace all the notes with D4 under finger 2 so only the rhythm changes.",
    steps: ["Say ONE-la-li TWO-la-li while tapping only ONE and TWO. Six written eighths make two large dotted-quarter beats, not six unrelated beats.", "The app's tempo label is quarter-note BPM. At ♩ = 72 the dotted-quarter clicks are 48 per minute (72 divided by 1.5); the one-bar count-in has two clicks, each containing three subdivisions.", "Listen and tap first, then play the first bar on one note. Add bar 2's six eighths only when you can keep the two main beats; the melodic notes are a later layer."],
    listenFor: ["Each main click contains three equal small subdivisions.", "The two-count final bar still occupies all six eighth-note subdivisions."],
    checks: ["I can speak and tap two groups of three before adding pitches.", "I understand why the two dotted-quarter clicks do not equal the displayed quarter-note BPM."], skillIds: ["compound-meter", "six-eight", "pulse"],
  }),
  ex({
    id: "d-six-eight-duet", title: "Two broad steps, a simple duet", summary: "An original four-bar 6/8 application after the spoken/tapped preparation, with only one held bass note per bar.", minutes: 5, bpm: 72, targetBpm: 90,
    abc: grand("Two broad steps", ["!mp!(D2 E F2 A", "G3 F3)", "(E2 F G2 E", "D6)"], ["!p!D,6", "G,,6", "A,,6", "D,6"], { unit: "1/8", meter: "6/8" }),
    fingering: "RH D4–A4 uses 1–5, including F sharp4 on 3. LH roots D3, G2, A2, D3, with comfortable whole-hand moves.",
    steps: ["Return to ONE-la-li TWO-la-li before playing. Each RH dotted quarter in bar 2 fills one complete large beat.", "Play RH only, then tap two main beats while the LH holds its one note per bar. At displayed ♩ = 72, those large beats are dotted-quarter = 48.", "Combine only two bars. Keep the bass simple and quiet; this application checks the new grouping, not speed or the Canon accompaniment."],
    listenFor: ["The moving eighth after a quarter note stays inside its group of three.", "The bass changes after two large beats, not after four familiar quarter clicks."],
    checks: ["I can maintain the two-beat feel through moving and held notes.", "If the grouping is unclear, I will return to the spoken/tapped preparation."], skillIds: ["compound-meter", "six-eight", "held-bass"],
  }),
  ex({
    id: "d-first-read-a", title: "First reading A: do this before any demonstration", summary: "An original, previously unassigned four-bar check of D's signature and a held bass. Save playback until after your first attempt.", minutes: 4, bpm: 48, targetBpm: 64,
    abc: grand("D-major first reading A", ["F A G E", "D2 F2", "E G F E", "D4"], ["D,4", "G,,4", "A,,4", "D,4"]),
    fingering: "RH D4–A4 position 1–5, first F sharp4 with 3. LH roots D3, G2, A2, D3, moving the whole hand.",
    steps: ["Do not press Hear first. Inspect the two-sharp signature, starting F sharp4 and D3, the RH half notes and the quiet whole-note bass.", "Choose a slow pulse and make one uninterrupted reading. Continue counting after a slip; do not restart in order to make the first attempt seem perfect.", "Only afterward play the reference. Compare one suspected bar, name its reading/rhythm/register issue, and practice that small repair. This score becomes a review example after today, not another unheard test."],
    listenFor: ["F remains F sharp without an accidental beside each note.", "The LH holds while the RH moves; its barline changes remain on time."],
    checks: ["I attempted the written phrase before hearing its answer.", "I can describe one repair or report that this short reading felt comfortable."], skillIds: ["cold-reading", "key-signature", "held-bass"],
  }),
  ex({
    id: "d-first-read-b", title: "First reading B: a different starting point", summary: "A second original, unassigned phrase for a later visit. It starts on C sharp over bass A, so do not borrow the previous example's hand memory.", minutes: 4, bpm: 48, targetBpm: 64,
    abc: grand("D-major first reading B", ["C D F E", "D F A2", "G E C2", "D4"], ["A,,4", "D,4", "A,,4", "D,4"]),
    fingering: "RH first C sharp4–D4–F sharp4–E4 = 1–2–4–3. For bar 2 D4–F sharp4–A4 use 1–3–5 after moving. Bar 3 G4–E4–C sharp4 = 5–3–1; final D4 with 2. LH roots A2, D3, A2, D3.",
    steps: ["Keep playback off. Preview the actual first C sharp4 and A2, then the RH position change before bar 2.", "Play through once at an easy pulse and keep the count alive if a pitch surprises you. This is a new reading check, not a speed test.", "Listen afterward. Compare the first attempt with the model, repair one join, and write what helped; do not claim that rereading this same score is a new sight-read."],
    listenFor: ["The opening C sharp belongs over A; the final D sounds settled over D.", "The half-note ending in bar 3 receives its full two beats."],
    checks: ["I checked both first pitches rather than assuming a D start.", "I made a first attempt before playback and can name a next step."], skillIds: ["cold-reading", "c-sharp", "hand-moves"],
  }),
  ex({
    id: "d-create-chart", title: "Use the Canon route as a chord-chart workshop", summary: "Choose a simpler texture or a new top note while preserving the eight-root route. The written seed is a four-bar excerpt of the harmonic project.", minutes: 4,
    abc: grand("Canon harmony - a student variation seed", ["\"D\"A4", "\"A\"A4", "\"Bm\"B4", "\"F#m\"A4"], bass.slice(0, 4).map((n) => `${n}4`)),
    fingering: "RH A4 with 4, B4 with 5, moving the hand if needed. LH follows first-half roots D3, A2, B2, F sharp2. For your variation, choose chord tones from D–F sharp–A; A–C sharp–E; B–D–F sharp; F sharp–A–C sharp.",
    steps: ["Play the written four-bar seed, one top tone above each source bass. It is an original student texture, not a Canon violin line.", "Stop playback and choose one different chord tone per bar from the listed harmonies. Keep the bass order and four counted beats per bar unchanged.", "Try one version with a rest and another with a long sound. On a later visit extend to G–D–G–A, then add a closing D. Describe the version you prefer rather than asking a note matcher to judge an intentional variation."],
    listenFor: ["The same bass route can support several upper textures.", "A planned silence keeps the bar's duration; it is not time to hunt for the next key."],
    checks: ["I changed a deliberate musical detail while preserving the harmonic route.", "I can repeat or describe one variation I want to keep."], skillIds: ["creative-application", "canon-bass", "chord-chart"],
    source: { ...canon, changes: "Only the first four source bass pitches are used, each expanded from a quarter note to one full bar. Upper sustained tones and the variation task are original student material; they do not quote the violin melody." },
    why: "The recognizable bass becomes a transferable chord-chart skill, with the freedom to choose a lighter texture rather than equating progress with more notes.",
  }),
];

const s = (x) => ({ unitId: UNIT.id, ...x });
export const SESSIONS = [
  s({ id: "d5-d1-a", day: 1, slot: "A", title: "Find two sharps and the real bass", focus: "Map D's signature, inspect the source bass, and recall one RH scale chunk.", blocks: [{ exerciseId: "d-signature", minutes: 4, goal: "Find C sharp and F sharp in both registers before listening." }, { exerciseId: "d-geography", minutes: 4, goal: "Read two close shapes from their actual lowest RH notes." }, { exerciseId: "d-canon-source-bass", minutes: 7, goal: "Locate the eight source roots; distinguish low D2 from opening D3." }, { exerciseId: "d-scale-r", minutes: 5, goal: "Keep an even count through one four-note scale chunk." }] }),
  s({ id: "d5-d1-b", day: 1, slot: "B", title: "Begin the arrangement with two familiar chords", focus: "Hear the cadence, slow the bass route, and join only the first two project bars.", blocks: [{ exerciseId: "d-chords-home", minutes: 6, goal: "Build D/G/A7 and compare A-major with A7." }, { exerciseId: "d-canon-bass-map", minutes: 6, fromBar: 1, toBar: 4, goal: "Prepare the first four roots at one note per full bar." }, { exerciseId: "d-canon-blocks", minutes: 8, fromBar: 1, toBar: 2, goal: "Hold D and A with quiet bass, counting four beats per chord." }] }),
  s({ id: "d5-d2-a", day: 2, slot: "A", title: "Hear the minor colors and a delayed LH", focus: "Learn Bm/F#m, explore an offbeat on one bass key, and recall the LH scale crossing.", blocks: [{ exerciseId: "d-chords-minor", minutes: 5, goal: "Name both minor triads and find low F sharp2." }, { exerciseId: "d-lh-offbeat-prep", minutes: 5, goal: "Tap the and counts in the LH before adding the held RH chord." }, { exerciseId: "d-geography", minutes: 5, goal: "Return cold to the C-sharp chord region and identify one uncertain shift." }, { exerciseId: "d-scale-l", minutes: 5, goal: "Read C sharp4 in bass and coordinate the LH crossing onto B3." }] }),
  s({ id: "d5-d2-b", day: 2, slot: "B", title: "Join the eight-root route", focus: "Return to the same project, add the minor bars, and try one intentional upper-tone variation.", blocks: [{ exerciseId: "d-canon-bass-map", minutes: 4, fromBar: 5, toBar: 8, goal: "Prepare G2–D2–G2–A2 without extra beats for register changes." }, { exerciseId: "d-canon-blocks", minutes: 12, fromBar: 1, toBar: 8, goal: "Join two four-bar phrases; stop on A or repeat back to D, recognizing the open ending." }, { exerciseId: "d-create-chart", minutes: 4, goal: "Choose a new upper chord tone in one bar while keeping the same bass route." }] }),
  s({ id: "d5-d3-a", day: 3, slot: "A", title: "Read first, then separate the layers", focus: "Use an actually new reading before playback, then prepare the smaller bass-and-answer movement.", blocks: [{ exerciseId: "d-first-read-a", minutes: 4, goal: "Make one unheard first reading before any model; compare and repair afterward." }, { exerciseId: "d-lh-offbeat-prep", minutes: 4, goal: "Keep the held RH independent of one bar of LH eighth-note offbeats." }, { exerciseId: "d-bass-single-answer", minutes: 7, goal: "Alternate one bass and one upper note on four equal beats, with no fixed stretch." }, { exerciseId: "d-scale-both", minutes: 5, goal: "Join only one four-note hands-together chunk comfortably." }] }),
  s({ id: "d5-d3-b", day: 3, slot: "B", title: "Change the texture, keep the harmony", focus: "Revisit the second phrase, prepare a moving chord, then try only two bars of the fuller arrangement.", blocks: [{ exerciseId: "d-canon-blocks", minutes: 6, fromBar: 5, toBar: 8, goal: "Read the low D2 in bar 6 and give the phrase a light expressive arc." }, { exerciseId: "d-bass-chord-prep", minutes: 6, goal: "Move one released bass–chord pair comfortably; keep the single-note option if needed." }, { exerciseId: "d-canon-bass-chords", minutes: 8, fromBar: 1, toBar: 2, goal: "Keep a connected RH half-note melody over one or two light LH bars." }] }),
  s({ id: "d5-d4-a", day: 4, slot: "A", title: "Prepare a different grouping: two times three", focus: "Speak and tap 6/8 before playing its simple duet; the Canon project remains in 4/4.", blocks: [{ exerciseId: "d-six-eight-pulse", minutes: 5, goal: "Feel two dotted-quarter beats, with three subdivisions inside each click." }, { exerciseId: "d-six-eight-duet", minutes: 6, goal: "Join two slow 6/8 bars over held bass; return to tapping if the grouping is unclear." }, { exerciseId: "d-geography", minutes: 4, goal: "Return to D's close chord tones as a short reading review." }, { exerciseId: "d-scale-both", minutes: 5, goal: "Continue the specific scale join chosen last time, with no speed requirement." }] }),
  s({ id: "d5-d4-b", day: 4, slot: "B", title: "Make one four-bar musical passage", focus: "Return to the same arrangement and join the first phrase only when its movements are comfortable.", blocks: [{ exerciseId: "d-bass-chord-prep", minutes: 4, goal: "Recall one comfortable LH bass–chord movement before adding it to music." }, { exerciseId: "d-canon-bass-chords", minutes: 12, fromBar: 1, toBar: 4, goal: "Connect the first phrase with quiet LH releases; use the held version for any strained bar." }, { exerciseId: "d-create-chart", minutes: 4, goal: "Try a lighter top-tone version and say which texture you prefer." }] }),
  s({ id: "d5-d5-a", day: 5, slot: "A", title: "A fresh start and a chosen repair", focus: "Try a different unheard reading, then revisit only the rhythm and movement that need work.", blocks: [{ exerciseId: "d-first-read-b", minutes: 4, goal: "Read before playback, noticing the C-sharp/A starting harmony; do not reuse reading A's memory." }, { exerciseId: "d-six-eight-duet", minutes: 5, goal: "Recall two groups of three from the previous visit, or return to its spoken preparation." }, { exerciseId: "d-scale-both", minutes: 5, goal: "Check a comfortable scale chunk from a cold start and choose the next join." }, { exerciseId: "d-bass-single-answer", minutes: 6, goal: "Use the simpler texture to make a continuous four-bar count feel easy." }] }),
  s({ id: "d5-d5-b", day: 5, slot: "B", title: "Perform your chosen Canon arrangement", focus: "Choose a held or moving texture, finish a musical passage, and carry the harmonic skill into your own variation.", blocks: [{ exerciseId: "d-canon-bass-chords", minutes: 12, fromBar: 1, toBar: 9, goal: "Aim for the whole bass route plus closing D only if comfortable; a clear four-bar passage is also a valid goal." }, { exerciseId: "d-canon-blocks", minutes: 4, fromBar: 1, toBar: 9, goal: "Compare the simpler complete version; choose the texture that lets you shape the music best." }, { exerciseId: "d-create-chart", minutes: 4, goal: "Keep one intentional variation and write its notes or chord choices for another visit." }] }),
];

export const CATALOGUE = EXERCISES.filter((e) => e.section === "scales" || e.section === "chords" || UNIT.musicIds.includes(e.id)).map((e) => ({ id: `catalogue-${e.id}`, unitId: UNIT.id, title: e.title, description: e.summary, exerciseId: e.id, kind: "built-in", skills: [...e.skillIds] }));
