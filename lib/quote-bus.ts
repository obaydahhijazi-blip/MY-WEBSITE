"use client";

export const QUOTE_PREFILL = "quote:prefill";
export type QuotePrefill = { service?: string; project?: string };

/** Map portfolio categories to the quote form's service options. */
export const CATEGORY_TO_SERVICE: Record<string, string> = {
  identity: "هوية بصرية",
  social: "تصميم إعلاني وسوشيال ميديا",
  print: "مطبوعات وملفات تعريفية",
  reels: "إنتاج الريلز والفيديو الإعلاني",
  ads: "إنتاج الريلز والفيديو الإعلاني",
  film: "إنتاج الريلز والفيديو الإعلاني",
  motion: "موشن جرافيك",
  ai: "إنتاج بالذكاء الاصطناعي",
};

/** Pre-fill the request-a-quote form (e.g. from «أرغب في مشروع مشابه») and scroll to it. */
export function requestQuote(detail: QuotePrefill) {
  window.dispatchEvent(new CustomEvent<QuotePrefill>(QUOTE_PREFILL, { detail }));
  const el = document.getElementById("quote");
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
