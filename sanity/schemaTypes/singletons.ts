import { defineArrayMember, defineField, defineType } from "sanity";
import { COUNTRY_OPTIONS } from "@/lib/map/countries";
import { STEP_ICONS } from "./options";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "إعدادات الموقع",
  type: "document",
  groups: [
    { name: "identity", title: "الهوية والتواصل", default: true },
    { name: "hero", title: "الافتتاحية" },
    { name: "contact", title: "قسم التواصل" },
    { name: "seo", title: "محركات البحث" },
    { name: "music", title: "الموسيقى" },
  ],
  fields: [
    defineField({ name: "nameAr", title: "الاسم بالعربية", type: "string", group: "identity" }),
    defineField({ name: "nameEn", title: "الاسم بالإنجليزية", type: "string", group: "identity" }),
    defineField({ name: "jobAr", title: "المسمى المهني", type: "string", group: "identity" }),
    defineField({
      name: "whatsappNumber",
      title: "رقم واتساب (مع رمز الدولة)",
      description: "مثال: ‎+963964766503",
      type: "string",
      group: "identity",
      validation: (r) => r.regex(/^\+?[0-9 ]{8,18}$/, { name: "phone" }).error("اكتب الرقم بالأرقام فقط مع رمز الدولة."),
    }),
    defineField({ name: "whatsappMessage", title: "رسالة واتساب الافتراضية", type: "text", rows: 2, group: "identity" }),
    defineField({ name: "email", title: "البريد الإلكتروني العام (اختياري)", type: "string", group: "identity" }),
    defineField({ name: "instagram", title: "رابط إنستغرام", type: "url", group: "identity" }),
    defineField({ name: "instagramHandle", title: "اسم الحساب على إنستغرام", type: "string", group: "identity" }),
    defineField({
      name: "availabilityStatus",
      title: "حالة استقبال المشاريع",
      description: "تظهر شارة صغيرة في الافتتاحية. اختر «إخفاء» إن لم ترغب بعرض أي حالة.",
      type: "string",
      group: "hero",
      initialValue: "hidden",
      options: {
        list: [
          { title: "متاح حالياً لاستقبال مشاريع جديدة", value: "available" },
          { title: "جدول المشاريع مكتمل حالياً", value: "full" },
          { title: "إخفاء الشارة", value: "hidden" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "marqueeItems",
      title: "نصوص الشريط المتحرك تحت الافتتاحية",
      type: "array",
      group: "hero",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.max(5),
    }),
    defineField({ name: "heroEyebrow", title: "السطر التعريفي", type: "string", group: "hero" }),
    defineField({ name: "heroDescription", title: "الوصف", type: "text", rows: 2, group: "hero" }),
    defineField({ name: "heroPrimaryCta", title: "نص الزر الرئيسي", type: "string", group: "hero" }),
    defineField({ name: "heroSecondaryCta", title: "نص زر التواصل", type: "string", group: "hero" }),
    defineField({ name: "contactTitle", title: "العنوان", type: "string", group: "contact" }),
    defineField({ name: "contactDescription", title: "الوصف", type: "text", rows: 2, group: "contact" }),
    defineField({ name: "seoTitle", title: "عنوان الصفحة", type: "string", group: "seo", validation: (r) => r.max(70) }),
    defineField({ name: "seoDescription", title: "وصف الصفحة", type: "text", rows: 3, group: "seo", validation: (r) => r.max(180) }),
    defineField({ name: "ogImage", title: "صورة المشاركة (1200×630)", type: "image", group: "seo" }),
    defineField({ name: "musicEnabled", title: "إظهار زر الموسيقى", type: "boolean", initialValue: true, group: "music" }),
    defineField({
      name: "musicFile",
      title: "ملف موسيقى بديل (اختياري)",
      description: "اتركه فارغاً لاستخدام المقطع المرفق مع الموقع.",
      type: "file",
      options: { accept: "audio/mpeg" },
      group: "music",
    }),
    defineField({ name: "musicTitle", title: "اسم المقطع", type: "string", group: "music" }),
    defineField({ name: "musicVolume", title: "مستوى الصوت (0.05 – 0.6)", type: "number", initialValue: 0.18, validation: (r) => r.min(0.05).max(0.6), group: "music" }),
  ],
  preview: { prepare: () => ({ title: "إعدادات الموقع" }) },
});

export const aboutSection = defineType({
  name: "aboutSection",
  title: "قسم «عني»",
  type: "document",
  fields: [
    defineField({ name: "headline", title: "العنوان", type: "string" }),
    defineField({
      name: "paragraphs",
      title: "النبذة (فقرة لكل عنصر)",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "stats",
      title: "الأرقام",
      type: "array",
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "value",
              title: "الرقم",
              description: "اتركه فارغاً إن لم يكن مؤكداً بعد؛ تُخفى البطاقة من الموقع حتى تضيفه.",
              type: "number",
              validation: (r) => r.min(0),
            }),
            defineField({
              name: "icon",
              title: "الأيقونة",
              type: "string",
              options: {
                list: [
                  { title: "سنوات", value: "clock" },
                  { title: "عملاء", value: "users" },
                  { title: "دول", value: "globe" },
                  { title: "مشاريع", value: "layers" },
                ],
              },
            }),
            defineField({ name: "suffix", title: "لاحقة (مثل +)", type: "string" }),
            defineField({ name: "label", title: "الوصف", type: "string", validation: (r) => r.required() }),
            defineField({ name: "mapLink", title: "مرتبط بالخريطة (يُبرز الدول عند المرور)", type: "boolean", initialValue: false }),
          ],
          preview: {
            select: { v: "value", s: "suffix", l: "label" },
            prepare: ({ v, s, l }) => ({ title: `${v ?? "—"}${v != null ? (s ?? "") : ""} ${l ?? ""}`, subtitle: v == null ? "مخفي حتى إضافة الرقم" : undefined }),
          },
        }),
      ],
    }),
    defineField({ name: "mapTitle", title: "عنوان الخريطة", type: "string" }),
    defineField({
      name: "countries",
      title: "الدول المميزة على الخريطة",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: COUNTRY_OPTIONS, layout: "grid" },
    }),
  ],
  preview: { prepare: () => ({ title: "قسم «عني»" }) },
});

