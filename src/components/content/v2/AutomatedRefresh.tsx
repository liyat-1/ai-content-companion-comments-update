import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  History,
  Mail,
  MessageSquareText,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

function useStore() {
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

function Attribution() {
  return <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand"><Sparkles size={13} />Directful recommendation · AI-assisted</span>;
}

function SegmentControl<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; icon?: React.ReactNode }[]; onChange: (value: T) => void; label: string }) {
  return <div className="inline-flex rounded-md border border-border bg-muted/60 p-1" aria-label={label}>{options.map((option) => <Button key={option.value} variant={value === option.value ? "default" : "ghost"} size="sm" className="h-8 gap-1.5 px-3" onClick={() => onChange(option.value)}>{option.icon}{option.label}</Button>)}</div>;
}

function EmailPreview({ title, meta, body, current }: { title: string; meta: string; body: string; current?: boolean }) {
  const subject = body.split(/[.!?]/)[0] || "Your next Harbor House stay";
  return <article className={`overflow-hidden rounded-md border bg-card ${current ? "border-brand/50 shadow-lift" : "border-border"}`}>
    <div className="flex items-center justify-between border-b border-border bg-muted/45 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2"><Mail size={15} className={current ? "text-brand" : "text-muted-foreground"} /><div className="min-w-0"><p className={`truncate text-[13px] font-semibold ${current ? "text-brand" : "text-card-foreground"}`}>{title}</p><p className="text-[11px] text-muted-foreground">{meta}</p></div></div>
      {current && <AiMark size={27} />}
    </div>
    <div className="border-b border-border px-5 py-3">
      <p className="text-[11px] text-muted-foreground">Harbor House &lt;stay@harborhouse.com&gt;</p>
      <p className="mt-1 truncate text-[13px] font-semibold text-card-foreground">{subject}</p>
    </div>
    <div className="min-h-[250px] px-6 py-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-card-foreground">Harbor House</p>
      <div className="my-6 h-px bg-border" />
      <h3 className="font-display text-[20px] font-semibold text-card-foreground">Your next harbor stay</h3>
      <p className="mt-4 text-[14px] leading-7 text-card-foreground">Hi Alex,</p>
      <p className="mt-2 text-[14px] leading-7 text-card-foreground">{body}</p>
      <span className="mt-6 inline-flex rounded-sm bg-brand px-4 py-2.5 text-[12px] font-semibold text-brand-foreground">Plan your return</span>
    </div>
    <div className="border-t border-border bg-muted/30 px-5 py-3 text-[10px] text-muted-foreground">Harbor House · 18 Harbor Way · Unsubscribe</div>
  </article>;
}

function TextPreview({ title, meta, body, current }: { title: string; meta: string; body: string; current?: boolean }) {
  return <article className={`rounded-md border bg-card p-4 ${current ? "border-brand/50 shadow-lift" : "border-border"}`}>
    <div className="flex items-center justify-between border-b border-border pb-3">
      <div className="flex items-center gap-2"><MessageSquareText size={15} className={current ? "text-brand" : "text-muted-foreground"} /><div><p className={`text-[13px] font-semibold ${current ? "text-brand" : "text-card-foreground"}`}>{title}</p><p className="text-[11px] text-muted-foreground">{meta}</p></div></div>
      {current && <AiMark size={27} />}
    </div>
    <div className="mx-auto flex min-h-[250px] max-w-sm flex-col justify-end px-3 py-6">
      <div className="mb-5 text-center"><div className="mx-auto grid size-10 place-items-center rounded-full bg-foreground text-[12px] font-bold text-background">HH</div><p className="mt-1 text-[11px] font-semibold text-card-foreground">Harbor House</p></div>
      <div className={`max-w-[88%] rounded-[18px] rounded-bl-sm px-4 py-3 text-[14px] leading-6 ${current ? "bg-brand text-brand-foreground" : "bg-muted text-card-foreground"}`}>{body}</div>
      <p className="mt-2 pl-1 text-[10px] text-muted-foreground">Delivered · 10:42 AM</p>
    </div>
  </article>;
}

