import { buildPeriods, TODAY, fmtRange, type CalendarEvent, type ContentPeriod } from "@/lib/calendar";
import { TOTAL_PROPERTIES, campaignProperties, type Release } from "@/lib/releases";

/** Results model: a publication is a timeframe split into content periods (categories). */
const pad = (n: number) => String(n).padStart(2, "0");
export const releaseStart = (r: Release) => `${r.year}-${pad(r.from + 1)}-01`;
export const releaseEnd = (r: Release) => new Date(Date.UTC(r.year, r.to + 1, 0)).toISOString().slice(0, 10);
export const releaseRange = (r: Release) => fmtRange(releaseStart(r), releaseEnd(r)) + `, ${r.year}`;
export const releaseCoversToday = (r: Release) => releaseStart(r) <= TODAY && TODAY <= releaseEnd(r);

export function releasePeriods(r: Release, events: CalendarEvent[]): ContentPeriod[] {
  if (r.id.startsWith("default")) return [{ id: `std-${r.id}`, kind: "Standard", name: "Year-round content", start: releaseStart(r), end: releaseEnd(r), reason: "Serves every date that no seasonal publication covers." }];
  // Past publications are modelled on the same year's calendar pattern.
  const shift = (d: string) => `${r.year}${d.slice(4)}`;
  const shifted = events.map((e) => ({ ...e, start: shift(e.start), end: shift(e.end) }));
  return buildPeriods(shifted, releaseStart(r), releaseEnd(r));
}

export type Compare = "previous" | "lastYear" | "custom";
export type Stat = { click: number; book: number; spam: number };
export const CAMPAIGN_IDS = ["after-last-visit", "lost-3", "just-booked", "before-arrival", "post-checkout"];

const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000; };
const CAMPAIGN_BASE: Record<string, number> = { "after-last-visit": 8.4, "lost-3": 7.8, "just-booked": 7.5, "before-arrival": 7.0, "post-checkout": 6.6 };

export const isPending = (p: ContentPeriod) => p.start > TODAY;

/** Performance of a content period (optionally one campaign). Event-led periods get a lift. */
export function periodStat(p: ContentPeriod, campaignId?: string): Stat {
  const base = campaignId ? CAMPAIGN_BASE[campaignId] ?? 7 : 7.4;
  const lift = p.kind === "Event-based" ? 1.1 : p.kind === "Seasonal" ? 0.7 : -0.4;
  const noise = hash(p.id + (campaignId ?? "")) * 0.6 - 0.3;
  const dip = campaignId === "post-checkout" && p.kind !== "Standard" ? -2.6 : 0; // demo: prior version better even in an event-led period
  const click = +(base + lift + noise + dip).toFixed(1);
  return { click, book: +(click * 0.36).toFixed(1), spam: +(0.12 - lift * 0.03).toFixed(2) };
}

/** The comparison baseline and why it differs. */
export function baseline(periods: ContentPeriod[], p: ContentPeriod, compare: Compare, customDate: string, campaignId?: string) {
  const idx = periods.findIndex((x) => x.id === p.id);
  if (compare === "previous") {
    const prev: ContentPeriod = idx > 0 ? periods[idx - 1] : { id: `before-${p.id}`, kind: "Standard", name: "Standard content", start: "", end: "", reason: "" };
    return { stat: periodStat(prev, campaignId), label: idx > 0 ? `${prev.name} (${fmtRange(prev.start, prev.end)})` : "the content live before this publication", period: prev };
  }
  if (compare === "lastYear") {
    const ly: ContentPeriod = { ...p, id: `ly-${p.id}`, kind: p.kind === "Event-based" ? "Seasonal" : "Standard" };
    return { stat: periodStat(ly, campaignId), label: "the same dates last year", period: ly };
  }
  const cd: ContentPeriod = { ...p, id: `cd-${customDate}`, kind: hash(customDate) > 0.5 ? "Seasonal" : "Standard" };
  return { stat: periodStat(cd, campaignId), label: `content live on ${customDate || "the chosen date"}`, period: cd };
}

export function periodInsight(p: ContentPeriod, base: { stat: Stat; period: ContentPeriod }, current: Stat) {
  const d = current.click - base.stat.click;
  const why = p.kind === "Event-based" ? `it is tied to ${p.name}, so guests get a concrete, timely reason to act` : p.kind === "Seasonal" ? `it speaks to the season guests are traveling in` : `it has no event or season attached, so messages read as generic reminders`;
  const prevWhy = base.period.kind === "Standard" ? "The comparison content had no event attached, which is the most likely reason it trailed." : base.period.kind === "Seasonal" ? "The comparison content was seasonal but did not name a specific event." : `The comparison content was also event-led (${base.period.name}).`;
  return d >= 0
    ? `Performing ${d.toFixed(1)} pts better because ${why}. ${prevWhy}`
    : `Trailing by ${Math.abs(d).toFixed(1)} pts — ${why}. Consider adding a local event or reusing the stronger previous content.`;
}

export function adoptionSentence(releaseId: string, campaignName: string, campaignId: string) {
  const used = campaignProperties(releaseId, campaignId);
  if (used === 0) return `No properties use this publication for ${campaignName} — they all kept their own version.`;
  if (used === TOTAL_PROPERTIES) return `All ${TOTAL_PROPERTIES} properties use this publication for ${campaignName}.`;
  return `${used} of ${TOTAL_PROPERTIES} properties use this publication for ${campaignName}; ${TOTAL_PROPERTIES - used} kept their own version.`;
}
