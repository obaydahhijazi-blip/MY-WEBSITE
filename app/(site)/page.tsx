import { BioSection } from "@/components/BioSection";
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
import { WorkSection } from "@/components/WorkSection";
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

  // Final order (brief §03). Section numbers follow what is actually rendered.
  const order = [
    "about",
    "clients",
    "expertise",
    "works",
    ...(content.testimonials.items.length ? ["testimonials"] : []),
    ...(content.faq.items.length ? ["faq"] : []),
    "consultation",
    "process",
    "quote",
  ];
  const idx = (id: string) => String(order.indexOf(id) + 1).padStart(2, "0");
  const navigation = content.navigation.filter((n) => order.includes(n.id));

  return (
    <>
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
        <BioSection about={content.about} index={idx("about")} demoMode={content.demoMode} />
        <ClientLogoGrid clients={content.clients} index={idx("clients")} />
        <Expertise expertise={content.expertise} index={idx("expertise")} />
        <WorkSection works={content.works} index={idx("works")} instagram={settings.instagram} instagramHandle={settings.instagramHandle} />
        {content.testimonials.items.length ? <Testimonials testimonials={content.testimonials} index={idx("testimonials")} /> : null}
        <FaqSection faq={content.faq} index={idx("faq")} />
        <BookingSection consultation={content.consultation} whatsappNumber={settings.whatsappNumber} index={idx("consultation")} />
        <ProcessTimeline process={content.process} index={idx("process")} />
        <QuoteSection quote={content.quote} whatsappNumber={settings.whatsappNumber} index={idx("quote")} />
      </main>
      <ContactFooter content={content} navigation={navigation} />
      <FloatingWhatsApp href={contactHref} />
      <RevealObserver />
      <SmoothScroll />
      <TrackClicks />
    </>
  );
}
