# English version and anonymous lead analytics

## English pages

- /en — complete English visitor journey: hero, about, clients, services, design projects, video/AI, testimonials (only if approved), process, FAQ, quote request, free consultation, footer.
- /en/terms and /en/privacy — English working terms and privacy policy.
- Language switch: EN in the main Arabic header; Arabic in the English header.
- Pages use current Sanity-backed content for approved projects/client logos/testimonials. Core site copy is professionally translated and maintained in the English React components.
- Proper English route metadata, canonical links, and sitemap entries are included.
- Any client-provided project titles or testimonials without English translations are shown in their original language, not machine-translated or invented. A future Sanity bilingual-editor upgrade can make individual English project descriptions independently editable.
- Next.js site layout remains shared; the English page applies lang="en", dir="ltr" at runtime and to its page container. For SEO-critical server-rendered html[lang], a future locale-root layout refactor may be appropriate.

## Anonymous analytics

The existing Umami integration is extended. No new API key or database is required.

Events:
- portfolio_open — project id, category, gallery (design / video), language.
- portfolio_filter — category, gallery, language.
- quote_whatsapp_click — selected service and language.
- consultation_whatsapp_click — selected category and language.
- similar_project_click, calendar_open, whatsapp_click and language_switch.

Each event includes:
- source: direct, search, social, referral or a sanitized utm_source.
- medium: broad category or sanitized utm_medium.
- campaign: sanitized utm_campaign, when supplied.
- language: ar or en.

UTM attribution is stored for the current browser tab only in sessionStorage. It does not contain raw referrer URLs, names, phone numbers, email addresses, full form contents, messages or personal identifiers.
Umami provides traffic sources, browsers, device classes and pageviews from its own dashboard. A click is NOT a confirmed lead or booking.

## Setup

1. Create an Umami Cloud website for the published Netlify URL: https://cloud.umami.is/
2. Netlify → Site configuration → Environment variables:
   NEXT_PUBLIC_UMAMI_WEBSITE_ID=<real Website ID>
   NEXT_PUBLIC_UMAMI_SHARE_URL=<optional Umami share URL>
3. Redeploy your site to make the public variables available at build time.
4. Sanity /admin → Statistics: see the new referral/project/conversion guidance and shared data (if configured).
5. Umami → Events: choose portfolio_open and group/filter by project; compare quote_whatsapp_click versus consultation_whatsapp_click and similar_project_click.
6. Look at source / utm_source to identify campaigns, not individual visitors.

The share URL is intentionally view-only and may be publicly accessible if enabled; do not put admin tokens or an authenticated dashboard URL into NEXT_PUBLIC_UMAMI_SHARE_URL.

## Verification checklist

- Arabic home page, language switch EN, back link to Arabic.
- /en, /en/terms, /en/privacy return success on Netlify.
- Desktop and mobile content are LTR in English and RTL in Arabic.
- No unapproved clients, fake testimonials or fictitious portfolio work appear in production.
- Portfolio filters and previews work on both versions.
- Quote and consultation open encoded English WhatsApp drafts.
- Umami must be configured before expecting visitor counts or events.
- Keyboard, focus, reduced-motion and lightbox Escape behavior.
- On deployment, verify that the English route page source has correct hreflang and that the document language is set to en.

Neither the site nor analytics can guarantee new clients. Review visitor-to-contact actions over enough real traffic before making decisions.
