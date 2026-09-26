require('dotenv').config();
const db=require('../src/config/prisma');
const bcrypt=require('bcryptjs');
async function main(){
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
 if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password || password.length<12 || Buffer.byteLength(password)>72) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12-72 bytes)');
 // Explicit CLI admin provisioning. Register never accepts a client-supplied role.
 await db.user.upsert({where:{email},create:{email,name:'Lab Admin',role:'admin',passwordHash:await bcrypt.hash(password,12)},update:{role:'admin',passwordHash:await bcrypt.hash(password,12)}});
 console.log('Admin created/updated');
}
main().catch(e=>{console.error(e.message.startsWith('Set ')?e.message:'Admin setup failed');process.exitCode=1;}).finally(()=>db.$disconnect());
