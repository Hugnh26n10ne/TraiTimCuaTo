// Dùng chung cho các API: lấy token, ghi/đọc Blob tự thích ứng kho public hay private.
import { put, get } from "@vercel/blob";

// Token Blob thật luôn bắt đầu bằng vercel_blob_rw_, bất kể tên biến môi trường là gì
export function blobToken() {
  const isBlob = v => typeof v === "string" && v.startsWith("vercel_blob_rw_");
  if (isBlob(process.env.BLOB_READ_WRITE_TOKEN)) return process.env.BLOB_READ_WRITE_TOKEN;
  const hit = Object.entries(process.env).find(([k, v]) => k.endsWith("_READ_WRITE_TOKEN") && isBlob(v));
  return hit ? hit[1] : (Object.values(process.env).find(isBlob) || null);
}

let storeAccess = null;   // nhớ lại kho là "public" hay "private" sau lần đầu

// Ghi blob: thử public trước, kho private thì tự chuyển sang private
export async function putAuto(pathname, body, opts = {}) {
  const token = blobToken();
  const order = storeAccess === "private" ? ["private", "public"] : ["public", "private"];
  let lastErr;
  for (const access of order) {
    try {
      const r = await put(pathname, body, { ...opts, access, token });
      storeAccess = access;
      return { ...r, access };
    } catch (e) {
      lastErr = e;
      if (!/private store|public access|access/i.test(String(e && e.message))) throw e;
    }
  }
  throw lastErr;
}

// Link để trình duyệt tải được: public -> link blob trực tiếp; private -> qua /api/file
export function clientUrl(r) {
  return r.access === "public" ? r.url : "/api/file?p=" + encodeURIComponent(r.pathname);
}

// Đọc blob theo pathname, trả về null nếu không có
export async function getAuto(pathname) {
  const token = blobToken();
  const order = storeAccess === "public" ? ["public", "private"] : ["private", "public"];
  let lastErr;
  for (const access of order) {
    try {
      const r = await get(pathname, { access, token, useCache: false });
      if (r && r.statusCode === 200) { storeAccess = access; return r; }
      if (r === null) return null;
    } catch (e) { lastErr = e; }
  }
  if (lastErr) throw lastErr;
  return null;
}

export async function streamToText(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks).toString("utf8");
}

// Link ảnh hợp lệ: link blob công khai của Vercel, hoặc link qua /api/file trỏ vào thư mục photos|covers
export function isOurUrl(u) {
  if (typeof u !== "string") return false;
  if (u.startsWith("/api/file?p=")) {
    try { return /^(photos|covers)\/[\w.-]+$/.test(decodeURIComponent(u.slice(12))); } catch { return false; }
  }
  try { return new URL(u).hostname.endsWith(".blob.vercel-storage.com"); } catch { return false; }
}
