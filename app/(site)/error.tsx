"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Only a short digest/path is logged; never post personal data or error stacks.
    console.error("[site] A page failed to render:", error.digest || "unknown");
    fetch("/api/client-error", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digest: error.digest || "unknown", path: location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-paper px-5 py-24 text-center">
      <div className="max-w-lg rounded-3xl border border-line bg-white p-9 shadow-sm">
        <p className="font-latin text-sm font-semibold tracking-widest text-cyan-ink">TEMPORARY ERROR</p>
        <h1 className="mt-5 text-3xl font-bold leading-[1.5] text-ink">حدث خطأ غير متوقع</h1>
        <p className="mt-4 leading-8 text-muted">تعذّر عرض هذا الجزء حالياً. جرّب إعادة المحاولة أو عد إلى الصفحة الرئيسية.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn btn-dark" onClick={reset}>إعادة المحاولة</button>
          <Link href="/" className="btn btn-outline">العودة للرئيسية</Link>
        </div>
      </div>
    </main>
  );
}
