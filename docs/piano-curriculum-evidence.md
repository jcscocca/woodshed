# Piano material review

Reviewed 2026-10-27 for a returning adult who enjoys the Für Elise opening,
classical music, film/anime music and pop chord arrangements, with pulse,
coordination and ledger reading as the stated weak points. The agreed schedule
is five practice days with two twenty-minute visits per day. This is a design
constraint, not a research claim that a skill takes exactly twenty minutes.

## What the first version actually contained

The initial C/G/F bank had 96 scores: 82 four-bar examples, 13 eight-bar examples
and one six-bar example. Ninety-five were in 4/4. Sixteen of its 17 named music
studies were original miniatures; the other was four bars of Ode to Joy with a
new accompaniment. All 17 used RH single-note melody over LH single-note
accompaniment. None included written dynamics, slurs or articulations.

Those constraints can isolate pulse and coordination, but do not substantiate
the stylistic breadth suggested by titles such as “cinematic.” The tests proved
notation integrity and software behavior, rather than compelling music or a
successful teaching sequence. The material is now identified as foundation
practice. Repeated G/F reading examples are labeled as return checks on their
second assigned visit, rather than another unheard sight-read.

## Published comparison, with the edition caveat

The user's exact Bastien series remains unknown. The actual
[WP202 Piano Basics Level 2 contents](https://media.kjos.com/kjos/global.mt.lldns.net/kjos/pdf/WP202_TBL_S.pdf)
were visually examined. They include C-major scale work (p.7), G (p.26), F
(p.34), D (p.40), A (p.44), E (p.48), 6/8, inversions, sixths/sevenths and
binary/ternary form. Therefore C/G/F alone do not establish either a Level 1 or
Level 2 placement; they also do not cover the complete Level 2 contents.
[Publisher description](https://kjos.com/piano/methods/bastien-piano-basics/bastien-piano-basics-piano-level-2.html).

[Faber Adult Piano Adventures 2's published sequence](https://pianoadventures.com/qr/ff1334/)
connects ledger reading, key/chord work, eighth rests, dotted rhythm, minor keys
and later compound meter to musical applications. It supports contextual
planning, not an endorsement of Woodshed's studies or target tempos.

## Implemented repertoire and exact editorial scope

| Material | Actual inspected evidence | Teaching decision |
|---|---|---|
| Beethoven, Für Elise, Mutopia 931 | PDF page 1 and LilyPond, both hands: E5–D#5 pickup, 3/8, sixteenth relays, restored D natural in bars 1/5, low A2/E2 starts, shortened first ending | Preserve pickup plus bars 1–8, first ending. Prepare subdivision before the first attempt. Revisit different passages over all five B sessions. Omit pedal/repeat; retain initial pp; fingerings are ours. This excerpt is a named finished goal, not the complete work. |
| Pachelbel, Canon, Mutopia 2047 | Rendered cello part and LilyPond: D3 A2 B2 F#2 / G2 D2 G2 A2, eight quarters over two 4/4 bars; edition CC BY 4.0, Michael Fischer v. Mollard | Quote one exact bass cycle, then stretch each root to a full bar for a new piano realization, adding upper parts and a closing D. Label it a bass/chord arrangement. Teach F#m explicitly; source chord symbols are our analysis. Return to held and moving versions over five B visits. |
| Mozart, K.331 theme, Mutopia 614 | Source LilyPond and rendered first-strain score: eight 6/8 bars, including dotted eighth/sixteenth figures, even sixteenths in bar 4 and the final eighth rest | Preserve the upper melody in three student versions. Omit extra RH voices and replace Mozart's two-voice LH with disclosed held/two-pulse bass. The full theme has 18 bars; this is its first strain, not the whole theme. |
| Grieg, Morning Mood, Peters plate 7188 | Public-domain orchestral scan, printed page 1/PDF page 5: flute bars 1–4, beginning B5, including the turn's sixteenths and the final rest | Lower the main melody one octave, omit grace ornaments and add a simple new held piano bass. This is a student arrangement of a named four-bar phrase, not Grieg's original piano arrangement. |

Sources: [Für Elise edition](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931),
[Für Elise PDF](https://www.mutopiaproject.org/ftp/BeethovenLv/WoO59/fur_Elise_WoO59/fur_Elise_WoO59-a4.pdf),
[Canon edition and source bundles](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047),
[Canon edition license](https://creativecommons.org/licenses/by/4.0/).
Source and arrangement disclosures appear inside each lesson.

Additional inspected editions: [Mozart Mutopia 614](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=614),
[Grieg Op.46 orchestral editions, file 912194/Peters plate 7188](https://imslp.org/wiki/Peer_Gynt_Suite_No.1,_Op.46_(Grieg,_Edvard)).
The A-major unit's complete original Two Rooms, E-major twelve-bar Switchyard
Blues, and the final unit's complete AB/ABA works supply contrasting full-form
goals without attaching famous titles to unrelated original music.

## Repertoire scores from Mutopia

Three earlier outside candidates are now complete in-app scores on the Pieces
track. Each was transcribed from the edition's LilyPond source and checked bar by
bar against the edition's own MIDI (`test/fixtures/pieces`, enforced by
`test/pieces.test.mjs`), then read against the rendered PDF.

| Material | Edition | What the score keeps and changes |
|---|---|---|
| [Bach, Prelude in C, BWV 846, Mutopia 5](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=5) | Public domain; printed source given as unknown; typeset by Shay Rojansky, Han-Wen Nienhuys and Tobias Erbsland. 35 bars. | Every note and both held left-hand voices, on the bass staff as printed. The right hand's bass clef in bar 33 is kept. The final rolled chord and fermatas are kept as marks; playback strikes the chord together. No dynamics in the source. |
| [Satie, Gymnopédie No. 1, Mutopia 37](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37) | Public domain; Dover reprint of the 1888 original; typeset by Evin Robertson. | The edition folds Satie's written-out second pass into a repeat with two endings. The app can't play repeats, so the score writes it out again, 78 bars, as Satie printed it. Left-hand chords move between the staves as in the edition (treble staff, bass staff for bars 19–31 and 58–70). Dynamics, hairpins and slurs are left out. "Lent et douloureux" appears in the summary, not on the page. |
| [Tchaikovsky, Old French Song, Op. 39 No. 16, Mutopia 2080](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2080) | Public domain; Schirmer 1904; typeset by David McNamara. 32 bars plus an eighth-note pickup. | The pickup is padded into a full first bar, so app bar numbers run one ahead of the print. The right hand's short lower voice in printed bars 31–32 is folded into chords; its D shows as a dotted eighth and is held under the G. Both left-hand voices are kept. Staccato is kept; dynamics, the espressivo swells and slurs are left out. |

The left hand's inner voices need more than one voice per staff. The authoring
conventions in `docs/superpowers/specs/2026-09-26-notation-pieces-design.md`
now allow that: every voice after the first is the left hand's, and two
left-hand voices striking one pitch together grade as one key.

## Lead-sheet songs

The Songs shelf and the "Songs from lead sheets" track hold public-domain songs
as lead sheets (`src/lessons/songs.js`): the melody as printed in the named
source, over a left hand that `chartToAbc` builds from the chord symbols.

- **Public domain:** US terms. A composition is free if it was published or
  registered in 1930 or earlier. Only the composition is used; no lyrics, recordings or later
  arrangements.
- **Melodies:** read from a scan of a public-domain printing, never from
  memory. Each was then compared bar by bar against the scan a second time.
- **Chords:** taken from the source's chord names, ukulele diagrams or piano
  harmony, reduced to at most two per 4/4 bar. Where the source prints only the
  melody (Scarborough Fair, Shenandoah, Sakura, Wayfaring Stranger), the
  chords are ours, and the lesson says so.
- **Standards:** the 1920s–30 songs give the refrain only. Cut time is written
  as 4/4, 6/8 as 3/4 eighths and 2/4 with bars paired, because the engine grades
  3/4 and 4/4. Pickups are written into a full first bar, and repeats are written out.
- **Checks:** `test/program-shelf.test.mjs` requires every song to have a melody
  and an https source.

| Song | Source | What changed |
| --- | --- | --- |
| I Got Rhythm (Gershwin, 1930) | [Original sheet music, New World Music Corp., 1930 (Girl Crazy), Internet Archive scan](https://archive.org/details/i-got-rhythm-1930-sheet-music) | Refrain only, read from pages 4–5 of the 1930 New World Music sheet (copyright MCMXXX on page 2). Second ending used for bar 34; the first-ending turnaround is left out. Chords from the ukulele symbols: 'Gmi.7 with C' is Gm7/C, 'Ebmi. add C' is Ebm6, 'C7 with Gb' is C7/Gb, C9 is simplified to C7. Passing symbols on the last eighth of a half bar are dropped (the F7 in bars 6, 14 and 30, the C#dim in bar 8, the C7 in bar 24). The extra uke symbols 'C' in bar 17 and 'Bb' in bar 21 (the seventh of D7 and C7) are folded into D7 and C7. |
| Dream a Little Dream of Me (Andre and Schwandt, 1930) | [Original sheet music, Davis, Coots & Engel, 1931 printing (Internet Archive scan); composition registered unpublished 29 Dec 1930, EU33240](https://archive.org/details/dream-a-little-dream-of-me-sheet-music) | Public-domain status: the Copyright Office card (Andree, F.; DREAM A LITTLE DREAM OF ME; (c) 29Dec30; EU33240; renewed R205246) shows an unpublished registration on 29 Dec 1930, so the 95-year term ran out at the end of 2025. The scan's own notice says 1931 (the published edition). Card: https://tile.loc.gov/storage-services/service/copyright/hprcatcard/19/55/19/70/AN/DB/-A/ND/RE/WR/19551970ANDB-ANDREWR/CC19551970ANDB-ANDREWR.0759.jpg. Refrain only, read from the voice line on scan pp. 5–6 (book pp. 5–6), using the second ending for bar 32. Source is in cut time; written here in 4/4 with the same note values. Chords from the ukulele diagrams: bars 4/12/28 'E7 / Dmin E-7' kept as E7; bars 15 and 31 'G / Cmin7 D7' kept as G then Cm7; bar 16 'G Amin G Bb7' kept as G then Bb7; bar 20 'Bb7 Dim Bb7' kept as Bb7; bar 25 'G Bmin' kept as G. The bridge chord printed as 'E7' over bar 17 is read as Eb (the piano bass is Eb). The scan is low resolution (staff space about 5 px), but every bar was legible on a zoomed second pass. |
| Embraceable You (Gershwin, 1930) | [Girl Crazy vocal selection, New World Music Corp., 1930, pages 34–37, Internet Archive scan](https://archive.org/details/embraceable-you-1930-sheet-music) | Refrain only, read from pages 36–37 (copyright MCMXXX New World Music Corp. on page 34). Second ending used; the source's last bar is three beats (G quarter, two quarter rests), padded here to a full bar with rests. Chords from the guitar diagrams: 'C add D' simplified to C, 'D7 sus G' to Dsus4, 'Eb aug 5' to Ebaug, 'Bb+' to Bbaug. Where a symbol falls on beat 4 (bars 6, 16, 22) it is kept as the second chord of the bar. |
| But Not for Me (Gershwin, 1930) | [Girl Crazy song sheet, New World Music Corp., 1930, Internet Archive scan](https://archive.org/details/but-not-for-me-sheet-music) | Refrain only, read from pages 4–5 (copyright MCMXXX New World Music Corp. on page 2; the printing carries a Witmark advertisement, so it may be a later run of the same plates, S-356). Bar 1 is the refrain's lead-in bar from the end of page 3 (rest, then F G F), written as a full bar. Second ending used for bars 32–33. Chords from the chord symbols; where a bar has three symbols, the one on beat 1 and the one on beat 3 are kept (the beat-4 Bb7, Cm, G7, Fm and Ddim drop out). 'F7–5' simplified to F7, 'C7+5' to Caug, 'Eb+5' to Ebaug, 'Ab+' to Abaug. |
| Body and Soul (Johnny Green, 1930) | [Original sheet music, Harms, 1930, English edition (IMSLP scan)](https://imslp.org/wiki/Body_and_Soul_(Green,_Johnny)) | Refrain only, read from pages 4–6 of the Harms 1930 English edition (IMSLP file PMLUS07898). Chords from the printed chord names over the ukulele diagrams; changes on beats 2 and 4 reduced to the chord on beats 1 and 3. The bridge is printed in Db (bars 17–20) and E major (bars 21–24); written here with accidentals in C. Bars 19–20 offer Ab4 or Ab3; the upper note is used. The refrain ends with the second ending (bars 32–33), the last bar's Db neighbour chord dropped. Bar 24 has a chord on each beat (B7, E7, A7); kept B7 and A7. Bars 7, 15 and 31 end with the printed eighth-note triplet G-A-Eb. |
| Ain't Misbehavin' (Waller, 1929) | [Original sheet music, Mills Music, 1929 (IMSLP scan)](https://imslp.org/wiki/Ain%27t_Misbehavin%27_(Waller,_Fats)) | Refrain only, read from pages 4–5 of the Mills 1929 edition (IMSLP file PMLUS06533). Cut time read as 4/4 with one source bar per bar. The scan prints ukulele diagrams without chord names; chords were decoded from the diagrams (Bb-Eb-G-C tuning) and checked against the piano part. Written-out repeat uses the second ending (bars 31–32). Bar 16 shows a half note and a quarter rest; read as E held three beats. Bars 5, 13 and 29: the second-half diagram reads as Gb7 (passing diminished sound). Bar 22 diagram is faint. |
| Singin' in the Rain (Nacio Herb Brown, 1929) | [Original sheet music, Robbins Music, 1929, with ukulele arrangement (IMSLP scan)](https://imslp.org/wiki/Singin%27_in_the_Rain_(Brown,_Nacio_Herb)) | Chorus only, read from pages 2–3 of the Robbins 1929 edition (IMSLP file PMLUS06511). Cut time read as 4/4 with one source bar per bar. The pickup "I'm" from the end of the verse is left out so the chorus starts on bar 1. Chords decoded from the ukulele diagrams (G-C-E-A tuning). Bars 13–14 diagrams are small; read as D7. |
| Blue Skies (Berlin, 1927) | [Original sheet music, Irving Berlin Inc., 1927, ukulele arr. May Singhi Breen (University of Maine Vocal Popular Sheet Music Collection scan, via Wikimedia Commons)](https://commons.wikimedia.org/wiki/File:Blue_Skies_(1927)_sheet_music.pdf) | Refrain only, read from pages 4–5 of the scan (PDF pages 4–5). The printed refrain is 32 bars with a repeat and 1st/2nd endings; written out once with the 2nd ending. Cut time written as 4/4. Chords from the piano part, checked against the ukulele diagrams where legible (D tuning: bridge Cm6/G and D7/G/B7 confirmed). Bars 1–4: bass line E, D#, D, C# under E minor (Em, Em/D#, Em7/D, Em6/C#); the Ebdim7 passing chord on beat 4 of bar 4 is dropped. Bars 5–6: piano has G over a D bass, then D7 on beat 3, then a G-Bb-D-E chord (Gm6) and D7; the ukulele diagrams simplify bar 5 to plain G. Bar 24: diagrams show D7, G (beat 3), B7 (beat 4); kept D7 and B7 because the B7 leads into the E minor return. Bar 8 bass chromatic walk-up dropped (G held). |
| Ain't She Sweet (Ager, 1927) | [Original sheet music, Ager, Yellen & Bornstein Inc., 1927 (University of Maine Vocal Popular Sheet Music Collection scan, Internet Archive copy of the Digital Commons PDF)](https://web.archive.org/web/20240708083707/https://digitalcommons.library.umaine.edu/cgi/viewcontent.cgi?article=7189&context=mmb-vp) | Refrain only, read from pages 4–5 of the 1927 edition (PDF pages 5–6); UMaine record https://digitalcommons.library.umaine.edu/mmb-vp/6188/ (Digital Commons has since been retired, so the link is the Internet Archive copy). The printed refrain is 32 bars with a repeat and 1st/2nd endings; written out once with the 2nd ending. Cut time written as 4/4. Chords from the piano part: bars 1 and 3 have E natural in the bass under C sharp, G and the melody's B natural (written Em6, the exact notes; often charted as Edim7). Bar 6 has E natural, B flat and C over an A flat bass (written Abaug). Bars 19 and 23 have B natural over E flat on beats 1–2 (Ebaug, then Eb). Beat-4 passing chords are dropped. In bars 6, 14 and 30 the voice part slurs two Cs under one syllable; written as a tie. |
| Bye Bye Blackbird (Henderson, 1926) | [Original sheet music with ukulele chords, Jerome H. Remick & Co., 1926 (University of Alberta Libraries scan, Internet Archive)](https://archive.org/details/SM001855) | Chorus only, read from pages 4–5, using the second ending for bar 32. Chords from the printed ukulele symbols. Bar 6 is marked G#-7 in this copy; the piano part (Bb bass under C# E G) and a later Remick printing (archive.org cbc8829blackbird, marked C#dim) give C#dim7. Bar 20 is also marked G#-7; written as E7 to match the E in the bass. Bars 13–14 carry no symbol; D7 continued from bar 12, as the piano part has it. Bar 17 has a passing Bb on beat 4, dropped. Bar 28: the sharp on the quarter G# carries to the half note, so both are G#. Cut time written as 4/4 in quarters. |
| Sweet Georgia Brown (Bernie, Pinkard and Casey, 1925) | [Original sheet music with guitar and ukulele chords, Remick, copyright 1925 (University of Alberta Libraries scan, Internet Archive)](https://archive.org/details/SM000426) | Chorus only. Bars 1–8 and 17–32 were read from the University of Alberta scan, pages 4–5. The bottom half of page 4 is torn away in that copy, so bars 9–16 come from a scan of a 1925 Jerome H. Remick & Co. printing at the University of Nebraska-Lincoln History Harvest (https://historyharvest.unl.edu/items/show/183), which has the same engraving. Chords are from the printed symbols. Dropped: D7+5 on beat 4 of bars 12 and 14, and Em7 on beat 4 of bar 15. B7–5 in bar 30 is written as B7. Second ending used for bar 32. Bar 32: the half note G is tied to a G eighth at the end of the bar, and the beats in between are unclear on the page. Read as G6-G z. Cut time is written as 4/4 in quarters. |
| Tea for Two (Youmans, 1924) | [Original sheet music, Harms Inc., copyright 1924, plate 7076-4 (Silent Film Sound & Music Archive scan, Carl Braun Collection)](https://www.sfsma.org/tea-for-two/) | Refrain only, read from pages 3–5 of the vocal score, using the second ending for bars 31–32. The score has no chord symbols, so every chord was read from the piano part: the bass notes plus the right-hand chords. Original key Ab; transposed up a tone to Bb (Ab has four flats). The bridge moves to C major in the original, D major here. Bar 1: the dot on the first note is hidden by the repeat sign; read as a dotted quarter to match the piano and bar 5. Bar 23: the piano has C bass with Eb-Gb-Bb (Cm7b5 in Ab, Dm7b5 here). Bar 25: Db then C in the bass under Bbm and Cm7b5 (Cm/Eb and Dm7b5 here). Bar 26: F then Eb in the bass, with A natural and the melody Db (Faug then F7, here Gaug then G7). Bars 27–28 have chromatic inner voices that were hard to resolve; read as Bbm, then Db and Eb7 (Cm, Eb and F7 here). Bars 11–12: C bass under a G-A tenor line, read as C then C6 (D and D6 here). |
| It Had to Be You (Isham Jones, 1924) | [Original sheet music, Jerome H. Remick & Co., 1924 (San Francisco Symphony Music Archive scan)](https://www.sfsma.org/wp-content/uploads/2025/02/Nadeau_081_KahnJones_ItHadToBeYou.pdf) | Public domain (Remick, copyright 1924). Refrain only, read from pages 3–5 of the SFSMA scan; the verse is left out. Bar 1 is the refrain's lead-in (D, E D E F sharp after a quarter rest), written as a full bar. The refrain is printed with a repeat; it is written once, with the second ending used for bars 32–33. Cut time is written as 4/4 in eighths. Chords from the ukulele diagrams (A-D-F#-B tuning), checked against the piano part. Bar 25 has an A7 diagram on beat 1 and Em on beat 2 over an E bass, kept as Em. Bar 27's diminished diagram is named F#dim7 from the piano's F sharp bass; the Bb-C#-E-G diagrams in bars 29, 30 and 32 are named Bbdim7 from the piano's B flat bass. In bar 32 the passing G7 (beat 2) and Cm (beat 4) diagrams drop out. Second pass done bar by bar against the scan with staff-line overlays; bar 27 corrected to A A B C D (first pass read B B). A York University copy of the same 1924 edition (YorkSpace JAC005593.pdf) was not needed. |
| Rhapsody in Blue: Andantino Theme (Gershwin, 1924) | [Rhapsody in Blue, piano solo, New World Music Corp. plate S-109 (copyright MCMXXIV), Internet Archive scan](https://archive.org/details/rhapsodyinblue00geor) | Our simple arrangement of the first eight bars of the Andantino moderato (page 20 of the piano solo), transposed from E major (four sharps) up a half step to F. The scan is a later Warner Bros. printing of the New World plate S-109 with the 1924 copyright notice; IMSLP lists the same plate as the 1927 New World solo edition. The melody is the top voice: three rising chords, then the R.H. continues an octave lower in the bass clef (bar 1 beat 4 tied into bar 2), then held top notes in bars 3–8. The chromatic inner line under the held notes (D#-D-C# in the original key) and the R.H. chords are left out. Chords read from the piano harmony: E, F#7, B7 with a raised fifth (written F double sharp), B7, E; transposed to F, G7, Caug, C7, F. Bars 9 onward (the second phrase and the transition) are not included. |
| St. Louis Blues (W. C. Handy, 1914) | [Sheet music, Handy Bros. Music Co., later printing of the 1914 song with ukulele diagrams (archive.org scan, Carner collection)](https://archive.org/details/carner_40_1963) | Chorus only (the 12-bar blues strain headed 'Chorus', page 4 of the scan). The pickup ('Got de') is written into bar 1. The repeat is written once, taking the second ending. Bar 12 of the chorus is the source's held 'me' (whole note); the last bar shortens the second ending's tied half note and fermata eighth to a half note and rest. Accidentals follow the source and carry through the bar. Chords come from the piano part. A second copy (carner_41_2005) was used to cross-check. |
| When the Saints Go Marching In (Traditional, arr. R. E. Winsett, 1929) | [Soul Inspiring Songs (R. E. Winsett, 1929), no. 183, page scan on hymnary.org](https://hymnary.org/hymn/SIS1929/183) | Soprano line of Winsett's 1929 four-part setting (text 'When the sun refuse's to shine', tune 'When the Saints Go Marching In'), in A-flat as printed. One verse and the refrain. The two-eighth pickup is written into bar 1. The refrain's three-eighth pickup ends bar 5, as in the source. The refrain's closing dotted half is followed by a quarter rest to fill the bar. Chords come from the bass and alto. Bars 2, 5 and 7 hold a half note tied to an eighth; the ties are small in the scan. |
| Greensleeves (Traditional) | [William Chappell, Popular Music of the Olden Time, vol. 1 (1859), page 230, 'Tune of Green Sleeves, oldest copy', Internet Archive scan](https://archive.org/details/popularmusicofol01chapuoft/page/230) | One verse of the tune, the 'oldest copy' on page 230, which Chappell takes from William Ballet's Lute Book. 6/8 written as 3/4 with the same eighth notes, one 6/8 bar per 3/4 bar. The one-eighth pickup is written into a full first bar with rests; the eighth rest that opens the second strain is dropped. Chords read from Chappell's piano part. He changes chord halfway through the odd-numbered bars (C to G, E minor to C, E minor to B, B minor to G); one chord a bar is kept, the one that fits most of the bar's melody: G for C/G, E minor for E minor/C, B for E minor/B (the cadence), B minor for B minor/G. |
| Scarborough Fair (Traditional, Yorkshire) | [Frank Kidson, Traditional Tunes (Oxford, 1891), p. 43, the Whitby tune (Internet Archive scan of the IMSLP copy)](https://archive.org/details/imslp-tunes-kidson-frank) | Melody read from Kidson p. 43 (scan leaf 46), the tune sung by a Whitby ballad singer, not the later Simon and Garfunkel tune. Kidson prints the melody only, with no accompaniment or chord symbols, so the chords here are a plain diatonic harmonization (G, Am, C, D, D7) added for the left hand, not taken from the source. Checked: English County Songs (1893) has a Scarborough Fair with piano, but it is a different 6/8 tune with fermatas and two verse forms. The one-beat pickup is written into bar 1 after a rest, so the final note is held for the full bar 17 instead of the printed half note. Pitches checked a second time by measuring note heads against the staff lines; bar 11's first note sits between A and G and is read as A. |
| Shenandoah (Traditional, American) | [W. B. Whall, Ships, Sea Songs and Shanties (Glasgow, 1913), p. 1 (Internet Archive scan)](https://archive.org/details/shipsseasongssha00whal) | Melody read from Whall p. 1 (scan leaf 21), printed in C major, 3/4, melody only. Whall's verse begins at its second line, so the tune starts there as printed. Whall gives no accompaniment or chord symbols, so the chords are a plain diatonic harmonization (C, F, Am, G) added for the left hand, not taken from the source. Checked: Terry, The Shanty Book (1921) has piano harmony but alternates 4/4 and 3/4 bars, and Sharp, English Folk-Chanteys (1914) is in mixed 3/2 and 2/2, so neither fits one meter. The 1.5-beat pickup is written into bar 1 after a rest, and the refrain's one-eighth pickup closes bar 7; the final bar ends with a rest. Fermatas omitted. Rest lengths were worked out from the bar totals (the old engraving's eighth rests). |
| Londonderry Air (Danny Boy) (Traditional Irish air) | ["Danny Boy", Boosey & Co., 1913, low voice in C (Brigham Young University scan, Internet Archive)](https://archive.org/details/dannyboysong00weat) | First verse of the vocal line, read from pages 2–3 of the 1913 Boosey edition (No. 1 in C). The three-note pickup is written into bar 1 with rests. Chords read from the piano part's bass and harmony; the accompaniment moves under the melody, so some half-bar chords are simplified. Bars 2, 10, 11, 12 and 15 have inner-voice motion that makes the chord choice less certain. |
| Sakura (Traditional Japanese) | [Sōkyokushū (Collection of Koto Music), Ministry of Education Music Investigation Committee, Tokyo, 1888, No. 2 (National Diet Library Digital Collections, public domain)](https://dl.ndl.go.jp/pid/857651) | One verse of the tune, read from the voice staff of No. 2 (Sakura), NDL frames 22–23. 4/4, no key signature in the source; pitches kept as printed. The koto postlude (4 bars, voice resting) is left out. The source has no harmony: the koto part doubles the voice in unison and octaves. The chords (Am, F, Esus4) are an editorial minimal harmonization that uses only the five notes of the tune's scale (E, F, A, B, C); they are not from the source. |
| Skye Boat Song (Traditional, arr. Lawson, 1884) | [Songs of the North, vol. 1, ed. Boulton and Macleod, arr. Malcolm Lawson, J. B. Cramer, London (c.1900 printing; University of Toronto scan, Internet Archive)](https://archive.org/details/31761034118778) | Read from pages 18–19. The source gives the chorus first and repeats it after each verse, so the lead sheet is chorus, verse 1, chorus with the repeat written out; the last-time-only fermata bar after the final chorus is left out. Chords were read from the piano part, which has no symbols. The chorus keeps a G pedal in the bass; bars 2 and 6 are D7 harmony over it. In bars 11 and 15 the piano moves to B7 on beat 3; only the beat-1 Em is kept because 3/4 allows one chord per bar. 6/8 written as 3/4 in eighths. |
| Wayfaring Stranger (Traditional American, printed 1896) | ["A Poor Wayfaring Stranger" (Old Camp-meeting Chorus), Times of Refreshing, ed. W. T. Dale (J. W. Burke Co., Macon, Ga., 1896), no. 53, p. 40, page scan on hymnary.org](https://hymnary.org/hymn/TRWC1896/53) | Melody read from the single-line shape-note printing (page image: https://hymnary.org/page/fetch/TRWC1896/23/high/53). The source prints the melody only, so the chords are editorial: plain diatonic triads and B7 written for this lead sheet, not taken from any source. Tillman's The Revival (1890), no. 105, was not used: it has the same contour but is printed in E flat with a three-flat signature and no accidentals on G, so its third is major, not the minor tune. This 1896 printing is in E minor with D sharp at each cadence. The first strain has repeat signs and is written out. The source puts each three-eighth pickup outside the bar and still gives the phrase-end note a full dotted half; the lead sheet shortens the held note in bars 5, 9 and 13 to a dotted quarter so each pickup fits its 3/4 bar. The pickup into bar 14 prints a flat before D5; read as D natural (the old use of a flat to cancel the earlier sharp), which matches the lowered seventh at the same spot in the 1890 printing. |
| Swing Low, Sweet Chariot (Spiritual, Fisk Jubilee Singers, 1872) | [The Story of the Jubilee Singers, with Their Songs (J. B. T. Marsh, 1880), no. 2, p. 126 (archive.org scan)](https://archive.org/details/storyofjubileesi00mars_1) | Refrain only ('Swing low ... carry me home', to Fine), soprano line of the Fisk setting, read from the 1880 edition. The 1872 Jubilee Songs printing (archive.org 29208201.4853.emory.edu) was used to cross-check. The source is in 2/4 and is written here in 4/4 with bars paired. Fermatas are left out, and the final dotted quarter is followed by an eighth rest. The bass rests under the opening bar of each phrase, so the F chord there comes from the alto and tenor. In the source the 'char-i-ot' figure splits into two voices (D sixteenth, then C dotted eighth); the soprano reading is taken. |
| Auld Lang Syne (Traditional Scottish air) | [High School Hymnal (1899), no. 187, 'Auld Lang Syne', page scan on hymnary.org](https://hymnary.org/hymn/HSH1899/187) | Soprano line of the four-part setting, read from the page scan (p. 130). One verse and the chorus, in F as printed. The pickup C is written into bar 1. Each phrase ends with a half note, a quarter rest and the next phrase's pickup, as in the source. The final bar's half note is followed by a rest. Chords come from the tenor and bass. Heart and Voice (1910), no. 285, was downloaded as a cross-check source. |
| Silent Night (Gruber, 1818) | [Stille Nacht (hymn tune, SATB), Mutopia Project engraving, public domain](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1295) | Melody read from the soprano line of the Mutopia SATB hymn-tune setting (LilyPond source). Chords taken from the four-part harmony. The source is in 6/8; each 6/8 bar is written as one 3/4 bar of eighths. Bar 11 moves from Bb/F to F7 inside the bar; the lead sheet keeps F7 for the whole bar. |
| Jingle Bells (Pierpont, 1857) | ["Jingle, Bells" (J. Pierpont), The Blue Book of Favorite Songs, ed. Beattie and Goodell (Hall & McCreary, Chicago, copyright 1928), p. 120 (Internet Archive scan)](https://archive.org/details/bluebookoffavori00beat/page/120/mode/1up) | Verse 1 and chorus read from the soprano of the four-part setting; chords read from the harmony, mainly tenor and bass. This printing has F sharp on 'go' (bar 3), the familiar note, but G on 'pen' (bar 12), where the familiar version has B. Every pre-1931 printing checked has a note other than B there: G in Rosey (1908), Heart Songs (1909) and this book, and G sharp in Kern's Favorite Christmas Melodies (Dixon-Lane, 1927). No pre-1931 printing with B was found, so the lead sheet keeps the source's G. The source has an eighth-note pickup before bar 1 and at the ends of bars 2–5 that carries only verse 2 and 3 words; verse 1 has no syllable there, so those are rests. The chorus repeat with first and second endings is written out: bars 9–12 use the first ending, bars 13–16 the second. In bar 4 the soprano B on 'way' is slurred to G. Bar 10 has a passing D7 under the sixteenth, kept as G. Bar 11 moves from C to G on the 'to' after beat 3; written as C G. Bar 12 is A7 (tenor C sharp) then D, as printed. The last bar is 3.5 beats in the source because the 'In a' sixteenths sit in the bar before; an eighth rest fills it. |
| O Holy Night (Adam, 1847) | [Minuit, chrétiens (Cantique de Noël), voice and piano, ed. Léon Grus, Mutopia Project engraving, public domain](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=640) | Melody read from the voice part of the Mutopia LilyPond source (Léon Grus edition, in C), from the entry in bar 2 to the last sung bar; the one-bar piano intro and the closing piano bars were left out, and the two grace notes were dropped. Chords taken from the piano harmony. Source bar 9 (lead-sheet bar 8) has an augmented-sixth chord spelled C E G A#; it is written as C7, which sounds the same. Source bar 10 has D natural in the piano and the vocal grace note, so the chord is Bm7, not B7. |
| God Rest Ye Merry, Gentlemen (Traditional) | [Christmas Carols New and Old (Bramley & Stainer, first series, c. 1871), no. 1, p. 2 (hymnary.org page scan)](https://hymnary.org/hymn/CCNO1870/page/1) | Melody read from the soprano line of the SATB setting, verse 1 with its chorus. Chords taken from the four-part harmony, keeping the chord on beats 1 and 3 of each bar, since the source changes chord on every quarter. The source is in cut time; it is written here in 4/4 quarters. The opening quarter-note pickup is written into a full first bar with rests. The last bar is a half note in the source (a repeat to the next verse); a half rest fills it out. |
| Carol of the Bells (Shchedryk) (Leontovych, 1916) | [Leontovych, Shchedryk for mixed choir, public-domain typesetting after Khorovi tvory (Muzychna Ukraina, 1970), Wikimedia Commons](https://commons.wikimedia.org/wiki/File:%D0%A9%D0%B5%D0%B4%D1%80%D0%B8%D0%BA.pdf) | Instrumental only; the copyrighted 1936 English lyrics are not used. Melody read from the top (soprano) line of the Commons typesetting, which the uploader released as public domain. It is a modern engraving of the 1916 choral score, not a pre-1931 scan: IMSLP has only modern CC-licensed editions behind a bot check, and no pre-1931 scan was found on archive.org, the LOC or Commons. The work was first performed in 1916 and first published in 1921 (Kyiv), so it is public domain in the US. Chords taken from the choral harmony. The lead sheet takes score bars 2–32 and then the second-ending bar 34, so the opening solo bar and the first ending are dropped. |

Not built, for lack of a usable public-domain source:

- **Behind bot checks or IMSLP's disclaimer page:** Georgia on My Mind, On the Sunny Side of the Street,
  Puttin' on the Ritz. A 1929–30 scan exists for each but could not be fetched
  automatically.
- **No notated public-domain printing found:** Simple Gifts, House of the Rising Sun, Arirang. The only early Arirang
  (1896) is an older, different tune and the scan is unreadable.

Jingle Bells follows the 1928 Blue Book of Favorite Songs: F sharp on "go", as
sung today, and G on "pen", as in every 1930-or-earlier printing checked (Rosey 1908,
Heart Songs 1909). The later familiar B is not in them.

## Examined alternatives and decisions

- [Star Wars for Beginning Piano Solo, publisher samples](https://www.halleonard.com/viewcloserlook.action?itemId=00110287&name=star-wars-for-beginning-piano-solostar-wars-for-beginning-piano-solo):
  Cantina Band, printed p.7, was visually examined. Held-note bass keeps one
  layer simple, while ties, rests, detached notes and chromatic accidentals make
  it a plausible later rhythm project. This judgment concerns that sample,
  not every song in the collection.
- [Simple Disney Songs, publisher samples](https://www.halleonard.com/viewcloserlook.action?itemId=00355319&name=simple-disney-songssimple-disney-songs):
  Almost There, printed p.3, was visually examined. Swing, offbeats and changing
  LH intervals add several demands at once. Defer this sample despite the
  easy-piano marketing. Other listed titles need their own score review.
- Simple Pop Songs, Einaudi Graded Pieces for Piano (Preparatory–Grade 2),
  Simple Movie Songs, The Greatest Video Game Music and My First Broadway Song
  Book (Hal Leonard listings): publisher listings checked; no sample notation
  could be viewed, so the scores have not been reviewed. Their levels are
  guesses from the series and grade labels.
- [Yamaha Ghibli Favorites for Beginners 2](https://sheetmusic.jp.yamaha.com/products/4947817303060):
  publisher listing checked; full scores not inspected. The catalogue labels
  that limit. It is not a matched lesson replacement.

## Software checks versus learning evidence

The course has 196 exercises and 80 planned sessions. Every score is checked
for each hand's bar duration, including declared partial bars, range and
cross-hand key conflicts. Source regressions compare every Für Elise pitch,
onset and duration in both hands, minor scale forms/registers, and the Canon
bass route, every Mozart/Grieg main-melody event, complete AB/ABA hand roles,
unfolded ending order and six-key chord/inversion registers. These checks found
and corrected a G-voicing octave error and an A-unit held-bass mismatch.
Separate tests cover count-ins, passage looping, ties, save/load, cross-section
credit, correction/removal and recording resource lifetimes.

The player now supports small bar ranges, distinct visit goals, saved observed
criteria, voluntary local recording/listen-back and delayed return suggestions.
Cumulative review draws those returns from every practised unit and preserves
the previous passage, hands, tempo and next-step note. An optional first-attempt
self-report records whether it preceded app playback and retains its initial
scope separately from subsequent repair. Ready practice first returns after
three days; comparable steady delayed checks can extend that to seven, fourteen
and thirty. Difficulty returns the next day, then a successful return rebuilds
from three days. Same-day repeats cannot lengthen the gap. These intervals are
product defaults rather than research-validated prescriptions. Review reports
never complete guided blocks, and an initial difficult check cannot be erased
by a later successful repair in the same visit.
New guided visits reserve one three-minute due check inside the twenty-minute
budget, proportionally allocating seventeen minutes to the selected plan's blocks
without omitting instruction. Saved checks carry
a separate session association for resuming; older partial sessions keep their
original allocation. After two qualified returns, a supported skill may use one
of eight bounded fresh studies instead. The nine supported families retain inspected
registers, key spellings, hand positions and chord voicings while changing note
order, rhythm or harmonic route. Used example IDs are skipped and an exhausted
bank returns to ordinary review. Transfer first-attempt evidence remains
separate from the original passage's readiness and interval. Musical regressions
check all generated studies for notation duration, registers, hand conflicts,
distinctness and named chord tones; flow/storage tests check the time budget,
resume and separation of evidence. These are software and content checks,
rather than evidence of improved learner outcomes.

The recommendation layer now rotates explicit related preparations and versions
of the same project. The 187 distinct assigned exercises map to 148 families,
including 18 multi-source groups; this reduces duplicate recommendations without
changing any passage's raw due date, report or readiness. Only a comparable
before-playback steady return can trigger a three-day family scheduling pause.
Ordinary rehearsal, assisted or smaller returns cannot, uncertain passages keep
their own repair, and seven-day-overdue passages bypass that pause. The interface
shows recommended skill checks separately from raw passages available for return.

A workload of at least five representative checks, or three with the oldest a
week overdue, can recommend a resumable twenty-minute consolidation for up to
five passages. A saved consolidation check consumes that day's new recommendation;
unfinished plans can still resume and ordinary lessons always remain available.
This uses more actual visits rather than claiming the authored course's 1,600
minutes will service every return. The deterministic all-ready projection takes
152 visits/3,040 minutes and still ends with 98 raw passages due, 80 representative
checks due and an oldest overdue age of 18 days. This is synthetic scheduling
evidence, not a learner result or efficacy claim. [Audit fixes](audit-fixes.md)
records its assumptions and comparison.

The bank has 200 studies: the previous 176 are unchanged, and 24 add finite
variants of the three new preparations. Canon variants reorder the exact Bm/F#m
released placements, Mozart variants keep A4–E5 on fixed fingers in a new
quarter-note order, and blues variants reorder the known E7/A7/B7 chord-tone
lines and roots. They are bounded checks of those skills, not newly assigned
pieces or a claim that every passage has a transfer family.

The optional all-key reference is additional to that eight-unit inventory. It
adds all twelve major and minor tonics, natural/harmonic/classical melodic minor,
one- and two-octave hand progressions, root-position arpeggios, full contrary
motion and chromatic work. Pattern/range and key selection support short visits;
their shared review evidence does not create guided completion. Content sources
and exact scope are recorded in the modules and
[continuing scales guide](continuing-scales.md). Independently specified interval
tests verify actual sounding ranges, including melodic-minor descent. This is
content/software verification; physical fingering suitability still belongs in
the teacher review.

[Integration within the existing lessons](integrated-lessons.md) revises 23
visits and adds three focused preparations. The actual score determines which
scale fragment, chord shape or movement is useful. Canon bars 3–4 need specific
Bm/F♯m LH bass-to-chord travel; Mozart's melody needs a stationary A4–E5 position;
Switchyard needs E7/A7/B7 tones while retaining its written blues colours. Existing
preparations are placed closer to the other pieces they already support. No
additional pieces or units were added to justify covering every technical form.
Destination notation and source disclosures remain unchanged.

The audit corrected an overstatement in C Day 4 B. The chord worksheet is still
C–G–Am–F; its shapes are explicitly reordered to the piece's C–Am–F–G. Only the
first three LH preparation bars match exactly. Its G2–B2–C3 ending holds C3 for
two beats on 5–2–1, while *After the Rain* bar 4 uses G2–B2–D3–B2 quarters on
5–3–1–3. The destination block now begins by isolating that actual LH bar before
adding the melody. No existing score or saved identity was changed. Tests now
compare reused preparations with their named destination notes, rhythm and
register, and require the three new preparations to precede their named music.

Changed visits receive new plan identities. Saved original blocks, review context
or unfinished drafts normally retain the old plan; original reports never become
credit for new preparation. A completed revised plan counts the visit once and
leaves its earlier unfinished plan accessible through Resume earlier. A completed
original plan stays completed while a revision is only partial; partial versions
never combine into completion. Unfinished review/fresh-example drafts restore
their exact source, variant and score even if the current queue changes or is
empty, preserving the initial evidence separately from repair. Removed
experimental-unit reports retain readable titles in history.
Explicit chunk/ascent/round-trip reports, written bar scope,
hands and tempo still support technical self-checks; older logs do not acquire
invented complete-range evidence.

The active inventory is 637 exercises: 196 course exercises and 441 optional
technical setups. Inline written/listening checks give feedback separately from
practical self-assessments. There are 50 active questions; 15 historical
definitions remain recognized when reading saved answers. Note-reading answers
are checked against the rendered pitches, and audio interval/chord examples
against their sounding note data. Four new questions address Canon's placements,
Mozart's actual fixed fingers and the blues's written/heard D/D# contrast.
Known wrong answers return separately; same-day correction needs a later-date
correct answer. Answer-only reports record zero minutes and cannot change piano
readiness, practice days, guided completion or passage spacing.
Recording is not automatic assessment. Controller tests simulate permission and
codec lifecycle; live microphone capture and piano performance quality still
need a real-device check. Reference playback is synthesized, without a human
expressive interpretation.

Software agents inspected the scores and challenged each other's work. This
was not an independent piano teacher review. No learning outcomes, physical
technique, exact pacing or user enjoyment have been validated. The broad
published lesson topics are now mapped to actual instruction and practical
checks in our foundation program; [coverage evidence](piano-topic-coverage.md)
records that scope. This does not claim to reproduce every etude, workbook
activity, edition called Level 2, or later levels of the Bastien series.
