/**
 * Content Library V2 — simplified AI refresh, publishing & results.
 * One continuous loop: refresh → review → publish → performance → learn → improve.
 * AI suggests, the hotel decides. Nothing publishes without review.
 */
import { useSyncExternalStore } from "react";

export const RESULTS_MONTHS = [
  { id: "2026-08", label: "August 2026", click: 4.1, clickDelta: 0.7, ctb: 1.9, ctbDelta: 0.4, sends: "1,842", sendsDelta: "+3% vs July", aiSummary: "August was the strongest month of the quarter — the concise After Last Visit invitation and direct-booking CTA drove the best click rate. Worth carrying that pattern forward." },
  { id: "2026-09", label: "September 2026", click: 3.8, clickDelta: -0.3, ctb: 1.6, ctbDelta: -0.3, sends: "1,905", sendsDelta: "+3% vs August", aiSummary: "A small dip after August's strong month. A clearer reason-to-return angle should lift After Last Visit again." },
  { id: "2026-10", label: "October 2026", click: 3.6, clickDelta: -0.2, ctb: 1.5, ctbDelta: -0.1, sends: "1,968", sendsDelta: "+3% vs September", aiSummary: "The current version is holding steady, but August's concise direct-booking invitation still holds the quarter's best click rate — a good direction for the next update." },
];

/* ------------------------------ types ------------------------------ */

export type EmailCopy = { subject: string; preheader: string; heading: string; body: string; cta: string };
export type PeriodCopy = { email: EmailCopy; text: string };
export type UpdatePreferences = { tone: string; direction: string; seasonalId: string | null; note: string; context?: string };

export type PeriodStatus = "Current" | "Published" | "Previous" | "Upcoming";

export type MonthPerformance = { click: number; clickDelta: number; ctb: number; ctbDelta: number; spam: number; spamDelta: number };

export type Period = {
  id: string;
  label: string;
  short: string;
  status: PeriodStatus;
  aiAssisted: boolean;
  originLabel: string;
  publishedAt: string;
  updatedDaysAgo: number;
  properties: number;
  previouslyUsedBy?: number;
  copy: PeriodCopy;
  preferences?: UpdatePreferences;
  performance?: MonthPerformance;
  insight?: { changed: string[]; why: string; result?: string };
};

export type PeriodPerformanceNote = {
  kind: "better" | "inline" | "historical";
  headline: string;
  changed?: string[];
  why?: string;
  result?: string;
  historical?: { when: string; campaign: string; learned: string };
};

/** Demo clock — the brief's scenario: October 20, 2026, October content active. */
export const DEMO_TODAY = { day: 20, label: "October 20, 2026" };
export const TOTAL_PROPERTIES = 31;
export const HOTEL = "Holiday Inn Times Square";

/* ------------------------------ seed data ------------------------------ */

const augustCopy: PeriodCopy = {
  email: {
    subject: "{first_name}, ready for a quick getaway?",
    preheader: "Your best rate is one click away.",
    heading: "Time to come back?",
    body: "It's been a while — your room above Times Square is waiting. Book now for our best available rate and a warm welcome at check-in.",
    cta: "Book now — best rate",
  },
  text: "Hi {first_name}, your room above Times Square is waiting. Best rate direct: {booking_link}",
};

const septemberCopy: PeriodCopy = {
  email: {
    subject: "{first_name}, we saved you a spot in the city",
    preheader: "Autumn is here and Midtown is at its best.",
    heading: "Autumn in New York is calling",
    body: "The city settles into autumn this month — crisp mornings, golden light in Central Park and the rooftop glowing over Broadway. We kept your favorite room ready, and your best rate is waiting whenever you decide to come back. Book directly with us for flexible changes and a warmer welcome at check-in.",
    cta: "Check our rates",
  },
  text: "Hi {first_name}! Autumn in NYC is calling. Your room above Times Square is waiting — best rate direct: {booking_link}",
};

const octoberCopy: PeriodCopy = {
  email: {
    subject: "{first_name}, October in Midtown is yours",
    preheader: "Crisp evenings, rooftop lights and your room above Times Square.",
    heading: "Crisp evenings. Bright lights. Your city.",
    body: "October is one of the best months to be in New York — crisp walks past Central Park, Broadway at its best and the rooftop lit up over the city. Your room in the heart of Times Square is waiting. Book direct for our best rate and a warm welcome at check-in.",
    cta: "Plan my return",
  },
  text: "Hi {first_name}! October in NYC is something special. Your room above Times Square is waiting — best rate direct: {booking_link}",
};

const novemberBaseCopy: PeriodCopy = {
  email: {
    subject: "{first_name}, your room above Times Square",
    preheader: "The original year-round invitation.",
    heading: "Ready when you are",
    body: "It's been a while since your last stay. Whenever you're ready, your room in the heart of Times Square is waiting — book directly with us for our best available rate, flexible changes and a warm welcome at check-in.",
    cta: "Book your next stay",
  },
  text: "Hi {first_name}, it's been a while! Your room above Times Square is waiting. Best rate direct: {booking_link}",
};

