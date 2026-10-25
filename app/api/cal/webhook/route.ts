import { NextResponse } from "next/server";
import { normalizeCalEvent, verifyCalSignature } from "@/lib/booking/cal-webhook";
import { alreadyProcessed, logRef, markProcessed, rateLimited } from "@/lib/booking/guards";
import { notifyOwner, whatsappCloudConfig } from "@/lib/booking/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ error: "rate_limited" }, 429);

  const secret = process.env.CAL_WEBHOOK_SECRET?.trim();
  if (!secret) return json({ error: "webhook_not_configured" }, 503);

  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return json({ error: "payload_too_large" }, 413);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "payload_too_large" }, 413);
  if (!verifyCalSignature(raw, req.headers.get("x-cal-signature-256"), secret)) {
    return json({ error: "invalid_signature" }, 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const trigger = typeof body === "object" && body && "triggerEvent" in body ? String(body.triggerEvent) : "";
  if (trigger === "PING") return json({ ok: true, ping: true });

  const booking = normalizeCalEvent(body);
  if (!booking) return json({ ok: true, ignored: trigger || "unknown_event" });

  const key = `${booking.status}:${booking.bookingUid}:${booking.startTime}`;
  const ref = logRef(key);
  if (alreadyProcessed(key)) {
    console.info(`[cal-webhook] duplicate ${booking.status} ref=${ref}`);
    return json({ ok: true, duplicate: true });
  }

  if (!whatsappCloudConfig().configured) {
    markProcessed(key);
    console.info(`[cal-webhook] ${booking.status} ref=${ref} — WhatsApp notification not configured`);
    return json({ ok: true, notified: false, reason: "whatsapp_not_configured" });
  }

  try {
    const result = await notifyOwner(booking);
    if (!result.ok) {
      console.error(`[cal-webhook] notify failed ref=${ref} error=${result.error}`);
      return json({ ok: false, notified: false, error: result.error }, 502);
    }
    markProcessed(key);
    console.info(`[cal-webhook] ${booking.status} ref=${ref} — owner notified`);
    return json({ ok: true, notified: true });
  } catch (err) {
    console.error(`[cal-webhook] notify error ref=${ref} ${err instanceof Error ? err.name : "unknown"}`);
    return json({ ok: false, notified: false, error: "notify_exception" }, 502);
  }
}

export function GET() {
  return json({ error: "method_not_allowed" }, 405);
}
