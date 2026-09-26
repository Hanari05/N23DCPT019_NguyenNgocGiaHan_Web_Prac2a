const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const dir of ['', 'product-service', 'order-service', 'api-gateway', 'auth-service']) {
  const target = path.join(root, dir, '.env');
  if (!fs.existsSync(target)) { fs.copyFileSync(path.join(root, dir, '.env.example'), target); console.log('Created', path.relative(root, target)); }
  else console.log('Kept existing', path.relative(root, target));
}
console.log('Local placeholders only. Edit service .env files when using cloud databases.');
