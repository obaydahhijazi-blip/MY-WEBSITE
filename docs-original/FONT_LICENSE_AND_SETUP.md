# KO Sans — Owner-licensed typography integration

**حالة الخط:** أكّد مالك الموقع أنه يملك ترخيص KO Sans. نعتمده خطاً عربياً رئيسياً، بالأوزان السبعة.
**مهم:** هذه الحزمة تتضمن **ملفات الربط البرمجي والتوثيق فقط**، ولا تتضمن ملفات الخط نفسها. أضف نسخك المرخّصة محلياً داخل مشروع Claude النهائي.

## الملفات المطلوبة من المالك

| Source file supplied by owner | Copy locally into Next.js project | Weight |
|---|---|---|
| `KOSans-Thin (1).otf` | `public/fonts/KO-Sans-100.otf` | 100 (Thin) |
| `KOSans-ExtraLight (1).otf` | `public/fonts/KO-Sans-200.otf` | 200 (ExtraLight) |
| `KOSans-Light (1).otf` | `public/fonts/KO-Sans-300.otf` | 300 (Light) |
| `KOSans-Regular (1).otf` | `public/fonts/KO-Sans-400.otf` | 400 (Regular) |
| `KOSans-Medium (1).otf` | `public/fonts/KO-Sans-500.otf` | 500 (Medium) |
| `KOSans-SemiBold (1).otf` | `public/fonts/KO-Sans-600.otf` | 600 (SemiBold) |
| `KOSans-Bold (1).otf` | `public/fonts/KO-Sans-700.otf` | 700 (Bold) |

يمكن أن تختلف أسماء الملفات الأصلية قليلاً؛ المهم الحفاظ على المطابقة بين أسماء ملفات المشروع وأوزان `@font-face`.

## الاستخدام

1. فك ضغط هذه الحزمة في مجلد مشروع Claude Code.
2. في جهازك، ضَع الملفات السبعة الأصلية ضمن مجلد واحد (مثلاً `C:\Fonts\KOSans`).
3. نفّذ `scripts/setup-ko-sans.ps1` لإضافة ملفاتك محلياً إلى `public/fonts`، أو انسخها وغيّر أسماءها يدوياً حسب الجدول.
4. انسخ `styles/ko-sans.css` إلى مشروع Next.js واستورده في `app/layout.tsx`، أو انقل تعريفات `@font-face` إلى `app/globals.css`.
5. طبّق `font-family: "KO Sans", Tahoma, Arial, sans-serif` على الموقع العربي.
6. احرص على تضمين/استضافة ملفات الخط فقط وفق ترخيصك الذي يغطي الاستخدام المقصود على الويب.
7. إن لم تتوفر الملفات بعد داخل المشروع، أبقِ الـ fallback مفعلًا، ولا تُظهر أن KO Sans يعمل قبل التأكد في DevTools / Network.

### CSS usage

```tsx
// app/layout.tsx
import './globals.css';
import '../styles/ko-sans.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
```

## توزيع الأوزان
- **700 Bold:** العناوين الكبيرة في الأجزاء الداخلية.
- **600 SemiBold:** العناوين الفرعية والأزرار الرئيسية.
- **500 Medium:** عناصر الواجهة والتنقل.
- **400 Regular:** نصوص الفقرات ووصف الخدمات.
- **300 Light:** تفاصيل ثانوية محدودة لا تؤثر في القراءة.
- **200 ExtraLight و100 Thin:** استخدام زخرفي محدود فقط مع ضمان الوضوح والتباين؛ غير مناسبين لنصوص المحتوى الطويلة.

*ملاحظة:* اسم OBAYDAH HIJAZI الفني ضمن الهيرو يُعامل كعنصر بصري منفصل، ولا يحتاج إلى تغيير إلى KO Sans؛ النص العربي في الواجهة يحتاج KO Sans.
