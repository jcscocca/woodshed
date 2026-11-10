// Burgmüller, "La Pastorale", Op. 100 No. 3, from the Collection Litolff edition. The 6/8 original is
// written in 3/4 with eighths, one printed bar to one bar here. The edition moves the left hand to the
// treble clef for bars 9–10 and 15–18; G major has a sharp, so the stage can't carry a clef change and the
// left hand stays in the bass clef with ledger lines. Voice 3 is the left hand's held lower notes in
// bars 11–14 and 18.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Pastorale
C:Friedrich Burgmüller
M:3/4
L:1/8
K:G
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] GBcd Be | dged Bc | d3 Bd {f}e | d3 gdB |
[V:2] z6 | z6 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] A3 {AB}cAB | G3 GBc | d3 Bd {f}e | d3 dBg |
[V:2] [G,CD][G,CD][G,CD] [G,CD]3 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] f3 efe | d3 d'2 z | a3 ced | B3 d^cd |
[V:2] A,AA GAG | FAF D2 z | zDD D3 | zDD D3 |
[V:3] x6 | x6 | [F,C]6 | [G,B,]6 |
[V:1] a3 ced | B3 ded | ^c6 | d_e_e _edc |
[V:2] zDD D3 | zDD D3 | z_B_B _BAG | F6 |
[V:3] [F,C]6 | [G,B,]6 | x6 | x6 |
[V:1] Bcd fec | B3 Add | d3 Bd {f}e | d3 gdB |
[V:2] G3 [CE]3 | zGG F2 z | [G,B,D][G,B,D][G,B,D] [G,B,D]3 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 |
[V:3] x6 | D3-D2 x | x6 | x6 |
[V:1] A3 {AB}cAB | G3 GBc | d3 Bde | d3 ceg |
[V:2] [G,CD][G,CD][G,CD] [G,CD]3 | [G,B,D][G,B,D][G,B,D] [G,B,D]3 | [=F,G,B,D][=F,G,B,D][=F,G,B,D] [=F,G,B,D]3 | [E,G,C][E,G,C][E,G,C] [E,G,C]3 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] gdB B2A | G3 {B}AEF | G3 {B}AEF | .G.B.d .g.b.d' |
[V:2] [D,G,B,]3 D,DC | [G,B,][G,B,D][G,B,D] [G,CD]3 | [G,B,D][G,B,D][G,B,D] [G,CD]3 | [G,B,D]2 z [G,B,D]2 z |
[V:3] x6 | x6 | x6 | x6 |
[V:1] g'2 z4 |]
[V:2] G,,2 z4 |]
[V:3] x6 |]`;

export default {
  summary: "Burgmüller's \"La Pastorale\", No. 3 of his 25 easy studies, Op. 100, all 29 bars, in G major. The original is in 6/8; here each bar is written in 3/4 with eighths, so a bar is two groups of three eighths, counted in two. Five sections: Intro (bars 1–2, right hand alone), A (3–10), B (11–18), A′ (19–26) and Coda (27–29). The original repeats bars 3–10; here you play them once.",
  steps: [
    "Right hand alone in A, in wait mode. Most bars are a dotted quarter followed by three eighths; hold the dotted quarter for its full three eighths and join it to the next group. The small notes are quick graces played just before the beat: F sharp before E in bars 3 and 7, and A–B before C in bar 5.",
    "Left hand alone in A. Each bar is one chord struck as three eighths and a dotted quarter: G–B–D, with C in place of B in bar 5. Keep the repeated chords light and even and hold the last one for its whole half bar.",
    "Left hand alone in B (bars 11–14). The lower notes, F sharp with C and then G with B, are held for the whole bar while the thumb plays D three times on the off-beats. Strike the held notes once and keep them down.",
    "Hands together, a section at a time, then play-along with the click at 50. Each clean pass nudges the tempo up toward 84.",
  ],
  watch: [
    "Bars 15–16 bring in flats outside the key: B flat in the left hand in bar 15 and E flat three times in the right hand in bar 16. Bar 17 goes back to B natural, and bar 23 has F natural in the left-hand chord.",
    "Bar 28 is a staccato G major arpeggio in the right hand, rising two octaves to the high G of the last bar. Keep it light and even and land the top G cleanly.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Pastorale, Op. 100 No. 3 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=218" },
  score: {
    bpm: 50, target: 84,
    sections: [{ name: "Intro", from: 1, to: 2 }, { name: "A", from: 3, to: 10 }, { name: "B", from: 11, to: 18 }, { name: "A′", from: 19, to: 26 }, { name: "Coda", from: 27, to: 29 }],
    abc: ABC,
  },
};
