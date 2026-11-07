// Burgmüller, "Tendre Fleur", Op. 100 No. 10, from the Collection Litolff edition. The edition puts the left
// hand in the treble clef for bars 2–8 and 18–24; here it stays in the bass clef, since the stage does not
// move a sharp key signature with a clef change.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Tendre Fleur
C:Friedrich Burgmüller
M:4/4
L:1/8
K:D
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] DE FA Ad df | fe cA a4 | af' f'd' d'a af | fe cA a4 |
[V:2] z8 | [A,G]4 GE CA, | [DF]2 z6 | [A,G]4 GE CA, |
[V:1] ag fe d2 ef | gf ed ce ac' | d'b ag fg fe | dB AG [Fd]2 z2 |
[V:2] [DF]2 z2 BA GF | EF G^G A3=G | FG FB AB AG | FG FE D2 z2 |
[V:1] c4- cc ea | ^g4- gf ed | c4- cc ea | ^g4- gf ed |
[V:2] A,C CE E4 | B,D DE E4 | A,C CE E4 | B,D DE E4 |
[V:1] ce {d/e/}dc Bd {c/d/}cB | Ae cA ^GE FG | A^G BA =GF AG | FE GF AG FE |
[V:2] A,2 z2 [DF]2 z2 | [E,C]2 z2 [E,D]2 z2 | [A,C]2 z6 | z8 |
[V:1] DF FA Ad df | fe cA a4 | af' f'd' d'a af | fe cA a4 |
[V:2] z8 | [A,G]4 GE CA, | [DF]2 z6 | [A,G]4 GE CA, |
[V:1] ag fe d2 ef | gf ed ce ac' | d'b ag fg fe | dB AG [Fd]2 z2 |]
[V:2] [DF]2 z2 BA GF | EF G^G A3=G | FG FB AB AG | FG FE D2 z2 |]`;

export default {
  summary: "Burgmüller's \"Tendre Fleur\" (Tender Flower), No. 10 of his 25 easy studies, Op. 100, all 24 bars, in D major and 4/4. The right hand plays pairs of slurred eighths and short falling runs, and the left hand answers it or rocks through broken chords. Three sections: A (bars 1–8), B (9–16) and A′ (17–24). The original repeats bars 1–8 and bars 9–24; here you play each part once.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1 and 3 are pairs of eighths, each pair slurred with the second note short: lift after each pair. In bars 2 and 4 the falling F sharp–E–C sharp–A leaps an octave up to a held A.",
    "Left hand alone. In bars 2–4 it answers the right hand: a held A–G, then G–E–C sharp–A falling. In bars 5–8 it has a running line of eighths of its own; bar 6 has G sharp, then G natural at the end of the bar.",
    "B (bars 9–16): the right hand holds C sharp, then G sharp, while the left hand rocks through broken chords underneath. In bar 13 each turn starts with two quick grace notes; play them just before the beat so the main note lands on it.",
    "Switch to play-along with the click at 60. Each clean pass nudges the tempo up toward 112.",
  ],
  watch: [
    "In bars 9 and 11 the C sharp is tied into beat 3 and struck again halfway through it; don't strike it again on beat 3 itself.",
    "The left hand stays in the bass clef here, so bars 2–8 and 18–24 sit high, with ledger lines: the chord in bar 2 is the A below middle C and the G above it.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Tendre Fleur, Op. 100 No. 10 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=221" },
  score: {
    bpm: 60, target: 112,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A′", from: 17, to: 24 }],
    abc: ABC,
  },
};
