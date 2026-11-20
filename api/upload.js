// Nhận 1 ảnh (body là dữ liệu ảnh thô, Content-Type: application/octet-stream, loại ảnh thật ở ?type=)
// rồi lưu vào Vercel Blob, trả về link mà trình duyệt tải được.
import { blobToken, putAuto, clientUrl } from "./_lib/blob.js";

async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;          // runtime Vercel đã đọc sẵn
  if (typeof req.body === "string") return Buffer.from(req.body, "binary");
  const chunks = [];
  for await (const c of req) chunks.push(c);               // chạy local / chưa parse
  return Buffer.concat(chunks);
}

async function handle(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!blobToken()) return res.status(500).json({ error: "Chưa cấu hình Blob storage trên Vercel (hãy Connect Blob vào project rồi Redeploy)" });
  const type = String(req.query.type || "image/jpeg");
  if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) return res.status(400).json({ error: "Chỉ nhận ảnh" });
  const body = await readBody(req);
  if (!body.length) return res.status(400).json({ error: "Ảnh rỗng" });
  if (body.length > 4 * 1024 * 1024) return res.status(413).json({ error: "Ảnh quá lớn" });
  const name = String(req.query.name || "photo.jpg").replace(/[^\w.-]/g, "_").slice(0, 60);
  const folder = req.query.kind === "cover" ? "covers" : "photos";
  const r = await putAuto(`${folder}/${name}`, body, { contentType: type, addRandomSuffix: true });
  res.status(200).json({ url: clientUrl(r) });
}

export default async function handler(req, res) {
  try { await handle(req, res); }
  catch (e) { console.error(e); res.status(500).json({ error: "Lỗi server: " + (e && e.message ? e.message : String(e)) }); }
}
