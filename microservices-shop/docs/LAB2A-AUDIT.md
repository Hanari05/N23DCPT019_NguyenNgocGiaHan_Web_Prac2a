# Đối chiếu Lab2a.pdf với repo hiện tại

## Kết quả cập nhật ngày 27/09/2026

**Mức hoàn thành có bằng chứng: 90/100 theo trọng số bảng chấm trong Lab2a.pdf, tương đương khoảng 90%.** Đây là đánh giá tiến độ, không phải điểm chấm chính thức của giảng viên. Phần còn thiếu có trọng số là deploy ít nhất một service lên host public (10 điểm).

| STT | Tiêu chí trong bảng điểm | Trọng số | Trạng thái hiện tại |
|---|---|---:|---|
| 1 | Product kết nối PostgreSQL | 10 | Đã kiểm chứng |
| 2 | Prisma schema và migration | 10 | Đã kiểm chứng |
| 3 | Product CRUD đầy đủ | 15 | Đã kiểm chứng |
| 4 | Pagination/filtering/sorting | 10 | Đã kiểm chứng |
| 5 | Validation có lỗi chi tiết | 10 | Đã kiểm chứng |
| 6 | Swagger UI hiển thị và test tất cả endpoints | 15 | Đã thử 13/13 operation Product/Order, 19 ca kiểm thử |
| 7 | Order MongoDB và CRUD | 10 | Đã kiểm chứng |
| 8 | Docker Compose toàn hệ thống | 10 | 8 container đang chạy; 7 service có healthcheck đều healthy; 4 HTTP health endpoint trả 200 |
| 9 | Deploy ít nhất 1 service | 10 | Chưa có URL public và bằng chứng API đã deploy |

### Căn cứ và phạm vi kiểm tra

- Lần rà soát hiện tại xác nhận trạng thái Docker, HTTP health của Gateway/Product/Order/Auth và đặc tả Swagger đang phục vụ: 7 operation Product, 6 operation Order.
- Bộ test source sau nâng cấp đã chạy đạt 20/20 (Product 8, Order 7, Gateway 1, Auth 4); không chạy lại bộ test này trong lần rà soát chỉ đọc ngày 27/09. Xem [FIXES-VERIFICATION.md](FIXES-VERIFICATION.md).
- Kiểm thử Swagger UI trước đó đạt 19/19 ca cho 13/13 operation, có Authorize, CRUD, upload ảnh thật, validation và lỗi 401/404. Xem [SWAGGER-UI-VERIFICATION.md](SWAGGER-UI-VERIFICATION.md) và [swagger-ui-results.json](swagger-ui-results.json). Đây không phải kiểm thử mọi tổ hợp đầu vào/quyền qua mọi server.
- Cả 5 bài mở rộng đã triển khai và có kiểm chứng chức năng: Auth/JWT, bảo vệ Gateway, Cloudinary, Redis và Swagger Order. Phụ lục không phân bổ điểm riêng cho 5 bài này nên không cộng thêm vào 100 điểm. Redis đã thử MISS/HIT, invalidation, mất kết nối và khôi phục; chưa chờ trọn 300 giây để đo hết hạn thực tế.
- Những khác biệt trước đây đã sửa: Docker multi-stage cho 4 service, Swagger JSDoc quét routes, alias `/api-docs.json`, mô tả xác thực Order, Auth dev override và cấu trúc/tên Postman. Example Product đã sửa thành dữ liệu hợp lệ, không còn mặc định `imageUrl: "string"` hoặc `categoryId: 0`.

### Việc còn lại

1. Deploy ít nhất một service với database hoạt động, chạy migration cần thiết và lưu URL public cùng bằng chứng API. Đây là 10% còn thiếu trong bảng điểm.
2. Import lại bản cuối `postman/Lab2.postman_collection.json` và xác nhận trong Postman; file đã chuẩn hóa nhưng chưa xác minh lần import cuối bằng UI.
3. Rà soát và commit/push bản nâng cấp để hoàn tất phần nộp bài. Có thay đổi chưa commit; `.env` không được Git theo dõi. Không đưa secrets/token vào repo hoặc workspace Postman public.

Mục 2–3 là việc hoàn thiện minh chứng/nộp bài, không có trọng số riêng trong bảng điểm trên. Không coi frontend hoặc các tính năng production ngoài đề là phần còn thiếu của lab.

---

## Lưu trữ kết quả audit ban đầu — không phải trạng thái hiện tại

Các nhận xét và con số 75/100 dưới đây được giữ làm lịch sử tại thời điểm trước các bản sửa và kiểm thử Swagger đầy đủ. Khi có khác biệt, dùng bảng cập nhật ngày 27/09/2026 ở trên.

Ngày kiểm tra: 26/09/2026. Đề: `C:/Users/DELL/Downloads/Lab2a.pdf`, 22 trang.
Phạm vi chính: `N23DCPT019_NguyenNgocGiaHan_Web_Prac2a/microservices-shop`. Thư mục `Lab2a-Complete-5-Exercises` là bản nguồn nâng cấp, không phải checkout đang chạy Docker.

