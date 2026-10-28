import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { VisualEditing } from "next-sanity/visual-editing";
import Script from "next/script";
import "@/styles/ko-sans.css";
import "@/styles/ko-sans-generated.css";
import "@/styles/outfit.css";
import "../globals.css";
import { getSiteContent } from "@/lib/cms";
import { siteUrl } from "@/lib/site";

// Open-source fallback until the owner's licensed KO Sans files are in public/fonts (see docs/FONTS_KO_SANS.md).
const fallbackArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-fallback-arabic",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSiteContent();
  const image = s.ogImage || "/images/og.jpg";
  return {
    metadataBase: new URL(siteUrl),
    title: s.seoTitle,
    description: s.seoDescription,
    applicationName: s.nameAr,
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
    authors: [{ name: s.nameAr }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "ar_AR",
      url: "/",
      siteName: s.nameAr,
      title: s.seoTitle,
      description: s.seoDescription,
      images: [{ url: image, width: 1200, height: 630, alt: `${s.nameAr} — ${s.jobAr}` }],
    },
    twitter: { card: "summary_large_image", title: s.seoTitle, description: s.seoDescription, images: [image] },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#001E25",
  width: "device-width",
  initialScale: 1,
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings: s } = await getSiteContent();
  const preview = (await draftMode()).isEnabled;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.nameAr,
    alternateName: "Obaydah Hijazi",
    jobTitle: s.jobAr,
    url: siteUrl,
    image: `${siteUrl}/images/og.jpg`,
    sameAs: [s.instagram],
  };

  return (
    <html lang="ar" dir="rtl" className={fallbackArabic.variable} suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">
          تخطَّ إلى المحتوى
        </a>
        <noscript>
          <style>{".reveal,.timeline-step{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {children}
        {preview ? (
          <>
            <a href="/api/draft-mode/disable" className="fixed bottom-4 right-4 z-[60] rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-petrol shadow-lg">
              وضع المعاينة — إنهاء
            </a>
            <VisualEditing />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js"}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </body>
    </html>
  );
}
