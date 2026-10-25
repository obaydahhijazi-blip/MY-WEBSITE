# إعداد خط Outfit الإنجليزي

اعتمدنا Outfit لكل النصوص اللاتينية في الموقع، مع إبقاء KO Sans للعربية.

**ملفات الخطوط نفسها غير مضمنة في الحزمة.** شغّل `INSTALL_FONTS_LOCAL.cmd` بعد وضع ملفاتك المرخصة في مجلد على جهازك وإدخال مساره.

الملفات المتوقعة بعد التثبيت داخل `public/fonts/`: `Outfit-Thin.ttf` و`Outfit-ExtraLight.ttf` و`Outfit-Light.ttf` و`Outfit-Regular.ttf` و`Outfit-Medium.ttf` و`Outfit-SemiBold.ttf` و`Outfit-Bold.ttf` و`Outfit-ExtraBold.ttf` و`Outfit-Black.ttf`.

موجود ربط CSS جاهز في `styles/outfit.css` ومستورد من تخطيط الموقع، مع fallback في حال عدم تركيب الخطوط.

خط KO Sans يستعمل `styles/ko-sans.css`. نسخ ملفات الخطوط إلى الجهاز والاستضافة يجب أن يكون من النسخ الأصلية المملوكة لك وبحسب ترخيص الاستخدام على الويب.

لا تُرفع ملفات الخطوط إلى مستودع عام إلا إذا كانت الرخصة تسمح بذلك.

## WOFF2 (اختياري — أخف بكثير)
يقرأ الموقع ملفات `.woff2` أولاً إن وُجدت بالاسم نفسه داخل `public/fonts/` (مثل `KO-Sans-400.woff2` أو `Outfit-Regular.woff2`)، وإلا يستخدم ملفات OTF/TTF تلقائياً. يمكن التحويل محلياً بأداة مثل `woff2_compress` ضمن حدود ترخيص الخط، ولا تُرفع ملفات الخطوط إلى مستودع عام.
