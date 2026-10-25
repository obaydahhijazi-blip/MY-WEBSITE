import { CalendarOption } from "@/components/booking/CalendarOption";
import { WhatsAppBookingForm } from "@/components/booking/WhatsAppBookingForm";
import { LineIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";
import { calOrigin, normalizeCalLink } from "@/lib/site";

const FACT_ICONS = ["clock", "free", "chat"];

type Props = { consultation: SiteContent["consultation"]; whatsappNumber: string; index: string };

export function BookingSection({ consultation: c, whatsappNumber, index }: Props) {
  const calLink = normalizeCalLink(c.calUrl);

  return (
    <section id="consultation" className="section bg-paper-2" aria-labelledby="consultation-title">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <header className="reveal">
              <p className="section-index">
                <span className="num">{index}</span>
                <span className="rule" aria-hidden="true" />
                <span>{c.label}</span>
              </p>
              <h2 id="consultation-title" className="headline mt-6 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.3] text-ink">
                {c.titleBefore} <span className="free-mark">{c.titleHighlight}</span>
              </h2>
              <p className="mt-5 max-w-md text-[1.08rem] leading-9 text-ink-2">{c.subtitle}</p>
            </header>

            <dl className="reveal mt-10 grid gap-3">
              {c.facts.map((f, i) => (
                <div key={f.label} className="flex items-center gap-4 rounded-2xl border border-line bg-paper px-5 py-4">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${i === 1 ? "bg-cyan/15 text-cyan-ink" : "bg-paper-2 text-teal"}`} aria-hidden="true">
                    <LineIcon name={FACT_ICONS[i] ?? "chat"} className="size-5" />
                  </span>
                  <dt className="w-20 shrink-0 text-sm text-muted">{f.label}</dt>
                  <dd className="text-[0.98rem] font-semibold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="reveal mt-10 text-sm font-semibold text-ink">محاور النقاش</h3>
            <ul className="reveal mt-4 space-y-3">
              {c.agenda.map((a) => (
                <li key={a} className="flex items-start gap-3 leading-7 text-ink-2">
                  <span className="mt-3 block h-px w-4 shrink-0 bg-cyan-ink" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="reveal lg:col-span-7">
          <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_60px_-40px_rgb(0_30_37/0.25)] sm:p-9">
            <p className="text-lg font-bold text-ink">أرسل طلبك عبر واتساب</p>
            <p className="mt-1 text-sm leading-7 text-muted">الطريقة الأسرع: أربعة حقول قصيرة، ثم تُرسل الرسالة من حسابك على واتساب.</p>
            <div className="mt-7">
              <WhatsAppBookingForm
                whatsappNumber={whatsappNumber}
                categories={c.categories}
                durationMinutes={c.durationMinutes}
                submitLabel={c.whatsappCta}
                requestNote={c.requestNote}
                privacyNote={c.privacyNote}
              />
            </div>

            {calLink ? (
              <>
                <div className="my-8 h-px bg-line" aria-hidden="true" />
                <CalendarOption calLink={calLink} calUrl={c.calUrl} calOrigin={calOrigin} label={c.calendarCta} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
