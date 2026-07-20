import { COLOR_HEX } from "../seed.js";

export const CANVAS_H = 800;
export const CANVAS_W = 1200;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function centroidRegister(centroid) {
  const hz = clamp(
    Number.isFinite(centroid) && centroid > 0 ? centroid : TUNING.centroidMinHz,
    TUNING.centroidMinHz,
    TUNING.centroidMaxHz,
  );
  const span = TUNING.centroidMidiMax - TUNING.centroidMidiMin;
  const midi = TUNING.centroidMidiMin
    + Math.log(hz / TUNING.centroidMinHz) / Math.log(TUNING.centroidMaxHz / TUNING.centroidMinHz) * span;
  return yFromMidi(midi);
}

// Guitar, bass, and accordion remain deliberately conservative until their
// input has been live-verified. Low-confidence pitch always takes this shared
// centroid path instead of acquiring instrument-specific thresholds.
export const TUNING = {
  floor: 0.03,
  onsetJump: 0.08,
  clarityMin: 0.5,
  centroidRegister,
  centroidMinHz: 80,
  centroidMaxHz: 6_000,
  centroidMidiMin: 36,
  centroidMidiMax: 96,
  centroidSmoothing: 0.18,
  pianoBaselineSeconds: 0.3,
  guitarGapSeconds: 0.18,
  guitarMaxSeconds: 2,
  bassDecay: 0.995,
  bassLift: 26,
  bassSnapshotSeconds: 0.5,
  accordionAttackSeconds: 0.12,
  accordionReleaseSeconds: 0.18,
};

export function xFromT(t) {
  const wrapped = ((Number.isFinite(t) ? t : 0) % 40 + 40) % 40;
  return wrapped / 40 * CANVAS_W;
}

export function yFromMidi(midi) {
  const safeMidi = clamp(Number.isFinite(midi) ? midi : 36, 36, 96);
  return ((96 - safeMidi) / 60) * CANVAS_H;
}

function placement(frame, previousY = null) {
  const pitched = Number.isFinite(frame.midi) && frame.clarity >= TUNING.clarityMin;
  const target = pitched ? yFromMidi(frame.midi) : TUNING.centroidRegister(frame.centroid);
  if (pitched || previousY === null || !Number.isFinite(previousY)) return target;
  return previousY + (target - previousY) * TUNING.centroidSmoothing;
}

function pianoStep(state, frame) {
  const cutoff = frame.t - TUNING.pianoBaselineSeconds;
  const recentLevels = state.recentLevels.filter(({ t }) => t >= cutoff);
  const baseline = recentLevels.length === 0
    ? 0
    : recentLevels.reduce((sum, sample) => sum + sample.level, 0) / recentLevels.length;
  const sounding = frame.level > TUNING.floor;
  const pitched = Number.isFinite(frame.midi) && frame.clarity >= TUNING.clarityMin;
  const levelOnset = sounding && frame.level - baseline >= TUNING.onsetJump;
  const pitchOnset = sounding && pitched
    && state.lastMidi !== null
    && Math.abs(frame.midi - state.lastMidi) >= 1;
  const onset = sounding && (frame.onset || levelOnset || pitchOnset);
  const y = sounding ? placement(frame, state.lastY) : state.lastY;
  const marks = onset ? [{
    type: "block",
    x: xFromT(frame.t),
    y,
    w: 14 + frame.level * 90,
    h: 10 + frame.level * 44,
    color: COLOR_HEX.piano,
    alpha: 0.85,
  }] : [];

  return {
    state: {
      recentLevels: [...recentLevels, { t: frame.t, level: frame.level }],
      lastMidi: sounding && pitched ? frame.midi : state.lastMidi,
      lastY: sounding ? y : state.lastY,
    },
    marks,
  };
}

function ribbonMark(current) {
  return {
    type: "ribbon",
    points: current.points,
    widths: current.widths,
    color: COLOR_HEX.guitar,
    alpha: 0.76,
  };
}

