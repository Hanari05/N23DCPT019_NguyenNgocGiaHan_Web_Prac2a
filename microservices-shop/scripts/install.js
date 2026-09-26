const { spawnSync } = require('node:child_process');
const path = require('node:path');
for (const dir of ['product-service', 'order-service', 'api-gateway', 'auth-service']) {
  const r = spawnSync('npm', ['ci'], { cwd: path.join(__dirname, '..', dir), stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status || 1);
}
