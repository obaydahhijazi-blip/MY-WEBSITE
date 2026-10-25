"use client";

import { useEffect, useState } from "react";
import { useClient } from "sanity";

type Counts = {
  published: number;
  drafts: number;
  hidden: number;
  demo: number;
  clients: number;
  clientsPending: number;
  testimonials: number;
  faq: number;
};

const QUERY = `{
  "published": count(*[_type == "project" && !(_id in path("drafts.**")) && hidden != true && isDemo != true]),
  "drafts": count(*[_type == "project" && _id in path("drafts.**")]),
  "hidden": count(*[_type == "project" && !(_id in path("drafts.**")) && hidden == true]),
  "demo": count(*[_type in ["project", "clientLogo", "testimonial"] && isDemo == true]),
  "clients": count(*[_type == "clientLogo" && !(_id in path("drafts.**")) && approved == true && visible != false && isDemo != true]),
  "clientsPending": count(*[_type == "clientLogo" && !(_id in path("drafts.**")) && approved != true]),
  "testimonials": count(*[_type == "testimonial" && !(_id in path("drafts.**")) && consent == true && published != false && isDemo != true]),
  "faq": count(*[_type == "faqItem" && !(_id in path("drafts.**")) && published != false])
}`;

const ANALYTICS_URL = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL || "";
const ANALYTICS_ON = Boolean(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);

const C = {
  petrol: "#001E25",
  teal: "#00373E",
  cyan: "#00BBD4",
  ink: "#111719",
  muted: "#5a6567",
  line: "#e1e5e3",
  paper: "#FAFAF8",
};

const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 };

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "3px 10px", background: ok ? "#e3f7ef" : "#fff4d6", color: ok ? "#0f6b4a" : "#7a5600" }}>
      {children}
    </span>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: C.ink, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {note ? <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{note}</div> : null}
    </div>
  );
}

const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: C.ink, margin: 0 };

/** Statistics page in /admin. Shows only real numbers; anything not connected says so. */
export function StatsTool() {
  const client = useClient({ apiVersion: "2025-10-01" });
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .fetch<Counts>(QUERY, {}, { perspective: "raw" })
      .then(setCounts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "تعذّر جلب البيانات"));
  }, [client]);

  return (
    <div dir="rtl" style={{ minHeight: "100%", background: C.paper, fontFamily: "system-ui, 'Segoe UI', Tahoma, sans-serif", lineHeight: 1.7 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px", display: "grid", gap: 32 }}>
        <header style={{ background: `linear-gradient(150deg, ${C.teal}, ${C.petrol})`, color: "#fff", borderRadius: 20, padding: "28px 28px" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: C.cyan }}>OBAYDAH HIJAZI</div>
          <h1 style={{ fontSize: 26, margin: "6px 0 4px" }}>الإحصائيات</h1>
          <p style={{ margin: 0, opacity: 0.75 }}>أرقام حقيقية من محتوى الموقع. ما لم يُربط بخدمة خارجية يظهر بوضوح على أنه غير متصل.</p>
        </header>

        <section style={{ display: "grid", gap: 12 }}>
          <h2 style={h2}>المحتوى</h2>
          {error ? (
            <div style={{ ...card, borderColor: "#f3b8b0", color: "#b42318" }}>{error}</div>
          ) : !counts ? (
            <div style={{ color: C.muted }}>جارٍ التحميل…</div>
          ) : (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              <Stat label="مشاريع منشورة" value={counts.published} />
              <Stat label="مسودات غير منشورة" value={counts.drafts} />
              <Stat label="مشاريع مخفية" value={counts.hidden} />
              <Stat label="عناصر تجريبية" value={counts.demo} note="لا تظهر في الموقع المنشور" />
              <Stat label="شعارات ظاهرة" value={counts.clients} />
              <Stat label="شعارات بانتظار الموافقة" value={counts.clientsPending} />
              <Stat label="آراء عملاء منشورة" value={counts.testimonials} />
              <Stat label="أسئلة شائعة منشورة" value={counts.faq} />
            </div>
          )}
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={h2}>الزيارات والنقرات</h2>
            <Badge ok={ANALYTICS_ON}>{ANALYTICS_ON ? "متصل" : "لم يتم إعداد التحليلات"}</Badge>
          </div>
          <div style={{ ...card, display: "grid", gap: 12 }}>
            {ANALYTICS_ON ? (
              <p style={{ margin: 0 }}>
                تُسجَّل الزيارات والأحداث التالية في Umami: <code>whatsapp_click</code> (تواصل عام)، <code>consultation_whatsapp_click</code> (الاستشارة المجانية)،{" "}
                <code>quote_whatsapp_click</code> (طلب عرض سعر)، <code>calendar_open</code>، <code>similar_project_click</code>.
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                لا تُعرض أرقام زيارات قبل ربط أداة تحليلات حقيقية. راجع الملف <code>docs/ANALYTICS_AR.md</code> لإعداد Umami (مجاني) خلال دقائق.
              </p>
            )}
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>النقرة على زر واتساب تعني فتح المحادثة فقط، ولا تعني أن الطلب أُرسل أو أن عميلاً جديداً تأكد.</p>
            {ANALYTICS_URL ? (
              <a href={ANALYTICS_URL} target="_blank" rel="noopener noreferrer" style={{ justifySelf: "start", background: C.teal, color: "#fff", borderRadius: 999, padding: "10px 18px", textDecoration: "none", fontWeight: 600 }}>
                فتح لوحة الزيارات
              </a>
            ) : null}
          </div>
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={h2}>حجوزات Cal.com المؤكدة</h2>
            <Badge ok={false}>غير متصل</Badge>
          </div>
          <div style={card}>تظهر الحجوزات المؤكدة في حسابك على Cal.com مباشرة. لا يعرضها الموقع هنا قبل إعداد تكامل مخوّل.</div>
        </section>
      </div>
    </div>
  );
}
