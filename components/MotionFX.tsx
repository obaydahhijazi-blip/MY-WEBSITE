"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide micro-interactions, all disabled for reduced motion:
 * - Section headings reveal word by word (words stay whole, so Arabic letters keep joining).
 * - On mouse devices: a cursor ring that grows over links and shows a label over
 *   elements marked data-cursor="…", magnetic primary buttons, and a light that follows
 *   the pointer inside service cards.
 */
export function MotionFX() {
  const ring = useRef<HTMLDivElement>(null);
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

  // Cursor, magnetic buttons, card spotlight
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const r = ring.current;
    const t = tag.current;
    if (!r || !t) return;
    document.documentElement.classList.add("has-cursor");

    let mx = -100;
    let my = -100;
    let cx = mx;
    let cy = my;
    let raf = 0;
    let magnet: HTMLElement | null = null;

    const loop = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      r.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(mx - cx) + Math.abs(my - cy) > 0.1 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      r.classList.add("is-on");
      const target = e.target as Element | null;

      // Label / hover state
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role=tab], select, input, textarea, label");
      t.textContent = labelled?.dataset.cursor ?? "";
      r.dataset.state = labelled ? "label" : interactive ? "link" : "";

      // Spotlight inside service cards
      const card = target?.closest<HTMLElement>(".service-card");
      if (card) {
        const b = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - b.left}px`);
        card.style.setProperty("--my", `${e.clientY - b.top}px`);
      }

      // Magnetic buttons
      const m = target?.closest<HTMLElement>(".btn-primary, [data-magnetic]") ?? null;
      if (magnet && magnet !== m) magnet.style.transform = "";
      magnet = m;
      if (m) {
        const b = m.getBoundingClientRect();
        const dx = (e.clientX - (b.left + b.width / 2)) / (b.width / 2);
        const dy = (e.clientY - (b.top + b.height / 2)) / (b.height / 2);
        m.style.transform = `translate3d(${(dx * 7).toFixed(1)}px, ${(dy * 5).toFixed(1)}px, 0)`;
      }
    };
    const onLeave = () => {
      r.classList.remove("is-on");
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };
    const onDown = () => r.classList.add("is-down");
    const onUp = () => r.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={ring} className="cursor-ring" aria-hidden="true">
      <span ref={tag} className="cursor-tag" />
    </div>
  );
}
