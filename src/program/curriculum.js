// Key-based piano units. Existing C-major exercise/session IDs stay stable so
// adding the G/F lessons preserves saved attempts and completed blocks.
import { UNIT as G_MAJOR, EXERCISES as G_EXERCISES, SESSIONS as G_SESSIONS, CATALOGUE as G_CATALOGUE } from "./units/g-major.js";
import { UNIT as F_MAJOR, EXERCISES as F_EXERCISES, SESSIONS as F_SESSIONS, CATALOGUE as F_CATALOGUE } from "./units/f-major.js";
import { UNIT as A_MINOR, EXERCISES as A_EXERCISES, SESSIONS as A_SESSIONS, CATALOGUE as A_CATALOGUE } from "./units/a-minor.js";
import { UNIT as D_MAJOR, EXERCISES as D_EXERCISES, SESSIONS as D_SESSIONS, CATALOGUE as D_CATALOGUE } from "./units/d-major.js";
import { UNIT as A_MAJOR, EXERCISES as AM_EXERCISES, SESSIONS as AM_SESSIONS, CATALOGUE as AM_CATALOGUE } from "./units/a-major.js";
import { UNIT as E_MAJOR, EXERCISES as E_EXERCISES, SESSIONS as E_SESSIONS, CATALOGUE as E_CATALOGUE } from "./units/e-major.js";
import { UNIT as MUSICIANSHIP, EXERCISES as M_EXERCISES, SESSIONS as M_SESSIONS, CATALOGUE as M_CATALOGUE } from "./units/musicianship.js";
import { EXTERNAL_MUSIC } from "./guides.js";
import { SCALE_EXERCISES } from "./scales.js";
import { INTEGRATED_EXERCISES, integrateMusicSessions, integrateMusicExercises } from "./musicIntegration.js";
import { resolveSessionVersions } from "./sessionVersions.js";
import { findPracticeDraftForSession } from "./drafts.js";
import { ARCHIVED_EXERCISES, ARCHIVED_SESSIONS } from "./legacyPractice.js";
const original = { label: "Original Woodshed teaching material" };
const grand = (title, right, left, unit = "1/4") => {
  if (right.length !== left.length) throw new Error(`Unmatched hands: ${title}`);
  const lines = [];
  for (let i = 0; i < right.length; i += 4) {
    const end = i + 4 >= right.length ? " |]" : " |";
    lines.push(`[V:1] ${right.slice(i, i + 4).join(" | ")}${end}`);
    lines.push(`[V:2] ${left.slice(i, i + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:4/4\nL:${unit}\nK:C\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${lines.join("\n")}`;
};
const rest = (n, unit = "1/4") => Array(n).fill(unit === "1/8" ? "z8" : "z4");
const exercise = (x) => ({ abc: null, source: original, unitId: "c-major-foundations-1", key: "C major", ...x });

export const COURSE = {
  id: "c-major-foundations-1",
  number: 1,
  title: "A week in C: pulse, hands and musical stories",
  description: "Five repeatable practice days, with a 20-minute Foundations session and a 20-minute Music session each day. Work in C major while pulse, coordination and ledger-note reading catch up with the music you want to play. Session B can happen later the same day. Repeat a day before moving on; the checks are teaching guides, not an exam.",
  key: "C major",
  daysPerWeek: 5,
  sessionsPerDay: 2,
  sessionMinutes: 20,
};

const C_EXERCISES = [
  exercise({
    id: "place-pulse", section: "placement", title: "Placement: can the beat keep going?", summary: "Two minutes to find a useful starting pulse. This checks timing rather than speed.", minutes: 2, bpm: 60, targetBpm: 60, hands: "R",
    abc: grand("A steady beginning", ["C C C C", "C2 C2", "C C z C", "C4"], rest(4)),
    fingering: "RH finger 1 on middle C (C4). One key only. Keep the wrist comfortable; fingers are numbered thumb 1 to little finger 5.",
    steps: ["Listen once. Count 1 2 3 4 through every bar, including the rest and the held last note.", "Tap the rhythm on your knee with the click, then play it on C4. In bar 3, the rest is beat 3; keep counting while silent.", "Try once without the click, then bring it back. Note whether holding a note or leaving silence makes the next beat arrive late."],
    listenFor: ["The half notes last two counts; the final C lasts four.", "A silent beat takes as much time as a played beat."],
    checks: ["I can keep the count going through all four bars without restarting.", "If the pulse wanders, I will begin with Day 1's rhythm work; this is useful placement information."], skillIds: ["pulse", "note-lengths", "rests"],
  }),
  exercise({
    id: "place-reading", section: "placement", title: "Placement: find the C, then read the shape", summary: "Distinguish remembered music from reading an unfamiliar four-bar phrase.", minutes: 2, bpm: 52, targetBpm: 60, hands: "both",
    abc: grand("Find the shape", ["C D E2", "G E D2", "z4", "z4"], ["z4", "z4", "C, E, G,2", "E, D, C,2"]),
    fingering: "Bars 1–2 RH C4–G4: fingers 1–5. Bars 3–4 LH C3–G3: fingers 5–1. Each hand has its own two-bar turn.",
    steps: ["Before listening, identify the first note of each hand and find it on the piano. C4 is middle C; C3 is one octave lower.", "Say step up, skip up, or step down as you inspect each move. Play the four bars slowly without a demo first.", "Now listen and compare. Write down the clef or note that made you stop; do not assign yourself a grade from one attempt."],
    listenFor: ["The RH melody and LH answer are separate turns, not simultaneous parts.", "The register matters: the LH starts an octave below the RH."],
    checks: ["I found both starting Cs from the written clefs.", "I can name one specific reading issue to work on, or say that this felt comfortable."], skillIds: ["staff-reading", "interval-reading", "register"],
  }),
  exercise({
    id: "place-coordination", section: "placement", title: "Placement: a melody above a held bass", summary: "A three-minute coordination check. Find how small a hands-together chunk should be.", minutes: 3, bpm: 48, targetBpm: 60, hands: "both",
    abc: grand("A quiet two-hand check", ["C D E G", "E D C2", "D E F D", "E2 C2"], ["C,4", "C,4", "G,,4", "C,4"]),
    fingering: "RH C4–G4 stays in five-finger position (1–5). LH finger 5 starts C3; move the whole hand to G2 for bar 3, then back to C3.",
    steps: ["Play the RH once, then only the LH. Count four full beats for each bass note.", "Combine just beat 1 of bar 1. Keep the LH down while the RH finishes the bar; release both hands at the barline.", "Try two bars at a comfortable pulse. If joining the hands disrupts the count, work a beat at a time rather than forcing the whole piece."],
    listenFor: ["The bass stays sounding while the melody moves.", "The RH does not become louder or faster when the LH joins."],
    checks: ["I can tell whether the difficulty is finding notes, keeping the beat, or coordinating the hands.", "I know a comfortable starting tempo; 48 is a suggestion, and slower is fine."], skillIds: ["held-bass", "coordination", "pulse"],
  }),

  exercise({
    id: "rhythm-long-short", section: "guided", title: "The beat continues while notes change length", summary: "Hear, count, tap, then play quarters, halves and a full-bar note on one key.", minutes: 3, bpm: 56, targetBpm: 72, hands: "R",
    abc: grand("Long and short", ["C C C C", "C2 C2", "C C C2", "C4"], rest(4)),
    fingering: "RH finger 2 on C4. This is a rhythm lesson, so one comfortable finger is enough.",
    steps: ["Listen while tapping four steady beats per bar. A held sound does not stop the taps.", "Say 1 2 3 4 continuously; clap only where a new note begins. Bar 2 claps on 1 and 3; bar 4 only on 1.", "Play on C4, keeping each key down for its written length. Repeat two bars at a time, then make one uninterrupted four-bar attempt."],
    listenFor: ["No extra attack on beat 2 of a half note.", "The beat after a held note arrives on time."],
    checks: ["I can count and tap all four bars without a restart.", "I can repeat it at a comfortable pulse without shortening the held notes."], skillIds: ["pulse", "note-lengths"],
  }),
  exercise({
    id: "rhythm-eighths", section: "guided", title: "Two small steps inside each beat", summary: "Keep quarters steady while introducing pairs of eighth notes.", minutes: 4, bpm: 52, targetBpm: 72, hands: "R",
    abc: grand("Inside the beat", ["C2 C2 C C C2", "C C C2 C2 C2", "C2 C C C2 C C", "C2 C2 C4"], rest(4, "1/8"), "1/8"),
    fingering: "RH finger 2 on C4; release and re-press for each written attack. Later try it with the LH on C3.",
    steps: ["Say 1 and 2 and 3 and 4 and evenly while tapping only the numbered beats.", "Listen, then clap the written attacks. In bar 1, beat 3 has two notes; beats 1, 2 and 4 each have one.", "Play the same rhythm on C4. Keep the click on the main beats; do not make the whole bar faster when eighth notes appear."],
    listenFor: ["Each eighth pair fits inside one click-to-click gap.", "The final half note lasts beats 3 and 4."],
    checks: ["I can speak the subdivisions even when I play only on the numbers.", "The quarter notes before and after an eighth pair keep the same pace."], skillIds: ["pulse", "eighth-subdivision"],
  }),
  exercise({
    id: "rhythm-rests", section: "guided", title: "Make the silence exact", summary: "Quarter rests and eighth rests are counted time, not a pause to think.", minutes: 4, bpm: 52, targetBpm: 72, hands: "R",
    abc: grand("Room for silence", ["C2 z2 C2 z2", "C2 C z C2 C2", "z C C2 z C C2", "C2 z2 C4"], rest(4, "1/8"), "1/8"),
    fingering: "RH finger 2 on C4. Lift fully for each rest; keep the hand close to the keys.",
    steps: ["Count 1 and 2 and 3 and 4 and. In bar 3, the first note is on the and of 1; beat 1 itself is silent.", "Tap the pulse with one hand and clap or tap the attacks with the other. Say rest at a silent subdivision if it helps.", "Play on C4 and listen to the gaps. If a rest causes a restart, isolate that beat and the following beat before joining the bar again."],
    listenFor: ["A rest releases the sound; the metronome carries on.", "An offbeat note does not move the following numbered beat."],
    checks: ["I can begin bar 3 after a count-in without playing on beat 1.", "I can keep counting through the silence at the end of bar 1."], skillIds: ["pulse", "eighth-subdivision", "rests"],
  }),
  exercise({
    id: "rhythm-ties", section: "guided", title: "Hold across the beat", summary: "A tie joins two written notes into one sound; count the hidden beat inside it.", minutes: 4, bpm: 50, targetBpm: 68, hands: "R",
    abc: grand("One sound across a beat", ["C2-C C C2 C2", "C C-C2 C2 C2", "C2 C2-C2 C2", "C4 z4"], rest(4, "1/8"), "1/8"),
    fingering: "RH finger 2 on C4. Keep the same finger down across a tie; do not strike the tied-to note.",
    steps: ["Listen and count 1 and 2 and 3 and 4 and. Bar 1 holds from beat 1 through beat 2, then attacks on the and of 2.", "Clap only new attacks while speaking every subdivision. Trace the tie with your free hand rather than clapping the tied-to note.", "Play the pattern. Compare bars 1 and 2: the same held length begins in a different part of the beat."],
    listenFor: ["No repeated attack where the tie lands.", "The new note after the tie falls on its written subdivision."],
    checks: ["I can identify which written notes have no new attack.", "I can play bar 1 while counting aloud without losing beat 2."], skillIds: ["pulse", "eighth-subdivision", "ties"],
  }),
  exercise({
    id: "rhythm-dotted", section: "guided", title: "The dot keeps half as much again", summary: "Hear a dotted quarter as the quarter-plus-eighth you already know.", minutes: 4, bpm: 50, targetBpm: 68, hands: "R",
    abc: grand("A dotted-quarter answer", ["C3 C C2 C2", "C2 C C3 C2", "C3 C C3 C", "C2 C2 C4"], rest(4, "1/8"), "1/8"),
    fingering: "RH finger 2 on C4; repeat with LH finger 2 on C3 if comfortable.",
    steps: ["Count 1 and 2 and 3 and 4 and. A dotted quarter occupies three of these small counts; it is not a quick long-short swing.", "In bar 1, attack on 1, the and of 2, 3, and 4. In bar 2, the dotted note starts on the and of 2 and lasts through the and of 3.", "Tap first, then play. Compare with the tie exercise: the first bar has the same timing as its first bar, just a different spelling."],
    listenFor: ["The short note has exactly one subdivision, not an unspecified flick.", "The main beats stay even under the long-short pattern."],
    checks: ["I can count the first bar without speeding through the dotted note.", "I can explain that a dot adds half the original note's value."], skillIds: ["pulse", "eighth-subdivision", "dotted-rhythm"],
  }),

  exercise({
    id: "read-family-c", section: "guided", title: "Three Cs, two clefs, one keyboard", summary: "Map bass C3, middle C4 and treble C5 before reading their neighbors.", minutes: 4, bpm: 48, targetBpm: 64, hands: "both",
    abc: grand("C landmarks", ["C2 c2", "z4", "c2 C2", "z4"], ["z4", "C,2 C2", "z4", "C2 C,2"]),
    fingering: "Use RH finger 3 for C4/C5 and LH finger 3 for C3/C4; move the whole hand for each octave. These are separate turns, not stretches.",
    steps: ["Find middle C (C4), then the C one octave below (C3) and one octave above (C5). C4 sits on a short ledger line below treble or above bass.", "Before listening, name each written C with its octave. Say which hand has the turn and find the key without reaching across an octave with fixed fingers.", "Play slowly with whole-hand moves. On a second pass, look at the staff first, then briefly at the destination key if needed."],
    listenFor: ["The two written versions of middle C have the same sound.", "Each new C is in the intended octave, not merely the right letter name."],
    checks: ["I can find C4 in either clef.", "I can find C3/C5 without counting every white key from middle C."], skillIds: ["ledger-landmarks", "register", "staff-reading"],
  }),
  exercise({
    id: "read-bass-neighbors", section: "guided", title: "Read above the bass staff", summary: "Use middle C as a landmark for A3, B3, C4, D4 and E4 in the bass clef.", minutes: 4, bpm: 48, targetBpm: 64, hands: "L",
    abc: grand("Bass-clef neighbors", rest(4), ["A, B, C D", "E D C B,", "A, C E C", "B,2 C2"]),
    fingering: "LH A3–E4: fingers 5–4–3–2–1 ascending. Begin on A3, two white keys below middle C. The LH is allowed above middle C.",
    steps: ["Locate middle C on the first ledger line above the bass staff. A3 is the top staff line; E4 is on the next ledger line above C4.", "Read each move as a step, skip or repeat from a note you already recognize. Then name and play the starting A3.", "Play the four bars, then hide the note-name help and try again. Use the revealed pitches to check yourself after, not before, each attempt."],
    listenFor: ["Bar 3 skips A3–C4–E4 and returns to C4.", "The whole phrase stays close to middle C; it is not a low bass passage."],
    checks: ["I can find upper bass-clef C4 and E4 without counting from the bottom line.", "I can read a new ordering of these notes as well as this practiced pattern."], skillIds: ["ledger-landmarks", "bass-reading", "interval-reading"],
  }),
  exercise({
    id: "read-treble-neighbors", section: "guided", title: "Read below the treble staff", summary: "Read the same A3–E4 region from the treble clef; clef determines the written map.", minutes: 4, bpm: 48, targetBpm: 64, hands: "R",
    abc: grand("Treble-clef neighbors", ["A, B, C D", "E D C B,", "A, C E C", "B,2 C2"], rest(4)),
    fingering: "RH A3–E4: fingers 1–2–3–4–5 ascending. Start on A3 with the thumb, not on C4.",
    steps: ["Find middle C on its ledger line below treble. A3 is the second ledger line below the staff; E4 is the bottom line of the staff.", "Compare these sounds with Bass-clef neighbors: the keys are identical even though the written positions differ.", "Play two bars, say the starting register, then finish. Change the order yourself to A3–C4–B3–E4 and check each key against the landmark."],
    listenFor: ["These low treble notes sound in the same register as the preceding bass-reading lesson.", "A skip looks wider than a step; do not rename every line from scratch."],
    checks: ["I can recognize A3, C4 and E4 in treble.", "I can find the correct starting key even when the hand position is not C position."], skillIds: ["ledger-landmarks", "treble-reading", "interval-reading"],
  }),
  exercise({
    id: "read-ledger-transfer", section: "guided", title: "One register, two written maps", summary: "A fresh phrase changes hands around middle C. Read the clef before assuming an octave.", minutes: 4, bpm: 48, targetBpm: 64, hands: "both",
    abc: grand("Across the middle", ["C B, A, C", "E2 D2", "z4", "z4"], ["z4", "z4", "C E D B,", "A,2 C2"]),
    fingering: "RH A3–E4 uses 1–5, so its first C4 is finger 3. LH A3–E4 uses 5–1, so its first C4 is also finger 3. Hands take turns in the same register.",
    steps: ["Preview without playback: identify each clef, first note and the two held notes. Point to the keyboard region for both hands.", "Play through once at a pace that allows the count to continue. Keep going through a slip; this first attempt is reading, not memorizing.", "Then listen to check register and rhythm. Repair one bar, and finish by inventing a different four-note ordering in this same register."],
    listenFor: ["The LH answer stays near middle C instead of dropping an octave automatically.", "The final C settles on the same pitch as the opening C."],
    checks: ["I checked the clef and starting pitch before playing.", "I can name what changed from a practiced example rather than relying on muscle memory."], skillIds: ["ledger-landmarks", "register", "interval-reading"],
  }),
  exercise({
    id: "read-new-phrase", section: "guided", title: "Read a new message", summary: "One uninterrupted four-bar reading at the end of the week; then one targeted repair.", minutes: 3, bpm: 52, targetBpm: 68, hands: "both",
    abc: grand("A new message", ["E G F D", "C2 D2", "z4", "C4"], ["z4", "z4", "C, E, D, G,,", "C,4"]),
    fingering: "RH C4–G4 uses 1–5; first E4 is 3. LH starts C3 with 5, E3 with 3, D3 with 4; move to G2 with 5, then back to C3.",
    steps: ["Do not listen first. Inspect the rests, starting notes and where the LH moves away from C position.", "Choose a comfortable pulse and make one uninterrupted reading. Continue counting if you miss a note.", "Listen afterward. Pick the one bar that needs repair, practice it slowly, then play the complete phrase once more."],
    listenFor: ["The melody hands over to the bass line without a gap in pulse.", "Both hands land on their own C together in bar 4."],
    checks: ["I kept the pulse through the handover.", "My next step is specific: a register, rhythm, or hand-move issue, rather than just play more."], skillIds: ["staff-reading", "register", "coordination"],
  }),

  exercise({
    id: "coord-held-bass", section: "guided", title: "Let one hand stay while the other moves", summary: "Build coordination on four short bars with whole-note bass anchors.", minutes: 8, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("A steady floor", ["C D E G", "F E D C", "E G F E", "D2 C2"], ["C,4", "C,4", "G,,4", "C,4"]),
    fingering: "RH C4–G4, 1–5. LH starts C3 with finger 5; move to G2 for bar 3 and back to C3 for bar 4. Do not hold a stretch between bass notes.",
    steps: ["Tap the RH rhythm while the LH presses gently on your knee for four counts. The LH only moves on a barline.", "Play each hand once to locate its notes. Combine only bar 1, starting both hands on beat 1 and holding the bass to the end.", "Add bar 2, then practice the bass move into bar 3 separately. Join pairs of bars before the whole phrase.", "Try one continuous pass. Use a slower tempo or a one-beat chunk if joining the hands interrupts the count."],
    listenFor: ["The bass does not repeat with every RH note.", "The melody can stay light while the bass stays down."],
    checks: ["I can play two joined bars with the bass held and the count continuing.", "I can begin again after a short pause without relearning the first bar."], skillIds: ["held-bass", "coordination", "pulse"],
  }),
  exercise({
    id: "coord-half-bass", section: "guided", title: "Two bass changes inside a bar", summary: "The LH now changes on beats 1 and 3 while the RH keeps moving.", minutes: 7, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Two pillars", ["C D E G", "F E D C", "D E F D", "E D C2"], ["C,2 G,,2", "C,2 G,,2", "G,,2 D,2", "G,,2 C,2"]),
    fingering: "RH C4–G4, fingers 1–5. LH C3 with 1 and G2 with 5; for G2–D3 use 5–1, moving the whole hand to that five-note span.",
    steps: ["Count 1 2 3 4. Tap LH on 1 and 3 and RH on every beat; notice where the attacks coincide.", "Locate the LH pairs, then combine only beats 1–2 of bar 1. Add beats 3–4 when the first pair is comfortable.", "Join bars 1–2 at an easy pulse. Practice the G2–D3 hand position before adding bars 3–4."],
    listenFor: ["Both hands change together on 1 and 3; the LH holds through 2 and 4.", "Bass changes do not pull the RH ahead of the pulse."],
    checks: ["I can tap the combined rhythm without the piano.", "I can play two bars with clearly held LH half notes."], skillIds: ["coordination", "half-note-bass", "pulse"],
  }),
  exercise({
    id: "coord-two-to-one", section: "guided", title: "Two melody notes for one bass beat", summary: "Keep a quarter-note LH while the RH divides each beat in two.", minutes: 7, bpm: 44, targetBpm: 64, hands: "both",
    abc: grand("Two over one", ["C D E F G F E D", "C E D F E G F D", "D E F G F E D C", "E2 D2 C4"], ["C,2 C,2 G,,2 G,,2", "C,2 C,2 G,,2 G,,2", "G,,2 G,,2 C,2 C,2", "G,,2 G,,2 C,4"], "1/8"),
    fingering: "RH C4–G4 uses 1–5. LH holds a C3–G2 span, C3 finger 1 and G2 finger 5. Re-strike only on the numbered beats.",
    steps: ["Tap LH on 1 2 3 4 and RH on 1 and 2 and 3 and 4 and. Start with one beat, then a full bar.", "Play bar 1 RH alone, then add only LH beat 1. Next add all four LH beats, keeping the RH pace unchanged.", "Work in two-bar chunks. If the LH copies the RH eighth notes, return to the knee-tap pattern, then retry more slowly."],
    listenFor: ["The LH attacks once per beat, not twice.", "The RH and notes sit halfway between the bass beats."],
    checks: ["I can maintain the two-to-one pattern for one bar without extra LH notes.", "I can keep the same beat when the RH changes to longer notes in the last bar."], skillIds: ["coordination", "two-to-one", "eighth-subdivision"],
  }),
  exercise({
    id: "coord-broken-chords", section: "guided", title: "A moving floor under a slow melody", summary: "Reverse the job: LH quarter notes move while RH half notes stay sounding.", minutes: 7, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Under the melody", ["G2 E2", "E2 C2", "F2 E2", "D2 C2"], ["C, E, G, E,", "A,, C, E, C,", "F,, A,, C, A,,", "G,, B,, C,2"]),
    fingering: "RH C4–G4, fingers 1–5. LH C3–E3–G3 uses 5–3–1; A2–C3–E3 and F2–A2–C3 also use 5–3–1 after moving the hand. Last bar G2–B2–C3: 5–2–1.",
    steps: ["Play the LH alone and speak the chord names C, Am, F, G-to-C. Move between positions in the silence before retrying.", "Tap the LH quarters while the RH stays down for two beats. Then try only bar 1 at the keyboard.", "Join one chord change at a time. End with a gentle four-bar pass; the melody should sing above the moving LH."],
    listenFor: ["The RH holds until its next note rather than re-striking with the LH.", "The LH is even and quieter than the melody."],
    checks: ["I can keep each RH half note sounding for its full two beats.", "I can move to the next LH shape without a rushed first note."], skillIds: ["coordination", "broken-chords", "balance"],
  }),
  exercise({
    id: "coord-offbeat-melody", section: "guided", title: "The melody can enter between bass beats", summary: "Combine a steady bass with a rest and a dotted-quarter figure in the melody.", minutes: 7, bpm: 44, targetBpm: 64, hands: "both",
    abc: grand("Between the pillars", ["z2 E2 G2 E2", "E3 G E2 D2", "F2 z2 E2 D2", "E3 D C4"], ["C,2 G,2 C,2 G,2", "A,,2 E,2 A,,2 E,2", "F,,2 C,2 F,,2 C,2", "G,,2 D,2 C,4"], "1/8"),
    fingering: "RH C4–G4, fingers 1–5. LH C3–G3 uses 5–1; A2–E3, F2–C3 and G2–D3 each use 5–1 after a whole-hand move. Last C3 is finger 1 after G2–D3.",
    steps: ["Count subdivisions aloud. Tap the bass on the numbers while tapping the RH attacks; bar 1 begins with a full beat of RH silence.", "Practice bar 2's dotted figure alone: E on 1, G on the and of 2, E on 3, D on 4.", "Join only one bar, then two. Add the changing LH positions after the combined rhythm feels clear.", "Finish with one continuous attempt. If it is still effortful, repeat this session next time rather than increasing speed."],
    listenFor: ["The bass beat continues through the RH rest.", "The short G does not make the next bass note early."],
    checks: ["I can count and tap the combined rhythm before playing it.", "I can tell whether the RH rest and dotted figure fit the bass pulse."], skillIds: ["coordination", "rests", "dotted-rhythm"],
  }),

  exercise({
    id: "scale-c-five-r", section: "scales", title: "C five-finger pattern: right hand", summary: "A compact way to practice even tone without adding a thumb crossing yet.", minutes: 5, bpm: 56, targetBpm: 80, hands: "R",
    abc: grand("Five fingers in C - RH", ["C D E F", "G F E D", "C2 E2", "D2 C2"], rest(4)),
    fingering: "C4 D4 E4 F4 G4 = RH 1 2 3 4 5. Keep this hand position throughout.",
    steps: ["Find C4 with the thumb and place one finger over each next white key. Let the arm and wrist stay comfortable.", "Play one note per click through bars 1–2; count the half notes in bars 3–4 for two beats each.", "Try one soft pass and one comfortably fuller pass. Aim for every finger to contribute an even sound, not a louder thumb."],
    listenFor: ["No sudden accent on finger 1 or weak, late note on 4.", "The slower final bars keep the same underlying beat."],
    checks: ["I can keep my place without moving the hand to find each key.", "I can hear one finger that needs a gentler or clearer touch."], skillIds: ["five-finger", "even-touch", "pulse"],
  }),
  exercise({
    id: "scale-c-five-l", section: "scales", title: "C five-finger pattern: left hand", summary: "Give the LH the melody and the same attention as the RH.", minutes: 5, bpm: 52, targetBpm: 76, hands: "L",
    abc: grand("Five fingers in C - LH", rest(4), ["C, D, E, F,", "G, F, E, D,", "C,2 E,2", "D,2 C,2"]),
    fingering: "C3 D3 E3 F3 G3 = LH 5 4 3 2 1. The finger numbers decrease as the pitch rises.",
    steps: ["Find C3, one octave below middle C, with finger 5. Place the thumb over G3.", "Say the finger numbers once going up and down; then play with the beat, thinking about sound instead of reciting numbers.", "Play a second pass a little softer. If the thumb makes a bump at the top, isolate F3–G3–F3, then rejoin the phrase."],
    listenFor: ["The top G is part of the line rather than a thump.", "C3 is in the intended octave; this is a bass-clef reading task too."],
    checks: ["I can start from written bass C3 without using the RH to find it.", "The descending finger pattern feels as clear as the ascending one."], skillIds: ["five-finger", "even-touch", "bass-reading"],
  }),
  exercise({
    id: "scale-c-octave-r", section: "scales", title: "C major: right-hand thumb crossing", summary: "One octave, up and back, with a deliberately slow crossing.", minutes: 5, bpm: 48, targetBpm: 76, hands: "R",
    abc: grand("C major one octave - RH", ["C D E F", "G A B c", "B A G F", "E D C2"], rest(4)),
    fingering: "C4→C5 RH 1 2 3 1 2 3 4 5; back to C4: 4 3 2 1 3 2 1. On ascent the thumb reaches F4 after E4; descending finger 3 crosses to E4 after F4.",
    steps: ["Play E4–F4–G4 using 3–1–2 slowly; let the hand travel rather than twisting the wrist.", "Play the written scale in quarter notes, counting four beats per bar. At the top, continue down on the next beat; do not add a pause.", "Reverse the crossing F4–E4–D4 using 1–3–2. Rejoin the whole scale at an easy, even pulse."],
    listenFor: ["The crossing note is no louder or later than its neighbors.", "The direction change at C5 does not add a beat."],
    checks: ["I can name and use the crossing fingering.", "I can play up and back with a continuous pulse at a comfortable tempo."], skillIds: ["major-scale", "thumb-crossing", "pulse"],
  }),
  exercise({
    id: "scale-c-octave-l", section: "scales", title: "C major: left-hand crossing", summary: "The LH crosses in a different place; learn its pattern on its own terms.", minutes: 5, bpm: 48, targetBpm: 76, hands: "L",
    abc: grand("C major one octave - LH", rest(4), ["C, D, E, F,", "G, A, B, C", "B, A, G, F,", "E, D, C,2"]),
    fingering: "C3→C4 LH 5 4 3 2 1 3 2 1; descending B3→C3: 2 3 1 2 3 4 5. Ascending, finger 3 crosses onto A3 after thumb G3.",
    steps: ["Locate G3–A3–B3 with 1–3–2, then reverse B3–A3–G3 with 2–3–1. Keep the movement small and comfortable.", "Play the written scale up and back with one note per beat. C4 at the top is middle C, on a ledger line above bass.", "Listen for the crossing, then try a second pass with eyes mostly on the score instead of each key."],
    listenFor: ["A3 joins smoothly after G3; it is not an accented new phrase.", "The LH keeps the same tone throughout the range."],
    checks: ["I can find the crossing independently of the RH pattern.", "I can arrive at middle C and return without losing the beat."], skillIds: ["major-scale", "thumb-crossing", "ledger-landmarks"],
  }),
  exercise({
    id: "scale-c-octave-both", section: "scales", title: "C major: the hands cross at different times", summary: "Combine one octave in short chunks, an octave apart. This can take several sessions.", minutes: 5, bpm: 44, targetBpm: 68, hands: "both",
    abc: grand("C major together", ["C D E F", "G A B c", "B A G F", "E D C2"], ["C, D, E, F,", "G, A, B, C", "B, A, G, F,", "E, D, C,2"]),
    fingering: "RH up 1 2 3 1 2 3 4 5 from C4; LH up 5 4 3 2 1 3 2 1 from C3. Reverse those sequences coming down. RH crosses E4→F4; LH crosses G3→A3.",
    steps: ["Play each hand once at an easy pulse to recall its crossing. Separate-hand fluency helps, but does not automatically teach the coordination.", "Join C–D–E–F only. Notice the RH thumb crossing while the LH continues 5–4–3–2. Then join G–A–B–C, where the LH crosses.", "Connect the two chunks slowly, then work down the same way. Increase the amount joined before increasing speed."],
    listenFor: ["Each RH note and its LH octave begin together.", "One hand's crossing does not delay or accent the other hand."],
    checks: ["I can join at least one four-note chunk without an extra pause.", "If the complete scale is not ready, I know which chunk to repeat next time."], skillIds: ["major-scale", "thumb-crossing", "coordination"],
  }),

  exercise({
    id: "chord-c", section: "chords", title: "Build a C chord and hear home", summary: "A major triad is a root, third and fifth; C–E–G gives this unit its home sound.", minutes: 4, bpm: 52, targetBpm: 72, hands: "both",
    abc: grand("C is home", ["C E G2", "[CEG]4", "[CEG]2 z2", "[CEG]4"], ["z4", "C,4", "C,2 z2", "C,4"]),
    fingering: "RH C4–E4–G4 = 1–3–5; press 1–3–5 together for the chord. LH finger 5 on C3. Do not stretch between LH C3 and RH C4; each hand owns its position.",
    steps: ["Play C4, E4 and G4 separately in bar 1. Notice the skipped white keys between the chord tones.", "Play the three RH notes together, then add C3 below. Count the full four beats rather than repeating the chord every beat.", "In bar 3, release both hands after two counts and keep two silent beats. End on the whole chord and listen to its settled sound."],
    listenFor: ["Three clear chord tones, with no neighboring key caught accidentally.", "The bass supports the chord instead of covering it."],
    checks: ["I can name root C, third E and fifth G and find them.", "I can hold and release the chord in time without squeezing the hand."], skillIds: ["triads", "chord-reading", "note-lengths"],
  }),
  exercise({
    id: "chord-f-g", section: "chords", title: "C, F and G: leave home and return", summary: "Find three major triads and hear a simple I–IV–V–I cadence.", minutes: 5, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Three doors in C", ["\"C\"[CEG]4", "\"F\"[FAc]4", "\"G\"[GBd]4", "\"C\"[CEG]4"], ["C,4", "F,,4", "G,,4", "C,4"]),
    fingering: "RH root-position triads use 1–3–5: C4–E4–G4, F4–A4–C5, G4–B4–D5. Move the whole hand; do not keep the thumb anchored on C. LH roots C3, F2, G2, C3, using a comfortable finger 5 after each move.",
    steps: ["Locate and name each RH triad without a click. Count root–third–fifth from its own root, not always from C.", "Play just the LH roots in time, then RH chords alone. Prepare the next hand position before restarting a difficult change.", "Play both hands with one chord per four-beat bar. C is I, F is IV, G is V; finish on I and hear the return."],
    listenFor: ["All the notes of a triad arrive as one chord.", "The final C feels more settled than the preceding G."],
    checks: ["I can build F and G without memorizing a keyboard picture.", "I can make one complete change on a barline at an easy pulse."], skillIds: ["triads", "primary-chords", "chord-changes"],
  }),
  exercise({
    id: "chord-inversions", section: "chords", title: "Keep common notes: close chord changes", summary: "An inversion keeps the same chord tones in another order; use it to reduce jumping.", minutes: 5, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Close to home", ["\"C\"[CEG]4", "\"F\"[CFA]4", "\"G\"[B,DG]4", "\"C\"[CEG]4"], ["C,4", "F,,4", "G,,4", "C,4"]),
    fingering: "RH C4–E4–G4 1–3–5; C4–F4–A4 1–3–5; B3–D4–G4 1–2–5; return C4–E4–G4 1–3–5. LH roots C3, F2, G2, C3.",
    steps: ["Say the notes in each RH shape. C–F–A is still F major because it contains F–A–C, even with C at the bottom.", "Compare this close version with the root-position chords. Notice C stays put between C and F; find G with a smaller move.", "Play one chord a bar. Then stop the demo and make the same changes from chord names alone, checking the score afterward."],
    listenFor: ["The harmony changes clearly while the upper notes travel less.", "The low B3 in the G chord is just below middle C, not B4."],
    checks: ["I can explain why C–F–A is an F chord.", "I can read the B3 ledger-region note and land on it accurately."], skillIds: ["triads", "inversions", "ledger-landmarks"],
  }),
  exercise({
    id: "chord-pop-loop", section: "chords", title: "Four chords, one continuous story", summary: "C–G–Am–F (I–V–vi–IV) with close RH shapes over LH roots.", minutes: 5, bpm: 48, targetBpm: 72, hands: "both",
    abc: grand("Four-chord story", ["\"C\"[CEG]4", "\"G\"[B,DG]4", "\"Am\"[CEA]4", "\"F\"[CFA]4"], ["C,4", "G,,4", "A,,4", "F,,4"]),
    fingering: "RH C4–E4–G4 1–3–5; B3–D4–G4 1–2–5; C4–E4–A4 1–2–5; C4–F4–A4 1–3–5. LH roots C3, G2, A2, F2; move the hand between roots.",
    steps: ["Build Am: A–C–E. The score uses C–E–A in the RH, with A in the bass; it is the same minor chord.", "Practice the first two RH shapes, then the last two. Count four beats for each chord and prepare the next change during the hold.", "Play all four, then return to the first C on a new beat 1. With playback stopped, hum a two- or three-note tune over your own loop."],
    listenFor: ["The loop returns to C without adding a pause after F.", "The minor Am brings a different color without changing the pulse."],
    checks: ["I can name the chords and find their bass roots.", "I can loop once at a comfortable tempo without stopping at a change."], skillIds: ["chord-changes", "inversions", "pop-accompaniment"],
  }),
  exercise({
    id: "chord-ballad", section: "chords", title: "Turn held chords into a ballad", summary: "Keep the same harmony while the LH rolls root–fifth–octave–fifth in quarter notes.", minutes: 5, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("A rolling ballad", ["\"C\"[EGc]8", "\"Am\"[CEA]8", "\"F\"[CFA]8", "\"G\"[B,DG]8"], ["C,2 G,2 C2 G,2", "A,,2 E,2 A,2 E,2", "F,,2 C,2 F,2 C,2", "G,,2 D,2 G,2 D,2"], "1/8"),
    fingering: "RH C chord is now E4–G4–C5, fingers 1–2–5, leaving C4 free for the LH. Am is C4–E4–A4 1–2–5; F is C4–F4–A4 1–3–5; G is B3–D4–G4 1–2–5. LH root–fifth–octave–fifth uses 5–2–1–2: C3–G3–C4–G3, A2–E3–A3–E3, F2–C3–F3–C3, G2–D3–G3–D3. Let the forearm travel; do not force a held octave stretch.",
    steps: ["Play only the LH first: one note on each numbered beat. The 5–2–1–2 pattern can move with the hand rather than stretching rigidly.", "Add the RH chord only on beat 1, holding it while the LH moves. Practice a single bar before joining changes.", "Try the four-bar phrase gently. Later, when quarters are easy, this pattern can become eighth notes; that faster version is not required here."],
    listenFor: ["Four evenly spaced LH notes, with no rushed top note.", "The RH chord stays sustained rather than copying the LH rhythm."],
    checks: ["I can play the LH pattern comfortably in one key.", "I can hold a RH chord over one complete LH pattern."], skillIds: ["broken-chords", "pop-accompaniment", "coordination"],
  }),

  exercise({
    id: "music-night-windows", section: "guided", title: "Night windows", summary: "An original eight-bar cinematic miniature: a small melody above spacious whole-note bass.", minutes: 8, bpm: 56, targetBpm: 72, hands: "both",
    abc: grand("Night windows", ["E2 G2", "E2 D2", "F2 E2", "D4", "E2 G2", "E2 C2", "D2 E2", "C4"], ["C,4", "A,,4", "F,,4", "G,,4", "C,4", "A,,4", "G,,4", "C,4"]),
    fingering: "RH C4–G4 = 1–5; start E4 with 3. LH roots C3, A2, F2, G2, C3, A2, G2, C3: use finger 5 and reposition the whole hand between bars.",
    steps: ["Listen once and imagine lights appearing in windows. Count four beats in each bar; the melody mostly changes on 1 and 3.", "Read bars 1–4 RH alone, then locate their LH roots. Join one bar with its bass, then two bars at a time.", "Work bars 5–8 in the same way. The last C4/C3 is a full-bar landing, not the end of the counting.", "Play all eight bars softly, keeping the melody a little clearer than the bass. If needed, repeat just the first four today."],
    listenFor: ["Space between melody attacks, with held notes continuing to sound.", "The last two bars sound like an answer to the opening."],
    checks: ["I can keep the count through a whole-note bar.", "I can hold the bass while the RH changes notes, for at least two connected bars."], skillIds: ["held-bass", "half-note-melody", "pulse"],
  }),
  exercise({
    id: "music-evening-signals", section: "guided", title: "Evening signals", summary: "An alternate original miniature with the same skill goal as Night windows: a half-note melody over whole-note bass.", minutes: 8, bpm: 56, targetBpm: 72, hands: "both",
    abc: grand("Evening signals", ["G2 E2", "D2 E2", "F2 D2", "E4", "G2 E2", "C2 E2", "D2 G2", "C4"], ["C,4", "A,,4", "F,,4", "G,,4", "C,4", "A,,4", "G,,4", "C,4"]),
    fingering: "RH C4–G4 uses 1–5; start G4 with finger 5. LH roots C3, A2, F2, G2, C3, A2, G2, C3: finger 5, moving the whole hand between bars.",
    steps: ["Listen once, counting four quiet beats per bar. This is a different tune for the same coordination task as Night windows.", "Play RH bars 1–4, then LH roots. Combine one bar, then two, letting the bass stay down throughout.", "Learn bars 5–8, then play a gentle eight-bar phrase. Keep the last C sounding while you finish counting four."],
    listenFor: ["The slow melody stays connected above a steady bass.", "No extra beat appears while the LH changes register."],
    checks: ["I can keep the count through a whole-note bar.", "I can hold the bass while the RH changes notes, for at least two connected bars."], skillIds: ["held-bass", "half-note-melody", "pulse"],
  }),
  exercise({
    id: "music-lantern-walk", section: "guided", title: "Lantern walk", summary: "An original, gently moving eight-bar tune with two bass notes per bar.", minutes: 8, bpm: 52, targetBpm: 72, hands: "both",
    abc: grand("Lantern walk", ["C D E G", "G2 E2", "F E D F", "E2 D2", "C E G E", "D F E D", "E G D E", "C4"], ["C,2 G,,2", "C,2 G,,2", "F,,2 C,2", "G,,2 D,2", "C,2 G,,2", "F,,2 C,2", "G,,2 G,,2", "C,4"]),
    fingering: "RH C4–G4 uses 1–5. LH C3/G2 = 1/5; F2/C3 and G2/D3 = 5/1 after shifting position. Last C3 may use 1.",
    steps: ["Listen for the four-bar question and four-bar answer. Name the first RH note C4 and first LH note C3 before playing.", "Practice bars 1–2: LH changes on beats 1 and 3, RH sometimes on every beat. Tap the combined rhythm, then play.", "Learn the remaining two-bar chunks. Pause between attempts to prepare LH positions rather than adding pauses inside the music.", "Make one uninterrupted eight-bar pass at a comfortable tempo, then choose one change to improve."],
    listenFor: ["The LH half notes last through their second beat.", "The last held C feels like a destination, with the pulse still alive."],
    checks: ["I can coordinate the first two bars without extra LH attacks.", "I can name one chord change or rhythm that needs the next repetition."], skillIds: ["half-note-bass", "coordination", "phrase-shape"],
  }),
  exercise({
    id: "music-ode-opening", section: "guided", title: "Ode to Joy: a four-bar conversation", summary: "Beethoven's public-domain opening theme, with an original simple bass accompaniment.", minutes: 8, bpm: 52, targetBpm: 72, hands: "both",
    abc: grand("Ode to Joy - opening", ["E2 E2 F2 G2", "G2 F2 E2 D2", "C2 C2 D2 E2", "E3 D D4"], ["C,8", "G,,8", "C,8", "G,,8"], "1/8"),
    fingering: "RH C4–G4 uses 1–5; begin E4 with finger 3. LH C3 finger 1, G2 finger 5. The last bar RH is E4–D4–D4, fingers 3–2–2, with a fresh attack on each written D.",
    steps: ["First inspect the opening without a demo: repeated notes, then steps up and down. Play RH bars 1–3 with an even quarter-note pulse.", "Bar 4 introduces E on beat 1 held through beat 2, D on the and of 2, then a new D on beat 3 for two counts. Tap and count that bar separately.", "Add the whole-note bass. If the dotted last bar distracts the LH, combine only its first beat, then the full bar.", "Play the opening as one phrase. It ends leaning toward more music on G; add a separate C chord afterward to hear the difference."],
    listenFor: ["Repeated melody notes re-attack cleanly, without making the pulse uneven.", "Bar 4's short D lands between beats, and the next D lands on beat 3."],
    checks: ["I can count the last bar, even if I still play it slowly.", "I can keep a held bass under this familiar melody without relying on memory alone."], skillIds: ["repertoire-reading", "dotted-rhythm", "held-bass"],
    source: { label: "Ludwig van Beethoven, Symphony No. 9, Ode to Joy theme (1824), public domain; original Woodshed accompaniment" },
  }),
  exercise({
    id: "music-after-rain", section: "guided", title: "After the rain", summary: "An original eight-bar pop/cinematic study with a quiet broken-chord bass and a small melody.", minutes: 8, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("After the rain", ["E2 G2 E D C2", "E4 D2 C2", "F2 E2 D2 F2", "E4 D4", "E2 G2 E D C2", "E2 C2 D2 E2", "F2 E2 D2 B,2", "C8"], ["C,2 E,2 G,2 E,2", "A,,2 C,2 E,2 C,2", "F,,2 A,,2 C,2 A,,2", "G,,2 B,,2 D,2 B,,2", "C,2 E,2 G,2 E,2", "A,,2 C,2 E,2 C,2", "G,,2 B,,2 D,2 B,,2", "C,8"], "1/8"),
    fingering: "RH starts E4 with 3 in C4–G4 position; in bar 7, shift down so B3 can use 1, then C4 uses 2. LH broken C/Am/F/G triads use 5–3–1–3, moving the whole hand to each new root (C3, A2, F2, G2).",
    steps: ["Listen for the LH's steady quarters and the RH's occasional eighth pair. Count 1 and 2 and 3 and 4 and when the smaller notes appear.", "Practice the LH alone in two-bar chunks, then hold the RH notes over it. Combine only the first bar before adding bar 2.", "Bars 5–8 vary the tune; inspect the B3 below middle C in bar 7 before playing. Do not force C-position fingering onto the lower note.", "Play a quiet four-bar section or the whole study. Let the melody remain audible above the moving bass."],
    listenFor: ["The LH keeps four equal beats even when the RH has two notes in one beat.", "The final B3–C4 rise is in the low treble register, with a calm landing."],
    checks: ["I can sustain a RH note while the LH plays several different notes.", "I can read B3 and prepare its small hand shift without stopping the pulse."], skillIds: ["broken-chords", "coordination", "ledger-landmarks"],
  }),
  exercise({
    id: "music-dawn-drive", section: "guided", title: "Dawn drive", summary: "An original eight-bar closing study: a steady bass, melodic rests and a dotted answer.", minutes: 8, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Dawn drive", ["z2 E2 G2 E2", "E3 G E2 D2", "F2 E2 D2 F2", "E4 D4", "z2 E2 G2 E2", "E3 D C2 E2", "D2 F2 E2 D2", "C8"], ["C,2 G,2 C,2 G,2", "A,,2 E,2 A,,2 E,2", "F,,2 C,2 F,,2 C,2", "G,,2 D,2 G,,2 D,2", "C,2 G,2 C,2 G,2", "A,,2 E,2 A,,2 E,2", "G,,2 D,2 G,,2 D,2", "C,8"], "1/8"),
    fingering: "RH C4–G4 uses 1–5; first E4 is 3. LH roots/fifths use 5–1: C3/G3, A2/E3, F2/C3, G2/D3. Reposition between chord spans, with a relaxed hand.",
    steps: ["Listen once, then tap the RH rhythm while keeping the bass pulse with the other hand. The melody waits for beat 2 in bars 1 and 5.", "Practice bars 1–2, especially G on the and of 2 in bar 2. Join a beat, then a bar, then the pair.", "Learn bars 3–4, then compare the changed ending in bars 5–8. The left-hand pulse remains the same underneath.", "Make one comfortable four-bar performance, then decide whether eight bars are ready. This study can continue into another week."],
    listenFor: ["Silence at the opening is intentional; the bass establishes time first.", "The dotted figure fits the beat without turning into a swing rhythm."],
    checks: ["I can count the rests and dotted figure over a steady LH.", "I can choose one specific next goal for another session, whether or not the whole study is ready."], skillIds: ["coordination", "rests", "dotted-rhythm", "phrase-shape"],
  }),

  exercise({
    id: "create-question-answer", section: "guided", title: "Write the answer to a tiny question", summary: "Play the two-bar question, then invent a two-bar answer on C, D, E and G.", minutes: 4, bpm: 52, targetBpm: 68, hands: "R",
    abc: grand("A question with room to answer", ["C D E2", "G2 E2", "z4", "z4"], rest(4)),
    fingering: "RH C4 D4 E4 G4 = 1 2 3 5. Keep the C-position hand. Bars 3–4 are intentionally blank for your response.",
    steps: ["Listen to the two-bar question and count through the two silent answer bars.", "Stop playback and play the question yourself. Answer with only C4, D4, E4 or G4, using quarter and half notes; aim to finish on C4.", "Keep counting even if the answer is simple. Make a second answer with fewer notes and more space."],
    listenFor: ["The answer lasts exactly two bars, including its held last note.", "A final C sounds settled after the question's E."],
    checks: ["I made an intentional answer rather than hunting without a pulse.", "I can repeat one answer I liked, or name a change I want to try."], skillIds: ["creative-application", "pulse", "phrase-shape"],
  }),
  exercise({
    id: "create-bass-story", section: "guided", title: "A melody above your own four chords", summary: "Use a deliberately small melody while the LH supplies C–Am–F–G roots.", minutes: 4, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("Your four-bar story", ["E4", "E4", "F4", "D4"], ["\"C\"C,4", "\"Am\"A,,4", "\"F\"F,,4", "\"G\"G,,4"]),
    fingering: "The written seed uses RH E4 finger 3, F4 finger 4 and D4 finger 2 in C position. LH roots C3, A2, F2, G2 can use 5 with whole-hand moves.",
    steps: ["Play the written seed: one RH note and one bass root per bar. It is a starting idea, not a melody to memorize forever.", "With playback stopped, repeat the bass roots and give the RH only E4 and G4 for the first two bars, F4/E4 for bar 3, and D4 for bar 4.", "Change just one rhythm, then play the loop again. Keep the LH simple enough that you can hear what you are making."],
    listenFor: ["A changing harmony can make very few melody notes expressive.", "The beat continues through a long melody note or a deliberate gap."],
    checks: ["I can keep four complete bars while making a small RH choice.", "I can say which variation I preferred and why."], skillIds: ["creative-application", "pop-accompaniment", "held-bass"],
  }),
  exercise({
    id: "create-new-ending", section: "guided", title: "Give your music its own ending", summary: "Alter the last two bars of a study while keeping its pulse and four-bar shape.", minutes: 4, bpm: 48, targetBpm: 68, hands: "both",
    abc: grand("An ending to change", ["E2 G2", "F2 E2", "D2 B,2", "C4"], ["C,4", "F,,4", "G,,4", "C,4"]),
    fingering: "RH starts E4 with 3, G4 with 5, F4 with 4, E4 with 3; shift down for D4 with 3 and B3 with 1, then C4 with 2. LH roots C3, F2, G2, C3.",
    steps: ["Play the written four-bar seed and hear its G-to-C bass ending.", "Keep bars 1–2, then make a different two-bar ending. Use only B3, C4, D4 and E4, and settle on C4 while the LH reaches C3.", "Try one ending that is busier, then one with more silence. Count the full four beats of the final bar and choose your favorite."],
    listenFor: ["B3 tends to lean up toward C4; compare that with D4–C4.", "An ending can feel complete without getting louder or faster."],
    checks: ["My ending still occupies the written two bars.", "I can repeat or describe my chosen version so I can return to it."], skillIds: ["creative-application", "phrase-shape", "ledger-landmarks"],
  }),
];

