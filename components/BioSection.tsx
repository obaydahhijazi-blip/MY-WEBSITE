import { StatsAndMap } from "@/components/about/StatsAndMap";
import type { SiteContent } from "@/lib/cms/types";

export function BioSection({ about, index, demoMode }: { about: SiteContent["about"]; index: string; demoMode: boolean }) {
  return (
    <section id="about" className="section bg-paper" aria-labelledby="about-title">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <header className="reveal lg:col-span-5">
            <p className="section-index">
              <span className="num">{index}</span>
              <span className="rule" aria-hidden="true" />
              <span>{about.label}</span>
            </p>
            <h2 id="about-title" className="headline mt-6 max-w-[14ch] text-[clamp(1.9rem,3.4vw,2.85rem)] leading-[1.4] text-ink">
              {about.headline}
            </h2>
          </header>

          <div className="space-y-6 lg:col-span-6 lg:col-start-7 lg:pt-12">
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className={`reveal max-w-[60ch] text-pretty leading-[2.05] ${i === 0 ? "text-[clamp(1.08rem,1.35vw,1.22rem)] text-ink" : "text-[1.02rem] text-ink-2"}`}
                style={{ ["--delay" as string]: `${0.08 * (i + 1)}s` }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Unconfirmed figures are dropped here so they never reach the public page or its data payload. */}
        <StatsAndMap about={{ ...about, stats: about.stats.filter((s) => s.value !== null || demoMode) }} demoMode={demoMode} />
      </div>
    </section>
  );
}
