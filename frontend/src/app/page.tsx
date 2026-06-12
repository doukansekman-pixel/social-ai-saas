import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";

export default function Home() {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Tum bayilerin sosyal medya operasyonu tek merkezden yonetilir."
    >
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Toplam Bayi" value="27" note="aktif bayi agi" />
        <StatCard title="Instagram Bagli" value="0" note="baglanti bekliyor" />
        <StatCard title="Bekleyen Post" value="0" note="onay kuyrugu" />
        <StatCard title="AI Uretim" value="0" note="bu hafta" />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-xl font-black">Son Post Taslaklari</h3>

          <div className="mt-6 space-y-4">
            {[
              "Bayern - Dortmund mac postu",
              "Hafta sonu bayi duyurusu",
              "Sampiyonlar Ligi ozel paylasimi",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#101827] p-4"
              >
                <div>
                  <p className="font-bold">{item}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Taslak - henuz paylasilmadi
                  </p>
                </div>

                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  Taslak
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#101827] to-[#070b14] p-6">
          <h3 className="text-xl font-black">AI Studio</h3>
          <p className="mt-2 text-sm text-slate-400">
            Mac, kampanya veya duyuru yaz. Sistem bayi icin post taslagi uretsin.
          </p>

          <textarea
            className="mt-5 h-36 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm outline-none placeholder:text-slate-600"
            placeholder="Ornek: Bayern - Dortmund maci icin post hazirla..."
          />

          <button className="mt-4 w-full rounded-2xl bg-emerald-600 py-3 font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500">
            AI ile Uret
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
