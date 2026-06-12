import Sidebar from "./Sidebar";
import Header from "./Header";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function DashboardLayout({ title, subtitle, children }: Props) {
  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <Header title={title} subtitle={subtitle} />
          <div className="p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
