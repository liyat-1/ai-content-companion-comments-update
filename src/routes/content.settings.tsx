import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/content/LibraryPages";

export const Route = createFileRoute("/content/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Directful Content Library" },
      { name: "description", content: "Brand voice and Directful AI settings for your hotel's content." },
      { property: "og:title", content: "Settings — Directful Content Library" },
      { property: "og:description", content: "Brand voice and Directful AI settings for your hotel's content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});
