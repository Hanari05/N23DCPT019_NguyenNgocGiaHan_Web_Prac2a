const { randomUUID, createHash } = require('node:crypto');
const Redis = require('ioredis');
const revisionKey='lab2a:products:revision';
let redis, usable=false;
if(process.env.REDIS_URL){
 redis=new Redis(process.env.REDIS_URL,{enableOfflineQueue:false,maxRetriesPerRequest:1,commandTimeout:700,connectTimeout:1000,retryStrategy:n=>Math.min(n*200,3000)});
 redis.on('error',()=>{usable=false;});
 redis.on('close',()=>{usable=false;});
 redis.on('ready',async()=>{try{await redis.set(revisionKey,randomUUID());usable=true;}catch{usable=false;}});
}
function normalized(q){
 return {page:Number(q.page||1),limit:Number(q.limit||10),search:q.search||'',category:q.category||'',sortBy:q.sortBy||'createdAt',order:q.order||'desc',minPrice:q.minPrice===undefined?null:Number(q.minPrice),maxPrice:q.maxPrice===undefined?null:Number(q.maxPrice),inStock:q.inStock===undefined?null:String(q.inStock)};
}
exports.normalized=normalized;
exports.read=async query=>{
 if(!usable) return {state:'BYPASS'};
 try{
  let revision=await redis.get(revisionKey);
  if(!revision){await redis.set(revisionKey,randomUUID(),'NX');revision=await redis.get(revisionKey);}
  const key='lab2a:products:'+revision+':'+createHash('sha256').update(JSON.stringify(normalized(query))).digest('hex');
  const value=await redis.get(key);
  return {key,revision,state:value?'HIT':'MISS',body:value?JSON.parse(value):null};
 }catch{usable=false;return {state:'BYPASS'};}
};
exports.write=async(entry,body)=>{
 if(!usable||!entry.key) return;
 try{ if(await redis.get(revisionKey)===entry.revision) await redis.set(entry.key,JSON.stringify(body),'EX',300); }catch{usable=false;}
};
exports.invalidate=async()=>{
 if(!redis||redis.status!=='ready'){usable=false;return;}
 try{await redis.set(revisionKey,randomUUID());usable=true;}catch{usable=false;}
};
exports.close=()=>redis?.disconnect();
