import Image from "next/image";
import { DragMarquee } from "@/components/DragMarquee";
import { SectionHeading } from "@/components/SectionHeading";
import type { Client, SiteContent } from "@/lib/cms/types";

function Logo({ c }: { c: Client }) {
  const inner = (
    <>
      <span className="client-logo-img">
        <Image
          src={c.logo.src}
          alt={c.logo.alt || `شعار ${c.name}`}
          width={c.logo.width}
          height={c.logo.height}
          sizes="200px"
          draggable={false}
          unoptimized={c.logo.src.endsWith(".svg")}
          className="h-auto max-h-16 w-auto max-w-[170px] object-contain"
        />
      </span>
      <span className="client-logo-name" dir="rtl">{c.name}</span>
    </>
  );
  return c.href ? (
    <a href={c.href} target="_blank" rel="noopener noreferrer" className="client-logo" draggable={false}>
      {inner}
      <span className="sr-only">(يفتح موقع {c.name} في نافذة جديدة)</span>
    </a>
  ) : (
    <span className="client-logo" tabIndex={0}>
      {inner}
    </span>
  );
}

/** Repeat a short list so one copy of each row is always wider than the screen. */
const fill = (list: Client[], min = 12) => (list.length ? Array.from({ length: Math.ceil(min / list.length) }, () => list).flat() : []);

/** Approved logos only (managed in /admin). Sample logos appear only in demo/preview mode. */
export function ClientLogoGrid({ clients, index }: { clients: SiteContent["clients"]; index: string }) {
  const items = clients.items;
  const hasDemo = items.some((c) => c.demo);
  // Six or more logos are split between the rows; fewer appear in both rows in a different order.
  const rowA = items.length >= 6 ? items.filter((_, i) => i % 2 === 0) : items;
  const rowB = items.length >= 6 ? items.filter((_, i) => i % 2 === 1) : [...items].reverse();

  return (
    <section id="clients" className="section-tight bg-paper-2" aria-labelledby="clients-title">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <SectionHeading index={index} label={clients.label} id="clients-title" title={clients.title} className="lg:col-span-7" />
          <p className="reveal text-[1.02rem] leading-8 text-muted lg:col-span-4 lg:col-start-9">{clients.description}</p>
        </div>
        {hasDemo ? (
          <p className="mt-6 inline-flex rounded-full bg-yellow/20 px-3 py-1 text-xs font-semibold text-ink-2">عينة تجريبية للمعاينة — تختفي تلقائياً عند إضافة أول شعار حقيقي</p>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="reveal mt-12 grid gap-5">
          <DragMarquee speed={22} label="شعارات الجهات — الصف الأول، يتوقف عند التركيز ويمكن سحبه">
            {fill(rowA).map((c, i) => (
              <Logo key={`a${i}`} c={c} />
            ))}
          </DragMarquee>
          <DragMarquee speed={-14} label="شعارات الجهات — الصف الثاني، يتوقف عند التركيز ويمكن سحبه">
            {fill(rowB).map((c, i) => (
              <Logo key={`b${i}`} c={c} />
            ))}
          </DragMarquee>
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