const novemberAiCopy: PeriodCopy = {
  email: {
    subject: "{first_name}, Thanksgiving in Midtown?",
    preheader: "The parade is four blocks away — and so is your best rate.",
    heading: "Come back for the parade",
    body: "The Thanksgiving Parade passes four blocks from our door, and November in Midtown is full of moments worth coming back for. Your room above Times Square is waiting. Book now for our best rate and a warm welcome at check-in.",
    cta: "Book now — best rate",
  },
  text: "Hi {first_name}! 🦋 The Thanksgiving Parade is 4 blocks from us. Your room above Times Square is waiting — best rate direct: {booking_link}",
};

const PERIODS: Period[] = [
  {
    id: "2026-08", label: "August 2026", short: "August", status: "Previous", aiAssisted: false,
    originLabel: "Written by your team", publishedAt: "Aug 1, 2026", updatedDaysAgo: 80,
    properties: 0, previouslyUsedBy: 18, copy: augustCopy,
    performance: { click: 5.1, clickDelta: 0.4, ctb: 3.4, ctbDelta: 0.9, spam: 0.3, spamDelta: -0.1 },
  },
  {
    id: "2026-09", label: "September 2026", short: "September", status: "Previous", aiAssisted: true,
    originLabel: "AI-assisted update", publishedAt: "Sep 2, 2026", updatedDaysAgo: 48,
    properties: 0, previouslyUsedBy: 12, copy: septemberCopy,
    preferences: { tone: "current", direction: "seasonal", seasonalId: null, note: "Keep the autumn reference light." },
    performance: { click: 5.8, clickDelta: 0.7, ctb: 2.5, ctbDelta: 0.2, spam: 0.5, spamDelta: 0 },
    insight: {
      changed: ["Added a light autumn reference", "Kept your familiar email layout"],
      why: "Seasonal context performed well in previous summers, so AI added it without changing your voice.",
    },
  },
  {
    id: "2026-10", label: "October 2026", short: "October", status: "Current", aiAssisted: true,
    originLabel: "AI-assisted update", publishedAt: "Sep 20, 2026", updatedDaysAgo: 30,
    properties: 12, copy: octoberCopy,
    preferences: { tone: "current", direction: "seasonal", seasonalId: "halloween", note: "Keep the rooftop and Broadway in the invitation." },
    performance: { click: 6.2, clickDelta: 2.4, ctb: 2.8, ctbDelta: 0.6, spam: 0.4, spamDelta: -0.2 },
    insight: {
      changed: ["Shortened the message", "Made the CTA more direct", "Added light October seasonal context"],
      why: "Previous content with shorter messaging and clearer calls to action showed stronger engagement, so AI applied those patterns to the current version.",
      result: "October content is currently performing 2.4% better than comparable previous content.",
    },
  },
  { id: "2026-11", label: "November 2026", short: "November", status: "Upcoming", aiAssisted: false, originLabel: "Year-round content", publishedAt: "", updatedDaysAgo: 0, properties: 0, copy: novemberBaseCopy },
  { id: "2026-12", label: "December 2026", short: "December", status: "Upcoming", aiAssisted: false, originLabel: "Year-round content", publishedAt: "", updatedDaysAgo: 0, properties: 0, copy: novemberBaseCopy },
];

/* ------------------------------ store ------------------------------ */

type Usage = { property: string; using: "suggested" | "custom" }[];
type State = {
  periods: Period[];
  pusherDismissed: boolean;
  nextReady: string | null; // period id whose content is prepared but not yet current
  publishedCount: number;
  lastPublishedId: string | null;
};

let state: State = { periods: PERIODS.map((p) => ({ ...p })), pusherDismissed: false, nextReady: null, publishedCount: 0, lastPublishedId: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function useV2() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);
}

const set = (fn: (s: State) => State) => { state = fn(state); emit(); };

export function dismissPusher() { set((s) => ({ ...s, pusherDismissed: true })); }

/** Publish reviewed content: becomes the current suggested content for the period. */
export function publishPeriod(id: string, copy: PeriodCopy, aiAssisted: boolean, preferences?: UpdatePreferences) {
  set((s) => ({
    ...s,
    periods: s.periods.map((p) => p.id === id
      ? { ...p, status: "Current" as PeriodStatus, aiAssisted, originLabel: aiAssisted ? "AI-assisted update" : "Updated by you", publishedAt: `Oct 20, 2026`, updatedDaysAgo: 0, properties: 12, copy: clone(copy), preferences: preferences ? clone(preferences) : undefined }
      : p.id === currentId(s) ? { ...p, status: "Previous" as PeriodStatus, previouslyUsedBy: p.properties } : p),
    pusherDismissed: false,
    publishedCount: s.publishedCount + 1,
    lastPublishedId: id,
  }));
}

function currentId(s: State) { return s.periods.find((p) => p.status === "Current")?.id ?? "2026-10"; }

