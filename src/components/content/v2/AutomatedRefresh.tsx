import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowRightIcon,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Mail,
  MessageSquareText,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiMark } from "@/components/content/shared";
import { V2Workspace } from "./V2Workspace";

type Audience = "Direct" | "OTA";
type Channel = "Email" | "Text";
type Metric = { label: string; prev: number; cur: number; lowerIsBetter?: boolean };
type Content = { email: string; text: string };
type Version = { id: string; date: string; editor: string; content: Record<Audience, Content> };
type Campaign = {
  id: string;
  name: string;
  properties: number;
  previous: Record<Audience, Content>;
  recommended: Record<Audience, Content>;
  history: Version[];
  changes: string[];
  oldDirection: string;
  newDirection: string;
  why: string;
  metrics: Metric[];
};

const audienceContent = (email: string, text: string, otaEmail?: string, otaText?: string): Record<Audience, Content> => ({
  Direct: { email, text },
  OTA: { email: otaEmail ?? email.replace("Book direct", "Discover the benefits of booking direct"), text: otaText ?? text.replace("Book direct", "See direct-booking benefits") },
});

const makeCampaign = (
  id: string,
  name: string,
  properties: number,
  previous: Record<Audience, Content>,
  recommended: Record<Audience, Content>,
  changes: string[],
  oldDirection: string,
  newDirection: string,
  why: string,
  metricValues: [number, number, number, number, number, number],
): Campaign => ({
  id,
  name,
  properties,
  previous,
  recommended,
  changes,
  oldDirection,
  newDirection,
  why,
  metrics: [
    { label: "Click rate", prev: metricValues[0], cur: metricValues[1] },
    { label: "Click-to-book", prev: metricValues[2], cur: metricValues[3] },
    { label: "Spam rate", prev: metricValues[4], cur: metricValues[5], lowerIsBetter: true },
  ],
  history: [
    { id: `${id}-sep`, date: "September 4, 2026", editor: "Published by Maria Santos", content: previous },
    {
      id: `${id}-jan`,
      date: "January 27, 2026",
      editor: "Edited by Daniel Kim",
      content: audienceContent(
        previous.Direct.email.replace("Thank you", "Thanks so much"),
        previous.Direct.text.replace("Thank you", "Thanks"),
        previous.OTA.email.replace("Thank you", "Thanks so much"),
        previous.OTA.text.replace("Thank you", "Thanks"),
      ),
    },
    {
      id: `${id}-nov`,
      date: "November 12, 2025",
      editor: "Published by Directful",
      content: audienceContent(
        `We would love to welcome you back to Harbor House. ${previous.Direct.email.split(". ").at(-1) ?? "Plan your next stay with us."}`,
        "Harbor House would love to welcome you back. Plan your next stay when the time is right.",
      ),
    },
  ],
});

