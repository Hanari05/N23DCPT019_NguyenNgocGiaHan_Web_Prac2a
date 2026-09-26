# Nâng cấp bản đang chạy của Hân — giữ dữ liệu cũ

Theo ảnh đã đối chiếu, Compose project đang chạy tên **n23dcpt019_nguyenngocgiahan_web_prac2a**, dùng compose ở thư mục gốc. Bản ZIP mới đặt code chuẩn trong **microservices-shop/** giống cấu trúc repo GitHub. Các lệnh dưới đây chuyển sang compose mới nhưng giữ nguyên project name để dùng lại postgres_data và mongo_data.

1. Giải nén ZIP vào một thư mục tạm. Copy nội dung thư mục microservices-shop trong ZIP vào microservices-shop trong repo, ghi đè source/config/package-lock. Không xóa .env, không copy node_modules (ZIP không chứa chúng).
2. Tại thư mục GỐC repo đang có .env của Docker cũ, sao lưu .env con nếu đã có, rồi copy .env Docker đang chạy sang thư mục con:

```powershell
if (Test-Path microservices-shop/.env) { Copy-Item microservices-shop/.env microservices-shop/.env.backup }
Copy-Item .env microservices-shop/.env
cd microservices-shop
npm run setup
```

Nếu .env Docker cũ ở vị trí khác, lấy đúng file mà compose cũ sử dụng. Giữ nguyên POSTGRES_USER/PASSWORD/DB và MONGO_USER/PASSWORD đang hoạt động. Không tự đổi mật khẩu các DB đã có volume chỉ bằng sửa .env. `setup` bổ sung JWT/admin secrets ngẫu nhiên vào .env con, không sửa DB credentials.

3. Mở .env con, điền 3 biến Cloudinary nếu đã có tài khoản. Không chụp hoặc gửi secret cho ai. Chạy compose mới với ĐÚNG project name cũ:

```powershell
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a up -d --build
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a ps
```

Có 8 container. Auth migration tự chạy khi startup. Không dùng `down -v`, `docker volume prune` hoặc đổi project name vì sẽ mất/không nhìn thấy dữ liệu cũ. Không cần seed lại Product đã có 4 bản ghi. Không dùng compose cũ ở thư mục cha để quản lý bản nâng cấp nữa.

4. Tạo admin từ ADMIN_EMAIL/ADMIN_PASSWORD trong .env con:

```powershell
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a exec auth-service npm run admin
npm run test:live
```

Smoke dùng Node >=22, không cần cài các dependencies service khi chỉ chạy test:live vì các API chạy trong Docker. Muốn npm test thì chạy npm run install:all trước.

5. Import postman/Lab2.postman_collection.json. Điền adminEmail/adminPassword local từ .env con → chạy Login admin → Me → các request khác. Request cũ không có token nay trả 401 là đúng. User thường ghi Product trả 403 là đúng.

6. Để tránh hai collection trùng, xóa file **microservices-shop/postman/Lab2a.postman_collection.json** cũ trong repo (bản hiện tại dùng Lab2.postman_collection.json). Cập nhật README gốc bằng README đi kèm ZIP. Commit source, docs, package-lock, .env.example; không commit .env/token/password.

## Cập nhật Cloudinary sau khi đã chạy

Sửa .env con rồi chạy (trong microservices-shop):

```powershell
docker compose -p n23dcpt019_nguyenngocgiahan_web_prac2a up -d --force-recreate product-service
```

Chỉ restart container không nạp lại environment mới. Kiểm tra docs/EXTERNAL-CHECKLIST.md theo thứ tự 1–5.
