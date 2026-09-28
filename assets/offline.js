(() => {
  let ready = false, registration, updating = false;
  const button = document.createElement('button');
  button.className = 'text-button'; button.id = 'app-update';
  button.textContent = 'Update app'; button.hidden = true;
  document.querySelector('.app-status').append(button);
  const message = text => document.querySelectorAll('[data-offline-status]').forEach(status=>status.textContent=text);
  const paint = () => message(ready ? (navigator.onLine ? 'Ready offline' : 'Offline · ready') : 'Preparing offline…');
  paint();
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    message('Offline access requires HTTPS or localhost.');
    return;
  }
  button.onclick = () => {
    if (LaneStorage.unsaved) { toast('Save your changes or export a backup before updating.'); return; }
    if (registration?.waiting) { updating = true; registration.waiting.postMessage({type:'ACTIVATE_UPDATE'}); }
  };
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload();});
  navigator.serviceWorker.register('sw.js').then(async reg => {
    registration = reg;
    const checkUpdate = () => { button.hidden = !reg.waiting; };
    checkUpdate();
    reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',checkUpdate));
    await navigator.serviceWorker.ready;
    ready = true; paint(); checkUpdate();
    window.addEventListener('online', () => { paint(); registration.update().catch(() => {}); });
  }).catch(() => message('Offline download unavailable. Reconnect and reload to retry.'));
  window.addEventListener('offline', paint);
})();
