"use client";

import { useEffect, useState } from "react";
import { getUser, logout, AuthUser } from "@/lib/auth";

type Props = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#0b1020]/80 px-10 py-6 backdrop-blur-xl">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300">
          <p className="font-bold text-white">{user?.name || "Kullanici"}</p>
          <p className="text-xs text-slate-400">
            {user?.role === "SUPER_ADMIN" ? "Admin" : "Bayi"}
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-2xl bg-red-600/20 px-5 py-2.5 text-sm font-bold text-red-300 hover:bg-red-600/30"
        >
          Cikis
        </button>
      </div>
    </header>
  );
}
