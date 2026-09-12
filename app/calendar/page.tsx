import BlogApp from "@/components/blog-app";
import { getStoredPosts } from "@/lib/posts-server";
import { getInitialTheme } from "@/lib/theme";

export default async function CalendarPage() {
  return <BlogApp initialView="calendar" initialTheme={await getInitialTheme()} initialPosts={await getStoredPosts()} />;
}
