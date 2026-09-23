/* Guard the desktop schedule against accidental replacement by another plan. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const plan = {};
vm.createContext(plan);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/data.js'), 'utf8'), plan);

assert.equal(plan.DAYS.length, 19);
assert.deepEqual(Array.from(plan.WEEKS, week => week.name), ['Last load', 'Taper', 'Race week']);
assert.equal(plan.DAYS[0].title, '4 × 50 test #1');
assert.equal(plan.DAYS[0].date.getDate(), 23);
assert.equal(plan.DAYS[0].date.getMonth(), 8);
assert.equal(plan.DAYS.at(-1).date.getDate(), 11);
assert.equal(plan.DAYS.at(-1).date.getMonth(), 9);
assert.equal(new Set(plan.DAYS.map(day => day.id)).size, 19);
assert.equal(plan.DAYS.filter(day => day.rest).length, 3);
assert(plan.DAYS.filter(day => day.dow === 'Sat').every(day => day.rest));

for (const day of plan.DAYS) {
  const counted = day.blocks.reduce((sum, block) =>
    sum + (typeof block.n === 'number' ? block.n : 0), 0);
  assert.equal(counted, day.laps, day.id + ' lengths');
}

const main = plan.DAYS[0].blocks.find(block => block.t === 'Main');
assert.match(main.d, /4 × 50 all out from push on 2:00/);
assert.match(main.d, /4 × 25 at 100 race pace on :45/);
console.log('PASS desktop schedule, 19 dates, distances, and original start intervals.');
