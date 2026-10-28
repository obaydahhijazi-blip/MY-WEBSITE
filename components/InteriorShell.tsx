import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { ContactFooter } from "@/components/ContactFooter";
import { MotionFX } from "@/components/MotionFX";
import { getSiteContent } from "@/lib/cms";
import { whatsappLink } from "@/lib/whatsapp";

/** Consistent navigation on project and service detail pages. */
export async function InteriorShell({ children }: { children: ReactNode }) {
  const site = await getSiteContent();
  const contact = whatsappLink(site.settings.whatsappNumber, site.settings.whatsappMessage);
  const navigation = site.navigation.filter(item => ["about", "clients", "expertise", "works", "video", "process", "quote", "consultation"].includes(item.id));
  return <>
    <Header interior items={navigation} nameAr={site.settings.nameAr} whatsappHref={contact} ctaLabel={site.hero.primaryCta} music={site.settings.music} services={site.expertise.items} categories={site.works.categories} />
    <div className="pt-[var(--header-h)]">{children}</div>
    <ContactFooter interior content={site} navigation={navigation} />
    <MotionFX />
  </>;
}
