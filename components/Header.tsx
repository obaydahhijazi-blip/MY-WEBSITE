"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon, CloseIcon, WhatsAppIcon, LineIcon } from "@/components/icons";
import { MusicToggle } from "@/components/MusicToggle";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import type { Category, Service, SiteContent } from "@/lib/cms/types";

type NavItem = { id: string; label: string };

type Props = {
  items: NavItem[];
  nameAr: string;
  whatsappHref: string;
  ctaLabel: string;
  music: SiteContent["settings"]["music"];
  services?: Service[];
  categories?: Category[];
  /** Subpages need absolute section targets and a solid header without a hero. */
  interior?: boolean;
};

export function Header({ items, nameAr, whatsappHref, ctaLabel, music, services = [], categories = [], interior = false }: Props) {
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

  // Stable section highlighting, including at section boundaries and after hash navigation.
  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.scrollY < window.innerHeight * 0.35) {
        setActive(null);
        return;
      }
      const line = Math.min(window.innerHeight * 0.43, 320);
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
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

  const isSolid = interior || solid || open;
  const anchor = (id: string) => `${interior ? "/" : ""}#${id}`;
  const isMega = (id: string) => (id === "expertise" && services.length > 0) || ((id === "works" || id === "video") && categories.length > 0);
  const workCategories = (id: string) => categories.filter(category => category.group === (id === "works" ? "design" : "video"));
  const categoryHref = (id: string, category: string) => `/?workCategory=${encodeURIComponent(category)}#${id}`;
  const handleWorkLink = (event: React.MouseEvent<HTMLAnchorElement>, id: string, category: string) => {
    if (interior || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    const href = categoryHref(id, category);
    window.history.pushState({}, "", href);
    window.dispatchEvent(new CustomEvent("portfolio:filter", { detail: { category, group: id === "works" ? "design" : "video" } }));
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  };

  /* eslint-disable @next/next/no-img-element -- tiny static logo, both variants preloaded to avoid a swap flash */
  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b border-transparent ${isSolid ? "text-ink" : "text-white"}`}
      data-solid={isSolid}
    >
      <div className="header-inner container-x flex items-center justify-between gap-4 lg:gap-8">
        <a href={interior ? "/" : "#top"} className="header-wordmark shrink-0 font-latin text-[0.8rem] font-bold tracking-[0.055em] sm:text-[0.92rem]" aria-label={`${nameAr} — العودة إلى الأعلى`}>
          OBAYDAH<span className="text-cyan">.</span>GRAPHIC
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
          <ul className="flex items-center gap-5 text-[0.92rem] font-medium xl:gap-7">
            {items.map((item) => (
              <li key={item.id} className={isMega(item.id) ? "nav-mega-parent" : undefined}>
                <a href={anchor(item.id)} className="nav-link nav-top-link" aria-current={active === item.id ? "true" : undefined} aria-haspopup={isMega(item.id) ? "true" : undefined}>
                  {item.label}
                  {isMega(item.id) && <span className="nav-chevron" aria-hidden="true">⌄</span>}
                </a>
                {isMega(item.id) && <div className="nav-mega-panel" dir="rtl">
                  <div className="nav-mega-heading">
                    <strong>{item.id === "expertise" ? "استكشف تخصصاتي" : item.id === "works" ? "معرض أعمال التصميم" : "الفيديو والإنتاج المرئي"}</strong>
                    <span>{item.id === "expertise" ? "اختر الخدمة المناسبة لمشروعك" : "انتقل مباشرة إلى التصنيف الذي يهمك"}</span>
                  </div>
                  <div className="nav-mega-grid">
                    {item.id === "expertise" ? services.map(service => (
                      <a key={service.icon} href={`/services/${service.icon}`} className="nav-mega-item">
                        <span className="nav-mega-symbol"><LineIcon name={service.icon} className="size-5" /></span>
                        <span className="min-w-0"><strong>{service.title}</strong><small>{service.description}</small></span>
                      </a>
                    )) : <>
                      <a href={categoryHref(item.id, "all")} onClick={e => handleWorkLink(e,item.id,"all")} className="nav-mega-item">
                        <span className="nav-mega-symbol"><LineIcon name="grid" className="size-5" /></span>
                        <span><strong>جميع الأعمال</strong><small>استعراض كل المشاريع ضمن القسم</small></span>
                      </a>
                      {workCategories(item.id).map((category, i) => <a key={category.id} href={categoryHref(item.id,category.id)} onClick={e => handleWorkLink(e,item.id,category.id)} className="nav-mega-item">
                        <span className="nav-mega-symbol nav-mega-number">{String(i+1).padStart(2,"0")}</span>
                        <span><strong>{category.label}</strong><small>تصفّح مشاريع {category.label}</small></span>
                      </a>)}
                    </>}
                  </div>
                </div>}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {music?.src ? <MusicToggle {...music} /> : null}
          <a href={anchor("quote")} className="btn btn-primary hidden !min-h-11 !px-5 text-[0.9rem] md:inline-flex">
            {ctaLabel}
            <ArrowIcon direction="left" className="size-4 cta-arrow" />
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
            className="header-menu-trigger inline-flex min-h-11 items-center justify-center rounded-full border border-current/25 px-3 text-sm font-semibold lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <span className="header-menu-text">القائمة</span>}
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
                <div className="flex items-center justify-between gap-3">
                  <a href={anchor(item.id)} onClick={() => setOpen(false)} className="flex min-h-14 flex-1 items-center justify-between py-3 text-xl font-semibold">
                    {item.label}<span className="font-latin text-xs tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </a>
                </div>
                {isMega(item.id) && <details className="nav-mobile-details">
                  <summary>عرض أقسام {item.label}</summary>
                  <div className="nav-mobile-subitems">
                    {item.id === "expertise" ? services.map(service => <a key={service.icon} href={`/services/${service.icon}`} onClick={() => setOpen(false)}>{service.title}</a>) :
                    <>
                      <a href={categoryHref(item.id,"all")} onClick={() => setOpen(false)}>جميع الأعمال</a>
                      {workCategories(item.id).map(category => <a key={category.id} href={categoryHref(item.id,category.id)} onClick={() => setOpen(false)}>{category.label}</a>)}
                    </>}
                  </div>
                </details>}
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-8">
            <a href="#quote" onClick={() => setOpen(false)} className="btn btn-dark w-full">
              {ctaLabel}
            </a>
            <a href={anchor("consultation")} onClick={() => setOpen(false)} className="btn btn-outline w-full">
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
