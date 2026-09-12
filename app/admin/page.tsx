import BlogApp from "@/components/blog-app";
import { getInitialTheme } from "@/lib/theme";

export default async function AdminPage() {
  return <BlogApp initialView="admin" initialTheme={await getInitialTheme()} />;
}
