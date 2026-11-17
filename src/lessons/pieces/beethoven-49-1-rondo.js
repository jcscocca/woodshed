// Beethoven, Sonata in G minor, Op. 49 No. 1, II. Rondo (Allegro), from the Mutopia edition of the Breitkopf &
// Härtel 1862–1865 print (public domain), 165 bars. The original is in 6/8; here it is written in 3/4 with the same
// bars and eighths, beamed in threes. The four-eighth pickup is padded into a full first bar, so bar numbers run
// one ahead of the printed ones. Where the right hand has two voices they share one staff, the held notes tied;
// voice 3 carries the left hand's second voice in bars 98–102 and 152–153. Bars 148–149 share a line because
// abcjs drops the left hand's tie across that line break.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonata in G minor, Op. 49 No. 1: II. Rondo
C:Ludwig van Beethoven
M:3/4
L:1/16
K:G
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z4.D2 .D2.G2.A2 | B2G2.E2 .E2.A2.B2 | c2A2.e2 .d2.c2.B2 | .A2.G2.A2 {GA}_B2A2.G2 |
[V:2] z4z2 z2.[B,D]2.[A,C]2 | [G,B,]4z2 z2.[CE]2.[B,D]2 | [A,C]4z2 z2.[F,A,]2.[G,B,]2 | .[A,C]2.[B,D]2.[CE]2 [^CE]6 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] F2D2.D2 .D2.G2.A2 | B2G2.E2 .E2.A2.B2 | c2A2.e2 .d2.c2.B2 | .A2.G2.A2 D2-[DG]2.[FC]2 |
[V:2] D4z2 z2.[B,D]2.[A,=C]2 | [G,B,]4z2 z2.[CE]2.[B,D]2 | [A,C]4z2 z2.[F,A,]2.[G,B,]2 | .[A,C]2.[B,D]2.[CE]2 [D,B,]4[D,A,]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [B,G]4D2 G2B2d2 | d2[Ac]2[Ac]2 d2[GB]2[GB]2 | d2[Ac]2[Ac]2 d2[GB]2[GB]2 | d2[Ac]2[GB]2 d2[Ac]2[GB]2 |
[V:2] [G,,G,]4z2 z4z2 | z2[F,D]2[F,D]2 z2[G,D]2[G,D]2 | z2[F,D]2[F,D]2 z2[G,D]2[G,D]2 | z2[F,D]2[G,D]2 z2[F,D]2[G,D]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] !fermata![Acd]4.d2 .d2.g2.a2 | b2g2.e2 .e2.a2.b2 | c'2a2.e'2 .d'2.c'2.b2 | {/b}.a2.g2.a2 d2-[dg]2[fc]2 |
[V:2] !fermata![F,D]4z2 z2 [K:clef=treble] .[Bd]2.[Ac]2 | [GB]4z2 z2.[ce]2.[Bd]2 | [Ac]4z2 z2.[FA]2.[GB]2 | .[Ac]2.[Bd]2.[ce]2 [DB]4[DA]2 |
[V:3] x8 [K:clef=treble] x4 | x12 | x12 | x12 |
[V:1] [Bg]4d2 {/_e}d2^c2d2 | _e4d2 =c2_B2A2 | d4c2 _B2A2G2 | _E2c2_B2 A2G2^F2 |
[V:2] [K:clef=bass] [G,G]4D2 {/_E}D2^C2D2 | _E4D2 =C2_B,2A,2 | D4C2 _B,2A,2G,2 | [C,A,]6 [D,C]6 |
[V:3] x12 [K:clef=bass] | x12 | x12 | x12 |
[V:1] [K:Gm clef=treble] G4d'2 d'2^c'2.d'2 | d'2^c'2.d'2 d'2c'2.d'2 | d'2=c'2.b2 {/c'}b2a2.g2 | =f2g2.=e2 d4d2 |
[V:2] [K:Gm clef=bass] G,DB,DB,D ^F,DA,DA,D | G,DB,DB,D ^F,DA,DA,D | G,DB,DB,D G,DB,DB,D | A,DA,DA,^C D,DCD=CA, |
[V:3] x12 [K:Gm clef=bass] | x12 | x12 | x12 |
[V:1] {/e'}d'2^c'2.d'2 {/e'}d'2c'2.d'2 | {/e'}d'2^c'2.d'2 {/f'}e'2d'2.e'2 | {/f}f'6- f'2e'2d'2 | {/d'}c'2=b2c'2 e'2c'2a2 |
[V:2] G,DB,DB,D ^F,DA,DA,D | G,DB,DB,D G,EB,EB,E | A,FCFCF B,FDFDF | E,CG,CG,C F,CA,CA,C |
[V:3] x12 | x12 | x12 | x12 |
[V:1] b2d'2f'2- f'2e'2d'2 | {/d'}c'2=b2c'2 e'2c'2a2 | _b2d'2c'2 b2a2g2 | f2=e2f2 ^f2g2_e2 |
[V:2] D,DB,DB,D F,DB,DB,D | E,CG,CG,C F,ECECE | [B,D]4z2 z4z2 | z12 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] d6 {/e}d2c2d2 | e6 {/d}c2=B2c2 | f6- f2e2d2 | c2.d2.B2 A2.B2.G2 |
[V:2] z2F2F2 B,2F2F2 | C2F2F2 E2F2F2 | D2F2F2 B,2F2F2 | C2F2F2 C2=E2E2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] F6- F2G2A2 | {/c}B2A2B2 F2A2B2 | {/d}c2=B2c2 F2_B2c2 | {/e}d2c2d2 e2f2g2 |
[V:2] F,2A,2C2 _E,2A,2C2 | D,2F,2F,2 B,,2F,2F,2 | A,,2F,2F,2 F,,2F,2F,2 | B,,2F,2B,2 E,2G,2C2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] c6 {/e}d2c2d2 | e6 {/d}c2=B2c2 | f6- f2e2d2 | c2.d2.B2 A2.B2.G2 |
[V:2] F,2F2F2 B,2F2F2 | C2F2F2 E2F2F2 | D2F2F2 B,2F2F2 | C2F2F2 C2=E2E2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] F6- F2G2A2 | {/c}B2A2B2 F2A2B2 | {/d}c2=B2c2 {/e}d2c2d2 | e2f2g2 _B4dc |
[V:2] F,2A,2C2 E,2A,2C2 | D,2F,2F,2 B,,2F,2F,2 | A,,2F,2F,2 B,,2F,2F,2 | E,2G,2C2 F,2D2E2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B4z2 {/c}B2A2B2 | [B-f]4[Bf]2 [=B-f]4[Bf]2 | [c-f]4[c=e]2 {/d}c2=B2c2 | [c-_e]4[ce]2 [c-e]4[ce]2 |
[V:2] B,2D2F2 z4z2 | [K:clef=treble] [DF]6 [_DF]6 | [CG]6 z4z2 | [CG]6 [A,_G]6 |
[V:3] x12 | [K:clef=treble] x12 | x12 | x12 |
[V:1] [B-e]4[Bd]2 {/e}d2c2d2 | e6 {/d}c2=B2c2 | f6- f2^f2g2 | !turn!B6 d4c2 |
[V:2] [K:clef=treble] [B,F]6 [K:clef=bass] B,2F2F2 | C2F2F2 E2F2F2 | D2B,2B,2 E,2B,2B,2 | F,2B,2B,2 F,2A,2A,2 |
[V:3] x6 [K:clef=bass] x6 | x12 | x12 | x12 |
[V:1] B4z2 {/c}B2A2B2 | [B-f]4[Bf]2 [=B-f]4[Bf]2 | [c-f]4[c=e]2 {/d}c2=B2c2 | [c-_e]4[ce]2 [c-e]4[ce]2 |
[V:2] B,,2B,2B,2 z4z2 | D2F2F2 _D2F2F2 | C2F2F2 F2F2F2 | C2F2F2 A,2_G2G2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [B-e]4[Bd]2 {/e}d2c2d2 | e6 {/d}c2=B2c2 | f6- f2^f2g2 | !turn!B6 d4c2 |
[V:2] B,2F2F2 F2F2F2 | C2F2F2 E2F2F2 | D2B,2B,2 E,2B,2E2 | F,2B,2D2 F,2A,2E2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B4d2 {/e}d2^c2d2 | _e4d2 =c2_B2A2 | d4c2 B2A2G2 | E2c2B2 A2G2^F2 |
[V:2] [B,D]4D2 {/E}D2^C2D2 | _E4D2 =C2_B,2A,2 | D4C2 B,2A,2G,2 | [C,A,]6 [D,C]6 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] G4d'2 d'2^c'2.d'2 | d'2^c'2.d'2 d'2c'2.d'2 | d'2=c'2.b2 {/c'}b2a2.g2 | =f2g2.=e2 d4d2 |
[V:2] G,DB,DB,D ^F,DA,DA,D | G,DB,DB,D ^F,DA,DA,D | G,DB,DB,D G,DB,DB,D | A,DA,DA,^C D,DCD=CA, |
[V:3] x12 | x12 | x12 | x12 |
[V:1] {/e'}d'2^c'2.d'2 {/e'}d'2c'2.d'2 | {/e'}d'2^c'2.d'2 {/f'}e'2d'2.e'2 | {/f}f'6- f'2e'2d'2 | {/e}e'6- e'2d'2c'2 |
[V:2] G,DB,DB,D ^F,DA,DA,D | G,DB,DB,D G,EB,EB,E | A,FCFCF B,FDFDF | G,EB,EB,E A,ECECE |
[V:3] x12 | x12 | x12 | x12 |
[V:1] {/d}d'6- d'2c'2b2 | a2b2c'2 ^f2g2a2 | g4.D2 .D2.G2.A2 | B2G2z2 .D2.A2.B2 |
[V:2] ^F,DA,DA,D G,DB,DB,D | C,A,E,A,E,A, D,A,^F,A,F,A, | G,,2G,2z2 z4z2 | z4.D2 z4z2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] c2A2z2 .D2.G2.A2 | [K:G clef=treble] B2G2.E2 .E2.A2.B2 | c2A2.e2 .d2.c2.B2 | .A2.G2.A2 {GA}_B2A2.G2 |
[V:2] z4.D2 z2.[=B,D]2.[A,C]2 | [K:G clef=bass] [G,B,]4z2 z2.[CE]2.[B,D]2 | [A,C]4z2 z2.[F,A,]2.[G,B,]2 | .[A,C]2.[B,D]2.[CE]2 [^CE]6 |
[V:3] x12 | [K:G clef=bass] x12 | x12 | x12 |
[V:1] F2D2.D2 .D2.G2.A2 | B2G2.E2 .E2.A2.B2 | c2A2.e2 .d2.c2.B2 | .A2.G2.A2 D2-[DG]2.[FC]2 |
[V:2] D4z2 z2.[B,D]2.[A,=C]2 | [G,B,]4z2 z2.[CE]2.[B,D]2 | [A,C]4z2 z2.[F,A,]2.[G,B,]2 | .[A,C]2.[B,D]2.[CE]2 [D,B,]4[D,A,]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [B,G]4D2 G2B2d2 | d2[Ac]2[Ac]2 d2[GB]2[GB]2 | d2[Ac]2[Ac]2 d2[GB]2[GB]2 | d2[Ac]2[GB]2 d2[Ac]2[GB]2 |
[V:2] [G,,G,]4z2 z4z2 | z2[F,D]2[F,D]2 z2[G,D]2[G,D]2 | z2[F,D]2[F,D]2 z2[G,D]2[G,D]2 | z2[F,D]2[G,D]2 z2[F,D]2[G,D]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] !fermata![Acd]4.d2 .d2.g2.a2 | b2g2.e2 .e2.a2.b2 | c'2a2.e'2 .d'2.c'2.b2 | {/b}.a2.g2.a2 d2-[dg]2.[fc]2 |
[V:2] !fermata![F,D]4 [K:clef=treble] z2 z2.[Bd]2.[Ac]2 | [GB]4z2 z2.[ce]2.[Bd]2 | [Ac]4z2 z2.[FA]2.[GB]2 | .[Ac]2.[Bd]2.[ce]2 [DB]4[DA]2 |
[V:3] x4 [K:clef=treble] x8 | x12 | x12 | x12 |
[V:1] [gB]4z2 z2.c'2.b2 | .a2.g2.f2 B2-[Be]2.[^dA]2 | [G-f]2[Ge]2.a2 .g2.=f2.e2 | .d2.c2.d2 G2-[Gc]2.[B=F]2 |
[V:2] [K:clef=treble] [G,G]4.c2 .B2.A2.G2 | .F2.E2.F2 G4F2 | E4z2 z2.A2.G2 | .=F2.E2.F2 [K:clef=bass] E4D2 |
[V:3] x12 [K:clef=treble] | x6 B,6 | x12 | x6 [K:clef=bass] G,6 |
[V:1] [E-d]2[E-c]2.[Ec]2 E2-[EA]2.[^GD]2 | [C-B]2[CA]2.A2 D2-[D=G]2.[^FC]2 | [B,-A]2[B,-G]2.[B,G]2 [G,-D]2[G,-^C]2.[G,C]2 | [F,D]4z2 {/c}B2A2B2 |
[V:2] C4z2 C4B,2 | A,4z2 B,4A,2 | [G,,G,]6 [A,,E,]6 | D,,2D,2D,2 G,,2D,2D,2 |
[V:3] C,4x2 E,6 | A,,4x2 D,6 | x12 | x12 |
[V:1] c6 {/B}A2^G2A2 | d6- d2c2B2 | A2B2.G2 F2G2.E2 | D6- D2E2F2 |
[V:2] A,,2D,2D,2 C,2D,2D,2 | B,,2D,2D,2 G,,2D,2D,2 | A,,2D,2D,2 A,,2^C,2C,2 | D,,2D,2D,2 =C,2D,2D,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] {/A}G2F2G2 D2F2G2 | {/B}A2^G2A2 D2=G2A2 | {/c}B2A2B2 c2d2e2 | A4z2 {/c'}b2a2b2 |
[V:2] B,,2D,2D,2 G,,2D,2D,2 | F,,2D,2D,2 D,,2D,2D,2 | G,,2D,2G,2 C,2E,2A,2 | D,2D2D2 G,2D2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] c'6 {/b}a2^g2a2 | d'6- d'2c'2b2 | a2b2.g2 f2g2.e2 | d6- d2e2f2 |
[V:2] A,2D2D2 C2D2D2 | B,2D2D2 G,2D2D2 | A,2D2D2 A,2^C2C2 | D,2D2D2 =C2D2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] {/a}g2f2g2 d2f2g2 | {/b}a2^g2a2 {/c'}b2a2b2 | {/d'}c'2b2c'2 e'4f2 | g4z2 {/A}G2F2G2 |
[V:2] B,2D2D2 G,2D2D2 | F,2A,2D2 G,2B,2D2 | C,2E,2A,2 [D,F,]2A,2C2 | G,2B,2D2 z4z2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [G-d]4[Gd]2 [^G-d]4[Gd]2 | [A-d]4[A^c]2 {/B}A2^G2A2 | [A-=c]4[Ac]2 [A-c]4[Ac]2 | [G-c]4[GB]2 {/c}B2A2B2 |
[V:2] [B,D]6 [_B,D]6 | [A,E]6 z4z2 | [A,E]6 [F,_E]6 | [G,D]6 G,2D2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] c6 {/B}A2^G2A2 | d6- d2^d2e2 | !turn!G6 B4A2 | G4z2 {/A}G2F2G2 |
[V:2] A,2D2D2 C2D2D2 | B,2G,2G,2 C,2G,2G,2 | D,2G,2G,2 D,2F,2F,2 | G,,2G,2G,2 z4z2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [G-d]4[Gd]2 [^G-d]4[Gd]2 | [A-d]4[A^c]2 {/B}A2^G2A2 | [A-=c]4[Ac]2 [A-c]4[Ac]2 | [G-c]4[GB]2 {/c}B2A2B2 |
[V:2] B,2D2D2 _B,2D2D2 | A,2E2E2 E2E2E2 | A,2E2E2 F,2_E2E2 | G,2D2D2 D2D2D2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] c6 {/B}A2^G2A2 | d6- d2^d2e2 | !turn!G6 B4A2 | G4.D2 .D2.G2.A2 |
[V:2] A,2D2D2 C2D2D2 | B,2A,2G,2 C,2G,2C2 | D,2G,2B,2 D,2F,2C2 | [G,B,]4z2 z2.[B,D]2.[A,C]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B2G2.D2 .D2.A2.B2 | c2A2z2 z2.[Bd]2.[Ac]2 | [GB]2D2z2 z2.[Ac]2.[GB]2 | [FA]2D2.D2 .D2.G2.A2 |
[V:2] [G,B,]4z2 z2.[A,C]2.[G,B,]2 | [F,A,]4.D,2 .D,2.G,2.A,2 | B,4.D,2 .D,2.A,2.B,2 | C4z2 z2.[B,D]2.[A,C]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] B2G2.E2 .E2.A2.B2 | c2A2.e2 .d2.c2.B2 | A2G2z2 z2.e2.[dg]2 | [cf]2[Bg]2.e2 .d2.c2.B2 |
[V:2] [G,B,]4z2 z2.[CE]2.[B,D]2 | [A,C]4z2 z2.[F,A,]2.[G,B,]2 | [A,C]2[B,D]2.E2 .D2.C2.B,2 | A,2G,2z2 z2.[F,A,]2.[G,B,]2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] A2G2z2 z2.e2.[dg]2 | [cf]2[Bg]2z2 [^e^g]2[fa]2z2 | [f^a]2[=gb]2z2 [^gb]2[=ac']2z2 | [f-a-c'-c-]6 [fac'c-]4[c-a]2 | !fermata![cf]4z2 z4z2 |
[V:2] [A,C]2[B,D]2.E2 .D2.C2.B,2 | A,2G,2.D2 z4.D2 | z2z2.D2 z2z2.D2 | [D,-F,-A,-D-]12 | !fermata![D,F,A,D]4.D,,2 .D,,2.A,,2.B,,2 |
[V:3] x12 | x12 | x12 | x12 | x12 |
[V:1] [D-F,]2[D-A,]2[DF,]2 [D-G,]2[D-B,]2[DG,]2 | [F-C]2[F-D]2[FC]2 [G-B,]2[G-D]2[GB,]2 | z2E2^G2 A2c2A2 | [D-=G]2[D-B]2[DG]2 [C-F]2[C-A]2[CF]2 |
[V:2] C,6 B,,6 | A,,6 G,,6 | z4z2 C6 | B,6 A,6 |
[V:3] x12 | x12 | C,12 | D,6 D,6 |
[V:1] [B,G]4D2 D2A2B2 | .c4d2 d2a2b2 | .c'4D2 D2d2c2 | .B4d2 d2d'2c'2 |
[V:2] G,,2D,2G,2 G,,2D,2G,2 | G,,2D,2F,2 G,,2D,2F,2 | G,,2D,2F,2 G,,2D,2F,2 | G,,2D,2G,2 G,,2D,2G,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] .b4D2 D2A2B2 | .c4d2 d2a2b2 | .c'4D2 D2d2c2 | .B4z2 d2d'2c'2 |
[V:2] G,,2D,2G,2 G,,2D,2G,2 | G,,2D,2F,2 G,,2D,2F,2 | G,,2D,2F,2 G,,2D,2F,2 | G,,2D,2G,2 G,,2D,2G,2 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] .b4z2 D2d2c2 | .B4z2 d2d'2c'2 | b4z2 [Bdgb]4z2 | [GBdg]4z2 !fermata!z4z2 |]
[V:2] G,,2D,2G,2 G,,2D,2F,2 | G,,2D,2G,2 G,,2D,2F,2 | G,,2D,2G,2 G,,2D,2G,2 | G,,4z2 !fermata!z4z2 |]
[V:3] x12 | x12 | x12 | x12 |]`;

export default {
  summary: "The second movement (Rondo, Allegro) of Beethoven's Sonata in G minor, Op. 49 No. 1, all 165 bars, in G major with a long middle part in G minor. The original is in 6/8; here it is written in 3/4 with the same eighth notes, so each bar is two groups of three. Bar 1 holds the four-eighth pickup, so bar numbers here run one ahead of the printed ones. Eight sections: Refrain (bars 1–20), G minor theme (21–32), Dolce in B flat (33–64), G minor theme again (65–81), Refrain again (82–103), Dolce in G (104–135), Refrain last time (136–149) and Coda (150–165).",
  steps: [
    "Right hand alone in the Refrain, in wait mode. Most notes are short staccato eighths; the slurred pairs, such as B to G and C to A, are the connected ones. In bar 4 two grace notes, G and A, lead to a B flat. Bars 10–12 alternate a repeated D with two-note chords, and bars 13–16 bring the tune back an octave higher.",
    "Left hand alone. In the Refrain it plays mostly short two-note chords, in the bass clef until bar 13 and the treble clef for bars 13–16. In the G minor theme (bars 21–30 and 69–78) it plays sixteenth-note broken chords, and under the dolce themes (bars 33–49 and 104–120) eighths that mostly go from a bass note to a repeated upper note.",
    "Hands together, a section at a time. In the dolce themes the right hand often holds a long note, then answers with a grace note and three eighths. In bars 50–53, 58–61, 121–124 and 129–132 it keeps a lower note down under repeated upper notes. In bars 17–19 and 65–67 the hands mostly play the same line an octave apart.",
    "Play-along with the click at 88. Each clean pass nudges the tempo up toward 144.",
  ],
  watch: [
    "The edition is in 6/8 and is felt in two: each 3/4 bar here is two groups of three eighths, so count two dotted-quarter beats a bar, not three quarters.",
    "Bars 21–81 have the G minor key signature, B flat and E flat (the dolce theme in bars 33–64 is in B flat major), F sharp and C sharp written in, and E natural in bars such as 24, 51 and 72. The key returns to G major at bar 82.",
    "Grace notes come every few bars in the minor and dolce sections, and turns in bars 56, 64, 127 and 135; they are shown, but only the main notes are graded. In most of bars 156–163 the right hand leaps an octave or more, as far as from the high C down to the D above middle C in bar 156.",
  ],
  source: { label: "Mutopia Project — Beethoven, Sonata in G minor, Op. 49 No. 1, II. Rondo (Breitkopf & Härtel, 1862–1865)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=913" },
  score: {
    bpm: 88, target: 144,
    sections: [{ name: "Refrain", from: 1, to: 20 }, { name: "G minor theme", from: 21, to: 32 }, { name: "Dolce in B flat", from: 33, to: 64 }, { name: "G minor theme again", from: 65, to: 81 }, { name: "Refrain again", from: 82, to: 103 }, { name: "Dolce in G", from: 104, to: 135 }, { name: "Refrain last time", from: 136, to: 149 }, { name: "Coda", from: 150, to: 165 }],
    abc: ABC,
  },
};
