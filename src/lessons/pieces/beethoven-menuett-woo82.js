// Beethoven, Menuett in E flat, WoO 82, from the Mutopia edition of the Breitkopf & Härtel print (public domain).
// The quarter-note pickup is padded into a full first bar, so bar numbers here run one ahead of the printed ones.
// Every repeat is played once, and the da capo (Menuett again after the Trio) is written out as bars 63–96.
// The right hand's two voices are folded into one, with ties for held notes; voice 3 carries the left hand's
// held B flats in bars 18–25 and 79–86. Key changes and the left hand's clef are restated at the start of each line
// (voice 3 has no notes in the Trio, so it keeps the Menuett's key).
// Bar 9's six-note group is the edition's sextuplet. In bars 25–26 and 86–87 an upper line steps down onto the B flat
// that a lower voice of the same hand holds; the B flat stays held, as the edition's MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuett in E flat, WoO 82
C:Ludwig van Beethoven
M:3/4
L:1/8
K:Eb
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z4 B,2 | [B,-GB]2[B,-FA]2[B,EG]2 | [B,EG]4 [B,-E-A][B,EG] | [C-E-G][CEF] [CEF]2[CEF]2 |
[V:2] z6 | [E,,E,]6 | [E,,E,]2[F,,F,]2[G,,G,]2 | [A,,A,]2[A,,A,]2[A,,A,]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [CEF]2 z4 | [FA]2[EG]2[DF]2 | [B,-B-D]2[B,BE]2[B,FA]2 | [B,-E-A][B,EG] [B,EG]2[B,EG]2 |
[V:2] [A,,A,]2 z4 | [B,,B,]6 | [B,,,B,,]2[C,,C,]2[D,,D,]2 | [E,,E,]2[E,,E,]2[E,,E,]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [B,EG]2 z2 (6:4:6z/B,/C/D/E/F/ | [EG]2[FA]2[GB]2 | [CF=Ac]4 [DFBd]2 | [EF=Ae]2[EF=Ae]2[DFBd]2 |
[V:2] [E,,E,]2 z4 | [E,,E,]6- | [E,,E,]2[E,,E,]2[D,,D,]2 | [C,,C,]2[F,,F,]2[B,,,B,,]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [GBeg]2 z4 | [G-g-]2[Gg=A]2[B-Ff]2 | [BE-e-]2[=AEe]2[DBd]2 | {d}[EGc]2[DFB]2[CEF=A]2 |
[V:2] [E,,E,]2 z4 | [E,E]4[D,D]2 | [C,C]4[B,,B,]2 | E,2F,2F,,2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [DFB]2 z2 B,2 | B2-[B-B,]2[B-C]2 | [BA,-]2[A-A,]2[A-B,]2 | [AG,-]2[G-G,]2[G=A,-][E=A,] |
[V:2] [B,,B,]2 z4 | z4 E,2 | C,4D,2 | E,4C,2 |
[V:3] x6 | B,,6 | B,,6 | B,,6 |
[V:1] EDCB,BB | b2-b-[b-B][b-c-]2 | [b-c][bA-][a-A-]2[a-A][a-B-] | [a-B][aG-][g-G]2[g=A-][e=A] | [B-e][B-d][B-c][B] z2 |
[V:2] B,4 z2 | [K:clef=treble] zB,D3E | C3CD2 | E3EC2 | D4 [K:clef=bass] GE |
[V:3] B,,4 z2 | [K:clef=treble] zB,4-B,- | B,6 | B,6 | B,4 [K:clef=bass] =A,2 |
[V:1] z6 | z4 B,2 | [B,-GB]2[B,-FA]2[B,EG]2 | [B,EG]4 [B,-E-A][B,EG] |
[V:2] [B,-E][B,-D][B,-C][B,]=A,B, | =A,B,CB,_A,F, | E,6 | [E,,E,]2[F,,F,]2[G,,G,]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [C-E-G][CEF] [CEF]2[CEF]2 | [CEF]2 z4 | [FA]2[EG]2[DF]2 |
[V:2] [A,,A,]2[A,,A,]2[A,,A,]2 | [A,,A,]2 z4 | [B,,B,]6 |
[V:3] x6 | x6 | x6 |
[V:1] [B,B]4[A,B,]2 | [G,E]2[G,B,E]2[G,B,E]2 | [G,B,E]2 z2EG |
[V:2] [B,,,B,,]2[C,,C,]2[D,,D,]2 | [E,,E,]2[E,,E,]2[E,,E,]2 | [E,,E,]2 z4 |
[V:3] x6 | x6 | x6 |
[V:1] [K:Ab clef=treble] Az z2Ac | ez z2eg | az z2ac' | e'=d'f'e'_d'b |
[V:2] [K:Ab clef=bass] zA,,A,CEz | zE,B,DEz | zA,CEAz | [G,B,DE]6 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] a2a2ab | agfe z2 | zCEAez | zGBed'z |
[V:2] [A,CE]2[A,CE]2[F,A,B,=D]2 | [E,G,B,E]4E,G, | A,z z2 [K:clef=treble] A,C | Ez z2EG |
[V:3] x6 | x6 | x6 | x6 |
[V:1] zceac'z | e'=d'f'e'_d'b | a2a2bc' | a2 z2[ee']2 |
[V:2] [K:clef=treble] Az z2Ac | [EGd]6 | [FAc]2[DFAB]2[EGB]2 | [A,A]2 z2 [K:clef=bass] [E,E]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [_f_f']3[ee'][_d_d'][_c_c'] | [Bb]4[=c=c'][dd'] | [ee']3[dd'][cc'][Bb] | [Aa][Gg][Ff][Ee][=D=d][B,B] |
[V:2] [_F,_F]3[E,E][_D,_D][_C,_C] | [B,,B,]4[=C,=C][D,D] | [E,E]3[D,D][C,C][B,,B,] | [A,,A,][G,,G,][F,,F,][E,,E,][=D,,=D,][B,,,B,,] |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [Ee]2 z4 | z2B,=DE2 | z2B,=DE2 | z4EG |
[V:2] [E,,E,]2 z2B,,=D, | E,2 z2B,,=D, | E,2 z2B,,=D, | E,2 z4 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] Az z2Ac | ez z2eg | az z2ac' | e'=d'f'e'd'e' |
[V:2] zA,,A,CEz | zE,B,_DEz | zA,CEAz | [G,B,DE]6 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] =d'e'f'e'_d'c' | b2b2bc' | a2 z2B,2 |
[V:2] [A,CE]6 | [E,G,DE]2[E,G,DE]2[E,G,DE]2 | [A,CE]2 z4 |
[V:3] x6 | x6 | x6 |
[V:1] [K:Eb clef=treble] [B,-GB]2[B,-FA]2[B,EG]2 | [B,EG]4 [B,-E-A][B,EG] | [C-E-G][CEF] [CEF]2[CEF]2 | [CEF]2 z4 |
[V:2] [K:Eb clef=bass] [E,,E,]6 | [E,,E,]2[F,,F,]2[G,,G,]2 | [A,,A,]2[A,,A,]2[A,,A,]2 | [A,,A,]2 z4 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [FA]2[EG]2[DF]2 | [B,-B-D]2[B,BE]2[B,FA]2 | [B,-E-A][B,EG] [B,EG]2[B,EG]2 | [B,EG]2 z2 (6:4:6z/B,/C/D/E/F/ |
[V:2] [B,,B,]6 | [B,,,B,,]2[C,,C,]2[D,,D,]2 | [E,,E,]2[E,,E,]2[E,,E,]2 | [E,,E,]2 z4 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [EG]2[FA]2[GB]2 | [CF=Ac]4 [DFBd]2 | [EF=Ae]2[EF=Ae]2[DFBd]2 | [GBeg]2 z4 |
[V:2] [E,,E,]6- | [E,,E,]2[E,,E,]2[D,,D,]2 | [C,,C,]2[F,,F,]2[B,,,B,,]2 | [E,,E,]2 z4 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [G-g-]2[Gg=A]2[B-Ff]2 | [BE-e-]2[=AEe]2[DBd]2 | {d}[EGc]2[DFB]2[CEF=A]2 | [DFB]2 z2 B,2 |
[V:2] [E,E]4[D,D]2 | [C,C]4[B,,B,]2 | E,2F,2F,,2 | [B,,B,]2 z4 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] B2-[B-B,]2[B-C]2 | [BA,-]2[A-A,]2[A-B,]2 | [AG,-]2[G-G,]2[G=A,-][E=A,] |
[V:2] z4 E,2 | C,4D,2 | E,4C,2 |
[V:3] B,,6 | B,,6 | B,,6 |
[V:1] EDCB,BB | b2-b-[b-B][b-c-]2 | [b-c][bA-][a-A-]2[a-A][a-B-] | [a-B][aG-][g-G]2[g=A-][e=A] | [B-e][B-d][B-c][B] z2 |
[V:2] B,4 z2 | [K:clef=treble] zB,D3E | C3CD2 | E3EC2 | D4 [K:clef=bass] GE |
[V:3] B,,4 z2 | [K:clef=treble] zB,4-B,- | B,6 | B,6 | B,4 [K:clef=bass] =A,2 |
[V:1] z6 | z4 B,2 | [B,-GB]2[B,-FA]2[B,EG]2 | [B,EG]4 [B,-E-A][B,EG] |
[V:2] [B,-E][B,-D][B,-C][B,]=A,B, | =A,B,CB,_A,F, | E,6 | [E,,E,]2[F,,F,]2[G,,G,]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [C-E-G][CEF] [CEF]2[CEF]2 | [CEF]2 z4 | [FA]2[EG]2[DF]2 | [B,B]4[A,B,]2 |
[V:2] [A,,A,]2[A,,A,]2[A,,A,]2 | [A,,A,]2 z4 | [B,,B,]6 | [B,,,B,,]2[C,,C,]2[D,,D,]2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] [G,E]2[G,B,E]2[G,B,E]2 | [G,B,E]2 z4 |]
[V:2] [E,,E,]2[E,,E,]2[E,,E,]2 | [E,,E,]2 z4 |]
[V:3] x6 | x6 |]`;

export default {
  summary: "Beethoven's Menuett in E flat, WoO 82, a minuet with a trio, written out here in 96 bars of 3/4. The Menuett is in E flat major and moves mostly in chords and octaves; the Trio is in A flat major, with broken chords shared between the hands and a passage in octaves. Six sections: Menuett A (bars 1–17), Menuett B (18–35), Trio A (36–47), Trio B (48–62), then the Menuett again, A (63–78) and B (79–96). The edition repeats each half and goes back to the Menuett after the Trio (da capo); here each half is played once and the da capo is written out. Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Right hand alone in Menuett A, in wait mode. Most beats are chords of two to four notes. In bar 2 the B flat below middle C is held for the whole bar under three chords, and in bars 3, 4 and 8 the lower notes hold while the top note steps down; keep them down. Bar 9 ends with five quick notes, B flat up to F, after a short rest, all inside the last beat.",
    "Left hand alone. In the Menuett it plays mostly octaves. In bars 18–20 it holds a low B flat through each bar under a few upper notes, and in bars 22–25 it moves to the treble clef and holds the B flat below middle C under a line of its own.",
    "The Trio, hands separately, then together. In bars 35–39 the right hand climbs in broken chords, two eighths leading into each bar, up to a high E flat on ledger lines above the staff, while the left hand fills its rests with broken chords. In bars 42–44 the hands swap, with the left hand in the treble clef. Bars 48–51 are octaves in both hands, and in bars 52–55 the hands trade a B flat–D–E flat figure.",
    "Play-along with the click at 66. Each clean pass nudges the tempo up toward 112.",
  ],
  watch: [
    "The Menuett has A natural in bars 11–12, 14–16, 20 and 24–27. The Trio adds D natural in bars 39–40, 45, 51–54 and 59–60, with D flat back in bars 39, 45 and 60, and bar 48 has F flat and C flat in both hands.",
    "Bar 16 opens with a small grace note D before the chord; play it quickly, as an ornament, and the chord is graded. In bar 25 the right hand steps down E flat–D–C onto the B flat it is already holding, and the left hand does the same in bar 26: keep the B flat down rather than playing it again.",
    "Bars 63–96 are the da capo: the Menuett once more, with the key back in E flat, ending at bar 96. The Trio is not played again.",
  ],
  source: { label: "Mutopia Project — Beethoven, Menuett in E flat, WoO 82 (Breitkopf & Härtel)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=904" },
  score: {
    bpm: 66, target: 112,
    sections: [{ name: "Menuett A", from: 1, to: 17 }, { name: "Menuett B", from: 18, to: 35 }, { name: "Trio A", from: 36, to: 47 }, { name: "Trio B", from: 48, to: 62 }, { name: "Menuett A again", from: 63, to: 78 }, { name: "Menuett B again", from: 79, to: 96 }],
    abc: ABC,
  },
};
