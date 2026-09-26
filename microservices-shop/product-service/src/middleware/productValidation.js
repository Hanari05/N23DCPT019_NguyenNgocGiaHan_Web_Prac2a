const { body, query, param } = require('express-validator');
const validate = require('./validate');
const productBody = [
  body('name').isString().bail().trim().isLength({ min: 2, max: 200 }).withMessage('Tên dài 2–200 ký tự'),
  body('price').isFloat({ min: 0, max: 99999999.99 }).withMessage('Giá từ 0 đến 99999999.99').toFloat(),
  body('stock').optional().isInt({ min: 0, max: 2147483647 }).toInt(),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('categoryId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('imageUrl').optional({ nullable: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }), validate
];
const productQuery = [
  query('page').optional().isInt({ min: 1, max: 100000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().isLength({ max: 200 }),
  query('category').optional().isString().matches(/^[a-z0-9-]+$/),
  query('sortBy').optional().isIn(['name', 'price', 'stock', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  query('inStock').optional().isIn(['true', 'false']),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().custom((value, { req }) => req.query.minPrice === undefined || Number(value) >= Number(req.query.minPrice)).withMessage('maxPrice phải >= minPrice'), validate
];
const id = [param('id').isInt({ min: 1, max: 2147483647 }).toInt(), validate];
module.exports = { productBody, productQuery, id };
