// Burgmüller, "Consolation", Op. 100 No. 13, from the Collection Litolff edition. The upper staff has two
// voices in the edition (a quarter-note tune over repeated eighth Gs); they are folded into one right-hand
// voice, the held tune note tied into a chord with each G. The edition's middle voice moves into the lower
// staff for bars 16–19, so there it is the left hand's. The left hand is in the treble clef for bars 8–25.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Consolation
C:Friedrich Burgmüller
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] G-[G-d] [G-e][G-d] [G-e][G-d] [G-e][Gd] | G-[G-c] [G-d][G-c] [G-d][G-c] [G-d][Gc] | B-[B-f] [B-g][B-f] [B-g][B-f] [B-g][Bf] | c-[c-e] [c-f][c-e] [c-f][c-e] [c-f][ce] |
[V:2] [G,F]8 | [G,E]8 | [G,D]8 | [G,C]8 |
[V:1] A-[A-e] [A-f][A-e] [A-^d][A-e] [A-f][Ae] | ed ^cd ba fd | cG Bc e-[Ge] d-[Gd] | zG c-[Gc] d-[Gd] e-[Ge] |
[V:2] [G,A,^C]8 | [F,A,D]8 | [G,CE]4 [G,B,F]4 | [K:clef=treble] [CE]8 |
[V:1] e-[Ge] d-[Gd] ^c-[Gc] d-[Gd] | c-[Gc] B-[GB] A-[GA] B-[GB] | d-[Gd] c-[Gc] AG ^FG | AG c-[Gc] d-[Gd] e-[Ge] |
[V:2] [K:clef=treble] [B,F]8 | [G,F]8 | [CE]8 | [CE]8 |
[V:1] e-[Ge] B-[GB] c-[Gc] B-[GB] | B^A Bc Ba g^f | eB gB e2 z2 | d2 ^c2 d2 B2 |
[V:2] [K:clef=treble] [B,E]8 | [B,-^D-]4 [B,D]^F BA | [EG]6 z2 | F-[FG] E-[EG] F-[FG] D-[DG] |
[V:1] c2 B2 c2 A2 | B2 c2 ^c2 d2 | c2 d2 ^d2 e2 | d-[dg] ^c-[cg] d-[dg] B-[Bg] |
[V:2] [K:clef=treble] E-[EG] D-[DG] E-[EG] C-[CG] | D-[DG] E-[EG] E-[EG] F-[FG] | E-[EG] B,-[B,G] B,-[B,G] C-[CG] | F2 E2 F2 D2 |
[V:1] c-[cg] B-[Bg] c-[cg] A-[Ag] | Bc de fd AB | cG eG dA BG | cG eG dA BG |
[V:2] [K:clef=treble] E2 D2 E2 C2 | D4 G,4 | [CE]4 [G,F]4 | [CE]4 [G,F]4 |
[V:1] cB ce g^d eg | c'2 z6 |]
[V:2] [K:clef=treble] [CE]4 z4 | [K:clef=bass] C,2 z6 |]`;

export default {
  summary: "Burgmüller's \"Consolation\", No. 13 of his 25 easy studies, Op. 100, all 26 bars, in C major and 4/4. A quarter-note tune sings over a repeated G in eighths, played in the same hand. Four sections: Intro (bars 1–7), A (8–15), B (16–23) and Coda (24–26). The original repeats A, and B with a first ending; here you play each part once and take the second ending (bar 23), so bar numbers from 23 on are one less than the printed ones.",
  steps: [
    "Intro (bars 1–7), right hand alone, in wait mode. Hold the lower note for the whole bar, G in bars 1–2, then B, C and A, while the upper fingers rock between the two notes above it in eighths.",
    "Right hand alone in A (bars 8–15). The tune is in quarters on the beat; on each off-beat the thumb plays G underneath. Keep each tune note held through its G, then add the left hand's held chords.",
    "B (bars 16–23): in bars 16–19 the left hand takes the same two-part pattern, a quarter-note line with G on the off-beats, under a right-hand tune in quarters. In bars 20–21 the pattern goes back to the right hand. Practise the left hand alone in bars 16–19 first.",
    "Switch to play-along with the click at 60. Each clean pass nudges the tempo up toward 112.",
  ],
  watch: [
    "The off-beat Gs are not part of the tune. Play them lightly and don't let them cut the tune note short; the score writes each held note tied into a chord with the G.",
    "Accidentals: C sharp in bars 5 (left hand), 6, 9, 17 and 20, D sharp in bars 5, 18 and 25, F sharp in bar 11, and in bar 14 A sharp and F sharp in the right hand over a left-hand D sharp.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Consolation, Op. 100 No. 13 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=224" },
  score: {
    bpm: 60, target: 112,
    sections: [{ name: "Intro", from: 1, to: 7 }, { name: "A", from: 8, to: 15 }, { name: "B", from: 16, to: 23 }, { name: "Coda", from: 24, to: 26 }],
    abc: ABC,
  },
};
