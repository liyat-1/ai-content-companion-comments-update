import { useSyncExternalStore } from "react";
import heroAmalfi from "../assets/hero-amalfi.jpg";
import heroValley from "../assets/hero-valley.jpg";
import roomBalcony from "../assets/room-balcony.jpg";
import poolDusk from "../assets/pool-dusk.jpg";
import breakfastTerrace from "../assets/breakfast-terrace.jpg";
import lobbyArrival from "../assets/lobby-arrival.jpg";
import spaTreatment from "../assets/spa-treatment.jpg";
import familyPool from "../assets/family-pool.jpg";
import rooftopBar from "../assets/rooftop-bar.jpg";
import suiteDetail from "../assets/suite-detail.jpg";
import courtyard from "../assets/courtyard.jpg";
import hotelLogo from "../assets/hotel-logo.png";

/* ------------------------------------------------------------------ types */

export type Strategy = "text" | "text_email" | "text_fallback";

export const STRATEGIES: { value: Strategy; label: string; hint: string }[] = [
  { value: "text", label: "Text only", hint: "Text is the only channel used." },
  { value: "text_email", label: "Text + Email", hint: "Both text and email are sent." },
  {
    value: "text_fallback",
    label: "Text with Email fallback",
    hint: "Text is primary. Email is only used if the text cannot be delivered.",
  },
];

export const STRATEGY_LABEL: Record<Strategy, string> = {
  text: "Text only",
  text_email: "Text + Email",
  text_fallback: "Text with Email fallback",
};

export const strategyHasEmail = (s: Strategy) => s !== "text";

export type AudienceKey = "direct" | "ota";
export const AUDIENCE_LABEL: Record<AudienceKey, string> = {
  direct: "Direct guests",
  ota: "OTA guests",
};

export type EmailLayout =
  | "hero_top"
  | "text_only"
  | "split"
  | "full_bleed"
  | "gallery_two"
  | "gallery_three"
  | "image_left"
  | "image_right"
  | "headline_first"
  | "cta_focus";

export const LAYOUT_PRESETS: {
  value: EmailLayout;
  label: string;
  desc: string;
  photo: string;
}[] = [
  {
    value: "hero_top",
    label: "Hero on top",
    desc: "Large image, then heading, copy and button.",
    photo: poolDusk,
  },
  {
    value: "text_only",
    label: "Text only",
    desc: "Copy first, no imagery. Best for short notices.",
    photo: suiteDetail,
  },
  {
    value: "split",
    label: "Split",
    desc: "Image beside the copy, button underneath.",
    photo: breakfastTerrace,
  },
  {
    value: "full_bleed",
    label: "Full bleed offer",
    desc: "Centred offer over a full-width photograph.",
    photo: rooftopBar,
  },
  {
    value: "gallery_two",
    label: "Two images below",
    desc: "Heading and copy, then two images side by side above the button.",
    photo: familyPool,
  },
  {
    value: "gallery_three",
    label: "Three card strip",
    desc: "Hero, copy, then a three card strip of highlights.",
    photo: courtyard,
  },
  { value: "image_left", label: "Image left", desc: "Image column left, existing copy and action right.", photo: roomBalcony },
  { value: "image_right", label: "Image right", desc: "Existing copy left with the image anchored right.", photo: spaTreatment },
  { value: "headline_first", label: "Headline first", desc: "Heading and copy lead before the existing image and action.", photo: lobbyArrival },
  { value: "cta_focus", label: "Action focus", desc: "A compact structure that gives the existing action more emphasis.", photo: poolDusk },
];

export const LAYOUT_LABEL = (v: EmailLayout) =>
  LAYOUT_PRESETS.find((l) => l.value === v)?.label ?? "Hero on top";

const LEGACY_LAYOUT: Record<string, EmailLayout> = {
  image_first: "hero_top",
  text_first: "text_only",
  full_width: "full_bleed",
  split: "split",
};
export const normalizeLayout = (v: string): EmailLayout =>
  (LAYOUT_PRESETS.some((l) => l.value === v) ? (v as EmailLayout) : LEGACY_LAYOUT[v]) ?? "hero_top";

export type MediaType = "image" | "video" | "document";

export type MediaItem = {
  id: string;
  name: string;
  type: MediaType;
  folder: string;
  size: string;
  dims?: string;
  url?: string;
  /** Still frame shown in place of a video, so the grid reads like a real library. */
  poster?: string;
  addedAt: number;
};

export type EmailTemplate = {
  id: string;
  name: string;
  desc: string;
  category: string;
  accent: string;
  /** Cover photograph shown on the template card and used behind the preview. */
  hero: string;
  heading: string;
  body: string;
  ctaLabel: string;
  layout: EmailLayout;
  layouts: EmailLayout[];
};

export type TextContent = { message: string; mediaIds: string[] };
export type EmailContent = {
  templateId: string;
  layout: EmailLayout;
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  mediaIds: string[];
};

/** Who touched a variant last, so the UI can show a small edit log. */
export type EditStamp = { by: string; at: number };

export type Variant = {
  customized: boolean;
  customization: { text: boolean; email: boolean };
  editedBy?: EditStamp;
  promotionMode: "inherit" | "none" | "custom";
  promotionId: string | null;
  text: TextContent;
  email: EmailContent;
};

export type CampaignGroup = "invites" | "transactional" | "in_property";

export type MarketingCampaign = {
  id: string;
  name: string;
  timing: string;
  purpose: string;
  group: CampaignGroup;
  enabled: boolean;
  strategy: Strategy;
  /** Legacy campaign-wide values retained only for saved-state migration. */
  promotionMode?: "inherit" | "none" | "custom";
  promotionId?: string | null;
  variants: Record<AudienceKey, Variant>;
};

