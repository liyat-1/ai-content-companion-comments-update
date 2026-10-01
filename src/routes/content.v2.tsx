import { createFileRoute } from "@tanstack/react-router";
import { V2Workspace } from "@/components/content/v2/V2Workspace";

export const Route = createFileRoute("/content/v2")({
  head: () => ({
    meta: [
      { title: "Content Library V2 — Directful" },
      { name: "description", content: "A simpler content loop: refresh with AI, review, publish and track results. AI suggests — you decide." },
      { property: "og:title", content: "Content Library V2 — Directful" },
      { property: "og:description", content: "A simpler content loop: refresh with AI, review, publish and track results. AI suggests — you decide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: V2Workspace,
});
