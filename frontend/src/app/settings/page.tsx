import DashboardLayout from "@/components/layout/DashboardLayout";
import RequireAdmin from "@/components/layout/RequireAdmin";

export default function SettingsPage() {
  return (
    <RequireAdmin>
      <DashboardLayout
      title="Ayarlar"
      subtitle="Sistem, AI ve panel ayarlarini buradan yonet."
    >
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h3 className="text-2xl font-black">AI Ayarlari</h3>
          <p className="mt-2 text-slate-400">Gemini API ve icerik kurallari burada olacak.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h3 className="text-2xl font-black">Panel Ayarlari</h3>
          <p className="mt-2 text-slate-400">Tema, roller ve sistem tercihleri burada olacak.</p>
        </div>
      </div>
      </DashboardLayout>
    </RequireAdmin>
  );
}
