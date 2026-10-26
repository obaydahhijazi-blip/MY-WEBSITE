"use client";
import { useEffect, useId, useRef, useState } from "react";
import { LineIcon } from "@/components/icons";
import { COUNTRY_NAMES_AR } from "@/lib/map/countries";
import type { Service, Stat } from "@/lib/cms/types";

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (time: number) => {
        const t = Math.min(1, (time - start) / 1450);
        el.textContent = String(Math.round(value * (1 - Math.pow(1 - t, 4))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span className="font-latin tabular-nums" dir="ltr"><span ref={ref}>{value}</span><span className="text-cyan">{suffix}</span></span>;
}

export function StatsBand({ stats, countries, countriesTitle, services }: { stats: Stat[]; countries: string[]; countriesTitle: string; services: Service[] }) {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);
  const pinned = useRef<number | null>(null);
  const detail = (stat: Stat) => {
    if (stat.mapLink) return <><p className="stat-detail-title">{countriesTitle}</p><ul className="stat-chip-list">{countries.map(id => <li key={id} className="stat-chip">{COUNTRY_NAMES_AR[id] ?? id}</li>)}</ul></>;
    if (stat.icon === "grid" || stat.label.includes("تخصص")) return <><p className="stat-detail-title">مجالات التخصص</p><ul className="stat-specialties">{services.map((s, i) => <li key={i}><LineIcon name={s.icon} className="size-4 shrink-0 text-cyan"/><span>{s.title}</span></li>)}</ul></>;
    if (stat.icon === "users") return <p className="stat-detail-copy">ثقة أكثر من 150 عميلاً وجهة بمختلف القطاعات</p>;
    if (stat.icon === "clock") return <><p className="stat-detail-title">المسيرة المهنية</p><ol className="stat-career"><li><span>البداية</span><strong>التصميم الإعلاني</strong></li><li><span>التوسع</span><strong>الهوية البصرية والإخراج الفني</strong></li><li><span>اليوم</span><strong>الإنتاج المرئي والذكاء الاصطناعي</strong></li></ol></>;
    return null;
  };
  return <div className="stats-band reveal" onKeyDown={e => { if (e.key === "Escape") { pinned.current = null; setActive(null); } }}>
    <dl className="stats-grid" style={{ ["--n" as string]: stats.length }} data-active={active !== null || undefined}>
      {stats.map((s, i) => {
        const canOpen = Boolean(detail(s));
        const open = active === i && canOpen;
        const id = uid + "-detail-" + i;
        return <div key={s.label} className="stat-cell" data-hover-active={open || undefined}
          onPointerEnter={e => { if (e.pointerType === "mouse" && pinned.current === null && canOpen) setActive(i); }}
          onPointerLeave={e => { if (e.pointerType === "mouse" && pinned.current === null) setActive(null); }}
          onBlur={e => { if (pinned.current === null && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null); }}>
          <button type="button" className="stat-toggle" aria-controls={id} aria-expanded={open}
            aria-label={String(s.value ?? "") + s.suffix + " " + s.label + " — عرض التفاصيل"}
            onFocus={() => { if (pinned.current === null && canOpen) setActive(i); }}
            onClick={() => { if (!canOpen) return; const next = pinned.current === i ? null : i; pinned.current = next; setActive(next); }}>
            <span className="stat-icon" aria-hidden="true"><LineIcon name={s.icon} className="size-[18px]"/></span>
            <span className="stat-value">{s.value !== null ? <CountUp value={s.value} suffix={s.suffix}/> : <span className="font-latin opacity-40">—</span>}</span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-hint">{open ? "إخفاء التفاصيل" : "اكتشف المزيد"}</span>
          </button>
          <div id={id} className="stat-detail" data-open={open || undefined} inert={!open} role="region" aria-label={"تفاصيل " + s.label}>{detail(s)}</div>
        </div>;
      })}
    </dl>
  </div>;
}
