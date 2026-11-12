// Handel, Preludio in D minor, from the Aylesford Pieces, Mutopia edition of the Schott 1930 print
// (public domain), 22 bars. Where the left hand moves up into the treble staff (bars 11, 12, 16 and 17)
// those notes are a second left-hand voice in the upper staff, as the edition writes them in the treble clef.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Preludio
C:George Frideric Handel
M:4/4
L:1/16
K:Dm
%%staves {(1 2) 3}
V:1 clef=treble
V:2 clef=treble
V:3 clef=bass
[V:1] df^ce dfAd BdAd BdFA | GBFA GBEF GAEG FADF | EFED ^CDC=B, A,z3 z4 | z16 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] z16 | z16 | z8 zE,F,G, F,G,F,E, | D,F,^C,E, D,F,A,,D, B,,D,A,,D, B,,D,F,,D, |
[V:1] z16 | zDFG AGAE F4 E4 | DABc dcdA [GB]2[FA]2 [EG]4 | Fcde fefc [FBd]4 dcdA |
[V:2] x16 | x16 | x16 | x16 |
[V:3] G,,B,,A,,G,, F,,G,,F,,E,, D,,F,,G,,E,, A,,3A,, | D,,4 z4 zD,F,G, A,G,A,E, | F,2E,2 D,3F, G,G,,A,,B,, C,B,,C,G,, | A,,2G,,2 F,,4 B,,F,G,A, B,A,B,F, |
[V:1] Bdef gfgd [A^c]4 afga | bagf e3d dAFA D4 | d2f2 e2d2 afef gfga | f=BAB ^cBcd AFEF GFGA |
[V:2] x16 | x16 | x8 A2^c2 =B2A2 | D2F2 E2D2 x8 |
[V:3] G,2F,2 E,3G, A,B,A,G, F,D,E,F, | G,A,B,G, A,2A,,2 D,4 z2D,,2 | z8 x8 | x8 A,2^C2 =B,2A,2 |
[V:1] FD^CD EDEF DGFG EFGA | FGAB [^CG]2[DF]2 [CE]2^c2 =B2A2 | d=BAB ^cBcd efde c3d | [Dd]2F2 E2D2 A2^c2 =B2A2 |
[V:2] x16 | x16 | x16 | x8 AFEF GFGA |
[V:3] D=B,A,B, ^CB,CD B,EDE C2A,2 | D,2F,2 E,2D,2 A,F,E,F, G,F,G,A, | F,D,^C,D, E,D,E,F, G,A,B,G, A,2A,,2 | D,4 z4 x8 |
[V:1] d=BAB ^cBcd [ce]2EF GFGA | F2f2 e2d2 afef gfga | f2e2 [FAd]3=B [EA^c]2[EA]F [DG]2[^CA]2 | FD^CD EDEF A2^c2 =B2A2 |
[V:2] F2G2 A3=B x8 | x16 | x16 | x16 |
[V:3] x8 A,,2^C,2 =B,,2A,,2 | D,=B,,A,,B,, ^C,B,,C,D, C,3D, E,3C, | D,^C,D,E, F,E,F,G, A,2^C2 =B,2A,2 | D=B,A,B, ^CB,CD C2A,2 B,2C2 |
[V:1] d=BAB ^cBcd [Af]2[Ge]d [EAc]3d | dAFA D4 z8 |]
[V:2] x16 | x16 |]
[V:3] F,D,^C,D, E,D,E,F, D,2G,2 A,2A,,2 | D,4- D,-[D,-A,][D,-F,][D,A,] D,4 D,,2z2 |]`;

export default {
  summary: "Handel's Preludio in D minor, from the Aylesford Pieces, all 22 bars of 4/4: a two-part piece in running sixteenths, the hands passing the same figures back and forth. Four sections: Opening (bars 1–5), where the right hand states the figure and the left hand answers it alone; Development (6–10), which touches F major and returns to D minor in bar 10; Episodes (11–16), short figures traded between the hands; and Close (17–22), which settles in D minor.",
  steps: [
    "Opening, hands separately in wait mode. The right hand plays alone until halfway through bar 3: the figure starts D–F–C sharp–E and then outlines chords in sixteenths. The left hand takes the same figure from there to the end of bar 5 while the right hand rests.",
    "Development, hands together, one bar at a time. In bars 6–9 the hands trade sixteenth-note runs, and on the last beat of bars 8 and 9 both run together; keep the sixteenths even as the other hand changes.",
    "Episodes, left hand alone first. In bars 11–12 and 16–17 it moves up into the upper staff, below the right hand, and trades short figures with it, such as A–C sharp–B–A in bar 11; follow its notes from one staff to the other.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "B flat is in the key signature, but in bars 11–21 the B is often natural, next to C sharp; both are written in each time.",
    "The edition marks a short trill on the dotted E in bar 10 and on the dotted C sharp in bar 15. The score leaves them off and grades the plain note; add them once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Handel, Preludio (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=156" },
  score: {
    bpm: 60, target: 100,
    sections: [{ name: "Opening", from: 1, to: 5 }, { name: "Development", from: 6, to: 10 }, { name: "Episodes", from: 11, to: 16 }, { name: "Close", from: 17, to: 22 }],
    abc: ABC,
  },
};
