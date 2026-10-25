import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cal.com signs each webhook body with HMAC-SHA256 using the secret set on the webhook,
 * hex-encoded in the `x-cal-signature-256` header.
 */
export function verifyCalSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const given = signature.trim().replace(/^sha256=/i, "");
  if (given.length !== expected.length || !/^[0-9a-f]+$/i.test(given)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(given, "hex"));
}

export type BookingStatus = "created" | "rescheduled" | "cancelled";

export type NormalizedBooking = {
  status: BookingStatus;
  bookingUid: string;
  bookingId: string;
  clientName: string;
  clientPhone: string;
  projectType: string;
  brandName: string;
  message: string;
  startTime: string;
  endTime: string;
  attendeeTimeZone: string;
  ownerTimeZone: string;
  callLink: string;
};

const STATUS_BY_TRIGGER: Record<string, BookingStatus> = {
  BOOKING_CREATED: "created",
  BOOKING_RESCHEDULED: "rescheduled",
  BOOKING_CANCELLED: "cancelled",
};

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** Strip control characters / excess whitespace and cap length — values end up in a WhatsApp template. */
export function clean(value: unknown, max = 300): string {
  if (value === null || value === undefined) return "";
  let text = typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
  if (!text && isObj(value) && "value" in value) return clean(value.value, max);
  if (!text && Array.isArray(value)) text = value.filter((v) => typeof v === "string").join("، ");
  text = text.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Read a booking-question answer by any of its possible slugs. */
function answer(responses: Json, ...slugs: string[]): string {
  for (const slug of slugs) {
    const v = responses[slug];
    const text = clean(isObj(v) && "value" in v ? v.value : v);
    if (text) return text;
  }
  return "";
}

export function normalizeCalEvent(body: unknown): NormalizedBooking | null {
  if (!isObj(body) || !isObj(body.payload)) return null;
  const status = STATUS_BY_TRIGGER[String(body.triggerEvent)];
  if (!status) return null;

  const p = body.payload;
  const responses = isObj(p.responses) ? p.responses : {};
  const attendee = Array.isArray(p.attendees) && isObj(p.attendees[0]) ? p.attendees[0] : {};
  const organizer = isObj(p.organizer) ? p.organizer : {};
  const metadata = isObj(p.metadata) ? p.metadata : {};

  const uid = clean(p.uid, 120);
  const startTime = clean(p.startTime, 40);
  if (!uid || !startTime || Number.isNaN(Date.parse(startTime))) return null;

  return {
    status,
    bookingUid: uid,
    bookingId: clean(p.bookingId, 40) || uid,
    clientName: answer(responses, "name") || clean(attendee.name, 120),
    clientPhone: answer(responses, "attendeePhoneNumber", "phone", "whatsapp") || clean(attendee.phoneNumber, 40),
    projectType: answer(responses, "projectType", "project-type", "category"),
    brandName: answer(responses, "brandName", "brand", "company"),
    message: answer(responses, "notes", "message") || clean(p.additionalNotes, 600) || clean(p.description, 600),
    startTime,
    endTime: clean(p.endTime, 40),
    attendeeTimeZone: clean(attendee.timeZone, 60),
    ownerTimeZone: clean(organizer.timeZone, 60),
    callLink: clean(metadata.videoCallUrl, 400) || (/^https?:\/\//.test(clean(p.location)) ? clean(p.location, 400) : ""),
  };
}

export function formatInZone(iso: string, timeZone: string): string {
  const zone = timeZone || "Asia/Damascus";
  try {
    const formatted = new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
      timeZone: zone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
    return `${formatted} (${zone})`;
  } catch {
    return `${iso} (UTC)`;
  }
}
