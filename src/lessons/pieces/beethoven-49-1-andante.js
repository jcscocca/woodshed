// Beethoven, Sonata in G minor, Op. 49 No. 1, I. Andante, from the Mutopia edition of the Breitkopf & Härtel
// 1862–1865 print (public domain), 111 bars. The eighth-note pickup is padded into a full first bar, so bar numbers
// run one ahead of the printed ones. The repeat of the first part is played once. Where the right hand has two
// voices (bar 38) they share one staff, the held notes tied; voice 3 carries the left hand's second voice in bars
// 13–16 and 38. The accidental printed over some turns is shown above them.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonata in G minor, Op. 49 No. 1: I. Andante
C:Ludwig van Beethoven
M:2/4
L:1/16
K:Gm
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z6D2 | B2G2 ^F2G2 | [Dc]8 | B2G2 ^F2G2 |
[V:2] z6z2 | z2[B,D]2 [A,C]2[G,B,]2 | [^F,A,]2[D,F,]2 [=E,G,]2[F,A,]2 | [G,B,]2[B,D]2 [A,C]2[G,B,]2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [Ge]8 | d2^f2 g2d2 | c2^g2 a2c2 | B2=g2 A2e2 |
[V:2] C,2E,2 G,2C2 | B,4 z2[B,D]2 | [^F,D]4 z2[F,D]2 | [G,D]4 [C,C]4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] G3A/2G/2 ^F2D2 | B2G2 ^F2G2 | [Dc]8 | B2G2 ^F2G2 |
[V:2] [D,B,]4 [D,A,]2z2 | z2[B,D]2 [A,C]2[G,B,]2 | [^F,A,]2[D,F,]2 [=E,G,]2[F,A,]2 | [G,B,]2[B,D]2 [A,C]2[G,B,]2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e6e2- | edf=e gf_ed | {cde}d2c2 {=Bcd}c2_B2 | {ABc}BAGF =EFGF |
[V:2] C,2E,2 G,2A,2 | [D,B,]4 z2F,2 | G,2C2 G,2C2 | C4 z4 |
[V:3] C,6C,2 | x6D,2 | E,4 =E,4 | F,4 x4 |
[V:1] e2.A2 .A2.A2 | !turn!B3d f2f2 | e'2a2 .a2.a2 | !turn!b3d' f'2F2 |
[V:2] A,FCF EFCF | DFB,F DFB,F | A,FCF EFCF | DFB,F DFB,F |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e2A2 .A2.A2 | !turn!B3c dBcd | !turn!e3f gabg | =efgf f_edc |
[V:2] A,FCF EFCF | DFB,F _A,FB,F | G,EB,E E,EB,E | F,DB,D F,EA,E |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ^cded fed=c | !turn!B3c dBcd | efg=a c'bag | gf=ef agf_e |
[V:2] [B,D]4 z4 | DFB,F _A,FB,F | G,EB,E E,EB,E | D,DB,D E,CG,C |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ed^cd fed=c | B4 z2cd | e2A2 .A2.A2 | B4 z2cd |
[V:2] F,DB,D F,EA,E | [B,D]F=EF GF_ED | CFEF [F,C]FEF | [B,D]F=EF GF_ED |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e2A2 .A2.A2 | [Ac]4 B2!trill!B,2 | F2B,2 B,2!trill!B,2 | F2_A,2 A,2!trill!A,2 |
[V:2] CFEF [F,C]FEF | [B,E]4 [B,D]2!trill!B,,2 | F,2B,,2 B,,2!trill!B,,2 | F,2_A,,2 A,,2!trill!A,,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] G,2B,2 E2G2 | [C-F]2[C_A]2 [_A,-D]2[A,B,]2 | [G,B,E]4 zgfe | d2z2 z_agf |
[V:2] G,,2B,,2 E,2G,2 | _A,2F,2 F,2D,2 | [E,,E,]2 [K:clef=treble] [EG]2 [EG]2z2 | z2[F_A]2 [FA]2z2 |
[V:3] x8 | _A,,4 B,,4 | x2 [K:clef=treble] x6 | x8 |
[V:1] e2ze' d'e'd'c' | =bc'_b_a gfc'b | _a2g2 zg/2f/2a/2g/2f/2e/2 | {/f}edd2 z_a/2g/2b/2a/2g/2f/2 |
[V:2] [K:clef=treble] z2[GB]2 [GB]2[GB]2 | [_Ac]4 [Bd]4 | z2[EB]2 [EG]2z2 | z2[F_A]2 [FA]2z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] {/g}fee2 ze'/2d'/2f'/2e'/2d'/2c'/2 | =bc'_b_a gfad | e4 z2fg | _a2d2 .d2.d2 |
[V:2] [K:clef=treble] z2[GB]2 [GB]2[GB]2 | [_Ac]4 [B,FA]4 | [EG]B=AB cB_AG | FB_AB [B,F]BAB |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e4 z2de | f2=B2 .B2.B2 | c4 z2[=A=a][_B_b] | [cc']2[^F^f]2 .[Ff]2.[Ff]2 |
[V:2] [K:clef=treble] EG^FG _AG=FE | DGFG [G,D]GFG | [K:clef=bass] CDED C_B,=A,G, | ^F,DA,D CDA,D |
[V:3] x8 | x8 | [K:clef=bass] x8 | x8 |
[V:1] [Gg]4 [Aa]4 | [cc']2[Bb]2 [Aa]2[Gg]2 | [^F^f]4 zd^cd | [Bg]2z2 zd^cd |
[V:2] B,DG,D ^F,DA,D | G,DB,D E,^CG,C | D,D^F,D A,DF,D | D,DG,D B,DG,D |
[V:3] x8 | x8 | x8 | x8 |
[V:1] A2z2 zd^cd | [Bg]2z2 zd^cd | A4 =B4 | c6_B2 |
[V:2] D,D^F,D A,DF,D | D,DG,D B,DG,D | D,D^F,D D,D^G,D | D,D^G,D A,D=G,D |
[V:3] x8 | x8 | x8 | x8 |
[V:1] A2a2 =B2=b2 | c2c'4_B2 | A2a2 =B2=b2 | c2c'2 ^c2^c'2 |
[V:2] D,D^F,D D,D^G,D | D,D^G,D A,D=G,D | D,D^F,D D,D^G,D | !arpeggio![D,A,D]4 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] B2G2 ^F2G2 | [Dc]8 | B2G2 ^F2G2 | [Ge]8 |
[V:2] z2[B,D]2 [A,C]2[G,B,]2 | [^F,A,]2[D,F,]2 [=E,G,]2[F,A,]2 | [G,B,]2[B,D]2 [A,C]2[G,B,]2 | C,2E,2 G,2C2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] d2^f2 g2d2 | c2^g2 a2c2 | B2=g2 A2e2 | G3A/2G/2 ^F2z2 |
[V:2] B,4 z2[B,D]2 | [^F,D]4 z2[F,D]2 | [G,D]4 [C,C]4 | [D,B,]4 [D,A,]2D2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] zdbd [ca]d[Bg]d | ^fd^cd =efga | bd[bd']d [a=c']d[gb]d | af=ef gabc' |
[V:2] [K:clef=treble] B2G2 ^F2G2 | [Dc]8 | B2G2 ^F2G2 | [=F_e]8 |
[V:3] x8 [K:clef=treble] | x8 | x8 | x8 |
[V:1] d'f[d'f']f [c'_e']f[bd']f | [ac']d[gb]d [^fa]cgB | zAed cBAG | ^FGA^G A=BcB |
[V:2] [K:clef=treble] [Bd]2B2 A2B2 | ^F2G2 D2E2 | [K:clef=bass] C6^C2 | D2z2 z4 |
[V:3] x8 | x8 | [K:clef=bass] x8 | x8 |
[V:1] c2^F2 .F2.F2 | "^♯"!turn!G3_B d2d2 | c'2^f2 .f2.f2 | "^♯"!turn!g3_b d'2D2 |
[V:2] ^F,DA,D CDA,D | _B,DG,D B,DG,D | ^F,DA,D CDA,D | B,DG,D B,DG,D |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c2^F2 .F2.F2 | "^♯"!turn!G3A =BGAB | "^♮"!turn!c3d efge | d2ed fedc |
[V:2] ^F,DA,D CDA,D | B,DG,D =F,DG,D | E,CG,C C,G,E,G, | B,,G,D,G, C,A,E,A, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] !turn!B3B dcBA | !turn!G3A =BGAB | !turn!c3d e=ef^f | g4- !turn!g3a |
[V:2] D,B,G,B, D,C^F,C | G,DB,D =F,DG,D | E,CG,C C,G,E,G, | ^C,B,=E,B, G,B,E,B, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] b4 ^C4 | D2!accent!d4^cd | ed=cB ABc^F | G2!accent!g4^cd |
[V:2] ^C,B,=E,B, G,B,C,B, | D,DG,D B,DG,D | D,DA,D CDA,D | D,DG,D B,DG,D |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ed=cB ABc^F | [K:clef=bass] G2[G,B,D]2 [G,B,D]2[G,B,D]2 | [A,CD]2[A,CD]2 [A,CD]2[A,CD]2 | [G,B,G]2[G,B,D]2 [G,B,D]2[G,B,D]2 |
[V:2] D,DA,D CDA,D | G,4 z2D,,2 | C,2^F,,2 .F,,2.F,,2 | G,,4 z2D,,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1 clef=bass] [A,CD]2[A,CD]2 [A,CD]2[A,CD]2 | [G,B,G]2[G,B,D]2 [G,B,D]2[G,B,D]2 | [A,CD]2[A,CD]2 [A,CD]2[A,CD]2 | [B,D]2G,2 [=B,F]2G,2 |
[V:2] C,2^F,,2 .F,,2.F,,2 | G,,4 z2D,,2 | C,2^F,,2 .F,,2.F,,2 | G,,8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1 clef=bass] [CE]2G,2 [E,C]2^F,2 | [D,=B,]2G,2 [=F,D]2G,2 | [E,C]2G,2 [C,^F,]2E,2 | [=B,,G,]2D,2 [C,^F,]2E,2 |
[V:2] G,,,8 | G,,8 | G,,,8 | [G,,,G,,]8 |
[V:3] x8 | x8 | x8 | x8 |
[V:1 clef=bass] [=B,,G,]2D,2 [C,^F,]2E,2 | [=B,,G,]2D,2 [B,,G,]2D,2 | [=B,,G,]4 z2z2 |]
[V:2] [G,,,G,,]8 | [G,,,G,,]4 [G,,,G,,]4 | [G,,,G,,]4 z2z2 |]
[V:3] x8 | x8 | x8 |]`;

export default {
  summary: "The first movement (Andante) of Beethoven's Sonata in G minor, Op. 49 No. 1, all 111 bars, in 2/4. Six sections: First theme (bars 1–16), Second theme (17–34, in B flat major), Development (35–64), Return (65–80, with the tune in the left hand from bar 73), Second theme in G minor (81–97) and Coda (98–111). Bar 1 holds the eighth-note pickup, so bar numbers here run one ahead of the printed ones. The edition repeats the first part, up to the B flat in bar 34; here you play it once.",
  steps: [
    "Right hand alone in the first theme, in wait mode. The tune steps B flat, G, F sharp, G, then holds a two-note chord for the whole of bars 3, 5 and 11. In bars 6–8 it leaps up and back in eighths: D, F sharp, G, D, then C, G sharp, A, C, then B flat, G, A, E flat. Bar 9 is a dotted eighth and two thirty-seconds, then F sharp and D.",
    "Left hand alone. In the first theme it plays mostly thirds and other two-note chords under the tune. In the second theme (bars 17–29) it plays sixteenth-note broken chords that keep coming back to one upper note, mostly the F above middle C, and in bars 52–63 and 81–86 mostly around the D above middle C. Keep the repeated note light and the low notes clear.",
    "Development, bars 35–64, hands separately before together. In bars 34–37 the hands play the same line an octave apart, with a trill on the last eighth of bars 34–36. Bars 39–46 put the right hand high, in sixteenths and thirty-seconds, over left-hand chords in the treble clef. In bars 52–55 the right hand plays octaves, and in bars 61–64 it jumps up an octave from A, B, C and finally C sharp.",
    "Play-along with the click at 44. Each clean pass nudges the tempo up toward 72.",
  ],
  watch: [
    "Turns and trills are shown as signs and are not graded: play the main note on time and add the ornament once the notes are secure. Over the turns in bars 82, 84 and 86 the edition prints a sharp, so the turn's lower note is F sharp; over bar 87's it prints a natural.",
    "The grace notes in bars 15–16 and the short grace notes in bars 44–45 are shown, but only their main notes are graded. Bar 92 holds a high G across the beat, with the turn printed on its tied second half.",
    "In the coda, bars 98–111, the right hand reads in the bass clef. From bar 104 its chords bring in B natural, and the movement ends on a G major chord, not G minor.",
  ],
  source: { label: "Mutopia Project — Beethoven, Sonata in G minor, Op. 49 No. 1, I. Andante (Breitkopf & Härtel, 1862–1865)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=912" },
  score: {
    bpm: 44, target: 72,
    sections: [{ name: "First theme", from: 1, to: 16 }, { name: "Second theme", from: 17, to: 34 }, { name: "Development", from: 35, to: 64 }, { name: "Return", from: 65, to: 80 }, { name: "Second theme in G minor", from: 81, to: 97 }, { name: "Coda", from: 98, to: 111 }],
    abc: ABC,
  },
};
