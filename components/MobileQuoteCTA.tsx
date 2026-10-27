"use client";

import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/icons";

/** A mobile-only quote shortcut, visible below the hero and hidden before the quote form. */
export function MobileQuoteCTA({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = document.getElementById("top");
      const quote = document.getElementById("quote");
      const footer = document.getElementById("contact");
      const heroPassed = hero ? hero.getBoundingClientRect().bottom < window.innerHeight * 0.45 : window.scrollY > 400;
      const beforeQuote = quote ? quote.getBoundingClientRect().top > window.innerHeight * 0.8 : true;
      const beforeFooter = footer ? footer.getBoundingClientRect().top > window.innerHeight : true;
      setVisible(heroPassed && beforeQuote && beforeFooter);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <a
      href="#quote"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`mobile-quote-cta fixed z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-bold text-petrol shadow-[0_8px_30px_-6px_rgb(0_30_37/.4)] transition-[opacity,transform] duration-300 lg:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
    >
      {label}
      <ArrowIcon direction="left" className="cta-arrow size-4" />
    </a>
  );
}
