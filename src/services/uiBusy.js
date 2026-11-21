// src/services/uiBusy.js
// ─────────────────────────────────────────────────────────────────────────────
// "The agent is typing a remark right now — don't hog the JS thread."
//
// WHY: the remark popup opens the instant a call ends, which is exactly when a
// burst of background work starts: post-call recording scans (RNFS.readDir over
// every recording folder, at 3s / 13s / 38s / 83s), call-log pushes (4s, 20s),
// the foreground sync, the follow-up check, the Recordings tab auto-scan and
// the Calls-by-Day refresh. InteractionManager.runAfterInteractions does NOT
// protect against this — typing in a TextInput is not an "interaction", so all
// of that work ran while the agent was typing and the popup froze / lagged.
//
// Lead Detail marks the UI busy while the remark popup is open. Heavy jobs call
// waitUntilUiIdle() first. A hard cap (MAX_BUSY_MS) means nothing can be held
// back forever if the popup is left open.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_BUSY_MS = 3 * 60 * 1000;   // never block background work longer than this
const SETTLE_MS   = 1500;            // let the close animation + save finish first

let _count = 0;
let _since = 0;
let _idleAt = 0;
const _waiters = new Set();

function _flush() {
  if (isUiBusy()) return;
  const list = [..._waiters];
  _waiters.clear();
  list.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
}

/** Lead Detail calls this with true when the remark popup opens, false when it closes. */
export function setRemarkEditing(on) {
  if (on) {
    if (_count === 0) _since = Date.now();
    _count += 1;
  } else {
    _count = Math.max(0, _count - 1);
    if (_count === 0) {
      _idleAt = Date.now();
      setTimeout(_flush, SETTLE_MS);
    }
  }
}

export function isUiBusy() {
  if (_count > 0) return Date.now() - _since < MAX_BUSY_MS;
  return Date.now() - _idleAt < SETTLE_MS;
}

/**
 * Resolves as soon as the remark popup is closed (plus a short settle delay),
 * or after maxWaitMs at the latest. Resolves immediately when the UI is idle.
 */
export function waitUntilUiIdle(maxWaitMs = MAX_BUSY_MS) {
  if (!isUiBusy()) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(poll);
      clearTimeout(cap);
      _waiters.delete(finish);
      resolve();
    };
    _waiters.add(finish);
    // Poll as a safety net (covers the MAX_BUSY_MS expiry and the settle window).
    const poll = setInterval(() => { if (!isUiBusy()) finish(); }, 2000);
    const cap  = setTimeout(finish, maxWaitMs);
  });
}
