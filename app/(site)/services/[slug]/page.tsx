import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/cms";
import { siteUrl } from "@/lib/site";

type P = { params: Promise<{ slug: string }> };
const select = async (slug: string) => {
  const site = await getSiteContent();
  const item = site.expertise.items.find(x => x.icon === slug);
  return { site, item };
};
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const { site, item } = await select(slug);
  if (!item) notFound();
  return { title: `${item.title} | ${site.settings.nameAr}`,
    description: item.description.slice(0,160),
    alternates: { canonical: `${siteUrl}/services/${slug}` } };
}
export default async function ServicePage({ params }: P) {
  const { slug } = await params;
  const { site, item } = await select(slug);
  if (!item) notFound();
  const samples = site.works.items.filter(w => {
    const group = site.works.categories.find(c=>c.id===w.category);
    return (w.category === slug || (slug === "ai" && w.category === "ai") ||
      (slug === "film" && group?.group === "video")) && (site.demoMode || !w.demo);
  }).slice(0,3);
  return <main id="main" className="min-h-dvh bg-white py-12 text-ink">
    <div className="container-x">
      <nav className="text-sm text-muted"><Link href="/" className="hover:text-cyan-ink">الرئيسية</Link> / <Link href="/#expertise" className="hover:text-cyan-ink">التخصصات</Link> / {item.title}</nav>
      <header className="max-w-4xl pb-12 pt-16"><p className="mb-5 text-sm font-bold text-cyan-ink">خدمات التصميم والإنتاج البصري</p>
        <h1 className="text-[clamp(2.4rem,5.5vw,4.8rem)] font-bold leading-[1.4]">{item.title}</h1>
        <p className="mt-7 text-xl leading-10 text-muted">{item.description}</p></header>
      {samples.length ? <section className="border-t border-line py-14"><h2 className="mb-8 text-2xl font-bold">أعمال ذات صلة</h2>
        <ul className="grid gap-6 sm:grid-cols-3">{samples.map(w=><li key={w.id}><Link href={`/projects/${encodeURIComponent(w.id)}`} className="block overflow-hidden rounded-2xl border border-line p-5 transition-colors hover:border-cyan"><h3 className="font-bold">{w.title}</h3><p className="mt-2 text-sm text-muted">{w.summary || "استعرض المشروع"}</p></Link></li>)}</ul>
      </section>:null}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-petrol p-9 text-white"><div><h2 className="text-2xl font-bold">مشروعك القادم</h2><p className="mt-3 text-white/75">احصل على عرض سعر مخصص لمتطلباتك.</p></div>
        <Link href="/#quote" className="btn btn-primary">اطلب عرض سعر</Link></div>
    </div>
  </main>;
}
