/* Competition preparation. All visible prescriptions come from PREPARATION. */
'use strict';
const $ = selector => document.querySelector(selector);
const main = $('#main');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = localDate(new Date());
const days = PREPARATION.days;
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const prefix = `lane50:${PREPARATION.revision}:`;
let toastTimeout;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('#toast').classList.remove('show'), 5500);
}
function read(key, fallback={}) {
  try { return JSON.parse(localStorage.getItem(prefix+key)) ?? fallback; }
  catch (_) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(prefix+key, JSON.stringify(value)); return true; }
  catch (_) { toast('Not saved on this device. Keep this page open and try again.'); return false; }
}
const formatDate = key => new Date(key+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
const href = day => day.kind==='Race' ? `race.html?event=${day.event}` : SwimNavigation.sessionURL(day.id);
const distance = day => day.distanceLabel || `${day.total.toLocaleString()} m`;
const nextDay = days.find(d=>d.date>=today);
const intro = (title,sub='') => `<div class="page-intro"><div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div></div>`;
const navPaths = {overview:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 12h10m-5-5v10"/>',plan:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',race:'<path d="M5 21V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>'};
$('#navigation').innerHTML = [['overview','index.html','Today'],['plan','plan.html','Plan'],['race','race.html','Race']].map(([key,url,label])=>`<a class="nav-link ${(page===key || page==='session'&&key==='plan')?'active':''}" href="${url}" ${page===key?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${navPaths[key]}</svg><span>${label}</span></a>`).join('');
function sessionProgress(day) {
  const saved = read('session:'+day.id);
  const done = day.sets.filter(set => saved[set.id] === 'done').length;
  const skipped = day.sets.filter(set => saved[set.id] === 'skipped').length;
  return {done, skipped, started:done+skipped>0, finished:day.sets.length>0 && done+skipped===day.sets.length};
}
function resumeHref(day, progress=sessionProgress(day)) {
  const next=day.sets.find(set => !['done','skipped'].includes(read('session:'+day.id)[set.id]));
  return href(day)+(day.kind!=='Race'&&progress.started&&!progress.finished&&next?'#set-'+next.id:'');
}
function row(day) {
  const progress=sessionProgress(day), isToday=day.date===today;
  const type=day.kind==='Swim'?'Training':day.kind;
  const action=day.kind==='Rest'?'View rest day':day.kind==='Race'?'Race preparation':progress.finished?'Review session':progress.started?'Resume session':'View session';
  const state=day.kind==='Race'?(progress.finished?'Warm-up reviewed':progress.started?`${progress.done} of ${day.sets.length} warm-up sets done`:''):progress.finished?(progress.skipped?'Reviewed':'Complete'):progress.started?`${progress.done} of ${day.sets.length} sets done`:'';
  return `<a class="prep-day ${isToday?'is-today':''} ${day.kind==='Rest'?'is-rest':''} ${day.kind==='Race'?'is-race':''}" id="day-${day.id}" href="${resumeHref(day,progress)}"><span class="prep-day-top"><span class="prep-date">${esc(formatDate(day.date))}</span><span class="prep-day-badge ${isToday?'badge-today':''}">${isToday?'Today':esc(type)}</span></span><h3 class="prep-day-title">${esc(day.title)}</h3><span class="prep-day-distance">${esc(distance(day))}${day.kind==='Race'?'':day.kind==='Rest'?' · No pool training':` · ${day.sets.length} sets`}</span>${state?`<span class="prep-day-progress">${esc(state)}</span>`:''}<span class="prep-day-action">${action}<span class="prep-card-arrow" aria-hidden="true">↗</span></span></a>`;
}
function overview() {
  if (!nextDay) {
    main.innerHTML=intro('Preparation complete','September 26 – October 13, 2026')+'<section class="prep-panel"><h2>Your race block is complete.</h2><p>Your plan and saved results are still here.</p><a class="button" href="race.html">View results</a><a class="text-link" href="plan.html">View plan →</a></section>';
    return;
  }
  const d=nextDay, {started,finished}=sessionProgress(d);
  main.innerHTML=intro('Today','50 + 100 m freestyle · 25 m pool')+`<section class="prep-hero"><div class="eyebrow">${d.date===today?esc(formatDate(d.date)):'Plan starts '+esc(formatDate(d.date))}</div><h2>${esc(d.title)}</h2><p class="prep-distance">${esc(distance(d))}</p><p>${esc(d.focus)}</p><a class="button" href="${d.kind==='Rest'?'plan.html':resumeHref(d)}">${d.kind==='Rest'?'View plan':d.kind==='Race'?'Open race preparation':finished?'Review session':started?'Resume session':'Open session'} <span aria-hidden="true">→</span></a></section>`;
  const next=days[days.indexOf(d)+1];
  if(next) main.innerHTML+=`<section class="prep-section"><h2>Coming next</h2>${row(next)}</section>`;
  const race=days.find(x=>x.kind==='Race'&&x.date>=today);
  if(race&&d.kind!=='Race') main.innerHTML+=`<a class="prep-race-link" href="${href(race)}">${race.event} m freestyle · ${esc(formatDate(race.date))} <span aria-hidden="true">→</span></a>`;
}
function plan() {
  main.innerHTML=intro('Your plan','26 September – 13 October 2026 · 25 m pool')+`<a class="prep-find-day" data-jump href="#day-${(nextDay||days.at(-1)).id}">${nextDay?(nextDay.date===today?'Find today':'Find next day'):'Find races'} ↓</a>`;
  const weeks=[['26–27 September',days.slice(0,2)],['28 September – 4 October',days.slice(2,9)],['5–11 October',days.slice(9,16)],['Competition',days.slice(16)]];
  main.innerHTML+=weeks.map(([label,list])=>`<section class="prep-section prep-week"><h2>${label}</h2><div class="prep-timeline">${list.map(row).join('')}</div></section>`).join('');
  main.innerHTML+=`<details class="prep-details"><summary>Pool & schedule details</summary><p>25 m short-course pool · freestyle. Full rest day: Saturday only.</p><p>Normal training window: 7:30–9:00/9:30 AM. Race reporting times follow the meet schedule.</p><a class="text-link" href="SWIMMING-PLAN.md" download>Download full supplied plan →</a></details>`;
}
function techniqueDetails(){return `<details class="prep-details"><summary>Technique reminders</summary>${PREPARATION.techniques.map(([title,text])=>`<h3>${esc(title)}</h3><p>${esc(text)}</p>`).join('')}<p>Use normal practised racing breathing. No breath-hold test or hyperventilation.</p></details>`;}
function setCard(set,i,day) {
  const timers=!day.noTimer?set.timers.map((t,j)=>`<button class="prep-timer-button" data-timer-set="${set.id}" data-timer-index="${j}" aria-label="Rest timer: ${esc(set.name)}, ${esc(t.label)}, ${esc(set.rest)}"><span aria-hidden="true">◷</span> ${t.label==='Rest'?'Rest timer':esc(t.label)}<span aria-hidden="true">↗</span></button>`).join(''):'';
  return `<article class="prep-set" id="set-${set.id}"><div class="prep-set-top"><span class="prep-number">${String(i+1).padStart(2,'0')}</span><h2>${esc(set.name)}</h2><span class="prep-set-status"></span></div><p class="prep-prescription">${esc(set.prescription)}</p><p class="prep-set-meta">${set.optional?'Optional':set.prescription.includes('50–100')?'50–100 m':set.metres+' m total'}${set.effort?` · <button class="prep-effort" data-effort>${esc(set.effort)} ⓘ</button>`:''}</p>${set.cue?`<p class="prep-cue">${esc(set.cue)}</p>`:''}${set.rest?`<div class="prep-rest-group"><p class="prep-rest"><strong>Rest</strong> ${esc(set.rest)}</p>${timers?`<div class="prep-rest-actions">${timers}</div>`:''}</div>`:''}<div class="prep-controls prep-set-controls"><button class="button secondary prep-done" data-done="${set.id}" aria-pressed="false">Mark set done</button><button class="text-button" data-skip="${set.id}" aria-pressed="false">Skip set</button></div></article>`;
}
let activeDay;
function session() {
  activeDay=days.find(d=>d.id===params.get('id')) || (!params.has('id')?nextDay:null);
  if(!activeDay) {main.innerHTML=intro('Session not found','This link is from a previous plan.')+'<a class="button" href="plan.html">Open current plan</a>';return;}
  const d=activeDay;
  if(d.kind==='Race'){location.replace(href(d));return;}
  document.title=d.title+' · Lane 50';
  main.innerHTML=`<a class="prep-back" data-return href="${esc(SwimNavigation.returnURL())}">← ${esc(SwimNavigation.returnLabel())}</a>`+intro(d.title,formatDate(d.date)+' · '+distance(d)+(d.kind==='Rest'?'':' · 25 m pool'));
  if(d.kind==='Rest') {main.innerHTML+=`<section class="prep-panel"><p>${esc(d.focus)}</p></section>`;return;}
  main.innerHTML+=`<p class="prep-focus">${esc(d.focus)}</p>${d.note?`<p class="prep-note">${esc(d.note)}</p>`:''}${d.record?`<a class="text-link" data-jump href="#record-${d.record}">Record rehearsal ↓</a>`:''}<div class="prep-progress-bar"><p id="completion" class="prep-progress" role="status"></p><a id="next-set" class="prep-next-set" data-jump href="#set-s1">Next set ↓</a></div><div class="prep-sets">${d.sets.map((s,i)=>setCard(s,i,d)).join('')}</div>${d.record?recordForm(d.record):''}<details class="prep-details"><summary>Full instructions · ${esc(formatDate(d.date))}</summary><pre>${esc(d.source)}</pre></details>${techniqueDetails()}`;
  attachCompletion(d);
  attachSetControls(d);
  if(d.record) attachRecord(d.record);
}
function attachCompletion(day) {
  const state=read('session:'+day.id);
  function paint(){
    const next=day.sets.find(s=>!['done','skipped'].includes(state[s.id]));
    day.sets.forEach(s=>{
      const card=$('#set-'+s.id),done=state[s.id]==='done',skip=state[s.id]==='skipped';
      card.classList.toggle('is-done',done);card.classList.toggle('is-skipped',skip);card.classList.toggle('is-next',next?.id===s.id);
      card.querySelector('.prep-set-status').textContent=done?'Done':skip?'Skipped':next?.id===s.id?'Next':'';
      const b=card.querySelector('[data-done]');b.textContent=done?'✓ Done · undo':'Mark set done';b.setAttribute('aria-pressed',String(done));
      const sk=card.querySelector('[data-skip]');sk.textContent=skip?'Undo skip':'Skip set';sk.setAttribute('aria-pressed',String(skip));
    });
    const nextLink=$('#next-set');
    if(nextLink){nextLink.hidden=!next;if(next)nextLink.href='#set-'+next.id;}
    const done=day.sets.filter(s=>state[s.id]==='done').length,skipped=day.sets.filter(s=>state[s.id]==='skipped').length;
    $('#completion').textContent=`${done} of ${day.sets.length} sets done${skipped?` · ${skipped} skipped`:''}${!next?' · Session reviewed':''}`;
  }
  document.querySelectorAll('[data-done],[data-skip]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.done||b.dataset.skip, value=b.dataset.done?'done':'skipped';
    if(state[id]===value)delete state[id];else state[id]=value;
    save('session:'+day.id,state);paint();
  });paint();
}
function attachSetControls(day){
  document.querySelectorAll('[data-timer-set]').forEach(b=>b.onclick=()=>{
    const set=day.sets.find(s=>s.id===b.dataset.timerSet), timing=set.timers[Number(b.dataset.timerIndex)];
    openTimer(day,set,timing,b);
  });
  document.querySelectorAll('[data-effort]').forEach(b=>b.onclick=()=>SwimNavigation.openDialog($('#effort-dialog'),b));
}
function recordForm(event) {
  const stored=read('rehearsal:'+event),fields=event===50?[['p25','First 25 m'],['p50','Total 50 m']]:[['p25','At 25 m'],['p50','At 50 m'],['p75','At 75 m'],['p100','At 100 m']];
  return `<section class="prep-panel prep-record" id="record-${event}"><h2>${event} m rehearsal</h2><p>${event===50?'October 1 · record one timed swim.':'October 2 · elapsed times from the start, not individual length times.'}</p><p class="prep-hint">Seconds or m:ss.xx · optional · saved on this device</p><form data-record="${event}" novalidate><div class="prep-form-grid">${fields.map(([key,label])=>`<label>${label}<input name="${key}" inputmode="decimal" type="text" autocomplete="off" placeholder="${key==='p100'?'1:20.50':'20.50'}" value="${esc(stored[key]||'')}" aria-describedby="record-message-${event}"></label>`).join('')}${event===50?selectField('turn','Turn',['Good','Average','Poor'],stored.turn)+selectField('technique','Technique in last 15 m',['Good','Breaking down'],stored.technique):''}</div><p class="prep-form-message" id="record-message-${event}" role="status"></p><p class="prep-derived" id="derived-${event}"></p><button class="button secondary" type="submit">Save record</button></form></section>`;
}
function selectField(name,label,options,value){return `<label>${label}<select name="${name}"><option value="">Not recorded</option>${options.map(o=>`<option ${value===o?'selected':''}>${o}</option>`).join('')}</select></label>`;}
function seconds(value){
  if(!value?.trim())return null;
  const v=value.trim();
  if(!/^(?:\d+:)?\d+(?:\.\d{1,3})?$/.test(v))return NaN;
  const parts=v.split(':').map(Number);
  if(parts.length===2&&parts[1]>=60)return NaN;
  const n=parts.length===2?parts[0]*60+parts[1]:parts[0];return n>0?n:NaN;
}
function analyseRecord(record,event){
  const keys=event===50?['p25','p50']:['p25','p50','p75','p100'];
  let last=0, error='',derived=[];
  const values=keys.map(k=>seconds(record[k]));
  values.forEach((n,i)=>{if(n===null)return;if(!Number.isFinite(n))error='Enter a positive time in seconds or m:ss.xx.';else {if(n<=last)error='Elapsed times must increase at each distance.';last=n;}
    const before=i===0?0:values[i-1];
    if(Number.isFinite(n)&&before!==null&&Number.isFinite(before)&&n>before)derived.push(`${i*25}–${(i+1)*25} m: ${(n-before).toFixed(2)} s`);
  });
  return {error,text:error?'':derived.join(' · '),hasTime:values.some(n=>n!==null)};
}
function attachRecord(event){
  const form=$(`[data-record="${event}"]`),msg=$(`#record-message-${event}`),derived=$(`#derived-${event}`);
  function update(persist=false){
    const record=Object.fromEntries(new FormData(form)),analysis=analyseRecord(record,event);
    form.querySelectorAll('input').forEach(input=>input.setAttribute('aria-invalid',String(!!analysis.error)));
    derived.textContent=analysis.text;
    const saved=persist?save('rehearsal:'+event,record):true;
    msg.textContent=analysis.error || (persist?(saved?'Saved on this device.':'Not saved. Try Save record again.'):'');
    msg.classList.toggle('is-error',!!analysis.error||!saved);
  }
  form.oninput=()=>update(true);form.onchange=()=>update(true);form.onsubmit=e=>{e.preventDefault();update(true);};update();
}
function race(){
  const event=params.get('event')==='50'?50:params.get('event')==='100'?100:today>'2026-10-12'?100:50;
  const day=days.find(d=>d.event===event);activeDay=day;
  main.innerHTML=intro('Race preparation','25 m short course · freestyle')+`<nav class="prep-event-tabs" aria-label="Choose race"><a href="race.html?event=50" ${event===50?'aria-current="page"':''}>50 m <small>Mon Oct 12</small></a><a href="race.html?event=100" ${event===100?'aria-current="page"':''}>100 m <small>Tue Oct 13</small></a></nav><nav class="prep-quick-links" aria-label="Race sections"><a data-jump href="#warm-up">Warm-up</a><a data-jump href="#race-cues">Race cues</a><a data-jump href="#race-result">Results</a></nav><p class="prep-focus">${esc(day.focus)}</p><details class="prep-details prep-logistics"><summary id="reporting-summary">Reporting time · ${esc(read('race:'+event).reporting||'not set')}</summary><label>Reporting time <input id="reporting-time" type="time" value="${esc(read('race:'+event).reporting||'')}"></label><p class="prep-hint">Enter the official time when known.</p><p id="reporting-status" role="status"></p></details><section class="prep-section" id="warm-up"><h2>Warm-up</h2><p class="prep-distance">${esc(day.distanceLabel)}</p><p class="prep-note">${esc(day.note)}</p><p id="completion" class="prep-progress" role="status"></p>${day.sets.map((s,i)=>setCard(s,i,day)).join('')}</section><section class="prep-section" id="race-cues"><h2>Your ${event} m race</h2><div class="prep-race-cues">${day.raceCues.map(([label,text])=>`<article><h3>${esc(label)}</h3><p>${esc(text)}</p></article>`).join('')}</div></section>${day.after?`<section class="prep-panel"><h2>After the 50</h2><p>${esc(day.after)}</p></section>`:''}<section class="prep-panel" id="race-result"><h2>Official result</h2><label>Final ${event} m time<input id="official-result" type="text" inputmode="decimal" placeholder="Seconds or m:ss.xx" value="${esc(read('race:'+event).result||'')}" aria-describedby="official-status"></label><p id="official-status" role="status"></p><p class="prep-hint">Optional · saved on this device</p></section><details class="prep-details" id="rehearsal-results"><summary>Rehearsal results · Oct 1 & 2</summary>${recordForm(50)}${recordForm(100)}<button class="button secondary" id="copy-results">Copy results</button><p id="copy-status" role="status"></p><textarea id="copy-fallback" hidden readonly aria-label="Results to copy"></textarea></details>${techniqueDetails()}<details class="prep-details"><summary>Full race-day instructions</summary><pre>${esc(day.source)}</pre></details>`;
  attachCompletion(day);attachSetControls(day);attachRecord(50);attachRecord(100);
  const raceState=read('race:'+event);
  $('#reporting-time').oninput=e=>{raceState.reporting=e.target.value;$('#reporting-summary').textContent='Reporting time · '+(e.target.value||'not set');$('#reporting-status').textContent=save('race:'+event,raceState)?'Saved on this device.':'Not saved. Change the time to retry.';};
  $('#official-result').oninput=e=>{
    const n=seconds(e.target.value);raceState.result=e.target.value;
    const saved=save('race:'+event,raceState),error=n!==null&&!Number.isFinite(n);
    e.target.setAttribute('aria-invalid',String(error));$('#official-status').textContent=error?'Enter a positive time in seconds or m:ss.xx.':saved?'Saved on this device.':'Not saved. Edit the time to retry.';
  };
  const savedResult=seconds(raceState.result);
  if(savedResult!==null&&!Number.isFinite(savedResult)){ $('#official-result').setAttribute('aria-invalid','true');$('#official-status').textContent='Enter a positive time in seconds or m:ss.xx.'; }
  $('#copy-results').onclick=async()=>{
    const text=[50,100].map(e=>{
      const form=$(`[data-record="${e}"]`),r=Object.fromEntries(new FormData(form)),a=analyseRecord(r,e);
      if(a.error)return `${e} m rehearsal: correct the invalid times before sharing.`;
      return `${e} m rehearsal (${e===50?'Oct 1':'Oct 2'})\n${Object.entries(r).filter(([,v])=>v).map(([k,v])=>`${k.startsWith('p')?'Elapsed at '+k.slice(1)+' m':k}: ${v}`).join('\n')||'Not recorded'}${a.text?'\nLengths: '+a.text:''}`;
    }).join('\n\n');
    try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Results copied.';}
    catch(_){const field=$('#copy-fallback');field.hidden=false;field.value=text;field.focus();field.select();$('#copy-status').textContent='Select and copy these results.';}
  };
}
// Deadline-based rest timer survives navigation, refresh, and background tabs.
let timer=read('timer',null),timerInterval;
if (timer && (!Array.isArray(timer.options) || !Number.isFinite(timer.duration))) timer=null;
function timeLabel(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
function remaining(){return timer?.deadline?Math.max(0,Math.ceil((timer.deadline-Date.now())/1000)):timer?.remaining ?? timer?.duration ?? 0;}
function timerShell(){
  document.body.insertAdjacentHTML('beforeend',`<dialog id="effort-dialog" class="prep-dialog" aria-labelledby="effort-heading"><div class="prep-dialog-head"><h2 id="effort-heading">Effort guide</h2><button class="text-button" data-close-dialog aria-label="Close effort guide">Close</button></div>${Object.entries(PREPARATION.efforts).map(([k,v])=>`<p><strong>${esc(k)}</strong><br>${esc(v)}</p>`).join('')}</dialog><dialog id="rest-dialog" class="prep-dialog" aria-labelledby="rest-heading"><div class="prep-dialog-head"><h2 id="rest-heading">Rest timer</h2><button class="text-button" data-close-dialog aria-label="Close rest timer">Close</button></div><p id="timer-context"></p><p id="timer-prescription"></p><div class="prep-timer-options" id="timer-options"></div><p class="prep-clock" id="timer-clock" role="timer">0:00</p><div class="prep-controls"><button class="button" id="timer-toggle">Start</button><button class="button secondary" id="timer-reset">Reset</button></div><p id="timer-status" role="status"></p><button class="text-button" id="timer-dismiss">Dismiss timer</button></dialog><button class="prep-timer-dock" id="timer-dock" hidden><span>Rest timer<small id="timer-dock-state"></small></span><strong id="timer-preview"></strong></button>`);
  $('#timer-dock').onclick=()=>{paintTimer();SwimNavigation.openDialog($('#rest-dialog'),$('#timer-dock'));};
  $('#timer-toggle').onclick=()=>{
    if(!timer)return;
    if(timer.deadline){timer.remaining=remaining();timer.deadline=null;timer.status='Paused';}
    else {timer.remaining=remaining()||timer.duration;timer.deadline=Date.now()+timer.remaining*1000;timer.status='Running';}
    save('timer',timer);paintTimer();
  };
  $('#timer-reset').onclick=()=>{if(!timer)return;timer.deadline=null;timer.remaining=timer.duration;timer.status='Ready';save('timer',timer);paintTimer();};
  $('#timer-dismiss').onclick=()=>{timer=null;save('timer',null);paintTimer();$('#rest-dialog [data-close-dialog]').click();};
  timerInterval=setInterval(paintTimer,250);document.addEventListener('visibilitychange',paintTimer);paintTimer();
}
function openTimer(day,set,timing,trigger){
  if(timer?.deadline){toast('A rest timer is already running. Pause or reset it before choosing another rest.');SwimNavigation.openDialog($('#rest-dialog'),trigger);return;}
  const options=timing.seconds;
  timer={day:day.id,context:`${set.name} · ${timing.label}`,prescription:set.rest,options,duration:options[0],remaining:options[0],deadline:null,status:'Ready'};
  save('timer',timer);paintTimer();SwimNavigation.openDialog($('#rest-dialog'),trigger);
}
let optionsSignature='';
function paintTimer(){
  if(!$('#timer-dock'))return;
  $('#timer-dock').hidden=!timer||!!activeDay?.noTimer;
  document.body.classList.toggle('has-prep-timer',!!timer&&!activeDay?.noTimer);
  if(!timer)return;
  let n=remaining();
  if(timer.deadline&&n===0){timer.deadline=null;timer.remaining=0;timer.status='Rest complete';save('timer',timer);toast('Rest complete');try{navigator.vibrate?.(150);}catch(_){} }
  // Zero is meaningful once a countdown has completed.
  if(timer.status==='Rest complete')n=0;
  $('#timer-clock').textContent=timeLabel(n);$('#timer-preview').textContent=timeLabel(n);
  $('#timer-context').textContent=timer.context;$('#timer-prescription').textContent=timer.prescription;
  $('#timer-status').textContent=timer.status;$('#timer-dock-state').textContent=timer.status;$('#timer-toggle').textContent=timer.deadline?'Pause':timer.status==='Paused'?'Resume':'Start';
  const signature=JSON.stringify([timer.options,timer.duration,!!timer.deadline]);
  if(signature!==optionsSignature){
    optionsSignature=signature;
    $('#timer-options').innerHTML=timer.options.map(s=>`<button class="button secondary" data-duration="${s}" aria-pressed="${s===timer.duration}" ${timer.deadline?'disabled':''}>${timeLabel(s)}</button>`).join('');
    document.querySelectorAll('[data-duration]').forEach(b=>b.onclick=()=>{timer.duration=Number(b.dataset.duration);timer.remaining=timer.duration;timer.deadline=null;timer.status='Ready';save('timer',timer);paintTimer();});
  }
}
({overview,plan,session,race}[page]||overview)();
timerShell();
SwimNavigation.ready();

// An app left open overnight must follow the new local date.
function refreshDay(){if(localDate(new Date())!==today)location.reload();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
window.addEventListener('pageshow',refreshDay);
