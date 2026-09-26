const express = require('express');
const swaggerUi = require('swagger-ui-express');
const spec = require('./swagger/openapi.json');
const app = express();
app.use(require('helmet')());
app.use(require('cors')({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false }));
app.use(require('morgan')('dev'));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (req, res) => res.json({ success: true, service: 'order-service' }));
app.get('/openapi.json', (req, res) => res.json(spec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.use('/api/orders', require('./routes/orderRoutes'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));
app.use(require('./middleware/errorHandler'));
module.exports = app;
