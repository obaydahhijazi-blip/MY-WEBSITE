import { SectionHeading } from "@/components/SectionHeading";
import { LineIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";

export function Expertise({ expertise, index }: { expertise: SiteContent["expertise"]; index: string }) {
  return (
    <section id="expertise" className="section relative overflow-hidden bg-petrol text-white" aria-labelledby="expertise-title">
      <div className="pointer-events-none absolute -top-32 right-[10%] size-[26rem] rounded-full bg-teal/80 blur-3xl" aria-hidden="true" />
      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading tone="dark" index={index} label={expertise.label} id="expertise-title" title={expertise.headline} className="lg:col-span-6" />
          <p className="reveal text-[1.05rem] leading-9 text-white/70 lg:col-span-5 lg:col-start-8">{expertise.intro}</p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {expertise.items.map((item, i) => (
            <li key={item.title} className="reveal" style={{ ["--delay" as string]: `${(i % 4) * 0.07}s` }}>
              <article className="service-card h-full">
                <div className="flex items-start justify-between gap-4">
                  <span className="service-icon">
                    <LineIcon name={item.icon} className="size-[26px]" />
                  </span>
                  <span className="font-latin text-xs tracking-[0.16em] text-white/35">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-10 text-[1.22rem] font-bold leading-snug text-white">{item.title}</h3>
                <p className="mt-3 leading-8 text-white/65">{item.description}</p>
                <span className="service-line" aria-hidden="true" />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
