export const UNIT = {
  id: "e-major-foundations-7", number: 7, key: "E major",
  title: "E major: Morning Mood and a twelve-bar blues",
  description: "Five practice days, two twenty-minute sessions each. Read four sharps, return to a named Grieg phrase in compound meter, and build a contrasting original blues with an independent bass and a tied offbeat. Repeat useful joins across days instead of collecting a new tune at every visit.",
  daysPerWeek: 5, sessionsPerDay: 2, sessionMinutes: 20,
  prerequisites: ["Read both clefs around middle C, including a planned low E2, and follow written sharps/naturals across a barline.", "Keep eighth-note subdivisions through a rest and distinguish a tie from two repeated attacks. Review the earlier rhythm lessons if this still needs support.", "Prepare each hand separately before combining; a short even chunk is a useful result. No MIDI keyboard connection is needed."],
  moveOn: ["Read F sharp, C sharp, G sharp and D sharp from the E-major signature in either clef, and follow the explicit naturals in the blues.", "Play a selected Morning Mood passage with two groups of three per 6/8 bar, its bar-2 sixteenths in proportion, and a quiet held bass.", "Maintain the blues bass beneath at least one tied offbeat, and name the twelve-bar I–IV–V route. Return on a later day before claiming a stable result.", "Attempt an unfamiliar short example before hearing it, then identify a specific reading or timing issue. A completed session alone does not establish mastery."],
  support: ["If four sharps overload the reading, locate the changed letters in the signature lesson and play only the first two bars of the destination with one hand.", "In 6/8 count 1-la-li 2-la-li. Tap the second large pulse while practicing the one bar with sixteenths; do not turn six small units into six rushed beats.", "For the blues, remove the RH and keep the four quarter-note bass attacks. Then tap the RH rhythm, including the tie, before combining one bar.", "Release and carry the LH between bass shapes. Use single notes as written; there is no requirement to hold a wide span or to add pedal.", "Use an easier tempo or smaller range when the count breaks. The notated straight blues uses equal eighths; changing to swing is a later, separate arrangement choice."],
  musicIds: ["e7-morning-arrangement", "e7-switchyard-blues"],
  materialNote: "Morning Mood quotes the main flute melody of Grieg's opening four orchestral bars from the inspected Peters plate 7188 scan, one octave lower, with its principal note lengths and final rest. Grace ornaments and orchestral accompaniment are omitted; Woodshed supplies a new held piano bass, fingering and teaching guidance. Switchyard twelve is an original straight-eighth twelve-bar blues, not a quotation of a recording or commercial arrangement. Other examples are original. Synth playback demonstrates written pitch and timing, not a human expressive performance.",
};

