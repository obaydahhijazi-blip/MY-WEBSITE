"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon, CalendarIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

type Props = { calLink: string; calUrl: string; calOrigin: string; label: string };

type CalApi = ((...args: unknown[]) => void) & { loaded?: boolean; ns: Record<string, (...args: unknown[]) => void>; q?: unknown[] };
declare global {
  interface Window {
    Cal?: CalApi;
  }
}

const NAMESPACE = "consultation";

/** Official Cal.com embed bootstrap (queues calls until embed.js loads). */
function bootCal(scriptSrc: string) {
  if (window.Cal) return window.Cal;
  /* eslint-disable prefer-rest-params, @typescript-eslint/no-explicit-any */
  const push = (api: any, args: any) => api.q.push(args);
  const Cal: any = function () {
    const cal = Cal;
    const args = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      const s = document.createElement("script");
      s.src = scriptSrc;
      s.async = true;
      s.onerror = () => window.dispatchEvent(new Event("cal:load-error"));
      document.head.appendChild(s);
      cal.loaded = true;
    }
    if (args[0] === "init") {
      const api: any = function () {
        push(api, arguments);
      };
      const namespace = args[1];
      api.q = api.q || [];
      if (typeof namespace === "string") {
        cal.ns[namespace] = cal.ns[namespace] || api;
        push(cal.ns[namespace], args);
        push(cal, ["initNamespace", namespace]);
      } else push(cal, args);
      return;
    }
    push(cal, args);
  };
  /* eslint-enable prefer-rest-params, @typescript-eslint/no-explicit-any */
  window.Cal = Cal as CalApi;
  return window.Cal!;
}

/** Secondary path: the Cal.com calendar loads only when asked for, with a plain-link fallback. */
export function CalendarOption({ calLink, calUrl, calOrigin, label }: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const started = useRef(false);

  useEffect(() => {
    if (!open || started.current) return;
    started.current = true;
    const Cal = bootCal(`${calOrigin}/embed/embed.js`);
    Cal("init", NAMESPACE, { origin: calOrigin });
    const api = Cal.ns[NAMESPACE];
    api("inline", { elementOrSelector: "#cal-inline", calLink, config: { layout: "month_view", theme: "light" } });
    api("ui", { theme: "light", layout: "month_view", hideEventTypeDetails: false, cssVarsPerTheme: { light: { "cal-brand": "#001E25" } } });
    api("on", { action: "linkReady", callback: () => setState("ready") });
    api("on", { action: "linkFailed", callback: () => setState("error") });
    const onError = () => setState("error");
    window.addEventListener("cal:load-error", onError);
    const timeout = window.setTimeout(() => setState((s) => (s === "loading" ? "error" : s)), 20000);
    return () => {
      window.removeEventListener("cal:load-error", onError);
      window.clearTimeout(timeout);
    };
  }, [open, calLink, calOrigin]);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (!open) track("calendar_open");
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="cal-panel"
        className="btn btn-outline w-full !min-h-13"
      >
        <CalendarIcon />
        {label}
      </button>

      <div id="cal-panel" hidden={!open} className="mt-5">
        <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-line bg-white" data-lenis-prevent>
          {state !== "ready" ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              {state === "loading" ? (
                <div className="flex flex-col items-center gap-4 text-muted" role="status">
                  <span className="size-8 animate-spin rounded-full border-2 border-line border-t-cyan-ink" aria-hidden="true" />
                  <span className="text-sm">جارٍ تحميل المواعيد المتاحة…</span>
                </div>
              ) : (
                <div role="alert">
                  <p className="font-semibold text-ink">تعذّر عرض التقويم داخل الصفحة.</p>
                  <p className="mt-2 text-sm text-muted">يمكنك فتحه في صفحة مستقلة أو متابعة الحجز عبر واتساب.</p>
                </div>
              )}
            </div>
          ) : null}
          <div id="cal-inline" className="relative w-full overflow-auto" style={{ minHeight: 560 }} />
        </div>
        <a href={calUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-ink underline-offset-4 hover:underline">
          فتح التقويم في صفحة مستقلة
          <ArrowIcon className="size-3.5" />
          <span className="sr-only">(Cal.com، يفتح في نافذة جديدة)</span>
        </a>
      </div>
    </div>
  );
}
