#!/usr/bin/env python3
"""Generate MIDI for the audio test fixtures. Rendered to WAV by render-fixtures.sh.
Requires: pip install mido"""
import mido, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")
os.makedirs(OUT, exist_ok=True)

def note_midi(name, program, note):
    m = mido.MidiFile(ticks_per_beat=480); t = mido.MidiTrack(); m.tracks.append(t)
    t.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(120)))
    t.append(mido.Message("program_change", program=program, time=0))
    t.append(mido.Message("note_on", note=note, velocity=100, time=0))
    t.append(mido.Message("note_off", note=note, velocity=0, time=480 * 4))  # ~2s
    m.save(os.path.join(OUT, name + ".mid"))

def drum_midi(name, bpm, secs=6):
    m = mido.MidiFile(ticks_per_beat=480); t = mido.MidiTrack(); m.tracks.append(t)
    t.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(bpm)))
    for _ in range(int(bpm / 60 * secs)):
        t.append(mido.Message("note_on", channel=9, note=36, velocity=115, time=0))
        t.append(mido.Message("note_off", channel=9, note=36, velocity=0, time=480))
    m.save(os.path.join(OUT, name + ".mid"))

# (name, GM program, MIDI note)
for name, prog, note in [("piano_A4", 0, 69), ("piano_C4", 0, 60), ("violin_A4", 40, 69),
                         ("flute_A4", 73, 69), ("acguitar_E2", 25, 40), ("acguitar_E4", 25, 64)]:
    note_midi(name, prog, note)
for bpm in (90, 120, 144):
    drum_midi(f"drum_{bpm}", bpm)
print("Wrote MIDI for", len([f for f in os.listdir(OUT) if f.endswith(".mid")]), "fixtures")
