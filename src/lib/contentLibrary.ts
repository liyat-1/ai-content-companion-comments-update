/**
 * Content Library — sample data + a tiny in-memory store.
 * Everything is scoped to Holiday Inn Times Square. No real AI model: the
 * "generation" below is a deterministic writer that uses the chosen
 * timeframe, ideas and direction.
 */
import { useSyncExternalStore } from "react";

export type Segment = "direct" | "ota";
export type Channel = "email" | "text";
export type Origin = "manual" | "ai" | "ai-edited";
export type Status = "Current" | "Needs review" | "Approved" | "Published";

export type EmailBody = { subject: string; preheader: string; heading: string; body: string; cta: string };
export type SegmentContent = { email: EmailBody; text: string; reviewed: { email: boolean; text: boolean } };

export type LibraryCampaign = {
  id: string;
  name: string;
  kind: "Automated Invite" | "Automated Transactional" | "Property Transactional";
  goal: string;
  channels: Channel[];
  content: Record<Segment, SegmentContent>;
  origin: Origin;
  status: Status;
  updated: string;
  version: number;
  image: string;
  template: string;
  why?: { template: string; subject: string; image: string; text: string; context: string[] };
};

export type Version = { campaignId: string; v: number; label: string; by: string; when: string };
export type Publication = { id: string; name: string; when: string; campaigns: string[]; pieces: number; channels: string; segments: string; version: string };
export type MonthPackage = { id: string; month: number; year: number; label: string; version: string; source: "default" | "ai" | "team"; status: "Live now" | "Scheduled" | "Archived"; note: string };

export const SEGMENT_LABEL: Record<Segment, string> = { direct: "Direct guests", ota: "OTA guests" };
export const HOTEL_NAME = "Holiday Inn Times Square";

const seg = (email: EmailBody, text: string): SegmentContent => ({ email, text, reviewed: { email: false, text: false } });

const invite = (id: string, name: string, goal: string, since: string, image: string): LibraryCampaign => ({
  id,
  name,
  kind: "Automated Invite",
  goal,
  channels: ["email", "text"],
  origin: "manual",
  status: "Current",
  updated: "Sep 12",
  version: 1,
  image,
  template: "Classic Welcome",
  content: {
    direct: seg(
      {
        subject: `{first_name}, we'd love to see you again`,
        preheader: "Your room above Times Square is ready when you are.",
        heading: "Ready for another New York getaway?",
        body: `It's been ${since} since your stay. We hope you enjoyed your time with us — Broadway, the lights and the energy of Midtown are waiting whenever you're ready to come back.`,
        cta: "Book your next stay",
      },
      `Hi {first_name}, it's been ${since} since your stay at Holiday Inn Times Square. Ready for another NYC getaway? Book direct for our best rate: {booking_link}`,
    ),
    ota: seg(
      {
        subject: `Thanks for staying with us, {first_name}`,
        preheader: "Next time, book with us directly and get more.",
        heading: "We hope you enjoyed Times Square",
        body: `Thank you for choosing us ${since} ago. Next time, book directly with the hotel for our best available rate, flexible changes and a warmer welcome at check-in.`,
        cta: "See direct rates",
      },
      `Hi {first_name}, thanks for staying at Holiday Inn Times Square! Next time book with us directly for our best rate and flexible changes: {booking_link}`,
    ),
  },
});

const transactional = (
  id: string,
  name: string,
  kind: LibraryCampaign["kind"],
  goal: string,
  channels: Channel[],
  heading: string,
  body: string,
  text: string,
  image: string,
): LibraryCampaign => {
  const email: EmailBody = { subject: heading, preheader: goal, heading, body, cta: "View reservation" };
  return {
    id, name, kind, goal, channels, origin: "manual", status: "Current", updated: "Aug 30", version: 1, image, template: "Clean Notice",
    content: { direct: seg(email, text), ota: seg({ ...email, body: body + " Booking through a travel site? We still have you covered." }, text) },
  };
};

