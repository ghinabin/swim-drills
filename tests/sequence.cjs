/* Workout sequence and legacy completion migration. Run: node tests/sequence.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = {
  document: { body: { dataset: {} }, getElementById() {} },
  localStorage: { getItem() { return null; } },
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/data.js'), 'utf8'), context);
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
vm.runInContext(app.slice(0, app.indexOf('const icons =')), context);
const normalize = saved => JSON.parse(JSON.stringify(context.normalize(saved)));
const day = id => context.DAYS.find(d => d.id === id);
const titles = id => Array.from(day(id).blocks, b => b.t);

assert.deepEqual(titles('w2d0'), ['Warm-up', 'Fist swimming', 'Turn block', 'Main set', 'Kick on board', 'Cool-down']);
assert.deepEqual(titles('w3d0'), titles('w2d0'));
assert.match(day('w3d0').blocks[4].d, /easy to controlled/);
assert.equal(titles('w2d2')[1], 'Breakout block');
assert.deepEqual(titles('w4d1'), ['Warm-up', 'Start practice', 'Main set', 'Cool-down']);
for (const id of ['w1d4', 'w2d4', 'w3d4']) {
  assert.equal(titles(id)[1], 'Catch to freestyle');
  assert.match(day(id).blocks[1].d, /normal freestyle/);
}

// Exhaust every partial completion pattern for each reordered/split session.
const maps = {
  w2d0: [0, 2, 3, 4, 1, 5],
  w3d0: [0, 2, 3, 4, 1, 5],
  w2d2: [0, 4, 1, 2, 3, 5, 6],
  w4d1: [0, 2, 1, 2],
};
for (const [id, oldIndices] of Object.entries(maps)) {
  const oldCount = Math.max(...oldIndices) + 1;
  for (let mask = 0; mask < 2 ** oldCount; mask++) {
    const checks = {};
    for (let i = 0; i < oldCount; i++) if (mask & (1 << i)) checks['b' + i] = 1;
    const migrated = normalize({ done: { [id]: checks } });
    day(id).blocks.forEach((block, i) => {
      assert.equal(!!migrated.done[id][block.progressKey], !!(mask & (1 << oldIndices[i])), `${id} mask ${mask} set ${i}`);
    });
    assert.deepEqual(normalize(migrated), migrated, 'migration is idempotent');
  }
}
const split = normalize({ done: { w4d1: { b2: 1 } } });
assert.deepEqual(split.done.w4d1, { b2: 1, 'b2-cooldown': 1 });
delete split.done.w4d1['b2-cooldown'];
assert.deepEqual(normalize(split).done.w4d1, { b2: 1 }, 'unchecking cool-down survives reload');
assert.deepEqual(normalize({ done: { w1d0: { b1: 1 }, w1d3: { b3: 1 } } }).done,
  { w1d0: { b1: 1 }, w1d3: { b3: 1 } }, 'historical checks retain positions');
for (const d of context.DAYS) {
  const keys = d.blocks.map((b, i) => b.progressKey || 'b' + i);
  assert.equal(new Set(keys).size, keys.length, `${d.id}: unique progress keys`);
  if (!d.rest && !d.race) {
    assert.equal(d.blocks.reduce((sum, b) => sum + (typeof b.n === 'number' ? b.n : 0), 0), d.laps, `${d.id}: length total`);
  }
}
console.log('PASS sequence, distances, all partial legacy progress patterns, and independent split-set migration');
