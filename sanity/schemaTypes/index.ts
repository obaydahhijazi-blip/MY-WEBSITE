import { imageWithAlt, videoItem } from "./shared";
import { promotionSettings } from "./promotion";
import { aboutSection, consultationSection, legalPages, quoteSection, sectionTexts, siteSettings } from "./singletons";
import { clientLogo, faqItem, project, service, testimonial } from "./collections";

export const SINGLETONS = ["siteSettings", "aboutSection", "sectionTexts", "consultationSection", "quoteSection", "legalPages", "promotionSettings"] as const;

export const schemaTypes = [
  imageWithAlt,
  videoItem,
  siteSettings,
  aboutSection,
  sectionTexts,
  consultationSection,
  quoteSection,
  legalPages,
  promotionSettings,
  project,
  clientLogo,
  testimonial,
  faqItem,
  service,
];
