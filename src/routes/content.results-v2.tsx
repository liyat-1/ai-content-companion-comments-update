import { createFileRoute } from "@tanstack/react-router";
import { V2ResultsPage } from "@/components/content/v2/V2ResultsPage";

export const Route = createFileRoute("/content/results-v2")({
  head: () => ({ meta: [
    { title: "Content Results V2 — Directful" },
    { name: "description", content: "Review your guest content performance and learn from past versions." },
    { property: "og:title", content: "Content Results V2 — Directful" },
    { property: "og:description", content: "Review your guest content performance and learn from past versions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: V2ResultsPage,
});
