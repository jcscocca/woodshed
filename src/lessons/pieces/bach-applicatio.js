// Bach, Applicatio, BWV 994 (Clavier-Büchlein for Wilhelm Friedemann Bach), from the Mutopia edition of the
// Bach-Gesellschaft print, 8 bars. The right hand's inner voices are folded into chords and ties; the left
// hand keeps its two voices. Mordents and prall trills are marked as written; the edition's upper prall and
// prall-mordent signs are shown as trills. The reference plays every ornament as its plain main note.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Applicatio
C:Johann Sebastian Bach
M:4/4
L:1/16
K:C
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] !mordent!C2D2 E2F2 !mordent!G2A2 B2G2 | !mordent!c2d2 e2!trill!f2 g4 G4 | !mordent![c-e-]4 [ceG]4 !mordent![B-d-]4 [BdG]4 | ^F2-[F-A-]2 [F-A-d]2[FAc]2 [FAc]2!mordent![G-B-]2 [GBD]4 |
[V:2] [C,E,]8 [B,,D,]8 | [A,,C,]8 [G,,B,,]8 | C,2D,2 !mordent!E,2F,2 G,2A,2 B,2C2 | !mordent!D4 D,4 !mordent!G,8 |
[V:3] x16 | x16 | x16 | x8 z4 G,,4 |
[V:1] g2f2 e2d2 !pralltriller!c2B2 A2a2 | !trill!a6^g2 a4- [a-A]2!trill![aB]2 | [Ec]2[_Bc]2 [Ac]2[Gc]2 [Ac]2[Gc]2 [Fc]2[Ec]2 | !trill![Dc]6[F-B]2 [Fc-]2!pralltriller![Ec-][Dc-] [Ec]4 |]
[V:2] [G,B,]8 [A,C]8 | [D-B,]8 [D]2!pralltriller!CB, C2D2 | A,2G,2 F,2E,2 F,2G,2 !mordent!A,2G,2 | F,2D,2 !mordent!G,2G,,2 !mordent!C,8 |]
[V:3] x16 | z4 E,4 A,8 | x16 | x8 z4 C,,4 |]`;

export default {
  summary: "Bach's Applicatio in C major, BWV 994, the first piece in the keyboard book he wrote for his son Wilhelm Friedemann, all 8 bars, in 4/4. Applicatio means fingering: the manuscript carries Bach's own finger numbers, which this edition does not print. Two sections: A (bars 1–4), a rising C major scale in each hand that closes on G, and B (5–8), a falling answer that comes home to C. The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in bars 1–2, in wait mode, without the ornaments. It is a C major scale in eighths: bar 1 climbs from middle C to B and turns back to G, and bar 2 climbs on from the C above to G. Pass the thumb under so there is no gap.",
    "Left hand alone. Bars 1, 2 and 5 are held two-note chords, two to a bar; bar 3 is the scale from C up to C in eighths. In bars 4, 6 and 8 a second voice enters under a held note: keep the upper note down while the lower one sounds.",
    "Right hand alone in bars 3–4 and 7–8, where it holds one note while another moves. In bar 7 the top C repeats eight times over a moving lower voice (E, B flat, A, G, A, G, F, E); let the C stay light.",
    "Once the notes are even, add the mordents: the main note, the note below and the main note again, quickly on the beat. Then play-along with the click at 50, nudging up toward 80.",
  ],
  watch: [
    "F sharp in bar 4, G sharp in bar 6 and B flat in bar 7 are the only accidentals. The F sharp lasts the bar, so the F struck again on beat 3 is F sharp too.",
    "Almost every bar carries an ornament. The grading counts only the main note, so learn the bars plain first and add the ornaments one at a time.",
  ],
  source: { label: "Mutopia Project — Bach, Applicatio, BWV 994 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=66" },
  score: {
    bpm: 50, target: 80,
    sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    abc: ABC,
  },
};
