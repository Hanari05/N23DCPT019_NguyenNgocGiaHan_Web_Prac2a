const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { randomBytes } = require('node:crypto');
const env = parseEnv(fs.readFileSync(path.join(__dirname, '../.env'), 'utf8'));
async function call(port, route, method = 'GET', body, token) {
  const response = await fetch(`http://localhost:${port}${route}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000)
  });
  return { status: response.status, data: await response.json() };
}
async function main() {
  const admin = await call(3000, '/api/auth/login', 'POST', { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
  assert.equal(admin.status, 200);
  const token = admin.data.data.accessToken;
  const users = [];
  let productId, orderId;
  try {
    for (const suffix of ['a', 'b']) {
      const credentials = { name: 'Checklist User ' + suffix, email: `check-${Date.now()}-${suffix}@example.com`, password: randomBytes(18).toString('hex'), role: 'admin' };
      const registered = await call(3000, '/api/auth/register', 'POST', credentials);
      assert.equal(registered.status, 201); assert.equal(registered.data.data.role, 'user');
      console.log('Created checklist user ID:', registered.data.data.id);
      assert.equal((await call(3000, '/api/auth/register', 'POST', credentials)).status, 409);
      assert.equal((await call(3000, '/api/auth/login', 'POST', { ...credentials, password: 'wrong-password' })).status, 401);
      const login = await call(3000, '/api/auth/login', 'POST', credentials);
      assert.equal(login.status, 200); users.push(login.data.data);
    }
    assert.equal((await call(3000, '/api/auth/register', 'POST', { name: 'Invalid', email: 'invalid@example.com', password: 'short' })).status, 422);
    assert.equal((await call(3000, '/api/auth/me', 'GET', undefined, 'invalid-token')).status, 401);
    assert.equal((await call(3002, '/api/orders')).status, 401);
    assert.equal((await call(3001, '/api/products', 'POST', {})).status, 401);
    assert.equal((await call(3000, '/api/products', 'POST', {}, users[0].accessToken)).status, 403);
    const product = await call(3000, '/api/products', 'POST', { name: 'Ownership checklist', price: 1000, stock: 3 }, token);
    assert.equal(product.status, 201); productId = product.data.data.id;
    const order = await call(3000, '/api/orders', 'POST', { customerId: users[1].user.id, customerName: 'Checklist A', customerEmail: 'check@example.com', items: [{ productId, quantity: 1 }] }, users[0].accessToken);
    assert.equal(order.status, 201); orderId = order.data.data._id;
    assert.equal(order.data.data.customerId, users[0].user.id);
    for (const [method, ending, body] of [['GET', '', undefined], ['PATCH', '/status', { status: 'confirmed' }], ['DELETE', '', undefined]]) {
      assert.equal((await call(3000, `/api/orders/${orderId}${ending}`, method, body, users[1].accessToken)).status, 404);
    }
    assert.equal((await call(3000, `/api/orders/customer/${users[0].user.id}`, 'GET', undefined, users[1].accessToken)).status, 403);
    assert.equal((await call(3000, `/api/orders/${orderId}`, 'GET', undefined, users[0].accessToken)).status, 200);
    assert.equal((await call(3000, `/api/orders/${orderId}/status`, 'PATCH', { status: 'confirmed' }, users[0].accessToken)).status, 200);
    const spec = await call(3002, '/openapi.json');
    assert.equal(spec.data.components.securitySchemes.bearerAuth.scheme, 'bearer');
    console.log('PASS: registration, duplicate/invalid credentials, 401/403, direct-service protection, owner isolation, JWT customerId, Swagger bearer schema');
  } finally {
    if (orderId) assert.equal((await call(3000, `/api/orders/${orderId}`, 'DELETE', undefined, token)).status, 200);
    if (productId) assert.equal((await call(3000, `/api/products/${productId}`, 'DELETE', undefined, token)).status, 200);
    console.log('Test order removed; product soft-deleted. Checklist users retained for inspection.');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
