"use client";

import { useState } from "react";
import { createDealer } from "@/lib/api";

export default function AddDealerButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await createDealer({
        name: String(form.get("name") || ""),
        city: String(form.get("city") || ""),
        contactName: String(form.get("contactName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        instagramUsername: String(form.get("instagramUsername") || ""),
        primaryColor: String(form.get("primaryColor") || "#2563eb"),
        loginEmail: String(form.get("loginEmail") || ""),
        loginPassword: String(form.get("loginPassword") || ""),
      } as any);

      setOpen(false);
      window.location.reload();
    } catch (error) {
      alert("Bayi olusturulamadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500"
      >
        Yeni Bayi Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b1020] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Yeni Bayi Ekle</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Bayi bilgilerini ve panel giris hesabini olustur.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-2 gap-4">
              <input name="name" required placeholder="Bayi adi" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="city" placeholder="Sehir" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="contactName" placeholder="Yetkili adi" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="phone" placeholder="Telefon" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="email" placeholder="Bayi email" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-slate-400">Instagram hesabi bayi olusturulduktan sonra baglanacaktir</div>
              <select name="dealerType" defaultValue="TIPICO" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none">
                <option value="TIPICO">Tipico</option>
                <option value="TIPWIN">Tipwin</option>
                <option value="OTHER">Diger</option>
              </select>
              <input name="primaryColor" defaultValue="#2563eb" placeholder="Renk" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />

              <div className="col-span-2 mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-bold text-white">Bayi Panel Girisi</p>
                <p className="mt-1 text-xs text-slate-400">
                  Bu bilgilerle bayi kendi paneline giris yapacak.
                </p>
              </div>

              <input name="loginEmail" required placeholder="Login email" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="loginPassword" required placeholder="Login sifre" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />

              <button
                type="submit"
                disabled={loading}
                className="col-span-2 rounded-2xl bg-emerald-600 py-4 font-black text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Bayiyi ve Giris Hesabini Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
