module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = 500, message = 'Lỗi hệ thống';
  if (err.type === 'entity.parse.failed') { status = 400; message = 'JSON không hợp lệ'; }
  else if (err.type === 'entity.too.large') { status = 413; message = 'Request quá lớn'; }
  else if (err.code === 'P2002' || err.code === 11000) { status = 409; message = 'Dữ liệu duy nhất đã tồn tại'; }
  else if (err.code === 'P2025') { status = 404; message = 'Không tìm thấy bản ghi'; }
  else if (err.code === 'P2003') { status = 422; message = 'Danh mục tham chiếu không tồn tại'; }
  else if (err.name === 'ValidationError') { status = 422; message = 'Dữ liệu không hợp lệ'; }
  else if (err.name === 'CastError') { status = 400; message = 'ID không hợp lệ'; }
  else if (err.status === 503) { status = 503; message = 'Service phụ thuộc không khả dụng'; }
  else if (err.status >= 400 && err.status < 500) { status = err.status; message = err.message; }
  // Do not log credentials, connection strings, request bodies or raw DB errors.
  if (status >= 500) console.error('Request failed:', err.name || 'Error', err.code || '');
  res.status(status).json({ success: false, message });
};
