import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import type { LegalPage } from "@/lib/cms/types";

type Props = { page: LegalPage; other: { href: string; label: string }; whatsappHref: string; nameAr: string };

/** Plain, readable layout for the work-policy and privacy pages. */
export function LegalPageView({ page, other, whatsappHref, nameAr }: Props) {
  return (
    <>
      <header className="bg-petrol text-white">
        <div className="container-x flex h-[var(--header-h)] items-center justify-between">
          <Link href="/" aria-label={`${nameAr} — الصفحة الرئيسية`}>
            <Image src="/images/brand/logo-white.webp" alt="" width={600} height={402} className="h-10 w-auto" priority />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
            العودة إلى الموقع
            <ArrowIcon className="size-4" />
          </Link>
        </div>
      </header>
      <main id="main" className="bg-paper">
        <div className="container-x py-16 sm:py-24">
          <article className="mx-auto max-w-[760px]">
            <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-bold leading-snug text-ink">{page.title}</h1>
            <p className="mt-5 text-[1.1rem] leading-9 text-ink-2">{page.intro}</p>
            <ol className="mt-12 divide-y divide-line border-y border-line">
              {page.sections.map((s, i) => (
                <li key={s.heading} className="grid gap-2 py-7 sm:grid-cols-[3rem_1fr]">
                  <span className="font-latin pt-1 text-sm tracking-[0.14em] text-cyan-ink">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="text-lg font-bold text-ink">{s.heading}</h2>
                    <p className="mt-2 leading-8 text-ink-2">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            {page.note ? <p className="mt-8 rounded-2xl bg-paper-2 p-5 text-sm leading-7 text-muted">{page.note}</p> : null}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                <WhatsAppIcon />
                لديك سؤال؟ تواصل عبر واتساب
              </a>
              <Link href={other.href} className="text-sm font-medium text-cyan-ink underline underline-offset-4">
                {other.label}
              </Link>
            </div>
          </article>
        </div>
      </main>
      <footer className="bg-petrol py-6 text-center text-xs text-white/50">
        © <span className="font-latin">{new Date().getFullYear()}</span> {nameAr}. جميع الحقوق محفوظة.
      </footer>
    </>
  );
}
