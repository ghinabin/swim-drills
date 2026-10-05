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
  if (!saved) toast('Not saved on this device. Use Retry or export a backup before leaving.');
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
const phaseLabels={before:'Before pool',am:'AM swim',pm:'PM swim',evening:'Evening'};
function phaseView(day,key='am') {
  const phase=day.phases[key] || day.phases.am;
  return {...day,sets:phase.sets,phaseKey:key,phase,storageKey:key==='am'?'session:'+day.id:'session:'+day.id+':'+key,noTimer:!['am','pm'].includes(key)||phase.status==='off'};
}
const sessionKey=day=>day.storageKey || 'session:'+day.id;
function sessionProgress(day) {
  const saved=read(sessionKey(day)),required=day.sets.filter(set=>!set.optional);
  const done=required.filter(set=>saved[set.id]==='done').length,skipped=required.filter(set=>saved[set.id]==='skipped').length;
  return {done,skipped,total:required.length,started:day.sets.some(set=>saved[set.id]),finished:required.length>0&&done+skipped===required.length};
}
function phaseURL(day,key='am') {return SwimNavigation.sessionURL(day.id)+(key==='am'?'':'&phase='+key);}
function resumeHref(day,progress=sessionProgress(day)) {
  const next=day.sets.find(set=>!set.optional&&!['done','skipped'].includes(read(sessionKey(day))[set.id]));
  const base=day.phaseKey?phaseURL(day,day.phaseKey):href(day);
  return base+(day.kind!=='Race'&&progress.started&&!progress.finished&&next?'#set-'+next.id:'');
}
function supportingTools(){return `<details class="prep-details supporting-tools"><summary>Tools & reference</summary><a class="text-link" href="tempo.html">Freestyle tempo trainer</a><a class="text-link" href="SWIMMING-PLAN.md" download>Full supplied schedule ${icon('download')}</a><p>Optional tools. Keep to the supplied taper; do not add extra sets.</p></details>`;}
function phaseLink(day,key) {
  const phase=day.phases[key],view=phaseView(day,key),progress=sessionProgress(view);
  const status=phase.status==='off'?'Off':phase.status==='unspecified'?'No workout supplied':phase.status==='optional'?'Optional':phase.distanceLabel;
  return `<a class="day-phase-row ${phase.status==='off'?'phase-off':''}" href="${resumeHref(view)}"><span><strong>${esc(phase.label)}</strong><small>${esc(status)}${phase.status==='optional'&&phase.distanceLabel?' · '+esc(phase.distanceLabel):''}${progress.started?' · '+progress.done+' done'+(progress.skipped?' · '+progress.skipped+' skipped':''):''}</small></span>${icon('forward')}</a>`;
}
function row(day) {
  const progress=sessionProgress(day),pm=day.phases.pm;
  return `<a class="prep-day ${day.date===today?'is-today':''} ${day.kind==='Rest'?'is-rest':''}" id="day-${day.id}" href="${resumeHref(day,progress)}" ${day.date===today?'aria-current="date"':''}><span class="prep-day-date">${esc(fullDate(day.date))}${day.date===today?'<span class="prep-day-today">Today</span>':''}</span><strong class="prep-day-title">${esc(day.title)}</strong><span class="prep-day-bottom"><span>${esc(day.intensity)}${day.kind!=='Race'&&day.kind!=='Rest'?' · AM '+esc(distance(day)):''} · PM ${pm.status==='optional'?'optional':pm.status==='off'?'off':'not prescribed'}${progress.started?' · '+progress.done+'/'+progress.total+' AM sets done':''}</span><span class="prep-day-arrow">${icon('forward')}</span></span></a>`;
}
function overview() {
  if(!nextDay){main.innerHTML=intro('Plan ended','4–13 October 2026')+`<section class="prep-panel"><h2>Your races are finished.</h2><p>Your plan and saved results remain available.</p><a class="button" href="race.html?view=results">View results</a><a class="text-link" href="plan.html">Review plan</a></section>`+supportingTools();return;}
  const d=nextDay,p=sessionProgress(d);
  main.innerHTML=intro('Today',d.date===today?fullDate(d.date):'Next session · '+fullDate(d.date))+`<section class="prep-hero ${d.date===today?'is-today':''}"><div class="eyebrow">${esc(d.intensity)} · 25 m pool</div><h2>${esc(d.title)}</h2><p>${esc(d.focus)}</p>${d.kind==='Swim'?`<p class="prep-distance">AM swim · ${esc(distance(d))}</p>`:''}${p.started?`<p class="hero-progress">${p.done} / ${p.total} ${d.kind==='Race'?'warm-up':'AM'} sets done${p.skipped?' · '+p.skipped+' skipped':''}</p>`:''}<a class="button" href="${resumeHref(d)}">${d.kind==='Rest'?'View rest day':d.kind==='Race'?'Open race preparation':p.finished?'Review AM swim':p.started?'Resume AM swim':'Open AM swim'} ${icon('forward')}</a></section>`;
  main.innerHTML+=`<section class="day-schedule"><h2>The rest of your day</h2>${['before','pm','evening'].map(key=>phaseLink(d,key)).join('')}</section>`;
  const race=days.find(x=>x.kind==='Race'&&x.date>=today);
  if(race&&d.kind!=='Race')main.innerHTML+=`<a class="prep-race-link" href="${href(race)}">Next race · ${race.event} m · ${esc(formatDate(race.date))} ${icon('forward')}</a>`;
  main.innerHTML+=supportingTools();
}
function plan() {
  main.innerHTML=intro('Your final taper','4–13 October 2026 · 25 m pool')+`<a class="prep-find-day" data-jump href="#day-${(nextDay||days.at(-1)).id}">${nextDay?(nextDay.date===today?'Find today':'Find next day'):'Find races'} ${icon('down')}</a>`;
  const groups=[['Final preparation',days.slice(0,6)],['Rest & activation',days.slice(6,8)],['Race days',days.slice(8)]];
  main.innerHTML+=groups.map(([label,list])=>`<section class="prep-section"><h2>${label}</h2><div class="prep-timeline">${list.map(row).join('')}</div></section>`).join('');
  main.innerHTML+=`<details class="prep-details"><summary>How to read this plan</summary><p>Rest shown after a repetition means after EACH rep, not a send-off.</p><p>${esc(PREPARATION.defaultBlockRest.text)}</p><p>Distance headings are supplied estimates. Short skill repetitions, variable distances and any arithmetic differences remain visible within each session.</p><p>PM swims are optional. Oct 6, 9, 10 and 11 have no PM swimming. Oct 10 is complete rest.</p></details>`+supportingTools();
}
function techniqueDetails(){return `<details class="prep-details"><summary>Technique reminders</summary>${PREPARATION.techniques.map(([title,text])=>`<h3>${esc(title)}</h3><p>${esc(text)}</p>`).join('')}<p>Breathe normally. No breath-hold tests or hyperventilation.</p></details>`;}
function setName(set){return set.name;}
function setCard(set,i,day) {
  return `<article class="prep-set classic-set" id="set-${set.id}" aria-labelledby="title-${set.id}"><div class="set-reading"><div class="set-title-line"><span class="classic-number">${String(i+1).padStart(2,'0')}</span><h3 id="title-${set.id}">${esc(set.name)}</h3><span class="prep-set-status"></span></div><p class="pool-prescription">${esc(set.prescription)}</p>${set.effort&&!set.prescription.includes(set.effort)?`<p class="pool-effort">${esc(set.effort)}</p>`:''}${set.rest?`<p class="pool-rest">${esc(set.rest)}</p>`:''}${set.cue?`<p class="pool-cue">${esc(set.cue)}</p>`:''}${set.optional?'<p class="pool-condition">Only if permitted</p>':''}</div><div class="pool-set-actions"><button class="button secondary" data-done="${set.id}" aria-pressed="false" aria-label="Mark ${esc(set.name)} done"><span class="classic-check" aria-hidden="true"></span><span data-done-label>Done</span></button>${!day.noTimer&&set.timers.length?`<button class="button secondary" data-rest-choice="${set.id}" aria-label="Choose rest for ${esc(set.name)}">Rest</button>`:''}<button class="text-button" data-skip="${set.id}" aria-pressed="false">Skip</button></div></article>`;
}
function groupedSets(day) {
  let previous='',html='';
  day.sets.forEach((set,i)=>{
    if(set.group!==previous){if(previous)html+='</section>';html+=`<section class="drill-group"><h2>${esc(set.group)}</h2>`;previous=set.group;}
    html+=setCard(set,i,day);
  });
  return html+(previous?'</section>':'');
}
function phaseNavigation(day,key) {
  return `<details class="phase-switch" id="phase-switch"><summary>Day parts & options</summary><nav class="day-phase-nav" aria-label="Part of day">${Object.entries(day.phases).map(([id,p])=>`<a href="${phaseURL(day,id)}" ${id===key?'aria-current="page"':''}><strong>${esc(id==='am'&&day.kind==='Race'?'Warm-up':phaseLabels[id])}</strong><small>${p.status==='off'?'Off':p.status==='optional'?'Optional':p.status==='unspecified'?'Not prescribed':id==='am'?'Pool':''}</small></a>`).join('')}</nav></details>`;
}
function session() {
  const day=days.find(d=>d.id===params.get('id'))||(!params.has('id')?nextDay:null);
  if(!day){main.innerHTML=intro('Session not found','This link belongs to an earlier plan.')+'<a class="button" href="plan.html">Open final taper plan</a>';return;}
  const key=Object.hasOwn(day.phases,params.get('phase'))?params.get('phase'):'am';
  if(day.kind==='Race'&&key==='am'){location.replace(href(day));return;}
  activeDay=phaseView(day,key);const d=activeDay,p=d.phase;
  document.title=p.label+' · '+formatDate(d.date)+' · Lane 50';
  $('.site-header').innerHTML=`<a class="prep-back" data-return href="${esc(SwimNavigation.returnURL())}">${icon('back')}<span>${esc(SwimNavigation.returnLabel())}</span></a><span class="classic-session-date">${esc(formatDate(d.date))}</span>`;
  main.innerHTML=intro(p.label,formatDate(d.date)+' · '+day.title)+phaseNavigation(day,key);
  if(p.status==='off'||p.status==='unspecified'){
    main.innerHTML+=`<section class="prep-panel phase-rest"><h2>${p.status==='off'?'Rest':'No workout supplied'}</h2><p>${esc(p.note)}</p>${day.kind==='Rest'?'<p>Normal easy walking is fine. No skipping rope, gym, push-ups, pull-ups or kick workout.</p>':''}</section>`;
  }else{
    main.innerHTML+=`<div class="phase-heading"><div><p class="prep-distance">${esc(p.distanceLabel)}</p>${p.distanceLabel.startsWith('~')?'<small class="distance-estimate">Supplied estimate · follow the listed work</small>':''}</div>${p.status==='optional'?'<span class="optional-label">Optional</span>':''}</div>${p.note?`<p class="phase-note">${esc(p.note)}</p>`:''}`;
    if(p.items.length)main.innerHTML+=`<ul class="preparation-list">${p.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
    if(d.sets.length){
      main.innerHTML+=`${p.volumeNote?`<p class="volume-note">${esc(p.volumeNote)}</p>`:''}<div class="pool-session-status"><p id="completion" role="status"></p>${p.status==='optional'?'<button class="text-button" id="skip-phase">Skip PM swim</button>':''}</div><p class="block-rest-note">Between drill blocks: <strong>30–60 sec</strong>, unless longer is shown.</p>${groupedSets(d)}<section class="session-complete" id="session-complete"><p id="session-complete-message"></p><button class="button secondary" id="complete-day">Finish session</button></section>`;
    }
  }
  if(d.sets.length)main.innerHTML+=`<details class="prep-details"><summary>Rest between drill blocks</summary><p>${esc(PREPARATION.defaultBlockRest.text)}</p><button class="button secondary" id="block-rest">Choose block rest</button></details>`;
  main.innerHTML+=`<details class="prep-details" id="day-source"><summary>Full supplied day</summary><pre>${esc(day.source)}</pre></details>`;
  if(d.sets.length){attachCompletion(d);attachSetControls(d);$('#block-rest').onclick=()=>openRestChoices('Between different drill blocks',PREPARATION.defaultBlockRest.text,[PREPARATION.defaultBlockRest],$('#block-rest'));}
}
function attachCompletion(day) {
  const key=sessionKey(day),state=read(key),required=day.sets.filter(s=>!s.optional);let bulkUndo=null;
  function paint(){
    const next=required.find(s=>!['done','skipped'].includes(state[s.id]));
    day.sets.forEach(s=>{
      const card=$('#set-'+s.id),done=state[s.id]==='done',skip=state[s.id]==='skipped';
      card.classList.toggle('is-done',done);card.classList.toggle('is-skipped',skip);card.classList.toggle('is-next',next?.id===s.id);
      card.querySelector('.prep-set-status').textContent=done?'Done':skip?'Skipped':next?.id===s.id?'Up next':s.optional?'Optional':'';
      const b=card.querySelector('[data-done]');b.setAttribute('aria-pressed',String(done));b.querySelector('[data-done-label]').textContent=done?'Undo done':'Done';b.setAttribute('aria-label',`${done?'Undo completion of':'Mark'} ${s.name}${done?'':' done'}`);card.querySelector('.classic-check').textContent=done?'✓':'';
      const sk=card.querySelector('[data-skip]');sk.textContent=skip?'Undo skip':'Skip';sk.setAttribute('aria-pressed',String(skip));
    });
    document.querySelectorAll('#next-set,[data-next-set]').forEach(link=>{link.hidden=!next;if(next){link.href='#set-'+next.id;link.textContent='Next · '+next.prescription;}});
    const warmup=$('#start-warmup');if(warmup){warmup.href=next?'#set-'+next.id:'#race-cues';warmup.textContent=next?(Object.keys(state).length?'Resume warm-up':'Start warm-up'):'Open race cues';}
    const done=required.filter(s=>state[s.id]==='done').length,skipped=required.filter(s=>state[s.id]==='skipped').length;
    $('#completion').textContent=`${done} / ${required.length} sets done${skipped?' · '+skipped+' skipped':''}`;
    const bulk=$('#complete-day');if(bulk){const allDone=done===required.length,reviewed=done+skipped===required.length;
      $('#session-complete').classList.toggle('is-complete',allDone);$('#session-complete-message').textContent=allDone?'Session complete.':reviewed?'Session finished with skips.':'Finished this session?';
      bulk.textContent=bulkUndo&&reviewed?'Undo finish':reviewed?'Finished':'Mark remaining sets done';bulk.disabled=reviewed&&!bulkUndo;
    }
    const skipPhase=$('#skip-phase');if(skipPhase){const canUndo=skipped>0&&done+skipped===required.length;skipPhase.textContent=canUndo?'Undo PM skips':done?'Skip remaining PM sets':'Skip PM swim';skipPhase.onclick=()=>{if(canUndo){required.forEach(s=>{if(state[s.id]==='skipped')delete state[s.id];});}else required.forEach(s=>{if(state[s.id]!=='done')state[s.id]='skipped';});bulkUndo=null;save(key,state);paint();};}
  }
  document.querySelectorAll('[data-done],[data-skip]').forEach(b=>b.onclick=()=>{const id=b.dataset.done||b.dataset.skip,value=b.dataset.done?'done':'skipped';if(state[id]===value)delete state[id];else state[id]=value;bulkUndo=null;save(key,state);paint();});paint();
  const bulk=$('#complete-day');if(bulk)bulk.onclick=()=>{if(bulkUndo){for(const key of Object.keys(state))delete state[key];Object.assign(state,bulkUndo);bulkUndo=null;}else{bulkUndo={...state};required.forEach(s=>{if(state[s.id]!=='skipped')state[s.id]='done';});}save(key,state);paint();};
}
function openRestChoices(title,rest,groups,trigger){
  $('#set-rest-options').innerHTML=`<h3>${esc(title)}</h3><p>${esc(rest)}</p>`+groups.map((group,i)=>`<fieldset><legend>${esc(group.label)}</legend><div class="rest-choices">${group.seconds.map(n=>`<button class="button secondary" data-set-duration="${n}" data-rest-group="${i}">${timeLabel(n)}</button>`).join('')}</div></fieldset>`).join('');
  $('#set-rest-options').hidden=false;$('#other-rest').open=false;
  document.querySelectorAll('[data-set-duration]').forEach(choice=>choice.onclick=()=>{const context=`${formatDate(activeDay.date)} · ${activeDay.phase?.label||'Warm-up'} · ${title} · ${groups[Number(choice.dataset.restGroup)].label}`;if(setTimerDuration(Number(choice.dataset.setDuration),context)){$('#timer-selection').textContent='Rest selected. Press Start when ready.';$('#timer-toggle').scrollIntoView({block:'nearest'});}});
  $('#timer-selection').textContent=timer.deadline?'Timer running. Pause before choosing another rest.':'Choose rest, then Start.';
  SwimNavigation.openDialog($('#rest-dialog'),trigger);
}
function attachSetControls(day){
  document.querySelectorAll('[data-effort]').forEach(b=>b.onclick=()=>SwimNavigation.openDialog($('#effort-dialog'),b));
  document.querySelectorAll('[data-rest-choice]').forEach(b=>b.onclick=()=>{const set=day.sets.find(s=>s.id===b.dataset.restChoice);openRestChoices(set.name,set.rest,set.timers,b);});
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
    <p class="prep-focus">${esc(day.focus)}</p><a class="text-link" href="${phaseURL(day,'before')}">Before pool · ${esc(day.phases.before.distanceLabel)}</a>
    <a class="button warmup-action" id="start-warmup" data-jump href="#warm-up">Start warm-up ${icon('forward')}</a>
    <details class="prep-details prep-logistics"><summary id="reporting-summary">Reporting time · ${esc(raceState.reporting||'not set')}</summary><p class="prep-hint">Enter official details when known. All fields are optional.</p><div class="prep-form-grid"><label>Reporting time<input id="reporting-time" type="time" value="${esc(raceState.reporting||'')}"></label>${[['eventNumber','Event number'],['heat','Heat'],['lane','Lane']].map(([key,label])=>`<label>${label}<input data-logistics="${key}" type="text" maxlength="40" value="${esc(raceState[key]||'')}"></label>`).join('')}</div><p id="reporting-status" role="status"></p></details>
    <nav class="prep-quick-links" aria-label="Race sections"><a data-jump href="#warm-up">Warm-up</a><a data-jump href="#race-cues">Race cues</a><a data-jump href="#race-result">Results</a></nav>
    <section class="prep-section" id="warm-up"><h2>Warm-up</h2><p class="prep-distance">${esc(day.distanceLabel)}</p><p class="prep-note">${esc(day.note)}</p><div class="classic-session-tools"><p id="completion" class="prep-progress" role="status"></p><button class="text-button" data-effort>Effort guide</button></div>${groupedSets(day)}<div class="session-complete" id="session-complete" aria-label="Warm-up completion"><p id="session-complete-message">Finished warming up?</p><button class="button" id="complete-day" type="button">Mark warm-up complete</button></div></section>
    <section class="prep-section" id="race-cues"><h2>Your ${event} m race</h2><div class="prep-race-cues">${day.raceCues.map(([label,text])=>`<article><h3>${esc(label)}</h3><p>${esc(text)}</p></article>`).join('')}</div>${day.raceNote?`<p class="race-cue-note">${esc(day.raceNote)}</p>`:''}</section>
    ${day.after?`<section class="prep-panel"><h2>After the 50 / PM</h2><p>${esc(day.after)}</p><a class="text-link" href="${phaseURL(day,'pm')}">Open optional recovery swim</a></section>`:''}
    <section class="prep-panel" id="race-result"><h2>Official result</h2><label>Final ${event} m time<input id="official-result" type="text" inputmode="decimal" maxlength="24" placeholder="Seconds or m:ss.xx" value="${esc(raceState.result||'')}" aria-describedby="official-status"></label><p id="official-status" role="status"></p><p class="prep-hint">Optional · auto-saved on this device</p><a class="text-link" href="race.html?view=results">View both race results ${icon('forward')}</a></section>
    <details class="prep-details" id="rehearsal-results"><summary>Earlier rehearsal records · Oct 1 & 2</summary>${recordForm(50)}${recordForm(100)}${copyControls()}</details>${techniqueDetails()}<details class="prep-details"><summary>Full race-day instructions</summary><pre>${esc(day.source)}</pre></details>`;
  attachCompletion(day);attachSetControls(day);attachRecord(50);attachRecord(100);attachCopyResults();
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
  document.body.insertAdjacentHTML('beforeend',`<dialog id="effort-dialog" class="prep-dialog" aria-labelledby="effort-heading"><div class="prep-dialog-head"><h2 id="effort-heading">Effort guide</h2><button class="text-button" data-close-dialog aria-label="Close effort guide">Close</button></div>${Object.entries(PREPARATION.efforts).map(([k,v])=>`<p><strong>${esc(k)}</strong><br>${esc(v)}</p>`).join('')}</dialog><dialog id="rest-dialog" class="prep-dialog" aria-labelledby="rest-heading"><div class="prep-dialog-head"><h2 id="rest-heading">Rest timer</h2><button class="text-button" data-close-dialog aria-label="Close rest timer">Close</button></div><p id="timer-context">Choose the rest shown in your session.</p><div id="set-rest-options" hidden></div><p id="timer-selection" role="status"></p><details id="other-rest" class="prep-details" open><summary>Other durations</summary><div class="prep-timer-options" id="timer-options"></div><form id="custom-rest"><label for="custom-rest-seconds">Custom rest · seconds</label><div><input id="custom-rest-seconds" type="number" inputmode="numeric" min="1" max="3600" step="1" required><button class="button secondary" type="submit">Set</button></div></form></details><p class="prep-clock" id="timer-clock" role="timer">0:00</p><div class="prep-controls"><button class="button" id="timer-toggle">Start</button><button class="button secondary" id="timer-reset">Reset</button></div><p id="timer-status" role="status"></p></dialog><footer class="classic-timer-footer" id="timer-footer" hidden><a id="next-set" class="footer-next" data-jump data-next-set hidden></a><div class="timer-row" id="timer-row"><button class="prep-timer-dock" id="timer-dock"><span>Rest<small id="timer-dock-state"></small><small id="timer-dock-context"></small></span><strong id="timer-preview"></strong>${icon('forward')}</button><button class="button" id="timer-quick-toggle" type="button" aria-label="Start rest timer">Start</button></div></footer>`);
  $('#timer-dock').onclick=()=>{$('#set-rest-options').hidden=true;$('#other-rest').open=true;$('#timer-selection').textContent='';paintTimer();SwimNavigation.openDialog($('#rest-dialog'),$('#timer-dock'));};
  $('#timer-toggle').onclick=()=>{
    if(!timer)return;
    if(timer.deadline){timer.remaining=remaining();timer.deadline=null;timer.status='Paused';}
    else {timer.remaining=remaining()||timer.duration;timer.deadline=Date.now()+timer.remaining*1000;timer.status='Running';}
    save('timer',timer);paintTimer();
  };
  $('#timer-quick-toggle').onclick=()=>{if(!timer.duration){const next=activeDay?.sets.find(set=>!['done','skipped'].includes(read(sessionKey(activeDay))[set.id]));const choice=next&&document.querySelector(`[data-rest-choice="${next.id}"]`);if(choice)choice.click();else $('#timer-dock').click();}else $('#timer-toggle').click();};
  $('#timer-reset').onclick=()=>{if(!timer)return;timer.deadline=null;timer.remaining=timer.duration;timer.status='Ready';save('timer',timer);paintTimer();};
  $('#custom-rest').onsubmit=e=>{e.preventDefault();const input=$('#custom-rest-seconds');if(!input.reportValidity())return;setTimerDuration(Number(input.value));};
  timerInterval=setInterval(paintTimer,250);document.addEventListener('visibilitychange',paintTimer);paintTimer();
  if(activeDay){const next=activeDay.sets.find(s=>!s.optional&&!['done','skipped'].includes(read(sessionKey(activeDay))[s.id]));const link=$('[data-next-set]');if(next){link.hidden=false;link.href='#set-'+next.id;link.textContent='Next · '+next.prescription;}}
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
  $('#timer-dock-context').textContent=timer.context?timer.context.split(' · ').slice(1).join(' · '):'';
  $('#timer-dock-context').hidden=!$('#timer-dock-context').textContent;
  $('#custom-rest-seconds').disabled=!!timer.deadline;$('#custom-rest button').disabled=!!timer.deadline;
  $('#timer-context').textContent=timer.context||'Manual rest';
  $('#timer-status').textContent=timer.status;$('#timer-dock-state').textContent=timer.status;$('#timer-toggle').textContent=timer.deadline?'Pause':timer.status==='Paused'?'Resume':'Start';
  const quick=$('#timer-quick-toggle');
  const action=!timer.duration?'Choose':timer.deadline?'Pause':timer.status==='Paused'?'Resume':timer.status==='Rest complete'?'Restart':'Start';
  quick.textContent=action;quick.setAttribute('aria-label',action+' rest timer');
  $('#timer-footer').classList.toggle('is-finished',timer.status==='Rest complete');
  $('#timer-dock').setAttribute('aria-label','Adjust rest timer, '+timeLabel(n)+', '+timer.status);
  document.querySelectorAll('[data-set-duration]').forEach(b=>b.disabled=!!timer.deadline);
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
