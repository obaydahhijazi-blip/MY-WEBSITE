"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Subtle inertial wheel scrolling (desktop only). Touch devices keep native scrolling,
 * and the effect is skipped entirely for reduced-motion users.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      // Lenis already honours the CSS scroll-padding-top, which accounts for the fixed header.
      anchors: true,
      // Let dialogs, the map, the booking calendar and anything marked data-lenis-prevent scroll natively.
      prevent: (node) => Boolean(node.closest?.("dialog, iframe, [data-lenis-prevent], #mobile-menu")),
    });
    window.__lenis = lenis;

    const onReduce = () => reduce.matches && lenis.destroy();
    reduce.addEventListener("change", onReduce);
    return () => {
      reduce.removeEventListener("change", onReduce);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);
  return null;
}
