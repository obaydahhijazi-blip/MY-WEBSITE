import type { SyntheticEvent } from "react";

/** Uses the image element itself; no state or layout reflow required. */
export function markImageLoaded(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.dataset.loaded = "true";
}
