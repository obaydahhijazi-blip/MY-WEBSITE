"use client";

/** Event names reported to analytics. A click is only a click — never a lead or a confirmed booking. */
export type TrackEvent =
  | "whatsapp_click"
  | "consultation_whatsapp_click"
  | "quote_whatsapp_click"
  | "calendar_open"
  | "similar_project_click";

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string>) => void };
  }
}

/** No-op unless an analytics script (Umami) is configured via NEXT_PUBLIC_UMAMI_WEBSITE_ID. */
export function track(name: TrackEvent, data?: Record<string, string>) {
  try {
    window.umami?.track(name, data);
  } catch {
    /* analytics must never break the page */
  }
}
