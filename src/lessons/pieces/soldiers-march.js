// Schumann, "Soldier's March", Op. 68 No. 2 (Album for the Young); pitches and rhythms checked against the
// Mutopia edition (CC BY-SA 2.5).
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Soldier's March
C:Robert Schumann
M:2/4
L:1/16
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] [GB]3[Gc] [Gd]2z2 | [Ge]2z2 [Gd]2z2 | [Fc]2z2 [GB]2z2 | [FA]2z2 G2z2 |
[V:2] G,3A, B,2z2 | C2z2 B,2z2 | A,2z2 G,2z2 | [D,C]2z2 [G,B,]2z2 |
[V:1] [GB]3[Gc] [Gd]2z2 | [Ge]2z2 [Gd]2z2 | [eg]2z2 [df]2z2 | [^ce]2z2 d2z2 ||
[V:2] G,3A, B,2z2 | C2z2 B,2z2 | ^C2z2 D2z2 | [A,G]2z2 [DF]2z2 ||
[V:1] [GB]3[Gc] [Gd]2z2 | [Ge]2z2 [Gd]2z2 | [Fc]2z2 [GB]2z2 | [FA]2z2 G2z2 |
[V:2] G,3A, B,2z2 | C2z2 B,2z2 | A,2z2 G,2z2 | [D,C]2z2 [G,B,]2z2 |
[V:1] [GB]3[Gc] [Gd]2z2 | [Ge]2z2 [Gd]2z2 | [eg]2z2 [df]2z2 | [^ce]2z2 d2z2 ||
[V:2] G,3A, B,2z2 | C2z2 B,2z2 | ^C2z2 D2z2 | [A,G]2z2 [DF]2z2 ||
[V:1] D3E F4 | E4 D4 | [Fe]2z2 [Gd]2z2 | [Ac]2z2 [GB]2z2 |
[V:2] D,3E, F,4 | E,4 D,4 | C2z2 B,2z2 | [F,D]2z2 [G,D]2z2 |
[V:1] [DFA]3E F4 | E4 D4 | [Ac]2z2 [GB]2z2 | [FA]2z2 [GB]2z2 |
[V:2] D,3E, F,4 | E,4 D,4 | [F,D]2z2 [G,D]2z2 | [D,D]2z2 [G,D]2z2 |
[V:1] [GB]3[Gc] [Gd]2z2 | [Ge]2z2 [Gd]2z2 | [Fc]2z2 [GB]2z2 | [FA]2z2 G2z2 |
[V:2] G,3A, B,2z2 | C2z2 B,2z2 | A,2z2 G,2z2 | [D,C]2z2 [G,B,]2z2 |
[V:1] C3D E4 | D4 C4 | D4 [Adf]2z2 | [Bdg]2z2 z4 |]
[V:2] C,3D, E,4 | D,4 C,4 | D,4 D2z2 | G,2z2 z4 |]`;

export default {
  summary: "Schumann's \"Soldier's March\", the second piece in his Album for the Young (1848), all 32 bars: short, crisp chords in both hands over a dotted march rhythm. Four sections: A1 (bars 1–8), A2 (9–16, the same music again), B (17–24) and A′ (25–32). The original repeats the second half, bars 17–32; here you play it once.",
  steps: [
    "Tap the rhythm of bar 1 before you play it: long, short, long — a dotted eighth, a sixteenth, then an eighth. Keep the short note tight against the next one; that snap is what makes it a march.",
    "Right hand alone in A1, wait mode. Most chords keep G at the bottom while the top note climbs and falls, so let the thumb stay on G and the upper finger do the moving.",
    "Left hand alone, then hands together, a section at a time. In B, and again near the end, the two hands play the same line an octave apart (bars 17–18, 21–22 and 29–30), so keep them exactly together.",
    "Switch to play-along with the click at 66. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "Nearly every chord is followed by a rest. Lift off on time so the silences are as even as the notes — a held chord blurs the march.",
    "C sharps in bars 7–8 and 15–16: the left hand has one, then the right. The left-hand chords in bars 8 and 16 sit high, with G and F sharp above middle C, so they carry ledger lines above the bass staff.",
  ],
  source: { label: "Mutopia Project — Schumann, Marche militaire (Soldatenmarsch), Op. 68 No. 2 (typeset by Philippe Hézaine, CC BY-SA 2.5)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=650" },
  score: {
    bpm: 66, target: 100,
    sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A′", from: 25, to: 32 }],
    abc: ABC,
  },
};
