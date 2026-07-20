import React, { useCallback, useEffect, useRef, useState } from "react";
import { todayStr } from "../dateUtils.js";
import { COLOR_HEX, INSTRUMENTS } from "../seed.js";
import { CANVAS_H, CANVAS_W, makeBrush } from "./brushes.js";
import { compositeLayers, drawMarks, POSTER_BACKGROUND } from "./renderer.js";
import Stethoscope from "./Stethoscope.jsx";
import { useLoomInput } from "./useLoomInput.js";

const INSTRUMENT_KEYS = ["piano", "guitar", "bass", "accordion"];
const MAX_TAKE_MS = 20 * 60 * 1_000;

const makeLayer = () => {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return canvas;
};

export default function LoomScreen({ initialInstrument = "piano", metronomePlaying = false, beatTimesRef, onClose }) {
  const [instrument, setInstrument] = useState(INSTRUMENT_KEYS.includes(initialInstrument) ? initialInstrument : "piano");
  const [taking, setTaking] = useState(false);
  const [layerCount, setLayerCount] = useState(0);
  const [diagnostics, setDiagnostics] = useState(false);
  const { frame, running, error } = useLoomInput({ enabled: taking, instrument });

  const displayCanvas = useRef(null);
  const layers = useRef([]);
  const liveLayer = useRef(null);
  const brush = useRef(null);
  const takeStartedAt = useRef(0);
  const lastFrameT = useRef(0);

  const redraw = useCallback(() => {
    const canvas = displayCanvas.current;
    if (!canvas) return;
    const width = canvas.clientWidth || CANVAS_W;
    const height = canvas.clientHeight || CANVAS_H;
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvas.width / CANVAS_W, 0, 0, canvas.height / CANVAS_H, 0, 0);
    ctx.fillStyle = POSTER_BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    compositeLayers(ctx, layers.current, liveLayer.current);
  }, []);

  useEffect(() => {
    redraw();
    const canvas = displayCanvas.current;
    if (!canvas) return undefined;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(redraw);
      observer.observe(canvas);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [redraw]);

  useEffect(() => {
    if (!taking || !frame || !brush.current || !liveLayer.current) return;
    const t = Math.max(0, (frame.t - takeStartedAt.current) / 1_000);
    lastFrameT.current = t;
    const result = brush.current.step(brush.current.state, { ...frame, t });
    brush.current.state = result.state;
    drawMarks(liveLayer.current.getContext("2d"), result.marks, instrument);
    redraw();
  }, [frame, instrument, redraw, taking]);

  const startTake = () => {
    liveLayer.current = makeLayer();
    brush.current = makeBrush(instrument);
    takeStartedAt.current = performance.now();
    lastFrameT.current = 0;
    setTaking(true);
    redraw();
  };

  const stopTake = useCallback(() => {
    if (!liveLayer.current || !brush.current) { setTaking(false); return; }
    const ctx = liveLayer.current.getContext("2d");
    const quiet = { midi: null, clarity: 0, level: 0, centroid: 0, onset: false };
    for (const extra of [0.2, 0.4]) {
      const result = brush.current.step(brush.current.state, { ...quiet, t: lastFrameT.current + extra });
      brush.current.state = result.state;
      drawMarks(ctx, result.marks, instrument);
    }
    layers.current = [...layers.current, liveLayer.current];
    liveLayer.current = null;
    brush.current = null;
    setLayerCount(layers.current.length);
    setTaking(false);
    redraw();
  }, [instrument, redraw]);

  useEffect(() => {
    if (!taking) return undefined;
    const timer = setTimeout(stopTake, MAX_TAKE_MS);
    return () => clearTimeout(timer);
  }, [stopTake, taking]);

  const undo = () => {
    layers.current = layers.current.slice(0, -1);
    setLayerCount(layers.current.length);
    redraw();
  };

  const clear = () => {
    layers.current = [];
    setLayerCount(0);
    if (liveLayer.current) {
      liveLayer.current.getContext("2d").clearRect(0, 0, CANVAS_W, CANVAS_H);
      brush.current = makeBrush(instrument);
      lastFrameT.current = 0;
      takeStartedAt.current = performance.now();
    }
    redraw();
  };

  const exportPng = () => {
    const poster = document.createElement("canvas");
    poster.width = CANVAS_W * 2;
    poster.height = CANVAS_H * 2;
    const ctx = poster.getContext("2d");
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = POSTER_BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    compositeLayers(ctx, layers.current, liveLayer.current);
    poster.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `woodshed-loom-${todayStr()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  if (diagnostics) {
    return <Stethoscope initialInstrument={instrument} metronomePlaying={metronomePlaying} beatTimesRef={beatTimesRef} onClose={() => setDiagnostics(false)} />;
  }

  return (
    <div className={`ws-loom-canvas-mode ${taking ? "taking" : ""}`} style={{ "--accent": COLOR_HEX[instrument] }}>
      <div className="ws-loom-canvas-chrome ws-loom-canvas-head">
        <div>
          <h2 className="ws-sheet-title">Loom <span className="ws-beta">beta</span></h2>
          <button className="ws-loom-diagnostics" onClick={() => { if (taking) stopTake(); setDiagnostics(true); }}>diagnostics</button>
        </div>
        <button className="ws-x" onClick={onClose} aria-label="Close Loom">✕</button>
      </div>

      <div className="ws-loom-poster-stage">
        <canvas ref={displayCanvas} className="ws-loom-poster" role="img" aria-label="Loom painting in progress" />
        {taking && !running && !error && <div className="ws-loom-canvas-status">starting microphone…</div>}
        {error && <div className="ws-loom-canvas-status error">{error}</div>}
      </div>

      <div className="ws-loom-canvas-chrome ws-loom-canvas-controls">
        <div className="ws-loom-chips" aria-label="Instrument">
          {INSTRUMENT_KEYS.map((key) => (
            <button key={key} className={`ws-loom-chip ${instrument === key ? "on" : ""}`} style={{ "--accent": INSTRUMENTS[key].color }} aria-pressed={instrument === key} onClick={() => setInstrument(key)} disabled={taking}>
              <span />{INSTRUMENTS[key].name}
            </button>
          ))}
        </div>
        <div className="ws-loom-canvas-actions">
          <button className={`ws-btn ${taking ? "ghost" : "primary"}`} onClick={taking ? stopTake : startTake}>
            {taking ? "Stop & layer" : "Take"}
          </button>
          <button className="ws-btn ghost" onClick={undo} disabled={taking || layerCount === 0}>Undo layer</button>
          <button className="ws-btn ghost" onClick={clear} disabled={!taking && layerCount === 0}>Clear</button>
          <button className="ws-btn ghost" onClick={exportPng}>Export PNG</button>
        </div>
        <div className="ws-loom-layer-count mono">{taking ? "painting live" : `${layerCount} layer${layerCount === 1 ? "" : "s"}`}</div>
      </div>
    </div>
  );
}
