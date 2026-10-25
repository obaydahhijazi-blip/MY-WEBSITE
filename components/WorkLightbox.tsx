"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon, CloseIcon } from "@/components/icons";
import { announceMedia, lockScroll, unlockScroll } from "@/lib/scroll";
import { CATEGORY_TO_SERVICE, requestQuote } from "@/lib/quote-bus";
import { track } from "@/lib/analytics";
import type { Work } from "@/lib/cms/types";

type Props = { work: Work; categoryLabel: string; similarCta: string; onClose: () => void };

/** Full-screen project viewer: native <dialog> (focus trap + Escape), RTL-aware arrows, swipe, pinch-zoom, video. */
export function WorkLightbox({ work, categoryLabel, similarCta, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [i, setI] = useState(0);
  const touch = useRef<{ x: number; y: number; multi: boolean } | null>(null);
  const items = work.media;
  const count = items.length;
  const item = items[i];

  const stopVideo = () => {
    if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
  };
  const next = useCallback(() => setI((n) => (n + 1) % count), [count]);
  const prev = useCallback(() => setI((n) => (n - 1 + count) % count), [count]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const opener = document.activeElement as HTMLElement | null;
    dlg.showModal();
    lockScroll();
    return () => {
      unlockScroll();
      announceMedia("pause");
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "VIDEO") return;
      // In right-to-left reading order, "next" sits to the left.
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <dialog
      ref={ref}
      aria-label={`مشروع: ${work.title}`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-petrol p-0 text-white backdrop:bg-petrol/80"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <p className="text-sm text-white/70" aria-live="polite">
            <span className="font-latin">
              {i + 1} / {count}
            </span>
          </p>
          <button type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full hover:bg-white/10" aria-label="إغلاق العرض">
            <CloseIcon />
          </button>
        </div>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
          onTouchStart={(e) => {
            touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, multi: e.touches.length > 1 };
          }}
          onTouchMove={(e) => {
            if (touch.current && e.touches.length > 1) touch.current.multi = true;
          }}
          onTouchEnd={(e) => {
            const t = touch.current;
            touch.current = null;
            if (!t || t.multi || (window.visualViewport && window.visualViewport.scale > 1.01)) return;
            const dx = e.changedTouches[0].clientX - t.x;
            const dy = e.changedTouches[0].clientY - t.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
              stopVideo();
              (dx > 0 ? next : prev)();
            }
          }}
        >
          {item.type === "video" ? (
            <video
              key={item.src}
              ref={videoRef}
              src={item.src}
              poster={item.poster?.src}
              controls
              playsInline
              preload="metadata"
              aria-label={item.alt}
              onPlay={() => announceMedia("play")}
              onPause={() => announceMedia("pause")}
              onEnded={() => announceMedia("pause")}
              className="max-h-full max-w-full rounded-lg"
            />
          ) : (
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="100vw"
              quality={85}
              unoptimized={item.src.endsWith(".svg")}
              className="lightbox-img h-auto max-h-full w-auto max-w-full object-contain"
              priority
            />
          )}
          {count > 1 ? (
            <>
              <button type="button" onClick={() => (stopVideo(), prev())} aria-label="السابق" className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 hover:bg-white/10 sm:grid">
                <ArrowIcon direction="right" className="size-5" />
              </button>
              <button type="button" onClick={() => (stopVideo(), next())} aria-label="التالي" className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 hover:bg-white/10 sm:grid">
                <ArrowIcon direction="left" className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-lg font-semibold">
              {work.title}
              {work.demo ? <span className="rounded bg-yellow px-2 py-0.5 text-xs font-bold text-petrol">نموذج تجريبي</span> : null}
            </p>
            <p className="mt-1 text-sm text-white/65">
              {[categoryLabel, work.client, work.year].filter(Boolean).join(" · ")}
            </p>
            {work.summary ? <p className="mt-3 text-sm leading-7 text-white/80">{work.summary}</p> : null}
            <button
              type="button"
              className="btn btn-primary mt-4 !min-h-11 text-sm"
              onClick={() => {
                track("similar_project_click", { project: work.title });
                onClose();
                // Let the dialog close and scroll unlock before moving to the form.
                setTimeout(() => requestQuote({ service: CATEGORY_TO_SERVICE[work.category], project: work.title }), 60);
              }}
            >
              {similarCta}
            </button>
          </div>
          {count > 1 ? (
            <div className="flex gap-3 sm:hidden">
              <button type="button" onClick={() => (stopVideo(), prev())} className="btn btn-ghost-light !min-h-11 flex-1">السابق</button>
              <button type="button" onClick={() => (stopVideo(), next())} className="btn btn-ghost-light !min-h-11 flex-1">التالي</button>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
