/* Atomic portable document: plan records remain isolated; tempo survives revisions. Legacy records are preserved. */
(() => {
  'use strict';
  const prefix = `lane50:${PREPARATION.revision}:`;
  const documentKey = prefix + 'records';
  const sharedKey = 'lane50:portable-v1';
  let profile = null, pendingProfile;
  function shared() {
    const raw = localStorage.getItem(sharedKey);
    if (!raw) return {version:1, plans:{}, tempo:null};
    const doc = JSON.parse(raw);
    if(doc.version !== 1 || !doc.plans || typeof doc.plans !== 'object' || Array.isArray(doc.plans)) throw new Error('Invalid portable records.');
    return doc;
  }
  const keys = [...PREPARATION.days.flatMap(day => ['session:'+day.id,...Object.keys(day.phases||{}).filter(key=>key!=='am').map(key=>'session:'+day.id+':'+key)]),
    'rehearsal:50', 'rehearsal:100', 'race:50', 'race:100', 'timer'];
  const clone = value => JSON.parse(JSON.stringify(value));
  let pending = {}, cached = {}, readError = false;
  function snapshot() {
    const portable = shared();
    profile = portable.tempo;
    if (Object.hasOwn(portable.plans, PREPARATION.revision)) {
      const records = portable.plans[PREPARATION.revision];
      if(!records || typeof records !== 'object' || Array.isArray(records)) throw new Error('Invalid plan records.');
      return records;
    }
    const raw = localStorage.getItem(documentKey);
    if (raw !== null) {
      const doc = JSON.parse(raw);
      if (doc.version !== 1 || !doc.records || typeof doc.records !== 'object' || Array.isArray(doc.records))
        throw new Error('Saved data could not be read.');
      return doc.records;
    }
    const records = {};
    // Race logistics/results describe the same two events. Carry them forward,
    // while replacement workouts start with fresh completion state.
    if(PREPARATION.previousRevision) {
      const previous = portable.plans[PREPARATION.previousRevision] || JSON.parse(localStorage.getItem('lane50:'+PREPARATION.previousRevision+':records') || 'null')?.records || {};
      for(const key of ['race:50','race:100','rehearsal:50','rehearsal:100']) {
        const record = previous[key] ?? JSON.parse(localStorage.getItem('lane50:'+PREPARATION.previousRevision+':'+key) || 'null');
        if(record) records[key] = record;
      }
    }
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
      if (Object.keys(pending).length || pendingProfile !== undefined) {
        const doc = shared();
        doc.plans[PREPARATION.revision] = records;
        if(pendingProfile !== undefined) doc.tempo = pendingProfile;
        localStorage.setItem(sharedKey, JSON.stringify(doc));
        profile = doc.tempo; pendingProfile = undefined;
      }
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
    get(key, fallback = {}) { if(key === 'tempo:profile') return clone(pendingProfile ?? profile ?? fallback); return clone(Object.hasOwn(pending, key) ? pending[key] : cached[key] ?? fallback); },
    save(key, value) {
      if(key === 'tempo:profile') { pendingProfile = clone(value); return flush(); }
      if (!keys.includes(key)) throw new Error('Unknown record.');
      pending[key] = clone(value);
      return flush();
    },
    retry: flush,
    get unsaved() { return Object.keys(pending).length > 0 || pendingProfile !== undefined; },
    get unavailable() { return readError; },
    records() { const records = {...cached, ...pending}; const tempo = pendingProfile ?? profile; if(tempo) records['tempo:profile'] = tempo; return clone(records); },
    // Restore validates first, then writes once; a failed write changes nothing.
    restore(records) {
      const latest = snapshot();
      const imported = clone(records), tempo = imported['tempo:profile'];
      delete imported['tempo:profile'];
      const merged = {...latest, ...pending, ...imported};
      const doc = shared(); doc.plans[PREPARATION.revision] = merged;
      doc.tempo = tempo ?? pendingProfile ?? profile;
      localStorage.setItem(sharedKey, JSON.stringify(doc));
      cached = merged; profile = doc.tempo; pendingProfile = undefined; pending = {}; readError = false; changed();
    },
  };
  window.addEventListener('beforeunload', event => {
    if (!LaneStorage.unsaved) return;
    event.preventDefault(); event.returnValue = '';
  });
})();
