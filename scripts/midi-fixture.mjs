// A reference MIDI -> test/fixtures/pieces/<lessonId>.json: every note-on as [beat, midi],
// beats in quarter notes from 0. --keep a-b,c-d keeps those beat ranges back to back (how
// dropped repeats are handled); --shift n adds n beats (how a padded pickup is handled).
// node scripts/midi-fixture.mjs <file.mid> <lessonId> [--keep a-b,c-d] [--shift n] [--source "<label>|<url>"]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [file, id, ...rest] = process.argv.slice(2);
if (!file || !id) {
  console.error('usage: node scripts/midi-fixture.mjs <file.mid> <lessonId> [--keep a-b,c-d] [--shift n] [--source "<label>|<url>"]');
  process.exit(1);
}
const opt = (name) => { const i = rest.indexOf(`--${name}`); return i < 0 ? undefined : rest[i + 1]; };

// Standard MIDI File: MThd, then MTrk chunks of delta-timed events.
const buf = readFileSync(file);
let p = 0;
const str = (n) => buf.toString("latin1", p, (p += n));
const int = (n) => { let v = 0; while (n--) v = v * 256 + buf[p++]; return v; };
const vlq = () => { let v = 0, b; do { b = buf[p++]; v = v * 128 + (b & 127); } while (b & 128); return v; };
if (str(4) !== "MThd") throw new Error(`${file}: not a Standard MIDI File`);
const headerEnd = int(4) + p, format = int(2), tracks = int(2), division = int(2);
if (division & 0x8000) throw new Error(`${file}: SMPTE time division is not supported`);
p = headerEnd;
const notes = [];
for (let t = 0; t < tracks && p < buf.length; ) {
  const type = str(4), end = int(4) + p;
  if (type === "MTrk") {
    t++;
    let tick = 0, status = 0;
    while (p < end) {
      tick += vlq();
      const s = buf[p] & 0x80 ? buf[p++] : status;
      if (s === 0xff) { p++; const n = vlq(); p += n; }
      else if (s === 0xf0 || s === 0xf7) { const n = vlq(); p += n; }
      else if (s & 0x80) {
        status = s;
        const kind = s >> 4, note = buf[p++], vel = kind === 0xc || kind === 0xd ? 0 : buf[p++];
        if (kind === 0x9 && vel > 0) notes.push([tick / division, note]);
      } else throw new Error(`${file}: running status with no status, track ${t}`);
    }
  }
  p = end;
}

let onsets = notes;
if (opt("keep")) {
  let at = 0;
  onsets = opt("keep").split(",").flatMap((range) => {
    const [a, b] = range.split("-").map(Number), kept = notes.filter(([beat]) => beat >= a && beat < b).map(([beat, m]) => [beat - a + at, m]);
    at += b - a;
    return kept;
  });
}
const shift = Number(opt("shift") || 0), round = (x) => Math.round(x * 1000) / 1000;
onsets = onsets.map(([beat, m]) => [round(beat + shift), m]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);

// Re-running keeps the deviations (and source, unless given) already written by hand.
const dir = new URL("../test/fixtures/pieces/", import.meta.url), out = new URL(`${id}.json`, dir);
const old = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
const [label = "", url = ""] = (opt("source") || "").split("|");
const source = opt("source") || !old.source ? { label, url } : old.source;
const fixture = { id, source, onsets, deviations: old.deviations || [] };
mkdirSync(dir, { recursive: true });
writeFileSync(out, JSON.stringify(fixture, null, 2).replace(/\[\s+(-?[\d.]+),\s+(\d+)\s+\]/g, "[$1, $2]") + "\n");
console.log(`${fileURLToPath(out)}: ${onsets.length} onsets, the last at beat ${onsets.length ? onsets.at(-1)[0] : 0} (format ${format}, ${tracks} tracks, ${division} ticks a quarter)`);