function guitarStep(state, frame) {
  const sounding = frame.level > TUNING.floor;
  let current = state.current;
  let lastY = state.lastY;
  const marks = [];

  if (current && (
    frame.t - current.lastSoundT > TUNING.guitarGapSeconds
    || frame.t - current.startedAt >= TUNING.guitarMaxSeconds
  )) {
    marks.push(ribbonMark(current));
    current = null;
  }

  if (sounding) {
    const y = placement(frame, lastY);
    const point = { x: xFromT(frame.t), y };
    current = current ? {
      ...current,
      lastSoundT: frame.t,
      points: [...current.points, point],
      widths: [...current.widths, 2 + frame.level * 10],
    } : {
      startedAt: frame.t,
      lastSoundT: frame.t,
      points: [point],
      widths: [2 + frame.level * 10],
    };
    lastY = y;
  }

  return { state: { current, lastY }, marks };
}

function bassStep(state, frame) {
  const heights = Float32Array.from(state.heights, (height) => height * TUNING.bassDecay);
  if (frame.level > TUNING.floor) {
    const columnWidth = CANVAS_W / heights.length;
    const center = clamp(Math.round(xFromT(frame.t) / columnWidth), 0, heights.length - 1);
    for (let offset = -4; offset <= 4; offset += 1) {
      const column = center + offset;
      if (column < 0 || column >= heights.length) continue;
      const falloff = Math.exp(-0.5 * (offset / 1.75) ** 2);
      heights[column] += frame.level * TUNING.bassLift * falloff;
    }
  }

  const lastSnapshot = state.lastSnapshot ?? frame.t;
  const shouldSnapshot = frame.t - lastSnapshot >= TUNING.bassSnapshotSeconds;
  const marks = shouldSnapshot ? [{
    type: "terrain",
    heights: Float32Array.from(heights),
    color: COLOR_HEX.bass,
    alpha: 0.7,
  }] : [];

  return {
    state: {
      heights,
      lastSnapshot: shouldSnapshot ? frame.t : lastSnapshot,
    },
    marks,
  };
}

function initialAccordionState() {
  return {
    phase: "idle",
    startedAt: null,
    lastSoundT: null,
    quietSince: null,
    levelSum: 0,
    centroidSum: 0,
    sampleCount: 0,
  };
}

function accordionStep(state, frame) {
  const sounding = frame.level > TUNING.floor;
  let next = { ...state };
  const marks = [];

  if (sounding) {
    if (state.phase === "idle") {
      next = {
        phase: "pending",
        startedAt: frame.t,
        lastSoundT: frame.t,
        quietSince: null,
        levelSum: frame.level,
        centroidSum: Number.isFinite(frame.centroid) ? frame.centroid : 0,
        sampleCount: 1,
      };
    } else {
      next = {
        ...state,
        lastSoundT: frame.t,
        quietSince: null,
        levelSum: state.levelSum + frame.level,
        centroidSum: state.centroidSum + (Number.isFinite(frame.centroid) ? frame.centroid : 0),
        sampleCount: state.sampleCount + 1,
      };
      if (state.phase === "pending" && frame.t - state.startedAt >= TUNING.accordionAttackSeconds) {
        next.phase = "active";
      }
    }
  } else if (state.phase === "pending") {
    next = initialAccordionState();
  } else if (state.phase === "active") {
    const quietSince = state.quietSince ?? frame.t;
    if (frame.t - quietSince >= TUNING.accordionReleaseSeconds) {
      const meanLevel = state.levelSum / state.sampleCount;
      const meanCentroid = state.centroidSum / state.sampleCount;
      const startX = xFromT(state.startedAt);
      const endX = xFromT(state.lastSoundT);
      const breath = 8 + meanCentroid / 260;
      marks.push({
        type: "band",
        x: startX - breath / 2,
        y: 0,
        w: Math.max(1, endX - startX) + breath,
        h: CANVAS_H,
        color: COLOR_HEX.accordion,
        alpha: 0.12 + meanLevel * 0.35,
      });
      next = initialAccordionState();
    } else {
      next = { ...state, quietSince };
    }
  }

  return { state: next, marks };
}

export function makeBrush(instrument) {
  if (instrument === "piano") {
    return {
      state: { recentLevels: [], lastMidi: null, lastY: null },
      step: pianoStep,
    };
  }
  if (instrument === "guitar") {
    return { state: { current: null, lastY: null }, step: guitarStep };
  }
  if (instrument === "bass") {
    return {
      state: { heights: new Float32Array(240), lastSnapshot: null },
      step: bassStep,
    };
  }
  if (instrument === "accordion") {
    return { state: initialAccordionState(), step: accordionStep };
  }
  throw new Error(`Unknown Loom instrument: ${instrument}`);
}