const SEED: LibraryCampaign[] = [
  invite("alv", "After Last Visit", "Reconnect right after checkout", "a few days", "lobby"),
  invite("m3", "3 Months", "Invite guests back three months on", "three months", "rooftop"),
  invite("m6", "6 Months", "Inspire a seasonal return", "six months", "room"),
  invite("m9", "9 Months", "Remind guests what they loved", "nine months", "suite"),
  invite("m12", "12 Months", "Celebrate the anniversary of their visit", "a year", "rooftop"),
  invite("m15", "15 Months", "Win back guests who haven't returned", "over a year", "courtyard"),
  invite("m15p", "15 Months+", "Re-engage long-lapsed guests", "a long while", "lobby"),
  transactional("conf", "Booking Confirmation", "Automated Transactional", "Everything for your upcoming stay", ["email", "text"], "Your stay is confirmed", "We're looking forward to welcoming you to Holiday Inn Times Square. Your reservation details are below.", "Your stay at Holiday Inn Times Square is confirmed for {arrival_date}. Details: {reservation_link}", "lobby"),
  transactional("pre", "Pre-Arrival", "Automated Transactional", "Help guests prepare for arrival", ["email", "text"], "Your NYC stay is almost here", "Check in from 3 PM. Tell us your arrival time and any requests, and we'll have everything ready.", "Hi {first_name}! Your stay starts {arrival_date}. Reply with your arrival time or requests.", "room"),
  transactional("welcome", "Welcome Message", "Property Transactional", "Greet guests on check-in day", ["text"], "Welcome to Holiday Inn Times Square", "Welcome! Wi-Fi is HolidayInn_Guest. The rooftop opens at 5 PM.", "Welcome to Holiday Inn Times Square, {first_name}! Wi-Fi: HolidayInn_Guest. Rooftop opens at 5 PM.", "rooftop"),
  transactional("mid", "Mid-Stay Check-in", "Property Transactional", "Make sure the stay is going well", ["text"], "How is your stay?", "Anything we can do to make your stay better?", "Hi {first_name}, how's your stay going? Reply here if there's anything we can do.", "courtyard"),
  transactional("post", "Post-Stay Thank You", "Automated Transactional", "Thank guests and ask for a review", ["email", "text"], "Thank you for staying with us", "It was a pleasure hosting you. We'd love to hear how your stay was.", "Thanks for staying with us, {first_name}! Tell us how it went: {review_link}", "lobby"),
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

type State = { campaigns: LibraryCampaign[]; versions: Version[]; publications: Publication[] };
let state: State = {
  campaigns: clone(SEED),
  versions: SEED.map((c) => ({ campaignId: c.id, v: 1, label: "Original content", by: "Maria Chen", when: "Jun 12" })),
  publications: [
    { id: "p1", name: "Summer 2026 content", when: "Jun 12, 2026", campaigns: SEED.map((c) => c.id), pieces: 20, channels: "Email + Text", segments: "Direct + OTA", version: "v1" },
  ],
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (fn: (s: State) => State) => { state = fn(state); emit(); };

export function useLibrary() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);
}

const today = () => "Today";

export function saveCampaign(next: LibraryCampaign, label: string) {
  set((s) => {
    const prev = s.campaigns.find((c) => c.id === next.id);
    const origin: Origin = prev?.origin === "manual" ? "manual" : "ai-edited";
    const v = (prev?.version ?? 0) + 1;
    const updated: LibraryCampaign = { ...clone(next), origin: next.origin === "ai" && label === "AI refinement" ? "ai-edited" : origin, version: v, updated: today(), status: next.status === "Approved" ? "Approved" : "Needs review" };
    return {
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === next.id ? updated : c)),
      versions: [{ campaignId: next.id, v, label, by: "Sevket Yilmaz", when: "Today" }, ...s.versions],
    };
  });
}

export function approveCampaign(id: string) {
  set((s) => ({ ...s, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status: "Approved" } : c)) }));
}

