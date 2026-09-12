import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getChatGPTUser())) return Response.json({ error: "请先登录后再上传图片。" }, { status: 401 });
  if (!env.BUCKET) return Response.json({ error: "图片存储尚未配置，请稍后再试。" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "没有收到图片文件。" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return Response.json({ error: "仅支持 JPG、PNG、WEBP 或 GIF 图片。" }, { status: 400 });
  if (file.size > maxBytes) return Response.json({ error: "图片大小不能超过 8MB。" }, { status: 400 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80) || "image";
  const key = `posts/${crypto.randomUUID()}-${safeName}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
  return Response.json({ key, url: `/api/images/${key.split("/").map(encodeURIComponent).join("/")}` });
}
