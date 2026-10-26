"use client";

import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/analytics";

/** Reports clicks on any element marked data-track="event_name". */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      const name = el?.getAttribute("data-track");
      if (name && el) {
        const data: Record<string, string> = {};
        for (const key of ["project", "category", "gallery", "language", "location", "service"]) {
          const value = el.getAttribute("data-track-" + key);
          if (value) data[key] = value;
        }
        track(name as TrackEvent, data);
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
