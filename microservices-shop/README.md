# Lab2a — Microservices Shop (5 bài mở rộng)

Product + PostgreSQL/Prisma · Order + MongoDB/Mongoose · Auth + PostgreSQL/Prisma · API Gateway · Redis · Cloudinary.

**Đã triển khai cả 5 bài mục XI và kiểm thử Docker local, gồm upload Cloudinary thật.** Xem `docs/LOCAL-VERIFICATION.md`. Chưa deploy backend lên host công khai.

## Bắt đầu

- Đang nâng cấp bản cũ của Hân: đọc **[UPGRADE.md](docs/UPGRADE.md)** trước, giữ project name và volume cũ.
- Project mới: Node.js >=22, Docker Desktop đang chạy, mở terminal tại thư mục `microservices-shop`.

```sh
npm run setup
docker compose up -d --build
docker compose exec auth-service npm run admin
docker compose exec product-service npm run db:seed
npm run test:live
```

`setup` tạo file `.env` nếu thiếu và sinh JWT secrets/admin password ngẫu nhiên, không thay đổi giá trị DB đã có. Credentials admin xem trong `.env` ở thư mục này, không gửi/chụp/push lên GitHub. Chỉ seed Product nếu cần dữ liệu mẫu.

| Thành phần | Địa chỉ |
|---|---|
| Gateway | http://localhost:3000 |
| Product Swagger | http://localhost:3001/api-docs |
| Order Swagger | http://localhost:3002/api-docs |
| Auth | http://localhost:3003/api/auth |
| Product PostgreSQL | localhost:5432, products_db |
| MongoDB | localhost:27017, orders_db |
| Auth PostgreSQL | nội bộ Docker, auth_db |
| Redis | localhost:6379 |

Compose chạy 8 container: gateway, product, order, auth, postgres, mongo, auth-postgres, redis. Không cần profile exercises nữa.

## 1. Auth

| Method | Endpoint | Kết quả |
|---|---|---|
| POST | /api/auth/register | name/email/password; bcrypt cost 12; user thường; 201; email trùng 409 |
| POST | /api/auth/login | email/password; trả data.accessToken, data.refreshToken, data.user |
| POST | /api/auth/refresh | refreshToken; xoay token, token cũ bị thu hồi |
| GET | /api/auth/me | Bearer access token; trả thông tin user, không lộ passwordHash |

Access JWT: HS256, issuer/audience kiểm tra, 15 phút. Refresh JWT: secret riêng, 7 ngày, chỉ lưu SHA-256 trong DB, transaction thu hồi token cũ trước khi phát hành token mới. Đăng ký không cho tự chọn role admin. Access token đã phát hành vẫn có hiệu lực tới khi hết 15 phút; bản lab chưa có logout/blacklist toàn cục.

Tạo/cập nhật admin bằng `docker compose exec auth-service npm run admin`, đọc ADMIN_EMAIL/ADMIN_PASSWORD trong `.env`. Script này thay mật khẩu và gán role admin cho email được cấu hình; chỉ chạy khi muốn cấp lại tài khoản demo quản trị.

## 2. JWT và quyền truy cập

| API | Quyền |
|---|---|
| GET products/categories | Public |
| POST/PUT/DELETE products, POST image | Admin |
| Tất cả orders | Đã đăng nhập; user chỉ thao tác đơn của mình, admin tất cả |
| register/login/refresh | Public, có rate limit |
| me | Đã đăng nhập |

Gateway xác minh JWT trước khi proxy. Product/Order cũng xác minh token nên gọi trực tiếp cổng service không bỏ qua xác thực. Không tin header x-user-id/x-user-role. Khi tạo đơn, customerId lấy từ JWT và ghi đè giá trị body. Đơn của người khác trả 404 để không tiết lộ dữ liệu; endpoint customer khác trả 403. PATCH trạng thái/DELETE của chủ đơn được cho phép trong phạm vi bài lab (chưa phải quy trình quản trị shop thực tế).

## 3. Upload Cloudinary

Admin gọi `POST /api/products/:id/image`; Body form-data, field **image**, file JPEG/PNG/WebP <=5 MB. Dùng Multer memory + Sharp kiểm tra/giải mã ảnh, giới hạn 25 triệu pixel, không nhận ảnh động; chuyển WebP bỏ metadata; Cloudinary SDK upload_stream lưu URL HTTPS vào Product.imageUrl. Dùng SDK trực tiếp thay adapter multer-storage-cloudinary để kiểm tra file trước khi upload.

