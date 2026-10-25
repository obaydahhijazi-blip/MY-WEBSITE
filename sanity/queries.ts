import { defineQuery } from "next-sanity";

const img = `{ alt, "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip }`;

export const SITE_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{ ..., "ogImage": ogImage.asset->url, "musicUrl": musicFile.asset->url },
  "about": *[_id == "aboutSection"][0],
  "sections": *[_id == "sectionTexts"][0],
  "consultation": *[_id == "consultationSection"][0],
  "quote": *[_id == "quoteSection"][0],
  "services": *[_type == "service"] | order(orderRank) { title, description, icon },
  "servicesCount": count(*[_type == "service"]),
  "projects": *[_type == "project" && hidden != true && defined(cover.asset)] | order(orderRank) {
    "id": slug.current, title, category, client, year, summary, "featured": coalesce(featured, false), "demo": coalesce(isDemo, false),
    "cover": cover${img},
    "media": media[]{
      _type == "imageWithAlt" => { "type": "image", ...@${img} },
      _type == "videoItem" => { "type": "video", alt, "src": file.asset->url, "poster": poster${img} }
    }
  },
  "clients": *[_type == "clientLogo" && visible != false && approved == true && defined(logo.asset)] | order(orderRank) {
    name, "href": url, "demo": coalesce(isDemo, false), "logo": logo{ "alt": "", "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
  },
  "testimonials": *[_type == "testimonial" && published != false && consent == true] | order(orderRank) {
    "id": _id, quote, name, role, company, "demo": coalesce(isDemo, false), "logo": logo{ "alt": "", "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
  },
  "faq": *[_type == "faqItem" && published != false] | order(orderRank) { question, answer },
  "faqCount": count(*[_type == "faqItem"])
}`);
