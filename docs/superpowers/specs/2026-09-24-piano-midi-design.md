# Piano over MIDI — Design

**Date:** 2026-09-24
**Status:** Approved design, pending implementation plan
**Direction:** [docs/DIRECTION.md](../../DIRECTION.md) — step 4, "Piano over MIDI"; the pitch-coach rethink for piano happens here.
**Builds on:** [2026-09-23-desktop-layout-design.md](2026-09-23-desktop-layout-design.md) (three-pane desktop layout, practice rail, shortcuts).
**UI review:** the placement below is a second-opinion revision of the first proposal (measured against the running app at 1440×900) and was approved as revised.

## Problem

The owner practices at a computer with a digital piano connected over USB-MIDI.
Woodshed only hears the piano through a microphone, and the pitch coach built on
that was disabled for being unreliable. MIDI delivers exactly what the mic had to
guess — which key, when, how hard — plus real chords.

## Goal

A piano-only MIDI input path that powers five features: a live keyboard view,
chord naming, play-back of what you just played, lesson grading ("Coach me"),
and Echo ear training — on the desktop layout, in Chrome/Edge.

## Decisions

| Decision | Choice |
|---|---|
| Scope | Piano only. Guitar code and the mic coach are untouched; `COACH_ENABLED` (mic) stays `false`. |
| Architecture | One shared MIDI layer in `src/midi/`: pure model + pure connection manager + thin React provider; features subscribe to it. |
| Phases | **Phase 1:** MIDI layer, keyboard band, chord naming, play-back. **Phase 2:** coaching and Echo over MIDI. |
| No keyboard connected | Piano coaching and Echo are hidden; a one-line "Connect your keyboard to coach this" takes their place. No mic fallback. |
| Platform | Desktop layout only (≥1024px). Phone layout gets no MIDI UI. Web MIDI = Chrome/Edge. |
| Recording | No record button. An always-on in-memory 60 s buffer; **Play back** replays the last take. Nothing is saved to storage. |
| Sound | The app never sounds live MIDI input (the piano makes its own sound). App audio = lesson demos and play-back only. |

## Non-goals

Guitar/mic coaching; phone MIDI UI; MIDI output; notation; timing scored against
the metronome click; automatic practice-time tracking; saving takes.

**Deferred:** lighting keys during Hear it / play-back; demos through the
piano's own voice (MIDI out); a focus mode; click-relative timing; a 61-key band
for 1024–1279px windows (only if the real monitor is that narrow).

---

## 1. Placement (desktop, piano enabled)

```
┌──────────┬──────────────────────────────────┬──────────────────┐
│ Woodshed │ TODAY'S SET                      │ ●●●●   90 bpm    │
│ streak   │ ┌────────┐ ┌────────┐            │ [−][ Start ][+]  │
│ ▸ Today  │ │ card   │ │ card ◐ │            │ Tap · 2/4 3/4 4/4│
│   Tracks │ └────────┘ └────────┘            │ ⏱ 00:00 [▶][↺] Tuner
│   Library│ [Done — log it] [Shuffle]        ├──────────────────┤
│  Progress│                                  │ LESSON         ✕ │
│          │                                  │ Major scales…    │
│          │                                  │ [● Coach me][▶ Hear it]
│ ⚙ Settings                                  │ 1. Right hand…   │
├──────────┴──────────────────────────────────┼──────────────────┤
│ C1   C2   C3   C4·  C5   C6   C7   (88 keys)│ Cmaj7      (40px)│
│ ▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯▯ │ C E G B          │
│                                             │ [▶ Play back] ● P-125 ⌃ │
└─────────────────────────────────────────────┴──────────────────┘
```

- **The band** is a second grid row on `.ws-desk`
  (`grid-template-rows: minmax(0,1fr) auto`) spanning all columns
  (`grid-column: 1 / -1`). Inside, its own grid `minmax(0,1fr) 380px` puts the
  keys on the left and the **readout** under the rail. Expanded height 128px,
  collapsed 32px. `--bg2` background, `border-top: 1px solid var(--line)`.
  Class names: `.ws-midi-band`, `.ws-midi-keys`, `.ws-midi-readout`
  (`.ws-strip` and `.ws-keys` are taken).
