import type {
  AudienceKey,
  EmailContent,
  MarketingCampaign,
  TextContent,
} from "@/lib/marketing";

export type CampaignHistoryVersion = {
  id: string;
  date: string;
  note: string;
  content: Record<AudienceKey, { text: TextContent; email: EmailContent }>;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function earlierText(message: string, hotelName: string) {
  const firstSentence = message.split(/(?<=[.!?])\s/)[0] ?? message;
  return `${firstSentence} We would love to welcome you back to ${hotelName}. Plan your next stay when the time is right.`;
}

function earlierEmail(email: EmailContent, hotelName: string, alternate: boolean): EmailContent {
  return {
    ...clone(email),
    subject: alternate ? `A return to ${hotelName}` : `We would love to welcome you back`,
    preheader: alternate
      ? "See what is waiting for your next stay."
      : "Plan another visit when the time is right.",
    heading: alternate ? "Come back to a place you know" : "We hope to see you again",
    body: earlierText(email.body, hotelName),
    ctaLabel: alternate ? "Explore your next stay" : "Visit our website",
  };
}

/** Demo-only revision snapshots for the editor's compare and restore workflow. */
export function campaignHistory(campaign: MarketingCampaign): CampaignHistoryVersion[] {
  const make = (
    id: string,
    date: string,
    note: string,
    alternate: boolean,
  ): CampaignHistoryVersion => ({
    id: `${campaign.id}-${id}`,
    date,
    note,
    content: {
      direct: {
        text: {
          ...clone(campaign.variants.direct.text),
          message: earlierText(campaign.variants.direct.text.message, "Holiday Inn Times Square"),
        },
        email: earlierEmail(
          campaign.variants.direct.email,
          "Holiday Inn Times Square",
          alternate,
        ),
      },
      ota: {
        text: {
          ...clone(campaign.variants.ota.text),
          message: earlierText(campaign.variants.ota.text.message, "Holiday Inn Times Square"),
        },
        email: earlierEmail(
          campaign.variants.ota.email,
          "Holiday Inn Times Square",
          alternate,
        ),
      },
    },
  });

  return [
    make("sep-04", "September 4, 2026", "Published by Maria Santos · Replaced version", false),
    make("jan-27", "January 27, 2026", "Edited by Daniel Kim", true),
    make("nov-12", "November 12, 2025", "Published by Directful", false),
  ];
}