"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LineIcon } from "@/components/icons";
import { COUNTRY_NAMES_AR } from "@/lib/map/countries";
import type { Stat } from "@/lib/cms/types";

/** Counts up once when the figure scrolls into view (the server HTML already holds the final value). */
function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const render = (n: number) => (el.textContent = String(n));
    render(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1800);
          render(Math.round(value * (1 - Math.pow(2, -10 * t))));
          if (t < 1) raf = requestAnimationFrame(tick);
          else render(value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <span className="font-latin tabular-nums" dir="ltr">
      <span ref={ref}>{value}</span>
      <span className="text-cyan">{suffix}</span>
    </span>
  );
}

type Props = { stats: Stat[]; countries: string[]; countriesTitle: string };

/** Petrol band of key figures. The «دول» figure reveals the list of countries on hover, focus or tap. */
export function StatsBand({ stats, countries, countriesTitle }: Props) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);

  return (
    <div className="stats-band reveal">
      <dl className="stats-grid" style={{ ["--n" as string]: stats.length }}>
        {stats.map((s) => {
          const linked = s.mapLink && countries.length > 0;
          const body = (
            <>
              <span className="stat-icon" aria-hidden="true">
                <LineIcon name={s.icon} className="size-[18px]" />
              </span>
              <dd className="stat-value">
                {s.value !== null ? <CountUp value={s.value} suffix={s.suffix} /> : <span className="font-latin opacity-40">—</span>}
              </dd>
              <dt className="stat-label">
                {s.label}
                {s.value === null ? <span className="stat-pending">بانتظار التأكيد · معاينة</span> : null}
              </dt>
            </>
          );
          return linked ? (
            <div
              key={s.label}
              className="stat-cell is-linked"
              onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && !pinned.current && setOpen(false)}
            >
              <button
                type="button"
                className="stat-toggle"
                aria-expanded={open}
                aria-controls={`${uid}-countries`}
                onClick={() => {
                  pinned.current = !open;
                  setOpen(!open);
                }}
              >
                {body}
                <span className="stat-hint">{open ? "إخفاء الدول" : "عرض الدول"}</span>
              </button>
            </div>
          ) : (
            <div key={s.label} className="stat-cell">
              {body}
            </div>
          );
        })}
      </dl>

      {countries.length ? (
        <div id={`${uid}-countries`} className="countries-panel" data-open={open || undefined} inert={!open}>
          <div className="overflow-hidden">
            <div className="countries-inner">
              <p className="text-sm font-semibold text-white/80">{countriesTitle}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {countries.map((id, i) => (
                  <li key={id} className="country-chip" style={{ ["--i" as string]: i }}>
                    {COUNTRY_NAMES_AR[id] ?? id}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
