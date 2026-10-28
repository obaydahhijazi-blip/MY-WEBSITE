import { NextResponse } from "next/server";

/** Minimal operational logs in hosting logs, without stack traces or user input. */
const counters = new Map<string, { n: number; until: number }>();
export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") || 0);
  if (length > 800) return new Response(null, { status: 413 });
  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const state = counters.get(ip);
  if (state && state.until > now && state.n >= 8) return new Response(null, { status: 429 });
  counters.set(ip, { n: state && state.until > now ? state.n + 1 : 1, until: state && state.until > now ? state.until : now + 60000 });
  try {
    const payload = await req.json();
    const path = typeof payload.path === "string" && payload.path.startsWith("/") ? payload.path.slice(0, 100).replace(/[^\w/\-]/g, "") : "/";
    const digest = typeof payload.digest === "string" ? payload.digest.replace(/[^\w-]/g, "").slice(0, 90) : "unknown";
    console.error("[frontend-diagnostic]", { path, digest, occurredAt: new Date().toISOString() });
    return NextResponse.json({ logged: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch { return new Response(null, { status: 400 }); }
}
