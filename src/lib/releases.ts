import { useSyncExternalStore } from "react";

/** Mock scenario (today = Sep 27 2026) that drives Content, Releases and Results. */
export const TODAY_LABEL = "Sep 27";
export const TOTAL_PROPERTIES = 31;

export type ReleaseStatus = "Live" | "Scheduled" | "Replaced" | "Removed";
export type Release = {
  id: string;
  name: string;
  year: number;
  from: number; // month index
  to: number;
  source: "Default" | "AI generated" | "Manual";
  created: string;
  publishedAt: string;
  status: ReleaseStatus;
  properties: number;
  replaces?: string;
  editedCampaigns?: number;
  campaignCount: number;
  summary: string;
  changes: string[];
  expectedEffect: string;
  comparison: string;
};

export const RELEASES: Release[] = [
  {
    id: "default-2027", name: "Year-round foundation 2027", year: 2027, from: 0, to: 11,
    source: "Default", created: "Sep 27", publishedAt: "Scheduled Sep 27, 2026", status: "Scheduled",
    properties: 31, campaignCount: 16,
    summary: "The approved year-round content will continue through 2027 wherever no seasonal publication is scheduled.",
    changes: ["Carries forward the approved guest journey", "Keeps property details and booking links current", "Leaves room for future seasonal publications"],
    expectedEffect: "Every month remains covered while seasonal content can be added later without changing the foundation.",
    comparison: "Year-round foundation 2026",
  },
  {
    id: "sep-nov-2026", name: "September–October 2026", year: 2026, from: 8, to: 9,
    source: "AI generated", created: "Sep 27", publishedAt: "Sep 27, 2026 · 2:14 PM", status: "Live",
    properties: 29, editedCampaigns: 1, campaignCount: 16, replaces: "Summer 2026",
    summary: "A seasonal return-to-New-York story is live for September and October. The year-round foundation resumes in November.",
    changes: ["Added Broadway Week and rooftop reopening", "Shortened mobile text to one clear action", "Used warmer local language for OTA guests"],
    expectedEffect: "Likely to lift opens because event-led subjects outperformed generic subjects last September.",
    comparison: "September–October 2025",
  },
  {
    id: "summer-2026", name: "Summer 2026", year: 2026, from: 5, to: 7,
    source: "Manual", created: "May 28", publishedAt: "May 28, 2026 · 10:32 AM", status: "Replaced",
    properties: 31, editedCampaigns: 4, campaignCount: 16,
    summary: "Summer messages highlighted family stays, late checkout, and the rooftop season.",
    changes: ["Moved family benefits into the opening line", "Added rooftop imagery to email", "Introduced late-checkout reminders"],
    expectedEffect: "Likely improved clicks because the offer appeared earlier and used a single destination link.",
    comparison: "Summer 2025",
  },
  {
    id: "winter-spring-2026", name: "January–May 2026", year: 2026, from: 0, to: 4,
    source: "AI generated", created: "Jan 2", publishedAt: "Jan 2, 2026 · 9:05 AM", status: "Replaced",
    properties: 31, campaignCount: 16,
    summary: "The first seasonal publication introduced local planning tips and clearer arrival messages.",
    changes: ["Added indoor winter recommendations", "Clarified arrival-day timing", "Simplified long-stay return messages"],
    expectedEffect: "Likely reduced guest questions because arrival details were moved into the first message.",
    comparison: "January–May 2025",
  },
  {
    id: "holiday-2025", name: "Holiday 2025", year: 2025, from: 10, to: 11,
    source: "Manual", created: "Nov 4", publishedAt: "Nov 4, 2025 · 11:40 AM", status: "Replaced",
    properties: 30, editedCampaigns: 3, campaignCount: 16,
    summary: "Holiday messaging centered gifting, city lights, and festive weekend stays.",
    changes: ["Added holiday market recommendations", "Introduced gift-stay email layout", "Adjusted send timing for weekend arrivals"],
    expectedEffect: "Likely increased return visits because the publication gave guests a timely reason to book again.",
    comparison: "Holiday 2024",
  },
  {
    id: "sep-nov-2025", name: "September–October 2025", year: 2025, from: 8, to: 9,
    source: "AI generated", created: "Aug 29", publishedAt: "Aug 29, 2025 · 3:18 PM", status: "Replaced",
    properties: 28, campaignCount: 16,
    summary: "Last year's autumn publication focused on city weekends and early holiday planning.",
    changes: ["Added weekend itinerary ideas", "Featured direct-booking flexibility", "Used neighborhood recommendations"],
    expectedEffect: "Performance was strongest when a local event was named directly in the subject.",
    comparison: "September–October 2024",
  },
  {
    id: "default", name: "Year-round foundation 2026", year: 2026, from: 0, to: 11,
    source: "Default", created: "Jan 2", publishedAt: "Jan 2, 2026 · 8:30 AM", status: "Live",
    properties: 31, campaignCount: 16,
    summary: "This foundation stays live all year and automatically serves every month not covered by a seasonal publication.",
    changes: ["Standardized guest names and property details", "Added consistent direct-booking links", "Established the default campaign timing"],
    expectedEffect: "Provides a stable baseline whenever no seasonal publication is active.",
    comparison: "Year-round foundation 2025",
  },
];

