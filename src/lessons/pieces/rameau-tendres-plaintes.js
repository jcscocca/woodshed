// Rameau, Les Tendres Plaintes from the Pièces de clavecin (1724), from the Mutopia edition of the Durand 1895
// print (public domain), 80 bars. A rondeau with no repeat signs, so nothing is written out. The right hand's
// two voices are folded into chords, with ties keeping the held notes their full length; the left hand's
// second voice is a third voice. The left hand's clef changes are restated at the start of each line.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Les Tendres Plaintes
C:Jean-Philippe Rameau
M:3/4
L:1/8
K:Dm
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] f4 a2 | d4 f2 | (e2 !pralltriller!d2) ^c2 | d4 g2 |
[V:2] [K:clef=treble] DAFD A,G | B,FDB, F,A | G,G A,F A,E | [DF]4 B,E |
[V:3] x6 | x6 | x6 | x6 |
[V:1] (f2 !pralltriller!e2) d2 | e2 ^c2 d2 | e2 f3g | {f}!trill!e6 |
[V:2] [K:clef=treble] A,F G,G F,A | G,B EG FA | [K:clef=bass] ^CE D4 | A,B,A,G, !pralltriller!F,E, |
[V:3] x6 | x6 | x2 z2 D,2 | x6 |
[V:1] f4 a2 | d4 f2 | (e2 !pralltriller!d2) ^c2 | d4 g2 |
[V:2] [K:clef=bass] D,A,F,D, A,,G, | B,,F,D,B,, F,,A, | G,,G, A,,F, A,,E, | [D,F,]4 B,,E, |
[V:3] x6 | x6 | x6 | x6 |
[V:1] (f2 !pralltriller!e2) d2 | e2 ^c2 d2- | de {f}!trill!e3d | d-[d-A-][dAF]4 |
[V:2] [K:clef=bass] A,,F, G,,G, F,,A, | G,,B, E,G, F,A, | G,B, A,4 | D,6 |
[V:3] x6 | x6 | x2 z2 A,,2 | z2 z A,,-[A,,D,,]2 |
[V:1] f4 A2 | e4 A2 | (d2 !pralltriller!c2) =B2 | c4 {=B}A2 |
[V:2] [K:clef=treble] DAFD FD | CAEC EC | =B,A=B,A E^G | [K:clef=bass] A,6 |
[V:3] x6 | x6 | x6 | z2 E,2-[E,A,,]2 |
[V:1] (c2 f2) A2 | !pralltriller!^G4 A2 | =B2 c3d | {c}!trill!=B6 |
[V:2] [K:clef=bass] A,=B,C=B, CA, | =B,CD=B, CA, | {A,}!trill!^G,2 {^F,^G,}A,4 | E,2 [K:clef=treble] E2 !pralltriller!D2 |
[V:3] x6 | x6 | x2 z2 A,,2 | x6 |
[V:1] e3f dz | f4 e2 | a2 !pralltriller!^g2 a2 | {a=bc'}!trill!=b6 |
[V:2] [K:clef=treble] CA^GA =B,^G- | ^G2 =B3c | cedc =BA | ^G^FED C=B, |
[V:3] x6 | [K:clef=treble] D4 C2 | F z z2 z2 | E z x4 |
[V:1] {a=b}c'=b ag fe | !trill!f2 e2 a2 | !pralltriller!c3=B A2 | A-[A-E-][AE^C]4 |
[V:2] [K:clef=bass] A,G,F,E,D,C, | z=B,2 CF,2 | E,6 | A,,2 A,G, !pralltriller!F,E, |
[V:3] x6 | [K:clef=bass] D,2 C,2 F,D, | z2 z2 E,,2 | x6 |
[V:1] f4 a2 | d4 f2 | (e2 !pralltriller!d2) ^c2 | d4 g2 |
[V:2] [K:clef=bass] D, [K:clef=treble] AFD A,G | B,FDB, F,A | G,G A,F A,E | [DF]4 B,E |
[V:3] x6 | x6 | x6 | x6 |
[V:1] (f2 !pralltriller!e2) d2 | e2 ^c2 d2 | e2 f3g | {f}!trill!e6 |
[V:2] [K:clef=treble] A,F G,G F,A | G,B EG FA | [K:clef=bass] ^CE D4 | A,B,A,G, !pralltriller!F,E, |
[V:3] x6 | x6 | x2 z2 D,2 | x6 |
[V:1] f4 a2 | d4 f2 | (e2 !pralltriller!d2) ^c2 | d4 g2 |
[V:2] [K:clef=bass] D,A,F,D, A,,G, | B,,F,D,B,, F,,A, | G,,G, A,,F, A,,E, | [D,F,]4 B,,E, |
[V:3] x6 | x6 | x6 | x6 |
[V:1] (f2 !pralltriller!e2) d2 | e2 ^c2 d2- | de {f}!trill!e3d | d-[d-A-][dAF]4 |
[V:2] [K:clef=bass] A,,F, G,,G, F,,A, | G,,B, E,G, F,A, | G,B, A,4 | D,6 |
[V:3] x6 | x6 | x2 z2 A,,2 | z2 z A,,-[A,,D,,]2 |
[V:1] A4 B2 | !pralltriller!G4 F2 | c2 c2 c2 | {d}!trill!c4 BA |
[V:2] [K:clef=bass] F,CA,F, B,,G, | C,F,E,C, D,F, | E,G, D,F, C,E, | F,6 |
[V:3] x6 | x6 | x6 | z2 z2 F,,2 |
[V:1] d-[d-B][d-A][dG-] [G-e][G-f] | [Gc-][c-A][c-G][cF-] [F-e][F-f] | [FB-][B-A][B-G][BF] [E-c][EG] | [F-A]3[F-B] [F-c][F-A] |
[V:2] [K:clef=bass] z2 B,4 | z2 A,4 | z2 C,4 | F,,2 F,2 A,,C, |
[V:3] B,,4 B,,2 | A,,4 A,,2 | G,,2 z2 C,,2 | x6 |
[V:1] [Fd]2 [FG]2 [FG]2 | {A}!trill![G-F]6 | !trill![GE-]3[E-A] [E-G][EA] | [F-B][F-A][F-B][F-d] [F-B][Ff] |
[V:2] [K:clef=bass] B,,C,D,E, F,G, | =B,,C,=B,,D, =B,,G, | C,D,C,E, C,C | z2 F,2-[F,D]2 |
[V:3] x6 | x6 | x6 | D,6 |
[V:1] [G-B][G-c][G-B][G-e] [G-B][Gg] | !pralltriller![F-A]3[F-B] [Fc]2 | d2 {A}!trill!G3F | F-[F-C-][FCA,]4 |
[V:2] [K:clef=bass] z2 G,2-[C-G,]2 | [C]2 C2 A,,F,- | [F,]F,- [F,]2 [E,B,]2 | [F,,F,]G, A,G, !pralltriller!F,E, |
[V:3] E,6 | F,4 x2 | B,,2 C,4 | x6 |
[V:1] f4 a2 | d4 f2 | (e2 !pralltriller!d2) ^c2 | d4 g2 |
[V:2] [K:clef=bass] D, [K:clef=treble] AFD A,G | B,FDB, F,A | G,G A,F A,E | [DF]4 B,E |
[V:3] x6 | x6 | x6 | x6 |
[V:1] (f2 !pralltriller!e2) d2 | e2 ^c2 d2 | e2 f3g | {f}!trill!e6 |
[V:2] [K:clef=treble] A,F G,G F,A | G,B EG FA | [K:clef=bass] ^CE D4 | A,B,A,G, !pralltriller!F,E, |
[V:3] x6 | x6 | x2 z2 D,2 | x6 |
[V:1] f4 a2 | d4 f2 | (e2 !pralltriller!d2) ^c2 | d4 g2 |
[V:2] [K:clef=bass] D,A,F,D, A,,G, | B,,F,D,B,, F,,A, | G,,G, A,,F, A,,E, | [D,F,]4 B,,E, |
[V:3] x6 | x6 | x6 | x6 |
[V:1] (f2 !pralltriller!e2) d2 | e2 ^c2 d2- | de {f}!trill!e3d | d-[d-A-][dAF]4 |]
[V:2] [K:clef=bass] A,,F, G,,G, F,,A, | G,,B, E,G, F,A, | G,B, A,4 | D,6 |]
[V:3] x6 | x6 | x2 z2 A,,2 | z2 z A,,-[A,,D,,]2 |]`;

export default {
  summary: "Les Tendres Plaintes (The Tender Laments), a rondeau from Rameau's Pièces de clavecin (1724), all 80 bars in 3/4 and D minor. A 16-bar refrain comes three times around two couplets. Five sections: Refrain (bars 1–16), First couplet (17–32, in A minor), Refrain again (33–48), Second couplet (49–64, in F major) and Last refrain (65–80). The notes are the edition's; where the right hand has two voices they share one line, tied where a note is held.",
  steps: [
    "Left hand alone in the refrain, in wait mode. It plays eighths that leap up and back: in bar 1, D, A, F, D, then A up to G. Bars 1–6 sit in the treble clef, and bars 9–14 repeat them an octave lower in the bass clef.",
    "Right hand alone in the refrain. The tune moves mostly in half notes and quarters; slurred pairs such as E–D in bar 3 fall by a step, with a quick prall trill on the second note. Bar 8 is a trilled E after a grace note F.",
    "Hands together, one section at a time. In the first couplet the left hand climbs into the treble clef in bars 24–28 and adds a second voice of its own in bars 26–28. In the second couplet the right hand plays two voices in bars 53–62, so one note is often held while the other voice moves; keep the held notes down for their full length.",
    "Play-along with the click at 40. Each clean pass nudges the tempo up toward 66.",
  ],
  watch: [
    "B flat is in the key signature, but the first couplet (bars 17–32) uses B natural and G sharp in both hands. The second couplet goes back to B flat, except the left hand's B naturals in bar 58.",
    "Grace notes come before many trilled notes, as in bars 8, 15 and 24; each is graded by its main note, so learn the plain notes first and add the ornaments once they are secure.",
    "Bar 28's trilled B ends with two small notes, A and B, which the edition prints at the end of the bar. Here they are drawn just after the bar line, before the C of bar 29; play them as the close of the trill.",
  ],
  source: { label: "Mutopia Project — Rameau, Les Tendres Plaintes (Pièces de clavecin, Durand 1895)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=414" },
  score: {
    bpm: 40, target: 66,
    sections: [{ name: "Refrain", from: 1, to: 16 }, { name: "First couplet", from: 17, to: 32 }, { name: "Refrain again", from: 33, to: 48 }, { name: "Second couplet", from: 49, to: 64 }, { name: "Last refrain", from: 65, to: 80 }],
    abc: ABC,
  },
};
