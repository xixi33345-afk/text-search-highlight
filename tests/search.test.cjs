const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = source.indexOf('async function collectRecordMatches(');
const end = source.indexOf('\nasync function doSearch(', start);
const scan = new Function(source.slice(start, end) + '\nreturn collectRecordMatches;')();
const never = () => false;
const yieldNow = () => new Promise(resolve => setImmediate(resolve));

test('search includes records beyond the first page and preserves offsets', async () => {
  const data = Array.from({ length: 1500 }, (_, row) => [String(row + 1), '普通正文\n' + '文字'.repeat(1000)]);
  data[1499][1] += '😀蓝色 TARGET';
  const result = await scan(data, /target/gi, null, -1, never, yieldNow);
  assert.equal(result.found.length, 1);
  const hit = result.found[0];
  assert.equal(hit.row, 1499);
  assert.equal(data[hit.row][hit.col].slice(hit.start, hit.end), 'TARGET');
  assert.equal(result.cells.get('1499,1')[0], hit);
  assert.equal(result.counts.get(1499), 1);
  assert.equal(hit.node, null);
});

test('column filters and single-record scope apply across the full dataset', async () => {
  const data = Array.from({ length: 1200 }, () => ['目标', '目标']);
  const allowed = new Set([99, 1099]);
  const result = await scan(data, /目标/g, allowed, 1099, never, yieldNow);
  assert.deepEqual(result.found.map(hit => [hit.row, hit.col]), [[1099, 0], [1099, 1]]);
  assert.equal((await scan(data, /目标/g, allowed, 1199, never, yieldNow)).found.length, 0);
});

test('empty regular-expression matches finish without generating blank highlights', async () => {
  const result = await scan([['😀abc\nabc']], /(?=a)/g, null, -1, never, yieldNow);
  assert.equal(result.found.length, 0);
});

test('a superseded long search yields and discards its partial results', async () => {
  let cancelled = false, yielded = 0;
  const data = Array.from({ length: 1500 }, () => ['x '.repeat(3000)]);
  const result = await scan(data, /x/g, null, -1, () => cancelled, async () => { yielded++; cancelled = true; });
  assert.equal(result, null);
  assert.ok(yielded > 0);
});
