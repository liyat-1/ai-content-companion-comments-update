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
  TrendingDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiMark } from "@/components/content/shared";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
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

const audienceContent = (
  email: string,
  text: string,
  otaEmail?: string,
  otaText?: string,
): Record<Audience, Content> => ({
  Direct: { email, text },
  OTA: {
    email: otaEmail ?? email.replace("Book direct", "Discover the benefits of booking direct"),
    text: otaText ?? text.replace("Book direct", "See direct-booking benefits"),
  },
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
    {
      id: `${id}-sep`,
      date: "September 4, 2026",
      editor: "Published by Maria Santos",
      content: previous,
    },
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
    [
      "Shortened the opening",
      "Shifted from a thank-you to a return invitation",
      "Added a clearer direct-booking reason",
      "Introduced light October context",
    ],
    "Polite and appreciative, but broad. The message thanked guests without giving them a memorable reason to return.",
    "Warm, seasonal, and purposeful. It reconnects through a specific harbor moment, then offers one clear next step.",
    "Recent guests still remember the property, so a vivid seasonal cue is more useful than another general thank-you. The shorter structure also makes the booking reason easier to act on.",
    [5.8, 6.2, 2.4, 2.8, 0.5, 0.4],
  ),
  makeCampaign(
    "m3",
    "3 Months",
    16,
    audienceContent(
      "It has been a few months since your stay. We would love to see you again. Visit our website to see current offers.",
      "It has been a few months. Visit Harbor House again soon.",
    ),
    audienceContent(
      "Three months already? Fall is lovely on the harbor. Your room is waiting — book direct and enjoy late checkout.",
      "Three months already? Return to Harbor House this fall and enjoy late checkout when you book direct.",
    ),
    [
      "Opened with a friendly time cue",
      "Added a direct-booking perk",
      "Made the return feel seasonal",
    ],
    "A general reminder with no distinctive reason to return.",
    "A timely invitation with a concrete benefit and a light autumn mood.",
    "At three months, guests respond best to a familiar reminder paired with one useful reason to act.",
    [4.9, 5.4, 1.9, 2.2, 0.4, 0.4],
  ),
  makeCampaign(
    "m6",
    "6 Months",
    15,
    audienceContent(
      "We miss you at Harbor House. It has been six months since your stay. Check out what is new and plan your next getaway.",
      "Six months already? See what is new at Harbor House.",
    ),
    audienceContent(
      "Six months since your last harbor escape. We have refreshed our rooms and autumn menu — see what is new and book your return direct.",
      "Six months since your harbor escape. New rooms, a new autumn menu, and your next stay are waiting.",
    ),
    ["Highlighted what is new", "Made the property feel active", "Clarified the booking step"],
    "Friendly, but dependent on a generic ‘we miss you’ message.",
    "Discovery-led and specific, with fresh reasons to reconsider the property.",
    "Guests at six months need a new reason to put the property back on their shortlist.",
    [4.2, 4.6, 1.6, 1.8, 0.5, 0.4],
  ),
  makeCampaign(
    "m9",
    "9 Months",
    14,
    audienceContent(
      "Ready for a return? Book direct and save 10%.",
      "Come back to Harbor House and save 10%.",
    ),
    audienceContent(
      "It has been nine months since we welcomed you. As the season changes, we have been thinking of guests like you. Whenever you are ready, we would love to host you again.",
      "A new season is here. Whenever you are ready, Harbor House would love to welcome you back.",
    ),
    ["Made the message more personal", "Softened the sales language", "Added seasonal relevance"],
    "Short and promotional, leading immediately with a discount.",
    "Relationship-led and thoughtful, rebuilding familiarity before making an offer.",
    "Nine-month guests may need an emotional reconnection before they are ready for a booking prompt.",
    [5.1, 4.7, 3.4, 2.8, 0.3, 0.4],
  ),
  makeCampaign(
    "m12",
    "12 Months",
    13,
    audienceContent(
      "It has been a year. Come celebrate with us again at Harbor House.",
      "One year already? Come celebrate at Harbor House.",
    ),
    audienceContent(
      "A year ago you stayed with us — let us make it a tradition. Celebrate your anniversary trip at Harbor House and book direct for a welcome treat.",
      "A year ago, you stayed at Harbor House. Make it a tradition — return direct for a welcome treat.",
    ),
    [
      "Framed the timing as an anniversary",
      "Added a welcome-back benefit",
      "Created a stronger emotional hook",
    ],
    "A simple anniversary reminder without a reason to continue the tradition.",
    "Celebratory and personal, turning elapsed time into a reason to return.",
    "Anniversary framing gives year-out guests a natural occasion to revisit.",
    [5.5, 6.1, 2.1, 2.6, 0.4, 0.3],
  ),
  makeCampaign(
    "m15",
    "15 Months",
    11,
    audienceContent(
      "We have not seen you in a while. We hope you will consider staying with us again.",
      "We have not seen you in a while. Visit Harbor House again.",
    ),
    audienceContent(
      "Harbor House has changed in all the best ways. Come see the new waterfront terrace — book direct for our best rate.",
      "There is something new at Harbor House: our waterfront terrace. Come see it and book direct.",
    ),
    ["Replaced passive wording", "Introduced the new terrace", "Added a clear next step"],
    "Passive and generic, asking for consideration without creating interest.",
    "Confident and discovery-led, centered on something genuinely new.",
    "Longer-lapsed guests need fresh news, not only a reminder of their last visit.",
    [3.2, 3.9, 1.1, 1.5, 0.6, 0.5],
  ),
  makeCampaign(
    "m15p",
    "15 Months+",
    9,
    audienceContent(
      "Come back to Harbor House. Book direct for 15% off your next stay this week only.",
      "15% off Harbor House this week. Book now.",
    ),
    audienceContent(
      "We would love to reconnect. Much has changed at Harbor House, from our rooms to our restaurant. Take a look at what is new when you have a moment.",
      "A lot has changed at Harbor House. Rediscover the rooms, restaurant, and harbor when the time is right.",
    ),
    ["Removed deadline pressure", "Made the tone more welcoming", "Focused on rediscovery"],
    "Urgent and discount-led, with a hard deadline for a distant guest.",
    "Gentle and curiosity-led, inviting guests to rediscover the whole property.",
    "Long-lapsed guests are more likely to re-engage through discovery than a sudden hard sell.",
    [3.6, 3.1, 1.8, 1.2, 0.4, 0.5],
  ),
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
  const patch = (id: string, value: SavedState[string]) =>
    setState((previous) => {
      const next = { ...previous, [id]: { ...previous[id], ...value } };
      sessionStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  return { state, patch };
}

const fmt = (value: number) => `${value.toFixed(1)}%`;
const channelKey = (channel: Channel) => channel.toLowerCase() as "email" | "text";

function Attribution() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand">
      <Sparkles size={12} />
      Directful recommendation · AI-assisted
    </span>
  );
}

function SegmentControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      className="inline-flex rounded-md border border-border bg-muted/60 p-0.5"
      aria-label={label}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[11px]"
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
}

type DiffPart = { text: string; kind: "same" | "removed" | "added" };
function wordDiff(
  previous: string,
  current: string,
): { previous: DiffPart[]; current: DiffPart[] } {
  const a = previous.split(/(\s+)/);
  const b = current.split(/(\s+)/);
  const table = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1)
    for (let j = b.length - 1; j >= 0; j -= 1)
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const left: DiffPart[] = [];
  const right: DiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      left.push({ text: a[i], kind: "same" });
      right.push({ text: b[j], kind: "same" });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      left.push({ text: a[i], kind: "removed" });
      i += 1;
    } else {
      right.push({ text: b[j], kind: "added" });
      j += 1;
    }
  }
  while (i < a.length) {
    left.push({ text: a[i], kind: "removed" });
    i += 1;
  }
  while (j < b.length) {
    right.push({ text: b[j], kind: "added" });
    j += 1;
  }
  return { previous: left, current: right };
}

function DiffText({ parts }: { parts: DiffPart[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={
            part.kind === "removed"
              ? "opacity-60 line-through decoration-warning/70"
              : part.kind === "added"
                ? "rounded-sm bg-highlight px-0.5 font-semibold text-highlight-foreground"
                : ""
          }
        >
          {part.text}
        </span>
      ))}
    </>
  );
}

function emailFields(body: string, current: boolean) {
  const first = body.split(/[.!?]/)[0] || "Your next Harbor House stay";
  return {
    subject: current ? first : first,
    preheader: current
      ? "A timely reason to return to the harbor."
      : "We hope to welcome you back soon.",
    body,
    cta: current ? "Plan your return" : "Visit Harbor House",
  };
}

