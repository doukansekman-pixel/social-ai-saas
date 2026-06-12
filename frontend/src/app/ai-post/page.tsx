import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AiPostGenerator from "@/components/ai/AiPostGenerator";

export default function AiPostPage() {
  return (
    <DashboardLayout
      title="AI Studio"
      subtitle="OpenAI ile bayi bazli profesyonel post metni, kampanya ve tasarim briefi uret."
    >
      <Suspense fallback={<div className="text-slate-400">Yukleniyor...</div>}>
        <AiPostGenerator />
      </Suspense>
    </DashboardLayout>
  );
}
