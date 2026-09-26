const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const item = new mongoose.Schema({
  productId: { type: Number, required: true, min: 1 },
  productName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });
const schema = new mongoose.Schema({
  orderCode: { type: String, unique: true, default: () => `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID()}` },
  customerId: { type: Number, required: true, min: 1 },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true },
  items: { type: [item], required: true, validate: v => v.length > 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { street: String, city: String, district: String },
  note: String
}, { timestamps: true, versionKey: false, toJSON: { virtuals: true } });
schema.virtual('totalItems').get(function() { return this.items.reduce((n, x) => n + x.quantity, 0); });
schema.index({ customerId: 1, createdAt: -1 });
schema.index({ status: 1 });
module.exports = mongoose.model('Order', schema);
