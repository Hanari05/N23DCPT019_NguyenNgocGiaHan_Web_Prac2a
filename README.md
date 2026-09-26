# Lab2a - Backend Node.js Microservices Shop

Khung thực hành dựa trên **Lab2a.pdf**: REST API, Product Service (PostgreSQL + Prisma), Order Service (MongoDB + Mongoose), Swagger, Gateway, Docker và deploy.

**Phạm vi:** phần cốt lõi có code thực thi; mục XI có scaffold/TODO. Chưa có giao diện frontend. Auth/JWT, Cloudinary, Redis chưa được giải hoàn chỉnh. Xem [bài tự làm](docs/EXERCISES.md) và [báo cáo kiểm tra](docs/VERIFICATION.md).

## 1. Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `product-service/` | src/config, controllers, routes, middleware, swagger; Prisma schema, migration, seed |
| `order-service/` | src/models, config/productClient, controllers, routes, middleware, swagger |
| `api-gateway/` | Proxy giữ nguyên path/query/body, rate limit; JWT middleware TODO |
| `auth-service/` | Khung bài Auth trả 501; Prisma schema TODO |
| `postman/` | Collection, environment local |
| `scripts/` | Tạo env, cài dependency, test và smoke test |
| `docs/` | Deploy, bài tự làm, kết quả kiểm tra |
| `docker-compose.yml` | PostgreSQL, MongoDB, 3 service cốt lõi; Auth/Redis theo profile |
| `docker-compose.dev.yml` | Override source mount và nodemon |

Tất cả service thống nhất `src/app.js` xây Express app và `src/index.js` khởi động. Không trộn file từ Lab 2 cũ vào project này.

## 2. Phiên bản

- Dùng **Node.js 22.x**, npm và Docker Desktop có Compose v2 nếu chạy Docker.
- Prisma/@prisma/client **6.19.3** được ghim để dùng schema/config kiểu Prisma 6 như PDF. Không nâng riêng một package lên Prisma 7 rồi giữ nguyên cấu hình cũ.
- Mỗi service có package-lock.json. `npm ci` cài đúng dependency đã khóa.
- PostgreSQL 16, MongoDB 7 trong Compose. Không cần tài khoản cloud để chạy Docker local.

## 3. Cách A - Docker local

Mở thư mục gốc chứa README này trong VS Code. Mở Docker Desktop, chờ engine sẵn sàng.

```powershell
npm run setup
docker compose up -d --build
docker compose logs -f product-service
```

`npm run setup` sao chép các `.env.example` thành `.env` **chỉ nếu chưa tồn tại**. Giá trị mặc định là tài khoản học tập local; không dùng cho cloud. Khi tự thay password local trong file gốc, dùng ký tự chữ/số để không phải encode URL.

Sau khi product-service ready, Ctrl+C để thoát chế độ xem log (container vẫn chạy), rồi:

```powershell
docker compose exec product-service npm run db:seed
```

Migration chạy trước Product Service nhờ command trong Compose. Seed chạy riêng, không xóa dữ liệu cũ.

| Địa chỉ | Chức năng |
|---|---|
| http://localhost:3000/health | Gateway liveness |
| http://localhost:3001/api-docs | Swagger Product |
| http://localhost:3002/api-docs | Swagger Order |
| http://localhost:3000/api/products | Product API qua Gateway |
| http://localhost:3000/api/orders | Order API qua Gateway |

Cổng database và service trong Compose chỉ bind vào localhost để học trên máy. `/health` là kiểm tra tiến trình HTTP, không thay cho kiểm thử CRUD hoặc giám sát DB liên tục.

