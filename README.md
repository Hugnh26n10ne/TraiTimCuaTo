# HungDam_TraiTim

Trái tim đập 3D của HungDam_TraiTim, có vòng ảnh xoay quanh, thêm ảnh từ điện thoại và tạo mã QR gửi cho người khác.

## Chạy

- **Web (chính):** `index.html`. Mở bằng trình duyệt là chạy, nhưng nút tải ảnh lên server và tạo QR chỉ hoạt động khi deploy lên Vercel.
- **Python:** `python HungDam_TraiTim.py` (cần tkinter). Bản web là port 1:1 thuật toán này.
- **Hiệu ứng khác:** thư mục `effects/` (trái tim hạt bay, 4 kiểu).

## Deploy lên Vercel

1. Push repo lên GitHub, vào https://vercel.com/new và Import repo này. Framework chọn **Other**, giữ nguyên mặc định, bấm Deploy.
2. Trong project trên Vercel vào **Storage**, bấm **Create Database**, chọn **Blob**, đặt tên tuỳ ý, rồi **Connect** vào project. Vercel sẽ tự thêm biến môi trường `BLOB_READ_WRITE_TOKEN`.
3. Vào **Deployments**, bấm **Redeploy** bản mới nhất để API nhận được token.

Sau đó mở link `https://<tên-app>.vercel.app` trên điện thoại:

- **+ Thêm ảnh**: chọn ảnh trong máy, ảnh được thu nhỏ rồi tải lên Blob.
- **Tạo QR**: tạo link riêng dạng `?a=<id>` chứa đúng bộ ảnh vừa tải, hiện mã QR, có nút sao chép và chia sẻ.

## Chỉnh hiệu ứng

Các hằng số ở đầu phần `<script>` trong `index.html`: `HEART_SCALE` (độ to tim), `HEART_COLOR`, `ORBIT_RADIUS`, `ORBIT_SPEED`, `ORBIT_TILT`, `PHOTO_W`/`PHOTO_H`.
Ảnh mặc định nằm trong `images/1.jpg` đến `8.jpg`, thay bằng ảnh của bạn cùng tên là được.
