// Nhận 1 ảnh (body là dữ liệu ảnh thô, Content-Type: application/octet-stream, loại ảnh thật ở ?type=)
// rồi lưu vào Vercel Blob, trả về link công khai.
import { put } from "@vercel/blob";

// Lấy token Blob: mặc định BLOB_READ_WRITE_TOKEN, hoặc bất kỳ biến nào kết thúc bằng _READ_WRITE_TOKEN (khi đặt tiền tố khác lúc tạo Blob)
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const hit = Object.entries(process.env).find(([k, v]) => k.endsWith("_READ_WRITE_TOKEN") && v);
  return hit ? hit[1] : null;
}


async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;          // runtime Vercel đã đọc sẵn
  if (typeof req.body === "string") return Buffer.from(req.body, "binary");
  const chunks = [];
  for await (const c of req) chunks.push(c);               // chạy local / chưa parse
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const token = blobToken();
  if (!token) return res.status(500).json({ error: "Chưa cấu hình Blob storage trên Vercel (thiếu biến *_READ_WRITE_TOKEN, hãy Connect Blob vào project rồi Redeploy)" });
  const type = String(req.query.type || "image/jpeg");
  if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) return res.status(400).json({ error: "Chỉ nhận ảnh" });
  const body = await readBody(req);
  if (!body.length) return res.status(400).json({ error: "Ảnh rỗng" });
  if (body.length > 4 * 1024 * 1024) return res.status(413).json({ error: "Ảnh quá lớn" });
  const name = String(req.query.name || "photo.jpg").replace(/[^\w.-]/g, "_").slice(0, 60);
  const blob = await put(`photos/${name}`, body, { access: "public", contentType: type, addRandomSuffix: true, token });
  res.status(200).json({ url: blob.url });
}
