// Beethoven, Für Elise (Bagatelle in A minor, WoO 59), from the Mutopia edition of the Breitkopf & Härtel 1888
// print (public domain). The edition is in 3/8; here each pair of its bars is one 3/4 bar, and the eighth-note
// pickup is padded with rests into bar 1, so the bar numbers here count 3/4 bars, not the printed ones. The two
// repeated strains at the start are played once, going straight to the second endings. The left hand's clef
// changes are restated at the start of each line.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Für Elise
C:Ludwig van Beethoven
M:3/4
L:1/16
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 z2e^d | e^deB=dc A2zCEA | B2zE^GB c2zEe^d | e^deB=dc A2zCEA |
[V:2] z8 z2z2 | z6 A,,E,A,zz2 | E,,E,^G,zz2 A,,E,A,zz2 | z6 A,,E,A,zz2 |
[V:1] B2zEcB A2zBcd | e3Gfe d3Fed | c3Edc B2zEez | zee'zz^d e2zded |
[V:2] E,,E,^G,zz2 A,,E,A,zz2 | C,G,Czz2 G,,G,B,zz2 | A,,E,A,zz2 E,,E,Ezz [K:clef=treble] E | ezz^dez zdezz2 |
[V:1] e^deB=dc A2zCEA | B2zE^GB c2zEe^d | e^deB=dc A2zCEA | B2zEcB A2z[Ec][Fc][EGc] |
[V:2] [K:clef=treble] z6 [K:clef=bass] A,,E,A,zz2 | E,,E,^G,zz2 A,,E,A,zz2 | z6 A,,E,A,zz2 | E,,E,^G,zz2 A,,E,A,[_B,C][A,C][=G,B,C] |
[V:1] {FA}c4f3/2e/2 e2d2_b3/2a/2 | agfedc _B2A2{B/2}A/2G/2A/2B/2 | c4d^d e3efA | c4d3/2B/2 c/2g/2G/2g/2A/2g/2B/2g/2c/2g/2d/2g/2 |
[V:2] F,A,CA,CA, F,_B,DB,DB, | F,E[F,G,_B,]E[F,G,B,]E F,A,CA,CA, | F,A,CA,CA, E,A,CA,[D,D]F, | G,EG,EG,F [K:clef=treble] [CE]2z[FG][EG][DFG] |
[V:1] e/2g/2c'/2b/2a/2g/2f/2e/2d/2g/2f/2d/2 c/2g/2G/2g/2A/2g/2B/2g/2c/2g/2d/2g/2 | e/2g/2c'/2b/2a/2g/2f/2e/2d/2g/2f/2d/2 e/2f/2e/2^d/2e/2B/2e/2d/2e/2B/2e/2d/2 | e3Be^d e3Bed | e^deded edeB=dc |
[V:2] [K:clef=treble] [CEG]2 [K:clef=bass] [F,A,]2[G,B,]2 [K:clef=treble] C2z[FG][EG][DFG] | [CEG]2 [K:clef=bass] [F,A,]2[G,B,]2 [^G,B,]2z2z2 | z6 z6 | z6 z6 |
[V:1] A2zCEA B2zE^GB | c2zEe^d edeB=dc | A2zCEA B2zEcB | A2zBcd e3Gfe |
[V:2] A,,E,A,zz2 E,,E,^G,zz2 | A,,E,A,zz2 z6 | A,,E,A,zz2 E,,E,^G,zz2 | A,,E,A,zz2 C,G,Czz2 |
[V:1] d3Fed c3Edc | B2zEez zee'zz^d | ezz^ded edeB=dc | A2zCEA B2zE^GB |
[V:2] G,,G,B,zz2 A,,E,A,zz2 | E,,E,Ezz [K:clef=treble] E ezz^dez | z^dezz2 z6 | [K:clef=bass] A,,E,A,zz2 E,,E,^G,zz2 |
[V:1] c2zEe^d edeB=dc | A2zCEA B2zEcB | A2z2z2 [EG_B^c]6 | [FAd]4[^ce][df] [^Gdf]4[Gdf]2 |
[V:2] A,,E,A,zz2 z6 | A,,E,A,zz2 E,,E,^G,zz2 | A,,A,,A,,A,,A,,A,, A,,A,,A,,A,,A,,A,, | A,,A,,A,,A,,A,,A,, A,,A,,A,,A,,A,,A,, |
[V:1] [A=ce]6 [Fd]4[Ec][DB] | [C^FA]4[CA]2 [CA]2[Ec]2[DB]2 | [CA]6 [EG_B^c]6 | [FAd]4[^ce][df] [df]4[df]2 |
[V:2] A,,A,,A,,A,,A,,A,, [D,,A,,][D,,A,,][D,,A,,][D,,A,,][D,,A,,][D,,A,,] | [^D,,A,,][D,,A,,][D,,A,,][D,,A,,][D,,A,,][D,,A,,] [E,,A,,][E,,A,,][E,,A,,][E,,A,,][E,,^G,,][E,,G,,] | [A,,,A,,]A,,A,,A,,A,,A,, A,,A,,A,,A,,A,,A,, | A,,A,,A,,A,,A,,A,, A,,A,,A,,A,,A,,A,, |
[V:1] [df]6 [G_e]4[Fd][_Ec] | [DF_B]4[DFA]2 [DF^G]4[DFG]2 | [C=EA]4z2 [EB]2z2z2 | (3A,CE(3Ace(3dcB (3Ace(3ac'e'(3d'c'b |
[V:2] _B,,B,,B,,B,,B,,B,, B,,B,,B,,B,,B,,B,, | _B,,B,,B,,B,,B,,B,, =B,,B,,B,,B,,B,,B,, | C,4z2 [E,^G,]2z2z2 | A,,,2z2[A,CE]2 [A,CE]2z2[A,CE]2 |
[V:1] (3ac'e'(3a'c''e''(3d''c''b' (3_b'a'^g'(3=g'^f'=f'(3e'^d'=d' | (3^c'=c'b(3_ba^g(3=g^f=f e^deB=dc | A2zCEA B2zE^GB | c2zEe^d edeB=dc |
[V:2] [A,CE]2z2[A,CE]2 [A,CE]2z2z2 | z6 z6 | A,,E,A,zz2 E,,E,^G,zz2 | A,,E,A,zz2 z6 |
[V:1] A2zCEA B2zEcB | A2zBcd e3Gfe | d3Fed c3Edc | B2zEez zee'zz^d |
[V:2] A,,E,A,zz2 E,,E,^G,zz2 | A,,E,A,zz2 C,G,Czz2 | G,,G,B,zz2 A,,E,A,zz2 | E,,E,Ezz [K:clef=treble] E ezz^dez |
[V:1] ezz^ded edeB=dc | A2zCEA B2zE^GB | c2zEe^d edeB=dc | A2zCEA B2zEcB |
[V:2] [K:clef=treble] z^dezz2 z6 | [K:clef=bass] A,,E,A,zz2 E,,E,^G,zz2 | A,,E,A,zz2 z6 | A,,E,A,zz2 E,,E,^G,zz2 |
[V:1] A2z2z8 |]
[V:2] [A,,,A,,]2z2z8 |]`;

export default {
  summary: "Beethoven's Für Elise (Bagatelle in A minor, WoO 59), the complete piece, in A minor. The edition is in 3/8; here each pair of its bars makes one 3/4 bar, 53 in all, and bar 1 holds the two-sixteenth pickup after five eighths of rest. It is a rondo in five sections: A (bars 1–12), B (13–20, starting in F major), A again (21–30), C (31–42, chords over a repeated low A, then a run in triplets) and A last time (43–53). The edition repeats bars 1–5 and 6–12; here you play each once and go straight to the second ending. The app's course has a separate lesson on the opening alone.",
  steps: [
    "Left hand alone in A, in wait mode. Each broken chord takes half a bar: a low A or E (C and G in bar 6), then two notes above it (mostly A, E, A or E, E, G sharp), then rests while the right hand answers. Move the hand to each low note rather than stretching. At the end of bar 7 it moves to the treble clef and trades E's and D sharps with the right hand through bar 8, back in the bass clef from the middle of bar 9.",
    "Right hand alone in A, then in B. The tune swings between E and D sharp, then falls E, B, D, C to A. In B, take the dotted sixteenth and thirty-second pairs of bars 13 and 16 slowly in wait mode, then the thirty-second-note runs in bars 16–18, most of which keep returning to a G.",
    "C, bars 31–42, hands separately. In bars 31–36 the left hand repeats a low A in sixteenths, with a lower note added in bars 33–35, then B flat and B in bars 37–38; keep it even and quiet under the right hand's chords. In bars 40–42 the right hand plays an A minor arpeggio in triplet sixteenths, from the A below middle C up more than three octaves, then comes down by half steps; learn it three notes at a time.",
    "Play-along with the click at 44. Each clean pass nudges the tempo up toward 72.",
  ],
  watch: [
    "Each 3/4 bar here is two of the edition's 3/8 bars, so feel two pulses a bar, on beat 1 and halfway through beat 2, where the printed bar lines fall. Bar 1 holds only the pickup, E and D sharp, at its end.",
    "In the A tune, E, D sharp, E, B is followed by D natural, then C. In C the chords bring C sharp in bars 31–32 and 35–36 (with B flat in bars 31 and 35), F sharp in bar 34 and E flat in bar 37.",
    "The edition pedals most of the left-hand broken chords in the A sections, down with the low note and up just before the next half bar, and holds the pedal through the run in bars 40–42; pedalling is not graded. The grace notes before the C in bar 13 and the B flat before bar 14's thirty-seconds are shown but not graded.",
  ],
  source: { label: "Mutopia Project — Beethoven, Für Elise, WoO 59 (Breitkopf & Härtel, 1888)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931" },
  score: {
    bpm: 44, target: 72,
    sections: [{ name: "A", from: 1, to: 12 }, { name: "B", from: 13, to: 20 }, { name: "A again", from: 21, to: 30 }, { name: "C", from: 31, to: 42 }, { name: "A last time", from: 43, to: 53 }],
    abc: ABC,
  },
};
