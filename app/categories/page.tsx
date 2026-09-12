import BlogApp from "@/components/blog-app";
import { getInitialTheme } from "@/lib/theme";

export default async function CategoriesPage() {
  return <BlogApp initialView="categories" initialTheme={await getInitialTheme()} />;
}