export type Promotion = {
  id: string;
  name: string;
  detail: string;
  code: string;
  /** What the code represents: a promo code, a rate code or a corporate ID. */
  codeType?: "promo" | "rate" | "corporate";
  /** Percentage taken off the rate. */
  discountPercent?: number;
  /** Minimum nights the guest must stay for the offer to apply. */
  minNights?: number;
  /** Short line shown on the offer banner. */
  tagline?: string;
  /** ISO dates. When absent the offer runs with no end date. */
  startsAt?: string;
  endsAt?: string;
  /** How many days the offer stays valid for a guest once they receive it. */
  durationDays?: number;
  /** Chosen banner colour/style id. Falls back to a deterministic tint. */
  bannerStyle?: string;
  /** Chosen banner layout template. */
  bannerTemplate?: string;
  /** Small kicker line above the banner headline, e.g. "YOU UNLOCKED". */
  kicker?: string;
  /** Property name shown on the banner. */
  propertyName?: string;
  /** Media item used as the banner logo. */
  logoId?: string;
  /** Media item used as the banner background photo. */
  bannerImageId?: string;
  /** Last person to update this offer. */
  updatedBy?: EditStamp;
};

/** Colour and style choices for the guest-facing offer banner. */
export const BANNER_THEMES = [
  { id: "midnight", label: "Midnight blue", gradient: "from-[#1b3a6b] to-[#2f6fb5]", swatch: "#1b3a6b", ribbon: "bg-[#0f2c56]" },
  { id: "rose", label: "Rose", gradient: "from-[#a8175e] to-[#d44c93]", swatch: "#c01f6f", ribbon: "bg-[#8c0f4c]" },
  { id: "emerald", label: "Emerald", gradient: "from-[#0f4f46] to-[#23897a]", swatch: "#14655a", ribbon: "bg-[#0a3c35]" },
  { id: "plum", label: "Plum", gradient: "from-[#5b2a83] to-[#8f5bc4]", swatch: "#6c33a0", ribbon: "bg-[#421c62]" },
  { id: "amber", label: "Amber", gradient: "from-[#7a3410] to-[#c4712c]", swatch: "#9b4b17", ribbon: "bg-[#5c250a]" },
  { id: "slate", label: "Graphite", gradient: "from-[#1f2430] to-[#4b5566]", swatch: "#2b3140", ribbon: "bg-[#141821]" },
  { id: "teal", label: "Lagoon", gradient: "from-[#0b4a63] to-[#1f8fae]", swatch: "#0e5f7e", ribbon: "bg-[#073547]" },
  { id: "sunset", label: "Sunset", gradient: "from-[#8a1f3d] to-[#e0673f]", swatch: "#b23a42", ribbon: "bg-[#68152c]" },
] as const;

export type BannerTheme = (typeof BANNER_THEMES)[number];

/** Layout templates for the guest-facing offer banner. */
export const BANNER_TEMPLATES = [
  { id: "ribbon", label: "Ribbon", desc: "Personal sticker with a tilted headline ribbon." },
  { id: "ticket", label: "Ticket", desc: "Ticket stub with a perforated code section." },
  { id: "spotlight", label: "Spotlight", desc: "Photo backdrop with a glowing centred headline." },
  { id: "frame", label: "Frame", desc: "Classic certificate frame with a logo crest." },
  { id: "minimal", label: "Minimal", desc: "Oversized discount figure with clean typography." },
  { id: "split", label: "Split", desc: "Modern image panel paired with crisp offer details." },
  { id: "editorial", label: "Editorial", desc: "Bold magazine typography with refined spacing." },
  { id: "badge", label: "Badge", desc: "A confident central offer badge over rich imagery." },
  { id: "upgrade", label: "Upgrade card", desc: "Image-led room upgrade with a clear comparison panel." },
  { id: "schedule", label: "Schedule card", desc: "Arrival or departure offer with a visual time window." },
  { id: "included", label: "Included perks", desc: "Photo-led package with concise included benefits." },
] as const;

export type BannerTemplateId = (typeof BANNER_TEMPLATES)[number]["id"];

/** Resolves a promotion's banner template, defaulting to the ribbon layout. */
export function bannerTemplateOf(p: Pick<Promotion, "bannerTemplate">): BannerTemplateId {
  const found = BANNER_TEMPLATES.find((t) => t.id === p.bannerTemplate);
  return (found?.id ?? "ribbon") as BannerTemplateId;
}

export const CODE_TYPE_LABEL: Record<NonNullable<Promotion["codeType"]>, string> = {
  promo: "Promo code",
  rate: "Rate code",
  corporate: "Corporate ID",
};

/** How long the offer lasts once a guest receives it. */
export function promotionDuration(p: Promotion): string {
  if (p.durationDays) return `Lasts ${p.durationDays} day${p.durationDays === 1 ? "" : "s"} per guest`;
  return "Lasts as long as the offer runs";
}

/** Plain-language validity line for a promotion. */
export function promotionValidity(p: Promotion): string {
  const fmt = (v?: string) =>
    v ? new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
  const duration = p.durationDays ? ` · ${p.durationDays} day${p.durationDays === 1 ? "" : "s"} per guest` : "";
  if (!p.startsAt && !p.endsAt) return `No end date${duration}`;
  if (p.startsAt && p.endsAt) {
    const days = Math.max(1, Math.round((new Date(p.endsAt).getTime() - new Date(p.startsAt).getTime()) / 86400000));
    return `${fmt(p.startsAt)} – ${fmt(p.endsAt)} · runs ${days} day${days === 1 ? "" : "s"}${duration}`;
  }
  if (p.endsAt) return `Ends ${fmt(p.endsAt)}${duration}`;
  return `Starts ${fmt(p.startsAt)}${duration}`;
}

