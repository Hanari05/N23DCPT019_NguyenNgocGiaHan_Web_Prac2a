# Deploy sau khi chạy local thành công

Chưa có tài khoản cloud/URI của người dùng trong ZIP. Đây là hướng dẫn cấu hình, không phải bằng chứng đã deploy. Chi phí/gói miễn phí phụ thuộc chính sách hiện hành của nhà cung cấp; kiểm tra dashboard trước khi tạo dịch vụ.

## 1. Product Service - triển khai đầu tiên

Đẩy repo lên GitHub. Tạo PostgreSQL riêng (ví dụ Supabase). Lấy DATABASE_URL cho ứng dụng và DIRECT_URL phù hợp chạy migration. Đừng dùng DB có dữ liệu quan trọng để thử migration.

Render Web Service:

| Trường | Giá trị |
|---|---|
| Root Directory | product-service |
| Runtime | Node |
| Build | npm ci && npm run db:generate |
| Start | npm run db:migrate && npm start |
| Health Check | /health |

Env: NODE_ENV=production, DATABASE_URL, DIRECT_URL, ALLOWED_ORIGINS (các origin frontend/Swagger nếu cần). Cấu hình Node 22.x trong môi trường deploy theo lựa chọn runtime của nền tảng. Ứng dụng đọc PORT do host cung cấp, không hardcode 3001 khi deploy.

Mở `https://DOMAIN_PRODUCT/health`, `/api-docs`, `/api/products`. Swagger mặc định server `/` nên dùng đúng host hiện tại. Chạy seed khi cần bằng môi trường có URI đúng; seed không chạy tự động mỗi lần deploy. Migration deploy có thể chạy lúc start cho bài học một instance; nhiều instance cần migration job riêng.

## 2. Order Service

Render Web Service riêng, Root Directory `order-service`, Build `npm ci`, Start `npm start`, health `/health`.
Env: NODE_ENV=production, MONGODB_URI (Atlas với tên DB riêng), PRODUCT_SERVICE_URL=https://DOMAIN_PRODUCT, ALLOWED_ORIGINS.
Atlas cần database user và Network Access cho máy chủ deploy. Sau khi đổi mật khẩu, cập nhật env trên host và deploy lại.

Tạo sản phẩm trước rồi dùng ID thật để tạo đơn. Product Service không hoạt động thì tạo đơn trả 503. GET order vẫn không cần gọi Product.

## 3. Gateway

Service riêng, Root Directory `api-gateway`, Build `npm ci`, Start `npm start`.
Env: PRODUCT_SERVICE_URL, ORDER_SERVICE_URL, ALLOWED_ORIGINS; AUTH_SERVICE_URL chỉ hữu ích sau khi làm bài Auth.
TRUST_PROXY_HOPS phải khớp topology proxy thật; không bật trust proxy vô điều kiện. Kiểm tra rate limit theo IP sau deploy.

Dùng domain Gateway làm base_url Postman. Tài liệu Swagger mở trực tiếp ở domain mỗi service hoặc sửa danh sách servers để thêm Gateway thực tế.

## 4. Kiểm tra

- /health trả 200.
- GET/POST/PUT/DELETE Product; filter, pagination, sort.
- POST Order, PATCH status, GET xác nhận, DELETE.
- Swagger Try it out thành công trên HTTPS.
- Xem dữ liệu trong PostgreSQL/Atlas.
- Lưu domain/ảnh test làm minh chứng (không chụp credentials).

Checklist Lab yêu cầu deploy ít nhất **một service**. Full flow Product–Order–Gateway online cần deploy cả ba. Chưa có Auth nên chỉ dùng dữ liệu giả; hoàn thành xác thực và hạn chế truy cập trực tiếp service trước khi dùng dữ liệu thật.
