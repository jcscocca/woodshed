# Archive

Bass and accordion content, moved out of the app when Woodshed narrowed to
piano and guitar (see [docs/DIRECTION.md](../docs/DIRECTION.md)). Nothing here
is imported by `src/` or included in the build, and `npm test` doesn't run it.

| File | What it was |
|------|-------------|
| `seed-bass-accordion.js` | Instruments, colors, library items, Echo items and skill tracks cut from `src/seed.js` |
| `lessons/bass.js`, `lessons/accordion.js` | The lesson modules, moved unchanged from `src/lessons/` |
| `lessons/ear.js` | Bass and accordion Echo configs cut from `src/lessons/ear.js` |
| `audio/spectral.js` | The FFT spectral pitch detector the coach used for accordion, cut from `src/audio/dsp.js` |
| `audio/spectral.test.mjs` | Its tests, cut from `test/coach.test.mjs` (`node archive/audio/spectral.test.mjs`) |

The full four-instrument app, with all of this wired in, is at git tag
`four-instruments`. Wiring bass back in also needs its tuning and string
tables (`src/audio/notes.js`, `src/diagrams.jsx`) and the octave-up demo in
`src/LessonSheet.jsx`; the tag has them.
