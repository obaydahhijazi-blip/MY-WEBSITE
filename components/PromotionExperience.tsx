"use client";

import { useEffect, useRef, useState } from "react";

export type Promotion = { enabled: boolean; percent: number; start: string; end: string; headline: string; subtitle: string; cta: string };
const remaining = (end: number, now: number) => {
  const n = Math.max(0, Math.ceil((end - now) / 1000));
  return { days: Math.floor(n / 86400), hours: Math.floor(n % 86400 / 3600), minutes: Math.floor(n % 3600 / 60), seconds: n % 60 };
};
const pad = (n: number) => String(n).padStart(2, "0");

export function PromotionExperience({ campaign }: { campaign: Promotion }) {
  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const valid = campaign.enabled && Number.isFinite(Date.parse(campaign.start)) && Number.isFinite(Date.parse(campaign.end))
    && Date.parse(campaign.end) > Date.parse(campaign.start) && campaign.percent > 0 && campaign.percent <= 100;
  const active = valid && now >= Date.parse(campaign.start) && now < Date.parse(campaign.end);
  const end = Date.parse(campaign.end);
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
    const timer = window.setTimeout(() => { setOpen(true); try { sessionStorage.setItem(id, "1"); } catch { /* ignore */ } }, 2200);
    return () => window.clearTimeout(timer);
  }, [active, campaign.end, campaign.percent]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", key);
    close.current?.focus();
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  if (!active) return null;
  const time = remaining(end, now);
  return <>
    <aside className="promo-marquee" aria-label={`خصم ${campaign.percent}% لمدة محدودة`}>
      <div className="promo-track">
        {[0,1].map(copy=><span className="promo-track-set" key={copy}>
          {Array.from({length:4},(_,i)=><span key={i} className="promo-track-item">
            <span className="promo-spark" aria-hidden="true">✦</span>
            <strong>خصم {campaign.percent}%</strong>
            <span>على خدمات التصميم والإنتاج البصري</span>
            <span className="promo-spark" aria-hidden="true">✦</span>
          </span>)}
        </span>)}
      </div>
      <a href="#quote" className="promo-marquee-cta">اطلب عرض سعر</a>
    </aside>
    {open && <div className="promo-backdrop" onPointerDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="promo-title" aria-describedby="promo-description" className="promo-modal" dir="rtl">
        <button ref={close} onClick={() => setOpen(false)} type="button" className="promo-close" aria-label="إغلاق الإعلان">×</button>
        <div className="promo-modal-top"><span>عرض لفترة محدودة</span><span>OBAYDAH.GRAPHIC</span></div>
        <div className="promo-big-number" dir="ltr"><span>%</span>{campaign.percent}</div>
        <h2 id="promo-title" className="promo-headline">{campaign.headline}</h2>
        <p id="promo-description" className="promo-subtitle">{campaign.subtitle}</p>
        <p className="promo-count-label">الوقت المتبقي لانتهاء العرض</p>
        <div className="promo-counter" dir="ltr">
          {([[time.days,"يوم"],[time.hours,"ساعة"],[time.minutes,"دقيقة"],[time.seconds,"ثانية"]] as [number,string][]).map(([value,label])=><span className="promo-counter-unit" key={label}><strong>{pad(value)}</strong><small>{label}</small></span>)}
        </div>
        <a href="#quote" className="promo-button" onClick={() => setOpen(false)}>{campaign.cta} <span aria-hidden="true">↖</span></a>
        <p className="promo-legal">يسري العرض خلال الفترة المحددة فقط. تفاصيل الخدمات والسعر النهائي تُوضَّح في عرض السعر.</p>
      </section>
    </div>}
  </>;
}
