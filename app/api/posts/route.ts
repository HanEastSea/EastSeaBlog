import { getChatGPTUser } from "@/app/chatgpt-auth";
import { posts } from "@/db/schema";
import { getDb } from "@/db";
import { getStoredPosts, rowToPost } from "@/lib/posts-server";

function makeExcerpt(markdown: string) {
  return markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#>*_`~-]/g, "").replace(/\s+/g, " ").trim().slice(0, 110) || "一条新的现场记录。";
}

function estimateReadTime(markdown: string) {
  const chars = markdown.replace(/\s/g, "").length;
  return `${Math.max(1, Math.ceil(chars / 420))} 分钟`;
}

function slugify(title: string) {
  const readable = title.toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
  return `${readable || "entry"}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET() {
  return Response.json({ posts: await getStoredPosts() });
}

export async function POST(request: Request) {
  if (!(await getChatGPTUser())) return Response.json({ error: "请先登录后再发布文章。" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const markdown = typeof body?.markdown === "string" ? body.markdown.trim() : "";
  if (!title || !markdown) return Response.json({ error: "标题和 Markdown 正文不能为空。" }, { status: 400 });
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string") : [];
  const coverImage = typeof body?.coverImage === "string" && body.coverImage.trim() ? body.coverImage.trim() : null;
  const post = {
    id: `case-${crypto.randomUUID()}`,
    slug: slugify(title),
    title,
    excerpt: typeof body?.excerpt === "string" && body.excerpt.trim() ? body.excerpt.trim() : makeExcerpt(markdown),
    category: typeof body?.category === "string" ? body.category : "日常生活",
    type: body?.type === "技术" ? "技术" : "生活",
    date: new Date().toISOString().slice(0, 10),
    readTime: estimateReadTime(markdown),
    pinned: false,
    tagsJson: JSON.stringify(tags),
    coverImage,
    markdown,
    accent: body?.accent === "crimson" || body?.accent === "silver" ? body.accent : "sapphire",
  };
  const [created] = await getDb().insert(posts).values(post).returning();
  return Response.json({ post: rowToPost(created) }, { status: 201 });
}
