import BlogApp from "@/components/blog-app";
import { getInitialTheme } from "@/lib/theme";

export default async function BlogPage() {
  return <BlogApp initialView="blog" initialTheme={await getInitialTheme()} />;
}