## Kết luận

Backend local đã hoàn thành phần chức năng chính và có triển khai cả 5 bài mở rộng. Chưa đủ căn cứ gọi toàn bộ lab hoàn thành 100%: chưa deploy ít nhất một service; chưa kiểm thử tất cả endpoint bằng Swagger UI; cấu trúc Postman và một số kỹ thuật triển khai khác mẫu đề. Bản nâng cấp có nhiều thay đổi chưa commit, nên chưa thể xem trạng thái thư mục là bằng chứng đã nộp lên GitHub.

## Đối chiếu toàn bộ các phần

| Phần đề | Trang | Kết quả | Bằng chứng / giới hạn |
|---|---|---|---|
| I–II: mục tiêu, kiến trúc và cấu trúc | 1–2 | Đạt kiến trúc local | Gateway 3000, Product 3001, Order 3002, Auth 3003; PostgreSQL riêng Product/Auth, MongoDB Order; giao tiếp HTTP. Tách app.js/index.js và controller/routes/middleware. Chưa có giỏ hàng riêng; giỏ hàng chỉ được nêu trong bảng kiến trúc, không có endpoint hay mục điểm riêng trong đề. |
| III: môi trường | 2–3 | Đủ cho local | Node host 24, image Node 22; Docker, VS Code, Postman có sẵn. Chưa xác minh Supabase/Atlas/Railway; database đang dùng Docker. DBeaver và extensions là tùy chọn/khuyến nghị. |
| IV.1–4: Product, schema, migration, seed | 3–5 | Đạt | Category/Product, Decimal(10,2), quan hệ, indexes, timestamps, slug unique; có migration/seed. `prisma migrate status` báo schema up to date; 4 sản phẩm active phù hợp dữ liệu seed. Không chạy seed lại hoặc reset dữ liệu. |
| IV.5: Product CRUD và query | 5–7 | Đạt | GET list/detail, POST, PUT, DELETE mềm; phân trang, search, category, khoảng giá, inStock, sort. Test HTTP có DB thật và bộ test đều đạt. |
| IV.6: validation/error handling | 7–8 | Đạt | express-validator; 422 có errors chi tiết; 404/409/500 và xử lý FK, JSON sai. Không trả lỗi database thô. |
| V: Swagger Product | 8–12 | Đạt chức năng tài liệu; khác kỹ thuật mẫu | OpenAPI 3.0 + Swagger UI; 7 operation gồm upload/categories. Dùng openapi.json trực tiếp, không cài swagger-jsdoc ở Product và không có annotation JSDoc ở routes. JSON export là /openapi.json thay /api-docs.json. Chưa bấm thử tất cả endpoint trong UI. |
| VI: Order | 12–14 | Đạt | Mongoose schema, items, tổng tiền, status, address, note, timestamps, indexes, totalItems; CRUD và lọc customer/status. Mã đơn dùng UUID thay count+1. Giá/tên lấy từ Product, customerId lấy JWT; chặt chẽ hơn code mẫu lấy dữ liệu client. |
| VII: Docker | 14–16 | Đạt chạy hệ thống; khác kỹ thuật mẫu | Có Dockerfile cho 4 service, Compose, volumes, healthcheck, dev override. 8 container đã chạy. Dockerfile dùng single-stage Node 22 Debian slim, chưa dùng multi-stage như mục 7.1. Dùng default Compose network thay named microservices-net. Dev override chưa có Auth hot reload. |
| VIII: deploy | 16–18 | Chưa hoàn thành | Chỉ có docs/DEPLOY.md; chưa có URL public/health và bằng chứng API online. Docker local hoặc ảnh Cloudinary online không thay cho deploy backend. Railway và Render là hai lựa chọn thay thế; chỉ cần ít nhất một service theo bảng điểm. |
| IX: Gateway | 18–19 | Đạt | Proxy Product/Order/Auth/categories, bảo toàn path/query/body; Helmet, CORS, rate limit 100/15 phút, health, lỗi proxy 503, JWT. Test proxy đạt. |
| X: kiểm thử và Postman | 19–20 | Phần lớn đạt; còn khác mẫu và thiếu bằng chứng UI | Có collection JSON, Auth/Core flow/Cloudinary/Redis và smoke. Collection dùng base_url=Gateway, không có gateway_url; không tách Products và Orders thành hai folder; tên/file khác `Lab2 Microservices` và `Lab2.postman_collection.json`. UI Postman có tiêu đề collection mới nhưng công cụ không đọc/chụp được nội dung. |
| XI.1: Auth JWT | 20 | Đạt triển khai + kiểm thử | Register bcrypt, login, refresh, me; Prisma PostgreSQL. Access 15 phút, refresh 7 ngày; rotation/hash/revoke; tests xác nhận token sai/hết hạn và replay. |
| XI.2: JWT Gateway | 20–21 | Đạt | Orders được bảo vệ, ghi Product yêu cầu admin; 401/403 và quyền sở hữu đơn đã kiểm tra thật. Service trực tiếp cũng kiểm tra JWT. |
| XI.3: Cloudinary | 21 | Đạt chức năng; khác dependency mẫu | Endpoint POST /api/products/:id/image, lưu imageUrl. Upload lenovo.png thật thành công; GET URL HTTP 200; Cloudinary Admin API xác nhận asset. Dùng multer + Sharp + Cloudinary SDK, không dùng multer-storage-cloudinary như danh sách cài của đề. |
| XI.4: Redis | 21 | Đạt triển khai + kiểm thử chính | redis:7-alpine, ioredis, TTL 300, query key, invalidation sau POST/PUT/DELETE/upload bằng revision. MISS/HIT, invalidation PUT/upload, outage BYPASS/reconnect đã thử thật; TTL và race/invalidation được kiểm tra trong unit test. Chưa chờ trọn 300 giây đo hết hạn thực tế. |
| XI.5: Swagger Order | 21 | Đạt cấu trúc tài liệu; cần hoàn thiện minh chứng | Có swagger-jsdoc, schemas/parameters/responses cho 6 operation và bearerAuth. swagger-jsdoc nhận definition JSON với apis:[], không quét annotations. Authorize + GET Orders qua UI đã trả 200; chưa chạy toàn bộ CRUD trong UI. |

