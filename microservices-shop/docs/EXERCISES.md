# Mục XI - Bài tập tự làm

Bản này là bộ khung học tập, KHÔNG phải lời giải hoàn chỉnh cả 5 bài. Những route stub trả **501**, không trả token giả. Không bật xác thực rồi xem 501 là đã hoàn thành.

## 1. Auth Service (chưa giải)

File bắt đầu: `auth-service/src/app.js`, `auth-service/prisma/schema.prisma`.

- Cài Prisma/@prisma/client cùng phiên bản 6.19.3, bcryptjs, jsonwebtoken và express-validator.
- Dùng database riêng `auth_db` hoặc project PostgreSQL riêng; `.env.example` chỉ là placeholder. Database này KHÔNG được Compose tạo tự động.
- Tạo User (email unique, passwordHash, role) và RefreshToken (tokenHash, userId, expiresAt, revokedAt), migration.
- Register: validate email/password, hash password, trả 201; trùng email trả 409; không trả passwordHash.
- Login: sai thông tin trả 401; đúng trả accessToken (15 phút) và refreshToken (7 ngày).
- Refresh: kiểm tra chữ ký, hạn, token còn hiệu lực trong DB; lưu hash thay vì token rõ; xoay refresh token, thu hồi token cũ.
- GET /api/auth/me: Bearer token hợp lệ mới trả user.
- Viết test: đăng ký trùng, login sai, thiếu token, token hết hạn, refresh bị thu hồi.

## 2. JWT tại Gateway (chưa giải)

File: `api-gateway/src/middleware/auth.js` (chưa mount).

- Cài jsonwebtoken. Xác minh chữ ký/hạn/algorithm, không chỉ decode.
- Chỉ mở register/login/refresh; bảo vệ orders. Thêm quyền admin cho thao tác ghi sản phẩm nếu triển khai phân quyền.
- Không tin customerId client tự gửi; lấy user ID từ xác thực.
- Không để client đi vòng qua gateway bằng URL service public. Khi deploy, cần service private hoặc kiểm tra xác thực tại service nữa.
- Không tin header user do client tự đặt; gateway cần loại bỏ và thay thế bằng dữ liệu đã xác thực, service chỉ nhận từ nguồn tin cậy.

## 3. Cloudinary upload (chưa giải)

File: `product-service/src/controllers/imageController.js` (chưa mount).

- Thêm multer, cloudinary và tích hợp lưu trữ tương thích.
- POST /api/products/:id/image: multipart/form-data, field `image`.
- Giới hạn dung lượng, xác minh loại file; kiểm tra sản phẩm tồn tại; lưu imageUrl.
- Giữ API key/secret trong env. Bổ sung test sai ID, sai định dạng, file quá lớn, upload thành công.

## 4. Redis cache (chưa giải)

File: `product-service/src/middleware/cache.js`. Redis có Compose profile `exercises`.

- Cache GET /api/products trong 300 giây; key chứa query đã chuẩn hóa (page, limit, search, filters, sort).
- Xóa cache sau POST/PUT/DELETE và upload ảnh nếu response thay đổi.
- Redis lỗi thì fallback DB, không làm API hỏng chỉ vì cache.
- Đọc docs bằng client phù hợp; thêm biến REDIS_URL vào service (Docker: redis://redis:6379).

## 5. Swagger Order Service (đã cung cấp nền, cần hoàn thiện phần Auth)

File: `order-service/src/swagger/openapi.json`.

- Bộ khung đã mô tả tất cả endpoint Order, schema, parameters và responses để em test ngay.
- Sau bài 1–2, thêm `components.securitySchemes.bearerAuth` (http/bearer/JWT), `security` cho route cần bảo vệ và response 401/403.
- Dùng Authorize thử token đúng/sai/hết hạn; cập nhật tài liệu khớp hành vi thật. Không chỉ thêm nút Authorize rồi coi như backend đã xác thực.

## Chạy các thành phần mở rộng

`docker compose --profile exercises up -d --build` chạy thêm Auth stub và Redis. Nó không tự hoàn thành các bài tập, không tạo database Auth hoặc bật middleware JWT.
