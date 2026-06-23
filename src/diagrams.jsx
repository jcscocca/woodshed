import React from "react";

const idxInOct = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const WHITE = ["C", "D", "E", "F", "G", "A", "B"];
const STRING_COUNT = { guitar: 6, bass: 4 };

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

// Piano keyboard spanning the natural-note range of `notes`, highlighting them.
export function Keyboard({ notes, fingers }) {
  const whiteAbs = (note) => note.octave * 7 + idxInOct[note.name];
  const absList = notes.map(whiteAbs);
  const minA = Math.min(...absList), maxA = Math.max(...absList);
  const keys = [];
  for (let a = minA; a <= maxA; a++) keys.push({ a, name: WHITE[((a % 7) + 7) % 7] });
  const fingerByAbs = {};
  notes.forEach((nn, i) => { fingerByAbs[whiteAbs(nn)] = fingers ? fingers[i] : 0; });
  const hasSharp = { C: 1, D: 1, E: 0, F: 1, G: 1, A: 1, B: 0 };
  const W = 18, H = 78, BW = 11, BH = 48, pad = 3;
  const width = keys.length * W + pad * 2, height = H + pad * 2;
  return (
    <figure className="ws-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="Keyboard diagram">
        {keys.map((k, i) => {
          const lit = k.a in fingerByAbs;
          return (
            <g key={`w${i}`}>
              <rect x={pad + i * W} y={pad} width={W} height={H} rx={2} className={`ws-kb-white ${lit ? "lit" : ""}`} />
              {lit && fingerByAbs[k.a] ? <text x={pad + i * W + W / 2} y={pad + H - 12} className="ws-kb-finger" textAnchor="middle">{fingerByAbs[k.a]}</text> : null}
            </g>
          );
        })}
        {keys.map((k, i) => (i < keys.length - 1 && hasSharp[k.name]
          ? <rect key={`b${i}`} x={pad + (i + 1) * W - BW / 2} y={pad} width={BW} height={BH} rx={2} className="ws-kb-black" />
          : null))}
      </svg>
    </figure>
  );
}
