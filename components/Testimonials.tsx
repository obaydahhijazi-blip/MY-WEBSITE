"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SiteContent, Testimonial } from "@/lib/cms/types";

function MetalStar({ n, progress }: { n: number; progress: number }) {
  const step = n - 2;
  const drift = progress * step * 32;
  return <span className="metal-star" style={{ transform: `translate3d(calc(${drift}px + var(--star-parallax-x, 0px)),calc(${-Math.abs(step) * 12 * progress}px + var(--star-parallax-y, 0px)),0) rotateY(${step * progress * 13}deg) rotateZ(${step * progress * 7}deg)` }}>
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


/** A testimonial stays readable without a photo; never invent a customer's face. */
function ReviewCard({ review }: { review: Testimonial }) {
  const rating = Math.max(1, Math.min(5, Math.round(review.rating ?? 5)));
  const initials = (review.name || "عميل").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("");
  return (
    <article className="review-card">
      <header className="review-card-header">
        <div className="review-avatar" aria-hidden={review.photo ? undefined : true}>
          {review.photo
            ? <Image src={review.photo.src} alt={review.photo.alt || `صورة ${review.name || "صاحب التقييم"}`} width={review.photo.width} height={review.photo.height} sizes="64px" className="h-full w-full object-cover" unoptimized={review.photo.src.endsWith(".svg")} />
            : <span className="review-avatar-initials" aria-hidden="true">{initials}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="review-name">{review.name || "عميل"}</h3>
          {(review.role || review.company) && <p className="review-role">{[review.role, review.company].filter(Boolean).join(" · ")}</p>}
        </div>
        {review.demo && <span className="review-demo-tag">تجريبي</span>}
      </header>
      <div className="review-rating" role="img" aria-label={`التقييم ${rating} من 5 نجوم`}>
        {Array.from({ length: 5 }, (_, n) => (
          <svg key={n} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={n < rating ? "review-star is-active" : "review-star"}>
            <path d="M12 1.8 15.05 8l6.85 1.02-4.95 4.82 1.17 6.81L12 17.44 5.88 20.65l1.17-6.81L2.1 9.02 8.95 8Z" />
          </svg>
        ))}
        <span className="review-rating-number" dir="ltr">{rating}.0 / 5</span>
      </div>
      <blockquote className="review-copy">{review.quote}</blockquote>
      {review.logo && <div className="review-company-logo"><Image src={review.logo.src} alt={review.logo.alt || "شعار الجهة"} width={review.logo.width} height={review.logo.height} sizes="110px" className="max-h-9 w-auto max-w-28 object-contain" unoptimized={review.logo.src.endsWith(".svg")} /></div>}
    </article>
  );
}

/** Five metallic stars separate on scroll; responsive review cards follow in a grid. */
export function Testimonials({ testimonials, index }: { testimonials: SiteContent["testimonials"]; index: string }) {
  const items = testimonials.items;
  const [progress, setProgress] = useState(0);
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
  return (
    <section ref={root} id="testimonials" className="section testimonial-cinema bg-paper-2" aria-labelledby="testimonials-title" onPointerMove={e => { if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const rect=e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--star-parallax-x",`${((e.clientX-rect.left)/rect.width-.5)*13}px`); e.currentTarget.style.setProperty("--star-parallax-y",`${((e.clientY-rect.top)/rect.height-.5)*10}px`); }} onPointerLeave={e => { e.currentTarget.style.setProperty("--star-parallax-x","0px"); e.currentTarget.style.setProperty("--star-parallax-y","0px"); }}>
      <div className="container-x">
        <header className="reveal">
          <p className="section-index"><span className="num">{index}</span><span className="rule" aria-hidden="true" /><span>{testimonials.label}</span></p>
          <h2 id="testimonials-title" className="headline mt-6 text-[clamp(1.9rem,4vw,3rem)] text-ink">{testimonials.title}</h2>
        </header>
        <div className="metal-stars-wrap" aria-label="خمس نجوم ذهبية">
          {[0,1,2,3,4].map(n => <MetalStar key={n} n={n} progress={progress} />)}
        </div>
        <div className="reviews-grid" style={{opacity: Math.max(.15, Math.min(1, (progress - .13) / .7)), transform: `translateY(${(1-progress)*16}px)`}}>
          {items.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      </div>
    </section>
  );
}
