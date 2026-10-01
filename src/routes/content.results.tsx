import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/content/ReleasePages";

export const Route = createFileRoute("/content/results")({
  head: () => ({
    meta: [
      { title: "Results — Directful Content" },
      { name: "description", content: "Results of your published guest content across properties." },
      { property: "og:title", content: "Results — Directful Content" },
      { property: "og:description", content: "Results of your published guest content across properties." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});
