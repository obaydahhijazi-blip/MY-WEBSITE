type IconProps = { className?: string };

const base = { "aria-hidden": true, focusable: false } as const;

export function WhatsAppIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.14 6.43 2.14 11.9c0 1.75.46 3.45 1.33 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.26-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.04-.38-1.99-1.23-.73-.66-1.23-1.47-1.37-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.16 1.75 2.67 4.24 3.75.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowIcon({ className = "size-4", direction = "left" }: IconProps & { direction?: "left" | "right" | "down" | "up" }) {
  const rotate = { left: 0, right: 180, down: -90, up: 90 }[direction];
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function CloseIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M4 8h16M4 16h10" />
    </svg>
  );
}

export function CalendarIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function Star8({ className = "size-4" }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.00 1.00 L14.53 5.90 L19.78 4.22 L18.10 9.47 L23.00 12.00 L18.10 14.53 L19.78 19.78 L14.53 18.10 L12.00 23.00 L9.47 18.10 L4.22 19.78 L5.90 14.53 L1.00 12.00 L5.90 9.47 L4.22 4.22 L9.47 5.90Z" />
    </svg>
  );
}

/* ───────── Line icons for services and process steps (24px grid, 1.5 stroke) ───────── */
const line = { ...base, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const LINE_ICONS: Record<string, React.ReactNode> = {
  identity: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17" opacity=".35" />
      <path d="M8 15.5 12 7l4 8.5M9.6 12.6h4.8" />
    </>
  ),
  social: (
    <>
      <rect x="3.5" y="5" width="17" height="12" rx="2.5" />
      <path d="m8 21 4-4 4 4" />
      <path d="M7.5 11.5 10 9l2.5 2.5L15 9l1.5 1.5" />
    </>
  ),
  direction: (
    <>
      <path d="M4 20 20 4" />
      <path d="M14 4h6v6" />
      <circle cx="7" cy="7" r="2.5" />
      <path d="M14.5 17.5h5M17 15v5" />
    </>
  ),
  ai: (
    <>
      <path d="M12 3.5 13.6 8.4 18.5 10 13.6 11.6 12 16.5 10.4 11.6 5.5 10 10.4 8.4Z" />
      <path d="M18 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
    </>
  ),
  print: (
    <>
      <path d="M6 3.5h9l3 3v14H6Z" />
      <path d="M15 3.5v3h3M9 11h6M9 14h6M9 17h3.5" />
    </>
  ),
  content: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" />
    </>
  ),
  film: (
    <>
      <rect x="3.5" y="6" width="12" height="12" rx="2" />
      <path d="m15.5 10.5 5-3v9l-5-3" />
    </>
  ),
  listen: (
    <>
      <path d="M4 11.5a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1.5v-6H20M4 11.5h3.5v6H6a2 2 0 0 1-2-2Z" />
    </>
  ),
  idea: (
    <>
      <path d="M9 17.5h6M10 20.5h4" />
      <path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.7.5 1.2 1.3 1.2 2.2v1.8h4v-1.8c0-.9.5-1.7 1.2-2.2A5.5 5.5 0 0 0 12 3.5Z" />
    </>
  ),
  build: (
    <>
      <path d="m14.5 6.5 3 3L8 19H5v-3Z" />
      <path d="m12.5 8.5 3 3M16 5l1.5-1.5 3 3L19 8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  free: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.9" />
    </>
  ),
  chat: (
    <>
      <path d="M4.5 18.5V7a2.5 2.5 0 0 1 2.5-2.5h10A2.5 2.5 0 0 1 19.5 7v6a2.5 2.5 0 0 1-2.5 2.5H8Z" />
      <path d="M8.5 9h7M8.5 12h4.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.8c1.7.7 2.8 2.3 3 4.7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 4 8.5 4.5L12 13 3.5 8.5Z" />
      <path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 20.5s6-5.4 6-10.5a6 6 0 0 0-12 0c0 5.1 6 10.5 6 10.5Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  deliver: (
    <>
      <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16Z" />
      <path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" />
      <path d="m8 5.8 8.5 4.5" opacity=".45" />
    </>
  ),
};

export function LineIcon({ name, className = "size-6" }: { name: string; className?: string }) {
  return (
    <svg {...line} className={className}>
      {LINE_ICONS[name] ?? LINE_ICONS.content}
    </svg>
  );
}

export function PlusMinusIcon({ open, className = "size-5" }: { open: boolean; className?: string }) {
  return (
    <svg {...line} className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" style={{ transform: open ? "scaleY(0)" : "none", transformOrigin: "center", transition: "transform .35s cubic-bezier(.22,1,.36,1)" }} />
    </svg>
  );
}

export function MusicIcon({ playing, className = "size-5" }: { playing: boolean; className?: string }) {
  if (!playing)
    return (
      <svg {...line} className={className}>
        <path d="M9 18V5.5l10-2V16" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="16.5" cy="16" r="2.5" />
      </svg>
    );
  return (
    <svg {...base} viewBox="0 0 24 24" fill="currentColor" className={className}>
      {[5, 9.5, 14, 18.5].map((x, i) => (
        <rect key={x} x={x - 1} width="2" rx="1" y={6} height={12} className="eq-bar" style={{ animationDelay: `${i * 0.13}s`, transformOrigin: "center", transformBox: "fill-box" }} />
      ))}
    </svg>
  );
}

export function PlayIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg {...base} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.5v13l10.5-6.5Z" />
    </svg>
  );
}
