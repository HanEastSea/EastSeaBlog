import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { posts } from "@/db/schema";
import { getDb } from "@/db";
import { rowToPost } from "@/lib/posts-server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getChatGPTUser())) return Response.json({ error: "请先登录后再修改文章。" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const updates: Partial<typeof posts.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (typeof body?.pinned === "boolean") updates.pinned = body.pinned;
  if (typeof body?.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body?.excerpt === "string") updates.excerpt = body.excerpt.trim();
  if (typeof body?.category === "string") updates.category = body.category;
  if (body?.type === "生活" || body?.type === "技术") updates.type = body.type;
  if (typeof body?.markdown === "string" && body.markdown.trim()) updates.markdown = body.markdown.trim();
  if (typeof body?.tagsJson === "string") updates.tagsJson = body.tagsJson;
  const [updated] = await getDb().update(posts).set(updates).where(eq(posts.id, id)).returning();
  if (!updated) return Response.json({ error: "文章不存在。" }, { status: 404 });
  return Response.json({ post: rowToPost(updated) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getChatGPTUser())) return Response.json({ error: "请先登录后再删除文章。" }, { status: 401 });
  const { id } = await context.params;
  const deleted = await getDb().delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
  if (!deleted.length) return Response.json({ error: "文章不存在。" }, { status: 404 });
  return Response.json({ ok: true });
}
