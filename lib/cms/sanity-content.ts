import type { IconId, ImageAsset, MediaItem, SiteContent, Testimonial, Work } from "@/lib/cms/types";
import { DEMO_CLIENTS, DEMO_TESTIMONIALS, DEMO_WORKS } from "@/lib/demo";

/* eslint-disable @typescript-eslint/no-explicit-any -- GROQ results are untyped; every field is validated below */
type Raw = Record<string, any> | null | undefined;

const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) && v.length ? (v as T[]) : fallback);

function image(raw: Raw): ImageAsset | null {
  if (!raw?.src || !raw.width || !raw.height) return null;
  return { src: raw.src, width: raw.width, height: raw.height, alt: str(raw.alt, ""), lqip: raw.lqip || undefined };
}

function orientationOf(i: ImageAsset): Work["orientation"] {
  const r = i.width / i.height;
  return r < 0.85 ? "portrait" : r > 1.15 ? "landscape" : "square";
}

/** Overlay Sanity values on the local content. Empty CMS fields fall back to the bundled defaults. */
export function mergeSanityContent(local: SiteContent, data: Record<string, any>): SiteContent {
  const s: Raw = data.settings;
  const a: Raw = data.about;
  const t: Raw = data.sections;
  const c: Raw = data.consultation;
  const q: Raw = data.quote;
  // Items tagged «تجريبي» in the Studio only appear in demo/preview mode, never on the public site.
  const keep = (x: Raw) => local.demoMode || !x?.demo;

  const works: Work[] = (data.projects ?? [])
    .filter(keep)
    .map((p: Raw): Work | null => {
      const cover = image(p?.cover);
      if (!p || !cover) return null;
      const media: MediaItem[] = (p.media ?? [])
        .map((m: Raw): MediaItem | null => {
          if (m?.type === "video" && m.src) return { type: "video", src: m.src, alt: str(m.alt, p.title), poster: image(m.poster) ?? undefined };
          const i = m?.type === "image" ? image(m) : null;
          return i ? { type: "image", ...i, alt: i.alt || p.title } : null;
        })
        .filter(Boolean);
      return {
        id: str(p.id, p.title),
        title: p.title,
        category: p.category === "film" ? "ads" : p.category, // legacy «التصوير والمونتاج»
        orientation: p.orientation || orientationOf(cover),
        client: p.client || undefined,
        year: p.year || undefined,
        summary: p.summary || undefined,
        featured: Boolean(p.featured),
        demo: Boolean(p.demo),
        cover: { ...cover, alt: cover.alt || p.title },
        media: [{ type: "image", ...cover, alt: cover.alt || p.title }, ...media],
      };
    })
    .filter(Boolean);

  const testimonials: Testimonial[] = (data.testimonials ?? [])
    .filter((x: Raw) => x?.quote && keep(x))
    .map((x: Raw) => ({
      id: x!.id,
      quote: x!.quote,
      name: x!.name || undefined,
      role: x!.role || undefined,
      company: x!.company || undefined,
      demo: Boolean(x!.demo),
      logo: image(x!.logo) ? { ...image(x!.logo)!, alt: x!.company ? `شعار ${x!.company}` : "" } : undefined,
    }));

  const clients = (data.clients ?? [])
    .filter(keep)
    .map((x: Raw) => {
      const logo = image(x?.logo);
      return x?.name && logo ? { name: x.name, href: x.href || undefined, demo: Boolean(x.demo), logo: { ...logo, alt: `شعار ${x.name}` } } : null;
    })
    .filter(Boolean);

  return {
    ...local,
    source: "sanity",
    settings: {
      ...local.settings,
      nameAr: str(s?.nameAr, local.settings.nameAr),
      nameEn: str(s?.nameEn, local.settings.nameEn),
      jobAr: str(s?.jobAr, local.settings.jobAr),
      instagram: str(s?.instagram, local.settings.instagram),
      instagramHandle: str(s?.instagramHandle, local.settings.instagramHandle),
      whatsappNumber: str(s?.whatsappNumber, local.settings.whatsappNumber),
      whatsappDisplay: str(s?.whatsappNumber, local.settings.whatsappDisplay),
      whatsappMessage: str(s?.whatsappMessage, local.settings.whatsappMessage),
      email: str(s?.email, local.settings.email),
      seoTitle: str(s?.seoTitle, local.settings.seoTitle),
      seoDescription: str(s?.seoDescription, local.settings.seoDescription),
      ogImage: s?.ogImage || undefined,
      music:
        s?.musicEnabled === false
          ? null
          : {
              src: str(s?.musicUrl, local.settings.music?.src ?? ""),
              title: str(s?.musicTitle, local.settings.music?.title ?? ""),
              volume: typeof s?.musicVolume === "number" ? s.musicVolume : (local.settings.music?.volume ?? 0.18),
              loop: true,
            },
      availability: (() => {
        const status = (["available", "full", "hidden"].includes(s?.availabilityStatus) ? s!.availabilityStatus : null) as
          | "available"
          | "full"
          | "hidden"
          | null;
        if (!status) return local.settings.availability;
        // Choosing a status in the Studio is the owner's confirmation.
        return {
          status,
          confirmed: true,
          label: status === "full" ? "جدول المشاريع مكتمل حالياً" : "متاح حالياً لاستقبال مشاريع جديدة",
        };
      })(),
    },
    marquee: arr<string>(s?.marqueeItems?.filter((m: unknown) => typeof m === "string" && m.trim()), local.marquee),
    hero: {
      ...local.hero,
      eyebrow: str(s?.heroEyebrow, local.hero.eyebrow),
      description: str(s?.heroDescription, local.hero.description),
      primaryCta: str(s?.heroPrimaryCta, local.hero.primaryCta),
      secondaryCta: str(s?.heroSecondaryCta, local.hero.secondaryCta),
    },
    about: {
      ...local.about,
      headline: str(a?.headline, local.about.headline),
      paragraphs: arr<string>(a?.paragraphs?.filter((p: unknown) => typeof p === "string" && p.trim()), local.about.paragraphs),
      stats: arr(
        a?.stats
          ?.filter((x: Raw) => x?.label)
          .map((x: Raw) => ({
            value: typeof x!.value === "number" ? x!.value : null,
            suffix: x!.suffix ?? "",
            label: x!.label,
            mapLink: Boolean(x!.mapLink),
            icon: (x!.icon || "layers") as IconId,
          })),
        local.about.stats,
      ),
      mapTitle: str(a?.mapTitle, local.about.mapTitle),
      countries: arr<string>(a?.countries, local.about.countries),
    },
    clients: {
      ...local.clients,
      title: str(t?.clients?.title, local.clients.title),
      description: str(t?.clients?.description, local.clients.description),
      emptyText: str(t?.clients?.emptyText, local.clients.emptyText),
      items: clients.length || !local.demoMode ? clients : DEMO_CLIENTS,
    },
    expertise: {
      ...local.expertise,
      headline: str(t?.expertise?.title, local.expertise.headline),
      intro: str(t?.expertise?.description, local.expertise.intro),
      items: data.servicesCount
        ? data.services.map((x: Raw) => ({ title: x!.title, description: x!.description ?? "", icon: (x!.icon || "content") as IconId }))
        : local.expertise.items,
    },
    process: {
      ...local.process,
      title: str(t?.process?.title, local.process.title),
      intro: str(t?.process?.intro, local.process.intro),
      steps: arr(
        t?.process?.steps?.filter((x: Raw) => x?.title).map((x: Raw) => ({ title: x!.title, description: x!.description ?? "", icon: (x!.icon || "idea") as IconId })),
        local.process.steps,
      ),
    },
    works: {
      ...local.works,
      title: str(t?.works?.title, local.works.title),
      description: str(t?.works?.description, local.works.description),
      emptyTitle: str(t?.works?.emptyTitle, local.works.emptyTitle),
      emptyBody: str(t?.works?.emptyBody, local.works.emptyBody),
      similarCta: str(t?.works?.similarCta, local.works.similarCta),
      items: works.length || !local.demoMode ? works : DEMO_WORKS,
    },
    testimonials: {
      ...local.testimonials,
      title: str(t?.testimonials?.title, local.testimonials.title),
      items: testimonials.length || !local.demoMode ? testimonials : DEMO_TESTIMONIALS,
    },
    faq: {
      ...local.faq,
      title: str(t?.faq?.title, local.faq.title),
      note: str(t?.faq?.note, local.faq.note),
      items: data.faqCount ? data.faq : local.faq.items,
    },
    consultation: {
      ...local.consultation,
      titleBefore: str(c?.titleBefore, local.consultation.titleBefore),
      titleHighlight: str(c?.titleHighlight, local.consultation.titleHighlight),
      subtitle: str(c?.subtitle, local.consultation.subtitle),
      facts: arr(c?.facts?.filter((f: Raw) => f?.label && f?.value), local.consultation.facts),
      agenda: arr<string>(c?.agenda, local.consultation.agenda),
      categories: arr<string>(c?.categories, local.consultation.categories),
      whatsappCta: str(c?.whatsappCta, local.consultation.whatsappCta),
      calendarCta: str(c?.calendarCta, local.consultation.calendarCta),
      calUrl: str(c?.calUrl, local.consultation.calUrl),
      requestNote: str(c?.requestNote, local.consultation.requestNote),
      privacyNote: str(c?.privacyNote, local.consultation.privacyNote),
    },
    quote: {
      ...local.quote,
      title: str(q?.title, local.quote.title),
      description: str(q?.description, local.quote.description),
      services: arr<string>(q?.services, local.quote.services),
      cta: str(q?.cta, local.quote.cta),
      note: str(q?.note, local.quote.note),
      secondary: str(q?.secondary, local.quote.secondary),
      privacyNote: str(q?.privacyNote, local.quote.privacyNote),
    },
    contact: {
      ...local.contact,
      title: str(s?.contactTitle, local.contact.title),
      description: str(s?.contactDescription, local.contact.description),
    },
  };
}
