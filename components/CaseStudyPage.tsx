import Image from "next/image";
import Link from "next/link";
import { BeforeAfterCompare } from "@/components/BeforeAfterCompare";
import { ArrowIcon } from "@/components/icons";
import type { Work, Category } from "@/lib/cms/types";

export function CaseStudyPage({ project, related, categories }: { project: Work; related: Work[]; categories: Category[] }) {
  const category = (id: string) => categories.find(x => x.id === id)?.label || id;
  const images = project.media.length ? project.media : [{ type: "image" as const, ...project.cover }];
  return (
    <main id="main" className="min-h-dvh overflow-x-clip bg-white pb-20 text-ink">
      <div className="container-x pb-4 pt-8 sm:pt-12">
        <nav aria-label="مسار الصفحة" className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-cyan-ink">الرئيسية</Link><span aria-hidden="true">/</span>
          <Link href="/#works" className="hover:text-cyan-ink">الأعمال</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>
      </div>
      <header className="container-x grid gap-8 pb-12 pt-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="mb-5 text-sm font-semibold text-cyan-ink">{category(project.category)}</p>
          <h1 className="text-[clamp(2.3rem,6vw,5.5rem)] font-bold leading-[1.35]">{project.title}</h1>
          {project.summary ? <p className="mt-6 max-w-2xl text-lg leading-9 text-muted">{project.summary}</p> : null}
        </div>
        <dl className="grid gap-4 border-t border-line pt-5 text-sm lg:col-span-4">
          {project.client ? <div><dt className="text-muted">العميل</dt><dd className="mt-1 font-bold">{project.client}</dd></div> : null}
          {project.year ? <div><dt className="text-muted">السنة</dt><dd className="mt-1 font-bold">{project.year}</dd></div> : null}
          {project.role ? <div><dt className="text-muted">دوري في المشروع</dt><dd className="mt-1 font-bold">{project.role}</dd></div> : null}
        </dl>
      </header>
      <div className="container-x">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-[28px] bg-paper-2 sm:rounded-[36px]">
          <Image src={project.cover.src} alt={project.cover.alt || project.title} fill priority sizes="100vw" className="object-cover" />
          {project.demo ? <span className="demo-badge">نموذج تجريبي للمعاينة</span> : null}
        </div>
      </div>
      {project.challenge || project.solution ? <section className="container-x grid gap-8 py-20 md:grid-cols-2">
        {project.challenge ? <div><p className="mb-4 text-sm font-bold text-cyan-ink">التحدي</p><h2 className="text-2xl font-bold">فهم المشكلة</h2><p className="mt-5 whitespace-pre-line leading-9 text-muted">{project.challenge}</p></div> : null}
        {project.solution ? <div><p className="mb-4 text-sm font-bold text-cyan-ink">الحل</p><h2 className="text-2xl font-bold">النتيجة البصرية</h2><p className="mt-5 whitespace-pre-line leading-9 text-muted">{project.solution}</p></div> : null}
      </section> : <div className="h-12" />}
      {project.beforeAfter ? <section className="container-x py-10"><h2 className="mb-8 text-2xl font-bold">قبل وبعد</h2><BeforeAfterCompare {...project.beforeAfter} /></section> : null}
      {images.length > 1 ? <section className="container-x py-14" aria-labelledby="project-gallery-title">
        <h2 id="project-gallery-title" className="mb-8 text-2xl font-bold">تفاصيل المشروع</h2>
        <div className="grid gap-7">
          {images.slice(1).map((media,i) => <figure key={media.src + i} className="overflow-hidden rounded-3xl bg-paper-2">
            {media.type === "image"
              ? <Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(min-width:1024px) 85vw,100vw" className="h-auto w-full object-contain" />
              : <video src={media.src} poster={media.poster?.src} controls playsInline preload="metadata" className="max-h-[85vh] w-full" aria-label={media.alt} />}
            {media.alt ? <figcaption className="px-5 py-3 text-sm text-muted">{media.alt}</figcaption> : null}
          </figure>)}
        </div>
      </section> : null}
      {related.length ? <section className="container-x border-t border-line py-16">
        <h2 className="mb-8 text-2xl font-bold">أعمال قد تهمك</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.slice(0,3).map(w => <li key={w.id}><Link href={`/projects/${encodeURIComponent(w.id)}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-2"><Image src={w.cover.src} alt={w.cover.alt || w.title} fill sizes="(min-width:1024px) 30vw,90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
            <p className="mt-3 text-xs text-cyan-ink">{category(w.category)}</p><h3 className="mt-1 font-bold group-hover:text-cyan-ink">{w.title}</h3>
          </Link></li>)}
        </ul>
      </section> : null}
      <section className="container-x pt-12">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-petrol p-8 text-white sm:p-12">
          <div><h2 className="text-2xl font-bold">هل لديك مشروع مشابه؟</h2><p className="mt-3 text-sm leading-8 text-white/75">شارك فكرتك ومتطلباتك لنناقش عرض السعر المناسب.</p></div>
          <Link href="/#quote" className="btn btn-primary">اطلب عرض سعر <ArrowIcon direction="left" className="size-4" /></Link>
        </div>
      </section>
      <div className="container-x mt-12"><Link href="/#works" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-ink">العودة إلى معرض الأعمال <ArrowIcon direction="right" className="size-4" /></Link></div>
    </main>
  );
}
