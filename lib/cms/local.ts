import site from "@/content/site-content.ar.json";
import clientsData from "@/content/clients.json";
import worksData from "@/content/works.json";
import faqData from "@/content/faq.json";
import testimonialsData from "@/content/testimonials.json";
import type { Category, Client, IconId, SiteContent, Testimonial, Work } from "@/lib/cms/types";
import { DEMO_CLIENTS, DEMO_TESTIMONIALS, DEMO_WORKS, demoMode, withDemo, withDemoWorks } from "@/lib/demo";

type LocalClient = Client & { approved?: boolean };
type LocalWork = Omit<Work, "media" | "featured"> & { media?: Work["media"]; featured?: boolean; approved?: boolean };

export const groupOf = (categories: Category[], id: string) => categories.find((c) => c.id === id)?.group ?? "design";

/** Content bundled with the code. Used when Sanity is not configured, and as the migration seed. */
export function getLocalContent(): SiteContent {
  const s = site.settings;
  return {
    source: "local",
    settings: {
      nameAr: s.name_ar,
      nameEn: s.name_en,
      jobAr: s.job_ar,
      instagram: s.instagram,
      instagramHandle: s.instagram_handle,
      whatsappNumber: s.whatsapp_number,
      whatsappDisplay: s.whatsapp_display,
      whatsappMessage: s.whatsapp_message,
      email: s.email,
      seoTitle: s.seo_title,
      seoDescription: s.seo_description,
      music: s.music,
      availability: {
        status: s.availability.status as "available" | "full" | "hidden",
        confirmed: s.availability.confirmed,
        label: s.availability.status === "full" ? s.availability.labels.full : s.availability.labels.available,
      },
    },
    demoMode,
    marquee: site.marquee.items,
    navigation: site.navigation,
    hero: {
      eyebrow: site.hero.eyebrow,
      description: site.hero.description,
      primaryCta: site.hero.primary_cta,
      secondaryCta: site.hero.secondary_cta,
      scrollLabel: site.hero.scroll_label,
    },
    about: {
      label: site.about.section_label,
      headline: site.about.headline,
      paragraphs: site.about.paragraphs,
      stats: site.about.stats.map((x) => ({ value: x.value, suffix: x.suffix, label: x.label, mapLink: x.map_link, icon: x.icon as IconId })),
      mapTitle: site.about.map_title,
      mapHint: site.about.map_hint,
      countries: site.about.countries,
    },
    clients: {
      label: site.clients.section_label,
      title: site.clients.title,
      description: site.clients.description,
      emptyText: site.clients.empty_text,
      items: withDemo((clientsData.clients as LocalClient[]).filter((c) => c.approved === true), DEMO_CLIENTS, demoMode),
    },
    expertise: {
      label: site.expertise.section_label,
      headline: site.expertise.headline,
      intro: site.expertise.intro,
      items: site.expertise.items.map((i) => ({ ...i, icon: i.icon as IconId })),
    },
    process: {
      label: site.process.section_label,
      title: site.process.title,
      intro: site.process.intro,
      steps: site.process.steps.map((i) => ({ ...i, icon: i.icon as IconId })),
    },
    works: {
      label: site.works.section_label,
      title: site.works.title,
      description: site.works.description,
      allLabel: site.works.all_label,
      emptyTitle: site.works.empty_title,
      emptyBody: site.works.empty_body,
      emptyCategory: site.works.empty_category,
      similarCta: site.works.similar_cta,
      categories: worksData.categories as Category[],
      items: withDemoWorks(
        (worksData.projects as LocalWork[])
          .filter((w) => w.approved === true)
          .map((w) => ({ ...w, featured: w.featured ?? false, media: w.media ?? [{ type: "image" as const, ...w.cover }] })),
        DEMO_WORKS,
        (c) => groupOf(worksData.categories as Category[], c),
        demoMode,
      ),
    },
    video: {
      label: site.video.section_label,
      title: site.video.title,
      description: site.video.description,
      allLabel: site.video.all_label,
      emptyTitle: site.video.empty_title,
      emptyBody: site.video.empty_body,
      reelsTitle: site.video.reels_title,
      hint: site.video.hint,
    },
    testimonials: {
      label: site.testimonials.section_label,
      title: site.testimonials.title,
      items: withDemo(testimonialsData.items as Testimonial[], DEMO_TESTIMONIALS, demoMode),
    },
    faq: { label: site.faq.section_label, title: site.faq.title, note: site.faq.note, items: faqData.items },
    consultation: {
      label: site.consultation.section_label,
      titleBefore: site.consultation.title_before,
      titleHighlight: site.consultation.title_highlight,
      subtitle: site.consultation.subtitle,
      durationMinutes: site.consultation.duration_minutes,
      facts: site.consultation.facts,
      agenda: site.consultation.agenda,
      categories: site.consultation.project_categories,
      whatsappCta: site.consultation.whatsapp_cta,
      calendarCta: site.consultation.calendar_cta,
      calUrl: site.consultation.cal_url,
      requestNote: site.consultation.request_note,
      privacyNote: site.consultation.privacy_note,
    },
    quote: {
      label: site.quote.section_label,
      title: site.quote.title,
      description: site.quote.description,
      services: site.quote.services,
      cta: site.quote.cta,
      note: site.quote.note,
      secondary: site.quote.secondary,
      privacyNote: site.quote.privacy_note,
    },
    contact: {
      label: site.contact.section_label,
      title: site.contact.title,
      description: site.contact.description,
      primary: site.contact.primary,
      secondary: site.contact.secondary,
    },
  };
}
