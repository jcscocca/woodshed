// Kuhlau, Sonatina in C, Op. 20 No. 1, III. Rondo, from the Mutopia edition of the B. Schott's Söhnen print
// (public domain), 158 bars. The eighth-note pickup is padded into a full first bar, so bar numbers run one ahead
// of the printed ones. Voice 3 carries the left hand's held bass notes in bars 53–72. The left hand's clef changes
// are restated at the start of each line, since abcjs starts every line in the declared clef.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonatina in C, Op. 20 No. 1: III. Rondo
C:Friedrich Kuhlau
M:2/4
L:1/16
K:C
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z4 z2ef | g3g ^fgag | e3e ^defe | c3c dcBc |
[V:2] [K:clef=treble] z8 | [CEG]2[CEG]2 z4 | [CEG]2[CEG]2 z4 | z2[CEG]2 [CEG]2[CEG]2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ^c4 d2de | f3f efgf | d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 |
[V:2] [K:clef=treble] [B,FG]4- [B,FG]2z2 | [B,DG]2[B,DG]2 z4 | [B,FG]2[B,FG]2 z4 | [K:clef=bass] z2[G,DF]2 [G,DF]2[G,DF]2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [Bg]4 c2ef | g3g ^fgag | e3e ^defe | c3c dcBc |
[V:2] [G,DF]4 [CE]2z2 | C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ^c4 d2de | f3f efgf | d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 |
[V:2] B,,G,F,G, B,,G,F,G, | B,,G,D,G, B,,G,D,G, | B,,G,F,G, B,,G,F,G, | G,,F,D,F, G,,F,D,F, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c4 z2e'd' | c'bag ^fgag | fedc Bcde | f2[Bf]2 [Bf]2[Bf]2 |
[V:2] C,E,G,C C,2z2 | z8 | z8 | z2[G,D]2 [G,D]2[G,D]2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [Bf]4 [ce]2c'b | agfe ^defe | dcBA ^GABc | d2[^Gd]2 [^Gd]2[^Gd]2 |
[V:2] [G,D]4 [CE]2z2 | z8 | z8 | z2[E,B,]2 [E,B,]2[E,B,]2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [^Gd]4 [Ac]2ed | cBAG ^FGA^F | GABc de^fg | ^fgab c'ag^f |
[V:2] [E,B,]4 [A,C]2z2 | [D,A,C]8 | [G,B,]4 z4 | [K:clef=treble] [DAc]8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] gaba g^fed | cBAG ^FGA^F | GABc de^fg | ^fgab c'ag^f |
[V:2] [K:clef=treble] [GB]4 z4 | [K:clef=bass] [D,A,C]8 | [G,B,]4 z4 | [K:clef=treble] [DAc]8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] gabg ^fga^f | gabg ^fga^f | g2g^f g^fg^f | g^fg^f g=fe=f |
[V:2] [K:clef=treble] [GB]2z2 [DAc]2z2 | [GB]2z2 [DAc]2z2 | [GB]2z2 z4 | z8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] g3g ^fgag | e3e ^defe | c3c dcBc | ^c4 d2de |
[V:2] [K:clef=treble] [CEG]2[CEG]2 z4 | [CEG]2[CEG]2 z4 | z2[CEG]2 [CEG]2[CEG]2 | [B,FG]4- [B,FG]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] f3f efgf | d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 | [Bg]4 c2ef |
[V:2] [K:clef=treble] [B,DG]2[B,DG]2 z4 | [B,FG]2[B,FG]2 z4 | [K:clef=bass] z2[G,DF]2 [G,DF]2[G,DF]2 | [G,DF]4 [CE]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] g3g ^fgag | e3e ^defe | c3c dcBc | ^c4 d2de |
[V:2] C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, | B,,G,F,G, B,,G,F,G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] f3f efgf | d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 | c4 z2e'^d' |
[V:2] B,,G,D,G, B,,G,D,G, | B,,G,F,G, B,,G,F,G, | G,,F,D,F, G,,F,D,F, | C,E,G,C C,2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e'2e'd' c'2c'b | a6^ga | b2b2 b2b2 | c'd'c'b a2e'^d' |
[V:2] A,2[CE]2 [CE]2[CE]2 | A,2[CE]2 [CE]2[CE]2 | ^G,2[DE]2 [DE]2[DE]2 | A,2[CE]2 [CE]2[CE]2 |
[V:3] A,8 | A,8 | ^G,8 | A,8 |
[V:1] e'2e'd' c'2c'b | a4- aaba | ggag ^f^fg^f | e4 z2E^F |
[V:2] A,2[CE]2 [CE]2[CE]2 | A,2[CE]2 [CE]2[CE]2 | [B,E]2z2 [B,^D]2z2 | zE^DE E,2z2 |
[V:3] A,8 | A,8 | x8 | x8 |
[V:1] ^G2^GA B2Bc | dcBA ^G2^G2 | A2AB c2cd | e2e2 e2e^f |
[V:2] E,2[B,D]2 [B,D]2[B,D]2 | E,2[B,D]2 [B,D]2[B,D]2 | E,2[A,C]2 [A,C]2[A,C]2 | E,2[^G,B,]2 [^G,B,]2[^G,B,]2 |
[V:3] E,8 | E,8 | E,8 | E,8 |
[V:1] ^g2^ga b2bc' | d'c'ba ^g2^g2 | a2ab c'2c'd' | e'2e'^d' e'^d'e'^d' |
[V:2] E,2[B,D]2 [B,D]2[B,D]2 | E,2[B,D]2 [B,D]2[B,D]2 | E,2[A,C]2 [A,C]2[A,C]2 | [E,^G,B,]4 z4 |
[V:3] E,8 | E,8 | E,8 | x8 |
[V:1] e'2e'd' c'2c'b | a6^ga | b2b2 b2b2 | c'd'c'b a2e'^d' |
[V:2] A,2[CE]2 [CE]2[CE]2 | A,2[CE]2 [CE]2[CE]2 | ^G,2[DE]2 [DE]2[DE]2 | A,2[CE]2 [CE]2[CE]2 |
[V:3] A,8 | A,8 | ^G,8 | A,8 |
[V:1] e'e'a'g' f'e'd'c' | bagf edcB | ABcA ^GAB^G | A4 z2ed |
[V:2] A,8 | [DF]8 | E2z2 E,2z2 | zA,^G,A, A,,2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c4 z2cB | A4 z2ag | f4 z2fe | d4 z2f'e' |
[V:2] z2[A,CE]2 [A,CE]2z2 | z2[A,CE]2 [A,CE]2z2 | z2 [K:clef=treble] [B,DG]2 [B,DG]2z2 | z2[B,FG]2 [B,FG]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] d'^c'e'd' =c'bd'=c' | b^ac'b =a^gb=a | g^fag =fedc | Bc^cd ^def^f |
[V:2] [K:clef=treble] z8 | z8 | z8 | z8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] g3g ^fgag | e3e ^defe | c3c dcBc | ^c4 d2de |
[V:2] [K:clef=treble] [CEG]2[CEG]2 z4 | [CEG]2[CEG]2 z4 | z2[CEG]2 [CEG]2[CEG]2 | [B,FG]4- [B,FG]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] f3f efgf | d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 | [Bg]4 c2ef |
[V:2] [K:clef=treble] [B,DG]2[B,DG]2 z4 | [B,FG]2[B,FG]2 z4 | [K:clef=bass] z2[G,DF]2 [G,DF]2[G,DF]2 | [G,DF]4 [CE]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] g3g ^fgag | e3e ^defe | c3c dcBc | ^c4 d2de |
[V:2] C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, | B,,G,F,G, B,,G,F,G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] f3f efgf | d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 | c4 z2e'd' |
[V:2] B,,G,D,G, B,,G,D,G, | B,,G,F,G, B,,G,F,G, | G,,F,D,F, G,,F,D,F, | C,E,G,C C,2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c'bag ^fgag | fedc Bcde | f2[Bf]2 [Bf]2[Bf]2 | [Bf]4 [ce]2c'b |
[V:2] z8 | z8 | z2[G,D]2 [G,D]2[G,D]2 | [G,D]4 [CE]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] agfe ^defe | dcBA ^GABc | d2[^Gd]2 [^Gd]2[^Gd]2 | [^Gd]4 [Ac]2ed |
[V:2] z8 | z8 | z2[E,B,]2 [E,B,]2[E,B,]2 | [E,B,]4 [A,C]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] cBAG ^FGA^F | GABc de^fg | ^fgab c'ag^f | gaba g^fed |
[V:2] [D,A,C]8 | [G,B,]4 z4 | [K:clef=treble] [DAc]8 | [GB]4 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] cBAG ^FGA^F | GABc de^fg | ^fgab c'ag^f | gabg ^fga^f |
[V:2] [D,A,C]8 | [G,B,]4 z4 | [K:clef=treble] [DAc]8 | [GB]2z2 [DAc]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] gabg ^fga^f | g2g^f g^fg^f | g^fg^f g=fe=f | g3g ^fgag |
[V:2] [K:clef=treble] [GB]2z2 [DAc]2z2 | [GB]2z2 z4 | z8 | [CEG]2[CEG]2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e3e ^defe | c3c dcBc | ^c4 d2de | f3f efgf |
[V:2] [K:clef=treble] [CEG]2[CEG]2 z4 | z2[CEG]2 [CEG]2[CEG]2 | [B,FG]4- [B,FG]2z2 | [B,DG]2[B,DG]2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 | [Bg]4 c2ef | g3g ^fgag |
[V:2] [K:clef=treble] [B,FG]2[B,FG]2 z4 | [K:clef=bass] z2[G,DF]2 [G,DF]2[G,DF]2 | [G,DF]4 [CE]2z2 | C,G,E,G, C,G,E,G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e3e ^defe | c3c dcBc | ^c4 d2de | f3f efgf |
[V:2] C,G,E,G, C,G,E,G, | C,G,E,G, C,G,E,G, | B,,G,F,G, B,,G,F,G, | B,,G,D,G, B,,G,D,G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] d3d ^cded | B2[Bg]2 [Bg]2[Bg]2 | c2cB AGFE | DCB,A, G,A,B,G, |
[V:2] B,,G,F,G, B,,G,F,G, | G,,F,D,F, G,,F,D,F, | [C,E,G,]2z2 z4 | z4 [G,,D,]4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] C2ed cBAG | FEDC B,CDB, | C2gf edcB | AGFE DCB,A, |
[V:2] [C,E,]2z2 z4 | z4 [G,,D,]4 | [C,E,]2z2 z4 | z8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] G,2z2 [CE]2z2 | [CD]2z2 [B,G]2z2 | [CE]2c'b agfe | dcBA GABG |
[V:2] z4 G,^F,G,^F, | G,^F,G,^F, G,=F,E,D, | C,2z2 z4 | z4 [G,D]4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c2e'd' c'bag | fedc BcdB | c2g'f' e'd'c'b | agfe dcBA |
[V:2] [CE]2z2 z4 | z4 [G,D]4 | [CE]2z2 z4 | z8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] G2z2 [ce]2z2 | [cd]2z2 [Bg]2z2 | [ce]4 z2ef | g3g ^fgag |
[V:2] [K:clef=treble] z4 G^FG^F | G^FG^F G=FED | C4 z4 | [B,FG]8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c'4 z2ef | g3g ^fgag | ccde fgab | c'c'd'e' f'g'a'b' |
[V:2] [K:clef=treble] [CEG]4 z4 | [B,FG]8 | [CEG]4 z4 | [CEG]4 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c''4 [cegc']4 | [cegc']4 z4 |]
[V:2] [K:clef=treble] [CEG]4 [K:clef=bass] [C,C]4 | [C,,C,]4 z4 |]
[V:3] x8 | x8 |]`;

export default {
  summary: "The third movement (Rondo, Allegro) of Kuhlau's Sonatina in C, Op. 20 No. 1, all 158 bars, in 2/4 and C major. The refrain (A) appears four times around two episodes: B, sixteenth-note sequences that settle in G major, and C, in A minor over held bass notes. Nine sections: A (bars 1–17), B (18–36), A again (37–52), C (53–76), Link (77–84), A third time (85–100), B again (101–119), A last time (120–134) and Coda (135–158). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Right hand alone in A, in wait mode. Most bars of the tune start with a dotted eighth and a sixteenth on the same note, then turn around it in sixteenths: G, G, then F sharp–G–A–G in bar 2. Keep the repeated note light and the sixteenths even.",
    "Left hand alone. In bars 2–9 it plays chords, mostly short eighths, moving from the treble clef to the bass clef in bar 8, and from bar 10 an Alberti bass. In C it holds a bass note under repeated chords, A and G sharp in bars 53–58 and 69–72, E in bars 61–67; keep the low note down for the whole bar.",
    "B, bars 18–36, right hand alone: sixteenth-note sequences that step down (18–25), then a passage in G major with F sharps (26–36). Bars 35–36 alternate G and F sharp, and bar 36 finishes G–F natural–E–F natural; play them evenly and lead straight into the tune at bar 37.",
    "Switch to play-along with the click at 56. Each clean pass nudges the tempo up toward 104.",
  ],
  watch: [
    "C, bars 53–76, is in A minor: G sharp in many bars, with G natural in bars 59 and 73–74, and D sharp leading into E. Bars 81–84 are chromatic sixteenths, down and then up from B to F sharp in bar 84; read each sharp and natural as it comes.",
    "In the coda the right hand drops below middle C, onto ledger lines under the treble staff, in bars 135–140, then plays the figure of bars 137–140 an octave higher in bars 145–148. Keep the sixteenths even through the change of register.",
  ],
  source: { label: "Mutopia Project — Kuhlau, Sonatina in C, Op. 20 No. 1, III. Rondo (B. Schott's Söhnen)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=234" },
  score: {
    bpm: 56, target: 104,
    sections: [{ name: "A", from: 1, to: 17 }, { name: "B", from: 18, to: 36 }, { name: "A again", from: 37, to: 52 }, { name: "C", from: 53, to: 76 }, { name: "Link", from: 77, to: 84 }, { name: "A third time", from: 85, to: 100 }, { name: "B again", from: 101, to: 119 }, { name: "A last time", from: 120, to: 134 }, { name: "Coda", from: 135, to: 158 }],
    abc: ABC,
  },
};
