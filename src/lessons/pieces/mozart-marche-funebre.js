// Mozart, "Marche funebre del Sig. Maestro Contrapunto", K. 453a (1784), from the Mutopia edition of the
// autograph (public domain), 16 bars. The autograph is in cut time; this score counts it in 4/4.
// Bars 11–12 hold three right-hand voices, folded into one with ties.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Marche funebre
C:Wolfgang Amadeus Mozart
M:4/4
L:1/16
K:Cm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] [CEGc]4 [CEG]3[CEG] [CEG]4 [DFG]4 | [CEG]4 [Ge]2[^Fd]2 [Af]2[Ge]2 [=Fd]2[Ec]2 | [=Bdg]4 [DG]3[DG] [EG]4 [C^F]4 | [=B,G]4 [=Bd]2[ce]2 [eg]2[df]2 [ce]2[=Bd]2 |
[V:2] [C,,C,]4 [C,,C,]4 [E,,E,]4 [=B,,,=B,,]4 | [C,,C,]4 z12 | [G,,,G,,]4 [=B,,,=B,,]4 [C,,C,]4 [A,,,A,,]4 | [G,,,G,,]4 z12 |
[V:1] [ce]2[Ge]4 [Ge]4 [Ae]4 [=Ae]2 | [Bd]2[da]4 [ea]4 [=ea]4 [fa]2 | [B-a]2[Bg]2 z2[Af]2 [Af]2[Ge]2 z2[Fd]2 | [FAd]8 [GBe]4 z4 |
[V:2] [C,,C,]4 [C,,C,]4 [_C,,_C,]4 [_C,,_C,]4 | [B,,,B,,]4 [C,,C,]4 [^C,,^C,]4 [D,,D,]4 | [E,,E,]4 A,4 B,4 B,,4 | E,4 B,,4 E,,4 z4 |
[V:1] [=Bdg]4 [=B,DG]3[=B,DG] [CEA]8 | [=Bdg]4 [DF=B]3[DF=B] [EGc]8 | G4 [Ge-g-]3[Ge-g] [Ge^f]4 [Gd-=f-]3[Gd=f] | [G^c=e]4 [^F=c-_e-]3[^F=c_e] [G=Bd]4 z4 |
[V:2] [G,,,G,,]4 z4 [G,,G,]4 [G,,G,]3[G,,G,] | [G,,G,]4 z4 [G,,G,]4 [G,,G,]3[G,,G,] | [G,,G,]4 z12 | z12 [F,,F,]3[F,,F,] |
[V:1] [cgc']4 [EGc]3[EGc] [EGc]4 [EGc]4 | [_DA_d]4 [f_d']4 [af']4 [=d=b]4 | d'2c'2 z2[fa]2 [fa]2[eg]2 z2[D=B]2 | [FG-=Bd]8 [EGc]4 z4 |]
[V:2] [E,,E,]4 [E,,E,]3[E,,E,] [E,,E,]4 [E,,E,]4 | [F,,F,]4 z8 [FA]4 | [EG]4 F4 G4 G,4 | C4 G,4 C,4 z4 |]`;

export default {
  summary: "Mozart's \"Marche funebre del Sig. Maestro Contrapunto\", K. 453a, a short mock funeral march he wrote in 1784 into the music book of his pupil Barbara Ployer, all 16 bars. C minor; the autograph is in cut time, counted here in 4/4, so each printed half-note beat is two beats. Four sections: A1 (bars 1–4), A2 (5–8), B1 (9–12) and B2 (13–16). The original repeats each half; here you play each half once.",
  steps: [
    "Left hand alone in A1 and A2, in wait mode. It plays octaves, one a beat; bars 5–6 move by half step, C down to C flat and B flat, then up through C and C sharp to D, so keep the hand shaped as an octave and move it from the arm.",
    "Right hand alone. Most beats are three- or four-note chords; bars 2 and 4 break into pairs of eighths in thirds and sixths. Play the dotted rhythm in bars 1, 3, 9, 10 and 13 as a long and a very short chord, the short one leaning into the next beat.",
    "Bars 11–12 by themselves. Three right-hand lines share one hand: the thumb repeats G in a dotted rhythm while the top notes fall slowly by half step, from G and F sharp down to D. Hold the long E flat in bar 11 and the tied notes, and strike only the thumb's G.",
    "Play-along with the click at 44. Each clean pass nudges the tempo up toward 66.",
  ],
  watch: [
    "B flat, E flat and A flat are in the key signature. B natural comes in often (bars 1, 3, 4, 9, 10, 12, 15 and 16), and bar 14 has D flat in three octaves before a D natural and B natural on beat 4.",
    "In bar 14 the left hand climbs to F and A flat above middle C, still on the bass staff, and stays high for bar 15 before dropping back to G.",
  ],
  source: { label: "Mutopia Project — Mozart, Marche funebre del Sig. Maestro Contrapunto, K. 453a (Reproduction of Autograph)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=446" },
  score: {
    bpm: 44, target: 66,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }],
    abc: ABC,
  },
};
