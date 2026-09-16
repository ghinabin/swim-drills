/* Simple stopwatch with durable laps and local history. */
(() => {
  const PREFIX = 'lane50:race:';
  const ACTIVE = 'lane50:active-race';
  const toolsPage = document.body.hasAttribute('data-race-tools');
  let frame, wake, run, origin, audio, marks, startSignalBuffer, busy = false, nodes = [], timeout;
  const $ = id => document.getElementById(id);
  const fmt = ms => {
    const ticks = Math.floor(Math.max(0, ms) / 10);
    return `${Math.floor(ticks / 6000)}:${String(Math.floor(ticks / 100) % 60).padStart(2, '0')}.${String(ticks % 100).padStart(2, '0')}`;
  };
  function lapTable(r) {
    return `<ol class="lap-stamps">${(r.markers || []).map((marker, i) => `<li aria-label="Lap ${i + 1}: ${fmt(marker.elapsed)}">${fmt(marker.elapsed)}</li>`).reverse().join('')}</ol>`;
  }
  function renderTimings() {
    $('race-splits').innerHTML = run ? lapTable(run) : '';
    $('race-splits').scrollTop = 0;
  }
  function timingDetails(r) {
    if (r.lapMode === 'free') return lapTable(r);
    const markers = r.markers || [];
    const rows = [];
    let previous = {distance: 0, elapsed: 0};
    markers.forEach(marker => {
      if (marker.kind === 'split') {
        rows.push(`<li>${previous.distance}–${marker.distance} m: <strong>${fmt(marker.elapsed - previous.elapsed)}</strong><span>At ${fmt(marker.elapsed)}</span></li>`);
        previous = marker;
      } else {
        rows.push(`<li>${escapeHTML(marker.label)}: <strong>${fmt(marker.elapsed)}</strong><span>From start beep</span></li>`);
      }
    });
    if (r.elapsed != null && previous.distance > 0) {
      rows.push(`<li>${previous.distance}–${r.distance} m: <strong>${fmt(r.elapsed - previous.elapsed)}</strong><span>At finish</span></li>`);
    }
    return rows.length ? `<ul class="race-timings">${rows.join('')}</ul>` : '';
  }
  function elapsedNow() { return Math.max(0, origin == null ? Date.now() - run.started : performance.now() - origin); }
  function recordMarker() {
    if (run?.status !== 'Swimming') return;
    const elapsed = elapsedNow();
    (run.markers ||= []).push({kind: 'lap', label: `Lap ${run.markers.length + 1}`, elapsed});
    try { persist(); $('sound-status').textContent = ''; }
    catch (_) { $('sound-status').textContent = 'Lap captured. Keep this page open until saved.'; }
    vibrate();
    renderTimings();
    $('lap-announcement').textContent = `Lap ${run.markers.length}: ${fmt(elapsed)}`;
  }
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
      $('race-log').innerHTML = rows.length ? rows.map(r => `<article class="race-record"><div><strong>${r.distance ? escapeHTML(r.distance) + ' m ' + escapeHTML(r.stroke) : 'Stopwatch'}</strong><p>${escapeHTML(new Date(r.created).toLocaleString())}${r.pool ? ' · ' + escapeHTML(r.pool) + ' m pool' : ''}</p><p>${escapeHTML(r.status)} · ${r.mode === 'solo' && r.elapsed == null ? 'Solo start practice' : 'Manual finish'}</p>${timingDetails(r)}</div><strong>${r.elapsed == null ? '—' : fmt(r.elapsed)}</strong></article>`).join('') : '<p>No saved times yet.</p>';
    } catch (_) { $('race-log').textContent = 'Race history is unavailable because browser storage is blocked.'; }
  }
  main.innerHTML = toolsPage ? `
    <div class="stopwatch-page race-tools-page">
      <header class="stopwatch-header"><a class="stopwatch-back" href="race.html" aria-label="Back to timer">${icon('back')}</a><h1>Race history</h1></header>
      <section class="race-tool-section" aria-labelledby="history-title"><div class="section-title"><h2 id="history-title">Recent times</h2><button class="text-button" id="export-races">Export</button></div><p>Saved on this device.</p><div id="race-log"></div></section>
    </div>` : `
    <div class="stopwatch-page">
      <header class="stopwatch-header"><a class="stopwatch-back" href="index.html" aria-label="Back to overview">${icon('back')}</a><h1>Stopwatch</h1><a class="text-link" href="race-tools.html" aria-label="Race history">History</a></header>
      <section class="stopwatch" aria-label="Swim stopwatch">
        <div class="stopwatch-display" id="race-live">
          <div class="clock-face"><span id="timing-note" hidden title="Recovered timing is approximate" aria-label="Recovered timing is approximate">≈</span><p id="race-cue" role="status" aria-live="polite">Ready to swim</p><div id="race-clock" class="race-clock" role="timer" aria-label="Elapsed time">0:00.00</div><p class="clock-unit">MIN : SEC</p></div>
        </div>
        <section id="race-splits" tabindex="0" aria-label="Lap times, newest first"></section>
        <p id="lap-announcement" class="sr-only" role="status"></p>
        <div class="stopwatch-controls">
          <div class="stopwatch-actions">
            <button class="button lap-action" id="mark-race" disabled>Lap</button>
            <button class="button stopwatch-primary" id="arm-race">Start</button>
            <button class="button stopwatch-primary" id="finish-race" hidden>Finish</button>
            <button class="button stopwatch-primary" id="cancel-race" hidden>Cancel</button>
            <button class="button stopwatch-primary" id="another-race" hidden>Reset</button>
          </div>
          <div id="race-result" hidden><h2 id="result-heading" class="sr-only" tabindex="-1"></h2><p id="result-copy" role="status"></p><button class="text-button" id="retry-save" hidden>Retry saving</button></div>
          <p id="sound-status" role="status"></p>
        </div>
      </section>
    </div>`;
  function tone(at, duration, frequency) {
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.3, at + .015);
    gain.gain.setValueAtTime(.3, at + duration - .03); gain.gain.linearRampToValueAtTime(0, at + duration);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(at); oscillator.stop(at + duration); nodes.push(oscillator);
  }
  // CTS Infinity Pro documents a 0.25-second dual-tone electronic start.
  // Frequencies are our practice approximation, not a manufacturer waveform.
  // See README for the primary source.
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
  if ($('export-races')) $('export-races').onclick = () => {
    try { const entries = records(); if (run) entries.push(run); const url = URL.createObjectURL(new Blob([JSON.stringify({exportedAt: new Date().toISOString(), races: entries}, null, 2)], {type: 'application/json'})); const a = document.createElement('a'); a.href = url; a.download = 'lane50-races.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (_) { toast('Export unavailable: browser storage could not be read.'); }
  };
  if (toolsPage) {
    log();
    window.addEventListener('storage', e => { if (e.key?.startsWith(PREFIX)) log(); });
    window.addEventListener('pagehide', silence);
    return;
  }
  $('mark-race').onclick = recordMarker;
  function showRun() {
    $('race-result').hidden = true; $('arm-race').hidden = true; $('another-race').hidden = true;
    $('finish-race').hidden = run.status !== 'Swimming'; $('mark-race').disabled = run.status !== 'Swimming';
    $('cancel-race').hidden = run.status !== 'Starting';
    $('sound-status').textContent = '';
    $('timing-note').hidden = !run.recovered;
    document.querySelector('.stopwatch').dataset.state = run.status === 'Starting' ? 'starting' : 'swimming';
    $('race-cue').textContent = run.status === 'Starting' ? 'Get ready' : 'Swimming';
    renderTimings();
  }
  function tick() {
    if (!run) return;
    if (run.status === 'Starting') {
      const now = audio.currentTime;
      $('race-cue').textContent = now < run.shortAt ? 'Get ready' : now < run.longAt ? 'Short whistles' : now < run.voiceAt ? 'Take your position' : 'Take your marks';
      $('race-clock').textContent = now < run.shortAt ? `${Math.ceil(run.shortAt - now)} s` : '0:00.00';
      if (now >= run.audioStart) {
        run.status = 'Swimming';
        try { persist(); } catch (_) {}
        showRun();
      }
    }
    if (run.status === 'Swimming') $('race-clock').textContent = fmt(elapsedNow());
    frame = requestAnimationFrame(tick);
  }
  $('arm-race').onclick = async () => {
    if (busy || run) return;
    busy = true; $('arm-race').disabled = true;
    try {
      await prepare(); silence();
      if (document.hidden) throw Error('Page hidden');
      run = {id: crypto.randomUUID(), created: Date.now(), mode: 'manual', status: 'Starting', lapMode: 'free', markers: []};
      run.shortAt = audio.currentTime + 5;
      run.longAt = run.shortAt + 2;
      run.voiceAt = run.longAt + 6;
      run.audioStart = run.voiceAt + marks.duration + 1.5 + Math.random() * 1.5;
      const delay = (run.audioStart - audio.currentTime) * 1000;
      run.started = Date.now() + delay; origin = performance.now() + delay;
      persist();
      for (let i = 0; i < 4; i++) tone(run.shortAt + i * .35, .16, 2400);
      tone(run.longAt, 1.2, 2400);
      voice(run.voiceAt); startSignal(run.audioStart);
      showRun(); tick(); keepAwake(); vibrate();
      $('cancel-race').focus({preventScroll: true});
    } catch (_) {
      silence(); run = null;
      $('sound-status').textContent = 'Could not start. Check sound and allow browser storage, then retry.';
    }
    busy = false; $('arm-race').disabled = false;
  };
  $('cancel-race').onclick = () => { if (run?.status === 'Starting') { vibrate(); finish('Start cancelled'); } };
  function saveResult() {
    try { localStorage.setItem(PREFIX + run.id, JSON.stringify(run)); localStorage.removeItem(ACTIVE); $('result-copy').classList.add('sr-only'); $('result-copy').textContent = 'Saved on this device.'; $('retry-save').hidden = true; $('another-race').disabled = false; run = null; log(); }
    catch (_) { $('result-copy').classList.remove('sr-only'); $('result-copy').textContent = 'Not saved. Keep this page open and retry saving.'; $('retry-save').hidden = false; $('another-race').disabled = true; }
  }
  function finish(status, elapsed = null) {
    silence(); release(); run.status = status; run.elapsed = elapsed;
    $('mark-race').disabled = true; $('cancel-race').hidden = true;
    $('race-cue').textContent = elapsed == null ? status : 'Finished';
    renderTimings();
    document.querySelector('.stopwatch').dataset.state = 'finished';
    $('race-result').hidden = false; $('arm-race').hidden = true; $('finish-race').hidden = true; $('another-race').hidden = false;
    $('race-clock').textContent = elapsed == null ? '0:00.00' : fmt(elapsed);
    $('result-heading').textContent = elapsed == null ? status : `${fmt(elapsed)} · ${status}`;
    saveResult(); $('another-race').focus({ preventScroll: true });
  }
  $('finish-race').onclick = () => {
    if (run?.status !== 'Swimming') return;
    const elapsed = elapsedNow();
    vibrate();
    run.mode = 'manual';
    finish(run.recovered ? 'Finished · recovered timing' : 'Finished', elapsed);
  };
  $('retry-save').onclick = saveResult;
  $('another-race').onclick = () => {
    $('race-result').hidden = true; $('another-race').hidden = true; $('arm-race').hidden = false; $('arm-race').disabled = false;
    vibrate();
    renderTimings(); $('sound-status').textContent = ''; $('timing-note').hidden = true;
    $('race-clock').textContent = '0:00.00'; $('race-cue').textContent = 'Ready to swim';
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
