"use client";

import { useEffect, useRef } from "react";
import { Star8 } from "@/components/icons";

const BASE = 40; // px per second

/**
 * Infinite text band under the hero. Drifts steadily; scrolling the page speeds it up and leans
 * it slightly, then it settles back. Pauses on hover/focus, stays still for reduced motion.
 */
export function IdentityMarquee({ items }: { items: string[] }) {
  const band = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = band.current;
    const tr = track.current;
    if (!el || !tr || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let boost = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let paused = false;
    let dir = 1; // flips while the page is scrolled upwards
    let visible = false;
    let raf = 0;

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      boost += (Math.min(1400, Math.abs(dy) / Math.max(dt, 0.001) * 0.6) - boost) * 0.1;
      if (dy) dir = dy < 0 ? -1 : 1;
      const speed = paused ? 0 : BASE + boost;
      const half = tr.scrollWidth / 2;
      // Content flows to the right (RTL reading); the dir="ltr" track keeps the maths simple.
      x += speed * dt * dir;
      if (half) x = ((x % half) + half) % half;
      const skew = Math.max(-8, Math.min(8, (boost / 1400) * 8 * dir));
      tr.style.transform = `translate3d(${(x - half).toFixed(2)}px,0,0) skewX(${(-skew).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    const pause = () => (paused = true);
    const play = () => (paused = false);
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", play);
    el.addEventListener("focus", pause);
    el.addEventListener("blur", play);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", play);
      el.removeEventListener("focus", pause);
      el.removeEventListener("blur", play);
    };
  }, []);

  if (!items.length) return null;
  const run = Array.from({ length: 3 }, () => items).flat();
  const half = (key: string, hidden: boolean) => (
    <ul className="marquee-half" aria-hidden={hidden || undefined} key={key} dir="rtl">
      {run.map((text, i) => (
        <li key={i} className="flex items-center gap-8">
          <span className={/[a-z]/i.test(text) && !/[؀-ۿ]/.test(text) ? "font-latin tracking-[0.18em] text-[0.8em] text-white/70" : ""}>{text}</span>
          <Star8 className="size-3 shrink-0 text-cyan" />
        </li>
      ))}
    </ul>
  );
  return (
    <section ref={band} className="marquee-band" aria-label={items[0]} tabIndex={0} dir="ltr">
      <div ref={track} className="marquee-track is-js">
        {half("a", false)}
        {half("b", true)}
      </div>
    </section>
  );
}
