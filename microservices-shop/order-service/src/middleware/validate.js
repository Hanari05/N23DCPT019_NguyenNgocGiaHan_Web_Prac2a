const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  next();
};