// Block durations are practice allocations, not the length of a single playback.
// Every session totals 20 minutes; replay/repair within each allocation is expected.
const C_SESSIONS = [
  { id: "c1-d1-a", day: 1, slot: "A", title: "A steady start", focus: "Keep the count through long notes; locate C landmarks; let one hand hold while the other moves.", blocks: [{ exerciseId: "rhythm-long-short", minutes: 3 }, { exerciseId: "read-family-c", minutes: 3 }, { exerciseId: "coord-held-bass", minutes: 8 }, { exerciseId: "scale-c-five-r", minutes: 6 }] },
  { id: "c1-d1-b", day: 1, slot: "B", title: "Make space sound musical", focus: "Build a C triad, learn a short original study, and write a small answer.", blocks: [{ exerciseId: "chord-c", minutes: 4 }, { exerciseId: "music-night-windows", minutes: 8 }, { exerciseId: "create-question-answer", minutes: 5 }, { exerciseId: "read-family-c", minutes: 3 }] },
  { id: "c1-d2-a", day: 2, slot: "A", title: "Inside the beat", focus: "Subdivide eighth notes, read above bass, and change LH notes on beats 1 and 3.", blocks: [{ exerciseId: "rhythm-eighths", minutes: 4 }, { exerciseId: "read-bass-neighbors", minutes: 4 }, { exerciseId: "coord-half-bass", minutes: 7 }, { exerciseId: "scale-c-five-l", minutes: 5 }] },
  { id: "c1-d2-b", day: 2, slot: "B", title: "A tune that walks", focus: "Find C/F/G triads, coordinate a moving tune, and make your own melody over bass roots.", blocks: [{ exerciseId: "chord-f-g", minutes: 5 }, { exerciseId: "music-lantern-walk", minutes: 8 }, { exerciseId: "create-bass-story", minutes: 4 }, { exerciseId: "rhythm-eighths", minutes: 3 }] },
  { id: "c1-d3-a", day: 3, slot: "A", title: "Keep time through silence", focus: "Count rests, read below treble, and maintain two RH notes for one LH beat.", blocks: [{ exerciseId: "rhythm-rests", minutes: 4 }, { exerciseId: "read-treble-neighbors", minutes: 4 }, { exerciseId: "coord-two-to-one", minutes: 7 }, { exerciseId: "scale-c-octave-r", minutes: 5 }] },
  { id: "c1-d3-b", day: 3, slot: "B", title: "Familiar tune, closer chords", focus: "Read chord inversions, study the opening of Ode to Joy, and create a different answer.", blocks: [{ exerciseId: "chord-inversions", minutes: 5 }, { exerciseId: "music-ode-opening", minutes: 8 }, { exerciseId: "create-question-answer", minutes: 4 }, { exerciseId: "rhythm-rests", minutes: 3 }] },
  { id: "c1-d4-a", day: 4, slot: "A", title: "Hold one layer, move the other", focus: "Count ties, read the same register in both clefs, and put a slow melody over broken chords.", blocks: [{ exerciseId: "rhythm-ties", minutes: 4 }, { exerciseId: "read-ledger-transfer", minutes: 4 }, { exerciseId: "coord-broken-chords", minutes: 7 }, { exerciseId: "scale-c-octave-l", minutes: 5 }] },
  { id: "c1-d4-b", day: 4, slot: "B", title: "A small pop soundtrack", focus: "Keep a four-chord loop moving; learn a melodic study over broken chords; vary your own idea.", blocks: [{ exerciseId: "chord-pop-loop", minutes: 5 }, { exerciseId: "music-after-rain", minutes: 8 }, { exerciseId: "create-bass-story", minutes: 4 }, { exerciseId: "rhythm-ties", minutes: 3 }] },
  { id: "c1-d5-a", day: 5, slot: "A", title: "The hands take different paths", focus: "Understand dotted quarters, revisit ledger notes in context, and join short two-hand scale chunks.", blocks: [{ exerciseId: "rhythm-dotted", minutes: 4 }, { exerciseId: "read-ledger-transfer", minutes: 4 }, { exerciseId: "coord-offbeat-melody", minutes: 7 }, { exerciseId: "scale-c-octave-both", minutes: 5 }] },
  { id: "c1-d5-b", day: 5, slot: "B", title: "Make a piece your own", focus: "Build a rolling accompaniment, perform a short section, invent an ending, and try a fresh reading.", blocks: [{ exerciseId: "chord-ballad", minutes: 5 }, { exerciseId: "music-dawn-drive", minutes: 8 }, { exerciseId: "create-new-ending", minutes: 4 }, { exerciseId: "read-new-phrase", minutes: 3 }] },
].map((session) => ({ ...session, unitId: COURSE.id }));

