/* Short scheduled tones; JS wakes only to fill a bounded audio-clock horizon. */
(() => {
  'use strict';
  window.createTempoAudio = (onState) => {
    let context, timer, next = 0, spm = 60, mode = 'arms', volume = .35, running = false, generation = 0, wake;
    const nodes = new Set();
    function clear() {
      clearTimeout(timer);
      for (const n of nodes) { try { n.stop(); } catch (_) {} }
      nodes.clear();
    }
    function tone(at) {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.frequency.value = 1100;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(volume,at + .003);
      gain.gain.exponentialRampToValueAtTime(.0001,at + .045);
      oscillator.connect(gain); gain.connect(context.destination);
      nodes.add(oscillator);
      oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(at); oscillator.stop(at + .05);
    }
    function schedule() {
      if (!running) return;
      const now = context.currentTime;
      if (next < now) next = now + .025; // Never replay missed beats.
      while (next < now + .12) { tone(next); next += TempoCore.interval(spm,mode); }
      timer = setTimeout(schedule,25);
    }
    function pause(reason = 'Paused') {
      generation++; running = false; clear();
      if (wake) { wake.release().catch(() => {}); wake = null; }
      onState(reason);
    }
    async function prepare() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio is unavailable in this browser.');
      if (!context) {
        context = new Audio();
        context.onstatechange = () => { if (running && context.state !== 'running') pause('Audio interrupted. Press Resume.'); };
      }
      await context.resume();
      if (context.state !== 'running') throw new Error('Audio could not start. Test sound and try again.');
    }
    document.addEventListener('visibilitychange',() => { if (document.hidden && running) pause('Page hidden. Press Resume.'); });
    window.addEventListener('pagehide',() => pause('Paused'));
    return {
      async start() {
        const token = ++generation;
        await prepare();
        if (token !== generation || document.hidden) return;
        clear(); running = true; next = context.currentTime + .05; onState('Playing'); schedule();
        try {
          const lock = await navigator.wakeLock?.request('screen');
          if (running && token === generation) wake = lock; else lock?.release().catch(() => {});
        } catch (_) {}
      },
      pause,
      stop() { pause('Ready'); },
      configure(target, unit, level) {
        TempoCore.rate(target); const changed = target !== spm || unit !== mode; spm = target; mode = unit; volume = level;
        if (running && changed) { clear(); next = context.currentTime + TempoCore.interval(spm,mode); schedule(); }
      },
      async test() { const token = ++generation; await prepare(); if (token === generation && !document.hidden) { clear(); tone(context.currentTime + .02); } },
      get running() { return running; }
    };
  };
})();
