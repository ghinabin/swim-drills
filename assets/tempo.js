/* Personal tempo calibration and standalone foreground player. */
(() => {
  'use strict';
  const labels = {easy:'Easy',hundred:'100 m rhythm',fifty:'50 m sprint rhythm',custom:'Custom'};
  const blank = () => ({version:1, targets:{}, observations:{}, mode:'arms'});
  let profile, selected = null, target, state = 'Ready', draft;
  try { profile = TempoCore.validateProfile(LaneStorage.get('tempo:profile',blank())); }
  catch (_) { profile = blank(); toast('Saved tempo data could not be read. Save a new calibration.'); }
  main.innerHTML = `<div class="page-intro"><h1>Freestyle Pace & Stroke Tempo Trainer</h1></div>
    <p>Find your own arm rhythm, then practise holding it. Tempo controls cadence; it does not predict race time.</p>
    <div class="tempo-grid" id="tempo-cards"></div>
    <div class="prep-controls" id="tempo-home-actions"><button class="button secondary" id="find-tempo">Find My Tempo</button><a class="text-link" href="#tempo-compare">Compare tempos</a><button class="text-button" id="export-tempos">Export tempos</button></div>
    <section class="prep-panel" id="tempo-player" hidden aria-labelledby="player-heading">
      <h2 id="player-heading">Tempo player</h2><p id="player-pace"></p>
      <div class="tempo-number"><strong id="player-rate"></strong><span id="player-unit"></span></div>
      <p id="player-interval"></p><p id="beep-meaning"></p><p class="tempo-state" id="player-state" role="status">Ready</p>
      <div class="prep-controls"><button class="button" id="player-start">Start</button><button class="button secondary" id="player-pause" disabled>Pause</button><button class="button secondary" id="player-stop">Stop</button></div>
      <div class="tempo-adjust"><button class="button secondary" data-adjust="-1">−1 SPM</button><button class="button secondary" data-adjust="1">+1 SPM</button></div>
      <details class="prep-details" id="player-settings"><summary>Sound & tempo settings</summary>
        <div class="tempo-adjust"><button class="button secondary" data-adjust="-2">−2 SPM</button><button class="button secondary" data-adjust="2">+2 SPM</button></div>
        <label>Beep for<select id="beep-mode"><option value="arms">Each arm entry</option><option value="cycles">Each complete right + left cycle</option></select></label>
        <label>Volume<input id="tempo-volume" type="range" min="0.05" max="0.7" step="0.05" value="0.35"></label>
        <button class="button secondary" id="test-sound">Test sound</button><button class="button secondary" id="save-target">Save this target</button>
        <p>Adjustments change individual-arm strokes/min. Supported range: 10–240, a technical limit rather than a recommended training range.</p>
      </details>
      <p class="prep-note">Test whether you can hear the cue in your actual pool setup. Keep this page visible; playback pauses when hidden. Screen wake lock is requested when supported.</p>
      <p class="prep-note">Audio tempo is a technique aid. Breathe normally and follow your coach's instructions.</p>
    </section>
    <section class="prep-panel" id="tempo-compare"><h2>Compare your tempos</h2><div class="tempo-table-wrap"><table class="tempo-table"><thead><tr><th>Pace</th><th>Arm SPM</th><th>Sec/stroke</th><th>25 m time</th></tr></thead><tbody id="comparison-rows"></tbody></table></div><p id="tempo-difference"></p></section>
    <p class="prep-note">Increase tempo only while you can still hold your catch, body position and kick. Faster arms do not automatically mean faster swimming.</p>
    <dialog class="prep-dialog" id="calibration-dialog" aria-labelledby="calibration-heading" data-trigger="find-tempo"><div class="prep-dialog-head"><h2 id="calibration-heading">Find My Tempo</h2><button class="text-button" data-close-dialog>Close</button></div>
      <p>Record one effort now; add the others later. Use a good freestyle length already appropriate to your session.</p>
      <form id="calibration-form"><div class="prep-form-grid">
        <label>Effort<select name="pace">${Object.entries(labels).filter(([k])=>k!=='custom').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
        <label>Method<select name="method"><option value="estimate">Quick 25 m estimate</option><option value="measured">Measured surface cadence</option></select></label>
        <label>Count unit<select name="unit"><option value="arms">Individual arm strokes</option><option value="cycles">Complete right + left cycles</option></select></label>
        <label>Pool length<select name="pool"><option value="25">25 m</option><option value="50">50 m</option></select></label>
        <label><span id="count-label">Stroke count over 25 m</span><input name="count" type="number" min="1" max="1000" step="1" inputmode="numeric" required></label>
        <label><span id="time-label">25 m time · seconds</span><input name="seconds" type="number" min="0.1" max="3600" step="any" inputmode="decimal" required></label>
        <label id="observed-time-label" hidden>Observed 25 m time · seconds (optional)<input name="time25" type="number" min="0.1" max="3600" step="any" inputmode="decimal"></label>
        <label>Perceived effort 1–10 (optional)<input name="effort" type="number" min="1" max="10" step="1" inputmode="numeric"></label>
      </div><p id="measurement-help">Count each arm entry: right = 1, left = 2. Whole-length time includes push-off/glide, so this is an estimate of average cadence over the length.</p>
      <p id="calibration-error" role="alert"></p><button class="button" type="submit">Review tempo</button></form>
      <section id="calibration-review" hidden><h3>Your target</h3><p id="calibration-result"></p><p>Listen and adjust in the player if needed. This is your observation, not a universal race target.</p><button class="button" id="save-calibration">Save target</button></section>
    </dialog>
    <dialog class="prep-dialog" id="custom-dialog" aria-labelledby="custom-heading"><div class="prep-dialog-head"><h2 id="custom-heading">Custom target</h2><button class="text-button" data-close-dialog>Close</button></div><form id="custom-form"><label>Individual-arm strokes/min<input id="custom-rate" type="number" min="10" max="240" step="any" inputmode="decimal" required></label><p>Manual target. Enter your own cadence; no calibration is required.</p><button class="button" type="submit">Save & open player</button></form></dialog>`;
  const audio = createTempoAudio(message => {
    state = message; paintPlayer();
    if (message === 'Playing') $('#player-settings').open = false;
  });
  function persist() { return save('tempo:profile',profile); }
  function paint() {
    $('#tempo-cards').innerHTML = Object.entries(labels).map(([key,label]) => {
      const value = profile.targets[key], o = profile.observations[key];
      return `<article class="prep-panel tempo-card"><h2>${label}</h2>${value != null ? `<strong class="tempo-card-rate">${value.toFixed(1)} <small>arm SPM</small></strong><p>${TempoCore.interval(value).toFixed(2)} sec/stroke</p><p class="prep-hint">${o ? `${Math.abs(value-TempoCore.calibrate(o.count,o.seconds,o.unit))>.001?'Adjusted target from ':''}${o.method==='estimate'?'length estimate':'measured cadence'} · ${new Date(o.date).toLocaleDateString()} · ${o.pool} m pool` : 'Manual target'}</p>` : '<p>Not calibrated yet</p>'}<button class="button secondary" data-pace="${key}">${value != null ? 'Open player' : key==='custom' ? 'Enter target' : 'Find my tempo'}</button>${key==='custom' && value!=null?'<button class="text-button" id="edit-custom">Edit target</button>':''}</article>`;
    }).join('');
    document.querySelectorAll('[data-pace]').forEach(button => button.onclick = () => {
      const key = button.dataset.pace;
      if (profile.targets[key] != null) openPlayer(key);
      else if (key==='custom') openCustom(button);
      else openCalibration(button,key);
    });
    $('#edit-custom')?.addEventListener('click',event=>openCustom(event.currentTarget));
    $('#comparison-rows').innerHTML = ['easy','hundred','fifty'].map(key => {
      const value = profile.targets[key], o = profile.observations[key];
      return `<tr><th scope="row">${labels[key]}</th><td>${value == null ? 'Not recorded' : value.toFixed(1)}</td><td>${value == null ? '—' : TempoCore.interval(value).toFixed(2)}</td><td>${o?.time25 == null ? '—' : o.time25.toFixed(2)+' s'}</td></tr>`;
    }).join('');
    const {fifty,hundred} = profile.targets;
    $('#tempo-difference').textContent = fifty != null && hundred != null ? `50 m cadence vs 100 m cadence: ${fifty-hundred>=0?'+':''}${(fifty-hundred).toFixed(1)} arm SPM. This difference is descriptive, not a quality score.` : 'Calibrate both race rhythms to compare cadence.';
  }
  function configure() { audio.configure(target,profile.mode,Number($('#tempo-volume').value)); }
  function paintPlayer() {
    if (selected == null) return;
    $('#player-pace').textContent = labels[selected];
    $('#player-rate').textContent = (profile.mode==='cycles'?target/2:target).toFixed(1);
    $('#player-unit').textContent = profile.mode==='cycles'?'CYCLES / MIN':'ARM STROKES / MIN';
    $('#player-interval').textContent = `${TempoCore.interval(target,profile.mode).toFixed(2)} SEC / ${profile.mode==='cycles'?'CYCLE':'STROKE'}`;
    $('#beep-meaning').textContent = profile.mode==='cycles' ? `One beep per complete right + left cycle · ${target.toFixed(1)} arm SPM` : 'One beep per arm entry: right, left, right, left.';
    $('#player-state').textContent = state;
    $('#player-start').disabled = audio.running;
    $('#player-start').textContent = state==='Ready'?'Start':'Resume';
    $('#player-pause').disabled = !audio.running;
    $('#test-sound').disabled = audio.running;
    document.body.classList.toggle('tempo-playing',audio.running);
    document.querySelectorAll('[data-adjust]').forEach(b => b.disabled = target+Number(b.dataset.adjust)<TempoCore.MIN || target+Number(b.dataset.adjust)>TempoCore.MAX);
  }
  function openPlayer(key) {
    audio.stop(); selected = key; target = profile.targets[key];
    $('#tempo-player').hidden = false; $('#beep-mode').value = profile.mode;
    configure(); paintPlayer(); $('#tempo-player').scrollIntoView({block:'start'}); $('#player-start').focus({preventScroll:true});
  }
  function openCalibration(trigger,key='easy') {
    audio.stop(); $('#calibration-form').reset(); $('#calibration-form').elements.pace.value = key; help();
    draft = null; $('#calibration-review').hidden = true; $('#calibration-error').textContent = '';
    SwimNavigation.openDialog($('#calibration-dialog'),trigger);
  }
  function openCustom(trigger) { audio.stop(); $('#custom-rate').value = profile.targets.custom ?? ''; SwimNavigation.openDialog($('#custom-dialog'),trigger); }
  $('#find-tempo').onclick = e => openCalibration(e.currentTarget);
  const form = $('#calibration-form');
  function help() {
    const measured = form.elements.method.value==='measured', cycles=form.elements.unit.value==='cycles';
    $('#count-label').textContent = `${cycles?'Cycle':'Stroke'} count ${measured?'in observation window':'over 25 m'}`;
    $('#time-label').textContent = measured?'Surface observation window · seconds':'25 m time · seconds';
    $('#observed-time-label').hidden = !measured;
    $('#measurement-help').textContent = (cycles?'Count a complete right + left pair as one cycle. ':'Count each arm entry: right = 1, left = 2. ') + (measured?'Count during a fixed timed surface-swimming window. Exclude push-off, glide and wall time.':'Whole-length time includes push-off/glide, so this is an estimate of average cadence over the length.');
    draft = null; $('#calibration-review').hidden = true;
  }
  form.addEventListener('input',() => { draft = null; $('#calibration-review').hidden = true; });
  form.elements.method.onchange = help; form.elements.unit.onchange = help;
  form.onsubmit = event => {
    event.preventDefault();
    const e = form.elements;
    try {
      const spm = TempoCore.calibrate(Number(e.count.value),Number(e.seconds.value),e.unit.value);
      const observation = {method:e.method.value,count:Number(e.count.value),seconds:Number(e.seconds.value),unit:e.unit.value,pool:Number(e.pool.value),date:new Date().toISOString(),time25:e.method.value==='estimate'?Number(e.seconds.value):e.time25.value?Number(e.time25.value):null,effort:e.effort.value?Number(e.effort.value):null};
      draft = {key:e.pace.value,spm,observation};
      $('#calibration-error').textContent = ''; $('#calibration-review').hidden = false;
      $('#calibration-result').textContent = `${spm.toFixed(1)} arm strokes/min · ${TempoCore.interval(spm).toFixed(2)} sec/stroke · ${observation.method==='estimate'?'Length estimate':'Measured surface cadence'}`;
    } catch (error) { draft = null; $('#calibration-error').textContent = error.message; }
  };
  $('#save-calibration').onclick = () => {
    if (!draft) return;
    const {key,spm,observation} = draft;
    profile.targets[key] = spm; profile.observations[key] = observation; persist(); paint();
    $('#calibration-dialog [data-close-dialog]').click(); openPlayer(key);
  };
  $('#custom-form').onsubmit = event => { event.preventDefault(); profile.targets.custom = TempoCore.rate(Number($('#custom-rate').value)); persist(); paint(); $('#custom-dialog [data-close-dialog]').click(); openPlayer('custom'); };
  $('#player-start').onclick = async () => { $('#player-start').disabled = true; try { await audio.start(); } catch(error) { state=error.message; paintPlayer(); } };
  $('#player-pause').onclick = () => audio.pause(); $('#player-stop').onclick = () => audio.stop();
  document.querySelectorAll('[data-adjust]').forEach(b => b.onclick = () => { target=TempoCore.rate(target+Number(b.dataset.adjust)); configure(); paintPlayer(); });
  $('#beep-mode').onchange = () => { profile.mode=$('#beep-mode').value; configure(); persist(); paintPlayer(); };
  $('#tempo-volume').oninput = configure;
  $('#test-sound').onclick = async () => { try { await audio.test(); } catch(error) { state=error.message; paintPlayer(); } };
  $('#save-target').onclick = () => { profile.targets[selected]=target; if(persist())toast('Target saved on this device.'); paint(); };
  $('#export-tempos').onclick = () => {
    const blob = new Blob([JSON.stringify({format:'lane50-backup',version:1,planRevision:PREPARATION.revision,records:{'tempo:profile':profile}},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob), link=document.createElement('a'); link.href=url; link.download='lane50-tempos.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  paint();
})();
