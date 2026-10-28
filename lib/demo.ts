import type { Client, Testimonial, Work } from "@/lib/cms/types";

/**
 * Demo mode shows clearly-labelled SAMPLE content so the layout can be judged before real
 * material exists. Samples are temporarily enabled on the public portfolio so its galleries
 * can be reviewed before approved work is uploaded. They are prominently labelled and yield
 * to genuine work per section. Set NEXT_PUBLIC_DEMO_CONTENT=0 to hide all samples.
 */
export const demoMode = process.env.NEXT_PUBLIC_DEMO_CONTENT !== "0";

const img = (n: number, w: number, h: number, alt: string) => ({ src: `/demo/work-${n}.svg`, width: w, height: h, alt });

const poster = (name: string, w: number, h: number) => ({ src: `/demo/${name}.jpg`, width: w, height: h, alt: "غلاف فيديو تجريبي" });
const video = (name: string, w: number, h: number) => ({
  type: "video" as const,
  src: `/demo/${name}.mp4`,
  alt: "فيديو تجريبي",
  width: w,
  height: h,
  poster: poster(name, w, h),
});

export const DEMO_WORKS: Work[] = [
  // ── Design gallery
  { id: "demo-1", title: "هوية بصرية لعلامة قهوة", category: "identity", year: "2025", featured: true, demo: true,
    summary: "نموذج تجريبي لعرض شكل المشروع المميز في المعرض.", cover: img(1, 1600, 1000, "نموذج تجريبي لهوية بصرية"),
    media: [{ type: "image", ...img(1, 1600, 1000, "نموذج تجريبي لهوية بصرية") }, { type: "image", ...img(2, 1200, 1500, "نموذج تجريبي لتطبيقات الهوية") }] },
  { id: "demo-2", title: "حملة رمضانية للمنصات الرقمية", category: "social", year: "2025", featured: false, demo: true,
    cover: img(2, 1200, 1500, "نموذج تجريبي لحملة سوشيال ميديا"), media: [{ type: "image", ...img(2, 1200, 1500, "نموذج تجريبي لحملة سوشيال ميديا") }] },
  { id: "demo-3", title: "ملف تعريفي لشركة استشارات", category: "print", year: "2024", featured: false, demo: true,
    cover: img(3, 1200, 900, "نموذج تجريبي لملف تعريفي"), media: [{ type: "image", ...img(3, 1200, 900, "نموذج تجريبي لملف تعريفي") }] },
  { id: "demo-6", title: "سلسلة منشورات لإطلاق منتج", category: "social", year: "2024", featured: false, demo: true,
    cover: img(5, 1200, 1200, "نموذج تجريبي لمنشورات"), media: [{ type: "image", ...img(5, 1200, 1200, "نموذج تجريبي لمنشورات") }] },
  // ── Video & AI gallery
  { id: "demo-r1", title: "ريل إطلاق منتج", category: "reels", year: "2025", featured: false, demo: true, orientation: "portrait",
    cover: poster("reel-1", 720, 1280), media: [video("reel-1", 720, 1280)] },
  { id: "demo-r2", title: "ريل لمطعم", category: "reels", year: "2025", featured: false, demo: true, orientation: "portrait",
    cover: poster("reel-2", 720, 1280), media: [video("reel-2", 720, 1280)] },
  { id: "demo-r3", title: "ريل تعريفي بخدمة", category: "reels", year: "2024", featured: false, demo: true, orientation: "portrait",
    cover: poster("reel-3", 720, 1280), media: [video("reel-3", 720, 1280)] },
  { id: "demo-a1", title: "إعلان مرئي لحملة موسمية", category: "ads", year: "2024", featured: true, demo: true, orientation: "landscape",
    summary: "نموذج تجريبي لإعلان مرئي عرضي.", cover: poster("ad-1", 1280, 720), media: [video("ad-1", 1280, 720)] },
  { id: "demo-m1", title: "عناوين متحركة لهوية رقمية", category: "motion", year: "2025", featured: false, demo: true, orientation: "square",
    cover: poster("motion-1", 1080, 1080), media: [video("motion-1", 1080, 1080)] },
  { id: "demo-4", title: "مشهد منتج بالذكاء الاصطناعي", category: "ai", year: "2025", featured: false, demo: true, orientation: "portrait",
    cover: img(4, 1200, 1500, "نموذج تجريبي لإنتاج بالذكاء الاصطناعي"), media: [{ type: "image", ...img(4, 1200, 1500, "نموذج تجريبي لإنتاج بالذكاء الاصطناعي") }] },
];

export const DEMO_CLIENTS: Client[] = Array.from({ length: 8 }, (_, i) => ({
  name: `جهة تجريبية ${i + 1}`,
  logo: { src: `/demo/logo-${(i % 4) + 1}.svg`, width: 240, height: 80, alt: `شعار تجريبي ${i + 1}` },
  demo: true,
}));

export const DEMO_TESTIMONIALS: Testimonial[] = [
  { id: "demo-t1", quote: "نص تجريبي يوضّح شكل الشهادة في الموقع. تُستبدل هذه البطاقة بشهادة حقيقية بعد الحصول على موافقة صاحبها.", name: "اسم تجريبي", role: "المنصب", company: "جهة تجريبية", demo: true },
  { id: "demo-t2", quote: "نص تجريبي ثانٍ لاختبار طول النص والتمرير الأفقي على الهاتف.", name: "اسم تجريبي", role: "المنصب", company: "جهة تجريبية", demo: true },
  { id: "demo-t3", quote: "نص تجريبي ثالث لعرض تنسيق الشهادات فقط، وليس رأياً من عميل حقيقي.", name: "اسم تجريبي", demo: true },
];

/**
 * Sample items only fill a section (or, for works, a gallery group) that has no real content yet.
 * As soon as one real item is published there, the samples disappear automatically.
 */
export function withDemo<T>(real: T[], demo: T[], on: boolean): T[] {
  return on && real.length === 0 ? demo : real;
}

export function withDemoWorks(real: Work[], demo: Work[], groupOf: (category: string) => string, on: boolean): Work[] {
  if (!on) return real;
  const filled = new Set(real.map((w) => groupOf(w.category)));
  return [...real, ...demo.filter((w) => !filled.has(groupOf(w.category)))];
}
