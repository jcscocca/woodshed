import assert from "node:assert/strict";
import { createPracticeRecorder, recordingSupport, recordingFilename, MAX_TAKE_MS } from "../src/program/recording.js";

// These mocks verify lifecycle/privacy boundaries, not real microphone quality,
// codec compatibility or a human performance recorded in a browser.
let failures = 0;
const test = async (name, fn) => { try { await fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.stack}`); } };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

function harness(options = {}) {
  let time = 0, timerId = 0;
  const timers = new Map(), calls = [], revoked = [], urls = [], instances = [];
  const tracks = [{ stops: 0, stop() { this.stops++; } }, { stops: 0, stop() { this.stops++; } }];
  const stream = { getTracks: () => tracks };
  const setTimer = (fn, delay, interval = false) => { const id = ++timerId; timers.set(id, { fn, due: time + delay, delay, interval }); return id; };
  const clock = {
    now: () => time,
    advance(ms) {
      time += ms;
      for (const [id, timer] of [...timers].sort((a, b) => a[1].due - b[1].due)) {
        if (timer.due > time || !timers.has(id)) continue;
        if (timer.interval) timers.set(id, { ...timer, due: time + timer.delay }); else timers.delete(id);
        timer.fn();
      }
    },
  };
  class Recorder {
    static isTypeSupported(type) { return type === "audio/ogg;codecs=opus"; }
    constructor(input, config) {
      if (options.constructorError) throw options.constructorError;
      assert.equal(input, stream);
      this.mimeType = config?.mimeType || "audio/mp4";
      this.options = config;
      this.state = "inactive";
      this.stopCalls = 0;
      instances.push(this);
    }
    start(timeslice) {
      if (options.startError) throw options.startError;
      this.timeslice = timeslice; this.state = "recording";
    }
    stop() { this.stopCalls++; this.state = "inactive"; }
    data(text, type = this.mimeType) { this.ondataavailable?.({ data: new Blob([text], { type }) }); }
    finish(text = null) { if (text !== null) this.data(text); this.state = "inactive"; this.onstop?.(); }
    error(name = "UnknownError") { this.onerror?.({ error: Object.assign(new Error(name), { name }) }); }
  }
  const mediaDevices = { getUserMedia: (constraints) => { calls.push(constraints); return options.permission ? options.permission.promise : Promise.resolve(stream); } };
  const URLApi = {
    createObjectURL(blob) { const url = `blob:practice-${urls.length + 1}`; urls.push({ url, blob }); return url; },
    revokeObjectURL(url) { revoked.push(url); },
  };
  const recorder = createPracticeRecorder({
    mediaDevices, MediaRecorderClass: Recorder, URLApi, BlobClass: Blob, now: clock.now,
    setIntervalFn: (fn, delay) => setTimer(fn, delay, true), clearIntervalFn: (id) => timers.delete(id),
    setTimeoutFn: (fn, delay) => setTimer(fn, delay), clearTimeoutFn: (id) => timers.delete(id),
    ...(options.maxDurationMs ? { maxDurationMs: options.maxDurationMs } : {}),
  });
  return { recorder, mediaDevices, Recorder, URLApi, clock, timers, calls, tracks, stream, instances, urls, revoked };
}

await test("construction and subscribing never request a microphone; start is explicit and duplicate-safe", async () => {
  const permission = deferred(), h = harness({ permission });
  let updates = 0;
  const off = h.recorder.subscribe(() => updates++);
  assert.equal(h.recorder.getSnapshot().status, "idle"); assert.equal(h.calls.length, 0);
  const first = h.recorder.start();
  assert.equal(h.recorder.getSnapshot().status, "requesting");
  assert.equal(await h.recorder.start(), false);
  await Promise.resolve();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0], { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  permission.resolve(h.stream);
  assert.equal(await first, true); assert.equal(h.instances.length, 1);
  assert.equal(h.recorder.getSnapshot().status, "recording");
  assert.ok(updates >= 2); off(); h.recorder.close();
});

await test("manual stop closes all tracks immediately and waits for the final chunk before publishing a take", async () => {
  const h = harness(), stopped = [];
  await h.recorder.start({ onStop: (value) => stopped.push(value) });
  const r = h.instances[0];
  r.data("first-"); h.clock.advance(1500);
  assert.equal(h.recorder.stop(), true); assert.equal(h.recorder.stop(), false);
  assert.equal(h.recorder.getSnapshot().status, "stopping");
  assert.ok(h.tracks.every((t) => t.stops === 1)); assert.equal(r.stopCalls, 1);
  assert.equal(h.urls.length, 0, "the final chunk has not arrived yet");
  r.finish("last");
  const state = h.recorder.getSnapshot();
  assert.equal(state.status, "ready"); assert.equal(state.take.durationMs, 1500);
  assert.equal(await state.take.blob.text(), "first-last");
  assert.equal(state.take.mimeType, "audio/ogg;codecs=opus");
  assert.equal(stopped.length, 1); assert.equal(stopped[0].reason, "manual");
  assert.equal(stopped[0].take, state.take); assert.equal(h.timers.size, 0);
  assert.ok(!("accuracy" in state.take) && !("grade" in state.take));
  h.recorder.close();
});

await test("permission denied has an actionable fallback and never constructs a recorder", async () => {
  const permission = deferred(), h = harness({ permission });
  const pending = h.recorder.start();
  await Promise.resolve();
  permission.reject(Object.assign(new Error("denied"), { name: "NotAllowedError" }));
  assert.equal(await pending, false);
  assert.equal(h.recorder.getSnapshot().status, "error");
  assert.match(h.recorder.getSnapshot().error, /permission was denied/i);
  assert.match(h.recorder.getSnapshot().error, /lesson still works/i);
  assert.equal(h.instances.length, 0); assert.equal(h.urls.length, 0);
  h.recorder.close();
});

await test("cancelling a pending permission request closes a late stream without recording it", async () => {
  const permission = deferred(), h = harness({ permission });
  const pending = h.recorder.start(); await Promise.resolve();
  assert.equal(h.recorder.stop(), true); assert.equal(h.recorder.getSnapshot().status, "idle");
  permission.resolve(h.stream);
  assert.equal(await pending, false);
  assert.ok(h.tracks.every((t) => t.stops === 1));
  assert.equal(h.instances.length, 0); assert.equal(h.recorder.getSnapshot().take, null);
  h.recorder.close();
});

await test("unmount/close during permission waits also stops the late stream", async () => {
  const permission = deferred(), h = harness({ permission });
  const pending = h.recorder.start(); await Promise.resolve();
  h.recorder.close(); permission.resolve(h.stream);
  assert.equal(await pending, false);
  assert.equal(h.recorder.getSnapshot().status, "closed");
  assert.ok(h.tracks.every((t) => t.stops === 1)); assert.equal(h.instances.length, 0);
});

await test("closing during asynchronous preparation prevents even the permission request", async () => {
  const before = deferred(), h = harness();
  const pending = h.recorder.start({ beforeStart: () => before.promise });
  h.recorder.close(); before.resolve();
  assert.equal(await pending, false); assert.equal(h.calls.length, 0);
});

await test("the three-minute maximum stops capture, reports the limit and releases tracks", async () => {
  const h = harness(), stopped = [];
  await h.recorder.start({ onStop: (value) => stopped.push(value) });
  assert.equal(h.recorder.getSnapshot().maxDurationMs, MAX_TAKE_MS);
  h.clock.advance(MAX_TAKE_MS);
  assert.equal(h.recorder.getSnapshot().status, "stopping");
  assert.equal(h.recorder.getSnapshot().elapsedMs, MAX_TAKE_MS);
  assert.equal(h.recorder.getSnapshot().limitReached, true);
  assert.ok(h.tracks.every((t) => t.stops === 1));
  h.instances[0].finish("limited take");
  assert.equal(h.recorder.getSnapshot().take.durationMs, MAX_TAKE_MS);
  assert.equal(stopped[0].reason, "limit"); h.recorder.close();
});

await test("closing an active capture ignores late data and stop callbacks", async () => {
  const h = harness(); let stops = 0;
  await h.recorder.start({ onStop: () => stops++ });
  const r = h.instances[0], lateData = r.ondataavailable, lateStop = r.onstop;
  h.recorder.close();
  lateData({ data: new Blob(["late"]) }); lateStop();
  assert.ok(h.tracks.every((t) => t.stops === 1));
  assert.equal(r.stopCalls, 1); assert.equal(h.urls.length, 0); assert.equal(stops, 0);
  assert.equal(h.timers.size, 0); assert.equal(h.recorder.getSnapshot().status, "closed");
});

await test("a completed take is retained until replacement succeeds, then its URL is revoked", async () => {
  const h = harness();
  await h.recorder.start(); h.recorder.stop(); h.instances[0].finish("original");
  const first = h.recorder.getSnapshot().take;
  await h.recorder.start();
  assert.equal(h.recorder.getSnapshot().take, first); assert.deepEqual(h.revoked, []);
  h.recorder.stop(); h.instances[1].finish("new take");
  assert.notEqual(h.recorder.getSnapshot().take.url, first.url);
  assert.deepEqual(h.revoked, [first.url]);
  const secondUrl = h.recorder.getSnapshot().take.url;
  assert.equal(h.recorder.discard(), true);
  assert.equal(h.recorder.getSnapshot().take, null);
  assert.deepEqual(h.revoked, [first.url, secondUrl]);
  h.recorder.close(); h.recorder.close();
  assert.deepEqual(h.revoked, [first.url, secondUrl], "each local URL is released once");
});

await test("an empty replacement errors clearly without losing the earlier take", async () => {
  const h = harness();
  await h.recorder.start(); h.recorder.stop(); h.instances[0].finish("original");
  const first = h.recorder.getSnapshot().take;
  await h.recorder.start(); h.recorder.stop(); h.instances[1].finish();
  assert.equal(h.recorder.getSnapshot().status, "error");
  assert.match(h.recorder.getSnapshot().error, /No audio was captured/);
  assert.equal(h.recorder.getSnapshot().take, first); assert.deepEqual(h.revoked, []);
  h.recorder.close(); assert.deepEqual(h.revoked, [first.url]);
});

await test("recorder construction and start failures always release microphone tracks", async () => {
  for (const key of ["constructorError", "startError"]) {
    const h = harness({ [key]: new Error("unsupported recorder") });
    assert.equal(await h.recorder.start(), false);
    assert.ok(h.tracks.every((t) => t.stops === 1), key);
    assert.equal(h.recorder.getSnapshot().status, "error"); assert.equal(h.timers.size, 0);
    h.recorder.close();
  }
});

await test("recorder errors and missing stop events release resources and leave useful feedback", async () => {
  const h = harness(); await h.recorder.start(); h.instances[0].error("NotReadableError");
  assert.equal(h.recorder.getSnapshot().status, "error");
  assert.match(h.recorder.getSnapshot().error, /microphone could not be opened/i);
  assert.ok(h.tracks.every((t) => t.stops === 1)); assert.equal(h.timers.size, 0); h.recorder.close();
  const other = harness(); await other.recorder.start(); other.recorder.stop(); other.clock.advance(5001);
  assert.equal(other.recorder.getSnapshot().status, "error");
  assert.match(other.recorder.getSnapshot().error, /microphone is off/i);
  assert.ok(other.tracks.every((t) => t.stops === 1)); assert.equal(other.timers.size, 0); other.recorder.close();
});

await test("unsupported recording never requests a microphone and offers a fallback", async () => {
  let calls = 0;
  const mediaDevices = { getUserMedia() { calls++; return Promise.reject(new Error("must not be called")); } };
  assert.equal(recordingSupport({ mediaDevices, MediaRecorderClass: null }).supported, false);
  const recorder = createPracticeRecorder({ mediaDevices, MediaRecorderClass: null });
  assert.equal(await recorder.start(), false); assert.equal(calls, 0);
  assert.match(recorder.getSnapshot().error, /phone recording/i); recorder.close();
});

await test("downloads use the actual container and safe local filenames", () => {
  assert.equal(recordingFilename("audio/ogg;codecs=opus", "F major take"), "F-major-take.ogg");
  assert.equal(recordingFilename("audio/mp4;codecs=mp4a.40.2"), "woodshed-practice.m4a");
  assert.equal(recordingFilename("audio/webm"), "woodshed-practice.webm");
  assert.equal(recordingFilename("application/octet-stream", "../../my take"), "my-take.audio");
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exitCode = 1; } else console.log("\nall recording lifecycle checks green"); });
