"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";

/** Discreet mobile contact affordance; appears after the hero and hides near the contact footer. */
export function FloatingWhatsApp({ href }: { href: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const footer = document.getElementById("contact");
    const booking = document.getElementById("consultation");
    const quote = document.getElementById("quote");
    if (!hero || !footer) return;
    const state = { hero: true, footer: false, booking: false, quote: false };
    const update = () => setShow(!state.hero && !state.footer && !state.booking && !state.quote);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) state.hero = e.isIntersecting;
        if (e.target === footer) state.footer = e.isIntersecting;
        if (e.target === booking) state.booking = e.isIntersecting;
        if (e.target === quote) state.quote = e.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    io.observe(footer);
    if (booking) io.observe(booking);
    if (quote) io.observe(quote);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب (يفتح في نافذة جديدة)"
      data-track="whatsapp_click"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed bottom-5 left-4 z-40 grid size-13 place-items-center rounded-full bg-petrol text-white shadow-[0_10px_30px_-8px_rgb(0_30_37/0.5)] ring-1 ring-white/10 transition-all duration-500 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <WhatsAppIcon className="size-6 text-cyan" />
    </a>
  );
}
