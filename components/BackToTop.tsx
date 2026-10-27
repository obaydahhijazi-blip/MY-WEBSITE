"use client";

import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/icons";

/** A non-obstructive back-to-top control: hidden at the hero and near the footer. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const footer = document.getElementById("contact");
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight - 70 : false;
      setVisible(window.scrollY > Math.max(520, window.innerHeight * 0.65) && !nearFooter);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <a
      href="#top"
      aria-label="العودة إلى أعلى الصفحة"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`back-top fixed z-40 grid size-11 place-items-center rounded-full bg-petrol text-cyan shadow-lg ring-1 ring-cyan/20 transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <ArrowIcon direction="up" className="size-4" />
    </a>
  );
}
