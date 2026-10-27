import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { SERVICE_ICONS, WORK_CATEGORIES } from "./options";
import { minWidth } from "../image-size";

export const project = defineType({
  name: "project",
  title: "مشروع",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({ name: "title", title: "اسم المشروع", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "المعرّف", type: "slug", options: { source: "title", maxLength: 80 }, validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "التصنيف",
      type: "string",
      options: { list: WORK_CATEGORIES, layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "orientation",
      title: "اتجاه الفيديو أو الصورة",
      description: "للريلز اختر «طولي 9:16». إذا تركته فارغاً يُحدَّد تلقائياً من صورة الغلاف.",
      type: "string",
      options: {
        list: [
          { title: "طولي (ريلز 9:16)", value: "portrait" },
          { title: "عرضي (16:9)", value: "landscape" },
          { title: "مربع", value: "square" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({ name: "client", title: "اسم العميل أو الجهة (اختياري — بعد موافقتها)", type: "string" }),
    defineField({ name: "year", title: "السنة", type: "string", validation: (r) => r.regex(/^\d{4}$/).warning("أربعة أرقام، مثل 2025") }),
    defineField({ name: "summary", title: "وصف مختصر", type: "text", rows: 3, validation: (r) => r.max(320) }),
    defineField({ name: "role", title: "دوري في المشروع", type: "string", description: "مثلاً: الإخراج الفني والتصميم. اكتب دورك الفعلي فقط." }),
    defineField({ name: "challenge", title: "تحدّي المشروع", type: "text", rows: 3 }),
    defineField({ name: "solution", title: "الحل البصري", type: "text", rows: 4 }),
    defineField({ name: "tags", title: "كلمات البحث الخاصة بالمشروع", type: "array", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
    defineField({
      name: "beforeAfter", title: "مقارنة قبل وبعد (اختياري)", type: "object",
      description: "استخدم صوراً حقيقية من نفس المشروع وبموافقة العميل. لا تُنشئ صور قبل/بعد وهمية.",
      fields: [
        defineField({ name: "before", title: "قبل", type: "imageWithAlt" }),
        defineField({ name: "after", title: "بعد", type: "imageWithAlt" }),
      ],
    }),
    defineField({ name: "featured", title: "مشروع مميز (يظهر بحجم أكبر)", type: "boolean", initialValue: false }),
    defineField({
      name: "cover",
      title: "صورة الغلاف",
      description: "يُفضّل 2000px عرضاً على الأقل (JPG أو WebP). للريلز: صورة عمودية 1080×1920. حجم الملف أقل من 1MB إن أمكن.",
      type: "imageWithAlt",
      validation: (r) => [r.required(), r.custom(minWidth(1600, "صورة الغلاف")).warning()],
    }),
    defineField({
      name: "media",
      title: "صور وفيديوهات المشروع",
      description: "رتّب الصور والفيديو بالسحب. اختَر غلافاً مستقلاً من الحقل أعلاه. احفظ كمسودة للمراجعة، ثم انشر عند الجاهزية. المعاينة متاحة من تبويب معاينة في اللوحة.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" }), defineArrayMember({ type: "videoItem" })],
    }),
    defineField({
      name: "isDemo",
      title: "وسم تجريبي (لا يظهر في الموقع المنشور)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "hidden", title: "إخفاء من الموقع", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", category: "category", media: "cover", hidden: "hidden", featured: "featured" },
    prepare: ({ title, category, media, hidden, featured }) => ({
      title: `${featured ? "★ " : ""}${title}`,
      subtitle: `${WORK_CATEGORIES.find((c) => c.value === category)?.title ?? ""}${hidden ? " · مخفي" : ""}`,
      media,
    }),
  },
});

export const clientLogo = defineType({
  name: "clientLogo",
  title: "جهة / شعار",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "clientLogo" }),
    defineField({ name: "name", title: "اسم الجهة", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "logo",
      title: "الشعار (SVG أو PNG بخلفية شفافة)",
      type: "image",
      description: "الأفضل SVG. إن كان PNG أو WebP فبعرض 600px على الأقل وبخلفية شفافة ومن دون هوامش زائدة.",
      options: { accept: "image/svg+xml,image/png,image/webp" },
      validation: (r) => [r.required(), r.custom(minWidth(400, "الشعار")).warning()],
    }),
    defineField({ name: "url", title: "رابط موقع الجهة (اختياري)", type: "url" }),
    defineField({
      name: "isDemo",
      title: "وسم تجريبي (لا يظهر في الموقع المنشور)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "visible", title: "ظاهر في الموقع", type: "boolean", initialValue: true }),
    defineField({
      name: "approved",
      title: "تمت الموافقة على نشر الشعار",
      type: "boolean",
      initialValue: false,
      validation: (r) => r.custom((v, ctx) => (ctx.document?.visible && !v ? "لا يظهر الشعار قبل تأكيد الموافقة على النشر." : true)).warning(),
    }),
  ],
  preview: {
    select: { title: "name", media: "logo", visible: "visible", approved: "approved" },
    prepare: ({ title, media, visible, approved }) => ({
      title,
      subtitle: !approved ? "بانتظار الموافقة" : visible ? "ظاهر" : "مخفي",
      media,
    }),
  },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "رأي عميل",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "testimonial" }),
    defineField({ name: "quote", title: "نص الشهادة", type: "text", rows: 4, validation: (r) => r.required().max(500) }),
    defineField({ name: "name", title: "اسم صاحب الشهادة (اختياري)", type: "string" }),
    defineField({ name: "role", title: "المنصب (اختياري)", type: "string" }),
    defineField({ name: "company", title: "الجهة (اختياري)", type: "string" }),
    defineField({ name: "logo", title: "شعار الجهة (اختياري)", type: "image" }),
    defineField({
      name: "consent",
      title: "لدي موافقة صاحب الشهادة على نشرها",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isDemo",
      title: "وسم تجريبي (لا يظهر في الموقع المنشور)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "published", title: "منشور", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "name", subtitle: "quote", media: "logo", published: "published", consent: "consent" },
    prepare: ({ title, subtitle, media, published, consent }) => ({
      title: `${title || "بدون اسم"}${!consent ? " · بانتظار الموافقة" : !published ? " · مخفي" : ""}`,
      subtitle,
      media,
    }),
  },
});

export const faqItem = defineType({
  name: "faqItem",
  title: "سؤال شائع",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "faqItem" }),
    defineField({ name: "question", title: "السؤال", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "الإجابة", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "published", title: "منشور", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "question", subtitle: "answer", published: "published" },
    prepare: ({ title, subtitle, published }) => ({ title: `${title}${published === false ? " · مخفي" : ""}`, subtitle }),
  },
});

export const service = defineType({
  name: "service",
  title: "تخصص",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "service" }),
    defineField({ name: "title", title: "العنوان", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "الوصف", type: "text", rows: 2 }),
    defineField({ name: "icon", title: "الأيقونة", type: "string", options: { list: SERVICE_ICONS } }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});
