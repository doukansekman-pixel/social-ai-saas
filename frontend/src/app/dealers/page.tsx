import DashboardLayout from "@/components/layout/DashboardLayout";
import RequireAdmin from "@/components/layout/RequireAdmin";
import AddDealerButton from "@/components/dealers/AddDealerButton";
import DealerActions from "@/components/dealers/DealerActions";
import { getDealersServer } from "@/lib/api-server";

export default async function DealersPage() {
  const dealers = await getDealersServer();

  return (
    <RequireAdmin>
      <DashboardLayout
      title="Bayiler"
      subtitle="Tum bayi hesaplarini, kullanicilarini ve Instagram baglantilarini yonet."
    >
      <div className="flex justify-end">
        <AddDealerButton />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
        <table className="w-full text-left">
          <thead className="bg-white/[0.04] text-sm text-slate-400">
            <tr>
              <th className="p-5">Bayi</th>
              <th className="p-5">Sehir</th>
              <th className="p-5">Yetkili</th>
              <th className="p-5">Telefon</th>
              <th className="p-5">Instagram</th>
              <th className="p-5">Baglanti</th>
              <th className="p-5 text-right">Islem</th>
            </tr>
          </thead>

          <tbody>
            {dealers.map((dealer) => {
              const connected = dealer.instagramAccount?.isConnected === true;

              return (
                <tr key={dealer.id} className="border-t border-white/10">
                  <td className="p-5 font-bold">{dealer.name}</td>
                  <td className="p-5 text-slate-300">{dealer.city || "-"}</td>
                  <td className="p-5 text-slate-300">{dealer.contactName || "-"}</td>
                  <td className="p-5 text-slate-300">{dealer.phone || "-"}</td>
                  <td className="p-5 text-slate-300">
                    {dealer.instagramAccount?.instagramUsername ? `@${dealer.instagramAccount.instagramUsername}` : (dealer.instagramUsername ? `@${dealer.instagramUsername}` : "-")}
                  </td>
                  <td className="p-5">
                    <span
                      className={
                        "rounded-full px-3 py-1 text-xs font-bold " +
                        (connected
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300")
                      }
                    >
                      {connected ? "Bagli" : "Bagli Degil"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <DealerActions dealer={dealer} />
                  </td>
                </tr>
              );
            })}

            {dealers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Henuz bayi eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </DashboardLayout>
    </RequireAdmin>
  );
}
