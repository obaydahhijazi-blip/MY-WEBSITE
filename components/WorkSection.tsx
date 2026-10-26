import { SectionHeading } from "@/components/SectionHeading";
import { WorkGallery } from "@/components/WorkGallery";
import type { SiteContent } from "@/lib/cms/types";

export function WorkSection({ works, index, instagram, instagramHandle }: { works: SiteContent["works"]; index: string; instagram: string; instagramHandle: string }) {
  return (
    <section id="works" className="section border-t border-line bg-white" aria-labelledby="works-title">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading index={index} label={works.label} id="works-title" title={works.title} className="lg:col-span-6" />
          <p className="reveal text-[1.05rem] leading-9 text-muted lg:col-span-5 lg:col-start-8">{works.description}</p>
        </div>
        <WorkGallery works={works} instagram={instagram} instagramHandle={instagramHandle} />
      </div>
    </section>
  );
}
