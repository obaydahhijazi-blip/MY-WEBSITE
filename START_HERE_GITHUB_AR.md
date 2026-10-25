# رفع موقع عبيدة حجازي إلى GitHub

**المستودع المستهدف:** https://github.com/obaydahhijazi-blip/MY-WEBSITE

⚠️ المستودع حالياً ظاهر كعام (Public). قبل تشغيل الأداة، حوّله إلى Private من Settings → General → Danger Zone → Change repository visibility؛ لأن المشروع يتضمن ملفات تصميم أصلية وموسيقى مرخّصة.

1. تأكد أن مستودع MY-WEBSITE فارغ (لا ملفات أو commits).
2. فك ضغط الحزمة بالكامل إلى مجلد واحد على Windows.
3. ثبّت Git for Windows إن لم يكن مثبتاً: https://git-scm.com/downloads/win
4. شغّل `01-PUBLISH-TO-GITHUB.cmd` من داخل المجلد.
5. قد يطلب Git تسجيل الدخول إلى حسابك من المتصفح. وافق على الربط.
6. بعد ظهور `SUCCESS` افتح المستودع وتأكد من وجود `package.json` و`app/` و`components/`.

لا تشارك كلمات المرور أو مفاتيح Sanity. ملف `.env.local` المحلي مستثنى بواسطة `.gitignore`. يحتوي المشروع على الموسيقى المرخّصة، لكن ملفات KO Sans المرخّصة غير مرفقة.

## بعد رفع الكود
اربط GitHub بـ Vercel، واضبط متغيرات البيئة:
- `NEXT_PUBLIC_SANITY_PROJECT_ID=iz5tq94u`
- `NEXT_PUBLIC_SANITY_DATASET=production`
ثم أضف نطاق Vercel إلى Sanity CORS مع Allow credentials، وجهّز `cms:seed` وفق دليل `docs/CMS_SANITY.md`.
