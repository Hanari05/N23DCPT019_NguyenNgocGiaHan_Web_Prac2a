# Kiểm thử bản mở rộng — 26/09/2026

- `npm test`: **20/20 tests PASS** (Product/cache/upload 8, Order 7, Gateway 1, Auth 4).
- HTTP Express, middleware, JWT signing/verification, bcrypt hash/compare, multipart, Sharp decode và Swagger generation chạy thật.
- Prisma/Mongoose persistence, ioredis và Cloudinary SDK network dùng mock trong unit tests. Không tuyên bố đã chạy migration trên PostgreSQL thật hoặc upload Cloudinary thật ở môi trường soạn bài.
- Prisma Auth client generate và migration SQL được sinh từ schema. Schema Product không đổi. Docker Compose được parse/tĩnh; môi trường soạn bài không có Docker daemon.
- `npm run test:live` được cập nhật cho môi trường Docker của người dùng: admin login, me, rotation/replay, Gateway 401, cache MISS/HIT/invalidation, product/order CRUD và cleanup. Cần user chạy và gửi log, chưa có kết quả live cho bản nâng cấp.
- Test Cloudinary thật là tùy chọn TEST_IMAGE_PATH, mặc định SKIP. Cache TTL thực/Redis outage/Swagger UI cần xác nhận theo EXTERNAL-CHECKLIST.md.

Bộ test Auth dùng mock transaction để kiểm tra luồng consume/replay. Tính nguyên tử thực tế phụ thuộc PostgreSQL transaction/updateMany; kiểm thử đồng thời trên môi trường triển khai vẫn cần nếu mở rộng ngoài lab.
