import { createFileRoute } from "@tanstack/react-router";
import { ReleasesPage } from "@/components/content/ReleasePages";

export const Route = createFileRoute("/content/releases")({
  head: () => ({
    meta: [
      { title: "Releases — Directful Content" },
      { name: "description", content: "Releases of your published guest content across properties." },
      { property: "og:title", content: "Releases — Directful Content" },
      { property: "og:description", content: "Releases of your published guest content across properties." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReleasesPage,
});
