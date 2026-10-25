"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { LineIcon } from "@/components/icons";
import { COUNTRY_NAMES_AR } from "@/lib/map/countries";
import type { SiteContent } from "@/lib/cms/types";

// The globe (d3-geo + map data) is a separate chunk, requested only when the section nears the viewport.
const Globe = dynamic(() => import("@/components/about/Globe"), { ssr: false, loading: () => <div className="globe globe-placeholder" /> });

type Props = { about: SiteContent["about"]; demoMode: boolean };

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Server HTML shows the final number; the count-up runs once when the figure scrolls into view.
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
          const t = Math.min(1, (now - start) / 1700);
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
      {suffix}
    </span>
  );
}

export function StatsAndMap({ about, demoMode }: Props) {
  const [mapFocus, setMapFocus] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loadGlobe, setLoadGlobe] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setLoadGlobe(true), io.disconnect()), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Unconfirmed figures (no value) never reach the public site; demo/preview shows them as pending.
  const stats = about.stats.filter((s) => s.value !== null || demoMode);

  return (
    <>
      <dl className={`stat-row reveal mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-20 ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            data-linked={s.mapLink || undefined}
            {...(s.mapLink
              ? {
                  tabIndex: 0,
                  "aria-describedby": "about-map-title",
                  onPointerEnter: () => setMapFocus(true),
                  onPointerLeave: () => setMapFocus(false),
                  onFocus: () => setMapFocus(true),
                  onBlur: () => setMapFocus(false),
                }
              : {})}
          >
            <span className="stat-icon" aria-hidden="true">
              <LineIcon name={s.icon} className="size-5" />
            </span>
            <dd className="mt-6 text-[clamp(2.2rem,4.2vw,3.4rem)] font-bold leading-none text-ink">
              {s.value !== null ? <CountUp value={s.value} suffix={s.suffix} /> : <span className="font-latin text-muted/50">—</span>}
            </dd>
            <dt className="mt-3 text-[0.95rem] text-muted">
              {s.label}
              {s.value === null ? <span className="ms-2 rounded bg-yellow/20 px-1.5 py-0.5 text-[0.7rem] text-ink-2">بانتظار التأكيد · معاينة</span> : null}
            </dt>
          </div>
        ))}
      </dl>

      <div ref={panel} id="about-map" className="globe-panel reveal mt-6 sm:mt-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 lg:order-1 lg:col-span-5 lg:ps-4">
            <p id="about-map-title" className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-bold leading-snug text-white">
              {about.mapTitle}
            </p>
            <p className="mt-3 max-w-sm leading-8 text-white/70">
              عملت مع عملاء في <span className="font-latin">{about.countries.length}</span> دول. {about.mapHint}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="الدول">
              {about.countries.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="globe-chip"
                    aria-pressed={selected === id}
                    data-on={hovered === id || undefined}
                    onClick={() => setSelected((v) => (v === id ? null : id))}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(id)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(null)}
                    onFocus={() => setHovered(id)}
                    onBlur={() => setHovered(null)}
                  >
                    {COUNTRY_NAMES_AR[id] ?? id}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-7">
            {loadGlobe ? (
              <Globe
                countries={about.countries}
                names={COUNTRY_NAMES_AR}
                selected={selected}
                hovered={hovered}
                highlightAll={mapFocus}
                onHover={setHovered}
                onSelect={(id) => setSelected((v) => (v === id ? null : id))}
              />
            ) : (
              <div className="globe globe-placeholder" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
