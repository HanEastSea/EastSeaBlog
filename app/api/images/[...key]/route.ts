import { env } from "cloudflare:workers";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  if (!env.BUCKET) return new Response("图片存储尚未配置。", { status: 503 });
  const { key: segments } = await context.params;
  const key = segments.map((segment) => decodeURIComponent(segment)).join("/");
  const object = await env.BUCKET.get(key);
  if (!object) return new Response("图片不存在。", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
