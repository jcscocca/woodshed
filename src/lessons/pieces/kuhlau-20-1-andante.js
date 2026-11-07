// Kuhlau, Sonatina in C, Op. 20 No. 1, II. Andante, from the Mutopia edition of the B. Schott's Söhnen print
// (public domain), 17 bars. The edition's 6/8 is written as 3/4 with the same eighths. The pickup is padded into a
// full first bar, so bar numbers run one ahead of the printed ones. The second-half repeat is not written out, as
// in the Mutopia MIDI. Bar 8's left hand stays in the bass clef (the edition goes to treble), since the key has a flat.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonatina in C, Op. 20 No. 1: II. Andante
C:Friedrich Kuhlau
M:3/4
L:1/16
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z6 z4F3/2A/2 | c2c2c2 c2f2A2 | c3=Bdc _B4_b3/2g/2 | e4g3/2e/2 c4d3/2B/2 |
[V:2] z12 | z2[F,A,C]2[F,A,C]2 [F,A,C]2[F,A,C]2[F,A,C]2 | [E,G,C]6- [E,G,C]4z2 | [G,B,C]2[G,B,C]2z2 [G,B,C]2[G,B,C]2z2 |
[V:1] G4^G2 A4z2 | z4[FA]2- [FA]2[EG]2[^FA]2 | [Gc-]2[Dc]2[EB]2 [FA]4a3/2g/2 | f7/2e/2d3/2c/2 =B7/2a/2g3/2=B/2 |
[V:2] z2[E,B,C]2[E,B,C]2 [F,A,C]4F,,3/2A,,/2 | C,2C,2C,2 C,2B,,2A,,2 | G,,4C,2 F,,4z2 | [FA]2[FA]2z2 [G,F]2[G,F]2z2 |
[V:1] c2[Ec]2[Ec]2 [Ec]4[CE]3/2[DF]/2 | [EG]4[EA]3/2[FA]/2 [GB]4[GB]3/2[Ac]/2 | [Bd]4[GB]2 [EG]4[Be]2 | [_Af]2[_Af]2[_Af]2 [F=B]2[F=B]2[F=B]2 |
[V:2] [CE]2[C,C]2[C,C]2 [C,C]4z2 | z2[C,C]4 z2[C,C]4 | z2[C,C]2[C,C]2 [C,C]6 | [_D,_D]2[_D,_D]2[_D,_D]2 [_D,_D]2[_D,_D]2[_D,_D]2 |
[V:1] [Ec]2c3/2=B/2c3/2=B/2 c3/2=B/2c3/2=B/2c3/2=B/2 | c2c2c2 c2f2A2 | c3=Bdc _B4A2 | G/2^F/2A/2G/2B/2A/2c/2B/2d/2^c/2e/2d/2 =F4[EA]3/2G/2 |
[V:2] [C,C]2[CEG]2[CEG]2 [CEG]4z2 | z2[F,A,C]2[F,A,C]2 [F,A,C]2[F,A,C]2[F,A,C]2 | [E,G,C]6- [E,G,C]4[F,C]2 | [B,D]6 z2[C,A,]2[C,B,]2 |
[V:1] F2[A,F]2[A,F]2 [A,F]4 z2 |]
[V:2] [F,A,]2[F,,F,]2[F,,F,]2 [F,,F,]4 z2 |]`;

export default {
  summary: "The second movement (Andante) of Kuhlau's Sonatina in C, Op. 20 No. 1, all 17 bars, in F major. The original is in 6/8; here it is written in 3/4 with the same eighth notes, so each bar is two groups of three eighths and the click counts three quarter-note beats. Three sections: A (bars 1–9), B (10–13), which moves through C major to an A flat–D flat bar, and A′ (14–17), the opening tune again. Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones; the pickup to B is at the end of bar 9. The original repeats bars 9–17; here you play them once.",
  steps: [
    "Right hand alone in A, in wait mode. The tune leans on a dotted figure, a dotted sixteenth and a thirty-second that lead into the next beat: the pickup in bar 1, and the ends of bars 3 and 4. Keep the short note quick and light, and join it to the note after it.",
    "Left hand alone. Mostly it repeats chords in eighths, F–A–C in bar 2 and C–E–G held across bar 3. In bar 8 it plays F and A high above the bass staff, on ledger lines; the printed edition switches to the treble clef there.",
    "Bar 16 has a run of twelve thirty-second notes, G up to D, in the space of three eighths, over a held B flat–D in the left hand. Practise it alone in groups of four, then fit it to the held chord.",
    "Switch to play-along with the click at 40. Each clean pass nudges the tempo up toward 66.",
  ],
  watch: [
    "B flat is in the key signature, but B natural is written in bars 3, 8, 12, 13 and 15. Bar 12 adds A flat in the right hand and D flat octaves in the left, and the run in bar 16 has F sharp and C sharp.",
    "Bar 7 is two lines in the right hand: the top C is held for two eighths while G and then D sound under it, then B flat and E close the group. Keep the C down; don't strike it again.",
  ],
  source: { label: "Mutopia Project — Kuhlau, Sonatina in C, Op. 20 No. 1, II. Andante (B. Schott's Söhnen)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=233" },
  score: {
    bpm: 40, target: 66,
    sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 13 }, { name: "A′", from: 14, to: 17 }],
    abc: ABC,
  },
};
