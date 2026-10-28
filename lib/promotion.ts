import "server-only";
import type { Promotion } from "@/components/PromotionExperience";
import { client } from "@/sanity/client";

export const DEFAULT_PROMOTION: Promotion = {
  enabled: true,
  percent: 30,
  // Fixed seven-day campaign; never restarts for repeat visitors.
  start: "2026-10-28T00:00:00+03:00",
  end: "2026-11-04T00:00:00+03:00",
  headline: "أسبوع استثنائي للإبداع",
  subtitle: "خصم 30% على خدمات التصميم والإنتاج البصري لمدة أسبوع واحد فقط.",
  cta: "اطلب عرض السعر الآن",
};

export async function getPromotion(): Promise<Promotion> {
  if (!client) return DEFAULT_PROMOTION;
  try {
    const data = await client.fetch<Partial<Promotion> | null>(
      '*[_id == "promotionSettings"][0]{enabled,percent,start,end,headline,subtitle,cta}',
      {}, { next: { revalidate: 180 } },
    );
    if (!data) return DEFAULT_PROMOTION;
    return {
      enabled: data.enabled ?? DEFAULT_PROMOTION.enabled,
      percent: typeof data.percent === "number" ? data.percent : DEFAULT_PROMOTION.percent,
      start: data.start || DEFAULT_PROMOTION.start,
      end: data.end || DEFAULT_PROMOTION.end,
      headline: data.headline || DEFAULT_PROMOTION.headline,
      subtitle: data.subtitle || DEFAULT_PROMOTION.subtitle,
      cta: data.cta || DEFAULT_PROMOTION.cta,
    };
  } catch { return DEFAULT_PROMOTION; }
}