export const ACTIVE_RELEASE_ID = "sep-nov-2026";

/** Hotels using a publication per campaign (0 = none, TOTAL_PROPERTIES = all). */
const adoption = (all: number, overrides: Record<string, number> = {}) => (id: string) => overrides[id] ?? all;
export const RELEASE_CAMPAIGN_PROPERTIES: Record<string, (campaignId: string) => number> = {
  "default-2027": adoption(31),
  "sep-nov-2026": adoption(29, { "just-booked": 29, "before-arrival": 29, "lost-15-plus": 4, cancelled: 0, "no-show": 0 }),
  "summer-2026": adoption(31),
  "winter-spring-2026": adoption(31, { "lost-15-plus": 9 }),
  "holiday-2025": adoption(30, { "no-show": 0, cancelled: 18 }),
  "sep-nov-2025": adoption(28, { "lost-15-plus": 0, review: 25 }),
  default: adoption(31),
};
export function campaignProperties(releaseId: string, campaignId: string): number {
  return (RELEASE_CAMPAIGN_PROPERTIES[releaseId] ?? adoption(TOTAL_PROPERTIES))(campaignId);
}

let selectedReleaseId = ACTIVE_RELEASE_ID;
const selectionSubs = new Set<() => void>();
export function useSelectedRelease() {
  const selected = useSyncExternalStore((notify) => (selectionSubs.add(notify), () => selectionSubs.delete(notify)), () => selectedReleaseId, () => ACTIVE_RELEASE_ID);
  const select = (id: string) => {
    selectedReleaseId = id;
    selectionSubs.forEach((notify) => notify());
  };
  return [selected, select] as const;
}

export type ReleaseMetric = { label: string; value: string; previous: string; delta: string };
export type ReleaseMonthResult = { month: number; clickRate: number; clickToBook: number; spamRate: number; priorClickRate: number };
export type ReleaseCampaignResult = { campaignId: string; clickRate: number; clickToBook: number; spamRate: number; priorClickRate: number; insight?: string };
export type ReleaseResult = {
  releaseId: string;
  measuredThrough: string;
  sampleNote: string;
  metrics: ReleaseMetric[];
  months: ReleaseMonthResult[];
  campaigns: ReleaseCampaignResult[];
  insights: Insight[];
};

/** Campaign-specific AI insights shown on Results cards. */
export const CAMPAIGN_INSIGHTS: Record<string, string> = {
  "after-last-visit": "Guests respond to neighborhood comebacks — event-led subjects drove most of the click lift for returning guests.",
  "lost-3": "A softer nudge naming Broadway Week held attention without feeling like a sales reminder.",
  "just-booked": "Clear pre-stay details cut confusion; clicks stayed steady for both Direct and OTA guests.",
  "before-arrival": "Arrival-day timing now matches check-in hours, which likely improved same-day opens.",
  "post-checkout": "A shorter thank-you with one clear link outperformed the longer summary version.",
};