/** True when the promotion has already expired. */
export function promotionExpired(p: Promotion): boolean {
  return Boolean(p.endsAt && new Date(p.endsAt).getTime() < Date.now());
}


export type MarketingState = {
  campaigns: MarketingCampaign[];
  media: MediaItem[];
  folders: string[];
  templates: EmailTemplate[];
  promotions: Promotion[];
  globalPromotions: Record<AudienceKey, string | null>;
};

/* ------------------------------------------------------------------- seed */

export const MERGE_TAGS = [
  { token: "{{first_name}}", label: "firstName", tone: "indigo", chip: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { token: "{{hotel_name}}", label: "hotelName", tone: "sky", chip: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
  { token: "{{checkin_date}}", label: "checkInDate", tone: "amber", chip: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  { token: "{{checkout_date}}", label: "checkOutDate", tone: "emerald", chip: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  { token: "{{booking_link}}", label: "bookingLink", tone: "violet", chip: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
];

const TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome to Your Stay",
    desc: "A warm welcome message for newly booked guests.",
    category: "Welcome",
    accent: "#2563eb",
    hero: roomBalcony,
    heading: "Welcome to {{hotel_name}}",
    body: "Your reservation is confirmed. We are already getting everything ready for your arrival on {{checkin_date}}.",
    ctaLabel: "View your booking",
    layout: "hero_top",
    layouts: ["hero_top", "split", "gallery_two"],
  },
  {
    id: "soon",
    name: "Your Stay Starts Soon",
    desc: "Pre-arrival reminder with check-in details.",
    category: "Pre-arrival",
    accent: "#0f766e",
    hero: courtyard,
    heading: "Your stay starts soon",
    body: "Check-in opens at 3pm on {{checkin_date}}. Tell us your arrival time and we will have your room ready.",
    ctaLabel: "Plan my arrival",
    layout: "text_only",
    layouts: ["text_only", "hero_top", "split"],
  },
  {
    id: "enhance",
    name: "Enhance Your Stay",
    desc: "Upsell rooms, dining and spa during the stay.",
    category: "During stay",
    accent: "#9333ea",
    hero: spaTreatment,
    heading: "Make it a little more special",
    body: "Late checkout, breakfast in bed or a spa hour — add anything to your room in a couple of taps.",
    ctaLabel: "Browse extras",
    layout: "split",
    layouts: ["split", "gallery_two", "gallery_three"],
  },
  {
    id: "thanks",
    name: "Thanks for Staying With Us",
    desc: "Post-stay thank you with a direct booking incentive.",
    category: "Post-stay",
    accent: "#b45309",
    hero: suiteDetail,
    heading: "Thanks for staying with us",
    body: "It was a pleasure hosting you. Book direct next time and enjoy 15% off plus free late checkout.",
    ctaLabel: "Book your next stay",
    layout: "hero_top",
    layouts: ["hero_top", "text_only", "gallery_two"],
  },
  {
    id: "offer",
    name: "Members Only Offer",
    desc: "Promotional layout built around one strong offer.",
    category: "Promotional",
    accent: "#be123c",
    hero: rooftopBar,
    heading: "15% off, just for you",
    body: "Your private rate is live for the next 14 days. Direct bookings only — no fees, free cancellation.",
    ctaLabel: "Claim my rate",
    layout: "gallery_two",
    layouts: ["gallery_two", "full_bleed", "gallery_three"],
  },
  {
    id: "review",
    name: "How Did We Do?",
    desc: "Short review request with a single clear action.",
    category: "Review",
    accent: "#111827",
    hero: lobbyArrival,
    heading: "How did we do, {{first_name}}?",
    body: "A short word about your stay helps us get better and helps other guests choose well.",
    ctaLabel: "Leave a review",
    layout: "text_only",
    layouts: ["text_only", "hero_top", "split"],
  },
  {
    id: "city-guide",
    name: "A Local Welcome",
    desc: "A visual city guide for guests preparing to arrive.",
    category: "Pre-arrival",
    accent: "#0369a1",
    hero: heroValley,
    heading: "Your local guide is ready",
    body: "Discover our favourite places to eat, wander and unwind before your stay begins.",
    ctaLabel: "Explore the guide",
    layout: "image_left",
    layouts: ["image_left", "image_right", "hero_top", "headline_first"],
  },
  {
    id: "dining",
    name: "Dinner on the Terrace",
    desc: "A refined dining invitation with one clear reservation action.",
    category: "During stay",
    accent: "#0f766e",
    hero: breakfastTerrace,
    heading: "A table is waiting",
    body: "Join us on the terrace tonight for seasonal plates, local wines and a view worth lingering over.",
    ctaLabel: "Reserve a table",
    layout: "image_right",
    layouts: ["image_right", "split", "cta_focus", "full_bleed"],
  },
  {
    id: "weekend-return",
    name: "Your Next Weekend Away",
    desc: "A calm return-stay invitation for past guests.",
    category: "Promotional",
    accent: "#1d4ed8",
    hero: heroAmalfi,
    heading: "Come back for the weekend",
    body: "Your preferred guest rate includes breakfast and a later checkout when you book direct.",
    ctaLabel: "See available dates",
    layout: "headline_first",
    layouts: ["headline_first", "hero_top", "cta_focus", "gallery_two"],
  },
];

export const FOLDERS = [
  "Logos",
  "Just booked",
  "Before arrival",
  "During stay",
  "Post-checkout",
  "Promotions",
  "Hotel information",
];

const DAY = 86_400_000;

const MEDIA: MediaItem[] = [
  { id: "m0", name: "Hotel-emblem.png", type: "image", folder: "Logos", size: "48 KB", dims: "512 × 512", url: hotelLogo, addedAt: Date.now() - 21 * DAY },
  { id: "m1", name: "Pool.jpg", type: "image", folder: "Hotel information", size: "1.2 MB", dims: "1600 × 1067", url: heroAmalfi, addedAt: Date.now() - 3600_000 },
  { id: "m2", name: "Lobby.jpg", type: "image", folder: "Hotel information", size: "980 KB", dims: "1440 × 960", url: heroValley, addedAt: Date.now() - 7200_000 },
  { id: "m3", name: "Suite-terrace.jpg", type: "image", folder: "Promotions", size: "1.6 MB", dims: "2000 × 1333", url: heroAmalfi, addedAt: Date.now() - DAY },
  { id: "m4", name: "Welcome.mp4", type: "video", folder: "Just booked", size: "4.8 MB", poster: familyPool, addedAt: Date.now() - 2 * DAY },
  { id: "m5", name: "Arrival-guide.pdf", type: "document", folder: "Before arrival", size: "320 KB", addedAt: Date.now() - 3 * DAY },
  { id: "m6", name: "Spa-menu.pdf", type: "document", folder: "During stay", size: "410 KB", addedAt: Date.now() - 4 * DAY },
  { id: "m7", name: "Breakfast.jpg", type: "image", folder: "During stay", size: "870 KB", dims: "1280 × 853", url: breakfastTerrace, addedAt: Date.now() - 5 * DAY },
  { id: "m8", name: "Direct-offer.jpg", type: "image", folder: "Promotions", size: "1.1 MB", dims: "1600 × 900", url: rooftopBar, addedAt: Date.now() - 6 * DAY },
  { id: "m9", name: "Deluxe-sea-room.jpg", type: "image", folder: "Hotel information", size: "1.4 MB", dims: "1600 × 1200", url: roomBalcony, addedAt: Date.now() - 7 * DAY },
  { id: "m10", name: "Infinity-pool-dusk.jpg", type: "image", folder: "Promotions", size: "1.9 MB", dims: "1600 × 1200", url: poolDusk, addedAt: Date.now() - 8 * DAY },
  { id: "m11", name: "Front-desk.jpg", type: "image", folder: "Just booked", size: "1.1 MB", dims: "1600 × 1200", url: lobbyArrival, addedAt: Date.now() - 9 * DAY },
  { id: "m12", name: "Spa-treatment.jpg", type: "image", folder: "During stay", size: "960 KB", dims: "1600 × 1200", url: spaTreatment, addedAt: Date.now() - 10 * DAY },
  { id: "m13", name: "Family-pool.jpg", type: "image", folder: "Promotions", size: "1.3 MB", dims: "1600 × 1200", url: familyPool, addedAt: Date.now() - 11 * DAY },
  { id: "m14", name: "Courtyard.jpg", type: "image", folder: "Before arrival", size: "1.5 MB", dims: "1600 × 1200", url: courtyard, addedAt: Date.now() - 12 * DAY },
  { id: "m15", name: "Bed-detail.jpg", type: "image", folder: "Hotel information", size: "880 KB", dims: "1600 × 1200", url: suiteDetail, addedAt: Date.now() - 13 * DAY },
  { id: "m16", name: "Terrace-welcome.mp4", type: "video", folder: "Before arrival", size: "6.2 MB", poster: rooftopBar, addedAt: Date.now() - 14 * DAY },
  { id: "m17", name: "House-rules.pdf", type: "document", folder: "Post-checkout", size: "240 KB", addedAt: Date.now() - 15 * DAY },
  { id: "m18", name: "Wi-Fi-card.pdf", type: "document", folder: "Hotel information", size: "120 KB", addedAt: Date.now() - 16 * DAY },
  { id: "m19", name: "Wedding-packages.pptx", type: "document", folder: "Promotions", size: "2.8 MB", addedAt: Date.now() - 17 * DAY },
  { id: "m20", name: "Seasonal-rates.xlsx", type: "document", folder: "Promotions", size: "186 KB", addedAt: Date.now() - 18 * DAY },
  { id: "m21", name: "Guest-arrivals.csv", type: "document", folder: "Before arrival", size: "84 KB", addedAt: Date.now() - 19 * DAY },
  { id: "m22", name: "Conference-guide.docx", type: "document", folder: "Hotel information", size: "540 KB", addedAt: Date.now() - 20 * DAY },
];

type Seed = {
  id: string;
  name: string;
  timing: string;
  purpose: string;
  group: CampaignGroup;
  template: string;
  direct: string;
  ota: string;
  strategy?: Strategy;
  customized?: AudienceKey[];
};

const SEEDS: Seed[] = [
  { id: "just-booked", name: "Just booked", timing: "Immediately after booking", purpose: "Welcome guests, reassure them, and share useful reservation next steps.", group: "invites", template: "welcome", strategy: "text_email", customized: ["direct"], direct: "Hi {{first_name}}, thanks for booking directly with {{hotel_name}}. Your best rate is locked in — see you on {{checkin_date}}.", ota: "Hi {{first_name}}, your reservation at {{hotel_name}} is confirmed for {{checkin_date}}. We are looking forward to welcoming you." },
  { id: "before-arrival", name: "Before arrival", timing: "1 day before check-in", purpose: "Help guests prepare with arrival details, services, and relevant offers.", group: "invites", template: "soon", strategy: "text_email", direct: "Hi {{first_name}}, your stay at {{hotel_name}} starts tomorrow. Reply with your arrival time and we will have everything ready.", ota: "Hi {{first_name}}, check-in at {{hotel_name}} opens tomorrow at 3pm. Anything we can prepare for you?" },
  { id: "during-stay", name: "During stay", timing: "Morning after check-in", purpose: "Connect guests with amenities, dining, services, and experiences.", group: "invites", template: "enhance", direct: "Good morning {{first_name}} — breakfast runs until 10:30 and late checkout is on us if you would like it.", ota: "Good morning {{first_name}} — breakfast runs until 10:30. Ask us anything, we are one text away." },
  { id: "post-checkout", name: "Post-checkout", timing: "1 day after checkout", purpose: "Thank guests, invite feedback, and keep the relationship warm.", group: "invites", template: "thanks", strategy: "text_fallback", customized: ["ota"], direct: "Thanks for staying with us, {{first_name}}. Your direct guest rate is waiting whenever you are: {{booking_link}}", ota: "Thanks for staying with us, {{first_name}}. Book direct next time for 15% off: {{booking_link}}" },
  { id: "after-last-visit", name: "After last visit", timing: "15 days – 3 months since last visit", purpose: "Reconnect while the stay is still recent and encourage a return.", group: "invites", template: "offer", direct: "Hi {{first_name}}, it has been a while. Your direct rate at {{hotel_name}} is still the best one going.", ota: "Hi {{first_name}}, ready for another stay at {{hotel_name}}? Book direct and skip the fees." },
  { id: "lost-3", name: "Lost 3 months", timing: "3 months since guest's last stay", purpose: "A timely reminder of the experience and benefits of returning direct.", group: "invites", template: "offer", direct: "Three months already, {{first_name}}. Here is 10% off your next direct booking.", ota: "Three months already, {{first_name}}. Here is 10% off when you book with us directly." },
  { id: "lost-6", name: "Lost 6 months", timing: "6 months since guest's last stay", purpose: "Re-engage with a meaningful reason to plan another stay.", group: "invites", template: "offer", direct: "We miss you, {{first_name}}. 12% off your next stay at {{hotel_name}}.", ota: "We miss you, {{first_name}}. 12% off when you book direct at {{hotel_name}}." },
  { id: "lost-9", name: "Lost 9 months", timing: "9 months since guest's last stay", purpose: "Bring the property back to mind with a stronger return invitation.", group: "invites", template: "offer", direct: "{{first_name}}, your room is still here. 15% off direct bookings this month.", ota: "{{first_name}}, come back to {{hotel_name}} — 15% off direct bookings this month." },
  { id: "lost-12", name: "Lost 12 months", timing: "12 months since guest's last stay", purpose: "Mark the anniversary with a warm, personal invitation to return.", group: "invites", template: "offer", direct: "A year since your last stay, {{first_name}}. Let's fix that — 15% off direct.", ota: "A year since your last stay, {{first_name}}. Book direct and save 15%." },
  { id: "lost-15", name: "Lost 15 months", timing: "15 months since guest's last stay", purpose: "Win back lapsed guests with the property's strongest direct value.", group: "invites", template: "offer", direct: "{{first_name}}, here is our best direct offer of the year.", ota: "{{first_name}}, here is our best direct offer of the year." },
  { id: "lost-15-plus", name: "Lost 15 months plus", timing: "More than 15 months since last stay", purpose: "Reintroduce the hotel and make returning feel especially worthwhile.", group: "invites", template: "offer", direct: "It has been a long time, {{first_name}}. 20% off to welcome you back.", ota: "It has been a long time, {{first_name}}. 20% off to welcome you back." },

  { id: "cancelled", name: "Cancelled", timing: "When a guest cancels their booking", purpose: "Acknowledge the change of plans and leave the door open to rebook.", group: "transactional", template: "thanks", strategy: "text", direct: "Sorry to see the change of plans, {{first_name}}. Your direct rate will be here when you rebook.", ota: "Sorry to see the change of plans, {{first_name}}. We hope to host you another time." },
  { id: "no-show", name: "No show", timing: "When a guest doesn't show up", purpose: "Check in sensitively after a missed arrival without forcing an offer.", group: "transactional", template: "thanks", strategy: "text", direct: "We missed you, {{first_name}}. Let us know if you would like to rebook.", ota: "We missed you, {{first_name}}. Let us know if you would like to rebook." },
  { id: "review", name: "Review", timing: "After the stay, review request", purpose: "Thank guests and ask for concise, useful feedback about their stay.", group: "transactional", template: "review", strategy: "text_email", direct: "How was your stay at {{hotel_name}}, {{first_name}}? A quick word means a lot.", ota: "How was your stay at {{hotel_name}}, {{first_name}}? A quick word means a lot." },

  { id: "day-before-checkin", name: "Day before check-in", timing: "Stay reminder for booked guests", purpose: "Share timely arrival details and reduce uncertainty before check-in.", group: "in_property", template: "soon", strategy: "text", direct: "See you tomorrow, {{first_name}}. Check-in from 3pm at {{hotel_name}}.", ota: "See you tomorrow, {{first_name}}. Check-in from 3pm at {{hotel_name}}." },
  { id: "after-checkin", name: "After check-in", timing: "Welcome message after check-in", purpose: "Welcome guests on property and make help easy to access.", group: "in_property", template: "welcome", strategy: "text", direct: "Welcome in, {{first_name}}. Anything you need, just reply to this message.", ota: "Welcome in, {{first_name}}. Anything you need, just reply to this message." },
];

const PROMOTIONS: Promotion[] = [
  { id: "dining-10", name: "10% off dining", detail: "Save 10% on dinner at the hotel restaurant during this stay.", code: "DINE10", codeType: "promo", discountPercent: 10, tagline: "🍽️ 10% off dinner", bannerStyle: "amber" },
  { id: "return-15", name: "15% off next stay", detail: "A direct-booking incentive for a future visit.", code: "RETURN15", codeType: "promo", discountPercent: 15, tagline: "The best rate", bannerStyle: "midnight" },
  { id: "return-20", name: "20% off next stay", detail: "A stronger win-back offer for lapsed guests.", code: "WELCOME20", codeType: "promo", discountPercent: 20, tagline: "🎁 20% off, just for you", bannerStyle: "rose" },
  { id: "spa-15", name: "15% off spa", detail: "Save on one spa treatment booked during the stay.", code: "SPA15", codeType: "promo", discountPercent: 15, tagline: "💆 Unwind for less", bannerStyle: "emerald" },
  { id: "late-checkout", name: "Complimentary late checkout", detail: "Extend checkout to 2pm, subject to availability.", code: "STAYLATE", codeType: "promo", tagline: "⏰ Stay in bed until 2pm", bannerStyle: "plum" },
  { id: "breakfast-free", name: "Breakfast included", detail: "Breakfast for two added to every direct booking.", code: "WAKEUP", codeType: "rate", tagline: "☕ Breakfast is on us", bannerStyle: "sunset" },
  { id: "third-night", name: "Third night free", detail: "Book three nights and only pay for two.", code: "STAY3PAY2", codeType: "rate", minNights: 3, tagline: "🌙 Third night free", bannerStyle: "slate" },
  { id: "weekend-12", name: "12% off weekends", detail: "Friday and Saturday stays booked direct.", code: "WEEKEND12", codeType: "promo", discountPercent: 12, minNights: 2, tagline: "🥂 Weekends for less", bannerStyle: "teal" },
  { id: "early-bird-18", name: "Early bird 18% off", detail: "For guests booking more than 60 days ahead.", code: "EARLY18", codeType: "rate", discountPercent: 18, tagline: "🐦 Book early, save more", bannerStyle: "midnight" },
  { id: "corporate-10", name: "Corporate rate", detail: "Negotiated rate for business travellers.", code: "CORP-4471", codeType: "corporate", discountPercent: 10, tagline: "💼 Your company rate", bannerStyle: "slate" },
  { id: "room-upgrade", name: "Free room upgrade", detail: "Next category up, subject to availability at check-in.", code: "UPGRADEME", codeType: "promo", tagline: "🛏️ A bigger room, same price", bannerStyle: "plum" },
  { id: "parking-free", name: "Free parking", detail: "On-site parking included for the whole stay.", code: "PARKFREE", codeType: "promo", tagline: "🚗 Parking included", bannerStyle: "slate" },
  { id: "family-kids-stay", name: "Kids stay free", detail: "Up to two children in the same room at no extra cost.", code: "FAMILY0", codeType: "rate", tagline: "👨‍👩‍👧 Kids stay free", bannerStyle: "teal" },
  { id: "longstay-25", name: "25% off long stays", detail: "Five nights or more, booked direct.", code: "LONG25", codeType: "rate", discountPercent: 25, minNights: 5, tagline: "🧳 Stay longer, save more", bannerStyle: "emerald" },
  { id: "welcome-drink", name: "Welcome drink", detail: "A drink at the bar on arrival for every guest.", code: "CHEERS", codeType: "promo", tagline: "🍸 First drink is ours", bannerStyle: "sunset" },
];

function variantFrom(seed: Seed, key: AudienceKey): Variant {
  const t = TEMPLATES.find((x) => x.id === seed.template) ?? TEMPLATES[0];
  return {
    customized: seed.customized?.includes(key) ?? false,
    customization: {
      text: seed.customized?.includes(key) ?? false,
      email: seed.customized?.includes(key) ?? false,
    },
    editedBy: seed.customized?.includes(key) ? { by: "Sevket Yilmaz", at: Date.now() - DAY * 2 } : undefined,
    promotionMode: seed.id === "no-show" ? "none" : "inherit",
    promotionId: null,
    text: { message: key === "direct" ? seed.direct : seed.ota, mediaIds: [] },
    email: {
      templateId: t.id,
      layout: t.layout,
      subject: t.heading,
      preheader: "We're looking forward to welcoming you",
      heading: t.heading,
      body: t.body,
      ctaLabel: t.ctaLabel,
      ctaUrl: "https://directful.com/book",
      mediaIds: [],
    },
  };
}

function seedState(): MarketingState {
  return {
    campaigns: SEEDS.map((s, i) => ({
      id: s.id,
      name: s.name,
      timing: s.timing,
      purpose: s.purpose,
      group: s.group,
      enabled: i % 5 !== 4,
      strategy: s.strategy ?? "text",
      promotionMode: s.id === "no-show" ? "none" : "inherit",
      promotionId: null,
      variants: { direct: variantFrom(s, "direct"), ota: variantFrom(s, "ota") },
    })),
    media: MEDIA,
    folders: FOLDERS,
    templates: TEMPLATES,
    promotions: PROMOTIONS,
    globalPromotions: { direct: "dining-10", ota: null },
  };
}

/* ------------------------------------------------------------------ store */

const KEY = "directful.marketing.v2";
let state: MarketingState = seedState();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Brings campaigns saved by older versions up to the current shape. */
function migrateCampaign(c: MarketingCampaign): MarketingCampaign {
  const fix = (v: Variant): Variant => {
    const legacy = v as unknown as { text: { mediaId?: string | null } };
    return {
      ...v,
      customized: v.customized ?? false,
      customization: v.customization ?? { text: v.customized ?? false, email: v.customized ?? false },
      promotionMode: v.promotionMode ?? c.promotionMode ?? (c.id === "no-show" ? "none" : "inherit"),
      promotionId: v.promotionId ?? c.promotionId ?? null,
      text: {
        message: v.text?.message ?? "",
        mediaIds: v.text?.mediaIds ?? (legacy.text?.mediaId ? [legacy.text.mediaId] : []),
      },
      email: {
        ...v.email,
        layout: normalizeLayout(String(v.email?.layout ?? "hero_top")),
        mediaIds: v.email?.mediaIds ?? [],
      },
    };
  };
  const seed = SEEDS.find((s) => s.id === c.id);
  return {
    ...c,
    purpose: c.purpose ?? seed?.purpose ?? "Keep guests informed at the right moment in their journey.",
    variants: { direct: fix(c.variants.direct), ota: fix(c.variants.ota) },
  };
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MarketingState;
        if (parsed?.campaigns?.length) {
          // media urls come from bundled assets; always take the fresh ones
          state = {
            ...parsed,
            campaigns: parsed.campaigns.map(migrateCampaign),
            media: parsed.media?.length ? parsed.media : MEDIA,
            templates: TEMPLATES,
            // keep saved offers, and add any starter offers added since
            promotions: parsed.promotions?.length
              ? [
                  ...parsed.promotions.map((promotion) => promotion.id === "dining-10" && promotion.tagline === "🍽️ Dinner on a better rate"
                    ? { ...promotion, detail: "Save 10% on dinner at the hotel restaurant during this stay.", tagline: "🍽️ 10% off dinner" }
                    : promotion),
                  ...PROMOTIONS.filter((seed) => !parsed.promotions.some((p) => p.id === seed.id)),
                ]
              : PROMOTIONS,
            globalPromotions: parsed.globalPromotions ?? { direct: "dining-10", ota: null },
          };
          emit();
        }
      }
    } catch {
      /* ignore */
    }
  };
  // Load saved changes only after the first client render has committed, so
  // hydration always matches the server-rendered seed state.
  setTimeout(load, 0);
}

