"use client";

import Image from "next/image";
import { markImageLoaded } from "@/lib/image-reveal";
import { useMemo, useState } from "react";
import { WorkLightbox } from "@/components/WorkLightbox";
import { ArrowIcon, InstagramIcon, PlayIcon } from "@/components/icons";
import type { SiteContent, Work } from "@/lib/cms/types";
import { track } from "@/lib/analytics";

type Props = { works: SiteContent["works"]; instagram: string; instagramHandle: string };

const DemoBadge = () => <span className="demo-badge">نموذج تجريبي</span>;

function Meta({ w, label }: { w: Work; label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
      {label}
      {w.year ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-latin">{w.year}</span>
        </>
      ) : null}
    </span>
  );
}

export function WorkGallery({ works, instagram, instagramHandle }: Props) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Work | null>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of works.items) m.set(w.category, (m.get(w.category) ?? 0) + 1);
    return m;
  }, [works.items]);
  const visible = filter === "all" ? works.items : works.items.filter((w) => w.category === filter);
  const featured = visible.filter((w) => w.featured);
  const rest = visible.filter((w) => !w.featured);
  const labelOf = (id: string) => works.categories.find((c) => c.id === id)?.label ?? id;
  const tabs = [{ id: "all", label: works.allLabel, count: works.items.length }, ...works.categories.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))];
  const unopt = (src: string) => src.endsWith(".svg");

  return (
    <>
      <div className="reveal -mx-4 mt-12 sm:mx-0" data-lenis-prevent>
        <div role="group" aria-label="تصفية الأعمال حسب التصنيف" className="work-tabs flex gap-2 overflow-x-auto px-4 pb-2 sm:flex-wrap sm:overflow-visible sm:px-0">
          {tabs.map((t) => (
            <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => { setFilter(t.id); track("portfolio_filter", { category: t.id, gallery: "design" }); }} className="work-tab">
              {t.label}
              {works.items.length > 0 ? <span className="font-latin text-[0.72rem] opacity-60">{t.count}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {works.items.length === 0 ? (
        <div className="reveal mt-10 flex flex-col gap-5 rounded-3xl border border-dashed border-ink/15 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="font-bold text-ink">{works.emptyTitle}</p>
            <p className="mt-1 text-sm leading-7 text-muted">{works.emptyBody}</p>
          </div>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline !min-h-12 shrink-0">
            <InstagramIcon />
            <span className="font-latin">@{instagramHandle}</span>
            <ArrowIcon />
          </a>
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-muted" role="status">
          {works.emptyCategory}
        </p>
      ) : (
        <div className="mt-10 space-y-10" aria-live="polite">
          {featured.map((w) => {
            const hasVideo = w.media.some((m) => m.type === "video");
            return (
              <button key={w.id} type="button" onClick={() => { setOpen(w); track("portfolio_open", { project: w.id, category: w.category, gallery: "design" }); }} className="work-feature work-card-enter group" data-cursor="عرض" aria-label={`عرض مشروع «${w.title}»`}>
                <span className="work-feature-media">
                  <Image
                    src={w.cover.src}
                    alt={w.cover.alt}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    unoptimized={unopt(w.cover.src)}
                    placeholder={w.cover.lqip ? "blur" : "empty"}
                    blurDataURL={w.cover.lqip}
                    className="media-enter object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    onLoad={markImageLoaded}
                  />
                  {hasVideo ? (
                    <span className="work-play" aria-hidden="true">
                      <PlayIcon className="size-5" />
                    </span>
                  ) : null}
                  {w.demo ? <DemoBadge /> : null}
                </span>
                <span className="work-feature-info">
                  <Meta w={w} label={labelOf(w.category)} />
                  <span className="mt-4 block text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-snug text-white">{w.title}</span>
                  {w.client ? <span className="mt-2 block text-sm text-white/60">{w.client}</span> : null}
                  {w.summary ? <span className="mt-4 block text-[0.95rem] leading-8 text-white/75">{w.summary}</span> : null}
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan">
                    عرض المشروع
                    <ArrowIcon className="size-4 transition-transform group-hover:-translate-x-1" />
                  </span>
                </span>
              </button>
            );
          })}

          {rest.length ? (
            <ul className="work-masonry">
              {rest.map((w) => {
                const hasVideo = w.media.some((m) => m.type === "video");
                return (
                  <li key={w.id} className="work-card-enter">
                    <button type="button" onClick={() => { setOpen(w); track("portfolio_open", { project: w.id, category: w.category, gallery: "design" }); }} className="work-card group block w-full text-start" data-cursor="عرض" aria-label={`عرض مشروع «${w.title}»`}>
                      <span className="relative block overflow-hidden rounded-2xl border border-line bg-paper-2">
                        <Image
                          src={w.cover.src}
                          alt={w.cover.alt}
                          width={w.cover.width}
                          height={w.cover.height}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized={unopt(w.cover.src)}
                          placeholder={w.cover.lqip ? "blur" : "empty"}
                          blurDataURL={w.cover.lqip}
                          className="media-enter h-auto w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                          onLoad={markImageLoaded}
                        />
                        <span className="work-card-shade" aria-hidden="true" />
                        {hasVideo ? (
                          <span className="work-play" aria-hidden="true">
                            <PlayIcon className="size-4" />
                          </span>
                        ) : null}
                        {w.demo ? <DemoBadge /> : null}
                      </span>
                      <span className="mt-4 flex items-start justify-between gap-4">
                        <span>
                          <span className="block text-[1.05rem] font-semibold leading-snug text-ink">{w.title}</span>
                          {w.client ? <span className="mt-1 block text-sm text-muted">{w.client}</span> : null}
                        </span>
                        <span className="pt-1">
                          <Meta w={w} label={labelOf(w.category)} />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1.02rem] text-ink-2">هل لديك مشروع مشابه؟</p>
            <a href="#quote" className="btn btn-dark !min-h-12">
              اطلب عرض سعر
            </a>
          </div>
        </div>
      )}

      {open ? <WorkLightbox work={open} categoryLabel={labelOf(open.category)} similarCta={works.similarCta} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
