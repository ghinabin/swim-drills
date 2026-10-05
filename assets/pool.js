/* Opt-in screen wake lock for pouch use; failures are visible and non-blocking. */
(() => {
  'use strict';
  if (!['session','race'].includes(document.body.dataset.page) || !document.querySelector('[data-done]')) return;
  const tools = document.createElement('div');
  tools.className='pouch-tools';
  tools.innerHTML='<button class="button secondary" id="keep-screen" aria-pressed="false">Keep screen on</button><small id="screen-state" role="status">Optional · while this page is visible</small>';
  const menu=document.querySelector('.phase-switch');
  if(menu)menu.append(tools);else document.querySelector('.classic-session-tools').before(tools);
  const button=tools.querySelector('button'),status=tools.querySelector('small');
  let wanted=false,lock=null,generation=0;
  async function acquire(){
    const token=++generation;
    if(!wanted||document.hidden)return;
    if(!navigator.wakeLock){status.textContent='Not supported here. Adjust your device screen timeout.';wanted=false;button.textContent='Keep screen on';button.setAttribute('aria-pressed','false');return;}
    try{
      const next=await navigator.wakeLock.request('screen');
      if(token!==generation||!wanted||document.hidden){next.release().catch(()=>{});return;}
      lock=next;status.textContent='Screen stays on while this page is visible.';
      next.addEventListener('release',()=>{if(lock===next){lock=null;status.textContent=wanted?'Screen lock released. Toggle off and on to retry.':'Screen timeout restored.';}});
    }catch(_){status.textContent='Could not keep screen on. Tap to retry.';wanted=false;button.textContent='Keep screen on';button.setAttribute('aria-pressed','false');}
  }
  function release(){generation++;lock?.release().catch(()=>{});lock=null;}
  button.onclick=()=>{
    wanted=!wanted;button.setAttribute('aria-pressed',String(wanted));button.textContent=wanted?'Screen on · turn off':'Keep screen on';
    if(wanted)acquire();else{release();status.textContent='Screen timeout restored.';}
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();else if(wanted)acquire();});
  window.addEventListener('pagehide',release);
  window.addEventListener('pageshow',()=>{if(wanted&&!lock)acquire();});
})();
