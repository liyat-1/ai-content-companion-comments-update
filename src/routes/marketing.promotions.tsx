import { createFileRoute } from "@tanstack/react-router";
import { PromotionsPage } from "@/components/marketing/PromotionsPage";

export const Route = createFileRoute("/marketing/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions — Guest Messaging Offers" },
      { name: "description", content: "See every promotion, which campaigns it is attached to, and assign offers to campaigns without one." },
      { property: "og:title", content: "Promotions — Guest Messaging Offers" },
      { property: "og:description", content: "See every promotion, which campaigns it is attached to, and assign offers to campaigns without one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromotionsPage,
});
