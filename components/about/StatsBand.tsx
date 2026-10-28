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
        const t = Math.min(1, (time - start) / 2500);
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [touchOpen, setTouchOpen] = useState(false);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActive(null);
        setTouchOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setActive(null); setTouchOpen(false); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const detail = (stat: Stat) => {
    if (stat.mapLink) return <><p className="stat-detail-title">{countriesTitle}</p><ul className="stat-chip-list">{countries.map(id => <li key={id} className="stat-chip">{COUNTRY_NAMES_AR[id] ?? id}</li>)}</ul></>;
    if (stat.icon === "grid" || stat.label.includes("تخصص")) return <><p className="stat-detail-title">مجالات التخصص</p><ul className="stat-specialties">{services.map((s, i) => <li key={i}><LineIcon name={s.icon} className="size-4 shrink-0 text-cyan"/><span>{s.title}</span></li>)}</ul></>;
    if (stat.icon === "users") return <p className="stat-detail-copy">تعاون مع علامات وجهات متنوعة في مجالات التصميم والإنتاج المرئي.</p>;
    if (stat.icon === "layers") return <><p className="stat-detail-title">المشاريع المنجزة</p><p className="stat-detail-copy">تصميمات وهويات بصرية ومحتوى وإنتاج فيديو ومشاريع بالذكاء الاصطناعي.</p>{stat.value === null ? <p className="stat-demo-note">120+ رقم توضيحي مؤقت؛ استبدله بالعدد الفعلي من لوحة التحكم.</p> : null}</>;
    if (stat.icon === "clock") return <><p className="stat-detail-title">المسيرة المهنية</p><ol className="stat-career"><li><span>البداية</span><strong>التصميم الإعلاني</strong></li><li><span>التوسع</span><strong>الهوية البصرية والإخراج الفني</strong></li><li><span>اليوم</span><strong>الإنتاج المرئي والذكاء الاصطناعي</strong></li></ol></>;
    return null;
  };
  return <div ref={rootRef} className="stats-band reveal">
    <dl className="stats-grid" style={{ ["--n" as string]: stats.length }} data-active={active !== null || undefined}>
      {stats.map((s, i) => {
        const displayValue = s.value ?? (s.icon === "layers" ? 120 : null);
        const isSample = s.value === null && s.icon === "layers";
        const canOpen = Boolean(detail(s));
        const open = active === i && canOpen;
        const id = uid + "-detail-" + i;
        return <div key={s.label} className="stat-cell" data-hover-active={open || undefined}
          onPointerEnter={e => { if (e.pointerType === "mouse" && !touchOpen && canOpen) setActive(i); }}
          onPointerLeave={e => { if (e.pointerType === "mouse" && !touchOpen) setActive(null); }}
          onBlur={e => { if (!touchOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null); }}>
          <button type="button" className="stat-toggle" data-cursor-icon={s.icon} aria-controls={id} aria-expanded={open}
            aria-label={String(displayValue ?? "") + s.suffix + " " + s.label + (isSample ? " — عدد تجريبي" : "") + " — عرض التفاصيل"}
            onFocus={() => { if (!touchOpen && canOpen) setActive(i); }}
            onClick={() => {
              if (!canOpen) return;
              // Mouse users only hover; touch users tap to open/close.
              if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
              const next = active === i ? null : i;
              setTouchOpen(next !== null);
              setActive(next);
            }}>
            <span className="stat-icon" aria-hidden="true"><LineIcon name={s.icon} className="size-[18px]"/></span>
            <span className="stat-value">{displayValue !== null ? <CountUp value={displayValue} suffix={s.suffix}/> : <span className="font-latin opacity-40">—</span>}</span>
            <span className="stat-label">{s.label}</span>{isSample ? <span className="stat-demo-note-inline">رقم تجريبي</span> : null}
          </button>
          <div id={id} className="stat-detail" data-open={open || undefined} inert={!open} role="region" aria-label={"تفاصيل " + s.label}>{detail(s)}</div>
        </div>;
      })}
    </dl>
  </div>;
}
