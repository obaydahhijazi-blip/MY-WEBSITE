import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

export const client = sanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

/** Server-only read token for draft previews. Never expose it with a NEXT_PUBLIC_ prefix. */
export const readToken = process.env.SANITY_API_READ_TOKEN || "";