const CAMPAIGNS: Campaign[] = [
  makeCampaign(
    "alv",
    "After Last Visit",
    18,
    audienceContent(
      "Thank you for staying with us at Harbor House. We hope you enjoyed your visit and everything our team prepared for you. We look forward to seeing you again sometime soon.",
      "Thank you for staying at Harbor House. We hope to see you again soon.",
      "Thank you for choosing Harbor House for your recent stay. We hope your visit was enjoyable and look forward to welcoming you again.",
      "Thanks for choosing Harbor House. We hope you enjoyed your stay and would love to welcome you back.",
    ),
    audienceContent(
      "It was a pleasure having you at Harbor House. October brings crisp harbor mornings — come back and enjoy them with us. Book direct for our best rate.",
      "Already missing the harbor? October brings crisp mornings and quiet waterfront walks. Come back to Harbor House — book direct for our best rate.",
      "It was a pleasure welcoming you to Harbor House. Next time, discover our direct-booking benefits and enjoy a more personal return to the harbor.",
      "Loved your Harbor House stay? Come back for crisp harbor mornings and discover the benefits of booking with us directly.",
    ),
    ["Shortened the opening", "Shifted from a thank-you to a return invitation", "Added a clearer direct-booking reason", "Introduced light October context"],
    "Polite and appreciative, but broad. The message thanked guests without giving them a memorable reason to return.",
    "Warm, seasonal, and purposeful. It reconnects through a specific harbor moment, then offers one clear next step.",
    "Recent guests still remember the property, so a vivid seasonal cue is more useful than another general thank-you. The shorter structure also makes the booking reason easier to act on.",
    [5.8, 6.2, 2.4, 2.8, 0.5, 0.4],
  ),
  makeCampaign("m3", "3 Months", 16, audienceContent("It has been a few months since your stay. We would love to see you again. Visit our website to see current offers.", "It has been a few months. Visit Harbor House again soon."), audienceContent("Three months already? Fall is lovely on the harbor. Your room is waiting — book direct and enjoy late checkout.", "Three months already? Return to Harbor House this fall and enjoy late checkout when you book direct."), ["Opened with a friendly time cue", "Added a direct-booking perk", "Made the return feel seasonal"], "A general reminder with no distinctive reason to return.", "A timely invitation with a concrete benefit and a light autumn mood.", "At three months, guests respond best to a familiar reminder paired with one useful reason to act.", [4.9, 5.4, 1.9, 2.2, 0.4, 0.4]),
  makeCampaign("m6", "6 Months", 15, audienceContent("We miss you at Harbor House. It has been six months since your stay. Check out what is new and plan your next getaway.", "Six months already? See what is new at Harbor House."), audienceContent("Six months since your last harbor escape. We have refreshed our rooms and autumn menu — see what is new and book your return direct.", "Six months since your harbor escape. New rooms, a new autumn menu, and your next stay are waiting."), ["Highlighted what is new", "Made the property feel active", "Clarified the booking step"], "Friendly, but dependent on a generic ‘we miss you’ message.", "Discovery-led and specific, with fresh reasons to reconsider the property.", "Guests at six months need a new reason to put the property back on their shortlist.", [4.2, 4.6, 1.6, 1.8, 0.5, 0.4]),
  makeCampaign("m9", "9 Months", 14, audienceContent("Ready for a return? Book direct and save 10%.", "Come back to Harbor House and save 10%."), audienceContent("It has been nine months since we welcomed you. As the season changes, we have been thinking of guests like you. Whenever you are ready, we would love to host you again.", "A new season is here. Whenever you are ready, Harbor House would love to welcome you back."), ["Made the message more personal", "Softened the sales language", "Added seasonal relevance"], "Short and promotional, leading immediately with a discount.", "Relationship-led and thoughtful, rebuilding familiarity before making an offer.", "Nine-month guests may need an emotional reconnection before they are ready for a booking prompt.", [5.1, 4.7, 3.4, 2.8, 0.3, 0.4]),
  makeCampaign("m12", "12 Months", 13, audienceContent("It has been a year. Come celebrate with us again at Harbor House.", "One year already? Come celebrate at Harbor House."), audienceContent("A year ago you stayed with us — let us make it a tradition. Celebrate your anniversary trip at Harbor House and book direct for a welcome treat.", "A year ago, you stayed at Harbor House. Make it a tradition — return direct for a welcome treat."), ["Framed the timing as an anniversary", "Added a welcome-back benefit", "Created a stronger emotional hook"], "A simple anniversary reminder without a reason to continue the tradition.", "Celebratory and personal, turning elapsed time into a reason to return.", "Anniversary framing gives year-out guests a natural occasion to revisit.", [5.5, 6.1, 2.1, 2.6, 0.4, 0.3]),
  makeCampaign("m15", "15 Months", 11, audienceContent("We have not seen you in a while. We hope you will consider staying with us again.", "We have not seen you in a while. Visit Harbor House again."), audienceContent("Harbor House has changed in all the best ways. Come see the new waterfront terrace — book direct for our best rate.", "There is something new at Harbor House: our waterfront terrace. Come see it and book direct."), ["Replaced passive wording", "Introduced the new terrace", "Added a clear next step"], "Passive and generic, asking for consideration without creating interest.", "Confident and discovery-led, centered on something genuinely new.", "Longer-lapsed guests need fresh news, not only a reminder of their last visit.", [3.2, 3.9, 1.1, 1.5, 0.6, 0.5]),
  makeCampaign("m15p", "15 Months+", 9, audienceContent("Come back to Harbor House. Book direct for 15% off your next stay this week only.", "15% off Harbor House this week. Book now."), audienceContent("We would love to reconnect. Much has changed at Harbor House, from our rooms to our restaurant. Take a look at what is new when you have a moment.", "A lot has changed at Harbor House. Rediscover the rooms, restaurant, and harbor when the time is right."), ["Removed deadline pressure", "Made the tone more welcoming", "Focused on rediscovery"], "Urgent and discount-led, with a hard deadline for a distant guest.", "Gentle and curiosity-led, inviting guests to rediscover the whole property.", "Long-lapsed guests are more likely to re-engage through discovery than a sudden hard sell.", [3.6, 3.1, 1.8, 1.2, 0.4, 0.5]),
];

