// Burgmüller, "Douce Plainte", Op. 100 No. 16, from the Collection Litolff edition. Where the edition writes
// the left hand in the treble clef (bars 6–7 and 9–12) those notes are a second left-hand voice in the upper
// staff, since the stage does not move a flat key signature with a clef change.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Douce Plainte
C:Friedrich Burgmüller
M:4/4
L:1/16
K:Gm
%%staves {(1 2) 3}
V:1 clef=treble
V:2 clef=treble
V:3 clef=bass
[V:1] d8- d2c2 B2A2 | G8- G2d2 g2f2 | e8- e2e2 d2c2 | d8- d2z2 z4 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] G,B,G,B, DB,DB, G,2z2 z4 | G,B,G,B, DB,DB, G,2z2 z4 | CECE GEGE C2z2 z4 | G,B,G,B, DB,DB, G,2D2 E2D2 |
[V:1] AcAc dcdc A2z2 z4 | GBGB dBdB G2z2 z4 | z4 g2=e2 ^c2A2 G2=E2 | D2d2 ^F2d2 A2d2 ^c2d2 |
[V:2] x16 | x8 x2B,2 D2G2 | B2A2 x12 | x16 |
[V:3] ^F,8- F,2D2 E2D2 | G,8- G,2z2 z4 | z16 | D,4 z12 |
[V:1] [ce]2[cd]2 [ce]2[cd]2 [ce]2[cd]2 [ce]2[cd]2 | d2g2 f2e2 d2d2 e2=e2 | [eg]2[ef]2 [eg]2[ef]2 [eg]2[ef]2 [eg]2[ef]2 | f2b2 a2g2 f2b2 c'2d'2 |
[V:2] [^FA]2[FA]2 [FA]2[FA]2 [FA]2[FA]2 [FA]2[FA]2 | [G-B-]8 [GB]2x2 x4 | [Ac]2[Ac]2 [Ac]2[Ac]2 [Ac]2[Ac]2 [Ac]2[Ac]2 | [B-d-]8 [Bd]2x2 x4 |
[V:3] z16 | z16 | z16 | z16 |
[V:1] d'6a2 b6g2 | ^f6a2 g6d2 | f2e2 d2c2 B2G2 d2^F2 | GBdB Gz3 z8 |]
[V:2] x16 | x16 | x16 | x16 |]
[V:3] ^F,A,F,A, F,2z2 G,B,G,B, G,2z2 | A,CA,C A,2z2 B,DB,D =B,DB,D | C4 D2E2 D2z2 [D,C]4 | [G,B,]4 z^CDB, G,2z2 z4 |]`;

export default {
  summary: "Burgmüller's \"Douce Plainte\" (Sweet Lament), No. 16 of his 25 easy studies, Op. 100, all 16 bars, in G minor and 4/4. Groups of sixteenths pass between the hands under a slow tune. Four sections: A1 (bars 1–4), A2 (5–8), B1 (9–12) and B2 (13–16). The original repeats each half with a first ending; here you play each half once and take the second endings (bars 8 and 16), so bars 9–15 are printed as 10–16.",
  steps: [
    "Left hand alone in A1, in wait mode. Each bar starts with one slurred group of sixteenths ending on an eighth: G–B flat–G–B flat–D–B flat–D–B flat, or the same shape on C–E flat–G in bar 3. Bars 1–3 then rest; bar 4 goes on in eighths. Keep the hand still over the notes and play the group as one movement.",
    "In A2 the sixteenths move to the right hand while the left hand holds F sharp, then G. Bar 7 is a falling line of right-hand eighths, G–E–C sharp–A–G–E; then hands together in A.",
    "B1 (bars 9–12): in bars 9 and 11 the right hand rocks between a third and a second in eighths (C–E flat to C–D in bar 9) over repeated left-hand chords. Keep both hands light and even, with no accents, and hold the left hand's half-note chords in bars 10 and 12.",
    "Switch to play-along with the click at 56. Each clean pass nudges the tempo up toward 104.",
  ],
  watch: [
    "From the middle of bar 6 to the end of bar 7, and in bars 9–12, the left hand moves into the upper staff as a second voice under the right hand, and the lower staff rests.",
    "B flat and E flat are in the key signature, so watch the written accidentals: both Es in bar 7 are natural, bar 10 ends E flat, then E natural, and the left hand's last group in bar 14 has B natural.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Douce Plainte, Op. 100 No. 16 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=228" },
  score: {
    bpm: 56, target: 104,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }],
    abc: ABC,
  },
};
