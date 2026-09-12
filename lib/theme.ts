import { cookies } from "next/headers";

export type ThemePreference = "detective" | "magician";

export async function getInitialTheme(): Promise<ThemePreference> {
  const cookieStore = await cookies();
  return cookieStore.get("east-sea-theme")?.value === "detective" ? "detective" : "magician";
}
