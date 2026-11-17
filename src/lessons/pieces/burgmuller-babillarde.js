// Burgmüller, "La Babillarde", Op. 100 No. 17, from the Mutopia edition of the Collection Litolff print (public
// domain). The edition is in 3/8; here each pair of its bars is one 3/4 bar, so the 34 bars played are 17. Both
// repeats are dropped and the second half goes straight to its second ending. The edition's two right-hand voices
// in bars 1–3 are folded into one, with the held notes tied.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Babillarde
C:Friedrich Burgmüller
M:3/4
L:1/16
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] [EG]6- [EG]2 [E-G]2 [EB]2 | [FA]6- [FA]2 [F-A]2 [Fd]2 | [E-c-]6 [E-c]2 [EB]2 G2 |
[V:2] z2 .C,,2 .C,2 C4 z2 | z2 .C,,2 C,2 C4 z2 | z2 .C,,2 .C,2 C4 z2 |
[V:1] z2 ccca .g2 cccg | .f2 AAAd cE^DEdc | z2 ccca .g2 GGGe | .d2 GGGd c2 =Bcdc |
[V:2] [F,A,C]2 z2 [F,A,C]2 [E,B,C]2 z2 [E,B,C]2 | [F,A,C]2 z2 [F,A,C]2 [G,B,C]6 | [F,A,C]2 z2 [F,A,C]2 [G,CE]2 z2 [G,CE]2 | [G,=B,F]2 z2 [G,=B,F]2 [CE]2 z4 |
[V:1] [EG]4 [FA]2 [GB]4 [EG]2 | [Bd]4 [Ac]2 [Bd]4 [Ac]2 | [GB]4 [GB]2 [FA]4 [FA]2 | [EG]2 G^FGA BAB=Bdc |
[V:2] C,CCCCC C,CCCCC | C,CCCCC C,CCCCC | E,C=B,CE,C F,C=B,CF,C | C,2 z4 z6 |
[V:1] z2 ccca .g2 cccg | .f2 AAAd cE^DEdc | z2 ccca .g2 GGGd | .E2 EEEc F2 AAAc |
[V:2] [F,A,C]2 z2 [F,A,C]2 [E,B,C]2 z2 [E,B,C]2 | [F,A,C]2 z2 [F,A,C]2 [G,B,C]6 | [F,A,C]2 z2 [F,A,C]2 [F,=B,D]2 z2 [F,=B,D]2 | [F,B,C]2 z2 [F,B,C]2 [F,A,C]6 |
[V:1] .f2 cccf .a2 fffa | .c'2 aaac' f'4 z2 |]
[V:2] [F,A,C]6 [F,A,C]6 | [F,A,C]6 F,,4 z2 |]`;

export default {
  summary: "Burgmüller's \"La Babillarde\" (The Chatterbox), No. 17 of his 25 easy studies, Op. 100, in F major. The edition is in 3/8; here each pair of its bars makes one 3/4 bar, so the 34 bars played become 17, with the notes and their timing unchanged. Five sections: Intro (bars 1–3), A (4–7), B (8–11), A again (12–15) and Coda (16–17). The original repeats A, and B with A again, with two endings; here each is played once, going straight to the second ending.",
  steps: [
    "Right hand alone in A, in wait mode. The chatter is three quick repeated sixteenths, the same note, then a leap: in bar 4, C–C–C up to the high A, then a short G and C–C–C up to G. Change fingers on the repeated notes, 3–2–1, as the edition marks, and keep them light.",
    "Left hand alone. In A it mostly plays chords on the first and third eighths of each half bar, often F–A–C. In B (bars 8–11) it plays sixteenths, a low C then the C above five times, and in bar 10 a pattern with B natural.",
    "Right hand alone in B: two-note chords, a quarter then an eighth, then a run of sixteenths in bar 11, G–F sharp–G–A, B flat–A–B flat–B natural–D–C. Then hands together, a section at a time.",
    "Play-along with the click at 96. Each clean pass nudges the tempo up toward 162.",
  ],
  watch: [
    "In the Intro the right hand holds one note while the other moves: in bar 1 the E stays down under G and B flat, in bar 2 the F under A and D, and in bar 3 the E under C and B flat.",
    "Each 3/4 bar here is two of the edition's 3/8 bars. Feel a light accent on beat 1 and halfway through beat 2, where the printed bar lines fall.",
    "In the Coda (bars 16–17) the repeated notes climb the F major chord, on C, then F, then A, to the high F at the end, over the left hand's F major chord struck every half bar.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Babillarde, Op. 100 No. 17 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=229" },
  score: {
    bpm: 96, target: 162,
    sections: [{ name: "Intro", from: 1, to: 3 }, { name: "A", from: 4, to: 7 }, { name: "B", from: 8, to: 11 }, { name: "A again", from: 12, to: 15 }, { name: "Coda", from: 16, to: 17 }],
    abc: ABC,
  },
};
