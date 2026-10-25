"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { WorkLightbox } from "@/components/WorkLightbox";
import { ArrowIcon, InstagramIcon, PlayIcon } from "@/components/icons";
import type { Category, SiteContent, VideoAsset, Work } from "@/lib/cms/types";

type Props = {
  video: SiteContent["video"];
  works: SiteContent["works"];
  categories: Category[];
  items: Work[];
  index: string;
  instagram: string;
  instagramHandle: string;
};

const firstVideo = (w: Work) => w.media.find((m): m is VideoAsset => m.type === "video");
const orientationOf = (w: Work) =>
  w.orientation ?? (w.cover.width / w.cover.height < 0.85 ? "portrait" : w.cover.width / w.cover.height > 1.15 ? "landscape" : "square");

/**
 * Silent preview: plays on mouse hover; on touch screens it plays while the card is mostly on
 * screen. Clicking opens the full video with sound in the viewer (background music ducks).
 */
function VideoCard({ w, label, onOpen, tall }: { w: Work; label: string; onOpen: () => void; tall?: boolean }) {
  const vid = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const v = firstVideo(w);

  useEffect(() => {
    const el = vid.current;
    const host = card.current;
    if (!el || !host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const hover = window.matchMedia("(hover: hover)").matches;
    const play = () => el.play().catch(() => undefined);
    const stop = () => {
      el.pause();
    };
    if (hover) {
      host.addEventListener("pointerenter", play);
      host.addEventListener("pointerleave", stop);
      host.addEventListener("focus", play);
      host.addEventListener("blur", stop);
      return () => {
        host.removeEventListener("pointerenter", play);
        host.removeEventListener("pointerleave", stop);
        host.removeEventListener("focus", play);
        host.removeEventListener("blur", stop);
      };
    }
    const io = new IntersectionObserver(([e]) => (e.intersectionRatio > 0.65 ? play() : stop()), { threshold: [0, 0.65, 1] });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <button ref={card} type="button" onClick={onOpen} className={`video-card group ${tall ? "is-tall" : ""}`} data-cursor="تشغيل" aria-label={`مشاهدة «${w.title}»`}>
      <span className="video-card-media" style={{ aspectRatio: `${w.cover.width} / ${w.cover.height}` }}>
        <Image src={w.cover.src} alt={w.cover.alt} fill sizes={tall ? "(min-width: 1024px) 22vw, 70vw" : "(min-width: 1024px) 50vw, 100vw"} className="object-cover" />
        {v ? <video ref={vid} src={v.src} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} className="video-card-preview" /> : null}
        <span className="video-card-shade" aria-hidden="true" />
        {v ? (
          <span className="video-card-play" aria-hidden="true">
            <PlayIcon className="size-5" />
          </span>
        ) : null}
        {w.demo ? <span className="demo-badge">نموذج تجريبي</span> : null}
        <span className="video-card-info">
          <span className="block text-[0.72rem] text-cyan">{label}</span>
          <span className="mt-1 block font-semibold leading-snug text-white">{w.title}</span>
        </span>
      </span>
    </button>
  );
}

export function VideoSection({ video, works, categories, items, index, instagram, instagramHandle }: Props) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Work | null>(null);
  const reelRow = useRef<HTMLUListElement>(null);

  const visible = filter === "all" ? items : items.filter((w) => w.category === filter);
  const reels = useMemo(() => visible.filter((w) => orientationOf(w) === "portrait"), [visible]);
  const wide = useMemo(() => visible.filter((w) => orientationOf(w) !== "portrait"), [visible]);
  const counts = useMemo(() => new Map(categories.map((c) => [c.id, items.filter((w) => w.category === c.id).length])), [categories, items]);
  const labelOf = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  // Mouse drag for the reels row (touch already scrolls natively).
  useEffect(() => {
    const el = reelRow.current;
    if (!el) return;
    let start: { x: number; left: number; moved: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      start = { x: e.clientX, left: el.scrollLeft, moved: 0 };
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      start.moved = Math.max(start.moved, Math.abs(dx));
      if (start.moved > 4) {
        el.classList.add("is-dragging");
        el.scrollLeft = start.left - dx;
      }
    };
    const up = () => {
      if (start && start.moved > 6) {
        const stop = (ev: Event) => (ev.preventDefault(), ev.stopPropagation());
        el.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 50);
      }
      start = null;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [reels.length]);

  const scrollReels = (dir: 1 | -1) => {
    const el = reelRow.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // RTL: scrollLeft runs from 0 to negative values.
    el.scrollBy({ left: -dir * (card.getBoundingClientRect().width + 16) * 2, behavior: reduce ? "auto" : "smooth" });
  };

  const tabs = [{ id: "all", label: video.allLabel, count: items.length }, ...categories.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))];

  return (
    <section id="video" className="section relative overflow-hidden bg-petrol text-white" aria-labelledby="video-title">
      <div className="pointer-events-none absolute -top-40 left-[12%] size-[30rem] rounded-full bg-teal blur-3xl" aria-hidden="true" />
      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <header className="reveal lg:col-span-6">
            <p className="section-index !text-white/60">
              <span className="num !text-cyan">{index}</span>
              <span className="rule" aria-hidden="true" />
              <span>{video.label}</span>
            </p>
            <h2 id="video-title" className="headline mt-6 text-[clamp(1.9rem,4.2vw,3.25rem)] text-white">
              {video.title}
            </h2>
          </header>
          <p className="reveal text-[1.05rem] leading-9 text-white/70 lg:col-span-5 lg:col-start-8">{video.description}</p>
        </div>

        <div className="reveal -mx-4 mt-12 sm:mx-0">
          <div role="group" aria-label="تصفية أعمال الفيديو" className="work-tabs flex gap-2 overflow-x-auto px-4 pb-2 sm:flex-wrap sm:overflow-visible sm:px-0">
            {tabs.map((t) => (
              <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => setFilter(t.id)} className="work-tab is-dark">
                {t.label}
                {items.length > 0 ? <span className="font-latin text-[0.72rem] opacity-60">{t.count}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="reveal mt-10 flex flex-col gap-5 rounded-3xl border border-dashed border-white/15 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <p className="font-bold">{video.emptyTitle}</p>
              <p className="mt-1 text-sm leading-7 text-white/65">{video.emptyBody}</p>
            </div>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light !min-h-12 shrink-0">
              <InstagramIcon />
              <span className="font-latin">@{instagramHandle}</span>
              <ArrowIcon />
            </a>
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/65" role="status">
            {works.emptyCategory}
          </p>
        ) : (
          <div className="mt-10 space-y-12" aria-live="polite">
            {reels.length ? (
              <div>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="text-sm text-white/55">{video.hint}</p>
                  {reels.length > 3 ? (
                    <div className="hidden gap-2 sm:flex">
                      <button type="button" className="journey-arrow" onClick={() => scrollReels(-1)} aria-label="الريلز السابقة">
                        <ArrowIcon direction="right" />
                      </button>
                      <button type="button" className="journey-arrow" onClick={() => scrollReels(1)} aria-label="الريلز التالية">
                        <ArrowIcon direction="left" />
                      </button>
                    </div>
                  ) : null}
                </div>
                <ul ref={reelRow} className="reel-row" aria-label={video.reelsTitle}>
                  {reels.map((w) => (
                    <li key={w.id} className="work-card-enter">
                      <VideoCard w={w} label={labelOf(w.category)} onOpen={() => setOpen(w)} tall />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {wide.length ? (
              <ul className="grid gap-5 md:grid-cols-2">
                {wide.map((w) => (
                  <li key={w.id} className={`work-card-enter ${w.featured ? "md:col-span-2" : ""}`}>
                    <VideoCard w={w} label={labelOf(w.category)} onOpen={() => setOpen(w)} />
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-col items-start gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[1.02rem] text-white/80">تحتاج إلى ريلز أو إعلان مرئي لعلامتك؟</p>
              <a href="#quote" className="btn btn-primary !min-h-12">
                اطلب عرض سعر
              </a>
            </div>
          </div>
        )}
      </div>

      {open ? <WorkLightbox work={open} categoryLabel={labelOf(open.category)} similarCta={works.similarCta} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
