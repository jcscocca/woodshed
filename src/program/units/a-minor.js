// A destination-led unit: return to Beethoven's actual first strain over several
// sessions. The short preparation studies are labeled separately from the work.
export const UNIT = {
  id: "a-minor-foundations-4", number: 4, key: "A minor",
  title: "A minor, with Für Elise as the destination",
  description: "Five repeatable days, two twenty-minute sessions each. Keep a real musical destination in view while learning three-eighth time, sixteenth-note relays and the raised G in A minor. Several Music sessions return to the same authentic Beethoven excerpt instead of replacing it with a new study every day.",
  daysPerWeek: 5, sessionsPerDay: 2, sessionMinutes: 20,
  prerequisites: ["Read a short C-, G- or F-major phrase while maintaining a comfortable pulse; a fresh check is more useful than remembering an old tempo.", "Hold one hand's sound while the other moves, and find middle C in both clefs. Keep the earlier unit open for support rather than treating completion as a deadline.", "Quarter notes, eighth pairs and counted rests feel familiar. Sixteenths and the authentic excerpt's pickup are introduced here, at a deliberately slow pace."],
  moveOn: ["Count three eighth-note pulses per bar and place two even sixteenths inside each pulse without hurrying.", "Find the A2/E2 bass starts, distinguish G natural from G sharp, and join a selected one- or two-bar relay without a restart.", "Give a comfortable performance of your chosen Für Elise passage, including its written rests and ending, then return for a fresh check on a later day. The named excerpt can be a finished goal even while the full work remains a future project."],
  support: ["If the rhythm slips, stop the reference and tap one bar on a single key; the three-pulse and sixteenth-note lessons isolate the count.", "If the hands tangle, select one hand, then combine only the shared first attack and the next two notes. Work a smaller passage before raising the tempo.", "If either bass jump feels stretched, release and move the hand with the forearm. Use the bass-landmark lesson and a slower pulse; do not hold an uncomfortable fixed span.", "Read the G-sharp and D-sharp signs where written. G sharp helps E lead home to A; the opening D sharp is a separate chromatic neighbor, not a new key signature."],
  musicIds: ["a4-fur-elise-opening"],
  materialNote: "The destination score preserves Beethoven's pickup and bars 1–8 through the first ending, from Mutopia 931's public-domain edition. Pedal markings and the printed repeat are omitted; practice fingerings and explanatory text are Woodshed's. The two hand-relay preparations repeat identified bars from that excerpt. Other studies and the optional minor-chord improvisation are original teaching material. Synthesized playback demonstrates written pitch and timing rather than a pianist's expressive performance.",
};

