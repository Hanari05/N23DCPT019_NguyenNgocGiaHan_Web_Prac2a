const prisma = require('../config/prisma');
const { randomUUID } = require('node:crypto');
const fail = res => res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
function slugify(name) {
  const base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base || 'product'}-${randomUUID().slice(0, 8)}`;
}
exports.getProducts = async (req, res) => {
  const { page = 1, limit = 10, search, category, sortBy = 'createdAt', order = 'desc', minPrice, maxPrice, inStock } = req.query;
  const where = { isActive: true };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (category) where.category = { slug: category };
  if (minPrice !== undefined || maxPrice !== undefined) where.price = { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) };
  if (inStock !== undefined) where.stock = inStock === 'true' ? { gt: 0 } : 0;
  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy: [{ [sortBy]: order }, { id: 'asc' }], skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where })
  ]);
  res.json({ success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
};
exports.getProductById = async (req, res) => {
  const data = await prisma.product.findFirst({ where: { id: req.params.id, isActive: true }, include: { category: true } });
  if (!data) return fail(res);
  res.json({ success: true, data });
};
exports.createProduct = async (req, res) => {
  const { name, price, description, stock, imageUrl, categoryId } = req.body;
  const data = await prisma.product.create({ data: { name, price, slug: slugify(name), description, stock, imageUrl, categoryId }, include: { category: true } });
  res.location(`/api/products/${data.id}`).status(201).json({ success: true, data, message: 'Tạo sản phẩm thành công' });
};
// PUT uses a full writable representation; missing optional fields reset to defaults.
exports.updateProduct = async (req, res) => {
  const { name, price, description = null, stock = 0, imageUrl = null, categoryId = null } = req.body;
  const data = await prisma.product.update({ where: { id: req.params.id, isActive: true }, data: { name, price, description, stock, imageUrl, categoryId }, include: { category: true } });
  res.json({ success: true, data, message: 'Cập nhật thành công' });
};
exports.deleteProduct = async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id, isActive: true }, data: { isActive: false } });
  res.json({ success: true, message: 'Đã ẩn sản phẩm thành công' });
};
exports.getCategories = async (req, res) => res.json({ success: true, data: await prisma.category.findMany({ orderBy: { name: 'asc' } }) });
