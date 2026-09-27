# Lab2a — RESTful API & Microservices Shop

**Sinh viên:** Nguyễn Ngọc Gia Hân · **MSSV:** N23DCPT019  
**Học phần:** Lập trình Web  
**Repository:** [N23DCPT019_NguyenNgocGiaHan_Web_Prac2a](https://github.com/Hanari05/N23DCPT019_NguyenNgocGiaHan_Web_Prac2a)

## Giới thiệu

Bài thực hành xây dựng hệ thống quản lý sản phẩm và đơn hàng theo kiến trúc microservices. Các service giao tiếp qua HTTP, sử dụng PostgreSQL và MongoDB để lưu trữ dữ liệu, đồng thời tích hợp xác thực JWT, upload ảnh Cloudinary, cache Redis và tài liệu Swagger.

**Phạm vi triển khai:** toàn bộ hệ thống chạy bằng Docker Compose ở local. Product Service đã được triển khai công khai trên Render và kiểm thử GET qua Swagger online ngày 27/09/2026.

## Demo online

| Nội dung | Đường dẫn |
|---|---|
| Product API | [Danh sách sản phẩm](https://hanari05-lab2a-product.onrender.com/api/products) |
| Swagger | [Tài liệu và thử API](https://hanari05-lab2a-product.onrender.com/api-docs/) |
| Health endpoint | [Kiểm tra service](https://hanari05-lab2a-product.onrender.com/health) |

Product online dùng database riêng trên Render. Auth, Order và Gateway chưa được deploy. Các thao tác ghi Product yêu cầu token admin hợp lệ của môi trường tương ứng; token local không dùng được với JWT secret riêng của Render.

## Kiến trúc và công nghệ

| Thành phần | Vai trò | Công nghệ | Cổng local |
|---|---|---|---:|
| API Gateway | Định tuyến, xác thực và giới hạn request | Express, http-proxy-middleware, JWT | 3000 |
| Product Service | Quản lý sản phẩm, ảnh và cache | Express, Prisma, PostgreSQL, Cloudinary, Redis | 3001 |
| Order Service | Quản lý đơn, lấy thông tin sản phẩm qua HTTP | Express, Mongoose, MongoDB | 3002 |
| Auth Service | Tài khoản và access/refresh token | Express, Prisma, PostgreSQL, bcryptjs, JWT | 3003 |

Docker Compose gồm 8 container: Gateway, Product, Order, Auth, PostgreSQL Product, PostgreSQL Auth, MongoDB và Redis. Hai service Product và Auth sử dụng PostgreSQL riêng.

## Chức năng

- **Product:** CRUD, slug, danh mục, xóa mềm; phân trang, tìm kiếm, lọc giá/tồn kho/danh mục và sắp xếp.
- **Order:** tạo, xem, cập nhật trạng thái, xóa; phân trang và lọc. Giá và tên sản phẩm được lấy từ Product Service để tính tổng tiền.
- **Validation:** kiểm tra dữ liệu đầu vào, trả lỗi chi tiết; xử lý tài nguyên không tồn tại và dữ liệu trùng.
- **Auth/JWT:** đăng ký, đăng nhập, refresh, thông tin tài khoản; phân quyền admin/user và quyền sở hữu đơn hàng.
- **Cloudinary:** upload ảnh sản phẩm và lưu URL vào PostgreSQL.
- **Redis:** cache danh sách trong 300 giây, vô hiệu hóa sau thay đổi, truy vấn database khi Redis không khả dụng.
- **Swagger/Postman:** tài liệu endpoint, Bearer authentication và collection kiểm thử.

## Chạy trên máy local

Yêu cầu Node.js 22 trở lên, Docker Desktop với Docker Compose, Git; dùng Postman hoặc Swagger để kiểm thử.

### 1. Lấy mã nguồn và tạo cấu hình

```sh
git clone https://github.com/Hanari05/N23DCPT019_NguyenNgocGiaHan_Web_Prac2a.git
cd N23DCPT019_NguyenNgocGiaHan_Web_Prac2a/microservices-shop
npm run setup
```

Script tạo các file môi trường còn thiếu và sinh JWT secrets cùng mật khẩu admin trong `microservices-shop/.env`. Kiểm tra các biến database trước khi chạy. Có thể bổ sung ba biến Cloudinary để thử upload ảnh thật. Không commit `.env`.

Với hệ thống đã có dữ liệu, giữ nguyên thông tin database, tên Compose project và volume đang dùng. Không chạy `docker compose down -v` nếu cần giữ dữ liệu.

### 2. Khởi động hệ thống

```sh
docker compose up -d --build
docker compose ps
docker compose exec auth-service npm run admin
```

Với database mới, nạp dữ liệu mẫu:

```sh
docker compose exec product-service npm run db:seed
```

Lệnh `npm run admin` tạo hoặc cập nhật tài khoản quản trị theo `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env`. Chỉ chạy lại khi cần cấp hoặc cập nhật tài khoản này.

### 3. Mở API

| Giao diện | URL |
|---|---|
| Gateway | http://localhost:3000/health |
| Swagger Product | http://localhost:3001/api-docs/ |
| Swagger Order | http://localhost:3002/api-docs/ |

## Kiểm thử

Chạy tại `microservices-shop`:

```sh
npm run install:all
npm test
npm run test:live
```

- `npm test`: kiểm thử tự động; database, Redis và Cloudinary được mô phỏng.
- `npm run test:live`: cần hệ thống Docker đang chạy và tài khoản admin đã tạo; kiểm tra Auth, Gateway, Product, Redis và Order với dịch vụ thật. Script xóa đơn thử và xóa mềm sản phẩm thử.
- Upload Cloudinary thật chỉ được kiểm tra khi cung cấp `TEST_IMAGE_PATH`.

Kết quả đã ghi nhận: **20/20 test tự động**, **13 operation Swagger với 19 ca kiểm thử**, kiểm thử tích hợp local và GET Product trên Render. Xem [báo cáo kiểm thử](microservices-shop/docs/VERIFICATION.md) để biết phạm vi và giới hạn.

## Postman

Import `microservices-shop/postman/Lab2.postman_collection.json` và environment phù hợp.

| Môi trường | `base_url` | Phạm vi |
|---|---|---|
| Local | `http://localhost:3001` | Product trực tiếp; `gateway_url=http://localhost:3000` cho luồng liên service |
| Lab2a Render | `https://hanari05-lab2a-product.onrender.com` | GET Product online |

Đăng nhập admin trước khi chạy các request ghi dữ liệu local. Không thay `gateway_url` bằng URL Product Render. Hướng dẫn tạo/export environment cloud nằm trong [DEPLOY.md](microservices-shop/docs/DEPLOY.md).

## Tài liệu bài thực hành

| Tài liệu | Nội dung |
|---|---|
| [DEPLOY.md](microservices-shop/docs/DEPLOY.md) | Cấu hình Render, URL và kiểm tra online |
| [EXERCISES.md](microservices-shop/docs/EXERCISES.md) | Triển khai 5 bài tập mở rộng |
| [VERIFICATION.md](microservices-shop/docs/VERIFICATION.md) | Kết quả kiểm thử và giới hạn |

Mã nguồn nằm trong `microservices-shop/`; cấu hình Render là `render.yaml` tại gốc repo. Ảnh minh chứng online nằm trong `microservices-shop/docs/evidence/`.

## Giới hạn

- Cloud mới triển khai Product; chưa xác nhận POST/PUT/DELETE hoặc upload trên cloud.
- Order kiểm tra tồn kho nhưng chưa trừ/giữ tồn kho, chưa có thanh toán hay giao dịch phân tán.
- Quyền thay đổi trạng thái đơn được triển khai trong phạm vi bài thực hành, chưa mô hình hóa quy trình vận hành cửa hàng đầy đủ.
- Render Free có cơ chế ngủ khi không hoạt động; PostgreSQL Free có thời hạn sử dụng. Cần kiểm tra thời hạn database trước buổi chấm bài.
