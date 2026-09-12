import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  category: text("category").notNull(),
  type: text("type").notNull().default("生活"),
  date: text("date").notNull(),
  readTime: text("read_time").notNull().default("5 分钟"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  tagsJson: text("tags_json").notNull().default("[]"),
  markdown: text("markdown").notNull().default(""),
  accent: text("accent").notNull().default("sapphire"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const blogSettings = sqliteTable("blog_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
