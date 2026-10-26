"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowIcon, LineIcon } from "@/components/icons";
import { FloatingDesignFiles } from "@/components/FloatingDesignFiles";
import type { SiteContent } from "@/lib/cms/types";

const AUTO_MS = 7200;

/**
 * Process journey: a step list (tabs) drives a detail panel with a progress rail.
 * Auto-advances gently once in view, and stops for good as soon as the visitor interacts
 * (or never starts with reduced motion). Arrow keys follow RTL order.
 */
export function ProcessTimeline({ process, index }: { process: SiteContent["process"]; index: string }) {
  const uid = useId();
  const steps = process.steps;
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(false);
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<number | null>(null);

  const go = useCallback(
    (i: number, focus = false) => {
      const n = (i + steps.length) % steps.length;
      setActive(n);
      if (focus) tabs.current[n]?.focus();
    },
    [steps.length],
  );
  const stopAuto = () => setAuto(false);

  // Start the gentle auto-advance only while the section is on screen.
  useEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let used = false;
    const io = new IntersectionObserver(([e]) => {
      if (used) return;
      setAuto(e.isIntersecting);
    }, { threshold: 0.45 });
    io.observe(el);
    const stop = () => {
      used = true;
      setAuto(false);
    };
    el.addEventListener("pointerdown", stop);
    el.addEventListener("keydown", stop);
    return () => {
      io.disconnect();
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("keydown", stop);
    };
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % steps.length), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [auto, active, steps.length]);

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: 1, ArrowLeft: 1, ArrowUp: -1, ArrowRight: -1 };
    if (e.key in map) {
      e.preventDefault();
      go(active + map[e.key], true);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      go(steps.length - 1, true);
    }
  };

  const step = steps[active];
  const pct = ((active + 1) / steps.length) * 100;

  return (
    <section ref={section} id="process" className="section section-framed bg-paper text-white" aria-labelledby="process-title">
      <div className="container-x">
        <div className="cinematic-panel process-cinematic relative isolate overflow-hidden">
          <div className="process-ambient" aria-hidden="true"><span/><span/><span/></div>
          <FloatingDesignFiles files={["PSD"]} placement="process" />
          <div className="relative z-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <header className="reveal">
            <p className="section-index !text-white/60">
              <span className="num !text-cyan">{index}</span>
              <span className="rule" aria-hidden="true" />
              <span>{process.label}</span>
            </p>
            <h2 id="process-title" className="headline mt-6 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.35] text-white">
              {process.title}
            </h2>
            <p className="mt-4 max-w-md leading-8 text-white/65">{process.intro}</p>
          </header>

          <div role="tablist" aria-orientation="vertical" aria-label={process.title} className="journey-tabs reveal mt-10" onKeyDown={onKey}>
            <span className="journey-rail" aria-hidden="true">
              <span className="journey-rail-fill" style={{ height: `${pct}%` }} />
            </span>
            {steps.map((s, i) => (
              <button
                key={s.title}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${uid}-panel`}
                tabIndex={i === active ? 0 : -1}
                className="journey-tab"
                data-done={i < active || undefined}
                onClick={() => (stopAuto(), go(i))}
                onPointerEnter={(e) => e.pointerType === "mouse" && (stopAuto(), go(i))}
              >
                <span className="journey-node" aria-hidden="true">
                  <LineIcon name={s.icon} className="size-5" />
                </span>
                <span className="flex flex-col items-start">
                  <span className="font-latin text-xs tracking-[0.2em] text-cyan">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 text-lg font-bold">{s.title}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="reveal lg:col-span-7 lg:pt-6">
          <div
            id={`${uid}-panel`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${active}`}
            className="journey-panel"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return;
              const dx = e.changedTouches[0].clientX - touch.current;
              touch.current = null;
              if (Math.abs(dx) > 50) {
                stopAuto();
                go(active + (dx > 0 ? 1 : -1));
              }
            }}
          >
            <div key={active} className="journey-panel-body">
              <span className="journey-big font-latin" aria-hidden="true">
                <span className="journey-num-desktop">{String(active + 1).padStart(2, "0").split("").map((digit, index) => <span key={index} className="journey-digit">{digit}</span>)}</span>
                <span className="journey-num-mobile">{String(active + 1).padStart(2, "0")}</span>
              </span>
              <span className="journey-icon" aria-hidden="true">
                <LineIcon name={step.icon} className="size-8" />
              </span>
              <p className="mt-8 text-sm text-white/55">
                المرحلة <span className="font-latin">{active + 1}</span> من <span className="font-latin">{steps.length}</span>
              </p>
              <h3 className="mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold text-white">{step.title}</h3>
              <p className="mt-4 max-w-[34ch] text-[1.12rem] leading-9 text-white/80">{step.description}</p>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="journey-bar" aria-hidden="true">
                {steps.map((_, i) => (
                  <span key={i} data-on={i <= active || undefined} data-auto={(auto && i === active) || undefined} style={{ ["--dur" as string]: `${AUTO_MS}ms` }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" className="journey-arrow" onClick={() => (stopAuto(), go(active - 1))} aria-label="المرحلة السابقة">
                  <ArrowIcon direction="right" />
                </button>
                <button type="button" className="journey-arrow" onClick={() => (stopAuto(), go(active + 1))} aria-label="المرحلة التالية">
                  <ArrowIcon direction="left" />
                </button>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
}
