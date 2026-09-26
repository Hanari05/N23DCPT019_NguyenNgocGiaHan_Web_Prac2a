const {test}=require('node:test');
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
let client;
class FakeRedis extends EventEmitter{
 constructor(){super();this.status='ready';this.data=new Map();this.ttls=new Map();client=this;}
 async get(key){if(this.fail)throw Error('offline');return this.data.get(key)||null;}
 async set(key,value,mode,ttl){if(this.fail)throw Error('offline');if(mode==='NX'&&this.data.has(key))return null;this.data.set(key,value);if(mode==='EX')this.ttls.set(key,ttl);return 'OK';}
 disconnect(){this.status='end';}
}
process.env.REDIS_URL='redis://unit-test';
const p=require.resolve('ioredis');require.cache[p]={id:p,filename:p,loaded:true,exports:FakeRedis};
const cache=require('../src/middleware/cache');
const ready=async()=>{client.emit('ready');await new Promise(r=>setImmediate(r));};
test('Redis cache: canonical keys, HIT, TTL 300, invalidation, concurrent stale write, outage fallback',async()=>{
 await ready();
 const first=await cache.read({page:'1',limit:'10'});assert.equal(first.state,'MISS');
 await cache.write(first,{data:[{id:1}]});assert.equal(client.ttls.get(first.key),300);
 assert.equal((await cache.read({limit:10,page:1})).state,'HIT');
 assert.equal((await cache.read({search:'different'})).state,'MISS');
 await cache.invalidate();assert.equal((await cache.read({page:1,limit:10})).state,'MISS');
 await cache.write(first,{data:[{id:'stale'}]});assert.equal((await cache.read({page:1,limit:10})).state,'MISS');
 client.fail=true;assert.equal((await cache.read({})).state,'BYPASS');await cache.invalidate();
 client.fail=false;await ready();assert.equal((await cache.read({})).state,'MISS');cache.close();
});
