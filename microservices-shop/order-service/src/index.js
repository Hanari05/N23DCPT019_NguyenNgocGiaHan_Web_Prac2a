require('dotenv').config();
async function start() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
  await require('mongoose').connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const app = require('./app');
  const server = app.listen(process.env.PORT || 3002, '0.0.0.0', () => console.log('order-service ready'));
  async function stop() { server.close(async () => { await require('mongoose').disconnect(); process.exit(0); }); }
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
start().catch(() => { console.error('Startup failed. Check environment, database access and migrations.'); process.exitCode = 1; });