/** Re-base a historical version as the current suggested content. */
export function useHistoricalVersion(id: string) {
  set((s) => ({
    ...s,
    periods: s.periods.map((p) => p.id === id
      ? { ...p, status: "Current" as PeriodStatus, properties: 12, publishedAt: "Oct 20, 2026", updatedDaysAgo: 0, originLabel: "Reused historical version" }
      : p.status === "Current" ? { ...p, status: "Previous" as PeriodStatus, previouslyUsedBy: p.properties || 12 } : p),
    pusherDismissed: false,
  }));
}

/* ------------------------------ usage rows ------------------------------ */

export const USAGE_ROWS: Usage = [
  { property: "Holiday Inn Times Square", using: "suggested" },
  { property: "Holiday Inn Brooklyn Downtown", using: "suggested" },
  { property: "Holiday Inn Express Midtown", using: "custom" },
  { property: "Holiday Inn Lower East Side", using: "suggested" },
  { property: "Holiday Inn Long Island City", using: "custom" },
  { property: "Holiday Inn Financial District", using: "suggested" },
  { property: "Holiday Inn SoHo", using: "custom" },
  { property: "Holiday Inn Upper West Side", using: "suggested" },
];

/* ------------------------------ refresh flow options ------------------------------ */

export const TONES = [
  { id: "current", label: "Keep my current tone", note: "AI matches how you write today" },
  { id: "warmer", label: "Warmer & more welcoming", note: "Softer, more personal wording" },
  { id: "professional", label: "More professional", note: "Polished and formal" },
  { id: "conversational", label: "More conversational", note: "Relaxed, like a note from a friend" },
  { id: "concise", label: "Short & concise", note: "One invitation, one action" },
] as const;

export const DIRECTIONS = [
  { id: "general", label: "Keep it general", note: "No seasonal or promotional angle" },
  { id: "seasonal", label: "Use seasonal context", note: "Light seasonal touches where they fit" },
  { id: "promotional", label: "More promotional", note: "Lead with rates and offers" },
  { id: "guest", label: "More guest-experience focused", note: "Experiences over offers" },
] as const;

export type SeasonalSuggestion = { id: string; emoji: string; name: string; date: string; note: string };

/** AI proposes the seasonal context for the chosen period; the hotel can always remove it. */
export function seasonalFor(month: number): SeasonalSuggestion | null {
  if (month === 10) return { id: "parade", emoji: "🦃", name: "Thanksgiving Parade", date: "November 26", note: "We're four blocks from the route — a natural hook for a light seasonal refresh." };
  if (month === 9) return { id: "halloween", emoji: "🎃", name: "Halloween", date: "October 31", note: "We can give your content a light seasonal refresh while keeping your existing messaging and brand voice." };
  if (month === 11) return { id: "holidays", emoji: "🎄", name: "Holiday windows & Rockefeller tree", date: "December", note: "A festive reference that fits every return invite." };
  return null;
}

/* ------------------------------ campaign results ------------------------------ */

export type CampaignResult = {
  id: string; name: string; note: string;
  click: number; clickDelta: number; ctb: number; ctbDelta: number;
  insight: PeriodPerformanceNote;
};

export const CAMPAIGN_RESULTS: CampaignResult[] = [
  {
    id: "alv", name: "After Last Visit", note: "Sent a few days after checkout",
    click: 7.1, clickDelta: 3.1, ctb: 3.2, ctbDelta: 1.1,
    insight: { kind: "historical", headline: "A previous version performed better", changed: ["Shorter messaging, a stronger CTA, and a more direct booking-focused message"], why: "Previous versions using these patterns generated stronger engagement, so they were carried into the current version.", historical: { when: "August 2026", campaign: "After Last Visit", learned: "The August version used a shorter message and a stronger booking-focused CTA." } },
  },
  {
    id: "m3", name: "3 Months", note: "Sent three months after the stay",
    click: 9.6, clickDelta: 1.4, ctb: 4.1, ctbDelta: 0.5,
    insight: { kind: "better", headline: "Your content is performing better than comparable previous content.", changed: ["A clearer single call to action"], why: "Guests who book directly respond better to one focused invitation.", result: "3 Months is currently performing 1.4% better than comparable previous content." },
  },
  {
    id: "m6", name: "6 Months", note: "Sent six months after the stay",
    click: 6.8, clickDelta: 0.1, ctb: 2.2, ctbDelta: 0,
    insight: { kind: "inline", headline: "Your content is performing in line with comparable previous content." },
  },
  {
    id: "post", name: "Post-Stay Thank You", note: "Sent the day after checkout",
    click: 13.1, clickDelta: -0.8, ctb: 1.9, ctbDelta: -0.3,
    insight: { kind: "inline", headline: "Your content is performing in line with comparable previous content." },
  },
];

/** August version of After Last Visit — the historical high performer. */
export const AUGUST_ALV: PeriodCopy = {
  email: {
    subject: "{first_name}, come back soon",
    preheader: "Best rate guaranteed when you book direct.",
    heading: "We kept your room in mind",
    body: "Book direct for our best available rate, flexible changes and a warm welcome at check-in. Your room above Times Square is ready when you are.",
    cta: "Book now — best rate",
  },
  text: "Hi {first_name}, your room above Times Square is ready when you are. Best rate direct: {booking_link}",
};

export function monthName(month: number) { return new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, month, 1))); }
