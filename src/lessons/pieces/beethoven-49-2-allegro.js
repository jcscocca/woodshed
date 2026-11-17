// Beethoven, Sonata in G, Op. 49 No. 2, I. Allegro ma non troppo, from the Mutopia edition of the Breitkopf & Härtel
// print (public domain), 122 bars. The edition is in cut time (2/2); here it is written in 4/4 with the same bars
// and note values. The exposition's repeat is played once. The left hand's two voices in bars 42–43 and 66 use voice 3;
// in bars 100–101 its held C is tied in one voice. The left hand's clef is restated at the start of each line.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonata in G, Op. 49 No. 2: I. Allegro ma non troppo
C:Ludwig van Beethoven
M:4/4
L:1/8
K:G
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] [B,DG]4 (3DGB (3dcA | G2G2F2G2 | A3A B3B | d2!trill!c2 {Bc}B2 z2 |
[V:2] [G,,G,]4 z4 | z2B,2A,2G,2 | F,2D,2G,2=F,2 | E,2F,2G,G,B,D |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [Bdg]4 (3dgb (3d'c'a | g2g2f2g2 | a3a b3b | d'2!trill!c'2 {bc'}bc'^c'd' |
[V:2] [G,G]4 z4 | z2 [K:clef=treble] BdAdGd | FdDdGd=Fd | EG^FA G2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ^d'e' ze'=d'c'ba | ^c'd' zd'=c'bag | fedc BAGF | !turn!G3A Bc^cd |
[V:2] [K:clef=treble] z2[CEA]2 z4 | z2[B,DG]2 z4 | [K:clef=bass] C2 z2 D2 z2 | G,2 z2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ^de ze=dcBA | ^de ze e^cAG | F2 (3afd =c2 (3afc | B2 (3gdB G2 (3dBG |
[V:2] z2[C,E,A,]2 z4 | z2[^C,E,A,]2 z4 | (3D,F,A, (3D,F,A, (3D,F,A, (3D,F,A, | (3D,G,B, (3D,G,B, (3D,G,B, (3D,G,B, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] F2 (3afd c2 (3afc | B2 (3gdB G2 (3dBG | D2 (3dBG D2 (3dBG | D2 z2 zAAA |
[V:2] (3D,F,A, (3D,F,A, (3D,F,A, (3D,F,A, | (3D,G,B, (3D,G,B, (3D,G,B, (3D,G,B, | (3D,F,A, (3D,G,B, (3D,F,A, (3D,G,B, | [D,F,]2 z2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] d2^c2d2e2 | gfe2 zAAA | e2d2[^ce]2[df]2 | [ea]g[df]2 zagf |
[V:2] [K:clef=treble] FAGA FA^CA | DA^CA A,2 z2 | GAFA EADA | ^CADA D2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] fe.e.e.dagf | fe.e.e.dagf | fe ze ed zd | d^cBA ^GAB^c |
[V:2] [K:clef=treble] [GB]4[FA]2 z2 | [GB]4[FA]2 z2 | z2G2 z2^G2 | A2A,2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] d2^c2d2e2 | [dg]f[^ce]2 zAAA | e2d2[^ce]2[df]2 | [ea]g[df]2 zagf |
[V:2] [K:clef=treble] FAGA FA^CA | DAA,A A,2 z2 | GAFA EADA | ^CADA D2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] fe.e.e.dagf | fe.e.e.dagf | fege ed d^c | {d}(3agf (3ed^c (3BAG (3FED |
[V:2] [K:clef=treble] [GB]4[FA]2 z2 | [GB]4[FA]2 z2 | [K:clef=bass] z2G,2A,2A,,2 | D,2 z2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ^C2C2C2C2 | (3DEF (3GAB (3^cde (3fga | g2g2g2g2 | {f}(3agf (3ed^c (3BAG (3FED |
[V:2] (3E,G,A, (3E,G,A, (3E,G,A, (3E,G,A, | [D,F,]2 z2 z4 | (3^C,E,A, (3^C,E,A, (3^C,E,A, (3^C,E,A, | D,2 z2 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] =C2C2C2C2 | (3B,EG (3BGE D2 {F}E2 | (3DEF (3GAB (3^cde (3fga | [gb]8 |
[V:2] (3D,F,A, (3D,F,A, (3D,F,A, (3D,F,A, | z2G,2F,2G,2 | F,2 z2 z4 | [K:clef=treble] (3zG,A, (3B,^CD (3EFG (3AB^c |
[V:3] x8 | G,,4 A,,2A,,2 | D,2 x6 | x8 |
[V:1] .[fa]2.[eg]2.[df]2.[^ce]2 | (3agf (3ed^c (3BAG (3FED | [GB]8 | .[FA]2.[EG]2.[DF]2.[^CE]2 |
[V:2] [K:clef=treble] .d2.G2.A2.A,2 | z8 | [K:clef=bass] (3zG,,A,, (3B,,^C,D, (3E,F,G, (3A,B,^C | .D2.G,2.A,2.A,,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] D2 (3afd ^c2 (3ge^c | d2 (3AFD ^C2 (3GE^C | D2 (3GE^C D2 (3GE^C | D2[F,A,D]2[F,A,D]2 z2 |
[V:2] (3D,F,A, (3D,F,A, (3D,G,A, (3D,G,A, | (3D,F,A, (3D,F,A, (3D,G,A, (3D,G,A, | (3D,F,A, (3D,G,A, (3D,F,A, (3D,G,A, | [D,F,]2[D,,D,]2[D,,D,]2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [d-=FA]4 (3[d]=fe (3d=cB | A2^G2A2B2 | c2d2e2d2 | {ce}a4- (3ac'b (3agf |
[V:2] [D,D]4 z4 | [K:clef=treble] zEDE CE^G,E | A,EB,E CEB,E | (3A,CE (3AEC A,2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] e2^d2e2f2 | g3f/g/ agfe | ^d2 z[gb] [fa]2 z[^df] | [eg]2 z[eg] [^df]2[eg]2 |
[V:2] [K:clef=treble] zBAB GB^DB | EBEB C^AC^A | B,BBB BBBB | BBBB BBBB |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [^df]2 z[gb] [fa]2 z[^df] | [eg]2 z[eg] [^df]2[eg]2 | [^df]2 z2 z4 | [eg]2 z2 z4 |
[V:2] [K:clef=treble] B,BBB BBBB | BBBB BBBB | B^AB^A B=AGF | [K:clef=bass] E^DE^D E=DCB, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c'bc'b c'bag | fedc BAGF | [B,DG]4 (3DGB (3dcA | G2G2F2G2 |
[V:2] A,^G,A,^G, A,=G,F,E, | z4 C4 | [G,,G,]4 z4 | z2B,2A,2G,2 |
[V:3] x8 | D,8 | x8 | x8 |
[V:1] A3A B3B | d2!trill!c2 {Bc}B2 z2 | [Bdg]4 (3dgb (3d'c'a | g2g2f2g2 |
[V:2] F,2D,2G,2=F,2 | E,2F,2G,G,B,D | [G,G]4 z4 | z[K:clef=treble] dBd AdGd |
[V:3] x8 | x8 | x8 | x8 |
[V:1] a2 za b2 zb | c'ga=f egfd | {c}(3g=fe (3dcB (3AG=F (3EDC | B,2B,2B,2B,2 |
[V:2] [K:clef=treble] FdDd Gd=Fd | E2=F2G2G,2 | C2 z2 z4 | [K:clef=bass] (3D,=F,G, (3D,=F,G, (3D,=F,G, (3D,=F,G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] (3CDE (3=FGA (3Bcd (3e=fg | =f2f2f2f2 | (3edc (3BAG (3=FED (3CB,A, | ^G,2G,2G,2G,2 |
[V:2] C,2 z2 z4 | (3B,,D,G, (3B,,D,G, (3B,,D,G, (3B,,D,G, | C,2 z2 z4 | (3B,,D,E, (3B,,D,E, (3B,,D,E, (3B,,D,E, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] A,2A4=G2 | ^F2 (3afd =c2 (3afc | B2 (3gdB G2 (3dBG | F2 (3afd =c2 (3afc |
[V:2] (3C,E,A, (3C,E,A, (3^C,E,A, (3^C,E,A, | (3D,F,A, (3D,F,A, (3D,F,A, (3D,F,A, | (3D,G,B, (3D,G,B, (3D,G,B, (3D,G,B, | (3D,F,A, (3D,F,A, (3D,F,A, (3D,F,A, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] B2 (3gdB G2 (3dBG | D2 (3dBG D2 (3dBG | D2 z2 zDDD | G2F2G2A2 |
[V:2] (3D,G,B, (3D,G,B, (3D,G,B, (3D,G,B, | (3D,F,A, (3D,G,B, (3D,F,A, (3D,G,B, | D,2 z2 z4 | B,DCD B,DF,D |
[V:3] x8 | x8 | x8 | x8 |
[V:1] cBA2 zDDD | A2G2[FA]2[GB]2 | [Ad]c[GB]2 zdcB | BA.A.A.GdcB |
[V:2] G,DF,D D,2 z2 | CDB,D A,DG,D | F,DG,D G,2 z2 | [CE]4[B,D]2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] BA.A.A.GdcB | BA zA AG zG | .F.G.A.B .c.d.e.f | g2f2g2a2 |
[V:2] [CE]4[B,D]2 z2 | z2[CE]2 z2[^CE]2 | D2 z2 z4 | [K:clef=treble] Bdcd BdFd |
[V:3] x8 | x8 | x8 | x8 |
[V:1] c'ba2 zddd | a2g2[fa]2[gb]2 | [ad']c'[gb]2 zd'c'b | ba.a.a.gd'c'b |
[V:2] [K:clef=treble] GdFd D2 z2 | cdBd AdGd | FdGd Gz z2 | [c-e]2[cf]2[Bd]2 z2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] ba.a.a.gd'c'b | bac'a agg f | {g}(3d'c'b (3agf (3edc (3BAG | F2F2F2F2 |
[V:2] [K:clef=treble] [c-e]2[cf]2[Bd]2 z2 | z2c2d2D2 | G2 z2 z4 | [K:clef=bass] (3A,CD (3A,CD (3A,CD (3A,CD |
[V:3] x8 | x8 | x8 | x8 |
[V:1] (3GAB (3cde (3fga (3bc'd' | c'2c'2c'2c'2 | {b}(3d'c'b (3agf (3edc (3BAG | =F2F2F2F2 |
[V:2] [G,B,]2 z2 z4 | (3F,A,D (3F,A,D (3F,A,D (3F,A,D | [G,B,]2 z2 z4 | (3B,,D,G, (3B,,D,G, (3B,,D,^G, (3B,,D,^G, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] (3EAc (3ecA =G2!trill!A2 | (3GAB (3cde (3fga (3bc'd' | [c'e']8 | .[bd']2.[ac']2.[gb]2.[fa]2 |
[V:2] (3C,E,A, (3C,E,A, (3D,G,B, (3D,F,C | G,2 z2 z4 | [K:clef=treble] (3zCD (3EFG (3ABc (3def | .g2.c2.d2.D2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] (3d'c'b (3agf (3edc (3BAG | [ce]8 | .[Bd]2.[Ac]2.[GB]2.[FA]2 | G2 (3d'bg f2 (3c'af |
[V:2] [K:clef=treble] z8 | [K:clef=bass] (3zC,D, (3E,F,G, (3A,B,C (3DEF | .G2.C2.D2.D,2 | (3G,,B,,D, (3G,,B,,D, (3G,,C,D, (3G,,C,D, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] g2 (3dBG F2 (3cAF | G2 (3d'bg f2 (3c'af | g2 (3dBG F2 (3cAF | G2 (3cAF G2 (3cAF |
[V:2] (3G,,B,,D, (3G,,B,,D, (3G,,C,D, (3G,,C,D, | (3G,,B,,D, (3G,,B,,D, (3G,,C,D, (3G,,C,D, | (3G,,B,,D, (3G,,B,,D, (3G,,C,D, (3G,,C,D, | (3G,,B,,D, (3G,,C,D, (3G,,B,,D, (3G,,C,D, |
[V:3] x8 | x8 | x8 | x8 |
[V:1] G2 z2 [Acdf]2 z2 | [Bdg]2 z2 !fermata!z4 |]
[V:2] G,,2 z2[D,,D,]2 z2 | [G,,,G,,]2 z2 !fermata!z4 |]
[V:3] x8 | x8 |]`;

export default {
  summary: "The first movement, Allegro ma non troppo, of Beethoven's Sonata in G, Op. 49 No. 2, all 122 bars, in G major. The edition is in cut time (2/2); here it is written in 4/4 with the same bars and note values, so the click counts quarters. Triplets run through it: broken chords and long runs in the right hand, broken chords in the left. Three sections: Exposition (bars 1–52, with the second theme in D major from bar 20), Development (53–66) and Recapitulation (67–122, the second theme now in G from bar 87). The edition repeats the exposition; here it is played once.",
  steps: [
    "Right hand alone in the exposition, in wait mode. Bar 1 is a G chord, then two triplets that climb and turn, D–G–B and D–C–A. In bars 15–19 each quarter note is followed by a triplet that falls from high up; count each triplet as one beat.",
    "Left hand alone. It plays triplet broken chords in bars 15–19 and 49–51 and in most of bars 76–86, and mostly eighths in the treble clef in bars 21–24 and 29–32, where the lower note changes under a repeated A.",
    "Hands together, a section at a time. In bars 36–41 the right hand alternates triplet runs, down from the high A to the D above middle C in bars 36 and 40 and back up in bar 38, with bars of repeated quarter notes over the left hand's triplet chords.",
    "Play-along with the click at 88. Each clean pass nudges the tempo up toward 144.",
  ],
  watch: [
    "The edition is in cut time, felt in two half-note beats; here the click counts quarters. Keep every triplet even, three notes to each click.",
    "The development turns to the minor: F natural and C natural in bar 53, G sharp in bar 54, then D sharp in bars 57 and 59–64 and A sharp in bars 58 and 63. In the recapitulation, bars 74–79 have F natural and bar 80 G sharp, and bar 108 has both.",
    "Bars 4, 8, 70 and 109 have a trill and bar 12 a turn, and several runs start with a small grace note, as in bars 36 and 40. The app grades the main notes, so play them plain first and add the ornaments once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Beethoven, Sonata in G, Op. 49 No. 2, I. Allegro ma non troppo (Breitkopf & Härtel)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=776" },
  score: {
    bpm: 88, target: 144,
    sections: [{ name: "Exposition", from: 1, to: 52 }, { name: "Development", from: 53, to: 66 }, { name: "Recapitulation", from: 67, to: 122 }],
    abc: ABC,
  },
};
