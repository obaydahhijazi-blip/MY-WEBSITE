"use client";

import { useEffect, useRef } from "react";

/** File-format objects, not Adobe application tiles. Decorative and never interactive. */
export type DesignFormat = "PSD" | "AI" | "PRPROJ" | "AEP";
const FORMATS: Record<DesignFormat, { color: string; dark: string; label: string }> = {
  PSD: { color: "#39B7F4", dark: "#112C42", label: "Photoshop project file" },
  AI: { color: "#FFB24F", dark: "#392211", label: "Illustrator document file" },
  PRPROJ: { color: "#9CA7FF", dark: "#24284D", label: "Premiere Pro project file" },
  AEP: { color: "#CBB5FF", dark: "#34274C", label: "After Effects project file" },
};

function DesignFile({ type, index }: { type: DesignFormat; index: number }) {
  const item = FORMATS[type];
  return (
    <span className={"design-file design-file-" + index} style={{ ["--file-accent" as string]: item.color, ["--file-dark" as string]: item.dark }}>
      <span className="design-file-float">
        <svg viewBox="0 0 110 140" fill="none" focusable="false" aria-hidden="true">
          <defs>
            <linearGradient id={"paper-" + type} x1="8" x2="103" y1="7" y2="131" gradientUnits="userSpaceOnUse">
              <stop stopColor="#163A43" />
              <stop offset="1" stopColor={item.dark} />
            </linearGradient>
            <linearGradient id={"fold-" + type} x1="65" x2="103" y1="8" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor={item.color} stopOpacity=".48" />
              <stop offset="1" stopColor={item.color} stopOpacity=".05" />
            </linearGradient>
          </defs>
          <path d="M16 7H70L102 39V125C102 130 98 134 93 134H16C11 134 7 130 7 125V16C7 11 11 7 16 7Z" fill={"url(#paper-" + type + ")"} stroke={item.color} strokeOpacity=".85" strokeWidth="1.7"/>
          <path d="M70 7V39H102" fill={"url(#fold-" + type + ")"} stroke={item.color} strokeOpacity=".9" strokeWidth="1.5"/>
          <path d="M16 7H70L102 39V125" stroke="white" strokeOpacity=".22" strokeWidth="1.2"/>
          <path d="M7 18L3 23V126C3 135 9 139 18 139H94L102 134" stroke={item.color} strokeOpacity=".28" strokeWidth="3"/>
          <rect x="14" y="69" width="83" height="37" rx="8" fill={item.color} fillOpacity=".14" stroke={item.color} strokeOpacity=".38"/>
          <text x="55" y="93" fill={item.color} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize={type.length > 4 ? 15 : 22} letterSpacing=".4">{type}</text>
          <path d="M19 119H67" stroke={item.color} strokeOpacity=".4" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
    </span>
  );
}

/** Four small semi-3D document assets across the site, with lightweight pointer parallax. */
export function FloatingDesignFiles({ files, placement }: { files: DesignFormat[]; placement: "hero" | "video" | "process" }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    const host = el?.closest("section");
    if (!el || !host || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let raf = 0;
    let pending = { x: 0, y: 0 };
    const render = () => {
      raf = 0;
      el.style.setProperty("--file-px", pending.x.toFixed(1) + "px");
      el.style.setProperty("--file-py", pending.y.toFixed(1) + "px");
    };
    const move = (event: Event) => {
      const e = event as PointerEvent;
      if (e.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      pending = { x: ((e.clientX - rect.left) / rect.width - .5) * 18,
        y: ((e.clientY - rect.top) / rect.height - .5) * 12 };
      if (!raf) raf = requestAnimationFrame(render);
    };
    const reset = () => {
      pending = { x: 0, y: 0 };
      if (!raf) raf = requestAnimationFrame(render);
    };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", reset);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={root} className={"floating-design-files floating-design-" + placement} aria-hidden="true">
      {files.map((file, index) => <DesignFile key={file} type={file} index={index + 1} />)}
    </div>
  );
}
