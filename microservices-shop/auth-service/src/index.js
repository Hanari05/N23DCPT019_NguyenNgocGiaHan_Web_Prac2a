require('dotenv').config();
require('./app').listen(process.env.PORT || 3003, '0.0.0.0', () => console.log('Auth exercise scaffold ready (501)'));
