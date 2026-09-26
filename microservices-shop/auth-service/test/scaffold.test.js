const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
process.env.JWT_SECRET='test-only-access-secret-32-characters-minimum';
process.env.JWT_REFRESH_SECRET='test-only-refresh-secret-32-characters-minimum';
let users=[],records=[];
const select=(u,s)=>!u?null:s?Object.fromEntries(Object.keys(s).map(k=>[k,u[k]])):{...u};
const db={user:{
 create:async({data,select:s})=>{if(users.some(u=>u.email===data.email))throw Object.assign(new Error(),{code:'P2002'});const u={...data,id:users.length+1};users.push(u);return select(u,s);},
 findUnique:async({where,select:s})=>select(users.find(u=>where.email?u.email===where.email:u.id===where.id),s)
},refreshToken:{create:async({data})=>{records.push({...data,revokedAt:null});return data;},updateMany:async({where,data})=>{const rec=records.find(x=>x.tokenHash===where.tokenHash&&x.userId===where.userId&&!x.revokedAt&&x.expiresAt>where.expiresAt.gt);if(!rec)return {count:0};Object.assign(rec,data);return {count:1};}}};
db.$transaction=fn=>fn(db);
const p=require.resolve('../src/config/prisma');require.cache[p]={id:p,filename:p,loaded:true,exports:db};
const app=require('../src/app'),jwt=require('jsonwebtoken');let server,base,pair;
before(async()=>{server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;});
after(()=>new Promise(r=>server.close(r)));
async function call(path,body,token){const response=await fetch(base+'/api/auth/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token&&{Authorization:'Bearer '+token})},body:body?JSON.stringify(body):undefined});return {status:response.status,body:await response.json()};}
const account={name:'Test User',email:'test@example.com',password:'Test-only-password-123!'};
test('register hashes password and ignores requested admin role; duplicate => 409',async()=>{
 let r=await call('register',{...account,role:'admin'});assert.equal(r.status,201);assert.equal(r.body.data.role,'user');assert.equal(r.body.data.passwordHash,undefined);assert.notEqual(users[0].passwordHash,account.password);
 assert.equal((await call('register',account)).status,409);
 assert.equal((await call('register',{...account,email:'bad',password:'x'})).status,422);
});
test('login rejects incorrect password; real tokens have correct lifetime',async()=>{
 assert.equal((await call('login',{...account,password:'wrong-password'})).status,401);
 const r=await call('login',account);assert.equal(r.status,200);pair=r.body.data;
 const a=jwt.decode(pair.accessToken),b=jwt.decode(pair.refreshToken);assert.equal(a.exp-a.iat,900);assert.equal(b.exp-b.iat,604800);assert.notEqual(records[0].tokenHash,pair.refreshToken);
});
test('me rejects absent, expired, forged and refresh tokens',async()=>{
 assert.equal((await call('me')).status,401);
 assert.equal((await call('me',null,pair.refreshToken)).status,401);
 const expired=jwt.sign({role:'user',type:'access'},process.env.JWT_SECRET,{subject:'1',issuer:'lab2a-auth',audience:'lab2a-api',expiresIn:-1});
 assert.equal((await call('me',null,expired)).status,401);
 assert.equal((await call('me',null,pair.accessToken+'x')).status,401);
 const r=await call('me',null,pair.accessToken);assert.equal(r.status,200);assert.equal(r.body.data.passwordHash,undefined);
});
test('refresh rotates token; replay revoked or expired token => 401',async()=>{
 const old=pair.refreshToken;const r=await call('refresh',{refreshToken:old});assert.equal(r.status,200);assert.notEqual(r.body.data.refreshToken,old);
 assert.equal((await call('refresh',{refreshToken:old})).status,401);
 const expired=jwt.sign({type:'refresh'},process.env.JWT_REFRESH_SECRET,{subject:'1',issuer:'lab2a-auth',audience:'lab2a-refresh',expiresIn:-1});assert.equal((await call('refresh',{refreshToken:expired})).status,401);
});
