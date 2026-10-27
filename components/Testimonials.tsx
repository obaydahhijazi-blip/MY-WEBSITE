"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";

/** One large quote at a time (rendered only when real, consented testimonials exist). */
export function Testimonials({ testimonials, index }: { testimonials: SiteContent["testimonials"]; index: string }) {
  const items = testimonials.items;
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  if (items.length === 0) return null;

  const count = items.length;
  const go = (n: number) => setI((n + count) % count);
  const t = items[i];

  return (
    <section id="testimonials" className="section bg-paper-2" aria-labelledby="testimonials-title">
      <div className="container-x">
        <header className="reveal">
          <p className="section-index">
            <span className="num">{index}</span>
            <span className="rule" aria-hidden="true" />
            <span>{testimonials.label}</span>
          </p>
          <h2 id="testimonials-title" className="headline mt-6 text-[clamp(1.9rem,4vw,3rem)] text-ink">
            {testimonials.title}
          </h2>
        </header>

        <figure
          className="quote-stage reveal"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 50) go(i + (dx > 0 ? 1 : -1));
          }}
        >
          <span className="quote-mark font-latin" aria-hidden="true">
            &rdquo;
          </span>
          <div key={t.id} className="quote-body" aria-live="polite">
            {t.demo ? <span className="demo-badge !static mb-6 inline-block">عينة تجريبية</span> : null}
            <blockquote className="max-w-4xl text-[clamp(1.35rem,2.6vw,2.15rem)] font-medium leading-[1.8] text-ink">{t.quote}</blockquote>
            {t.name || t.company ? (
              <figcaption className="mt-10 flex items-center gap-4">
                {t.logo ? (
                  <Image src={t.logo.src} alt={t.logo.alt} width={t.logo.width} height={t.logo.height} className="h-10 w-auto max-w-28 object-contain" unoptimized={t.logo.src.endsWith(".svg")} />
                ) : (
                  <span className="block h-12 w-1 rounded-full bg-cyan" aria-hidden="true" />
                )}
                <span>
                  {t.name ? <span className="block text-lg font-semibold text-ink">{t.name}</span> : null}
                  <span className="block text-sm text-muted">{[t.role, t.company].filter(Boolean).join("، ")}</span>
                </span>
              </figcaption>
            ) : null}
          </div>

          {count > 1 ? (
            <div className="mt-12 flex items-center justify-between gap-6 border-t border-line pt-6">
              <div className="flex gap-2" role="group" aria-label="اختيار الشهادة">
                {items.map((x, n) => (
                  <button key={x.id} type="button" className="quote-dot" aria-label={`الشهادة ${n + 1}`} aria-current={n === i || undefined} onClick={() => go(n)} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-latin text-sm text-muted" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => go(i - 1)} className="carousel-btn" aria-label="الشهادة السابقة">
                  <ArrowIcon direction="right" />
                </button>
                <button type="button" onClick={() => go(i + 1)} className="carousel-btn" aria-label="الشهادة التالية">
                  <ArrowIcon direction="left" />
                </button>
              </div>
            </div>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
