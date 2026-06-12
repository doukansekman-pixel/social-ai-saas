"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RequireAdmin from "@/components/layout/RequireAdmin";
import { getFixtures, uploadFixturePdf, WeeklyMatch } from "@/lib/api";

export default function FixturesPage() {
  const [matches, setMatches] = useState<WeeklyMatch[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await getFixtures();
    setMatches(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const result = await uploadFixturePdf(file);
      alert(`${result.imported} mac ice aktarıldı`);
      await load();
    } catch (error) {
      alert("PDF yuklenemedi veya mac okunamadi");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <RequireAdmin>
      <DashboardLayout
        title="Maç Merkezi"
        subtitle="Haftalık Tipico PDF bülteninden önemli maçları içeri aktar."
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">
                Haftalık Fikstür Yükle
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Tipico PDF bültenini yükle, sistem maçları otomatik çıkarsın.
              </p>
            </div>

            <label className="cursor-pointer rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500">
              {loading ? "Yükleniyor..." : "PDF Yükle"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-slate-400">
              <tr>
                <th className="p-4">Önem</th>
                <th className="p-4">Spor</th>
                <th className="p-4">Lig</th>
                <th className="p-4">Gün</th>
                <th className="p-4">Saat/Tarih</th>
                <th className="p-4">Maç</th>
                <th className="p-4">Kaynak</th>
                <th className="p-4">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {matches.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Henüz fikstür yüklenmedi.
                  </td>
                </tr>
              )}

              {matches.map((match) => (
                <tr key={match.id} className="border-t border-white/10">
                  <td className="p-4">
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                      {match.importance}/10
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{match.sport}</td>
                  <td className="p-4 text-slate-300">{match.competition}</td>
                  <td className="p-4 text-slate-300">{match.matchDay}</td>
                  <td className="p-4 text-slate-300">
                    {match.matchTime || match.matchDate || "-"}
                  </td>
                  <td className="p-4 font-bold text-white">
                    {match.homeTeam} - {match.awayTeam}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {match.sourceName}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        const prompt = `${match.homeTeam} vs ${match.awayTeam}
${match.competition || ""}

Görseldeki tüm yazılar Almanca olsun.

Premium spor bahis afişi oluştur.

Tam yaratıcı özgürlük kullan.

Oran yazma.
Bonus yazma.
Promosyon rakamı yazma.
Para ödülü yazma.`;
                        window.location.href = `/chatgpt-image?prompt=${encodeURIComponent(prompt)}`;
                      }}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      AI Post Üret
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </RequireAdmin>
  );
}
