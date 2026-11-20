// POST {images:[url...]} -> tạo album, trả về {id}
// GET  ?id=...           -> trả về {images:[...]}
import { put, list } from "@vercel/blob";
import { randomBytes } from "node:crypto";

// Lấy token Blob: mặc định BLOB_READ_WRITE_TOKEN, hoặc bất kỳ biến nào kết thúc bằng _READ_WRITE_TOKEN (khi đặt tiền tố khác lúc tạo Blob)
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const hit = Object.entries(process.env).find(([k, v]) => k.endsWith("_READ_WRITE_TOKEN") && v);
  return hit ? hit[1] : null;
}


const isBlobUrl = u => { try { return new URL(u).hostname.endsWith(".public.blob.vercel-storage.com"); } catch { return false; } };

export default async function handler(req, res) {
  const token = blobToken();
  if (!token) return res.status(500).json({ error: "Chưa cấu hình Blob storage trên Vercel (thiếu biến *_READ_WRITE_TOKEN, hãy Connect Blob vào project rồi Redeploy)" });

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
    const images = Array.isArray(body?.images) ? body.images.filter(isBlobUrl).slice(0, 30) : [];
    const messages = Array.isArray(body?.messages)
      ? body.messages.filter(m => typeof m === "string").map(m => m.trim().slice(0, 200)).filter(Boolean).slice(0, 30)
      : [];
    const cover = typeof body?.cover === "string" && isBlobUrl(body.cover) ? body.cover : null;
    if (!images.length && !messages.length && !cover) return res.status(400).json({ error: "Chưa có ảnh hoặc lời nhắn nào" });
    const id = randomBytes(5).toString("base64url");
    await put(`albums/${id}.json`, JSON.stringify({ images, messages, cover, created: Date.now() }), {
      access: "public", contentType: "application/json", addRandomSuffix: false, token,
    });
    return res.status(200).json({ id });
  }

  if (req.method === "GET") {
    const id = String(req.query.id || "");
    if (!/^[\w-]{4,20}$/.test(id)) return res.status(400).json({ error: "id không hợp lệ" });
    const { blobs } = await list({ prefix: `albums/${id}.json`, limit: 1, token });
    if (!blobs.length) return res.status(404).json({ error: "Không tìm thấy album" });
    const data = await (await fetch(blobs[0].url)).json();
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json({ images: data.images || [], messages: data.messages || [], cover: data.cover || null });
  }

  res.status(405).json({ error: "Method not allowed" });
}
