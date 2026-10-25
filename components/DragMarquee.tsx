"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Auto-scroll speed in px/s; the sign sets the direction (positive = moves right). */
  speed: number;
  label: string;
  className?: string;
};

/**
 * Endless row that drifts on its own, slows to a stop on hover, and can be dragged with the
 * mouse or a finger in either direction (with momentum). The content is rendered twice so the
 * loop never shows a gap. Auto-drift is off for reduced motion and while the row is off-screen.
 */
export function DragMarquee({ children, speed, label, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const tr = track.current;
    if (!el || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let x = 0; // current offset (px)
    let half = tr.scrollWidth / 2; // width of one copy
    let rate = speed; // current auto speed, eased toward target
    let target = speed;
    let vel = 0; // momentum after a drag (px/frame)
    let drag: { startX: number; startOff: number; lastX: number; lastT: number; moved: number } | null = null;
    let visible = false;
    let raf = 0;
    let last = performance.now();

    const wrapX = (v: number) => {
      if (!half) return v;
      v %= half;
      return v > 0 ? v - half : v; // keep within (-half, 0]
    };
    const paint = () => (tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`);

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!drag) {
        if (Math.abs(vel) > 0.05) {
          x += vel;
          vel *= 0.94;
        } else {
          vel = 0;
          const goal = reduce.matches ? 0 : target;
          rate += (goal - rate) * Math.min(1, dt * 3);
          x += rate * dt;
        }
        x = wrapX(x);
        paint();
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { startX: e.clientX, startOff: x, lastX: e.clientX, lastT: performance.now(), moved: 0 };
      vel = 0;
      el.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved > 4 && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      x = wrapX(drag.startOff + dx);
      const now = performance.now();
      vel = ((e.clientX - drag.lastX) / Math.max(1, now - drag.lastT)) * 16;
      drag.lastX = e.clientX;
      drag.lastT = now;
      paint();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      // A real drag must not also open a logo's link.
      if (drag.moved > 6) {
        const stop = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 50);
      }
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      drag = null;
      el.classList.remove("is-dragging");
    };
    const slow = () => (target = 0);
    const resume = () => (target = speed);

    const ro = new ResizeObserver(() => {
      half = tr.scrollWidth / 2;
      x = wrapX(x);
      paint();
    });
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
    });
    ro.observe(tr);
    io.observe(el);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("focusin", slow);
    el.addEventListener("focusout", resume);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("focusin", slow);
      el.removeEventListener("focusout", resume);
    };
  }, [speed]);

  return (
    // dir="ltr" anchors the track to the left edge so the offset maths is direction-independent.
    <div ref={wrap} className={`drag-marquee ${className}`} role="region" aria-label={label} dir="ltr">
      <div ref={track} className="drag-track">
        <div className="drag-set">{children}</div>
        <div className="drag-set" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
