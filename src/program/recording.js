// Local, optional practice takes. Constructing this controller never opens the
// microphone. Only start(), called by the explicit Record button, requests it.
export const MAX_TAKE_MS = 3 * 60 * 1000;
export const RECORDING_ACTIVE = new Set(["requesting", "recording", "stopping"]);

export function recordingSupport({ mediaDevices = globalThis.navigator?.mediaDevices, MediaRecorderClass = globalThis.MediaRecorder, URLApi = globalThis.URL, BlobClass = globalThis.Blob } = {}) {
  const supported = !!mediaDevices?.getUserMedia && typeof MediaRecorderClass === "function" && typeof BlobClass === "function" && typeof URLApi?.createObjectURL === "function" && typeof URLApi?.revokeObjectURL === "function";
  return {
    supported,
    reason: supported ? null : "Audio recording is not available in this browser. You can keep practising and use a phone recording for your listening check.",
  };
}

export function recordingFilename(mimeType, stem = "woodshed-practice") {
  const type = String(mimeType || "").toLowerCase();
  const extension = type.includes("mp4") || type.includes("aac") ? "m4a" : type.includes("ogg") ? "ogg" : type.includes("webm") ? "webm" : type.includes("wav") ? "wav" : type.includes("mpeg") ? "mp3" : "audio";
  return `${String(stem || "woodshed-practice").replace(/[^a-z\d_-]+/gi, "-").replace(/^-|-$/g, "").slice(0, 100) || "woodshed-practice"}.${extension}`;
}

function errorMessage(error) {
  if (error?.name === "NotAllowedError" || error?.name === "SecurityError") return "Microphone permission was denied. Your lesson still works. Allow the microphone in your browser settings and try again, or use a phone recording for review.";
  if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") return "No microphone was found. You can keep practising and record on another device if useful.";
  if (error?.name === "NotReadableError" || error?.name === "TrackStartError") return "The microphone could not be opened. Close another app using it and try again, or review a phone recording.";
  return "The recording could not be completed. Your lesson and practice log still work; try again or use a phone recording for review.";
}

function stopStream(stream) {
  for (const track of stream?.getTracks?.() || []) {
    try { track.stop(); } catch { /* still release every other track */ }
  }
}

function preferredMime(MediaRecorderClass) {
  if (typeof MediaRecorderClass.isTypeSupported !== "function") return null;
  for (const type of ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"]) {
    try { if (MediaRecorderClass.isTypeSupported(type)) return type; } catch { /* let the browser choose its default */ }
  }
  return null;
}

