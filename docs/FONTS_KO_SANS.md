# خط KO Sans — التثبيت المحلي

ملفات الخط **غير موجودة** في المشروع عمداً، ولن تُرفع إلى Git (`.gitignore` يستثني `public/fonts/*.otf`).
حتى تُضاف الملفات يعمل الموقع بخط بديل مفتوح المصدر (IBM Plex Sans Arabic) بلا أي خلل في التصميم.

## الخطوات
1. ضع ملفاتك السبعة المرخّصة في مجلد واحد (مثل `C:\Fonts\KOSans` أو `~/Fonts/KOSans`).
2. نفّذ أحد الأمرين من جذر المشروع:
   - Windows: `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ko-sans.ps1 -SourceFolder "C:\Fonts\KOSans"`
   - macOS/Linux: `bash scripts/setup-ko-sans.sh ~/Fonts/KOSans`
3. أو انسخها يدوياً بهذه الأسماء داخل `public/fonts/` ضمن بيئة البناء (لا ترفعها لمستودع عام دون إذن الترخيص):

| الوزن | اسم الملف |
|---|---|
| 100 Thin | `KO-Sans-100.otf` |
| 200 ExtraLight | `KO-Sans-200.otf` |
| 300 Light | `KO-Sans-300.otf` |
| 400 Regular | `KO-Sans-400.otf` |
| 500 Medium | `KO-Sans-500.otf` |
| 600 SemiBold | `KO-Sans-600.otf` |
| 700 Bold | `KO-Sans-700.otf` |

4. شغّل `npm run fonts:check` أو أعد تشغيل `npm run dev`، وتحقق في DevTools ← Network أن ملفات `KO-Sans-*.otf` تُحمَّل بحالة 200.

التعريفات الفعلية تُنشأ وقت البناء بواسطة `scripts/prepare-fonts.mjs` داخل `styles/ko-sans-generated.css`، وهي مستوردة في `app/(site)/layout.tsx`. سلسلة الخطوط:
`"KO Sans" ← IBM Plex Sans Arabic ← Tahoma ← Arial`.

## ملاحظات
- قبل النشر تأكد أن ترخيصك يشمل **استضافة الخط على الويب** (Webfont)، لأن ملفات `public/` تُنزَّل إلى متصفح كل زائر.
- لأداء أفضل يمكن تحويل الملفات إلى WOFF2 (إن سمح الترخيص) وتعديل المسارات في `styles/ko-sans.css`.
- إذا لم تُضَف ملفات الخط، لا يتم إنشاء أي `@font-face` يشير إلى مسار مفقود، وبالتالي لا تظهر طلبات 404 للخط. سيظهر IBM Plex Sans Arabic كبديل بشكل تلقائي.

## WOFF2 (اختياري — أخف بكثير)
يقرأ السكربت يفضّل ملف `.woff2` إن وجد بالاسم نفسه داخل `public/fonts/` (مثل `KO-Sans-400.woff2`)، وإلا يختار ملف `.otf` المتوفر فقط. يمكن التحويل محلياً بأداة مثل `woff2_compress` ضمن حدود ترخيص الخط، ولا تُرفع ملفات الخطوط إلى مستودع عام.
