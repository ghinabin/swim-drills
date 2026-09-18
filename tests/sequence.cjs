/* Approved-plan content, distances, dates, and saved-history migration. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const c = {document:{body:{dataset:{}},getElementById(){}},localStorage:{getItem(){return null;}}};
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'assets/data.js'),'utf8'),c);
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
vm.runInContext(app.slice(0,app.indexOf('const icons =')),c);
const day=id=>c.DAYS.find(d=>d.id===id);
const json=value=>JSON.parse(JSON.stringify(value));
const normalize=saved=>json(c.normalize(saved));
assert.equal(c.DAYS.length,30);
assert.equal(new Set(c.DAYS.map(d=>d.id)).size,30);
for(let i=0;i<30;i++) {
  const expected = new Date(2026,8,14+i);
  const d=c.DAYS[i];
  assert.equal(d.date.getDate(),expected.getDate(),d.id+' calendar date');
  assert.equal(d.date.getMonth(),expected.getMonth(),d.id+' calendar month');
  assert.equal(new Set(d.blocks.map((b,i)=>b.progressKey||'b'+i)).size,d.blocks.length);
  if(d.historical || d.race) continue;
  const meters=d.blocks.reduce((sum,b)=>sum+b.meters,0);
  assert.equal(meters,Number(d.dist.replace(/[^0-9]/g,'')),d.id+' all metres counted');
  assert.equal(d.blocks.reduce((sum,b)=>sum+b.n,0),d.laps,d.id+' lengths');
  assert.equal(meters,d.laps*(d.rest?0:25));
  if(d.di===5 || d.di===2 || (d.di===6 && d.wi!==3)) assert(d.rest,d.id+' rest day');
}
assert.deepEqual(c.WEEKS.map((w,wi)=>c.DAYS.filter(d=>d.wi===wi&&!d.historical&&!d.race).reduce((sum,d)=>sum+Number(d.dist.replace(/[^0-9]/g,'')),0)).slice().join(','),'800,3400,2550,1750');
assert(day('w4d6').optional);
assert.equal(day('w4d6').dist,'250 m');
assert(!day('w1d4').blocks.some(b=>b.t.includes('rehearsal')));
for(const id of ['w2d1','w2d4','w3d1','w3d4','w4d1']) {
  const d=day(id),start=d.blocks.findIndex(b=>b.t==='Start practice');
  assert(start>=0,id+' weekday starts');
  assert.match(d.blocks[start].d,/2 × 25/);
  assert(d.blocks[start].group==='B');
  const endurance=d.blocks.findIndex(b=>b.t==='Endurance');
  if(endurance>=0) assert(start<endurance);
}
for(const id of ['w2d4','w3d4','w4d3']) {
  const b=day(id).blocks.find(b=>b.t==='Full 50 m race rehearsal');
  assert.equal(b.meters,50);
  assert.match(b.d,/No second attempt/);
  assert.match(b.r,/3\+ min/);
}
assert.equal(day('race').blocks.length,6);
assert.equal(day('race2').blocks.length,6);
assert(day('race').noteDetails.some(s=>s.includes('before 13 October')));
assert(day('race2').noteDetails.some(s=>s.includes('Morning check')));
// Every supplied table instruction/rest remains visible either directly or under More.
const source=fs.readFileSync(path.join(root,'SWIMMING-PLAN.md'),'utf8');
const active=c.DAYS.filter(d=>!d.historical);
const all=active.flatMap(d=>d.blocks.flatMap(b=>[b.d,b.r,...(b.details||[])]));
for(const row of source.matchAll(/^\| \d+ \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm)) {
  assert(all.some(text=>text.includes(row[3])),'Missing instruction: '+row[3]);
  assert(all.some(text=>text.includes(row[4])),'Missing rest: '+row[4]);
}
// Test every legacy completion pattern, including the previous split-start migration.
for(const d of c.PREVIOUS_DAYS) {
  for(let mask=0;mask<2**d.blocks.length;mask++) {
    const checks={};
    d.blocks.forEach((b,i)=>{if(mask&(1<<i))checks[b.progressKey||'b'+i]=1;});
    const migrated=normalize({done:{[d.id]:checks},sequenceVersion:1});
    if(day(d.id)?.historical) assert.deepEqual(migrated.done[d.id],checks);
    else {
      assert.equal(Object.keys(migrated.done[d.id]||{}).length,0,'Changed workouts never inherit checks');
      if(mask) assert.deepEqual(migrated.archived.find(a=>a.id===d.id).done,checks);
    }
    assert.deepEqual(normalize(migrated),migrated,'Idempotent migration');
  }
}
const legacy=normalize({done:{w4d1:{b2:1}}});
assert.deepEqual(legacy.archived[0].done,{b2:1,'b2-cooldown':1});
const current=normalize({planRevision:c.PLAN_REVISION,done:{w1d4:{'r2-b0':1}},logs:{w1d4:{meters:550,effort:3}},skipped:{w4d6:true}});
assert.deepEqual(normalize(current),current);
assert.equal(current.logs.w1d4.meters,550);
console.log('PASS 30 dated entries, latest Saturday-free schedule, weekly totals, all source instructions, and every legacy progress pattern.');
