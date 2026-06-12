"use client";

import { useState } from "react";
import { saveAuth } from "@/lib/auth";

const API_URL = "https://api.socialai-network.com";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@socialai.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("Email veya sifre hatali");
        return;
      }

      const data = await res.json();

      saveAuth(data.access_token, data.user);

      window.location.href = "/";
    } catch (error) {
      alert("Login sirasinda hata olustu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050814] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5">
          <p className="text-xs text-blue-100">AI Social Network</p>
          <h1 className="mt-1 text-3xl font-black">SocialAI</h1>
        </div>

        <h2 className="mt-8 text-2xl font-black">Panele Giris</h2>
        <p className="mt-2 text-sm text-slate-400">
          Admin veya bayi hesabinizla giris yapin.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] p-4 text-white outline-none"
              placeholder="email"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-300">Sifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] p-4 text-white outline-none"
              placeholder="sifre"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-4 font-black hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Giris yapiliyor..." : "Giris Yap"}
          </button>
        </form>
      </div>
    </main>
  );
}
