import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { client, readToken } from "@/sanity/client";
import { SITE_QUERY } from "@/sanity/queries";
import { getLocalContent } from "@/lib/cms/local";
import { mergeSanityContent } from "@/lib/cms/sanity-content";
import type { SiteContent } from "@/lib/cms/types";

/** Cache tag used by /api/revalidate when content is published in the Studio. */
export const CMS_TAG = "sanity";
export const CMS_REVALIDATE_SECONDS = 300;

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const local = getLocalContent();
  if (!client) return local;

  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {
    preview = false;
  }

  try {
    const data = preview && readToken
      ? await client
          .withConfig({ token: readToken, useCdn: false, perspective: "drafts", stega: false })
          .fetch(SITE_QUERY, {}, { cache: "no-store" })
      : await client.fetch(SITE_QUERY, {}, { next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [CMS_TAG] } });
    return mergeSanityContent(local, data as Record<string, unknown>);
  } catch (err) {
    // Never take the site down because the CMS is unreachable; serve the bundled content instead.
    console.error("[cms] Sanity fetch failed, using local content:", err instanceof Error ? err.message : err);
    return local;
  }
});
