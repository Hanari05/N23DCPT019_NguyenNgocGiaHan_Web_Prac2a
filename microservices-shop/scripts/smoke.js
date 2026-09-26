const fs=require('node:fs'),path=require('node:path');
const envFile=path.resolve(__dirname,'../.env');
const local=fs.existsSync(envFile)?require('node:util').parseEnv(fs.readFileSync(envFile,'utf8')):{};
let accessToken;
// Real DB integration test. Run only against YOUR test deployment.
const assert = require('node:assert/strict');
const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
let productId, orderId;
async function call(path, method = 'GET', body) {
  const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(accessToken && {Authorization:'Bearer '+accessToken}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(90000) });
  const data = await r.json(); return { status: r.status, body: data, cache: r.headers.get("x-cache") };
}
async function main() {
  console.log('Testing:', base);
  const email=process.env.ADMIN_EMAIL||local.ADMIN_EMAIL,password=process.env.ADMIN_PASSWORD||local.ADMIN_PASSWORD;
  assert.ok(email&&password,'Configure ADMIN_EMAIL/ADMIN_PASSWORD in root .env; provision admin first');
  const denied=await call('/api/orders');assert.equal(denied.status,401);
  const login=await call('/api/auth/login','POST',{email,password});assert.equal(login.status,200,'Admin login failed');
  assert.equal(login.body.data.user.role,'admin','Admin required for product CRUD');
  accessToken=login.body.data.accessToken;
  const me=await call('/api/auth/me');assert.equal(me.status,200);
  const oldRefresh=login.body.data.refreshToken;
  const refresh=await call('/api/auth/refresh','POST',{refreshToken:oldRefresh});assert.equal(refresh.status,200);
  accessToken=refresh.body.data.accessToken;
  assert.equal((await call('/api/auth/refresh','POST',{refreshToken:oldRefresh})).status,401);
  console.log('PASS: login, me, refresh rotation, replay rejection, Gateway 401');
  try {
    let r = await call('/api/products', 'POST', { name: `Lab2a smoke ${Date.now()}`, price: 123.45, stock: 10 });
    productId = r.body.data?.id; console.log('Test product ID:', productId); assert.equal(r.status, 201); assert.ok(productId);
    r = await call(`/api/products/${productId}`); assert.equal(r.status, 200);
    r = await call('/api/products?page=1&limit=5&sortBy=price&order=asc'); assert.equal(r.status, 200); assert.equal(r.body.pagination.limit,5);
    assert.equal(r.cache,'MISS','Redis must be available for the full exercise test');
    assert.equal((await call('/api/products?page=1&limit=5&sortBy=price&order=asc')).cache,'HIT');
    r.body.data.forEach((x,i,a)=>{if(i)assert.ok(Number(a[i-1].price)<=Number(x.price));});
    r = await call(`/api/products/${productId}`,'PUT',{name:'Updated smoke product',price:123.45,stock:10});assert.equal(r.status,200);
    assert.equal((await call('/api/products?page=1&limit=5&sortBy=price&order=asc')).cache,'MISS');
    const imagePath=process.env.TEST_IMAGE_PATH;
    if(imagePath){
      const extension=path.extname(imagePath).toLowerCase();const type={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[extension];
      assert.ok(type,'Use PNG/JPEG/WebP for TEST_IMAGE_PATH');
      const form=new FormData();form.append('image',new Blob([fs.readFileSync(imagePath)],{type}),path.basename(imagePath));
      const upload=await fetch(base+`/api/products/${productId}/image`,{method:'POST',headers:{Authorization:'Bearer '+accessToken},body:form,signal:AbortSignal.timeout(60000)});
      assert.equal(upload.status,200,'Cloudinary upload failed');const image=await upload.json();assert.match(image.data.imageUrl,/^https:\/\//);
      const persisted=await call(`/api/products/${productId}`);assert.equal(persisted.body.data.imageUrl,image.data.imageUrl);
      assert.equal((await call('/api/products?page=1&limit=5&sortBy=price&order=asc')).cache,'MISS');
      console.log('PASS: real Cloudinary upload and persisted imageUrl');
    }else console.log('SKIP: real Cloudinary (set TEST_IMAGE_PATH to test your account)');
    console.log('PASS: Redis MISS/HIT and invalidation after PUT');
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
