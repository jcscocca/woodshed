// March in E-flat, BWV Anh. 127 (Anna Magdalena Bach notebook, composer unknown), from the Mutopia edition
// of the Bach-Gesellschaft print. The cut time is written as 4/4. The opening quarter-note pickup is padded
// into a full bar 1, and the second half's pickup fills the last beat of bar 11; the right hand's two-note
// passages are folded into chords. The trills are marked; the reference plays their main notes.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:March in E-flat
C:Anonymous (Anna Magdalena Bach notebook)
M:4/4
L:1/8
K:Eb
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z6 EG | B2 cd eB g2 | gf ed e2 [Ac]2 | [Ac]2 [GB]4 [FA]2 |
[V:2] z6 E,2 | G,2 A,F, G,2 E,2 | B,,2 B,2 E,2 A,2 | B,4 B,,4 |
[V:1] (3GFE E4 g2 | (3fed dd df ed | (3edc cc ce dc | (3def [df][df] [df][df] bd |
[V:2] E,2 G,F, G,2 E,2 | D,2 B,2 B,,2 B,2 | F,,2 [F,=A,]2 [F,A,]2 [F,A,]2 | [F,B,]2 [F,B,]2 [F,B,]2 [F,B,]2 |
[V:1] (3cde [ce][ce] [ce][ce] c'e | (3db=a (3gfe (3dcB !trill!c2 | B6 Bd | f2 ed cB a2 |
[V:2] [F,=A,]2 [F,A,]2 [F,A,]2 [F,A,]2 | B,2 E,2 F,2 F,,2 | B,,2 F,,2 B,,,2 B,,2 | B,,2 C,2 D,2 B,,2 |
[V:1] !trill!a2 g4 G2 | (3edc (3fed (3gfe ac | !trill!c2 =B4 GG | =BG dG GF FF |
[V:2] E,,2 E,D, E,F, E,D, | C,2 D,2 E,2 F,2 | G,,2 G,^F, G,2 G,,2 | G,,2 G,,2 G,,2 G,,2 |
[V:1] =BG dF FE ce | gc (3fed !trill!d4 | c6 ed | eB g4 _d2 |
[V:2] G,,2 G,,2 C,2 C,2 | E,2 A,2 G,2 G,,2 | C,2 C2 B,A, G,F, | G,2 E,F, G,2 E,2 |
[V:1] !trill!_d2 c4 =d2 | (3efg (3agf (3gfe be | (3dcB B4 A2 | (3GAB [GB][GB] [GB][GB] eG |
[V:2] A,,2 A,G, A,2 F,2 | G,2 D,2 E,2 G,2 | B,2 B,,C, D,2 B,,2 | E,2 E,2 E,2 E,,2 |
[V:1] (3FGA [FA][FA] [FA][FA] fA | (3GAB [GB][GB] gB AG | (3FGA [FA][FA] fA GF | (3Ged (3cBA (3GFE !trill!F2 |
[V:2] B,,2 [B,,D,]2 [B,,D,]2 [B,,D,]2 | [B,,E,]2 [B,,E,]2 [B,,E,]2 [B,,E,]2 | [B,,D,]2 [B,,D,]2 [B,,D,]2 [B,,D,]2 | E,2 A,2 B,2 B,,2 |
[V:1] E6 z2 |]
[V:2] E,2 B,,2 E,,2 z2 |]`;

export default {
  summary: "The March in E-flat major from the Anna Magdalena Bach notebook (BWV Anh. 127, composer unknown), all 29 bars. The original is in cut time (two half-note beats a bar); it is written here as 4/4, so count four quarters. Bar 1 holds the quarter-note pickup, so first-half bar numbers run one ahead of the printed ones; the second half's pickup, B flat and D, fills the last beat of bar 11. Four sections: A (bars 1–5), B (6–11, closing in B flat), C (12–19, closing in C minor) and D (20–29, home to E flat). The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in B, in wait mode. Bars 6–9 each start with a three-note triplet that runs into repeated eighths; from bar 8 the repeats are two-note chords (D and F, then C and E flat). Keep the triplet even and the chords level.",
    "Left hand alone. Bars 7–9 and 25–27 are repeated two-note chords in quarters; the rest is a walking bass in quarters and eighths. Bar 16 strikes a low G on every beat.",
    "Hands together in C, a bar at a time. Bars 16–17 are the busiest right-hand bars: eighths that jump between B natural, G and D.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "B flat, E flat and A flat are in the key signature. A natural comes in bars 7, 9 and 10; B natural in bars 15–17, in the turn to C minor; D flat in bars 20 and 21, and the D right after it in bar 21 is natural again.",
    "Six notes carry a trill (bars 10, 13, 15, 18, 21 and 28). Play them as plain notes first; add the trills once the bar is secure.",
  ],
  source: { label: "Mutopia Project — Bach, March in E-flat major, BWV Anh. 127 (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1614" },
  score: {
    bpm: 60, target: 100,
    sections: [{ name: "A", from: 1, to: 5 }, { name: "B", from: 6, to: 11 }, { name: "C", from: 12, to: 19 }, { name: "D", from: 20, to: 29 }],
    abc: ABC,
  },
};
