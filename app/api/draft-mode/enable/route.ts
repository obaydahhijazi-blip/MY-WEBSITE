import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client, readToken } from "@/sanity/client";

// Called by the Studio's preview ("معاينة") tool. next-sanity validates a short-lived secret
// that only signed-in Studio users can create, so visitors cannot switch on draft mode.
const handler = client && readToken ? defineEnableDraftMode({ client: client.withConfig({ token: readToken }) }) : null;

export async function GET(request: Request) {
  if (!handler) return new Response("Draft preview is not configured (SANITY_API_READ_TOKEN missing).", { status: 503 });
  return handler.GET(request);
}
