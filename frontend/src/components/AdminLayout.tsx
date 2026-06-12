import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AdminLayout({ title, subtitle, children }: Props) {
  const menu = [
    ["Dashboard", "/"],
    ["Bayiler", "/dealers"],
    ["Instagram", "/instagram"],
    ["AI Studio", "/ai-post"],
    ["Takvim", "/schedule"],
    ["Ayarlar", "/settings"],
  ];

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-white/10 bg-[#0d1322] p-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 shadow-lg">
            <h1 className="text-2xl font-bold">SocialAI</h1>
            <p className="mt-1 text-xs text-blue-100">Bayi medya otomasyonu</p>
          </div>

          <nav className="mt-8 space-y-2">
            {menu.map(([name, href]) => (
              <Link
                key={name}
                href={href}
                className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {name}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Aktif Plan</p>
            <p className="mt-1 font-semibold">Private Network</p>
            <p className="mt-2 text-xs text-slate-500">27 bayi icin hazir</p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#0b1020]/80 px-10 py-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Admin
              </button>
              <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-500">
                Yeni Post
              </button>
            </div>
          </header>

          <div className="p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
