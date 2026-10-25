import { imageWithAlt, videoItem } from "./shared";
import { aboutSection, consultationSection, legalPages, quoteSection, sectionTexts, siteSettings } from "./singletons";
import { clientLogo, faqItem, project, service, testimonial } from "./collections";

export const SINGLETONS = ["siteSettings", "aboutSection", "sectionTexts", "consultationSection", "quoteSection", "legalPages"] as const;

export const schemaTypes = [
  imageWithAlt,
  videoItem,
  siteSettings,
  aboutSection,
  sectionTexts,
  consultationSection,
  quoteSection,
  legalPages,
  project,
  clientLogo,
  testimonial,
  faqItem,
  service,
];
