const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
test('Gateway preserves resource prefix, query and JSON body', async () => {
  const upstream = http.createServer((req, res) => {
    let body = ''; req.on('data', c => body += c); req.on('end', () => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({ path: req.url, method: req.method, body })); });
  });
  upstream.listen(0, '127.0.0.1'); await new Promise(r => upstream.once('listening',r));
  process.env.PRODUCT_SERVICE_URL = `http://127.0.0.1:${upstream.address().port}`;
  const app = require('../src/app'); const server = app.listen(0, '127.0.0.1'); await new Promise(r=>server.once('listening',r));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(base+'/api/products?limit=5', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name:'Test',price:100 }) });
    const b=await response.json(); assert.equal(b.path,'/api/products?limit=5'); assert.equal(b.method,'POST'); assert.equal(JSON.parse(b.body).price,100);
    assert.equal((await fetch(base+'/api/products-other')).status,404);
    await new Promise(r=>upstream.close(r));
    assert.equal((await fetch(base+'/api/products')).status,503);
  } finally { await new Promise(r=>server.close(r)); await new Promise(r=>upstream.close(r)); }
});
