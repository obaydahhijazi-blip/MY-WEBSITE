import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import type { Client, SiteContent } from "@/lib/cms/types";

function Logo({ c }: { c: Client }) {
  const img = (
    <Image
      src={c.logo.src}
      alt={c.logo.alt || `شعار ${c.name}`}
      width={c.logo.width}
      height={c.logo.height}
      sizes="180px"
      unoptimized={c.logo.src.endsWith(".svg")}
      className="h-auto max-h-12 w-auto max-w-[150px] object-contain"
    />
  );
  return c.href ? (
    <a href={c.href} target="_blank" rel="noopener noreferrer" className="client-logo" title={c.name}>
      {img}
      <span className="sr-only">(يفتح موقع {c.name} في نافذة جديدة)</span>
    </a>
  ) : (
    <span className="client-logo" title={c.name}>
      {img}
    </span>
  );
}

/** Approved logos only (managed in /admin). Sample logos appear only in demo/preview mode. */
export function ClientLogoGrid({ clients, index }: { clients: SiteContent["clients"]; index: string }) {
  const items = clients.items;
  const hasDemo = items.some((c) => c.demo);
  // Repeat short lists so one half of the loop is always wider than the screen.
  const run = items.length ? Array.from({ length: Math.max(1, Math.ceil(10 / items.length)) }, () => items).flat() : [];

  return (
    <section id="clients" className="section-tight bg-paper-2" aria-labelledby="clients-title">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <SectionHeading index={index} label={clients.label} id="clients-title" title={clients.title} className="lg:col-span-7" />
          <p className="reveal text-[1.02rem] leading-8 text-muted lg:col-span-4 lg:col-start-9">{clients.description}</p>
        </div>
        {hasDemo ? (
          <p className="mt-6 inline-flex rounded-full bg-yellow/20 px-3 py-1 text-xs font-semibold text-ink-2">عينة تجريبية للمعاينة — لا تظهر في الموقع المنشور</p>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="logo-marquee reveal mt-10" data-lenis-prevent>
          <div className="marquee-track">
            {["a", "b"].map((half) => (
              <ul key={half} className="logo-half" aria-hidden={half === "b" || undefined}>
                {run.map((c, i) => (
                  <li key={`${half}-${i}`} {...(half === "b" ? { inert: true } : {})}>
                    <Logo c={c} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ) : (
        <div className="container-x">
          <div className="reveal mt-10 flex items-center gap-4 rounded-3xl border border-dashed border-ink/15 px-6 py-8 sm:px-10">
            <span className="block size-2 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
            <p className="text-[0.98rem] leading-8 text-muted">{clients.emptyText}</p>
          </div>
        </div>
      )}
    </section>
  );
}
