"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";

function MetalStar({ n, progress }: { n: number; progress: number }) {
  const step = n - 2;
  const drift = progress * step * 32;
  return <span className="metal-star" style={{ transform: `translate3d(${drift}px,${-Math.abs(step) * 12 * progress}px,0) rotateY(${step * progress * 13}deg) rotateZ(${step * progress * 7}deg)` }}>
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`gold-metal-${n}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4b9" />
          <stop offset="18%" stopColor="#e9a827" />
          <stop offset="40%" stopColor="#fff5c0" />
          <stop offset="54%" stopColor="#99600d" />
          <stop offset="72%" stopColor="#fbd365" />
          <stop offset="100%" stopColor="#8a490a" />
        </linearGradient>
      </defs>
      <path d="M50 2L61.7 36.5L98 36.5L68.8 58L80 94L50 73L20 94L31.2 58L2 36.5L38.3 36.5Z" fill={`url(#gold-metal-${n})`} stroke="#ad7413" strokeWidth="1.25" strokeLinejoin="miter" />
      <path d="M50 2L50 73L38.3 36.5Z" fill="#fff5c0" opacity=".38"/>
      <path d="M50 2L61.7 36.5L50 73Z" fill="#562e05" opacity=".13"/>
      <path d="M50 73L80 94L68.8 58Z" fill="#fff8d4" opacity=".30"/>
    </svg>
  </span>;
}

/** Five sculpted gold stars separate as the testimonial section scrolls into view. */
export function Testimonials({ testimonials, index }: { testimonials: SiteContent["testimonials"]; index: string }) {
  const items = testimonials.items;
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const touch = useRef<number | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!items.length) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { requestAnimationFrame(() => setProgress(1)); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = root.current?.getBoundingClientRect();
      if (!box) return;
      const p = Math.max(0, Math.min(1, ((window.innerHeight * .74) - box.top) / Math.min(430, window.innerHeight * .59)));
      setProgress(prev => Math.abs(prev - p) > .005 ? p : prev);
    };
    const scroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => { window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); cancelAnimationFrame(raf); };
  }, [items.length]);
  if (!items.length) return null;
  const count = items.length;
  const go = (n: number) => setI((n + count) % count);
  const t = items[i];

  return (
    <section ref={root} id="testimonials" className="section testimonial-cinema bg-paper-2" aria-labelledby="testimonials-title">
      <div className="container-x">
        <header className="reveal">
          <p className="section-index"><span className="num">{index}</span><span className="rule" aria-hidden="true" /><span>{testimonials.label}</span></p>
          <h2 id="testimonials-title" className="headline mt-6 text-[clamp(1.9rem,4vw,3rem)] text-ink">{testimonials.title}</h2>
        </header>
        <div className="metal-stars-wrap" aria-label="خمس نجوم ذهبية">
          {[0,1,2,3,4].map(n => <MetalStar key={n} n={n} progress={progress} />)}
        </div>
        <figure className="quote-stage testimonial-quote-stage" style={{ opacity: Math.max(0, Math.min(1, (progress - .24) / .65)), transform: `translateY(${(1-progress)*24}px)` }}
          onTouchStart={e => (touch.current = e.touches[0].clientX)}
          onTouchEnd={e => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(i + (dx > 0 ? 1 : -1)); }}>
          <span className="quote-mark font-latin" aria-hidden="true">&rdquo;</span>
          <div key={t.id} className="quote-body" aria-live="polite">
            {t.demo ? <span className="demo-badge !static mb-6 inline-block">عينة تجريبية</span> : null}
            <blockquote className="max-w-4xl text-[clamp(1.35rem,2.6vw,2.15rem)] font-medium leading-[1.8] text-ink">{t.quote}</blockquote>
            {t.name || t.company ? <figcaption className="mt-10 flex items-center gap-4">
              {t.logo ? <Image src={t.logo.src} alt={t.logo.alt} width={t.logo.width} height={t.logo.height} className="h-10 w-auto max-w-28 object-contain" unoptimized={t.logo.src.endsWith(".svg")} /> : <span className="block h-12 w-1 rounded-full bg-cyan" aria-hidden="true" />}
              <span>{t.name ? <span className="block text-lg font-semibold text-ink">{t.name}</span> : null}<span className="block text-sm text-muted">{[t.role, t.company].filter(Boolean).join("، ")}</span></span>
            </figcaption> : null}
          </div>
          {count > 1 ? <div className="mt-12 flex items-center justify-between gap-6 border-t border-line pt-6">
            <div className="flex gap-2" role="group" aria-label="اختيار الشهادة">{items.map((x, n) => <button key={x.id} type="button" className="quote-dot" aria-label={`الشهادة ${n+1}`} aria-current={n === i || undefined} onClick={() => go(n)} />)}</div>
            <div className="flex items-center gap-3"><span className="font-latin text-sm text-muted" aria-hidden="true">{String(i+1).padStart(2,"0")} / {String(count).padStart(2,"0")}</span>
              <button type="button" onClick={() => go(i - 1)} className="carousel-btn" aria-label="الشهادة السابقة"><ArrowIcon direction="right" /></button>
              <button type="button" onClick={() => go(i + 1)} className="carousel-btn" aria-label="الشهادة التالية"><ArrowIcon direction="left" /></button>
            </div>
          </div> : null}
        </figure>
      </div>
    </section>
  );
}
