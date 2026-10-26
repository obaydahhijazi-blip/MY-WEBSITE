export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/+$/, "");

/** Accepts "user/event" or a full Cal.com URL; returns the path the Cal embed expects. */
export function normalizeCalLink(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  try {
    if (/^https?:\/\//i.test(value)) return new URL(value).pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return "";
  }
  return value.replace(/^\/+|\/+$/g, "");
}

/** Embed origin. cal.com public links embed from app.cal.com; override only for self-hosted/EU instances. */
export const calOrigin = (process.env.NEXT_PUBLIC_CAL_ORIGIN || "https://app.cal.com").replace(/\/+$/, "");