export const PLACEMENT = ["place-pulse", "place-reading", "place-coordination"];

const C_CATALOGUE = [
  ...C_EXERCISES.filter((e) => e.section === "chords" || e.section === "scales").map((e) => ({ id: `catalogue-${e.id}`, title: e.title, description: e.summary, exerciseId: e.id, kind: "built-in", skills: [...e.skillIds] })),
  { id: "catalogue-night-windows", title: "Night windows", description: "A spacious original study: half-note melody, whole-note bass, C five-finger range.", exerciseId: "music-night-windows", kind: "built-in", skills: ["held-bass", "half-note-melody", "pulse"] },
  { id: "catalogue-evening-signals", title: "Evening signals — an alternate first study", description: "A different tune with the same range, rhythm, bass and practice goal as Night windows. Use it in place of that block when you want a change of scene.", exerciseId: "music-evening-signals", substitutesFor: ["music-night-windows"], kind: "built-in", skills: ["held-bass", "half-note-melody", "pulse"] },
  { id: "catalogue-ode-opening", title: "Ode to Joy: opening", description: "A four-bar public-domain melody with an original held-bass accompaniment; includes a dotted-quarter figure.", exerciseId: "music-ode-opening", kind: "built-in", skills: ["repertoire-reading", "dotted-rhythm", "held-bass"] },
  { id: "catalogue-rhythm-reference", title: "Hear and speak rhythm: Takadimi", description: "Optional guidance from the system's authors on hearing, speaking and moving to a beat. Woodshed's lessons use metric counting; a syllable system is an optional aid.", url: "https://www.takadimi.net/teachingWithTakadimi.html", kind: "external", skills: ["pulse", "eighth-subdivision"] },
  { id: "catalogue-ledger-reference", title: "Ledger notes and a family of Cs", description: "Optional Faber teacher guidance on C landmarks and expanded reading. This is reference material, not a required book purchase or a replacement for your chosen method.", url: "https://pianoadventures.com/piano-books/accelerated-piano-adventures/level-2/accelerated-2-qa/", kind: "external", skills: ["ledger-landmarks", "staff-reading"] },
];

