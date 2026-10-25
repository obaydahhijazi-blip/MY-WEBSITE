import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPageView";
import { getSiteContent } from "@/lib/cms";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { legal, settings } = await getSiteContent();
  return { title: `${legal.privacy.title} | ${settings.nameAr}`, description: legal.privacy.intro, alternates: { canonical: "/privacy" } };
}

export default async function Page() {
  const content = await getSiteContent();
  return (
    <LegalPageView
      page={content.legal.privacy}
      other={{ href: "/terms", label: "سياسة العمل وشروط التعاون" }}
      whatsappHref={whatsappLink(content.settings.whatsappNumber, content.settings.whatsappMessage)}
      nameAr={content.settings.nameAr}
    />
  );
}
