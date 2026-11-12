// Handel, Sonatina in A minor, from the Aylesford Pieces, Mutopia edition of the Schott 1930 print
// (public domain), 79 bars. The original repeats bars 1–35; here they are played once.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonatina
C:George Frideric Handel
M:3/4
L:1/16
K:Am
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] a2e2 c2A2 e2E2 | A4 z8 | a2e2 c2A2 e2E2 | A4 z8 |
[V:2] z12 | A,2E,2 C,2A,,2 E,2E,,2 | A,,4 z8 | A,2E,2 C,2A,,2 E,2E,,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] zE^F^G ABcd e2B2 | [Ac]8 [^GB]4 | zE^F^G ABcd e2B2 | [Ac]8 z4 |
[V:2] A,,4 z8 | zE,^F,^G, A,B,CD E2B,2 | [A,C]8 [^G,B,]4 | zA,,B,,C, D,E,^F,^G, A,2A,,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] zede BeAe ^Ge^Fe | zede BeAe ^Ge^Fe | E6c2 B2A2 | [^Ge]6c2 B2A2 |
[V:2] ^G,6C2 B,2A,2 | ^G,6C2 B,2A,2 | ^G,2 x4 A,2^G,2^F,2 | E,2 x4 A,2^G,2^F,2 |
[V:3] E,12 | E,12 | E,EDE B,EA,E ^G,E^F,E | E,EDE B,EA,E ^G,E^F,E |
[V:1] ^Gede BeAe Gede | [Ac]6f2 e2d2 | [Ac]6f2 e2d2 | ca^ga eada caBa |
[V:2] E,8 [E,B,]4 | x6 D,2C,2B,,2 | x6 D,2C,2B,,2 | A,,12 |
[V:3] x12 | zA,^G,A, E,A,D,A, C,A,B,,A, | A,,A,^G,A, E,A,D,A, C,A,B,,A, | x12 |
[V:1] Aa^ga eada caBa | Ac'bc' ac'gc' fc'ec' | fc'bc' fc'bc' fc'bc' | fbab gbfb ebdb |
[V:2] C6F2 E2D2 | C6F2 E2D2 | D4 D,4 D4 | z4 E2D2 C2B,2 |
[V:3] A,12 | A,12 | x12 | G,12 |
[V:1] ebab ebab ebab | eaga faea daca | daga faea daca | dgfg egdg cgBg |
[V:2] C4 C,4 C4 | z4 D2C2 B,2A,2 | B,4 B,,4 B,4 | z4 C2B,2 A,2G,2 |
[V:3] x12 | F,12 | x12 | E,12 |
[V:1] cgfg cgfg cgfg | cfef dfcf BfAf | B4- BGAB cdef | g4- gcde fgab |
[V:2] A,4 A,,4 A,4 | z4 B,2A,2 G,2F,2 | [G,,G,]2D,2 G,4 F,4 | E,2F,2 [EG]4 [DF]4 |
[V:3] x12 | D,12 | x12 | x12 |
[V:1] c'bag fedc BAGF | E2z2 [ca]4 [dg]4 | gfed cBAG FEDC | B,2CD G,2C2 D2B,2 |
[V:2] [CE]4 [F,A,]4 G,4 | CB,A,G, F,E,D,C, B,,A,,G,,F,, | E,,8 [F,,D,]4 | D,6E,2 F,4 |
[V:3] x12 | x12 | x12 | G,,8 G,,4 |
[V:1] C6A2 G2F2 | E6A2 G2F2 | [CE]12 | zc'bc' gc'fc' ec'dc' |
[V:2] zC,B,,C, G,,C,F,,C, E,,C,D,,C, | C,,C,B,,C, G,,C,F,,C, E,,C,D,,C, | C,,12 | z12 |
[V:3] x6 F,,2E,,2D,,2 | C,,2 x4 F,,2E,,2D,,2 | x12 | x12 |
[V:1] cc'bc' gc'fc' ec'dc' | c6a2 g2f2 | [ce]6a2 g2f2 | ec'bc' gc'fc' ec'dc' |
[V:2] z12 | x6 F,2E,2D,2 | C,2 x4 F,2E,2D,2 | C,4 z8 |
[V:3] x12 | zCB,C G,CF,C E,CD,C | C,CB,C G,CF,C E,CD,C | x12 |
[V:1] cgfg egdg cg_Bg | A6d2 c2_B2 | A6d2 c2_B2 | Afef cf_Bf AfGf |
[V:2] z12 | zF,E,F, C,F,_B,,F, A,,F,G,,F, | F,,F,E,F, C,F,_B,,F, A,,F,G,,F, | F,,4 z8 |
[V:3] x12 | x6 _B,,2A,,2G,,2 | F,,2 x4 _B,,2A,,2G,,2 | x12 |
[V:1] [FA]8 [EG]4 | [G_B]8 [^FA]4 | [Ac]8 [^GB]4 | [ce]8 [Bd]4 |
[V:2] F,2C,2 A,,2F,,2 C,2C,,2 | G,2D,2 _B,,2G,,2 D,2D,,2 | A,2E,2 C,2A,,2 E,2E,,2 | C2G,2 E,2C,2 G,2G,,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [df]8 [^ce]4 | [eg]8 [^d^f]4 | zbab gb^fb ebdb | cc'bc' ac'gc' fc'ec' |
[V:2] D2A,2 F,2D,2 A,2A,,2 | E2B,2 G,2E,2 B,2B,,2 | E,4 E,,4 z4 | z4 F2E2 D2C2 |
[V:3] x12 | x12 | x12 | A,,12 |
[V:1] fc'bc' fc'bc' fc'bc' | fbab gbfb ebdb | ebab ebab ebab | eaga faea daca |
[V:2] D,4 D4 D,4 | z4 E2D2 C2B,2 | C4 C,4 C4 | z4 D2C2 B,2A,2 |
[V:3] x12 | G,12 | x12 | F,12 |
[V:1] da^ga daga daga | d^g^fg egdg cgBg | c6f2 e2d2 | c6f2 e2d2 |
[V:2] B,4 B,,4 B,4 | E,8 z4 | x6 D,2C,2B,,2 | A,,2 x4 D,2C,2B,,2 |
[V:3] x12 | x12 | zA,^G,A, E,A,D,A, C,A,B,,A, | A,,A,^G,A, E,A,D,A, C,A,B,,A, |
[V:1] c2c'b agfe dcBA | ^G6c2 B2A2 | ^G6c2 B2A2 | [^Ge]2B2 G2E2 [A,A]2A,2 |
[V:2] A,,8 z4 | E,,E,D,E, B,,E,A,,E, ^G,,E,^F,,E, | E,,E,D,E, B,,E,A,,E, ^G,,E,^F,,E, | E,,4 z4 [A,,E,]4 |
[V:3] x12 | x6 A,,2^G,,2^F,,2 | E,,2 x4 A,,2^G,,2^F,,2 | x12 |
[V:1] [^G,E]4 z8 | zbab ^gb^fb ebdb | cede ceBe AeGe | Fdcd BdAd GdFd |
[V:2] E,,E,D,E, B,,E,A,,E, ^G,,E,^F,,E, | E,,8 z4 | A,,4 A,2G,2 F,2E,2 | D,4 G,2F,2 E,2D,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] EcBc AcGc FcEc | DBAB ^GB^FB EBDB | CA^GA EAGA CAGA | B,A^GA EAGA B,G^FG |
[V:2] C,4 F,2E,2 D,2C,2 | B,,4 E,2D,2 C,2B,,2 | A,,8 z4 | [E,,E,]8 [E,,E,]4 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] A4 z8 | zA^GA EADA CAB,A | A,A^GA EADA CAB,A | A,2z2 z2F2 E2D2 |
[V:2] A,,A,^G,A, E,A,D,A, C,A,B,,A, | A,,4 z8 | A,,4 z8 | x6 D,2C,2B,,2 |
[V:3] x12 | x12 | x12 | A,,A,^G,A, E,A,D,A, C,A,B,,A, |
[V:1] C6F2 E2D2 | C4 z4 [B,E^G]4 | [CEA]12 |]
[V:2] A,,2 x4 D,2C,2B,,2 | A,,2[E,,E,]2 [C,,C,]2[A,,,A,,]2 E,,2[E,,,E,,]2 | [A,,,A,,]12 |]
[V:3] A,,A,^G,A, E,A,D,A, C,A,B,,A, | x12 | x12 |]`;

export default {
  summary: "Handel's Sonatina in A minor, from the Aylesford Pieces, all 79 bars of 3/4: a two-part piece in which the hands take turns with the same figures, mostly in sixteenths. The first half (bars 1–35) goes from A minor to C major; the second (36–79) moves through C and F major and comes home to A minor. Nine sections: Subject (bars 1–8), Episode (9–16), Sequence (17–26), To C (27–35), Second half (36–44), Rising chords (45–51), Sequence again (52–58), Return (59–66) and Close (67–79). The original repeats bars 1–35; here you play them once.",
  steps: [
    "Subject, hands separately in wait mode. The right hand opens with a broken A minor chord in eighths and the left hand answers it a bar later; in bars 5–7 each hand in turn runs up a scale in sixteenths from E to D.",
    "In the Episode and both Sequences one hand repeats a single note every other sixteenth while the line under it moves: E in bars 9–10, C in bar 18. Practise these bars slowly until the repeated note stays light and the moving line is even.",
    "To C, right hand alone: bars 27–29 run up from a tied B to high C and straight back down to F; the left hand then runs down from C in bar 30. Hold each tied note its full length before the run starts.",
    "Play-along with the click at 56, a section at a time. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "In Rising chords (bars 45–50) the right hand holds two-note chords while the left hand breaks the same chord in eighths, falling from the top. The chords rise by step, except for a third between bars 47 and 48, so the accidentals change: B flat in bar 46, C sharp in bar 49, D sharp and F sharp in bar 50.",
    "G sharp comes and goes. It is written in wherever it applies, mostly in the A minor and E major passages; the G is natural in bars 18, 41, 61 and 67.",
  ],
  source: { label: "Mutopia Project — Handel, Sonatina (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=169" },
  score: {
    bpm: 56, target: 92,
    sections: [{ name: "Subject", from: 1, to: 8 }, { name: "Episode", from: 9, to: 16 }, { name: "Sequence", from: 17, to: 26 }, { name: "To C", from: 27, to: 35 }, { name: "Second half", from: 36, to: 44 }, { name: "Rising chords", from: 45, to: 51 }, { name: "Sequence again", from: 52, to: 58 }, { name: "Return", from: 59, to: 66 }, { name: "Close", from: 67, to: 79 }],
    abc: ABC,
  },
};