const original = { label: "Original Woodshed teaching material — A minor" };
const beethoven = {
  label: "Beethoven, Für Elise WoO 59 — Mutopia 931, Breitkopf & Härtel 1888; public-domain typesetting by Stelios Samelis",
  url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931",
};
const grand = (title, right, left, unit = "1/4", meter = "4/4") => {
  if (right.length !== left.length) throw new Error(`Unmatched hands: ${title}`);
  const lines = [];
  for (let i = 0; i < right.length; i += 4) {
    const end = i + 4 >= right.length ? " |]" : " |";
    lines.push(`[V:1] ${right.slice(i, i + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${left.slice(i, i + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:${meter}\nL:${unit}\nK:Am\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
};
const rest = (n, value = "z4") => Array(n).fill(value);
const ex = (x) => ({ unitId: UNIT.id, key: UNIT.key, minutes: 4, bpm: 44, targetBpm: 64, hands: "both", source: original, ...x });
const naturalR = ["A, B, C D", "E F G A", "G F E D", "C B, A,2"];
const naturalL = ["A,, B,, C, D,", "E, F, G, A,", "G, F, E, D,", "C, B,, A,,2"];
const harmonicR = ["A, B, C D", "E F ^G A", "^G F E D", "C B, A,2"];
const harmonicL = ["A,, B,, C, D,", "E, F, ^G, A,", "^G, F, E, D,", "C, B,, A,,2"];
// Written slots: 1 = the two-sixteenth pickup; 2..9 = printed bars 1..8.
// The last D in bars 1/5 is NATURAL: =d cancels the earlier ^d in that bar.
const furRight = ["!pp!e^d", "e^deB=dc", "A2 z CEA", "B2 z E^GB", "c2 z Ee^d", "e^deB=dc", "A2 z CEA", "B2 z EcB", "A4"];
const furLeft = ["z2", "z6", "A,,E,A, z3", "E,,E,^G, z3", "A,,E,A, z3", "z6", "A,,E,A, z3", "E,,E,^G, z3", "A,,E,A, z"];

export const EXERCISES = [
  ex({
    id: "a4-read-home", section: "guided", title: "A minor starts on familiar white keys", summary: "Read around A3–E4 and hear A as a resting place. The natural-minor signature has no sharps or flats.", minutes: 3, hands: "R",
    abc: grand("A small A-minor map", ["A, B, C2", "E2 D2", "C B, A, C", "A,4"], rest(4)),
    fingering: "RH A3 B3 C4 D4 E4 = fingers 1 2 3 4 5. A3 is two white keys below middle C4; do not begin an octave higher simply because this is the RH.",
    steps: ["Before listening, find A3 and middle C4. Check the empty key signature: a written B is natural again after the F-major unit.", "Read the four bars as steps and skips from A3. Play only two bars first, then locate the return without relying on the opening pattern.", "Listen afterward and play the whole phrase with four counted beats per bar. Hear the final A as home rather than changing the notes to make C the ending."],
    listenFor: ["The first three notes A–B–C have the minor key's close B–C step.", "The final A remains held for four full counts."],
    checks: ["I can find the intended A3 register before hearing a demo.", "I can read B natural and explain why the previous unit's Bb no longer applies."], skillIds: ["a-minor-reading", "register", "interval-reading"],
  }),
  ex({
    id: "a4-hear-g-sharp", section: "guided", title: "G natural and G sharp have different jobs", summary: "Compare A natural minor's G with the raised G that leads upward to A.", hands: "R",
    abc: grand("Two ways toward A", ["E2 G2", "^G2 A2", "=G2 E2", "A4"], rest(4)),
    fingering: "RH E4 G4 G#4 A4 can use 1 3 4 5. G#4 is the black key just above G4. Keep the hand free enough to reach the black key without twisting the wrist.",
    steps: ["Play E4–G4, then G#4–A4. Listen to the different distance from each G to A; a sharp changes a pitch by a half step.", "Read the printed sharp and natural signs. The natural G returns in bar 3; minor-key music does not require every G to be sharp.", "Play the phrase with a steady count. Then, without playback, compare G4–A4 with G#4–A4 once more and describe which feels more strongly pulled upward."],
    listenFor: ["G#–A is a half step; G–A is a whole step.", "A minor can use either G according to the actual passage."],
    checks: ["I can identify the two different G keys by name and sound.", "I follow the written accidental instead of assuming all minor music uses one fixed version."], skillIds: ["raised-leading-tone", "accidentals", "a-minor-hearing"],
  }),
  ex({
    id: "a4-rhythm-three-eighths", section: "guided", title: "Three small pulses make one bar", summary: "Count 3/8 slowly on one note before adding Beethoven's sixteenths or hand changes.", bpm: 32, targetBpm: 48, hands: "R",
    abc: grand("Three eighth-note pulses", ["e e e", "e2 e", "e z e", "e3"], rest(4, "z3"), "1/8", "3/8"),
    fingering: "RH finger 3 on E5, the top space of the treble staff. This one-key exercise isolates the count.",
    steps: ["Listen and count 1 2 3 for each bar. These are three eighth-note pulses, not the three quarter-note pulses of the earlier waltz.", "Tap the three pulses continuously, including the rest in bar 3. A two-pulse note in bar 2 lasts through counts 1 and 2.", "Play E5 with the click. The player's tempo is displayed in quarter-note BPM; in this meter it clicks twice per displayed quarter, giving three eighth-note clicks per bar. Begin with an unhurried count."],
    listenFor: ["Each bar finishes after the third pulse, without a fourth count.", "The last note sounds for all three eighth-note pulses."],
    checks: ["I can keep three equal pulses while the sound changes length.", "I can distinguish the written 3/8 pulse unit from 3/4."], skillIds: ["three-eighth-meter", "pulse", "rests"],
  }),
  ex({
    id: "a4-rhythm-sixteenths", section: "guided", title: "Two sixteenths inside each small pulse", summary: "Speak 1 and 2 and 3 and in 3/8, with two even sixteenths inside each eighth-note click.", bpm: 32, targetBpm: 48, hands: "R",
    abc: grand("Six small steps in a bar", ["ee ee ee", "e2 ee e2", "e2 z eee", "e4 z2"], rest(4, "z6"), "1/16", "3/8"),
    fingering: "RH finger 3 on E5. Release for the written rests and repeat a single key, keeping every finger motion small.",
    steps: ["Tap three eighth-note clicks and say 1 and 2 and 3 and. Each spoken syllable now occupies one sixteenth, so six small units fill the bar.", "Listen, then tap the attacks in bar 2: one eighth on 1, two sixteenths on 2-and, and an eighth on 3. Do not speed up when the pair arrives.", "Play bars 1–2, then bars 3–4. In bar 3, the rest is the numbered 2 and the next attack is its and; count silently through that gap before joining all four bars."],
    listenFor: ["Every adjacent sixteenth is equally spaced rather than a hurried decoration.", "The final quarter note occupies pulses 1–2, and pulse 3 is silent."],
    checks: ["I can fit six equally spaced small units inside one bar.", "I can resume on the and of 2 after the written rest without adding time."], skillIds: ["sixteenth-subdivision", "three-eighth-meter", "rests"],
  }),
  ex({
    id: "a4-read-bass-landmarks", section: "guided", title: "Find Beethoven's low A and E", summary: "Locate A2 in the bottom bass space and E2 on the ledger line below the staff, then travel upward without a fixed stretch.", hands: "L",
    abc: grand("A and E in the bass", rest(4), ["A,,2 E,2", "A,2 E,2", "E,,2 E,2", "^G,2 E,2"]),
    fingering: "The notes are A2, E3, A3, E3, E2, E3, G#3, E3. Use 5 for the low A2/E2 and comfortable fingers for upper destinations. For later relays, 5–2–1 can cover A2–E3–A3 or E2–E3–G#3 with hand travel, not a frozen spread.",
    steps: ["Find bass-staff landmarks before listening: A2 is the bottom space, E2 is the first ledger line below, E3 is the third space and A3 the top line.", "Play the four bars slowly and name each octave. Release before moving to a distant key; let the forearm carry the hand instead of stretching between the notes.", "Listen afterward, then start directly at bar 3's E2. Finish by finding G#3 from G3 and recognizing its sharp sign in bass clef."],
    listenFor: ["E2 and E3 are an octave apart; A2 and A3 are also an octave apart.", "The last bar uses G#3 rather than G3."],
    checks: ["I can find A2 and low ledger-line E2 from the notation.", "I can move to the upper notes without locking an uncomfortable span."], skillIds: ["bass-ledger-reading", "register", "raised-leading-tone"],
  }),

  ex({
    id: "a4-scale-natural-r", section: "scales", title: "A natural minor: the RH octave", summary: "Use the white keys from A3 to A4, with the familiar 3-to-1 turn after C4.", minutes: 5, hands: "R",
    abc: grand("A natural minor, right hand", naturalR, rest(4)),
    fingering: "RH A3 B3 C4 D4 E4 F4 G4 A4 = 1-2-3-1-2-3-4-5 ascending. Descending A4 G4 F4 E4 D4 C4 B3 A3 = 5-4-3-2-1-3-2-1. This is lower than the F-major RH scale, keeping the reading near middle C.",
    steps: ["Locate A3 and preview the all-white-key octave. The small steps are B–C and E–F; G remains natural in this version.", "Practice B3(2)–C4(3)–D4(1)–E4(2), then reverse E4(2)–D4(1)–C4(3)–B3(2). The turn differs from the preceding F-major RH fingering.", "Play up and back at one quarter note per beat, holding the final A3 for two beats. Keep the crossing as unaccented as its neighbors."],
    listenFor: ["The natural G leaves a whole step to the top A.", "The thumb turn does not interrupt the count."],
    checks: ["I use 1-2-3-1-2-3-4-5 ascending and its correct return.", "I can name the version as natural minor because its G is natural."], skillIds: ["a-natural-minor", "thumb-crossing", "even-tone"],
  }),
  ex({
    id: "a4-scale-natural-l", section: "scales", title: "A natural minor: the LH octave", summary: "Learn A2 to A3 in the bass staff before adding a raised note.", minutes: 5, hands: "L",
    abc: grand("A natural minor, left hand", rest(4), naturalL),
    fingering: "LH A2 B2 C3 D3 E3 F3 G3 A3 = 5-4-3-2-1-3-2-1 ascending. Descending A3 G3 F3 E3 D3 C3 B2 A2 = 1-2-3-1-2-3-4-5. Finger 3 goes over after E3 upward; thumb goes under after F3 downward.",
    steps: ["Find A2 in the bottom bass space. Read up to A3, on the staff's top line, before moving the hand.", "Practice D3(2)–E3(1)–F3(3)–G3(2), then reverse G3(2)–F3(3)–E3(1)–D3(2) with a free hand.", "Play the complete octave and return. Keep the two-count final A2 and compare the low starting register with the RH's higher octave."],
    listenFor: ["The upper LH notes stay in the bass-staff region rather than jumping to A4.", "The little finger's low A is as controlled as the thumb's high A."],
    checks: ["I can locate both A2 and A3 without the reference.", "I can reverse the LH crossing without copying the RH's sequence."], skillIds: ["a-natural-minor", "thumb-crossing", "bass-reading"],
  }),
  ex({
    id: "a4-scale-harmonic-r", section: "scales", title: "Raise G: the RH harmonic-minor octave", summary: "Keep the same fingering while G sharp changes the sound near the top.", minutes: 5, bpm: 40, targetBpm: 60, hands: "R",
    abc: grand("A harmonic minor, right hand", harmonicR, rest(4)),
    fingering: "RH A3 B3 C4 D4 E4 F4 G#4 A4 = 1-2-3-1-2-3-4-5 ascending; return A4 G#4 F4 E4 D4 C4 B3 A3 = 5-4-3-2-1-3-2-1. Use finger 4 on the black G#4 both ways.",
    steps: ["Compare natural minor's G4 with the written G#4. Only that scale degree changes here; do not sharpen F as well.", "Practice F4(3)–G#4(4)–A4(5) slowly, then reverse. F to G# is three semitones, a wider gap than its neighboring steps; move comfortably rather than forcing a stretch.", "Play the octave up and back with the familiar crossing at C–D. Read the G-sharp sign on the return as well and hold the last A3 for two counts."],
    listenFor: ["The wider F–G# gap contrasts with the close G#–A half step.", "The altered note changes the sound without changing the pulse."],
    checks: ["I can distinguish natural from harmonic minor by the G note.", "I can keep the wider step relaxed and evenly timed."], skillIds: ["a-harmonic-minor", "raised-leading-tone", "even-tone"],
  }),
  ex({
    id: "a4-scale-harmonic-l", section: "scales", title: "Harmonic minor in the LH", summary: "Find G#3 near the top of the bass staff, keeping the LH's own octave fingering.", minutes: 5, bpm: 40, targetBpm: 60, hands: "L",
    abc: grand("A harmonic minor, left hand", rest(4), harmonicL),
    fingering: "LH A2 B2 C3 D3 E3 F3 G#3 A3 = 5-4-3-2-1-3-2-1 ascending. Descending A3 G#3 F3 E3 D3 C3 B2 A2 = 1-2-3-1-2-3-4-5. G#3 uses finger 2; the crossing stays E3–F3 on ascent.",
    steps: ["Locate G3 in the top bass space, then its black-key neighbor G#3. The written sharp changes that note, not the octave or the clef.", "Practice E3(1)–F3(3)–G#3(2)–A3(1) and reverse. Allow the hand to travel gently forward to the black key.", "Join the whole octave and return at a slow count. Compare the G#3 with the one in the E-bass relay; it is the same actual key."],
    listenFor: ["The raised leading note pulls upward toward A3.", "The return to F3 is a wider step, not an extra note or a hesitation."],
    checks: ["I read G#3 correctly in bass clef.", "I retain the LH crossing while making the natural-to-harmonic change."], skillIds: ["a-harmonic-minor", "raised-leading-tone", "bass-reading"],
  }),
  ex({
    id: "a4-scale-harmonic-both", section: "scales", title: "A small two-hand harmonic-minor goal", summary: "Join only as much of the two-hand scale as stays coordinated; completing an octave is optional today.", minutes: 5, bpm: 36, targetBpm: 56,
    abc: grand("A harmonic minor, both hands", harmonicR, harmonicL),
    fingering: "RH A3–A4 up 1-2-3-1-2-3-4-5, down 5-4-3-2-1-3-2-1. LH A2–A3 up 5-4-3-2-1-3-2-1, down 1-2-3-1-2-3-4-5. The hands stay one octave apart. RH crosses C–D; LH crosses E–F.",
    steps: ["Review each hand separately and name its crossing. If one hand is uncertain, use that hand's standalone lesson before combining.", "Join the first four notes, then isolate E–F–G#–A in both hands. Let the moving hand carry each crossing while both notes still land on the same count.", "Try an ascending octave and pause. Work the return separately before joining the whole written example; a secure four-note chunk is a useful result, and speed is not the goal."],
    listenFor: ["Each pair of octave notes starts together even where only one hand crosses.", "The G# remains clear without either hand jumping ahead of the beat."],
    checks: ["I can name a short two-hand chunk that stays steady.", "I know which hand's crossing needs the next separate-hand review."], skillIds: ["a-harmonic-minor", "two-hand-scale", "coordination"],
  }),

  ex({
    id: "a4-chord-am", section: "chords", title: "A minor as home harmony", summary: "Hear A–C–E and place a nearby upper voicing over a low A root.",
    abc: grand("Home in A minor", ["\"Am\"[CEA]4", "[CEA]2 z2", "[CEA]2 [CEA]2", "[CEA]4"], ["A,,4", "A,,2 z2", "A,,4", "A,,4"]),
    fingering: "RH C4 E4 A4 = 1 2 5, an A-minor first-inversion voicing. LH A2 with 5 supplies the root. Preview A3 C4 E4 separately if you want to hear the root-position note order before using the written shape.",
    steps: ["Name A, C and E, then find the written RH order C–E–A. Changing the order does not change the chord's identity.", "Add low A2 under the upper chord. In bar 3, hold the bass while the RH repeats on beats 1 and 3.", "Play four counted bars and release completely for the rest in bar 2. Keep the upper chord gentle and the bass supportive."],
    listenFor: ["The same three note names identify Am in either inversion.", "The repeated RH does not make the held bass bounce."],
    checks: ["I can build and identify A minor without a diagram.", "I can repeat the upper voicing while holding the bass."], skillIds: ["minor-triad", "a-minor-harmony", "held-bass"],
  }),
  ex({
    id: "a4-chord-dm-e7", section: "chords", title: "D minor and E7 around A", summary: "Read the raised G in E7 and the natural D that makes it a seventh chord.",
    abc: grand("Two harmonies away from home", ["\"Dm\"[DFA]4", "\"E7\"[D^GB]4", "\"Dm\"[DFA]2 \"E7\"[D^GB]2", "\"Am\"[CEA]4"], ["D,4", "E,,4", "D,2 E,,2", "A,,4"]),
    fingering: "RH Dm D4 F4 A4 = 1 3 5; E7 upper tones D4 G#4 B4 = 1 3 5; Am C4 E4 A4 = 1 2 5. LH roots are D3, E2, D3–E2, then A2 in the four written bars; use whole-hand travel. The bass E plus upper D–G#–B spells all four E7 tones.",
    steps: ["Build D–F–A, then E–G#–B–D. Point to the G-sharp sign and notice that D remains natural.", "Learn the RH shapes alone, then read the low bass destinations separately. Do not reach for the upper chord's E; the bass supplies it.", "Join one whole bar per chord, then the two half-bar changes in bar 3. Finish on Am and describe the feeling of the return without forcing a louder accent."],
    listenFor: ["E7 has G sharp rather than the natural G used in the earlier white-key scale.", "Its unsettled sound contrasts with the final A-minor arrival."],
    checks: ["I can name Dm and all four E7 chord tones.", "I can find the low E2 without stopping to count up from another bass note."], skillIds: ["dominant-seventh", "raised-leading-tone", "a-minor-harmony"],
  }),
  ex({
    id: "a4-chord-cadence", section: "chords", title: "Am–Dm–E7–Am: a complete harmonic sentence", summary: "Hear the route away from home and back while keeping close upper shapes and a steady count.",
    abc: grand("A minor returns home", ["\"Am\"[CEA]4", "\"Dm\"[DFA]4", "\"E7\"[D^GB]2 [D^GB]2", "\"Am\"[CEA]4"], ["A,,4", "D,4", "E,,4", "A,,4"]),
    fingering: "RH Am C4 E4 A4 uses 1 2 5; Dm D4 F4 A4 and E7 D4 G#4 B4 use 1 3 5. LH roots A2 D3 E2 A2. These close upper shapes are voicings; the bass roots identify the full harmony.",
    steps: ["Play the bass roots alone for four complete bars and name the harmonies in order.", "Play just G#4–A4 as two separate notes to hear the leading-tone pull, then practice the full E7-to-Am chord change. The chord shapes contain several voices; do not assume every finger follows that single-note demonstration.", "Combine the four bars. Keep the bass down through the repeated E7 attacks in bar 3, then let the last Am sound for its full four counts."],
    listenFor: ["The E7-to-Am return settles the phrase.", "The final chord can soften without making the pulse slow down."],
    checks: ["I can follow the four-bar harmony without a restart.", "I can distinguish a musical ending from simply stopping because the notes ran out."], skillIds: ["minor-cadence", "dominant-seventh", "phrase-shape"],
  }),
  ex({
    id: "a4-chord-minor-loop", section: "chords", title: "A quiet four-chord accompaniment", summary: "An original Am–F–C–G loop for a small melody of your own. This is a creative option alongside the Beethoven goal.",
    abc: grand("A quiet minor-key accompaniment", ["\"Am\"[CEA]4", "\"F\"[CFA]4", "\"C\"[CEG]4", "\"G\"[B,DG]4"], ["A,,4", "F,,4", "C,4", "G,,4"]),
    fingering: "RH Am C4 E4 A4 = 1 2 5; F C4 F4 A4 = 1 3 5; C C4 E4 G4 = 1 3 5; G B3 D4 G4 = 1 2 5. LH roots A2 F2 C3 G2. These root changes use G natural; do not add G sharp by habit.",
    steps: ["Play the four written chord shapes and low roots slowly, one bar per chord. The G-major chord differs from the E7 harmony used in the cadence.", "Keep the bass roots and, with reference stopped, replace the RH chords with one melody note per bar: A4, A4, G4, G4. Hear how the harmony changes its meaning.", "Invent a second version using only A4, C5, E5 and G4, then return to the written accompaniment. Keep four counts per bar and make one change at a time."],
    listenFor: ["Natural G belongs to this loop even though another A-minor passage uses G sharp.", "A simple melody can be expressive when the harmony changes underneath."],
    checks: ["I can keep the four-bar form while naming Am, F, C and G.", "I can choose one small melodic variation without losing the pulse."], skillIds: ["minor-pop-accompaniment", "creative-application", "a-minor-harmony"],
  }),

  ex({
    id: "a4-relay-am", section: "guided", title: "The A-minor relay between the hands", summary: "Repeat the exact note-and-rest cell of Für Elise bar 2, slowly enough to understand which hand owns each attack.", minutes: 6, bpm: 28, targetBpm: 48,
    abc: grand("Preparing the A-minor relay", Array(4).fill("A2 z CEA"), Array(4).fill("A,,E,A, z3"), "1/16", "3/8"),
    source: { ...beethoven, scope: "Original bar 2 only, repeated four times as a preparation study.", changes: ["The same one-bar cell is repeated for practice; this is not presented as a complete Beethoven phrase.", "Original pedal/dynamic markings omitted; fingering and practice guidance authored by Woodshed."] },
    fingering: "RH A4 at the start may use 1; during its written rest move to C4(1), E4(2), A4(5). LH A2(5), E3(2), A3(1) uses a traveling hand. Release each short bass note rather than holding an uncomfortable span.",
    steps: ["Count 1 and 2 and 3 and as sixteenths inside three eighth pulses. On 1, RH A4 and LH A2 begin together; RH A4 stays down through the first two small units.", "The remaining sequence is LH E3 on and of 1, LH A3 on 2 while RH rests, then RH C4 on and of 2, E4 on 3 and A4 on and of 3. Say the hand names while tapping this sequence first.", "Play each hand separately, then combine only the shared first attack plus two more bass notes. Add the three-note RH answer when the count stays steady.", "Repeat one or two written bars without accelerating. The small RH repositioning happens during its written silence; it is a hand move, not an octave stretch."],
    listenFor: ["The relay fills six evenly spaced small units without a gap between the hands.", "The opening RH note overlaps the first two bass attacks, then releases for the written rest."],
    checks: ["I can name which hand plays each sixteenth position.", "I can make a steady one-bar relay at a comfortable tempo without freezing the hand span."], skillIds: ["sixteenth-subdivision", "interleaved-hands", "bass-ledger-reading"],
  }),
  ex({
    id: "a4-relay-e", section: "guided", title: "The E-major relay and its G sharps", summary: "Repeat Für Elise bar 3 with G sharp in both registers, keeping the same six-part rhythm as the A-minor cell.", minutes: 6, bpm: 28, targetBpm: 48,
    abc: grand("Preparing the E-major relay", Array(4).fill("B2 z E^GB"), Array(4).fill("E,,E,^G, z3"), "1/16", "3/8"),
    source: { ...beethoven, scope: "Original bar 3 only, repeated four times as a preparation study.", changes: ["The same one-bar cell is repeated for practice; this is not presented as a complete Beethoven phrase.", "Original pedal/dynamic markings omitted; fingering and practice guidance authored by Woodshed."] },
    fingering: "RH initial B4 may use 5; during its rest reposition for E4(1), G#4(2), B4(5). LH E2(5), E3(2), G#3(1) requires release and hand travel, especially across the first octave. Keep the thumb comfortably forward for the black G#3.",
    steps: ["Locate low E2, upper E3 and G#3 before the click. Read the upper G#4 as a different key with the same letter name and sharp.", "Count six small positions: together RH B4/LH E2 on 1, LH E3 on and of 1, LH G#3 on 2, RH E4 on and of 2, RH G#4 on 3, RH B4 on and of 3.", "Play each hand, then a single combined bar. Keep the first RH B held for its eighth and its following sixteenth rest silent.", "Alternate this cell with the A-minor relay after stopping the reference. Change the pitches while preserving the timing; use a slower pulse if the low E jump causes a pause."],
    listenFor: ["Both G notes are sharp in this cell.", "The lower E2 register does not make the first bass jump late."],
    checks: ["I find G#3 and G#4 without substituting G natural.", "I can connect the E-major relay to the A-minor relay without changing the three-pulse bar."], skillIds: ["interleaved-hands", "raised-leading-tone", "bass-ledger-reading"],
  }),
  ex({
    id: "a4-fur-elise-opening", section: "guided", title: "Für Elise: opening strain", summary: "Beethoven's authentic two-sixteenth pickup and bars 1–8 through the first ending. This named excerpt is a complete goal of its own; the later strains and episodes belong to another project.", minutes: 8, bpm: 28, targetBpm: 60, pickup: true, partialBars: { 1: 0.5, 9: 1 },
    passages: [{ label: "Pickup + bar 1", from: 1, to: 2 }, { label: "Bars 2–3: the two relays", from: 3, to: 4 }, { label: "Bars 4–5: returning motif", from: 5, to: 6 }, { label: "Bars 6–8: first ending", from: 7, to: 9 }],
    abc: grand("Fur Elise - pickup and bars 1-8", furRight, furLeft, "1/16", "3/8"),
    source: { ...beethoven, scope: "Two-sixteenth pickup plus original bars 1–8, taking the first ending; no later material.", changes: ["Pitches, note lengths, rests and the shortened first-ending bar are preserved; the printed repeat is played once.", "Pedal markings omitted; the initial pp is retained. Fingering and explanatory guidance are Woodshed's editorial additions.", "Reference playback is synthesized from the written score; it demonstrates timing/pitches rather than a human interpretation."] },
    why: "This keeps the recognisable music the learner already enjoys while giving each new skill a concrete job: the pickup sets the entrance, sixteenths join the hands, G sharp belongs to the E-major relay, and the low A/E starts require deliberate bass reading.",
    fingering: "Our suggested fingering, not supplied by this source: opening E5–D#5 uses RH 5–4; bar 1 continues 5–4–5–2–4–3 on E5 D#5 E5 B4 D5 C5. In A-minor relay bars, initial A4 can use 1 before repositioning to C4–E4–A4 with 1–2–5; E-major relay bars use E4–G#4–B4 with 1–2–5 after B4. LH A2–E3–A3 and E2–E3–G#3 use 5–2–1 with release and hand travel. Prepare E4–E5 in bar 4 by moving the hand; do not hold a fixed octave stretch.",
    steps: ["Start with the session's selected passage. For pickup plus bar 1, count three eighth pulses but enter on pulse 3: E5 then D#5 are its two sixteenths. The next E5 begins bar 1 on pulse 1.", "Learn the right-hand opening with written pitch names. Bar 1's later D5 is natural, even though D#5 occurred earlier in that bar; the natural sign is deliberate. D sharp is a chromatic neighbor here, separate from A minor's raised G.", "Review original bars 2 and 3 using the two relay preparations. Add the melody's first held eighth with the LH root, then let the moving notes pass between hands without a new pause.", "Work original bar 4 separately: C5 eighth, a sixteenth rest, then E4–E5–D#5. Rejoin its last two notes to bar 5's opening; the repeated motif crosses the barline.", "Join original bars 6–8. Bar 7 returns through E4–C5–B4, and the first ending holds A4 for a quarter while LH plays A2–E3–A3 then rests. This last bar has two eighth pulses because it complements the one-eighth pickup.", "Play the chosen passage without restarting, then stop and review pulse, rests and register against the reference. Aim for one reliable join today; on another day, make a fresh check of the whole named excerpt. The pp marking suggests a quiet character, but the synth is a timing reference, not an expressive model."],
    listenFor: ["The pickup leads into the first full bar instead of becoming an extra full bar.", "The sixteenths remain even through the RH/LH relay and the low-register hand moves.", "D natural in bars 1 and 5 differs from their earlier D sharp; G sharps belong to the E-major cells.", "The first ending's shorter written bar closes the strain without inventing an extra eighth note."],
    checks: ["I can identify the exact passage I worked on and enter it from a count-in without restarting.", "I preserve the rests and hand relays rather than smoothing them into different rhythms.", "I can give a comfortable complete first-strain attempt or name the specific join that remains my next goal."], skillIds: ["authentic-repertoire", "sixteenth-subdivision", "interleaved-hands", "pickup-reading", "bass-ledger-reading"],
  }),
  ex({
    id: "a4-create-minor-answer", section: "guided", title: "Make your own small minor-key answer", summary: "An original two-bar question with space for your answer: a short creative break alongside the Beethoven project.", hands: "R",
    abc: grand("A question to answer in A", ["A, C E2", "G2 E2", "z4", "z4"], rest(4)),
    fingering: "The written question starts A3(1), C4(3), E4(5). Reposition for G4 if needed rather than holding the original five-note shape. For an easier answer use A3 C4 D4 E4 only, then finish on A3.",
    steps: ["Listen to the two-bar question and count through the empty two-bar answer. This exercise is in 4/4, unlike the Beethoven excerpt's 3/8.", "Stop playback and play the question yourself. Make a two-bar answer with quarter and half notes, leaving a counted rest if you like.", "Repeat the answer you prefer and end on A. If you choose G natural or G sharp, make it intentional and describe the different sound before writing a note for next time."],
    listenFor: ["The answer keeps exactly two four-beat bars.", "An ending on A feels more settled than leaving the question on E."],
    checks: ["I can repeat or describe my chosen answer.", "I can switch back to three eighth pulses when returning to Beethoven."], skillIds: ["creative-application", "a-minor-hearing", "phrase-shape"],
  }),
];

export const SESSIONS = [
  { id: "a4-d1-a", unitId: UNIT.id, day: 1, slot: "A", title: "Three pulses, one minor home", focus: "Read A minor, count 3/8 calmly, locate low A/E and begin the natural-minor RH octave.", blocks: [{ exerciseId: "a4-read-home", minutes: 3 }, { exerciseId: "a4-rhythm-three-eighths", minutes: 5 }, { exerciseId: "a4-read-bass-landmarks", minutes: 6 }, { exerciseId: "a4-scale-natural-r", minutes: 6 }] },
  { id: "a4-d1-b", unitId: UNIT.id, day: 1, slot: "B", title: "Beethoven's recognisable entrance", focus: "Build Am, subdivide three eighth pulses into sixteenths, and make the original pickup plus first bar a named small goal.", blocks: [{ exerciseId: "a4-chord-am", minutes: 3 }, { exerciseId: "a4-rhythm-sixteenths", minutes: 5 }, { exerciseId: "a4-fur-elise-opening", minutes: 8, fromBar: 1, toBar: 2, goal: "Enter the two-sixteenth pickup and play original bar 1 with its D natural restored." }, { exerciseId: "a4-create-minor-answer", minutes: 4 }] },
  { id: "a4-d2-a", unitId: UNIT.id, day: 2, slot: "A", title: "Six even small steps", focus: "Subdivide each eighth pulse into two, read the low bass starts and learn the LH natural-minor octave.", blocks: [{ exerciseId: "a4-rhythm-sixteenths", minutes: 5 }, { exerciseId: "a4-read-bass-landmarks", minutes: 4 }, { exerciseId: "a4-relay-am", minutes: 6 }, { exerciseId: "a4-scale-natural-l", minutes: 5 }] },
  { id: "a4-d2-b", unitId: UNIT.id, day: 2, slot: "B", title: "The first A-minor relay", focus: "Meet Dm/E7, prepare the A-minor cell and connect the authentic opening to original bar 2.", blocks: [{ exerciseId: "a4-chord-dm-e7", minutes: 5 }, { exerciseId: "a4-relay-am", minutes: 5 }, { exerciseId: "a4-fur-elise-opening", minutes: 10, fromBar: 1, toBar: 3, goal: "Keep the pickup and original bars 1–2 in time, including the first shared melody/bass attack and the RH rest." }] },
  { id: "a4-d3-a", unitId: UNIT.id, day: 3, slot: "A", title: "The raised note has a purpose", focus: "Review sixteenths, compare G/G sharp, learn the E-major relay and the RH harmonic-minor octave.", blocks: [{ exerciseId: "a4-rhythm-sixteenths", minutes: 4 }, { exerciseId: "a4-hear-g-sharp", minutes: 4 }, { exerciseId: "a4-relay-e", minutes: 7 }, { exerciseId: "a4-scale-harmonic-r", minutes: 5 }] },
  { id: "a4-d3-b", unitId: UNIT.id, day: 3, slot: "B", title: "Answer A minor with E major", focus: "Hear a complete cadence, connect the two authentic relay bars and prepare the register move back toward the opening motif.", blocks: [{ exerciseId: "a4-chord-cadence", minutes: 4 }, { exerciseId: "a4-relay-e", minutes: 6 }, { exerciseId: "a4-fur-elise-opening", minutes: 10, fromBar: 3, toBar: 5, goal: "Join original bars 2–4, keeping both G sharps and the written rest before E4–E5–D#5." }] },
  { id: "a4-d4-a", unitId: UNIT.id, day: 4, slot: "A", title: "Keep the low notes readable", focus: "Revisit the bass map, put harmonic minor into the LH and connect both relays with the same count.", blocks: [{ exerciseId: "a4-read-bass-landmarks", minutes: 4 }, { exerciseId: "a4-scale-harmonic-l", minutes: 5 }, { exerciseId: "a4-relay-am", minutes: 5 }, { exerciseId: "a4-relay-e", minutes: 6 }] },
  { id: "a4-d4-b", unitId: UNIT.id, day: 4, slot: "B", title: "The motif returns and finds its ending", focus: "Take a creative chord break, then learn the authentic return through the shortened first ending.", blocks: [{ exerciseId: "a4-chord-minor-loop", minutes: 4 }, { exerciseId: "a4-fur-elise-opening", minutes: 12, fromBar: 5, toBar: 9, goal: "Join original bars 4–8, including the returning motif, changed bar 7 and first-ending A4 quarter note." }, { exerciseId: "a4-create-minor-answer", minutes: 4 }] },
  { id: "a4-d5-a", unitId: UNIT.id, day: 5, slot: "A", title: "Retrieve the count, then join the hands", focus: "Return to the earlier rhythm examples without the demo first, join a small two-hand harmonic-minor chunk and revisit one original relay." , blocks: [{ exerciseId: "a4-rhythm-three-eighths", minutes: 3 }, { exerciseId: "a4-rhythm-sixteenths", minutes: 4 }, { exerciseId: "a4-scale-harmonic-both", minutes: 5 }, { exerciseId: "a4-chord-cadence", minutes: 4 }, { exerciseId: "a4-relay-e", minutes: 4 }] },
  { id: "a4-d5-b", unitId: UNIT.id, day: 5, slot: "B", title: "A real excerpt to keep", focus: "Return to the complete named strain, then choose one musical next step rather than requiring the full work.", blocks: [{ exerciseId: "a4-chord-am", minutes: 3 }, { exerciseId: "a4-fur-elise-opening", minutes: 13, fromBar: 1, toBar: 9, goal: "Give one comfortable pickup-through-first-ending performance, then repair only the most useful join. Return for a fresh check on a later day." }, { exerciseId: "a4-create-minor-answer", minutes: 4 }] },
];

export const CATALOGUE = [
  ...EXERCISES.filter((e) => e.section === "chords" || e.section === "scales").map((e) => ({ id: `catalogue-${e.id}`, unitId: UNIT.id, title: e.title, description: e.summary, exerciseId: e.id, kind: "built-in", skills: [...e.skillIds] })),
  { id: "catalogue-a4-fur-elise-opening", unitId: UNIT.id, title: "Für Elise: authentic opening strain", description: "Pickup plus original bars 1–8, first ending; source notes, rests and partial bars preserved. Study it in passages or return to the complete named excerpt.", exerciseId: "a4-fur-elise-opening", kind: "built-in", skills: ["authentic-repertoire", "sixteenth-subdivision", "interleaved-hands", "pickup-reading", "bass-ledger-reading"] },
];
