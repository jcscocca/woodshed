// Handel, Sonatina in B flat major, HWV 585, from the Mutopia edition of Handel's Werke (1859, public
// domain), 19 bars. In bars 8–9 the edition moves the left hand up into the treble staff for four notes;
// here they stay in the bass staff, on ledger lines. The trills are left off.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonatina in B flat
C:George Frideric Handel
M:4/4
L:1/16
K:Bb
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z4 z2f2 d2c2 d2B2 | c4 z2f2 B2A2 B2c2 | A4 z2f2 g2e2 c2e2 | f2d2 B2d2 e2c2 A2c2 |
[V:2] B,,2B,2 A,2F,2 B,4 z2G,2 | A,2G,2 A,2F,2 G,4 z2C,2 | F,2E,2 F,2D,2 E,4 z2C2 | D,4 z2B,2 C,4 z2A,2 |
[V:1] d2f2 c2f2 B2f2 A2f2 | G2f2 F2f2 GAB2 F2A2 | B4 z2d2 e2c2 F2f2 | d2B2 z2f2 b2g2 c2c'2 |
[V:2] B,4 A,4 G,4 F,4 | E,4 D,4 E,4 F,4 | B,2C2 D2B,2 C4 A,4 | B,2D2 F2A,2 G,4 z2=E2 |
[V:1] a4 z2c'2 d2c'2 =e2c'2 | f2b2 a2g2 a3b g3f | f4 z2F2 B2c2 d2B2 | G4 z2G2 c2d2 e2c2 |
[V:2] F2G2 A2A,2 B,4 C4 | D4 z2B,2 C2B,2 C2C,2 | F,2G,2 A,2F,2 D,4 z2D,2 | E,2F,2 G,2E,2 C,4 z2E,2 |
[V:1] A4 z2A2 d2e2 f2d2 | B4 z2B2 e2gf edcB | A4 z2f2 g2e2 c2a2 | b2B2 B2e2 d2cB A3B |
[V:2] F,2G,2 A,2F,2 D,4 z2F,2 | G,2A,2 B,2G,2 C4 z2E,2 | F,2E,2 F,2D,2 E,4 z2F,2 | G,4 z2A,2 B,2E,2 F,2F,,2 |
[V:1] B4 z2A2 G2B2 F2B2 | E2A2 B2e2 d4 c3B | [DFB]16 |]
[V:2] B,,2C,2 D,2B,,2 E,4 D,4 | C,4 B,,2G,2 F,2E,2 F,2F,,2 | B,,16 |]`;

export default {
  summary: "Handel's Sonatina in B flat major, HWV 585, a short two-part keyboard piece from about 1721, all 19 bars. 4/4, one line in each hand, mostly in eighth notes. Four sections: A1 (bars 1–4), A2 (5–10), which cadences in F major on the first beat of bar 11, B1 (11–14), a rising sequence back toward B flat, and B2 (15–19).",
  steps: [
    "Right hand alone in A1, in wait mode. Bars 1–3 each start their run of five eighths after a rest, always from the high F; bar 4 is eight even eighths. Keep them even and a little detached.",
    "Left hand alone. It moves in eighths too, often answering the right hand during its rests, and in bars 5–6 walks in quarters, B flat down to F, then E flat–D–E flat–F.",
    "Bars 12–14 repeat the shape of bar 11 a step higher each time: in the right hand a quarter, a rest, then that note again and a run up from it, on G, A and B flat. Learn bar 12 hands together, then move it up.",
    "Hands together in wait mode, a section at a time, then play-along with the click at 66. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "In bars 8 and 9 the left hand climbs above middle C, to E natural, F, G and A. The edition writes those notes in the treble staff; here they sit on ledger lines above the bass staff.",
    "The edition marks trills in bars 2, 3, 10 and 16. They are left off the score; add them once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Handel, Sonatina in B-flat, HWV 585 (Handel's Werke, 1859)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=98" },
  score: {
    bpm: 66, target: 100,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 10 }, { name: "B1", from: 11, to: 14 }, { name: "B2", from: 15, to: 19 }],
    abc: ABC,
  },
};
