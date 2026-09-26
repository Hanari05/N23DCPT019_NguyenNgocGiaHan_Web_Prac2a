const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
for(const dir of ['', 'auth-service','product-service','order-service','api-gateway']){
 const target=path.join(root,dir,'.env'),example=path.join(root,dir,'.env.example');
 if(!fs.existsSync(target)&&fs.existsSync(example)) fs.copyFileSync(example,target);
}
const env=path.join(root,'.env'); let text=fs.readFileSync(env,'utf8');
const defaults={JWT_SECRET:crypto.randomBytes(48).toString('hex'),JWT_REFRESH_SECRET:crypto.randomBytes(48).toString('hex'),ADMIN_EMAIL:'admin@example.com',ADMIN_PASSWORD:crypto.randomBytes(24).toString('base64url')};
for(const [key,value] of Object.entries(defaults)){
 const regex=new RegExp('^'+key+'=(.*)$','m'),match=text.match(regex);
 if(!match) text+='\n'+key+'='+value;
 else if(!match[1].trim()||match[1].includes('CHANGE_ME')) text=text.replace(regex,key+'='+value);
}
fs.writeFileSync(env,text+'\n',{mode:0o600});
console.log('Environment ready. Existing database settings preserved. Read local .env for admin credentials; never commit it.');
console.log('Docker uses root .env. For npm local services, copy JWT_SECRET to each service .env and JWT_REFRESH_SECRET to Auth.');
