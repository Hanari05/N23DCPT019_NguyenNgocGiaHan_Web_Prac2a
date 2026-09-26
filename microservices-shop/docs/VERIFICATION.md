# Kiểm tra trước khi đóng gói

Ngày: 26/09/2026. Runtime thực tế kiểm tra: Node.js 24.19.0, npm 11.9.0. Dockerfile dùng Node 22; chưa chạy image trong môi trường này.

## Đã kiểm tra

- Cài dependency thành công cho cả 4 service, tạo package-lock.json riêng.
- Prisma 6.19.3: `prisma validate` đạt, `prisma generate` đạt.
- SQL migration được sinh từ schema bằng `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`.
- Cú pháp JavaScript, JSON và parse YAML đều đạt.
- **13 tests đạt**: 5 Product, 6 Order, 1 Gateway, 1 Auth scaffold.
- Product: validation, CRUD/soft delete, 404 sau ẩn, query pagination/sort/filter, Swagger paths.
- Order: validation, tổng tiền lấy giá server, gộp sản phẩm trùng, kiểm tra tồn kho tổng hợp, PATCH chỉ sửa status, DELETE/404, Mongoose schema, Swagger paths.
- Gateway: proxy HTTP thật tới server echo local, giữ path/query/JSON body; prefix sai trả 404, upstream không hoạt động trả 503.
- Auth: stub trả 501, không tạo token giả.

Product/Order tests dùng **mock persistence**; riêng validation Mongoose chạy model thật không cần DB. Đây không phải kết quả CRUD trên PostgreSQL/MongoDB thật.

## Chưa xác nhận bằng chạy thực tế

- Docker build / Docker Compose (môi trường kiểm tra không có Docker).
- Migration và seed trên PostgreSQL thật.
- CRUD liên service với PostgreSQL + MongoDB thật.
- Swagger UI bằng trình duyệt (đã kiểm tra specification trả qua HTTP).
- Deploy cloud (không có URI hoặc tài khoản cloud của người dùng).
- Năm bài tự làm: xem EXERCISES.md; không đánh dấu toàn bộ Lab hoàn thành chỉ vì bộ khung đã có file.

## Xác nhận trên máy em

1. `npm run setup`.
2. `docker compose up -d --build`.
3. `docker compose exec product-service npm run db:seed`.
4. Mở Swagger Product/Order.
5. `npm run test:live` hoặc chạy Postman Core flow 01–17.
6. Đối chiếu PostgreSQL/MongoDB: sản phẩm test inactive, đơn test đã xóa.
7. Sau khi deploy, đổi BASE_URL/base_url sang Gateway thật và kiểm tra lại trên DB demo.

## Khác biệt có chủ đích so với đoạn mẫu PDF

- Dùng OpenAPI JSON trực tiếp với Swagger UI, thay cho swagger-jsdoc/JSDoc.
- Thống nhất entry point index.js; Prisma 6 được ghim, có migration sẵn.
- ID/param sai qua validator trả 422; JSON sai cú pháp trả 400.
- Order dùng PATCH /:id/status, bổ sung GET list/detail và DELETE để đủ CRUD.
- Server lấy giá/tên từ Product Service, không tin totalAmount/price của client.
- Soft delete được áp dụng nhất quán cho cả GET list và GET detail sản phẩm.
- Mã đơn dùng UUID thay cho đếm document, tránh trùng do cạnh tranh/xóa bản ghi.
- Auth và Redis nằm ở profile exercises, không chặn core khi chưa làm bài mở rộng.

## Cảnh báo dependency không chặn test

Prisma 6 báo package.json#prisma sẽ bị bỏ ở Prisma 7; đây là cấu hình seed chủ động ghim theo bản 6. Proxy v3 có thể báo deprecation util._extend trên Node mới. Không dùng `npm audit fix --force` để tự nâng major trong lúc học; nâng có chủ đích rồi test lại.
