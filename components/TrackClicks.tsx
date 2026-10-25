"use client";

import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/analytics";

/** Reports clicks on any element marked data-track="event_name". */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      const name = el?.getAttribute("data-track");
      if (name) track(name as TrackEvent);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