export function useMarketing(): MarketingState {
  hydrate();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function mutate(fn: (draft: MarketingState) => void) {
  const next = JSON.parse(JSON.stringify(state)) as MarketingState;
  // assets are not serialisable-safe round trip for bundled urls, but they are
  // plain strings, so the clone is fine.
  fn(next);
  state = next;
  persist();
  emit();
}

/* ------------------------------------------------------------------ utils */

export const uid = () => Math.random().toString(36).slice(2, 9);

export function defaultVariant(campaignId: string, key: AudienceKey): Variant {
  const seed = SEEDS.find((s) => s.id === campaignId);
  if (!seed) throw new Error("unknown campaign");
  const v = variantFrom(seed, key);
  v.customized = false;
  return v;
}

export function customizedCount(c: MarketingCampaign) {
  return (["direct", "ota"] as AudienceKey[]).reduce(
    (total, key) => total + Number(c.variants[key].customization.text) + Number(c.variants[key].customization.email),
    0,
  );
}

export function effectivePromotion(state: MarketingState, campaign: MarketingCampaign, audience: AudienceKey) {
  const variant = campaign.variants[audience];
  const id = variant.promotionMode === "custom"
    ? variant.promotionId
    : variant.promotionMode === "none"
      ? null
      : state.globalPromotions[audience];
  return state.promotions.find((promotion) => promotion.id === id) ?? null;
}

export function renderPreview(input: string) {
  const values: Record<string, string> = {
    "{{first_name}}": "Sevket",
    "{{hotel_name}}": "Holiday Inn Times Square",
    "{{checkin_date}}": "March 12",
    "{{checkout_date}}": "March 15",
    "{{booking_link}}": "directful.com/book",
  };
  return input.replace(/\{\{[a-z_]+\}\}/g, (m) => values[m] ?? m);
}

export const GROUP_META: Record<CampaignGroup, { title: string; desc: string }> = {
  invites: {
    title: "Automated Invites",
    desc: "Manage automated guest messages across the guest journey.",
  },
  transactional: {
    title: "Automated Transactional",
    desc: "Messages triggered by a change to the booking itself.",
  },
  in_property: {
    title: "In-Property Automated Transactional",
    desc: "Messages sent around arrival and the in-property experience.",
  },
};

/* ------------------------------------------------------------- edit stamps */

export const CURRENT_USER = { name: "Sevket Yilmaz", initials: "SY" };

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Applies a change to one audience variant and records who edited it. */
export function editVariant(
  campaignId: string,
  audience: AudienceKey,
  fn: (v: Variant) => void,
  by = CURRENT_USER.name,
) {
  mutate((d) => {
    const c = d.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    fn(c.variants[audience]);
    c.variants[audience].customized = true;
    c.variants[audience].editedBy = { by, at: Date.now() };
  });
}

/** Most recent edit across both audiences of a campaign. */
export function lastEdit(c: MarketingCampaign): (EditStamp & { audience: AudienceKey }) | null {
  const stamps = (["direct", "ota"] as AudienceKey[])
    .map((k) => (c.variants[k].editedBy ? { ...c.variants[k].editedBy!, audience: k } : null))
    .filter(Boolean) as (EditStamp & { audience: AudienceKey })[];
  if (!stamps.length) return null;
  return stamps.sort((a, b) => b.at - a.at)[0];
}

export function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export const fullTime = (ts: number) =>
  new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/* --------------------------------------------- campaign promotions & media */

/** The promotion attached to one guest segment of a campaign. */
export function variantPromotionId(c: MarketingCampaign, audience: AudienceKey): string | null {
  const v = c.variants[audience];
  return v.promotionMode === "custom" && v.promotionId ? v.promotionId : null;
}

/** Both guest segments of a campaign with their own promotion id. */
export function campaignPromotionIds(c: MarketingCampaign): Record<AudienceKey, string | null> {
  return { direct: variantPromotionId(c, "direct"), ota: variantPromotionId(c, "ota") };
}

/** First promotion found on a campaign, used for counts and compact labels. */
export function campaignPromotionId(c: MarketingCampaign): string | null {
  return variantPromotionId(c, "direct") ?? variantPromotionId(c, "ota");
}

export function campaignPromotion(state: MarketingState, c: MarketingCampaign): Promotion | null {
  const id = campaignPromotionId(c);
  return state.promotions.find((p) => p.id === id) ?? null;
}

/** Resolved promotion per guest segment, for badges. */
export function campaignPromotionsByAudience(
  state: MarketingState,
  c: MarketingCampaign,
): Record<AudienceKey, Promotion | null> {
  const find = (id: string | null) => state.promotions.find((p) => p.id === id) ?? null;
  return { direct: find(variantPromotionId(c, "direct")), ota: find(variantPromotionId(c, "ota")) };
}

/** Which audiences of the campaign carry the given promotion. */
export function promotionAudiencesOn(c: MarketingCampaign, promotionId: string): Record<AudienceKey, boolean> {
  return {
    direct: variantPromotionId(c, "direct") === promotionId,
    ota: variantPromotionId(c, "ota") === promotionId,
  };
}

/** Which audiences the campaign promotion applies to (legacy single-promo view). */
export function campaignPromotionAudiences(c: MarketingCampaign): Record<AudienceKey, boolean> {
  const id = campaignPromotionId(c);
  return id ? promotionAudiencesOn(c, id) : { direct: false, ota: false };
}

/** Sets (or clears) the promotion for a single guest segment of a campaign. */
export function setVariantPromotion(campaignId: string, audience: AudienceKey, promotionId: string | null) {
  mutate((draft) => {
    const c = draft.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    c.variants[audience].promotionMode = promotionId ? "custom" : "none";
    c.variants[audience].promotionId = promotionId;
    const any = variantPromotionId(c, "direct") ?? variantPromotionId(c, "ota");
    c.promotionId = any;
    c.promotionMode = any ? "custom" : "none";
  });
}

export function setCampaignPromotion(
  campaignId: string,
  promotionId: string | null,
  audiences: Record<AudienceKey, boolean> = { direct: true, ota: true },
) {
  mutate((draft) => {
    const c = draft.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    c.promotionId = promotionId;
    c.promotionMode = promotionId ? "custom" : "none";
    (["direct", "ota"] as AudienceKey[]).forEach((key) => {
      const apply = Boolean(promotionId) && audiences[key];
      c.variants[key].promotionMode = apply ? "custom" : "none";
      c.variants[key].promotionId = apply ? promotionId : null;
    });
  });
}


/** Campaigns attached to a promotion. */
export function promotionCampaigns(state: MarketingState, promotionId: string) {
  return state.campaigns.filter((c) => campaignPromotionId(c) === promotionId);
}

/** Media attached to a campaign, shared across its audiences. */
export function campaignMediaIds(c: MarketingCampaign): string[] {
  return [...new Set([...(c.variants.direct.text.mediaIds ?? []), ...(c.variants.ota.text.mediaIds ?? [])])];
}

export type MessageChannel = "text" | "email";

/** Media attached to one channel and guest segment of a campaign. */
export function audienceMediaIds(
  c: MarketingCampaign,
  audience: AudienceKey,
  channel: MessageChannel = "text",
): string[] {
  return c.variants[audience][channel].mediaIds ?? [];
}

const BOTH_AUDIENCES: AudienceKey[] = ["direct", "ota"];

export function attachMediaToCampaign(
  campaignId: string,
  mediaId: string,
  audiences: AudienceKey[] = BOTH_AUDIENCES,
  channel: MessageChannel = "text",
) {
  mutate((draft) => {
    const c = draft.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    audiences.forEach((key) => {
      const ids = c.variants[key][channel].mediaIds ?? [];
      if (!ids.includes(mediaId)) c.variants[key][channel].mediaIds = [...ids, mediaId];
    });
  });
}

export function detachMediaFromCampaign(
  campaignId: string,
  mediaId: string,
  audiences: AudienceKey[] = BOTH_AUDIENCES,
  channel: MessageChannel = "text",
) {
  mutate((draft) => {
    const c = draft.campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    audiences.forEach((key) => {
      c.variants[key][channel].mediaIds = (c.variants[key][channel].mediaIds ?? []).filter((id) => id !== mediaId);
    });
  });
}

/** Files currently attached across every campaign in a scope. */
export function commonMediaIds(
  campaigns: MarketingCampaign[],
  audiences: AudienceKey[],
  channel: MessageChannel = "text",
): string[] {
  const lists = campaigns.flatMap((campaign) =>
    audiences.map((audience) => audienceMediaIds(campaign, audience, channel)),
  );
  if (lists.length === 0) return [];
  return lists.reduce<string[]>((common, ids) => common.filter((id) => ids.includes(id)), [...lists[0]]);
}

export const MEDIA_DRAG_TYPE = "application/x-directful-media";
export const CAMPAIGN_DRAG_TYPE = "application/x-directful-campaign";
/** Drag payload for a whole collection of campaigns: "both" | "direct" | "ota". */
export const CAMPAIGN_BULK_DRAG_TYPE = "application/x-directful-campaign-bulk";
export type BulkScope = "both" | "direct" | "ota";
export const PROMO_DRAG_TYPE = "application/x-directful-promotion";

