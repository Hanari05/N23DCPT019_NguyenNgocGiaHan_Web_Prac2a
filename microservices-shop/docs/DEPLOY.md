# Triển khai Product Service trên Render

## 1. Phạm vi

Product Service đã triển khai thành công trên Render, sử dụng PostgreSQL và Key Value riêng trên cloud. Ảnh minh chứng ngày **27/09/2026** ghi nhận service **Live** tại commit `c73860d` và các request GET online trả dữ liệu.

| Thành phần | Tài nguyên |
|---|---|
| Product Service | `hanari05-lab2a-product` |
| PostgreSQL | `hanari05-lab2a-products-db` |
| Cache | `hanari05-lab2a-cache` |
| Region | Singapore |
| Blueprint | `render.yaml` tại gốc repository |

Auth, Order và Gateway chạy local, chưa triển khai online. Database Render độc lập với các volume Docker local.

## 2. Đường dẫn

- API: https://hanari05-lab2a-product.onrender.com/api/products
- Swagger UI: https://hanari05-lab2a-product.onrender.com/api-docs/
- Health: https://hanari05-lab2a-product.onrender.com/health
- Danh mục: https://hanari05-lab2a-product.onrender.com/api/categories
- OpenAPI JSON: https://hanari05-lab2a-product.onrender.com/api-docs.json

## 3. Cấu hình triển khai

Render build từ `microservices-shop/product-service/Dockerfile`, với build context là `microservices-shop/product-service`.

Lệnh khởi động trong Dockerfile:

```dockerfile
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && exec node src/index.js"]
```

Không đặt lệnh ghi đè `dockerCommand` trong Blueprint. Trường Docker Command trên Render cần để trống để sử dụng CMD này. Service chạy migration, nạp seed rồi khởi động Node.js; lỗi ở bước trước sẽ dừng chuỗi lệnh.

| Biến môi trường | Nguồn cấu hình |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | Internal connection string PostgreSQL Render |
| `DIRECT_URL` | Internal connection string PostgreSQL Render |
| `REDIS_URL` | Internal connection string Key Value |
| `JWT_SECRET` | Render sinh riêng bằng `generateValue` |

Cloudinary không được cấu hình trong Blueprint hiện tại. Nếu cần upload online, bổ sung `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` trong Environment của Product Service, sau đó triển khai lại. Không đưa secret vào Git.

## 4. Tạo triển khai từ repository

1. Đăng nhập Render, chọn **New → Blueprint** và kết nối GitHub.
2. Chọn repository của bài, branch `main`, Blueprint Path `render.yaml`.
3. Kiểm tra Product, PostgreSQL và Key Value cùng region và đúng plan dự kiến.
4. Chọn **Deploy Blueprint**, theo dõi log build và startup.
5. Khi service Live, kiểm tra API có đọc được dữ liệu; không chỉ dựa vào health endpoint.

Khi cập nhật code, push lên branch đã liên kết. Nếu chưa triển khai tự động, dùng Manual sync cho Blueprint và Manual Deploy cho service. Không tạo Blueprint mới chỉ để cập nhật phiên bản.

## 5. Kiểm tra sau triển khai

| Request | Kết quả mong đợi |
|---|---|
| `GET /health` | 200 |
| `GET /api/products` | 200, `success: true`, danh sách và pagination |
| `GET /api/products?page=1&limit=2&sortBy=price&order=asc` | 200, tối đa 2 sản phẩm, giá tăng dần |
| `GET /api/products/2` | 200 nếu sản phẩm ID 2 còn hoạt động |
| `GET /api/categories` | 200, danh sách danh mục |
| Mở `/api-docs/` | Swagger hiển thị và gọi API cùng host |

Kết quả thực tế đã ghi nhận được tổng hợp trong [VERIFICATION.md](VERIFICATION.md). Bảng trên là hướng dẫn kiểm tra, không có nghĩa mọi dòng đều đã được chụp minh chứng.

## 6. Postman cho môi trường cloud

1. Tạo environment tên **Lab2a Render**.
2. Thêm `base_url` = `https://hanari05-lab2a-product.onrender.com`.
3. Chọn environment này, gửi `GET {{base_url}}/api/products`.
4. Export environment thành `Render.postman_environment.json`, lưu trong `microservices-shop/postman/`.
5. Kiểm tra file export có URL đúng và không chứa token hoặc mật khẩu trước khi commit.

Environment này dùng cho Product online. `gateway_url` vẫn thuộc môi trường local; không chạy toàn bộ Core flow cloud khi các service còn lại chưa deploy.

POST/PUT/DELETE Product yêu cầu admin token. JWT secret cloud được sinh riêng nên token Auth local không hợp lệ trên cloud. Không tắt xác thực để kiểm thử. Nếu mở rộng đăng nhập online, cần triển khai Auth và cấu hình JWT tương thích giữa các service.

## 7. Lưu ý vận hành

- Free web service có thể ngủ khi không hoạt động, khiến request đầu chậm.
- Theo chính sách Render được kiểm tra ngày 27/09/2026, PostgreSQL Free hết hạn sau 30 ngày. Kiểm tra ngày hết hạn trong Dashboard trước khi nộp/chấm; lưu bản sao dữ liệu cần giữ.
- Seed chạy khi container khởi động; dữ liệu demo không thay thế dữ liệu local.
- Trạng thái Live và GET thành công không chứng minh mọi thao tác ghi hoặc tích hợp mở rộng đã được kiểm thử trên cloud.

Tham khảo: [Render Blueprints](https://render.com/docs/infrastructure-as-code), [Docker on Render](https://render.com/docs/docker), [giới hạn Free](https://render.com/docs/free).
