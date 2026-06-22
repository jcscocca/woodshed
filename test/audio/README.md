# Audio tests

These verify the tuner/listener DSP (`src/audio/dsp.js`) against **real recorded
instrument audio**, not synthetic tones.

## Run
- `npm run test:audio` — the real-audio suite. Decodes rendered instrument
  recordings, runs the app's own pitch detector and onset/tempo tracker on them,
  and checks them against ground truth, with [`pitchfinder`](https://github.com/peterkhayes/pitchfinder)
  (YIN/AMDF) as an independent oracle. Needs fixtures (below).
- `npm run test:smoke` — a fast synthetic sanity check (no fixtures). Catches
  gross breakage only; **not** a substitute for the real-audio suite.

## Generate fixtures (once)
Recordings are rendered locally from MIDI using real instrument samples, so they
aren't committed. Prerequisites:
- **timidity** with a GM soundfont — macOS: `brew install timidity`; Debian/Ubuntu:
  `apt-get install timidity freepats`.
- **Python `mido`** — `pip install mido`.

Then:
```
npm run fixtures      # writes test/audio/fixtures/*.wav
```

## Boundaries (what this does NOT cover)
- The **live microphone path** — real mic, auto-gain, room noise, latency, the
  animation-frame cadence. The next step there is a headless-browser E2E that
  replays a WAV through `getUserMedia` (Chrome's `--use-file-for-fake-audio-capture`).
- These fixtures are rendered from real instrument *samples* (FluidR3). For higher
  fidelity, drop genuine field recordings (e.g. the University of Iowa MIS set)
  into `fixtures/` with matching names.
