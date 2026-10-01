import { createFileRoute } from "@tanstack/react-router";
import { CreateWorkspace } from "@/components/content/CreateWorkspace";

export const Route = createFileRoute("/content/")({
  head: () => ({
    meta: [
      { title: "Create — Directful Content Library" },
      { name: "description", content: "Create, edit and manage the content your hotel sends to guests — yourself or with Directful AI." },
      { property: "og:title", content: "Create — Directful Content Library" },
      { property: "og:description", content: "Create, edit and manage the content your hotel sends to guests — yourself or with Directful AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateWorkspace,
});
