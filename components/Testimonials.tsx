"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { SiteContent, Testimonial } from "@/lib/cms/types";

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


/** Scrollable review cards with mouse drag, native touch swiping and keyboard-accessible controls. */
export function Testimonials({ testimonials, index }: { testimonials: SiteContent["testimonials"]; index: string }) {
  const items = testimonials.items;
  const carousel = useRef<HTMLDivElement>(null);
  const drag = useRef<{x:number;left:number;active:boolean}|null>(null);
  const [current,setCurrent] = useState(0);
  if (!items.length) return null;
  const go = (next:number) => {
    const el=carousel.current;
    if(!el)return;
    const index=Math.max(0,Math.min(items.length-1,next));
    const card=el.querySelector<HTMLElement>(".review-card");
    if(!card)return;
    const gap=parseFloat(getComputedStyle(el).columnGap)||16;
    el.scrollTo({left:-(card.offsetWidth+gap)*index,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
    setCurrent(index);
  };
  const onDown=(e:PointerEvent<HTMLDivElement>)=>{
    if(e.pointerType!=="mouse" || e.button!==0)return;
    const el=e.currentTarget;
    drag.current={x:e.clientX,left:el.scrollLeft,active:false};
  };
  const onMove=(e:PointerEvent<HTMLDivElement>)=>{
    const item=drag.current;
    if(!item || e.pointerType!=="mouse")return;
    const dx=e.clientX-item.x;
    if(Math.abs(dx)>5 && !item.active){item.active=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add("is-dragging");}
    if(item.active)e.currentTarget.scrollLeft=item.left-dx;
  };
  const onUp=(e:PointerEvent<HTMLDivElement>)=>{
    if(drag.current?.active){
      e.currentTarget.classList.remove("is-dragging");
      if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    }
    drag.current=null;
  };
  const onScroll=()=>{
    const el=carousel.current;
    const card=el?.querySelector<HTMLElement>(".review-card");
    if(!el||!card)return;
    const gap=parseFloat(getComputedStyle(el).columnGap)||16;
    setCurrent(Math.max(0,Math.min(items.length-1,Math.round(Math.abs(el.scrollLeft)/(card.offsetWidth+gap)))));
  };
  return (
    <section id="testimonials" className="section testimonial-cinema bg-paper-2" aria-labelledby="testimonials-title">
      <div className="container-x">
        <header className="reveal">
          <p className="section-index"><span className="num">{index}</span><span className="rule" aria-hidden="true" /><span>{testimonials.label}</span></p>
          <h2 id="testimonials-title" className="headline mt-6 text-[clamp(1.9rem,4vw,3rem)] text-ink">{testimonials.title}</h2>
          <p className="mt-3 text-sm text-muted">اسحب البطاقات يميناً ويساراً لتصفح آراء العملاء.</p>
        </header>
        <div className="reviews-controls">
          <span className="reviews-count font-latin" dir="ltr">{String(current+1).padStart(2,"0")} / {String(items.length).padStart(2,"0")}</span>
          <div className="reviews-arrows">
            <button type="button" className="review-nav" onClick={()=>go(current-1)} disabled={current===0} aria-label="الرأي السابق">→</button>
            <button type="button" className="review-nav" onClick={()=>go(current+1)} disabled={current===items.length-1} aria-label="الرأي التالي">←</button>
          </div>
        </div>
        <div ref={carousel} className="reviews-grid reviews-carousel" dir="rtl" role="region" aria-roledescription="carousel" aria-label="آراء وتجارب العملاء" tabIndex={0}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onScroll={onScroll}
          onKeyDown={e=>{if(e.key==="ArrowRight"){e.preventDefault();go(current-1);}else if(e.key==="ArrowLeft"){e.preventDefault();go(current+1);}}}>
          {items.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      </div>
    </section>
  );
}