function CompactComparison({
  channel,
  previous,
  current,
  leftLabel,
  leftMeta,
  rightLabel,
  rightMeta,
}: {
  channel: Channel;
  previous: string;
  current: string;
  leftLabel: string;
  leftMeta: string;
  rightLabel: string;
  rightMeta: string;
}) {
  const diff = wordDiff(previous, current);
  const head = (isRight: boolean) => (
    <div className="min-w-0">
      <p className={`truncate text-[11.5px] font-semibold ${isRight ? "text-brand" : "text-card-foreground"}`}>
        {isRight ? rightLabel : leftLabel}
      </p>
      <p className="truncate text-[10px] text-muted-foreground">{isRight ? rightMeta : leftMeta}</p>
    </div>
  );
  if (channel === "Text")
    return (
      <div className="grid gap-2.5 md:grid-cols-2">
        {[false, true].map((isRight) => (
          <article
            key={String(isRight)}
            className={`rounded-md border bg-card p-3 ${isRight ? "border-brand/35" : "border-border"}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              {head(isRight)}
              {isRight ? <AiMark size={20} /> : <MessageSquareText size={13} className="text-muted-foreground" />}
            </div>
            <div
              className={`max-w-[92%] rounded-[14px] rounded-bl-sm px-3 py-2 text-[11.5px] leading-5 ${isRight ? "bg-brand text-brand-foreground" : "bg-muted"}`}
            >
              <DiffText parts={isRight ? diff.current : diff.previous} />
            </div>
          </article>
        ))}
      </div>
    );
  const oldEmail = emailFields(previous, false);
  const newEmail = emailFields(current, true);
  const fields = [
    ["Subject", oldEmail.subject, newEmail.subject],
    ["Preheader", oldEmail.preheader, newEmail.preheader],
    ["Email body", oldEmail.body, newEmail.body],
    ["Button", oldEmail.cta, newEmail.cta],
  ] as const;
  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      {[false, true].map((isRight) => (
        <article
          key={String(isRight)}
          className={`overflow-hidden rounded-md border bg-card ${isRight ? "border-brand/35" : "border-border"}`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/35 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex gap-1" aria-hidden>
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="size-1.5 rounded-full bg-muted-foreground/45" />
                ))}
              </span>
              {head(isRight)}
            </div>
            {isRight ? <AiMark size={20} /> : <Mail size={13} className="text-muted-foreground" />}
          </div>
          <div className="divide-y divide-border">
            {fields.map(([label, oldValue, newValue]) => {
              const fieldDiff = wordDiff(oldValue, newValue);
              return (
                <div key={label} className="grid grid-cols-[66px_minmax(0,1fr)] gap-2 px-3 py-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
                  <p className={`text-[11px] leading-4 ${label === "Button" ? "font-semibold text-brand" : ""}`}>
                    <DiffText parts={isRight ? fieldDiff.current : fieldDiff.previous} />
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

/** Demo stats for a published version: the replaced version uses the campaign's real prior metrics. */
function versionStats(campaign: Campaign, index: number) {
  const click = campaign.metrics.find((m) => m.label === "Click rate")?.prev ?? 4;
  const spam = campaign.metrics.find((m) => m.label === "Spam rate")?.prev ?? 0.5;
  const offsets = [0, -0.6, -1.1, -1.5];
  return {
    click: Math.max(0.5, click + (offsets[index] ?? -1.8)),
    spam: Math.max(0.1, spam + index * 0.1),
  };
}

const versionStatus = (index: number) =>
  index === 0 ? "Live until refresh" : index === 1 ? "Archived" : "Archived · Original";

function HistoryDialog({
  campaign,
  open,
  selectedId,
  onClose,
  onUse,
}: {
  campaign: Campaign;
  open: boolean;
  selectedId: string;
  onClose: () => void;
  onUse: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, value: string) => {
    void navigator.clipboard?.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-xl overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-3.5 pr-12">
          <DialogTitle className="text-[16px]">{campaign.name} · History</DialogTitle>
          <p className="text-[11px] text-muted-foreground">Every published version, who wrote it and how it performed.</p>
        </DialogHeader>
        <div className="max-h-[calc(80vh-70px)] space-y-2 overflow-y-auto px-5 py-4">
          {campaign.history.map((version, index) => {
            const stats = versionStats(campaign, index);
            const open = expanded === version.id;
            const inReview = selectedId === version.id;
            return (
              <article
                key={version.id}
                className={`overflow-hidden rounded-md border ${inReview ? "border-brand/40 bg-brand-soft/25" : "border-border bg-card"}`}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : version.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2.5 text-left"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[12.5px] font-semibold text-card-foreground">{version.date}</span>
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9.5px] font-semibold text-muted-foreground">
                        {versionStatus(index)}
                      </span>
                      {inReview && (
                        <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-brand">In this review</span>
                      )}
                    </span>
                    <span className="block truncate text-[10.5px] text-muted-foreground">{version.editor}</span>
                  </span>
                  <span className="flex gap-3 text-right">
                    <span>
                      <span className="block text-[9px] text-muted-foreground">Click</span>
                      <span className="text-[11.5px] font-semibold text-card-foreground">{fmt(stats.click)}</span>
                    </span>
                    <span>
                      <span className="block text-[9px] text-muted-foreground">Spam</span>
                      <span className="text-[11.5px] font-semibold text-card-foreground">{fmt(stats.spam)}</span>
                    </span>
                  </span>
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="space-y-2 border-t border-border px-3 py-3">
                    {(["Direct", "OTA"] as Audience[]).map((aud) =>
                      (["Email", "Text"] as Channel[]).map((ch) => {
                        const value = version.content[aud][channelKey(ch)];
                        const key = `${version.id}-${aud}-${ch}`;
                        return (
                          <div key={key} className="rounded-sm border border-border bg-card p-2.5">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {aud} · {ch}
                              </span>
                              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => copy(key, value)}>
                                {copied === key ? <Check size={11} /> : <Copy size={11} />}
                                {copied === key ? "Copied" : "Copy"}
                              </Button>
                            </div>
                            <p className="text-[11px] leading-4 text-card-foreground">{value}</p>
                          </div>
                        );
                      }),
                    )}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={inReview ? "outline" : "brand"}
                        disabled={inReview}
                        onClick={() => {
                          onUse(version.id);
                          onClose();
                        }}
                      >
                        {inReview ? "Used in this review" : "Use in this review"}
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [aiEdit, setAiEdit] = useState<{
    id: string;
    context: string;
    actions: string[];
    audience: Audience;
    channel: Channel;
  } | null>(null);

  const campaign = CAMPAIGNS.find((item) => item.id === reviewId) ?? CAMPAIGNS[0];
  const selectedHistory =
    campaign.history.find((item) => item.id === historyId[campaign.id]) ?? campaign.history[0];
  const currentContent = state[campaign.id]?.current ?? campaign.recommended;
  const previousCopy = selectedHistory.content[audience][channelKey(channel)];
  const recommendedCopy = currentContent[audience][channelKey(channel)];
  const result = performanceState(campaign);
  const reviewedCampaigns = Object.entries(state)
    .filter(([, value]) => value.reviewed)
    .map(([id]) => id);
  const pendingCampaigns = CAMPAIGNS.filter((item) => !state[item.id]?.reviewed);

  useEffect(() => {
    if (window.sessionStorage.getItem("content-v2-entered") === "true") setEntered(true);
  }, []);

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
  const improveWithAi = () => {
    const editorId =
      campaign.id === "alv"
        ? "after-last-visit"
        : campaign.id === "m15p"
          ? "lost-15-plus"
          : `lost-${campaign.id.replace("m", "")}`;
    setAiEdit({
      id: editorId,
      context: `${selectedHistory.date} performed better because it opened with a vivid memory from the guest’s stay and matched the moment they were likely starting to plan another trip. That sense of recognition made the message feel personal rather than promotional. I’ll keep the current Directful recommendation as the starting point rather than restoring the old copy.`,
      actions: [
        "Open with a stay memory",
        "Match the guest’s planning moment",
        "Make the return feel personal",
      ],
      audience,
      channel,
    });
    setReviewId(null);
    setEntered(true);
  };

  return (
    <MarketingShell title="Automated Invites · Content refresh">
      {!entered ? (
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6">
          <section className="ai-surface ai-grid relative overflow-hidden rounded-md border border-border bg-card shadow-card">
            <div className="grid min-h-[540px] lg:grid-cols-[1.02fr_.98fr]">
              <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
                <div className="flex items-center gap-3">
                  <AiMark size={40} live />
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">
                    Automated Invites
                  </p>
                </div>
                <h1 className="mt-6 max-w-xl font-display text-[38px] font-semibold leading-[1.08] text-card-foreground sm:text-[46px]">
                  Fresh content, ready for your review
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-card-foreground">
                  Your automated invite content had not been updated in 80 days, so Directful
                  refreshed it using recent performance patterns and timely context.
                </p>
                <p className="mt-3 max-w-xl text-[13px] leading-6 text-muted-foreground">
                  Review what changed across every invite. Your year-round content stays live
                  whenever no timely update is scheduled, and every previous version remains
                  available.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {["7 invite moments", "Email + Text", "Direct + OTA", "31 properties"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-sm border border-border bg-card/85 px-3 py-2 text-[12px] font-semibold text-card-foreground shadow-sm"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-8">
                  <Button variant="brand" size="lg" onClick={() => openReview("alv")}>
                    See Directful’s suggestions <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center overflow-hidden border-t border-border bg-brand-soft/55 p-7 lg:border-l lg:border-t-0">
                <div className="w-full max-w-md space-y-3">
                  <div className="starter-rise ml-10 rounded-md border border-border bg-card p-5 shadow-lift">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        AFTER LAST VISIT
                      </span>
                      <Attribution />
                    </div>
                    <p className="mt-4 text-[16px] font-semibold text-card-foreground">
                      A warmer reason to return
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                      A timely guest moment, clearer booking value, and less generic copy.
                    </p>
                  </div>
                  <div className="starter-rise mr-10 rounded-md border border-border bg-card p-5 shadow-lift [animation-delay:120ms]">
                    <div className="flex items-center gap-2">
                      <MessageSquareText size={15} className="text-brand" />
                      <span className="text-[11px] font-semibold text-muted-foreground">TEXT</span>
                    </div>
                    <div className="mt-4 rounded-[14px] rounded-bl-sm bg-brand px-4 py-3 text-[13px] leading-5 text-brand-foreground">
                      Already missing the harbor? Come back for quiet waterfront walks and our best
                      direct rate.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <V2Workspace
          onReview={openReview}
          reviewedCampaigns={reviewedCampaigns}
          pendingReviewCount={pendingCampaigns.length}
          onContinueReview={() => openReview(pendingCampaigns[0]?.id ?? "alv")}
        />
      )}

      <Dialog open={reviewId !== null} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden border-border bg-card p-0 shadow-float">
          <DialogHeader className="border-b border-border px-5 py-3 pr-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-[17px]">Directful content review</DialogTitle>
                <div className="mt-0.5 flex flex-wrap items-center gap-3">
                  <Attribution />
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Building2 size={12} />
                    {campaign.properties} of 31 properties
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1" aria-label="Invite timing">
                <Button variant="outline" size="icon" className="size-8" aria-label="Previous campaign" onClick={() => go(-1)}>
                  <ChevronLeft size={15} />
                </Button>
                <div className="min-w-[150px] px-2 text-center">
                  <p className="text-[13px] font-semibold text-card-foreground">{campaign.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {campaignIndex + 1} of {CAMPAIGNS.length} ·{" "}
                    <span className={adopted ? "font-semibold text-brand" : ""}>
                      {adopted ? "Using Directful content" : "Using current content"}
                    </span>
                  </p>
                </div>
                <Button variant="outline" size="icon" className="size-8" aria-label="Next campaign" onClick={() => go(1)}>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Campaign status">
              {CAMPAIGNS.map((item) => {
                const isAdopted = state[item.id]?.adopted;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openReview(item.id)}
                    className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] ${item.id === campaign.id ? "border-foreground/40 font-semibold text-card-foreground" : "border-border text-muted-foreground"}`}
                  >
                    <span className={`size-1.5 rounded-full ${isAdopted ? "bg-brand" : "bg-muted-foreground/40"}`} />
                    {item.name}
                  </button>
                );
              })}
              <span className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-brand" />Directful adopted</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-muted-foreground/40" />Current content</span>
              </span>
            </div>
          </DialogHeader>
          <div className="max-h-[calc(90vh-118px)] overflow-y-auto px-5 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11.5px] text-muted-foreground">
                {adopted
                  ? `Directful’s content is now live. Your ${baseline.date} content is kept as previous content.`
                  : `Your ${baseline.date} content stays live until you adopt Directful’s recommendation.`}
              </p>
              <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => setHistoryOpen(true)}>
                <History size={13} />
                History
              </Button>
            </div>
            <div className="space-y-4">
              {(["Direct", "OTA"] as Audience[]).map((aud) => (
                <section key={aud}>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-card-foreground">
                    {aud} guests
                  </h3>
                  <div className="space-y-2.5">
                    {(["Email", "Text"] as Channel[]).map((ch) => (
                      <CompactComparison
                        key={ch}
                        channel={ch}
                        previous={baselineContent[aud][channelKey(ch)]}
                        current={currentContent[aud][channelKey(ch)]}
                        leftLabel={`${adopted ? "Previous content" : "Current content"} · ${ch}`}
                        leftMeta={`${baseline.date} · ${baseline.editor}`}
                        rightLabel={`${adopted ? "Directful content · In use" : "Directful recommendation"} · ${ch}`}
                        rightMeta={adopted ? "Adopted in this review" : "Updated 2 min ago"}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <section className="rounded-md border border-border p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Creative shift</p>
                <h3 className="mt-1 text-[15px] font-semibold text-card-foreground">
                  From a general follow-up to a reason to return
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-sm bg-muted/55 p-2.5">
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground">Before</p>
                    <p className="mt-1.5 text-[11px] leading-4 text-card-foreground">{campaign.oldDirection}</p>
                  </div>
                  <div className="rounded-sm bg-brand-soft/65 p-2.5">
                    <p className="text-[9px] font-semibold uppercase text-brand">Directful direction</p>
                    <p className="mt-1.5 text-[11px] leading-4 text-card-foreground">{campaign.newDirection}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-x-3 gap-y-1.5 sm:grid-cols-2">
                  {campaign.changes.map((change) => (
                    <span key={change} className="inline-flex items-start gap-1.5 text-[10px] leading-4 text-card-foreground">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                        <Check size={10} />
                      </span>
                      {change}
                    </span>
                  ))}
                </div>
              </section>
              <section className="rounded-md border border-border p-3.5">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-brand text-brand-foreground">
                    <Sparkles size={13} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Why this direction</p>
                    <h3 className="text-[15px] font-semibold text-card-foreground">Built for this guest moment</h3>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-card-foreground">{campaign.why}</p>
                <p className="mt-3 border-t border-border pt-3 text-[10px] leading-4 text-muted-foreground">
                  The recommendation adapts by audience. OTA copy introduces direct-booking value;
                  Direct copy can lead with familiarity and loyalty.
                </p>
              </section>
            </div>
            <section className="mt-3 rounded-md border border-border p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Performance</p>
                  <h3 className="mt-0.5 text-[14px] font-semibold text-card-foreground">
                    {adopted ? "Previous" : "Current"} content · {baseline.date}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {[
                    ["Click rate", baselineStats.click],
                    ["Spam rate", baselineStats.spam],
                  ].map(([label, value]) => (
                    <div key={label as string} className="min-w-[96px] rounded-sm border border-border px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-[15px] font-semibold text-card-foreground">{fmt(value as number)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                Directful’s recommendation has not been sent yet, so performance will appear once guests receive it.
              </p>
              {result === "previous-better" && !adopted && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="mr-auto inline-flex items-center gap-1 text-[10.5px] font-semibold text-warning">
                    <TrendingDown size={12} />
                    Your current content is performing strongly — carry its strengths into Directful’s content
                  </span>
                  <Button variant="brand" size="sm" onClick={improveWithAi}>
                    Improve with AI
                  </Button>
                </div>
              )}
            </section>
            <div className="sticky bottom-0 -mx-5 -mb-4 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
              <Button variant="outline" onClick={closeReview}>
                <X size={14} />
                Close
              </Button>
              {adopted ? (
                <Button variant="outline" onClick={() => patch(campaign.id, { adopted: false })}>
                  <RotateCcw size={14} />
                  Use previous content
                </Button>
              ) : (
                <Button variant="brand" onClick={() => patch(campaign.id, { adopted: true, reviewed: true })}>
                  <Check size={14} />
                  Adopt & use
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <HistoryDialog
        campaign={campaign}
        open={historyOpen}
        selectedId={baseline.id}
        onClose={() => setHistoryOpen(false)}
        onUse={(id) => setHistoryId((value) => ({ ...value, [campaign.id]: id }))}
      />
      {aiEdit && (
        <CampaignEditor
          id={aiEdit.id}
          initialAiContext={aiEdit.context}
          initialAiActions={aiEdit.actions}
          initialAudience={aiEdit.audience.toLowerCase() as "direct" | "ota"}
          initialChannel={aiEdit.channel.toLowerCase() as "email" | "text"}
          onClose={() => setAiEdit(null)}
        />
      )}
    </MarketingShell>
  );
}
