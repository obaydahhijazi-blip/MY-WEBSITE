"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SiteContent, Testimonial } from "@/lib/cms/types";

const normalize = (index: number, length: number) => ((index % length) + length) % length;
const AUTO_ADVANCE_MS = 5600;

function Avatar({ review, featured = false }: { review: Testimonial; featured?: boolean }) {
  const initials = (review.name || "عميل").trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("");
  return (
    <span className={featured ? "review-showcase-avatar is-featured" : "review-showcase-avatar"}>
      {review.photo
        ? <Image src={review.photo.src} alt={review.photo.alt || `صورة ${review.name || "صاحب التقييم"}`}
            width={review.photo.width} height={review.photo.height} sizes={featured ? "70px" : "48px"}
            className="h-full w-full object-cover" unoptimized={review.photo.src.endsWith(".svg")} />
        : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}

function Stars({ rating }: { rating?: number }) {
  if (typeof rating !== "number" || !Number.isFinite(rating)) return null;
  const score = Math.max(1, Math.min(5, Math.round(rating)));
  return <div className="review-showcase-stars" role="img" aria-label={`التقييم ${score} من 5 نجوم`}>
    {Array.from({ length: 5 }, (_, n) => (
      <svg key={n} viewBox="0 0 24 24" className={n < score ? "is-filled" : ""} focusable="false" aria-hidden="true">
        <path d="m12 2 3.06 6.29 6.94 1-5 4.9 1.18 6.9L12 17.83l-6.18 3.26L7 14.19l-5-4.9 6.94-1L12 2Z" />
      </svg>
    ))}
    <span className="review-showcase-score" dir="ltr">{score}.0 / 5</span>
  </div>;
}

export function Testimonials({ testimonials, index }: { testimonials: SiteContent["testimonials"]; index: string }) {
  const items = testimonials.items;
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Cycle through every testimonial while it is visible. Pause whenever the
  // reader hovers, focuses a control, switches tabs, or requests reduced motion.
  // The timer is independent of active so it doesn't reset after every swap.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || items.length < 2) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let hovered = false;
    let focused = false;

    const observer = new IntersectionObserver(
      ([entry]) => { visible = Boolean(entry?.isIntersecting); },
      { threshold: 0.25 },
    );
    observer.observe(section);

    const enter = () => { hovered = true; };
    const leave = () => { hovered = false; };
    const focusIn = () => { focused = true; };
    const focusOut = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !section.contains(event.relatedTarget)) {
        focused = false;
      }
    };
    section.addEventListener("pointerenter", enter);
    section.addEventListener("pointerleave", leave);
    section.addEventListener("focusin", focusIn);
    section.addEventListener("focusout", focusOut);

    const interval = window.setInterval(() => {
      if (visible && !hovered && !focused && !document.hidden && !motion.matches) {
        setActive(previous => normalize(previous + 1, items.length));
      }
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
      section.removeEventListener("pointerenter", enter);
      section.removeEventListener("pointerleave", leave);
      section.removeEventListener("focusin", focusIn);
      section.removeEventListener("focusout", focusOut);
    };
  }, [items.length]);

  if (!items.length) return null;

  const current = normalize(active, items.length);
  const chosen = items[current];
  const nextReviews = items
    .map((review, i) => ({ review, index: i }))
    .filter(entry => entry.index !== current)
    .slice(0, 2);
  const change = (next: number) => setActive(normalize(next, items.length));
  const progressStyle = { ["--review-progress" as string]: `${((current + 1) / items.length) * 100}%` } as CSSProperties;

  return (
    <section ref={sectionRef} id="testimonials" className="section bg-paper-2 review-showcase" aria-labelledby="testimonials-title">
      <div className="container-x">
        <header className="review-showcase-heading">
          <div>
            <p className="section-index"><span className="num">{index}</span><span className="rule" aria-hidden="true" /><span>{testimonials.label}</span></p>
            <h2 id="testimonials-title" className="headline mt-6 text-[clamp(1.9rem,4vw,3rem)] text-ink">{testimonials.title}</h2>
            <p className="review-showcase-intro">تجارب وآراء تساعدك على معرفة أسلوب العمل عن قرب.</p>
          </div>
          <div className="review-showcase-heading-side">
            <span className="review-showcase-heading-index font-latin" dir="ltr">{String(current + 1).padStart(2, "0")} <span>/</span> {String(items.length).padStart(2, "0")}</span>
            <div className="review-showcase-heading-controls" aria-label="التنقل بين آراء العملاء">
              <button type="button" onClick={() => change(current - 1)} disabled={items.length < 2}
                aria-label="الرأي السابق" className="review-showcase-nav">→</button>
              <button type="button" onClick={() => change(current + 1)} disabled={items.length < 2}
                aria-label="الرأي التالي" className="review-showcase-nav">←</button>
            </div>
          </div>
        </header>

        <div className={nextReviews.length ? "review-showcase-layout" : "review-showcase-layout is-single"}>
          <article key={chosen.id} className="review-showcase-feature" aria-live="polite">
            <div className="review-showcase-glow" aria-hidden="true" />
            <div className="review-showcase-feature-head">
              <span className="review-showcase-eyebrow">CLIENT STORIES <span> / </span> {String(current + 1).padStart(2, "0")}</span>
              {chosen.demo ? <span className="review-showcase-demo">نموذج تجريبي</span> : <span className="review-showcase-editorial">تجربة تعاون</span>}
            </div>
            <div className="review-showcase-quote-mark" aria-hidden="true">“</div>
            <blockquote className="review-showcase-feature-quote">{chosen.quote}</blockquote>
            <div className="review-showcase-feature-bottom">
              <div className="review-showcase-identity">
                <Avatar review={chosen} featured />
                <div className="min-w-0">
                  <strong>{chosen.name || "عميل"}</strong>
                  {(chosen.role || chosen.company) && <span>{[chosen.role, chosen.company].filter(Boolean).join(" · ")}</span>}
                </div>
              </div>
              <div className="review-showcase-feature-meta">
                <Stars rating={chosen.rating} />
                {chosen.logo && <Image src={chosen.logo.src} alt={chosen.logo.alt || "شعار الجهة"} width={chosen.logo.width} height={chosen.logo.height}
                  className="review-showcase-client-logo object-contain" unoptimized={chosen.logo.src.endsWith(".svg")} />}
              </div>
            </div>
            <div className="review-showcase-feature-line" aria-hidden="true" />
          </article>

          {nextReviews.length > 0 && <div className="review-showcase-side" aria-label="آراء أخرى">
            {nextReviews.map(({ review, index: itemIndex }) => (
              <button key={review.id} type="button" className="review-showcase-preview"
                onClick={() => change(itemIndex)} aria-label={`عرض رأي ${review.name || "العميل"}`}>
                <div className="review-showcase-preview-top">
                  <Avatar review={review} />
                  <div className="review-showcase-preview-author">
                    <strong>{review.name || "عميل"}</strong>
                    <small>{[review.role, review.company].filter(Boolean).join(" · ") || "تجربة تعاون"}</small>
                  </div>
                  <span className="review-showcase-preview-arrow" aria-hidden="true">↗</span>
                </div>
                <p className="review-showcase-preview-quote">{review.quote}</p>
                <div className="review-showcase-preview-foot">
                  <Stars rating={review.rating} />
                  {review.demo && <span>تجريبي</span>}
                </div>
              </button>
            ))}
          </div>}
        </div>

        {items.length > 1 && <div className="review-showcase-footer" style={progressStyle}>
          <div className="review-showcase-progress" aria-hidden="true"><span /></div>
          <div className="review-showcase-pages" role="group" aria-label="اختر رأي العميل">
            {items.map((item, i) => <button type="button" key={item.id} onClick={() => change(i)}
              className={current === i ? "is-current" : ""} aria-label={`الرأي ${i + 1}`} aria-current={current === i ? "true" : undefined} />)}
          </div>
          <span className="review-showcase-footer-note">الآراء تتبدّل تلقائياً</span>
        </div>}
      </div>
    </section>
  );
}