export function publishApproved() {
  const approved = state.campaigns.filter((c) => c.status === "Approved");
  if (!approved.length) return 0;
  set((s) => ({
    ...s,
    campaigns: s.campaigns.map((c) => (c.status === "Approved" ? { ...c, status: "Published" } : c)),
    publications: [
      {
        id: `p${s.publications.length + 1}`,
        name: `Fall 2026 content · release ${s.publications.length}`,
        when: "Today",
        campaigns: approved.map((c) => c.id),
        pieces: approved.reduce((n, c) => n + c.channels.length * 2, 0),
        channels: "Email + Text",
        segments: "Direct + OTA",
        version: approved.map((c) => `v${c.version}`).join(", "),
      },
      ...s.publications,
    ],
  }));
  return approved.length;
}

export function publishDraftRelease(range: string) {
  const pending = state.campaigns.filter((campaign) => campaign.status === "Needs review" || campaign.status === "Approved");
  if (!pending.length) return 0;
  set((s) => ({
    ...s,
    campaigns: s.campaigns.map((campaign) => pending.some((item) => item.id === campaign.id) ? { ...campaign, status: "Published" as Status } : campaign),
    publications: [{
      id: `p${s.publications.length + 1}`,
      name: `${range} release · AI generated`,
      when: "Today",
      campaigns: pending.map((campaign) => campaign.id),
      pieces: pending.reduce((count, campaign) => count + campaign.channels.length * 2, 0),
      channels: "Email + Text",
      segments: "Direct + OTA",
      version: pending.map((campaign) => `v${campaign.version}`).join(", "),
    }, ...s.publications],
  }));
  return pending.length;
}

/* ---------------------------- AI creation ---------------------------- */

export type Idea = { id: string; group: "Seasonal moments" | "Holidays" | "Hotel events" | "Local events"; emoji: string; name: string; date?: string; month: number; fit: string };

const IDEAS: Idea[] = [
  { id: "summer-end", group: "Seasonal moments", emoji: "☀️", name: "End of summer", month: 8, fit: "Late-summer weekends" },
  { id: "autumn", group: "Seasonal moments", emoji: "🍂", name: "Autumn in New York", month: 9, fit: "Works across every return invite" },
  { id: "winter", group: "Seasonal moments", emoji: "❄️", name: "Winter in the city", month: 11, fit: "Cozy, festive tone" },
  { id: "halloween", group: "Holidays", emoji: "🎃", name: "Halloween", date: "Oct 31", month: 9, fit: "Light touch in 3 & 6 Months" },
  { id: "thanksgiving", group: "Holidays", emoji: "🦃", name: "Thanksgiving Parade", date: "Nov 26", month: 10, fit: "We're 4 blocks from the route" },
  { id: "holidays", group: "Holidays", emoji: "🎄", name: "Holiday windows & Rockefeller tree", date: "Dec", month: 11, fit: "Strong for 6 & 9 Months" },
  { id: "conference", group: "Hotel events", emoji: "🏨", name: "Annual Conference", date: "Oct 18", month: 9, fit: "Only After Last Visit & 3 Months" },
  { id: "rooftop", group: "Hotel events", emoji: "🍸", name: "Rooftop fall season opening", date: "Sep 20", month: 8, fit: "Great visual for emails" },
  { id: "marathon", group: "Local events", emoji: "🏃", name: "NYC Marathon", date: "Nov 1", month: 10, fit: "Weekend demand spike" },
  { id: "festival", group: "Local events", emoji: "📍", name: "Midtown Fall Festival", date: "Oct 25", month: 9, fit: "Nice for lapsed guests" },
];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MONTH_PACKAGES: MonthPackage[] = [
  { id: "sep-default", month: 8, year: 2026, label: "Original year-round", version: "v1", source: "default", status: "Archived", note: "Directful's original guest journey" },
  { id: "sep-live", month: 8, year: 2026, label: "Autumn in NYC", version: "v3", source: "ai", status: "Live now", note: "Published Sep 2 by Sevket Yilmaz" },
  { id: "sep-edit", month: 8, year: 2026, label: "Autumn refined", version: "v3.1", source: "team", status: "Live now", note: "Edited Sep 12 by Sevket Yilmaz" },
  { id: "oct-default", month: 9, year: 2026, label: "Original year-round", version: "v1", source: "default", status: "Archived", note: "Fallback content" },
  { id: "oct-ai", month: 9, year: 2026, label: "October city break", version: "v4", source: "ai", status: "Scheduled", note: "Scheduled for Oct 1" },
  { id: "nov-default", month: 10, year: 2026, label: "Year-round foundation", version: "v1", source: "default", status: "Scheduled", note: "Starts when the autumn publication ends" },
  { id: "dec-default", month: 11, year: 2026, label: "Year-round foundation", version: "v1", source: "default", status: "Scheduled", note: "No seasonal publication scheduled" },
];

