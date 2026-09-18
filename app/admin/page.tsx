import BlogApp from "@/components/blog-app";
import { isBlogOwner } from "@/app/blog-access";
import { getStoredPosts } from "@/lib/posts-server";
import { getInitialTheme } from "@/lib/theme";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isBlogOwner())) redirect("/");
  return <BlogApp initialView="admin" initialTheme={await getInitialTheme()} initialPosts={await getStoredPosts()} canManage />;
}
