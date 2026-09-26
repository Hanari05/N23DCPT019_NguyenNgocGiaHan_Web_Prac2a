const jwt = require('jsonwebtoken');
function validateConfig() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must have at least 32 characters');
}
function authenticate(req, res, next) {
  try {
    validateConfig();
    const match = /^Bearer ([^ ]+)$/i.exec(req.headers.authorization || '');
    if (!match) throw new Error('Missing token');
    const user = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'lab2a-auth', audience: 'lab2a-api' });
    if (user.type !== 'access' || !/^[1-9][0-9]*$/.test(user.sub) || !['user','admin'].includes(user.role)) throw new Error('Invalid claims');
    req.user = { id: Number(user.sub), role: user.role }; next();
  } catch { res.status(401).json({ success: false, message: 'Thiếu token, token không hợp lệ hoặc đã hết hạn' }); }
}
function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Cần quyền admin' });
  next();
}
module.exports = { authenticate, admin, validateConfig };
