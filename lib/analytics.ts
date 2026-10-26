"use client";

/**
 * Anonymous event tracking. Umami handles pageviews, referrers and UTM reports.
 * We attach only limited, non-identifying labels to interaction events. Never send
 * names, email addresses, full URLs, form messages or a WhatsApp message body.
 */
export type TrackEvent =
  | "whatsapp_click"
  | "consultation_whatsapp_click"
  | "quote_whatsapp_click"
  | "calendar_open"
  | "similar_project_click"
  | "portfolio_open"
  | "portfolio_filter"
  | "language_switch";

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string>) => void };
  }
}

type Labels = Record<string, string>;
const ATTR_KEY = "obaydah-anonymous-attribution-v1";
const MAX_LABEL = 64;

function clean(value: string): string {
  // Preserve multilingual service/category labels but strip punctuation and any URL.
  return value.replace(/https?:\/\/\S+/gi, "").replace(/[^\p{L}\p{N} \-_]/gu, "").trim().slice(0, MAX_LABEL);
}

function attribution(): Labels {
  try {
    const old = sessionStorage.getItem(ATTR_KEY);
    if (old) {
      const data = JSON.parse(old) as Labels;
      if (typeof data.source === "string" && typeof data.medium === "string") return data;
    }
    const query = new URLSearchParams(window.location.search);
    const utmSource = clean(query.get("utm_source") || "");
    const utmMedium = clean(query.get("utm_medium") || "");
    const utmCampaign = clean(query.get("utm_campaign") || "");
    let source = utmSource || "direct";
    let medium = utmMedium || "none";
    if (!utmSource && document.referrer) {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host !== window.location.hostname) {
        source = /google|bing|duckduckgo|yahoo/.test(host) ? "search" :
          /instagram|facebook|tiktok|linkedin|youtube|twitter|x\.com/.test(host) ? "social" : "referral";
        medium = source;
      }
    }
    const values: Labels = { source, medium, ...(utmCampaign ? { campaign: utmCampaign } : {}) };
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(values));
    return values;
  } catch {
    return { source: "unknown", medium: "unknown" };
  }
}

/** Pageviews, visits, referrers and device counts remain Umami's responsibility. */
export function track(name: TrackEvent, data: Labels = {}) {
  if (typeof window === "undefined" || !window.umami) return;
  try {
    const details: Labels = {
      ...attribution(),
      language: document.documentElement.lang === "en" ? "en" : "ar",
    };
    for (const [key, value] of Object.entries(data)) {
      if (!/^[a-z_]{1,32}$/.test(key) || typeof value !== "string") continue;
      const safe = clean(value);
      if (safe) details[key] = safe;
    }
    window.umami.track(name, details);
  } catch {
    // Analytics errors must never block the main website.
  }
}
