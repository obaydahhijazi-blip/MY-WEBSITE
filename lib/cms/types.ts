/** Shape of all editable website content, regardless of source (Sanity or local JSON). */

export type ImageAsset = { src: string; width: number; height: number; alt: string; lqip?: string };
export type VideoAsset = { type: "video"; src: string; poster?: ImageAsset; alt: string; width?: number; height?: number };
export type MediaItem = ({ type: "image" } & ImageAsset) | VideoAsset;

export type IconId =
  | "identity" | "social" | "direction" | "ai" | "print" | "content" | "film"
  | "listen" | "idea" | "build" | "deliver"
  | "clock" | "users" | "globe" | "layers" | "free" | "chat" | "pin" | "motion" | "grid";

/** value null = not confirmed yet → hidden on the public site. */
export type Stat = { value: number | null; suffix: string; label: string; mapLink: boolean; icon: IconId };
export type Service = { title: string; description: string; icon: IconId };
export type ProcessStep = Service;
export type Category = { id: string; label: string; group: "design" | "video" };

export type Client = { name: string; logo: ImageAsset; href?: string; demo?: boolean };

export type Work = {
  id: string;
  title: string;
  category: string;
  client?: string;
  year?: string;
  summary?: string;
  featured: boolean;
  cover: ImageAsset;
  media: MediaItem[];
  demo?: boolean;
  /** Vertical reels are shown 9:16 in the video gallery. Derived from the cover when not set. */
  orientation?: "portrait" | "landscape" | "square";
};

export type Testimonial = { id: string; quote: string; name?: string; role?: string; company?: string; logo?: ImageAsset; demo?: boolean };
export type FaqItem = { question: string; answer: string };
export type LegalPage = { title: string; intro: string; sections: { heading: string; body: string }[]; note: string };

export type SiteContent = {
  source: "sanity" | "local";
  settings: {
    nameAr: string;
    nameEn: string;
    jobAr: string;
    instagram: string;
    instagramHandle: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    whatsappMessage: string;
    email: string;
    seoTitle: string;
    seoDescription: string;
    ogImage?: string;
    music: { src: string; title: string; volume: number; loop: boolean } | null;
    /** Shown only when the owner confirmed it (or in demo/preview mode). */
    availability: { status: "available" | "full" | "hidden"; confirmed: boolean; label: string };
  };
  /** True in development / preview builds: clearly-labelled sample content is shown. Never in production. */
  demoMode: boolean;
  marquee: string[];
  navigation: { id: string; label: string }[];
  hero: { eyebrow: string; description: string; primaryCta: string; secondaryCta: string; scrollLabel: string };
  about: {
    label: string;
    headline: string;
    paragraphs: string[];
    stats: Stat[];
    mapTitle: string;
    mapHint: string;
    countries: string[];
  };
  clients: { label: string; title: string; description: string; emptyText: string; items: Client[] };
  expertise: { label: string; headline: string; intro: string; items: Service[] };
  process: { label: string; title: string; intro: string; steps: ProcessStep[] };
  quote: {
    label: string;
    title: string;
    description: string;
    services: string[];
    cta: string;
    note: string;
    secondary: string;
    privacyNote: string;
  };
  works: {
    label: string;
    title: string;
    description: string;
    allLabel: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCategory: string;
    similarCta: string;
    categories: Category[];
    items: Work[];
  };
  video: { label: string; title: string; description: string; allLabel: string; emptyTitle: string; emptyBody: string; reelsTitle: string; hint: string };
  testimonials: { label: string; title: string; items: Testimonial[] };
  faq: { label: string; title: string; note: string; items: FaqItem[] };
  consultation: {
    label: string;
    titleBefore: string;
    titleHighlight: string;
    subtitle: string;
    durationMinutes: number;
    facts: { label: string; value: string }[];
    agenda: string[];
    categories: string[];
    whatsappCta: string;
    calendarCta: string;
    calUrl: string;
    requestNote: string;
    privacyNote: string;
  };
  contact: { label: string; title: string; description: string; primary: string; secondary: string };
  legal: { terms: LegalPage; privacy: LegalPage };
};