Thêm vào `.env`: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET; recreate product-service sau khi thay env. Thiếu cấu hình trả 503, upload ngoài lỗi 502, thiếu file 422, quá lớn 413, sai ảnh 415. Nếu DB update thất bại, cố gắng xóa asset vừa upload. Bản lab chưa tự xóa các ảnh cũ của sản phẩm khi thay ảnh thành công; quản lý ảnh không dùng trên Cloudinary khi cần.

## 4. Redis

Cache JSON GET /api/products trong **300 giây**; key bao gồm page/limit/search/category/minPrice/maxPrice/inStock/sortBy/order đã chuẩn hóa. Header **X-Cache: MISS / HIT / BYPASS**. POST/PUT/DELETE/image upload thành công đổi revision để vô hiệu hóa mọi biến thể query; key cũ không còn được đọc và tự hết TTL. Không dùng KEYS/FLUSHALL, không xóa dữ liệu Redis khác. Redis gián đoạn thì fallback DB; reconnect xoay revision tránh đọc cache cũ. Cache không thay thế PostgreSQL.

## 5. Swagger Product và Order

Mỗi service giữ metadata/schemas trong `src/swagger/openapi.json`; annotations `@openapi` trong `src/routes/*Routes.js` mô tả paths, parameters, request bodies và responses. `swagger-jsdoc` quét annotations để sinh tài liệu. `/api-docs.json` và `/openapi.json` trả cùng một spec. Bấm **Authorize**, dán riêng accessToken (không thêm chữ Bearer), thử token đúng/sai. Cả Swagger direct service và Gateway đều được backend kiểm tra JWT.

## Postman

Import **postman/Lab2.postman_collection.json**. Collection tên **Lab2 Microservices**, có các thư mục **Products, Orders, Auth**, đồng thời giữ Core flow và Demo Docker, Cloudinary/Redis. `base_url=http://localhost:3001` dùng cho Product trực tiếp; `gateway_url=http://localhost:3000` dùng cho luồng liên service. Xóa collection cũ trong Postman nếu muốn tránh nhầm. Không dùng `Lab2a.postman_collection.json` cũ nữa.

- Điền adminEmail/adminPassword ở local; POST Login admin tự lưu accessToken/refreshToken/userId.
- Sau đó chạy Core flow 01–17 hoặc riêng Demo Docker POST → PATCH → DELETE.
- Register/Login user để kiểm tra quyền user; sau đó login admin lại trước khi ghi Product.
- Refresh lưu token mới; request replay dùng oldRefreshToken mong đợi 401.
- Cloudinary: chọn file local trong form-data; uploadProductId phải đang active.
- Redis: Send GET cùng URL hai lần, xem header X-Cache.
- Để No Environment hoặc không tạo biến trùng tên ghi đè collection variables. Xóa giá trị token/password khỏi file export trước khi commit.

## Kiểm thử

```sh
npm run install:all
npm test
npm run test:live
```

Unit/HTTP tests: bcrypt/JWT, routing, validation, ownership, image decoding thật; DB/Redis/Cloudinary dùng mock. `test:live` cần Docker thật đang chạy, admin đã tạo và Redis sẵn sàng. Nó kiểm tra login/me/refresh/replay, Gateway 401, Product CRUD, Redis, Order liên service rồi xóa đơn thử và xóa mềm sản phẩm thử.

PowerShell để thêm Cloudinary thật vào test:

```powershell
$env:TEST_IMAGE_PATH = "C:\duong-dan\anh.png"
npm run test:live
Remove-Item Env:TEST_IMAGE_PATH
```

Cloudinary sẽ lưu một ảnh thật; script giữ sản phẩm thử inactive cùng URL ảnh để đối chiếu. Không có TEST_IMAGE_PATH thì log SKIP Cloudinary, không phải đã kiểm thử upload thật.

## Giới hạn và việc còn lại

- Chưa deploy; xem docs/DEPLOY.md và cấu hình từng service/DB/secret trên host riêng.
- Order kiểm tra stock nhưng chưa trừ/giữ stock, chưa có distributed transaction/thanh toán.
- Migration Auth chỉ thêm DB mới, không sửa schema Product/Mongo cũ. Đơn cũ có customerId nhập thủ công không đồng nghĩa danh tính tài khoản Auth mới; dùng admin xem dữ liệu cũ, tạo đơn mới khi kiểm tra ownership.
- HTTPS, quản lý secret, rotation, CSRF/session strategy và kiểm soát quyền nghiệp vụ chi tiết cần thiết nếu phát triển production.
- Cấu hình Docker mặc định là local, không dùng mật khẩu mẫu cho server public.

Tài liệu: [Cloudinary upload_stream](https://cloudinary.com/documentation/node_image_and_video_upload), [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions), [ioredis](https://github.com/redis/ioredis), [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc).