function ContentComparison({ channel, previous, current, previousMeta }: { channel: Channel; previous: string; current: string; previousMeta: string }) {
  if (channel === "Text") return <div className="grid gap-4 lg:grid-cols-2"><TextPreview title="Previous content" meta={previousMeta} body={previous} /><TextPreview title="Directful recommendation" meta="Updated 2 min ago" body={current} current /></div>;
  return <div className="grid gap-4 lg:grid-cols-2"><EmailPreview title="Previous content" meta={previousMeta} body={previous} /><EmailPreview title="Directful recommendation" meta="Updated 2 min ago" body={current} current /></div>;
}

export function AutomatedRefresh() {
  const { state, patch } = useStore();
  const [screen, setScreen] = useState<"announce" | "review" | "edit" | "library">("announce");
  const [campaignId, setCampaignId] = useState("alv");
  const [audience, setAudience] = useState<Audience>("Direct");
  const [channel, setChannel] = useState<Channel>("Email");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyId, setHistoryId] = useState<Record<string, string>>({});

  const campaign = CAMPAIGNS.find((item) => item.id === campaignId) ?? CAMPAIGNS[0];
  const selectedHistory = campaign.history.find((item) => item.id === historyId[campaign.id]) ?? campaign.history[0];
  const currentContent = state[campaign.id]?.current ?? campaign.recommended;
  const previousCopy = selectedHistory.content[audience][channel.toLowerCase() as "email" | "text"];
  const recommendedCopy = currentContent[audience][channel.toLowerCase() as "email" | "text"];
  const reviewed = Boolean(state[campaign.id]?.reviewed);

  const goLibrary = () => {
    sessionStorage.setItem("content-v2-entered", "true");
    setScreen("library");
  };

  if (screen === "library") return <><div className="border-b border-border bg-card px-6 py-2 text-center text-[13px]">Directful refreshed your automated invite content. <Button variant="link" className="h-auto px-1 py-0" onClick={() => setScreen("review")}>See the recommendation</Button></div><V2Workspace /></>;

  return <MarketingShell title="Automated Invites · Content refresh">
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6">
      {screen === "announce" && <section className="ai-surface ai-grid relative overflow-hidden rounded-md border border-border bg-card shadow-card">
        <div className="grid min-h-[600px] lg:grid-cols-[1.02fr_.98fr]">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <div className="flex items-center gap-3"><AiMark size={40} live /><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">Automated Invites</p></div>
            <h1 className="mt-6 max-w-xl font-display text-[38px] font-semibold leading-[1.08] text-card-foreground sm:text-[46px]">Fresh content, ready for your review</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-card-foreground">Directful refreshed your guest invitations to feel more timely, personal, and relevant to the season.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["7 invite moments", "Email + Text", "Direct + OTA", "31 properties"].map((item) => <span key={item} className="rounded-sm border border-border bg-card/85 px-3 py-2 text-[12px] font-semibold text-card-foreground shadow-sm">{item}</span>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><Button variant="brand" size="lg" onClick={() => setScreen("review")}>See Directful’s suggestion <ArrowRight size={16} /></Button><Button variant="ghost" onClick={goLibrary}>Keep current content</Button></div>
          </div>
          <div className="relative flex items-center justify-center overflow-hidden border-t border-border bg-brand-soft/55 p-7 lg:border-l lg:border-t-0">
            <div className="w-full max-w-md space-y-3">
              <div className="starter-rise ml-10 rounded-md border border-border bg-card p-5 shadow-lift [animation-delay:80ms]"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-muted-foreground">AFTER LAST VISIT</span><Attribution /></div><p className="mt-4 text-[16px] font-semibold text-card-foreground">A warmer reason to return</p><p className="mt-2 text-[13px] leading-6 text-muted-foreground">October harbor mornings, clearer booking value, less generic copy.</p></div>
              <div className="starter-rise mr-10 rounded-md border border-border bg-card p-5 shadow-lift [animation-delay:160ms]"><div className="flex items-center gap-2"><MessageSquareText size={15} className="text-brand" /><span className="text-[11px] font-semibold text-muted-foreground">TEXT</span></div><div className="mt-4 rounded-[16px] rounded-bl-sm bg-brand px-4 py-3 text-[13px] leading-5 text-brand-foreground">Already missing the harbor? Come back for crisp October mornings.</div></div>
              <div className="starter-rise ml-16 rounded-md border border-brand/30 bg-card p-4 shadow-lift [animation-delay:240ms]"><p className="text-[12px] font-semibold text-card-foreground">Recommendation is already improving</p><div className="mt-3 flex items-end gap-2"><span className="text-[28px] font-semibold text-brand">6.2%</span><span className="pb-1 text-[11px] text-muted-foreground">click rate · up 0.4%</span></div></div>
            </div>
          </div>
        </div>
      </section>}

      {(screen === "review" || screen === "edit") && <>
        <div className="mb-5 flex items-center justify-between gap-3"><Button variant="ghost" size="sm" onClick={() => setScreen("announce")}><ArrowLeft size={14} />Refresh summary</Button><Button variant="ghost" size="icon" aria-label="Close recommendation" title="Close recommendation" onClick={goLibrary}><X size={17} /></Button></div>
        <nav className="mb-7 flex gap-1 overflow-x-auto border-b border-border pb-3" aria-label="Invite timing">
          {CAMPAIGNS.map((item) => <Button key={item.id} variant={campaign.id === item.id ? "default" : "ghost"} size="sm" className="shrink-0" onClick={() => { setCampaignId(item.id); setScreen("review"); }}>{state[item.id]?.reviewed && <Check size={13} />}{item.name}</Button>)}
        </nav>
      </>}

      {screen === "review" && <section className="space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-[32px] font-semibold text-card-foreground">{campaign.name}</h1>{reviewed && <span className="rounded-sm bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand">Reviewed</span>}</div><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2"><Attribution /><span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground"><Building2 size={13} />Used by {campaign.properties} of 31 properties</span><span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground"><Clock3 size={13} />Updated 2 min ago</span></div></div>
          <div className="flex flex-wrap gap-2"><SegmentControl value={audience} label="Guest audience" options={[{ value: "Direct", label: "Direct" }, { value: "OTA", label: "OTA" }]} onChange={setAudience} /><SegmentControl value={channel} label="Message channel" options={[{ value: "Email", label: "Email", icon: <Mail size={13} /> }, { value: "Text", label: "Text", icon: <MessageSquareText size={13} /> }]} onChange={setChannel} /></div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Compared with the content it replaced</p><p className="mt-0.5 text-[13px] font-semibold text-card-foreground">{selectedHistory.date} · {selectedHistory.editor}</p></div>
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}><History size={14} />Choose from history<ChevronDown size={13} /></Button>
        </div>

        <ContentComparison channel={channel} previous={previousCopy} current={recommendedCopy} previousMeta={selectedHistory.date} />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-md border border-border bg-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Creative shift</p>
            <h2 className="mt-2 text-[20px] font-semibold text-card-foreground">From a general follow-up to a reason to return</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-md bg-muted/60 p-4"><p className="text-[11px] font-semibold uppercase text-muted-foreground">Before</p><p className="mt-2 text-[13px] leading-6 text-card-foreground">{campaign.oldDirection}</p></div><div className="rounded-md bg-brand-soft p-4"><p className="text-[11px] font-semibold uppercase text-brand">Directful direction</p><p className="mt-2 text-[13px] leading-6 text-card-foreground">{campaign.newDirection}</p></div></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">{campaign.changes.map((change) => <div key={change} className="flex items-start gap-2 text-[13px] text-card-foreground"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Check size={12} /></span>{change}</div>)}</div>
          </article>
          <article className="rounded-md border border-border bg-card p-6"><div className="flex items-center gap-3"><AiMark size={32} /><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Why this direction</p><h2 className="mt-0.5 text-[18px] font-semibold text-card-foreground">Built for this guest moment</h2></div></div><p className="mt-5 text-[14px] leading-7 text-card-foreground">{campaign.why}</p><p className="mt-4 border-t border-border pt-4 text-[12px] text-muted-foreground">The recommendation adapts by audience. OTA copy introduces direct-booking value; Direct copy can lead with familiarity and loyalty.</p></article>
        </div>

        <article className="rounded-md border border-border bg-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">Live signal</p><h2 className="mt-1 text-[20px] font-semibold text-card-foreground">How it’s performing</h2></div><span className="rounded-sm bg-brand-soft px-3 py-2 text-[12px] font-semibold text-brand">Your content is performing better</span></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">{campaign.metrics.map((metric) => { const improved = metric.lowerIsBetter ? metric.cur < metric.prev : metric.cur > metric.prev; return <div key={metric.label} className="rounded-md border border-border p-4"><p className="text-[12px] font-medium text-muted-foreground">{metric.label}</p><div className="mt-3 flex items-end justify-between"><div><p className="text-[11px] text-muted-foreground">Previous</p><p className="text-[18px] font-semibold text-card-foreground">{fmt(metric.prev)}</p></div><ArrowRight size={15} className="mb-2 text-muted-foreground" /><div className="text-right"><p className="text-[11px] text-muted-foreground">Recommendation</p><p className={`text-[22px] font-semibold ${improved ? "text-brand" : "text-warning"}`}>{fmt(metric.cur)} {metric.cur === metric.prev ? "" : metric.cur > metric.prev ? "↑" : "↓"}</p></div></div></div>; })}</div>
          <p className="mt-4 text-[13px] text-muted-foreground">The most recent Directful recommendation is compared with the version it replaced. Results reflect this campaign across participating properties.</p>
        </article>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card/95 p-4 shadow-float backdrop-blur lg:sticky lg:bottom-4 lg:z-10">
          <p className="text-[13px] text-muted-foreground">Review this recommendation or adjust the copy before the next send.</p><div className="flex gap-2"><Button variant="outline" onClick={() => setScreen("edit")}>Edit content</Button><Button variant="brand" onClick={() => patch(campaign.id, { reviewed: true })}>{reviewed ? <><Check size={15} />Reviewed</> : "Review content"}</Button></div>
        </div>
      </section>}

      {screen === "edit" && <EditView campaign={campaign} audience={audience} channel={channel} current={currentContent} onBack={() => setScreen("review")} onSave={(text) => { const field = channel.toLowerCase() as "email" | "text"; patch(campaign.id, { current: { ...currentContent, [audience]: { ...currentContent[audience], [field]: text } } }); setScreen("review"); }} />}
    </main>

    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Content history · {campaign.name}</DialogTitle></DialogHeader><p className="text-[13px] text-muted-foreground">Choose a past publication to compare. The current recommendation stays unchanged.</p><div className="mt-2 divide-y divide-border">{campaign.history.map((version, index) => { const selected = selectedHistory.id === version.id; return <div key={version.id} className="flex items-center justify-between gap-4 py-4"><div><div className="flex items-center gap-2"><p className="text-[14px] font-semibold text-card-foreground">{version.date}</p>{index === 0 && <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Replaced version</span>}</div><p className="mt-1 text-[12px] text-muted-foreground">{version.editor}</p><p className="mt-2 line-clamp-1 text-[12px] text-card-foreground">{version.content[audience][channel.toLowerCase() as "email" | "text"]}</p></div><Button variant={selected ? "default" : "outline"} size="sm" onClick={() => { setHistoryId((value) => ({ ...value, [campaign.id]: version.id })); setHistoryOpen(false); }}>{selected ? <><Check size={13} />Comparing</> : "Compare"}</Button></div>; })}</div></DialogContent></Dialog>
  </MarketingShell>;
}

