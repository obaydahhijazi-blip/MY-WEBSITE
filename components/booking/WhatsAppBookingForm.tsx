"use client";

import { useId, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

type Props = {
  whatsappNumber: string;
  categories: string[];
  durationMinutes: number;
  submitLabel: string;
  requestNote: string;
  privacyNote: string;
};

type Fields = { name: string; category: string; details: string; when: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", category: "", details: "", when: "" };

/**
 * Primary booking path: four short fields → WhatsApp opens with a prefilled request.
 * Nothing is booked or stored by the site; the visitor sends the message themselves.
 */
export function WhatsAppBookingForm({ whatsappNumber, categories, durationMinutes, submitLabel, requestNote, privacyNote }: Props) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [href, setHref] = useState<string | null>(null);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    setHref(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (f.name.trim().length < 2) found.name = "يرجى كتابة الاسم الكامل.";
    if (!f.category) found.category = "يرجى اختيار نوع المشروع.";
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const message = [
      `مرحباً عبيدة، أرغب في حجز استشارة مجانية لمدة ${durationMinutes} دقيقة.`,
      `الاسم: ${f.name.trim()}`,
      `نوع المشروع: ${f.category}`,
      `تفاصيل المشروع: ${f.details.trim() || "غير محددة"}`,
      `الموعد المفضل: ${f.when.trim() || "غير محدد"}`,
      "أرجو التواصل معي لتأكيد الموعد المناسب.",
    ].join("\n");
    const link = whatsappLink(whatsappNumber, message);
    setHref(link);
    track("consultation_whatsapp_click", { category: f.category });
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

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="field">
        <label htmlFor={`${uid}-name`}>
          الاسم الكامل <span aria-hidden="true" className="text-cyan-ink">*</span>
        </label>
        <input {...field("name")} type="text" autoComplete="name" required maxLength={80} />
        {err("name")}
      </div>
      <div className="field">
        <label htmlFor={`${uid}-category`}>
          نوع المشروع <span aria-hidden="true" className="text-cyan-ink">*</span>
        </label>
        <select {...field("category")} required>
          <option value="" disabled>
            اختر نوع المشروع
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {err("category")}
      </div>
      <div className="field">
        <label htmlFor={`${uid}-details`}>
          نبذة مختصرة عن المشروع <span className="font-normal text-muted">(اختياري)</span>
        </label>
        <textarea {...field("details")} maxLength={600} rows={3} />
      </div>
      <div className="field">
        <label htmlFor={`${uid}-when`}>
          الموعد المفضل <span className="font-normal text-muted">(اختياري)</span>
        </label>
        <input {...field("when")} type="text" maxLength={80} placeholder="مثال: الأحد بعد الخامسة مساءً بتوقيت الرياض" />
      </div>

      <button type="submit" className="btn btn-dark mt-1 w-full !min-h-14 text-[1.02rem]">
        <WhatsAppIcon className="size-5 text-cyan" />
        {submitLabel}
      </button>

      <p className="text-xs leading-6 text-muted">
        {requestNote} {privacyNote}
      </p>

      {href ? (
        <div role="status" className="rounded-2xl border border-cyan/40 bg-cyan/5 p-4 text-sm leading-7 text-ink-2">
          فُتح واتساب برسالة جاهزة؛ اضغط «إرسال» هناك لإيصال طلبك. إن لم يُفتح تلقائياً{" "}
          <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-ink underline underline-offset-4">
            افتح واتساب من هنا
          </a>
          .
        </div>
      ) : null}
    </form>
  );
}
