#!/usr/bin/env bash
# Render the audio test fixtures from MIDI using real instrument samples (timidity).
set -euo pipefail
cd "$(dirname "$0")"
command -v timidity >/dev/null || { echo "timidity not found — install it (macOS: 'brew install timidity', Debian/Ubuntu: 'apt-get install timidity freepats')."; exit 1; }
command -v python3 >/dev/null || { echo "python3 not found."; exit 1; }
python3 -c "import mido" 2>/dev/null || { echo "Python package 'mido' not found — 'pip install mido'."; exit 1; }
python3 generate-fixtures.py
for f in fixtures/*.mid; do timidity "$f" -Ow -s 44100 -o "${f%.mid}.wav" --quiet=2 >/dev/null; done
rm -f fixtures/*.mid
echo "Rendered $(ls fixtures/*.wav | wc -l | tr -d ' ') fixtures into test/audio/fixtures/"
