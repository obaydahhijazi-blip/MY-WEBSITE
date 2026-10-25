/**
 * One-time migration: copies the content bundled in content/*.json into Sanity so nothing has to be retyped.
 * Safe to re-run: it only creates documents that don't exist yet (it never overwrites edits made in /admin).
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx SANITY_API_WRITE_TOKEN=yyyy npm run cms:seed
 *
 * The write token is used locally only — never add it to the hosting provider or to NEXT_PUBLIC_ variables.
 */
import { createClient } from "next-sanity";
import { LexoRank } from "lexorank";
import { getLocalContent } from "../lib/cms/local";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN first.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });
const c = getLocalContent();
if (c.demoMode) {
  console.error("Unset NEXT_PUBLIC_DEMO_CONTENT before seeding — sample content must never be written to Sanity.");
  process.exit(1);
}
const key = (i: number) => `k${i}`;

let rank = LexoRank.min();
const nextRank = () => (rank = rank.genNext().genNext()).toString();

const docs: ({ _id: string; _type: string } & Record<string, unknown>)[] = [
  {
    _id: "siteSettings",
    _type: "siteSettings",
    nameAr: c.settings.nameAr,
    nameEn: c.settings.nameEn,
    jobAr: c.settings.jobAr,
    whatsappNumber: c.settings.whatsappNumber,
    whatsappMessage: c.settings.whatsappMessage,
    instagram: c.settings.instagram,
    instagramHandle: c.settings.instagramHandle,
    availabilityStatus: "hidden",
    marqueeItems: c.marquee,
    heroEyebrow: c.hero.eyebrow,
    heroDescription: c.hero.description,
    heroPrimaryCta: c.hero.primaryCta,
    heroSecondaryCta: c.hero.secondaryCta,
    contactTitle: c.contact.title,
    contactDescription: c.contact.description,
    seoTitle: c.settings.seoTitle,
    seoDescription: c.settings.seoDescription,
    musicEnabled: true,
    musicTitle: c.settings.music?.title,
    musicVolume: c.settings.music?.volume,
  },
  {
    _id: "aboutSection",
    _type: "aboutSection",
    headline: c.about.headline,
    paragraphs: c.about.paragraphs,
    // Unconfirmed figures (value null) are seeded without a value, so they stay hidden until filled in.
    stats: c.about.stats.map((s, i) => ({ _key: key(i), _type: "stat", ...s, value: s.value ?? undefined })),
    mapTitle: c.about.mapTitle,
    countries: c.about.countries,
  },
  {
    _id: "sectionTexts",
    _type: "sectionTexts",
    clients: { title: c.clients.title, description: c.clients.description, emptyText: c.clients.emptyText },
    expertise: { title: c.expertise.headline, description: c.expertise.intro },
    process: {
      title: c.process.title,
      intro: c.process.intro,
      steps: c.process.steps.map((s, i) => ({ _key: key(i), _type: "step", ...s })),
    },
    works: { title: c.works.title, description: c.works.description, emptyTitle: c.works.emptyTitle, emptyBody: c.works.emptyBody, similarCta: c.works.similarCta },
    testimonials: { title: c.testimonials.title },
    faq: { title: c.faq.title, note: c.faq.note },
  },
  {
    _id: "consultationSection",
    _type: "consultationSection",
    titleBefore: c.consultation.titleBefore,
    titleHighlight: c.consultation.titleHighlight,
    subtitle: c.consultation.subtitle,
    facts: c.consultation.facts.map((f, i) => ({ _key: key(i), _type: "fact", ...f })),
    agenda: c.consultation.agenda,
    categories: c.consultation.categories,
    whatsappCta: c.consultation.whatsappCta,
    calendarCta: c.consultation.calendarCta,
    calUrl: c.consultation.calUrl,
    requestNote: c.consultation.requestNote,
    privacyNote: c.consultation.privacyNote,
  },
  {
    _id: "quoteSection",
    _type: "quoteSection",
    title: c.quote.title,
    description: c.quote.description,
    services: c.quote.services,
    cta: c.quote.cta,
    note: c.quote.note,
    secondary: c.quote.secondary,
    privacyNote: c.quote.privacyNote,
  },
  ...c.expertise.items.map((s, i) => ({ _id: `service-${i + 1}`, _type: "service", orderRank: nextRank(), ...s })),
  ...c.faq.items.map((f, i) => ({ _id: `faq-${i + 1}`, _type: "faqItem", orderRank: nextRank(), published: true, ...f })),
];

async function main() {
  const tx = client.transaction();
  for (const doc of docs) tx.createIfNotExists(doc);
  await tx.commit();
  console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset} (existing documents were left untouched).`);
}

main().catch((err) => {
  console.error("Seeding failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
