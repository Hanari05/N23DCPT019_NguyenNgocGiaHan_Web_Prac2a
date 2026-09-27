# Năm bài tập mở rộng — Lab2a

Tài liệu trình bày các chức năng mục XI của đề, vị trí triển khai và cách kiểm thử. Cả năm bài đã được triển khai; kết quả được tổng hợp trong [VERIFICATION.md](VERIFICATION.md).

## 1. Auth Service với JWT

**Vị trí:** `auth-service/src/app.js`, `auth-service/src/tokens.js`, `auth-service/prisma/`.

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký, hash mật khẩu bằng bcryptjs |
| POST | `/api/auth/login` | Đăng nhập, trả accessToken và refreshToken |
| POST | `/api/auth/refresh` | Đổi refresh token hợp lệ lấy cặp token mới |
| GET | `/api/auth/me` | Thông tin tài khoản, cần Bearer access token |

User được lưu bằng Prisma/PostgreSQL. Access token hết hạn sau **15 phút**; refresh token **7 ngày**, dùng secret riêng. Database chỉ lưu hash refresh token. Khi refresh thành công, token cũ bị thu hồi; sử dụng lại bị từ chối. Đăng ký luôn tạo role `user`, không nhận quyền admin từ client.

**Kiểm thử:** đăng ký → đăng nhập → gọi `/me` → refresh → dùng lại refresh token cũ. Kiểm tra thêm email trùng, mật khẩu sai, dữ liệu không hợp lệ và token sai.

## 2. Xác thực JWT tại Gateway

**Vị trí:** `api-gateway/src/app.js`, `api-gateway/src/middleware/auth.js`; middleware xác thực của Product và Order.

| Nhóm API | Quyền |
|---|---|
| GET Product và Category | Public |
| POST/PUT/DELETE Product, upload ảnh | Admin |
| Order | Đã đăng nhập; user thao tác đơn của mình, admin thao tác tất cả |
| Register/Login/Refresh | Public, có giới hạn request |
| `/api/auth/me` | Đã đăng nhập |

Gateway xác minh JWT trước khi proxy. Service trực tiếp cũng kiểm tra token. Header tự khai báo danh tính không được tin cậy. Khi tạo đơn, customerId được lấy từ danh tính JWT; giá và tên sản phẩm được lấy từ Product Service.

**Kiểm thử:** gọi API cần bảo vệ khi thiếu/sai token → 401; user ghi Product → 403; user B đọc/sửa/xóa đơn của user A → 404; truy vấn đơn theo customer khác → 403.

## 3. Upload ảnh với Cloudinary

**Vị trí:** `product-service/src/controllers/imageController.js` và routes Product.

```text
POST /api/products/:id/image
Authorization: Bearer <admin access token>
Body: form-data, field image, type File
```

Điền ba biến Cloudinary trong `.env` local và nạp lại cấu hình container Product. Chọn JPEG, PNG hoặc WebP tối đa **5 MB**, sản phẩm phải đang hoạt động.

Multer nhận file vào bộ nhớ; Sharp giải mã, kiểm tra định dạng/kích thước ảnh, loại metadata và chuyển WebP. Cloudinary SDK upload ảnh, sau đó lưu `secure_url` vào `Product.imageUrl` và vô hiệu hóa cache.

| Tình huống | Mã phản hồi |
|---|---:|
| Upload thành công | 200 |
| Thiếu file | 422 |
| File quá lớn | 413 |
| Ảnh không hợp lệ | 415 |
| Thiếu cấu hình Cloudinary | 503 |
| Dịch vụ upload bên ngoài thất bại | 502 |

Sử dụng SDK trực tiếp cùng Multer/Sharp thay cho adapter `multer-storage-cloudinary` để kiểm tra nội dung ảnh trước khi gửi.

**Kiểm thử:** upload ảnh thật, GET lại sản phẩm, mở imageUrl và đối chiếu asset Cloudinary. Upload thật đã được kiểm chứng từ môi trường local; chưa xác nhận upload qua Product trên Render.

## 4. Cache Redis

**Vị trí:** `product-service/src/middleware/cache.js`, controller Product và Redis trong `docker-compose.yml`.

- Cache `GET /api/products` với TTL **300 giây**.
- Key phân biệt page, limit, search, category, khoảng giá, tồn kho và cách sắp xếp.
- POST/PUT/DELETE/upload thành công đổi revision để vô hiệu hóa các biến thể cache; key cũ tự hết hạn.
- Redis không khả dụng: API truy vấn PostgreSQL, trả `X-Cache: BYPASS`.

| Header `X-Cache` | Ý nghĩa |
|---|---|
| MISS | Chưa có cache của truy vấn |
| HIT | Phản hồi từ cache |
| BYPASS | Không sử dụng được cache |

**Kiểm thử local:** gửi cùng GET hai lần → MISS/HIT; cập nhật sản phẩm rồi GET → dữ liệu mới; dừng Redis → API vẫn trả dữ liệu; khởi động lại → MISS/HIT. TTL 300 giây có trong code, chưa có minh chứng đo hết hạn bằng cách chờ đủ thời gian.

## 5. Swagger đầy đủ cho Order

**Vị trí:** `order-service/src/swagger/` và annotations trong `order-service/src/routes/`.

Swagger được sinh bằng `swagger-jsdoc`, có schemas, parameters, request bodies, responses và Bearer authentication.

| Method | Endpoint |
|---|---|
| GET, POST | `/api/orders` |
| GET | `/api/orders/customer/{customerId}` |
| GET, DELETE | `/api/orders/{id}` |
| PATCH | `/api/orders/{id}/status` |

Mở http://localhost:3002/api-docs/, chọn Authorize và dán access token, sau đó dùng Try it out. `/api-docs.json` và `/openapi.json` cung cấp cùng đặc tả.

**Kiểm thử:** tạo đơn với sản phẩm hợp lệ, kiểm tra tổng tiền, đọc danh sách/chi tiết, cập nhật trạng thái, xóa và xác nhận GET sau xóa trả 404. Swagger Product và Order đã ghi nhận 13 operation với 19 ca kiểm thử đạt.
