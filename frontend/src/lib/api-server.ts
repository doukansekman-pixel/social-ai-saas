import { cookies } from "next/headers";
import type { Dealer, InstagramAccount, PostItem } from "./api";

const API_URL = "https://api.socialai-network.com";

async function serverFetch(path: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("social_ai_token")?.value;

  return fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function getDealersServer(): Promise<Dealer[]> {
  const res = await serverFetch("/dealers");
  if (!res.ok) throw new Error("Dealers could not be loaded");
  return res.json();
}

export async function getInstagramAccountsServer(): Promise<InstagramAccount[]> {
  const res = await serverFetch("/instagram");
  if (!res.ok) throw new Error("Instagram accounts could not be loaded");
  return res.json();
}

export async function getPostsServer(): Promise<PostItem[]> {
  const res = await serverFetch("/posts");
  if (!res.ok) throw new Error("Posts could not be loaded");
  return res.json();
}
