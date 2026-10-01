import { createFileRoute } from "@tanstack/react-router";
import { CampaignGroupPage } from "@/components/marketing/CampaignGroupPage";

export const Route = createFileRoute("/marketing/in-property")({
  head: () => ({
    meta: [
      { title: "In-Property Automated Transactional" },
      { name: "description", content: "Automate in-stay guest messaging: check-in details, housekeeping notices and on-property offers." },
      { property: "og:title", content: "In-Property Automated Transactional" },
      { property: "og:description", content: "Automate in-stay guest messaging: check-in details, housekeeping notices and on-property offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CampaignGroupPage group="in_property" />,
});
