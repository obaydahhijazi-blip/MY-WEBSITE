import { defineField, defineType } from "sanity";

export const promotionSettings = defineType({
  name: "promotionSettings",
  title: "حملة الخصم",
  type: "document",
  fields: [
    defineField({ name: "enabled", title: "تفعيل العرض", type: "boolean", initialValue: true }),
    defineField({ name: "percent", title: "نسبة الخصم %", type: "number", initialValue: 30, validation:r=>r.required().min(1).max(100) }),
    defineField({ name: "start", title: "موعد بداية الحملة", type: "datetime", initialValue: "2026-10-27T21:00:00.000Z", validation:r=>r.required() }),
    defineField({ name: "end", title: "موعد نهاية الحملة", type: "datetime", initialValue: "2026-11-03T21:00:00.000Z", validation:r=>r.required() }),
    defineField({ name: "headline", title: "عنوان النافذة", type: "string", initialValue: "أسبوع استثنائي للإبداع" }),
    defineField({ name: "subtitle", title: "وصف العرض", type: "text", initialValue: "خصم 30% على خدمات التصميم والإنتاج البصري لمدة أسبوع واحد فقط." }),
    defineField({ name: "cta", title: "زر طلب عرض السعر", type: "string", initialValue: "اطلب عرض السعر الآن" }),
  ],
  preview: { prepare:()=>({title:"حملة الخصم — التوقيت والنسبة والنافذة"}) },
});
