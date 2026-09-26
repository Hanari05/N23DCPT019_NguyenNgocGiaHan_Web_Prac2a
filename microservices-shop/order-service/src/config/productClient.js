// Snapshot price/name from Product Service, never trust the client's total/price.
module.exports = async function getProduct(id) {
  const base = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
  let response;
  try { response = await fetch(`${base}/api/products/${id}`, { signal: AbortSignal.timeout(5000) }); }
  catch { throw Object.assign(new Error('Product Service không khả dụng'), { status: 503 }); }
  if (response.status === 404) throw Object.assign(new Error(`Sản phẩm ${id} không tồn tại`), { status: 422 });
  if (!response.ok) throw Object.assign(new Error('Product Service không khả dụng'), { status: 503 });
  const payload = await response.json();
  if (!payload.data || !Number.isFinite(Number(payload.data.price))) throw Object.assign(new Error('Phản hồi sản phẩm không hợp lệ'), { status: 503 });
  return payload.data;
};
