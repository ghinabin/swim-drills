/* Rebuild app data from the approved Markdown; run node scripts/import-plan.cjs. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('SWIMMING-PLAN.md');
const previous = JSON.parse(read('data/previous-plan.json'));
const copy = JSON.parse(read('data/compact-copy.json'));
const workouts = JSON.parse(read('data/workouts.json'));
const plain = text => text.replace(/\*\*/g, '');
const revision = '2026-09-18-family-rest';
const months = {Sep: 8, Oct: 9};
const sections = [...source.matchAll(/^(### (Mon|Tue|Wed|Thu|Fri|Sat|Sun) (\d+) (Sep|Oct) — (.+)|## Race day (\d) — (Monday|Tuesday) (\d+) October)\n([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm)];
assert.equal(sections.length, 30, 'Expected 28 plan dates and two race days');
const noteSummaries = {
  w1d4: 'Easy reset. No timed 50 today; skip if your coached swim is already complete.',
  w2d0: 'Controlled second 25. Continuous 50 only if the broken pairs feel comfortable.',
  w2d1: 'Comfortable 50s. Weekday starts replace 50 m of drills; no extra distance.',
  w2d3: 'Familiar turns; stay fresh for Friday. Skip builds if drills tire you.',
  w2d4: 'One timed 50, early while fresh. If warm-up feels difficult, use 2 × 25 easy.',
  w3d0: 'Fewer reps. If 21 Sep was difficult, use easy 25s for both main sets.',
  w3d1: 'Keep rest at 45–60 s unless 22 Sep was comfortable and you feel fresh.',
  w3d3: 'Light preparation. Use easy single lengths if turns affect breathing.',
  w3d4: 'Final timed 50. Match 25 Sep conditions; no second attempt.',
  w4d0: 'Three quick lengths, full recovery. No catch-up reps.',
  w4d1: 'Easy technique. Replace starts with easy lengths if flat or sore.',
  w4d3: 'One controlled 50 (7–8/10). Replace with 2 × 25 easy if difficult.',
  w4d4: 'Two quick lengths. If tired from Thursday, swim easy or rest.',
  w4d6: 'Optional 250 m. Wall pushes only; rest if tired, unwell or needing sleep.',
  race: 'Follow official event times. Confirm pool length and entries; recover for tomorrow.',
  race2: 'Check recovery with your coach. Repeat the familiar routine; shorten warm-up if tiring.'
};
const days = sections.map(match => {
  const race = !!match[6];
  const date = new Date(2026, race ? 9 : months[match[4]], Number(race ? match[8] : match[3]));
  const dayIndex = Math.round((Date.UTC(2026, date.getMonth(), date.getDate()) - Date.UTC(2026,8,14))/86400000);
  const wi = race ? 4 : Math.floor(dayIndex / 7);
  const di = race ? Number(match[6])-1 : dayIndex % 7;
  const id = race ? (di ? 'race2' : 'race') : `w${wi+1}d${di}`;
  if (dayIndex < 4) return {...previous.find(d=>d.id===id), historical: true};
  const body = match[9];
  const rest = body.includes('**Recovery day');
  const meta = body.match(/\*\*Pool:\*\* (.+?) · \*\*Distance:\*\* ([\d,]+) m · \*\*Lengths:\*\* (\d+)/);
  const rows = [...body.matchAll(/^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm)];
  assert(rows.length > 0, id+' has sets');
  const blocks = rows.map(row => {
    const title = row[2].replace(/ \(.*\)$/, '');
    const group = row[2].match(/block ([AB])/);
    const n = race ? row[1] : rest ? 0 : Number(row[3].match(/^(\d+) lengths/)[1]);
    const meters = race ? null : rest ? 0 : Number(row[3].match(/\/ (\d+) m$/)[1]);
    const k = /Start|Turn|Alignment|Breathing practice/.test(title) ? 'skill' : /Catch/.test(title) ? 'tech' : title==='Endurance' ? 'endurance' : /Broken|Continuous|Short speed|Full 50|Brief builds|^Race$/.test(title) ? 'pace' : 'easy';
    const description = copy[row[4]] || row[4];
    let restText = row[5];
    if (/all drills/.test(restText)) restText = '25–30 s per rep · easy 2–4/10';
    if (/20 s between halves/.test(restText)) restText = 'Pause 20 s if comfortable, else 45–60 s. Rest 3 min per pair.';
    if (/only shorten/.test(restText)) restText = '45–60 s per 50; 30–45 s only if 22 Sep was comfortable and you are fresh. Easy 25s: 30–45 s.';
    if (/At least 3 min settled/.test(restText)) restText = '3+ min settled recovery before and after the 50';
    if (/Aim to finish water/.test(restText)) restText = 'Warm-up ends 15–25 min before heat if possible; official reporting times take priority.';
    const details = [];
    if (description !== row[4]) details.push(row[4]);
    if (restText !== row[5]) details.push('Rest: '+row[5]);
    return {n,t:title,d:description,r:restText,k,meters,volume:row[3],group:group?.[1] || '',progressKey:'r2-b'+(Number(row[1])-1),...(details.length ? {details} : {})};
  });
  const notes = [...body.matchAll(/^\*\*([^*]+):\*\* (.+)$/gm)]
    .filter(m=> !['Pool','Practice focus','Quick log','Race log','Workout'].includes(m[1]))
    .map(m=>plain(m[1]+': '+m[2]));
  const sequence = [...body.matchAll(/^- (.+)$/gm)].map(m=>plain(m[1]));
  const focus = body.match(/\*\*Practice focus:\*\* (.+)/)?.[1];
  const day = {
    id,wi,di,date:`2026-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,
    dow:race ? (di?'Tue':'Mon') : match[2],title:race?'Race day '+match[6]:match[5],
    pool:race?'Confirm course':rest?'—':meta[1],
    laps:meta ? Number(meta[3]):0,dist:meta ? Number(meta[2].replace(',','')).toLocaleString('en-US')+' m':rest?'0 m':'50 m freestyle',
    ...(rest?{rest:1}:{}),...(race?{race:1}:{}),...(id==='w4d6'?{optional:true}:{}),
    blocks,note:noteSummaries[id] || (rest ? (di===5 ? 'Family/rest day. No swim or catch-up drills.' : 'Rest day. No catch-up swimming or hard gym work.') : focus),noteDetails:notes.concat(sequence),
    ...(focus?{focus}:{}),weekName:race?'Competition':'Week '+(wi+1)
  };
  if (!race && !rest) {
    assert.equal(blocks.reduce((sum,b)=>sum+b.meters,0),Number(meta[2].replace(',','')),id+' metres');
    assert.equal(blocks.reduce((sum,b)=>sum+b.n,0),day.laps,id+' lengths');
  }
  return day;
});
// Land work is scheduled separately; never add it to swim blocks or metres.
days.forEach(day => {
  day.workouts = day.historical || day.rest ? []
    : day.race ? ['raceWarmup']
    : day.wi === 3 ? ['taper'] : ['morning'];
  if (day.id === 'w2d1') day.workouts.push('strength22');
  if (day.id === 'w3d1') day.workouts.push('strength29');
});
const weeks = [
  {name:'Reset',sub:'Easy reset; weekend rest',start:'2026-09-14',distance:'800 m'},
  {name:'Connect & rehearse',sub:'Four swims; rest Wed, Sat and Sun',start:'2026-09-21',distance:'3,400 m'},
  {name:'Taper begins',sub:'Fewer reps; final timed 50',start:'2026-09-28',distance:'2,550 m'},
  {name:'Race week',sub:'Short sessions; optional Sunday shakeout',start:'2026-10-05',distance:'1,500–1,750 m'}
];
const guidance = [
  '07:30–09:30 is access time, not a two-hour workout. Block A: coached warm-up/drills. Block B: listed practice and cool-down, up to 30 min. Coach-led metres replace rows; do not add a second workout.',
  'Daily distance includes all swimming. Totals are ceilings. If drills use most of the distance or leave you tired, omit remaining work and keep the cool-down.',
  'Rest is after each rep, not a send-off. Between sets: 60 s or the longer stated rest. Use the longer overlapping rest, not two added waits. Start only once breathing settles.',
  'Easy: 2–4/10. Controlled: 7/10. Quick: 8/10. Timed 50: 8–9/10. These are effort ratings, not percentages of speed.',
  'Breathe whenever needed; exhale gently and rotate to inhale. Optional buoy/fist drills can become easy freestyle. No breath holds, hyperventilation, underwater distance targets or fixed kick counts.',
  'Familiar starts only, directly supervised and permitted. Use wall pushes if needed. No new dive or tumble-turn technique near the meet. Saturdays are family/rest days; no make-up sessions.',
  '25 Sep, 2 Oct and 8 Oct: rehearse early while fresh, before a long class. From 5 Oct, follow the short table only; no extra class to fill time.',
  'Green: comfortable easy 50s, settled breathing after rest, steady second length, normal next-day recovery. Continue by date; never repeat a week or delay the taper.',
  'Amber: gasping, ragged stroke, repeated extra rest or persistent soreness/fatigue. Make the next swim shorter and easy; omit starts/speed. If it persists, rest and review with your coach.',
  'Difficult 50: use 2 × 25 easy with 30–45 s rest. Broken 50: extend the 20 s pause to 45–60 s if needed and treat it as ordinary 25s.',
  'Stop hard work after two clearly slower or technically poor reps despite rest. Stop for unusual breathlessness, chest discomfort, dizziness or wheeze and tell your coach. Severe or persistent breathing difficulty needs urgent medical help.',
  'Meet: 12–13 Oct. Confirm events, pool length and reporting times. 50 m race: one turn in a 25 m pool; none in a 50 m pool. Compare times only under matching start/pool/turn conditions.'
];
const output = `/* Generated from SWIMMING-PLAN.md by scripts/import-plan.cjs. */\n'use strict';\nvar PLAN_REVISION = ${JSON.stringify(revision)};\n// Previous prescriptions support read-only saved history; never used for new sessions.\nvar PREVIOUS_DAYS = ${JSON.stringify(previous)};\nvar WORKOUTS = ${JSON.stringify(workouts,null,2)};\nvar PLAN_GUIDANCE = ${JSON.stringify(guidance,null,2)};\nvar DAYS = ${JSON.stringify(days,null,2)};\nvar WEEKS = ${JSON.stringify(weeks,null,2)};\nvar MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];\nvar LAB = {easy:'easy',tech:'technique',skill:'skill',pace:'controlled / quick',endurance:'endurance',max:'max effort'};\nDAYS.forEach(function(d) { d.date = new Date(d.date.slice(0,10)+'T00:00:00'); });\nWEEKS.forEach(function(w,wi) { w.days = DAYS.filter(function(d) { return d.wi===wi && !d.race; }); });\nvar RACE_DATE = new Date(2026,9,12);\nfunction fmt(d) { return d.getDate()+' '+MON[d.getMonth()]; }\nfunction total(d) { return d.blocks.length; }\n`;
fs.writeFileSync(path.join(root,'assets/data.js'),output);
console.log('Imported '+days.length+' dates; all prescribed training metres and lengths match the latest Markdown.');
