export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** Sanity is optional: without a project id the site renders from the bundled local content. */
export const sanityConfigured = /^[a-z0-9-]+$/.test(projectId);
