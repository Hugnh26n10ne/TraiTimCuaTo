// POST {images:[url...], messages:[...], cover:url} -> tạo album, trả về {id}
// GET  ?id=...                                        -> trả về {images, messages, cover}
import { randomBytes } from "node:crypto";
import { blobToken, putAuto, getAuto, streamToText, isOurUrl } from "./_lib/blob.js";

async function handle(req, res) {
  if (!blobToken()) return res.status(500).json({ error: "Chưa cấu hình Blob storage trên Vercel (hãy Connect Blob vào project rồi Redeploy)" });

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
    const images = Array.isArray(body?.images) ? body.images.filter(isOurUrl).slice(0, 30) : [];
    const messages = Array.isArray(body?.messages)
      ? body.messages.filter(m => typeof m === "string").map(m => m.trim().slice(0, 200)).filter(Boolean).slice(0, 30)
      : [];
    const cover = isOurUrl(body?.cover) ? body.cover : null;
    const sound = body?.sound !== false;
    if (!images.length && !messages.length && !cover) return res.status(400).json({ error: "Chưa có ảnh hoặc lời nhắn nào" });
    const id = randomBytes(5).toString("base64url");
    await putAuto(`albums/${id}.json`, JSON.stringify({ images, messages, cover, sound, created: Date.now() }), {
      contentType: "application/json", addRandomSuffix: false,
    });
    return res.status(200).json({ id });
  }

  if (req.method === "GET") {
    const id = String(req.query.id || "");
    if (!/^[\w-]{4,20}$/.test(id)) return res.status(400).json({ error: "id không hợp lệ" });
    const r = await getAuto(`albums/${id}.json`);
    if (!r) return res.status(404).json({ error: "Không tìm thấy album" });
    const data = JSON.parse(await streamToText(r.stream));
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json({ images: data.images || [], messages: data.messages || [], cover: data.cover || null, sound: data.sound !== false });
  }

  res.status(405).json({ error: "Method not allowed" });
}

export default async function handler(req, res) {
  try { await handle(req, res); }
  catch (e) { console.error(e); res.status(500).json({ error: "Lỗi server: " + (e && e.message ? e.message : String(e)) }); }
}
