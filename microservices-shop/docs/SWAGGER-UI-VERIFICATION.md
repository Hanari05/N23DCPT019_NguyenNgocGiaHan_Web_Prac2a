# Kiểm thử toàn bộ endpoint Swagger UI

Hoàn tất ngày 27/09/2026 (Asia/Bangkok). Thao tác trực tiếp qua giao diện Swagger: mở operation, Try it out, điền dữ liệu, Execute và đọc Server response. Không dùng smoke HTTP thay cho các thao tác UI dưới đây.

## Điều kiện

- Docker Engine và 8 container đang chạy; PostgreSQL/MongoDB kết nối được.
- Swagger Product tại http://localhost:3001/api-docs/ và Order tại http://localhost:3002/api-docs/.
- Admin đã được tạo; lấy accessToken bằng login và nhập riêng token vào Authorize. Token hết hạn sau 15 phút, cần login lại nếu phiên kiểm thử kéo dài.
- Tạo sản phẩm thử có stock trước khi tạo Order. Không dùng ID giả hoặc sản phẩm đã soft-delete.
- Cloudinary đã cấu hình và có mạng; dùng image/lenovo.png để upload thực tế.

## Kết quả: 13/13 operation, 19 trường hợp đạt

| Operation | Kết quả UI |
|---|---|
| GET /api/products | 200; limit=5, search và minPrice; có sản phẩm thử |
| POST /api/products | 401 thiếu token; 422 body sai; 201 tạo với admin |
| GET /api/products/{id} | 200 đúng ID; 404 sau soft-delete |
| PUT /api/products/{id} | 200; giá cập nhật từ 120000 thành 150000 |
| DELETE /api/products/{id} | 200; GET sau đó 404 |
| GET /api/categories | 200; data là danh sách |
| POST /api/products/{id}/image | 200; upload lenovo.png và trả imageUrl HTTPS |
| GET /api/orders | 401 thiếu token; 200 sau Authorize |
| POST /api/orders | 201; quantity=2, tổng tiền 300000 lấy từ giá Product |
| GET /api/orders/customer/{customerId} | 200; danh sách chứa đơn vừa tạo |
| GET /api/orders/{id} | 200 đúng ID; 404 sau xóa |
| PATCH /api/orders/{id}/status | 422 với invalid; 200 với confirmed |
| DELETE /api/orders/{id} | 200; GET sau đó 404 |

## Dữ liệu và bằng chứng

- Sản phẩm thử ID 11 đã soft-delete; đơn thử 6ab7fd6c479b758d66d8334d đã xóa. Không sửa/xóa dữ liệu cũ.
- Giữ asset Cloudinary để đối chiếu: https://res.cloudinary.com/vynafil2/image/upload/v1790436999/lab2a/products/irshqntknx96tqxzxqop.webp
- Kết quả từng trường hợp: swagger-ui-results.json. Ảnh minh chứng: swagger-ui-product-404.png (không có token).
- Đã Logout Authorize trên cả hai trang và xóa file token tạm khỏi máy.

## Phát hiện và giới hạn

- Đã sửa example mặc định ProductInput: dùng name/price/stock/description hợp lệ, bỏ imageUrl và categoryId tùy chọn khỏi mẫu. categoryId có minimum=1; chỉ điền khi có danh mục thực tế.
- Các operation chạy qua server trực tiếp của từng service. Không nhân đôi mọi trường hợp qua Gateway trong lần UI này; Gateway đã có smoke test riêng.
- 13/13 operation không có nghĩa đã bao phủ mọi tổ hợp tham số, mọi mã lỗi và mọi role. Kiểm tra user/admin ownership, cache outage và các lỗi file khác có bằng chứng ở bộ test/báo cáo local trước đó.
- Auth không có trang Swagger riêng trong repo; bốn endpoint Auth đã được kiểm thử qua HTTP trước đó. Phạm vi UI ở đây là tất cả operation của hai Swagger mà đề yêu cầu.
