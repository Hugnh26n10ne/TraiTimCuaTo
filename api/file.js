// Phục vụ file trong kho Blob private: GET /api/file?p=photos/abc.jpg
import { Readable } from "node:stream";
import { blobToken, getAuto } from "./_lib/blob.js";

async function handle(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!blobToken()) return res.status(500).json({ error: "Chưa cấu hình Blob storage trên Vercel" });
  const p = String(req.query.p || "");
  if (!/^(photos|covers)\/[\w.-]+$/.test(p)) return res.status(400).json({ error: "Đường dẫn không hợp lệ" });
  const r = await getAuto(p);
  if (!r) return res.status(404).json({ error: "Không tìm thấy file" });
  res.setHeader("Content-Type", r.blob?.contentType || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200);
  Readable.fromWeb(r.stream).pipe(res);
}

export default async function handler(req, res) {
  try { await handle(req, res); }
  catch (e) { console.error(e); if (!res.headersSent) res.status(500).json({ error: "Lỗi server: " + (e && e.message ? e.message : String(e)) }); }
}
