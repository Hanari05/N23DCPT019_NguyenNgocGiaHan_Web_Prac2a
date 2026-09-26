const { body, param, query } = require('express-validator');
const validate = require('./validate');
const statuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
exports.create = [
  body('customerId').isInt({ min: 1, max: 2147483647 }).toInt(),
  body('customerName').isString().bail().trim().isLength({ min: 2, max: 200 }),
  body('customerEmail').isEmail(),
  body('items').isArray({ min: 1, max: 100 }),
  body('items.*.productId').isInt({ min: 1, max: 2147483647 }).toInt(),
  body('items.*.quantity').isInt({ min: 1, max: 10000 }).toInt(),
  body('shippingAddress').optional().isObject(),
  ...['street', 'city', 'district'].map(k => body(`shippingAddress.${k}`).optional().isString().isLength({ max: 300 })),
  body('note').optional().isString().isLength({ max: 2000 }), validate
];
exports.id = [param('id').isMongoId(), validate];
exports.customerId = [param('customerId').isInt({ min: 1, max: 2147483647 }).toInt(), validate];
exports.list = [query('page').optional().isInt({ min: 1, max: 100000 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt(), query('status').optional().isIn(statuses), validate];
exports.status = [body('status').isIn(statuses), validate];
