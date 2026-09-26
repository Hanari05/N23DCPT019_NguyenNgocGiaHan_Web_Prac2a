const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const RealOrder = require('../src/models/Order');
const id = '66f123abc456def789012345';
let stored;
const model = {
  create: async data => { stored = { ...data, _id: id, status: 'pending' }; return stored; },
  findById: async key => key === id ? stored : null,
  findByIdAndUpdate: async (key, data) => { if (key !== id || !stored) return null; Object.assign(stored, data); return stored; },
  findByIdAndDelete: async key => { if (key !== id) return null; const old = stored; stored = null; return old; },
  find: () => ({ sort() { return this; }, skip() { return this; }, limit() { return Promise.resolve(stored ? [stored] : []); } }),
  countDocuments: async () => stored ? 1 : 0
};
for (const [name, value] of [['../src/models/Order', model], ['../src/config/productClient', async productId => ({ id: productId, name: 'Server name', price: '12.30', stock: 10 })]]) {
  const p = require.resolve(name); require.cache[p] = { id: p, filename: p, loaded: true, exports: value };
}
const app = require('../src/app');
let server, base;
before(async () => { server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r)); base = `http://127.0.0.1:${server.address().port}`; });
after(() => new Promise(r => server.close(r)));
async function call(path, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

const input = { customerId: 1, customerName: 'Gia Hân', customerEmail: 'han@example.com', items: [{ productId: 1, quantity: 2 }] };
test('reject empty items and fractional quantity', async () => {
  for (const items of [[], [{ productId: 1, quantity: 1.5 }]]) assert.equal((await call('/api/orders', 'POST', { ...input, items })).status, 422);
});
test('server computes totals, ignores forged price and merges duplicate products', async () => {
  const r = await call('/api/orders', 'POST', { ...input, totalAmount: 1, items: [{ productId: 1, quantity: 2, price: 1 }, { productId: 1, quantity: 1 }] });
  assert.equal(r.status, 201); assert.equal(r.body.data.totalAmount, 36.9); assert.equal(r.body.data.items[0].price, 12.3); assert.equal(r.body.data.items.length, 1);
});
test('stock validation uses aggregate quantity', async () => {
  const r = await call('/api/orders', 'POST', { ...input, items: [{ productId: 1, quantity: 6 }, { productId: 1, quantity: 6 }] }); assert.equal(r.status, 422);
});
test('update allows status only; delete gives subsequent 404', async () => {
  let r = await call(`/api/orders/${id}/status`, 'PATCH', { status: 'confirmed', totalAmount: 0 });
  assert.equal(r.status, 200); assert.equal(r.body.data.totalAmount, 36.9);
  r = await call(`/api/orders/${id}/status`, 'PATCH', { status: 'wrong' }); assert.equal(r.status, 422);
  assert.equal((await call(`/api/orders/${id}`, 'DELETE')).status, 200);
  assert.equal((await call(`/api/orders/${id}`)).status, 404);
});
test('real Mongoose model rejects invalid item and exposes unique codes', () => {
  const a = new RealOrder({ ...input, items: [], totalAmount: 0 }); assert.ok(a.validateSync());
  const b = new RealOrder({ ...input, items: [], totalAmount: 0 }); assert.notEqual(a.orderCode, b.orderCode);
});
test('Swagger describes PATCH and DELETE', async () => {
  const r = await call('/openapi.json'); assert.ok(r.body.paths['/api/orders/{id}/status'].patch); assert.ok(r.body.paths['/api/orders/{id}'].delete);
});
