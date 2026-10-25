import { defineField, defineType } from "sanity";

/** Image with a required Arabic description (alt text). */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "صورة",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "وصف الصورة (للقارئات الصوتية ومحركات البحث)",
      type: "string",
      validation: (r) => r.required().warning("يُفضّل كتابة وصف عربي قصير للصورة."),
    }),
  ],
});

export const videoItem = defineType({
  name: "videoItem",
  title: "فيديو",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "ملف الفيديو (MP4)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "poster", title: "صورة الغلاف", type: "imageWithAlt" }),
    defineField({ name: "alt", title: "وصف الفيديو", type: "string" }),
  ],
  preview: { select: { title: "alt", media: "poster" }, prepare: ({ title, media }) => ({ title: title || "فيديو", media }) },
});
