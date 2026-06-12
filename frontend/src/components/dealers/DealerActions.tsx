"use client";

import { useState } from "react";
import { Dealer, updateDealer, deleteDealer } from "@/lib/api";

export default function DealerActions({ dealer }: { dealer: Dealer }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await updateDealer(dealer.id, {
        name: String(form.get("name") || ""),
        city: String(form.get("city") || ""),
        contactName: String(form.get("contactName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        instagramUsername: String(form.get("instagramUsername") || ""),
        primaryColor: String(form.get("primaryColor") || "#2563eb"),
        dealerType: String(form.get("dealerType") || "TIPICO"),
        loginEmail: String(form.get("loginEmail") || ""),
        loginPassword: String(form.get("loginPassword") || ""),
      } as any);

      setOpen(false);
      window.location.reload();
    } catch (error) {
      alert("Bayi guncellenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const ok = confirm(`${dealer.name} bayisini silmek istiyor musun?`);
    if (!ok) return;

    await deleteDealer(dealer.id);
    window.location.reload();
  }

  const currentLoginEmail = (dealer as any).users?.[0]?.email || "";

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
      >
        Duzenle
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className="rounded-xl bg-red-600/20 px-4 py-2 text-sm text-red-300 hover:bg-red-600/30"
      >
        Sil
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b1020] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Bayi Duzenle</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {dealer.name} bilgilerini ve panel girisini guncelle.
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

            <form onSubmit={handleUpdate} className="mt-8 grid grid-cols-2 gap-4">
              <input name="name" defaultValue={dealer.name} required placeholder="Bayi adi" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="city" defaultValue={dealer.city || ""} placeholder="Sehir" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="contactName" defaultValue={dealer.contactName || ""} placeholder="Yetkili adi" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="phone" defaultValue={dealer.phone || ""} placeholder="Telefon" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="email" defaultValue={dealer.email || ""} placeholder="Bayi email" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="instagramUsernameDisplay" value={dealer.instagramAccount?.instagramUsername ? `@${dealer.instagramAccount.instagramUsername}` : (dealer.instagramUsername ? `@${dealer.instagramUsername}` : "")} disabled placeholder="Instagram baglantisi yok" className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-slate-400 outline-none cursor-not-allowed" />
              <select name="dealerType" defaultValue={dealer.dealerType || "TIPICO"} className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none">
                <option value="TIPICO">Tipico</option>
                <option value="TIPWIN">Tipwin</option>
                <option value="OTHER">Diger</option>
              </select>
              <input name="primaryColor" defaultValue={dealer.primaryColor || "#2563eb"} placeholder="Renk" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />

              <div className="col-span-2 mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-bold text-white">Bayi Panel Girisi</p>
                <p className="mt-1 text-xs text-slate-400">
                  Login email degisir. Sifre bos birakilirsa eski sifre korunur.
                </p>
              </div>

              <input name="loginEmail" defaultValue={currentLoginEmail} placeholder="Login email" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />
              <input name="loginPassword" type="password" placeholder="Yeni sifre bos birakilabilir" className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none" />

              <button
                type="submit"
                disabled={loading}
                className="col-span-2 rounded-2xl bg-emerald-600 py-4 font-black text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
