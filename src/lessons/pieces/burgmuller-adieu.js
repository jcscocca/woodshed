// Burgmüller, "L'Adieu", Op. 100 No. 12, from the Mutopia edition of the Collection Litolff print (public
// domain), 42 bars in 4/4. The three-eighth pickup is padded into a full first bar, so bar numbers run one ahead
// of the printed ones. The left hand's clef changes are kept where the edition has them and restated at the
// start of each line, since abcjs starts every line in the declared clef.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:L'Adieu
C:Friedrich Burgmüller
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z4 z efe | e2 d2 z d{/f}ed | d2 c2 z e^de | d'3c' ba^gf | edcB ^ABed |
[V:2] z8 | [K:clef=treble] z[FA][FA][FA] [FA]z z2 | z[EA][EA][EA] [EA]z z2 | [K:clef=bass] [E,^G,B,D]6 z2 | z8 |
[V:1] (3cAc (3ded (3cdc (3Bcd | (3ecA (3ded (3cdc (3Bcd | (3ecA (3fdA (3ecA (3^dcA | (3eAB (3cBA (3eBc (3dcB |
[V:2] A,2 [K:clef=treble] F2 E2 D2 | C2F2E2D2 | C2D2E2F2 | E2z2 [K:clef=bass] [E,^G,D]4 |
[V:1] (3cAc (3ded (3cdc (3Bcd | (3edA (3ded (3cdc (3Bcd | (3ecA (3geA (3fdA (3a^fc | (3aec (3e^de (3a^ga (3c'bc' |
[V:2] [A,C]z [K:clef=treble] F2 E2 D2 | C2F2E2D2 | C2^C2D2^D2 | E4 z4 |
[V:1] e'z E2 c2 B2 | Az (3fed (3dcB (3BA^G | Az (3fed (3dcB (3BA^G | (3AcB (3Ace a2 z2 |
[V:2] (3E,A,C (3E,A,C (3E,^G,D (3E,^G,D | [A,C]z [A,DF]4 [A,DF]2 | [A,CE]z [A,DF]4 [A,DF]2 | [A,CE]2 z2 A,,2 z2 |
[V:1] g2e2c'2a2 | g2e'2c'2g2 | g2f2f2e2 | d2g2f2d2 |
[V:2] [K:clef=treble] (3CEG (3CEG (3CFA (3CFA | (3CEG (3CEG (3CEG (3CEG | (3B,DG (3B,DG (3CEG (3CEG | (3G,B,D (3G,B,D (3G,B,D (3G,B,D |
[V:1] g2e2c'2a2 | g2g'2e'2c'2 | b2_a2f2d2 | c2e2e2d2 |
[V:2] [K:clef=treble] (3CEG (3CEG (3CFA (3CFA | (3CEG (3CEG (3CEG (3CEG | (3CF_A (3CF_A (3CF_A (3CF_A | (3CEG (3CEG (3B,E^G (3B,E^G |
[V:1] (3cAc (3ded (3cdc (3Bcd | (3ecA (3ded (3cdc (3Bcd | (3ecA (3fdA (3ecA (3^dcA | (3eAB (3cBA (3eBc (3dcB |
[V:2] [K:clef=treble] A,2F2E2D2 | C2F2E2D2 | C2D2E2F2 | E2z2 [K:clef=bass] [E,^G,D]4 |
[V:1] (3cAc (3ded (3cdc (3Bcd | (3ecA (3ded (3cdc (3Bcd | (3ecA (3geA (3fdA (3a^fc | (3aec (3e^de (3a^ga (3c'bc' |
[V:2] [A,C]z [K:clef=treble] F2 E2 D2 | C2F2E2D2 | C2^C2D2^D2 | E4 z4 |
[V:1] e'z E2 c2 B2 | Az (3fed (3dcB (3BA^G | Az (3fed (3dcB (3BA^G | (3AcB (3Ace a2 z2 |
[V:2] (3E,A,C (3E,A,C (3E,^G,D (3E,^G,D | [A,C]z [A,DF]4 [A,DF]2 | [A,CE]z [A,DF]4 [A,DF]2 | [A,CE]2 z2 z2 [DF]2 |
[V:1] (3ac'b (3ac'e' .a'2 z2 | (3AcB (3Ace .a2 z2 | (3ac'b (3ac'e' .a'2 z2 | A2 z2 .[ca]2 z2 | [CA]4 z4 |]
[V:2] [CE]6 [B,D]2 | [A,C]6 [DF]2 | [CE]6 [B,D]2 | [A,C]2 z2 [A,E]2 z2 | [A,,E,]4 z4 |]`;

export default {
  summary: "Burgmüller's \"L'Adieu\" (The Farewell), No. 12 of his 25 easy studies, Op. 100, all 42 bars in 4/4, in A minor. After a short, broken-off opening, the right hand runs in triplet eighths over a left hand in quarters. Five sections: Intro (bars 1–5), A (6–17), B (18–25, in C major, where the left hand takes over the triplets), A again (26–37) and Coda (38–42). Bar 1 holds the three-eighth pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Right hand alone in A, in wait mode. Each beat is three triplet eighths, and the first of each group falls on the click: in bar 6, C–A–C, D–E–D, C–D–C, B–C–D. Keep the groups even and let the hand turn around the same few notes rather than jumping.",
    "Left hand alone. In bars 6–12 it plays mostly quarters in the treble clef, C, F, E, D, moving to the bass clef for the low A in bar 6 and the E–G sharp–D chord in bar 9. In B (bars 18–25) it plays the triplets itself as broken chords, C–E–G, while the right hand sings in quarters above.",
    "Hands together by section. In bars 15–16 the right hand plays an A and an eighth rest, then three falling triplets, F–E–D, D–C–B, B–A–G sharp, over held left-hand chords; in bar 14 the left hand's triplets start on the low E.",
    "Play-along with the click at 110. Each clean pass nudges the tempo up toward 184.",
  ],
  watch: [
    "Bar 1 is the pickup, E–F–E. In bar 2 a quick grace note F comes just before the E on beat 4.",
    "Sharps come and go: D sharp in bars 3, 8 and 13, F sharp and the left hand's C sharp and D sharp in bar 12, G sharp in bars 15–16, and the same again in bars 28–36. Bar 24 has A flat in both hands.",
    "In the Coda bars 38–40 each run up an A minor arpeggio to a short A. Bar 39 starts two octaves below where bar 38 ends, and bar 40 goes back up an octave.",
  ],
  source: { label: "Mutopia Project — Burgmüller, L'Adieu, Op. 100 No. 12 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=223" },
  score: {
    bpm: 110, target: 184,
    sections: [{ name: "Intro", from: 1, to: 5 }, { name: "A", from: 6, to: 17 }, { name: "B", from: 18, to: 25 }, { name: "A again", from: 26, to: 37 }, { name: "Coda", from: 38, to: 42 }],
    abc: ABC,
  },
};
