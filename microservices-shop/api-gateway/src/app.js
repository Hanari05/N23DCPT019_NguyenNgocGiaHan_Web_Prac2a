const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const app = express();
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 0));
app.use(require('helmet')());
app.use(require('cors')({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Quá nhiều request, thử lại sau' } }));
app.get('/health', (req, res) => res.json({ success: true, gateway: true }));
// Do not parse JSON before proxying: keep the original request body stream.
const targets = [
  ['/api/products', process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001'],
  ['/api/categories', process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001'],
  ['/api/orders', process.env.ORDER_SERVICE_URL || 'http://localhost:3002'],
  ['/api/auth', process.env.AUTH_SERVICE_URL || 'http://localhost:3003']
];
for (const [prefix, target] of targets) {
  app.use(createProxyMiddleware({
    pathFilter: pathname => pathname === prefix || pathname.startsWith(prefix + '/'),
    target, changeOrigin: true, proxyTimeout: 15000, timeout: 20000,
    on: { error: (err, req, res) => { if (!res.headersSent) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, message: 'Service không khả dụng' })); } } }
  }));
}
app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));
module.exports = app;