const campaignResults = (adjustment = 0, overrides: Record<string, Partial<ReleaseCampaignResult>> = {}): ReleaseCampaignResult[] => ([
  { campaignId: "after-last-visit", clickRate: 8.7 + adjustment, clickToBook: 2.9 + adjustment / 3, spamRate: 0.08, priorClickRate: 7.3 },
  { campaignId: "lost-3", clickRate: 8.1 + adjustment, clickToBook: 2.5 + adjustment / 3, spamRate: 0.11, priorClickRate: 7.2 },
  { campaignId: "just-booked", clickRate: 7.8 + adjustment, clickToBook: 3.2 + adjustment / 3, spamRate: 0.05, priorClickRate: 7.2 },
  { campaignId: "before-arrival", clickRate: 7.2 + adjustment, clickToBook: 3.8 + adjustment / 3, spamRate: 0.06, priorClickRate: 6.8 },
  { campaignId: "post-checkout", clickRate: 6.9 + adjustment, clickToBook: 2.1 + adjustment / 3, spamRate: 0.09, priorClickRate: 6.7 },
] as ReleaseCampaignResult[]).map((item) => ({ ...item, ...overrides[item.campaignId] }));

export const RELEASE_RESULTS: Record<string, ReleaseResult> = {
  "holiday-2026": {
    releaseId: "holiday-2026", measuredThrough: "Not live yet", sampleNote: "Scheduled publication · results begin after Nov 1",
    metrics: [{ label: "Click rate", value: "—", previous: "8.2%", delta: "Starts Nov 1" }, { label: "Click-to-book", value: "—", previous: "2.7%", delta: "Starts Nov 1" }, { label: "Spam rate", value: "—", previous: "0.10%", delta: "Starts Nov 1" }],
    months: [{ month: 10, clickRate: 0, clickToBook: 0, spamRate: 0, priorClickRate: 7.8 }, { month: 11, clickRate: 0, clickToBook: 0, spamRate: 0, priorClickRate: 8.6 }],
    campaigns: [],
    insights: [{ id: "h26", text: "Results will appear here after the publication starts on November 1.", evidence: "This publication is scheduled and has not sent any guest messages yet." }],
  },
  "sep-nov-2026": {
    releaseId: "sep-nov-2026", measuredThrough: "Sep 27, 2026", sampleNote: "3 days of the live publication · compared with Sep–Oct 2025",
    metrics: [{ label: "Click rate", value: "7.9%", previous: "7.1%", delta: "+0.8 pts" }, { label: "Click-to-book", value: "2.8%", previous: "2.3%", delta: "+0.5 pts" }, { label: "Spam rate", value: "0.08%", previous: "0.12%", delta: "−0.04 pts" }],
    months: [{ month: 8, clickRate: 7.9, clickToBook: 2.8, spamRate: 0.08, priorClickRate: 7.1 }, { month: 9, clickRate: 0, clickToBook: 0, spamRate: 0, priorClickRate: 7.1 }],
    campaigns: campaignResults(0.3, { "post-checkout": { clickRate: 6.4, priorClickRate: 6.9 } }),
    insights: [
      { id: "26a", text: "Event-led subjects are opening more often for Direct guests.", evidence: "Broadway Week subjects opened at 24% versus 18% for the comparable 2025 publication." },
      { id: "26b", text: "Shorter text messages are producing more clicks on mobile.", evidence: "Messages under 140 characters reached 3.4% click-through versus 2.6% in the comparison publication." },
    ],
  },
  "summer-2026": {
    releaseId: "summer-2026", measuredThrough: "Aug 31, 2026", sampleNote: "Full 3-month publication · compared with Summer 2025",
    metrics: [{ label: "Click rate", value: "7.6%", previous: "6.9%", delta: "+0.7 pts" }, { label: "Click-to-book", value: "3.1%", previous: "2.7%", delta: "+0.4 pts" }, { label: "Spam rate", value: "0.09%", previous: "0.13%", delta: "−0.04 pts" }],
    months: [{ month: 5, clickRate: 7.1, clickToBook: 2.8, spamRate: 0.11, priorClickRate: 6.7 }, { month: 6, clickRate: 7.7, clickToBook: 3.1, spamRate: 0.09, priorClickRate: 6.9 }, { month: 7, clickRate: 8.0, clickToBook: 3.4, spamRate: 0.07, priorClickRate: 7.1 }],
    campaigns: campaignResults(0.15),
    insights: [{ id: "sum1", text: "Family-focused messages produced the strongest sustained lift.", evidence: "Family benefit messages reached 9.1% engagement, up 1.6 points from Summer 2025." }],
  },
  "winter-spring-2026": {
    releaseId: "winter-spring-2026", measuredThrough: "May 31, 2026", sampleNote: "Full 5-month publication · compared with January–May 2025",
    metrics: [{ label: "Click rate", value: "7.1%", previous: "6.7%", delta: "+0.4 pts" }, { label: "Click-to-book", value: "2.6%", previous: "2.4%", delta: "+0.2 pts" }, { label: "Spam rate", value: "0.10%", previous: "0.12%", delta: "−0.02 pts" }],
    months: [0, 1, 2, 3, 4].map((month, i) => ({ month, clickRate: 6.7 + i * 0.2, clickToBook: 2.3 + i * 0.15, spamRate: 0.12 - i * 0.01, priorClickRate: 6.4 + i * 0.15 })),
    campaigns: campaignResults(0.05),
    insights: [{ id: "ws1", text: "Clearer pre-arrival details coincided with fewer guest calls.", evidence: "Calls fell 3% while before-arrival engagement increased 0.9 points." }],
  },
  "holiday-2025": {
    releaseId: "holiday-2025", measuredThrough: "Dec 31, 2025", sampleNote: "Full 2-month publication · compared with Holiday 2024",
    metrics: [{ label: "Click rate", value: "8.2%", previous: "7.1%", delta: "+1.1 pts" }, { label: "Click-to-book", value: "2.7%", previous: "2.2%", delta: "+0.5 pts" }, { label: "Spam rate", value: "0.10%", previous: "0.14%", delta: "−0.04 pts" }],
    months: [{ month: 10, clickRate: 7.8, clickToBook: 2.5, spamRate: 0.11, priorClickRate: 6.9 }, { month: 11, clickRate: 8.6, clickToBook: 2.9, spamRate: 0.09, priorClickRate: 7.3 }],
    campaigns: campaignResults(0.1),
    insights: [{ id: "hol1", text: "Holiday market recommendations gave guests a clear reason to return.", evidence: "Messages naming a market or event reached 9.3% engagement versus 7.0% for generic holiday messages." }],
  },
  "sep-nov-2025": {
    releaseId: "sep-nov-2025", measuredThrough: "Oct 31, 2025", sampleNote: "Full 2-month publication · compared with Sep–Oct 2024",
    metrics: [{ label: "Click rate", value: "7.1%", previous: "6.6%", delta: "+0.5 pts" }, { label: "Click-to-book", value: "2.3%", previous: "2.1%", delta: "+0.2 pts" }, { label: "Spam rate", value: "0.12%", previous: "0.15%", delta: "−0.03 pts" }],
    months: [{ month: 8, clickRate: 6.8, clickToBook: 2.1, spamRate: 0.13, priorClickRate: 6.3 }, { month: 9, clickRate: 7.1, clickToBook: 2.3, spamRate: 0.12, priorClickRate: 6.6 }],
    campaigns: campaignResults(0),
    insights: [{ id: "fall25", text: "Local weekend ideas performed better than generic return messaging.", evidence: "Campaigns naming a neighborhood or event earned 13% more clicks." }],
  },
  default: {
    releaseId: "default", measuredThrough: "Dec 31, 2025", sampleNote: "Year-round baseline · compared with the 2024 foundation",
    metrics: [{ label: "Click rate", value: "6.5%", previous: "6.2%", delta: "+0.3 pts" }, { label: "Click-to-book", value: "2.2%", previous: "2.0%", delta: "+0.2 pts" }, { label: "Spam rate", value: "0.13%", previous: "0.15%", delta: "−0.02 pts" }],
    months: Array.from({ length: 12 }, (_, month) => ({ month, clickRate: 6.1 + (month % 4) * 0.2, clickToBook: 2 + (month % 3) * 0.1, spamRate: 0.15 - (month % 3) * 0.01, priorClickRate: 5.9 + (month % 4) * 0.2 })),
    campaigns: campaignResults(-0.2),
    insights: [{ id: "base1", text: "The year-round foundation remained a steady fallback across all properties.", evidence: "Engagement varied by less than 0.6 points across the year." }],
  },
};

