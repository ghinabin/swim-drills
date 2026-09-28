/* One atomic document per plan. Legacy records are read without being deleted. */
(() => {
  'use strict';
  const prefix = `lane50:${PREPARATION.revision}:`;
  const documentKey = prefix + 'records';
  const keys = [...PREPARATION.days.map(day => 'session:' + day.id),
    'rehearsal:50', 'rehearsal:100', 'race:50', 'race:100', 'timer'];
  const clone = value => JSON.parse(JSON.stringify(value));
  let pending = {}, cached = {}, readError = false;
  function snapshot() {
    const raw = localStorage.getItem(documentKey);
    if (raw !== null) {
      const doc = JSON.parse(raw);
      if (doc.version !== 1 || !doc.records || typeof doc.records !== 'object' || Array.isArray(doc.records))
        throw new Error('Saved data could not be read.');
      return doc.records;
    }
    const records = {};
    for (const key of keys) {
      const value = localStorage.getItem(prefix + key);
      if (value !== null) records[key] = JSON.parse(value);
    }
    return records;
  }
  try { cached = snapshot(); } catch (_) { readError = true; }
  const changed = () => document.dispatchEvent(new Event('lane:storage'));
  function flush() {
    try {
      const latest = snapshot();
      const records = {...latest, ...pending};
      if (Object.keys(pending).length) localStorage.setItem(documentKey, JSON.stringify({version:1, records}));
      cached = records;
      pending = {};
      readError = false;
      changed();
      return true;
    } catch (_) {
      changed();
      return false;
    }
  }
  window.LaneStorage = {
    get(key, fallback = {}) { return clone(Object.hasOwn(pending, key) ? pending[key] : cached[key] ?? fallback); },
    save(key, value) {
      if (!keys.includes(key)) throw new Error('Unknown record.');
      pending[key] = clone(value);
      return flush();
    },
    retry: flush,
    get unsaved() { return Object.keys(pending).length > 0; },
    get unavailable() { return readError; },
    records() { return clone({...cached, ...pending}); },
    // Restore validates first, then writes once; a failed write changes nothing.
    restore(records) {
      const latest = snapshot();
      const merged = {...latest, ...pending, ...clone(records)};
      localStorage.setItem(documentKey, JSON.stringify({version:1, records:merged}));
      cached = merged; pending = {}; readError = false; changed();
    },
  };
  window.addEventListener('beforeunload', event => {
    if (!LaneStorage.unsaved) return;
    event.preventDefault(); event.returnValue = '';
  });
})();
