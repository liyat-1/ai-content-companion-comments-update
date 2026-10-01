import type { Segment, SegmentContent } from "@/lib/contentLibrary";

/** Sample historical copy for the demo's stronger post-checkout campaign. */
export const PAST_CAMPAIGN_COPY: Record<string, { label: string; learned: string; content: Record<Segment, Pick<SegmentContent, "email" | "text">> }> = {
  "post-checkout": {
    label: "Previous post-checkout · v2 (sample)",
    learned: "The shorter thank-you led with a warm, specific memory and gave guests one clear next step. The current message asks for feedback before offering a reason to return.",
    content: {
      direct: {
        email: { subject: "Your New York story isn't over, {first_name}", preheader: "A little thank-you from Times Square.", heading: "Come back to the city you loved", body: "Thank you for staying with us, {first_name}. The city is always finding a new way to surprise us. When you're ready for another visit, your next New York story starts right here.", cta: "Plan another stay" },
        text: "Thanks for staying with us, {first_name}. New York has more waiting for you. Come back when you're ready: {booking_link}",
      },
      ota: {
        email: { subject: "Until next time, {first_name}", preheader: "Your next New York stay starts here.", heading: "There's always more New York", body: "It was a pleasure having you with us. Next time the city calls, book directly with us for a more flexible stay and a familiar welcome.", cta: "Explore direct rates" },
        text: "Thanks for staying with us, {first_name}. Next time New York calls, book directly for a warm welcome: {booking_link}",
      },
    },
  },
};