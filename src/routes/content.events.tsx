import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/components/content/EventsPage";

export const Route = createFileRoute("/content/events")({
  head: () => ({
    meta: [
      { title: "Events & Holidays — Directful Content" },
      { name: "description", content: "Manage the events, holidays and seasons Directful AI uses to plan your guest content." },
      { property: "og:title", content: "Events & Holidays — Directful Content" },
      { property: "og:description", content: "Manage the events, holidays and seasons Directful AI uses to plan your guest content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventsPage,
});
