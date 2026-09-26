const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ success: true, service: 'auth-service', implemented: false }));
// Exercise 1: replace stubs with real authentication. Never issue fake tokens.
for (const [method, path] of [['post', '/register'], ['post', '/login'], ['post', '/refresh'], ['get', '/me']]) {
  app[method]('/api/auth' + path, (req, res) => res.status(501).json({ success: false, message: 'TODO: hoàn thành bài tập Auth Service trong docs/EXERCISES.md' }));
}
module.exports = app;