- **Keys:** fixed 88 keys (A0–C8), never zoomed or scrolled, so C4 is always in
  the same place (~20px per white key at 1440 wide, ~30px at 1920). White
  96px / black 58px tall; colors as the lesson diagram (`#d8d0c0` / `#211e1a`).
  C labels in mono 10px; C4's label in `--gold-dim`.
  - Held key: gold mixed by velocity — `color-mix(in srgb, var(--gold) X%, <key color>)`,
    X from 45 (soft) to 100 (hard).
  - Lesson targets: 2px inset `--gold-dim` outline with the finger numeral
    (mono 11px) where the shape has fingering; the next target pulses (the
    `ws-coach-pulse` rhythm); hit → `rgba(95,168,160,.35)`; miss →
    `rgba(224,120,86,.3)`.
  - Lesson range: a `rgba(227,169,72,.06)` band behind the keys from the
    lowest to highest target.
- **Readout** (380px, under the rail), Bricolage 700 40px headline + mono 12.5px line:
  - free play: chord name (or held note names), notes line, `▶ Play back`, `● <device>`, collapse chevron;
  - coach, single notes: next target (`F · 1` = note · finger) and `6 / 15`;
  - coach, chords: the target chord's name, held notes beneath;
  - Echo: `listen…` → `play it back · 3/5` → `78%`;
  - collapsed (32px): one line `● P-125 · Cmaj7 · [▶] [⌃]`.
- **States:** piano disabled → no band and no MIDI request. Web MIDI
  unsupported → no band; piano lessons show "MIDI needs Chrome or Edge" where
  Coach me would be. Never connected → collapsed bar with `[Connect keyboard]`.
  Disconnected → collapsed bar `○ Keyboard disconnected`.
- **Rail changes (desktop only):** the stopwatch becomes one row
  (`⏱ 00:00 [▶][↺]`) with the Tuner button beside it and its note line dropped
  (≈160px freed, so the coach panel sits above the band at 900px tall). While the
  band is expanded, a piano lesson's small Keyboard diagram is hidden — the band
  shows its notes and fingers instead. Coach me and Hear it share one row. The
  phone layout is unchanged.

## 2. The MIDI layer (`src/midi/`)

- **`midiModel.js`** (pure, node-tested):
  - `parseMidi(bytes, t, inputId)` → `{ type: "on" | "off" | "pedal", note, velocity, down, t, inputId }`
    or `null`. Note-on with velocity 0 is an off. All channels merged. Sustain =
    CC 64 (`down` when value ≥ 64).
  - `createKeyState()` — held keys (`note → { velocity, t }`, physically held
    only; the pedal never counts as held), pedal state, note-offs matched per
    `(inputId, note)`.
  - Note events for grading in the coach's existing shape:
    `{ midi, name, octave, tStart, peak }`, `peak = velocity / 127`.
  - `groupChords(events, windowMs = 60)` → chord events `{ midis, tStart, peaks }`
    from onsets within 60ms of the first.
  - `nameChord(midis)` → string or `null`. Triads (maj, m, dim, aug, sus2,
    sus4), 6 and m6, sevenths (maj7, 7, m7, m7♭5, dim7, m(maj7)); shell voicings
    (root–3–7, no 5th) named with a "shell" suffix; slash chords when the lowest
    note isn't the root (`C/E`); ambiguous sets resolve toward the lowest note as
    root (C–E–G–A with C lowest = `C6`, with A lowest = `Am7`); unrecognized →
    `null` (the readout shows note names). Uses held keys only.
  - `createTakeBuffer({ windowMs = 60000, gapMs = 3000 })` — records raw
    on/off/pedal events, drops those older than 60s; `lastTake()` returns the
    notes since the last ≥3s gap with no keys held, as
    `[{ midi, t0, dur, velocity }]` with durations extended by the pedal.
