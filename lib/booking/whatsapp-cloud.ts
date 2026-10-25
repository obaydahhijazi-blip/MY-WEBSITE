import "server-only";
import { formatInZone, type NormalizedBooking } from "@/lib/booking/cal-webhook";

const STATUS_AR: Record<NormalizedBooking["status"], string> = {
  created: "حجز جديد مؤكد",
  rescheduled: "تم تعديل موعد الحجز",
  cancelled: "تم إلغاء الحجز",
};

export function whatsappCloudConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() ?? "";
  const ownerNumber = (process.env.WHATSAPP_OWNER_NUMBER ?? "").replace(/\D/g, "");
  return {
    phoneNumberId,
    accessToken,
    templateName,
    ownerNumber,
    language: process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "ar",
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION?.trim() || "v21.0",
    configured: Boolean(phoneNumberId && accessToken && templateName && ownerNumber),
  };
}

/** WhatsApp template parameters may not be empty nor contain newlines/tabs. */
const param = (text: string) => ({ type: "text", text: (text || "—").replace(/[\n\t]+/g, " ").slice(0, 900) });

/**
 * Template body variables (create the template in WhatsApp Manager in this exact order):
 * {{1}} status · {{2}} client name · {{3}} phone · {{4}} project type · {{5}} brand
 * {{6}} message · {{7}} date/time in owner's zone · {{8}} date/time in client's zone
 * {{9}} booking id · {{10}} call link
 */
export function templateParameters(b: NormalizedBooking) {
  return [
    STATUS_AR[b.status],
    b.clientName,
    b.clientPhone,
    b.projectType,
    b.brandName,
    b.message,
    formatInZone(b.startTime, b.ownerTimeZone),
    formatInZone(b.startTime, b.attendeeTimeZone || b.ownerTimeZone),
    b.bookingId,
    b.callLink,
  ].map(param);
}

export async function notifyOwner(b: NormalizedBooking): Promise<{ ok: boolean; status: number; error?: string }> {
  const cfg = whatsappCloudConfig();
  if (!cfg.configured) return { ok: false, status: 0, error: "not_configured" };

  const res = await fetch(`https://graph.facebook.com/${cfg.graphVersion}/${cfg.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: cfg.ownerNumber,
      type: "template",
      template: {
        name: cfg.templateName,
        language: { code: cfg.language },
        components: [{ type: "body", parameters: templateParameters(b) }],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (res.ok) return { ok: true, status: res.status };
  let error = `http_${res.status}`;
  try {
    const data = (await res.json()) as { error?: { code?: number; message?: string } };
    if (data.error?.code) error = `meta_${data.error.code}`;
  } catch {
    /* ignore non-JSON error bodies */
  }
  return { ok: false, status: res.status, error };
}
