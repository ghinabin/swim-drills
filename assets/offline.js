(() => {
  const status = document.createElement('p');
  status.className = 'offline-status';
  status.setAttribute('role', 'status');
  document.querySelector('.layout').after(status);
  let ready = false;
  const paint = () => status.textContent = ready
    ? (navigator.onLine ? 'Ready offline · Results saved on this device' : 'Offline · Results saved on this device')
    : 'Preparing offline access…';
  paint();
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Offline access requires HTTPS or localhost. Results stay on this device.';
    return;
  }
  navigator.serviceWorker.register('sw.js').then(async registration => {
    await navigator.serviceWorker.ready;
    ready = true; paint();
    window.addEventListener('online', () => { paint(); registration.update().catch(() => {}); });
  }).catch(() => { status.textContent = 'Offline download unavailable. Reconnect and reload to retry.'; });
  window.addEventListener('offline', paint);
})();
