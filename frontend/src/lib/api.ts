const API_URL = "https://api.socialai-network.com";

function authHeaders(extra?: HeadersInit): HeadersInit {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("social_ai_token");
  }

  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = authHeaders(options.headers);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("social_ai_token");
    localStorage.removeItem("social_ai_user");
    document.cookie = "social_ai_token=; path=/; max-age=0";
    window.location.href = "/login";
  }

  return res;
}

export type Dealer = {
  id: string;
  name: string;
  city?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUsername?: string | null;
  primaryColor?: string | null;
  dealerType?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  instagramAccount?: InstagramAccount | null;
};

export type InstagramAccount = {
  id: string;
  dealerId: string;
  instagramUsername?: string | null;
  instagramAccountId?: string | null;
  facebookPageId?: string | null;
  accessToken?: string | null;
  tokenExpiresAt?: string | null;
  isConnected: boolean;
  createdAt: string;
  updatedAt: string;
  dealer?: Dealer;
};

export async function getDealers(): Promise<Dealer[]> {
  const res = await apiFetch("/dealers");
  if (!res.ok) throw new Error("Dealers could not be loaded");
  return res.json();
}

export async function createDealer(data: {
  name: string;
  city?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  instagramUsername?: string;
  primaryColor?: string;
}) {
  const res = await apiFetch("/dealers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Dealer could not be created");
  return res.json();
}

export async function updateDealer(id: string, data: Partial<Dealer>) {
  const res = await apiFetch(`/dealers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Dealer could not be updated");
  return res.json();
}

export async function deleteDealer(id: string) {
  const res = await apiFetch(`/dealers/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Dealer could not be deleted");
  return res.json();
}

export async function getInstagramAccounts(): Promise<InstagramAccount[]> {
  const res = await apiFetch("/instagram");
  if (!res.ok) throw new Error("Instagram accounts could not be loaded");
  return res.json();
}

export type GeneratedPost = {
  title: string;
  caption: string;
  hashtags: string;
  offer: string;
  designBrief: string;
};

export async function generateAiPost(data: {
  dealerName: string;
  prompt: string;
}): Promise<GeneratedPost> {
  const res = await apiFetch("/ai/generate-post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("AI post could not be generated");
  }

  return res.json();
}

export async function createPost(data: {
  dealerId: string;
  title: string;
  caption: string;
  hashtags: string;
  offer: string;
  designBrief?: string;
}) {
  const res = await apiFetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Post could not be saved");
  return res.json();
}

export type PostItem = {
  id: string;
  dealerId: string;
  title: string;
  caption: string;
  hashtags: string;
  offer: string;
  designBrief?: string | null;
  imagePrompt?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  dealer?: Dealer;
};

export async function getPosts(): Promise<PostItem[]> {
  const res = await apiFetch("/posts");
  if (!res.ok) throw new Error("Posts could not be loaded");
  return res.json();
}

export async function generatePostImage(postId: string) {
  const res = await apiFetch(`/poster/ai-image/${postId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Image could not be generated");
  return res.json();
}

export async function revisePostImage(postId: string, instruction: string) {
  const res = await apiFetch(`/poster/revise/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction }),
  });

  if (!res.ok) throw new Error("Image could not be revised");
  return res.json();
}

export type WeeklyMatch = {
  id: string;
  sourceName?: string | null;
  sport?: string | null;
  competition?: string | null;
  matchCode?: string | null;
  matchDay?: string | null;
  matchDate?: string | null;
  matchTime?: string | null;
  homeTeam: string;
  awayTeam: string;
  importance: number;
  aiReason?: string | null;
  status: string;
  createdAt: string;
};

export async function getFixtures(): Promise<WeeklyMatch[]> {
  const res = await apiFetch("/fixtures");
  if (!res.ok) throw new Error("Fixtures could not be loaded");
  return res.json();
}

export async function uploadFixturePdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch("/fixtures/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Fixture PDF could not be uploaded");
  return res.json();
}

export async function publishPostToInstagram(postId: string) {
  const res = await apiFetch(`/instagram/publish/${postId}`, {
    method: "POST",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Instagram paylasimi basarisiz");
  }

  return res.json();
}


