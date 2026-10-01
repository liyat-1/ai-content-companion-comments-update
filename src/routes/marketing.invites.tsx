import { createFileRoute } from "@tanstack/react-router";
import { CampaignGroupPage } from "@/components/marketing/CampaignGroupPage";

export const Route = createFileRoute("/marketing/invites")({
  head: () => ({
    meta: [
      { title: "Automated Invites — Guest Messaging" },
      { name: "description", content: "Configure automated review and booking invites across email and text for every guest type." },
      { property: "og:title", content: "Automated Invites — Guest Messaging" },
      { property: "og:description", content: "Configure automated review and booking invites across email and text for every guest type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CampaignGroupPage group="invites" />,
});
