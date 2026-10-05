/* Competition preparation. All visible prescriptions come from PREPARATION. */
'use strict';
const $ = selector => document.querySelector(selector);
const main = $('#main');
const icon = name => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${({back:'M19 12H5m6-6-6 6 6 6',forward:'m9 5 7 7-7 7',down:'M12 5v14m-6-6 6 6 6-6',download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5'})[name]}"/></svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = localDate(new Date());
const days = PREPARATION.days;
const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
let toastTimeout;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('#toast').classList.remove('show'), 5500);
}
function read(key, fallback={}) {
  return LaneStorage.get(key, fallback);
}
function save(key, value) {
  const saved = LaneStorage.save(key, value);
  if (!saved) toast('Not saved on this device. Use Retry before leaving.');
  return saved;
}
const formatDate = key => new Date(key+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
const fullDate = key => new Date(key+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'});
const href = day => day.kind==='Race' ? `race.html?event=${day.event}` : SwimNavigation.sessionURL(day.id);
const distance = day => day.distanceLabel || `${day.total.toLocaleString()} m`;
const nextDay = days.find(d=>d.date>=today);
const intro = (title,sub='') => `<div class="page-intro"><div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div></div>`;
const navPaths = {overview:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 12h10m-5-5v10"/>',plan:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',tempo:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',race:'<path d="M5 21V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>'};
$('#navigation').innerHTML = [['overview','index.html','Today'],['plan','plan.html','Plan'],['race','race.html','Race']].map(([key,url,label])=>`<a class="nav-link ${(page===key || page==='session'&&key==='plan')?'active':''}" href="${url}" ${page===key?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${navPaths[key]}</svg><span>${label}</span></a>`).join('');
let activeDay;
function phaseView(day,key='am') {
  const phase=day.phases[key] || day.phases.am;
  return {...day,sets:phase.sets,phaseKey:key,phase,storageKey:key==='am'?'session:'+day.id:'session:'+day.id+':'+key,noTimer:!['am','pm'].includes(key)||phase.status==='off'};
}
const sessionKey=day=>day.storageKey || 'session:'+day.id;
function sessionProgress(day) {
  const saved=read(sessionKey(day)),required=day.sets.filter(set=>!set.optional);
  const done=required.filter(set=>saved[set.id]==='done').length;
  return {done,total:required.length,started:day.sets.some(set=>saved[set.id]==='done'),finished:required.length>0&&done===required.length};
}
function phaseURL(day,key='am') {return SwimNavigation.sessionURL(day.id)+(key==='am'?'':'&phase='+key);}
function resumeHref(day,progress=sessionProgress(day)) {
  const next=day.sets.find(set=>!set.optional&&read(sessionKey(day))[set.id]!=='done');
  const base=day.phaseKey?phaseURL(day,day.phaseKey):href(day);
  return base+(day.kind!=='Race'&&progress.started&&!progress.finished&&next?'#set-'+next.id:'');
}
function supportingTools(){return `<details class="prep-details supporting-tools"><summary>Tools & reference</summary><a class="text-link" href="tempo.html">Freestyle tempo trainer</a><a class="text-link" href="SWIMMING-PLAN.md" download>Full supplied schedule ${icon('download')}</a><p>Optional tools. Keep to the supplied taper; do not add extra sets.</p></details>`;}
function row(day) {
  const progress=sessionProgress(day),pm=day.phases.pm;
  return `<a class="prep-day ${day.date===today?'is-today':''} ${day.kind==='Rest'?'is-rest':''}" id="day-${day.id}" href="${resumeHref(day,progress)}" ${day.date===today?'aria-current="date"':''}><span class="prep-day-date">${esc(fullDate(day.date))}${day.date===today?'<span class="prep-day-today">Today</span>':''}</span><strong class="prep-day-title">${esc(day.title)}</strong><span class="prep-day-bottom"><span>${esc(day.intensity)}${day.kind!=='Race'&&day.kind!=='Rest'?' · AM '+esc(distance(day)):''} · PM ${pm.status==='optional'?'optional':pm.status==='off'?'off':'not prescribed'}${progress.started?' · '+progress.done+'/'+progress.total+' AM sets done':''}</span><span class="prep-day-arrow">${icon('forward')}</span></span></a>`;
}
function periodTabs(day,key='am',home=false) {
  return `<nav class="swim-period-tabs" aria-label="AM or PM session">${['am','pm'].map(period=>{
    const phase=day.phases[period];
    const url=home?'index.html'+(period==='pm'?'?phase=pm':''):period==='am'&&day.kind==='Race'?href(day):phaseURL(day,period);
    return `<a href="${url}" data-period="${period}" ${period===key?'aria-current="page"':''}><strong>${period.toUpperCase()}</strong><small>${phase.status==='off'?'Off':phase.status==='unspecified'?'Not prescribed':phase.status==='optional'?'Optional':day.kind==='Race'?'Race day':'Swim'}</small></a>`;
  }).join('')}</nav>`;
}
function exerciseButton(day,key) {
  const exercise=key==='am'?'before':'evening',phase=day.phases[exercise];
  const label=exercise==='before'?'Before pool':phase.status==='off'?'Evening rest':phase.status==='unspecified'?'Evening':'Evening mobility';
  return `<button class="exercise-shortcut" id="exercise-${exercise}" data-exercise="${exercise}" aria-haspopup="dialog"><span><strong>${label}</strong><small>${esc(phase.distanceLabel|| (phase.status==='off'?'Off':phase.status==='unspecified'?'No workout supplied':'Exercises'))}${phase.status==='optional'?' · Optional':''}</small></span>${icon('forward')}</button>`;
}
function attachExerciseDialogs(day,initial=null) {
  for(const key of ['before','evening']) {
    const phase=day.phases[key];
    document.body.insertAdjacentHTML('beforeend',`<dialog class="prep-dialog exercise-dialog" id="exercise-dialog-${key}" aria-labelledby="exercise-heading-${key}" data-trigger="exercise-${key}"><div class="prep-dialog-head"><h2 id="exercise-heading-${key}">${esc(phase.label)}</h2><button class="button secondary" data-close-dialog>Close</button></div><p class="exercise-date">${esc(formatDate(day.date))}</p>${phase.distanceLabel?`<p class="prep-distance">${esc(phase.distanceLabel)}${phase.status==='optional'?' · Optional':''}</p>`:''}${phase.note?`<p class="phase-note">${esc(phase.note)}</p>`:''}${phase.items.length?`<ul class="preparation-list">${phase.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}</dialog>`);
  }
  document.querySelectorAll('[data-exercise]').forEach(button=>button.onclick=()=>SwimNavigation.openDialog($('#exercise-dialog-'+button.dataset.exercise),button));
  if(initial) {
    if(location.hash==='#before-pool'){const url=new URL(location.href);url.hash='';history.replaceState(history.state,'',url);}
    const button=$('#exercise-'+initial);
    if(button)SwimNavigation.openDialog($('#exercise-dialog-'+initial),button);
  }
}
function overview() {
  if(!nextDay){main.innerHTML=intro('Plan ended','4–13 October 2026')+`<section class="prep-panel"><h2>Your races are finished.</h2><p>Your plan and saved results remain available.</p><a class="button" href="race.html?view=results">View results</a><a class="text-link" href="plan.html">Review plan</a></section>`+supportingTools();return;}
  const day=nextDay,key=params.get('phase')==='pm'?'pm':'am',d=phaseView(day,key),p=sessionProgress(d),phase=d.phase,raceAM=day.kind==='Race'&&key==='am';
  const title=key==='am'?day.title:phase.label;
  const action=phase.status==='off'?'View '+key.toUpperCase()+' rest':phase.status==='unspecified'?'View PM details':raceAM?'Open race preparation':p.finished?'Review '+key.toUpperCase()+' swim':p.started?'Resume '+key.toUpperCase()+' swim':'Open '+key.toUpperCase()+' swim';
  main.innerHTML=intro('Today',day.date===today?fullDate(day.date):'Next session · '+fullDate(day.date))+periodTabs(day,key,true)+`<section class="prep-hero ${day.date===today?'is-today':''}"><div class="eyebrow">${key.toUpperCase()} · ${esc(key==='am'?day.intensity:phase.status==='optional'?'Optional':phase.status==='off'?'Off':'Not prescribed')} · 25 m pool</div><h2>${esc(title)}</h2>${exerciseButton(day,key)}<p>${esc(key==='am'?day.focus:phase.note)}</p>${phase.distanceLabel&&day.kind!=='Rest'?`<p class="prep-distance">${esc(phase.distanceLabel)}</p>`:''}${p.started?`<p class="hero-progress">${p.done} / ${p.total} ${raceAM?'warm-up':key.toUpperCase()} sets done</p>`:''}<a class="button" href="${raceAM?href(day):resumeHref(d)}">${action} ${icon('forward')}</a></section>`;
  const race=days.find(x=>x.kind==='Race'&&x.date>=today);
  if(race&&day.kind!=='Race')main.innerHTML+=`<a class="prep-race-link" href="${href(race)}">Next race · ${race.event} m · ${esc(formatDate(race.date))} ${icon('forward')}</a>`;
  main.innerHTML+=supportingTools();attachExerciseDialogs(day);
}
function plan() {
  main.innerHTML=intro('Your final taper','4–13 October 2026 · 25 m pool')+`<a class="prep-find-day" data-jump href="#day-${(nextDay||days.at(-1)).id}">${nextDay?(nextDay.date===today?'Find today':'Find next day'):'Find races'} ${icon('down')}</a>`;
  const groups=[['Final preparation',days.slice(0,6)],['Rest & activation',days.slice(6,8)],['Race days',days.slice(8)]];
  main.innerHTML+=groups.map(([label,list])=>`<section class="prep-section"><h2>${label}</h2><div class="prep-timeline">${list.map(row).join('')}</div></section>`).join('');
  main.innerHTML+=`<details class="prep-details"><summary>How to read this plan</summary><p>Rest shown after a repetition means after EACH rep, not a send-off.</p><p>${esc(PREPARATION.defaultBlockRest.text)}</p><p>Distance headings are supplied estimates. Short skill repetitions, variable distances and any arithmetic differences remain visible within each session.</p><p>PM swims are optional. Oct 6, 9, 10 and 11 have no PM swimming. Oct 10 is complete rest.</p></details>`+supportingTools();
}
function techniqueDetails(){return `<details class="prep-details"><summary>Technique reminders</summary>${PREPARATION.techniques.map(([title,text])=>`<h3>${esc(title)}</h3><p>${esc(text)}</p>`).join('')}<p>Breathe normally. No breath-hold tests or hyperventilation.</p></details>`;}
function setCard(set,i) {
  return `<article class="prep-set classic-set" id="set-${set.id}" aria-labelledby="title-${set.id}"><button type="button" class="drill-card" data-done="${set.id}" role="checkbox" aria-checked="false" aria-labelledby="title-${set.id}" aria-describedby="work-${set.id}"><span class="set-title-line"><span class="classic-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="drill-title" id="title-${set.id}">${esc(set.name)}</span><span class="classic-check" aria-hidden="true"></span></span><span class="set-reading" id="work-${set.id}"><span class="pool-prescription">${esc(set.prescription)}</span>${set.effort&&!set.prescription.includes(set.effort)?`<span class="pool-effort">${esc(set.effort)}</span>`:''}${set.rest?`<span class="pool-rest">${esc(set.rest)}</span>`:''}${set.cue?`<span class="pool-cue">${esc(set.cue)}</span>`:''}${set.optional?'<span class="pool-condition">Only if permitted</span>':''}</span></button></article>`;
}
function groupedSets(day) {
  let previous='',html='';
  day.sets.forEach((set,i)=>{
    if(set.group!==previous){if(previous)html+='</section>';html+=`<section class="drill-group"><h2>${esc(set.group)}</h2>`;previous=set.group;}
    html+=setCard(set,i);
  });
  return html+(previous?'</section>':'');
}
function phaseNavigation(day,key) {
  return periodTabs(day,key)+exerciseButton(day,key);
}
function session() {
  const day=days.find(d=>d.id===params.get('id'))||(!params.has('id')?nextDay:null);
  if(!day){main.innerHTML=intro('Session not found','This link belongs to an earlier plan.')+'<a class="button" href="plan.html">Open final taper plan</a>';return;}
  const requested=params.get('phase'),initial=['before','evening'].includes(requested)?requested:null;
  const key=['pm','evening'].includes(requested)?'pm':'am';
  if(initial){const url=new URL(location.href);if(key==='pm')url.searchParams.set('phase','pm');else url.searchParams.delete('phase');history.replaceState(history.state,'',url);}
  if(day.kind==='Race'&&key==='am'){location.replace(href(day)+(initial?'#before-pool':''));return;}
  activeDay=phaseView(day,key);const d=activeDay,p=d.phase;
  document.title=p.label+' · '+formatDate(d.date)+' · Lane 50';
  $('.site-header').innerHTML=`<a class="prep-back" data-return href="${esc(SwimNavigation.returnURL())}">${icon('back')}<span>${esc(SwimNavigation.returnLabel())}</span></a><span class="classic-session-date">${esc(formatDate(d.date))}</span>`;
  main.innerHTML=intro(p.label,day.title)+phaseNavigation(day,key);
  if(p.status==='off'||p.status==='unspecified'){
    main.innerHTML+=`<section class="prep-panel phase-rest"><h2>${p.status==='off'?'Rest':'No workout supplied'}</h2><p>${esc(p.note)}</p>${day.kind==='Rest'?'<p>Normal easy walking is fine. No skipping rope, gym, push-ups, pull-ups or kick workout.</p>':''}</section>`;
  }else{
    main.innerHTML+=`<div class="phase-heading"><div><p class="prep-distance">${esc(p.distanceLabel)}</p></div>${p.status==='optional'?'<span class="optional-label">Optional</span>':''}</div>${p.note?`<p class="phase-note">${esc(p.note)}</p>`:''}`;
    if(p.items.length)main.innerHTML+=`<ul class="preparation-list">${p.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
    if(d.sets.length){
      main.innerHTML+=`${p.volumeNote?`<p class="volume-note">${esc(p.volumeNote)}</p>`:''}<div class="pool-session-status"><p id="completion" role="status"></p><span class="check-hint">Tap a card to check / uncheck</span></div><p class="block-rest-note">Between blocks: <strong>30–60 sec</strong> unless longer is shown.</p>${groupedSets(d)}`;
    }
  }
  main.innerHTML+=`<details class="phase-switch" id="phase-switch"><summary>Pool options</summary></details><details class="prep-details" id="day-source"><summary>Full supplied day</summary><pre>${esc(day.source)}</pre></details>`;
  if(d.sets.length){attachCompletion(d);attachSetControls(d);}
  attachExerciseDialogs(day,initial);
}
function attachCompletion(day) {
  const key=sessionKey(day),state=read(key),required=day.sets.filter(s=>!s.optional);
  function paint(){
    const next=required.find(s=>state[s.id]!=='done');
    day.sets.forEach(s=>{
      const card=$('#set-'+s.id),done=state[s.id]==='done';
      card.classList.toggle('is-done',done);card.classList.toggle('is-next',next?.id===s.id);
      card.querySelector('[data-done]').setAttribute('aria-checked',String(done));
      card.querySelector('.classic-check').textContent=done?'✓':'';
    });
    document.querySelectorAll('#next-set,[data-next-set]').forEach(link=>{link.hidden=!next;if(next){link.href='#set-'+next.id;link.textContent='Next · '+next.name;}});
    const warmup=$('#start-warmup');if(warmup){warmup.href=next?'#set-'+next.id:'#race-cues';warmup.textContent=next?(Object.keys(state).length?'Resume warm-up':'Start warm-up'):'Open race cues';}
    const done=required.filter(s=>state[s.id]==='done').length;
    $('#completion').textContent=done===required.length?`${done} / ${required.length} · Session complete`:`${done} / ${required.length} sets checked`;
  }
  document.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.done;
    if(state[id]==='done')delete state[id];else state[id]='done';
    save(key,state);paint();
  });paint();
}
function renderRestChoices(){
  const source=$('#rest-source').value,set=activeDay?.sets.find(s=>s.id===source);
  const block=source==='block',title=block?'Between drill blocks':set?.name||'Manual rest';
  const rest=block?PREPARATION.defaultBlockRest.text:set?.rest||'No fixed rest prescribed.';
  const groups=block?[PREPARATION.defaultBlockRest]:set?.timers||[];
  $('#set-rest-options').hidden=source==='manual';$('#other-rest').open=source==='manual';
  $('#set-rest-options').innerHTML=(groups.length?'':`<p>${esc(rest)}</p>`)+groups.map((group,i)=>`<fieldset><legend>${esc(group.label)}</legend><div class="rest-choices">${group.seconds.map(n=>`<button class="button secondary" data-set-duration="${n}" data-rest-group="${i}" data-choice-context="${esc(`${formatDate(activeDay.date)} · ${activeDay.phase?.label||'Warm-up'} · ${title} · ${group.label}`)}" aria-pressed="false" ${timer.deadline?'disabled':''}>${timeLabel(n)}</button>`).join('')}</div></fieldset>`).join('');
  document.querySelectorAll('[data-set-duration]').forEach(choice=>choice.onclick=()=>{
    const context=choice.dataset.choiceContext;
    if(setTimerDuration(Number(choice.dataset.setDuration),context))$('#timer-selection').textContent='Press Start when ready.';
  });
  paintTimer();
}
function attachSetControls(day){
  document.querySelectorAll('[data-effort]').forEach(b=>b.onclick=()=>SwimNavigation.openDialog($('#effort-dialog'),b));
}
function recordForm(event) {
  const stored=read('rehearsal:'+event),fields=event===50?[['p25','First 25 m'],['p50','Total 50 m']]:[['p25','At 25 m'],['p50','At 50 m'],['p75','At 75 m'],['p100','At 100 m']];
  return `<section class="prep-panel prep-record" id="record-${event}"><h2>Earlier ${event} m rehearsal</h2><p>${event===50?'October 1 · record one timed swim.':'October 2 · elapsed times from the start, not individual length times.'}</p><p class="prep-hint">Auto-saved on this device · seconds or m:ss.xx. Final time alone is enough.</p><form data-record="${event}" novalidate><div class="prep-form-grid">${fields.map(([key,label])=>`<label>${label}<input name="${key}" inputmode="decimal" type="text" autocomplete="off" maxlength="24" placeholder="${key==='p100'?'1:20.50':'20.50'}" value="${esc(stored[key]||'')}" aria-describedby="error-${event}-${key}"><span class="field-error" id="error-${event}-${key}"></span></label>`).join('')}${event===50?selectField('turn','Turn',['Good','Average','Poor'],stored.turn)+selectField('technique','Technique in last 15 m',['Good','Breaking down'],stored.technique):''}</div><p class="prep-form-message" id="record-message-${event}" role="status"></p><p class="prep-derived" id="derived-${event}"></p></form></section>`;
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
  let last=0, lastKey='', errors={},derived=[];
  const values=keys.map(k=>seconds(record[k]));
  values.forEach((n,i)=>{if(n===null)return;if(!Number.isFinite(n))errors[keys[i]]='Enter a positive time in seconds or m:ss.xx.';else {if(n<=last)errors[keys[i]]=`Elapsed times must increase: enter a time after ${lastKey.slice(1)} m (${record[lastKey]}).`;else{last=n;lastKey=keys[i];}}
    const before=i===0?0:values[i-1];
    if(Number.isFinite(n)&&before!==null&&Number.isFinite(before)&&n>before)derived.push(`${i*25}–${(i+1)*25} m: ${(n-before).toFixed(2)} s`);
  });
  const error=Object.values(errors)[0]||'';
  return {error,errors,text:error?'':derived.join(' · '),hasTime:values.some(n=>n!==null),complete:!error&&Number.isFinite(values.at(-1))};
}
function attachRecord(event){
  const form=$(`[data-record="${event}"]`),msg=$(`#record-message-${event}`),derived=$(`#derived-${event}`);
  function update(persist=false){
    const record=Object.fromEntries(new FormData(form)),analysis=analyseRecord(record,event);
    form.querySelectorAll('input').forEach(input=>{
      const error=analysis.errors[input.name]||'';
      input.setAttribute('aria-invalid',String(!!error));
      $(`#error-${event}-${input.name}`).textContent=error;
    });
    derived.textContent=analysis.text;
    const saved=persist?save('rehearsal:'+event,record):!LaneStorage.unsaved;
    msg.textContent=!saved?'Changes not saved. Use Retry above.':analysis.error?'Draft saved · '+analysis.error:analysis.complete?'Recorded on this device.':Object.values(record).some(Boolean)?'Draft saved · add a final time when known.':'No result recorded yet.';
    msg.classList.toggle('is-error',!!analysis.error||!saved);
  }
  form.oninput=()=>update(true);form.onchange=()=>update(true);form.onsubmit=e=>{e.preventDefault();update(true);};
  document.addEventListener('lane:storage',()=>{if(!LaneStorage.unsaved)update();});update();
}
function resultText() {
  return 'Lane 50 · 25 m pool · October 4–13, 2026\n\n'+[50,100].map(event=>{
    const official=read('race:'+event), rehearsal=read('rehearsal:'+event), analysis=analyseRecord(rehearsal,event);
    const n=seconds(official.result);
    const final=n===null?'Not recorded':Number.isFinite(n)?official.result+' ('+n.toFixed(2)+' s)':'Draft — needs correction';
    const fields=Object.entries(rehearsal).filter(([key,value])=>value&&['p25','p50','p75','p100','turn','technique'].includes(key));
    return `${event} m freestyle · ${event===50?'Oct 12':'Oct 13'}\nOfficial result: ${final}\nRehearsal · ${event===50?'Oct 1':'Oct 2'}: ${analysis.error?'Draft — needs correction':analysis.complete?'Recorded':'Draft / not recorded'}${!analysis.error?'\n'+fields.map(([key,value])=>`${key.startsWith('p')?'Elapsed at '+key.slice(1)+' m':key}: ${value}`).join('\n'):''}${analysis.text?'\nLengths: '+analysis.text:''}`;
  }).join('\n\n');
}
function copyControls() {
  return '<button class="button secondary" id="copy-results">Copy all results</button><p id="copy-status" role="status"></p><textarea id="copy-fallback" hidden readonly aria-label="Results to copy"></textarea>';
}
function attachCopyResults(){
  $('#copy-results').onclick=async()=>{
    const text=resultText();
    try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Results copied.';}
    catch(_){const field=$('#copy-fallback');field.hidden=false;field.value=text;field.focus();field.select();$('#copy-status').textContent='Select and copy these results.';}
  };
}
function resultsPage(){
  main.innerHTML=intro('Your results','50 + 100 m freestyle · 25 m pool')+`<p class="prep-note">Official races and rehearsals have different conditions. These are your recorded times.</p><div class="results-grid">${[50,100].map(event=>{
    const r=read('race:'+event),rehearsal=read('rehearsal:'+event),n=seconds(r.result),analysis=analyseRecord(rehearsal,event);
    return `<section class="prep-panel result-card"><p class="eyebrow">${event===50?'Mon 12 Oct':'Tue 13 Oct'}</p><h2>${event} m freestyle</h2><p class="result-time">${n===null?'Not recorded':Number.isFinite(n)?esc(r.result)+' <small>'+(r.result.includes(':')?'min:sec':'sec')+'</small>':'Draft · needs correction'}</p><a class="text-link" href="race.html?event=${event}#race-result">${n===null?'Record':'Edit'} official time ${icon('forward')}</a><div class="result-rehearsal"><h3>Rehearsal · ${event===50?'Oct 1':'Oct 2'}</h3><p>${analysis.error?'Draft · needs correction':analysis.complete?esc(rehearsal['p'+event]):'No final time recorded'}</p>${analysis.text?`<p class="prep-hint">${esc(analysis.text)}</p>`:''}<a class="text-link" href="race.html?event=${event}#rehearsal-results">Rehearsal details ${icon('forward')}</a></div></section>`;
  }).join('')}</div><div class="results-actions">${copyControls()}<a class="text-link" href="race.html?event=50">Race preparation ${icon('forward')}</a></div>`;
  attachCopyResults();
}
function race(){
  if(params.get('view')==='results'){resultsPage();return;}
  const event=params.get('event')==='50'?50:params.get('event')==='100'?100:today>'2026-10-12'?100:50;
  const day=days.find(d=>d.event===event);activeDay=day;
  const raceState=read('race:'+event);
  main.innerHTML=intro('Race preparation','25 m short course · freestyle')+`
    <nav class="prep-event-tabs" aria-label="Choose race"><a href="race.html?event=50" ${event===50?'aria-current="page"':''}>50 m <small>Mon Oct 12</small></a><a href="race.html?event=100" ${event===100?'aria-current="page"':''}>100 m <small>Tue Oct 13</small></a></nav>
    <p class="prep-focus">${esc(day.focus)}</p>${periodTabs(day,'am')}${exerciseButton(day,'am')}
    <a class="button warmup-action" id="start-warmup" data-jump href="#warm-up">Start warm-up ${icon('forward')}</a>
    <details class="prep-details prep-logistics"><summary id="reporting-summary">Reporting time · ${esc(raceState.reporting||'not set')}</summary><p class="prep-hint">Enter official details when known. All fields are optional.</p><div class="prep-form-grid"><label>Reporting time<input id="reporting-time" type="time" value="${esc(raceState.reporting||'')}"></label>${[['eventNumber','Event number'],['heat','Heat'],['lane','Lane']].map(([key,label])=>`<label>${label}<input data-logistics="${key}" type="text" maxlength="40" value="${esc(raceState[key]||'')}"></label>`).join('')}</div><p id="reporting-status" role="status"></p></details>
    <nav class="prep-quick-links" aria-label="Race sections"><a data-jump href="#warm-up">Warm-up</a><a data-jump href="#race-cues">Race cues</a><a data-jump href="#race-result">Results</a></nav>
    <section class="prep-section" id="warm-up"><h2>Warm-up</h2><p class="prep-distance">${esc(day.distanceLabel)}</p><p class="prep-note">${esc(day.note)}</p><div class="classic-session-tools"><p id="completion" class="prep-progress" role="status"></p><button class="text-button" data-effort>Effort guide</button></div>${groupedSets(day)}</section>
    <section class="prep-section" id="race-cues"><h2>Your ${event} m race</h2><div class="prep-race-cues">${day.raceCues.map(([label,text])=>`<article><h3>${esc(label)}</h3><p>${esc(text)}</p></article>`).join('')}</div>${day.raceNote?`<p class="race-cue-note">${esc(day.raceNote)}</p>`:''}</section>
    ${day.after?`<section class="prep-panel"><h2>After the 50 / PM</h2><p>${esc(day.after)}</p><a class="text-link" href="${phaseURL(day,'pm')}">Open optional recovery swim</a></section>`:''}
    <section class="prep-panel" id="race-result"><h2>Official result</h2><label>Final ${event} m time<input id="official-result" type="text" inputmode="decimal" maxlength="24" placeholder="Seconds or m:ss.xx" value="${esc(raceState.result||'')}" aria-describedby="official-status"></label><p id="official-status" role="status"></p><p class="prep-hint">Optional · auto-saved on this device</p><a class="text-link" href="race.html?view=results">View both race results ${icon('forward')}</a></section>
    <details class="prep-details" id="rehearsal-results"><summary>Earlier rehearsal records · Oct 1 & 2</summary>${recordForm(50)}${recordForm(100)}${copyControls()}</details>${techniqueDetails()}<details class="prep-details"><summary>Full race-day instructions</summary><pre>${esc(day.source)}</pre></details>`;
  attachCompletion(day);attachSetControls(day);attachRecord(50);attachRecord(100);attachCopyResults();attachExerciseDialogs(day,location.hash==='#before-pool'?'before':null);
  function logistics(){
    raceState.reporting=$('#reporting-time').value;
    document.querySelectorAll('[data-logistics]').forEach(input=>raceState[input.dataset.logistics]=input.value);
    $('#reporting-summary').textContent='Reporting time · '+(raceState.reporting||'not set')+(raceState.heat?' · Heat '+raceState.heat:'')+(raceState.lane?' · Lane '+raceState.lane:'');
    $('#reporting-status').textContent=save('race:'+event,raceState)?'Saved on this device.':'Changes not saved. Use Retry above.';
  }
  $('#reporting-time').oninput=logistics;
  document.querySelectorAll('[data-logistics]').forEach(input=>input.oninput=logistics);
  function paintOfficial(){
    const n=seconds(raceState.result),error=n!==null&&!Number.isFinite(n);
    $('#official-result').setAttribute('aria-invalid',String(error));
    $('#official-status').textContent=LaneStorage.unsaved?'Changes not saved. Use Retry above.':error?'Draft saved · enter a positive time in seconds or m:ss.xx.':n===null?'No result recorded yet.':'Recorded on this device.';
  }
  $('#official-result').oninput=e=>{raceState.result=e.target.value;save('race:'+event,raceState);paintOfficial();};
  document.addEventListener('lane:storage',()=>{paintOfficial();if(!LaneStorage.unsaved&&$('#reporting-status').textContent)$('#reporting-status').textContent='Saved on this device.';});
  paintOfficial();
}
// Deadline-based rest timer survives navigation, refresh, and background tabs.
let timer=read('timer',null),timerInterval;
if (timer && !Number.isFinite(timer.duration)) timer=null;
const timerPresets=[30,60,120,180,240,300];
const hasSessionTimer=()=>page==='session' && activeDay?.sets.length>0 && !activeDay.noTimer;
if(!timer)timer={duration:0,remaining:0,deadline:null,status:'Choose rest'};
timer.options=timerPresets;
delete timer.day;delete timer.prescription;
function timeLabel(n){return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
function remaining(){return timer?.deadline?Math.max(0,Math.ceil((timer.deadline-Date.now())/1000)):timer?.remaining ?? timer?.duration ?? 0;}
function timerShell(){
  document.body.insertAdjacentHTML('beforeend',`<dialog id="effort-dialog" class="prep-dialog" aria-labelledby="effort-heading"><div class="prep-dialog-head"><h2 id="effort-heading">Effort guide</h2><button class="text-button" data-close-dialog aria-label="Close effort guide">Close</button></div>${Object.entries(PREPARATION.efforts).map(([k,v])=>`<p><strong>${esc(k)}</strong><br>${esc(v)}</p>`).join('')}</dialog><dialog id="rest-dialog" class="prep-dialog" aria-labelledby="rest-heading"><div class="prep-dialog-head"><h2 id="rest-heading">Rest timer</h2><button class="text-button" data-close-dialog aria-label="Close rest timer">Close</button></div><p id="timer-context">Choose the rest shown in your session.</p><label class="rest-source-label" for="rest-source">Rest for</label><select id="rest-source"><option value="block">Between drill blocks · 30–60 sec</option>${(activeDay?.sets||[]).map(set=>`<option value="${set.id}">${esc(set.name)}</option>`).join('')}<option value="manual">Manual duration</option></select><div id="set-rest-options" hidden></div><p id="timer-selection" role="status"></p><p class="prep-clock" id="timer-clock" role="timer">0:00</p><div class="prep-controls"><button class="button" id="timer-toggle">Start</button><button class="button secondary" id="timer-reset">Reset</button></div><p id="timer-status" role="status"></p><details id="other-rest" class="prep-details" open><summary>Other durations</summary><div class="prep-timer-options" id="timer-options"></div><form id="custom-rest"><label for="custom-rest-seconds">Custom rest · seconds</label><div><input id="custom-rest-seconds" type="number" inputmode="numeric" min="1" max="3600" step="1" required><button class="button secondary" type="submit">Set</button></div></form></details></dialog><footer class="classic-timer-footer" id="timer-footer" hidden><a id="next-set" class="footer-next" data-jump data-next-set hidden></a><div class="timer-row" id="timer-row"><button class="prep-timer-dock" id="timer-dock"><span>Rest<small id="timer-dock-state"></small><small id="timer-dock-context"></small></span><strong id="timer-preview"></strong>${icon('forward')}</button><button class="button" id="timer-quick-toggle" type="button" aria-label="Start rest timer">Start</button></div></footer>`);
  new ResizeObserver(()=>document.documentElement.style.setProperty('--rest-footer-height',$('#timer-footer').getBoundingClientRect().height+'px')).observe($('#timer-footer'));
  $('#rest-source').onchange=renderRestChoices;
  $('#timer-dock').onclick=()=>{renderRestChoices();$('#timer-selection').textContent=timer.deadline?'Pause before changing rest.':'';paintTimer();SwimNavigation.openDialog($('#rest-dialog'),$('#timer-dock'));};
  $('#timer-toggle').onclick=()=>{
    if(!timer)return;
    if(timer.deadline){timer.remaining=remaining();timer.deadline=null;timer.status='Paused';}
    else {timer.remaining=remaining()||timer.duration;timer.deadline=Date.now()+timer.remaining*1000;timer.status='Running';}
    save('timer',timer);paintTimer();
  };
  $('#timer-quick-toggle').onclick=()=>{if(!timer.duration)$('#timer-dock').click();else $('#timer-toggle').click();};
  $('#timer-reset').onclick=()=>{if(!timer)return;timer.deadline=null;timer.remaining=timer.duration;timer.status='Ready';save('timer',timer);paintTimer();};
  $('#custom-rest').onsubmit=e=>{e.preventDefault();const input=$('#custom-rest-seconds');if(!input.reportValidity())return;setTimerDuration(Number(input.value));};
  timerInterval=setInterval(paintTimer,250);document.addEventListener('visibilitychange',paintTimer);paintTimer();
  if(activeDay){const next=activeDay.sets.find(s=>!s.optional&&read(sessionKey(activeDay))[s.id]!=='done');const link=$('[data-next-set]');if(next){link.hidden=false;link.href='#set-'+next.id;link.textContent='Next · '+next.name;}}
}
function setTimerDuration(duration,context='Manual rest'){
  if(timer.deadline){$('#timer-selection').textContent='Pause the timer before changing its duration.';toast('Pause the timer before changing its duration.');return false;}
  timer.duration=duration;timer.remaining=duration;timer.deadline=null;timer.status='Ready';timer.context=context;save('timer',timer);paintTimer();return true;
}
let optionsSignature='';
function paintTimer(){
  if(!$('#timer-dock'))return;
  $('#timer-footer').hidden=!(page==='session'&&activeDay?.sets.length);
  $('#timer-row').hidden=!hasSessionTimer();
  document.body.classList.toggle('has-prep-timer',hasSessionTimer());
  if(!timer)return;
  let n=remaining();
  if(timer.deadline&&n===0){timer.deadline=null;timer.remaining=0;timer.status='Rest complete';save('timer',timer);toast('Rest complete');try{navigator.vibrate?.(150);}catch(_){} }
  // Zero is meaningful once a countdown has completed.
  if(timer.status==='Rest complete')n=0;
  $('#timer-clock').textContent=timeLabel(n);$('#timer-preview').textContent=timer.duration?timeLabel(n):'—:—';
  $('#timer-toggle').disabled=!timer.duration;$('#timer-reset').disabled=!timer.duration;
  const contextParts=timer.context?.split(' · ')||[];
  const sameSession=activeDay&&contextParts[0]===formatDate(activeDay.date)&&contextParts[1]===(activeDay.phase?.label||'Warm-up');
  $('#timer-dock-context').textContent=contextParts.length>2?(sameSession?contextParts.at(-1).replace('Between different drill blocks','Between drill blocks'):[contextParts[0],contextParts[1],contextParts.at(-1)].join(' · ')):timer.context||'';
  $('#timer-dock-context').hidden=!$('#timer-dock-context').textContent;
  $('#custom-rest-seconds').disabled=!!timer.deadline;$('#custom-rest button').disabled=!!timer.deadline;
  $('#timer-context').textContent=timer.context||'Manual rest';
  $('#timer-status').textContent=timer.status;$('#timer-dock-state').textContent=timer.status;$('#timer-toggle').textContent=timer.deadline?'Pause':timer.status==='Paused'?'Resume':'Start';
  const quick=$('#timer-quick-toggle');
  const action=!timer.duration?'Choose':timer.deadline?'Pause':timer.status==='Paused'?'Resume':timer.status==='Rest complete'?'Restart':'Start';
  quick.textContent=action;quick.setAttribute('aria-label',action+' rest timer');
  $('#timer-footer').classList.toggle('is-finished',timer.status==='Rest complete');
  $('#timer-dock').setAttribute('aria-label','Adjust rest timer, '+timeLabel(n)+', '+timer.status+', '+(timer.context||'Choose rest'));
  document.querySelectorAll('[data-set-duration]').forEach(b=>{b.disabled=!!timer.deadline;b.setAttribute('aria-pressed',String(Number(b.dataset.setDuration)===timer.duration&&b.dataset.choiceContext===timer.context));});
  const signature=JSON.stringify([timer.options,timer.duration,!!timer.deadline]);
  if(signature!==optionsSignature){
    optionsSignature=signature;
    $('#timer-options').innerHTML=timer.options.map(s=>`<button class="button secondary" data-duration="${s}" aria-pressed="${s===timer.duration}" ${timer.deadline?'disabled':''}>${timeLabel(s)}</button>`).join('');
    document.querySelectorAll('[data-duration]').forEach(b=>b.onclick=()=>setTimerDuration(Number(b.dataset.duration)));
  }
}
if(page!=='tempo')({overview,plan,session,race}[page]||overview)();
if(page!=='tempo')timerShell();
SwimNavigation.ready();

// An app left open overnight must follow the new local date.
function refreshDay(){if(localDate(new Date())!==today)location.reload();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
window.addEventListener('pageshow',refreshDay);
