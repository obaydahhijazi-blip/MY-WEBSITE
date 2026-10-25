"use client";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let locks = 0;
let prevOverflow = "";

/** Lock page scrolling (dialogs, mobile menu) for both native scrolling and Lenis. */
export function lockScroll() {
  if (locks++ === 0) {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
  }
}

export function unlockScroll() {
  if (locks > 0 && --locks === 0) {
    document.body.style.overflow = prevOverflow;
    window.__lenis?.start();
  }
}

/** Media playing/pausing elsewhere on the page — background music ducks while a video plays. */
export const MEDIA_EVENT = "site-media";
export function announceMedia(state: "play" | "pause") {
  window.dispatchEvent(new CustomEvent(MEDIA_EVENT, { detail: { state } }));
}
