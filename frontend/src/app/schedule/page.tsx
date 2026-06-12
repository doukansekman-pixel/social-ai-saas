"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getPosts, PostItem, reviseChatgptImage, publishPostToInstagram } from "@/lib/api";

const API_URL = "https://api.socialai-network.com";
const PAGE_SIZE = 8;

export default function SchedulePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [revisingId, setRevisingId] = useState<string | null>(null);
  const [revision, setRevision] = useState("");
  const [token, setToken] = useState("");

  async function load() {
    const data = await getPosts();
    setPosts(data);
  }

  useEffect(() => {
    setToken(localStorage.getItem("social_ai_token") || "");
    load();
  }, []);

  async function handleRevise(postId: string) {
    if (!revision.trim()) {
      alert("Duzeltme istegini yaz");
      return;
    }

    await reviseChatgptImage(postId, revision);
    setRevision("");
    setRevisingId(null);
    await load();
  }

  async function handlePublish(postId: string) {
    const ok = confirm("Bu post Instagram'da paylasilsin mi?");
    if (!ok) return;

    try {
      await publishPostToInstagram(postId);
      alert("Instagram'a gonderildi");
      await load();
    } catch (error: any) {
      alert(error?.message || "Instagram paylasimi basarisiz");
    }
  }

  const filteredPosts = useMemo(() => {
    if (status === "all") return posts;
    return posts.filter((post) => post.status === status);
  }, [posts, status]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));

  const visiblePosts = filteredPosts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <DashboardLayout
      title="Taslaklar ve Icerik Takvimi"
      subtitle="AI ile uretilen taslak postlari ve yayin akisini buradan takip et."
    >
      <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex gap-2">
          {[
            ["all", "Tumu"],
            ["draft", "Taslak"],
            ["ready", "Hazir"],
            ["published", "Yayinlandi"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                status === value
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400">{filteredPosts.length} kayit</p>
      </div>

      {visiblePosts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
          Henuz taslak post yok.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
            >
              <div className="flex gap-5 p-5">
                {post.imageUrl ? (
                  <img
                    src={`${API_URL}/files/posts/${post.id}?token=${token}`}
                    alt={post.title}
                    className="h-56 w-40 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-40 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-slate-500">
                    Gorsel Yok
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                      {post.dealer?.name || "-"}
                    </p>

                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                      {post.status}
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-xl font-black text-white">
                    {post.title}
                  </h3>

                  <p className="mt-3 line-clamp-4 text-sm text-slate-400">
                    {post.caption}
                  </p>

                  <p className="mt-3 line-clamp-2 text-xs text-blue-300">
                    {post.hashtags}
                  </p>

                  <div className="mt-4 rounded-2xl bg-black/20 p-3">
                    <p className="line-clamp-3 text-sm text-slate-300">
                      {post.offer}
                    </p>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString("de-DE")}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {post.imageUrl && (
                      <button
                        onClick={() =>
                          window.open(`${API_URL}/files/posts/${post.id}?token=${token}`, "_blank")
                        }
                        className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                      >
                        Gorseli Ac
                      </button>
                    )}

                    <button
                      onClick={() => setRevisingId(post.id)}
                      className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500"
                    >
                      Duzelt
                    </button>

                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={!post.imageUrl || post.status === "published"}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
                    >
                      {post.status === "published" ? "Paylasildi" : "Instagram'a Gonder"}
                    </button>
                  </div>
                </div>
              </div>

              {revisingId === post.id && (
                <div className="border-t border-white/10 p-5">
                  <p className="text-sm font-bold text-white">Gorsel Duzeltme</p>
                  <textarea
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                    className="mt-3 h-24 w-full rounded-2xl border border-white/10 bg-[#101827] p-4 text-sm text-white outline-none"
                    placeholder="Ornek: Tipico logosunu buyut, yesil renkleri kaldir, daha karanlik premium tasarim yap..."
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRevise(post.id)}
                      className="rounded-xl bg-orange-600 px-5 py-2 text-sm font-bold text-white hover:bg-orange-500"
                    >
                      Duzelt ve Yeniden Uret
                    </button>

                    <button
                      onClick={() => {
                        setRevisingId(null);
                        setRevision("");
                      }}
                      className="rounded-xl bg-white/10 px-5 py-2 text-sm font-bold text-white hover:bg-white/20"
                    >
                      Vazgec
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((v) => Math.max(1, v - 1))}
          disabled={page === 1}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          Onceki
        </button>

        <span className="text-sm text-slate-400">
          Sayfa {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
          disabled={page === totalPages}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          Sonraki
        </button>
      </div>
    </DashboardLayout>
  );
}
