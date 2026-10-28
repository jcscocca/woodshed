// Original G-major material. Repeat any session before moving on; a new key is
// an opportunity to apply familiar skills, not a deadline to increase tempo.
export const UNIT = {
  id: "g-major-foundations-2", number: 2, key: "G major",
  title: "G major: a brighter landscape",
  description: "Five repeatable days of 20-minute Foundations and Music sessions. Hear what F sharp does, find G/C/D7/Em, read the registers you actually play, and carry a steady beat through original musical studies. Start after the C unit feels usable; repeat individual lessons as needed. Every lesson works without MIDI.",
  daysPerWeek: 5, sessionsPerDay: 2, sessionMinutes: 20,
};

const original = { label: "Original Woodshed G-major teaching material" };
const grand = (title, right, left, unit = "1/4") => {
  if (right.length !== left.length) throw new Error(`Unmatched hands: ${title}`);
  const lines = [];
  for (let i = 0; i < right.length; i += 4) {
    const end = i + 4 >= right.length ? " |]" : " |";
    lines.push(`[V:1] ${right.slice(i, i + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${left.slice(i, i + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:4/4\nL:${unit}\nK:G\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
};
const rest = (n, unit = "1/4") => Array(n).fill(unit === "1/8" ? "z8" : "z4");
const ex = (x) => ({ unitId: UNIT.id, key: UNIT.key, source: original, ...x });

export const EXERCISES = [
  ex({
    id: "g-key-f-sharp", section: "scales", title: "What the sharp changes", summary: "G major has F sharp. Compare F natural with F sharp, then hear F sharp lean toward G.", minutes: 4, bpm: 48, targetBpm: 64, hands: "R",
    abc: grand("The brighter step", ["E =F G2", "E ^F G2", "F G A F", "G4"], rest(4)),
    fingering: "RH E4–F natural4–G4 = 1–2–3 in bar 1. Use the same fingers with F sharp4 in bar 2; move the hand slightly into the keys to reach the black key comfortably. Bar 3 F sharp4–G4–A4–F sharp4 = 2–3–4–2.",
    steps: ["Find F4, then the black key immediately to its right: F sharp4. G major's signature changes every written F, in every octave, unless an accidental says otherwise.", "Listen to bars 1 and 2. The natural sign in bar 1 cancels F sharp only for that bar. The signature applies again after the barline; bar 2's explicit sharp is a reminder.", "Play and name the notes. In bar 3 the signature alone supplies F sharp again; no new sharp needs to be written beside it."],
    listenFor: ["F sharp sits a half step below G; F natural is a whole step below it.", "The final G sounds settled after F sharp."],
    checks: ["I can find F sharp without counting from C.", "I can explain that the signature applies to Fs in both clefs and all octaves."], skillIds: ["key-signature", "f-sharp", "aural-tonic"],
  }),
  ex({
    id: "g-scale-r", section: "scales", title: "G major: right hand, one octave", summary: "Use the familiar major-scale fingering with one black key near the top.", minutes: 5, bpm: 48, targetBpm: 76, hands: "R",
    abc: grand("G major scale - RH", ["G A B c", "d e f g", "f e d c", "B A G2"], rest(4)),
    fingering: "RH G4→G5: 1–2–3–1–2–3–4–5. Descending from F sharp5 to G4: 4–3–2–1–3–2–1. Thumb passes B4→C5 on ascent; finger 3 crosses C5→B4 on descent.",
    steps: ["Locate G4, then F sharp5 near the top of the octave. All written Fs are sharp here.", "Isolate B4–C5–D5 with 3–1–2, then E5–F sharp5–G5 with 3–4–5. Avoid lifting the whole hand to find the black key.", "Play the written ascent and descent, one note per beat. Keep the direction change at G5 in time rather than adding a pause."],
    listenFor: ["F sharp leads smoothly to the top G.", "The thumb crossing does not create a louder or later C5."],
    checks: ["I can use 1–2–3–1–2–3–4–5 without guessing at the crossing.", "I can keep a comfortable pulse up and back, including F sharp."], skillIds: ["major-scale", "thumb-crossing", "f-sharp"],
  }),
  ex({
    id: "g-scale-l", section: "scales", title: "G major: left hand, one octave", summary: "Give the LH its own crossing and learn the bass-register F sharp.", minutes: 5, bpm: 48, targetBpm: 76, hands: "L",
    abc: grand("G major scale - LH", rest(4), ["G,, A,, B,, C,", "D, E, F, G,", "F, E, D, C,", "B,, A,, G,,2"]),
    fingering: "LH G2→G3: 5–4–3–2–1–3–2–1. Descending F sharp3→G2: 2–3–1–2–3–4–5. Finger 3 crosses onto E3 after thumb D3 on ascent.",
    steps: ["Find G2, the G below bass C3. Find F sharp3, the black key immediately below the top G3.", "Play D3–E3–F sharp3–G3 with 1–3–2–1, then reverse. Keep the hand moving comfortably instead of fixing the wrist in place.", "Play all four bars at an even pulse. The first G is low; do not move the phrase an octave up just because G is familiar there."],
    listenFor: ["The crossing after D3 stays connected.", "The LH gives F sharp the same clear tone as the white keys."],
    checks: ["I can start on the correct bass G2.", "I can recall the LH fingering independently of the RH pattern."], skillIds: ["major-scale", "thumb-crossing", "bass-reading", "f-sharp"],
  }),
  ex({
    id: "g-scale-both", section: "scales", title: "G major together: crossing at different moments", summary: "Join four-note chunks before attempting a complete hands-together octave.", minutes: 5, bpm: 44, targetBpm: 68, hands: "both",
    abc: grand("G major scale - together", ["G A B c", "d e f g", "f e d c", "B A G2"], ["G,, A,, B,, C,", "D, E, F, G,", "F, E, D, C,", "B,, A,, G,,2"]),
    fingering: "RH starts G4 with 1 and ascends 1–2–3–1–2–3–4–5. LH starts G2 with 5 and ascends 5–4–3–2–1–3–2–1. Reverse those sequences coming down. The written hands are two octaves apart, which keeps both clefs readable.",
    steps: ["Recall each hand's crossing separately. Then tap paired attacks: one RH note and one LH note on every beat.", "Join only G–A–B–C first. The RH crosses B→C while the LH continues 5–4–3–2. Next join D–E–F sharp–G, where the LH crosses.", "Connect the chunks slowly, then work downward. If joining breaks the pulse, return to the small chunk rather than trying to run faster."],
    listenFor: ["Both notes of each pair start together.", "Neither hand waits for the other hand's crossing."],
    checks: ["I can coordinate one four-note chunk with no extra pause.", "I can identify the chunk to repeat next time, even if the whole scale is not ready."], skillIds: ["major-scale", "thumb-crossing", "coordination", "f-sharp"],
  }),
  ex({
    id: "g-read-f-sharp", section: "guided", title: "One signature, both clefs", summary: "Read short turns in each hand and remember that F stays sharp after a barline.", minutes: 4, bpm: 48, targetBpm: 64, hands: "both",
    abc: grand("Read the signature", ["E F G2", "A F G2", "z4", "z4"], ["z4", "z4", "D, E, F,2", "F, E, G,2"]),
    fingering: "RH E4–F sharp4–G4–A4 uses 1–2–3–4. LH D3–E3–F sharp3–G3 uses 4–3–2–1. The hands take separate two-bar turns.",
    steps: ["Before listening, find each F in the score and say F sharp with its octave. The signature does the work; no accidental beside the note is necessary.", "Read the RH two bars, then the LH answer. Name the first D3 in bass rather than borrowing the RH position.", "Listen afterward to check the sound. Try another ordering of E–F sharp–G to test whether you are reading the signature or memorizing this tune."],
    listenFor: ["F sharp has the same pitch-class color in high and low registers.", "A barline does not cancel the key signature."],
    checks: ["I can name and find the Fs in both clefs before playback.", "I can keep F sharp in a new ordering of the notes."], skillIds: ["key-signature", "f-sharp", "staff-reading"],
  }),
  ex({
    id: "g-read-ledgers", section: "guided", title: "Read the low notes inside close chords", summary: "B3 and A3 sit below treble; find them from middle C rather than shifting every note an octave.", minutes: 4, bpm: 48, targetBpm: 64, hands: "R",
    abc: grand("Low treble landmarks in G", ["B, D G2", "A, D F2", "B, E G2", "C E G2"], rest(4)),
    fingering: "Bar 1 B3–D4–G4: 1–2–5. Bar 2 A3–D4–F sharp4: 1–3–5. Bar 3 B3–E4–G4: 1–3–5. Bar 4 C4–E4–G4: 1–3–5. Move the hand for each shape.",
    steps: ["Locate C4 on the ledger line below treble. B3 is the space immediately below it; A3 is the next ledger line down.", "Read each broken shape, then name its chord: G, D, Em, C. The F in the D shape is F sharp from the signature.", "Play the broken shapes slowly, then press each shape as a chord with playback stopped. Use the staff as your map, not a fixed C-position finger rule."],
    listenFor: ["The low A and B remain close to middle C.", "The D chord contains F sharp, while Em contains E–G–B."],
    checks: ["I can locate A3/B3 from the staff without counting every line.", "I can read the same tones either broken or blocked."], skillIds: ["ledger-landmarks", "chord-reading", "f-sharp"],
  }),
  ex({
    id: "g-read-registers", section: "guided", title: "Answer in a different register", summary: "The LH answers the RH an octave lower; preview the clef and starting pitch first.", minutes: 4, bpm: 48, targetBpm: 64, hands: "both",
    abc: grand("Two registers", ["G F E D", "B,2 D2", "z4", "z4"], ["z4", "z4", "G, F, E, D,", "B,,2 D,2"]),
    fingering: "RH first phrase G4–F sharp4–E4–D4: 5–4–3–2; move for B3–D4: 1–2. LH answer G3–F sharp3–E3–D3: 1–2–3–4; B2–D3: 5–3 after shifting down.",
    steps: ["Find G4 in treble and G3 in bass. Both phrases descend, but they do not use the same physical keys.", "Read the complete four-bar handover once without a model, keeping the count through the rests in the other staff.", "Then listen, check the registers, and repair one uncertain move. In a second attempt, look ahead to the new hand's first note before its turn arrives."],
    listenFor: ["The LH has the same contour lower down.", "The handover does not add a thinking pause."],
    checks: ["I can say the first pitch and octave for each hand.", "I can recognize F sharp in both versions of the descending line."], skillIds: ["register", "interval-reading", "f-sharp"],
  }),
  ex({
    id: "g-read-fresh", section: "guided", title: "Reading and return: a turn toward home", summary: "On the first visit, read before listening. Later, use it as a return check and repair one specific bar.", minutes: 3, bpm: 50, targetBpm: 66, hands: "both",
    abc: grand("A new turn in G", ["B A G F", "E2 G2", "A F D2", "G4"], ["G,,4", "E,4", "D,4", "G,,4"]),
    fingering: "RH E4–B4 position: 1–5, first B4 with 5. In bar 3 shift down so A4–F sharp4–D4 uses 5–3–1; return to G4 with 3. LH roots G2, E3, D3, G2, moving the hand.",
    steps: ["Before playback, preview the signature, both starting notes, the RH position change in bar 3 and the whole-note bass.", "Read through once at a comfortable pulse. Keep going after a slip; this first attempt is a reading check.", "Listen to compare register and timing. Choose one uncertain bar to repair, then join it to the preceding bar."],
    listenFor: ["F sharp points toward G even when the melody first turns downward.", "The final whole note lasts a complete bar."],
    checks: ["I used the signature on the first attempt, not only after hearing the model.", "I can describe one specific repair or say the reading was comfortable."], skillIds: ["staff-reading", "f-sharp", "held-bass"],
  }),
  ex({
    id: "g-rhythm-eighth-walk", section: "guided", title: "Keep a walking pulse in G", summary: "Apply eighth-note subdivision to a small melodic figure instead of one repeated key.", minutes: 4, bpm: 48, targetBpm: 68, hands: "R",
    abc: grand("A walking pulse", ["G2 A2 B A G2", "F G A2 G2 F2", "E2 F G A2 F2", "G2 G2 G4"], rest(4, "1/8"), "1/8"),
    fingering: "RH E4–B4 uses 1–2–3–4–5, with finger 2 on F sharp4. Start G4 with 3.",
    steps: ["Say 1 and 2 and 3 and 4 and while tapping only the numbered beats.", "Tap the RH attacks on your knee. In bar 1, beat 3 divides into B–A; the quarter notes keep the same pulse before and after it.", "Play the melody without letting the black key or eighth pair change the pace. Repeat one bar at a time, then join the phrase."],
    listenFor: ["Two eighth notes fit in the same space as one quarter note.", "F sharp has no extra hesitation before it."],
    checks: ["I can count the subdivisions while playing fewer attacks.", "I can keep the same pulse when the rhythm returns to longer notes."], skillIds: ["pulse", "eighth-subdivision", "f-sharp"],
  }),
  ex({
    id: "g-rhythm-tied-answer", section: "guided", title: "A tie can carry the tune over a beat", summary: "Count the beat inside a held note and hear where the next attack belongs.", minutes: 4, bpm: 48, targetBpm: 66, hands: "R",
    abc: grand("A tied answer", ["G2-G A B2 A2", "F2 G2-G2 A2", "B2 A2-A G F2", "G4 z4"], rest(4, "1/8"), "1/8"),
    fingering: "RH E4–B4 position: 1–5; G4 is 3, A4 is 4, B4 is 5, F sharp4 is 2. Keep the finger down across a tie.",
    steps: ["Listen and speak every subdivision. Bar 1 attacks G on 1, holds through beat 2, then attacks A on the and of 2.", "Clap only new attacks; do not clap the tied-to note. In bar 2, the G starts on beat 2 and continues through beat 3.", "Play the four bars and release for the last two beats of silence. Trace a tie with your free hand if you keep re-striking it."],
    listenFor: ["A tie joins the sound, not two separate attacks.", "The notes after the tie stay on their exact subdivision."],
    checks: ["I can identify every tied-to note that should not be re-struck.", "I can count through a held sound without waiting to restart the pulse."], skillIds: ["ties", "eighth-subdivision", "pulse"],
  }),
  ex({
    id: "g-rhythm-rest-entrance", section: "guided", title: "Let the bass begin before the tune", summary: "Feel a silent melody beat, then enter without borrowing extra time.", minutes: 4, bpm: 48, targetBpm: 66, hands: "R",
    abc: grand("A late arrival", ["z2 G2 B2 A2", "z G A2 B2 G2", "F2 z2 A F D2", "G4 z4"], rest(4, "1/8"), "1/8"),
    fingering: "RH E4–B4 uses 1–5 for bars 1–2. In bar 3 move down for F sharp4–A4–F sharp4–D4: 3–5–3–1. Last G4 can use 3.",
    steps: ["Count the whole first bar before playing: rest on 1, G on 2, B on 3, A on 4.", "Tap bar 2: silence on 1, G on the and of 1, A on 2, B on 3, G on 4. Keep your other hand marking the beat.", "Play slowly. Stop and locate the bar 3 hand position between attempts, then retry the entry with a full count-in."],
    listenFor: ["The silent opening is part of the phrase, not a delay.", "An offbeat start does not shift the later quarter notes."],
    checks: ["I can enter on the and of 1 after a count-in.", "I can keep the pulse through a rest without filling it with sound."], skillIds: ["rests", "eighth-subdivision", "pulse"],
  }),
  ex({
    id: "g-rhythm-mix", section: "guided", title: "Long, short and silent: choose the count first", summary: "Review the unit's subdivisions with a dotted answer; speed is secondary to a clear pulse.", minutes: 4, bpm: 46, targetBpm: 64, hands: "R",
    abc: grand("Choose the count", ["G3 A B2 G2", "F2 z2 A F D2", "G2-G A B2 A2", "G4 z4"], rest(4, "1/8"), "1/8"),
    fingering: "RH starts G4 with 3 in E4–B4 position. Bar 2 shifts to D4–A4: F sharp4 with 3, A4 with 5, D4 with 1. Return to E4–B4 for bar 3.",
    steps: ["Count 1 and 2 and 3 and 4 and. Bar 1 attacks on 1, the and of 2, 3 and 4.", "Compare the dotted G in bar 1 with the tied G in bar 3: both last three eighth-note subdivisions.", "Tap before playing. Then play without a model and use playback afterward to check the long notes, silence and following attacks."],
    listenFor: ["The dotted and tied spellings can produce the same length.", "A hand shift is prepared without stealing time from the rest."],
    checks: ["I can count each bar before I try its notes.", "I can state which event was late or uncertain and retry that small part."], skillIds: ["dotted-rhythm", "ties", "rests", "pulse"],
  }),
  ex({
    id: "g-coord-held-tonic", section: "guided", title: "A new key, a familiar steady floor", summary: "Keep whole-note bass roots beneath a melody that includes F sharp.", minutes: 7, bpm: 46, targetBpm: 66, hands: "both",
    abc: grand("A floor in G", ["G A B A", "G F E2", "F A G F", "G4"], ["G,,4", "E,4", "D,4", "G,,4"]),
    fingering: "RH E4–B4, fingers 1–5, first G4 with 3; F sharp4 is 2. LH roots G2, E3, D3, G2, using a comfortable finger 5 and whole-hand moves.",
    steps: ["Tap the RH rhythm while the LH stays down for a full bar. Locate each bass root before joining the hands.", "Play the first bar together. The LH attacks only on beat 1 while the RH continues through the beat.", "Join two bars, then prepare the D3-to-G2 bass move and finish the phrase. If the key signature distracts you, slow the chunk down."],
    listenFor: ["The bass does not copy the RH quarter notes.", "F sharp stays part of the melodic line rather than becoming a stopping point."],
    checks: ["I can hold the bass and keep the pulse through two joined bars.", "I remember F sharp while also attending to the LH."], skillIds: ["held-bass", "coordination", "f-sharp"],
  }),
  ex({
    id: "g-coord-melody-bass", section: "guided", title: "Two melody notes inside each bass beat", summary: "Quarter-note bass anchors support RH eighth-note pairs in a new position.", minutes: 7, bpm: 44, targetBpm: 64, hands: "both",
    abc: grand("Two voices walking", ["G A B A G F E F", "G2 B2 A G F2", "F G A F E F G A", "B2 A2 G4"], ["G,,2 G,,2 D,2 D,2", "E,2 E,2 B,,2 B,,2", "D,2 D,2 A,,2 A,,2", "D,2 D,2 G,,4"], "1/8"),
    fingering: "RH E4–B4 = 1–5, with F sharp on 2 and G on 3. LH G2/D3 = 5/1; E3/B2 = 1/5; D3/A2 = 1/5 after moving the hand.",
    steps: ["Tap LH on 1 2 3 4 and RH on 1 and 2 and 3 and 4 and. Start with one beat before a full bar.", "Play bar 1 RH alone, then add the bass only on beat 1. Add the other bass beats while keeping their attacks once per click.", "Work through two-bar chunks. The RH longer notes in the last bar must not change the LH pace."],
    listenFor: ["The LH has no extra attacks on the and counts.", "The RH eighths remain even across F sharp."],
    checks: ["I can keep a two-to-one pattern for one complete bar.", "I can continue the LH beat when the RH switches to longer notes."], skillIds: ["two-to-one", "coordination", "eighth-subdivision"],
  }),
  ex({
    id: "g-coord-broken-under", section: "guided", title: "A slow tune above moving harmony", summary: "Give the LH a broken triad while the RH holds a singing line.", minutes: 7, bpm: 46, targetBpm: 66, hands: "both",
    abc: grand("The moving harmony", ["B2 A2", "G2 E2", "G2 E2", "F2 G2"], ["G,, B,, D, B,,", "E, G, B, G,", "C, E, G, E,", "D, F, A, F,"]),
    fingering: "RH E4–B4 uses 1–5; start B4 with 5, F sharp4 with 2. LH root–third–fifth–third uses 5–3–1–3: G2–B2–D3, E3–G3–B3, C3–E3–G3, D3–F sharp3–A3.",
    steps: ["Play the LH shapes alone and name G, Em, C and D. The D-major triad needs F sharp.", "Tap RH only on 1 and 3 while tapping the LH on every numbered beat. Then join only the first bar.", "Link two bars slowly. Keep a half-note RH sound down while the LH makes its four attacks; bring out the melody gently."],
    listenFor: ["The RH holds through the LH movement.", "The bass line is even and quieter than the melody."],
    checks: ["I can hold one RH half note while the LH plays two notes.", "I can change a LH shape without rushing its first note."], skillIds: ["broken-chords", "balance", "coordination"],
  }),
  ex({
    id: "g-coord-offbeats", section: "guided", title: "The bass does not wait for the melody", summary: "Sustain a bass pulse while the RH rests, enters late and holds across beats.", minutes: 7, bpm: 44, targetBpm: 64, hands: "both",
    abc: grand("Independent entrances", ["z2 G2 B2 A2", "G2-G A B2 G2", "F2 z2 A F D2", "G8"], ["G,,2 D,2 G,,2 D,2", "E,2 B,,2 E,2 B,,2", "D,2 A,,2 D,2 A,,2", "G,,8"], "1/8"),
    fingering: "RH E4–B4: 1–5. Bar 3 shifts down for F sharp4–A4–F sharp4–D4 = 3–5–3–1; final G4 with 3. LH fifths G2/D3 = 5/1, B2/E3 = 5/1, A2/D3 = 5/1.",
    steps: ["Tap the bass pulse while speaking the RH attacks. In bar 1 the melody starts on 2; in bar 2 its first G holds across beat 2.", "Join a single bar. Count every subdivision aloud while the LH keeps its regular beat.", "Prepare the bar 3 RH position change between attempts, then reconnect it to bar 2. Repeat the small pair if it still feels uncertain."],
    listenFor: ["The RH silence does not silence the LH.", "The bass beat stays steady when the RH tie delays its next attack."],
    checks: ["I can count the combined rhythm before playing it.", "I can keep the LH from copying the RH rests and ties."], skillIds: ["coordination", "ties", "rests", "pulse"],
  }),
  ex({
    id: "g-coord-final", section: "guided", title: "Choose a small coordination challenge", summary: "Combine a dotted RH answer with a simple bass; two comfortable bars are a useful result.", minutes: 7, bpm: 44, targetBpm: 64, hands: "both",
    abc: grand("A small challenge in G", ["G3 A B2 A2", "G2 E2 F2 G2", "A2 F3 E D2", "G8"], ["G,,2 D,2 G,,2 D,2", "E,2 B,,2 E,2 B,,2", "D,2 A,,2 D,2 A,,2", "G,,8"], "1/8"),
    fingering: "RH first two bars E4–B4 = 1–5, G4 with 3. Bar 3 move to D4–A4: A4 5, F sharp4 3, E4 2, D4 1. LH fifth positions as in Independent entrances.",
    steps: ["Count the RH: bar 1 attacks on 1, the and of 2, 3 and 4. In bar 3, F sharp begins on 2 and lasts until E on the and of 3.", "Tap with the LH beat, then combine only beats 1–2 of bar 1. Expand to two bars at an easy pulse.", "Try the whole phrase only if the small chunk is comfortable. Keep the tempo unchanged while you add a longer section."],
    listenFor: ["The short note after a dot lands on a subdivision, not wherever the fingers happen to arrive.", "Bass rhythm remains independent of the longer RH sounds."],
    checks: ["I can coordinate one short chunk with a continuing count.", "I know whether to repeat, simplify, or extend this exercise next time."], skillIds: ["dotted-rhythm", "coordination", "pulse"],
  }),

  ex({
    id: "g-chords-gcd7", section: "chords", title: "G, C and D7: home, away, return", summary: "Build I, IV and V7 in G major, including the F sharp that makes D7 point toward G.", minutes: 5, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("A G-major cadence", ["\"G\"[GBd]4", "\"C\"[CEG]4", "\"D7\"[FAc]4", "\"G\"[GBd]4"], ["G,,4", "C,4", "D,4", "G,,4"]),
    fingering: "RH G4–B4–D5 = 1–3–5; C4–E4–G4 = 1–3–5; D7 uses F sharp4–A4–C5 = 1–3–5 while LH supplies root D3. LH roots G2, C3, D3, G2, repositioning the hand.",
    steps: ["Find G–B–D and C–E–G. A D7 chord contains D–F sharp–A–C; the written RH is its upper three notes and the LH adds D.", "Play RH shapes without the click, then the LH roots alone. Say I, IV, V7, I or G, C, D7, G.", "Join with one chord per bar. Hold for four counts and prepare the next position during the hold; take the changes slowly."],
    listenFor: ["D7's F sharp and C create a pull toward G.", "The final G sounds settled without needing extra force."],
    checks: ["I can name all four tones of D7, including F sharp.", "I can find the next shape before restarting a difficult change."], skillIds: ["primary-chords", "seventh-chords", "f-sharp"],
  }),
  ex({
    id: "g-chords-close", section: "chords", title: "Close voices: keep the top of the chord nearby", summary: "Read inversions of G, C and D7 with less travel in the RH.", minutes: 5, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Close G-major cadence", ["\"G\"[B,DG]4", "\"C\"[CEG]4", "\"D7\"[CFA]4", "\"G\"[B,DG]4"], ["G,,4", "C,4", "D,4", "G,,4"]),
    fingering: "RH B3–D4–G4 = 1–2–5; C4–E4–G4 = 1–3–5; C4–F sharp4–A4 = 1–3–5; return B3–D4–G4 = 1–2–5. LH roots G2, C3, D3, G2.",
    steps: ["Read the lowest RH tones from middle C: B3 is just below it, while C4 is on the ledger line.", "Play the RH only. G stays in place between the first two chords; the D7 shape contains C, F sharp and A over bass D.", "Compare with the previous cadence, then play the close version for four counted bars. Do not force an inversion to use a memorized root-position shape."],
    listenFor: ["The harmony changes even when a common tone remains.", "The lower B3 stays in the written octave."],
    checks: ["I can identify the chord from its tones even when G is not the lowest RH note.", "I can read the D7 shell and its bass as one harmony."], skillIds: ["inversions", "ledger-landmarks", "seventh-chords"],
  }),
  ex({
    id: "g-chords-four-loop", section: "chords", title: "Four chords in G: I–V–vi–IV", summary: "G–D–Em–C uses the same harmonic jobs as the C-major pop loop, with new roots and a minor color.", minutes: 5, bpm: 48, targetBpm: 72, hands: "both",
    abc: grand("Four chords in G", ["\"G\"[B,DG]4", "\"D\"[A,DF]4", "\"Em\"[B,EG]4", "\"C\"[CEG]4"], ["G,,4", "D,4", "E,4", "C,4"]),
    fingering: "RH B3–D4–G4 1–2–5; A3–D4–F sharp4 1–3–5; B3–E4–G4 1–3–5; C4–E4–G4 1–3–5. LH G2, D3, E3, C3, using comfortable fingers after whole-hand moves.",
    steps: ["Build Em from E–G–B. The RH inversion B–E–G still gives Em when the bass supplies E.", "Practice G→D and Em→C as two small changes, with four counts per chord. D here is the major triad; adding C would make D7.", "Play all four and return to G on a new beat 1. Hum a tiny tune over the loop while keeping the accompaniment simple."],
    listenFor: ["Em changes the color while the beat remains unchanged.", "F sharp belongs in D; F natural would change the harmony."],
    checks: ["I can name roots G–D–E–C and explain vi is Em in this key.", "I can make one complete loop at a comfortable pulse."], skillIds: ["pop-accompaniment", "inversions", "chord-changes"],
  }),
  ex({
    id: "g-chords-ballad", section: "chords", title: "A rolling G-major accompaniment", summary: "Hold close RH chords while LH quarter notes move root–fifth–octave–fifth.", minutes: 5, bpm: 46, targetBpm: 66, hands: "both",
    abc: grand("Rolling harmony in G", ["\"G\"[B,DG]4", "\"D\"[A,DF]4", "\"Em\"[EGB]4", "\"C\"[CEG]4"], ["G,, D, G, D,", "D,, A,, D, A,,", "E,, B,, E, B,,", "C,, G,, C, G,,"]),
    fingering: "RH G shape B3–D4–G4 1–2–5; D shape A3–D4–F sharp4 1–3–5; Em is E4–G4–B4 1–3–5; C is C4–E4–G4 1–3–5. LH each pattern uses 5–2–1–2: G2–D3–G3–D3, D2–A2–D3–A2, E2–B2–E3–B2, C2–G2–C3–G2. Travel with the hand instead of forcing a fixed stretch.",
    steps: ["Learn one LH pattern on G first. Use quarter notes; an eighth-note version can wait until this feels comfortable.", "Add the RH chord only on beat 1. The Em voicing is higher so the LH never needs to re-strike a key the RH is holding.", "Join two bars, then all four. Keep the LH quiet and even while the RH chord remains down for the complete bar."],
    listenFor: ["The top LH note does not arrive early.", "The held RH harmony stays separate from the LH motion."],
    checks: ["I can play one pattern without a rigid octave stretch.", "I can hold a chord over the full moving LH pattern."], skillIds: ["broken-chords", "pop-accompaniment", "coordination"],
  }),

  ex({
    id: "g-music-northern-lights", section: "guided", title: "Northern lights", summary: "An original spacious eight-bar study: a half-note melody and whole-note bass reveal G's new color.", minutes: 8, bpm: 54, targetBpm: 72, hands: "both",
    abc: grand("Northern lights", ["B2 A2", "G2 F2", "E2 G2", "F4", "B2 A2", "G2 E2", "F2 A2", "G4"], ["G,,4", "E,4", "C,4", "D,4", "G,,4", "E,4", "D,4", "G,,4"]),
    fingering: "RH E4–B4 position uses 1–5, with F sharp4 on 2; start B4 with 5. LH roots G2, E3, C3, D3, G2, E3, D3, G2, moving the whole hand between bars.",
    steps: ["Listen for the long F sharp over bass D, then its resolution toward G. Count four steady beats in each bar.", "Read RH bars 1–4 and find the LH roots separately. Combine one whole-note bass with its two melody notes, then join two bars.", "Learn the changed answer in bars 5–8. Play a gentle four-bar section, or all eight when ready; keep the bass less prominent than the tune."],
    listenFor: ["The long F sharp is held for all four counts.", "The bass remains sounding while the half-note melody moves."],
    checks: ["I can keep a full-bar bass under a moving half-note melody.", "I can remember F sharp while maintaining the pulse in two connected bars."], skillIds: ["held-bass", "half-note-melody", "f-sharp", "pulse"],
  }),
  ex({
    id: "g-music-blue-hour", section: "guided", title: "Blue hour", summary: "An alternate original eight-bar study with the same range, bass rhythm and F-sharp goal as Northern lights.", minutes: 8, bpm: 54, targetBpm: 72, hands: "both",
    abc: grand("Blue hour", ["G2 B2", "A2 G2", "G2 E2", "F4", "G2 B2", "E2 G2", "A2 F2", "G4"], ["G,,4", "E,4", "C,4", "D,4", "G,,4", "E,4", "D,4", "G,,4"]),
    fingering: "RH E4–B4 uses 1–5; G4 starts with 3 and F sharp4 uses 2. LH roots G2, E3, C3, D3, G2, E3, D3, G2, with whole-hand moves.",
    steps: ["Listen and count the four-beat bars. This is a different melody for the same held-bass task as Northern lights.", "Play RH bars 1–4, then locate the bass. Join one bar, then two, holding the LH for its entire written value.", "Learn the answer in bars 5–8. Compare the two studies and choose the mood you want to play, keeping the practice goal unchanged."],
    listenFor: ["The long F sharp is held for all four counts.", "The bass remains sounding while the half-note melody moves."],
    checks: ["I can keep a full-bar bass under a moving half-note melody.", "I can remember F sharp while maintaining the pulse in two connected bars."], skillIds: ["held-bass", "half-note-melody", "f-sharp", "pulse"],
  }),
  ex({
    id: "g-music-paper-lanterns", section: "guided", title: "Paper lanterns", summary: "An original pop-style melody moves in eighth-note pairs above simple bass changes.", minutes: 8, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Paper lanterns", ["G2 A B A2 G2", "F G A2 G4", "E2 G2 B A G2", "F2 A2 F2 D2", "G A B2 A2 G2", "E2 F G A2 G2", "A2 F2 E2 D2", "G8"], ["G,,4 D,4", "D,4 A,,4", "E,4 B,,4", "D,4 A,,4", "G,,4 D,4", "C,4 G,,4", "D,4 D,4", "G,,8"], "1/8"),
    fingering: "RH E4–B4 uses 1–5 for most bars; shift down in bars 4 and 7 for D4–A4, 1–5 with F sharp4 on 3. LH pairs G2/D3 = 5/1, A2/D3 = 5/1, B2/E3 = 5/1, G2/C3 = 5/1.",
    steps: ["Preview the signature and RH position changes. Listen for the brief eighth pairs without letting them hurry the bar.", "Tap RH subdivisions against LH attacks on 1 and 3. Play bars 1–2 slowly; the bass holds through each second beat.", "Work through two-bar chunks, then make one continuous four-bar attempt. Give the second half its own attention rather than assuming it repeats the first."],
    listenFor: ["The melody's shorter notes fit between stable bass changes.", "The D4–F sharp4–A4 color is clear in the lower RH position."],
    checks: ["I can count an eighth pair while the LH sustains its half note.", "I can prepare the RH shift without inserting an extra beat."], skillIds: ["eighth-subdivision", "half-note-bass", "coordination", "phrase-shape"],
  }),
  ex({
    id: "g-music-little-promenade", section: "guided", title: "Little promenade", summary: "An original classical-style four-bar question and four-bar answer, with rests and a lightly articulated bass.", minutes: 8, bpm: 52, targetBpm: 72, hands: "both",
    abc: grand("Little promenade", ["G B A G", "F A G2", "E G c B", "A2 D2", "G B d B", "c B A G", "F A D F", "G4"], ["G,,2 z2", "D,2 z2", "C,2 z2", "D,2 z2", "G,,2 z2", "C,2 z2", "D,2 z2", "G,,4"]),
    fingering: "RH bar 1 G4–B4–A4–G4 = 1–3–2–1; bar 2 F sharp4–A4–G4 = 1–3–2. Bar 3 E4–G4–C5–B4 = 1–2–5–4. Bar 4 A4–D4 = 5–1 after moving down. Bar 5 G4–B4–D5–B4 = 1–3–5–3; bar 6 C5–B4–A4–G4 = 4–3–2–1; bar 7 F sharp4–A4–D4–F sharp4 = 3–5–1–3; final G4 = 4. LH roots G2/D3/C3, repositioning between bars.",
    steps: ["Listen for the balanced four-bar phrases. The first ends on D; the second comes home to G.", "Learn RH one bar at a time, using the written starting pitches and planned fingerings rather than holding one five-finger position throughout.", "Play the LH alone: sound on beats 1–2, silence on 3–4. Join the parts and release the bass on time even while the melody continues.", "Play one four-bar phrase with a gentle shape, then the answer. Keep the final G sounding for a full bar."],
    listenFor: ["LH rests keep the texture light rather than filling every beat with sound.", "The answer settles more clearly than the question."],
    checks: ["I can release the bass for its rest without stopping the melody.", "I can hear and play a four-bar question or answer with a continuing pulse."], skillIds: ["phrase-shape", "rests", "coordination", "hand-moves"],
  }),
  ex({
    id: "g-music-first-train", section: "guided", title: "First train", summary: "An original cinematic study puts a tied melody above quietly moving broken chords.", minutes: 8, bpm: 46, targetBpm: 66, hands: "both",
    abc: grand("First train", ["G4-G2 A2", "B2 A2 G4", "E2 G2 B2 G2", "F4 A2 F2", "G4-G A B2", "A2 G2 E4", "F2 A2 F2 D2", "G8"], ["G,,2 B,,2 D,2 B,,2", "E,2 G,2 B,2 G,2", "C,2 E,2 G,2 E,2", "D,2 F,2 A,2 F,2", "G,,2 B,,2 D,2 B,,2", "C,2 E,2 G,2 E,2", "D,2 F,2 A,2 F,2", "G,,8"], "1/8"),
    fingering: "RH E4–B4 uses 1–5; G4 is 3 and F sharp4 is 2. Shift down in bar 7 for F sharp4–A4–F sharp4–D4 = 3–5–3–1, final G4 with 3. LH broken G/Em/C/D triads use 5–3–1–3 on roots G2/E3/C3/D3.",
    steps: ["Count subdivisions before playing. Bar 1 holds G for three beats, then A begins on 4; bar 5 holds G through beat 3, then A arrives on the and of 3.", "Play the LH alone, then hold the RH notes above a single LH bar. A tie never asks the RH to re-strike.", "Join bars 1–2 and 3–4 separately. Learn the changed rhythm in bars 5–6 rather than playing it as the opening again.", "Make a soft four-bar or eight-bar pass. Let the slow melody remain clearer than the moving accompaniment."],
    listenFor: ["The tied G floats over several bass notes.", "LH quarters remain even when the next melody attack is delayed."],
    checks: ["I can hold the RH across a beat while the LH keeps moving.", "I can distinguish the long G in bar 1 from the slightly shorter G in bar 5."], skillIds: ["ties", "broken-chords", "balance", "coordination"],
  }),
  ex({
    id: "g-music-homeward", section: "guided", title: "Homeward", summary: "An original final study combines the G-major pop roots, a dotted answer and an intentional opening silence.", minutes: 8, bpm: 46, targetBpm: 66, hands: "both",
    abc: grand("Homeward", ["z2 G2 B2 A2", "F3 A F2 D2", "E2 G2 B2 G2", "E4 G4", "G3 A B2 A2", "F2 A2 G2 F2", "E2 G2 A2 F2", "G8"], ["G,,2 D,2 G,,2 D,2", "D,2 A,,2 D,2 A,,2", "E,2 B,,2 E,2 B,,2", "C,2 G,,2 C,2 G,,2", "G,,2 D,2 G,,2 D,2", "D,2 A,,2 D,2 A,,2", "C,2 E,2 D,2 F,2", "G,,8"], "1/8"),
    fingering: "RH mostly E4–B4 = 1–5; first G4 is 3. Bar 2 shifts to D4–A4: F sharp4 3, A4 5, D4 1; shift back for bar 3. LH fifths G2/D3, A2/D3, B2/E3, G2/C3 use 5/1; bar 7 C3–E3–D3–F sharp3 can use 5–3–4–2.",
    steps: ["Preview the first RH rest and the dotted figure in bar 2. Count the latter as F sharp on 1, A on the and of 2, F sharp on 3, D on 4.", "Learn two-bar chunks with the LH roots and fifths first, then add the RH. Keep the two hands' rhythms distinct.", "Bars 5–8 answer the opening and change the bass in bar 7. Read that new line before trying a complete pass.", "Perform a comfortable four-bar section. Choose one small thing to refine before extending to eight bars or a faster tempo."],
    listenFor: ["The bass establishes time while the melody is silent.", "F sharp and the D harmony lead toward a calm final G."],
    checks: ["I can maintain the bass through the rest and dotted rhythm.", "I can give a specific musical next goal rather than treating speed as the only goal."], skillIds: ["dotted-rhythm", "rests", "pop-accompaniment", "coordination"],
  }),

  ex({
    id: "g-create-two-answers", section: "guided", title: "Two answers in a bright new key", summary: "Answer a two-bar question using G, A, B and D; keep its four-bar frame.", minutes: 4, bpm: 48, targetBpm: 66, hands: "R",
    abc: grand("A question in G", ["G A B2", "d2 B2", "z4", "z4"], rest(4)),
    fingering: "RH G4 A4 B4 C5 D5 uses 1–2–3–4–5. The question uses 1–2–3, then 5–3. Bars 3–4 are intentionally blank for your answer.",
    steps: ["Listen and count through the two silent answer bars. The question ends on B rather than the tonic G.", "With playback stopped, play the question and make a two-bar answer from G4, A4, B4 and D5. End on G4; quarters, halves and silence are enough.", "Make another answer with a different rhythm. Keep both answers exactly two bars long, including held notes."],
    listenFor: ["A final G feels more settled than the question's B.", "The imagined answer has a pulse even when it has only a few notes."],
    checks: ["I can repeat or describe one answer I liked.", "I kept the full two-bar answer shape rather than stopping when I ran out of notes."], skillIds: ["creative-application", "aural-tonic", "phrase-shape"],
  }),
  ex({
    id: "g-create-minor-color", section: "guided", title: "One melody, two colors: G and Em", summary: "The same B–G melody changes character over two different bass roots.", minutes: 4, bpm: 48, targetBpm: 66, hands: "both",
    abc: grand("A change of light", ["B2 G2", "B2 G2", "A2 F2", "G4"], ["\"G\"G,,4", "\"Em\"E,4", "\"D7\"D,4", "\"G\"G,,4"]),
    fingering: "RH E4–B4 uses 1–5: B4 with 5, G4 with 3, A4 with 4 and F sharp4 with 2. LH roots G2, E3, D3, G2.",
    steps: ["Play the written seed. Its first two RH bars are identical, but the bass changes from G to E.", "Listen for what changes in the sound. G major and E minor share G and B, so a melody does not need to change every time its harmony changes.", "Stop playback and invent a two-note variation for the first two bars. Keep the bass roots and return through D to G, counting four beats per bar."],
    listenFor: ["A new bass root can change the mood of the same melody.", "F sharp over D points back toward G."],
    checks: ["I can describe how the G and Em bars sound different to me.", "I can make a deliberate small variation while maintaining the pulse."], skillIds: ["creative-application", "minor-color", "held-bass"],
  }),
  ex({
    id: "g-create-ending", section: "guided", title: "Choose how your G-major story ends", summary: "Make a new last two bars while keeping the D-to-G return and a continuing pulse.", minutes: 4, bpm: 48, targetBpm: 66, hands: "both",
    abc: grand("A G-major ending to change", ["B2 A2", "G2 E2", "A2 F2", "G4"], ["G,,4", "C,4", "D,4", "G,,4"]),
    fingering: "RH E4–B4 position 1–5; first B4 is 5 and F sharp4 is 2. LH roots G2, C3, D3, G2, moving the hand between them.",
    steps: ["Play the seed, counting four complete beats for every bass root. Listen to F sharp resolving up to G.", "With playback stopped, keep bars 1–2 and invent a different two-bar ending using D4, E4, F sharp4, G4 or A4. Move the RH as needed rather than straining to keep fixed fingers.", "Try one ending with a rest and another with a long last note. Keep the bass D3 then G2 and choose the version you prefer."],
    listenFor: ["The ending occupies the whole two-bar space, even if it has few attacks.", "The final G can sound settled without an accent or a rush."],
    checks: ["I can repeat or describe my chosen ending.", "I can explain what F sharp contributes near the final G."], skillIds: ["creative-application", "f-sharp", "phrase-shape"],
  }),
];

const session = (x) => ({ unitId: UNIT.id, ...x });
export const SESSIONS = [
  session({ id: "g2-d1-a", day: 1, slot: "A", title: "Meet F sharp", focus: "Hear the changed scale step, read the signature in both clefs, and keep a bass sounding under a new melody.", blocks: [{ exerciseId: "g-key-f-sharp", minutes: 4 }, { exerciseId: "g-read-f-sharp", minutes: 4 }, { exerciseId: "g-coord-held-tonic", minutes: 7 }, { exerciseId: "g-scale-r", minutes: 5 }] }),
  session({ id: "g2-d1-b", day: 1, slot: "B", title: "A brighter soundtrack", focus: "Build G/C/D7, play a spacious study, and answer a tiny musical question.", blocks: [{ exerciseId: "g-chords-gcd7", minutes: 5 }, { exerciseId: "g-music-northern-lights", minutes: 8 }, { exerciseId: "g-create-two-answers", minutes: 4 }, { exerciseId: "g-rhythm-eighth-walk", minutes: 3 }] }),
  session({ id: "g2-d2-a", day: 2, slot: "A", title: "Read the position before you move", focus: "Subdivide a melodic rhythm, read low treble landmarks, and keep two melody notes inside each bass beat.", blocks: [{ exerciseId: "g-rhythm-eighth-walk", minutes: 4 }, { exerciseId: "g-read-ledgers", minutes: 4 }, { exerciseId: "g-coord-melody-bass", minutes: 7 }, { exerciseId: "g-scale-l", minutes: 5 }] }),
  session({ id: "g2-d2-b", day: 2, slot: "B", title: "Lanterns and close voices", focus: "Use chord inversions with less travel and carry a melody through small eighth-note figures.", blocks: [{ exerciseId: "g-chords-close", minutes: 5 }, { exerciseId: "g-music-paper-lanterns", minutes: 8 }, { exerciseId: "g-create-two-answers", minutes: 4 }, { exerciseId: "g-read-f-sharp", minutes: 3 }] }),
  session({ id: "g2-d3-a", day: 3, slot: "A", title: "Connect a held melody", focus: "Count ties, read a handover in two registers, and keep broken LH chords beneath a slow tune.", blocks: [{ exerciseId: "g-rhythm-tied-answer", minutes: 4 }, { exerciseId: "g-read-registers", minutes: 4 }, { exerciseId: "g-coord-broken-under", minutes: 7 }, { exerciseId: "g-scale-both", minutes: 5 }] }),
  session({ id: "g2-d3-b", day: 3, slot: "B", title: "A question and an answer", focus: "Learn G's four-chord pop loop, shape an original classical-style phrase, and compare G with Em.", blocks: [{ exerciseId: "g-chords-four-loop", minutes: 5 }, { exerciseId: "g-music-little-promenade", minutes: 8 }, { exerciseId: "g-create-minor-color", minutes: 4 }, { exerciseId: "g-rhythm-rest-entrance", minutes: 3 }] }),
  session({ id: "g2-d4-a", day: 4, slot: "A", title: "One hand starts while the other waits", focus: "Place rests and offbeat entrances without stopping the bass, then revisit short hands-together scale chunks.", blocks: [{ exerciseId: "g-rhythm-rest-entrance", minutes: 4 }, { exerciseId: "g-read-registers", minutes: 4 }, { exerciseId: "g-coord-offbeats", minutes: 7 }, { exerciseId: "g-scale-both", minutes: 5 }] }),
  session({ id: "g2-d4-b", day: 4, slot: "B", title: "Keep the accompaniment rolling", focus: "Roll a ballad bass, float a tied tune above broken chords, and vary a melody's harmonic color.", blocks: [{ exerciseId: "g-chords-ballad", minutes: 5 }, { exerciseId: "g-music-first-train", minutes: 8 }, { exerciseId: "g-create-minor-color", minutes: 4 }, { exerciseId: "g-rhythm-tied-answer", minutes: 3 }] }),
  session({ id: "g2-d5-a", day: 5, slot: "A", title: "Choose the rhythm before the notes", focus: "Review dots, ties and rests, try fresh reading, and join a modest dotted melody to the bass.", blocks: [{ exerciseId: "g-rhythm-mix", minutes: 4 }, { exerciseId: "g-read-fresh", minutes: 4 }, { exerciseId: "g-coord-final", minutes: 7 }, { exerciseId: "g-scale-both", minutes: 5 }] }),
  session({ id: "g2-d5-b", day: 5, slot: "B", title: "Make the return home yours", focus: "Keep the G-major loop alive, perform a short section of Homeward, and create your own ending.", blocks: [{ exerciseId: "g-chords-four-loop", minutes: 5 }, { exerciseId: "g-music-homeward", minutes: 8 }, { exerciseId: "g-create-ending", minutes: 4 }, { exerciseId: "g-read-fresh", minutes: 3, goal: "Return to this morning's reading before playback. Check the repair you chose; this is retrieval, rather than a new sight-read." }] }),
];

export const CATALOGUE = EXERCISES
  .filter((e) => e.section === "scales" || e.section === "chords" || e.id.startsWith("g-music-"))
  .map((e) => ({
    id: `catalogue-${e.id}`, unitId: UNIT.id, title: e.title, description: e.summary,
    exerciseId: e.id, kind: "built-in", skills: [...e.skillIds],
    ...(e.id === "g-music-blue-hour" ? { substitutesFor: ["g-music-northern-lights"] } : {}),
  }));
