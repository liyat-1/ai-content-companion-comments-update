import type { Copy } from "./aiWriter";

/** What Directful knows about the hotel's writing identity (demo data). */
export type ContentProfile = {
  defined: boolean;
  voice: string[];
  tone: string[];
  style: string[];
  preferences: string[];
  avoid: string[];
  assets: { label: string; ok: boolean }[];
  sources: { label: string; ok: boolean }[];
};

export const HOTEL_PROFILE: ContentProfile = {
  defined: true,
  voice: ["Warm", "Welcoming", "Refined"],
  tone: ["Friendly", "Confident", "Personal"],
  style: ["Concise", "Conversational", "Clear"],
  preferences: ["Guest-focused language", "Clear booking CTAs", "Avoid overly promotional language"],
  avoid: ["Act now", "Limited time only", "Don't miss out"],
  assets: [
    { label: "Logo", ok: true },
    { label: "Brand colors", ok: true },
    { label: "Hotel images", ok: true },
  ],
  sources: [
    { label: "Website", ok: true },
    { label: "Previous campaigns", ok: true },
    { label: "Brand guidelines", ok: false },
  ],
};

export const STARTING_VOICE = [
  { name: "Warm", text: "Friendly and welcoming without sounding overly casual." },
  { name: "Professional", text: "Clear and confident without sounding corporate." },
  { name: "Guest-focused", text: "Emphasizes the guest experience and gives guests a clear reason to return." },
];

export function profileBrief(p: ContentProfile) {
  return `Hotel content voice: ${p.voice.join(", ")}. Tone: ${p.tone.join(", ")}. Style: ${p.style.join(", ")}. Preferences: ${p.preferences.join("; ")}. Avoid phrases: ${p.avoid.join(", ")}.`;
}

export const CHECK_BRAND = "Check branding & voice";
export const ADAPT_BRAND = "Adapt to our branding & voice";

export type AssistContext = {
  campaign: string;
  audience: "Direct" | "OTA";
  copy: Copy;
  hasHistory?: boolean;
};

export function parseTitle(title: string): { campaign: string; audience: "Direct" | "OTA" } {
  return { campaign: title.split("·")[0].trim(), audience: /\bOTA\b/i.test(title) ? "OTA" : "Direct" };
}

const OFFER = /offer|%|\boff\b|discount|complimentary|credit|save|free|perk|upgrade/i;

/** Picks the most relevant presets for this campaign, guest segment, channel and content. */
export function buildPresets({ campaign, audience, copy, hasHistory }: AssistContext): string[] {
  const c = campaign.toLowerCase();
  const content = copy.kind === "email" ? Object.values(copy.email).join(" ") : copy.text.message;
  const hasOffer = OFFER.test(content);
  const recent = /after last visit|just booked|^3 months/.test(c);
  const dormant = /15|12|9 months/.test(c);
  const out: string[] = [CHECK_BRAND, ADAPT_BRAND];
  if (hasHistory) out.push("Use the stronger messaging pattern");
  if (recent) out.push("Make this feel like a welcome-back message");
  else if (dormant) out.push("Reconnect with past guests");
  else out.push("Re-engage these guests");
  if (copy.kind === "email") out.push("Improve subject & preheader");
  if (audience === "OTA") out.push("Make the direct-booking benefit clearer");
  else out.push(hasOffer ? "Make the offer clearer" : "Create a stronger reason to return");
  out.push("Strengthen the booking CTA");
  if (copy.kind === "text" && copy.text.message.length > 140) out.push("Make this more concise");
  return [...new Set(out)].slice(0, 7);
}
