# Mục XI — 5 bài đã triển khai

| Bài | File chính | Hành vi |
|---|---|---|
| 1 Auth | auth-service/src/app.js, tokens.js, prisma/schema.prisma | bcrypt, JWT 15m, refresh 7d, rotation trong transaction, me |
| 2 Gateway JWT | api-gateway/src/middleware/auth.js, src/app.js; auth middleware ở Product/Order | xác thực, admin Product writes, owner Orders |
| 3 Cloudinary | product-service/src/controllers/imageController.js | Multer + Sharp validate ảnh rồi upload_stream, lưu imageUrl |
| 4 Redis | product-service/src/middleware/cache.js, controllers/productController.js | cache 300s, key chuẩn hóa, revision invalidation, fallback |
| 5 Swagger | order-service/src/swagger/openapi.json, index.js | swagger-jsdoc, đầy đủ routes + Bearer, 401/403 |

Xem README.md để học luồng; UPGRADE.md để nâng cấp; EXTERNAL-CHECKLIST.md để test thực tế. Cloudinary dùng SDK trực tiếp thay adapter để kiểm tra bytes trước khi upload. Redis dùng ioredis theo gợi ý đề. Swagger giữ định nghĩa OpenAPI có cấu trúc trong JSON và dùng swagger-jsdoc để compile, tránh lặp schema trong annotation.
