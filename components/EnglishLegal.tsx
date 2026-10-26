"use client";

import { useEffect } from "react";

type Row = { heading: string; body: string };
type Props = { kind: "terms" | "privacy" };

const TERMS: Row[] = [
  { heading: "Getting started", body: "Work begins after the scope and quotation have been approved and the agreed advance payment has been received." },
  { heading: "Payment", body: "An advance payment is due before production, with the remaining balance payable before final delivery. Amounts and payment methods are set out in the approved quotation." },
  { heading: "Revisions", body: "The quotation specifies the number of included revision rounds. Additional revisions or substantial changes to the scope are quoted separately." },
  { heading: "Project timelines", body: "Delivery dates depend on project scope and timely receipt of the materials and feedback required from the client." },
  { heading: "Deliverables and source files", body: "Final deliverables are provided in the agreed formats. Native editable files, including PSD and AI, are excluded unless separately agreed." },
  { heading: "Usage rights", body: "The client receives the usage rights specified in the agreement after all amounts due have been paid. Portfolio display is agreed with the client, respecting confidentiality requests." },
  { heading: "Cancellation", body: "If a project is cancelled, fees are settled in accordance with the work completed and the agreed terms." },
  { heading: "Confidentiality", body: "Project information is treated confidentially in accordance with the working agreement." },
  { heading: "International work", body: "Services are available remotely to clients in different countries." },
];
const PRIVACY: Row[] = [
  { heading: "WhatsApp contact and forms", body: "Quote and consultation forms do not send their content to a website server. They open WhatsApp with a prepared message. No request reaches us until you press Send in WhatsApp." },
  { heading: "Drafts on your device", body: "The Arabic quote form may temporarily save a draft in your own browser. You can clear it using the form controls. Audio settings may also be saved locally." },
  { heading: "Appointments", body: "If you use the calendar, Cal.com processes the booking according to its own privacy policy." },
  { heading: "Anonymous website analytics", body: "When enabled, privacy-oriented analytics count visits, navigation sources, selected projects and interactions with contact buttons. Marketing attribution is limited to short campaign labels and broad referral categories. The site does not send names, messages, emails or form content to analytics." },
  { heading: "Use of information", body: "Information you choose to send via WhatsApp is used to discuss your inquiry, arrange consultations or prepare quotations." },
  { heading: "Deletion requests", body: "You may request deletion of conversation information by contacting us through WhatsApp." },
];

export function EnglishLegal({ kind }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    const oldLang = html.lang, oldDir = html.dir;
    html.lang = "en"; html.dir = "ltr";
    return () => { html.lang = oldLang; html.dir = oldDir; };
  }, []);
  const terms = kind === "terms";
  const title = terms ? "Working Terms & Collaboration Policy" : "Privacy Policy";
  const intro = terms
    ? "This page outlines general terms for design and visual production services. Project-specific requirements are defined in the approved quotation, which takes precedence where there is any difference."
    : "This page explains how this website handles information that visitors choose to provide.";
  const rows = terms ? TERMS : PRIVACY;
  return (
    <div lang="en" dir="ltr" className="min-h-dvh bg-paper text-ink" style={{ fontFamily: "'Outfit', Arial, sans-serif" }}>
      <header className="bg-petrol py-5 text-white">
        <nav className="container-x flex items-center justify-between gap-5">
          <a href="/en" className="font-semibold tracking-wider">OBAYDAH HIJAZI</a>
          <a href="/en" className="text-sm text-cyan">← Back to portfolio</a>
        </nav>
      </header>
      <main className="container-x max-w-5xl py-16 md:py-24">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{intro}</p>
        <div className="mt-12 grid gap-5">
          {rows.map(row => <section key={row.heading} className="rounded-2xl border border-line bg-white p-6 md:p-8">
            <h2 className="text-xl font-semibold">{row.heading}</h2>
            <p className="mt-3 leading-8 text-muted">{row.body}</p>
          </section>)}
        </div>
        {terms ? <p className="mt-8 text-sm text-muted">These general terms do not replace the approved quotation or a separate written agreement.</p> : null}
      </main>
      <footer className="bg-petrol py-8 text-center text-sm text-white/60">Obaydah Hijazi · <a href="/en" className="text-cyan underline">Portfolio</a></footer>
    </div>
  );
}
