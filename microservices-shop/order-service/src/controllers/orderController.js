const Order = require('../models/Order');
const getProduct = require('../config/productClient');
const notFound = res => res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
exports.createOrder = async (req, res) => {
  const { customerId, customerName, customerEmail, items, shippingAddress, note } = req.body;
  const quantities = new Map();
  for (const x of items) quantities.set(x.productId, (quantities.get(x.productId) || 0) + x.quantity);
  const processed = [];
  for (const [productId, quantity] of quantities) {
    const product = await getProduct(productId);
    if (quantity > product.stock) return res.status(422).json({ success: false, message: `Sản phẩm ${productId} không đủ tồn kho` });
    const cents = Math.round(Number(product.price) * 100);
    processed.push({ productId, productName: product.name, price: cents / 100, quantity, subtotal: cents * quantity / 100 });
  }
  const totalCents = processed.reduce((n, x) => n + Math.round(x.subtotal * 100), 0);
  if (!Number.isSafeInteger(totalCents)) return res.status(422).json({ success: false, message: 'Tổng tiền vượt giới hạn' });
  const data = await Order.create({ customerId, customerName, customerEmail, items: processed, totalAmount: totalCents / 100, shippingAddress, note });
  res.location(`/api/orders/${data._id}`).status(201).json({ success: true, data });
};
exports.getOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { ...(status && { status }), ...(req.params.customerId && { customerId: req.params.customerId }) };
  const [data, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit), Order.countDocuments(filter)]);
  res.json({ success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
};
exports.getOrderById = async (req, res) => {
  const data = await Order.findById(req.params.id);
  if (!data) return notFound(res);
  res.json({ success: true, data });
};
exports.updateOrderStatus = async (req, res) => {
  const data = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!data) return notFound(res);
  res.json({ success: true, data });
};
exports.deleteOrder = async (req, res) => {
  if (!await Order.findByIdAndDelete(req.params.id)) return notFound(res);
  res.json({ success: true, message: 'Đã xóa đơn hàng' });
};
