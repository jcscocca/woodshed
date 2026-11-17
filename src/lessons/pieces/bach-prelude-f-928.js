// Bach, Little Prelude in F, BWV 928, from the Mutopia edition of the Bach-Gesellschaft print (public domain),
// 24 bars. The right hand's two voices share one staff and are folded into chords; a note held while the other
// voice moves is tied over, so every note keeps its length. The left hand's second voice (bars 6–9 and 20)
// is voice 3.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Little Prelude in F
C:Johann Sebastian Bach
M:4/4
L:1/16
K:F
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] zFAc BGcG !mordent!A2[Acf]2 [Gdf]2[Gce]2 | [Fcf]2c2 f2[Adf]2 [=Bdf]dBG e2[Gce]2 | [Ace]Ace adcd =BGBd gcBc |
[V:2] z8 zF,A,C B,G,CG, | A,CA,F, D,DCD G,=B,G,E, C,CB,C | F,4 z2[F,A,D]2 [F,G,D]4 z2[E,G,C]2 |
[V:3] x8 x8 | x8 x8 | x8 x8 |
[V:1] AFAc [f-][f-=B][f-c][f-d] [fG-][G-f][Ge-][e-G] [eF-][F-e][Fd-][d-F] | [dE-][E-G][Ec-][c-E] [cD-][c-D][cF-][=BF] [Ec]2[egc']2 [dac']2[dg=b]2 | [cgc']ceg fdgd ecfa dbab | cAdf Bgfg AFBd Gede |
[V:2] [E,F,C]2E2 D2C2 =B,2C2 A,2B,2 | C2E,2 F,2G,2 zC,E,G, F,D,G,D, | z2E2 D4 C4 B,4 | A,4 G,4 F,4 E,4 |
[V:3] x8 x8 | x8 x8 | E,2C4_B,4A,4G,2- | G,2F,4E,4D,4^C,2 |
[V:1] F2[FAd]2 [EBd]2[EA^c]2 [DAd]DFA GEAE | FDFA dABG ^FDFA dBcA | BDGB dBcA ^GEG=B dcdB | c2[Ac]2 [A=B]2[^GB]2 [=Ge]2[^FA]2 [=FG]2[EG]2 |
[V:2] zD,F,A, G,E,A,E, z2[F,A,]2 [E,B,]2[E,A,]2 | A,2z2 z2D2 C2A,2 ^F,2D,2 | G,2z2 F,2z2 E,F,E,D, C,A,=B,,^G, | A,A,,C,E, D,=B,,E,B,, ^C,E,D,=C, B,,G,,C,G,, |
[V:3] x8 F,2D,2 D,2^C,2 | D,2x2 x4 x8 | x8 x8 | x8 x8 |
[V:1] [_Ec]2[DF]2 [D=E]2[^CE]2 [=C-A][CD]E=F [=B,-][=B,F]ED | [C-][CF]GA [D-][DA]GF [E-][EA]=Bc [F-][Fc]BA | ^GEG=B eA=GA FDFA dGFG |
[V:2] A,,C,=B,,A,, ^G,,E,,A,,E,, ^F,,2z2 G,,2z2 | A,,2z2 =B,,2z2 C,2z2 D,2z2 | E,2D,2 ^C,2A,2 D,2=C,2 =B,,2G,2 |
[V:3] x8 x8 | x8 x8 | x8 x8 |
[V:1] ECEG [c-][c-A][c-F][c-E] [cD-][D-c][D=B-][B-D] [BC-][C-B][CA-][A-C] | [A=B,-][B,-A][B,-^G][B,A] [=B-G][BE][c-A][cE] [d-B][dE][A-c][Ad] [=G-B]3[GA] | AEA=B [c-][c-A][c-_B][cG] ^FADF AcBA | BGBd cAdA B2[Bdg]2 [A_eg]2[Ad^f]2 |
[V:2] C,2=B,,2 A,,2G,,2 ^F,,2^G,,2 A,,2C,2 | D,4 zC,=B,,A,, ^G,,2A,,2 E,2E,,2 | A,,4 z2A,2 D,2E,2 ^F,2D,2 | G,2G4^F2 GG,B,D CA,B,A, |
[V:3] x8 x8 | x8 x8 | x8 x8 | x8 x8 |
[V:1] [g-Gd][g]ba gfed ceGc EdcB | A2[Acf]2 [DGf]2[Gce]2 [Fcf]FAc BGcG | AFAc d2[FBd]2 [GBd]BGE c2c2 | [FAc]DFA dGFG ECEG cFEF |
[V:2] B,D,G,A, B,G,A,F, E,G,C,E, G,B,A,G, | F,F,,A,,C, B,,G,,A,,G,, z2[A,C]2 [G,D]2[G,C]2 | F,A,F,D, B,,B,A,B, E,G,E,C, A,,A,G,A, | D,2C2 B,2G,2 C,2B,2 A,2F,2 |
[V:3] x8 x8 | x8 A,,2F,2 F,2E,2 | x8 x8 | x8 x8 |
[V:1] DB,DF [B-][B-E][B-F][B-G] [BC-][C-B][CA-][A-C] [AB,-][B,-A][B,G-][G-B,] | [GA,-][A,-C][A,F-][F-A,] [FG,-][F-G,][FB,-C-][EB,C] [A,CF]8 |]
[V:2] B,,2A,2 G,2F,2 E,2F,2 D,2E,2 | F,2A,,2 B,,2C,2 F,,8 |]
[V:3] x8 x8 | x8 x8 |]`;

export default {
  summary: "Bach's Little Prelude in F major, BWV 928, all 24 bars in 4/4. A short sixteenth-note figure is passed between the hands, and the right hand often plays two voices at once; where one voice holds a note while the other moves, the held note is tied. Four sections: Opening (bars 1–5), which leads to C major; Sequences (6–12), through D minor toward A minor; To A minor (13–17); and Return (18–24), where the opening comes back in F in bar 20.",
  steps: [
    "Right hand alone in Opening, in wait mode. Bars 1–3 mix sixteenths with three-note chords. From beat 2 of bar 4 the two voices take turns: one holds a note over the beat while the other moves, so play only the new note and keep the tied one down. Bars 15–16 and 23–24 do the same.",
    "Left hand alone. It enters on beat 3 of bar 1 with the right hand's opening figure an octave lower. Bars 3–4, 8 and 20 have two- and three-note chords, and in bars 6–7 it plays two voices: quarter notes on top, a lower line that moves off the beat underneath.",
    "Hands together one section at a time. In bars 10 and 12–13 the left hand plays eighths separated by rests; count the rests so the right hand's sixteenths stay even.",
    "Play-along with the click at 46. Each clean pass nudges the tempo up toward 76.",
  ],
  watch: [
    "The middle of the piece leaves F major: bars 7–18 bring in C sharp, F sharp, G sharp and B natural, and E flat in bars 12 and 18. B natural also appears in bars 2–5, where the music turns to C major.",
    "Bar 1 has the piece's only ornament, a mordent on the A: A, the G below and A again, quickly on the beat. The grading counts the A.",
  ],
  source: { label: "Mutopia Project — Bach, Little Prelude in F, BWV 928 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=63" },
  score: {
    bpm: 46, target: 76,
    sections: [{ name: "Opening", from: 1, to: 5 }, { name: "Sequences", from: 6, to: 12 }, { name: "To A minor", from: 13, to: 17 }, { name: "Return", from: 18, to: 24 }],
    abc: ABC,
  },
};
