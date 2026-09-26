# Deploy bản mở rộng (đã chuẩn bị cấu hình, chưa online)

## Product Service trên Render

Đã thêm `render.yaml` tại gốc repository: Product Docker web service, PostgreSQL và Key Value đều khai báo `plan: free`, cùng region Singapore. Cấu hình dùng database cloud riêng, không thay đổi `.env` hoặc volumes Docker local.

- Docker build dùng `microservices-shop/product-service/Dockerfile` và context tương ứng.
- Startup chạy migration, seed idempotent (không xóa dữ liệu), rồi khởi động HTTP trên `PORT=10000`.
- `DATABASE_URL` và `DIRECT_URL` lấy từ PostgreSQL internal connection string; Redis lấy internal connection string của Key Value.
- `JWT_SECRET` do Render sinh riêng. Token từ Auth local sẽ không dùng được với secret cloud này. Khi kiểm thử ghi dữ liệu, dùng token admin ngắn hạn được ký riêng cho môi trường cloud với issuer/audience/claims đúng; không bỏ middleware xác thực. Deploy Auth là bước mở rộng nếu cần đăng nhập online.
- Cloudinary chưa được đưa vào Blueprint. Muốn kiểm thử upload online, cấu hình ba biến Cloudinary bằng Environment dashboard trước khi chạy request; không lưu giá trị vào Git.
- Health check: `/health`; kiểm chứng database qua `/api/products` và `/api/categories`; Swagger: `/api-docs/` và `/api-docs.json`.

Cần đăng nhập Render trong trình duyệt đang điều khiển, đưa source hiện tại lên repository được Render truy cập, rồi tạo Blueprint từ `render.yaml`. Chưa tạo tài nguyên hoặc ghi nhận URL deploy thành công. YAML đã parse được và đường dẫn Dockerfile tồn tại; việc Render chấp nhận cấu hình cần xác minh khi tạo Blueprint.

Render Free Postgres hết hạn sau 30 ngày; free web service có thể ngủ khi không hoạt động. Xem [giới hạn Free](https://render.com/docs/free) và [Blueprint specification](https://render.com/docs/blueprint-spec). Nếu tài khoản yêu cầu nâng cấp trả phí, cần lựa chọn của chủ tài khoản trước khi phát sinh chi phí.

## Cấu hình các service khác

Bản ZIP tập trung hoàn thành 5 bài trên Docker local. Deploy cần cấu hình dịch vụ backend, không dùng GitHub Pages để chạy Express/DB.

- Product: PostgreSQL + DATABASE_URL/DIRECT_URL; build npm ci + npx prisma generate; start migrate deploy rồi node src/index.js; REDIS_URL; JWT_SECRET; Cloudinary 3 biến.
- Auth: PostgreSQL auth_db riêng; build npm ci + npx prisma generate; start migrate deploy rồi node src/index.js; JWT_SECRET và JWT_REFRESH_SECRET khác nhau, >=32 ký tự. Tạo admin bằng script CLI trong môi trường host, không mở HTTP endpoint tạo admin.
- Order: MongoDB URI, PRODUCT_SERVICE_URL truy cập được Product, JWT_SECRET.
- Gateway: PRODUCT_SERVICE_URL, ORDER_SERVICE_URL, AUTH_SERVICE_URL trỏ đúng host/private service; JWT_SECRET giống các service; cấu hình ALLOWED_ORIGINS và trust proxy đúng nhà cung cấp.
- Root directory khi host nối repo: microservices-shop/<tên-service>. Không đưa .env vào image/repo; dùng secret/env dashboard.
- Dùng database cloud hoặc persistent volume, HTTPS, mật khẩu riêng; không dùng localhost trong URL liên service khác host.
- Swagger spec có server '/' cùng host; thêm URL Gateway thật vào servers nếu muốn test qua Gateway. Postman đổi gateway_url (và base_url khi gọi Product trực tiếp) rồi chạy lại kiểm thử.

Không khai báo hoàn thành deploy cho tới khi URL online/health, migrations và API được kiểm chứng.
