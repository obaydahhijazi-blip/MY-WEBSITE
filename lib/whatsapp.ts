/** Digits only, as required by wa.me (no "+", spaces or leading zeros). */
export const waDigits = (number: string) => number.replace(/\D/g, "");

/**
 * Builds a click-to-chat link. This only OPENS WhatsApp with a prefilled draft —
 * the visitor must press "Send" themselves. It is never an automatic message.
 */
export function whatsappLink(number: string, message?: string): string {
  const base = `https://wa.me/${waDigits(number)}`;
  const text = message?.trim();
  return text ? `${base}?text=${encodeURIComponent(text.slice(0, 1500))}` : base;
}
