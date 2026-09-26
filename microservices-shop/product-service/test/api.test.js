process.env.JWT_SECRET='test-only-access-secret-32-characters-minimum';
const jwt=require('jsonwebtoken');
const token=jwt.sign({role:'admin',type:'access'},process.env.JWT_SECRET,{subject:'1',algorithm:'HS256',issuer:'lab2a-auth',audience:'lab2a-api',expiresIn:'15m'});
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
  const response = await fetch(base + path, { method, headers: { Authorization: 'Bearer '+token, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
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
  const alias = await call('/api-docs.json'); assert.equal(alias.status, 200); assert.deepEqual(alias.body, r.body);
  assert.ok(r.body.paths['/api/products/{id}'].delete);
  assert.ok(r.body.paths['/api/products/{id}'].put);
});

test('product writes require admin even when bypassing Gateway',async()=>{
 assert.equal((await fetch(base+'/api/products',{method:'POST'})).status,401);
 const user=jwt.sign({role:'user',type:'access'},process.env.JWT_SECRET,{subject:'2',issuer:'lab2a-auth',audience:'lab2a-api',expiresIn:'15m'});
 assert.equal((await fetch(base+'/api/products',{method:'POST',headers:{Authorization:'Bearer '+user}})).status,403);
});
test('image validates ID, missing file, fake image, size; stores Cloudinary URL',async()=>{
 await call('/api/products','POST',{name:'Photo product',price:10,stock:5});
 async function upload(id,bytes,type='image/png'){
  const form=new FormData();if(bytes)form.append('image',new Blob([bytes],{type}),'test.png');
  const r=await fetch(base+`/api/products/${id}/image`,{method:'POST',headers:{Authorization:'Bearer '+token},body:form});return {status:r.status,body:await r.json()};
 }
 assert.equal((await upload('abc',Buffer.from('fake'))).status,422);
 assert.equal((await upload(999,Buffer.from('fake'))).status,404);
 assert.equal((await upload(1,null)).status,422);
 assert.equal((await upload(1,Buffer.from('fake image'))).status,415);
 assert.equal((await upload(1,Buffer.alloc(5*1024*1024+1))).status,413);
 const bytes=await require('sharp')({create:{width:2,height:2,channels:3,background:'red'}}).png().toBuffer();
 assert.equal((await upload(1,bytes)).status,503);
 process.env.CLOUDINARY_CLOUD_NAME='test';process.env.CLOUDINARY_API_KEY='test';process.env.CLOUDINARY_API_SECRET='test';
 const cloud=require('cloudinary').v2;const original=cloud.uploader.upload_stream;
 cloud.uploader.upload_stream=(options,callback)=>new (require('node:stream').Writable)({write(chunk,encoding,done){done();},final(done){callback(null,{secure_url:'https://res.cloudinary.com/test/image/upload/test.webp',public_id:'test'});done();}});
 try{const r=await upload(1,bytes);assert.equal(r.status,200);assert.equal(r.body.data.imageUrl,'https://res.cloudinary.com/test/image/upload/test.webp');}finally{cloud.uploader.upload_stream=original;}
});
