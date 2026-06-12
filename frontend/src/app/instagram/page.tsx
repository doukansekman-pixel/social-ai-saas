"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getInstagramAccounts,
  getDealers,
  InstagramAccount,
  Dealer,
} from "@/lib/api";

const API_URL = "https://api.socialai-network.com";

export default function InstagramPage() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerId, setDealerId] = useState("");
  const [user, setUser] = useState<any>(null);

  async function load() {
    const rawUser = localStorage.getItem("social_ai_user");
    const currentUser = rawUser ? JSON.parse(rawUser) : null;
    setUser(currentUser);

    const accountData = await getInstagramAccounts();
    setAccounts(accountData);

    const dealerData = await getDealers();
    setDealers(dealerData);

    if (currentUser?.role === "DEALER" && currentUser?.dealerId) {
      setDealerId(currentUser.dealerId);
    } else if (dealerData.length > 0) {
      setDealerId(dealerData[0].id);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConnect() {
    const selectedDealerId =
      user?.role === "DEALER" ? user.dealerId : dealerId;

    if (!selectedDealerId) {
      alert("Bayi bulunamadi");
      return;
    }

    const token = localStorage.getItem("social_ai_token");

    const res = await fetch(
      `${API_URL}/instagram/oauth/start?dealerId=${selectedDealerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("Instagram baglanti baslatilamadi");
      return;
    }

    const data = await res.json();
    window.location.href = data.url;
  }

  const selectedDealerName =
    dealers.find((dealer) => dealer.id === dealerId)?.name || "Bayi";

  return (
    <DashboardLayout
      title="Instagram Baglantilari"
      subtitle="Bayilerin Instagram Business hesaplarini Meta ile guvenli sekilde bagla."
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white">
              Instagram Hesabi Bagla
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Bayi kendi Meta/Facebook hesabi ile izin verir. Sifre alinmaz.
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="rounded-2xl bg-pink-600 px-6 py-3 font-black text-white hover:bg-pink-500"
          >
            Instagram Bagla
          </button>
        </div>

        {user?.role === "SUPER_ADMIN" ? (
          <div className="mt-6">
            <label className="text-sm font-bold text-slate-300">
              Baglanacak Bayi
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
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#101827] p-4">
            <p className="text-xs text-slate-400">Bayi</p>
            <p className="mt-1 font-bold text-white">{selectedDealerName}</p>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-400">
            <tr>
              <th className="p-5">Bayi</th>
              <th className="p-5">Instagram</th>
              <th className="p-5">Instagram ID</th>
              <th className="p-5">Durum</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-t border-white/10">
                <td className="p-5 font-bold text-white">
                  {account.dealer?.name || account.dealerId}
                </td>
                <td className="p-5 text-slate-300">
                  @{account.instagramUsername || "-"}
                </td>
                <td className="p-5 text-slate-400">
                  {account.instagramAccountId || "-"}
                </td>
                <td className="p-5">
                  {account.isConnected ? (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      Bagli
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                      Bagli Degil
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  Henuz Instagram baglantisi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
