import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";
import { authorizeDiagnostics } from "@/lib/diagnostics-auth";

export const runtime = "nodejs";

/**
 * Read-only Lighthouse lab and CrUX field metrics for THIS site only.
 * No arbitrary URL parameter is accepted, to prevent an open proxy.
 * Cached for an hour and only fetched when an admin clicks the diagnostics button.
 */
export async function GET(request: Request) {
  const denied = authorizeDiagnostics(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const strategy = url.searchParams.get("strategy") === "desktop" ? "desktop" : "mobile";
  if (!/^https:\/\//.test(siteUrl)) return NextResponse.json({ ok: false, message: "حدّد NEXT_PUBLIC_SITE_URL على رابط الموقع المنشور أولاً." }, { status: 503 });
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", siteUrl);
  endpoint.searchParams.set("strategy", strategy);
  for (const c of ["PERFORMANCE","ACCESSIBILITY","BEST_PRACTICES","SEO"]) endpoint.searchParams.append("category", c);
  if (process.env.PAGESPEED_API_KEY) endpoint.searchParams.set("key", process.env.PAGESPEED_API_KEY);
  try {
    const r = await fetch(endpoint, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(22000) });
    if (!r.ok) return NextResponse.json({ ok: false, message: "لم تتوفر نتيجة من PageSpeed Insights حالياً. يمكنك فتح التقرير المباشر." }, { status: 503 });
    const data = await r.json();
    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};
    const field = data.loadingExperience?.metrics || {};
    const score = (k: string) => typeof cats[k]?.score === "number" ? Math.round(cats[k].score * 100) : null;
    const value = (k: string) => typeof audits[k]?.numericValue === "number" ? Math.round(audits[k].numericValue) : null;
    return NextResponse.json({ ok: true, strategy, source: "Google PageSpeed Insights", checkedAt: new Date().toISOString(),
      scores: { performance: score("performance"), accessibility: score("accessibility"), seo: score("seo"), bestPractices: score("best-practices") },
      lab: { lcpMs: value("largest-contentful-paint"), cls: typeof audits["cumulative-layout-shift"]?.numericValue === "number" ? Number(audits["cumulative-layout-shift"].numericValue.toFixed(3)) : null },
      field: { inpMs: typeof field.INTERACTION_TO_NEXT_PAINT?.percentile === "number" ? field.INTERACTION_TO_NEXT_PAINT.percentile : null },
      note: "نتائج المختبر تقديرية؛ INP ميداني لا يظهر إلا إذا توفرت بيانات كافية."
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ ok: false, message: "تعذّر الاتصال بخدمة PageSpeed حالياً." }, { status: 503 });
  }
}