function EditView({ campaign, audience, channel, current, onBack, onSave }: { campaign: Campaign; audience: Audience; channel: Channel; current: Record<Audience, Content>; onBack: () => void; onSave: (text: string) => void }) {
  const field = channel.toLowerCase() as "email" | "text";
  const [draft, setDraft] = useState(current[audience][field]);
  const preview = useMemo(() => channel === "Email" ? <EmailPreview title="Live preview" meta={`${audience} guests · Email`} body={draft} current /> : <TextPreview title="Live preview" meta={`${audience} guests · Text`} body={draft} current />, [audience, channel, draft]);
  return <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><div className="rounded-md border border-border bg-card p-6"><Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={14} />Back to recommendation</Button><h1 className="mt-5 font-display text-[28px] font-semibold text-card-foreground">Edit {campaign.name}</h1><p className="mt-1 text-[13px] text-muted-foreground">{audience} guests · {channel}</p><label htmlFor="message" className="mt-6 block text-[12px] font-semibold text-card-foreground">Message</label><Textarea id="message" value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-2 min-h-[240px] text-[14px] leading-7" /><div className="mt-5 flex gap-2"><Button variant="brand" onClick={() => onSave(draft)}>Save changes</Button><Button variant="ghost" onClick={onBack}>Cancel</Button></div></div><div>{preview}</div></section>;
}