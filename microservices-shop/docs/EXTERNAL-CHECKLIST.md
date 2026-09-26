# Kiểm tra bên ngoài — thực hiện trên máy Hân

Không có secret thật/Cloudinary account trong ZIP. Kết quả mock tests không thay thế các bước này.

## 0. Docker sau nâng cấp

Theo UPGRADE.md, mở terminal trong microservices-shop. Chạy:

```powershell
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a ps
npm run test:live
```

8 container Up, DB/service healthcheck healthy. Smoke phải PASS Auth/Gateway, Redis MISS/HIT + invalidation, Product/Order. Cloudinary SKIP nếu chưa chọn ảnh.

## 1. Auth Service

- Register user mới: 201; role user dù gửi role admin. Register email trùng: 409; mật khẩu ngắn: 422.
- Login đúng: 200, data.accessToken và data.refreshToken. Sai password: 401.
- Me với access token: 200, không có passwordHash. Không token/sai/hết hạn: 401.
- Refresh: 200 và token mới; dùng lại refresh token cũ: 401. Collection có request sẵn.
- Docker Desktop → auth-postgres → Exec: `psql -U "$POSTGRES_USER" -d auth_db`. Xem bằng `SELECT id, email, role FROM users;` và `SELECT "userId", "expiresAt", "revokedAt" FROM refresh_tokens;`. Không chụp password hash hoặc token.

## 2. JWT tại Gateway và service

- GET http://localhost:3000/api/orders không token: 401.
- Token user thường: có thể tạo/xem/sửa/xóa đơn của mình; server ghi customerId từ token, không từ body.
- Tạo user B rồi đọc/PATCH/DELETE đơn A: 404. GET /api/orders/customer/<idA> với token B: 403.
- User ghi Product: 403; admin ghi Product: thành công.
- Gọi trực tiếp localhost:3002/api/orders không token: 401; localhost:3001 POST product không token: 401.
- GET products/categories public vẫn 200. Dữ liệu legacy dùng admin để đối chiếu.

## 3. Cloudinary thật

- Tạo tài khoản Cloudinary, lấy cloud name/API key/API secret; điền .env con rồi recreate product-service như UPGRADE.md.
- Postman login admin, đặt uploadProductId là sản phẩm active, Body form-data chọn key image kiểu File. Không đặt thủ công Content-Type (Postman tự tạo multipart boundary).
- JPEG/PNG/WebP <=5 MB → 200, imageUrl HTTPS; mở URL thấy ảnh. GET product phải thấy cùng URL. Xem asset trong Cloudinary Media Library.
- File text đổi đuôi PNG → 415; >5 MB → 413; không chọn file → 422; ID không tồn tại → 404.
- PostgreSQL query: `SELECT id, image_url FROM products WHERE id = 1;` (thay ID vừa upload).
- Có thể dùng `$env:TEST_IMAGE_PATH="C:\anh.png"; npm run test:live` để tự chạy upload thật; sau đó `Remove-Item Env:TEST_IMAGE_PATH`.

## 4. Redis thật

- GET /api/products?page=1&limit=5 hai lần → X-Cache MISS rồi HIT (nếu đã cache sẵn có thể HIT ngay).
- Admin PUT sản phẩm; gửi lại GET → MISS rồi HIT. POST/DELETE/upload ảnh cũng vô hiệu hóa cache.
- Chờ hơn 300 giây không ghi dữ liệu → cùng GET trở lại MISS.
- Docker Redis Exec: `redis-cli --scan --pattern 'lab2a:products:*'`; copy key dữ liệu (không phải revision), chạy `redis-cli TTL <key>` → khoảng 1–300.
- Kiểm tra fallback (API vẫn 200, X-Cache BYPASS):

```powershell
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a stop redis
# Gửi GET products, mong đợi 200/BYPASS
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a start redis
# Chờ vài giây rồi GET lại: MISS/HIT
```

Không dùng FLUSHALL hoặc xóa volume.

## 5. Swagger Order

- Mở http://localhost:3002/api-docs; thấy GET list, GET customer, GET ID, POST, PATCH status, DELETE.
- Authorize: dán accessToken, không kèm chữ Bearer.
- POST tạo đơn → GET → PATCH → GET → DELETE → GET 404. Đối chiếu MongoDB orders_db.orders như phần core.
- Logout trong Authorize, gọi lại Orders → 401. Token user B không đọc được đơn A.
- Chọn server http://localhost:3000 nếu muốn đi qua Gateway. Direct service cũng yêu cầu JWT.

Lưu ảnh code trạng thái, X-Cache, database và Swagger để đưa vào báo cáo; che token/secret. Hoàn thành checklist này mới xác nhận tích hợp thực tế cả 5 bài. Deploy vẫn là bước riêng.
