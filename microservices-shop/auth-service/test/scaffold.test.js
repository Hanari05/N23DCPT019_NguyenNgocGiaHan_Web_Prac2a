const { test } = require('node:test');
const assert = require('node:assert/strict');
test('Auth scaffold does not pretend to authenticate', async () => {
  const server = require('../src/app').listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
  try { const r = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`,{method:'POST'}); assert.equal(r.status,501); }
  finally { await new Promise(r=>server.close(r)); }
});
