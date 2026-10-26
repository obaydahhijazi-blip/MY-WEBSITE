import type { Metadata } from "next";
import { EnglishPortfolio } from "@/components/EnglishPortfolio";
import { getSiteContent } from "@/lib/cms";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Obaydah Hijazi | Graphic Designer & Visual Artist",
  description: "Visual identities, advertising, art direction, motion, and AI-assisted visual production. Browse selected work, request a quote, or book a free consultation.",
  alternates: { canonical: "/en", languages: { ar: "/", en: "/en" } },
  openGraph: {
    title: "Obaydah Hijazi | Graphic Designer & Visual Artist",
    description: "Brand identities, advertising and visual production for businesses across markets.",
    locale: "en_US",
    url: "/en",
    type: "website",
    images: ["/images/og.jpg"],
  },
};

export default async function EnglishHome() {
  const content = await getSiteContent();
  return <EnglishPortfolio content={content} homeUrl={siteUrl} />;
}
