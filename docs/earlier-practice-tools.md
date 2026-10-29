# Earlier practice tools

This reference preserves usage details for Woodshed's earlier piano/guitar
library, MIDI scoring and song tools. They are optional alongside the guided
piano course and retain their own progress/grading rules. They do not change the
course's learner-reported readiness into a measured piano score.

Open **Catalogue → Browse repertoire tracks** for the earlier tracks, or
**Catalogue → Open exercise library** for individual exercises, the sight-reading
drill and Your song. Use **Back to catalogue** to return. References below to
Library or tracks mean these embedded earlier views; there is no separate Today
page in the current primary navigation.

## Piano keyboard connection

The desktop MIDI band provides **Connect keyboard**. Enable piano under
**Settings → Earlier practice settings → Earlier rotation instruments** if
needed. Connect a USB-MIDI keyboard and grant the browser's MIDI permission.
Chrome/Edge are the intended earlier MIDI browsers; actual browser/hardware
acceptance is tracked separately in the [release matrix](release-readiness.md).
The guided core works without this connection.

After connecting, the band displays all 88 keys, with velocity reflected in
brightness. Its readout names recognized chords and their note spellings or
lists the held note names. Disconnecting/reconnecting updates the band; subsequent
launches can reconnect when the browser retains permission. The chevron collapses
the band to a thin bar.

**Play back** replays the latest phrase, separated by a three-second pause, from
a 60-second in-memory take buffer. Nothing in that buffer is saved to history.
The app does not sound your live MIDI notes through the speakers; the instrument
provides its own sound. App audio is for demonstrations and phrase playback.

Open an earlier piano lesson with note targets to see those notes/finger numbers
on the band. **Coach me** checks MIDI note targets: single-note sequences, rolled
chords in strike order, and the authored hands-together scale targets. Wrong
notes do not advance a waiting target. Results can include accuracy, timing and
per-hand touch observations; these belong to the earlier MIDI tools. Without a
keyboard, the lesson offers connection guidance rather than mic fallback.

Earlier piano **Echo** uses MIDI for interval/phrase responses. The band stays
dark during the prompt so it cannot display the answer, then reveals afterward.
Guitar mic coaching and guitar Echo remain disabled behind `COACH_ENABLED`.

## Reading and playing an earlier score

Open a scored piece, pop stage or sight-reading drill from Catalogue's earlier
views. On desktop it uses the main pane as a grand staff, with the rail holding
its controls. A temporary **Score** navigation entry (**6**) returns to it.

1. Choose a section preset such as **A**, **B** or **all**, or click a note in a
   bar to set the passage. Shift-click sets its far end. Other bars dim without
   changing the score's layout.
2. Choose **Hands** for right, left or both. The unused staff dims and its notes
   are excluded from the selected MIDI task.
3. In **Wait mode**, the score waits for the target note/chord; wrong pitches
   flash without advancing. Use this to locate notes before adding timing.
4. In **Play-along**, a one-bar click count-in starts a timed run. Notes are
   marked on time, early, late, missed or wrong. The end summary reports note
   accuracy, rhythm accuracy, extra notes and bars to revisit.
5. A clean earlier scored pass uses the implemented thresholds of 90% notes and
   80% rhythm to offer the section's tempo ladder, increasing by 4 bpm toward
   the authored target. These are tool thresholds, not validated mastery criteria.
   **Log it** records minutes and the earlier score's accuracy/rhythm, passage
   and tempo. The section's ladder is remembered separately.

During a timed play-along, the run owns tempo and competing rail controls lock.
Stop before changing passage, hands or tempo. The guided lesson's newer
score-size/first-return controls are a separate player; do not assume its
self-reported assessments are calculated from this grading engine.

## Repertoire tracks

The earlier piano tracks contain 22 scored stages:

| Track | Material and approach |
|---|---|
| Pieces — 8 stages | Petzold minuets/musette, Schumann Album for the Young selections, Burgmüller studies and a Clementi sonatina movement; work in sections, hands separately then together. |
| Pop from chords — 8 stages | Block/close chords, ballad bass, syncopation, doo-wop arpeggio, twelve-bar blues and public-domain Ode to Joy/Amazing Grace lead sheets. |
| Two-Hand Coordination — 6 stages | Five-finger patterns, contrary motion, scales, Hanon No. 1, cadences and arpeggios. |

