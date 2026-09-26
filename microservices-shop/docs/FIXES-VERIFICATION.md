# Sửa các khác biệt với đề Lab2a

- Bốn Dockerfile production dùng các stage base, builder, production; runtime chạy user node. Database/volume không đổi.
- Product và Order dùng swagger-jsdoc quét annotation @openapi trong routes. Metadata/schemas giữ trong JSON; toàn bộ paths đã đối chiếu và giữ nguyên so với spec trước sửa.
- Thêm /api-docs.json, giữ /openapi.json tương thích; kiểm thử so sánh hai endpoint đã bổ sung vào bộ test.
- Sửa mô tả Auth TODO trong Order Swagger.
- Postman: tên Lab2 Microservices; file postman/Lab2.postman_collection.json; thư mục Products, Orders, Auth. Products dùng base_url=3001; các flow liên service dùng gateway_url=3000. Core flow giữ thứ tự tạo/xóa dữ liệu thử. Không lưu mật khẩu/token thật.
- Cập nhật README, environment Postman, hướng dẫn nâng cấp/deploy; bổ sung hot reload Auth trong docker-compose.dev.yml.

Kết quả kiểm chứng:

- Build multi-stage thành công cho cả 4 service.
- Bộ test trong image mới: Product 8/8, Order 7/7, Gateway 1/1, Auth 4/4; tổng 20/20 PASS, gồm so sánh hai endpoint JSON.
- Compose dev config hợp lệ; git diff --check đạt.
- Đã cập nhật hệ thống bằng đúng project Docker cũ, giữ volume; Compose up --wait thành công.
- Smoke thật PASS login/me/refresh/replay, Gateway 401, Redis MISS/HIT/invalidation, Product CRUD/validation và Order CRUD. Đơn thử đã xóa; sản phẩm thử ID 10 được soft-delete. Không upload lại Cloudinary vì phần upload không thay đổi.
- Kiểm tra HTTP thật: /api-docs.json và /openapi.json trùng nhau, 7 operation Product và 6 operation Order; không còn mô tả Auth TODO.

Deploy host công khai chưa thực hiện. File collection mới chưa được import vào ứng dụng Postman trong lần sửa này. Chưa commit/push các thay đổi của repo. Cập nhật 27/09: toàn bộ 13 operation Product/Order đã được kiểm thử qua Swagger UI; xem SWAGGER-UI-VERIFICATION.md (19 trường hợp đạt).
