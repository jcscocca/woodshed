// Rameau, Tambourin from the Pièces de clavecin (1724), from the Mutopia edition of the Durand 1895 print
// (public domain). The cut time is written as 4/4 with the same bars and note values. The half-bar pickup is
// padded into a full bar 1, so bar numbers run one ahead of the printed ones. The edition has no repeats.
// The left hand's two voices are folded into chords; in bar 17 the low E and B are tied under the moving
// quarters. The prall trills are marked; the reference plays their main notes.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Tambourin
C:Jean-Philippe Rameau
M:4/4
L:1/8
K:Em
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z4 EFGF | E2B2 B2A2 | !pralltriller!G2F2 EFGA | B2e2 !pralltriller!^d2e2 |
[V:2] z8 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,2E,2 |
[V:1] !pralltriller!f4 EFGF | E2B2 B2A2 | !pralltriller!G2F2 EFGA | B2e2 ^def^d |
[V:2] [E,,B,,^D,]4 z4 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,4 |
[V:1] e4 efgf | e2B2 (!pralltriller!c2B2) | (!pralltriller!c2B2) efgf | e2B2 (!pralltriller!c2B2) |
[V:2] [E,,B,,G,]4 z4 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 ^D,4 |
[V:1] (!pralltriller!c2B2) (!pralltriller!g2e2) | (!pralltriller!c2B2) (!pralltriller!g2e2) | (!pralltriller!c2B2) (!pralltriller!g2e2) | (!pralltriller!c2B2) A2B2 |
[V:2] [E,,B,,E,]4 z4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 ^D,4 |
[V:1] !pralltriller!G2F2 EFGF | E2B2 B2A2 | !pralltriller!G2F2 EFGA | B2e2 !pralltriller!^d2e2 |
[V:2] [E,,-B,,-E,]2[E,,B,,^D,]2 z4 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,2E,2 |
[V:1] !pralltriller!f4 EFGF | E2B2 B2A2 | !pralltriller!G2F2 EFGA | B2e2 ^def^d |
[V:2] [E,,B,,^D,]4 z4 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,4 |
[V:1] e2B2 !pralltriller!c2B2 | ^A2B2 !pralltriller!B2=A2 | ^G2A2 !pralltriller!A2=G2 | F2G2 !pralltriller!G2F2 |
[V:2] [E,,B,,G,]4 z4 | [E,,^C,E,]4 [E,,=C,^D,]4 | [E,,B,,D,]4 [E,,A,,^C,]4 | [E,,A,,=C,]4 [E,,B,,^D,]4 |
[V:1] E2e2 EFGF | E2B,2 B,2B,2 | B,2e2 EFGF | E2B,2 B,2B,2 |
[V:2] [E,,B,,E,]2[E,G,B,]2 [E,G,B,]2[E,G,B,]2 | [E,G,B,]2E,,2 E,F,G,F, | E,2[E,G,B,]2 [E,G,B,]2[E,G,B,]2 | [E,G,B,]2E,,2 E,F,G,F, |
[V:1] B,2e2 EFGF | EFGA BAGF | EFGA BAGA | BAGA B2AG |
[V:2] E,2[E,G,B,]2 [E,G,B,]2[E,G,B,]2 | [E,G,B,]4 [E,,B,,E,]4 | [E,,B,,E,]4 [E,,B,,E,]4 | [E,,B,,E,]4 [E,,B,,E,]4 |
[V:1] !pralltriller!F4 EFGF | E2B2 B2A2 | !pralltriller!G2F2 EFGA | B2e2 !pralltriller!^d2e2 |
[V:2] [E,,B,,^D,]4 z4 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,2E,2 |
[V:1] !pralltriller!f4 EFGF | E2B2 B2A2 | !pralltriller!G2F2 EFGA | B2e2 ^def^d |
[V:2] [E,,B,,^D,]4 z4 | [E,,B,,E,]4 ^D,4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,4 |
[V:1] e2B2 !pralltriller!g2f2- | f2B2 !pralltriller!f2e2- | e2B2 !pralltriller!g2f2- | f2B2 !pralltriller!f2e2- |
[V:2] [E,,B,,G,]2z2 z4 | [E,,B,,^D,]4 z4 | [E,,B,,E,]4 z4 | [E,,B,,^D,]4 z4 |
[V:1] e2B2 !pralltriller!e2B2 | !pralltriller!g2B2 !pralltriller!e2B2 | b2B2 !pralltriller!e2B2 | !pralltriller!g2B2 !pralltriller!e2B2 |
[V:2] [E,,B,,E,]4 z4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 z4 | [E,,B,,E,]4 z4 |
[V:1] b2ag fgef | ^de^c^d B=cAB | GAFG EFGF | EFGF EFGF |
[V:2] [E,,-B,,-E,-]8 | [E,,-B,,-E,-]8 | [E,,-B,,-E,-]8 | [E,,-B,,-E,-]8 |
[V:1] EFGF EFGA | B2e2 !pralltriller!^d2e2 | !pralltriller!f4 EFGF | E2B2 B2A2 |
[V:2] [E,,B,,E,]8 | [E,,B,,E,]4 F,2E,2 | [E,,B,,^D,]4 z4 | [E,,B,,E,]4 ^D,4 |
[V:1] !pralltriller!G2F2 EFGA | B2e2 ^def^d | e4 z4 |]
[V:2] [E,,B,,E,]4 z4 | [E,,B,,E,]4 F,4 | [E,,B,,G,]4 z4 |]`;

export default {
  summary: "The Tambourin from Rameau's Pièces de clavecin (1724), a lively dance in E minor named after the Provençal drum, all 63 bars. The original is in cut time (two half-note beats a bar); it is written here as 4/4, so count four quarters. The left hand imitates the drum with an open fifth on E and B under almost every bar. Six sections: A (bars 1–9), B (10–17), A again (18–25), C (26–37), A third time (38–45) and Coda (46–63). Bar 1 holds the half-bar pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Right hand alone in A, in wait mode. The tune starts with four eighths, E–F sharp–G–F sharp, then mostly quarters. The prall trills on G, D sharp and F sharp are quick ornaments; learn the plain notes first and add them later.",
    "Left hand alone. Most bars start with a half-note chord, low E and B with a third note on top (usually the E above), then a D sharp, an F sharp or a rest. In bars 29–33 it plays quarter-note E minor chords instead, with four eighths in bars 30 and 32, and in bars 53–57 it holds one chord for five bars.",
    "Hands together, one section at a time. In bars 30–33 the right hand drops to the B below middle C, the same B that tops the left hand's chords, so the hands share one small space; keep them out of each other's way. Bars 34–36 and 53–57 are mostly runs of eighths over the left hand's chords.",
    "Switch to play-along with the click at 96. Each clean pass nudges the tempo up toward 160.",
  ],
  watch: [
    "Bars 26–28 move by half steps: A sharp then A natural (bar 26) and G sharp then G natural (bar 27) in the right hand, while the left hand's top note sinks from E to C, a half step each half bar, before rising to D sharp.",
    "In bars 45–48 the right hand's last quarter is tied over the bar line to a quarter on the same note, so the next bar starts with a held note; the B on beat 2 is the first new note.",
  ],
  source: { label: "Mutopia Project — Rameau, Tambourin (Pièces de clavecin, Durand 1895)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=487" },
  score: {
    bpm: 96, target: 160,
    sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }, { name: "A again", from: 18, to: 25 }, { name: "C", from: 26, to: 37 }, { name: "A third time", from: 38, to: 45 }, { name: "Coda", from: 46, to: 63 }],
    abc: ABC,
  },
};
