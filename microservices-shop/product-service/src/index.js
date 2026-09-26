require('dotenv').config();
require('./middleware/auth').validateConfig();
async function start() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) throw new Error('Missing database configuration');
  const prisma = require('./config/prisma');
  await prisma.$connect();
  const app = require('./app');
  const server = app.listen(process.env.PORT || 3001, '0.0.0.0', () => console.log('product-service ready'));
  async function stop() { server.close(async () => { await require('./config/prisma').$disconnect(); process.exit(0); }); }
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
start().catch(() => { console.error('Startup failed. Check environment, database access and migrations.'); process.exitCode = 1; });