```powershell
# Xem trạng thái/log
docker compose ps
docker compose logs -f order-service
# Dừng, giữ dữ liệu
docker compose down
# Chạy dev tự reload source
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

`docker compose down -v` **xóa volume và dữ liệu local**; chỉ dùng khi chủ động muốn reset. Đổi password trong env không tự đổi tài khoản bên trong volume DB đã được khởi tạo.

## 4. Cách B - Node local + Supabase/Atlas

```powershell
npm run setup
npm run install:all
```

Sửa file trong từng service, không gửi credentials vào README/Postman/Git:

- `product-service/.env`: `DATABASE_URL` cho ứng dụng; `DIRECT_URL` cho migration. Lấy URI PostgreSQL của em, giữ database riêng cho bài. Nếu dùng pooler, dùng URL phù hợp từng chế độ kết nối; DIRECT_URL nên là kết nối direct hoặc session dùng cho migration. URL mặc định trong mẫu là DB local, không phải cloud.
- `order-service/.env`: `MONGODB_URI` của Atlas, có tên DB (ví dụ `lab2a_orders`); `PRODUCT_SERVICE_URL=http://localhost:3001`.
- `api-gateway/.env`: URL Product 3001, Order 3002, Auth 3003 (chưa bật).
- Atlas: database user đủ quyền trên DB bài tập; cho phép IP máy đang chạy Node.

Ba terminal riêng:

```powershell
# Terminal 1
cd product-service
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

```powershell
# Terminal 2 (mở từ gốc project)
cd order-service
npm run dev
```

```powershell
# Terminal 3 (mở từ gốc project)
cd api-gateway
npm run dev
```

`db:migrate` áp dụng migration đã đóng gói, không cần shadow database. Khi tự sửa schema, dùng `db:dev -- --name ten_thay_doi` trên DB phát triển có quyền tạo shadow database; commit cả migration mới. Không chạy migrate dev trên DB production.

## 5. Endpoint chính

| Method | URL qua Gateway | Chức năng |
|---|---|---|
| GET | `/api/products` | Phân trang/tìm kiếm/lọc/sắp xếp |
| GET | `/api/products/:id` | Sản phẩm đang active |
| POST | `/api/products` | Tạo sản phẩm |
| PUT | `/api/products/:id` | Thay thế các trường cho phép sửa |
| DELETE | `/api/products/:id` | Soft delete |
| GET | `/api/categories` | Danh mục được seed |
| GET | `/api/orders` | Danh sách/phân trang/lọc status |
| GET | `/api/orders/customer/:customerId` | Đơn theo khách |
| GET | `/api/orders/:id` | Chi tiết |
| POST | `/api/orders` | Tạo đơn và tính tiền phía server |
| PATCH | `/api/orders/:id/status` | Đổi trạng thái |
| DELETE | `/api/orders/:id` | Xóa thật đơn hàng demo |

Query Product: `page=1&limit=5&search=iphone&category=mobile&sortBy=price&order=asc&minPrice=0&maxPrice=30000000&inStock=true`.

PUT Product yêu cầu name và price; các trường tùy chọn bị bỏ qua sẽ về mặc định/null. ID, slug, isActive không nhận trực tiếp từ body. Product đã ẩn không còn xuất hiện trong GET danh sách/GET ID. `price` trong response Product là chuỗi JSON do Prisma Decimal; client dùng Number nếu cần so sánh.

Status Order: `pending`, `confirmed`, `shipping`, `delivered`, `cancelled`. Lab 2 cũ dùng `shipped`; bài này dùng `shipping` theo Lab2a.

Tạo sản phẩm (POST /api/products):

```json
{ "name": "Bàn phím", "price": 700000, "stock": 10 }
```

Sau đó lấy ID sản phẩm thật đưa vào POST /api/orders:

```json
{
  "customerId": 1,
  "customerName": "Nguyễn Ngọc Gia Hân",
  "customerEmail": "han@example.com",
  "items": [{ "productId": 1, "quantity": 2 }],
  "shippingAddress": { "street": "Địa chỉ mẫu", "city": "TP.HCM" }
}
```

Không gửi productName, price, subtotal hoặc totalAmount: server lấy snapshot từ Product Service và tính tổng. Đây là cải tiến so với PDF vốn lấy giá từ client. Server kiểm tra tồn kho hiện thời nhưng **chưa đặt giữ/trừ kho, chưa có giao dịch phân tán**, nên không coi đây là hệ thống bán hàng production. customerId hiện là số mẫu, chưa xác minh bằng Auth.

Mã phản hồi: 200 thành công; 201 tạo; 400 JSON sai; 404 không tìm thấy; 409 trùng; 422 validation; 429 rate limit; 500 lỗi nội bộ; 503 service phụ thuộc không khả dụng. ID sai định dạng trả 422 trong bộ khung này. Response thường là `{ success, data, message }`, danh sách thêm pagination.

## 6. Swagger và Postman

Swagger UI dùng OpenAPI 3.0 trong `src/swagger/openapi.json`. Đây là cách viết specification trực tiếp thay cho JSDoc comment trong PDF; không cần giữ hai tài liệu trùng nhau. Sửa endpoint thì cập nhật file này. `/openapi.json` trả specification.

1. Import `postman/Lab2a.postman_collection.json` và environment Local.
2. Chọn `base_url=http://localhost:3000` (Gateway).
3. Chạy folder **Core flow** theo thứ tự 01–17; POST tự lưu productId và orderId.
4. Flow tạo 1 sản phẩm, tạo 1 đơn, cập nhật, xóa đơn và ẩn sản phẩm. Sản phẩm inactive vẫn còn trong DB đúng thiết kế soft delete.
5. Folder Auth là TODO, chưa chạy trong bộ test core. Nếu bật Auth stub thì trả 501; nếu chưa chạy Auth thì Gateway trả 503.

