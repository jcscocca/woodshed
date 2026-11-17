// Beethoven, Sonata in G, Op. 49 No. 2, II. Tempo di Menuetto, from the Mutopia edition of the Breitkopf & Härtel
// print (public domain). The quarter-note pickup is padded into a full first bar, so bar numbers here run one ahead
// of the printed ones, and the last bar is filled out with a rest. Voice 3 carries the left hand's held lower note
// in bars 13, 60, 76 and 100. Key changes and the left hand's clef are restated at the start of each line (voice 3,
// which never changes clef, keeps the opening key; its few notes are the same in every key here).
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonata in G, Op. 49 No. 2: II. Tempo di Menuetto
C:Ludwig van Beethoven
M:3/4
L:1/16
K:G
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z8 G3F | F8F3G | G8G3B | d4-d2e2d2c2 |
[V:2] z8 [G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | [F,A,]2D2D,2D2[F,A,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B4G2z2G3F | F8F3G | G8G3B | d6^c2=c2A2 |
[V:2] [G,B,]2D2D,2D2[G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | z4[D,C]4[D,C]4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] G4z4B3B | B4c2z2c3c | c4B2z2B3B | B2A2^G2A2^d2e2 |
[V:2] [G,B,]4G,,4z4 | [K:clef=treble] [^DF]4[EG]2z2 z4 | [EG]4[=DF]2z2 z4 | [K:clef=bass] z4C4C4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] G4F2z2g3f | f8f3g | g8g3b | d'4-d'2e'2d'2c'2 |
[V:2] B,4A,2z2 z4 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | [F,A,]2D2D,2D2[F,A,]2D2 |
[V:3] D,6 x6 | x12 | x12 | x12 |
[V:1] b4g2z2g3f | f8f3g | g8g3b | d'4 d'^c'd'^c' d'=c'ba |
[V:2] [G,B,]2D2D,2D2[G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | z4[D,C]4[D,C]4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] g4z4[Bd]4 | [eg]4z4[df]4 | [ce]4z4[Bd]4 | [cd]4[cd]4[cd]4 |
[V:2] [G,B,]4G,,4z4 | zG,A,B, CDEF G2G2 | zG,A,B, CDEF G2G2 | F2E2F2D2E2F2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [Bd]4z4z4 | zdef gab^c' d'2d'2 | zdef gab^c' d'2d'2 | b2a2g2f2e2d2 |
[V:2] [K:clef=treble] G2D2E2F2G2A2 | [GB]4z4[FA]4 | [EG]4z4[DF]4 | z4 [K:clef=bass] G,4^G,4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] {^c}a6ba .g2ag | .f2gf .e2fe .d2ed | ^c4z2^c2 d^cB^c | d4z2d2 ed^cd |
[V:2] A,^CEC A,CEC A,CEC | A,DFD A,DFD A,DFD | A,EGE A,EGE A,EGE | A,DFD A,DFD A,DFD |
[V:3] x12 | x12 | x12 | x12 |
[V:1] a6ba .g2ag | .f2gf .e2fe .d2ed | ^c4z2^c2 ed^cd | e3g d4^c4 |
[V:2] A,^CEC A,CEC A,CEC | A,DFD A,DFD A,DFD | A,EGE ^A,EGE B,DFD | G,2G2[A,F]4[A,E]4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d2efgab^c' d'2d'2 | d'2a2a2f2f2d2 | d8e3^c | d2efgab^c' d'2d'2 |
[V:2] [DF]4z4z4 | z12 | z4 [K:clef=treble] [A,F]4[A,G]4 | [DF]4z4z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] (3d'2a2a2 (3a2f2f2 (3f2d2d2 | d8e3^c | d3d^c3d=c3d | B3dB3d^c3e |
[V:2] [K:clef=treble] z12 | z4[A,F]4[A,G]4 | [DF]4z4[DF]4 | [DG]4z4[DE]4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d3d^c3d=c3d | B3dB3d^c3e | d3d^c3d=c3d | B3dA3dG3F |
[V:2] [K:clef=treble] [DF]4z4[DF]4 | [DG]4z4[DE]4 | [DF]4z4z4 | z4z4 [K:clef=bass] [G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] F8F3G | G8G3B | d4-d2e2d2c2 | B4G2z2G3F |
[V:2] [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | [F,A,]2D2D,2D2[F,A,]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] F8F3G | G8G3B | d6^c2=c2A2 | G4z4B3B |
[V:2] [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | z4[D,C]4[D,C]4 | [G,B,]4G,,4z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B4c2z2c3c | c4B2z2B3B | B2A2^G2A2^d2e2 | G4F2z2g3f |
[V:2] [K:clef=treble] [^DF]4[EG]2z2 z4 | [EG]4[=DF]2z2 z4 | [K:clef=bass] z4C4C4 | B,4A,2z2 z4 |
[V:3] x12 | x12 | x12 | D,6 x6 |
[V:1] f8f3g | g8g3b | d'4-d'2e'2d'2c'2 | b4g2z2g3f |
[V:2] [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | [F,A,]2D2D,2D2[F,A,]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] f8f3g | g8g3b | d'4 d'^c'd'^c' d'=c'ba | g4z4c3e |
[V:2] [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | z4[D,C]4[D,C]4 | [G,B,]4G,,4z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [K:C clef=treble] [eg]6[Ge]2[Af]2[Fd]2 | [Ec]4[Ec]2G2c2e2 | [eg]6[Ge]2[Af]2[Fd]2 | [Ec]4z2c2B2c2 |
[V:2] [K:C clef=bass] C,2C2C,2C2C,2C2 | C,2C2C,2C2C,2C2 | C,2C2C,2C2C,2C2 | C,2C2C,2z2z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d2B2G2d2c2d2 | e2c2G2e2d2e2 | f2g2a2e2f2d2 | c4B2G2c2e2 |
[V:2] z4[G,B,D]4z4 | z4[CE]4z4 | z4z2^C2D2F2 | E4D2z2z4 |
[V:3] x12 | x12 | x12 | G,6 x6 |
[V:1] [eg]6[Ge]2[Af]2[Fd]2 | [Ec]4[Ec]2G2c2e2 | [eg]6[Ge]2[Af]2[Fd]2 | [Ec]4z2c2B2c2 |
[V:2] C,2C2C,2C2C,2C2 | C,2C2C,2C2C,2C2 | C,2C2C,2C2C,2C2 | C,2C2C,2z2z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d2B2G2d2c2d2 | e2c2G2e2d2e2 | ^f2c2A2f2e2f2 | g2d2B2g2a2b2 |
[V:2] z4[G,B,D]4z4 | z4[CE]4z4 | z4[CD]4z4 | z4[B,D]4z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] c'2b2a2g2^f2e2 | d2c2B2A2G2^F2 |
[V:2] z4[^F,D]4z4 | z12 |
[V:3] x12 | x12 |
[V:1] [K:G clef=treble] E2D2z4z4 | z4z4G3F | F8F3G | G8G3B |
[V:2] [K:G clef=bass] z4^C2D2C2D2 | =C2D2C2D2[G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d4-d2e2d2c2 | B4G2z2G3F | F8F3G | G8G3B |
[V:2] [F,A,]2D2D,2D2[F,A,]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d6^c2=c2A2 | G4z4B3B | B4c2z2c3c | c4B2z2B3B |
[V:2] z4[D,C]4[D,C]4 | [G,B,]4G,,4z4 | [K:clef=treble] [^DF]4[EG]2z2 z4 | [EG]4[=DF]2z2 z4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B2A2^G2A2^d2e2 | G4F2z2g3f | f8f3g | g8g3b |
[V:2] [K:clef=bass] z4C4C4 | B,4A,2z2 [G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 |
[V:3] x12 | D,6 x6 | x12 | x12 |
[V:1] d'4-d'2e'2d'2c'2 | b4g2z2g3f | f8f3g | g8g3b |
[V:2] [F,A,]2D2D,2D2[F,A,]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 | [A,C]2D2D,2D2[A,C]2D2 | [G,B,]2D2D,2D2[G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d'4 d'^c'd'^c' d'=c'ba | g4z4g3=f | =f4z4=f3e | e4z4e3d |
[V:2] z4[D,C]4[D,C]4 | [G,B,]4G,,4z4 | B,2G2D2G2B,2G2 | C2E2C2E2C2E2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d4z4d3c | c4z4c3A | G2F2d6G2 | G2F2d6B2 |
[V:2] ^G,2E2B,2E2G,2E2 | A,2E2C2E2C2E2 | [A,C]2D2[F,A,]2D2[G,B,]2D2 | [A,C]2D2[F,A,]2D2[G,B,]2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] z2Acz2GBz2FA | zGABcdefgabg | f2d'4d'2c'bag | fd'^c'd'^c'd'^c'd'=c'bag |
[V:2] C,4D,4D,4 | G,4z4z2 [K:clef=treble] [GB]2 | [Ac]2d2[FA]2d2[GB]2d2 | [Ac]2d2[FA]2d2[GB]2d2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] ^d'e'^d'e'g4baga | g4z4[CF]4 | [B,G]4z4z4 |]
[V:2] [K:clef=treble] C4[DB]4[Dc]4 | [GB]4z4 [K:clef=bass] [D,A,]4 | [G,,G,]4z4z4 |]
[V:3] x12 | x12 | x12 |]`;

export default {
  summary: "The second and last movement, Tempo di Menuetto, of Beethoven's Sonata in G, Op. 49 No. 2, in 3/4 and G major, written out in 121 bars. The minuet tune is heard three times, around two episodes, the first moving to D major and the second in C major, and a coda ends it. Six sections: Minuet (bars 1–21), First episode (22–48), Minuet again (49–68), Second episode (69–88, in C major), Minuet last time (89–108) and Coda (109–121). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones, and the last bar is filled out with rests.",
  steps: [
    "Right hand alone in the Minuet (bars 1–21), in wait mode. Most bars are a long note, then a dotted eighth and a sixteenth that lead into the next bar; give the sixteenth its full value and land on the beat. Bars 14–19 repeat bars 2–7 an octave higher.",
    "Left hand alone. Wherever the tune plays, as in bars 2–7 and 14–19, it plays eighths: a two-note chord, then D, the low D, D, the chord and D again. Keep the low D light. In bar 13 it holds a low D under B–A.",
    "The first episode, hands separately: the left hand runs up in sixteenths in bars 22–23 and the right hand in bars 26–27, and in bars 29–35 the left hand plays sixteenth-note broken chords under a right-hand line of eighths and sixteenths, staccato in bars 29–30 and 33–34. Bar 41 is in triplet eighths. In the second episode the left hand plays eighths alternating low and high C in bars 69–71 and 77–79.",
    "Play-along with the click at 80. Each clean pass nudges the tempo up toward 134.",
  ],
  watch: [
    "Bar 8 has C sharp then C natural, as do bars 43, 45 and 47 (D, C sharp, D, C natural). Bar 12 has G sharp and D sharp, and bar 35 an A sharp in the left hand.",
    "The second episode (bars 69–86) is in C major, with no F sharp until bars 83 and 85–86 lead back; bar 75 has a C sharp in the left hand. G major returns at bar 87.",
    "From bar 108 the right hand's quarter notes step down G, F natural, E, D, C, one a bar, each followed by a rest and a dotted pair; then sixteenths in bars 115–119 lead to the end.",
  ],
  source: { label: "Mutopia Project — Beethoven, Sonata in G, Op. 49 No. 2, II. Tempo di Menuetto (Breitkopf & Härtel)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=777" },
  score: {
    bpm: 80, target: 134,
    sections: [{ name: "Minuet", from: 1, to: 21 }, { name: "First episode", from: 22, to: 48 }, { name: "Minuet again", from: 49, to: 68 }, { name: "Second episode", from: 69, to: 88 }, { name: "Minuet last time", from: 89, to: 108 }, { name: "Coda", from: 109, to: 121 }],
    abc: ABC,
  },
};
