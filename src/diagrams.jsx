import React from "react";

const STRING_COUNT = { guitar: 6 };

// Open-position chord box: nut + 4 frets. strings low->high; fret #, 0, or "x".
export function ChordDiagram({ instrument = "guitar", strings, name, fingers }) {
  const n = strings.length;
  const W = 16, top = 18, fretH = 13, rows = 4, left = 9;
  const width = left * 2 + (n - 1) * W, height = top + rows * fretH + 6;
  const xs = strings.map((_, i) => left + i * W);
  const gridR = left + (n - 1) * W;
  return (
    <figure className="ws-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`${name || "Chord"} diagram`}>
        {xs.map((x, i) => <line key={`s${i}`} x1={x} y1={top} x2={x} y2={top + rows * fretH} className="ws-dg-line" />)}
        <line x1={left} y1={top} x2={gridR} y2={top} className="ws-dg-nut" />
        {Array.from({ length: rows }).map((_, r) => <line key={`f${r}`} x1={left} y1={top + (r + 1) * fretH} x2={gridR} y2={top + (r + 1) * fretH} className="ws-dg-line" />)}
        {strings.map((fret, i) => {
          const x = xs[i];
          if (fret === "x") return <text key={i} x={x} y={top - 5} className="ws-dg-mark" textAnchor="middle">×</text>;
          if (fret === 0) return <text key={i} x={x} y={top - 5} className="ws-dg-mark" textAnchor="middle">○</text>;
          const cy = top + (fret - 0.5) * fretH;
          return (
            <g key={i}>
              <circle cx={x} cy={cy} r={5} className="ws-dg-dot" />
              {fingers && fingers[i] ? <text x={x} y={cy + 3} className="ws-dg-finger" textAnchor="middle">{fingers[i]}</text> : null}
            </g>
          );
        })}
      </svg>
      {name && <figcaption className="ws-dg-name mono">{name}</figcaption>}
    </figure>
  );
}

// Scale/box pattern across baseFret..baseFret+4. dots: {string, fret} absolute.
export function FretboardPattern({ instrument = "guitar", baseFret = 1, dots }) {
  const n = STRING_COUNT[instrument];
  const W = 16, top = 20, fretH = 13, rows = 5, left = 20;
  const width = left + 8 + (n - 1) * W, height = top + rows * fretH + 6;
  const xs = Array.from({ length: n }, (_, i) => left + i * W);
  const gridR = left + (n - 1) * W;
  return (
    <figure className="ws-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`Scale pattern at fret ${baseFret}`}>
        {xs.map((x, i) => <line key={`s${i}`} x1={x} y1={top} x2={x} y2={top + rows * fretH} className="ws-dg-line" />)}
        {Array.from({ length: rows + 1 }).map((_, r) => <line key={`f${r}`} x1={left} y1={top + r * fretH} x2={gridR} y2={top + r * fretH} className="ws-dg-line" />)}
        <text x={left - 6} y={top + fretH - 3} className="ws-dg-fret mono" textAnchor="end">{baseFret}</text>
        {dots.map((d, i) => (
          <circle key={i} cx={xs[d.string]} cy={top + (d.fret - baseFret + 0.5) * fretH} r={5} className="ws-dg-dot" />
        ))}
      </svg>
    </figure>
  );
}

const BLACK = [1, 3, 6, 8, 10];
const isBlack = (m) => BLACK.includes(((m % 12) + 12) % 12);

// Piano keys from low to high MIDI, widened to whole white keys and at least
// eight of them. keys: {midi, hand: "R"|"L", fingers}; a key both hands play shows both.
export function PianoKeys({ low, high, keys, label = "Keyboard diagram" }) {
  let lo = isBlack(low) ? low - 1 : low, hi = isBlack(high) ? high + 1 : high;
  const whiteCount = () => { let n = 0; for (let m = lo; m <= hi; m++) if (!isBlack(m)) n++; return n; };
  for (let grow = 0; whiteCount() < 8; grow++) if (grow % 2) do lo--; while (isBlack(lo)); else do hi++; while (isBlack(hi));
  const W = 24, H = 96, BW = 14, BH = 60, pad = 2, labelH = 14;
  const whites = [], blacks = [];
  for (let m = lo; m <= hi; m++) (isBlack(m) ? blacks : whites).push(m);
  const x = new Map();
  whites.forEach((m, i) => x.set(m, pad + i * W));
  blacks.forEach((m) => x.set(m, x.get(m - 1) + W - BW / 2));
  const at = new Map();
  for (const k of keys) { const e = at.get(k.midi) || at.set(k.midi, {}).get(k.midi); e[k.hand] = k.fingers || []; }
  const width = whites.length * W + pad * 2, height = H + pad + labelH;
  const key = (m, black) => {
    const e = at.get(m), w = black ? BW : W, h = black ? BH : H, base = black ? "ws-kb-black" : "ws-kb-white";
    const lines = e ? ["R", "L"].filter((hand) => e[hand]?.length).map((hand) => ({ hand, text: e[hand].join("/") })) : [];
    return (
      <g key={m}>
        <rect x={x.get(m)} y={pad} width={w} height={h} rx={2} className={`${base} ${e?.R ? "lit" : e?.L ? "lit lh" : ""}`} />
        {e?.R && e?.L && <rect x={x.get(m)} y={pad + h / 2} width={w} height={h / 2} rx={2} className={`${base} lit lh`} />}
        {lines.map((line, i) => (
          <text key={line.hand} x={x.get(m) + w / 2} y={pad + h - 8 - (lines.length - 1 - i) * 14} className="ws-kb-finger" textAnchor="middle">{line.text}</text>
        ))}
      </g>
    );
  };
  return (
    <figure className="ws-diagram ws-kb">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: whites.length * 34 }} role="img" aria-label={label}>
        {whites.map((m) => key(m, false))}
        {blacks.map((m) => key(m, true))}
        {whites.filter((m) => m % 12 === 0).map((m) => <text key={`c${m}`} x={x.get(m) + W / 2} y={height - 2} className={`ws-kb-c ${m === 60 ? "mid" : ""}`} textAnchor="middle">C{m / 12 - 1}</text>)}
      </svg>
    </figure>
  );
}

const NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Piano keyboard spanning `notes` ({name, octave}, naturals), highlighting them.
export function Keyboard({ notes, fingers }) {
  const midis = notes.map((n) => 12 * (n.octave + 1) + NATURAL[n.name]);
  const keys = midis.map((midi, i) => ({ midi, hand: "R", fingers: fingers && fingers[i] ? [fingers[i]] : [] }));
  return <PianoKeys low={Math.min(...midis)} high={Math.max(...midis)} keys={keys} />;
}
