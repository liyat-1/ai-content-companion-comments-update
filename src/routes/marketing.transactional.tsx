import { createFileRoute } from "@tanstack/react-router";
import { CampaignGroupPage } from "@/components/marketing/CampaignGroupPage";

export const Route = createFileRoute("/marketing/transactional")({
  head: () => ({
    meta: [
      { title: "Automated Transactional Messages" },
      { name: "description", content: "Manage booking confirmations, reminders and post-stay transactional messages sent to guests." },
      { property: "og:title", content: "Automated Transactional Messages" },
      { property: "og:description", content: "Manage booking confirmations, reminders and post-stay transactional messages sent to guests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CampaignGroupPage group="transactional" />,
});
