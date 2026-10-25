"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";

/** Rendered only when real, consented testimonials exist (managed in /admin). */
export function Testimonials({ testimonials, index }: { testimonials: SiteContent["testimonials"]; index: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const items = testimonials.items;

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    // RTL: scrollLeft runs from 0 (start) to negative values.
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setEdge({ start: pos < 4, end: pos > max - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: -dir * (card.getBoundingClientRect().width + 20), behavior: reduce ? "auto" : "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="section border-t border-line bg-paper" aria-labelledby="testimonials-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
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
          {items.length > 1 ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} disabled={edge.start} className="carousel-btn" aria-label="الشهادة السابقة">
                <ArrowIcon direction="right" />
              </button>
              <button type="button" onClick={() => go(1)} disabled={edge.end} className="carousel-btn" aria-label="الشهادة التالية">
                <ArrowIcon direction="left" />
              </button>
            </div>
          ) : null}
        </div>

        <ul ref={track} className="testimonial-track reveal mt-12" data-lenis-prevent aria-label={testimonials.title}>
          {items.map((t) => (
            <li key={t.id} className="testimonial-card relative">
              {t.demo ? <span className="demo-badge !left-6 !right-auto">عينة تجريبية</span> : null}
              <span className="font-latin text-5xl leading-none text-cyan" aria-hidden="true">
                &rdquo;
              </span>
              <blockquote className="mt-4 flex-1 text-[1.12rem] leading-9 text-ink">{t.quote}</blockquote>
              {t.name || t.company ? (
                <footer className="mt-8 flex items-center gap-4 border-t border-line pt-6">
                  {t.logo ? (
                    <Image src={t.logo.src} alt={t.logo.alt} width={t.logo.width} height={t.logo.height} className="h-9 w-auto max-w-24 object-contain grayscale" unoptimized={t.logo.src.endsWith(".svg")} />
                  ) : null}
                  <span>
                    {t.name ? <span className="block font-semibold text-ink">{t.name}</span> : null}
                    <span className="block text-sm text-muted">{[t.role, t.company].filter(Boolean).join("، ")}</span>
                  </span>
                </footer>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
