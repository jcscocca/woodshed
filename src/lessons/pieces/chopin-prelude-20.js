// Chopin, Prelude in C minor, Op. 28 No. 20, from the Mutopia edition of the Peters print (public domain), 13
// bars in 4/4; bars 9–12 repeat bars 5–8, written out in the edition. The right hand's two voices on beat 3 are
// written as chords, with the held voice tied. The right hand's clef changes are kept and restated at each line.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Prelude in C minor, Op. 28 No. 20
C:Frédéric Chopin
M:4/4
L:1/16
K:Cm
%%staves {1 2}
V:1 clef=bass
V:2 clef=bass
[V:1 clef=bass] [G,CEG]4 [A,CEA]4 [G,-=B,-EG]3[G,=B,DF] [E,G,CE]4 | [E,A,CE]4 [F,A,_DF]4 [_D,-E,-G,-CE]3[_D,E,G,B,_D] [C,E,A,C]4 | [D,F,=B,D]4 [=E,G,_B,C=E]4 [A,-C-G]3[A,CF] [G,C_E]4 | [^F,CD]4 [G,=B,DG]4 [K:clef=treble] [C-D-^F-=B]3[CD^F=A] [=B,DG]4 |
[V:2] [C,,C,]4 [F,,,F,,]4 [G,,,G,,]4 [C,,G,,C,]4 | [A,,,A,,]4 [_D,,,_D,,]4 [E,,,E,,]4 [A,,,A,,]4 | [G,,,G,,]4 [C,,,C,,]4 [F,,,F,,]4 [C,,C,]4 | [D,,=A,,D,]4 [G,,,G,,]4 [D,,,D,,]4 [G,,,G,,]4 |
[V:1 clef=treble] [EGe]4 [EAe]4 [D-d-A]3[Dd^F] [DGd]4 | [CGc]4 [CD^Fd]4 [DG=B]3[C=A] [=B,DG]4 | [CGc]4 [A,CA]4 [G,-D-G]3[G,DF] [G,CE]4 | [K:clef=bass] [E,A,CE]4 [F,A,_DF]4 [F,-G,-=B,-E]3[F,G,=B,=D] [E,G,C]4 |
[V:2] [C,,C,]4 [C,C]4 [=B,,=B,]4 [_B,,_B,]4 | [=A,,=A,]4 [_A,,_A,]4 [G,,G,]4 [F,,F,]4 | [E,,E,]4 [F,,F,]4 [=B,,,=B,,]4 [C,,C,]4 | [A,,,A,,]4 [_D,,,_D,,]4 [G,,,G,,]4 [C,,,C,,]4 |
[V:1 clef=treble] [EGe]4 [EAe]4 [D-d-A]3[Dd^F] [DGd]4 | [CGc]4 [CD^Fd]4 [DG=B]3[C=A] [=B,DG]4 | [CGc]4 [A,CA]4 [G,-D-G]3[G,DF] [G,CE]4 | [K:clef=bass] [E,A,CE]4 [F,A,_DF]4 [F,-G,-=B,-E]3[F,G,=B,=D] [E,G,C]4 |
[V:2] [C,,C,]4 [C,C]4 [=B,,=B,]4 [_B,,_B,]4 | [=A,,=A,]4 [_A,,_A,]4 [G,,G,]4 [F,,F,]4 | [E,,E,]4 [F,,F,]4 [=B,,,=B,,]4 [C,,C,]4 | [A,,,A,,]4 [_D,,,_D,,]4 [G,,,G,,]4 [C,,,C,,]4 |
[V:1 clef=treble] !accent!!fermata![CEGc]16 |]
[V:2] !accent!!fermata![C,G,]16 |]`;

export default {
  summary: "Chopin's Prelude in C minor, Op. 28 No. 20, all 13 bars in 4/4, slow (Largo): a chord on every beat in both hands, like a funeral march. Three sections: A (bars 1–4), B (5–8) and B again (9–13: the same four bars, softer, then the final chord). On beat 3 of every bar but the last, the right hand moves in a dotted rhythm, mostly with part of the chord holding; those two voices are written as one chord, with the held notes tied.",
  steps: [
    "Right hand alone in A, in wait mode, starting in the bass clef. Every beat is a chord of three to five notes. On beat 3 the top notes move as a dotted eighth and a sixteenth while the notes under them hold; keep those down until beat 4.",
    "Left hand alone. It plays an octave on every beat through bar 12, with two three-note chords in bars 1 and 4. The jumps are wide, so look ahead to each one. In bars 5–6 the octaves walk down by half steps from the C an octave below middle C to G. The edition marks a pedal change on each beat of bar 1, then simile.",
    "Hands together by section. B (bars 5–8) comes back unchanged in bars 9–12; the edition marks A loud, B soft and B again softer still. Hold the last chord in bar 13 for its fermata.",
    "Play-along with the click at 28. Each clean pass nudges the tempo up toward 44.",
  ],
  watch: [
    "The right hand changes clef: bass clef at the start, treble from beat 3 of bar 4, bass again in bars 8 and 12, and treble in bars 9 and 13.",
    "B natural comes in most bars. Bar 3 has E natural on beat 2 and E flat again on beat 4. F sharp comes in bars 4, 5, 6, 9 and 10, and A natural in bars 4, 6 and 10.",
    "In bars 6 and 10 the whole right-hand chord on beat 3 moves in the dotted rhythm, with nothing held: D, G and B, then C and A.",
  ],
  source: { label: "Mutopia Project — Chopin, Prelude in C minor, Op. 28 No. 20 (Edition Peters)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=472" },
  score: {
    bpm: 28, target: 44,
    sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }, { name: "B again", from: 9, to: 13 }],
    abc: ABC,
  },
};
