import { COLOR_HEX } from "../seed.js";
import { CANVAS_H, CANVAS_W } from "./brushes.js";

export const POSTER_BACKGROUND = "#171513";

const safe = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

function drawBlock(ctx, mark) {
  const w = Math.max(1, safe(mark.w, 1));
  const h = Math.max(1, safe(mark.h, 1));
  ctx.fillRect(safe(mark.x) - w / 2, safe(mark.y) - h / 2, w, h);
}

function drawRibbon(ctx, mark) {
  const points = Array.isArray(mark.points) ? mark.points : [];
  if (points.length === 1) {
    const width = Math.max(1, safe(mark.widths?.[0], 1));
    ctx.fillRect(safe(points[0].x) - width / 2, safe(points[0].y) - width / 2, width, width);
    return;
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let index = 1; index < points.length; index += 1) {
    ctx.beginPath();
    ctx.moveTo(safe(points[index - 1].x), safe(points[index - 1].y));
    ctx.lineTo(safe(points[index].x), safe(points[index].y));
    ctx.lineWidth = Math.max(1, (safe(mark.widths?.[index - 1], 1) + safe(mark.widths?.[index], 1)) / 2);
    ctx.stroke();
  }
}

function drawTerrain(ctx, mark) {
  const heights = mark.heights || [];
  if (!heights.length) return;
  const columnWidth = CANVAS_W / heights.length;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H);
  for (let index = 0; index < heights.length; index += 1) {
    ctx.lineTo(index * columnWidth, CANVAS_H - Math.max(0, safe(heights[index])));
  }
  ctx.lineTo(CANVAS_W, CANVAS_H);
  ctx.closePath();
  ctx.fill();
}

function drawBand(ctx, mark) {
  ctx.fillRect(safe(mark.x), safe(mark.y), Math.max(1, safe(mark.w, 1)), Math.max(1, safe(mark.h, 1)));
}

export function drawMarks(ctx, marks, instrument) {
  if (!ctx || !Array.isArray(marks)) return;
  for (const mark of marks) {
    ctx.save();
    const color = COLOR_HEX[instrument] || mark.color || COLOR_HEX.piano;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, safe(mark.alpha, 1)));
    if (mark.type === "block") drawBlock(ctx, mark);
    else if (mark.type === "ribbon") drawRibbon(ctx, mark);
    else if (mark.type === "terrain") drawTerrain(ctx, mark);
    else if (mark.type === "band") drawBand(ctx, mark);
    ctx.restore();
  }
  // Keep mock contexts and browser callers in a predictable neutral state.
  ctx.fillStyle = COLOR_HEX[instrument] || COLOR_HEX.piano;
  ctx.strokeStyle = COLOR_HEX[instrument] || COLOR_HEX.piano;
  ctx.globalAlpha = 1;
}

export function compositeLayers(ctx, layers, liveLayer = null) {
  if (!ctx) return;
  for (const layer of layers || []) ctx.drawImage(layer, 0, 0, CANVAS_W, CANVAS_H);
  if (liveLayer) ctx.drawImage(liveLayer, 0, 0, CANVAS_W, CANVAS_H);
}
