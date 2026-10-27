"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { track } from "@/lib/analytics";
import { QUOTE_PREFILL, type QuotePrefill } from "@/lib/quote-bus";
import type { SiteContent } from "@/lib/cms/types";
import { whatsappLink } from "@/lib/whatsapp";

type Fields = { name: string; company: string; service: string; details: string; link: string; budget: string; deadline: string; email: string };
type Errors = Partial<Record<keyof Fields, string>>;
const EMPTY: Fields = { name: "", company: "", service: "", details: "", link: "", budget: "", deadline: "", email: "" };
const DRAFT_KEY = "quote-draft-v1";

// The draft lives only in this browser; storage may be unavailable (private mode), so every access is guarded.
const readDraft = (): Partial<Fields> | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Fields>) : null;
  } catch {
    return null;
  }
};
const writeDraft = (f: Fields | null) => {
  try {
    if (f && Object.values(f).some((v) => v.trim())) localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

const STEPS = ["تُرسل التفاصيل من حسابك على واتساب", "أراجع متطلبات المشروع", "أعود إليك بالخطوة التالية وعرض مناسب"];

/** Final main section: collects project details and opens WhatsApp with a structured quote request. */
export function QuoteSection({ quote, whatsappNumber, index }: { quote: SiteContent["quote"]; whatsappNumber: string; index: string }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [f, setF] = useState<Fields>(EMPTY);
  const [ref, setRef] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [href, setHref] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const loaded = useRef(false);

  // Restore an unsent draft once, then keep saving changes (debounced).
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      const d = readDraft();
      if (d) {
        const next = { ...EMPTY };
        for (const k of Object.keys(EMPTY) as (keyof Fields)[]) if (typeof d[k] === "string") next[k] = d[k] as string;
        if (next.service && !quote.services.includes(next.service)) next.service = "";
        queueMicrotask(() => {
          setF(next);
          setRestored(true);
        });
      }
      return;
    }
    const t = setTimeout(() => writeDraft(f), 400);
    return () => clearTimeout(t);
  }, [f, quote.services]);

  const clearForm = () => {
    setF(EMPTY);
    setRef("");
    setErrors({});
    setHref(null);
    setRestored(false);
    writeDraft(null);
  };

  // «أرغب في مشروع مشابه» from the gallery pre-selects the service and notes the reference project.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<QuotePrefill>).detail ?? {};
      setF((prev) => ({ ...prev, service: d.service && quote.services.includes(d.service) ? d.service : prev.service }));
      setRef(d.project ?? "");
    };
    window.addEventListener(QUOTE_PREFILL, onPrefill);
    return () => window.removeEventListener(QUOTE_PREFILL, onPrefill);
  }, [quote.services]);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    setHref(null);
  };

  const buildMessage = () => {
    const line = (label: string, v: string) => (v.trim() ? `${label}: ${v.trim()}` : "");
    const message = [
      "مرحباً عبيدة، أرغب في الحصول على عرض سعر لمشروعي.",
      line("الاسم", f.name),
      line("الجهة", f.company),
      line("نوع الخدمة", f.service),
      line("وصف المشروع", f.details),
      ref ? `مشروع مرجعي من المعرض: ${ref}` : "",
      line("رابط مرجعي", f.link),
      line("الميزانية التقريبية", f.budget),
      line("الموعد المتوقع", f.deadline),
      line("البريد الإلكتروني", f.email),
      "أرجو مراجعة التفاصيل وإفادتي بالخطوة التالية.",
    ]
      .filter(Boolean)
      .join("\n");
    return message;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (f.name.trim().length < 2) found.name = "يرجى كتابة الاسم الكامل.";
    if (!f.service) found.service = "يرجى اختيار نوع الخدمة المطلوبة.";
    if (f.details.trim().length < 10) found.details = "يرجى كتابة وصف مختصر للمشروع ومتطلباته (عشرة أحرف على الأقل).";
    if (f.link.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(f.link.trim())) found.link = "يرجى كتابة رابط صحيح أو ترك الحقل فارغاً.";
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) found.email = "يرجى كتابة بريد إلكتروني صحيح أو ترك الحقل فارغاً.";
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const message = buildMessage();
    const link = whatsappLink(whatsappNumber, message);
    setHref(link);
    track("quote_whatsapp_click", { service: f.service });
    // Do not discard an unsent draft: opening WhatsApp is not confirmation of sending.
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const field = (key: keyof Fields) => ({
    id: `${uid}-${key}`,
    name: key,
    value: f[key],
    onChange: set(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-err` : undefined,
  });
  const err = (key: keyof Fields) =>
    errors[key] ? (
      <p id={`${uid}-${key}-err`} className="error">
        {errors[key]}
      </p>
    ) : null;
  const complete = [f.name.trim().length >= 2, Boolean(f.service), f.details.trim().length >= 10].filter(Boolean).length;
  const req = <span aria-hidden="true" className="text-cyan">*</span>;
  const opt = <span className="font-normal text-white/50">(اختياري)</span>;

  return (
    <section id="quote" className="section bg-paper" aria-labelledby="quote-title">
      <div className="container-x">
        <div className="quote-block reveal">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="section-index !text-white/60">
                <span className="num !text-cyan">{index}</span>
                <span className="rule" aria-hidden="true" />
                <span>{quote.label}</span>
              </p>
              <h2 id="quote-title" className="headline mt-6 text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.3] text-white">
                {quote.title}
              </h2>
              <p className="mt-5 max-w-md text-[1.08rem] leading-9 text-white/75">{quote.description}</p>
              <ol className="mt-10 space-y-4">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-4 text-white/80">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 font-latin text-xs text-cyan">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <a href="#consultation" className="mt-10 inline-flex text-sm font-medium text-white/70 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white">
                {quote.secondary}
              </a>
            </div>

            <form ref={formRef} onSubmit={onSubmit} noValidate className="quote-form grid gap-5 sm:grid-cols-2 lg:col-span-7">
              <div className="field">
                <label htmlFor={`${uid}-name`}>الاسم الكامل {req}</label>
                <input {...field("name")} type="text" autoComplete="name" required maxLength={80} />
                {err("name")}
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor={`${uid}-service`}>نوع الخدمة المطلوبة {req}</label>
                <select {...field("service")} required>
                  <option value="" disabled>
                    اختر نوع الخدمة
                  </option>
                  {quote.services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {err("service")}
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor={`${uid}-details`}>وصف مختصر للمشروع ومتطلباته {req}</label>
                <textarea {...field("details")} rows={4} maxLength={800} required />
                {ref ? <p className="mt-2 text-xs text-cyan">مشروع مرجعي من المعرض: {ref}</p> : null}
                {err("details")}
              </div>
              <button type="button" className="sm:col-span-2 text-start text-sm font-semibold text-cyan underline underline-offset-4" onClick={() => setExtrasOpen(x => !x)} aria-expanded={extrasOpen}>
                {extrasOpen ? "− إخفاء المعلومات الاختيارية" : "+ إضافة معلومات اختيارية"}
              </button>
              {extrasOpen ? <>
              <div className="field">
                <label htmlFor={`${uid}-company`}>اسم الشركة أو الجهة {opt}</label>
                <input {...field("company")} type="text" autoComplete="organization" maxLength={80} />
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor={`${uid}-link`}>رابط مرجعي أو مثال يعجبك {opt}</label>
                <input {...field("link")} type="url" inputMode="url" maxLength={300} dir="ltr" placeholder="https://" />
                {err("link")}
              </div>
              <div className="field">
                <label htmlFor={`${uid}-budget`}>الميزانية التقريبية {opt}</label>
                <input {...field("budget")} type="text" maxLength={60} placeholder="مثال: لم تُحدّد بعد" />
              </div>
              <div className="field">
                <label htmlFor={`${uid}-deadline`}>موعد التسليم المتوقع {opt}</label>
                <input {...field("deadline")} type="text" maxLength={60} placeholder="مثال: خلال شهر" />
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor={`${uid}-email`}>البريد الإلكتروني للتواصل {opt}</label>
                <input {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={120} dir="ltr" />
                {err("email")}
              </div>


              </> : null}
              <div className="sm:col-span-2 rounded-2xl border border-white/15 bg-white/5 p-4">
                <button type="button" className="text-sm font-semibold text-cyan underline underline-offset-4" aria-expanded={previewOpen} onClick={() => setPreviewOpen(x => !x)}>
                  {previewOpen ? "إخفاء معاينة رسالة واتساب" : "معاينة رسالة واتساب قبل إرسال الطلب"}
                </button>
                {previewOpen ? <div className="mt-4 grid gap-3">
                  <textarea readOnly rows={9} dir="rtl" aria-label="معاينة رسالة واتساب" value={buildMessage()} className="w-full rounded-xl border border-white/20 bg-petrol/40 p-3 text-sm leading-7 text-white/90" />
                  <button type="button" className="justify-self-start rounded-full border border-cyan/50 px-4 py-2 text-sm text-cyan hover:bg-cyan/10" onClick={async () => {
                    try { await navigator.clipboard.writeText(buildMessage()); setCopyStatus("تم نسخ الرسالة."); }
                    catch { setCopyStatus("تعذّر النسخ التلقائي. يمكنك تحديد النص ونسخه يدوياً."); }
                  }}>نسخ رسالة الطلب</button>
                  {copyStatus ? <p role="status" className="text-xs text-white/70">{copyStatus}</p> : null}
                </div> : null}
              </div>
              <div className="sm:col-span-2">
                <div className="mb-4 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-xs text-white/75">
                    <span>اكتمال المعلومات الأساسية</span><span className="font-latin" dir="ltr">{complete} / 3</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="اكتمال المعلومات الأساسية" aria-valuenow={complete} aria-valuemin={0} aria-valuemax={3}>
                    <div className="h-full rounded-full bg-cyan transition-[width] duration-300" style={{ width: (complete / 3 * 100) + "%" }} />
                  </div>
                  <p className="mt-2 text-xs text-white/60">{complete === 3 ? "الحقول الأساسية مكتملة وجاهزة للمراجعة." : "أكمل الاسم ونوع الخدمة ووصف المشروع قبل الإرسال."} الوصف: {f.details.trim().length} حرفاً (الحد الأدنى 10).</p>
                </div>
                <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70" aria-label="معلومات مهمة عن طلب السعر">
                  <span>✓ استشارة أولية مجانية</span><span>✓ عرض حسب متطلبات المشروع</span><span>✓ مراحل عمل واضحة</span>
                </div>
                <button type="submit" className="btn btn-primary w-full !min-h-14 text-[1.05rem]">
                  <WhatsAppIcon className="size-5" />
                  {quote.cta}
                </button>
                <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <p className="max-w-lg text-xs leading-6 text-white/55">
                    {quote.note} {quote.privacyNote}
                  </p>
                  <button type="button" onClick={clearForm} className="text-xs font-medium text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
                    مسح النموذج
                  </button>
                </div>
                {restored ? (
                  <p role="status" className="mt-2 text-xs text-cyan">
                    استعدنا مسودتك السابقة المحفوظة في هذا المتصفح فقط.
                  </p>
                ) : null}
                {href ? (
                  <div role="status" className="mt-4 rounded-2xl border border-cyan/40 bg-cyan/10 p-4 text-sm leading-7 text-white/85">
                    فُتح واتساب برسالة جاهزة؛ اضغط «إرسال» هناك لإيصال طلبك. إن لم يُفتح تلقائياً{" "}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan underline underline-offset-4">
                      افتح واتساب من هنا
                    </a>
                    .
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
