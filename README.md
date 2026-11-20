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

- **Ảnh nền**: ảnh chàng trai áo đen, khung cổ đến ngực. Sau lời nhắn, ảnh hiện dần, zoom chậm vào vị trí tim, quầng đỏ lóe lên rồi trái tim đập lớn dần từ đúng điểm đó tới cỡ mặc định. Chọn bằng nút Ảnh nền, hoặc đặt file `cover.jpg` cạnh `index.html`. Vị trí tim trên ảnh chỉnh bằng `COVER_FOCUS_X`, `COVER_FOCUS_Y` (tỉ lệ 0..1). Không có ảnh nền thì bỏ qua pha này.
- **Lời nhắn**: mỗi dòng một câu. Khi mở trang, các câu lần lượt hiện dần, giữ 1 giây rồi mờ đi; hết chữ thì trái tim lớn dần từ bé xíu rồi bắt đầu đập, ảnh hiện ra sau đó.
- **+ Thêm ảnh**: chọn ảnh trong máy, ảnh được thu nhỏ rồi tải lên Blob.
- **Tạo QR**: tạo link riêng dạng `?a=<id>` chứa lời nhắn và bộ ảnh vừa tải, hiện mã QR, có nút sao chép và chia sẻ. Người mở link QR chỉ xem, không thấy các nút.

## Chỉnh hiệu ứng

Các hằng số ở đầu phần `<script>` trong `index.html`: `HEART_SCALE` (độ to tim), `HEART_COLOR`, `ORBIT_RADIUS`, `ORBIT_SPEED`, `ORBIT_TILT`, `PHOTO_W`/`PHOTO_H`.
Lúc mở trang chỉ có trái tim, thẻ ảnh chỉ xuất hiện khi bạn bấm Thêm ảnh hoặc mở link QR có ảnh.