Each track shows completed stages, the current stage and later locked stages.
**Mark complete** advances the earlier track; reopening a stage restores it for
work. These track markers are separate from the guided unit/session checklist.

Pieces cite their editions inside the lesson. Six earlier transcriptions use
Mutopia public-domain editions; the two Schumann editions use Mutopia CC BY-SA
2.5 material. The compositions and particular editions have separate provenance;
retain the displayed source/license notes when reusing a transcription.
The guided course's separate source decisions are in
[piano-curriculum-evidence.md](piano-curriculum-evidence.md).

## Chord charts and Your song

An earlier chord-chart lesson expands a key, metre, chord line and accompaniment
pattern into a written two-voice score. Available patterns include block,
voice-led, ballad, pulse, arpeggio, boogie and waltz. Charts use the same earlier
wait/play-along grading as a scored piece.

Open **Your song** in the exercise library to enter chords for a song you know:

```text
C | G | Am | F
Dm | G7 | C | C
```

A line break also marks a bar boundary. Choose a key, metre and pattern, check
the generated score, then work a small passage. Supported symbol shapes include
`C`, `Cm`, `C7`, `Cmaj7`, `Cm7`, `Csus2`, `Csus4`, `Cdim` and slash bass such as
`C/E`; transpose the root spelling as needed. Save multiple songs; each retains
its own tempo. The editor creates chord accompaniments, not a transcription of
a copyrighted melody. Check the generated bass/register before playing.

## Sight-reading drill

The earlier sight-reading drill generates examples across ten levels, ranging
from one hand in C to hands together, sharp/flat keys and chromatic neighbours.
**N** requests a new generated drill. Three clean runs in a row offer **Level
up →**; the learner chooses whether to accept. A repeated/generated phrase is
not evidence of an unheard first reading; distinguish first looks from practice.

## Exercise editing and earlier history

In **Catalogue → Open exercise library**, select an exercise to rename it,
change its difficulty label or listed length, add a resource link, or hide it from
rotation. Custom entries can also be deleted. **+ Add** creates a personal
exercise. The editing sheet shows recent earlier activity and tempo.

Earlier lesson **Learn** opens its instructions, diagrams where authored and
**Hear it** demo. These demos are oscillator-based examples derived from lesson
shapes; they are not expressive recordings of a pianist.

Earlier logs include minutes, how it felt and an optional BPM, prefilled from
the metronome or previous report where applicable. In **Progress → Earlier
practice history**, edit/remove earlier reports, inspect streak, minutes and
instrument totals, and view earlier tempo trends. That history's weekly goal and
rotation settings are inside Settings' explicitly labelled earlier section.
They do not change the guided course's 20-minute plan or 200-minute weekly target.

## Desktop keyboard reference

Typing fields and dialogs suppress global app shortcuts. A keyboard-focused
button retains native Space activation. Some actions require a connected MIDI
keyboard or an open earlier scored item.

| Key | Earlier-tool action |
|---|---|
| K | Show/hide the connected keyboard band. |
| P | Play back the connected keyboard's last phrase. |
| C | Start/stop the open earlier MIDI coach run. |
| W | Switch earlier score wait/play-along mode. |
| H | Cycle score hands. |
| N | Generate a new sight-reading drill. |
| [ / ] | Previous/next score section. |
| 6 | Return to the open earlier score. |
| ↑ / ↓ | Scroll the score view. |
| Space | Stop a live timed score run; otherwise the active guided lesson or standalone metronome owns the shortcut. |
| Esc | Stop an earlier score run first; a later press closes the score. |
| T / ← / → | Tap/nudge standalone tempo; locked during an earlier timed run. |
| S / ? | Toggle the stopwatch / open full keyboard help. |

Use the in-app help for the currently active context; the five primary section
shortcuts remain **1–5** for Guided Practice, Chords, Scales, Catalogue and
Progress.

## Tuner and audio limits

The tuner is a microphone-based single-note beta tool, useful for a clearly
sounding string or monophonic note. It is not intended for chord detection.
Microphone permission, room noise, auto-gain and actual latency need a physical
device test. Denying access does not prevent using core guided lessons.

The DSP smoke and optional recorded-audio suites check the detector separately
from that live browser microphone path. For fixture instructions see
[the audio test README](../test/audio/README.md). Neither those tests nor MIDI
simulations establish the behavior of a particular physical instrument/browser.
