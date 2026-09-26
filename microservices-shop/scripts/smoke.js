// Real DB integration test. Run only against YOUR test deployment.
const assert = require('node:assert/strict');
const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
let productId, orderId;
async function call(path, method = 'GET', body) {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(90000) });
  const data = await r.json(); return { status: r.status, body: data };
}
async function main() {
  console.log('Testing:', base);
  try {
    let r = await call('/api/products', 'POST', { name: `Lab2a smoke ${Date.now()}`, price: 123.45, stock: 10 });
    productId = r.body.data?.id; console.log('Test product ID:', productId); assert.equal(r.status, 201); assert.ok(productId);
    r = await call(`/api/products/${productId}`); assert.equal(r.status, 200);
    r = await call('/api/products?page=1&limit=5&sortBy=price&order=asc'); assert.equal(r.status, 200); assert.equal(r.body.pagination.limit,5);
    r.body.data.forEach((x,i,a)=>{if(i)assert.ok(Number(a[i-1].price)<=Number(x.price));});
    r = await call('/api/products', 'POST', { name: '', price: -1 }); assert.equal(r.status,422);
    r = await call('/api/orders', 'POST', { customerId: 1, customerName: 'Lab2a Smoke', customerEmail: 'smoke@example.com', items: [{ productId, quantity: 2 }], totalAmount: 1 });
    orderId = r.body.data?._id; console.log('Test order ID:', orderId); assert.equal(r.status,201); assert.equal(r.body.data.totalAmount,246.9);
    r = await call(`/api/orders/${orderId}/status`, 'PATCH', { status: 'confirmed' }); assert.equal(r.status,200); assert.equal(r.body.data.status,'confirmed');
    r = await call(`/api/orders/${orderId}`); assert.equal(r.body.data.status,'confirmed');
    console.log('PASS: product CRUD basics, pagination/sort, validation, inter-service order total and PATCH persistence');
  } finally {
    let cleanupFailed = false;
    for (const [resource, id] of [['orders', orderId], ['products', productId]]) {
      if (!id) continue;
      try {
        const r = await call(`/api/${resource}/${id}`, 'DELETE');
        assert.ok([200, 404].includes(r.status));
        assert.equal((await call(`/api/${resource}/${id}`)).status, 404);
        console.log(resource === 'products' ? 'Product retained as inactive:' : 'Deleted test order:', id);
      } catch { cleanupFailed = true; console.error('Cleanup failed; inspect:', resource, id); }
    }
    if (cleanupFailed) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error.message); console.error('Inspect test IDs if cleanup failed:', { productId, orderId }); process.exitCode=1; });
