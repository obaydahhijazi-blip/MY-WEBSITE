"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { QUOTE_PREFILL } from "@/lib/quote-bus";

export type Promotion = { enabled: boolean; percent: number; start: string; end: string; headline: string; subtitle: string; cta: string };
const remaining = (end: number, now: number) => {
  const n = Math.max(0, Math.ceil((end - now) / 1000));
  return { days: Math.floor(n / 86400), hours: Math.floor(n % 86400 / 3600), minutes: Math.floor(n % 3600 / 60), seconds: n % 60 };
};
const pad = (n: number) => String(n).padStart(2, "0");
// Show once per session, after the visitor has had a moment to explore.
const SHOW_DELAY_MS = 5000;
const AUTO_CLOSE_MS = 12000;

export function PromotionExperience({ campaign, services = [] }: { campaign: Promotion; services?: string[] }) {
  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(services[0] ?? "");
  const [autoCloseRemaining, setAutoCloseRemaining] = useState(AUTO_CLOSE_MS);
  const [autoClosePaused, setAutoClosePaused] = useState(false);
  const remainingRef = useRef(AUTO_CLOSE_MS);
  const pausedRef = useRef(false);
  const close = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLElement>(null);
  const valid = campaign.enabled && Number.isFinite(Date.parse(campaign.start)) && Number.isFinite(Date.parse(campaign.end))
    && Date.parse(campaign.end) > Date.parse(campaign.start) && campaign.percent > 0 && campaign.percent <= 100;
  const start = Date.parse(campaign.start);
  const end = Date.parse(campaign.end);
  const active = valid && now >= start && now < end;
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!active) return;
    const id = `promo-seen:${campaign.end}:${campaign.percent}`;
    try { if (sessionStorage.getItem(id)) return; } catch { /* storage disabled */ }
    const timer = window.setTimeout(() => {
      remainingRef.current = AUTO_CLOSE_MS;
      pausedRef.current = false;
      setAutoCloseRemaining(AUTO_CLOSE_MS);
      setAutoClosePaused(false);
      setOpen(true);
      try { sessionStorage.setItem(id, "1"); } catch { /* ignore */ }
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, campaign.end, campaign.percent]);
  // Auto-dismiss clock uses elapsed wall-clock time instead of assuming a
  // fixed number of interval callbacks. Hover, keyboard interaction and
  // background tabs pause the countdown to avoid closing during a decision.
  useEffect(() => {
    if (!open) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const current = performance.now();
      const elapsed = Math.max(0, current - last);
      last = current;
      if (document.hidden || pausedRef.current) return;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      setAutoCloseRemaining(remainingRef.current);
      if (remainingRef.current <= 0) setOpen(false);
    }, 80);
    return () => window.clearInterval(timer);
  }, [open]);

  const pauseDismissal = (value: boolean) => {
    pausedRef.current = value;
    setAutoClosePaused(value);
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); return; }
      if (e.key !== "Tab" || !modal.current) return;
      const controls = Array.from(modal.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])')).filter(el => el.getClientRects().length > 0);
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    close.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [open]);
  if (!active) return null;
  const time = remaining(end, now);
  const progress = Math.max(0, Math.min(100, (now-start)/(end-start)*100));
  const secondsToClose = Math.ceil(autoCloseRemaining / 1000);
  const autoClosePercent = Math.max(0, Math.min(100, autoCloseRemaining / AUTO_CLOSE_MS * 100));
  const features = ["هوية بصرية مؤثرة", "تنفيذ بصري احترافي", "حلول مناسبة للمشروع"];
  const chooseOffer = () => {
    setOpen(false);
    if (selectedService) window.dispatchEvent(new CustomEvent(QUOTE_PREFILL, {detail:{service:selectedService}}));
    window.setTimeout(() => document.getElementById("quote")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}), 60);
  };
  const dialog = open && (
    <div className="promo-backdrop" onPointerDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="promo-shell">
        <div className="promo-cosmos" aria-hidden="true">
          <span className="promo-halo promo-halo-one"/><span className="promo-halo promo-halo-two"/>
          <span className="promo-orb promo-orb-a"/><span className="promo-orb promo-orb-b"/><span className="promo-orb promo-orb-c"/>
          <span className="promo-satellite promo-satellite-one">✦</span><span className="promo-satellite promo-satellite-two">✧</span>
        </div>
        <section ref={modal} role="dialog" aria-modal="true" aria-labelledby="promo-title" aria-describedby="promo-description"
          className="promo-modal promo-modal-premium" dir="rtl"
          onPointerEnter={() => pauseDismissal(true)}
          onPointerLeave={() => pauseDismissal(false)}
          onKeyDownCapture={e => { if (e.key === "Tab" || e.key === "Enter" || e.key === " " || e.key.startsWith("Arrow")) pauseDismissal(true); }}
          onPointerMove={e => { if (e.pointerType !== "mouse") return; const rect=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--promo-x",`${((e.clientX-rect.left)/rect.width*100).toFixed(1)}%`);e.currentTarget.style.setProperty("--promo-y",`${((e.clientY-rect.top)/rect.height*100).toFixed(1)}%`); }}>
          <div className="promo-shine" aria-hidden="true"/>
          <button ref={close} onClick={() => setOpen(false)} type="button" className="promo-close" aria-label="إغلاق الإعلان">×</button>
          <div className="promo-modal-top"><span className="promo-label"><span className="promo-pulse" aria-hidden="true"/>لفترة محدودة فقط</span><span className="font-latin">OBAYDAH.GRAPHIC</span></div>
          <div className="promo-featured">
            <div className="promo-offer-seal" aria-label={`خصم ${campaign.percent} بالمئة`}><span>OFF</span><strong dir="ltr">{campaign.percent}%</strong><small>على الخدمات</small></div>
            <div className="promo-featured-text">
              <span className="promo-eyebrow">THE CREATIVE WEEK</span>
              <h2 id="promo-title" className="promo-headline">{campaign.headline}</h2>
              <p id="promo-description" className="promo-subtitle">{campaign.subtitle}</p>
            </div>
          </div>
          <div className="promo-benefits">{features.map(x=><span key={x}><span aria-hidden="true">✓</span>{x}</span>)}</div>
          {services.length > 0 && <div className="promo-services" aria-label="اختيار خدمة للعرض">
            <span className="promo-choose-label">اختر الخدمة التي تهمّك</span>
            <div className="promo-service-list">
              {services.slice(0,4).map(service=><button type="button" key={service} className="promo-service-choice" aria-pressed={selectedService===service} onClick={()=>setSelectedService(service)}>{service}</button>)}
            </div>
          </div>}
          <div className="promo-clock-row">
            <span>ينتهي العرض خلال</span><span className="promo-live-indicator"><span aria-hidden="true"/>عداد مباشر</span>
          </div>
          <div className="promo-counter promo-flip-counter" dir="ltr" aria-label="الوقت المتبقي لنهاية حملة الخصم">
            {([[time.days,"يوم"],[time.hours,"ساعة"],[time.minutes,"دقيقة"],[time.seconds,"ثانية"]] as [number,string][]).map(([value,label]) =>
              <span className="promo-counter-unit promo-flip-unit" key={label}>
                <span className="promo-flip-reflection" aria-hidden="true" />
                <span className="promo-flip-stage">
                  <strong className="promo-flip-digits" key={pad(value)}>{pad(value)}</strong>
                </span>
                <small>{label}</small>
              </span>)}
          </div>
          <div className="promo-progress" role="progressbar" aria-label="الوقت المنقضي من العرض" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{width:`${progress}%`}}/></div>
          <button type="button" className="promo-button" onClick={chooseOffer}><span>{campaign.cta}</span><span aria-hidden="true">↗</span></button>
          <button type="button" className="promo-later" onClick={()=>setOpen(false)}>استكشاف الموقع أولاً</button>
          <p className="promo-legal">الخصم لفترة الحملة فقط؛ السعر النهائي ونطاق العمل يتم تحديدهما في عرض السعر.</p>
          <div className="promo-auto-dismiss" aria-label="الإغلاق التلقائي للنافذة">
            <div className="promo-auto-dismiss-caption">
              <span><span className="promo-auto-dismiss-dot" aria-hidden="true" />{autoClosePaused ? "توقف العداد أثناء تفاعلك" : "تغلق هذه النافذة تلقائياً"}</span>
              <strong dir="ltr">{secondsToClose} ث</strong>
            </div>
            <div className="promo-auto-dismiss-track" role="progressbar" aria-label="الوقت المتبقي حتى إغلاق النافذة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(autoClosePercent)}>
              <span style={{ width: `${autoClosePercent}%` }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
  return <>
    <aside className="promo-marquee" aria-label={`خصم ${campaign.percent}% لمدة محدودة`}>
      <div className="promo-track">
        {[0,1].map(copy=><span className="promo-track-set" key={copy}>
          {Array.from({length:4},(_,i)=><span key={i} className="promo-track-item">
            <span className="promo-spark" aria-hidden="true">✦</span>
            <strong>خصم {campaign.percent}%</strong>
            <span>على خدمات التصميم والإنتاج البصري • لفترة محدودة</span>
            <span className="promo-spark" aria-hidden="true">✦</span>
          </span>)}
        </span>)}
      </div>
    </aside>
    {dialog && createPortal(dialog, document.body)}
  </>;
}
