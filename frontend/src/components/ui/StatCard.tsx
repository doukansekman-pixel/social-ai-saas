type Props = {
  title: string;
  value: string;
  note: string;
};

export default function StatCard({ title, value, note }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-4 text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}
