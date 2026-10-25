"use client";

import { useId, useState } from "react";
import { PlusMinusIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";

export function FaqSection({ faq, index }: { faq: SiteContent["faq"]; index: string }) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);
  if (faq.items.length === 0) return null;

  return (
    <section id="faq" className="section border-t border-line bg-paper" aria-labelledby="faq-title">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
        <header className="reveal lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <p className="section-index">
              <span className="num">{index}</span>
              <span className="rule" aria-hidden="true" />
              <span>{faq.label}</span>
            </p>
            <h2 id="faq-title" className="headline mt-6 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.4] text-ink">
              {faq.title}
            </h2>
          </div>
        </header>

        <div className="lg:col-span-8">
          <ul className="border-t border-ink/80">
            {faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.question} className="faq-item reveal border-b border-line" style={{ ["--delay" as string]: `${Math.min(i, 6) * 0.04}s` }}>
                  <h3>
                    <button
                      type="button"
                      id={`${uid}-q${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-a${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="faq-trigger"
                    >
                      <span className="font-latin w-8 shrink-0 text-xs tracking-[0.14em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-start text-[1.08rem] font-semibold leading-8 text-ink">{item.question}</span>
                      <span className="faq-icon">
                        <PlusMinusIcon open={isOpen} className="size-[18px]" />
                      </span>
                    </button>
                  </h3>
                  <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="faq-panel" data-open={isOpen || undefined} inert={!isOpen}>
                    <div className="overflow-hidden">
                      <p className="max-w-[62ch] pb-7 ps-12 pe-12 leading-8 text-ink-2">{item.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="reveal mt-8 flex items-start gap-3 text-sm leading-7 text-muted">
            <span className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-yellow" aria-hidden="true" />
            {faq.note}
          </p>
        </div>
      </div>
    </section>
  );
}
