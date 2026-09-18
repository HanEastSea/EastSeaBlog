import BlogApp from "@/components/blog-app";
import { isBlogOwner } from "@/app/blog-access";
import { getStoredPosts } from "@/lib/posts-server";
import { getInitialTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <BlogApp initialView="home" initialTheme={await getInitialTheme()} initialPosts={await getStoredPosts()} canManage={await isBlogOwner()} />;
}
