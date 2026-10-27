import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    commit: process.env.COMMIT_REF || process.env.NEXT_PUBLIC_COMMIT_SHA || null,
    branch: process.env.BRANCH || null,
    provider: process.env.NETLIFY ? "Netlify" : null,
    note: "القيم تأتي من بيئة الإصدار المنشور فقط، ولا تضمن تلقائياً أن النسخة الأحدث على GitHub وصلت إلى الاستضافة."
  }, { headers: { "Cache-Control": "no-store" } });
}
