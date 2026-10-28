import type { StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { CogIcon } from "@sanity/icons/Cog";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { ImagesIcon } from "@sanity/icons/Images";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { StarIcon } from "@sanity/icons/Star";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { TagIcon } from "@sanity/icons/Tag";

const singleton = (S: Parameters<StructureResolver>[0], id: string, title: string, icon?: React.ComponentType) =>
  S.listItem().title(title).id(id).icon(icon).child(S.document().schemaType(id).documentId(id).title(title));

/** A short, plain-language menu for a non-technical owner (brief §18). */
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("لوحة عبيدة حجازي")
    .items([
      orderableDocumentListDeskItem({ type: "project", title: "الأعمال", icon: ImagesIcon, S, context }),
      orderableDocumentListDeskItem({ type: "clientLogo", title: "العملاء والشعارات", icon: TagIcon, S, context }),
      orderableDocumentListDeskItem({ type: "testimonial", title: "آراء العملاء", icon: CommentIcon, S, context }),
      S.listItem()
        .title("النصوص والتخصصات")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("النصوص والتخصصات")
            .items([
              singleton(S, "aboutSection", "نبذة عني والأرقام والدول", InfoOutlineIcon),
              orderableDocumentListDeskItem({ type: "service", title: "التخصصات", icon: StarIcon, S, context }),
              singleton(S, "sectionTexts", "عناوين الأقسام وطريقة العمل", DocumentTextIcon),
            ]),
        ),
      orderableDocumentListDeskItem({ type: "faqItem", title: "الأسئلة الشائعة", icon: HelpCircleIcon, S, context }),
      S.listItem()
        .title("الاستشارات وطلب عرض السعر")
        .icon(CalendarIcon)
        .child(
          S.list()
            .title("الاستشارات وطلب عرض السعر")
            .items([singleton(S, "consultationSection", "الاستشارة المجانية", CalendarIcon), singleton(S, "quoteSection", "طلب عرض السعر", DocumentTextIcon), singleton(S, "promotionSettings", "حملة الخصم والعداد", StarIcon)]),
        ),
      singleton(S, "legalPages", "سياسة العمل والخصوصية", DocumentTextIcon),
      S.divider(),
      singleton(S, "siteSettings", "إعدادات الموقع (الحالة، التواصل، SEO، الموسيقى)", CogIcon),
    ]);
