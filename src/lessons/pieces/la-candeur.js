// Burgmüller, "La Candeur", Op. 100 No. 1, from the Collection Litolff edition. The left hand moves to the
// treble clef for bars 15–20, as in the edition; abcjs starts each line in the voice's own clef, so the
// bars 17–20 line restates it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Candeur
C:Friedrich Burgmüller
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] gedc gedc | c'agf c'agf | gedc Bcef | gedc Bcde |
[V:2] [C,E,G,]8 | [C,F,A,]8 | [C,E,G,]8- | [C,E,G,]8 |
[V:1] gfed gfed | fedc fedc | BAcB dcBA | GBcd g2 z2 ||
[V:2] [B,,F,G,]8 | [C,E,G,]8 | [D,^F,C]8 | [G,B,]6 z2 ||
[V:1] fdcB fdcB | [ce]8 | fdcB fdcB | [ce]8 |
[V:2] G,B,CD G,B,CD | G,A,B,C DCEC | G,B,CD G,B,CD | G,A,B,C DCEC |
[V:1] g_edc ^fedc | agcd feGA | cBGA cBed | cBcd efgc |
[V:2] A,4 [A,C]4 | [G,CE]8 | [K:clef=treble] [G,F]4 [G,F]4 | [CE]4 z4 |
[V:1] fdcB fdcB | cBcd efgc | fdcB fdcB | c2 z2 z4 |
[V:2] [K:clef=treble] [CF_A]4 [CFA]4 | [CEG]8 | [CF_A]4 [CFA]4 | [CEG]2 z2 [K:clef=bass] C,E,F,G, |
[V:1] [Gce]4 z4 | [Ec]8 |]
[V:2] C,4 C,E,F,G,- | [C,G,]8 |]`;

export default {
  summary: "Burgmüller's \"La Candeur\" (Candour), the first of his 25 easy studies, Op. 100, all 22 bars. The right hand plays a smooth line of eighth notes over held left-hand chords; in bars 9–12 the left hand takes over the eighths as broken chords. Five sections: A1 (bars 1–4), A2 (5–8), B1 (9–12), B2 (13–16) and Coda (17–22). The original repeats bars 1–8, and bars 9–15 with a first ending; here you play each part once and go straight on to the second ending, bar 16.",
  steps: [
    "Right hand alone in A1, in wait mode. Most bars are two falling groups of four eighths; play each group as one smooth gesture, every note joined to the next, and lift the hand only as the next group begins.",
    "Then the left hand alone. In A1 and A2 it holds one chord a bar, so the work is changing chords with no gap. In B1 it takes over the eighths, G–B–C–D, while the right hand answers with a held C and E.",
    "Hands together in wait mode, a section at a time. Bars 16–19 are one two-bar pattern played twice before the closing chords, so once bars 16–17 are secure the Coda follows quickly.",
    "Switch to play-along with the click at 56. Each clean pass nudges the tempo up toward 88.",
  ],
  watch: [
    "Bar 13 is two lines in one hand: the fifth finger holds G, then F sharp, for two beats while E flat, D and C move underneath. The score writes the long notes as eighths so the hand fits on one line, but keep them held. The E flat holds for the whole bar.",
    "From bar 15 the left hand moves up into the treble clef, and it goes back to the bass clef halfway through bar 20. Read bars 15–20 in the lower staff as treble, and watch for the A flats in bars 17 and 19.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Candeur, Op. 100 No. 1 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=202" },
  score: {
    bpm: 56, target: 88,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }, { name: "Coda", from: 17, to: 22 }],
    abc: ABC,
  },
};
