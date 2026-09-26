const path = require('node:path');
const swaggerJsdoc = require('swagger-jsdoc');
module.exports = swaggerJsdoc({
  definition: require('./openapi.json'),
  apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')],
  failOnErrors: true
});
