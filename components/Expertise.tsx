"use client";

import { SectionHeading } from "@/components/SectionHeading";
import Image from "next/image";
import Link from "next/link";
import { LineIcon } from "@/components/icons";
import type { SiteContent, Work } from "@/lib/cms/types";
import type { PointerEvent } from "react";

const motionAllowed = () => window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;

function tilt(e: PointerEvent<HTMLAnchorElement>) {
  if (e.pointerType !== "mouse" || !motionAllowed()) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
  el.style.setProperty("--tilt-x", `${(-y * 12).toFixed(2)}deg`);
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}
function reset(e: PointerEvent<HTMLAnchorElement>) {
  e.currentTarget.style.setProperty("--tilt-x", "0deg");
  e.currentTarget.style.setProperty("--tilt-y", "0deg");
}

export function Expertise({ expertise, index, projects = [] }: { expertise: SiteContent["expertise"]; index: string; projects?: Work[] }) {
  const maps: Record<string, string[]> = { identity: ["identity"], social: ["social"], direction: ["identity", "social"],
    ai: ["ai"], print: ["print"], content: ["social", "ads"], film: ["reels", "ads"], motion: ["motion"] };
  return (
    <section id="expertise" className="section relative overflow-hidden bg-petrol text-white" aria-labelledby="expertise-title">
      <div className="pointer-events-none absolute -top-32 right-[10%] size-[26rem] rounded-full bg-teal/80 blur-3xl" aria-hidden="true" />
      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading tone="dark" index={index} label={expertise.label} id="expertise-title" title={expertise.headline} className="lg:col-span-6" />
          <p className="reveal text-[1.05rem] leading-9 text-white/70 lg:col-span-5 lg:col-start-8">{expertise.intro}</p>
        </div>
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {expertise.items.map((item, i) => {
            const sample = projects.find(w => !w.demo && (maps[item.icon] || []).includes(w.category));
            return (
              <li key={item.title} className="reveal service-item" style={{ ["--delay" as string]: `${(i % 4) * 0.07}s` }}>
                <Link href={`/services/${item.icon}`} className="service-card service-card-tilt group h-full" onPointerMove={tilt} onPointerLeave={reset} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { e.currentTarget.style.setProperty("--tilt-x", "0deg"); e.currentTarget.style.setProperty("--tilt-y", "0deg"); } }} data-cursor="استكشف" aria-label={`استكشف خدمة ${item.title}`}>
                  {sample ? <div className="service-preview pointer-events-none absolute inset-x-4 top-4 h-32 overflow-hidden rounded-xl" aria-hidden="true"><Image src={sample.cover.src} alt="" fill sizes="240px" className="object-cover" /></div> : null}
                  <div className="relative z-[1] flex items-start justify-between gap-4">
                    <span className="service-icon"><LineIcon name={item.icon} className="size-[26px]" /></span>
                    <span className="font-latin text-xs tracking-[0.16em] text-white/35">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="relative z-[1] mt-10 text-[1.22rem] font-bold leading-snug text-white">{item.title}</h3>
                  <p className="relative z-[1] mt-3 leading-8 text-white/65">{item.description}</p>
                  <span className="service-card-cta relative z-[1] mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-cyan group-hover:underline"><span>استكشف الخدمة</span><span className="service-card-arrow" aria-hidden="true">↖</span></span>
                  <span className="service-line" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
