"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "SUPER_ADMIN") {
      window.location.href = "/";
      return;
    }

    setAllowed(true);
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-[#050814] p-10 text-white">
        Yetki kontrol ediliyor...
      </div>
    );
  }

  return <>{children}</>;
}
