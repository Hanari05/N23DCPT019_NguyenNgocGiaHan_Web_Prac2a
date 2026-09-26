require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const mobile = await prisma.category.upsert({ where: { slug: 'mobile' }, update: {}, create: { name: 'Điện thoại', slug: 'mobile' } });
  const accessory = await prisma.category.upsert({ where: { slug: 'accessories' }, update: {}, create: { name: 'Phụ kiện', slug: 'accessories' } });
  await prisma.product.createMany({ skipDuplicates: true, data: [
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: 27990000, stock: 50, categoryId: mobile.id },
    { name: 'Samsung Galaxy S24', slug: 'samsung-s24', price: 22990000, stock: 30, categoryId: mobile.id },
    { name: 'Bàn phím cơ', slug: 'ban-phim-co', price: 700000, stock: 20, categoryId: accessory.id },
    { name: 'Chuột máy tính', slug: 'chuot-may-tinh', price: 300000, stock: 0, categoryId: accessory.id }
  ] });
  console.log('Seed hoàn tất (không xóa dữ liệu có sẵn).');
}
main().catch(() => { console.error('Seed thất bại. Kiểm tra database và migration.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
