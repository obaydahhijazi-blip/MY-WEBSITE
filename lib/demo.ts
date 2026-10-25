import type { Client, Testimonial, Work } from "@/lib/cms/types";

/**
 * Demo mode shows clearly-labelled SAMPLE content so the layout can be judged before real
 * material exists. On by default only in `npm run dev`; a preview deployment can opt in with
 * NEXT_PUBLIC_DEMO_CONTENT=1. Production builds never include it unless that flag is set.
 */
export const demoMode =
  process.env.NEXT_PUBLIC_DEMO_CONTENT === "1" ||
  (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEMO_CONTENT !== "0");

const img = (n: number, w: number, h: number, alt: string) => ({ src: `/demo/work-${n}.svg`, width: w, height: h, alt });

export const DEMO_WORKS: Work[] = [
  { id: "demo-1", title: "هوية بصرية لعلامة قهوة", category: "identity", year: "2025", featured: true, demo: true,
    summary: "نموذج تجريبي لعرض شكل المشروع المميز في المعرض.", cover: img(1, 1600, 1000, "نموذج تجريبي لهوية بصرية"),
    media: [{ type: "image", ...img(1, 1600, 1000, "نموذج تجريبي لهوية بصرية") }, { type: "image", ...img(2, 1200, 1500, "نموذج تجريبي لتطبيقات الهوية") },
      { type: "video", src: "/demo/demo-reel.mp4", alt: "فيديو تجريبي", poster: img(6, 1600, 900, "غلاف فيديو تجريبي") }] },
  { id: "demo-2", title: "حملة رمضانية للمنصات الرقمية", category: "social", year: "2025", featured: false, demo: true,
    cover: img(2, 1200, 1500, "نموذج تجريبي لحملة سوشيال ميديا"), media: [{ type: "image", ...img(2, 1200, 1500, "نموذج تجريبي لحملة سوشيال ميديا") }] },
  { id: "demo-3", title: "ملف تعريفي لشركة استشارات", category: "print", year: "2024", featured: false, demo: true,
    cover: img(3, 1200, 900, "نموذج تجريبي لملف تعريفي"), media: [{ type: "image", ...img(3, 1200, 900, "نموذج تجريبي لملف تعريفي") }] },
  { id: "demo-4", title: "مشهد منتج بالذكاء الاصطناعي", category: "ai", year: "2025", featured: false, demo: true,
    cover: img(4, 1200, 1500, "نموذج تجريبي لإنتاج بالذكاء الاصطناعي"), media: [{ type: "image", ...img(4, 1200, 1500, "نموذج تجريبي لإنتاج بالذكاء الاصطناعي") }] },
  { id: "demo-5", title: "فيديو تعريفي قصير", category: "film", year: "2024", featured: true, demo: true,
    cover: img(6, 1600, 900, "غلاف فيديو تجريبي"),
    media: [{ type: "video", src: "/demo/demo-reel.mp4", alt: "فيديو تجريبي", poster: img(6, 1600, 900, "غلاف فيديو تجريبي") }] },
  { id: "demo-6", title: "سلسلة منشورات لإطلاق منتج", category: "social", year: "2024", featured: false, demo: true,
    cover: img(5, 1200, 1200, "نموذج تجريبي لمنشورات"), media: [{ type: "image", ...img(5, 1200, 1200, "نموذج تجريبي لمنشورات") }] },
];

export const DEMO_CLIENTS: Client[] = Array.from({ length: 8 }, (_, i) => ({
  name: `جهة تجريبية ${i + 1}`,
  logo: { src: `/demo/logo-${(i % 4) + 1}.svg`, width: 240, height: 80, alt: `شعار تجريبي ${i + 1}` },
  demo: true,
}));

export const DEMO_TESTIMONIALS: Testimonial[] = [
  { id: "demo-t1", quote: "نص تجريبي يوضّح شكل الشهادة في الموقع. تُستبدل هذه البطاقة بشهادة حقيقية بعد الحصول على موافقة صاحبها.", name: "اسم تجريبي", role: "المنصب", company: "جهة تجريبية", demo: true },
  { id: "demo-t2", quote: "نص تجريبي ثانٍ لاختبار طول النص والتمرير الأفقي على الهاتف.", name: "اسم تجريبي", role: "المنصب", company: "جهة تجريبية", demo: true },
  { id: "demo-t3", quote: "نص تجريبي ثالث. لا يظهر أي من هذه البطاقات في الموقع المنشور.", name: "اسم تجريبي", demo: true },
];
