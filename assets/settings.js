/* Local data tools: explicit backup preview, strict validation, atomic restore. */
(() => {
  'use strict';
  const query = selector => document.querySelector(selector);
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  function validateBackup(backup) {
    if (!object(backup) || backup.format !== 'lane50-backup' || backup.version !== 1)
      throw new Error('Choose a Lane 50 backup file (version 1).');
    if (backup.planRevision !== PREPARATION.revision && Object.keys(backup.records || {}).some(key => key !== 'tempo:profile'))
      throw new Error('This backup belongs to a different plan. Your current records have not changed.');
    if (!object(backup.records) || !Object.keys(backup.records).length)
      throw new Error('This backup has no records to restore.');
    for (const [key, value] of Object.entries(backup.records)) {
      if (!object(value)) throw new Error('A record in this backup is invalid.');
      if(key === 'tempo:profile') { TempoCore.validateProfile(value); continue; }
      let day, sets;
      for(const candidate of PREPARATION.days) {
        if(key === 'session:'+candidate.id) { day=candidate; sets=candidate.sets; break; }
        const phase=Object.entries(candidate.phases||{}).find(([phase])=>key === 'session:'+candidate.id+':'+phase);
        if(phase) { day=candidate; sets=phase[1].sets; break; }
      }
      if (day) {
        for (const [id, state] of Object.entries(value)) {
          if (!sets.some(set => set.id === id) || !['done','skipped'].includes(state))
            throw new Error('This backup contains an unknown set or completion state.');
        }
        continue;
      }
      const fields = {
        'rehearsal:50':['p25','p50','turn','technique'],
        'rehearsal:100':['p25','p50','p75','p100'],
        'race:50':['reporting','result','eventNumber','heat','lane'],
        'race:100':['reporting','result','eventNumber','heat','lane'],
      }[key];
      if (!Array.isArray(fields)) throw new Error('This backup contains an unknown record.');
      for (const [field, text] of Object.entries(value)) {
        if (!fields.includes(field) || typeof text !== 'string' || text.length > (['eventNumber','heat','lane'].includes(field)?40:24))
          throw new Error('This backup contains an invalid field.');
        if (field === 'reporting' && text && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text))
          throw new Error('A reporting time in this backup is invalid.');
        if (field === 'turn' && !['','Good','Average','Poor'].includes(text)) throw new Error('Invalid turn rating.');
        if (field === 'technique' && !['','Good','Breaking down'].includes(text)) throw new Error('Invalid technique rating.');
      }
    }
    return backup.records;
  }
  // Export excludes the running timer: restoring records must never start a countdown.
  function backupData() {
    const records = Object.fromEntries(Object.entries(LaneStorage.records()).filter(([key])=>key !== 'timer'));
    return {format:'lane50-backup',version:1,planRevision:PREPARATION.revision,exportedAt:new Date().toISOString(),records};
  }
  query('main').insertAdjacentHTML('afterbegin', `<div class="app-status"><span data-offline-status role="status">Preparing offline…</span><button class="text-button" id="data-open">Data & backup</button></div><section class="save-warning" id="save-warning" hidden aria-label="Unsaved changes"><p id="save-message" role="status"></p><button class="button secondary" id="save-retry">Retry</button></section>`);
  document.body.insertAdjacentHTML('beforeend', `<dialog class="prep-dialog data-dialog" id="data-dialog" aria-labelledby="data-heading" data-trigger="data-open"><div class="prep-dialog-head"><h2 id="data-heading">Your data</h2><button class="text-button" data-close-dialog>Close</button></div><p>Saved in this browser, on this device. There is no account or cloud sync. Clearing browser data removes your saved records.</p><p data-offline-status role="status">Preparing offline…</p><p id="data-save-state" role="status"></p><button class="button" id="export-backup">Export backup</button><p class="prep-hint">Includes saved tempos, set progress, rehearsal drafts, official results and race details for this plan. Export tempos separately from Tempo to transfer them to another plan. Keep the file somewhere you can find it.</p><hr><h3>Restore a backup</h3><label>Choose a Lane 50 backup<input type="file" id="backup-file" accept="application/json,.json"></label><p id="restore-status" role="status"></p><button class="button secondary" id="restore-backup" hidden>Restore these records</button><button class="button" id="reload-restored" hidden>Show restored records</button><hr><h3>Use from your home screen</h3><p>On iPhone or iPad, open in Safari and choose Share → Add to Home Screen. On Android, use your browser’s Install app or Add to Home screen option when available.</p><p class="prep-hint">Open once online and check “Ready offline” before heading to the pool.</p></dialog>`);
  // Keep pool setup/reference controls in the day menu, leaving the drill visible.
  if(document.body.dataset.page==='session' && query('#phase-switch'))
    query('#phase-switch').append(query('.app-status'));
  const warning = query('#save-warning');
  function paintSave() {
    warning.hidden = !LaneStorage.unsaved && !LaneStorage.unavailable;
    query('#save-message').textContent = LaneStorage.unsaved
      ? 'Changes not saved. Retry or export a backup before leaving.'
      : 'Saved data is unavailable. Retry before recording changes.';
    query('#data-save-state').textContent = LaneStorage.unsaved
      ? 'Unsaved changes are included in your backup.'
      : LaneStorage.unavailable ? 'Saved records could not be read. Export may be incomplete.' : 'Records saved on this device.';
    query('#save-retry').disabled = false;
  }
  new ResizeObserver(()=>document.documentElement.style.setProperty('--save-warning-height',warning.hidden?'0px':warning.getBoundingClientRect().height+'px')).observe(warning);
  document.addEventListener('lane:storage',paintSave);
  paintSave();
  query('#save-retry').onclick=()=>{
    if(LaneStorage.retry()) {
      toast('Saved on this device.');
      // A previously inaccessible store may contain records absent from this screen.
      if(query('#save-retry').dataset.reload==='true')location.reload();
    }
  };
  if(LaneStorage.unavailable)query('#save-retry').dataset.reload='true';
  query('#data-open').onclick=()=>SwimNavigation.openDialog(query('#data-dialog'),query('#data-open'));
  query('#export-backup').onclick=()=>{
    const data=JSON.stringify(backupData(),null,2);
    const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='lane50-backup-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  };
  let candidate=null, selection=0;
  query('#backup-file').onchange=async event=>{
    const version=++selection;
    candidate=null;query('#restore-backup').hidden=true;query('#reload-restored').hidden=true;
    const file=event.target.files[0], status=query('#restore-status');
    if(!file){status.textContent='';return;}
    try {
      if(file.size>1024*1024)throw new Error('Choose a backup smaller than 1 MB.');
      const raw=await file.text();
      if(version!==selection)return;
      candidate=validateBackup(JSON.parse(raw));
      const count=Object.keys(candidate).length;
      status.textContent=`Ready to restore ${count} record${count===1?'':'s'} for this plan. Matching records, including any saved tempos, will be replaced; other records stay as they are.`;
      query('#restore-backup').hidden=false;
    } catch(error) {
      if(version!==selection)return;
      status.textContent=error instanceof SyntaxError?'This is not a readable JSON backup.':error.message;
    }
  };
  query('#restore-backup').onclick=()=>{
    if(!candidate)return;
    try {
      LaneStorage.restore(candidate);
      query('#restore-status').textContent='Backup restored. Show restored records to refresh this screen.';
      query('#restore-backup').hidden=true;query('#reload-restored').hidden=false;candidate=null;
      // Prevent editing a stale screen after the import.
      query('#data-dialog').querySelector('[data-close-dialog]').textContent='Show restored records';
      query('#data-dialog').addEventListener('close',()=>location.reload(),{once:true});
    } catch(_) {
      query('#restore-status').textContent='Restore could not be saved. Existing records have not changed. Free browser storage or allow storage, then try again.';
    }
  };
  query('#reload-restored').onclick=()=>query('#data-dialog [data-close-dialog]').click();
  // Settings dialogs are created after the app marks navigation ready.
  if(history.state?.laneDialog==='data-dialog')SwimNavigation.openDialog(query('#data-dialog'),query('#data-open'),false);
})();
