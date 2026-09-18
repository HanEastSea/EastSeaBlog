import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";

type BlogRuntimeEnv = {
  BLOG_OWNER_USER_ID?: string;
  BLOG_OWNER_EMAIL?: string;
};

const runtimeEnv = env as unknown as BlogRuntimeEnv;

export async function getBlogAccess(): Promise<{
  user: ChatGPTUser | null;
  isOwner: boolean;
}> {
  const user = await getChatGPTUser();
  if (!user) return { user: null, isOwner: false };

  const ownerUserId = runtimeEnv.BLOG_OWNER_USER_ID?.trim();
  const ownerEmail = runtimeEnv.BLOG_OWNER_EMAIL?.trim().toLowerCase();
  const isConfiguredOwner = Boolean(
    (ownerUserId && user.userId === ownerUserId) ||
      (ownerEmail && user.email.toLowerCase() === ownerEmail),
  );

  // The Sites local preview injects this deterministic identity. Production
  // uses BLOG_OWNER_USER_ID, so a missing production configuration fails closed.
  const isLocalPreviewOwner =
    !ownerUserId && !ownerEmail && user.userId === "local_seedy";

  return { user, isOwner: isConfiguredOwner || isLocalPreviewOwner };
}

export async function isBlogOwner(): Promise<boolean> {
  return (await getBlogAccess()).isOwner;
}