type SavedState = Record<string, { reviewed?: boolean; current?: Record<Audience, Content> }>;
const KEY = "directful-auto-refresh-v2";

export function useStore() {
  const [state, setState] = useState<SavedState>({});
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) setState(JSON.parse(saved) as SavedState);
    } catch {
      // The demo continues with its seeded recommendation.
    }
  }, []);
  const patch = (id: string, value: SavedState[string]) => setState((previous) => {
    const next = { ...previous, [id]: { ...previous[id], ...value } };
    sessionStorage.setItem(KEY, JSON.stringify(next));
    return next;
  });
  return { state, patch };
}

const fmt = (value: number) => `${value.toFixed(1)}%`;
const channelKey = (channel: Channel) => channel.toLowerCase() as "email" | "text";

function Attribution() {
  return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand"><Sparkles size={12} />Directful recommendation · AI-assisted</span>;
}

function SegmentControl<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; icon?: React.ReactNode }[]; onChange: (value: T) => void; label: string }) {
  return <div className="inline-flex rounded-md border border-border bg-muted/60 p-0.5" aria-label={label}>{options.map((option) => <Button key={option.value} variant={value === option.value ? "default" : "ghost"} size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]" onClick={() => onChange(option.value)}>{option.icon}{option.label}</Button>)}</div>;
}

type DiffPart = { text: string; kind: "same" | "removed" | "added" };
function wordDiff(previous: string, current: string): { previous: DiffPart[]; current: DiffPart[] } {
  const a = previous.split(/(\s+)/);
  const b = current.split(/(\s+)/);
  const table = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) for (let j = b.length - 1; j >= 0; j -= 1) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const left: DiffPart[] = [];
  const right: DiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { left.push({ text: a[i], kind: "same" }); right.push({ text: b[j], kind: "same" }); i += 1; j += 1; }
    else if (table[i + 1][j] >= table[i][j + 1]) { left.push({ text: a[i], kind: "removed" }); i += 1; }
    else { right.push({ text: b[j], kind: "added" }); j += 1; }
  }
  while (i < a.length) { left.push({ text: a[i], kind: "removed" }); i += 1; }
  while (j < b.length) { right.push({ text: b[j], kind: "added" }); j += 1; }
  return { previous: left, current: right };
}

function DiffText({ parts }: { parts: DiffPart[] }) {
  return <>{parts.map((part, index) => <span key={`${part.text}-${index}`} className={part.kind === "removed" ? "opacity-60 line-through decoration-warning/70" : part.kind === "added" ? "font-semibold underline decoration-highlight decoration-2 underline-offset-2" : ""}>{part.text}</span>)}</>;
}

function emailFields(body: string, current: boolean) {
  const first = body.split(/[.!?]/)[0] || "Your next Harbor House stay";
  return {
    subject: current ? first : first,
    preheader: current ? "A timely reason to return to the harbor." : "We hope to welcome you back soon.",
    body,
    cta: current ? "Plan your return" : "Visit Harbor House",
  };
}

