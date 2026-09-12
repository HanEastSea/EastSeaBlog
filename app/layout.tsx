import type { Metadata } from "next";
import { getInitialTheme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "东海档案馆 · East Sea Archive",
  description: "记录日常生活、技术文章，以及那些尚未结案的想法。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialTheme = await getInitialTheme();
  return <html lang="zh-CN" data-theme={initialTheme}><body>{children}</body></html>;
}
