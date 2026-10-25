"use client";

import { useEffect, useRef } from "react";
import { ArrowIcon } from "@/components/icons";

type Props = {
  eyebrow: string;
  nameAr: string;
  nameEn: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  scrollLabel: string;
  /** Availability badge; omitted when the owner hasn't confirmed a status. */
  availability?: { status: "available" | "full"; label: string; preview: boolean };
};

/**
 * Motion envelope (px at full pointer deflection). Positive = follows the pointer,
 * negative = moves against it. Kept deliberately small: depth, not spectacle.
 */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const DEPTH: Record<string, number> = {
  bg: -4,
  sweep: 9,
  "star-lg": -10,
  "ps-left": 18,
  portrait: -10,
  "ps-right": 15,
  "star-sm": 13,
  text: 2,
};

export function HeroScene(props: Props) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => ({
      el,
      depth: DEPTH[el.dataset.depth ?? ""] ?? 0,
    }));

    let target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let inView = true;
    let enabled = mq.matches;

    const render = () => {
      // Lerp toward the target; stop the loop once settled so nothing runs while idle.
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      for (const { el, depth } of layers) {
        el.style.transform = `translate3d(${(current.x * depth).toFixed(2)}px, ${(current.y * depth * 0.6).toFixed(2)}px, 0)`;
      }
      if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf && inView) raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      target = {
        x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
        y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)),
      };
      kick();
    };
    const onLeave = () => {
      target = { x: 0, y: 0 };
      kick();
    };
    const onMq = () => {
      enabled = mq.matches;
      if (!enabled) {
        target = { x: 0, y: 0 };
        current.x = current.y = 0;
        layers.forEach(({ el }) => (el.style.transform = ""));
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });

    io.observe(hero);
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    mq.addEventListener("change", onMq);
    return () => {
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      mq.removeEventListener("change", onMq);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* eslint-disable @next/next/no-img-element -- hero layers are hand-positioned in an art-directed stage */
  return (
    <section id="top" ref={heroRef} className="hero" aria-labelledby="hero-title">
      {/* Desktop: background and figure keep the cover's proportions (stage);
          floating decorations are clamped to the viewport so none is lost at 100% zoom. */}
      <div className="hero-stage" aria-hidden="true">
        <div className="hero-layer layer-bg" data-depth="bg">
          <picture>
            <source media="(max-width: 1023.98px)" srcSet={BLANK} />
            <img src="/images/hero/bg-desktop.webp" alt="" width={2880} height={1147} fetchPriority="high" decoding="async" />
          </picture>
        </div>
      </div>
      <div className="hero-decor" aria-hidden="true">
        <div className="hero-layer decor-star-lg" data-depth="star-lg">
          <img src="/images/hero/cyan-glow-star-large.webp" alt="" width={700} height={672} loading="lazy" decoding="async" />
        </div>
        <div className="hero-layer decor-ps-left" data-depth="ps-left">
          <img src="/images/hero/floating-photoshop-left.webp" alt="" width={480} height={486} loading="lazy" decoding="async" className="hero-enter" style={{ ["--delay" as string]: "0.5s" }} />
        </div>
      </div>
      <div className="hero-stage hero-stage-front" aria-hidden="true">
        <div className="hero-layer layer-portrait" data-depth="portrait">
          <picture>
            <source media="(max-width: 1023.98px)" srcSet={BLANK} />
            <img
              src="/images/hero/portrait.webp"
              srcSet="/images/hero/portrait-900.webp 900w, /images/hero/portrait.webp 1205w"
              sizes="26vw"
              alt=""
              width={1205}
              height={1466}
              fetchPriority="high"
              decoding="async"
              className="hero-portrait-enter"
            />
          </picture>
        </div>
        <div className="hero-layer layer-sweep" data-depth="sweep">
          <img src="/images/hero/teal-light-sweep.webp" alt="" width={2880} height={469} loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="hero-decor hero-decor-front" aria-hidden="true">
        <div className="hero-layer decor-ps-right" data-depth="ps-right">
          <img src="/images/hero/floating-photoshop-right.webp" alt="" width={480} height={777} loading="lazy" decoding="async" />
        </div>
        <div className="hero-layer decor-star-sm" data-depth="star-sm">
          <img src="/images/hero/cyan-glow-star-small.webp" alt="" width={237} height={242} loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="hero-vignette" aria-hidden="true" />

      {/* Mobile / tablet: separate static composition */}
      <div className="hero-mobile-art" aria-hidden="true">
        <picture>
          <source media="(min-width: 1024px)" srcSet={BLANK} />
          <img className="m-bg" src="/images/hero/bg-mobile.webp" alt="" width={1100} height={936} fetchPriority="high" />
        </picture>
        <img className="m-ps hero-enter" src="/images/hero/floating-photoshop-left.webp" alt="" width={480} height={486} loading="lazy" style={{ ["--delay" as string]: "0.4s" }} />
        <picture>
          <source media="(min-width: 1024px)" srcSet={BLANK} />
          <img className="m-portrait hero-portrait-enter" src="/images/hero/portrait-900.webp" alt="" width={900} height={1095} fetchPriority="high" />
        </picture>
      </div>

      <div className="hero-inner container-x relative flex flex-col justify-center pb-12 sm:pb-14 lg:pb-20 lg:pt-[var(--header-h)]">
        <div className="relative z-10 max-w-[34rem] max-lg:-mt-8 lg:w-[44%] lg:max-w-[36rem]" data-depth="text">
          <p className="hero-enter text-[0.9rem] font-medium text-cyan sm:text-[0.95rem]" style={{ ["--delay" as string]: "0.1s" }}>
            {props.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="hero-enter mt-3 text-[clamp(2.15rem,8.6vw,2.9rem)] font-bold leading-[1.25] sm:text-[clamp(2.6rem,6vw,3.4rem)] lg:mt-4 lg:text-[clamp(3.1rem,4.6vw,4.6rem)] lg:leading-[1.18]"
            style={{ ["--delay" as string]: "0.2s" }}
          >
            {props.nameAr}
            <span className="sr-only"> — {props.nameEn}</span>
          </h1>

          <img
            src="/images/brand/name-title-lockup.webp"
            alt=""
            aria-hidden="true"
            width={1310}
            height={580}
            className="hero-enter mt-6 w-[min(210px,62vw)] opacity-95 sm:w-[250px] lg:mt-8 lg:w-[clamp(260px,24vw,370px)]"
            style={{ ["--delay" as string]: "0.3s" }}
          />

          <p className="hero-enter mt-6 max-w-[28rem] text-pretty text-[1rem] leading-8 text-white/80 sm:text-[1.05rem] lg:mt-8 lg:text-[clamp(1.05rem,1.25vw,1.18rem)] lg:leading-9" style={{ ["--delay" as string]: "0.4s" }}>
            {props.description}
          </p>

          <div className="hero-enter mt-7 grid gap-3 sm:flex sm:flex-wrap lg:mt-9" style={{ ["--delay" as string]: "0.5s" }}>
            <a href="#quote" className="btn btn-primary">
              {props.primaryCta}
            </a>
            <a href="#consultation" className="btn btn-ghost-light">
              {props.secondaryCta}
            </a>
          </div>
          {props.availability ? (
            <p className="hero-enter mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[0.8rem] text-white/85 backdrop-blur-sm" style={{ ["--delay" as string]: "0.6s" }}>
              <span className={`avail-dot ${props.availability.status === "full" ? "is-full" : ""}`} aria-hidden="true" />
              {props.availability.label}
              {props.availability.preview ? <span className="rounded bg-yellow/90 px-1.5 text-[0.65rem] font-semibold text-petrol">معاينة</span> : null}
            </p>
          ) : null}
        </div>

        <a
          href="#about"
          className="scroll-cue absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-white/60 transition-colors hover:text-white lg:flex"
        >
          {props.scrollLabel}
          <span className="relative block h-9 w-px overflow-hidden bg-white/20">
            <span className="dot absolute inset-x-0 top-0 block h-3 bg-cyan" />
          </span>
          <ArrowIcon direction="down" className="sr-only" />
        </a>
      </div>
    </section>
  );
}
