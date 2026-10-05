/* Only show a save warning when local persistence needs attention. */
(() => {
  'use strict';
  const query = selector => document.querySelector(selector);
  query('main').insertAdjacentHTML('afterbegin', '<section class="save-warning" id="save-warning" hidden aria-label="Unsaved changes"><p id="save-message" role="status"></p><button class="button secondary" id="save-retry">Retry</button></section>');
  const warning = query('#save-warning');
  function paintSave() {
    warning.hidden = !LaneStorage.unsaved && !LaneStorage.unavailable;
    query('#save-message').textContent = LaneStorage.unsaved
      ? 'Changes not saved. Retry before leaving.'
      : 'Saved data is unavailable. Retry before recording changes.';
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
})();
