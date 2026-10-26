"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { SiteContent, Work } from "@/lib/cms/types";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";
import { TrackClicks } from "@/components/TrackClicks";

type Props = { content: SiteContent; homeUrl: string };
const SERVICES: Record<string, { title: string; description: string }> = {
  identity: { title: "Brand Identity", description: "Distinct visual systems that express the brand and work consistently across touchpoints." },
  social: { title: "Advertising & Social Media", description: "Purpose-built visual content for digital campaigns and social platforms." },
  direction: { title: "Art Direction", description: "Creative direction, visual concepts and considered compositions." },
  film: { title: "Reels & Video Advertising", description: "Video and reel production tailored to marketing and digital channels." },
  motion: { title: "Motion Graphics", description: "Animated visuals and typography that bring clarity and rhythm to a message." },
  ai: { title: "AI-Assisted Production", description: "Using generative tools thoughtfully in visual development and production." },
  print: { title: "Print & Company Profiles", description: "Well-structured print materials and professional company presentations." },
  content: { title: "Visual Content Creation", description: "Presenting messages visually for the right audience and medium." },
};
const CATEGORIES: Record<string, string> = {
  identity: "Brand Identity", social: "Social Media", print: "Print",
  reels: "Reels", ads: "Video Advertising", motion: "Motion Graphics", ai: "AI Projects",
};
const COUNTRIES: Record<string, string> = {
  "760": "Syria", "400": "Jordan", "682": "Saudi Arabia", "368": "Iraq",
  "792": "Türkiye", "414": "Kuwait", "784": "United Arab Emirates",
  "276": "Germany", "124": "Canada", "442": "Luxembourg",
};
const PROCESS = [
  { title: "Discovery", text: "Understanding your goals, audience and project scope before the design begins." },
  { title: "Concept", text: "Developing a distinctive visual direction for review and approval." },
  { title: "Creation", text: "Producing the work with the agreed review and revision rounds." },
  { title: "Delivery", text: "Providing organized, ready-to-use final files as agreed." },
];
const FAQ = [
  ["How does a project begin?", "We discuss requirements, approve a quotation and receive the agreed advance payment."],
  ["Is an advance payment required?", "Yes. An advance is due before work begins; the balance is due before final delivery."],
  ["Do you provide editable source files?", "Native source files such as PSD and AI are not included unless separately agreed."],
  ["Are revisions included?", "The quotation defines the included revision rounds. Additional changes are quoted separately."],
  ["How long does a project take?", "The timeline is agreed in advance based on scope and complexity."],
  ["What happens if a project is cancelled?", "Fees are settled according to completed work and the agreed terms."],
  ["Who owns the design?", "The client receives the agreed usage rights once all payments have been completed."],
  ["Are project details confidential?", "Project information is handled confidentially under the collaboration agreement."],
  ["Can we work together internationally?", "Yes. Projects can be delivered remotely for clients in different countries."],
];
const QUOTE_SERVICES = [
  "Brand Identity", "Advertising & Social Media", "Art Direction",
  "Reels & Video Advertising", "Motion Graphics", "AI-Assisted Production",
  "Print & Company Profiles", "Visual Content Creation", "Other",
];
const NAV = [
  ["about", "About"], ["clients", "Clients"], ["expertise", "Expertise"],
  ["works", "Work"], ["video", "Video & AI"], ["process", "Process"],
  ["quote", "Quote"], ["consultation", "Free consultation"], ["faq", "FAQ"],
];
const sectionLabel = (index: number, label: string) => (
  <p className="mb-5 flex items-center gap-3 font-latin text-sm font-semibold uppercase tracking-[0.18em] text-cyan-ink">
    <span>{String(index).padStart(2, "0")}</span><span className="h-px w-7 bg-cyan" />{label}
  </p>
);
const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan";
const safeLink = (value: string) => value.startsWith("https://") || value.startsWith("http://") ? value : "#";

