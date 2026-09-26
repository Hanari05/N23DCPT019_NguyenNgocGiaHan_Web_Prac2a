const jwt = require('jsonwebtoken');
const { randomUUID, createHash } = require('node:crypto');
exports.hash = token => createHash('sha256').update(token).digest('hex');
exports.issue = user => ({
  accessToken: jwt.sign({ role: user.role, type: 'access' }, process.env.JWT_SECRET, { algorithm:'HS256', issuer:'lab2a-auth', audience:'lab2a-api', subject:String(user.id), expiresIn:'15m' }),
  refreshToken: jwt.sign({ type:'refresh' }, process.env.JWT_REFRESH_SECRET, { algorithm:'HS256', issuer:'lab2a-auth', audience:'lab2a-refresh', subject:String(user.id), jwtid:randomUUID(), expiresIn:'7d' }),
  tokenType:'Bearer', expiresIn:900
});
exports.verifyRefresh = token => {
  const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms:['HS256'], issuer:'lab2a-auth', audience:'lab2a-refresh' });
  if (payload.type !== 'refresh' || !/^[1-9][0-9]*$/.test(payload.sub)) throw new Error('Invalid refresh');
  return payload;
};
exports.record = (userId, token) => ({ userId, tokenHash:exports.hash(token), expiresAt:new Date(jwt.decode(token).exp * 1000) });
