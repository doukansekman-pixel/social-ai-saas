"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createPost,
  generateAiPost,
  generatePostImage,
  revisePostImage,
  getDealers,
  Dealer,
  GeneratedPost,
} from "@/lib/api";

const API_URL = "https://api.socialai-network.com";

export default function AiPostGenerator() {
  const searchParams = useSearchParams();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerId, setDealerId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fixturePrompt = searchParams.get("prompt");

  const [prompt, setPrompt] = useState(
    fixturePrompt || "Türkiye - Avustralya Dünya Kupası maçı için afiş hazırla. Hanau bayisi."
  );

  const [loading, setLoading] = useState(false);
  const [revising, setRevising] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [revision, setRevision] = useState("");

  useEffect(() => {
    async function loadDealers() {
      const rawUser = localStorage.getItem("social_ai_user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      setCurrentUser(user);

      const data = await getDealers();
      setDealers(data);

      if (user?.role === "DEALER" && user?.dealerId) {
        setDealerId(user.dealerId);
      } else if (data.length > 0) {
        setDealerId(data[0].id);
      }
    }

    loadDealers();
  }, []);

  async function handleGenerateAll() {
    const selectedDealer = dealers.find((dealer) => dealer.id === dealerId);

    if (!selectedDealer) {
      alert("Lutfen bayi sec");
      return;
    }

    setLoading(true);
    setResult(null);
    setImageUrl(null);
    setPostId(null);
    setRevision("");

    try {
      const aiResult = await generateAiPost({
        dealerName: selectedDealer.name,
        prompt,
      });

      setResult(aiResult);

      const savedPost = await createPost({
        dealerId: selectedDealer.id,
        title: aiResult.title,
        caption: aiResult.caption,
        hashtags: aiResult.hashtags,
        offer: aiResult.offer,
        designBrief: aiResult.designBrief,
      });

      setPostId(savedPost.id);

      await generatePostImage(savedPost.id);

      setImageUrl(`${API_URL}/files/posts/${savedPost.id}?token=${localStorage.getItem('social_ai_token') || ''}&t=${Date.now()}`);
    } catch (error) {
      alert("AI uretim sirasinda hata olustu");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevise() {
    if (!postId || !revision.trim()) {
      alert("Duzeltme istegini yaz");
      return;
    }

    setRevising(true);

    try {
      const imageResult = await revisePostImage(postId, revision);
      setImageUrl(`${API_URL}/files/posts/${postId}?token=${localStorage.getItem('social_ai_token') || ''}&t=${Date.now()}`);
      setRevision("");
    } catch (error) {
      alert("Gorsel duzeltilirken hata olustu");
    } finally {
      setRevising(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h3 className="text-2xl font-black">Yeni AI Post Uret</h3>

        {currentUser?.role === "SUPER_ADMIN" ? (
          <>
            <label className="mt-6 block text-sm font-bold text-slate-300">
              Bayi sec
            </label>

            <select
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] p-4 text-white outline-none"
            >
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name} {dealer.city ? `- ${dealer.city}` : ""}
                </option>
              ))}
            </select>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#101827] p-4">
            <p className="text-xs text-slate-400">Bayi</p>
            <p className="mt-1 font-bold text-white">
              {dealers.find((dealer) => dealer.id === dealerId)?.name || "Kendi Bayiniz"}
            </p>
          </div>
        )}

        <label className="mt-6 block text-sm font-bold text-slate-300">
          Komut
        </label>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-2 h-44 w-full rounded-2xl border border-white/10 bg-[#101827] p-4 text-white outline-none"
          placeholder="Ornek: Türkiye - Avustralya Dünya Kupası maçı..."
        />

        <button
          onClick={handleGenerateAll}
          disabled={loading}
          className="mt-6 rounded-2xl bg-emerald-600 px-8 py-3 font-black text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "AI icerik ve gorsel uretiyor..." : "AI ile Uret"}
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-purple-600/10 p-8">
        <h3 className="text-2xl font-black">Uretim Sonucu</h3>

        {!result && (
          <p className="mt-6 text-sm text-slate-400">
            Almanca icerik ve gorsel burada gorunecek.
          </p>
        )}

        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="AI Poster"
              className="mt-6 w-full rounded-2xl border border-white/10"
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold text-white">Gorseli Duzelt</p>

              <textarea
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-[#101827] p-3 text-sm text-white outline-none"
                placeholder="Ornek: Tipico logosunu buyut, daha karanlik premium tasarim yap, yesil rengi kaldir..."
              />

              <button
                onClick={handleRevise}
                disabled={revising}
                className="mt-3 w-full rounded-xl bg-orange-600 py-3 text-sm font-black text-white hover:bg-orange-500 disabled:opacity-50"
              >
                {revising ? "Duzeltiliyor..." : "Duzelt ve Yeniden Uret"}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="mt-6 space-y-4 text-sm">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-slate-400">Baslik</p>
              <p className="mt-1 font-bold text-white">{result.title}</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-slate-400">Caption</p>
              <p className="mt-1 text-white">{result.caption}</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-slate-400">Hashtag</p>
              <p className="mt-1 text-white">{result.hashtags}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