- **`connection.js`** (pure, tested with a fake MIDIAccess):
  `createMidiConnection({ requestAccess, queryPermission })` → `connect()`
  (from a user gesture), `autoConnect()` (silent when permission is already
  `granted`), `onMessage(fn)`, `onStatus(fn)`, status
  `unsupported | idle | connected | disconnected | denied`, `deviceName`. Follows
  `statechange` for plug/unplug; listens on every input.
- **Dev-only simulator:** in development builds (`import.meta.env.DEV`),
  `window.__fakeMidi` supplies a fake MIDIAccess with `press(note, velocity)`,
  `release(note)`, `pedal(down)`, `unplug()` so the UI can be checked without
  hardware. It lives in its own module (`midi/fakeMidi.js`) imported only by the
  provider behind the DEV check, so node-tested modules never touch
  `import.meta.env`. Stripped from production builds.
- **`MidiProvider.jsx`** (thin): mounted only when piano is enabled. Context
  value holds only rarely-changing things — `status`, `deviceName`, `connect()`,
  `subscribe(fn)`, `playLastTake()`, band open/closed — so a fast passage
  re-renders only the band and readout (which keep their own held-key state via
  `subscribe`), never the App.
- **Lesson overlay store** (`midi/overlay.js`, tiny subscribable store): the
  open piano lesson publishes its targets (midi, finger) and range; during a
  run, the coach or Echo panel publishes statuses, the next index, the readout
  text and a `busy` flag. The band and readout subscribe. Keeps coaching state
  out of App.
- **Play-back:** a new `playTake(notes)` in `src/lessonAudio.js`, reusing that
  module's AudioContext with a velocity-scaled pluck; calls `stop()` first, as
  `playChords`/`playSequence` do.
- **Isolation:** only `src/midi/`, the band/readout components, the piano
  coach/Echo wiring (phase 2) and `playTake` know MIDI exists. Timing uses MIDI
  event timestamps (same clock as `performance.now()`).

## 3. Phase 2 — coaching and Echo over MIDI

- **Gate:** the piano coach and Echo render only for piano items while the
  keyboard is connected. `COACH_ENABLED` (mic) stays `false`.
- **Input:** `useMidiCoach({ mode, targets, octaveStrict })` returns the same
  `{ listening, error, result, start, stop, reset }` as `useCoach`. Each note-on
  is one event (no stabilizer). CoachPanel/EarPanel mount with
  `key={source}` so a source change remounts rather than swapping hooks. Unplug
  mid-run stops the run with "Keyboard disconnected"; unmount (lesson closed,
  Esc) unsubscribes.
- **Grading** (pure, in `coach.js`; existing graders unchanged):
  - single-note lines (scales, Hanon, five-finger): `gradeLine`, octave-strict;
  - chords as played: new `gradeChords(targets, chordEvents)` — each target is a
    note set; a played chord (onsets within 60ms) is caught when the sets match
    exactly, otherwise missed with its missing/extra notes listed. Keyboard
    shapes with `play: "block"` use it over MIDI;
  - hands together: keyboard shapes may set `hands: "together"` — each right-hand
    note pairs with the same note an octave lower as a two-note target, graded by
    `gradeChords`. Enabled on **pno-scales** and **trk-pno-3**;
  - timing: existing `evenness`; touch: new `touchEvenness(events)` from
    velocities — a soft summary note ("even touch / a little uneven"), never
    scored;
  - coached accuracy logs as today and feeds the accuracy trend and the
    track-advance check.
- **Echo (piano):** the piano Echo items (`pno-ear-int`, `pno-ear-phr`) return:
  `SEED` includes `ECHO_SEED` items whose `inst` is piano, and `migrate()` drops
  only the guitar Echo ids while `COACH_ENABLED` is `false`. EarPanel uses
  `useMidiCoach` for piano. Rounds stay octave-forgiving. Without a keyboard,
  the lesson shows the connect note instead of "Train your ear".