export type SlotVersion = { v: number; by: string; when: string; kind: "Default" | "AI generated" | "Manual edit" | "Revert"; properties: number; note: string };

/** Version list for the demo slot After Last Visit · September. */
export const SLOT_VERSIONS: Record<string, SlotVersion[]> = {
  "after-last-visit": [
    { v: 3, by: "Maria Chen", when: "Sep 28", kind: "Manual edit", properties: 7, note: "Shortened the text and added the rooftop reopening." },
    { v: 2, by: "Directful AI", when: "Sep 27", kind: "AI generated", properties: 22, note: "Autumn in New York angle with Broadway week." },
    { v: 1, by: "Directful AI", when: "Jan 2", kind: "Default", properties: 2, note: "Year-round default content." },
  ],
};
export function versionsFor(campaignId: string, month: number): SlotVersion[] {
  if (SLOT_VERSIONS[campaignId] && month === 8) return SLOT_VERSIONS[campaignId];
  const inAi = month >= 8 && month <= 10;
  return inAi
    ? [{ v: 2, by: "Directful AI", when: "Sep 27", kind: "AI generated", properties: 29, note: "Seasonal release content." }, { v: 1, by: "Directful AI", when: "Jan 2", kind: "Default", properties: 2, note: "Year-round default content." }]
    : [{ v: 1, by: "Directful AI", when: "Jan 2", kind: "Default", properties: 31, note: "Year-round default content." }];
}