export function packageSnippet(campaign: LibraryCampaign, pack: MonthPackage, segment: Segment = "direct") {
  const base = fillTokens(campaign.content[segment].text);
  if (pack.source === "default") return base;
  const opener = pack.month === 8 ? "Autumn in New York is calling" : pack.month === 9 ? "Make October in Midtown yours" : "The holiday season is glowing in Times Square";
  return `${opener}, Alex. ${segment === "direct" ? "Your best direct rate is waiting." : "Book direct next time for more flexibility."}`;
}

function fillTokens(value: string) {
  return value.replace(/\{first_name\}/g, "Alex").replace(/\{booking_link\}/g, "hi-ts.com/book").replace(/\{[a-z_]+\}/g, "your stay");
}

export function ideasFor(start: number, end: number) {
  return IDEAS.filter((i) => i.month >= start && i.month <= end);
}

export const CONTEXT_SOURCES = [
  "Hotel brand", "Brand voice", "Existing campaign content", "Guest segments", "Email templates", "Existing offers",
  "Hotel amenities", "Media Library", "Hotel events", "Seasonal moments", "Your timeframe", "Your instructions",
];

export type Direction = { tone: string[]; avoid: string[]; notes: string[] };

/** Read plain-language instructions into lightweight rules the writer follows. */
export function readDirection(input: string, prev: Direction): Direction {
  const r = input.toLowerCase();
  const d: Direction = { tone: [...prev.tone], avoid: [...prev.avoid], notes: [...prev.notes, input.trim()].filter(Boolean) };
  const add = (arr: string[], v: string) => !arr.includes(v) && arr.push(v);
  if (/premium|luxur|elegant/.test(r)) add(d.tone, "premium");
  if (/warm|personal|invit/.test(r)) add(d.tone, "warm");
  if (/subtle/.test(r)) add(d.tone, "subtle");
  if (/direct book/.test(r)) add(d.tone, "direct-booking");
  const m = r.match(/(?:don'?t|do not|no|avoid|skip)\s+(?:mention\s+|focus\s+(?:too\s+much\s+)?on\s+)?([a-z]+)/);
  if (m) add(d.avoid, m[1]);
  return d;
}

const IMAGE_FOR: Record<string, string> = { autumn: "room", holidays: "suite", rooftop: "rooftop", conference: "lobby", winter: "suite" };

export function generateAll(ideas: Idea[], direction: Direction, range: string) {
  const usable = ideas.filter((i) => !direction.avoid.some((a) => i.name.toLowerCase().includes(a)));
  const season = usable.find((i) => i.group === "Seasonal moments");
  const premium = direction.tone.includes("premium");
  const warmOpen = premium ? "It would be our pleasure to welcome you back" : "We'd love to welcome you back";
  const seasonLine = season ? (direction.tone.includes("subtle") ? `as the city settles into ${season.name.replace(" in New York", "").toLowerCase()}` : `this ${season.name.replace(" in New York", "").toLowerCase()}`) : "soon";

  set((s) => ({
    ...s,
    campaigns: s.campaigns.map((c, idx) => {
      if (c.kind !== "Automated Invite") {
        const touch = season ? ` Enjoy New York ${seasonLine}.` : "";
        const upd = (x: SegmentContent): SegmentContent => ({ reviewed: { email: false, text: false }, email: { ...x.email, body: x.email.body.replace(/ Enjoy New York.*$/, "") + touch }, text: x.text });
        return { ...c, origin: "ai" as Origin, status: "Needs review" as Status, updated: "Today", version: c.version + 1, content: { direct: upd(c.content.direct), ota: upd(c.content.ota) }, why: { template: "Kept your clean notice layout — guests need the facts first.", subject: "Left clear and factual; transactional messages shouldn't sell.", image: "Kept your current image.", text: "Unchanged except for tone — this message is operational.", context: [range, "light seasonal touch"] } };
      }
      // Relevant personalization, not personalization everywhere.
      const event = usable.filter((i) => i.group !== "Seasonal moments")[idx % Math.max(1, usable.length - 1)];
      const useEvent = event && (event.id !== "conference" || ["alv", "m3"].includes(c.id)) && c.id !== "m12";
      const eventLine = useEvent && event ? ` ${event.name}${event.date ? ` (${event.date})` : ""} is a lovely reason to plan the trip.` : "";
      const hero = IMAGE_FOR[season?.id ?? ""] ?? c.image;
      const mkSeg = (sg: Segment): SegmentContent => {
        const directTail = sg === "direct" ? "Book direct for our best rate and a warm welcome at check-in." : "Book with us directly next time — best rate, flexible changes and perks you won't find on travel sites.";
        return {
          reviewed: { email: false, text: false },
          email: {
            subject: season ? `Come back ${seasonLine}, {first_name}` : `{first_name}, your room is waiting`,
            preheader: premium ? "A quieter, more refined side of Times Square." : "Midtown is at its best right now.",
            heading: `${warmOpen} ${seasonLine}`,
            body: `${c.goal}. Crisp evenings, the rooftop lit up over the city and a room right in the heart of Times Square.${eventLine} ${directTail}`,
            cta: sg === "direct" ? "Plan my return" : "See direct rates",
          },
          text: `Hi {first_name}! ${warmOpen.replace("It would be our pleasure to welcome you back", "We'd be delighted to host you again")} ${seasonLine} at Holiday Inn Times Square.${useEvent && event ? ` ${event.emoji} ${event.name}${event.date ? " " + event.date : ""}.` : ""} ${sg === "direct" ? "Best rate direct:" : "Book direct next time:"} {booking_link}`,
        };
      };
      return {
        ...c,
        origin: "ai" as Origin,
        status: "Needs review" as Status,
        updated: "Today",
        version: c.version + 1,
        image: hero,
        template: "Warm Image + CTA",
        content: { direct: mkSeg("direct"), ota: mkSeg("ota") },
        why: {
          template: "Gives the seasonal message a strong visual focus while keeping the button prominent.",
          subject: "Kept it short and seasonal, and spoke to guests who already know the hotel.",
          image: "Reinforces the season without changing the hotel's visual identity.",
          text: "Kept the text concise — one invitation, one link — so it reads in a glance.",
          context: [range, season?.name, useEvent ? event?.name : undefined, direction.tone.length ? direction.tone.join(" + ") : "warm"].filter(Boolean) as string[],
        },
      };
    }),
    versions: [
      ...s.campaigns.map((c) => ({ campaignId: c.id, v: c.version + 1, label: "Created with Directful AI", by: "Directful AI", when: "Today" })),
      ...s.versions,
    ],
  }));
}

export const IMAGE_LABEL: Record<string, string> = { lobby: "Lobby arrival", rooftop: "Rooftop at dusk", room: "Fall room with city view", suite: "Suite detail", courtyard: "Courtyard" };

/* ------------------------ Library meta & analytics ------------------------ */

/** Which Marketing-editor campaign each library campaign opens. */
export const EDITOR_ID: Record<string, string> = {
  alv: "after-last-visit", m3: "lost-3", m6: "lost-6", m9: "lost-9", m12: "lost-12", m15: "lost-15", m15p: "lost-15-plus",
  conf: "just-booked", pre: "before-arrival", welcome: "during-stay", mid: "during-stay", post: "post-checkout",
};

/** Months (0-11) each campaign's current content covers. */
export const ACTIVE_MONTHS: Record<string, number[]> = {
  alv: [8, 9, 10], m3: [8, 9, 10, 11], m6: [9, 10, 11], m9: [10, 11], m12: [8, 9, 10, 11], m15: [9, 10], m15p: [10, 11],
  conf: [8, 9, 10, 11], pre: [8, 9, 10, 11], welcome: [8, 9, 10, 11], mid: [8, 9, 10, 11], post: [8, 9, 10, 11],
};

export type Attachment = { id: string; kind: "media" | "upload" | "sheet" | "doc"; name: string; image?: string; note?: string };

export const MEDIA_LIBRARY: Attachment[] = [
  { id: "ml-rooftop", kind: "media", name: "Rooftop at dusk", image: "rooftop" },
  { id: "ml-room", kind: "media", name: "Fall room, city view", image: "room" },
  { id: "ml-lobby", kind: "media", name: "Lobby arrival", image: "lobby" },
  { id: "ml-suite", kind: "media", name: "Suite detail", image: "suite" },
  { id: "ml-court", kind: "media", name: "Courtyard", image: "courtyard" },
];

/** Real-looking event imagery (Wikimedia Commons, free to use). */
export const EVENT_IMAGE: Record<string, string> = {
  "summer-end": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Times_Square%2C_New_York_City_%28HDR%29.jpg/640px-Times_Square%2C_New_York_City_%28HDR%29.jpg",
  autumn: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Central_Park_in_autumn.jpg/640px-Central_Park_in_autumn.jpg",
  winter: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Rockefeller_Center_Christmas_Tree_2012.jpg/480px-Rockefeller_Center_Christmas_Tree_2012.jpg",
  halloween: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Village_Halloween_Parade_2012.jpg/640px-Village_Halloween_Parade_2012.jpg",
  thanksgiving: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Macy%27s_Thanksgiving_Day_Parade_2011.jpg/640px-Macy%27s_Thanksgiving_Day_Parade_2011.jpg",
  holidays: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Rockefeller_Center_Christmas_Tree_2012.jpg/480px-Rockefeller_Center_Christmas_Tree_2012.jpg",
  marathon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/NYC_Marathon_Verrazano_Bridge.jpg/640px-NYC_Marathon_Verrazano_Bridge.jpg",
  festival: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Times_Square%2C_New_York_City_%28HDR%29.jpg/640px-Times_Square%2C_New_York_City_%28HDR%29.jpg",
};

/** Parse "oct to dec", "next 2 months", "halloween", "november" into a month range. */
export function parseTimeframe(text: string, now = 8): { s: number; e: number } | null {
  const t = text.toLowerCase();
  const found: number[] = [];
  const full = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  full.forEach((m, i) => { const re = new RegExp(`\\b(${m}|${m.slice(0, 3)})\\b`); const idx = t.search(re); if (idx >= 0) found.push(i * 1000 + idx); });
  const months = found.sort((a, b) => (a % 1000) - (b % 1000)).map((x) => Math.floor(x / 1000));
  if (months.length) { const s = months[0], e = months[months.length - 1]; return { s: Math.min(s, e), e: Math.max(s, e) }; }
  const n = t.match(/next\s+(\d+|one|two|three|four|five|six)\s+months?/);
  if (n) { const map: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }; const k = Number(n[1]) || map[n[1]]; return { s: now, e: Math.min(11, now + k) }; }
  if (/next month/.test(t)) return { s: now + 1, e: now + 1 };
  if (/this month/.test(t)) return { s: now, e: now };
  if (/halloween/.test(t)) return { s: 9, e: 9 };
  if (/thanksgiving/.test(t)) return { s: 10, e: 10 };
  if (/christmas|holiday season|holidays/.test(t)) return { s: 11, e: 11 };
  if (/fall|autumn/.test(t)) return { s: 8, e: 10 };
  if (/winter/.test(t)) return { s: 11, e: 11 };
  if (/rest of (the )?year|end of (the )?year/.test(t)) return { s: now, e: 11 };
  return null;
}

/** Rewrite one campaign in place for the Edit-with-AI overlay. */
export function aiRewrite(id: string, opts: { segments: Segment[]; channels: Channel[]; prompt: string; attachments: Attachment[] }) {
  const p = opts.prompt.toLowerCase();
  const premium = /premium|luxur|elegant/.test(p);
  const short = /short|concise|brief/.test(p);
  const halloween = /halloween/.test(p);
  const media = opts.attachments.find((a) => a.image);
  set((s) => ({
    ...s,
    campaigns: s.campaigns.map((c) => {
      if (c.id !== id) return c;
      const content = clone(c.content);
      opts.segments.forEach((sg) => {
        const tail = sg === "direct" ? "Book direct — your best rate is waiting." : "Book with us directly next time for perks travel sites can't offer.";
        const hook = halloween ? "🎃 Midtown gets spooky this October" : premium ? "A quieter, more refined Times Square" : "Fall in New York is calling";
        if (opts.channels.includes("email") && c.channels.includes("email")) {
          content[sg].email = {
            subject: `${hook}, {first_name}`,
            preheader: premium ? "Crisp evenings, rooftop views and a room made for you." : "Crisp evenings, rooftop lights and your room above the city.",
            heading: hook,
            body: short ? `${c.goal}. ${tail}` : `${c.goal}. Picture crisp evenings, the rooftop glowing over Broadway and a room right in the heart of it all. ${tail}`,
            cta: sg === "direct" ? "Plan my return" : "See direct rates",
          };
        }
        if (opts.channels.includes("text") && c.channels.includes("text")) {
          content[sg].text = `Hi {first_name}! ${hook} at Holiday Inn Times Square. ${sg === "direct" ? "Best rate direct:" : "Book direct next time:"} {booking_link}`;
        }
      });
      return {
        ...c, content, origin: "ai-edited" as Origin, status: "Needs review" as Status, updated: "Today", version: c.version + 1,
        image: media?.image ?? c.image,
        why: { template: "Kept your layout — only the words changed.", subject: `Rewritten around "${opts.prompt.slice(0, 60)}".`, image: media ? `Using your ${media.name} photo.` : "Kept your current image.", text: short ? "Trimmed to one line and one link." : "One invitation, one link.", context: [opts.segments.map((x) => SEGMENT_LABEL[x]).join(" + "), opts.channels.join(" + "), ...opts.attachments.map((a) => a.name)] },
      };
    }),
    versions: [{ campaignId: id, v: (s.campaigns.find((c) => c.id === id)?.version ?? 0) + 1, label: "Edited with Directful AI", by: "Directful AI", when: "Today" }, ...s.versions],
  }));
}

/* Performance — sample figures, Sep–Nov 2026 vs 2025. */
export type MonthPerf = { m: number; sent: number; opens: number; clicks: number; bookings: number; revenue: number; ly: { clicks: number; bookings: number; revenue: number } };
export const MONTH_PERF: MonthPerf[] = [
  { m: 6, sent: 4120, opens: 2010, clicks: 262, bookings: 31, revenue: 18400, ly: { clicks: 240, bookings: 27, revenue: 15900 } },
  { m: 7, sent: 4380, opens: 2190, clicks: 281, bookings: 34, revenue: 20100, ly: { clicks: 251, bookings: 30, revenue: 17300 } },
  { m: 8, sent: 4610, opens: 2410, clicks: 331, bookings: 42, revenue: 25200, ly: { clicks: 270, bookings: 33, revenue: 19100 } },
  { m: 9, sent: 4790, opens: 2520, clicks: 356, bookings: 46, revenue: 27900, ly: { clicks: 301, bookings: 38, revenue: 22400 } },
  { m: 10, sent: 4950, opens: 2480, clicks: 318, bookings: 39, revenue: 24300, ly: { clicks: 322, bookings: 41, revenue: 25800 } },
];

export const CAMPAIGN_PERF: Record<string, { email: number; text: number; direct: number; ota: number; bookings: number; ly: number }> = {
  alv: { email: 7.1, text: 9.4, direct: 8.8, ota: 6.2, bookings: 11, ly: 8 },
  m3: { email: 8.4, text: 10.2, direct: 9.6, ota: 7.9, bookings: 14, ly: 9 },
  m6: { email: 6.0, text: 7.1, direct: 6.8, ota: 5.4, bookings: 6, ly: 6 },
  m9: { email: 5.2, text: 6.0, direct: 5.9, ota: 4.7, bookings: 4, ly: 5 },
  m12: { email: 4.8, text: 5.5, direct: 5.3, ota: 4.2, bookings: 5, ly: 4 },
  m15: { email: 3.3, text: 4.1, direct: 3.8, ota: 2.9, bookings: 2, ly: 3 },
  m15p: { email: 2.6, text: 3.2, direct: 3.0, ota: 2.3, bookings: 1, ly: 2 },
  conf: { email: 61.2, text: 0, direct: 63.0, ota: 58.9, bookings: 0, ly: 0 },
  pre: { email: 44.8, text: 38.2, direct: 46.1, ota: 41.0, bookings: 0, ly: 0 },
  welcome: { email: 0, text: 22.4, direct: 23.1, ota: 21.2, bookings: 0, ly: 0 },
  mid: { email: 0, text: 18.9, direct: 19.5, ota: 17.8, bookings: 0, ly: 0 },
  post: { email: 12.3, text: 14.0, direct: 13.1, ota: 11.6, bookings: 0, ly: 0 },
};

/* Published versions with adoption across the portfolio. */
export type PublishedVersion = { id: string; name: string; v: string; when: string; month: number; from: number; to: number; by: string; ai: boolean; campaigns: string[]; aiProps: number; ownProps: number; totalProps: number; clickRate: number; live: boolean; note: string };
export const PUBLISHED_VERSIONS: PublishedVersion[] = [
  { id: "pv4", name: "Fall 2026 · Holiday season", v: "v4", when: "Sep 22, 2026", month: 8, from: 10, to: 11, by: "Directful AI", ai: true, campaigns: ["alv", "m3", "m6", "m9", "m12"], aiProps: 38, ownProps: 9, totalProps: 52, clickRate: 7.4, live: false, note: "Scheduled — goes live Nov 1" },
  { id: "pv3", name: "Fall 2026 · Autumn in NYC", v: "v3", when: "Sep 2, 2026", month: 8, from: 8, to: 10, by: "Directful AI", ai: true, campaigns: ["alv", "m3", "m6", "m9", "m12", "m15", "m15p", "conf", "pre", "post"], aiProps: 41, ownProps: 11, totalProps: 52, clickRate: 6.8, live: true, note: "Live now" },
  { id: "pv2", name: "Summer 2026 · Rooftop season", v: "v2", when: "Jun 12, 2026", month: 5, from: 5, to: 7, by: "Maria Chen", ai: false, campaigns: ["alv", "m3", "m6", "m12", "conf", "pre", "welcome", "mid", "post"], aiProps: 29, ownProps: 20, totalProps: 49, clickRate: 6.1, live: false, note: "Replaced by v3" },
  { id: "pv1", name: "Spring 2026 · Original content", v: "v1", when: "Mar 3, 2026", month: 2, from: 2, to: 4, by: "Maria Chen", ai: false, campaigns: ["alv", "m3", "m6", "m9", "m12", "m15", "m15p", "conf", "pre", "welcome", "mid", "post"], aiProps: 18, ownProps: 28, totalProps: 46, clickRate: 5.2, live: false, note: "Archived" },
];
