const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
let stored, query;
const notFound = () => Object.assign(new Error('missing'), { code: 'P2025' });
const prisma = { product: {
  create: async ({ data }) => { stored = { ...data, id: 1, isActive: true }; return stored; },
  findFirst: async ({ where }) => stored?.isActive && stored.id === where.id ? stored : null,
  findMany: async args => { query = args; return stored?.isActive ? [stored] : []; },
  count: async () => stored?.isActive ? 1 : 0,
  update: async ({ where, data }) => { if (!stored?.isActive || where.id !== stored.id) throw notFound(); Object.assign(stored, data); return stored; }
}, category: { findMany: async () => [] } };
// Mock persistence only: HTTP router, validators, controller and errors are real.
const modulePath = require.resolve('../src/config/prisma');
require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports: prisma };
const app = require('../src/app');
let server, base;
before(async () => { server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r)); base = `http://127.0.0.1:${server.address().port}`; });
after(() => new Promise(r => server.close(r)));
async function call(path, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

test('invalid product rejected before write', async () => {
  const r = await call('/api/products', 'POST', { name: '', price: -1 });
  assert.equal(r.status, 422); assert.ok(r.body.errors.length >= 2); assert.equal(stored, undefined);
});
test('create, read, update, soft delete and hide detail', async () => {
  let r = await call('/api/products', 'POST', { name: 'Bàn phím', price: 100, stock: 4, isActive: false });
  assert.equal(r.status, 201); assert.equal(r.body.data.isActive, true); assert.match(r.body.data.slug, /^ban-phim-/);
  r = await call('/api/products/1'); assert.equal(r.status, 200);
  r = await call('/api/products/1', 'PUT', { name: 'Bàn phím mới', price: 200 }); assert.equal(r.status, 200); assert.equal(r.body.data.stock, 0);
  r = await call('/api/products/1', 'DELETE'); assert.equal(r.status, 200); assert.equal(stored.isActive, false);
  r = await call('/api/products/1'); assert.equal(r.status, 404);
});
test('pagination and minPrice zero reach correct Prisma query', async () => {
  const r = await call('/api/products?page=2&limit=5&minPrice=0&maxPrice=100&sortBy=price&order=asc');
  assert.equal(r.status, 200); assert.equal(query.skip, 5); assert.equal(query.take, 5); assert.equal(query.where.price.gte, 0); assert.equal(query.orderBy[0].price, 'asc');
});
test('reject unbounded or invalid query and id', async () => {
  for (const p of ['?limit=0','?limit=101','?page=-1','?sortBy=password','?order=wrong','?minPrice=100&maxPrice=1','/abc']) assert.equal((await call('/api/products'+p)).status, 422);
});
test('Swagger covers all product operations', async () => {
  const r = await call('/openapi.json'); assert.equal(r.status, 200);
  assert.ok(r.body.paths['/api/products/{id}'].delete);
  assert.ok(r.body.paths['/api/products/{id}'].put);
});
