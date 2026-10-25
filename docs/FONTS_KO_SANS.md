# خط KO Sans — التثبيت المحلي

ملفات الخط **غير موجودة** في المشروع عمداً، ولن تُرفع إلى Git (`.gitignore` يستثني `public/fonts/*.otf`).
حتى تُضاف الملفات يعمل الموقع بخط بديل مفتوح المصدر (IBM Plex Sans Arabic) بلا أي خلل في التصميم.

## الخطوات
1. ضع ملفاتك السبعة المرخّصة في مجلد واحد (مثل `C:\Fonts\KOSans` أو `~/Fonts/KOSans`).
2. نفّذ أحد الأمرين من جذر المشروع:
   - Windows: `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ko-sans.ps1 -SourceFolder "C:\Fonts\KOSans"`
   - macOS/Linux: `bash scripts/setup-ko-sans.sh ~/Fonts/KOSans`
3. أو انسخها يدوياً بهذه الأسماء داخل `public/fonts/`:

| الوزن | اسم الملف |
|---|---|
| 100 Thin | `KO-Sans-100.otf` |
| 200 ExtraLight | `KO-Sans-200.otf` |
| 300 Light | `KO-Sans-300.otf` |
| 400 Regular | `KO-Sans-400.otf` |
| 500 Medium | `KO-Sans-500.otf` |
| 600 SemiBold | `KO-Sans-600.otf` |
| 700 Bold | `KO-Sans-700.otf` |

4. أعد تشغيل `npm run dev`، وتحقق في DevTools ← Network أن ملفات `KO-Sans-*.otf` تُحمَّل بحالة 200.

التعريفات موجودة في `styles/ko-sans.css` ومستوردة في `app/layout.tsx`. سلسلة الخطوط:
`"KO Sans" ← IBM Plex Sans Arabic ← Tahoma ← Arial`.

## ملاحظات
- قبل النشر تأكد أن ترخيصك يشمل **استضافة الخط على الويب** (Webfont)، لأن ملفات `public/` تُنزَّل إلى متصفح كل زائر.
- لأداء أفضل يمكن تحويل الملفات إلى WOFF2 (إن سمح الترخيص) وتعديل المسارات في `styles/ko-sans.css`.
- إلى أن تُضاف الملفات سيظهر في Console طلبات 404 لملفات `KO-Sans-*.otf`؛ هذا متوقع ولا يؤثر في العرض.
