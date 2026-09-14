import { desc, eq } from "drizzle-orm";
import { blogSettings, posts } from "@/db/schema";
import { getDb } from "@/db";
import { BlogPost, blogPosts } from "@/lib/blog-data";

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export function rowToPost(row: typeof posts.$inferSelect): BlogPost {
  const markdown = row.markdown || "";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    type: row.type === "技术" ? "技术" : "生活",
    date: row.date,
    readTime: row.readTime,
    pinned: Boolean(row.pinned),
    tags: parseTags(row.tagsJson),
    coverImage: row.coverImage || null,
    markdown,
    content: markdown.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean),
    accent: row.accent === "crimson" || row.accent === "silver" ? row.accent : "sapphire",
  };
}

function postToInsert(post: BlogPost) {
  const markdown = post.markdown ?? post.content.join("\n\n");
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    type: post.type,
    date: post.date,
    readTime: post.readTime,
    pinned: Boolean(post.pinned),
    tagsJson: JSON.stringify(post.tags),
    coverImage: post.coverImage ?? null,
    markdown,
    accent: post.accent,
  };
}

async function seedDemoPosts() {
  const db = getDb();
  const seeded = await db.select().from(blogSettings).where(eq(blogSettings.key, "demo_seeded")).limit(1);
  if (seeded.length) return;
  const existing = await db.select({ id: posts.id }).from(posts).limit(1);
  if (!existing.length) await db.insert(posts).values(blogPosts.map(postToInsert));
  await db.insert(blogSettings).values({ key: "demo_seeded", value: new Date().toISOString() });
}

export async function getStoredPosts() {
  try {
    await seedDemoPosts();
    const rows = await getDb().select().from(posts).orderBy(desc(posts.pinned), desc(posts.date));
    return rows.map(rowToPost);
  } catch (error) {
    console.error("Unable to load posts from D1", error);
    return blogPosts;
  }
}
