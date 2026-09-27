# Báo cáo kiểm thử — Lab2a

**Sinh viên:** Nguyễn Ngọc Gia Hân — N23DCPT019  
**Ngày tổng hợp:** 27/09/2026

## 1. Phạm vi và nguồn bằng chứng

Báo cáo tổng hợp kết quả kiểm thử đã ghi nhận trong quá trình thực hiện bài và ảnh minh chứng online. Không phải kết quả của một lần chạy lại toàn bộ hệ thống tại thời điểm soạn tài liệu.

| Môi trường | Phạm vi |
|---|---|
| Test tự động | HTTP, validation, routing, JWT/bcrypt và xử lý ảnh; database/Redis/Cloudinary được mô phỏng |
| Docker local | 8 container, database thật, Auth, Gateway, Product, Order, Redis và Cloudinary thật |
| Swagger local | 7 operation Product + 6 operation Order |
| Render | Product Service, GET danh sách và chi tiết qua Swagger online |

## 2. Test tự động

| Service | Số test đạt |
|---|---:|
| Product | 8/8 |
| Order | 7/7 |
| Gateway | 1/1 |
| Auth | 4/4 |
| **Tổng** | **20/20** |

Phạm vi gồm validation, tính tổng tiền, kiểm tra tồn kho, quyền sở hữu đơn, proxy, token/refresh, cache, xử lý file ảnh và tính nhất quán giữa hai endpoint đặc tả JSON. Kết quả này không thay thế kiểm thử với các dịch vụ thật.

## 3. Kiểm thử tích hợp local

| Nhóm | Kết quả đã ghi nhận |
|---|---|
| Docker | 8 container hoạt động; 7 container có healthcheck đạt healthy; Gateway hoạt động qua request |
| PostgreSQL/Prisma | Migration hoạt động, API đọc/ghi được dữ liệu; đối chiếu `products.is_active = false` sau xóa mềm |
| Product | CRUD, phân trang/sắp xếp, validation; GET sản phẩm đã ẩn trả 404 |
| Order/MongoDB | POST/PATCH/DELETE thành công; đối chiếu bản ghi tạo, trạng thái cập nhật và bản ghi bị xóa trong MongoDB |
| Giao tiếp service | Order lấy giá Product, tính tổng tiền phía server |
| Auth | Login/me, refresh rotation, replay token cũ trả 401; kiểm tra đăng ký và dữ liệu không hợp lệ |
| Phân quyền | Thiếu/sai token bị từ chối; user không ghi Product; không thao tác được đơn của user khác |
| Redis | MISS/HIT, invalidation sau cập nhật; tắt Redis vẫn trả 200/BYPASS, bật lại có MISS/HIT |
| Cloudinary | Upload ảnh thật `image/lenovo.png`, lưu/đọc lại imageUrl; URL ảnh trả 200, asset được xác nhận qua Admin API |

Các luồng tự động dọn đơn thử và xóa mềm sản phẩm thử; ảnh Cloudinary phục vụ minh chứng được giữ lại. Không công bố mật khẩu hoặc token trong báo cáo.

## 4. Swagger UI local

Đã ghi nhận **13 operation, 19 trường hợp đạt**:

| Operation | Kết quả |
|---|---|
| GET `/api/products` | 200 với tham số phân trang/tìm kiếm/giá |
| POST `/api/products` | 401 khi thiếu token; 422 dữ liệu sai; 201 với admin và dữ liệu hợp lệ |
| GET `/api/products/{id}` | 200; 404 sau xóa mềm |
| PUT `/api/products/{id}` | 200, giá cập nhật |
| DELETE `/api/products/{id}` | 200 |
| GET `/api/categories` | 200 |
| POST `/api/products/{id}/image` | 200, trả imageUrl HTTPS |
| GET `/api/orders` | 401 thiếu token; 200 sau Authorize |
| POST `/api/orders` | 201, tổng tiền đúng theo giá Product |
| GET `/api/orders/customer/{customerId}` | 200, chứa đơn vừa tạo |
| GET `/api/orders/{id}` | 200; 404 sau xóa |
| PATCH `/api/orders/{id}/status` | 422 trạng thái sai; 200 với confirmed |
| DELETE `/api/orders/{id}` | 200 |

Các request Swagger local gọi trực tiếp từng service. Gateway có kiểm thử tích hợp riêng. Bao phủ operation không đồng nghĩa bao phủ mọi tổ hợp dữ liệu, quyền và mã lỗi.

