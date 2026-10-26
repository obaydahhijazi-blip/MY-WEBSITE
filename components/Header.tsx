"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/icons";
import { MusicToggle } from "@/components/MusicToggle";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import type { SiteContent } from "@/lib/cms/types";

type NavItem = { id: string; label: string };

type Props = {
  items: NavItem[];
  nameAr: string;
  whatsappHref: string;
  ctaLabel: string;
  music: SiteContent["settings"]["music"];
};

export function Header({ items, nameAr, whatsappHref, ctaLabel, music }: Props) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Solid header once the hero has scrolled away.
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Scroll-spy for the current section.
  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  // Mobile menu: Escape to close, focus trap, scroll lock.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    lockScroll();
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const focusables = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a,button"));
        const all = toggle ? [toggle, ...focusables] : focusables;
        const first = all[0];
        const last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      unlockScroll();
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      toggle?.focus();
    };
  }, [open]);

  const isSolid = solid || open;

  /* eslint-disable @next/next/no-img-element -- tiny static logo, both variants preloaded to avoid a swap flash */
  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b border-transparent ${isSolid ? "text-ink" : "text-white"}`}
      data-solid={isSolid}
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4 lg:gap-8">
        <a href="#top" className="flex shrink-0 items-center gap-3" aria-label={`${nameAr} — العودة إلى الأعلى`}>
          <img src="/images/brand/logo-white.webp" alt="" width={600} height={402} className={`h-10 w-auto sm:h-12 ${isSolid ? "hidden" : ""}`} />
          <img src="/images/brand/logo-dark.webp" alt="" width={600} height={402} className={`h-10 w-auto sm:h-12 ${isSolid ? "" : "hidden"}`} />
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[0.92rem] font-medium xl:gap-8">
            {items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="nav-link" aria-current={active === item.id ? "true" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {music?.src ? <MusicToggle {...music} /> : null}
          <a href="#quote" className="btn btn-primary hidden !min-h-11 !px-5 text-[0.9rem] md:inline-flex">
            {ctaLabel}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp_click"
            className="grid size-11 place-items-center rounded-full border border-current/20 transition-colors hover:border-current/60 md:hidden"
            aria-label="تواصل عبر واتساب (يفتح في نافذة جديدة)"
          >
            <WhatsAppIcon />
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="grid size-11 place-items-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        data-lenis-prevent
        className="h-[calc(100dvh-var(--header-h))] overflow-y-auto overscroll-contain border-t border-line bg-paper text-ink lg:hidden"
      >
        <nav aria-label="قائمة الجوال" className="container-x flex min-h-full flex-col py-6">
          <ul className="divide-y divide-line">
            {items.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => setOpen(false)} className="flex min-h-14 items-center justify-between py-3 text-xl font-semibold">
                  {item.label}
                  <span className="font-latin text-xs tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-8">
            <a href="#quote" onClick={() => setOpen(false)} className="btn btn-dark w-full">
              {ctaLabel}
            </a>
            <a href="#consultation" onClick={() => setOpen(false)} className="btn btn-outline w-full">
              احجز استشارة مجانية
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" className="inline-flex min-h-12 items-center justify-center gap-2 text-sm font-medium text-ink-2">
              <WhatsAppIcon />
              تواصل عبر واتساب
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
