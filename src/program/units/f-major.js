// Unit 3: the flat changes the reading map and F changes the RH scale turn.
// Every written example is original; no outside score or recording is needed.
export const UNIT = {
  id: "f-major-foundations-3", number: 3, key: "F major",
  title: "A week in F: a new turn, a warmer sound",
  description: "Five repeatable days with two twenty-minute sessions. Read B flat, learn F's different right-hand scale crossing, and turn F, B flat, C7 and D minor into small musical stories. The new key is the main change: keep the rhythms and hand combinations comfortable, and repeat a day whenever its checks remain uncertain.",
  daysPerWeek: 5, sessionsPerDay: 2, sessionMinutes: 20,
};

const original = { label: "Original Woodshed teaching material — F major" };
const grand = (title, right, left, unit = "1/4", meter = "4/4") => {
  if (right.length !== left.length) throw new Error(`Unmatched hands: ${title}`);
  const lines = [];
  for (let i = 0; i < right.length; i += 4) {
    const end = i + 4 >= right.length ? " |]" : " |";
    lines.push(`[V:1] ${right.slice(i, i + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${left.slice(i, i + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:${meter}\nL:${unit}\nK:F\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
};
const rest = (n, value = "z4") => Array(n).fill(value);
const ex = (x) => ({ unitId: UNIT.id, key: UNIT.key, minutes: 4, bpm: 48, targetBpm: 64, hands: "both", source: original, ...x });
const octaveR = ["F G A B", "c d e f", "e d c B", "A G F2"];
const octaveL = ["F,, G,, A,, B,,", "C, D, E, F,", "E, D, C, B,,", "A,, G,, F,,2"];

export const EXERCISES = [
  ex({
    id: "f3-read-signature", section: "guided", title: "One flat changes every B", summary: "Find B flat in both clefs before asking the hands to work together.", minutes: 3, hands: "both",
    abc: grand("One flat, two registers", ["B2 c2", "A2 B2", "z4", "z4"], ["z4", "z4", "B,2 C2", "A,2 B,2"]),
    fingering: "RH notes F4 G4 A4 Bb4 C5 take fingers 1 2 3 4 5. LH notes F3 G3 A3 Bb3 C4 take fingers 5 4 3 2 1. Hands take separate two-bar turns; the first RH Bb4 uses finger 4 and the LH Bb3 uses finger 2.",
    steps: ["Find the single flat in the key signature. It changes every B in this example, in either clef and either octave, to the black key just below B natural.", "Before listening, name the first RH Bb4 and the first LH Bb3. Locate both black keys; they are an octave apart.", "Listen, count four beats per bar, then play each hand's turn. Hold every half note for two counts and keep counting while that hand rests."],
    listenFor: ["Bb is one semitone below B natural; do not play the white B out of habit.", "The LH answer is an octave below the RH question."],
    checks: ["I can explain which note letter the F-major signature changes.", "I found Bb in both registers without relying only on the demo."], skillIds: ["key-signature", "b-flat-reading", "register"],
  }),
  ex({
    id: "f3-read-b-flat", section: "guided", title: "Read B flat beside its neighbors", summary: "Stay in one small treble position and read the flat from the signature, not an accidental on every note.", hands: "R",
    abc: grand("The black-key neighbor", ["B2 A2", "G2 F2", "B c A B", "F4"], rest(4)),
    fingering: "RH F4 G4 A4 Bb4 C5 = fingers 1 2 3 4 5. Keep the hand comfortably forward enough for finger 4 to reach Bb; do not stretch the other fingers flat.",
    steps: ["Preview the phrase before listening. Point to each written B and say B flat; a barline does not cancel a key signature.", "Play bar 1, Bb4 with 4 then A4 with 3. Add G4–F4, then read the different ordering in bar 3.", "Play four bars at a steady count. After listening, hide the pitch help and read bar 3 again from the staff."],
    listenFor: ["Bb4–A4 is a close downward half step.", "The four quarter notes in bar 3 fit the same four-beat bar as two half notes."],
    checks: ["I read all written Bs as flat in this key.", "I can begin at bar 3 instead of needing the opening to remember the notes."], skillIds: ["b-flat-reading", "interval-reading", "pulse"],
  }),
  ex({
    id: "f3-read-register", section: "guided", title: "Around middle C in F", summary: "Keep E natural and B flat distinct while the hands read the same neighborhood in two clefs.",
    abc: grand("A middle-register exchange", ["C D E F", "B, C D2", "z4", "z4"], ["z4", "z4", "C B, A, G,", "F,2 A,2"]),
    fingering: "RH first C4 D4 E4 F4 = 1 2 3 4; shift down for Bb3 C4 D4 = 1 2 3. LH F3 G3 A3 Bb3 C4 = 5 4 3 2 1, so its answer begins C4 with thumb 1. Hands take turns near middle C.",
    steps: ["Find middle C in each clef. Check that E is still a white key: the signature changes B only.", "Read the RH's first two bars without a demo, then the LH's two-bar answer. Move the whole RH down before Bb3 rather than stretching its thumb backward.", "Listen afterward to check both register and flats. Join the four bars with continuous counting through the silent hand's turn."],
    listenFor: ["The first LH C4 is the same pitch as the opening RH C4, even though it is written in bass clef.", "Bb3–C4 is a whole step; E4–F4 is a half step."],
    checks: ["I checked the clef and octave before each hand's entrance.", "I can read both E natural and B flat correctly without making all nearby notes black keys."], skillIds: ["ledger-landmarks", "b-flat-reading", "register"],
  }),
  ex({
    id: "f3-read-fresh", section: "guided", title: "Read and recall an F-major message", summary: "Read before playback on the first visit. On later visits, check the same passage from memory and notation before listening.", minutes: 3,
    abc: grand("An unread message in F", ["A c B G", "F2 A2", "z4", "F4"], ["z4", "z4", "B,, D, C, E,", "F,4"]),
    fingering: "RH F4–C5 uses 1–5; first A4 is 3. For the LH turn, place Bb2 C3 D3 E3 F3 under 5 4 3 2 1: its notes are Bb2(5), D3(3), C3(4), E3(2), then F3(1).",
    steps: ["Before listening, identify the flat, both starting registers and the RH rest in bar 3. Name the LH's four quarter notes.", "Play once at a pace that lets the count continue. A slip is information; do not restart every time a note surprises you.", "Now listen. Choose one bar to repair, then make one more complete reading and write the issue you want to revisit."],
    listenFor: ["The LH starts on low Bb2, not Bb3 just below middle C.", "Both hands reach their different-octave Fs together in bar 4."],
    checks: ["I made a first reading before hearing the answer.", "I can name whether my next step is rhythm, register, flat reading or coordination."], skillIds: ["staff-reading", "b-flat-reading", "register"],
  }),
  ex({
    id: "f3-rhythm-pulse", section: "guided", title: "Keep the count while F rings", summary: "Review long notes and a counted rest on one key before adding the new key's hand motions.", minutes: 3, bpm: 52, targetBpm: 72, hands: "R",
    abc: grand("The same steady pulse", ["F F F F", "F2 F2", "F z F2", "F4"], rest(4)),
    fingering: "RH finger 2 on F4, the white key just above E4. Use one finger because this exercise isolates rhythm.",
    steps: ["Listen while tapping 1 2 3 4 in every bar. Keep tapping through the four-count final note.", "Tap only the new attacks with the other hand: bar 3 has a note on 1, silence on 2, and a two-count note starting on 3.", "Play F4 with the click, then try without it. Return to the click and check whether the rest or held notes stretched the bar."],
    listenFor: ["The rest occupies one exact beat.", "A held F does not create a new attack on every count."],
    checks: ["The next note after the rest arrives on beat 3.", "I can maintain four equal counts through the final bar."], skillIds: ["pulse", "note-lengths", "rests"],
  }),
  ex({
    id: "f3-rhythm-eighths", section: "guided", title: "Small subdivisions on a black key", summary: "Review eighth-note pairs on Bb without also learning a moving melody.", bpm: 52, targetBpm: 72, hands: "R",
    abc: grand("B flat inside the beat", ["B2 B2 B B B2", "B B B2 B2 B2", "B2 z2 B B B2", "B4 z4"], rest(4, "z8"), "1/8"),
    fingering: "RH finger 2 on Bb4. The written B is flat because K:F supplies the signature; no new hand position is needed during the phrase.",
    steps: ["Say 1 and 2 and 3 and 4 and while tapping only the numbered beats. Listen for two equal eighths inside one beat.", "Tap the written attacks. Bar 3 is silent on beat 2; its eighth pair occupies beat 3.", "Play the same rhythm on Bb4. Keep the main pulse unchanged when the note density increases, and release completely for each rest."],
    listenFor: ["An eighth pair does not make the entire bar hurry.", "The last half note sounds for beats 1–2, followed by two silent beats."],
    checks: ["I can keep speaking subdivisions during the rests.", "I can fit the eighth pair exactly between two main clicks."], skillIds: ["eighth-subdivision", "rests", "b-flat-reading"],
  }),
  ex({
    id: "f3-rhythm-held-joins", section: "guided", title: "A familiar tie, a new home note", summary: "Count through a tied note before returning to two-hand music. This reviews rhythm rather than adding a faster tempo.", bpm: 48, targetBpm: 68, hands: "R",
    abc: grand("Hold the hidden beat", ["F2-F F F2 F2", "F F-F2 F2 F2", "F2 F2-F2 F2", "F4 z4"], rest(4, "z8"), "1/8"),
    fingering: "RH finger 2 on F4. A tie keeps that finger down; it does not ask for a repeated note.",
    steps: ["Count 1 and 2 and 3 and 4 and. In bar 1, hold the first F through beat 2 and play the next attack on the and of 2.", "Listen, then tap only new attacks. Compare bar 2, where the tie begins on the and of 1 and continues through beat 2.", "Play on one key, keeping the count audible. If the tie disrupts the pulse, practice only the tied span and the note after it before restoring the whole bar."],
    listenFor: ["The tied-to note has no new attack.", "The final silence still takes beats 3 and 4."],
    checks: ["I can identify the written notes that are held rather than struck.", "The first new attack after each tie falls on its stated subdivision."], skillIds: ["ties", "eighth-subdivision", "pulse"],
  }),
  ex({
    id: "f3-coord-held-bass", section: "guided", title: "Let the bass stay while Bb passes", summary: "Keep one long LH note under a moving F-major melody. The new flat is the main added challenge.", minutes: 7,
    abc: grand("A melody over patient bass", ["F G A B", "c2 B2", "A2 G2", "F4"], ["F,4", "B,,4", "C,4", "F,4"]),
    fingering: "RH F4 G4 A4 Bb4 C5 = 1 2 3 4 5: this five-finger melody uses C5 with 5, not the full scale's thumb. LH starts F3 with 5, moves to Bb2 with 5, C3 with 4 and F3 with 1 if that span feels comfortable; whole-hand moves with 5 are also fine.",
    steps: ["Play the RH alone and read each Bb from the signature. Then play only the bass, holding each note for four counts.", "Combine bar 1: both hands start together, then the LH remains down while the RH plays its other three notes.", "Join bars in pairs. Prepare each LH destination before the barline without shortening the previous bass note; use a slower pulse if the move makes the melody stop."],
    listenFor: ["The bass is one continuous four-beat sound per bar.", "The melody's Bb does not cause an extra LH attack."],
    checks: ["I can hold the bass while playing several RH notes.", "I can change bass at the barline without restarting the count."], skillIds: ["held-bass", "coordination", "b-flat-reading"],
  }),
  ex({
    id: "f3-coord-bass-first", section: "guided", title: "Let the bass invite the melody", summary: "A silent first melody beat makes the hands begin at different times while the bass remains simple.", minutes: 7,
    abc: grand("The melody arrives later", ["z2 A2 B2 A2", "G2 c2 G4", "z2 B2 A2 G2", "F8"], ["F,8", "C,8", "B,,8", "F,8"], "1/8"),
    fingering: "RH F4–C5 uses 1–5; first A4 is 3 and Bb4 is 4. LH roots are F3, C3, Bb2, F3; use comfortable whole-hand moves. Keep the wrists loose while one hand waits.",
    steps: ["Count four beats and tap the bass on 1. The melody enters on beat 2 in bars 1 and 3; wait for that beat rather than copying the LH attack.", "Play the RH alone while counting its opening rest, then LH alone with full-bar holds.", "Combine one bar at a time and join pairs. At the last bar both hands begin together again; allow all four counts before stopping."],
    listenFor: ["The opening bass establishes the pulse before the melody appears.", "The held RH G in bar 2 lasts beats 3–4."],
    checks: ["I can begin the LH without automatically starting the RH.", "I can return to a together entrance in the last bar without rushing."], skillIds: ["coordination", "rests", "held-bass"],
  }),

  ex({
    id: "f3-scale-five-r", section: "scales", title: "F major: a five-note RH shape", summary: "Find F, G, A, Bb and C with a quiet hand before crossing the thumb in an octave scale.", minutes: 6, hands: "R",
    abc: grand("F five-finger right hand", ["F G A B", "c2 B2", "A G F G", "F4"], rest(4)),
    fingering: "RH F4 G4 A4 Bb4 C5 = 1 2 3 4 5 for this stationary five-note drill. The octave scale later changes C5 to thumb 1; do not carry this drill's 5 onto that scale.",
    steps: ["Locate F4 just above middle C's E4. Place the fingers gently on F–G–A–Bb–C, with 4 reaching the black Bb.", "Play the first two bars slowly. Keep the Bb finger comfortably forward instead of twisting the wrist to reach it.", "Return through the last two bars. Match the tone of the black key to its white-key neighbors, then try the whole four-bar shape with the click."],
    listenFor: ["Bb has the same gentle tone as the surrounding notes.", "A–Bb is the half step in this five-note group."],
    checks: ["I find Bb without pausing or striking it harder.", "I understand that this stationary drill and the octave scale use different C5 fingers."], skillIds: ["f-major-shape", "b-flat-reading", "even-tone"],
  }),
  ex({
    id: "f3-scale-five-l", section: "scales", title: "F major: the LH five-note shape", summary: "Read F3–C4 in bass clef and reverse the same hand position.", minutes: 5, hands: "L",
    abc: grand("F five-finger left hand", rest(4), ["F, G, A, B,", "C2 B,2", "A, G, F, G,", "F,4"]),
    fingering: "LH F3 G3 A3 Bb3 C4 = 5 4 3 2 1 ascending; C4 Bb3 A3 G3 F3 = 1 2 3 4 5 descending. C4 is middle C, written above the bass staff.",
    steps: ["Find F3 below middle C, then place 5–4–3–2–1 over F–G–A–Bb–C.", "Play two bars while saying the note names. Keep finger 2 on Bb rather than reaching for B natural.", "Read the return, then play the full example with a steady quarter-note pulse. Hold each half note in bar 2 for two counts and the final F for four counts instead of letting the exercise end early."],
    listenFor: ["The bass phrase climbs toward middle C rather than starting there.", "The thumb's C4 is no louder than the little finger's F3."],
    checks: ["I can read all five notes in this bass register.", "Both the outward and return motion keep an even tone and count."], skillIds: ["f-major-shape", "bass-reading", "even-tone"],
  }),
  ex({
    id: "f3-scale-octave-r", section: "scales", title: "The F-major RH turn is after finger 4", summary: "F is different from C and G: the thumb passes under after Bb, not after the third note.", minutes: 5, bpm: 44, targetBpm: 64, hands: "R",
    abc: grand("F major right hand, one octave", octaveR, rest(4)),
    fingering: "RH F4 G4 A4 Bb4 C5 D5 E5 F5: 1-2-3-4-1-2-3-4 ascending. Descending F5 E5 D5 C5 Bb4 A4 G4 F4: 4-3-2-1-4-3-2-1. Pass thumb 1 under after Bb4 going up; pass finger 4 over thumb after C5 going down.",
    steps: ["First play only A4(3)–Bb4(4)–C5(1)–D5(2). Move the hand with the thumb instead of pulling the thumb far sideways under a fixed wrist.", "Reverse that small join: D5(2)–C5(1)–Bb4(4)–A4(3). The downward crossing uses 4 over 1; it is not C major's crossing.", "Play the written octave up and back. The top F5 is played once, then E5 begins the descent; hold the final F4 for two beats."],
    listenFor: ["The crossing between Bb4 and C5 has the same pulse as every other step.", "C5 remains a clear thumb note without an accent or a gap."],
    checks: ["I use 1-2-3-4-1-2-3-4 on the ascent.", "I can reverse the C5–Bb4 join with 1 then 4 without guessing."], skillIds: ["f-major-scale", "thumb-crossing", "even-tone"],
  }),
  ex({
    id: "f3-scale-octave-l", section: "scales", title: "F-major LH: finger 3 over the thumb", summary: "Keep the LH's own crossing distinct from the RH's different pattern.", minutes: 5, bpm: 44, targetBpm: 64, hands: "L",
    abc: grand("F major left hand, one octave", rest(4), octaveL),
    fingering: "LH F2 G2 A2 Bb2 C3 D3 E3 F3: 5-4-3-2-1-3-2-1 ascending. Descending F3 E3 D3 C3 Bb2 A2 G2 F2: 1-2-3-1-2-3-4-5. Ascending, finger 3 goes over after C3; descending, thumb 1 passes under after D3. This octave lies on the bass staff, below the five-note F3–C4 reading drill.",
    steps: ["Locate F2 in the space just below the bass staff's bottom G2 line; C3 is the staff's second space from the bottom. Practice Bb2(2)–C3(1)–D3(3)–E3(2) as one small ascending join.", "Reverse E3(2)–D3(3)–C3(1)–Bb2(2), allowing the whole hand to travel rather than twisting the thumb into place.", "Play the written octave up and back at a comfortable count. The LH reaches F3, only one octave above F2; do not jump to the RH's F5."],
    listenFor: ["C3–D3 is a smooth whole step even though the fingers cross.", "The return reaches the original low F2, held for two counts."],
    checks: ["I use 5-4-3-2-1-3-2-1 on the ascent.", "I can descend with 1-2-3-1-2-3-4-5 without copying the RH."], skillIds: ["f-major-scale", "thumb-crossing", "bass-reading"],
  }),
  ex({
    id: "f3-scale-octave-both", section: "scales", title: "F-major scale: two different turns together", summary: "The hands cross at different places. Join small chunks only after each hand's fingering is secure.", minutes: 6, bpm: 40, targetBpm: 60,
    abc: grand("F major, hands together", octaveR, octaveL),
    fingering: "RH F4–F5 ascending 1-2-3-4-1-2-3-4; descending 4-3-2-1-4-3-2-1. LH F2–F3 ascending 5-4-3-2-1-3-2-1; descending 1-2-3-1-2-3-4-5. The hands stay two octaves apart in this version; their crossing notes differ.",
    steps: ["Play each hand's octave separately and name where it turns. If either is uncertain, choose that hand in the player before combining.", "Join F–G–A–Bb only. Next isolate Bb–C–D–E: RH crosses Bb to C, then LH crosses C to D on the following step.", "Join the ascending octave, rest your hands, and work the descending joins slowly. Attempt the complete written return only when both counts stay steady; a secure two-bar goal is worthwhile."],
    listenFor: ["The two notes on each count sound together despite the different finger motions.", "The pulse stays comfortable through the two successive crossings."],
    checks: ["I can describe each hand's crossing without conflating the fingerings.", "I can choose a short hands-together chunk that remains steady rather than forcing speed."], skillIds: ["f-major-scale", "two-hand-scale", "thumb-crossing"],
  }),
  ex({
    id: "f3-scale-turn-application", section: "scales", title: "Use the F turn in a small phrase", summary: "Cross to C5 and return to Bb4 in music that turns around before the top of the scale.", hands: "R",
    abc: grand("A turn near the harbor", ["F G A B", "c2 B2", "A B c B", "A G F2"], rest(4)),
    fingering: "Use the octave-scale fingers here: F4(1) G4(2) A4(3) Bb4(4) C5(1), then Bb4(4) A4(3). In bar 3, A–Bb–C–Bb uses 3-4-1-4. This deliberately differs from the stationary five-finger drill.",
    steps: ["Read the whole phrase and mark each Bb–C or C–Bb crossing. The melody does not need to reach F5 to use the scale turn.", "Practice bar 3 as a slow four-note loop with fingers 3-4-1-4. Stop if the motion becomes a wrist twist and reset the hand position.", "Join the four bars with the reference off, then listen to compare the rhythm. Keep both half notes in bar 2 for their full two counts."],
    listenFor: ["The thumb C5 has the same tone as the surrounding Bb4s.", "The phrase's long notes allow time without turning into a hesitation."],
    checks: ["I used the intended thumb crossing rather than reaching C5 with 5.", "I can return to Bb4 with finger 4 while keeping the beat."], skillIds: ["f-major-scale", "thumb-crossing", "phrase-shape"],
  }),

  ex({
    id: "f3-chord-f", section: "chords", title: "Build the home chord: F major", summary: "Find F–A–C, hear the root under the chord, and release all three RH notes together.",
    abc: grand("F is home", ["\"F\"[FAc]4", "[FAc]2 z2", "[FAc]2 [FAc]2", "[FAc]4"], ["F,4", "F,2 z2", "F,4", "F,4"]),
    fingering: "RH F4 A4 C5 = 1 3 5. LH F3, one octave below the RH's F, with a comfortable finger such as 5. These are different keys; the hands never compete for the same F.",
    steps: ["Find RH F4, skip to A4, then C5. Play them separately to check the notes before sounding the triad together.", "Add the low F3 only on the written bass attacks. Keep the full-bar bass held while the RH repeats twice in bar 3.", "Count and play the four bars. In bar 2 both hands release for beats 3–4; make the silent ending of that bar as deliberate as the chord."],
    listenFor: ["All three RH pitches arrive as one gentle chord.", "The bass supports rather than overwhelms the upper chord."],
    checks: ["I can name F, A and C without rebuilding from the demo.", "I can repeat the RH while the LH stays down, and release both for the written rest."], skillIds: ["triad-building", "f-major-harmony", "held-bass"],
  }),
  ex({
    id: "f3-chord-b-flat-c7", section: "chords", title: "The neighbors: Bb and C7", summary: "Keep nearby RH shapes while the bass supplies each chord's root.", minutes: 5,
    abc: grand("Two neighbors of F", ["\"Bb\"[FBd]4", "\"C7\"[EGB]4", "\"Bb\"[FBd]2 [FBd]2", "\"C7\"[EGB]4"], ["B,,4", "C,4", "B,,4", "C,4"]),
    fingering: "Bb: RH F4 Bb4 D5 with 1 3 5, LH Bb2. C7: RH E4 G4 Bb4 with 1 3 5, LH C3. The RH C7 is its third, fifth and seventh; the LH provides C, so all four chord tones are present across the hands.",
    steps: ["Build Bb from Bb–D–F, then notice that the written RH puts F at the bottom. Find the low Bb2 before adding both hands.", "Build C7 as C–E–G–Bb. Hear the LH root with the RH's E–G–Bb rather than searching for another C in the upper shape.", "Change one whole bar at a time. When Bb repeats in bar 3, keep the bass held through both RH attacks; do not add speed until every chord tone is comfortable."],
    listenFor: ["The Bb chord contains the black Bb, while C7 contains E natural.", "C7 sounds as though it could lead home to F; the ending intentionally leaves that question open."],
    checks: ["I can name all three Bb tones and all four C7 tones.", "I understand why the upper C7 shape has no C while the full two-hand chord does."], skillIds: ["b-flat-triad", "dominant-seventh", "f-major-harmony"],
  }),
  ex({
    id: "f3-chord-d-minor", section: "chords", title: "D minor shares F's notes", summary: "Change one RH note to move between a nearby F voicing and D minor.",
    abc: grand("A minor-color neighbor", ["\"F\"[CFA]4", "\"Dm\"[DFA]4", "\"F\"[CFA]2 \"Dm\"[DFA]2", "\"Dm\"[DFA]4"], ["F,,4", "D,4", "F,,2 D,2", "D,4"]),
    fingering: "RH F voicing C4 F4 A4 = 1 3 5; D minor D4 F4 A4 also uses 1 3 5. Move the thumb from C4 to D4 while F4 and A4 stay nearby. LH roots F2 and D3 can use 5 with a whole-hand move.",
    steps: ["Play D4–F4–A4 separately, then together. These are the D-minor triad; there is no black key in this chord despite the F-major key signature.", "Compare the two RH shapes. Keep F4 and A4 in view and move only the lower note; prepare the different LH root as a separate task.", "Play the written changes slowly. In bar 3 each harmony lasts two counts, so the bass changes on 1 and 3 instead of every beat."],
    listenFor: ["D minor sounds different from F even though two upper notes remain the same.", "The half-bar changes do not compress the bass notes."],
    checks: ["I can build D minor from D, F and A.", "I can make the two-count F-to-Dm change without stopping the pulse."], skillIds: ["minor-triad", "common-tones", "f-major-harmony"],
  }),
  ex({
    id: "f3-chord-close-voicings", section: "chords", title: "Keep the chords close", summary: "Use inversions in the RH so F, Bb and C7 can change with small movements.",
    abc: grand("Nearby chord shapes", ["\"F\"[CFA]4", "\"Bb\"[DFB]4", "\"C7\"[EGB]4", "\"F\"[CFA]4"], ["F,,4", "B,,4", "C,4", "F,,4"]),
    fingering: "RH F: C4 F4 A4 (1 3 5); Bb: D4 F4 Bb4 (1 3 5); C7 upper tones: E4 G4 Bb4 (1 3 5). LH plays roots F2, Bb2, C3, F2. The RH uses F's second inversion and Bb's first inversion; the LH still supplies the roots.",
    steps: ["Read the lowest RH line C4–D4–E4–C4 before playing all three notes of each shape. An inversion changes order, not the chord's note names.", "Try RH alone at one chord per bar, noticing common F between the first two shapes and common Bb between the next two.", "Add the bass roots. Release and move each chord as one comfortable shape; let the last F settle for four counts rather than rushing back to the start."],
    listenFor: ["The upper chords stay in a compact region instead of jumping to every new root.", "The highest note moves Bb4–A4 as the last C7 resolves to F."],
    checks: ["I can identify the RH F and Bb shapes even when their roots are not the lowest upper note.", "I can name a common tone that helps one change."], skillIds: ["chord-inversions", "voice-leading", "f-major-harmony"],
  }),
  ex({
    id: "f3-chord-cadence", section: "chords", title: "Say a complete sentence: F–Bb–C7–F", summary: "Give the home–away–question–home progression a steady count and a clear ending.",
    abc: grand("A cadence in F", ["\"F\"[FAc]4", "\"Bb\"[FBd]4", "\"C7\"[EGB]2 [EGB]2", "\"F\"[FAc]4"], ["F,4", "B,,4", "C,4", "F,4"]),
    fingering: "RH F4 A4 C5, then F4 Bb4 D5, then E4 G4 Bb4: use 1 3 5 for each shape. LH roots F3, Bb2, C3, F3. The C7 root is in the bass; the RH plays E, G and Bb.",
    steps: ["Say the chord names over four slow bars: F, Bb, C7, F. Listen to the final return as the end of one musical sentence.", "Practice just C7 to F. Compare C7's E4 with the home chord's F4, then its Bb4 with the home chord's A4; hear how the nearby tones change the sense of tension.", "Play all four bars. The repeated C7 in bar 3 attacks on beats 1 and 3 above one held bass; the final chord lasts all four beats."],
    listenFor: ["The final F feels settled after C7's tension.", "The last chord receives its full written length and a together release."],
    checks: ["I can keep four bars while naming the harmonies.", "I can hear and describe the difference between ending on C7 and ending on F."], skillIds: ["cadence", "dominant-seventh", "phrase-shape"],
  }),
  ex({
    id: "f3-chord-pop-loop", section: "chords", title: "A four-chord loop in F", summary: "Put F–C–Dm–Bb under a steady two-attacks-per-bar RH pattern.",
    abc: grand("Four chords by the water", ["\"F\"[CFA]2 [CFA]2", "\"C\"[EGc]2 [EGc]2", "\"Dm\"[DFA]2 [DFA]2", "\"Bb\"[DFB]2 [DFB]2"], ["F,,4", "C,4", "D,4", "B,,4"]),
    fingering: "RH F = C4 F4 A4 (1 3 5); C = E4 G4 C5 (1 2 5); Dm = D4 F4 A4 (1 3 5); Bb = D4 F4 Bb4 (1 2 5). LH roots F2 C3 D3 Bb2. Reposition comfortably rather than holding fingers down through every change.",
    steps: ["Play just the bass roots in order, one full bar each. Name the Roman-numeral pattern I–V–vi–IV if useful; the sound is the main goal.", "Play the RH chords on beats 1 and 3 while counting 1 2 3 4. Learn one change at a time before asking for a continuous loop.", "Combine the hands, keeping the bass held through each RH repeat. Repeat the four bars if comfortable; Bb at the end leads back to F at the next start."],
    listenFor: ["The RH repeats do not trigger unintended extra bass notes.", "A smooth Bb-to-F return keeps the loop moving without a fifth beat."],
    checks: ["I can name F, C, Dm and Bb in order.", "I can repeat the loop while maintaining the same four-count bar length."], skillIds: ["pop-accompaniment", "minor-triad", "coordination"],
  }),
  ex({
    id: "f3-chord-ballad", section: "chords", title: "Let the left hand roll", summary: "Turn the loop into root–fifth–octave–fifth quarter notes while the RH keeps one long chord.",
    abc: grand("A rolling F-major backdrop", ["\"F\"[FAc]4", "\"C\"[EGc]4", "\"Dm\"[FA]4", "\"Bb\"[FBd]4"], ["F,, C, F, C,", "C, G, C G,", "D, A, D A,", "B,, F, B, F,"]),
    fingering: "LH F2 C3 F3 C3; C3 G3 C4 G3; D3 A3 D4 A3; Bb2 F3 Bb3 F3. Use 5–2–1–2 if the octave span is comfortable, allowing a small forearm travel. RH F4 A4 C5 = 1 3 5; E4 G4 C5 = 1 2 5; F4 A4 = 1 3; F4 Bb4 D5 = 1 3 5. The bass D supplies Dm's root.",
    steps: ["Play one LH pattern alone, counting four quarter notes. Move toward each key rather than fixing the hand in a stretched octave; shorten the allocation if it becomes tense.", "Practice each chord span separately, then connect two bars. The octave note is the third attack in each bar, not an extra fifth note.", "Add one held RH shape per bar. The RH remains down while the LH travels; keep it softer than a future melody and finish after all four counts of bar 4."],
    listenFor: ["The four LH attacks have equal spacing and an even sound.", "The upper sound stays held instead of bouncing with the moving bass."],
    checks: ["I can make one relaxed four-note bass pattern without locking an octave stretch.", "I can hold the RH while the LH changes register."], skillIds: ["broken-chords", "pop-accompaniment", "coordination"],
  }),

  ex({
    id: "f3-music-harbor-light", section: "guided", title: "Harbor light", summary: "A complete original four-bar lyrical goal: half-note melody over patient bass, with one Bb to read.", minutes: 8,
    abc: grand("Harbor light", ["A2 c2", "B2 A2", "G2 E2", "F4"], ["F,4", "B,,4", "C,4", "F,4"]),
    fingering: "RH A4(3) C5(5), Bb4(4) A4(3); shift gently down for G4(3) E4(1), then F4(2). LH F3, Bb2, C3, F3 may use 5 with whole-hand moves. This melody's C5 uses 5; it is not the octave-scale exercise.",
    steps: ["Listen to the complete four-bar sentence. Count four beats in each bar, hearing the last F as a full-bar arrival.", "Learn the RH in two-bar phrases. Before bar 3, move the hand so G4 and E4 fit under 3 and 1; practice that join slowly rather than stretching the thumb.", "Add one bass note per bar. Shape the melody gently toward bar 2 and let bars 3–4 settle, without making the final beat disappear.", "Make one uninterrupted four-bar performance at your own comfortable tempo. This short piece is a complete goal; return another day for a fresh check."],
    listenFor: ["Bb4–A4 has a small leaning quality, not a wrong-note surprise.", "The bass stays quiet and held beneath the melody's half notes."],
    checks: ["I can play four counted bars without a restart.", "I can keep the melody above the bass and give the ending its full length."], skillIds: ["held-bass", "half-note-melody", "f-major-phrasing"],
  }),
  ex({
    id: "f3-music-field-lanterns", section: "guided", title: "Field lanterns", summary: "A different original melody with Harbor light's same four-bar, half-note and held-bass goal.", minutes: 8,
    abc: grand("Field lanterns", ["F2 c2", "B2 A2", "E2 G2", "F4"], ["F,4", "B,,4", "C,4", "F,4"]),
    fingering: "RH F4(1) C5(5), Bb4(4) A4(3); shift down for E4(1) G4(3), then F4(2). LH F3, Bb2, C3, F3 uses comfortable whole-hand moves. The melody covers the same E4–C5 region as Harbor light.",
    steps: ["Listen, then count through the whole four-bar phrase. Identify the two-count melody notes and final four-count F.", "Play the RH in two-bar groups, including the repositioning before E4. Play the bass separately with full-bar holds.", "Combine and let the broad opening fifth contrast with the stepwise Bb–A. Finish with one uninterrupted counted phrase; choose this study instead of Harbor light when you want another musical scene."],
    listenFor: ["The opening F4–C5 moves upward without changing the tempo.", "The final F rests above a quiet sustained bass."],
    checks: ["I can play four counted bars without a restart.", "I can keep the melody above the bass and give the ending its full length."], skillIds: ["held-bass", "half-note-melody", "f-major-phrasing"],
  }),
  ex({
    id: "f3-music-courtyard", section: "guided", title: "Courtyard conversation", summary: "An original classical-style eight-bar conversation, with a complete first four-bar milestone.", minutes: 8,
    abc: grand("Courtyard conversation", ["F G A2", "c2 B2", "A G F G", "A4", "B A G F", "E2 G2", "A G E G", "F4"], ["F,4", "B,,4", "F,4", "F,4", "B,,4", "C,4", "C,4", "F,4"]),
    fingering: "RH notes F4 G4 A4 Bb4 C5 begin under fingers 1 2 3 4 5. At bar 6 shift down: E4(1) G4(3); bar 7 A4(4) G4(3) E4(1) G4(3), then F4(2). LH roots F3, Bb2 and C3 use quiet whole-hand changes.",
    steps: ["Hear two four-bar phrases. The first pauses on A4; the second finds the settled F4 ending. Either phrase can be a named milestone.", "Learn bars 1–4 with even quarter notes and full half-note holds. Keep the LH simple: one bass note per bar.", "Learn bars 5–8 separately, preparing the E4 hand shift before bar 6. Practice bar 5 into 6 as a two-bar join.", "Play one phrase without restarting, then join both if comfortable. Give each phrase a gentle shape while keeping the same count underneath."],
    listenFor: ["The melody alternates small moving gestures and unhurried held answers.", "The second phrase's E4 leads back to F rather than ending as a new low register."],
    checks: ["I can finish a four-bar phrase as a complete musical milestone.", "I can read the Bb and prepare the lower E4 without losing the pulse."], skillIds: ["f-major-phrasing", "b-flat-reading", "register"],
  }),
  ex({
    id: "f3-music-shore-waltz", section: "guided", title: "Shore waltz", summary: "An original six-bar waltz. Only the three-beat meter is new; the LH holds one note per bar.", minutes: 8, bpm: 48, targetBpm: 66,
    abc: grand("Shore waltz", ["A2 G", "G2 c", "B A G", "F2 A", "G2 E", "F3"], ["F,3", "C,3", "B,,3", "F,3", "C,3", "F,3"], "1/4", "3/4"),
    fingering: "RH F4–C5 uses 1–5 through bar 4. For bar 5 shift to G4(3) E4(1), then F4(2). LH roots F3, C3, Bb2, F3, C3, F3; hold each for three counts. The hand does not add an oom-pah pattern yet.",
    steps: ["Listen and count 1 2 3, not four. The count-in has three quarter-note clicks, and the first note of each bass bar lasts until the next 1.", "Tap the RH rhythm: bars 1 and 2 have a two-count note followed by a one-count note; bar 3 has three quarters.", "Practice each hand, then combine two bars at a time. Keep the LH held through beats 2 and 3 instead of reattacking a familiar four-beat pattern.", "Play all six bars with a light first beat and a gentle final three-count F. Aim for a calm dance pulse rather than a faster tempo."],
    listenFor: ["Each bass change arrives after exactly three beats.", "The melody's longer notes stay buoyant instead of stopping the dance."],
    checks: ["I can keep counting 1 2 3 through the final held note.", "I can distinguish the waltz meter from the four-beat studies without changing note-reading difficulty."], skillIds: ["triple-meter", "held-bass", "f-major-phrasing"],
  }),
  ex({
    id: "f3-music-paper-boats", section: "guided", title: "Paper boats", summary: "An original pop-style eight-bar goal: a small melody over a rolling bass. Four bars make a useful first milestone.", minutes: 8, bpm: 44, targetBpm: 64,
    abc: grand("Paper boats", ["A2 c2", "G2 c2", "A2 F2", "B2 F2", "A G F2", "G2 c2", "B A G2", "F4"], ["F,, C, F, C,", "C, G, C G,", "D, A, D A,", "B,, F, B, F,", "F,, C, F, C,", "C, G, C G,", "B,, F, B, F,", "F,4"]),
    fingering: "RH F4 G4 A4 Bb4 C5 = 1 2 3 4 5 throughout; no scale crossing is needed in this melody. LH root–fifth–octave–fifth patterns use 5–2–1–2 with a relaxed traveling hand: F2/C3/F3, C3/G3/C4, D3/A3/D4, Bb2/F3/Bb3. Final LH F3 is held.",
    steps: ["Hear the first four bars as one pop-shaped idea. Learn the RH alone, then identify the LH's four-note pattern under each harmony.", "Practice one bar of LH alone before adding its long RH notes. If the hand stretches or the pulse wobbles, choose a slower tempo or work only that bar.", "Learn bars 1–4, then bars 5–8: the melody adds quarter notes and the final bass holds instead of rolling. Count every held note over the moving part.", "Make a complete four-bar milestone or an eight-bar performance. Let the melody sing more clearly than the bass, and save one specific next step for the next session."],
    listenFor: ["The LH keeps four equal notes under a two-note or moving melody.", "The final held F3 changes texture while the same pulse continues."],
    checks: ["I can keep one rolling bass bar steady under the RH.", "I can choose a four- or eight-bar musical goal and keep the melody audible."], skillIds: ["broken-chords", "pop-accompaniment", "coordination", "f-major-phrasing"],
  }),
  ex({
    id: "f3-create-answer", section: "guided", title: "Answer a small question in F", summary: "Use the five-note F-major shape to invent a two-bar answer after a written two-bar question.", minutes: 5, hands: "R",
    abc: grand("A question in F", ["F G A2", "c2 A2", "z4", "z4"], rest(4)),
    fingering: "RH F4 G4 A4 Bb4 C5 = 1 2 3 4 5. Use only these five keys for your answer; C5 is finger 5 here, not a scale crossing. The last two bars are deliberately silent for your response.",
    steps: ["Listen to the two-bar question and keep counting through the silent answer bars. Each bar still has four beats.", "Stop the reference and play the question yourself. Invent a two-bar reply using quarters and half notes; try finishing on F4.", "Make a second reply with a Bb and a different amount of silence. Keep its length at two bars, then repeat the answer you liked most."],
    listenFor: ["An answer ending on F feels different from one left on C.", "A counted rest is a musical choice rather than a gap to find another note."],
    checks: ["My answer occupies exactly two four-beat bars.", "I can repeat or describe one answer I chose."], skillIds: ["creative-application", "f-major-shape", "phrase-shape"],
  }),
  ex({
    id: "f3-create-ending", section: "guided", title: "Choose your own way home", summary: "Keep a four-bar harmonic sentence and change only its last two melody bars.",
    abc: grand("An ending in F", ["A2 B2", "c2 A2", "G2 E2", "F4"], ["F,4", "B,,4", "C,4", "F,4"]),
    fingering: "RH begins A4(3) Bb4(4) C5(5) A4(3); shift for G4(3) E4(1), then F4(2). LH roots F3 Bb2 C3 F3. For your new ending choose only E4 F4 G4 A4 under 1 2 3 4 after the shift.",
    steps: ["Play the written seed and hear C bass in bar 3 followed by F bass in bar 4. Keep those two bass bars unchanged.", "Change only the last two RH bars using E4, F4, G4 and A4. Begin with half notes and end on F4 so the idea remains easy to count.", "Try a second version with one counted rest. Choose the ending you prefer, play the full four-bar sentence and write its note names or rhythm so you can return to it."],
    listenFor: ["E4 can lean up toward F4 as the harmony returns home.", "The phrase remains four bars even when the melody has more space."],
    checks: ["I can keep the unchanged bass under my new ending.", "I can name an expressive choice in the version I preferred."], skillIds: ["creative-application", "cadence", "f-major-phrasing"],
  }),
];

export const SESSIONS = [
  { id: "f3-d1-a", unitId: UNIT.id, day: 1, slot: "A", title: "Read the flat before the turn", focus: "Locate Bb, keep four counted beats, and explore the F five-note shape over a patient bass.", blocks: [{ exerciseId: "f3-read-signature", minutes: 3 }, { exerciseId: "f3-rhythm-pulse", minutes: 3 }, { exerciseId: "f3-coord-held-bass", minutes: 8 }, { exerciseId: "f3-scale-five-r", minutes: 6 }] },
  { id: "f3-d1-b", unitId: UNIT.id, day: 1, slot: "B", title: "A harbor-light sentence", focus: "Build F major, complete a four-bar lyrical goal, and invent a small answer.", blocks: [{ exerciseId: "f3-chord-f", minutes: 4 }, { exerciseId: "f3-music-harbor-light", minutes: 8 }, { exerciseId: "f3-create-answer", minutes: 5 }, { exerciseId: "f3-read-b-flat", minutes: 3 }] },
  { id: "f3-d2-a", unitId: UNIT.id, day: 2, slot: "A", title: "A black key inside a steady beat", focus: "Review eighths on Bb, keep the RH melody independent of its bass, and read the LH five-note shape.", blocks: [{ exerciseId: "f3-rhythm-eighths", minutes: 4 }, { exerciseId: "f3-read-b-flat", minutes: 4 }, { exerciseId: "f3-coord-held-bass", minutes: 7 }, { exerciseId: "f3-scale-five-l", minutes: 5 }] },
  { id: "f3-d2-b", unitId: UNIT.id, day: 2, slot: "B", title: "A classical conversation", focus: "Meet Bb and C7, shape an original two-phrase study, and answer it in your own notes.", blocks: [{ exerciseId: "f3-chord-b-flat-c7", minutes: 5 }, { exerciseId: "f3-music-courtyard", minutes: 8 }, { exerciseId: "f3-create-answer", minutes: 4 }, { exerciseId: "f3-rhythm-pulse", minutes: 3 }] },
  { id: "f3-d3-a", unitId: UNIT.id, day: 3, slot: "A", title: "F's different right-hand crossing", focus: "Review tied counts, read around middle C, and let the melody wait while learning the RH's 4-to-1 turn.", blocks: [{ exerciseId: "f3-rhythm-held-joins", minutes: 4 }, { exerciseId: "f3-read-register", minutes: 4 }, { exerciseId: "f3-coord-bass-first", minutes: 7 }, { exerciseId: "f3-scale-octave-r", minutes: 5 }] },
  { id: "f3-d3-b", unitId: UNIT.id, day: 3, slot: "B", title: "Minor color and a three-beat dance", focus: "Compare F with D minor, use nearby chord voicings, and count a gentle waltz without adding a busy bass.", blocks: [{ exerciseId: "f3-chord-d-minor", minutes: 4 }, { exerciseId: "f3-chord-close-voicings", minutes: 4 }, { exerciseId: "f3-music-shore-waltz", minutes: 8 }, { exerciseId: "f3-read-b-flat", minutes: 4 }] },
  { id: "f3-d4-a", unitId: UNIT.id, day: 4, slot: "A", title: "Let each hand learn its own turn", focus: "Keep the familiar rhythms calm while the LH learns F2 to F3 and its own crossing.", blocks: [{ exerciseId: "f3-rhythm-held-joins", minutes: 4 }, { exerciseId: "f3-read-register", minutes: 4 }, { exerciseId: "f3-coord-bass-first", minutes: 7 }, { exerciseId: "f3-scale-octave-l", minutes: 5 }] },
  { id: "f3-d4-b", unitId: UNIT.id, day: 4, slot: "B", title: "Four chords become a pop story", focus: "Close a cadence, keep a four-chord loop steady, and begin a melody over rolling bass.", blocks: [{ exerciseId: "f3-chord-cadence", minutes: 4 }, { exerciseId: "f3-chord-pop-loop", minutes: 4 }, { exerciseId: "f3-music-paper-boats", minutes: 8 }, { exerciseId: "f3-create-ending", minutes: 4 }] },
  { id: "f3-d5-a", unitId: UNIT.id, day: 5, slot: "A", title: "Two turns, one shared pulse", focus: "Try an unfamiliar reading, apply the RH turn in a phrase, and join only a comfortable hands-together scale chunk.", blocks: [{ exerciseId: "f3-read-fresh", minutes: 3 }, { exerciseId: "f3-rhythm-pulse", minutes: 3 }, { exerciseId: "f3-scale-turn-application", minutes: 4 }, { exerciseId: "f3-scale-octave-both", minutes: 6 }, { exerciseId: "f3-coord-held-bass", minutes: 4 }] },
  { id: "f3-d5-b", unitId: UNIT.id, day: 5, slot: "B", title: "A musical goal to keep", focus: "Refine the rolling accompaniment, choose a four- or eight-bar performance, and finish with your own ending and a return to this morning's reading.", blocks: [{ exerciseId: "f3-chord-ballad", minutes: 4 }, { exerciseId: "f3-music-paper-boats", minutes: 8 }, { exerciseId: "f3-create-ending", minutes: 4 }, { exerciseId: "f3-read-fresh", minutes: 4, goal: "Recall and read this morning's example before the model. Listen afterward for the one repair you chose; the example is now familiar." }] },
];

export const CATALOGUE = [
  ...EXERCISES.filter((e) => e.section === "chords" || e.section === "scales").map((e) => ({ id: `catalogue-${e.id}`, unitId: UNIT.id, title: e.title, description: e.summary, exerciseId: e.id, kind: "built-in", skills: [...e.skillIds] })),
  ...EXERCISES.filter((e) => e.id.startsWith("f3-music-")).map((e) => ({ id: `catalogue-${e.id}`, unitId: UNIT.id, title: e.title, description: e.summary, exerciseId: e.id, kind: "built-in", skills: [...e.skillIds], ...(e.id === "f3-music-field-lanterns" ? { substitutesFor: ["f3-music-harbor-light"] } : {}) })),
];
