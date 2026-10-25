"use client";

import { buildLegacyTheme, defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes, SINGLETONS } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { statsTool } from "./sanity/plugins/stats";

// Petrol / cyan Studio theme matching the site identity.
const theme = buildLegacyTheme({
  "--black": "#001E25",
  "--white": "#FAFAF8",
  "--gray": "#5a6567",
  "--gray-base": "#5a6567",
  "--component-bg": "#FAFAF8",
  "--component-text-color": "#111719",
  "--brand-primary": "#00373E",
  "--default-button-color": "#5a6567",
  "--default-button-primary-color": "#00373E",
  "--default-button-success-color": "#0f8a5f",
  "--default-button-warning-color": "#b07d00",
  "--default-button-danger-color": "#b42318",
  "--state-info-color": "#00BBD4",
  "--state-success-color": "#0f8a5f",
  "--state-warning-color": "#FFBD06",
  "--state-danger-color": "#b42318",
  "--main-navigation-color": "#001E25",
  "--main-navigation-color--inverted": "#FAFAF8",
  "--focus-color": "#00BBD4",
});

const singletons = new Set<string>(SINGLETONS);

export default defineConfig({
  name: "obaydah",
  title: "OBAYDAH HIJAZI",
  theme,
  basePath: "/admin",
  projectId: projectId || "missing-project-id",
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons can't be created again from the "new document" menu.
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
  document: {
    actions: (input, ctx) =>
      singletons.has(ctx.schemaType) ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : input,
  },
  plugins: [
    structureTool({ structure, title: "المحتوى" }),
    statsTool(),
    presentationTool({
      title: "معاينة",
      previewUrl: { origin: typeof window !== "undefined" ? window.location.origin : undefined, previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
});
