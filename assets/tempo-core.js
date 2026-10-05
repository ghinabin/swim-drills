/* Canonical rates always count individual arm entries. */
(function(root) {
  'use strict';
  const MIN = 10, MAX = 240;
  function rate(value) {
    if (!Number.isFinite(value) || value < MIN || value > MAX) throw new Error(`Enter a target between ${MIN} and ${MAX} arm strokes/min.`);
    return value;
  }
  function interval(spm, mode = 'arms') { if(!['arms','cycles'].includes(mode)) throw new Error('Unknown beep unit.'); return (mode === 'cycles' ? 120 : 60) / rate(spm); }
  function fromInterval(seconds, mode = 'arms') {
    if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('Interval must be positive.');
    return rate((mode === 'cycles' ? 120 : 60) / seconds);
  }
  function calibrate(count, seconds, unit = 'arms') {
    if (!['arms','cycles'].includes(unit) || !Number.isFinite(count) || count <= 0 || !Number.isFinite(seconds) || seconds <= 0) throw new Error('Enter a positive count and time.');
    return rate(count * (unit === 'cycles' ? 2 : 1) / seconds * 60);
  }
  function validateProfile(p) {
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    if (!object(p) || p.version !== 1 || !object(p.targets) || !object(p.observations) || !['arms','cycles'].includes(p.mode)) throw new Error('Invalid tempo profile.');
    if (Object.keys(p).some(k => !['version','targets','observations','mode'].includes(k))) throw new Error('Unknown tempo profile field.');
    for (const [key, value] of Object.entries(p.targets)) {
      if (!['easy','hundred','fifty','custom'].includes(key)) throw new Error('Unknown tempo target.');
      rate(value);
    }
    for (const [key, o] of Object.entries(p.observations)) {
      if (!['easy','hundred','fifty'].includes(key) || !o || !['estimate','measured'].includes(o.method) || ![25,50].includes(o.pool) || typeof o.date !== 'string' || !Number.isFinite(Date.parse(o.date))) throw new Error('Invalid calibration record.');
      if(Object.keys(o).some(k=>!['method','count','seconds','unit','pool','date','time25','effort'].includes(k)) || !Number.isInteger(o.count)) throw new Error('Invalid observation fields.');
      calibrate(o.count,o.seconds,o.unit);
      if (o.time25 != null && (!Number.isFinite(o.time25) || o.time25 <= 0)) throw new Error('Invalid length time.');
      if (o.effort != null && (!Number.isInteger(o.effort) || o.effort < 1 || o.effort > 10)) throw new Error('Invalid effort.');
    }
    return p;
  }
  const api = {MIN,MAX,rate,interval,fromInterval,calibrate,validateProfile};
  if (typeof module !== 'undefined') module.exports = api;
  else root.TempoCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
