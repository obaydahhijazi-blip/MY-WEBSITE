import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPageView";
import { getSiteContent } from "@/lib/cms";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { legal, settings } = await getSiteContent();
  return { title: `${legal.terms.title} | ${settings.nameAr}`, description: legal.terms.intro, alternates: { canonical: "/terms" } };
}

export default async function Page() {
  const content = await getSiteContent();
  return (
    <LegalPageView
      page={content.legal.terms}
      other={{ href: "/privacy", label: "سياسة الخصوصية" }}
      whatsappHref={whatsappLink(content.settings.whatsappNumber, content.settings.whatsappMessage)}
      nameAr={content.settings.nameAr}
    />
  );
}
