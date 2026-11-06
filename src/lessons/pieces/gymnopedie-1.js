// Satie, Gymnopédie No. 1 (1888), from the Mutopia edition of the Dover reprint (public domain). Satie
// printed the music twice over with two different endings; the edition folds that into a repeat, and this
// writes it back out, 78 bars. The left hand's chords sit in the treble staff, then move to the bass staff
// for bars 19–31 and 58–70, as in the edition.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Gymnopédie No. 1
C:Erik Satie
M:3/4
L:1/4
K:Bm
%%staves {(1 2) (4 3)}
V:1 clef=treble
V:2 clef=treble
V:3 clef=bass
V:4 clef=bass
[V:1] z3 | z3 | z3 | z3 |
[V:2] z [B,DF]2 | z [A,CF]2 | z [B,DF]2 | z [A,CF]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] x f a | g f c | B c d | A3 |
[V:2] z [B,DF]2 | z [A,CF]2 | z [B,DF]2 | z [A,CF]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] F3- | F3- | F3- | F3 |
[V:2] z [B,DF]2 | z [A,CF]2 | z [B,DF]2 | z [A,CF]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] x f a | g f c | B c d | A3 |
[V:2] z [B,DF]2 | z [A,CF]2 | z [B,DF]2 | z [A,CF]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] c3 | f3 | E3- | E3- |
[V:2] z [A,CF]2 | z [B,DF]2 | x3 | x3 |
[V:3] F,,3 | B,,,3 | E,,3 | E,,3 |
[V:4] x3 | x3 | z [G,B,]2 | z [B,DG]2 |
[V:1] E3 | A B =c | e d B | d =c B |
[V:2] x3 | x3 | x3 | x3 |
[V:3] D,,3 | A,,,3 | D,,3 | D,,3 |
[V:4] z [=F,A,D]2 | z [A,=CE]2 | z [G,B,E]2 | z [D,G,B,E]2 |
[V:1] d3- | d2 d | e =f g | a =c d |
[V:2] x3 | x3 | x3 | x3 |
[V:3] D,,3 | D,,3 | D,,3 | D,,3 |
[V:4] z [=C,E,A,D]2 | z [=C,F,A,D]2 | z [A,=C=F]2 | z [A,=CE]2 |
[V:1] e d B | d3- | d2 d | g3 |
[V:2] x3 | x3 | x3 | z [B,EG]2 |
[V:3] D,,3 | D,,3 | D,,3 | E,,3 |
[V:4] z [D,G,B,E]2 | z [=C,E,A,D]2 | z [=C,F,A,D]2 | x3 |
[V:1] f3 | B A B | c d e | c d e |
[V:2] z [A,CF]2 | z [B,DF]2 | z [CEA]2 | z [A,CFA]2 |
[V:3] F,,3 | B,,,3 | E,,3 | E,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] F3 | [=CEA=c]3 | [DFAd]3 | z3 |
[V:2] z [A,D] [B,DG] | x3 | x3 | z [B,DF]2 |
[V:3] E,,3 | [A,,G,]3 | [D,,A,,D,]3 | G,,3 |
[V:4] x B,, E, | x3 | x3 | x3 |
[V:1] z3 | z3 | z3 | x f a |
[V:2] z [A,CF]2 | z [B,DF]2 | z [A,CF]2 | z [B,DF]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] g f c | B c d | A3 | F3- |
[V:2] z [A,CF]2 | z [B,DF]2 | z [A,CF]2 | z [B,DF]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] F3- | F3- | F3 | x f a |
[V:2] z [A,CF]2 | z [B,DF]2 | z [A,CF]2 | z [B,DF]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] g f c | B c d | A3 | c3 |
[V:2] z [A,CF]2 | z [B,DF]2 | z [A,CF]2 | z [A,CF]2 |
[V:3] D,,3 | G,,3 | D,,3 | F,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] f3 | E3- | E3- | E3 |
[V:2] z [B,DF]2 | x3 | x3 | x3 |
[V:3] B,,,3 | E,,3 | E,,3 | D,,3 |
[V:4] x3 | z [G,B,]2 | z [B,DG]2 | z [=F,A,D]2 |
[V:1] A B =c | e d B | d =c B | d3- |
[V:2] x3 | x3 | x3 | x3 |
[V:3] A,,,3 | D,,3 | D,,3 | D,,3 |
[V:4] z [A,=CE]2 | z [G,B,E]2 | z [D,G,B,E]2 | z [=C,E,A,D]2 |
[V:1] d2 d | e =f g | a =c d | e d B |
[V:2] x3 | x3 | x3 | x3 |
[V:3] D,,3 | D,,3 | D,,3 | D,,3 |
[V:4] z [=C,F,A,D]2 | z [A,=C=F]2 | z [A,=CE]2 | z [D,G,B,E]2 |
[V:1] d3- | d2 d | g3 | =f3 |
[V:2] x3 | x3 | z [B,EG]2 | z [A,D=FA]2 |
[V:3] D,,3 | D,,3 | E,,3 | E,,3 |
[V:4] z [=C,E,A,D]2 | z [=C,F,A,D]2 | x3 | x3 |
[V:1] B =c =f | e d =c | e d =c | =F3 |
[V:2] z [A,=C=F]2 | z [=CEA]2 | z [A,=C=FA]2 | z [A,D] [B,DG] |
[V:3] E,,3 | E,,3 | E,,3 | E,,3 |
[V:4] x3 | x3 | x3 | x B,, E, |
[V:1] [=CEA=c]3 | [D=FAd]3 |]
[V:2] x3 | x3 |]
[V:3] [A,,G,]3 | [D,,A,,D,]3 |]
[V:4] x3 | x3 |]`;

export default {
  summary: "Satie's first Gymnopédie (1888), all 78 bars, written out as Satie printed it: the music runs twice, with a different ending each time. Slow and even in 3/4: the left hand plays a low bass note on beat 1 and a chord on beats 2 and 3, under a long right-hand line. Seven sections: Intro (bars 1–4), A (5–12), A′ (13–21), B (22–31), Ending 1 (32–39), Again (40–70, the same as 1–31) and Ending 2 (71–78).",
  steps: [
    "Left hand alone in the Intro, in wait mode. Bass note, then up to the chord. Find the chord before you leave the bass.",
    "Right hand alone through A and A′. Count all three beats of every long note, and hold the tied F sharp through four bars.",
    "Hands together a section at a time. From bar 19 the chords move down into the bass staff; they're still the left hand's.",
    "Play-along with the click at 56. Each clean pass nudges the tempo up toward 72.",
  ],
  watch: [
    "C and F naturals are written in against the two sharps of the key, in bars 21–31 (and 60–70) and in Ending 2.",
    "Ending 2 isn't Ending 1: it closes on D minor, with F natural.",
    "In bars 37 and 76 the left hand adds an inner voice, B then E, over the held low E.",
  ],
  source: { label: "Mutopia Project — Satie, Gymnopédie No. 1 (Dover edition)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37" },
  score: {
    bpm: 56, target: 72,
    sections: [{ name: "Intro", from: 1, to: 4 }, { name: "A", from: 5, to: 12 }, { name: "A′", from: 13, to: 21 }, { name: "B", from: 22, to: 31 }, { name: "Ending 1", from: 32, to: 39 }, { name: "Again", from: 40, to: 70 }, { name: "Ending 2", from: 71, to: 78 }],
    abc: ABC,
  },
};
