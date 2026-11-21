// src/services/stallMonitor.js — NEW FILE
// ─────────────────────────────────────────────────────────────────────────────
// FREEZE RECORDER. When the app "gets stuck" the cause is invisible from outside: something keeps the phone's JavaScript
// thread busy (or waiting on a slow native call) and taps are not handled until it finishes. This records exactly that,
// so the culprit can be named instead of guessed:
//
//   • HEARTBEAT — every 250 ms a timer checks how late it fired. If it fired 700 ms+ late while the app was on screen, the
//     app was blocked for that long. The entry stores WHICH SCREEN was open and what had JUST STARTED (the "before" list).
//   • timed(name, fn) — wraps a risky operation (reading the phone's call log, a sync …) and records it when it is slow.
//     That shows e.g. "callLog.read(500) took 3.8 s".
//   • The log is kept on the phone (last 80 entries) and can be viewed / shared from Profile → Performance log.
//
// It costs almost nothing (one tiny timer) and never sends anything anywhere by itself.
// The logic is in createStallMonitor() (no React Native in it) so it can be tested; the singleton at the bottom wires it up.
// ─────────────────────────────────────────────────────────────────────────────

export function createStallMonitor({
  now = Date.now,
  storage = null,                         // { getItem, setItem, removeItem }
  schedule = (fn, ms) => setInterval(fn, ms),
  cancel = (id) => clearInterval(id),
  getAppState = () => 'active',
  tickMs = 250,
  stallMs = 700,                          // blocked this long (beyond the normal tick) → record it
  maxEntries = 80,
  maxRecent = 14,
  key = 'perf_log_v1',
} = {}) {
  let entries = [];
  let recent = [];                        // what happened lately: [{ t, name }]
  let route = '';
  let last = now();
  let timer = null;
  let saveTimer = null;

  const scheduleSave = () => {
    if (!storage || saveTimer) return;
    saveTimer = setTimeout(async () => {
      saveTimer = null;
      try { await storage.setItem(key, JSON.stringify(entries)); } catch { /* best effort */ }
    }, 2000);
  };
  const push = (e) => {
    entries.push(e);
    if (entries.length > maxEntries) entries.splice(0, entries.length - maxEntries);
    scheduleSave();
  };

  function mark(name) {
    recent.push({ t: now(), name: String(name) });
    if (recent.length > maxRecent) recent.shift();
  }
  function setRoute(name) {
    const r = name || '';
    if (r === route) return;
    route = r;
    mark(`screen → ${r}`);
  }

  // What started shortly before (or during) a block — "…" lines are operations that began; the stall is attributed to them.
  const beforeOf = (t, windowMs) => recent
    .filter((r) => r.t >= t - windowMs)
    .map((r) => `${((t - r.t) / 1000).toFixed(1)}s earlier: ${r.name}`);

  function beat() {
    const t = now();
    const late = t - last - tickMs;                          // how late this tick fired
    const gap  = t - last;
    last = t;
    if (getAppState() !== 'active') return;                  // timers pause in the background — not a freeze
    // NOTE: no grace period after coming back to the app. A freeze right after opening the app is exactly what we are
    // hunting. Time spent in the background is excluded by appBecameActive() resetting `last`.
    if (late >= stallMs) push({ at: t, type: 'stall', ms: Math.round(late), route, before: beforeOf(t, gap + 1500) });
  }

  // Wrap an operation: always leaves a breadcrumb; slow ones become their own entry.
  async function timed(name, fn, slowMs = 300) {
    const t0 = now();
    mark(`${name} started`);
    try { return await fn(); }
    finally {
      const ms = now() - t0;
      mark(`${name} finished (${ms} ms)`);
      if (ms >= slowMs) push({ at: t0, type: 'slow', name, ms, route });
    }
  }

  async function load() {
    if (!storage) return;
    try {
      const raw = await storage.getItem(key);
      const saved = raw ? JSON.parse(raw) : [];
      if (Array.isArray(saved)) { entries = [...saved, ...entries].slice(-maxEntries); }
    } catch { /* corrupt → start fresh */ }
  }
  async function clear() {
    entries = []; recent = [];
    if (storage) { try { await storage.removeItem(key); } catch { /* ignore */ } }
  }
  // The phone suspends timers while the app is in the background; don't count that gap. A block AFTER this point does count.
  function appBecameActive() { last = now(); }

  function start() {
    if (timer) return;
    last = now();
    timer = schedule(beat, tickMs);
  }
  function stop() { if (timer) { cancel(timer); timer = null; } }

  const fmtTime = (ms) => {
    const d = new Date(ms); const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  function getEntries() { return entries.slice().reverse(); }                       // newest first
  function summary() {
    const stalls = entries.filter((e) => e.type === 'stall');
    return { stalls: stalls.length, worstMs: stalls.reduce((m, e) => Math.max(m, e.ms), 0), slowOps: entries.filter((e) => e.type === 'slow').length };
  }
  function format() {
    const s = summary();
    const lines = [`SkyUp CRM — performance log`, `${s.stalls} freeze(s), worst ${(s.worstMs / 1000).toFixed(1)} s; ${s.slowOps} slow operation(s)`, ''];
    for (const e of getEntries()) {
      if (e.type === 'stall') {
        lines.push(`${fmtTime(e.at)}  FROZE ${(e.ms / 1000).toFixed(1)} s on "${e.route || '?'}"`);
        (e.before || []).forEach((b) => lines.push(`      ${b}`));
      } else {
        lines.push(`${fmtTime(e.at)}  SLOW ${e.name}: ${(e.ms / 1000).toFixed(1)} s (screen "${e.route || '?'}")`);
      }
    }
    return lines.join('\n');
  }

  return { start, stop, mark, setRoute, timed, load, clear, appBecameActive, getEntries, summary, format, _entries: () => entries };
}

// ── the real one, wired to React Native ─────────────────────────────────────────
// (kept lazy so the pure part above can be imported in tests without React Native)
let _real = null;
function real() {
  if (_real) return _real;
  /* eslint-disable global-require */
  const { AppState } = require('react-native');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  _real = createStallMonitor({ storage: AsyncStorage, getAppState: () => AppState.currentState });
  AppState.addEventListener('change', (st) => { if (st === 'active') _real.appBecameActive(); });
  return _real;
}

export const startStallMonitor = async () => { const m = real(); await m.load(); m.start(); };
export const markEvent   = (name) => { try { real().mark(name); } catch { /* never let diagnostics break the app */ } };
export const setCurrentRoute = (name) => { try { real().setRoute(name); } catch { /* ignore */ } };
// Wrap an operation. If the monitor itself fails, the operation still runs.
export const timed = (name, fn, slowMs) => { let m; try { m = real(); } catch { return fn(); } return m.timed(name, fn, slowMs); };
export const getPerfLog   = () => real().getEntries();
export const getPerfSummary = () => real().summary();
export const formatPerfLog = () => real().format();
export const clearPerfLog = () => real().clear();