function CompactComparison({ channel, previous, current, previousMeta }: { channel: Channel; previous: string; current: string; previousMeta: string }) {
  const diff = wordDiff(previous, current);
  if (channel === "Text") return <div className="grid gap-3 md:grid-cols-2">
    <article className="rounded-md border border-border bg-card p-3"><div className="mb-2 flex items-center justify-between"><div><p className="text-[12px] font-semibold text-card-foreground">Previous content</p><p className="text-[10px] text-muted-foreground">{previousMeta}</p></div><MessageSquareText size={14} className="text-muted-foreground" /></div><div className="max-w-[92%] rounded-[14px] rounded-bl-sm bg-muted px-3 py-2.5 text-[12px] leading-5"><DiffText parts={diff.previous} /></div></article>
    <article className="rounded-md border border-brand/35 bg-card p-3"><div className="mb-2 flex items-center justify-between"><div><p className="text-[12px] font-semibold text-brand">Directful recommendation</p><p className="text-[10px] text-muted-foreground">Updated 2 min ago</p></div><AiMark size={23} /></div><div className="max-w-[92%] rounded-[14px] rounded-bl-sm bg-brand px-3 py-2.5 text-[12px] leading-5 text-brand-foreground"><DiffText parts={diff.current} /></div></article>
  </div>;
  const oldEmail = emailFields(previous, false);
  const newEmail = emailFields(current, true);
  const fields = [
    ["Subject", oldEmail.subject, newEmail.subject],
    ["Preheader", oldEmail.preheader, newEmail.preheader],
    ["Email body", oldEmail.body, newEmail.body],
    ["Button", oldEmail.cta, newEmail.cta],
  ] as const;
  return <div className="grid gap-3 md:grid-cols-2">
    {[false, true].map((isCurrent) => <article key={String(isCurrent)} className={`overflow-hidden rounded-md border bg-card ${isCurrent ? "border-brand/35" : "border-border"}`}><div className="flex items-center justify-between border-b border-border bg-muted/35 px-3 py-2"><div className="flex items-center gap-2"><span className="flex gap-1" aria-hidden>{[0,1,2].map((dot) => <span key={dot} className="size-1.5 rounded-full bg-muted-foreground/45" />)}</span><div><p className={`text-[12px] font-semibold ${isCurrent ? "text-brand" : "text-card-foreground"}`}>{isCurrent ? "Directful recommendation" : "Previous content"}</p><p className="text-[10px] text-muted-foreground">{isCurrent ? "Updated 2 min ago" : previousMeta}</p></div></div>{isCurrent && <AiMark size={23} />}</div><div className="divide-y divide-border">{fields.map(([label, oldValue, newValue]) => { const fieldDiff = wordDiff(oldValue, newValue); return <div key={label} className="grid grid-cols-[72px_minmax(0,1fr)] gap-2 px-3 py-2"><p className="text-[10px] font-semibold text-muted-foreground">{label}</p><p className={`text-[11px] leading-4 ${label === "Button" ? "font-semibold text-brand" : ""}`}><DiffText parts={isCurrent ? fieldDiff.current : fieldDiff.previous} /></p></div>; })}</div></article>)}
  </div>;
}

function performanceState(campaign: Campaign) {
  const meaningful = campaign.metrics.filter((metric) => metric.label !== "Spam rate");
  const score = meaningful.reduce((sum, metric) => sum + (metric.cur - metric.prev), 0);
  if (score > 0.05) return "better" as const;
  if (score < -0.05) return "previous-better" as const;
  return "steady" as const;
}

