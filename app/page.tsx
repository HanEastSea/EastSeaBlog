import BlogApp from "@/components/blog-app";
import { getInitialTheme } from "@/lib/theme";

export default async function Home() {
  return <BlogApp initialView="home" initialTheme={await getInitialTheme()} />;
}
