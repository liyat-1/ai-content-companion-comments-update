import { createFileRoute } from "@tanstack/react-router";
import { MediaLibraryPage } from "@/components/marketing/MediaLibraryPage";

export const Route = createFileRoute("/marketing/media")({
  head: () => ({
    meta: [
      { title: "Media Library — Marketing Assets" },
      { name: "description", content: "Upload, organise and reuse images, videos and documents across your guest messaging campaigns." },
      { property: "og:title", content: "Media Library — Marketing Assets" },
      { property: "og:description", content: "Upload, organise and reuse images, videos and documents across your guest messaging campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MediaLibraryPage,
});
