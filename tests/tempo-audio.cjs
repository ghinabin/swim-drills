const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../assets/tempo-core.js');
const scheduled=[], states=[], events={}, timers=new Map();let id=0, context;
class AudioContext {
  constructor(){context=this;this.currentTime=0;this.state='running';this.destination={};}
  async resume(){this.state='running';}
  createOscillator(){const node={frequency:{value:0},connect(){},disconnect(){},start(at){node.at=at;scheduled.push(node);},stop(at){if(at===undefined)node.cancelled=true;}};return node;}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
}
const window={AudioContext,addEventListener(){}};
const document={hidden:false,addEventListener(name,cb){events[name]=cb;}};
vm.runInNewContext(fs.readFileSync('assets/tempo-audio.js','utf8'),{window,document,TempoCore:core,navigator:{},setTimeout(cb){timers.set(++id,cb);return id;},clearTimeout(key){timers.delete(key);}});
function step(time){context.currentTime=time;const callbacks=[...timers.values()];timers.clear();callbacks.forEach(cb=>cb());}
(async()=>{
  const audio=window.createTempoAudio(s=>states.push(s));
  audio.configure(60,'arms',.35);await audio.start();
  assert.equal(scheduled[0].at,.05);
  step(.95);assert.equal(scheduled[1].at,1.05);
  step(1.95);assert.equal(scheduled[2].at,2.05);
  audio.pause();assert(!audio.running);assert(scheduled.every(n=>n.cancelled));assert.equal(timers.size,0);
  await audio.start();audio.configure(120,'arms',.35);
  step(2.35);assert(Math.abs(scheduled.at(-1).at-2.45)<1e-9);
  step(10);assert(scheduled.at(-1).at>10); // stalled JS skips missed beats
  document.hidden=true;events.visibilitychange();assert(!audio.running);assert.equal(timers.size,0);
  document.hidden=false;await audio.start();context.state='interrupted';context.onstatechange();assert(!audio.running);
  audio.stop();assert.equal(states.at(-1),'Ready');
  console.log('PASS audio clock scheduling, cancellation, mid-play target changes, drift recovery and interruption');
})().catch(error=>{console.error(error);process.exitCode=1;});