export const UNITS = [COURSE, G_MAJOR, F_MAJOR, A_MINOR, D_MAJOR, A_MAJOR, E_MAJOR, MUSICIANSHIP];
export const EXERCISES = [...integrateMusicExercises([...C_EXERCISES, ...G_EXERCISES, ...F_EXERCISES, ...A_EXERCISES, ...D_EXERCISES, ...AM_EXERCISES, ...E_EXERCISES, ...M_EXERCISES]), ...INTEGRATED_EXERCISES, ...SCALE_EXERCISES];
// The guided course is still eight units and eighty visits. Revised visits
// have their own identity so old completion never claims a different task.
export const LEGACY_SESSIONS = [...C_SESSIONS, ...G_SESSIONS, ...F_SESSIONS, ...A_SESSIONS, ...D_SESSIONS, ...AM_SESSIONS, ...E_SESSIONS, ...M_SESSIONS];
export const SESSIONS = integrateMusicSessions(LEGACY_SESSIONS, EXERCISES);
export const ALL_SESSIONS = [...new Map([...ARCHIVED_SESSIONS, ...LEGACY_SESSIONS, ...SESSIONS].map((session) => [session.id, session])).values()];
export const HISTORY_EXERCISES = [...EXERCISES, ...ARCHIVED_EXERCISES];
export const CATALOGUE = [
  ...C_CATALOGUE.map((entry) => entry.kind === "external" ? entry : { ...entry, unitId: COURSE.id }),
  ...G_CATALOGUE,
  ...F_CATALOGUE,
  ...A_CATALOGUE,
  ...D_CATALOGUE,
  ...AM_CATALOGUE,
  ...E_CATALOGUE,
  ...M_CATALOGUE,
  ...INTEGRATED_EXERCISES.map((exercise) => ({ id: `catalogue-${exercise.id}`, unitId: exercise.unitId, title: exercise.title, description: exercise.summary, exerciseId: exercise.id, kind: "built-in", skills: [...exercise.skillIds] })),
  ...SCALE_EXERCISES.map((exercise) => ({ id: `catalogue-${exercise.id}`, unitId: exercise.unitId, title: exercise.title, description: exercise.summary, exerciseId: exercise.id, kind: "built-in", skills: [...exercise.skillIds] })),
  ...EXTERNAL_MUSIC,
];

export const sessionsForUnit = (unitId, progress) => resolveSessionVersions(progress,
  SESSIONS.filter((session) => session.unitId === unitId),
  LEGACY_SESSIONS.filter((session) => session.unitId === unitId),
  { hasDraft: findPracticeDraftForSession });