Browser Postman gọi localhost cần Desktop Agent hoặc dùng Postman Desktop. Không đặt token hoặc URI database vào collection.

## 7. Kiểm thử

```powershell
# Sau npm run install:all: test HTTP + model, persistence được mock
npm test
# Khi hệ thống thật đang chạy: kiểm tra thông qua Gateway
npm run test:live
```

Smoke test thực sự tạo dữ liệu: xóa đơn tạm và soft-delete sản phẩm tạm khi xong. Dùng DB bài tập; nếu mạng mất giữa chừng, kiểm tra ID được in ra để dọn thủ công. Kết quả kiểm tra trước khi đóng gói nằm trong `docs/VERIFICATION.md`; test mock không chứng minh kết nối database/deploy thành công.

## 8. Bài tự làm và deploy

- [Năm bài tự làm](docs/EXERCISES.md): Auth/JWT, Gateway auth, Cloudinary, Redis, Swagger Bearer.
- [Deploy](docs/DEPLOY.md): Product lên Render + PostgreSQL; sau đó Order và Gateway.
- Giữ core chạy được trước khi bật từng phần mở rộng. Không cần thay project Lab 2 đã nộp.

## 9. Push lên repo GitHub mới

Tạo repo trống trên GitHub, giải nén và mở **thư mục chứa README này**. Thay URL ví dụ bằng repo thật:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "Add Lab2a microservices starter"
git remote add origin https://github.com/Hanari05/TEN_REPO_MOI.git
git push -u origin main
```

Nếu đã clone repo thì chỉ chép các file vào gốc repo, không tạo folder lồng thừa; dùng remote sẵn có. `.gitignore` bảo vệ file env và node_modules; `.env.example` chỉ chứa mẫu. Không copy `.git` hay credentials từ Lab 2 cũ.

## 10. Tài liệu tham khảo

- Đề: Lab2a.pdf được cung cấp.
- Prisma 6: https://www.prisma.io/docs/orm/v6/reference/connection-urls
- Proxy v3: https://github.com/chimurai/http-proxy-middleware/blob/master/MIGRATION_V3.md
- Khi nâng major dependency, kiểm tra lại cấu hình thay vì cài latest rồi chép nguyên code mẫu cũ.