export const PINNED_PROPERTIES = [
  { name: "Holiday Inn Newark Airport", on: "September v1", why: "Kept an older version" },
  { name: "Holiday Inn Brooklyn", on: "September v1", why: "Kept an older version" },
];

export type Risk = "minor" | "angle" | "significant";
export const RISK: Record<Risk, { label: string; dot: string; order: number }> = {
  significant: { label: "Significant change", dot: "bg-destructive", order: 0 },
  angle: { label: "New angle", dot: "bg-warning", order: 1 },
  minor: { label: "Minor tone change", dot: "bg-brand", order: 2 },
};
const RISK_BY_CAMPAIGN: Record<string, Risk> = { "after-last-visit": "significant", "lost-3": "angle", "lost-6": "minor", "lost-9": "angle", "lost-12": "significant", "lost-15": "minor", "just-booked": "minor", "before-arrival": "angle", "during-stay": "minor", "post-checkout": "angle" };
export const riskFor = (id: string): Risk => RISK_BY_CAMPAIGN[id] ?? "minor";

/** Per-month personalize banner state (remembered per month). */
type UiState = { dismissed: Record<number, boolean>; reviewed: Record<string, boolean>; reverted: Record<number, boolean> };
let ui: UiState = { dismissed: { 9: true }, reviewed: {}, reverted: {} };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export function useReleaseUi() {
  return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => ui, () => ui);
}
export const setDismissed = (m: number, v: boolean) => { ui = { ...ui, dismissed: { ...ui.dismissed, [m]: v } }; emit(); };
export const markReviewed = (id: string) => { ui = { ...ui, reviewed: { ...ui.reviewed, [id]: true } }; emit(); };
export const resetReviewed = () => { ui = { ...ui, reviewed: {} }; emit(); };
export const revertMonth = (m: number) => { ui = { ...ui, reverted: { ...ui.reverted, [m]: true } }; emit(); };

/** Which release is on top for a month (layering rule). */
export function topRelease(month: number, reverted = false): Release {
  const layers = RELEASES.filter((r) => r.status !== "Removed" && month >= r.from && month <= r.to);
  const foundation = layers.find((r) => r.id === "default");
  const seasonal = layers.find((r) => r.year === 2026 && r.id !== "default" && r.status === "Live");
  if (reverted || !seasonal) return foundation ?? layers[0];
  return seasonal;
}

export type Insight = { id: string; text: string; evidence: string };
