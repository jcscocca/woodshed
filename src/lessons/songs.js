// Public-domain songs as lead sheets: the melody as printed in the source named in each entry,
// the left hand generated from the chords. docs/piano-curriculum-evidence.md lists what was changed.
export default {
  "song-i-got-rhythm": {
    summary: "The refrain of Gershwin's \"I Got Rhythm\" (1930), public domain, as a lead sheet in B flat: the melody in the right hand over voice-led chords in the left. AABA with a two-bar tag: A (1–8), A (9–16), B (17–24), A' (25–34).",
    steps: [
      "Right hand alone, slowly: every A phrase starts after a quarter rest and ties the next note across the beat, so count \"rest, one-and\" before each tie.",
      "Left hand alone: two chords in most bars, changing on beat 3, and the Gm7/C to Edim pair in bars 3, 11 and 27.",
      "Section B (17–24) climbs through D7, G7, C7 and F7; the natural E in bar 18 and B natural in bar 32 are the only accidentals in the melody.",
      "Hands together in wait mode, then with the click, holding the tied notes through the chord changes.",
    ],
    watch: ["The tied notes land between beats: do not replay the second half of each tie."],
    source: { label: "Original sheet music, New World Music Corp., 1930 (Girl Crazy), Internet Archive scan", url: "https://archive.org/details/i-got-rhythm-1930-sheet-music" },
    chart: {
      key: "Bb", meter: "4/4", pattern: "voiceled", bpm: 60, target: 120,
      chords: "Bb Gm | Cm7 F7 | Gm7/C Edim | Cm7 F7 | Bb Gm | Cm7 Ebm6 | Bb F7 | Bb F7 | Bb Gm | Cm7 F7 | Gm7/C Edim | Cm7 F7 | Bb Gm | Cm7 Ebm6 | Bb F7 | Bb | D7 | Ddim D7 | G Daug | Dm G7 | C7 | Cdim C7 | C7/Gb | F7 | Bb Gm | Cm7 F7 | Gm7/C Edim | Cm7 F7 | Bb Gm | Cm7 Ebm6 | Bb Fm | G7 | C7 F7 | Bb",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A'", from: 25, to: 34 }],
      melody: `z2 F2-F G3 | B3 c-c4 | z2 c2-c B3 | G3 F-F4 |
z2 F2-F G3 | B3 c-c e2 c | d2 d2 c d c2 | B6 z2 |
z2 F2-F G3 | B3 c-c4 | z2 c2-c B3 | G3 F-F4 |
z2 F2-F G3 | B3 c-c e2 c | d2 d2 c d c2 | B8 |
z2 d2-d d3 | d3 =e-e4 | z2 d2-d d3 | d3 G-G4 |
z2 c2-c c3 | c3 d-d4 | z2 c2-c c3 | c8 |
z2 F2-F G3 | B3 c-c4 | z2 c2-c B3 | G3 F-F4 |
z2 F2-F G3 | B3 c-c e2 c | d2 d2 c d e2 | f6 e=B |
d2 d2 c d c2 | B6 z2 |]`,
    },
  },
  "song-dream-a-little-dream-of-me": {
    summary: "The refrain of \"Dream a Little Dream of Me\" (registered 1930), public domain, as a lead sheet in G major, 4/4 (printed in cut time), with a bridge that moves to E-flat. AABA form: A (1–8), A (9–16), B (17–24), A (25–32).",
    steps: [
      "Right hand alone, wait mode: bars 4, 6 and the bridge use quarter-note triplets, three even notes across two beats, so count them against the half bar rather than the beat.",
      "Bars 4, 12 and 28 raise G to G-sharp and then drop to F-natural in the same bar; read the accidentals before you play the bar.",
      "Bridge alone (17–24): the flats on E and B belong to E-flat major, so keep them in every bar until bar 24 brings back D and the home key.",
      "Left hand alone through the chord changes, then hands together in wait mode, then play-along with the click.",
    ],
    watch: ["The tie in bars 16 and 32 holds the G into beat 3; don't replay it."],
    source: { label: "Original sheet music, Davis, Coots & Engel, 1931 printing (Internet Archive scan); composition registered unpublished 29 Dec 1930, EU33240", url: "https://archive.org/details/dream-a-little-dream-of-me-sheet-music" },
    chart: {
      key: "G", meter: "4/4", pattern: "ballad", bpm: 60, target: 100,
      chords: "G | Eb7 D7 | G | E7 | Am | Cm | G A7 | D7 | G | Eb7 D7 | G | E7 | Am | Cm | G Cm7 | G Bb7 | Eb Cm | Bb7 | Eb Cm | Bb7 | Eb Cm | Bb7 | Eb | D7 | G | Eb7 D7 | G | E7 | Am | Cm | G Cm7 | G",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A3", from: 25, to: 32 }],
      melody: `G4 FGFE | G4 F4 | G4 FGFE | (3^G2B2G2 =F2E2 |
A4 GAGE | (3A2G2_E2 G4 | DEGA B2e2 | d8 |
G4 FGFE | G4 F4 | G4 FGFE | (3^G2B2G2 =F2E2 |
A4 GAGE | (3A2G2_E2 G4 | DEGA _B2A2 | G4- G2z2 |
_e4 (3c2e2c2 | (3_B2G2B2 C2D2 | _e4 (3c2e2c2 | _B8 |
_e4 (3c2e2c2 | (3_B2G2B2 C2D2 | _e4 _B2c2 | d8 |
G4 FGFE | G4 ^F4 | G4 FGFE | (3^G2B2G2 =F2E2 |
A4 GAGE | (3A2G2_E2 G4 | DEGA _B2A2 | G4- G2z2 |]`,
    },
  },
  "song-embraceable-you": {
    summary: "The refrain of Gershwin's \"Embraceable You\" (1930), public domain, as a lead sheet in G: the melody in the right hand over a ballad left hand. ABAC form: A (1–8), B (9–16), A (17–24), C (25–32).",
    steps: [
      "Right hand alone: most phrases start after a quarter rest, and bars 3, 7, 11 and 15 put a short note on the beat, two eighth rests, then the next note on the off-beat.",
      "Left hand alone: the chromatic chords come early (C#dim in bar 2, Fm6 in bar 4); play each change on beat 3 where the bar has two.",
      "Bar 27 is six repeated eighth-note Gs; keep them even and light.",
      "Hands together in wait mode, then with the click, letting the tied whole notes ring over the moving left hand.",
    ],
    watch: ["Bars 3 and 19 leave a gap after the first eighth note: count the two eighth rests rather than closing the gap."],
    source: { label: "Girl Crazy vocal selection, New World Music Corp., 1930, pages 34–37, Internet Archive scan", url: "https://archive.org/details/embraceable-you-1930-sheet-music" },
    chart: {
      key: "G", meter: "4/4", pattern: "ballad", bpm: 60, target: 96,
      chords: "G | C#dim | D7 C | Fm6 D7 | Am | F7 D7 | G Dsus4 | G | Em Em7 | Em6 F#7 | Bm Bbaug | D E7 | D D#dim | A7 | D D7 | G D7 | G | C#dim | D7 C | Fm6 D7 | Am | F7 D7 | G7 Dsus4 | Bbm6 G7 | C | Am6 B7 | Em Ebaug | G Em6 | G | Cm6 D | G | G",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A2", from: 17, to: 24 }, { name: "C", from: 25, to: 32 }],
      melody: `z2 E2 F2 G2 | z2 E2 F2 G2 | A z z D D2 D2- | D8 |
z2 A2 B2 c2 | z2 A2 B2 c2 | d z z G G2 G2- | G8 |
B2 G2 A2 G2 | B2 G2 A2 G2 | B z z F F2 F2- | F8 |
A2 F2 G2 F2 | G2 A2 B2 ^c2 | d z z D D2 D2- | D8 |
z2 E2 F2 G2 | z2 E2 F2 G2 | A z z D D2 D2- | D8 |
z2 A2 B2 c2 | z2 A2 B2 c2 | d z z G G2 G2- | G8 |
z2 d2 c2 B2 | c2 B2 A2 B2 | z2 G G G G G G | G G B6 |
z2 B2 c2 d2 | _e z z G F4 | G8- | G2 z6 |]`,
    },
  },
  "song-but-not-for-me": {
    summary: "The refrain of Gershwin's \"But Not for Me\" (1930), public domain, as a lead sheet in E flat: the melody in the right hand over a ballad left hand. Bar 1 is the lead-in, then ABAC: A (1–9), B (10–17), A (18–25), C (26–33).",
    steps: [
      "Right hand alone: bar 1 is the lead-in after a quarter rest; the tie from bar 2 into bar 3 holds E flat for an extra eighth before the rest.",
      "Left hand alone: two chords in most bars, changing on beat 3, with the augmented and diminished chords in bars 10–14 and 26–29.",
      "Bars 10, 12, 26 and 28 open on a natural (B or A) a half step below the next note; practise those bars slowly.",
      "Hands together in wait mode, then with the click, holding the whole notes of bars 30–33 for their full length.",
    ],
    watch: ["The natural signs in bars 10, 12, 26 and 28 last only for that bar: the B flat and A flat return in the next bar."],
    source: { label: "Girl Crazy song sheet, New World Music Corp., 1930, Internet Archive scan", url: "https://archive.org/details/but-not-for-me-sheet-music" },
    chart: {
      key: "Eb", meter: "4/4", pattern: "ballad", bpm: 60, target: 84,
      chords: "Bb7 Eb | Eb Bb7 | Bb7 Eb | Eb | Bb7 Eb | F7 | Bb7 | Eb7 | Eb7 | Ebaug Ab | Fm7 | F#dim Eb | Bb7 Eb | Ebaug Fm7 | Fm7 | Fm6 F7 | Bb7 Eb | Eb Bb7 | Bb7 Eb | Eb | Bb7 Eb | F7 | Bb7 | Eb7 | Eb7 Abaug | Ebaug Ab | Fm7 Cm | F#dim Eb | Cm Caug | Fm7 | Bb7 | Eb | Eb",
      sections: [{ name: "A1", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }, { name: "A2", from: 18, to: 25 }, { name: "C", from: 26, to: 33 }],
      melody: `z2 F2 G2 F2 | G4 F2 E2- | E z F2 G2 F2 | G8 |
z2 F2 G2 F2 | G4 F2 E2- | E z F2 G2 F2 | G8 |
z2 G2 A2 B2 | =B4 c2 e2 | z2 F2 G2 A2 | =A4 B2 e2 |
z2 E2 F2 G2 | G4 A2 e2 | z2 e2 c2 A2 | F8 |
z2 F2 G2 F2 | G4 F2 E2- | E z F2 G2 F2 | G8 |
z2 F2 G2 F2 | G4 F2 E2- | E z F2 G2 F2 | G8 |
z2 G2 A2 B2 | =B4 c2 e2 | z2 F2 G2 A2 | =A4 B2 f2 |
z2 e2 c2 A2 | G8 | F8 | E8- |
E6 z2 |]`,
    },
  },
  "song-body-and-soul": {
    summary: "The refrain of \"Body and Soul\" (1930), public domain, in C with a bridge that moves to Db and then E, as a lead sheet in 4/4: the melody in the right hand over a written-out ballad left hand. Four sections: A (1–8), A (9–16), B (17–24), A (25–33), the last bar taken from the second ending.",
    steps: [
      "Right hand alone, bars 1–8: count the dotted-eighth and sixteenth pairs as long-short, and start each phrase after the rest on beat 1.",
      "Bars 7, 15 and 31: beat 4 is a triplet G-A-Eb; play the three notes evenly across the beat.",
      "Bridge alone (17–24): the flats in 17–20 and the sharps in 21–24 change the hand shape; play each four-bar group until the black keys feel planned.",
      "Hands together at a slow tempo, keeping the left hand soft under the long notes.",
    ],
    watch: ["Bar 24 walks down D#, D, C#, A over changing chords; keep it even while the left hand moves each half bar."],
    source: { label: "Original sheet music, Harms, 1930, English edition (IMSLP scan)", url: "https://imslp.org/wiki/Body_and_Soul_(Green,_Johnny)" },
    chart: {
      key: "C", meter: "4/4", pattern: "ballad", bpm: 50, target: 72,
      chords: "Dm | Dm G7 | C Gaug | C Ebdim | Dm | G7 E7 | Am G7 | C | Dm | Dm G7 | C Gaug | C Ebdim | Dm | G7 E7 | Am G7 | C Ab7 | Db Ab7 | Db Gb | Db Ab7 | Db | C#m F#7 | B | E F#7 | B7 A7 | Dm | Dm G7 | C Gaug | C Ebdim | Dm | G7 E7 | Am G7 | C Db | C",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A3", from: 25, to: 33 }],
      melody: `z3/2D/E3/2D/E2D2 | A2A6 | z3/2G/A3/2G/A2G2 | d2c2B2A2 |
z2c2AF2A, | E4D4 | z3/2C/D3/2E/G2(3GA_E | C8 |
z3/2D/E3/2D/E2D2 | A2A6 | z3/2G/A3/2G/A2G2 | d2c2B2A2 |
z2c2AF2A, | E4D4 | z3/2C/D3/2E/G2(3GA_E | C4-C2z2 |
z3/2_D/_E3/2F/_A_A2_A | _d_d2F_A_A2_G | FF2_D_E2C_A- | _A4-_Azz2 |
z3/2^C/^D3/2E/^G^G2^F | ^d^d2^A^c^c2^G | BB2^G^A^A2^F | ^D2=D2^C2=A2 |
z3/2D/E3/2D/E2D2 | A2A6 | z3/2G/A3/2G/A2G2 | d2c2B2A2 |
z2c2AF2A, | E4D4 | z3/2C/D3/2E/G2(3GA_E | C4^C4 |
E4z4 |]`,
    },
  },
  "song-aint-misbehavin": {
    summary: "The refrain of \"Ain't Misbehavin'\" (1929), public domain, in Eb, as a lead sheet in 4/4 (the original is in cut time): the melody in the right hand over a voice-led left hand. AABA form: A (1–8), A (9–16), B (17–24), A (25–32).",
    steps: [
      "Right hand alone, bar 1: every A phrase starts on the off-beat after an eighth rest; count \"1-and\" and come in on \"and\".",
      "Bar 4: the tied G into Gb is a chromatic slide; hold the tie, then lower one key.",
      "Bridge (17–24): the same off-beat figure over changing chords, then E natural in bar 20; play the bridge alone until the natural is automatic.",
      "Hands together, keeping the left hand on the beat while the right hand stays off it.",
    ],
    watch: ["The off-beat entries in bars 1–6: do not let the first note drift onto the beat."],
    source: { label: "Original sheet music, Mills Music, 1929 (IMSLP scan)", url: "https://imslp.org/wiki/Ain%27t_Misbehavin%27_(Waller,_Fats)" },
    chart: {
      key: "Eb", meter: "4/4", pattern: "voiceled", bpm: 60, target: 100,
      chords: "Eb | Bb7 | Eb G7 | Ab Abm | Eb Gb7 | Bb7 | Eb | F7 Bb7 | Eb | Bb7 | Eb G7 | Ab Abm | Eb Gb7 | Bb7 | Eb Ab | Eb7 G7 | Cm | Ab7 | F7 | C7 | Bb7 | Ebaug F7 | Bb7 C7 | F7 Bb7 | Eb | Bb7 | Eb G7 | Ab Abm | Eb Gb7 | Bb7 | Eb | Eb",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A3", from: 25, to: 32 }],
      melody: `zEFEBB3 | zFGFc4 | zBcBee2d | fecG-G_G2F |
zEFEBB3 | zFGFcc2B | G8- | G8 |
zEFEBB3 | zFGFc4 | zBcBee2d | fecG-G_G2F |
zEFEBB3 | zFGFcc2B | E8- | E6z2 |
z2ecec3 | z2ecec3 | z2ecec3 | z2=ecec3 |
z2f2f2f2 | f2e2d2c2 | B4c4 | G4F4 |
zEFEBB3 | zFGFc4 | zBcBee2d | fecG-G_G2F |
zEFEBB3 | zFGFcc2B | e8- | e6z2 |]`,
    },
  },
  "song-singin-in-the-rain": {
    summary: "The chorus of \"Singin' in the Rain\" (1929), public domain, in G, as a lead sheet in 4/4 (the original is in cut time): the melody in the right hand over a block-chord left hand. Four sections: A (1–8), B (9–16), A (17–24), C (25–32).",
    steps: [
      "Right hand alone: most bars hold a long note and then add a dotted-eighth and sixteenth pickup; count four and play the pickup on the last beat.",
      "Bars 9–14 sit over one D7 chord; listen for the E and F# that rub against it.",
      "Left hand alone: G for most of the first half, a G#dim7 in bar 6, then D7 for eight bars.",
      "Hands together, holding the tied notes through the left-hand chords.",
    ],
    watch: ["The ties into the dotted-eighth notes (bars 1, 3, 5): hold the first note through the tie and do not replay it."],
    source: { label: "Original sheet music, Robbins Music, 1929, with ukulele arrangement (IMSLP scan)", url: "https://imslp.org/wiki/Singin%27_in_the_Rain_(Brown,_Nacio_Herb)" },
    chart: {
      key: "G", meter: "4/4", pattern: "block", bpm: 72, target: 112,
      chords: "G | G | G | G | G | G G#dim7 | D7 | D7 | D7 | D7 | D7 | D7 | D7 | D7 | G6 | G6 | G6 | G | G | G | G6 | G G#dim7 | D7 | D7 | D7 | D7 | D7 | D7 | D7 | D7 | G | G",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A2", from: 17, to: 24 }, { name: "C", from: 25, to: 32 }],
      melody: `d4-d3/2B/A3/2G/ | E6D2 | G4-G3/2G/A3/2B/ | d6D3/2E/ |
G4-G3/2A/B2 | d4B2d2 | d4-d3/2B/A2 | E6D2 |
d4-d3/2B/A2 | E6D2 | d4B3A | E6D2 |
d4-d3/2B/E2 | F4-F3/2B/E2 | G4-G3/2E/G2 | E6D3/2E/ |
G4-G3/2A/B2 | d6D3/2E/ | G4-G3/2A/B2 | d6D2 |
G4-G3/2A/B2 | d4B2d2 | d4-d3/2B/A2 | E6D2 |
d4B3A | E6DD | d4-d3/2B/A2 | E6D2 |
dd-d4D2 | FF2B-B2D2 | G8- | G8 |]`,
    },
  },
  "song-blue-skies": {
    summary: "The refrain of Irving Berlin's \"Blue Skies\" (1927), public domain, as a lead sheet in G major, 4/4 (cut time in the source): the melody in the right hand over a ballad left hand. AABA form: A (1–8), A (9–16), B (17–24), A (25–32).",
    steps: [
      "Right hand alone, bars 1–4: the B is tied across bars 1–2 and 3–4; hold it through the barline, then play the A–G–A eighths and quarter on beats 3 and 4.",
      "Bars 5–8: in bar 6 the D–E–G figure starts on the half beat and the G is tied into bar 7; clap the rhythm before playing it.",
      "Bridge, bars 17–24: the E flat in bars 18 and 22 is the only accidental in the tune; play the bridge hands separate until the flat is automatic.",
      "Hands together at 72, then raise toward 120; the left hand steps down E, D sharp, D, C sharp under the melody in bars 1–4.",
    ],
    watch: ["The G at the end of bar 6 is struck on the half beat and held through bars 7–8; do not play it again on the downbeat."],
    source: { label: "Original sheet music, Irving Berlin Inc., 1927, ukulele arr. May Singhi Breen (University of Maine Vocal Popular Sheet Music Collection scan, via Wikimedia Commons)", url: "https://commons.wikimedia.org/wiki/File:Blue_Skies_(1927)_sheet_music.pdf" },
    chart: {
      key: "G", meter: "4/4", pattern: "ballad", bpm: 72, target: 120,
      chords: "Em | Em/D# | Em7/D | Em6/C# | G/D D7 | Gm6 D7 | G | G | Em | Em/D# | Em7/D | Em6/C# | G/D D7 | Gm6 D7 | G | G | G | Cm6 G | Cm6 G | D7 G | G | Cm6 G | Cm6 G | D7 B7 | Em | Em/D# | Em7/D | Em6/C# | G/D D7 | Gm6 D7 | G | G",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A3", from: 25, to: 32 }],
      melody: `E4 B4- | B4 AG A2 | B8- | B4 AG A2 |
B4 D4- | D4 D E2 G- | G8- | G8 |
E4 B4- | B4 AG A2 | B8- | B4 AG A2 |
B4 D4- | D4 D E2 G- | G8- | G8 |
GABc d4 | _ed c2 d4 | cB A2 B4 | AG F2 G4 |
GABc d4 | _ed c2 d4 | cB A2 B4 | AG F2 G4 |
E4 B4- | B4 AG A2 | B8- | B4 AG A2 |
B4 D4- | D4 D E2 G- | G8- | G4 z4 |]`,
    },
  },
  "song-aint-she-sweet": {
    summary: "The refrain of Milton Ager's \"Ain't She Sweet?\" (1927), public domain, as a lead sheet in E flat major, 4/4 (cut time in the source): the melody in the right hand over a block-chord left hand. AABA form: A (1–8), A (9–16), B (17–24), A (25–32).",
    steps: [
      "Right hand alone, bars 1–4: C down to B natural, then B flat in bar 2; the natural sign lasts only to the barline.",
      "Bars 6, 14 and 30: the third and fourth Cs are tied, so the bar sounds as C, C, C (held), B flat, A flat.",
      "Bridge, bars 16–24: the long E flats start on the last half beat of bars 16 and 20 and tie into the next bar; count the eighths out loud.",
      "Hands together slowly; drill the left hand alone on the chromatic chords first (Em6 in bar 1, Abaug in bar 6, Ebaug in bar 19).",
    ],
    watch: ["B natural in bars 1, 3, 9, 11, 25 and 27 returns to B flat at the next barline."],
    source: { label: "Original sheet music, Ager, Yellen & Bornstein Inc., 1927 (University of Maine Vocal Popular Sheet Music Collection scan, Internet Archive copy of the Digital Commons PDF)", url: "https://web.archive.org/web/20240708083707/https://digitalcommons.library.umaine.edu/cgi/viewcontent.cgi?article=7189&context=mmb-vp" },
    chart: {
      key: "Eb", meter: "4/4", pattern: "block", bpm: 76, target: 132,
      chords: "Eb Em6 | Bb7 | Eb Em6 | Bb7 | Eb G7 | Abaug | F7 Bb7 | Eb Bb7 | Eb Em6 | Bb7 | Eb Em6 | Bb7 | Eb G7 | Abaug | F7 Bb7 | Eb Eb7 | Ab7 | Ab7 | Ebaug Eb | Eb7 | Ab7 | Ab7 | Ebaug Eb | Bb7 | Eb Em6 | Bb7 | Eb Em6 | Bb7 | Eb G7 | Abaug | F7 Bb7 | Eb",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B", from: 17, to: 24 }, { name: "A3", from: 25, to: 32 }],
      melody: `c4 =B4 | B4 z c2 B | c2 c2 =B2 B2 | B4 z c2 B |
e2 e2 d2 d2 | c2 c c- c B A2 | G4 F4 | E4 z4 |
c4 =B4 | B4 z c2 B | c2 c2 =B2 B2 | B4 z c2 B |
e2 e2 d2 d2 | c2 c c- c B A2 | G4 F4 | E2 e2 e e2 e- |
e8 | e2 e2 e2 e2 | e4 B4- | B2 e2 e e2 e- |
e8 | e2 e2 e2 e2 | e4 B4- | B6 z2 |
c4 =B4 | B4 z c2 B | c2 c2 =B2 B2 | B4 z c2 B |
e2 e2 d2 d2 | c2 c c- c B A2 | G4 F4 | E6 z2 |]`,
    },
  },
  "song-bye-bye-blackbird": {
    summary: "The 32-bar chorus of \"Bye Bye Blackbird\" (Henderson, 1926), public domain, in G with the verse left out: the melody in the right hand over a written-out ballad left hand. Four sections: A (1–8), B (9–16), C (17–24), A (25–32).",
    steps: [
      "Right hand alone: most bars are four quarter notes or one long held note. Count all four beats through the long held notes in bars 5–8 and 13–16.",
      "Bars 17–20 turn to G7, Dm and E7, and bar 20 holds a G# for a full bar. Play the left hand alone here until the chord changes feel settled.",
      "Bar 28 has G# twice: the sharp on beat 2 carries to the half note.",
      "Hands together, one section at a time, then the whole chorus.",
    ],
    watch: ["The ties in bars 7–8, 15–16 and 31–32 hold the note across the barline. Don't play it again."],
    source: { label: "Original sheet music with ukulele chords, Jerome H. Remick & Co., 1926 (University of Alberta Libraries scan, Internet Archive)", url: "https://archive.org/details/SM001855" },
    chart: {
      key: "G", meter: "4/4", pattern: "ballad", bpm: 72, target: 116,
      chords: "G | C G | Bm D7 | Am7 G | G | C#dim7 | Am7 D7 | D7 | Am | D Am | D7 Bm | D7 | D7 | D7 | G | G | G7 | G7 | Dm | E7 | Am Cm | G A7 | Cm | D7 | G | C G | Bm D7 | Dm E7 | Am | Am D7 | G C | G",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "C", from: 17, to: 24 }, { name: "A2", from: 25, to: 32 }],
      melody: `B2B2B2B2 | c2B2B2z2 | B2A2A2z2 | A2G2G2z2 |
B8 | A8 | G4F4- | F8 |
c2c2c2c2 | d2c2c2z2 | c2B2B2z2 | B2A2A2z2 |
A8 | B8 | A4G4- | G8 |
G2d2d2d2 | d2c2B2A2 | A8 | ^G8 |
E2c2c2c2 | c2B2A2G2 | G8 | F8 |
B2B2B2B2 | c2B2B2z2 | B2A2A2z2 | A2^G2^G4 |
A4c4- | c2z2F4 | G8- | G4-G2z2 |]`,
    },
  },
  "song-sweet-georgia-brown": {
    summary: "The 32-bar chorus of \"Sweet Georgia Brown\" (1925), public domain, in G: the melody in the right hand over a written-out block-chord left hand. Four sections: A (1–8), B (9–16), A (17–24), C (25–32).",
    steps: [
      "Right hand alone, bars 1–2: many notes arrive half a beat early and are tied over the beat. Count in eighths (1 and 2 and) and hold each tie for its full length.",
      "Bars 1–4 use G# and C#, and bars 5–8 use G natural over A7. Play the two four-bar phrases one after the other to hear the change.",
      "Left hand alone: the chords move around the circle in four-bar blocks (E7, A7, D7, G). Name each chord before you play it.",
      "Hands together, slowly. Keep the left hand on the beat while the right hand anticipates it.",
    ],
    watch: ["The tied notes in bars 1–3 sound on the half beat. Don't move them onto the beat."],
    source: { label: "Original sheet music with guitar and ukulele chords, Remick, copyright 1925 (University of Alberta Libraries scan, Internet Archive)", url: "https://archive.org/details/SM000426" },
    chart: {
      key: "G", meter: "4/4", pattern: "block", bpm: 72, target: 132,
      chords: "E7 | E7 | E7 | E7 | A7 | A7 | A7 | A7 | D7 | D7 | D7 | D7 | G | D7 | G | B7 | E7 | E7 | E7 | E7 | A7 | A7 | A7 | A7 B7 | Em | B7 | Em | B7 | G | B7 E7 | A7 D7 | G",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A2", from: 17, to: 24 }, { name: "C", from: 25, to: 32 }],
      melody: `E F2 ^G-^G3 E | B ^G2 ^c-^c3 B | e4 B ^G2 E- | E6 z2 |
E F2 G-G3 E | B G2 ^c-^c3 A | e4 ^c B2 A- | A6 z2 |
D E2 F-F3 D | A F2 B-B3 A | d4 A F2 D- | D2 D E-E D E2 |
B8- | B2 D E-E D E2 | B6 B2 | A6 z2 |
E F2 ^G-^G3 E | B ^G2 ^c-^c3 B | e4 B ^G2 E- | E6 z2 |
E F2 G-G3 E | B G2 ^c-^c3 A | e4 ^c B2 A- | A4 z4 |
B3 B-B2 z2 | A F2 B-B2 B2 | B3 B-B2 z2 | A F2 B-B2 z2 |
D E2 G-G B3 | B ^d2 e-e B3 | A4 d B2 G- | G6-G z |]`,
    },
  },
  "song-tea-for-two": {
    summary: "The 32-bar refrain of \"Tea for Two\" (Youmans, 1924), public domain, in Bb (originally Ab) with the verse left out: the melody in the right hand over a written-out voice-led left hand. Four sections: A (1–8), B (9–16), A (17–24), C (25–32).",
    steps: [
      "Right hand alone, bars 1–6: each beat pair is a dotted quarter and an eighth. Count 1-and-2 and play the eighth on the and of 2.",
      "Bars 9–14 move to D major and switch to a dotted eighth and sixteenth. Watch the B natural and the C#.",
      "Bars 25–28 step down in thirds (G F, Eb D, F Eb, D C) over changing chords. Play the left hand alone here first.",
      "Hands together, section by section, then the whole refrain.",
    ],
    watch: ["Bars 9–14 use a different dotted rhythm (dotted eighth and sixteenth). Keep the short note short."],
    source: { label: "Original sheet music, Harms Inc., copyright 1924, plate 7076-4 (Silent Film Sound & Music Archive scan, Carl Braun Collection)", url: "https://www.sfsma.org/tea-for-two/" },
    chart: {
      key: "Bb", meter: "4/4", pattern: "voiceled", bpm: 66, target: 108,
      chords: "Cm7 F7 | Cm7 F7 | Bb | Bb | Cm7 F7 | Cm7 F7 | Bb | Bb | Em7 A7 | Em7 A7 | D D6 | D D6 | Em7 A7 | Em7 A7 | D | F7 | Cm7 F7 | Cm7 F7 | Bb | Bb | Cm7 F7 | Cm7 F7 | Dm7b5 | G7 | Cm/Eb Dm7b5 | Gaug G7 | Cm | Eb F7 | F7 | F7 | Bb | Bb",
      sections: [{ name: "A1", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A2", from: 17, to: 24 }, { name: "C", from: 25, to: 32 }],
      melody: `B3G A3G | B3G A3F | A3F G3F | A3F G3F |
B3G A3G | B3G A3F | d8- | d2z6 |
d2d3/2=B/2 ^c2c3/2B/2 | d2d3/2=B/2 ^c2c3/2A/2 | ^c2c3/2A/2 =B2B3/2A/2 | ^c2c3/2A/2 =B2B3/2A/2 |
d2d3/2=B/2 ^c2c3/2B/2 | d2d=B ^c2c2 | ^f8 | f4z4 |
B3G A3G | B3G A3F | A3F G3F | A3F G3F |
B3G A3G | B3G A3F | f8- | f4z4 |
g3g f3f | e3e d3d | f3f e3e | d3d c3c |
B3G A3G | B3G A3d | B8- | B4-B z z2 |]`,
    },
  },
  "song-it-had-to-be-you": {
    summary: "The refrain of Isham Jones's \"It Had to Be You\" (1924), public domain, as a lead sheet in G, 4/4 (cut time in the source): the melody in the right hand over a ballad left hand. Bar 1 is the lead-in, then A (1–9), B (10–17), A (18–25), C (26–33).",
    steps: [
      "Right hand alone: bar 1 is the lead-in after a quarter rest. Most phrases end on a note tied over the barline into a whole note (bars 2, 4, 8, 10, 12, 16, 18, 20, 24, 32), so hold it and don't replay it.",
      "Bars 5–7 and 21–23 turn around A with G sharp and G natural; play them slowly until the sharps and naturals are automatic.",
      "Left hand alone: one chord per bar for most of the tune, then two per bar from bar 27, with diminished chords in bars 27, 29, 30 and 32.",
      "Hands together in wait mode, then with the click, counting the tied notes through.",
    ],
    watch: ["In bars 5 and 21 every G is G sharp; in bars 6, 7, 22 and 23 the first G is natural and the second is sharp."],
    source: { label: "Original sheet music, Jerome H. Remick & Co., 1924 (San Francisco Symphony Music Archive scan)", url: "https://www.sfsma.org/wp-content/uploads/2025/02/Nadeau_081_KahnJones_ItHadToBeYou.pdf" },
    chart: {
      key: "G", meter: "4/4", pattern: "ballad", bpm: 60, target: 96,
      chords: "D7 Daug | G | G | E7 | E7 | A7 | A7 | A7 | A7 | D7 | D7 B7 | Em | Em | A7 | A7 | D7 | D7 Daug | G | G | E7 | E7 | A7 | A7 | A7 | Em | Am | F#dim7 D7 | G B7 | Em Bbdim7 | D7 Bbdim7 | D7 | G Bbdim7 | G",
      sections: [{ name: "A1", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }, { name: "A2", from: 18, to: 25 }, { name: "C", from: 26, to: 33 }],
      melody: `z2 D2 E D E F- | F8- | F2 F2 G F G ^G- | ^G8- |
^G2 ^G2 A ^G A B- | B3 =G A ^G A B- | B3 =G A ^G A B- | B8- |
B2 A2 B A B d- | d8- | d2 B2 A B A G- | G8- |
G2 G2 G F G A- | A4 G F G A- | A4 B e B A- | A8- |
A2 D2 E D E F- | F8- | F2 F2 G F G ^G- | ^G8- |
^G2 ^G2 A ^G A B- | B3 =G A ^G A B- | B3 =G A ^G A B- | B8- |
B2 B2 B c d e- | e4 E F G A- | A4 A B c d- | d4 A B A G- |
G2 F2 E D E F- | F4 E D E F- | F4 B d B G- | G8- |
G2 z2 z4 |]`,
    },
  },
  "song-rhapsody-in-blue-andantino": {
    summary: "The opening phrase of the Andantino theme from Gershwin's Rhapsody in Blue (1924), public domain, as a simple lead sheet in F (original key E): the melody in the right hand over a ballad left hand. Two sections: the rising opening (1–2) and the held notes (3–8).",
    steps: [
      "Right hand alone: A, B flat, C, then drop an octave to middle C on beat 4 and hold it into bar 2 before climbing C, D, E, F.",
      "Left hand alone: one chord a bar, F, G7, C augmented, C7, F.",
      "Bar 5's G sharp is the raised fifth of the C augmented chord; bar 6 returns to G natural.",
      "Hands together in wait mode, counting four full beats on every held note.",
    ],
    watch: ["The octave drop from C5 to middle C on beat 4 of bar 1: move the hand early and hold the tie into bar 2."],
    source: { label: "Rhapsody in Blue, piano solo, New World Music Corp. plate S-109 (copyright MCMXXIV), Internet Archive scan", url: "https://archive.org/details/rhapsodyinblue00geor" },
    chart: {
      key: "F", meter: "4/4", pattern: "ballad", bpm: 50, target: 72,
      chords: "F | F | G7 | G7 | Caug | C7 | F | F",
      sections: [{ name: "Rise", from: 1, to: 2 }, { name: "Held notes", from: 3, to: 8 }],
      melody: `A2 B2 c2 C2- | C2 D2 E2 F2 | G8- | G8 |
^G8 | G8 | A8- | A8 |]`,
    },
  },
  "song-st-louis-blues": {
    summary: "The chorus of W. C. Handy's \"St. Louis Blues\" (1914), public domain, as a 12-bar blues lead sheet in G, with the pickup written into bar 1. Three phrases: 1 (1–5), 2 (6–9), 3 (10–13).",
    steps: [
      "Right hand alone: the A-sharp to B figure comes back in almost every bar. Play it as a lean into B, not as two equal notes.",
      "Left hand alone: bar 1 is an intro bar, then the boogie pattern on G, C7 and D7. Bar 5 changes to G7 halfway through.",
      "Bars 10–11 drop low (D, then C tied across the barline). Count the tie and don't replay the C.",
      "Hands together in wait mode, then play-along once the ties into the long Gs are steady.",
    ],
    watch: ["The sharps carry through the bar: every A after an A-sharp in the same bar is also A-sharp, until the natural in bar 6."],
    source: { label: "Sheet music, Handy Bros. Music Co., later printing of the 1914 song with ukulele diagrams (archive.org scan, Carner collection)", url: "https://archive.org/details/carner_40_1963" },
    chart: {
      key: "G", meter: "4/4", pattern: "boogie", bpm: 60, target: 96,
      chords: "G | G | G | G | G G7 | C7 | C7 | G | G | D7 | D7 | G | G",
      sections: [{ name: "Phrase 1", from: 1, to: 5 }, { name: "Phrase 2", from: 6, to: 9 }, { name: "Phrase 3", from: 10, to: 13 }],
      melody: `z6 ^AB | G2 ^AB G2 ^AB | G2 ^AB GAB G- | G8- |
G4 G2 ^AB | =A2 GE G2 A_B | A2 GE G^AB G- | G8- |
G4 G2 ^AB | d2 ^AB DAB C- | C^ABDDAB G- | G8- |
G4 z4 |]`,
    },
  },
  "song-when-the-saints": {
    summary: "\"When the Saints Go Marching In\", traditional, from R. E. Winsett's 1929 hymnal setting, public domain, in A-flat with the pickup written into bar 1. Two sections: Verse (1–5), Refrain (6–9).",
    steps: [
      "Right hand alone: the long E-flat in bars 2–4 is tied into a short note. Hold it, then move on the 'and'.",
      "Left hand alone: bar 1 is an intro bar, then block chords on A-flat, D-flat and E-flat 7.",
      "Bar 6 has an eighth rest before the two E-flats. Count it out loud the first few times.",
      "Hands together in wait mode, then play-along with the click.",
    ],
    watch: ["Bar 5 ends with the refrain's pickup (E-flat, E-flat, C), so the left hand's E-flat 7 sits under it before A-flat returns in bar 6."],
    source: { label: "Soul Inspiring Songs (R. E. Winsett, 1929), no. 183, page scan on hymnary.org", url: "https://hymnary.org/hymn/SIS1929/183" },
    chart: {
      key: "Ab", meter: "4/4", pattern: "block", bpm: 60, target: 100,
      chords: "Ab | Ab | Ab | Ab | Eb7 | Ab | Db | Ab Eb7 | Ab",
      sections: [{ name: "Verse", from: 1, to: 5 }, { name: "Refrain", from: 6, to: 9 }],
      melody: `z6 cd | e4- ecBc | e6 cd | e4- ecAc |
B4- Beec | A3Bc zee | ed- d4 cd | e3c A2B2 |
A6 z2 |]`,
    },
  },
  "song-greensleeves": {
    summary: "The traditional tune \"Greensleeves\" from Chappell's 1859 oldest copy, public domain, as a lead sheet in E minor: the melody in the right hand over a waltz left hand, written in 3/4 (originally 6/8). Two sections: A (1–9, with a one-bar pickup) and B (10–17).",
    steps: [
      "Right hand alone: bar 1 is a pickup bar, five eighth rests then E; count it before playing.",
      "Practise the dotted figure (dotted eighth, sixteenth, eighth) in bars 2, 6, 10 and 14 slowly until the sixteenth is short and even.",
      "Bars 8 and 16 hold D sharp and C sharp in the same bar: the sharps carry to the end of the bar.",
      "Left hand alone in the waltz pattern, then hands together in wait mode, then with the click.",
    ],
    watch: ["D sharp is not in the key signature: it appears in bars 4, 5, 8, 12, 13 and 16 and must be played every time it is marked."],
    source: { label: "William Chappell, Popular Music of the Olden Time, vol. 1 (1859), page 230, 'Tune of Green Sleeves, oldest copy', Internet Archive scan", url: "https://archive.org/details/popularmusicofol01chapuoft/page/230" },
    chart: {
      key: "Em", meter: "3/4", pattern: "waltz", bpm: 60, target: 90,
      chords: "Em | G | D | Em | B | G | D | B | Em | Bm | D | Em | B | Bm | D | B | Em",
      sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }],
      melody: `z5 E | G2 A B>c B | A2 F D>E F | G2 E E>^D E |
F2 ^D B,2 E | G2 A B>c B | A2 F D>E F | G>F E ^D>^C ^D |
E3 E3 | d3 d>^c B | A2 F D>E F | G2 E E>^D E |
F2 ^D B,3 | d3 d>^c B | A2 F D>E F | G>F E ^D>^C ^D |
E3 E3 |]`,
    },
  },
  "song-scarborough-fair": {
    summary: "\"Scarborough Fair\", the Whitby tune printed by Frank Kidson in 1891, public domain, as a lead sheet in G major, 3/4, over a waltz left hand. Two sections: A (1–9), B (10–17).",
    steps: [
      "Right hand alone, wait mode: the pickup D is written after a rest in bar 1, and the left hand plays bar 1 as an intro.",
      "Bars 2–4 and 10–12 climb by step from G to D; keep the quarters even as the line rises.",
      "Bar 9 drops to the low D and bar 16 jumps from D up to G; prepare the hand position before each.",
      "Hands together in wait mode, then play-along with the click.",
    ],
    watch: ["The last note fills all of bar 17; hold it for three beats while the left hand plays its waltz pattern."],
    source: { label: "Frank Kidson, Traditional Tunes (Oxford, 1891), p. 43, the Whitby tune (Internet Archive scan of the IMSLP copy)", url: "https://archive.org/details/imslp-tunes-kidson-frank" },
    chart: {
      key: "G", meter: "3/4", pattern: "waltz", bpm: 66, target: 100,
      chords: "G | G | Am | G | D | G | Am | C | D | G | Am | G | D | C | D7 | G | G",
      sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }],
      melody: `z4 D2 | G2G2G2 | A2B2c2 | d4d2 |
A6 | B2B2B2 | c2B2A2 | G2G2E2 |
D4D2 | G4G2 | A2B2c2 | d2d2d2 |
A4B2 | c4c2 | c2B2A2 | D2G2G2 |
G6 |]`,
    },
  },
  "song-shenandoah": {
    summary: "\"Shenandoah\", traditional, from W. B. Whall's 1913 collection, public domain, as a lead sheet in C major, 3/4, over a waltz left hand. Four sections: Solo (1–3), Refrain (4–5), Solo (6–7), Refrain (8–11).",
    steps: [
      "Right hand alone, wait mode: bar 1 starts with a rest of a beat and a half before the pickup, so count it rather than starting early.",
      "Bars 8 and 9 use dotted eighths followed by sixteenths; keep the short note short and land on the next beat.",
      "Bars 3, 7, 9 and 10 have eighth rests inside the bar; lift the hand for them instead of holding through.",
      "Hands together in wait mode at the slow tempo, then play-along with the click.",
    ],
    watch: ["The melody drops to middle C several times (bars 1, 2, 7, 8, 9 and 11); keep the thumb ready below the five-finger position."],
    source: { label: "W. B. Whall, Ships, Sea Songs and Shanties (Glasgow, 1913), p. 1 (Internet Archive scan)", url: "https://archive.org/details/shipsseasongssha00whal" },
    chart: {
      key: "C", meter: "3/4", pattern: "waltz", bpm: 50, target: 72,
      chords: "C | C | C | F | C | Am | C | C | G | C | C",
      sections: [{ name: "Solo 1", from: 1, to: 3 }, { name: "Refrain 1", from: 4, to: 5 }, { name: "Solo 2", from: 6, to: 7 }, { name: "Refrain 2", from: 8, to: 11 }],
      melody: `z3GCC | C3DEF | GE2zc2 | A3GAG |
EG2GAA | A2GEGE | DC3zD | E3CE3/2F/2 |
G3zC3/2D/2 | E4zD | DC3z2 |]`,
    },
  },
  "song-londonderry-air": {
    summary: "The Londonderry Air, the traditional Irish tune sung as \"Danny Boy\", public domain, in C, as a lead sheet in 4/4: the melody in the right hand over a written-out ballad left hand. Two sections: A (1–9), B (10–17).",
    steps: [
      "Left hand alone: bar 1 is an intro bar under the three pickup notes, then root-fifth patterns under each chord.",
      "Right hand alone, bars 3 and 7: the tie from A3 quarter to A3 eighth holds one note; play it once.",
      "Bars 13–14 climb from D4 to E5, the high point; shift the hand during the tied D rather than reaching.",
      "Hands together at a slow tempo, letting the long notes sing over the left hand.",
    ],
    watch: ["The octave-plus climb in bars 13–14: plan the hand move during the held D in bar 13."],
    source: { label: "\"Danny Boy\", Boosey & Co., 1913, low voice in C (Brigham Young University scan, Internet Archive)", url: "https://archive.org/details/dannyboysong00weat" },
    chart: {
      key: "C", meter: "4/4", pattern: "ballad", bpm: 50, target: 72,
      chords: "C G7 | C | F | C Am | G7 | C C7 | F | C/G G7 | C | Am F | C G7 | C F | G7 | C7 F | C G7 | C/G G7 | C",
      sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }],
      melody: `z4zB,CD | E3DEAGE | DCA,2-A,CEF | G3AGECE |
D4-DB,CD | E3DEAGE | DCA,2-A,G,CD | E3FEDCD |
C4-CGAB | c3BBAGA | GEC2-CGAB | c3BBAGE |
D4-DGGG | e3ddcAc | GEC2-CB,CD | EAGEDCA,B, |
C4-Czz2 |]`,
    },
  },
  "song-sakura": {
    summary: "\"Sakura\", the traditional Japanese song as printed in the Tokyo Sōkyokushū (1888), public domain, as a lead sheet in 4/4 on the white keys (no key signature, as in the source; the tune uses E, F, A, B, C and ends on E), with the melody over a ballad left hand. Three sections: A (1–4), B (5–10), A (11–14).",
    steps: [
      "Right hand alone, bars 1–4: A A B twice, then A B C B; give each half note its full two beats.",
      "Bars 6 and 10: the E–C eighths drop to the low B below middle C; move the hand down for the B rather than stretching.",
      "Bar 13 begins with a quarter rest; count it before the E.",
      "Hands together at 60; the left hand uses only Am, F and Esus4.",
    ],
    watch: ["The B–A eighth pairs in bars 4, 8 and 14 are slurred: play them smoothly and lighter than the long note that follows."],
    source: { label: "Sōkyokushū (Collection of Koto Music), Ministry of Education Music Investigation Committee, Tokyo, 1888, No. 2 (National Diet Library Digital Collections, public domain)", url: "https://dl.ndl.go.jp/pid/857651" },
    chart: {
      key: "Am", meter: "4/4", pattern: "ballad", bpm: 60, target: 80,
      chords: "Am | Am | Am | Am F | Am | Am Esus4 | Am | Am F | Am | Am Esus4 | Am | Am | Esus4 F | F Esus4",
      sections: [{ name: "A1", from: 1, to: 4 }, { name: "B", from: 5, to: 10 }, { name: "A2", from: 11, to: 14 }],
      melody: `A2 A2 B4 | A2 A2 B4 | A2 B2 c2 B2 | A2 BA F4 |
E2 C2 E2 F2 | E2 EC B,4 | A2 B2 c2 B2 | A2 BA F4 |
E2 C2 E2 F2 | E2 EC B,4 | A2 A2 B4 | A2 A2 B4 |
z2 E2 F4 | BA F2 E4 |]`,
    },
  },
  "song-skye-boat-song": {
    summary: "\"Skye Boat Song\" in the 1884 Songs of the North setting, public domain, in G, with its 6/8 written as 3/4 in eighths: the melody in the right hand over a written-out waltz left hand. Three sections: Chorus (1–8), Verse (9–16), Chorus (17–24).",
    steps: [
      "Right hand alone, bar 1: a dotted eighth, a sixteenth and an eighth. Count in eighths (1 and 2 and 3 and) and keep the sixteenth short.",
      "The verse (bars 9–16) is in E minor and moves in even eighths. Play it alone to hear the change from the chorus.",
      "Left hand alone: a waltz pattern under each chord, one chord per bar.",
      "Hands together, chorus first, then the verse, then the chorus again.",
    ],
    watch: ["Bars 1, 5, 17 and 21 open with the same dotted figure. Keep the dotted eighth long and the sixteenth short."],
    source: { label: "Songs of the North, vol. 1, ed. Boulton and Macleod, arr. Malcolm Lawson, J. B. Cramer, London (c.1900 printing; University of Toronto scan, Internet Archive)", url: "https://archive.org/details/31761034118778" },
    chart: {
      key: "G", meter: "3/4", pattern: "waltz", bpm: 66, target: 96,
      chords: "G | D7 | Em | G | G | D7 | Em | G | Em | Am | Em | Em | G | Am | Em | Em | G | D7 | Em | G | G | D7 | Em | G",
      sections: [{ name: "Chorus 1", from: 1, to: 8 }, { name: "Verse", from: 9, to: 16 }, { name: "Chorus 2", from: 17, to: 24 }],
      melody: `D3/2E/2D G2G/2G/2 | A3/2B/2A d3 | B3/2A/2B E2E | D6 |
D3/2E/2D G2G | A3/2B/2A d3 | B3/2A/2B E2E | D6 |
BGB B3 | AEA A3 | GEG G2G | E6 |
BGB B3 | AEA A3 | G3/2E/2G G2G | E6 |
D3/2E/2D G2G/2G/2 | A3/2B/2A d3 | B3/2A/2B E2E | D6 |
D3/2E/2D G2G | A3/2B/2A d3 | B3/2A/2B E2E | D6 |]`,
    },
  },
  "song-wayfaring-stranger": {
    summary: "The traditional camp-meeting tune (printed 1896), public domain, in E minor and 3/4 as in the source, over a waltz left hand on editorial chords, since the source has the melody only. Form AABA: A (1–4), A (5–8), B (9–12), A (13–17); bar 1 holds a rest and the three-eighth pickup.",
    steps: [
      "Right hand alone: bar 1 rests for a beat and a half, then the pickup E–E–B leads into bar 2.",
      "Bars 3, 7 and 15 open with two sixteenths, A–G, before the long E; fit both into the first half beat.",
      "Bars 4, 8 and 16 step down to D sharp, the leading note back to E; the D in the B section stays natural.",
      "Left hand alone with one chord per bar, then hands together slowly; B7 always comes just before E minor returns.",
    ],
    watch: ["The phrase-end notes in bars 5, 9 and 13 last only a dotted quarter, so the next pickup comes in on beat 2 and a half."],
    source: { label: "\"A Poor Wayfaring Stranger\" (Old Camp-meeting Chorus), Times of Refreshing, ed. W. T. Dale (J. W. Burke Co., Macon, Ga., 1896), no. 53, p. 40, page scan on hymnary.org", url: "https://hymnary.org/hymn/TRWC1896/53" },
    chart: {
      key: "Em", meter: "3/4", pattern: "waltz", bpm: 56, target: 84,
      chords: "Em | Em | C | B7 | Em | Em | C | B7 | Em | C | G | Em | Am | Em | C | B7 | Em",
      sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B", from: 9, to: 12 }, { name: "A3", from: 13, to: 17 }],
      melody: `z3 E E B | B3 A B B | A/G/ E2 G A B | A3 G E ^D |
E3 E E B | B3 A B B | A/G/ E2 G A B | A3 G E ^D |
E3 B B d | e3 d e B | B A2 B B d | e3 d e B |
A3 B e d | B3 A B B | A/G/ E2 G A B | A3 G E ^D |
E6 |]`,
    },
  },
  "song-swing-low-sweet-chariot": {
    summary: "The refrain of the spiritual \"Swing Low, Sweet Chariot\" as printed by the Fisk Jubilee Singers (1872), public domain, in F, converted from 2/4 to 4/4 with bars paired. Two phrases: A (1–2), A' (3–4).",
    steps: [
      "Right hand alone, counting sixteenths: bars 1 and 3 end with a dotted-eighth, sixteenth, sixteenth, dotted-eighth figure. Keep the long-short-short-long shape exact.",
      "The four repeated Fs that open bars 2 and 4 are sixteenths. Play them light and even.",
      "Left hand alone: a ballad pattern on F, with C7 for the first half of bar 4.",
      "Hands together slowly in wait mode, then play-along.",
    ],
    watch: ["The second phrase starts on C, not A (bar 3), and ends on F instead of the first phrase's held C."],
    source: { label: "The Story of the Jubilee Singers, with Their Songs (J. B. T. Marsh, 1880), no. 2, p. 126 (archive.org scan)", url: "https://archive.org/details/storyofjubileesi00mars_1" },
    chart: {
      key: "F", meter: "4/4", pattern: "ballad", bpm: 50, target: 76,
      chords: "F | F | F | C7 F",
      sections: [{ name: "A", from: 1, to: 2 }, { name: "A'", from: 3, to: 4 }],
      melody: `A F2 A F3/2F/2 D/2C3/2 | F/2F/2F/2F/2 A/2c/2c c4 | c A2 c F3/2F/2 D/2C3/2 | F/2F/2F/2F/2 A/2A/2G F3 z |]`,
    },
  },
  "song-auld-lang-syne": {
    summary: "The traditional Scottish air \"Auld Lang Syne\" from an 1899 hymnal, public domain, in F with the pickup written into bar 1. Two sections: Verse (1–9), Chorus (10–17).",
    steps: [
      "Right hand alone: almost every bar starts dotted quarter, eighth. Count '1 and 2 AND' so the eighth isn't rushed.",
      "Left hand alone: bar 1 is an intro bar, then a ballad pattern on F, C7 and B-flat.",
      "The phrase ends in bars 5 and 13 jump up to the high F pickup. Find it during the quarter rest.",
      "Hands together in wait mode, then play-along with the click.",
    ],
    watch: ["Bars 8 and 16 drop to the low D and C before the final F. Keep the hand low and let the thumb take the C."],
    source: { label: "High School Hymnal (1899), no. 187, 'Auld Lang Syne', page scan on hymnary.org", url: "https://hymnary.org/hymn/HSH1899/187" },
    chart: {
      key: "F", meter: "4/4", pattern: "ballad", bpm: 60, target: 92,
      chords: "F | F | C7 | F | Bb | F | C7 | Bb C7 | F Bb | F | C7 | F | Bb | F | C7 | Bb C7 | F",
      sections: [{ name: "Verse", from: 1, to: 9 }, { name: "Chorus", from: 10, to: 17 }],
      melody: `z6 C2 | F3F F2A2 | G3F G2A2 | F3F A2c2 |
d4 z2 f2 | c3A A2F2 | G3F G2A2 | F3D D2C2 |
F4 z2 d2 | c3A A2F2 | G3F G2d2 | c3A A2c2 |
d4 z2 f2 | c3A A2F2 | G3F G2A2 | F3D D2C2 |
F4 z4 |]`,
    },
  },
  "song-silent-night": {
    summary: "Gruber's carol (1818), public domain, as a lead sheet in Bb: the source's 6/8 is written in 3/4 with eighth-note motion, one verse of the tune over a waltz left hand. Three sections: A (1–4), A2 (5–8), B (9–12).",
    steps: [
      "Right hand alone: the dotted figure in bars 1, 2, 6 and 8 is long-short-even; count six eighths and give the dot its full length.",
      "Bars 9–10 climb to the top Eb and then the high D; keep the hand light and land the D softly.",
      "Left hand alone: a waltz pattern on Bb, Eb and F7; the F7 bars (3, 9, 11) are the only ones that leave home.",
      "Hands together slowly, keeping the waltz quiet under the melody.",
    ],
    watch: ["Bar 11 drops from Bb to the low C in eighth notes; keep the dotted rhythm even and do not rush into the last bar."],
    source: { label: "Stille Nacht (hymn tune, SATB), Mutopia Project engraving, public domain", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1295" },
    chart: {
      key: "Bb", meter: "3/4", pattern: "waltz", bpm: 60, target: 84,
      chords: "Bb | Bb | F7 | Bb | Eb | Bb | Eb | Bb | F7 | Bb | F7 | Bb",
      sections: [{ name: "A", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B", from: 9, to: 12 }],
      melody: `F3/2G/ F D3 | F3/2G/ F D3 | c2 c A3 | B2 B F3 |
G2 G B3/2A/ G | F3/2G/ F D3 | G2 G B3/2A/ G | F3/2G/ F D3 |
c2 c e3/2c/ A | B3 d3 | B3/2F/ D F3/2E/ C | B,6 |]`,
    },
  },
  "song-jingle-bells": {
    summary: "Pierpont's song (1857), public domain, in G and 4/4 as printed in a 1928 songbook: verse 1 and the chorus over a block-chord left hand. Two sections: Verse (1–8), Chorus (9–16).",
    steps: [
      "Right hand alone, verse: bars 1, 2, 5 and 6 all open D B A G; bar 3 climbs to C and falls to F sharp on 'go'.",
      "Bar 1 ends with two sixteenths after an eighth rest, and bars 10 and 14 have a dotted eighth and sixteenth on G–A; count them against steady eighths.",
      "Left hand alone: most bars change chord at beat 3, and bar 12 moves A7 to D before the chorus repeats.",
      "Hands together at a walking tempo before speeding up; keep the repeated chorus notes detached.",
    ],
    watch: ["Bars 11 and 15 have a dotted eighth and sixteenth on C, then end with two sixteenths on B; keep the beat steady through them."],
    source: { label: "\"Jingle, Bells\" (J. Pierpont), The Blue Book of Favorite Songs, ed. Beattie and Goodell (Hall & McCreary, Chicago, copyright 1928), p. 120 (Internet Archive scan)", url: "https://archive.org/details/bluebookoffavori00beat/page/120/mode/1up" },
    chart: {
      key: "G", meter: "4/4", pattern: "block", bpm: 72, target: 120,
      chords: "G | G C | C D7 | D7 G | G | G C | C D7 | D7 G | G | G | C G | A7 D | G | G | C G | D7 G",
      sections: [{ name: "Verse", from: 1, to: 8 }, { name: "Chorus", from: 9, to: 16 }],
      melody: `D B A G D2 z D/D/ | D B A G E2 z2 | E c B A F2 z2 | d d c A B2 G z |
D B A G D2 z2 | D B A G E2 z E | E c B A d d d d | e d c A G3 z |
B B B2 B B B2 | B d G3/2A/ B2 z2 | c c c3/2c/ c B B B/B/ | B A A G A d3 |
B B B2 B B B2 | B d G3/2A/ B2 z2 | c c c3/2c/ c B B B/B/ | d d c A G3 z |]`,
    },
  },
  "song-o-holy-night": {
    summary: "Adam's Cantique de Noël (1847), public domain, as a lead sheet in C and 4/4, the key of the Léon Grus edition, over a ballad left hand. Four sections: A (1–5), A2 (6–10), B (11–14), C (15–26).",
    steps: [
      "Left hand alone: bar 1 starts with rests, so the left hand plays the C chord while you count in; the melody enters on the last sixteenth of beat two.",
      "Right hand alone: most phrases start on a sixteenth pickup after a rest or a dotted eighth; count in sixteenths until it settles.",
      "Bars 15–20: long notes tied within the bar, then the double-dotted D in bar 19 with a sixteenth G after it; hold the ties without replaying.",
      "Hands together slowly; in bars 19–25 the bass moves every two beats, so plan each slash chord before you reach it.",
    ],
    watch: ["Bar 8 has F# on beat four; it is the only accidental in the melody, and it does not carry into bar 9."],
    source: { label: "Minuit, chrétiens (Cantique de Noël), voice and piano, ed. Léon Grus, Mutopia Project engraving, public domain", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=640" },
    chart: {
      key: "C", meter: "4/4", pattern: "ballad", bpm: 48, target: 66,
      chords: "C | C F | C | C/G G7 | C | C | C F | C C7 | Em/B Bm7 | Em | G7/B | C | G7/B | C | Am | Em | Dm | Am | C/G G7/F | C/E Dm/F | C/G G7 | C | G G7/F | C/E Dm/F | C/G G7 | C",
      sections: [{ name: "A", from: 1, to: 5 }, { name: "A2", from: 6, to: 10 }, { name: "B", from: 11, to: 14 }, { name: "C", from: 15, to: 26 }],
      melody: `z2 z3/2E/ E2- E3/2G/ | G2- G3/2G/ A3/2A/ F3/2A/ | c4 G z/G/ E3/2D/ | C2 E3/2F/ G2 F3/2D/ |
C4 z4 | z4 E2 E3/2E/ | G2- G3/2G/ A3/2A/ F3/2A/ | c4 G z/G/ ^F3/2E/ |
B2 G3/2A/ B2 c3/2B/ | E4 z2 z3/2G/ | G2 A2 D2 G2 | A3/2G/ c3/2E/ A2 G z/G/ |
G2 A2 D2 G2 | A3/2G/ c3/2E/ G2- G z | c4- c2 B3/2A/ | B4- B2- B3/2B/ |
d4- d3/2A/ A3/2A/ | c4 c2 z3/2c/ | e4 d7/2G/ | c4- c2 B3/2A/ |
G4- G3/2G/ A3/2G/ | G6 z3/2c/ | d4- d7/2G/ | e4- e2 d2 |
c4 B2 c3/2d/ | c4 z4 |]`,
    },
  },
  "song-god-rest-ye-merry-gentlemen": {
    summary: "The traditional English carol, public domain, from Stainer's c. 1871 setting, in E minor and 4/4 (cut time in the source), one verse and chorus over a block-chord left hand. Four sections: A (1–5), A2 (6–9), B (10–13), Chorus (14–20).",
    steps: [
      "Left hand alone: bar 1 is an intro bar on E minor before the pickup E on beat four.",
      "Right hand alone: the melody is all steps and one leap, the E to B at the start of bars 2 and 6.",
      "Bar 16 has two eighths, G and F#, before the quarter E; count 'and' between them.",
      "Hands together; the left hand changes chord at the half bar in most bars, so practise the two-chord bars slowly first.",
    ],
    watch: ["Bar 18 climbs B-C-D-E to the top of the tune; keep it legato and do not rush the climb."],
    source: { label: "Christmas Carols New and Old (Bramley & Stainer, first series, c. 1871), no. 1, p. 2 (hymnary.org page scan)", url: "https://hymnary.org/hymn/CCNO1870/page/1" },
    chart: {
      key: "Em", meter: "4/4", pattern: "block", bpm: 72, target: 112,
      chords: "Em | Em B7 | Em C | C Em | B | Em B7 | Em C | C Em | B E | Am G | G7/B Em | Em D | D7 Em | G C | G B | Em | D Em | G G/B | G B | Em",
      sections: [{ name: "A", from: 1, to: 5 }, { name: "A2", from: 6, to: 9 }, { name: "B", from: 10, to: 13 }, { name: "Chorus", from: 14, to: 20 }],
      melody: `z6 E2 | E2 B2 B2 A2 | G2 F2 E2 D2 | E2 F2 G2 A2 |
B6 E2 | E2 B2 B2 A2 | G2 F2 E2 D2 | E2 F2 G2 A2 |
B4 z2 B2 | c2 A2 B2 c2 | d2 e2 B2 A2 | G2 E2 F2 G2 |
A4 G2 A2 | B4 c2 B2 | B2 A2 G2 F2 | E4 G F E2 |
A4 G2 A2 | B2 c2 d2 e2 | B2 A2 G2 F2 | E4 z4 |]`,
    },
  },
  "song-carol-of-the-bells": {
    summary: "Leontovych's Shchedryk (1916), public domain, the choral melody as an instrumental lead sheet in G minor and 3/4 over a waltz left hand; the 1936 English lyrics are not used. Four sections: A (1–15), B (16–23), C (24–27), A2 (28–32).",
    steps: [
      "Right hand alone: the four-note figure Bb-A-Bb-G repeats for fifteen bars; keep the two eighths light and even.",
      "Bars 16–23 move the figure up to D-C-D-Bb and then to the high G in bar 20; shift the hand before each new position.",
      "Bars 24 and 26 run up in eighths with E natural and F#; practise that scale alone until it is even.",
      "Left hand alone, then hands together: the bass walks down G-F-Eb-D in bars 4–7 and F-Eb-D-C in bars 28–31 while the right hand repeats.",
    ],
    watch: ["The E natural and F# in bars 24 and 26 last only for that bar; everywhere else E is Eb from the key signature."],
    source: { label: "Leontovych, Shchedryk for mixed choir, public-domain typesetting after Khorovi tvory (Muzychna Ukraina, 1970), Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/File:%D0%A9%D0%B5%D0%B4%D1%80%D0%B8%D0%BA.pdf" },
    chart: {
      key: "Gm", meter: "3/4", pattern: "waltz", bpm: 72, target: 120,
      chords: "Gm | Gm | Gm | Gm | Gm/F | Eb | Gm/D | Eb | Bb/D | Cm | Gm | Cm/Eb | Gm | Am7b5 | Gm | Gm | Gm6 | Gm7 | Gm | Gm | Gm | Cm7 | Gm | Gm/D | D7 | Gm/D | D7 | Gm/F | Cm/Eb | Gm/D | Cm7 | Gm",
      sections: [{ name: "A", from: 1, to: 15 }, { name: "B", from: 16, to: 23 }, { name: "C", from: 24, to: 27 }, { name: "A2", from: 28, to: 32 }],
      melody: `B2 AB G2 | B2 AB G2 | B2 AB G2 | B2 AB G2 |
B2 AB G2 | B2 AB G2 | B2 AB G2 | B2 AB G2 |
B2 AB G2 | B2 AB G2 | B2 AB G2 | B2 AB G2 |
B2 AB G2 | B2 AB G2 | B2 AB G2 | d2 cd B2 |
d2 cd B2 | d2 cd B2 | d2 cd B2 | g2 gg fe |
d2 dd cB | c2 cc dc | G2 GG G2 | D=E ^FG AB |
cd c2 B2 | D=E ^FG AB | cd c2 B2 | B2 AB G2 |
B2 AB G2 | B2 AB G2 | B2 AB G2 | G6 |]`,
    },
  },
};
