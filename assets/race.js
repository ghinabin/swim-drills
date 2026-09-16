/* Independent race practice: audio-clock starts, durable local records. */
(() => {
  const PREFIX = 'lane50:race:';
  const ACTIVE = 'lane50:active-race';
  const toolsPage = document.body.hasAttribute('data-race-tools');
  let audio, marks, startSignalBuffer, nodes = [], timeout, frame, wake, run, origin, busy = false;
  const $ = id => document.getElementById(id);
  const fmt = ms => `${Math.floor(ms / 60000)}:${(ms / 1000 % 60).toFixed(2).padStart(5, '0')}`;
  function records() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(PREFIX)) { try { result.push(JSON.parse(localStorage.getItem(key))); } catch (_) {} }
    }
    return result.sort((a, b) => b.created - a.created);
  }
  function persist() { localStorage.setItem(ACTIVE, JSON.stringify(run)); }
  function log() {
    if (!$('race-log')) return;
    try {
      const rows = records();
      $('race-log').innerHTML = rows.length ? rows.map(r => `<article class="race-record"><div><strong>${escapeHTML(r.distance)} m ${escapeHTML(r.stroke)}</strong><p>${escapeHTML(new Date(r.created).toLocaleString())} · ${escapeHTML(r.pool)} m pool</p><p>${escapeHTML(r.status)} · ${r.mode === 'solo' && r.elapsed == null ? 'Solo start practice' : 'Manual finish'}</p></div><strong>${r.elapsed == null ? '—' : fmt(r.elapsed)}</strong></article>`).join('') : '<p>No races yet. Your first start belongs here.</p>';
    } catch (_) { $('race-log').textContent = 'Race history is unavailable because browser storage is blocked.'; }
  }
  main.innerHTML = toolsPage ? `
    <div class="stopwatch-page race-tools-page">
      <header class="stopwatch-header"><a class="stopwatch-back" href="race.html" aria-label="Back to timer">${icon('back')}</a><h1>Swim tools</h1></header>
      <section class="race-tool-section" aria-labelledby="history-title"><div class="section-title"><h2 id="history-title">Recent swims</h2><button class="text-button" id="export-races">Export</button></div><p>Saved on this device.</p><div id="race-log"></div></section>
      <section class="race-tool-section" aria-labelledby="sound-title"><h2 id="sound-title">Sound & start</h2><p>Turn up media volume and test from your starting position. Keep the timer screen open during your swim.</p><button class="button secondary" id="sound-test">Test voice + beep</button><p id="sound-status" role="status"></p><details><summary>How the start works</summary><p>Your preparation countdown is followed by whistles, “Take your marks”, then the start beep. Timing starts at the beep. Tap Finish to save your time.</p><p>Dive only where permitted and safe; otherwise push off. Manual timing is for practice.</p></details></section>
    </div>` : `
    <div class="stopwatch-page">
      <header class="stopwatch-header"><a class="stopwatch-back" href="index.html" aria-label="Back to overview">${icon('back')}</a><h1>Race</h1><a class="text-link" href="race-tools.html" aria-label="Swim history and sound tools">Tools</a></header>
      <section class="stopwatch" aria-label="Swim stopwatch">
        <section id="race-setup" class="stopwatch-setup" aria-label="Swim setup">
          <button type="button" id="edit-swim" class="swim-summary" aria-expanded="false" aria-controls="swim-options"><span><span class="swim-summary-label">Your swim</span><strong id="swim-summary-main">50 m Freestyle</strong><span id="swim-summary-detail">25 m pool · 15 s to get ready</span></span><span id="swim-edit-label">Edit</span></button>
          <div id="swim-options" hidden><h2>Set up your swim</h2><div class="race-fields">
            <label>Stroke<select id="race-stroke"><option>Freestyle</option><option>Backstroke</option><option>Breaststroke</option><option>Butterfly</option></select></label>
            <label>Distance<select id="race-distance"><option value="50">50 m</option><option value="100">100 m</option><option value="200">200 m</option><option value="400">400 m</option></select></label>
            <label>Pool length<select id="race-pool"><option value="25">25 m</option><option value="50">50 m</option></select></label>
            <label>Get ready<select id="race-delay"><option value="15">15 seconds</option><option value="30">30 seconds</option><option value="60">60 seconds</option></select></label>
          </div><button type="button" class="text-button" id="done-swim">Done</button></div>
        </section>
        <div class="stopwatch-display" id="race-live">
          <p id="race-event" class="sr-only">50 m Freestyle · 25 m pool</p>
          <div class="clock-face"><p id="race-cue" role="status" aria-live="polite">Ready to swim</p><div id="race-clock" class="race-clock" role="timer" aria-label="Elapsed race time">0:00.00</div><p class="clock-unit">MIN : SEC</p></div>
          <p id="race-help">Your timer starts with the beep.</p>
        </div>
        <div class="stopwatch-controls">
          <button class="button stopwatch-primary" id="arm-race">Start</button>
          <button class="button stopwatch-primary" id="finish-race" hidden>Finish</button>
          <button class="button stopwatch-primary" id="another-race" hidden>Swim again</button>
          <button class="text-button stopwatch-cancel" id="cancel-race" hidden>Cancel start</button>
          <div id="race-result" hidden><h2 id="result-heading" class="sr-only" tabindex="-1"></h2><p id="result-copy" role="status"></p><button class="text-button" id="retry-save" hidden>Retry saving</button></div>
          <p id="sound-status" role="status"></p>
        </div>
      </section>
    </div>`;
  function setEditing(open) {
    $('swim-options').hidden = !open;
    $('edit-swim').setAttribute('aria-expanded', String(open));
    $('swim-edit-label').textContent = open ? 'Close' : 'Edit';
  }
  function lockSetup(locked) {
    document.querySelectorAll('.race-fields select').forEach(select => { select.disabled = locked; });
    $('edit-swim').disabled = locked;
    if (locked) setEditing(false);
  }
  function eventSummary() {
    const stroke = $('race-stroke').value, distance = $('race-distance').value, pool = $('race-pool').value;
    $('swim-summary-main').textContent = `${distance} m ${stroke}`;
    $('swim-summary-detail').textContent = `${pool} m pool · ${$('race-delay').value} s to get ready`;
    $('race-event').textContent = `${distance} m ${stroke} · ${pool} m pool`;
  }
  function tone(at, duration, frequency) {
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.3, at + .015);
    gain.gain.setValueAtTime(.3, at + duration - .03); gain.gain.linearRampToValueAtTime(0, at + duration);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(at); oscillator.stop(at + duration); nodes.push(oscillator);
  }
  // CTS Infinity Pro documents a 0.25-second dual-tone electronic start.
  // Frequencies are our practice approximation, not a manufacturer waveform.
  // See README for the primary source. Same buffer for sound check and start.
  function createStartSignal() {
    const duration = .25;
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
    const samples = buffer.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / audio.sampleRate;
      // Brief ramps avoid clicks while preserving a sharp, unambiguous onset.
      const envelope = Math.min(1, t / .002, (duration - t) / .005);
      samples[i] = envelope * (Math.sin(2 * Math.PI * 1000 * t) + Math.sin(2 * Math.PI * 1500 * t));
      peak = Math.max(peak, Math.abs(samples[i]));
    }
    for (let i = 0; i < samples.length; i++) samples[i] *= .95 / peak;
    return buffer;
  }
  function startSignal(at) {
    const source = audio.createBufferSource();
    source.buffer = startSignalBuffer;
    source.connect(audio.destination);
    source.start(at);
    nodes.push(source);
  }
  function voice(at) { const source = audio.createBufferSource(); source.buffer = marks; source.connect(audio.destination); source.start(at); nodes.push(source); }
  async function prepare() {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.onstatechange = () => { if (audio.state !== 'running') interrupt(); };
    await audio.resume();
    if (audio.state !== 'running') throw Error('Audio unavailable');
    startSignalBuffer ||= createStartSignal();
    if (!marks) { const response = await fetch('assets/take-your-marks.wav'); if (!response.ok) throw Error('Voice unavailable'); marks = await audio.decodeAudioData(await response.arrayBuffer()); if (marks.duration < .3) throw Error('Voice unavailable'); }
  }
  function silence() { nodes.forEach(n => { try { n.stop(); } catch (_) {} }); nodes = []; clearTimeout(timeout); cancelAnimationFrame(frame); }
  function release() { wake?.release().catch(() => {}); wake = null; }
  async function keepAwake() { try { wake = await navigator.wakeLock?.request('screen'); } catch (_) {} }
  if ($('sound-test')) $('sound-test').onclick = async () => {
    if (busy || run) return;
    busy = true; $('sound-test').disabled = true;
    $('sound-status').textContent = 'Playing voice + beep…';
    try {
      await prepare(); silence(); voice(audio.currentTime + .1); startSignal(audio.currentTime + .1 + marks.duration + .6);
      timeout = setTimeout(() => {
        $('sound-status').textContent = 'Sound test complete. Ready when you are.';
        busy = false; $('sound-test').disabled = false;
      }, (marks.duration + startSignalBuffer.duration + .9) * 1000);
    } catch (_) {
      busy = false; $('sound-test').disabled = false;
      $('sound-status').textContent = 'Sound unavailable. Reconnect to download the voice, then try again.';
    }
  };
  if ($('export-races')) $('export-races').onclick = () => {
    try { const entries = records(); if (run) entries.push(run); const url = URL.createObjectURL(new Blob([JSON.stringify({exportedAt: new Date().toISOString(), races: entries}, null, 2)], {type: 'application/json'})); const a = document.createElement('a'); a.href = url; a.download = 'lane50-races.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (_) { toast('Export unavailable: browser storage could not be read.'); }
  };
  if (toolsPage) {
    log();
    window.addEventListener('storage', e => { if (e.key?.startsWith(PREFIX)) log(); });
    window.addEventListener('pagehide', silence);
    return;
  }
  $('edit-swim').onclick = () => setEditing($('swim-options').hidden);
  $('done-swim').onclick = () => { setEditing(false); $('edit-swim').focus(); };
  const fields = Array.from(document.querySelectorAll('.race-fields select'));
  try {
    const saved = JSON.parse(sessionStorage.getItem('lane50:swim-setup') || '{}');
    fields.forEach(select => {
      if (Array.from(select.options).some(option => option.value === saved[select.id])) select.value = saved[select.id];
    });
  } catch (_) {}
  eventSummary();
  fields.forEach(select => select.addEventListener('change', () => {
    eventSummary();
    try { sessionStorage.setItem('lane50:swim-setup', JSON.stringify(Object.fromEntries(fields.map(field => [field.id, field.value])))); } catch (_) {}
  }));
  function showRun() {
    lockSetup(true);
    $('swim-summary-main').textContent = `${run.distance} m ${run.stroke}`;
    $('swim-summary-detail').textContent = `${run.pool} m pool · ${run.preparation ? run.preparation + ' s preparation' : 'In progress'}`;
    $('race-result').hidden = true; $('arm-race').hidden = true; $('another-race').hidden = true;
    $('finish-race').hidden = true; $('cancel-race').hidden = false; $('cancel-race').textContent = 'Cancel start';
    $('sound-status').textContent = '';
    $('race-event').textContent = `${run.distance} m ${run.stroke} · ${run.pool} m pool`;
    $('race-cue').tabIndex = -1; $('race-cue').focus({ preventScroll: true });
    document.querySelector('.stopwatch').dataset.state = 'starting';
  }
  function tick() {
    if (!run) return;
    const elapsed = origin == null ? Date.now() - run.started : performance.now() - origin;
    if (run.status === 'Starting') {
      const now = audio.currentTime;
      if (now >= run.audioStart) { run.status = 'Swimming'; try { persist(); } catch (_) {} }
      $('race-cue').textContent = now < run.shortAt ? 'Get ready' : now < run.longAt ? 'Short whistles' : now < run.voiceAt ? (run.stroke === 'Backstroke' ? 'Enter water · take position' : 'Take your position') : now < run.audioStart ? 'Take your marks' : 'Go!';
      $('race-clock').textContent = now < run.shortAt ? `${Math.ceil(run.shortAt - now)} s` : '0:00.00';
      $('race-help').textContent = 'Wait for the start beep. Keep this screen open.';
    }
    if (run.status === 'Swimming') {
      document.querySelector('.stopwatch').dataset.state = 'swimming';
      $('race-cue').textContent = 'Swimming'; $('race-clock').textContent = fmt(Math.max(0, elapsed));
      $('finish-race').hidden = false; $('finish-race').textContent = 'Finish';
      $('cancel-race').hidden = true;
      $('race-help').textContent = run.recovered ? 'Recovered after leaving this screen. Timing is approximate.' : 'Tap Finish to stop the stopwatch and save your time.';
    }
    frame = requestAnimationFrame(tick);
  }
  $('arm-race').onclick = async () => {
    if (busy || run) return; busy = true; lockSetup(true); $('arm-race').disabled = true; $('arm-race').textContent = 'Starting…';
    try {
      await prepare(); silence();
      run = {id: crypto.randomUUID(), created: Date.now(), stroke: $('race-stroke').value, distance: Number($('race-distance').value), pool: Number($('race-pool').value), preparation: Number($('race-delay').value), mode: 'manual', status: 'Starting'};
      run.shortAt = audio.currentTime + Number($('race-delay').value);
      run.longAt = run.shortAt + 2;
      run.voiceAt = run.longAt + (run.stroke === 'Backstroke' ? 11 : 6);
      run.audioStart = run.voiceAt + marks.duration + 1.5 + Math.random() * 1.5;
      const delay = (run.audioStart - audio.currentTime) * 1000;
      run.started = Date.now() + delay; origin = performance.now() + delay;
      persist(); // Refuse to arm if the attempt cannot be recovered.
      for (let i = 0; i < 4; i++) tone(run.shortAt + i * .35, .16, 2400);
      tone(run.longAt, 1.2, 2400);
      if (run.stroke === 'Backstroke') tone(run.longAt + 5, 1.2, 2400);
      voice(run.voiceAt); startSignal(run.audioStart);
      keepAwake(); showRun(); tick();
    } catch (_) { silence(); run = null; lockSetup(false); $('sound-status').textContent = 'Could not start. Check sound and allow browser storage, then retry.'; $('arm-race').disabled = false; }
    busy = false; $('arm-race').textContent = 'Start';
  };
  function saveResult() {
    try { localStorage.setItem(PREFIX + run.id, JSON.stringify(run)); localStorage.removeItem(ACTIVE); $('result-copy').textContent = 'Saved on this device.'; $('retry-save').hidden = true; $('another-race').disabled = false; run = null; log(); }
    catch (_) { $('result-copy').textContent = 'Not saved. Keep this page open and retry saving.'; $('retry-save').hidden = false; $('another-race').disabled = true; }
  }
  function finish(status, elapsed = null) {
    silence(); release(); run.status = status; run.elapsed = elapsed;
    document.querySelector('.stopwatch').dataset.state = 'finished';
    $('race-result').hidden = false; $('arm-race').hidden = true; $('finish-race').hidden = true; $('cancel-race').hidden = true; $('another-race').hidden = false;
    $('race-clock').textContent = elapsed == null ? '0:00.00' : fmt(elapsed);
    $('race-cue').textContent = status;
    $('race-help').textContent = run.recovered ? 'Recovered timing · approximate' : 'Ready for another swim?';
    $('result-heading').textContent = elapsed == null ? status : `${fmt(elapsed)} · ${status}`;
    saveResult(); $('another-race').focus({ preventScroll: true });
  }
  $('finish-race').onclick = () => {
    if (run?.status !== 'Swimming') return;
    const elapsed = Math.max(0, origin == null ? Date.now() - run.started : performance.now() - origin);
    run.mode = 'manual';
    finish(run.recovered ? 'Finished · recovered timing' : 'Finished', elapsed);
  };
  $('cancel-race').onclick = () => { if (run) finish(run.status === 'Starting' ? 'Start cancelled' : 'Abandoned'); };
  $('retry-save').onclick = saveResult;
  $('another-race').onclick = () => {
    $('race-result').hidden = true; $('another-race').hidden = true; $('arm-race').hidden = false; $('arm-race').disabled = false;
    lockSetup(false); eventSummary();
    $('race-clock').textContent = '0:00.00'; $('race-cue').textContent = 'Ready to swim'; $('race-help').textContent = 'Your timer starts with the beep.';
    document.querySelector('.stopwatch').dataset.state = 'ready';
    $('arm-race').focus({ preventScroll: true });
  };
  function interrupt() { if (run?.status === 'Starting') finish('Start interrupted · no time'); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { interrupt(); release(); } else if (run?.status === 'Swimming') keepAwake(); });
  window.addEventListener('pagehide', () => { interrupt(); silence(); release(); });
  window.addEventListener('pageshow', e => { if (e.persisted && run?.status === 'Swimming') { cancelAnimationFrame(frame); tick(); } });
  window.addEventListener('storage', e => { if (e.key?.startsWith(PREFIX)) log(); });
  try {
    run = JSON.parse(localStorage.getItem(ACTIVE) || 'null');
    if (run) { if (run.status === 'Starting') finish('Start interrupted · no time'); else { run.recovered = true; origin = null; showRun(); tick(); } }
  } catch (_) { run = null; }
  log();
})();
