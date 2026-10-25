import Image from "next/image";
import { BrandBars } from "@/components/BrandBars";
import { ArrowIcon, InstagramIcon, Star8, WhatsAppIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/cms/types";
import { whatsappLink } from "@/lib/whatsapp";

/** Compact footer after the quote section: identity, short navigation, contact links, rights. */
export function ContactFooter({ content, navigation }: { content: SiteContent; navigation: SiteContent["navigation"] }) {
  const s = content.settings;
  const email = s.email.trim();

  return (
    <footer id="contact" className="bg-petrol text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12 md:items-start">
        <div className="flex items-center gap-4 md:col-span-4">
          <Image src="/images/brand/logo-white.webp" alt={s.nameAr} width={600} height={402} className="h-12 w-auto" />
          <div>
            <p className="font-semibold">{s.nameAr}</p>
            <p className="font-latin flex items-center gap-2 text-[0.7rem] tracking-[0.28em] text-white/50">
              {s.nameEn}
              <Star8 className="size-2.5 text-cyan" />
            </p>
            <p className="mt-1 text-xs text-white/50">{s.jobAr}</p>
          </div>
        </div>

        <nav aria-label="روابط التذييل" className="md:col-span-5">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/70 sm:grid-cols-3">
            {navigation.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#quote" className="text-cyan transition-colors hover:text-white">
                اطلب عرض سعر
              </a>
            </li>
          </ul>
        </nav>

        <div className="grid gap-3 text-sm md:col-span-3">
          <a href={whatsappLink(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" className="inline-flex items-center gap-3 text-white/80 hover:text-white">
            <WhatsAppIcon className="size-4 text-cyan" />
            <bdi dir="ltr" className="font-latin">{s.whatsappDisplay}</bdi>
          </a>
          <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-white/80 hover:text-white">
            <InstagramIcon className="size-4 text-cyan" />
            <bdi dir="ltr" className="font-latin">@{s.instagramHandle}</bdi>
          </a>
          {email ? (
            <a href={`mailto:${email}`} className="text-white/80 hover:text-white">
              <bdi dir="ltr" className="font-latin">{email}</bdi>
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line-dark">
        <div className="container-x flex items-center justify-between gap-4 py-6 text-xs text-white/50">
          <span className="flex items-center gap-3">
            <BrandBars />
            <span>
              © <span className="font-latin">{new Date().getFullYear()}</span> {s.nameAr}. جميع الحقوق محفوظة.
            </span>
          </span>
          <a href="#top" className="grid size-10 place-items-center rounded-full border border-line-dark text-white/80 hover:border-white/50" aria-label="العودة إلى الأعلى">
            <ArrowIcon direction="up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