const original = { label: "Original Woodshed E-major teaching material" };
const morning = {
  label: "Grieg, Morning Mood, Op.46 No.1 — Peters plate 7188, public-domain orchestral score; Woodshed student piano arrangement",
  url: "https://imslp.org/wiki/Peer_Gynt_Suite_No.1,_Op.46_(Grieg,_Edvard)",
  scope: "Opening flute phrase, original bars 1–4 only. Inspected source: Edition Peters No.2433, plate 7188, first-edition reprint, IMSLP file 912194; printed music page 1 (PDF page 5). The source record labels this edition Public Domain.",
  changes: ["The principal melody is lowered one octave from B5–C sharp6 territory to B4–C sharp5; its main-note rhythms, bar-2 sixteenths and bar-4 ending/rest are retained.", "The small grace-note ornaments in source bars 2 and 3 are omitted. This is a student arrangement, not an exact orchestral transcription or Grieg's piano arrangement.", "A new single-note piano bass replaces the orchestral texture; fingering and practice guidance are Woodshed's. The opening p is retained; phrase slurs and the bass p are our student phrasing/balance suggestions.", "The synth follows the unornamented written notes; it does not imitate a flute or perform all expressive phrasing."],
};
const grand = (title, right, left, { unit = "1/4", meter = "4/4" } = {}) => {
  if (right.length !== left.length) throw new Error(`Unmatched hands: ${title}`);
  const lines = [];
  for (let i = 0; i < right.length; i += 4) {
    const end = i + 4 >= right.length ? " |]" : " |";
    lines.push(`[V:1] ${right.slice(i, i + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${left.slice(i, i + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:${meter}\nL:${unit}\nK:E\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
};
const rests = (n, value = "z4") => Array(n).fill(value);
const knowledge = {
  "e7-signature": ["e-signature", "sharp-order"],
  "e7-bass-landmarks": ["ledger-bass-e", "ear-fifth"],
  "e7-scale-r": ["e-signature", "major-pattern"],
  "e7-scale-l": ["e-signature", "major-pattern"],
  "e7-scale-both": ["tetrachords"],
  "e7-chords-primary": ["e-primary", "ear-third"],
  "e7-chords-relative": ["triad-inversion", "ear-minor"],
  "e7-six-eight-pulse": ["six-eight", "dotted-quarter"],
  "e7-six-eight-turn": ["six-eight"],
  "e7-morning-melody": ["six-eight"],
  "e7-morning-arrangement": ["six-eight"],
  "e7-blues-bass": ["ear-fifth", "articulation"],
  "e7-blue-colors": ["ear-third"],
  "e7-switchyard-blues": ["blues-four", "articulation"],
  "e7-cold-four": ["e-signature"],
  "e7-cold-six-eight": ["six-eight"],
};
const ex = (x) => ({ unitId: UNIT.id, key: UNIT.key, section: "guided", minutes: 4, bpm: 48, targetBpm: 68, hands: "both", source: original, knowledgeIds: knowledge[x.id] || [], ...x });
const scaleR = ["E F G A", "B c d e", "d c B A", "G F E2"];
const scaleL = ["E,, F,, G,, A,,", "B,, C, D, E,", "D, C, B,, A,,", "G,, F,, E,,2"];
// Source main melody: B5 G#5 F#5 E5 F#5 G#5, etc.; our register is one octave lower.
// Bar 2 has four eighths then four sixteenths. The source's grace notes are omitted.
const morningR = ["!p!(BGF EFG)", "(BGF EF/G/F/G/)", "(BGB cGc)", "(BGF E2) z"];
const morningL = ["!p!E,6", "E,6", "B,,6", "E,6"];
const blueR = [
  "!mf!\"E7\"E =G-G B =d2 B2", "(E=G) ^G2 =dB=GE", "z E =G-G B2 =d2", "(B=de2) B2 =G2",
  "\"A7\"A c e2 c2 =G2", "A2 c =G-G E z2", "\"E7\"E2 =G-G B2 =d2", "(B=de2) =dB=GE",
  "\"B7\"F A d2 B2 A2", "\"A7\"E =G A2 c2 A2", "\"E7\"B =d-d B =G2 E2", "!>!\"E\"E4 z4",
];
const blueL = [
  "!p!.E,,2 .B,,2 .E,,2 .B,,2", "E,,2 B,,2 E,,2 B,,2", "E,,2 B,,2 E,,2 B,,2", "E,,2 B,,2 E,,2 B,,2",
  "A,,2 E,2 A,,2 E,2", "A,,2 E,2 A,,2 E,2", "E,,2 B,,2 E,,2 B,,2", "E,,2 B,,2 E,,2 B,,2",
  "B,,2 F,2 B,,2 F,2", "A,,2 E,2 A,,2 E,2", "E,,2 B,,2 E,,2 B,,2", "E,,4 z4",
];

export const EXERCISES = [
  ex({
    id: "e7-signature", title: "Four sharps belong to every octave", summary: "E major adds G sharp and D sharp to the familiar F sharp/C sharp. Read them in both clefs before hearing them.",
    abc: grand("Four-sharp landmarks", ["!mp!F G C D", "E2 d2", "z4", "z4"], ["z4", "z4", "F, G, C, D,", "E,,2 D, E,"]),
    fingering: "RH F#4 G#4 C#4 D#4 may use 2 3, then reposition for 2 3; E4–D#5 needs a hand move. LH F#3 G#3 C#3 D#3 can use 3 2, then 3 2 after moving. The last LH bar is E2, D#3, E3: release and travel.",
    steps: ["Without playback, name the signature in order: F sharp, C sharp, G sharp, D sharp. Find each key in both registers; the signs affect every occurrence of its letter.", "Read the RH two-bar question, then the LH answer. The written D is D sharp, including D#5 on the fourth treble line and D#3 in the bass.", "Play with a steady four-count bar, counting through the other hand's rests. Listen afterward and repair one mistaken octave or accidental before another complete attempt."],
    listenFor: ["D sharp is a half step below E in either register.", "The two hands answer one another without deleting the silent bars."],
    checks: ["I can identify all four changed letters without the demo.", "I can find D#3, D#4 and D#5 deliberately rather than guessing by shape."], skillIds: ["four-sharp-reading", "d-sharp", "register"],
  }),
  ex({
    id: "e7-bass-landmarks", title: "Low E, A and B have different jobs", summary: "Read the bass roots and fifths that will support the melody and blues; keep the low E2 ledger landmark clear.", hands: "L",
    abc: grand("E bass destinations", rests(4), ["E,,2 B,,2", "A,,2 E,2", "B,,2 F,2", "C,2 E,,2"]),
    fingering: "LH E2–B2, A2–E3 and B2–F#3 can each use 5–1 with a released fifth shape. C#3 can use 2 before moving to E2 with 5. The actual range is E2–F#3; do not substitute the octave near middle C.",
    steps: ["Find E2 on the first ledger line below the bass staff, A2 in its bottom space and B2 on its second line. Locate C#3 from second-space C3.", "Play each two-note bar separately. Release and carry the whole hand to its next destination rather than holding the previous shape across the move.", "Join the four bars with two counts per note. Name each lower root and upper fifth, then listen to check register before raising the tempo."],
    listenFor: ["The fifths are similar distances even though B's fifth is the black F#3.", "The low E2 remains clear and unforced."],
    checks: ["I can find the written E2 and all three root/fifth pairs.", "I can move between them without gripping an uncomfortable span."], skillIds: ["bass-ledger-reading", "root-fifth", "register"],
  }),
  ex({
    id: "e7-scale-r", section: "scales", title: "E major: the RH octave", summary: "Use four black-key targets with the familiar RH crossing after G sharp.", hands: "R", minutes: 5, bpm: 44, targetBpm: 72,
    abc: grand("E major - right hand", scaleR, rests(4)),
    fingering: "RH E4 F#4 G#4 A4 B4 C#5 D#5 E5 = 1-2-3-1-2-3-4-5 ascending. Descend E5 D#5 C#5 B4 A4 G#4 F#4 E4 = 5-4-3-2-1-3-2-1. Thumb lands on white A4; finger 3 returns over it onto G#4.",
    steps: ["Name the eight pitches before listening and find the four black keys. Compare the short D#–E distance with the whole steps around it.", "Practice F#4(2)–G#4(3)–A4(1)–B4(2), then reverse. Let the hand travel forward and sideways rather than tucking the thumb with a rigid wrist.", "Play the full octave up and back at one quarter note per beat. Keep the final E4 for two counts and note whether the crossing disturbed tone or timing."],
    listenFor: ["All four sharps sound as part of one even line.", "The thumb's A is no louder or later than the neighboring notes."],
    checks: ["I can use 1-2-3-1-2-3-4-5 and the correct return.", "I can name the four sharps and preserve the two-count last note."], skillIds: ["e-major-scale", "thumb-crossing", "four-sharp-reading"],
  }),
  ex({
    id: "e7-scale-l", section: "scales", title: "E major: a bass-register LH octave", summary: "Keep E2–E3 in the bass staff and cross finger 3 onto C sharp after thumb B.", hands: "L", minutes: 5, bpm: 44, targetBpm: 72,
    abc: grand("E major - left hand", rests(4), scaleL),
    fingering: "LH E2 F#2 G#2 A2 B2 C#3 D#3 E3 = 5-4-3-2-1-3-2-1 ascending. Descend E3 D#3 C#3 B2 A2 G#2 F#2 E2 = 1-2-3-1-2-3-4-5. Cross 3 over onto C#3 ascending; thumb goes under onto B2 descending.",
    steps: ["Locate E2 and E3 first. These are one octave apart in the bass register, not middle E4.", "Practice A2(2)–B2(1)–C#3(3)–D#3(2), then reverse. Allow the hand to move forward for the black C#3.", "Play up and back slowly. Read D#3 from the signature and retain the full two-count ending before stopping."],
    listenFor: ["The low register does not create a heavy first note.", "C# and D# arrive evenly through the crossing."],
    checks: ["I remember the LH's 5-4-3-2-1-3-2-1 ascent independently of the RH.", "I can return to the intended low E2 without an octave error."], skillIds: ["e-major-scale", "thumb-crossing", "bass-reading"],
  }),
  ex({
    id: "e7-scale-both", section: "scales", title: "Coordinate E major two octaves apart", summary: "Pair small scale chunks, identifying the different crossing point in each hand.", minutes: 5, bpm: 40, targetBpm: 64,
    abc: grand("E major in both hands", scaleR, scaleL),
    fingering: "RH E4–E5: up 1-2-3-1-2-3-4-5, down 5-4-3-2-1-3-2-1. LH E2–E3: up 5-4-3-2-1-3-2-1, down 1-2-3-1-2-3-4-5. The hands are two octaves apart; RH crosses G#–A, LH B–C# on ascent.",
    steps: ["Recall each hand alone before combining. The scale's two tetrachords are E–F#–G#–A and B–C#–D#–E: each has whole–whole–half spacing, with the whole step A–B between them. Pair only the first four notes and observe the RH crossing while the LH continues normally.", "Pair B–C#–D#–E and observe the LH crossing. Keep the RH's four notes evenly moving rather than waiting for the other hand.", "Join the two chunks, then practice the descent separately. Stay with a secure four-note chunk if the whole octave disrupts the count; increase range before tempo."],
    listenFor: ["The paired notes start together even when only one hand crosses.", "Neither hand rushes toward the black keys."],
    checks: ["I can name and coordinate at least one four-note chunk.", "I know the exact crossing to review with one hand."], skillIds: ["e-major-scale", "coordination", "thumb-crossing"],
  }),
  ex({
    id: "e7-chords-primary", section: "chords", title: "E, A and B7: close upper voices", summary: "Use the bass roots to identify home, subdominant and dominant seventh, with D sharp leading toward E.", minutes: 5,
    abc: grand("E major home and dominant", ["!mp!\"E\"[EGB]4", "\"A\"[EAc]4", "\"B7\"[DAB]4", "\"E\"[EGB]4"], ["!p!E,,4", "A,,4", "[B,,F,]4", "E,,4"]),
    fingering: "RH E4 G#4 B4 = 1 3 5; A's E4 A4 C#5 = 1 3 5 after moving; B7's D#4 A4 B4 = 1 4 5, then E4 G#4 B4 = 1 3 5. LH E2 and A2 use a comfortable single finger; B7 uses B2–F#3 together with 5–1, then a released move to E2.",
    steps: ["Build E–G#–B, A–C#–E and B–D#–F#–A from their roots. The written B7 gives B2/F#3 to the LH and D#4/A4/B4 to the RH, including every chord tone.", "Practice B7 to E slowly: D#4 rises to E4, A4 falls a half step to G#4, and B4 stays as a common pitch in these actual voicings. Release/reset if a finger change needs room rather than forcing a held span.", "Join the four complete bars with a quiet bass. Hear B7's A as its seventh and distinguish that chord from the B-major triad, which has no A."],
    listenFor: ["The D#–E and A–G# half-step motions settle the chosen B7 voicing.", "The accompaniment supports rather than covers the upper harmony."],
    checks: ["I can name all four tones of B7 and find its D#4.", "I can move through the four-bar cadence with a continuing count."], skillIds: ["e-major-harmony", "dominant-seventh", "voice-leading"],
  }),
  ex({
    id: "e7-chords-relative", section: "chords", title: "C sharp minor inside a four-chord loop", summary: "Keep common tones while moving E–C#m–A–B7; make a small original chord arrangement.", minutes: 5,
    abc: grand("E and its relative-minor color", ["\"E\"[EGB]4", "\"C#m\"[EGc]4", "\"A\"[EAc]4", "\"B7\"[DAB]4"], ["E,,4", "C,4", "A,,4", "[B,,F,]4"]),
    fingering: "RH E4 G#4 B4 uses 1 3 5; C#m E4 G#4 C#5 = 1 2 5; A E4 A4 C#5 = 1 3 5; B7 D#4 A4 B4 = 1 4 5. LH roots E2 C#3 A2 B2; add F#3 above B2 for the written B7 fifth with 5–1. Release/reset common tones if a changed finger needs room.",
    steps: ["Build C#–E–G# and find its written first-inversion order E–G#–C#. It is minor even though this passage's overall key is E major.", "Play E to C#m and then C#m to A, naming the shared pitch letters. Similar pitches support smooth voice leading, but do not require a physically held finger across every change.", "Play the whole loop. With playback stopped, replace the RH chords with one note per bar, B4–C#5–C#5–B4, then invent a different four-bar answer and return to the written shapes."],
    listenFor: ["The upper B rises to C# while E and G# are common to the first two chords.", "The B7 ending points back to E if the loop repeats."],
    checks: ["I can identify C#m from its actual tones and bass root.", "I can keep four full counts per harmony while choosing a small melodic variation."], skillIds: ["relative-minor", "voice-leading", "creative-chord-arrangement"],
  }),
  ex({
    id: "e7-six-eight-pulse", title: "Two groups of three, with a quiet bass", summary: "Prepare Morning Mood's 6/8 without adding its melodic movement yet.", bpm: 54, targetBpm: 78,
    abc: grand("Two large pulses", ["!p!BBB BBB", "B3 B3", "BBB z3", "B2B B2z"], ["E,6", "E,6", "B,,6", "E,6"], { unit: "1/8", meter: "6/8" }),
    fingering: "RH finger 3 on B4, the middle treble line. LH E3 can use 2 and B2 finger 5. Release before relocating the LH; its entire bar lasts six eighth-note units.",
    steps: ["Count 1-la-li 2-la-li, with two large pulses per bar. The displayed tempo is quarter-note BPM; the player clicks each dotted-quarter pulse, not every eighth.", "Tap the RH on B4 while holding the single LH note. Keep the second large pulse alive in the silent half of bar 3.", "Join all four bars and then stop. Count one bar without sound and return to bar 1 without changing the two-group feel."],
    listenFor: ["The beamed groups divide six eighths into two groups of three.", "The held bass stays down while the RH repeats or rests."],
    checks: ["I can count two large pulses with three small units in each.", "I can sustain the LH independently of repeated RH attacks."], skillIds: ["compound-meter", "held-bass", "subdivision"],
  }),
  ex({
    id: "e7-six-eight-turn", title: "Fit a sixteenth turn inside the second pulse", summary: "Prepare the source melody's busier second bar on one key before changing the pitches.", hands: "R", bpm: 48, targetBpm: 72,
    abc: grand("One-key rhythm for the turn", ["BBB BBB", "BBB BB/B/B/B/", "BBB BB/B/B/B/", "BBB B2z"], rests(4, "z6"), { unit: "1/8", meter: "6/8" }),
    fingering: "RH finger 3 on B4. Repeated notes isolate timing; the Grieg melody will use different fingers and pitches with this same bar-2 principal rhythm.",
    steps: ["Count six small eighth units as 1-la-li 2-la-li. Bar 2 has three eighths in the first group, then one eighth and four sixteenths in the second group.", "Split only the last two eighth units into pairs: say 1-la-li, 2, la-and, li-and. Keep the arrival of the next large pulse unchanged rather than rushing through the turn.", "Tap or play bars 1–2 and compare their equal total length. Then play bars 3–4, keeping the final eighth rest silent."],
    listenFor: ["The four sixteenths fit into the same time as two eighths.", "The second large pulse does not shrink when extra notes appear."],
    checks: ["I can keep the complete 6/8 bar while subdividing just its last two eighths.", "I can stop sound for the final written rest without stopping the count."], skillIds: ["compound-meter", "sixteenth-subdivision", "rests"],
  }),
  ex({
    id: "e7-morning-melody", title: "Morning Mood: read the arranged flute phrase", summary: "Learn the opening four-bar melody alone, lowered one octave and without the tiny orchestral grace ornaments.", hands: "R", minutes: 6, bpm: 48, targetBpm: 78, source: { ...morning, changes: [...morning.changes, "This separate-hand preparation leaves the piano bass silent."] },
    abc: grand("Morning Mood - melody preparation", morningR, rests(4, "z6"), { unit: "1/8", meter: "6/8" }),
    fingering: "RH bar 1 B4 G#4 F#4 E4 F#4 G#4 = 5 3 2 1 2 3. Bar 2 can use 5 3 2 1 2-3-2-3. Bar 3 B4 G#4 B4 C#5 G#4 C#5 = 4 2 4 5 2 5 after a small repositioning. Bar 4 B4 G#4 F#4 E4 = 5 3 2 1 after moving back.",
    steps: ["Read the four bars first and find B4, E4 and C#5. The familiar theme begins B, not E; its principal melody does not need every note of the four-sharp scale.", "Use the one-key turn lesson's rhythm in bar 2. Keep each pair of sixteenths even while the first three eighths retain their broad group.", "Practice the change into bar 3 separately, moving the hand for C#5 rather than stretching a frozen position. Follow the phrase slurs and the last bar's E quarter followed by an eighth rest.", "Play the complete four-bar named phrase quietly. Compare pitch and timing with the synth afterward; choose a breathing phrase shape yourself, since the synth is not a human flute performance."],
    listenFor: ["The recognizable B–G#–F#–E descent returns in the closing bar.", "The middle turn adds motion without losing the two large pulses."],
    checks: ["I can identify exactly which four source bars this arrangement uses.", "I can play the selected melody with its genuine main-note rhythm, including the last rest."], skillIds: ["sourced-repertoire", "compound-meter", "sixteenth-subdivision", "phrase-shape"],
    why: "A recognisable non-method classical phrase gives the new key and compound rhythm a musical purpose before adding coordination.",
  }),
  ex({
    id: "e7-morning-arrangement", title: "Morning Mood: a quiet piano phrase", summary: "Return to the same four-bar Grieg melody above a new simple bass. This complete named phrase is today's goal, not the whole orchestral movement.", minutes: 7, bpm: 48, targetBpm: 78, source: morning,
    abc: grand("Morning Mood - four-bar student arrangement", morningR, morningL, { unit: "1/8", meter: "6/8" }),
    passages: [{ label: "Bars 1–2: opening and turn", from: 1, to: 2 }, { label: "Bars 3–4: rise and close", from: 3, to: 4 }],
    fingering: "RH opening B4 G#4 F#4 E4 F#4 G#4 = 5 3 2 1 2 3; bar-2 sixteenths 2-3-2-3. Reposition for bar 3 B4 G#4 B4 C#5 G#4 C#5 = 4 2 4 5 2 5, then return to 5 3 2 1 for bar 4. LH E3 E3 B2 E3 can use 2 2 5 2, one held note per bar.",
    steps: ["Play only the authored LH bass, counting two large pulses per bar. It changes E3–E3–B2–E3; it is deliberately simpler than Grieg's orchestral accompaniment.", "Review the chosen RH passage, then combine only its first shared attack. Keep the LH down while the RH continues; the repeated RH notes do not rearticulate the bass.", "Join bars 1–2 and bars 3–4 separately. Give the bar-2 turn its written space and move the RH comfortably for C#5 in bar 3.", "Play the whole phrase with a quieter bass and a clear melody. In bar 4 the RH stops for its last eighth rest while the bass remains held through the bar; release the bass only at the end.", "On a later visit, attempt the chosen passage before hearing playback. Compare the outcome with your previous note, repair one join and preserve the musical phrase rather than merely speeding it up."],
    listenFor: ["The held bass is continuous beneath moving melody and the final RH rest.", "The four bars form one opening statement with a quiet, deliberate close."],
    checks: ["I can keep the two-pulse bar while the hands have different note lengths.", "I can name one expressive choice and one concrete timing/reading issue from my own attempt."], skillIds: ["sourced-repertoire", "compound-meter", "held-bass", "balance", "phrase-shape"],
    why: "The learner returns to one familiar musical destination across all five B sessions, adding coordination and expression after its rhythm and melody have been prepared.",
  }),
  ex({
    id: "e7-blues-bass", title: "The bass keeps four while the melody moves", summary: "Prepare a released root–fifth bass in E, A and B before adding syncopation.", hands: "L", bpm: 44, targetBpm: 68,
    abc: grand("Three blues bass locations", rests(4), ["!p!.E,, .B,, .E,, .B,,", "A,, E, A,, E,", "B,, F, B,, F,", "E,,2 z2"]),
    fingering: "LH E2–B2 = 5–1; A2–E3 = 5–1; B2–F#3 = 5–1. These are single-note fifths, not held chords. Release between quarter-note attacks and move the whole hand before changing root.",
    steps: ["Read each root and fifth before playback, naming F#3 from the signature. Practice only one bar's four quarter notes at first.", "Follow the staccato dots in the first bar as a light detached model. Leave space after release while the underlying four-count pulse keeps moving; the dots do not change the beat positions.", "Join the E, A and B locations, then the short closing E. Once steady, tap an offbeat with the RH on your leg while the LH retains its quarter-note pulse."],
    listenFor: ["Four equal bass attacks keep time even when the RH tap falls between them.", "Each new root arrives without a pause for a hand move."],
    checks: ["I can repeat one bass bar steadily without watching the reference.", "I can tap one RH offbeat without moving a bass note off its count."], skillIds: ["root-fifth", "independent-bass", "coordination"],
  }),
  ex({
    id: "e7-syncopation", title: "An offbeat can hold across the next count", summary: "Read a tied eighth that begins on and-of-1 and continues through beat 2, without a second attack.", hands: "R", bpm: 44, targetBpm: 68,
    abc: grand("A tied offbeat", ["E E-E E E2 z2", "z E-E E E2 z2", "E2 E-E E2 z2", "E4 z4"], rests(4, "z8"), { unit: "1/8" }),
    fingering: "RH finger 2 on E4. The hyphen-shaped tie joins equal pitches into one sound; the slur-shaped line in the musical score is not a reason to strike again at its second notehead.",
    steps: ["Say 1 and 2 and 3 and 4 and. In bar 1, attack E on 1, again on and-of-1, hold through 2, then attack again on and-of-2 and 3.", "Tap the quarter-note counts with one hand and speak only the RH attacks. The second tied notehead marks continuing duration, so say hold rather than adding a new attack on 2.", "Play bars 1–2, then compare bar 3: its tie begins on beat 2 and runs through and-of-2 instead. Keep the written rests for the whole of beat 4, then join all four bars."],
    listenFor: ["The offbeat is sustained through the next numbered beat.", "A tie preserves one sound rather than creating two repeated notes."],
    checks: ["I can point to the actual offbeat attack and its held numbered beat.", "I can count continuously while withholding a tied attack and observing the rests."], skillIds: ["syncopation", "ties", "eighth-subdivision"],
  }),
  ex({
    id: "e7-blue-colors", title: "Natural G and D add blues colors", summary: "Compare the major-key third/seventh with their lowered neighbors. Read the naturals rather than changing the whole signature.", hands: "R",
    abc: grand("Major-key and blues colors", ["G =G ^G2", "d =d ^d2", "=G B =d B", "E4"], rests(4)),
    fingering: "RH G#4–G4–G#4 can use 3–2–3. D#5–D5–D#5 can use 3–2–3 after moving. Bar 3 G4 B4 D5 B4 can use 1 2 4 2 with a relaxed repositioned hand.",
    steps: ["Read the first note of bars 1/2 from the four-sharp signature, then the written natural and sharp. A natural changes the following notes at that pitch within its bar; the key signature resumes after the barline.", "Compare G natural with G sharp over an imagined E root: these are the lowered third and major third. Compare D natural with D sharp: lowered seventh and major seventh.", "Play bar 3's explicit naturals and then the final E. These colors belong to this original blues language; they do not mean every E-major melody should lose its sharps."],
    listenFor: ["The natural/raised pairs are adjacent piano keys, a half step apart.", "The lowered colors contrast with the unaltered Grieg phrase."],
    checks: ["I can find both versions of G and D and name their different roles.", "I restore the signature after the barline unless a new accidental is written."], skillIds: ["blues-colors", "accidentals", "four-sharp-reading"],
  }),
  ex({
    id: "e7-blues-riff", title: "Read the first four blues bars alone", summary: "Learn an original straight-eighth call with tied offbeats and explicit blue-note naturals before adding the bass.", hands: "R", minutes: 5, bpm: 44, targetBpm: 68,
    abc: grand("Switchyard twelve - RH preparation", blueR.slice(0, 4), rests(4, "z8"), { unit: "1/8" }),
    fingering: "RH E4 G4 B4 D5 fits a movable shape such as 1 2 3 5. Bar 2 compares G4(2) with G#4(3), then returns to the written natural G. For bar 4's E5 move the hand before arriving; do not hold E4 while reaching the octave.",
    steps: ["Read the natural signs and tap the rhythm without sound. In bar 1, G4 begins on and-of-1 and is tied through beat 2; B4 enters on and-of-2.", "Learn one two-bar call, keeping the eighths equal. This arrangement is straight, not a dotted-eighth approximation of swing; the synth and score agree on that choice.", "Learn bars 3–4 and their rising E5 answer. Stop after a complete four-bar attempt, then name whether the next repair concerns a pitch sign, a hand move or the count."],
    listenFor: ["The tied offbeat does not receive another attack on the numbered beat.", "The call keeps its four-bar form through the change in register."],
    checks: ["I can play or tap the first call with equal eighths.", "I can follow the explicit G/D naturals and reach E5 without an uncomfortable stretch."], skillIds: ["syncopation", "blues-colors", "phrase-form"],
  }),
  ex({
    id: "e7-switchyard-blues", title: "Switchyard twelve: an original complete chorus", summary: "A twelve-bar straight-eighth blues in E: E7 for four bars, A7 for two, E7 for two, B7–A7–E7–E to close. Keep the quarter-note bass independent of the melody.", minutes: 8, bpm: 44, targetBpm: 68,
    abc: grand("Switchyard twelve", blueR, blueL, { unit: "1/8" }),
    passages: [{ label: "Bars 1–4: first call", from: 1, to: 4 }, { label: "Bars 5–8: IV and return", from: 5, to: 8 }, { label: "Bars 9–12: V, IV and close", from: 9, to: 12 }],
    source: { ...original, scope: "Complete original twelve-bar chorus by Woodshed, in a conventional I–IV–V blues form; no borrowed song melody or recording.", changes: ["Straight, equal eighth notes are intentional. The score does not ask for swing or copy a performer's groove.", "Single-note root/fifth bass replaces a denser boogie pattern. The last bar closes on E with a counted half-bar rest, rather than using a turnaround that requires another chorus."] },
    fingering: "RH opening E4 G4 B4 D5 can use 1 2 3 5; move for E5 in bars 4/5/8. In A7 bars, A4 C#5 E5 can use 1 3 5 after repositioning, with G4 a separate downward move. B7 bar 9 F#4 A4 D#5 B4 A4 can use 1 2 5 3 2. LH root/fifth pairs E2–B2, A2–E3, B2–F#3 use 5–1 with release and hand travel.",
    steps: ["Read the twelve-bar route before playing: I I I I | IV IV I I | V IV I I. Name E7's E G# B D, A7's A C# E G, and B7's B D# F# A; the melody also uses G natural as a lowered-third color over E.", "Play only the LH of the chosen four-bar section. Its quarter notes keep four counts through the RH's ties, rests and faster eighths; the last bar holds E2 for two counts and rests for two.", "Tap the RH rhythm while playing the bass. Then combine one bar, preserving the offbeat tie in bars 1/6/11 without forcing a fresh attack on the held notehead.", "Join each four-bar section, stopping at its boundary to review rather than restarting at bar 1 after every error. Locate C#5 in A7 bars and D#5 in B7's bar 9 before its arrival.", "Play one complete chorus with a quieter, lightly released bass. Count all four silent eighths in the last half-bar and release deliberately. On the next day, try a chosen section before hearing the reference and compare your specific practice note."],
    listenFor: ["The bass pulse stays even beneath the tied offbeats.", "A7 uses natural G, while B7 restores D# and the return to E brings the chorus home.", "Twelve bars remain audible as three groups of four, with space at the ending."],
    checks: ["I can keep one four-bar section with the bass independent of the RH rhythm.", "I can name the harmonic location and one repair after a full twelve-bar attempt.", "I can finish the entire chorus or state the precise passage still needing separate-hand support."], skillIds: ["twelve-bar-blues", "syncopation", "independent-bass", "blues-colors", "phrase-form"],
    why: "A complete contrasting piece gives the same four-sharp reading a different job: chord changes, intentional naturals and a steady bass under syncopation. Its form and groove are prepared separately from Grieg's 6/8.",
  }),
  ex({
    id: "e7-cold-four", title: "First-look reading: a new four-beat phrase", summary: "This original phrase has not appeared in the music lessons. Read it before playback; later visits are retrieval checks, not new sight reading.", bpm: 44, targetBpm: 60,
    abc: grand("A new E-major path", ["!mp!(G2 F E)", "D E B2", "(cB) A G", "F2 E2"], ["!p!E,,4", "B,,4", "A,,4", "B,,2 E,,2"]),
    fingering: "RH starts G#4 with 3, then F#4(2) E4(1). Move for D#4–E4–B4, and use a planned C#5–B4–A4–G#4 descent such as 5 4 3 2. LH roots E2 B2 A2 B2 E2 use whole-hand moves.",
    steps: ["Before hearing anything, scan the signature, four-count meter, starting octaves and longest notes. Point out each D# and C# and choose a slow pulse.", "Give one uninterrupted first attempt, permitting a wrong note while keeping a recoverable count. Write what actually happened before using the reference.", "Listen and compare one specific issue, then repair only that bar. A later attempt checks retention of this phrase and must be described as retrieval rather than a new cold read."],
    listenFor: ["The two-count notes remain sustained while the bass changes underneath.", "The final B-bass to E-bass change supports the closing melody."],
    checks: ["I attempted the phrase before hearing the model on its first visit.", "I can identify a concrete reading/timing issue and distinguish a later retrieval attempt."], skillIds: ["cold-reading", "four-sharp-reading", "self-review"],
  }),
  ex({
    id: "e7-cold-six-eight", title: "First-look reading: a different 6/8 phrase", summary: "Apply two groups of three to a genuinely new original line instead of relying on the familiar Grieg contour.", bpm: 48, targetBpm: 66,
    abc: grand("A different compound-meter line", ["!p!(EGB c2B)", "AGF E3", "DFA B2A", "G2F E2z"], ["E,6", "C,6", "B,,6", "E,6"], { unit: "1/8", meter: "6/8" }),
    fingering: "RH E4 G#4 B4 C#5 B4 may use 1 2 4 5 4; descend A4 G#4 F#4 E4 with 4 3 2 1 after repositioning. Bar 3 D#4 F#4 A4 B4 A4 can use 1 2 3 4 3. LH E3 C#3 B2 E3 can use 1 3 4 1 with release before moving.",
    steps: ["Keep playback stopped while scanning the 6/8 meter, grouped eighths and all four signature letters. Count 1-la-li 2-la-li before entering.", "Attempt the phrase slowly, or tap its RH rhythm first if the note reading needs more room. The first melody shape is different from Morning Mood; read it rather than substituting that known tune.", "Listen afterward and check whether the dotted quarter in bar 2 and final eighth rest kept their exact space. Record one issue and return to it on a later day without calling the repeated attempt new sight reading."],
    listenFor: ["The second large pulse continues through long notes and the last rest.", "Bar 3's D# belongs to the four-sharp signature even though the familiar Grieg main melody did not use it."],
    checks: ["I read or tapped a new 6/8 example before hearing its model.", "I can explain one difference between this line and the memorized destination."], skillIds: ["cold-reading", "compound-meter", "four-sharp-reading"],
  }),
];

export const SESSIONS = [
  { id: "e7-d1-a", unitId: UNIT.id, day: 1, slot: "A", title: "Four sharps and two large pulses", focus: "Read the new signature, locate the bass, begin the RH octave and prepare compound meter separately.", blocks: [{ exerciseId: "e7-signature", minutes: 4 }, { exerciseId: "e7-bass-landmarks", minutes: 4 }, { exerciseId: "e7-scale-r", minutes: 6 }, { exerciseId: "e7-six-eight-pulse", minutes: 6 }] },
  { id: "e7-d1-b", unitId: UNIT.id, day: 1, slot: "B", title: "A familiar orchestral phrase at the piano", focus: "Prepare the harmony and busy rhythm, learn the sourced melody, then add a single held bass to its first half.", blocks: [{ exerciseId: "e7-chords-primary", minutes: 4 }, { exerciseId: "e7-six-eight-turn", minutes: 4 }, { exerciseId: "e7-morning-melody", minutes: 6 }, { exerciseId: "e7-morning-arrangement", minutes: 6, fromBar: 1, toBar: 2, goal: "Keep the first two source-melody bars above an uninterrupted quiet E3, including the bar-2 sixteenths." }] },
  { id: "e7-d2-a", unitId: UNIT.id, day: 2, slot: "A", title: "A steady bass under a tied offbeat", focus: "Learn the LH octave, then isolate the blues' pulse, tie and intentional natural signs.", blocks: [{ exerciseId: "e7-scale-l", minutes: 5 }, { exerciseId: "e7-syncopation", minutes: 5 }, { exerciseId: "e7-blue-colors", minutes: 5 }, { exerciseId: "e7-blues-bass", minutes: 5 }] },
  { id: "e7-d2-b", unitId: UNIT.id, day: 2, slot: "B", title: "Finish the quiet phrase; begin the blues call", focus: "Add C#m color, learn the original blues RH, and give each destination one useful small join.", blocks: [{ exerciseId: "e7-chords-relative", minutes: 4 }, { exerciseId: "e7-blues-riff", minutes: 4 }, { exerciseId: "e7-morning-arrangement", minutes: 6, fromBar: 3, toBar: 4, goal: "Move for C#5 without stretching, and keep the bass held through the last RH rest." }, { exerciseId: "e7-switchyard-blues", minutes: 6, fromBar: 1, toBar: 4, goal: "Keep a four-bar first call with steady bass quarters and at least one correctly held offbeat tie." }] },
  { id: "e7-d3-a", unitId: UNIT.id, day: 3, slot: "A", title: "Read once before the reference", focus: "Use a genuinely new four-beat line, review the two scale hands and retrieve the offbeat count.", blocks: [{ exerciseId: "e7-cold-four", minutes: 6 }, { exerciseId: "e7-scale-r", minutes: 4 }, { exerciseId: "e7-scale-l", minutes: 4 }, { exerciseId: "e7-syncopation", minutes: 6 }] },
  { id: "e7-d3-b", unitId: UNIT.id, day: 3, slot: "B", title: "Join the melody; take the blues to IV", focus: "Return to the complete Grieg phrase before demo, then connect A7's two bars back to E7.", blocks: [{ exerciseId: "e7-chords-relative", minutes: 4 }, { exerciseId: "e7-morning-arrangement", minutes: 6, fromBar: 1, toBar: 4, goal: "Attempt the complete four-bar phrase before the model, then repair one join or balance issue." }, { exerciseId: "e7-blues-riff", minutes: 4 }, { exerciseId: "e7-switchyard-blues", minutes: 6, fromBar: 5, toBar: 8, goal: "Hear IV–IV–I–I while reading C#5 and natural G, with continuous bass quarters." }] },
  { id: "e7-d4-a", unitId: UNIT.id, day: 4, slot: "A", title: "Transfer the compound count", focus: "Try a new 6/8 phrase cold, join a small two-hand scale chunk and retrieve the blues' bass/colors.", blocks: [{ exerciseId: "e7-cold-six-eight", minutes: 6 }, { exerciseId: "e7-scale-both", minutes: 6 }, { exerciseId: "e7-blues-bass", minutes: 4 }, { exerciseId: "e7-blue-colors", minutes: 4 }] },
  { id: "e7-d4-b", unitId: UNIT.id, day: 4, slot: "B", title: "Shape the quiet phrase; find the blues ending", focus: "Return to the source arrangement with musical balance, then learn V–IV–I and the deliberate final silence.", blocks: [{ exerciseId: "e7-chords-primary", minutes: 3 }, { exerciseId: "e7-morning-arrangement", minutes: 7, fromBar: 1, toBar: 4, goal: "Play a quiet complete phrase with a clearer melody than bass and correctly proportioned bar-2 turn." }, { exerciseId: "e7-switchyard-blues", minutes: 10, fromBar: 9, toBar: 12, goal: "Read D#5 in B7, return through A7/E7, and count the full final half-bar rest." }] },
  { id: "e7-d5-a", unitId: UNIT.id, day: 5, slot: "A", title: "A delayed return, with evidence", focus: "Retrieve the earlier four-beat reading line without demo; revisit the exact scale crossing, tie and independent bass that need support.", blocks: [{ exerciseId: "e7-cold-four", minutes: 4, goal: "This is now a delayed retrieval attempt, not a new cold read: compare the first-visit note before listening." }, { exerciseId: "e7-scale-both", minutes: 5 }, { exerciseId: "e7-syncopation", minutes: 5 }, { exerciseId: "e7-blues-bass", minutes: 6 }] },
  { id: "e7-d5-b", unitId: UNIT.id, day: 5, slot: "B", title: "Two contrasting pieces to keep", focus: "Keep a named Grieg phrase and a complete original blues chorus, then choose one personal chord-loop variation or next repair.", blocks: [{ exerciseId: "e7-morning-arrangement", minutes: 8, fromBar: 1, toBar: 4, goal: "Give a complete named-phrase attempt before the demo and compare one musical choice with a previous-day note." }, { exerciseId: "e7-switchyard-blues", minutes: 10, fromBar: 1, toBar: 12, goal: "Play one whole twelve-bar chorus, preserving its bass pulse, tied offbeats, chord route and ending rest; repair one specific section afterward." }, { exerciseId: "e7-chords-relative", minutes: 2, goal: "Choose one four-bar melody variation over the prepared chord loop, or name the next supported practice goal." }] },
];

export const CATALOGUE = [
  ...EXERCISES.filter((e) => e.section === "chords" || e.section === "scales").map((e) => ({ id: `catalogue-${e.id}`, unitId: UNIT.id, title: e.title, description: e.summary, exerciseId: e.id, kind: "built-in", skills: [...e.skillIds] })),
  ...["e7-morning-arrangement", "e7-switchyard-blues"].map((id) => { const e = EXERCISES.find((item) => item.id === id); return { id: `catalogue-${id}`, unitId: UNIT.id, title: e.title, description: e.summary, exerciseId: id, kind: "built-in", skills: [...e.skillIds] }; }),
];