function EnglishQuote({ phone }: { phone: string }) {
  const [showExtra, setShowExtra] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    if (get("name").length < 2 || !get("service") || get("details").length < 10) return;
    const parts = [
      "Hello Obaydah, I would like to request a quote for a project.",
      "Name: " + get("name"), "Service: " + get("service"),
      "Project details: " + get("details"),
      ...(["company", "budget", "timeline", "email", "reference"].filter(k => get(k)).map(k => k + ": " + get(k))),
      "Please let me know the next steps.",
    ];
    const href = whatsappLink(phone, parts.join("\n"));
    track("quote_whatsapp_click", { service: get("service"), language: "en" });
    setOpened(href);
    window.open(href, "_blank", "noopener,noreferrer");
  }
  const fieldStyle = "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-cyan";
  return (
    <section id="quote" className="bg-paper py-24">
      <div className="container-x">
        <div className="rounded-[30px] bg-petrol px-6 py-10 text-white shadow-2xl md:px-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              {sectionLabel(9, "Start your project")}
              <h2 className="font-latin text-[clamp(2rem,4vw,3.7rem)] font-semibold leading-tight">Request a project quote</h2>
              <p className="mt-6 max-w-md leading-8 text-white/70">Share your requirements and I will review them to discuss the most suitable next step and quotation.</p>
              <ol className="mt-9 space-y-4 text-white/70">
                <li>01 — Describe your project</li><li>02 — Send the request via WhatsApp</li>
                <li>03 — Receive a follow-up after review</li>
              </ol>
              <a href="#consultation" className="mt-8 inline-block text-sm text-cyan underline underline-offset-4">Prefer a conversation first? Book a free consultation</a>
            </div>
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              <label className="grid gap-2 text-sm">Full name *<input name="name" autoComplete="name" minLength={2} maxLength={80} required className={fieldStyle} /></label>
              <label className="grid gap-2 text-sm">Service *<select name="service" required defaultValue="" className={fieldStyle}>
                <option value="" disabled className="text-ink">Choose a service</option>
                {QUOTE_SERVICES.map(s => <option key={s} value={s} className="text-ink">{s}</option>)}
              </select></label>
              <label className="grid gap-2 text-sm sm:col-span-2">Project brief *<textarea name="details" required minLength={10} maxLength={800} rows={4} className={fieldStyle} placeholder="What would you like to create?" /></label>
              <button type="button" onClick={() => setShowExtra(!showExtra)} aria-expanded={showExtra} className="text-left text-sm text-cyan sm:col-span-2">{showExtra ? "− Hide optional details" : "+ Add optional details"}</button>
              {showExtra ? <>
                <label className="grid gap-2 text-sm">Company<input name="company" maxLength={80} className={fieldStyle} /></label>
                <label className="grid gap-2 text-sm">Estimated budget<input name="budget" maxLength={80} className={fieldStyle} /></label>
                <label className="grid gap-2 text-sm">Preferred timeline<input name="timeline" maxLength={80} className={fieldStyle} /></label>
                <label className="grid gap-2 text-sm">Email<input name="email" type="email" autoComplete="email" className={fieldStyle} /></label>
                <label className="grid gap-2 text-sm sm:col-span-2">Reference URL<input name="reference" type="url" maxLength={300} className={fieldStyle} /></label>
              </> : null}
              <button type="submit" className={btn + " bg-cyan text-petrol hover:bg-white sm:col-span-2"}>Continue to WhatsApp</button>
              <p className="text-xs leading-6 text-white/60 sm:col-span-2">The message opens in your WhatsApp account. You must press Send there; opening the link alone does not submit the request.</p>
              {opened ? <a href={opened} target="_blank" rel="noreferrer" className="text-sm text-cyan underline sm:col-span-2">WhatsApp did not open? Open the request manually.</a> : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnglishConsultation({ phone, calUrl }: { phone: string; calUrl: string }) {
  const [opened, setOpened] = useState<string | null>(null);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    if (get("name").length < 2 || !get("service")) return;
    const message = [
      "Hello Obaydah, I would like to request a free 30-minute consultation.",
      "Name: " + get("name"), "Project type: " + get("service"),
      "Brief: " + (get("brief") || "Not specified"),
      "Preferred time: " + (get("time") || "Flexible"),
      "Please contact me to confirm a suitable time.",
    ].join("\n");
    const href = whatsappLink(phone, message);
    track("consultation_whatsapp_click", { category: get("service"), language: "en" });
    setOpened(href);
    window.open(href, "_blank", "noopener,noreferrer");
  }
  return (
    <section id="consultation" className="bg-paper-2 py-24">
      <div className="container-x grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {sectionLabel(10, "Consultation")}
          <h2 className="font-latin text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-tight text-ink">Book a <span className="text-cyan-ink">free</span> consultation</h2>
          <p className="mt-6 max-w-md leading-8 text-muted">A personal 30-minute conversation to understand your project, discuss its visual needs and clarify the next steps.</p>
          <ul className="mt-7 space-y-3 text-sm text-ink-2">
            <li>✓ 30 minutes</li><li>✓ No consultation fee</li><li>✓ Discuss your goals and priorities</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-9 lg:col-span-7">
          <h3 className="text-xl font-semibold text-ink">Request a time via WhatsApp</h3>
          <p className="mt-2 text-sm text-muted">Fill in a few details; the final appointment is confirmed after we speak.</p>
          <form onSubmit={submit} className="mt-7 grid gap-4">
            <label className="grid gap-2 text-sm text-ink-2">Full name *<input name="name" required minLength={2} maxLength={80} autoComplete="name" className="rounded-xl border border-line p-3 focus:border-cyan focus:outline-none" /></label>
            <label className="grid gap-2 text-sm text-ink-2">Project type *<select name="service" required defaultValue="" className="rounded-xl border border-line p-3 focus:border-cyan focus:outline-none">
              <option value="" disabled>Choose a project type</option>
              {QUOTE_SERVICES.map(s => <option key={s}>{s}</option>)}
            </select></label>
            <label className="grid gap-2 text-sm text-ink-2">Brief details (optional)<textarea name="brief" rows={2} maxLength={600} className="rounded-xl border border-line p-3 focus:border-cyan focus:outline-none" /></label>
            <label className="grid gap-2 text-sm text-ink-2">Preferred time (optional)<input name="time" maxLength={80} className="rounded-xl border border-line p-3 focus:border-cyan focus:outline-none" /></label>
            <button type="submit" className={btn + " bg-petrol text-white hover:bg-teal"}>Continue with WhatsApp</button>
          </form>
          {opened ? <a href={opened} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-cyan-ink underline">Open WhatsApp request manually</a> : null}
          <div className="my-7 h-px bg-line" />
          <a href={safeLink(calUrl)} target="_blank" rel="noopener noreferrer" onClick={() => track("calendar_open", { language: "en" })} className={btn + " w-full border border-line text-ink hover:bg-paper-2"}>Or choose a time using the calendar</a>
          <p className="mt-3 text-xs text-muted">Calendar availability is managed by Cal.com. A WhatsApp message does not constitute a confirmed booking.</p>
        </div>
      </div>
    </section>
  );
}

export function EnglishPortfolio({ content }: Props) {
  const { settings } = content;
  const [menuOpen, setMenuOpen] = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");
  const [activeWork, setActiveWork] = useState<Work | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const designCategories = useMemo(() => content.works.categories.filter(c => c.group === "design"), [content.works.categories]);
  const videoCategories = useMemo(() => content.works.categories.filter(c => c.group === "video"), [content.works.categories]);
  const designIDs = useMemo(() => new Set(designCategories.map(c => c.id)), [designCategories]);
  const videoIDs = useMemo(() => new Set(videoCategories.map(c => c.id)), [videoCategories]);
  const designWorks = content.works.items.filter(w => designIDs.has(w.category) && (filter === "all" || w.category === filter));
  const videoWorks = content.works.items.filter(w => videoIDs.has(w.category) && (videoFilter === "all" || w.category === videoFilter));
  const quotePhone = settings.whatsappNumber;
  const year = new Date().getFullYear();

  useEffect(() => {
    const html = document.documentElement;
    const oldLang = html.lang, oldDir = html.dir;
    html.lang = "en"; html.dir = "ltr";
    return () => { html.lang = oldLang; html.dir = oldDir; };
  }, []);
  useEffect(() => {
    if (!activeWork) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveWork(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeWork]);

  const openWork = (w: Work, gallery: "design" | "video") => {
    setActiveWork(w); setMediaIndex(0);
    track("portfolio_open", { project: w.id, category: w.category, gallery, language: "en" });
  };
  const section = (id: string, bg: string, children: React.ReactNode) =>
    <section id={id} className={bg + " py-24"}><div className="container-x">{children}</div></section>;
  const workCard = (w: Work, gallery: "design" | "video") => (
    <button key={w.id} type="button" onClick={() => openWork(w, gallery)} className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-cyan">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
        <Image src={w.cover.src} alt={w.cover.alt || w.title} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        {w.demo ? <span className="absolute left-3 top-3 rounded-full bg-yellow px-3 py-1 text-xs font-semibold text-petrol">Sample / Preview</span> : null}
      </div>
      <span className="block p-5">
        <span className="text-xs uppercase tracking-widest text-cyan-ink">{CATEGORIES[w.category] || "Selected work"}</span>
        <span className="mt-2 block text-xl font-semibold text-ink" dir="auto">{w.title}</span>
        {w.client ? <span className="mt-2 block text-sm text-muted" dir="auto">{w.client}</span> : null}
        <span className="mt-4 block text-sm font-medium text-teal">View project →</span>
      </span>
    </button>
  );

  return (
    <div className="english-site bg-paper text-ink" lang="en" dir="ltr" style={{ fontFamily: "'Outfit', Arial, sans-serif", lineHeight: 1.65 }}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-white/15 bg-petrol/95 text-white backdrop-blur-xl">
        <div className="container-x flex min-h-[76px] items-center justify-between gap-3">
          <a href="/en" className="flex shrink-0 items-center gap-2" aria-label="Obaydah Hijazi — home">
            <Image src="/images/brand/logo-white.webp" alt="" width={70} height={55} className="h-12 w-auto" />
            <span className="hidden font-semibold tracking-wider sm:inline">OBAYDAH HIJAZI</span>
          </a>
          <nav className="hidden items-center gap-4 text-sm lg:flex" aria-label="Main navigation">
            {NAV.filter(([id]) => id !== "clients" && id !== "faq").map(([id, label]) => <a key={id} href={"#" + id} className="transition-colors hover:text-cyan">{label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <a href="/" lang="ar" dir="rtl" className="rounded-full border border-white/25 px-3 py-2 text-xs font-bold hover:border-cyan" aria-label="Switch to Arabic">العربية</a>
            <a href="#quote" className={btn + " hidden bg-cyan !px-4 text-petrol sm:inline-flex"}>Request a quote</a>
            <button type="button" aria-expanded={menuOpen} aria-controls="english-nav" className="rounded-lg border border-white/25 p-2 lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
          </div>
        </div>
        {menuOpen ? <nav id="english-nav" aria-label="Mobile navigation" className="border-t border-white/20 px-6 py-4 lg:hidden"><div className="grid gap-3">
          {NAV.map(([id, label]) => <a href={"#" + id} key={id} className="block py-2" onClick={() => setMenuOpen(false)}>{label}</a>)}
        </div></nav> : null}
      </header>

      <main id="main">
        <section id="top" className="relative isolate overflow-hidden bg-petrol text-white">
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/images/hero/bg-desktop.webp')" }} aria-hidden="true" />
          <div className="absolute -right-24 top-14 h-80 w-80 rounded-full bg-cyan/15 blur-3xl" aria-hidden="true" />
          <div className="container-x relative grid min-h-[650px] items-center gap-8 py-20 md:grid-cols-2 md:py-24">
            <div className="relative z-10">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan">Graphic Designer · Visual Artist</p>
              <h1 className="font-latin text-[clamp(2.6rem,5.2vw,5rem)] font-semibold leading-[1.08]">OBAYDAH<br />HIJAZI</h1>
              <p className="mt-7 max-w-xl text-lg leading-9 text-white/80">I craft visual identities, advertising campaigns and art-directed content, using AI tools thoughtfully when they strengthen the creative idea.</p>
              {settings.availability.confirmed && settings.availability.status !== "hidden" ? <p className="mt-6 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-white">{settings.availability.status === "available" ? "Available for new projects" : "Currently fully booked"}</p> : null}
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#quote" className={btn + " bg-cyan text-petrol hover:bg-white"}>Request a quote →</a>
                <a href="#consultation" className={btn + " border border-white/30 text-white hover:bg-white/10"}>Free consultation</a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[460px] self-end" aria-hidden="true">
              <Image src="/images/hero/portrait.webp" alt="" width={1205} height={1466} priority className="relative w-full object-contain drop-shadow-2xl" />
            </div>
          </div>
        </section>
        <div className="overflow-hidden bg-teal px-4 py-6 text-center font-latin text-sm font-semibold uppercase tracking-[0.16em] text-white sm:text-base">
          Creative thinking <span className="mx-4 text-cyan">✦</span> Visual impact <span className="mx-4 text-cyan">✦</span> Thoughtful execution
        </div>

        {section("about", "bg-paper", <>
          {sectionLabel(1, "About")}
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <h2 className="max-w-xl font-latin text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-tight">Great design starts with understanding the idea.</h2>
            <div className="space-y-5 text-lg leading-9 text-ink-2">
              <p>I am Obaydah Hijazi, a graphic designer and visual artist. My practice grew from advertising design into brand identity, digital content and art direction.</p>
              <p>I collaborate with companies and organizations across regional and international markets. I integrate AI-assisted production when it adds value, while keeping concept, execution and detail at the center of the work.</p>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-3 rounded-3xl bg-petrol p-5 text-white md:grid-cols-4 md:p-8">
            <div className="p-3"><strong className="block text-3xl md:text-5xl">7+</strong><span className="text-sm text-white/70">Years of experience</span></div>
            <div className="p-3"><strong className="block text-3xl md:text-5xl">150+</strong><span className="text-sm text-white/70">Clients & organizations</span></div>
            <button type="button" onClick={() => setCountriesOpen(!countriesOpen)} aria-expanded={countriesOpen} className="rounded-xl p-3 text-left transition-colors hover:bg-white/10"><strong className="block text-3xl md:text-5xl">10</strong><span className="text-sm text-white/70">Countries · {countriesOpen ? "Hide" : "Explore"}</span></button>
            <div className="p-3"><strong className="block text-3xl md:text-5xl">{content.expertise.items.length}</strong><span className="text-sm text-white/70">Specializations</span></div>
            {countriesOpen ? <ul className="col-span-2 flex flex-wrap gap-2 border-t border-white/20 pt-5 md:col-span-4">{content.about.countries.map(id => <li key={id} className="rounded-full border border-cyan/30 px-3 py-1 text-sm text-cyan">{COUNTRIES[id] || id}</li>)}</ul> : null}
          </div>
        </>)}

        {section("clients", "bg-paper-2", <>
          {sectionLabel(2, "Collaborations")}
          <div className="grid gap-5 md:grid-cols-2 md:items-end"><h2 className="font-latin text-4xl font-semibold">Brands I've worked with</h2><p className="text-muted">Brands and organizations across different industries and markets.</p></div>
          {content.clients.items.length ? <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{content.clients.items.map(c => <div key={c.name} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl bg-white p-5 text-center">
            <Image src={c.logo.src} alt={c.logo.alt || c.name} width={Math.min(c.logo.width, 200)} height={Math.min(c.logo.height, 100)} className="max-h-14 w-auto object-contain" />
            <span className="text-xs text-muted" dir="auto">{c.name}</span>
            {c.demo ? <span className="text-[10px] text-cyan-ink">SAMPLE / PREVIEW</span> : null}
          </div>)}</div> : <p className="mt-10 rounded-2xl border border-dashed border-line p-8 text-muted">Approved client logos will appear here when available.</p>}
        </>)}

        {section("expertise", "bg-petrol text-white", <>
          {sectionLabel(3, "Expertise")}
          <h2 className="max-w-3xl font-latin text-[clamp(2rem,4vw,3.6rem)] font-semibold">Connected disciplines. One visual direction.</h2>
          <p className="mt-5 max-w-2xl text-white/65">From the initial idea to the final deliverable, each discipline supports a clear, cohesive visual result.</p>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {content.expertise.items.map((s, i) => {
              const info = SERVICES[s.icon] || { title: s.title, description: s.description };
              return <div key={i} className="group rounded-2xl border border-white/15 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/70 hover:bg-white/10">
                <span className="text-xs tracking-widest text-cyan">0{i + 1}</span><h3 className="mt-6 text-xl font-semibold">{info.title}</h3><p className="mt-3 text-sm leading-7 text-white/65">{info.description}</p>
              </div>;
            })}
          </div>
        </>)}

        {section("works", "bg-paper", <>
          {sectionLabel(4, "Portfolio")}
          <h2 className="font-latin text-4xl font-semibold">Selected design work</h2>
          <p className="mt-3 text-muted">Brand identities, social campaigns and print projects.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[{ id: "all", label: "All work" }, ...designCategories.map(c => ({ id: c.id, label: CATEGORIES[c.id] || c.label }))].map(c => <button key={c.id} type="button" aria-pressed={filter === c.id} onClick={() => { setFilter(c.id); track("portfolio_filter", { category: c.id, gallery: "design", language: "en" }); }} className={"rounded-full border px-5 py-2 text-sm " + (filter === c.id ? "border-petrol bg-petrol text-white" : "border-line text-ink hover:border-cyan")}>{c.label}</button>)}
          </div>
          {designWorks.length ? <div className="mt-10 grid gap-6 md:grid-cols-2">{designWorks.map(w => workCard(w, "design"))}</div> :
            <div className="mt-10 rounded-3xl border border-dashed border-line p-10 text-muted">Selected work will appear here after publication. Until then, browse the latest projects on <a className="font-semibold text-cyan-ink underline" href={safeLink(settings.instagram)} target="_blank" rel="noreferrer">Instagram</a>.</div>}
        </>)}

        {section("video", "bg-paper-2", <>
          {sectionLabel(5, "Motion & visual production")}
          <h2 className="font-latin text-4xl font-semibold">Video & AI-assisted work</h2>
          <p className="mt-3 text-muted">Reels, video advertising, motion graphics and AI-assisted visual production.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[{ id: "all", label: "All video" }, ...videoCategories.map(c => ({ id: c.id, label: CATEGORIES[c.id] || c.label }))].map(c => <button key={c.id} type="button" aria-pressed={videoFilter === c.id} onClick={() => { setVideoFilter(c.id); track("portfolio_filter", { category: c.id, gallery: "video", language: "en" }); }} className={"rounded-full border px-5 py-2 text-sm " + (videoFilter === c.id ? "border-petrol bg-petrol text-white" : "border-line bg-white text-ink hover:border-cyan")}>{c.label}</button>)}
          </div>
          {videoWorks.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{videoWorks.map(w => workCard(w, "video"))}</div> :
            <div className="mt-10 rounded-3xl border border-dashed border-line p-10 text-muted">Video projects will appear here once approved for publication. See the latest posts on <a className="font-semibold text-cyan-ink underline" href={safeLink(settings.instagram)} target="_blank" rel="noreferrer">Instagram</a>.</div>}
        </>)}

        {content.testimonials.items.length ? section("testimonials", "bg-petrol text-white", <>
          {sectionLabel(6, "Client feedback")}<h2 className="font-latin text-4xl font-semibold">Words from collaborators</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">{content.testimonials.items.map(t => <blockquote key={t.id} className="rounded-2xl border border-white/15 bg-white/5 p-8">
            <p className="text-lg leading-8" dir="auto">“{t.quote}”</p><footer className="mt-5 text-sm text-cyan" dir="auto">{t.name || t.company}</footer>
          </blockquote>)}</div>
        </>) : null}

        {section("process", "bg-petrol text-white", <>
          {sectionLabel(7, "How I work")}
          <h2 className="font-latin text-4xl font-semibold">Four clear steps, from idea to delivery.</h2>
          <p className="mt-3 text-white/65">A transparent process keeps expectations aligned at every stage.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => <div key={step.title} className="rounded-2xl border border-white/15 bg-white/5 p-7 transition-colors hover:border-cyan">
              <span className="font-latin text-5xl text-cyan/60">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-white/65">{step.text}</p>
            </div>)}
          </div>
        </>)}

        {section("faq", "bg-paper", <>
          {sectionLabel(8, "Before we begin")}
          <h2 className="font-latin text-4xl font-semibold">Frequently asked questions & working terms</h2>
          <div className="mt-9 grid gap-3">
            {FAQ.map(([question, answer]) => <details key={question} className="group rounded-xl border border-line bg-white px-6 py-5">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">{question} <span className="float-right text-cyan-ink group-open:rotate-45">+</span></summary>
              <p className="mt-4 text-sm leading-7 text-muted">{answer}</p>
            </details>)}
          </div>
          <p className="mt-5 text-sm text-muted">Project-specific terms are agreed in the approved quotation. <a href="/en/terms" className="text-cyan-ink underline">Full working terms</a> · <a href="/en/privacy" className="text-cyan-ink underline">Privacy policy</a></p>
        </>)}

        <EnglishQuote phone={quotePhone} />
        <EnglishConsultation phone={quotePhone} calUrl={content.consultation.calUrl} />
      </main>

      <footer className="bg-petrol py-12 text-white">
        <div className="container-x flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div><p className="text-lg font-semibold">OBAYDAH HIJAZI</p><p className="text-sm text-white/60">Graphic Designer · Visual Artist</p></div>
          <nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm text-white/70">
            <a href="/en/terms">Working terms</a><a href="/en/privacy">Privacy</a>
            <a href={safeLink(settings.instagram)} target="_blank" rel="noreferrer">Instagram</a>
            <a href={whatsappLink(quotePhone, "Hello Obaydah, I would like to discuss a project.")} data-track="whatsapp_click" target="_blank" rel="noreferrer">WhatsApp</a>
            <a href="/" lang="ar" dir="rtl">العربية</a>
          </nav>
          <span className="text-xs text-white/50">© {year} Obaydah Hijazi</span>
        </div>
      </footer>

      {activeWork ? <div role="dialog" aria-modal="true" aria-label="Project preview" className="fixed inset-0 z-[80] grid place-items-center bg-petrol/95 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setActiveWork(null); }}>
        <div className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <h2 className="min-w-0 truncate text-lg font-semibold text-ink" dir="auto">{activeWork.title}</h2>
            <button type="button" onClick={() => setActiveWork(null)} className="rounded-full p-2 text-ink hover:bg-paper-2" aria-label="Close project">✕</button>
          </div>
          <div className="min-h-0 overflow-y-auto p-4">
            {activeWork.media.length && activeWork.media[mediaIndex]?.type === "video" ? <video src={activeWork.media[mediaIndex].src} poster={activeWork.media[mediaIndex].type === "video" ? activeWork.media[mediaIndex].poster?.src : undefined} controls playsInline className="mx-auto max-h-[65dvh] w-full object-contain" /> :
              <Image src={activeWork.media[mediaIndex]?.type === "image" ? activeWork.media[mediaIndex].src : activeWork.cover.src} alt={activeWork.title} width={activeWork.cover.width} height={activeWork.cover.height} className="mx-auto max-h-[65dvh] w-auto object-contain" />}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted">{mediaIndex + 1} / {Math.max(activeWork.media.length, 1)}</p>
              {activeWork.media.length > 1 ? <div className="flex gap-2">
                <button type="button" className="rounded-full border border-line px-4 py-2" onClick={() => setMediaIndex((mediaIndex - 1 + activeWork.media.length) % activeWork.media.length)} aria-label="Previous image">←</button>
                <button type="button" className="rounded-full border border-line px-4 py-2" onClick={() => setMediaIndex((mediaIndex + 1) % activeWork.media.length)} aria-label="Next image">→</button>
              </div> : null}
            </div>
            {activeWork.summary ? <p className="mt-4 text-ink-2" dir="auto">{activeWork.summary}</p> : null}
            <a href="#quote" className={btn + " mt-5 bg-petrol text-white"} onClick={() => { track("similar_project_click", { project: activeWork.id, category: activeWork.category, language: "en" }); setActiveWork(null); }}>Request a similar project</a>
          </div>
        </div>
      </div> : null}
      <TrackClicks />
    </div>
  );
}
