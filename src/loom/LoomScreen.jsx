import React, { useCallback, useEffect, useRef, useState } from "react";
import { todayStr } from "../dateUtils.js";
import { COLOR_HEX, INSTRUMENTS } from "../seed.js";
import { CANVAS_H, CANVAS_W, makeBrush } from "./brushes.js";
import { loadOffset } from "./latency.js";
import { compositeLayers, drawMarks, POSTER_BACKGROUND } from "./renderer.js";
import Stethoscope from "./Stethoscope.jsx";
import { useLoomInput } from "./useLoomInput.js";
import { WEAVE_TUNING, alignment, isBleed, shearState, weaveColumns } from "./weave.js";

const INSTRUMENT_KEYS = ["piano", "guitar", "bass", "accordion"];
const MAX_TAKE_MS = 20 * 60 * 1_000;
const WEAVE_VIEW_MS = 40_000;

const makeLayer = () => {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return canvas;
};

export default function LoomScreen({ initialInstrument = "piano", metronomePlaying = false, beatTimesRef, bpm = 90, onClose, onSavePainting }) {
  const [instrument, setInstrument] = useState(INSTRUMENT_KEYS.includes(initialInstrument) ? initialInstrument : "piano");
  const [taking, setTaking] = useState(false);
  const [layerCount, setLayerCount] = useState(0);
  const [diagnostics, setDiagnostics] = useState(false);
  const [saved, setSaved] = useState(false);
  const { frame, running, error } = useLoomInput({ enabled: taking, instrument });

  const displayCanvas = useRef(null);
  const layers = useRef([]);
  const liveLayer = useRef(null);
  const brush = useRef(null);
  const takeStartedAt = useRef(0);
  const lastFrameT = useRef(0);
  const weaveOrigin = useRef(0);
  const shear = useRef({ deltas: [], meanMs: 0, shear: 0 });
  const offsetMs = useRef(loadOffset() ?? 0);

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
    if (metronomePlaying) {
      const now = performance.now();
      if (!weaveOrigin.current) weaveOrigin.current = now;
      const elapsed = Math.max(0, now - weaveOrigin.current);
      const cycleStart = weaveOrigin.current + Math.floor(elapsed / WEAVE_VIEW_MS) * WEAVE_VIEW_MS;
      const beats = beatTimesRef?.current || [];
      const columns = weaveColumns(beats, cycleStart + WEAVE_VIEW_MS, WEAVE_VIEW_MS);
      const beatPeriod = 60_000 / Math.max(1, bpm);
      const nearestDistance = beats.reduce((nearest, beatTime) => (
        Number.isFinite(beatTime) ? Math.min(nearest, Math.abs(now - beatTime)) : nearest
      ), beatPeriod / 2);
      const breath = Math.cos((nearestDistance / beatPeriod) * Math.PI * 2);
      ctx.save();
      ctx.strokeStyle = COLOR_HEX[instrument];
      ctx.globalAlpha = 0.12 + breath * 0.04;
      ctx.lineWidth = 1;
      for (const column of columns) {
        const x = column.xRatio * CANVAS_W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + shear.current.shear * 4, CANVAS_H);
        ctx.stroke();
      }
      ctx.restore();
    }
    compositeLayers(ctx, layers.current, liveLayer.current);
  }, [beatTimesRef, bpm, instrument, metronomePlaying]);

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
    if (!metronomePlaying) {
      shear.current = { deltas: [], meanMs: 0, shear: 0 };
      redraw();
      return undefined;
    }
    let animationFrame;
    const animate = () => {
      redraw();
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [metronomePlaying, redraw]);

  useEffect(() => {
    if (!diagnostics) offsetMs.current = loadOffset() ?? 0;
  }, [diagnostics]);

  useEffect(() => {
    if (!taking || !frame || !brush.current || !liveLayer.current) return;
    const t = Math.max(0, (frame.t - takeStartedAt.current) / 1_000);
    lastFrameT.current = t;
    let timedFrame = { ...frame, t };
    if (metronomePlaying && frame.onset) {
      const beats = beatTimesRef?.current || [];
      if (isBleed(frame.t, frame.level, beats, offsetMs.current)) return;
      const hit = alignment(frame.t, beats, offsetMs.current);
      if (hit) {
        shear.current = shearState(shear.current, hit.deltaMs);
        const scaledDelta = Math.max(-1, Math.min(1, hit.deltaMs / WEAVE_TUNING.shearMaxMs));
        timedFrame = { ...timedFrame, deltaMs: hit.deltaMs, xOffset: scaledDelta * 6 };
      }
    }
    const result = brush.current.step(brush.current.state, timedFrame);
    brush.current.state = result.state;
    drawMarks(liveLayer.current.getContext("2d"), result.marks, instrument);
    redraw();
  }, [beatTimesRef, frame, instrument, metronomePlaying, redraw, taking]);

  const startTake = () => {
    liveLayer.current = makeLayer();
    brush.current = makeBrush(instrument);
    takeStartedAt.current = performance.now();
    weaveOrigin.current = takeStartedAt.current;
    lastFrameT.current = 0;
    setTaking(true);
    setSaved(false);
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
    setSaved(false);
    redraw();
  };

  const clear = () => {
    layers.current = [];
    setLayerCount(0);
    setSaved(false);
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

  const saveToLog = () => {
    if (!onSavePainting || layers.current.length === 0 || !displayCanvas.current) return;
    redraw();
    const thumb = document.createElement("canvas");
    thumb.width = 300;
    thumb.height = 200;
    thumb.getContext("2d").drawImage(displayCanvas.current, 0, 0, thumb.width, thumb.height);
    onSavePainting({
      id: `loom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dateISO: todayStr(),
      inst: instrument,
      thumb: thumb.toDataURL("image/jpeg", 0.82),
    });
    setSaved(true);
  };

  if (diagnostics) {
    return <Stethoscope initialInstrument={instrument} metronomePlaying={metronomePlaying} beatTimesRef={beatTimesRef} onClose={() => setDiagnostics(false)} />;
  }

  return (
    <div className={`ws-loom-canvas-mode ${taking ? "taking" : ""} ${metronomePlaying ? "weaving" : ""}`} style={{ "--accent": COLOR_HEX[instrument] }}>
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
            <button key={key} className={`ws-loom-chip ${instrument === key ? "on" : ""}`} style={{ "--accent": INSTRUMENTS[key].color }} aria-pressed={instrument === key} onClick={() => { setInstrument(key); setSaved(false); }} disabled={taking}>
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
          <button className="ws-btn ghost" onClick={saveToLog} disabled={taking || layerCount === 0 || saved || !onSavePainting}>{saved ? "Saved to log" : "Save to log"}</button>
          <button className="ws-btn ghost" onClick={exportPng}>Export PNG</button>
        </div>
        <div className="ws-loom-layer-count mono">{taking ? "painting live" : `${layerCount} layer${layerCount === 1 ? "" : "s"}`}</div>
      </div>
    </div>
  );
}
