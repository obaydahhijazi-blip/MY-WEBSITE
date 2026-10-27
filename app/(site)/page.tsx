import { BioSection } from "@/components/BioSection";
import { BackToTop } from "@/components/BackToTop";
import { MobileQuoteCTA } from "@/components/MobileQuoteCTA";
import { ClientLogoGrid } from "@/components/ClientLogoGrid";
import { ContactFooter } from "@/components/ContactFooter";
import { Expertise } from "@/components/Expertise";
import { FaqSection } from "@/components/FaqSection";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Header } from "@/components/Header";
import { HeroScene } from "@/components/HeroScene";
import { IdentityMarquee } from "@/components/IdentityMarquee";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { QuoteSection } from "@/components/QuoteSection";
import { RevealObserver } from "@/components/RevealObserver";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Testimonials } from "@/components/Testimonials";
import { TrackClicks } from "@/components/TrackClicks";
import { MotionFX } from "@/components/MotionFX";
import { LogoIntro } from "@/components/LogoIntro";
import { WorkSection } from "@/components/WorkSection";
import { VideoSection } from "@/components/VideoSection";
import { BookingSection } from "@/components/booking/BookingSection";
import { getSiteContent } from "@/lib/cms";
import { whatsappLink } from "@/lib/whatsapp";

// Content edits published in /admin appear within this window even without the webhook.
export const revalidate = 300;

export default async function Home() {
  const content = await getSiteContent();
  const { settings, hero } = content;
  const contactHref = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const a = settings.availability;
  const availability =
    a.status !== "hidden" && (a.confirmed || content.demoMode) ? { status: a.status, label: a.label, preview: !a.confirmed } : undefined;

  // Design projects and video/AI projects are shown in separate galleries.
  const group = (g: string) => content.works.categories.filter((c) => c.group === g);
  const ids = (g: string) => new Set(group(g).map((c) => c.id));
  const designWorks = { ...content.works, categories: group("design"), items: content.works.items.filter((w) => ids("design").has(w.category)) };
  const videoItems = content.works.items.filter((w) => ids("video").has(w.category));

  // Order: process → quote → consultation → FAQ → footer. Indices reflect the rendered order.
  const order = [
    "about",
    "clients",
    "expertise",
    "works",
    "video",
    ...(content.testimonials.items.length ? ["testimonials"] : []),
    "process",
    "quote",
    "consultation",
    ...(content.faq.items.length ? ["faq"] : []),
  ];
  const idx = (id: string) => String(order.indexOf(id) + 1).padStart(2, "0");
  const navigation = content.navigation.filter((n) => order.includes(n.id));

  return (
    <>
      <LogoIntro />
      <ScrollProgress />
      <Header items={navigation} nameAr={settings.nameAr} whatsappHref={contactHref} ctaLabel={hero.primaryCta} music={settings.music} />
      <main id="main">
        <HeroScene
          eyebrow={hero.eyebrow}
          nameAr={settings.nameAr}
          nameEn={settings.nameEn}
          description={hero.description}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          scrollLabel={hero.scrollLabel}
          availability={availability}
        />
        <IdentityMarquee items={content.marquee} />
        <BioSection about={content.about} index={idx("about")} demoMode={content.demoMode} services={content.expertise.items} />
        <ClientLogoGrid clients={content.clients} index={idx("clients")} />
        <Expertise expertise={content.expertise} index={idx("expertise")} projects={content.works.items} />
        <WorkSection works={designWorks} index={idx("works")} instagram={settings.instagram} instagramHandle={settings.instagramHandle} />
        <VideoSection
          video={content.video}
          works={content.works}
          categories={group("video")}
          items={videoItems}
          index={idx("video")}
          instagram={settings.instagram}
          instagramHandle={settings.instagramHandle}
        />
        {content.testimonials.items.length ? <Testimonials testimonials={content.testimonials} index={idx("testimonials")} /> : null}
        <ProcessTimeline process={content.process} index={idx("process")} />
        <QuoteSection quote={content.quote} whatsappNumber={settings.whatsappNumber} index={idx("quote")} />
        <BookingSection consultation={content.consultation} whatsappNumber={settings.whatsappNumber} index={idx("consultation")} />
        <FaqSection faq={content.faq} index={idx("faq")} />
      </main>
      <ContactFooter content={content} navigation={navigation} />
      <FloatingWhatsApp href={contactHref} />
      <MobileQuoteCTA label={hero.primaryCta} />
      <BackToTop />
      <RevealObserver />
      <SmoothScroll />
      <TrackClicks />
      <MotionFX />
    </>
  );
}
