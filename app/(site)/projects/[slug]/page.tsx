import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/cms";
import { siteUrl } from "@/lib/site";
import { CaseStudyPage } from "@/components/CaseStudyPage";

type P = { params: Promise<{ slug: string }> };
const getOne = async (slug: string) => {
  const site = await getSiteContent();
  const work = site.works.items.find(w => w.id === slug && (site.demoMode || !w.demo));
  return { site, work };
};
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const { site, work } = await getOne(slug);
  if (!work) notFound();
  const title = `${work.title} | أعمال ${site.settings.nameAr}`;
  const description = work.summary || `تفاصيل مشروع ${work.title} في ${site.works.categories.find(c=>c.id===work.category)?.label ?? "التصميم"}`;
  const url = `${siteUrl}/projects/${encodeURIComponent(work.id)}`;
  return { title, description, alternates: { canonical: url }, robots: { index: !work.demo, follow: true },
    openGraph: { title, description, url, type: "article", images: [{ url: work.cover.src, width: work.cover.width, height: work.cover.height, alt: work.cover.alt || work.title }] } };
}
export default async function ProjectPage({ params }: P) {
  const { slug } = await params;
  const { site, work } = await getOne(slug);
  if (!work) notFound();
  const related = site.works.items.filter(w => w.id !== work.id && w.category === work.category && (site.demoMode || !w.demo)).slice(0,3);
  const jsonLd = { "@context": "https://schema.org", "@type": "CreativeWork", name: work.title,
    description: work.summary || work.title, url: `${siteUrl}/projects/${encodeURIComponent(work.id)}`,
    image: work.cover.src, creator: { "@type": "Person", name: site.settings.nameAr } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")}} />
    <CaseStudyPage project={work} related={related} categories={site.works.categories} />
  </>;
}
