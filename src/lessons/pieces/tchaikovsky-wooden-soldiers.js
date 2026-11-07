// Tchaikovsky, "March of the Wooden Soldiers", Op. 39 No. 5 (Album for the Young), from the Mutopia edition
// of the Schirmer 1904 print (public domain), 48 bars with the reprise written out. The edition writes the
// left hand in the treble clef, and so does this score.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:March of the Wooden Soldiers
C:Pyotr Ilyich Tchaikovsky
M:2/4
L:1/16
K:D
%%staves {1 2}
V:1 clef=treble
V:2 clef=treble
[V:1] [Ad]2z2 d2z2 | B3^A B2zc | [Ad]2z2 d2z2 | B3^A B2zc |
[V:2] [DF]2z6 | [DG]3F G2zE | [DF]2z6 | [DG]3F G2zE |
[V:1] [Ad]2z2 [ce]2z2 | f2z2 [df]2z2 | [eg]2z[df] [ce]2z[Bd] | [ce]2z6 |
[V:2] [DF]2z2 A2z2 | d2z6 | [DA]2z6 | A2AA A2A2 |
[V:1] [Ad]2z2 d2z2 | B3^A B2zc | [Ad]2z2 d2z2 | B3^A B2zc |
[V:2] [DF]2z6 | [DG]3F G2zE | [DF]2z6 | [DG]3F G2zE |
[V:1] [Ad]2z2 [ce]2z2 | f2z2 [df]2z2 | [ce]2z[Bd] [Ac]2z[^GB] | A2z6 |
[V:2] [DF]2z2 A2z2 | d2z2 D2z2 | E8 | A,2A,A, A,2A,2 |
[V:1] [EA]2z2 A2z2 | _B3A _B2z^G | A2z2 A2z2 | _B3A _B2z^G |
[V:2] [A,C]2z6 | [A,D=F]8 | [A,CE]2z6 | [A,D=F]8 |
[V:1] A2z2 B2z2 | [^Gc]2z2 [Ac]2z2 | [Bd]2zc B2zA | ^G2z6 |
[V:2] [A,CE]2z2 [E^G]2z2 | [C^E]2z2 F2z2 | [B,F]2z6 | E2zD C2zB, |
[V:1] [EA]2z2 A2z2 | _B3A _B2z^G | A2z2 A2z2 | _B3A _B2z^G |
[V:2] [A,C]2z6 | [A,D=F]8 | [A,CE]2z6 | [A,D=F]8 |
[V:1] A2z2 B2z2 | [^Gc]2z2 [Ac]2z2 | [Bd]2zc B2zc | A2z6 |
[V:2] [A,CE]2z2 [E^G]2z2 | [C^E]2z2 F2z2 | [B,F]2z2 [E^G]2z2 | A,2zA, B,2zC |
[V:1] [Ad]2z2 d2z2 | B3^A B2zc | [Ad]2z2 d2z2 | B3^A B2zc |
[V:2] [DF]2z6 | [DG]3F G2zE | [DF]2z6 | [DG]3F G2zE |
[V:1] [Ad]2z2 [ce]2z2 | f2z2 [df]2z2 | [eg]2z[df] [ce]2z[Bd] | [ce]2z6 |
[V:2] [DF]2z2 A2z2 | d2z6 | [DA]2z6 | A2AA A2A2 |
[V:1] [Ad]2z2 d2z2 | B3^A B2zc | d2z2 d2z2 | B3^A B2zc |
[V:2] [DF]2z6 | [DG]3F G2zE | [DF]2z6 | [DG]3F G2zE |
[V:1] [Ad]2z2 [ce]2z2 | f2z2 [df]2z2 | e2z^d e2zf | d2z6 |]
[V:2] [DF]2z2 A2z2 | d2z2 B2z2 | [GB]2z2 [Ac]2z2 | D2z6 |]`;

export default {
  summary: "March of the Wooden Soldiers, No. 5 of Tchaikovsky's Album for the Young, Op. 39 (1878), in the Schirmer edition's version, all 48 bars. D major, 2/4, short detached chords and a dotted figure in every other bar. Six sections: A (bars 1–8), A′ (9–16), B (17–24), B′ (25–32), A again (33–40) and A″ (41–48). B turns to D minor colours over a held A in the left hand; the last eight bars change the ending to close on D.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 2 and 4 are the figure B–A sharp–B, then a sixteenth rest and C sharp: a dotted eighth, a sixteenth, an eighth. Count it in sixteenths until the short notes land late and quick.",
    "Left hand alone. Both staves are in the treble clef, so the left hand reads like the right. In A it plays the dotted figure with the right hand, G–F sharp–G under B–A sharp–B; in B it holds a three-note chord, A–D–F natural, for a whole bar in bars 18, 20, 26 and 28.",
    "Hands together in wait mode, a section at a time. Most notes are eighths with an eighth rest after them; lift on the rest so every chord is short.",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 120.",
  ],
  watch: [
    "B flat and F natural belong to B (bars 18, 20, 26 and 28). G sharp comes all through B, and E sharp in bars 22 and 30. The B in bars 21 and 29 is natural again.",
    "Bars 7 and 39 move in two-note chords: E–G, then D–F sharp on the last sixteenth of the beat, then C sharp–E and B–D the same way. Keep the sixteenth chords short and light.",
  ],
  source: { label: "Mutopia Project — Tchaikovsky, March of the Wooden Soldiers, Op. 39 No. 5 (Schirmer, 1904)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1806" },
  score: {
    bpm: 72, target: 120,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "A′", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "B′", from: 25, to: 32 }, { name: "A again", from: 33, to: 40 }, { name: "A″", from: 41, to: 48 }],
    abc: ABC,
  },
};