## 5. Kiểm thử Product trên Render

Base URL: **https://hanari05-lab2a-product.onrender.com**  
Phiên bản deploy được chụp: **`c73860d`**, trạng thái **Live**, ngày 27/09/2026.

| Kiểm tra | Kết quả quan sát được |
|---|---|
| GET `/api/products` | `success: true`, 4 sản phẩm mẫu; pagination total=4, page=1, limit=10, totalPages=1 |
| GET `/api/products?page=1&limit=2&sortBy=price&order=asc` | 200; sản phẩm đầu là Chuột máy tính, giá 300.000 |
| GET `/api/products/2` | 200; Samsung Galaxy S24, giá 22.990.000, stock=30, khớp danh sách |

Ảnh request phân trang bị cắt phần cuối nên chưa thể đối chiếu đầy đủ sản phẩm thứ hai và pagination chỉ từ ảnh đó. Các bằng chứng hiện có xác nhận Product online đọc được dữ liệu và Swagger thực hiện request thành công.

### Minh chứng online

| File | Nội dung |
|---|---|
| [api-product-online.png](evidence/api-product-online.png) | Danh sách sản phẩm từ API online |
| [GET-api-products.png](evidence/GET-api-products.png) | Request GET danh sách qua Swagger |
| [GET-api-products-id.png](evidence/GET-api-products-id.png) | Request GET chi tiết qua Swagger |

Các file ảnh được lưu riêng trong thư mục `evidence/`; giữ nguyên tên để các liên kết hoạt động. Nếu bổ sung kết quả JSON hoặc ảnh khác, đặt tên theo endpoint và tình huống, không lưu token/secret.

## 6. Cách tái hiện kiểm thử

Chạy tại `microservices-shop`, sau khi cấu hình môi trường và khởi động Docker:

```sh
npm run install:all
npm test
npm run test:live
node scripts/check-ownership.js
```

Kiểm thử Cloudinary thật trong PowerShell:

```powershell
$env:TEST_IMAGE_PATH = (Resolve-Path "image/lenovo.png").Path
npm run test:live
Remove-Item Env:TEST_IMAGE_PATH
```

Cần tài khoản admin đã được tạo và Cloudinary cấu hình hợp lệ. Nếu không truyền đường dẫn ảnh, smoke test có thể bỏ qua Cloudinary; không tính SKIP là kiểm thử upload thành công.

Đối với Render, mở Swagger online hoặc dùng Postman environment với `base_url` là URL Render. Chỉ dùng các GET Product cho phạm vi kiểm thử cloud hiện tại.

## 7. Đối chiếu checklist đề

| Tiêu chí | Trọng số trong đề | Bằng chứng |
|---|---:|---|
| Product kết nối PostgreSQL | 10 | Kiểm thử local và GET online |
| Prisma schema/migration | 10 | Schema, migration và dữ liệu hoạt động |
| CRUD Product | 15 | Test local, Swagger và đối chiếu database |
| Phân trang/lọc/sắp xếp | 10 | Code, test local và GET online |
| Validation chi tiết | 10 | Test tự động và Swagger 422 |
| Swagger và kiểm thử endpoint | 15 | 13 operation, 19 ca local |
| Order MongoDB/CRUD | 10 | HTTP và đối chiếu MongoDB |
| Docker Compose toàn hệ thống | 10 | 8 container và kiểm thử tích hợp |
| Deploy ít nhất một service | 10 | Product Live và GET có dữ liệu trên Render |

Bài có bằng chứng cho cả 9 nhóm tiêu chí. Trọng số được trích để đối chiếu phạm vi hoàn thành, không phải điểm chấm chính thức.

## 8. Giới hạn kiểm thử

- Chưa xác nhận POST/PUT/DELETE hoặc upload ảnh trên Render; các chức năng này đã kiểm thử local.
- Auth, Order và Gateway chưa deploy; chưa có luồng mua hàng đầy đủ online.
- Redis TTL 300 giây có trong code; chưa đo hết hạn thực tế bằng cách chờ đủ 300 giây.
- Chưa có xác nhận lần import/export environment Render cuối cùng trong Postman.
- Chưa thực hiện kiểm thử tải, đồng thời hoặc đánh giá bảo mật toàn diện.

Khi có kiểm thử bổ sung, cập nhật kết quả, ngày thực hiện và minh chứng tương ứng; không suy rộng kết quả GET thành kết quả toàn bộ chức năng cloud.
