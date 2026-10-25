# الاستشارة: واتساب + Cal.com، والإشعار التلقائي (اختياري)

## كيف يعمل الحجز الآن
| المسار | الحالة |
|---|---|
| **واتساب (الأساسي):** أربعة حقول (الاسم، نوع المشروع، النبذة، الموعد المفضل)، ثم يُفتح واتساب برسالة جاهزة إلى `+963 964 766 503` | ✅ يعمل. الزائر يضغط «إرسال» بنفسه، والطلب **ليس حجزاً مؤكداً**، ويُؤكَّد الموعد في المحادثة. لا يُخزّن الموقع أي بيانات |
| **التقويم (ثانوي):** زر «أو اختر موعدك من التقويم» يفتح تقويم Cal.com المضمّن، ومعه رابط لفتحه في صفحة مستقلة | ✅ مربوط بـ `https://cal.com/obaydah-hijazi-90xp0p/30min`. **لم يُختبر التقويم المضمّن من بيئة التطوير** لأن cal.com محجوب فيها |
| أزرار التواصل العامة برسالة «مرحباً عبيدة، أود التواصل معك بخصوص مشروع.» | ✅ تعمل، وهي منفصلة عن مسار الحجز |
| إشعار واتساب تلقائي للمالك عند حجز Cal.com | ⏸️ **غير مفعّل**. يحتاج إعداد WhatsApp Cloud API (القسم 3 أدناه) |

رابط Cal.com ونصوص القسم قابلة للتعديل من `/admin ← قسم الاستشارة`.

## 1) تأكد من إعداد حدث Cal.com
تسمية «مجانية» في الموقع لا تغيّر إعدادات الحدث نفسه. ادخل إلى Cal.com وتحقق من الآتي في حدث `30min`:
1. **Duration** = 30 دقيقة.
2. **Payments / Apps**: لا يوجد تطبيق دفع (Stripe أو غيره) مفعّل على هذا الحدث، فيكون الحجز **مجانياً** فعلاً.
3. **Availability**: أوقاتك الفعلية ومنطقتك الزمنية. اربط تقويمك من **Settings → Calendars** لمنع التضارب.
4. **Limits**: فاصل قبل وبعد (Buffer) وحد أدنى للإشعار المسبق حسب رغبتك.
5. **Booking questions** (اختياري، لإشعار واتساب لاحقاً): `attendeePhoneNumber` و`projectType` و`brandName`.
6. Cal.com يعرض المواعيد بتوقيت الزائر، ويرسل التأكيد، ويدعم الإلغاء وإعادة الجدولة.

## 2) Webhook التحقق والاستقبال
نقطة الاستقبال جاهزة: `POST https://<نطاقك>/api/cal/webhook`
- تتحقق من التوقيع `x-cal-signature-256` (HMAC-SHA256 للجسم الخام بالـ secret) بمقارنة آمنة زمنياً، وترفض غير الموقّع (401).
- حد للحجم (64KB) وحد للطلبات لكل IP، وتنظيف النصوص قبل استخدامها.
- منع التكرار (idempotency) بمفتاح `الحالة:uid:وقت البدء` — لا يُرسل الإشعار مرتين لنفس الحدث.
- السجلات لا تحتوي أسماء أو أرقام هواتف؛ فقط مرجع مُجزّأ (hash) قصير.

الإعداد في Cal.com: **Settings → Developer → Webhooks → New**
- Subscriber URL: `https://<نطاقك>/api/cal/webhook`
- Events: `Booking Created`, `Booking Rescheduled`, `Booking Cancelled`
- Secret: قيمة عشوائية طويلة (مثلاً ناتج `openssl rand -hex 32`)، وضعها في `CAL_WEBHOOK_SECRET` على الخادم.
- اضغط **Ping test**؛ يجب أن يرد الخادم بـ `{"ok":true,"ping":true}`.

> **ملاحظة للاستضافة السحابية (Vercel وغيرها):** منع التكرار حالياً في ذاكرة الخادم، ويعمل لكل نسخة دافئة. لضمان صارم عبر عدة نسخ استبدل `alreadyProcessed/markProcessed` في `lib/booking/guards.ts` بمخزن مشترك (مثل Upstash Redis: `SET key 1 NX EX 604800`).

## 3) إشعار واتساب التلقائي للمالك (WhatsApp Business Platform — Cloud API)
الرسائل التي يبدؤها النظام (خارج نافذة 24 ساعة) تتطلب **قالباً معتمداً** من Meta.
1. أنشئ تطبيقاً في https://developers.facebook.com بنوع Business وأضف منتج **WhatsApp**، واربط رقم إرسال (رقم مختلف عن رقمك الشخصي المستقبِل).
2. أنشئ **System User** دائماً في Business Settings وأصدر له Access Token بصلاحيتي `whatsapp_business_messaging` و`whatsapp_business_management`.
3. في WhatsApp Manager أنشئ قالباً من فئة **Utility** بلغة **Arabic (ar)**، مثلاً باسم `consultation_booking_alert`، بنص مثل:
   ```
   {{1}}
   الاسم: {{2}}
   الهاتف: {{3}}
   نوع المشروع: {{4}}
   الجهة: {{5}}
   النبذة: {{6}}
   الموعد بتوقيتك: {{7}}
   الموعد بتوقيت العميل: {{8}}
   رقم الحجز: {{9}}
   رابط المكالمة: {{10}}
   ```
   (يجب الحفاظ على **ترتيب** المتغيرات العشرة؛ الحقول الفارغة تُرسل كـ «—».)
4. أضف رقمك المستقبِل `963964766503` كرقم مسموح (في وضع الاختبار) أو فعّل الحساب للإنتاج.
5. متغيرات البيئة (على الخادم فقط):
   ```
   CAL_WEBHOOK_SECRET=...
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...
   WHATSAPP_TEMPLATE_NAME=consultation_booking_alert
   WHATSAPP_TEMPLATE_LANG=ar
   WHATSAPP_OWNER_NUMBER=963964766503
   ```
6. احجز موعد اختبار، وتأكد من وصول الرسالة، ومن السجل: `[cal-webhook] created ref=… — owner notified`.

إن لم تكتمل بيانات واتساب، يرد الـ webhook بـ `notified:false, reason:"whatsapp_not_configured"` ويسجّل ذلك — **لا يدّعي الموقع أي إرسال تلقائي**.

### بديل أبسط
إن تعذّر إعداد Cloud API: فعّل في Cal.com إشعارات البريد للمالك (افتراضية)، أو **Workflows → Send SMS/WhatsApp to host** إن كانت متاحة في خطتك. لا تستخدم أدوات أتمتة WhatsApp Web غير الرسمية.

## اختبار محلي للـ webhook
```bash
CAL_WEBHOOK_SECRET=testsecret npm run dev
BODY='{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"t1","startTime":"2030-01-01T09:00:00Z","responses":{"name":{"value":"اختبار"}}}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac testsecret | awk '{print $2}')
curl -X POST localhost:3000/api/cal/webhook -H "x-cal-signature-256: $SIG" --data "$BODY"
```
