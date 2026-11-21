// src/utils/serialQueue.js
// Runs async jobs ONE AT A TIME. A job that fails rejects only its own caller; the next job still runs.
//
// Two lanes: jobs run in the order they were requested, EXCEPT that a job submitted with { priority: 'high' } goes
// ahead of every job that is still WAITING (it never interrupts the one already running). Used for the phone's call
// log: the remark lookup right after a call and the call detector are time-sensitive and must not queue behind a
// background sync or a recording sweep.
export function makeSerialQueue() {
  const waiting = [];                 // { job, resolve, reject, priority }
  let running = false;
  let pending = 0;                    // waiting + running

  const next = () => {
    if (running || waiting.length === 0) return;
    let i = waiting.findIndex((w) => w.priority === 'high');   // first high-priority job, else the oldest
    if (i < 0) i = 0;
    const w = waiting.splice(i, 1)[0];
    running = true;
    Promise.resolve()
      .then(() => w.job())
      .then(w.resolve, w.reject)
      .then(() => { running = false; pending -= 1; next(); });
  };

  return {
    run(job, { priority = 'normal' } = {}) {
      pending += 1;
      return new Promise((resolve, reject) => { waiting.push({ job, resolve, reject, priority }); next(); });
    },
    get pending() { return pending; },
  };
}
