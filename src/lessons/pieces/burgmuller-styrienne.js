// Burgmüller, "La Styrienne", Op. 100 No. 14, from the Collection Litolff edition. The repeats are dropped,
// C takes its second ending, and the da capo is written out as bars 37–64, ending at the Fine. The edition's
// two upper-staff voices in bars 1–3 are folded into the right hand, and its lower-staff voices into the
// left. The left hand stays in the bass clef, since the stage does not move a sharp key signature with a
// clef change; each key change restates the clef, which abcjs would otherwise reset.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Styrienne
C:Friedrich Burgmüller
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] {^C/}D2- [D-A]2 [DA]2 | {^C/}D2- [D-^G]2 [DG]2 | {^C/}D2- [D-G]2 [DG]2 | [DF]2 zd ef |
[V:2] z2 [D,C]2 [D,C]2 | z2 [D,B,]2 [D,B,]2 | z2 [D,_B,]2 [D,B,]2 | [D,A,]2 z4 |
[V:1] ag Bc ^cd | ez Fz Fz | {^d/}ez Fz Fz | GB dd ef |
[V:2] G,z [B,D]z [B,D]z | D,z [CD]z [CD]z | D,z [CD]z [CD]z | G,z [B,D]z [B,D]z |
[V:1] ag Bc ^cd | ez Fz Fz | {^d/}ez Fz Fz | G2 zf ga |
[V:2] G,z [B,D]z [B,D]z | D,z [CD]z [CD]z | D,z [CD]z [CD]z | [G,B,D]2 z4 |
[V:1] bg fg fe | {e/f/}e2 ^df B2 | {e/f/}e2 ^df Bd | e^d ef ga |
[V:2] E,z [B,EG]2 [B,EG]2 | B,2- [B,-FA]2 [B,FA]2 | B,2- [B,-FA]2 [B,FA]2 | E,z [B,EG]2 [B,EG]2 |
[V:1] c'b ag fe | {e/f/}e2 ^df B2 | {e/f/}e2 ^df Bd | e3_e dc |
[V:2] E,z [B,EG]2 [B,EG]2 | B,2- [B,-FA]2 [B,FA]2 | B,2- [B,-FA]2 [B,FA]2 | [EG]2 [FA]2 z2 |
[V:1] {B/c/}B2 A2 A2 | {A/B/}A2 G2 G2 | d^c =ca Af | Bg B2 B2 |
[V:2] D,2 [CD]2 [CD]2 | G,2 [B,D]2 [B,D]2 | D,2 D2 D2 | G,2- [G,-D]2 [G,D]2 |
[V:1] {B/c/}B2 A2 A2 | {A/B/}A2 G2 G2 | d^c =ca Af | [Bg]2 zG AG |
[V:2] D,2 [CD]2 [CD]2 | G,2 [B,D]2 [B,D]2 | D,2 D2 D2 | [G,D]2 z4 |
[V:1] [K:C clef=treble] Fz d'z F2 | E3E FE | Dz gz D2 | G3G AG |
[V:2] [K:C clef=bass] G,,2 [G,B,]2 [G,B,]2 | C,2 [G,C]2 [G,C]2 | F,2- [F,-G,B,]2 [F,G,B,]2 | E,2- [E,-G,C]2 [E,G,C]2 |
[V:1] Fz c'z F2 | E3G AG | ^FG e2 [=Fd]2 | [Ec]4 z2 |
[V:2] A,2- [A,-C]2 [A,C]2 | G,2- [G,-C]2 [G,C]2 | G,,2 G,2 B,2 | C4 z2 |
[V:1] [K:G clef=treble] {^C/}D2- [D-A]2 [DA]2 | {^C/}D2- [D-^G]2 [DG]2 | {^C/}D2- [D-G]2 [DG]2 | [DF]2 zd ef |
[V:2] [K:G clef=bass] z2 [D,C]2 [D,C]2 | z2 [D,B,]2 [D,B,]2 | z2 [D,_B,]2 [D,B,]2 | [D,A,]2 z4 |
[V:1] ag Bc ^cd | ez Fz Fz | {^d/}ez Fz Fz | GB dd ef |
[V:2] G,z [B,D]z [B,D]z | D,z [CD]z [CD]z | D,z [CD]z [CD]z | G,z [B,D]z [B,D]z |
[V:1] ag Bc ^cd | ez Fz Fz | {^d/}ez Fz Fz | G2 zf ga |
[V:2] G,z [B,D]z [B,D]z | D,z [CD]z [CD]z | D,z [CD]z [CD]z | [G,B,D]2 z4 |
[V:1] bg fg fe | {e/f/}e2 ^df B2 | {e/f/}e2 ^df Bd | e^d ef ga |
[V:2] E,z [B,EG]2 [B,EG]2 | B,2- [B,-FA]2 [B,FA]2 | B,2- [B,-FA]2 [B,FA]2 | E,z [B,EG]2 [B,EG]2 |
[V:1] c'b ag fe | {e/f/}e2 ^df B2 | {e/f/}e2 ^df Bd | e3_e dc |
[V:2] E,z [B,EG]2 [B,EG]2 | B,2- [B,-FA]2 [B,FA]2 | B,2- [B,-FA]2 [B,FA]2 | [EG]2 [FA]2 z2 |
[V:1] {B/c/}B2 A2 A2 | {A/B/}A2 G2 G2 | d^c =ca Af | Bg B2 B2 |
[V:2] D,2 [CD]2 [CD]2 | G,2 [B,D]2 [B,D]2 | D,2 D2 D2 | G,2- [G,-D]2 [G,D]2 |
[V:1] {B/c/}B2 A2 A2 | {A/B/}A2 G2 G2 | d^c =ca Af | [Bg]2 z4 |]
[V:2] D,2 [CD]2 [CD]2 | G,2 [B,D]2 [B,D]2 | D,2 D2 D2 | [G,D]2 z4 |]`;

export default {
  summary: "Burgmüller's \"La Styrienne\", No. 14 of his 25 easy studies, Op. 100, a waltz in G major and 3/4, written out here in 64 bars. The left hand keeps a waltz bass, a low note then a chord twice, under a right-hand tune with quick grace notes. Sections: Intro (bars 1–4), A (5–12), B1 (13–20), B2 (21–28), C (29–36, in C major), then the return: Intro again (37–40), A again (41–48), B1 again (49–56) and B2 again (57–64). The original repeats A, B and C, takes a first ending in C, then goes back to the start (da capo) and stops at the end of B (Fine); here every part is played once, C takes its second ending, and the da capo is written out.",
  steps: [
    "Left hand alone in A, in wait mode: the low note on beat 1, the chord on beats 2 and 3, all short. In B the chords are quarters, and in bars 14–15 and 18–19 the low B is held under them.",
    "Right hand alone in A. In bars 6–7 and 10–11 an accented E is followed by two short F sharps, each with an eighth rest; in bars 7 and 11 a grace D sharp comes just before the E.",
    "B, right hand alone. Bars 14–15 and 18–19 start with a two-note grace, E–F sharp, before the E, and bars 21–22 and 25–26 with B–C and A–B; play the graces quickly, before the beat. Bar 20 slows down through E, E flat, D and C.",
    "C (bars 29–36) is loud and decided. The right hand leaps up and back in bars 29, 31 and 33: F to the high D, D to the high G, then F to the high C; keep the notes short and let the hand travel. Then play-along with the click at 80, rising toward 160.",
  ],
  watch: [
    "C is in C major: the key signature changes at bar 29 and goes back to G major at bar 37. Bar 35 has F sharp, then F natural.",
    "Bars 37–64 are the da capo: Intro, A and B once more, ending at bar 64, the edition's Fine. C is not played again.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Styrienne, Op. 100 No. 14 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=225" },
  score: {
    bpm: 80, target: 160,
    sections: [{ name: "Intro", from: 1, to: 4 }, { name: "A", from: 5, to: 12 }, { name: "B1", from: 13, to: 20 }, { name: "B2", from: 21, to: 28 }, { name: "C", from: 29, to: 36 }, { name: "Intro again", from: 37, to: 40 }, { name: "A again", from: 41, to: 48 }, { name: "B1 again", from: 49, to: 56 }, { name: "B2 again", from: 57, to: 64 }],
    abc: ABC,
  },
};
