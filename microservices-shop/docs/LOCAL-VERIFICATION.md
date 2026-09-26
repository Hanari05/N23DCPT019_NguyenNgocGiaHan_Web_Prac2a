# Kết quả nâng cấp và kiểm thử local — 26/09/2026

## Đã thực hiện

- Copy bản mở rộng vào repo; giữ cấu hình PostgreSQL/MongoDB lấy từ container cũ vì `.env` gốc không còn trong checkout.
- Chạy setup tạo JWT secrets và mật khẩu admin trong `.env`, được Git ignore.
- Build và khởi động bằng project `n23dcpt019_nguyenngocgiahan_web_prac2a`; cả 8 container chạy, 7 container có healthcheck đều healthy, Gateway hoạt động qua smoke test.
- Giữ volume `n23dcpt019_nguyenngocgiahan_web_prac2a_postgres_data` và `n23dcpt019_nguyenngocgiahan_web_prac2a_mongo_data`. Không chạy down -v, không seed lại dữ liệu cũ.
- Tạo admin thành công bằng `npm run admin` trong Auth container.
- `npm run test:live`: PASS login/me, refresh rotation, replay 401, Gateway 401, Product CRUD/validation, Redis MISS/HIT/invalidation sau PUT, Order CRUD và tổng tiền liên service.
- `node scripts/check-ownership.js`: PASS register không tự cấp admin, email trùng 409, sai mật khẩu 401, mật khẩu ngắn 422, token sai 401, service trực tiếp yêu cầu token, user ghi Product 403; user B GET/PATCH/DELETE đơn A trả 404, danh sách theo customer khác trả 403. customerId tạo đơn lấy từ JWT. Schema Swagger có bearerAuth.
- Dừng Redis: API Product trả 200/BYPASS. Khởi động lại: MISS rồi HIT.
- Swagger Order mở được ở http://localhost:3002/api-docs/ và có nút Authorize cùng các endpoint Order.

## Dữ liệu kiểm thử

Smoke đã xóa đơn thử, soft-delete sản phẩm thử ID 6. Kiểm tra ownership cũng xóa đơn thử và soft-delete sản phẩm thử; giữ tài khoản checklist ID 2 và 4 để đối chiếu. Không ghi mật khẩu/token vào báo cáo.

## Chưa hoàn thành

- Cloudinary: ba biến đã lưu, khớp cấu hình container Product Service; authenticated API ping trả `ok`. Upload thật `image/lenovo.png` đã PASS; chi tiết ở phần bên dưới.
- Postman: cửa sổ hiện có tiêu đề `Lab2a Complete - Auth JWT Cloudinary Redis Swagger | Get Started | Postman API Network`. Công cụ UI vẫn lỗi lấy ảnh và chỉ đọc được khung cửa sổ; chưa xác minh nội dung/request của collection. Collection nguồn không có mật khẩu/token thật.
- Swagger: đã Authorize bằng token admin và GET Orders trả 200 qua giao diện. Chưa hoàn thành toàn bộ CRUD qua giao diện; CRUD đã được kiểm tra qua HTTP bằng smoke test.
- Chưa kiểm tra token hết hạn, cache hết hạn sau hơn 300 giây, các lỗi upload ảnh, hay đối chiếu Cloudinary Media Library.
- Chưa chạy lại bộ unit tests trên host; không dùng kết quả mock cũ để khẳng định kết quả lần này.

Mô tả Swagger vẫn có câu cũ `Authentication is a TODO exercise`; hành vi xác thực thực tế đã bật và kiểm chứng qua HTTP.

Lần kiểm tra lại sau khi lưu Cloudinary: `npm run test:live` PASS; sản phẩm thử ID 8 đã soft-delete, đơn thử đã xóa. Chưa upload asset Cloudinary trong lần kiểm tra này.

## Upload Cloudinary thật

- Chạy `npm run test:live` với TEST_IMAGE_PATH trỏ tới `image/lenovo.png` (78.893 bytes): PASS, bao gồm lưu và đọc lại imageUrl qua Product API và vô hiệu hóa Redis cache sau upload.
- Sản phẩm thử ID 9: đã soft-delete sau kiểm thử, vẫn giữ imageUrl trong PostgreSQL; đơn thử đã xóa.
- URL ảnh trả HTTP 200, Content-Type image/webp, kích thước 725 × 515.
- Cloudinary Admin API xác nhận asset `lab2a/products/ajxpdqb358yc4cordlyj` tồn tại; secure_url trùng URL trong database. Chưa đối chiếu bằng giao diện Media Library.
- Ảnh: https://res.cloudinary.com/vynafil2/image/upload/v1790432001/lab2a/products/ajxpdqb358yc4cordlyj.webp