export function AutomatedRefresh() {
  const { state, patch } = useStore();
  const [entered, setEntered] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [audience, setAudience] = useState<Audience>("Direct");
  const [channel, setChannel] = useState<Channel>("Email");
  const [historyId, setHistoryId] = useState<Record<string, string>>({});

  const campaign = CAMPAIGNS.find((item) => item.id === reviewId) ?? CAMPAIGNS[0];
  const selectedHistory = campaign.history.find((item) => item.id === historyId[campaign.id]) ?? campaign.history[0];
  const currentContent = state[campaign.id]?.current ?? campaign.recommended;
  const previousCopy = selectedHistory.content[audience][channelKey(channel)];
  const recommendedCopy = currentContent[audience][channelKey(channel)];
  const result = performanceState(campaign);
  const reviewedCampaigns = Object.entries(state).filter(([, value]) => value.reviewed).map(([id]) => id);

  const openReview = (id: string) => {
    setReviewId(id);
    patch(id, { reviewed: true });
  };
  const closeReview = () => {
    sessionStorage.setItem("content-v2-entered", "true");
    setEntered(true);
    setReviewId(null);
  };
  const usePrevious = () => {
    patch(campaign.id, { reviewed: true, current: selectedHistory.content });
    setReviewId(null);
    setEntered(true);
  };

  return <MarketingShell title="Automated Invites · Content refresh">
    {!entered ? <main className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6"><section className="ai-surface ai-grid relative overflow-hidden rounded-md border border-border bg-card shadow-card"><div className="grid min-h-[540px] lg:grid-cols-[1.02fr_.98fr]"><div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16"><div className="flex items-center gap-3"><AiMark size={40} live /><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">Automated Invites</p></div><h1 className="mt-6 max-w-xl font-display text-[38px] font-semibold leading-[1.08] text-card-foreground sm:text-[46px]">Fresh content, ready for your review</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-card-foreground">Your automated invite content had not been updated in 80 days, so Directful refreshed it using recent performance patterns and timely seasonal context.</p><p className="mt-3 max-w-xl text-[13px] leading-6 text-muted-foreground">Review what changed across every invite. Your previous versions stay available, and you can return to one at any time.</p><div className="mt-7 flex flex-wrap gap-2">{["7 invite moments", "Email + Text", "Direct + OTA", "31 properties"].map((item) => <span key={item} className="rounded-sm border border-border bg-card/85 px-3 py-2 text-[12px] font-semibold text-card-foreground shadow-sm">{item}</span>)}</div><div className="mt-8"><Button variant="brand" size="lg" onClick={() => openReview("alv")}>See Directful’s suggestions <ArrowRight size={16} /></Button></div></div><div className="relative flex items-center justify-center overflow-hidden border-t border-border bg-brand-soft/55 p-7 lg:border-l lg:border-t-0"><div className="w-full max-w-md space-y-3"><div className="starter-rise ml-10 rounded-md border border-border bg-card p-5 shadow-lift"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-muted-foreground">AFTER LAST VISIT</span><Attribution /></div><p className="mt-4 text-[16px] font-semibold text-card-foreground">A warmer reason to return</p><p className="mt-2 text-[13px] leading-6 text-muted-foreground">October harbor mornings, clearer booking value, less generic copy.</p></div><div className="starter-rise mr-10 rounded-md border border-border bg-card p-5 shadow-lift [animation-delay:120ms]"><div className="flex items-center gap-2"><MessageSquareText size={15} className="text-brand" /><span className="text-[11px] font-semibold text-muted-foreground">TEXT</span></div><div className="mt-4 rounded-[14px] rounded-bl-sm bg-brand px-4 py-3 text-[13px] leading-5 text-brand-foreground">Already missing the harbor? Come back for crisp October mornings.</div></div></div></div></div></section></main> : <V2Workspace onReview={openReview} reviewedCampaigns={reviewedCampaigns} />}

    <Dialog open={reviewId !== null} onOpenChange={(open) => !open && closeReview()}><DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden border-border bg-card p-0 shadow-float"><DialogHeader className="border-b border-border px-5 py-4 pr-12"><div className="flex flex-wrap items-start justify-between gap-3"><div><DialogTitle className="text-[18px]">Directful content review</DialogTitle><div className="mt-1 flex flex-wrap items-center gap-3"><Attribution /><span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Building2 size={12} />{campaign.properties} of 31 properties</span></div></div><div className="flex gap-2"><SegmentControl value={audience} label="Guest audience" options={[{ value: "Direct", label: "Direct" }, { value: "OTA", label: "OTA" }]} onChange={setAudience} /><SegmentControl value={channel} label="Message channel" options={[{ value: "Email", label: "Email", icon: <Mail size={12} /> }, { value: "Text", label: "Text", icon: <MessageSquareText size={12} /> }]} onChange={setChannel} /></div></div></DialogHeader>
      <div className="max-h-[calc(88vh-72px)] overflow-y-auto px-5 py-4">
        <nav className="mb-4 flex gap-1 overflow-x-auto border-b border-border pb-2" aria-label="Invite timing">{CAMPAIGNS.map((item) => <Button key={item.id} variant={campaign.id === item.id ? "default" : "ghost"} size="sm" className="h-7 shrink-0 px-2.5 text-[11px]" onClick={() => openReview(item.id)}>{state[item.id]?.reviewed && <Check size={11} />}{item.name}</Button>)}</nav>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-[18px] font-semibold text-card-foreground">{campaign.name}</h2><p className="text-[11px] text-muted-foreground">Comparing Directful’s recommendation with previous content</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 text-[11px]"><Clock3 size={13} />{selectedHistory.date}<ChevronDown size={12} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64">{campaign.history.map((version, index) => <DropdownMenuItem key={version.id} onSelect={() => setHistoryId((value) => ({ ...value, [campaign.id]: version.id }))} className="flex items-start justify-between"><span><span className="block text-[12px] font-semibold">{version.date}</span><span className="block text-[10px] text-muted-foreground">{version.editor}{index === 0 ? " · Replaced version" : ""}</span></span>{selectedHistory.id === version.id && <Check size={13} className="text-brand" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>
        <CompactComparison channel={channel} previous={previousCopy} current={recommendedCopy} previousMeta={selectedHistory.date} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <section className="rounded-md border border-border p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Creative shift</p>
            <h3 className="mt-1 text-[15px] font-semibold text-card-foreground">From a general follow-up to a reason to return</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-sm bg-muted/55 p-2.5"><p className="text-[9px] font-semibold uppercase text-muted-foreground">Before</p><p className="mt-1.5 text-[11px] leading-4 text-card-foreground">{campaign.oldDirection}</p></div>
              <div className="rounded-sm bg-brand-soft/65 p-2.5"><p className="text-[9px] font-semibold uppercase text-brand">Directful direction</p><p className="mt-1.5 text-[11px] leading-4 text-card-foreground">{campaign.newDirection}</p></div>
            </div>
            <div className="mt-3 grid gap-x-3 gap-y-1.5 sm:grid-cols-2">{campaign.changes.map((change) => <span key={change} className="inline-flex items-start gap-1.5 text-[10px] leading-4 text-card-foreground"><span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Check size={10} /></span>{change}</span>)}</div>
          </section>
          <section className="rounded-md border border-border p-3.5">
            <div className="flex items-center gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-sm bg-brand text-brand-foreground"><Sparkles size={13} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Why this direction</p><h3 className="text-[15px] font-semibold text-card-foreground">Built for this guest moment</h3></div></div>
            <p className="mt-3 text-[11px] leading-5 text-card-foreground">{campaign.why}</p>
            <p className="mt-3 border-t border-border pt-3 text-[10px] leading-4 text-muted-foreground">The recommendation adapts by audience. OTA copy introduces direct-booking value; Direct copy can lead with familiarity and loyalty.</p>
          </section>
        </div>
        <section className="mt-3 rounded-md border border-border p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Live signal</p><h3 className="mt-0.5 text-[15px] font-semibold text-card-foreground">How it’s performing</h3></div><span className={`rounded-sm px-2.5 py-1.5 text-[10px] font-semibold ${result === "previous-better" ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand"}`}>{result === "better" ? "Recommendation performing better" : result === "previous-better" ? `${selectedHistory.date} performed better` : "Performing in line"}</span></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">{campaign.metrics.map((metric) => { const improved = metric.lowerIsBetter ? metric.cur < metric.prev : metric.cur > metric.prev; return <div key={metric.label} className="rounded-sm border border-border p-3"><p className="text-[10px] font-semibold text-muted-foreground">{metric.label}</p><div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-end gap-2"><div><p className="text-[9px] text-muted-foreground">{selectedHistory.date.split(",")[0]}</p><p className="text-[14px] font-semibold text-card-foreground">{fmt(metric.prev)}</p></div><ArrowRightIcon size={13} className="mb-1 text-muted-foreground" /><div className="text-right"><p className="text-[9px] text-muted-foreground">Recommendation</p><p className={`text-[14px] font-semibold ${improved ? "text-brand" : metric.cur === metric.prev ? "text-card-foreground" : "text-warning"}`}>{fmt(metric.cur)} {improved ? (metric.lowerIsBetter ? "↓" : "↑") : metric.cur === metric.prev ? "" : metric.lowerIsBetter ? "↑" : "↓"}</p></div></div></div>; })}</div>
          <p className="mt-3 text-[10px] leading-4 text-muted-foreground">Directful’s recommendation is compared with the selected {selectedHistory.date} version across participating properties.</p>
          {result === "previous-better" && <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3"><Button variant="brand" size="sm" onClick={() => { const field = channelKey(channel); const inspired = `${recommendedCopy} ${selectedHistory.content[audience][field].split(". ")[0]}.`; patch(campaign.id, { reviewed: true, current: { ...currentContent, [audience]: { ...currentContent[audience], [field]: inspired } } }); }}>Improve with AI</Button><Button variant="outline" size="sm" onClick={usePrevious}>Use this version & publish</Button></div>}
        </section>
        {selectedHistory.id !== campaign.history[0].id && result !== "previous-better" && <div className="mt-3 flex justify-end"><Button variant="outline" size="sm" onClick={usePrevious}>Use this version & publish</Button></div>}
        <div className="mt-4 flex justify-end border-t border-border pt-3"><Button variant="outline" onClick={closeReview}><X size={14} />Close</Button></div>
      </div>
    </DialogContent></Dialog>
  </MarketingShell>;
}
