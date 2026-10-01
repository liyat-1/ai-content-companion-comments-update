import { useSyncExternalStore } from "react";

/** Shared Events & Holidays calendar + flexible content periods (mock, in-memory). */
export type EventSource = "Directful" | "Hotel calendar" | "Added manually";
export type EventType = "Holiday" | "Local event" | "Seasonal";
export type CalendarEvent = {
  id: string;
  name: string;
  start: string; // ISO date
  end: string;
  type: EventType;
  source: EventSource;
  location?: string;
  note?: string;
  image?: string;
};
export type PeriodKind = "Standard" | "Event-based" | "Seasonal";
export type ContentPeriod = { id: string; kind: PeriodKind; name: string; start: string; end: string; reason: string; eventId?: string; windowNote?: string };

export const TODAY = "2026-09-29";

const SEED: CalendarEvent[] = [
  { id: "broadway", name: "Broadway Week", start: "2026-09-08", end: "2026-10-05", type: "Local event", source: "Hotel calendar", location: "Theater District", note: "Two-for-one tickets bring theater fans into Midtown." },
  { id: "fall", name: "Fall foliage season", start: "2026-10-01", end: "2026-11-15", type: "Seasonal", source: "Directful", note: "Park walks and cooler city weekends." },
  { id: "marathon", name: "NYC Marathon", start: "2026-11-01", end: "2026-11-01", type: "Local event", source: "Hotel calendar", location: "Five boroughs", note: "50,000 runners — the city's biggest watch weekend." },
  { id: "thanksgiving", name: "Thanksgiving Parade", start: "2026-11-26", end: "2026-11-26", type: "Holiday", source: "Directful", location: "Central Park West", note: "Balloons over the city as families arrive." },
  { id: "tree", name: "Rockefeller Tree Lighting", start: "2026-12-02", end: "2026-12-02", type: "Local event", source: "Hotel calendar", location: "Midtown", note: "A short walk from the front door." },
  { id: "christmas", name: "Christmas", start: "2026-12-25", end: "2026-12-25", type: "Holiday", source: "Directful", note: "A quiet, glowing city made for memorable stays." },
  { id: "nye", name: "New Year's Eve", start: "2026-12-31", end: "2026-12-31", type: "Holiday", source: "Directful", location: "Times Square", note: "The world watches from your doorstep." },
  { id: "valentine", name: "Valentine's Day", start: "2027-02-14", end: "2027-02-14", type: "Holiday", source: "Directful", note: "Romantic escapes book out early." },
];

let state = { events: SEED, hasHotelCalendar: true };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useCalendar() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  const events = s.hasHotelCalendar ? s.events : s.events.filter((e) => e.source !== "Hotel calendar");
  return { ...s, events, allEvents: s.events };
}
export const calendar = {
  upsert(e: CalendarEvent) { state = { ...state, events: [...state.events.filter((x) => x.id !== e.id), e].sort((a, b) => a.start.localeCompare(b.start)) }; emit(); },
  remove(id: string) { state = { ...state, events: state.events.filter((e) => e.id !== id) }; emit(); },
  setHotelCalendar(v: boolean) { state = { ...state, hasHotelCalendar: v }; emit(); },
  importRows(rows: CalendarEvent[]) { rows.forEach((r) => { state = { ...state, events: [...state.events.filter((x) => x.id !== r.id), r] }; }); state = { ...state, hasHotelCalendar: true, events: [...state.events].sort((a, b) => a.start.localeCompare(b.start)) }; emit(); },
};

const DAY = 86_400_000;
const t = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
export const fmtDate = (d: string) => fmt.format(t(d));
export const fmtRange = (a: string, b: string) => (a === b ? fmtDate(a) : `${fmtDate(a)} – ${fmtDate(b)}`);
export const daysUntil = (d: string) => Math.ceil((t(d) - t(TODAY)) / DAY);

/** Divide a timeframe into Standard / Event-based / Seasonal periods. Event windows open 10 days before the event. */
export function buildPeriods(events: CalendarEvent[], from: string, to: string): ContentPeriod[] {
  const windows = events
    .map((e) => {
      const lead = e.type === "Seasonal" ? 0 : 10;
      return { e, s: Math.max(t(e.start) - lead * DAY, t(from)), en: Math.min(t(e.end), t(to)) };
    })
    .filter((w) => w.en >= w.s)
    .sort((a, b) => a.s - b.s);
  const out: ContentPeriod[] = [];
  let cursor = t(from);
  for (const w of windows) {
    const s = Math.max(w.s, cursor);
    if (s > w.en) continue;
    if (s > cursor) out.push({ id: `std-${cursor}`, kind: "Standard", name: "Standard content", start: iso(cursor), end: iso(s - DAY), reason: "No event or season applies — your year-round content stays active." });
    const kind: PeriodKind = w.e.type === "Seasonal" ? "Seasonal" : "Event-based";
    out.push({ id: `p-${w.e.id}`, kind, name: w.e.name, start: iso(s), end: iso(w.en), eventId: w.e.id, reason: kind === "Seasonal" ? `${w.e.note ?? "Seasonal moment"} Guests staying through this season get timely suggestions.` : `${w.e.note ?? "Local moment"} Guests arriving around ${fmtRange(w.e.start, w.e.end)} are most likely to care.`, windowNote: kind === "Event-based" ? `Event ${fmtRange(w.e.start, w.e.end)} · marketing window ${fmtRange(iso(s), iso(w.en))}` : undefined });
    cursor = w.en + DAY;
  }
  if (cursor <= t(to)) out.push({ id: `std-${cursor}`, kind: "Standard", name: "Standard content", start: iso(cursor), end: to, reason: "No event or season applies — your year-round content stays active." });
  return out;
}
export const isCurrent = (p: ContentPeriod) => p.start <= TODAY && TODAY <= p.end;

/** Parse an uploaded calendar CSV with columns name,start,end,type,location. */
export function parseCsv(text: string): CalendarEvent[] {
  return text.split(/\r?\n/).slice(1).map((line) => line.split(",").map((c) => c.trim())).filter((c) => c[0] && /^\d{4}-\d{2}-\d{2}$/.test(c[1] ?? ""))
    .map(([name, start, end, type, location], i) => ({ id: `csv-${Date.now()}-${i}`, name, start, end: end || start, type: (["Holiday", "Local event", "Seasonal"].includes(type) ? type : "Local event") as EventType, source: "Hotel calendar", location }));
}
