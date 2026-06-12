"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, AuthUser } from "@/lib/auth";

export default function Sidebar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const isAdmin = user?.role === "SUPER_ADMIN";

  const menu = [
    ["Dashboard", "/"],
    ...(isAdmin ? [["Bayiler", "/dealers"]] : []),
    ["Instagram", "/instagram"],
    ["AI Studio", "/ai-post"],
    ...(isAdmin ? [["Maç Merkezi", "/fixtures"]] : []),
    ["Takvim", "/schedule"],
    ...(isAdmin ? [["Ayarlar", "/settings"]] : []),
  ];

  return (
    <aside className="w-72 min-h-screen border-r border-white/10 bg-[#080d18] px-5 py-6">
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5 shadow-2xl shadow-blue-900/30">
        <p className="text-xs font-medium text-blue-100">AI Social Network</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">SocialAI</h1>
      </div>

      <nav className="mt-8 space-y-1">
        {menu.map(([name, href]) => (
          <Link
            key={name}
            href={href}
            className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {name}
          </Link>
        ))}
      </nav>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs text-slate-400">Hesap Tipi</p>
        <p className="mt-2 text-sm font-semibold text-white">
          {isAdmin ? "Super Admin" : "Bayi Paneli"}
        </p>
      </div>
    </aside>
  );
}
