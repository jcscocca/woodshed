// Franz Behr, "In May", from the Mutopia edition of the Thiebes-Stierlin print (c.1903, public domain),
// 32 bars. The edition writes both staves in the treble clef, and so does this score.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:In May
C:Franz Behr
M:3/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=treble
[V:1] g e c | d3 | g e c | d3 |
[V:2] C E G | B, F G | C E G | B, F G |
[V:1] c d e | f e d | e d c | d3 |
[V:2] C E G | B, F G | C E G | B, F G |
[V:1] g e c | d3 | g e c | d3 |
[V:2] C E G | B, F G | C E G | B, F G |
[V:1] c d e | f g f | e2 d | c3 |
[V:2] C E G | C F A | B, F G | C E G |
[V:1] d d d | d e f | e g e | c3 |
[V:2] B, F G | B, F G | C E G | C E G |
[V:1] d d d | d e f | e g e | c3 |
[V:2] B, F G | B, F G | C E G | C E G |
[V:1] g e c | d3 | g e c | d3 |
[V:2] C E G | B, F G | C E G | B, F G |
[V:1] c d e | f g f | e2 d | c3 |]
[V:2] C E G | C F A | B, F G | C3 |]`;

export default {
  summary: "Franz Behr's \"In May\", a short Andante in C major and 3/4, all 32 bars. The right hand has a quarter-note tune, mostly one note a beat, over a left hand that walks up a broken chord in quarters in every bar, C–E–G or B–F–G. Four sections: A (bars 1–8), A′ (9–16), B (17–24) and A′ again (25–32). A′ starts like A but turns at bar 14 to close on C; the last section repeats A′ note for note.",
  steps: [
    "Left hand alone in A, in wait mode. It alternates two shapes, C–E–G and B–F–G; only the lowest note moves, from C down to B, while the thumb keeps G. Bar 14 is the one new shape, C–F–A.",
    "Right hand alone. Bars 1–4 are a falling G–E–C answered by a held D; bars 5–8 move by step. In B (bars 17–24) the tune sits on repeated Ds before climbing to F.",
    "Hands together in wait mode, a section at a time. Each right-hand note lands with a left-hand note, so the hands move in step; the held notes in bars 2, 4 and 8 are where the left hand carries on alone.",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "Both staves are in the treble clef. The left hand's lowest note is middle C, on the ledger line below the staff, or the B just under it.",
    "Hold the dotted halves in bars 2, 4, 8 and the section ends for their full three beats while the left hand plays its three quarters underneath.",
  ],
  source: { label: "Mutopia Project — Behr, In May (Thiebes-Stierlin Music Co., c.1903)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2155" },
  score: {
    bpm: 72, target: 100,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "A′", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A′ again", from: 25, to: 32 }],
    abc: ABC,
  },
};
