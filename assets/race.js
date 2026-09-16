/* Independent race practice: audio-clock starts, durable local records. */
(() => {
  const PREFIX = 'lane50:race:';
  const ACTIVE = 'lane50:active-race';
  let audio, marks, startSignalBuffer, nodes = [], timeout, frame, wake, run, origin, verified = false, busy = false;
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
    try {
      const rows = records();
      $('race-log').innerHTML = rows.length ? rows.map(r => `<article class="race-record"><div><strong>${escapeHTML(r.distance)} m ${escapeHTML(r.stroke)}</strong><p>${escapeHTML(new Date(r.created).toLocaleString())} · ${escapeHTML(r.pool)} m pool</p><p>${escapeHTML(r.status)} · ${r.mode === 'solo' && r.elapsed == null ? 'Solo start practice' : 'Manual finish'}</p></div><strong>${r.elapsed == null ? '—' : fmt(r.elapsed)}</strong></article>`).join('') : '<p>No races yet. Your first start belongs here.</p>';
    } catch (_) { $('race-log').textContent = 'Race history is unavailable because browser storage is blocked.'; }
  }
  main.innerHTML = `${intro('Race', 'Your own starter. Separate from your training plan.')}<section class="panel" id="race-setup"><h2 tabindex="-1">Set up your swim</h2><div class="race-fields"><label>Stroke<select id="race-stroke"><option>Freestyle</option><option>Backstroke</option><option>Breaststroke</option><option>Butterfly</option></select></label><label>Distance (m)<select id="race-distance"><option>50</option><option>100</option><option>200</option><option>400</option></select></label><label>Pool length (m)<select id="race-pool"><option>25</option><option>50</option></select></label><label>Time to get ready<select id="race-delay"><option value="15">15 seconds</option><option value="30">30 seconds</option><option value="60">60 seconds</option></select></label></div><p>Turn up media volume and test the start beep from your starting position, 3–4 metres away. Keep this screen open. Tap Finish to stop and save your time.</p><p>If the phone is too quiet over pool noise, use an external speaker and test again. Dive only where permitted and safe; otherwise push off.</p><div class="actions"><button class="button secondary" id="sound-test">Test voice + start beep</button></div><label class="sound-confirm"><input type="checkbox" id="sound-confirm" disabled> I heard the voice and start beep clearly</label><p id="sound-status" role="status">Test the sound before your first start.</p><button class="button" id="arm-race" disabled>Start race sequence</button></section><section class="panel race-live" id="race-live" hidden><p id="race-event"></p><h2 id="race-cue" role="status" aria-live="assertive"></h2><div id="race-clock" class="race-clock" role="timer" aria-label="Elapsed race time">0:00.00</div><p id="race-help"></p><button class="button race-finish" id="finish-race" hidden>Finish</button><button class="button secondary" id="cancel-race">Cancel start</button></section><section class="panel" id="race-result" hidden><h2 id="result-heading" tabindex="-1"></h2><p id="result-copy" role="status"></p><div class="actions"><button class="button" id="another-race">Set up another race</button><button class="button secondary" id="retry-save" hidden>Retry saving</button></div></section><details class="panel race-explainer"><summary>What will I hear?</summary><ol><li>Short whistles: get ready at the starting end.</li><li>Long whistle: step onto the block, or enter the water for backstroke.</li><li>Backstroke only: a second long whistle to take the starting position.</li><li>“Take your marks”: hold your starting position.</li><li>Short electronic beep: go. The timer starts with this signal.</li></ol><p>This is a practice simulation. Real officials wait for swimmers to be ready; our pauses are automated, with a variable pause before the start beep. Phone audio latency and manual stopping affect timing. The 0.25-second dual-tone beep follows the CTS start-signal format; its pitch is a practice approximation.</p><a class="text-link" href="https://www.worldaquatics.com/swimming/rules" target="_blank" rel="noopener">World Aquatics start rules ↗</a><p><a class="text-link" href="session.html?id=race">Open meet-day checklist →</a></p></details><section class="panel"><div class="section-title"><h2>Race log</h2><button class="text-button" id="export-races">Export races</button></div><p>Saved on this device. Race practice does not complete weekly sessions.</p><div id="race-log"></div></section>`;
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
  $('sound-test').onclick = async () => {
    if (busy) return; busy = true; $('sound-test').disabled = true;
    try { await prepare(); silence(); voice(audio.currentTime + .1); startSignal(audio.currentTime + .1 + marks.duration + .6);
      timeout = setTimeout(() => { verified = true; $('sound-confirm').disabled = false; $('sound-status').textContent = 'Confirm you heard both sounds clearly from your starting position.'; busy = false; $('sound-test').disabled = false; }, (marks.duration + startSignalBuffer.duration + .9) * 1000);
    } catch (_) { busy = false; $('sound-test').disabled = false; $('sound-status').textContent = 'Sound unavailable. Reconnect to download the voice, then test again.'; }
  };
  $('sound-confirm').onchange = () => $('arm-race').disabled = !(verified && $('sound-confirm').checked);
  function showRun() {
    $('race-setup').hidden = true; $('race-result').hidden = true; $('race-live').hidden = false;
    $('finish-race').hidden = true; $('cancel-race').textContent = 'Cancel start';
    $('race-event').textContent = `${run.distance} m ${run.stroke} · ${run.pool} m pool`;
    $('race-cue').tabIndex = -1; $('race-cue').focus();
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
      $('race-cue').textContent = 'Race in progress'; $('race-clock').textContent = fmt(Math.max(0, elapsed));
      $('finish-race').hidden = false; $('finish-race').textContent = 'Finish';
      $('cancel-race').textContent = 'Abandon race';
      $('race-help').textContent = run.recovered ? 'Recovered after leaving this screen. Timing is approximate.' : 'Tap Finish to stop the stopwatch and save your time.';
    }
    frame = requestAnimationFrame(tick);
  }
  $('arm-race').onclick = async () => {
    if (busy || run) return; busy = true; $('arm-race').disabled = true;
    try {
      await prepare(); silence();
      run = {id: crypto.randomUUID(), created: Date.now(), stroke: $('race-stroke').value, distance: Number($('race-distance').value), pool: Number($('race-pool').value), mode: 'manual', status: 'Starting'};
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
    } catch (_) { silence(); run = null; $('sound-status').textContent = 'Could not start. Check sound and allow browser storage, then retry.'; $('arm-race').disabled = false; }
    busy = false;
  };
  function saveResult() {
    try { localStorage.setItem(PREFIX + run.id, JSON.stringify(run)); localStorage.removeItem(ACTIVE); $('result-copy').textContent = 'Saved on this device.'; $('retry-save').hidden = true; $('another-race').disabled = false; run = null; log(); }
    catch (_) { $('result-copy').textContent = 'Not saved. Keep this page open and retry saving, or export your races.'; $('retry-save').hidden = false; $('another-race').disabled = true; }
  }
  function finish(status, elapsed = null) {
    silence(); release(); run.status = status; run.elapsed = elapsed;
    $('race-live').hidden = true; $('race-result').hidden = false;
    $('result-heading').textContent = elapsed == null ? status : `${fmt(elapsed)} · ${status}`;
    $('result-heading').focus(); saveResult();
  }
  $('finish-race').onclick = () => {
    if (run?.status !== 'Swimming') return;
    const elapsed = Math.max(0, origin == null ? Date.now() - run.started : performance.now() - origin);
    run.mode = 'manual';
    finish(run.recovered ? 'Finished · recovered timing' : 'Finished', elapsed);
  };
  $('cancel-race').onclick = () => { if (run) finish(run.status === 'Starting' ? 'Start cancelled' : 'Abandoned'); };
  $('retry-save').onclick = saveResult;
  $('another-race').onclick = () => { $('race-result').hidden = true; $('race-setup').hidden = false; $('arm-race').disabled = false; $('race-setup').querySelector('h2').focus(); };
  $('export-races').onclick = () => {
    try { const entries = records(); if (run) entries.push(run); const url = URL.createObjectURL(new Blob([JSON.stringify({exportedAt: new Date().toISOString(), races: entries}, null, 2)], {type: 'application/json'})); const a = document.createElement('a'); a.href = url; a.download = 'lane50-races.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (_) { toast('Export unavailable: browser storage could not be read.'); }
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