const sectionText = (name: string, title: string, extra: ReturnType<typeof defineField>[] = []) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: "title", title: "العنوان", type: "string" }),
      defineField({ name: "description", title: "الوصف", type: "text", rows: 2 }),
      ...extra,
    ],
  });

export const sectionTexts = defineType({
  name: "sectionTexts",
  title: "نصوص الأقسام",
  type: "document",
  fields: [
    sectionText("clients", "الجهات", [defineField({ name: "emptyText", title: "النص عند عدم وجود شعارات", type: "string" })]),
    sectionText("expertise", "التخصصات"),
    sectionText("process", "طريقة العمل", [
      defineField({ name: "intro", title: "وصف تمهيدي قصير", type: "string" }),
      defineField({
        name: "steps",
        title: "المراحل",
        type: "array",
        validation: (r) => r.max(6),
        of: [
          defineArrayMember({
            type: "object",
            name: "step",
            fields: [
              defineField({ name: "title", title: "العنوان", type: "string", validation: (r) => r.required() }),
              defineField({ name: "description", title: "الوصف", type: "text", rows: 2 }),
              defineField({ name: "icon", title: "الأيقونة", type: "string", options: { list: STEP_ICONS } }),
            ],
          }),
        ],
      }),
    ]),
    sectionText("works", "الأعمال", [
      defineField({ name: "emptyTitle", title: "عنوان الحالة الفارغة", type: "string" }),
      defineField({ name: "emptyBody", title: "نص الحالة الفارغة", type: "text", rows: 2 }),
      defineField({ name: "similarCta", title: "نص زر «مشروع مشابه»", type: "string" }),
    ]),
    sectionText("testimonials", "آراء العملاء"),
    sectionText("faq", "الأسئلة الشائعة", [defineField({ name: "note", title: "الملاحظة الختامية", type: "string" })]),
  ],
  preview: { prepare: () => ({ title: "نصوص الأقسام" }) },
});

export const consultationSection = defineType({
  name: "consultationSection",
  title: "قسم الاستشارة",
  type: "document",
  fields: [
    defineField({ name: "titleBefore", title: "العنوان (الجزء الأول)", type: "string" }),
    defineField({ name: "titleHighlight", title: "الكلمة المميزة باللون", type: "string" }),
    defineField({ name: "subtitle", title: "الوصف", type: "text", rows: 2 }),
    defineField({
      name: "facts",
      title: "معلومات الاستشارة",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "fact",
          fields: [
            defineField({ name: "label", title: "العنوان", type: "string" }),
            defineField({ name: "value", title: "القيمة", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({ name: "agenda", title: "محاور النقاش", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "categories", title: "خيارات «نوع المشروع»", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "whatsappCta", title: "نص زر واتساب", type: "string" }),
    defineField({ name: "calendarCta", title: "نص زر التقويم", type: "string" }),
    defineField({
      name: "calUrl",
      title: "رابط حدث Cal.com",
      description: "مثال: https://cal.com/obaydah-hijazi-90xp0p/30min — تأكد من ضبط الحدث مجانياً داخل Cal.com.",
      type: "url",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({ name: "requestNote", title: "توضيح طلب واتساب", type: "text", rows: 2 }),
    defineField({ name: "privacyNote", title: "ملاحظة الخصوصية", type: "text", rows: 2 }),
  ],
  preview: { prepare: () => ({ title: "قسم الاستشارة" }) },
});

export const quoteSection = defineType({
  name: "quoteSection",
  title: "قسم طلب عرض السعر",
  type: "document",
  fields: [
    defineField({ name: "title", title: "العنوان", type: "string" }),
    defineField({ name: "description", title: "الوصف", type: "text", rows: 2 }),
    defineField({ name: "services", title: "خيارات «نوع الخدمة المطلوبة»", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "cta", title: "نص الزر الرئيسي", type: "string" }),
    defineField({ name: "note", title: "توضيح أسفل الزر", type: "text", rows: 2 }),
    defineField({ name: "secondary", title: "نص رابط الاستشارة المجانية", type: "string" }),
    defineField({ name: "privacyNote", title: "ملاحظة الخصوصية", type: "text", rows: 2 }),
  ],
  preview: { prepare: () => ({ title: "قسم طلب عرض السعر" }) },
});
