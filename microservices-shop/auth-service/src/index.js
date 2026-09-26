require('dotenv').config();
async function start() {
  require('./middleware/auth').validateConfig();
  if(!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length<32 || process.env.JWT_REFRESH_SECRET===process.env.JWT_SECRET) throw new Error('Set distinct JWT secrets');
  const db=require('./config/prisma'); await db.$connect();
  const server=require('./app').listen(process.env.PORT||3003,'0.0.0.0',()=>console.log('auth-service ready'));
  for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(async()=>{await db.$disconnect();process.exit(0);}));
}
start().catch(()=>{console.error('Auth startup failed: check database, migrations and JWT secrets');process.exitCode=1;});
