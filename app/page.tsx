import BlogApp from "@/components/blog-app";
import { getStoredPosts } from "@/lib/posts-server";
import { getInitialTheme } from "@/lib/theme";

export default async function Home() {
  return <BlogApp initialView="home" initialTheme={await getInitialTheme()} initialPosts={await getStoredPosts()} />;
}
