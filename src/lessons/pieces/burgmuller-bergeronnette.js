// Burgmüller, "La Bergeronnette", Op. 100 No. 11, from the Collection Litolff edition. The left hand is in
// the treble clef, as in the edition, except for its low Cs in bars 14 and 28–29. The edition writes bars
// 21–27 under an 8va sign; here they are written at pitch.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Bergeronnette
C:Friedrich Burgmüller
M:2/4
L:1/16
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=treble
[V:1] g'e'c'2 e'c'g2 | c'ge2 gec2 | [c^f]2z2 [c=f]2z2 | [ce]2z2 [c_ea]2z2 |
[V:2] ceg2 Gce2 | EGc2 CEG2 | A2z2 _A2z2 | G2z2 ^F2z2 |
[V:1] [cd]4 z4 | [Bg]4 z4 | ceg2 g2g2 | egc'2 c'2c'2 |
[V:2] G4 z4 | [G,F]4 z4 | [CE]2z2 z4 | [CEG]2z2 z4 |
[V:1] c'af2 c'_af2 | c'ge2 e2e2 | gfd2 gfd2 | agc2 c2c2 |
[V:2] [CFA]2z2 [CF_A]2z2 | [CEG]4 z4 | [B,G]2z2 [B,G]2z2 | [CE]4 z4 |
[V:1] edA2 cBG2 | c4 z4 | [ce]4 [Ac]4 | [ce]4 [Ac]4 |
[V:2] [C^F]2z2 [C=F]2z2 | [CE]2z2 [K:clef=bass] C,2z2 | [K:clef=treble] A,CE2 E2E2 | A,CE2 E2E2 |
[V:1] [fa]4 [df]4 | [ce]8 | ecG2 gec2 | c'ge2 e'c'g2 |
[V:2] DFA2 DFA2 | A,CE2 E2E2 | G,CE2 CEG2 | EGc2 Gce2 |
[V:1] g'f'e'd' e'd'c'b | c'e'g'2 g'2g'2 | g'4 b4 | c'e'g'2 g'2g'2 |
[V:2] G2z2 [G,F]4 | [CE]4 z4 | G,B,D2 D2D2 | [CE]4 z4 |
[V:1] g'4 b4 | c'e'g'2 bd'g'2 | c'e'g'2 bd'g'2 | c'2z2 [Ec]4 |
[V:2] G,B,D2 D2D2 | [CE]2z2 DB,G,2 | ECG,2 DB,G,2 | [CE]2z2 [K:clef=bass] [C,G,]4 |
[V:1] [Ec]4 z4 |]
[V:2] [K:clef=bass] [C,G,]4 z4 |]`;

export default {
  summary: "Burgmüller's \"La Bergeronnette\" (The Wagtail), No. 11 of his 25 easy studies, Op. 100, all 29 bars, in C major and 2/4. A quick figure of two slurred sixteenths and a staccato eighth runs through the piece, in the right hand in A and in the left hand in B. Four sections: Intro (bars 1–6), A (7–14), B (15–22) and Coda (23–29). The original repeats A, and B with a first ending; here you play each part once and take the second ending (bar 22).",
  steps: [
    "Intro (bars 1–6), hands separately, then together. In bars 1–2 the hands move in contrary motion through broken C chords, the right hand falling and the left hand rising; in bars 3–4 they move by half steps, one staccato eighth a beat.",
    "Right hand alone in A, in wait mode: two slurred sixteenths into a staccato eighth, then the same note twice more, staccato, with the same finger. Lift at the end of each slur and keep the repeated notes light.",
    "Left hand alone in B (bars 15–22), where it takes over the figure under right-hand thirds. Then hands together; bar 21 is a right-hand run of sixteenths falling from high G to B.",
    "Switch to play-along with the click at 66. Each clean pass nudges the tempo up toward 132.",
  ],
  watch: [
    "Half steps in the Intro: in bar 3 the right hand has F sharp, then F natural, over the left hand's A, then A flat; in bar 4 the right hand's E becomes E flat over G, then F sharp. Bar 9 has A, then A flat, in both hands.",
    "From bar 21 the right hand plays very high, with up to four ledger lines; the edition writes bars 21–27 an octave lower under an 8va sign.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Bergeronnette, Op. 100 No. 11 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=222" },
  score: {
    bpm: 66, target: 132,
    sections: [{ name: "Intro", from: 1, to: 6 }, { name: "A", from: 7, to: 14 }, { name: "B", from: 15, to: 22 }, { name: "Coda", from: 23, to: 29 }],
    abc: ABC,
  },
};
