// Chopin, Prelude in E minor, Op. 28 No. 4, from the Mutopia edition of the Peters print of 1879 (public
// domain), 25 bars. The edition is in cut time (2/2); here it is 4/4 with the same bars and note values. The
// quarter-note pickup is padded into a full first bar, so bar numbers run one ahead of the printed ones. In the
// last two bars the edition writes the right hand's chords on the lower staff, joined to its melody; here they
// are the right hand's, in the bass clef.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Prelude in E minor, Op. 28 No. 4
C:Frédéric Chopin
M:4/4
L:1/16
K:Em
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z12 B,3B | B12 c4 | B12 c4 | B12 c4 |
[V:2] z16 | [G,B,E]2[G,B,E]2[G,B,E]2[G,B,E]2 [G,B,E]2[G,B,E]2[G,B,E]2[G,B,E]2 | [F,A,E]2[F,A,E]2[F,A,E]2[F,A,E]2 [F,A,^D]2[F,A,^D]2[F,A,^D]2[F,A,^D]2 | [=F,A,^D]2[=F,A,^D]2[=F,A,^D]2[=F,A,^D]2 [=F,A,=D]2[=F,A,=D]2[=F,^G,=D]2[=F,^G,=D]2 |
[V:1] B12 _B4 | A12 =B4 | A12 B4 | A12 B3A |
[V:2] [E,^G,D]2[E,^G,D]2[E,^G,D]2[E,^G,D]2 [E,=G,D]2[E,=G,D]2[E,=G,^C]2[E,=G,^C]2 | [E,G,C]2[E,G,C]2[E,G,C]2[E,G,C]2 [E,F,C]2[E,F,C]2[E,F,C]2[E,F,C]2 | [E,F,C]2[E,F,C]2[E,F,C]2[E,F,C]2 [^D,F,C]2[^D,F,C]2[^D,F,C]2[^D,F,C]2 | [D,F,C]2[D,F,C]2[D,F,C]2[D,F,C]2 [D,F,C]2[D,F,C]2[D,F,C]2[D,F,C]2 |
[V:1] A12 !accent!^G4- | ^G4 A2B2 d2c2 E2A2 | F12 A4 | F12 {B}A4 |
[V:2] [D,=F,C]2[D,=F,C]2[D,=F,C]2[D,=F,C]2 [D,=F,B,]2[D,=F,B,]2[D,=F,B,]2[D,=F,B,]2 | [C,E,B,]2[C,E,B,]2[C,E,A,]2[C,E,A,]2 [C,E,A,]2[C,E,A,]2[C,E,A,]2[C,E,A,]2 | [B,,E,A,]2[B,,E,A,]2[B,,^D,A,]2[B,,^D,A,]2 [C,E,A,]2[C,E,A,]2[C,E,A,]2[C,E,A,]2 | [B,,^D,A,]2[B,,^D,A,]2[B,,^D,A,]2[B,,^D,A,]2 [C,E,A,]2[C,E,A,]2[C,E,A,]2[C,E,A,]2 |
[V:1] =G2F2 C2B,2 ^D2F2 (3d2c2B2 | B12 c4 | B12 c4 | B12 c4 |
[V:2] [B,,^D,A,]4 z4 z8 | [G,B,E]2[G,B,E]2[G,B,E]2[G,B,E]2 [G,B,E]2[G,B,E]2[G,B,E]2[G,B,E]2 | [F,A,E]2[F,A,E]2[F,A,E]2[F,A,E]2 [=F,A,^D]2[=F,A,^D]2[=F,A,^D]2[=F,A,^D]2 | [=F,^G,^D]2[=F,^G,^D]2[=F,^G,=D]2[=F,^G,=D]2 [E,^G,=D]2[E,^G,=D]2[E,^G,=D]2[E,^G,=D]2 |
[V:1] B3^A ^A4 !turn!^^g4 f3e | e2^d2 c'2^d2 ^d2e2 g2B2 | =d2c2 (3e2E2A2 F6A2 | F12 {B}A4 |
[V:2] [E,G,D]2[E,G,D]2[E,G,^C]2[E,G,^C]2 [^C,E,^A,]2[^C,E,^A,]2[=C,E,=A,]2[=C,E,=A,]2 | [B,,,B,,]2[A,CFA]2[A,CFA]2[A,CFA]2 [G,B,^DF]2[G,B,E]2[G,B,E]2[G,B,E]2 | [A,CE]2[A,CE]2 A,,2[E,F,C]2 [B,,E,B,]2[B,,E,B,]2[C,E,A,]2[C,E,A,]2 | [B,,E,B,]2[B,,E,B,]2[B,,E,B,]2[B,,E,B,]2 [C,E,A,]2[C,E,A,]2[C,E,A,]2[C,E,A,]2 |
[V:1] F12- F3E | E12 F4 | E12 F4 | E8 !fermata!z8 |
[V:2] [B,,E,B,]2[B,,E,B,]2[B,,E,B,]2[B,,E,B,]2 [B,,^D,B,]2[B,,^D,B,]2[B,,^D,A,]2[B,,^D,A,]2 | [C,G,]2[C,G,]2[C,G,]2[C,G,]2 [C,_B,]2[C,_B,]2[C,E,A,]2[C,E,A,]2 | [B,,E,A,]2[B,,E,A,]2[B,,E,^G,]2[B,,E,^G,]2 [B,,E,=G,]2[B,,E,=G,]2[B,,E,=G,]2[B,,E,=G,]2 | [_B,,C,G,]8 !fermata!z8 |
[V:1 clef=bass] [E,F,B,E]8 [^D,F,B,^D]8 | !fermata![E,G,B,E]16 |]
[V:2] [B,,,B,,]8 [B,,,F,,B,,]8 | !fermata![E,,,E,,]16 |]`;

export default {
  summary: "Chopin's Prelude in E minor, Op. 28 No. 4, all 25 bars, slow (Largo). The edition is in cut time; here it is 4/4 with the same bars and note values. A right-hand melody of mostly two notes a bar sings over left-hand chords in repeated eighths that slide down one note at a time. Three sections: A (bars 1–13), A′ (14–21, rising to the climax in bars 18–19) and Ending (22–26). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Left hand alone in A, in wait mode. Bars 2–12 are eighth-note chords of three notes, and from one chord to the next usually one note moves, most often down a half step. Keep the fingers on the keys that stay and move only the one that changes. The edition marks the pedal in most bars, changing with the chords.",
    "Right hand alone. Most bars are a note held for three beats, then a quarter note: B and C in bars 2–4 and 14–16, A and B in bars 6–7, F sharp and A in bars 11–12 and 20. Count all three beats. Bars 10, 13, 18 and 19 move in eighths, with a triplet at the end of bar 13 and on beat 2 of bar 19.",
    "Hands together by section. In A′ the left hand drops to a low B octave in bar 18 and a low A in bar 19 while the right hand climbs to the high C. In the Ending, hold the rest with the fermata in bar 24 before the last three chords.",
    "Play-along with the click at 34. Each clean pass nudges the tempo up toward 56.",
  ],
  watch: [
    "The left hand's chords are full of accidentals: D sharp and G sharp come and go, and F natural replaces F sharp in bars 4, 9, 15 and 16. Read each chord as the one before with one note changed.",
    "Bars 12 and 20 have a quick grace-note B before the A on beat 4, and bar 17 has a turn on the G double sharp (the A key). Both are shown, but only the main notes are graded.",
    "In bars 25–26 the right hand plays chords under its last melody notes, E, then D sharp, then E, while the left hand has low octaves on B and then E. The edition writes those chords on the lower staff; here they are in the right hand's part, in the bass clef.",
  ],
  source: { label: "Mutopia Project — Chopin, Prelude in E minor, Op. 28 No. 4 (Peters, 1879)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=468" },
  score: {
    bpm: 34, target: 56,
    sections: [{ name: "A", from: 1, to: 13 }, { name: "A′", from: 14, to: 21 }, { name: "Ending", from: 22, to: 26 }],
    abc: ABC,
  },
};
