import "server-only";
import { createHash } from "node:crypto";

/**
 * In-memory guards. They work on a single long-running Node server and per warm serverless
 * instance. For strict cross-instance idempotency on Vercel/serverless, back `seen` with a
 * shared store (e.g. Upstash Redis `SET key 1 NX EX 604800`) — see docs/BOOKING_AND_WHATSAPP.md.
 */
const seen = new Map<string, number>();
const SEEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function alreadyProcessed(key: string): boolean {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > SEEN_TTL_MS) seen.delete(k);
  return seen.has(key);
}

export function markProcessed(key: string) {
  seen.set(key, Date.now());
}

const hits = new Map<string, { count: number; reset: number }>();

export function rateLimited(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** Short irreversible reference for logs — never log names or phone numbers. */
export function logRef(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 10);
}
