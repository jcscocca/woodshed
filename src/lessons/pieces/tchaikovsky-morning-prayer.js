// Tchaikovsky, "Morning Prayer", Op. 39 No. 1 (Album for the Young), from the Mutopia edition of the
// Schirmer 1904 print (public domain), 24 bars. The hymn is in four parts: the right hand's inner lines
// are folded into one voice with ties, and the left hand's two lines are voices 2 and 3. The edition puts
// the right hand in the bass clef for bars 19–20; here it stays in the treble clef.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Morning Prayer
C:Pyotr Ilyich Tchaikovsky
M:3/4
L:1/16
K:G
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] [GB]4 [GB]6 [FA]2 | [Gc]4 [GB]8 | [FA]4 [EG]4 [EA]4 | [^DB]12 |
[V:2] [G,D]4 [G,D]6 [D,D]2 | [E,C]4 [G,D]8 | [D,D]4 [E,B,]4 [C,E,]4 | [B,,F,]12 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [DB]4 [^C-E]6 [^CA]2 | [CA]4 [B,D-]4 [C-D]2 [CF]2 | [DG]4 [EG]4 [G-e]3 [GA] | [GA-]4 [FA-]2 [EA-]2 [FA]4 |
[V:2] E,4 E,8 | D,4 D,8 | [B,,G,]4 [C,G,]4 [^C,A,]4 | A,8 D4 |
[V:3] ^G,,4 A,,4 =G,,4 | F,,4 G,,4 A,,4 | x12 | D,12 |
[V:1] [GB]4 [GB]6 [FA]2 | [Gc]4 [GB]6 [GB]2 | [Gc]4 [GBd]4 [Gce]4 | [F-^c-f]8 [F^cf]4 |
[V:2] [G,D]4 [G,D]6 [D,D]2 | [E,C]4 [G,D]4 =F4 | E4 D4 C2 B,2 | ^A,12 |
[V:3] x12 | x12 | x12 | x12 |
[V:1] [B^d]4 [Be-]4 [A-e]2 [A^c]2 | [Ad]4 [GB]4 [Gc]4 | [E-B]3 [E-A] [EA]4 [DF-]2 [CF]2 | [B,G]4 z4 [Bg]4 |
[V:2] F4 E8 | [F,D]4 [G,D]4 [E,C]4 | G,8 D,4- | D,4 z4 D,4 |
[V:3] A,4 ^G,4 =G,4 | x12 | C,8 x4 | G,,2G,,2 G,,2G,,2 G,,2G,,2 |
[V:1] [cf]3 c c4 [F-B]2 [FA]2 | [GB]4 z4 [B,G]4 | [CF]3 C C4 [F,-B,]2 [F,A,]2 | [G,B,]4 [G,E]4 [G,D]4 |
[V:2] _E,12 | D,4 z4 D,4 | _E,12 | D,4 C,4 B,,4 |
[V:3] G,,2G,,2 G,,2G,,2 G,,2G,,2 | G,,2G,,2 G,,2G,,2 G,,2G,,2 | G,,2G,,2 G,,2G,,2 G,,2G,,2 | G,,2G,,2 G,,2G,,2 G,,2G,,2 |
[V:1] [^CE]8 [=CF]4 | [B,G]8 B,4 | [B,-D-]4 [B,DG]4 [GB]4 | [GBd]12 |]
[V:2] _B,,8 A,,4 | z4 D,8 | D,12 | D,12 |]
[V:3] G,,2G,,2 G,,2G,,2 G,,2G,,2 | G,,12 | G,,12 | G,,12 |]`;

export default {
  summary: "Morning Prayer, No. 1 of Tchaikovsky's Album for the Young, Op. 39 (1878), all 24 bars. A slow hymn in G major and 3/4, written in four parts: two in each hand. Three sections: A (bars 1–8), A′ (9–16) and Coda (17–24), where the left hand repeats a low G in eighths under a held note above it.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1–4 are two-note chords; from bar 5 the lower note often holds while the upper one moves, or the other way round, as in bars 5, 6 and 8. Keep held notes down and strike only the moving one.",
    "Left hand alone in A. In bars 5, 6, 8 and 13 it has two lines too: the upper note holds for two beats while the lower one steps underneath.",
    "Coda alone, left hand first. From bar 16 the low G repeats in even eighths for six bars while a second line above it moves slowly: D, E flat, D, E flat, then D–C–B and B flat–A.",
    "Hands together in wait mode, a section at a time, then play-along with the click at 44. Each clean pass nudges the tempo up toward 62.",
  ],
  watch: [
    "Chromatic notes come thick in A′: F natural in the left hand in bar 10, C sharp and A sharp in bar 12, D sharp and C sharp in bar 13, and in the Coda E flat and B flat in the left hand.",
    "In bars 19–21 the right hand plays low, down to F sharp below middle C. The edition switches to the bass clef in bars 19–20; this score keeps the treble clef, so read the ledger lines below the staff.",
  ],
  source: { label: "Mutopia Project — Tchaikovsky, Morning Prayer, Op. 39 No. 1 (Schirmer, 1904)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2032" },
  score: {
    bpm: 44, target: 62,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "A′", from: 9, to: 16 }, { name: "Coda", from: 17, to: 24 }],
    abc: ABC,
  },
};
