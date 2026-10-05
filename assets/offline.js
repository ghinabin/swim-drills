(() => {
  let registration, updating = false;
  const button = document.createElement('button');
  button.className = 'text-button'; button.id = 'app-update';
  button.textContent = 'Update app'; button.hidden = true;
  (document.querySelector('#phase-switch') || document.querySelector('.supporting-tools') || document.querySelector('main')).append(button);
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  button.onclick = () => {
    if (LaneStorage.unsaved) { toast('Retry saving your changes before updating.'); return; }
    if (registration?.waiting) { updating = true; registration.waiting.postMessage({type:'ACTIVATE_UPDATE'}); }
  };
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload();});
  navigator.serviceWorker.register('sw.js').then(async reg => {
    registration = reg;
    const checkUpdate = () => { button.hidden = !reg.waiting; };
    checkUpdate();
    reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',checkUpdate));
    await navigator.serviceWorker.ready;
    checkUpdate();
    window.addEventListener('online', () => { registration.update().catch(() => {}); });
  }).catch(() => {});
})();
