# الموقع الشخصي — عبيدة حجازي

موقع شخصي عربي (RTL) بصفحة رئيسية واحدة ولوحة إدارة محتوى على `/admin`.
مبني بـ Next.js 16 (App Router) وTypeScript وTailwind CSS 4 وSanity Studio وLenis.

## التشغيل
```bash
npm install
cp .env.example .env.local   # ثم أضف قيم Sanity (اختياري)
npm run dev                  # http://localhost:3000  — اللوحة: http://localhost:3000/admin
npm run check                # فحص الأنواع + ESLint + بناء الإنتاج
```
**النشر على Vercel:** استورد المستودع، وأضف متغيرات البيئة من `.env.example`، ثم Deploy.
بعد ضبط Sanity لا تحتاج تعديلات المحتوى إلى إعادة نشر.

## ترتيب الصفحة (حسب المواصفات النهائية)
| # | القسم | المكوّن |
|---|---|---|
| 1 | الهيدر + الافتتاحية («اطلب عرض سعر» و«احجز استشارة مجانية») | `Header.tsx` و`HeroScene.tsx` |
| 2 | شريط الهوية المتحرك | `IdentityMarquee.tsx` |
| 3 | نبذة عني + أربع إحصائيات + الكرة الأرضية التفاعلية | `BioSection.tsx` و`about/StatsAndMap.tsx` و`about/Globe.tsx` |
| 4 | جهات تشرفت بالعمل معها (شريط شعارات متحرك) | `ClientLogoGrid.tsx` |
| 5 | الخبرات والتخصصات (خلفية بترولية) | `Expertise.tsx` |
| 6 | أعمال مختارة (معرض سينمائي + عارض صور وفيديو) | `WorkSection.tsx` و`WorkGallery.tsx` و`WorkLightbox.tsx` |
| 7 | آراء وتجارب العملاء (يظهر عند وجود شهادة معتمدة) | `Testimonials.tsx` |
| 8 | الأسئلة الشائعة وشروط التعاون | `FaqSection.tsx` |
| 9 | احجز استشارتك المجانية (واتساب أولاً، Cal.com ثانياً) | `booking/*` |
| 10 | طريقة العمل (رحلة تفاعلية) | `ProcessTimeline.tsx` |
| 11 | اطلب عرض سعر لمشروعك (آخر قسم رئيسي) | `QuoteSection.tsx` |
| 12 | تذييل مختصر | `ContactFooter.tsx` |

## وضع المعاينة التجريبي (DEMO)
عند التشغيل المحلي (`npm run dev` أو `START_LOCAL.cmd`) تظهر مشاريع وشعارات وشهادات **تجريبية** عليها شارة «نموذج تجريبي»، لتقييم شكل المعرض. **لا تظهر أبداً في نسخة الإنتاج** (`npm run build`) إلا إذا ضُبط `NEXT_PUBLIC_DEMO_CONTENT=1`. ولإخفائها محلياً اضبط `NEXT_PUBLIC_DEMO_CONTENT=0`.

## التشغيل على ويندوز
فك الضغط، ثم انقر مرتين على `START_LOCAL.cmd` (يتطلب Node.js 22 أو 24). التفاصيل في `LOCAL_README_AR.txt`.

## مصدر المحتوى
`lib/cms/index.ts` يجلب المحتوى من Sanity إن ضُبط `NEXT_PUBLIC_SANITY_PROJECT_ID`، وإلا يستخدم `content/*.json`.
أي حقل فارغ في اللوحة يُكمَّل تلقائياً من الملفات المحلية، وإذا تعذّر الوصول إلى Sanity يبقى الموقع يعمل بالمحتوى المحلي.
التفاصيل الكاملة للوحة في **`docs/CMS_SANITY.md`**.

## مستندات أخرى
- `docs/CMS_SANITY.md`: إعداد Sanity، والدخول، وإضافة المشاريع والشعارات والشهادات، وتعديل الأسئلة، والنشر.
- `docs/BOOKING_AND_WHATSAPP.md`: مسار واتساب، وCal.com، والإشعار التلقائي الاختياري.
- `docs/FONTS_KO_SANS.md` و`docs/OUTFIT_INSTALL_AR.md`: تثبيت ملفات KO Sans وOutfit المرخّصة (أو `INSTALL_FONTS_LOCAL.cmd`).
- `docs/ANALYTICS_AR.md`: ربط إحصائيات الزيارات الحقيقية (Umami).
- `docs/DELIVERY_REPORT_AR.md`: تقرير التسليم (ما تم، وما اختُبر، وما ينتظر الإعداد).

## ملاحظات تقنية
- **الكرة الأرضية:** إسقاط كروي حقيقي (d3-geo) مرسوم بـ SVG من بيانات Natural Earth. تُحمَّل عند الاقتراب من القسم فقط، وتتوقف حين تخرج من الشاشة. أسماء الدول بالعربية في `lib/map/countries.ts`.
- **الموسيقى:** `public/audio/infernos-laissez-vibrer.mp3` نسخة ويب (128kbps، 1.6MB) من الملف الأصلي المحفوظ في `assets/audio/`. لا يُحمَّل الملف إلا بعد ضغط زر الموسيقى.
- **الأيقونات:** `app/icon.svg` مرسومة من الشعار الخطي (داكنة على الخلفيات الفاتحة وفاتحة على الداكنة)، مع `favicon.ico` و`apple-icon.png`.
- **التمرير الناعم:** `components/SmoothScroll.tsx` (Lenis) على أجهزة الفأرة فقط، وأجهزة اللمس تبقى بالتمرير الأصلي. يتوقف مع «تقليل الحركة».
- **نقاط API:** `/api/revalidate` (تحديث بعد النشر)، و`/api/draft-mode/*` (المعاينة)، و`/api/cal/webhook` (إشعار واتساب الاختياري).
