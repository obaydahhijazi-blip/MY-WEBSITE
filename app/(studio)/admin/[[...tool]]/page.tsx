import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { sanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function AdminPage() {
  if (!sanityConfigured) {
    return (
      <main dir="rtl" style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: 24, lineHeight: 1.9 }}>
        <h1 style={{ fontSize: 22 }}>لوحة الإدارة غير مفعّلة بعد</h1>
        <p>
          أضف <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> إلى متغيرات البيئة ثم أعد النشر. التفاصيل في الملف
          <code> docs/CMS_SANITY.md</code>.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
