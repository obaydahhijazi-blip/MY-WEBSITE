import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/cms";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteContent();
  const works = site.works.items.filter(w => !w.demo).map(w => ({
    url: `${siteUrl}/projects/${encodeURIComponent(w.id)}`,
    changeFrequency: "monthly" as const, priority: 0.75,
  }));
  const services = [...new Set(site.expertise.items.map(s => s.icon))].map(icon => ({
    url: `${siteUrl}/services/${icon}`,
    changeFrequency: "monthly" as const, priority: 0.7,
  }));
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    ...services,
    ...works,
  ];
}
