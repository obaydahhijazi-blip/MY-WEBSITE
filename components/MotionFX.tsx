"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide micro-interactions, all disabled for reduced motion:
 * - Section headings reveal word by word (words stay whole, so Arabic letters keep joining).
 * - On fine-pointer devices: branded SVG typography cursor with adaptive contrast, magnetic
 *   CTAs, work/drag labels, click ripple and speed stretch. Service card spotlight remains.
 */
export function MotionFX() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLSpanElement>(null);

  // Word-by-word headings
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heads = Array.from(document.querySelectorAll<HTMLElement>("h2.headline:not([data-split])"));
    for (const h of heads) {
      const text = h.textContent ?? "";
      if (!text.trim() || h.children.length) continue; // only plain-text headings
      h.dataset.split = "";
      h.setAttribute("aria-label", text);
      h.textContent = "";
      text.split(/(\s+)/).forEach((part, i) => {
        if (/^\s+$/.test(part)) return h.append(part);
        const outer = document.createElement("span");
        outer.className = "w";
        outer.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.textContent = part;
        inner.style.setProperty("--wi", String(i / 2));
        outer.append(inner);
        h.append(outer);
      });
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("words-in");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);

  // Adaptive branded cursor, magnetic buttons, and light inside service cards.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    const r = ring.current;
    const d = dot.current;
    const t = tag.current;
    if (!r || !d || !t) return;
    document.documentElement.classList.add("has-cursor");

    let mx = -200;
    let my = -200;
    let cx = mx;
    let cy = my;
    let stretch = 0;
    let raf = 0;
    let visible = false;
    let magnet: HTMLElement | null = null;
    let prevTarget: Element | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    /** Pick contrast from the first visible painted ancestor (including gradient themes). */
    const toneFor = (el: Element | null): "light" | "dark" => {
      for (let node: Element | null = el; node; node = node.parentElement) {
        if (node instanceof HTMLElement) {
          const css = getComputedStyle(node);
          const bg = css.backgroundColor;
          const match = bg.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/i);
          if (match && (match[4] === undefined || Number(match[4]) > .25)) {
            const [red, green, blue] = [Number(match[1]), Number(match[2]), Number(match[3])];
            return (.2126 * red + .7152 * green + .0722 * blue) < 148 ? "light" : "dark";
          }
          // When a painted background uses a gradient, parent backgroundColor may be transparent.
          if (css.backgroundImage !== "none") {
            if (/#001e25|#00373e|rgb\(0[,\s]+30[,\s]+37|rgb\(0[,\s]+55[,\s]+62/i.test(css.backgroundImage)) return "light";
          }
        }
      }
      return "dark";
    };

    const updateTone = (target: Element | null) => {
      if (target === prevTarget) return;
      prevTarget = target;
      const tone = toneFor(target);
      r.dataset.tone = tone;
      d.dataset.tone = tone;
    };

    const animate = () => {
      raf = 0;
      const vx = mx - cx;
      const vy = my - cy;
      cx += vx * .18;
      cy += vy * .18;
      const speed = Math.hypot(vx, vy);
      const goal = Math.min(.07, speed / 180);
      stretch += (goal - stretch) * .17;
      r.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      r.style.setProperty("--cursor-stretch", (1 + stretch).toFixed(3));
      if (speed > .15 || stretch > .003) raf = requestAnimationFrame(animate);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    const resetMagnet = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      // The center point follows immediately; typography catches up gently.
      d.style.transform = `translate3d(${mx}px,${my}px,0)`;
      const target = e.target instanceof Element ? e.target : null;
      const editable = target?.closest("input, textarea, select, [contenteditable='true'], [role='textbox'], dialog[open]");
      if (editable) {
        r.dataset.state = "hidden";
        d.dataset.state = "hidden";
        resetMagnet();
        return;
      }
      r.dataset.state = "default";
      d.dataset.state = "default";
      if (!visible) {
        cx = mx;
        cy = my;
        r.style.transform = `translate3d(${cx}px, ${cy}px,0)`;
        visible = true;
        r.classList.add("is-on");
        d.classList.add("is-on");
      }
      const symbolTarget = target?.closest<HTMLElement>("[data-cursor-icon]");
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role='tab'], summary, [role='button']");
      const label = labelled?.dataset.cursor || "";
      const drag = /اسحب|drag/i.test(label);
      const eye = label === "عرض" || label === "eye";
      const play = label === "تشغيل" || label === "play";
      const symbol = symbolTarget?.dataset.cursorIcon || "";
      t.textContent = eye || play || symbol ? "" : label;
      r.dataset.icon = symbol;
      r.dataset.eye = eye ? "true" : "false";
      r.dataset.state = eye ? "eye" : play ? "play" : symbol ? "symbol" : drag ? "drag" : labelled ? "label" : interactive ? "link" : "default";
      d.dataset.state = r.dataset.state;
      updateTone(target);

      const card = target?.closest<HTMLElement>(".service-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }

      const m = target?.closest<HTMLElement>(".btn-primary, [data-magnetic]") ?? null;
      if (magnet !== m) resetMagnet();
      magnet = m;
      if (m) {
        const rect = m.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height / 2);
        m.style.transform = `translate3d(${(dx * 6).toFixed(1)}px, ${(dy * 4).toFixed(1)}px, 0)`;
      }
      kick();
    };

    const onLeave = () => {
      r.classList.remove("is-on");
      d.classList.remove("is-on");
      visible = false;
      prevTarget = null;
      resetMagnet();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || r.dataset.state === "hidden") return;
      if (timer) clearTimeout(timer);
      r.classList.remove("is-down");
      // Restart click ripple on repeated clicks.
      void r.offsetWidth;
      r.classList.add("is-down");
      timer = setTimeout(() => r.classList.remove("is-down"), 430);
    };
    const onScroll = () => {
      if (!visible || mx < 0 || my < 0) return;
      // The element below a stationary cursor can change after scrolling.
      const target = document.elementFromPoint(mx, my);
      updateTone(target);
    };
    const onVisibility = () => { if (document.hidden) onLeave(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      resetMagnet();
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-orbit" data-tone="dark" data-state="default" aria-hidden="true">
        <div className="cursor-orbit-shell">
          <svg className="cursor-orbit-type" viewBox="0 0 112 112" focusable="false" aria-hidden="true">
            <defs>
              <path id="obaydah-type-orbit" d="M56 10 a46 46 0 1 1 -.001 0 Z" />
            </defs>
            <circle cx="56" cy="56" r="35" fill="none" stroke="currentColor" strokeWidth=".65" strokeOpacity=".45" />
            <text fill="currentColor" fontSize="11.4" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" letterSpacing="0" textLength="252" lengthAdjust="spacing">
              <textPath href="#obaydah-type-orbit" startOffset="4%">OBAYDAH GRAPHIC · OBAYDAH GRAPHIC ·</textPath>
            </text>
          </svg>
          <span className="cursor-orbit-core">
            <svg className="cursor-orbit-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            <svg className="cursor-orbit-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.2a1 1 0 0 1 1.52-.85l10 6.8a1 1 0 0 1 0 1.7l-10 6.8A1 1 0 0 1 8 18.8Z" /></svg>
            <span className="cursor-orbit-symbol" aria-hidden="true">
              <svg className="cursor-symbol cursor-symbol-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              <svg className="cursor-symbol cursor-symbol-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>
              <svg className="cursor-symbol cursor-symbol-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
              <svg className="cursor-symbol cursor-symbol-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-2-4.5"/></svg>
              <svg className="cursor-symbol cursor-symbol-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>
            </span>
            <span ref={tag} className="cursor-orbit-label" />
            <span className="cursor-orbit-drag" aria-hidden="true">↔</span>
          </span>
          <span className="cursor-orbit-ripple" />
        </div>
      </div>
      <div ref={dot} className="cursor-point" data-tone="dark" data-state="default" aria-hidden="true"><span /></div>
    </>
  );
}