// Dependencies are injectable so permission races and resource lifetimes can be
// tested without opening a real microphone or pretending to verify audio quality.
export function createPracticeRecorder({
  mediaDevices = globalThis.navigator?.mediaDevices,
  MediaRecorderClass = globalThis.MediaRecorder,
  URLApi = globalThis.URL,
  BlobClass = globalThis.Blob,
  now = () => globalThis.performance?.now?.() ?? Date.now(),
  setIntervalFn = globalThis.setInterval,
  clearIntervalFn = globalThis.clearInterval,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
  maxDurationMs = MAX_TAKE_MS,
} = {}) {
  const support = recordingSupport({ mediaDevices, MediaRecorderClass, URLApi, BlobClass });
  const limit = Number.isFinite(maxDurationMs) && maxDurationMs > 0 ? Math.min(maxDurationMs, MAX_TAKE_MS) : MAX_TAKE_MS;
  let snapshot = Object.freeze({ status: "idle", supported: support.supported, error: support.reason, elapsedMs: 0, maxDurationMs: limit, take: null, limitReached: false });
  let revision = 0, capture = null;
  const listeners = new Set();
  const publish = (patch) => {
    snapshot = Object.freeze({ ...snapshot, ...patch });
    for (const listener of listeners) listener();
  };
  const revoke = (take) => { if (take?.url) URLApi.revokeObjectURL(take.url); };
  const elapsed = (c) => Math.min(limit, Math.max(0, now() - c.startedAt));
  const haltTracks = (c) => { if (!c.tracksStopped) { c.tracksStopped = true; stopStream(c.stream); } };
  const clearTimers = (c) => {
    if (c.tick != null) clearIntervalFn(c.tick);
    if (c.limitTimer != null) clearTimeoutFn(c.limitTimer);
    if (c.finishTimer != null) clearTimeoutFn(c.finishTimer);
    c.tick = c.limitTimer = c.finishTimer = null;
  };
  const detach = (c) => {
    clearTimers(c); haltTracks(c);
    c.recorder.ondataavailable = c.recorder.onstop = c.recorder.onerror = null;
    if (capture === c) capture = null;
  };
  const notifyStop = (c, payload) => {
    // A UI callback must never keep a microphone alive or prevent cleanup.
    try { c.onStop?.(payload); } catch { /* resource cleanup has already completed */ }
  };
  const failCapture = (c, message) => {
    if (capture !== c || c.token !== revision) return;
    detach(c);
    publish({ status: "error", error: message, elapsedMs: c.durationMs ?? elapsed(c), limitReached: c.reason === "limit" });
    notifyStop(c, { take: null, error: message, reason: c.reason });
  };
  const finish = (c) => {
    if (capture !== c || c.token !== revision) return;
    try {
      const mimeType = c.recorder.mimeType || c.parts.find((p) => p.type)?.type || "application/octet-stream";
      const blob = new BlobClass(c.parts, { type: mimeType });
      if (!blob.size) { failCapture(c, "No audio was captured. Check your microphone and try another short take; your previous take, if any, is still available."); return; }
      const take = Object.freeze({ blob, mimeType: blob.type || mimeType, url: URLApi.createObjectURL(blob), durationMs: c.durationMs ?? elapsed(c) });
      const previous = snapshot.take;
      detach(c);
      publish({ status: "ready", error: null, elapsedMs: take.durationMs, take, limitReached: c.reason === "limit" });
      revoke(previous);
      notifyStop(c, { take, error: null, reason: c.reason });
    } catch (error) { failCapture(c, errorMessage(error)); }
  };

  const stop = (reason = "manual") => {
    if (snapshot.status === "requesting") {
      revision++; // late permission results are stopped without ever recording
      publish({ status: snapshot.take ? "ready" : "idle", error: null, elapsedMs: snapshot.take?.durationMs || 0, limitReached: false });
      return true;
    }
    if (snapshot.status !== "recording" || !capture) return false;
    const c = capture;
    c.reason = reason; c.durationMs = elapsed(c);
    clearTimers(c);
    publish({ status: "stopping", elapsedMs: c.durationMs, limitReached: reason === "limit" });
    // MediaRecorder.stop queues the final dataavailable event before stop. Do not
    // assemble the blob until onstop, or the last chunk can be lost.
    c.finishTimer = setTimeoutFn(() => failCapture(c, "The browser did not finish this take. The microphone is off. Please try another short recording."), 5000);
    try {
      if (c.recorder.state !== "inactive") c.recorder.stop();
      haltTracks(c);
    } catch (error) { failCapture(c, errorMessage(error)); }
    return true;
  };

  const start = async ({ beforeStart, onStop } = {}) => {
    if (snapshot.status === "closed" || RECORDING_ACTIVE.has(snapshot.status)) return false;
    if (!support.supported) { publish({ status: "error", error: support.reason }); return false; }
    const token = ++revision;
    publish({ status: "requesting", error: null, elapsedMs: 0, limitReached: false });
    let stream = null;
    try {
      await beforeStart?.();
      if (token !== revision || snapshot.status === "closed") return false;
      stream = await mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (token !== revision || snapshot.status === "closed") { stopStream(stream); return false; }
      const mimeType = preferredMime(MediaRecorderClass);
      const recorder = mimeType ? new MediaRecorderClass(stream, { mimeType }) : new MediaRecorderClass(stream);
      const c = { token, recorder, stream, parts: [], startedAt: now(), durationMs: null, reason: "ended", tracksStopped: false, onStop, tick: null, limitTimer: null, finishTimer: null };
      capture = c;
      recorder.ondataavailable = (event) => { if (capture === c && token === revision && event.data?.size > 0) c.parts.push(event.data); };
      recorder.onstop = () => finish(c);
      recorder.onerror = (event) => failCapture(c, errorMessage(event.error));
      recorder.start(1000);
      if (capture !== c || token !== revision) return false;
      publish({ status: "recording" });
      c.tick = setIntervalFn(() => { if (capture === c && snapshot.status === "recording") publish({ elapsedMs: elapsed(c) }); }, 250);
      c.limitTimer = setTimeoutFn(() => { if (capture === c) stop("limit"); }, limit);
      return true;
    } catch (error) {
      if (capture?.token === token) { failCapture(capture, errorMessage(error)); return false; }
      stopStream(stream);
      if (token === revision && snapshot.status !== "closed") publish({ status: "error", error: errorMessage(error), elapsedMs: 0 });
      return false;
    }
  };

  const discard = () => {
    if (snapshot.status === "closed" || RECORDING_ACTIVE.has(snapshot.status)) return false;
    revoke(snapshot.take);
    publish({ status: "idle", take: null, error: null, elapsedMs: 0, limitReached: false });
    return true;
  };
  const close = () => {
    if (snapshot.status === "closed") return;
    revision++;
    if (capture) {
      const c = capture;
      detach(c);
      try { if (c.recorder.state !== "inactive") c.recorder.stop(); } catch { /* tracks are already off */ }
    }
    revoke(snapshot.take);
    publish({ status: "closed", take: null, error: null });
    listeners.clear();
  };
  return { getSnapshot: () => snapshot, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }, start, stop, discard, close };
}