## Bảng điểm phụ lục: trạng thái, không phải điểm chấm chính thức

| STT | Tiêu chí | Trọng số | Đánh giá |
|---|---|---:|---|
| 1 | Product kết nối PostgreSQL | 10 | Có bằng chứng đạt |
| 2 | Prisma schema và migration | 10 | Có bằng chứng đạt |
| 3 | Product CRUD đầy đủ | 15 | Có bằng chứng đạt |
| 4 | Pagination/filtering/sorting | 10 | Có bằng chứng đạt |
| 5 | Validation có lỗi chi tiết | 10 | Có bằng chứng đạt |
| 6 | Swagger UI hiển thị và test tất cả endpoints | 15 | Có tài liệu đầy đủ; chưa xác minh tất cả thao tác UI |
| 7 | Order MongoDB và CRUD | 10 | Có bằng chứng đạt |
| 8 | Docker Compose toàn hệ thống | 10 | Có bằng chứng đạt |
| 9 | Deploy ít nhất 1 service | 10 | Chưa đạt |

Các nhóm đã có bằng chứng đầy đủ tương ứng 75/100 điểm trọng số; 15 điểm Swagger cần hoàn tất xác minh, 10 điểm deploy còn thiếu. Đây không phải khẳng định được chấm 75 điểm: giảng viên có thể đánh giá khác về độ bám sát mẫu hoặc minh chứng. Năm bài mở rộng không có thang điểm riêng trong phụ lục.

## Kiểm chứng trong lần audit này

- Chạy source/test hiện tại bằng bind mount chỉ đọc trong container tạm, network none: Product 8/8, Order 7/7, Gateway 1/1, Auth 4/4; tổng 20/20 PASS. Persistence và Cloudinary/Redis network dùng mock trong bộ test này.
- API thật chỉ đọc: search=iphone&minPrice=20000000 (1 kết quả), category=mobile (2), inStock=true (3), inStock=false (1), khoảng giá 0–1.000.000 (2); đối chiếu chính xác với tập 4 sản phẩm active. Sort giá giảm dần, phân trang trang 1/2 và ID không tồn tại 404 đều PASS.
- Swagger UI và /openapi.json của Product/Order trả HTTP 200; route/spec bao phủ 7 operation Product và 6 operation Order.
- Product migration đã cập nhật đủ. Các smoke/ownership/Cloudinary thật từ các bước trước được ghi trong LOCAL-VERIFICATION.md; không upload ảnh hoặc tạo đơn mới trong audit này.

## Việc còn lại theo thứ tự

1. Deploy ít nhất Product Service với PostgreSQL cloud, migration và URL public kiểm chứng được. Nếu kiểm tra API ghi trên host phải cung cấp JWT hợp lệ; Auth/Gateway/Order tiếp tục deploy là phạm vi rộng hơn mức tối thiểu của phụ lục.
2. Chạy và lưu minh chứng Swagger cho từng endpoint Product/Order, gồm Authorize, validation, CRUD và lỗi thiếu token. Không chụp token/secret.
3. Sửa câu mô tả cũ `Authentication is a TODO exercise` trong Order OpenAPI; backend đã bật xác thực.
4. Nếu yêu cầu bám sát từng bước mẫu: chuyển Product Swagger sang swagger-jsdoc/annotations, bổ sung alias /api-docs.json; dùng Docker multi-stage; chuẩn hóa Postman tên/file/folder và gateway_url. Đây là khác biệt triển khai, không đồng nghĩa API hiện tại hỏng.
5. Kiểm tra và commit source/docs/migrations/collection của bản nâng cấp, loại trừ .env/secrets; chưa push hoặc commit thay người dùng trong lần audit.

Không coi các chức năng production ngoài phạm vi đề (thanh toán, trừ/giữ kho, distributed transaction, logout toàn cục) là lý do trừ điểm lab. Frontend không phải yêu cầu của Lab2a.