- **Feedback:** band (targets, pulse, hit/miss), readout (next target, progress,
  Echo phase), rail (Coach me, summary, Log it — unchanged flow).

## 4. Interaction rules

1. **Shortcuts** (added to `actionFor`, behind its typing/dialog guards):
   **K** collapse/expand the band, **P** play back, **C** start/stop the open
   lesson's coach run (C arrives with phase 2). `KEY_HELP` lists them. No
   conflicts with Space/T/←→/S/1–4/L/Esc/?. All three are no-ops when no
   keyboard is connected.
2. **P** is a no-op while `busy` (an Echo prompt or listen phase, or a coach run
   listening).
3. **Echo prompts never light the band**; the reveal lights the targets.
4. **Play-back and Hear it** share `lessonAudio` and stop each other.
5. **Space** keeps toggling the metronome during a run (intended).
6. **Coach start** expands a collapsed band; a finished run scrolls the rail
   summary into view. Nothing else auto-scrolls.
7. **Accessibility:** the band is one SVG `role="img"` with a summarizing label
   (not 88 buttons); the readout is `aria-live="polite"` and announces chord
   names and coach phases only, never every note.
8. **Connection:** the first connect needs the button (permission prompt);
   later launches connect silently and fall back to the button if permission
   was revoked. Plug/unplug expands/collapses the band.

## 5. Testing

- **Unit (node):** `test/midi.test.mjs` — parsing (incl. velocity-0 off,
  pedal), per-input note-off, held keys vs pedal, chord grouping at the 60ms
  edge, take buffer (60s window, 3s split, pedal-extended durations);
  `nameChord` table (~30 cases: triads and sevenths in several keys,
  inversions as slash chords, shells, C6/Am7 by lowest note, unknown → `null`);
  `connection.js` with a fake MIDIAccess (connect, silent reconnect, plug/unplug,
  denied, unsupported); shortcuts K/P/C and their guards.
  Phase 2: `test/coach.test.mjs` — `gradeChords` (clean, missing, extra,
  rolled inside/outside 60ms), hands-together targets, `touchEvenness`,
  MIDI-shaped events through `gradeLine`/`gradeArpeggio`; `test/ear.test.mjs` —
  piano Echo items present, guitar ones absent.
- **Browser (dev build, `window.__fakeMidi`):** band lights by velocity; chord
  name in the readout; K collapse; not-connected bar and Connect; P play-back
  and its no-op during Echo; a coach run (pulse, hit/miss, readout progress,
  summary, Log it records accuracy); block and hands-together grading; an Echo
  round with a dark band during the prompt; unplug mid-run; phone layout shows
  no MIDI UI; piano disabled → no band and no MIDI request.
- **Owner at the piano** (end of each phase): connect; name a few known chords;
  play and Play back; coach a scale with one deliberate wrong note; one Echo
  round; pull the cable mid-run.
- **Gate:** `npm test` and `npm run build` pass on every commit.

## Acceptance criteria

**Phase 1**
1. With piano enabled on desktop, a Connect button requests MIDI; later launches reconnect without a prompt.
2. The band shows all 88 keys; held keys light by velocity; the readout names held chords per §2 and shows note names otherwise.
3. Play back (button or P) replays the last take; K collapses/expands the band.
4. Plug/unplug updates the band live; piano disabled → no band and no MIDI request; phone layout unchanged.
5. The rail's compact stopwatch row frees space; a piano lesson's notes and fingers appear on the band.

**Phase 2**
6. With the keyboard connected, piano lessons with notes offer Coach me; without it, the connect note shows and the mic is never used for piano.
7. Single-note, block-chord and hands-together lessons grade exactly; the summary includes timing and touch evenness; accuracy logs as before.
8. Piano Echo rounds work over MIDI; prompts never light the band; guitar Echo stays off.
9. Unplugging mid-run stops cleanly with a message; closing the lesson mid-run leaves no listener behind.
