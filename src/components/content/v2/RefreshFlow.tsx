import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Circle, Minus, PartyPopper, Pencil, Sparkle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle as SparkIcon } from "@/components/ai/Sparkle";
import { AiMark, EmailMock, fill } from "@/components/content/shared";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { HOTEL, monthName, seasonalFor, type MonthPerformance, type PeriodCopy, type SeasonalSuggestion, type UpdatePreferences } from "@/lib/contentV2";
import lobbyImg from "@/assets/lobby-arrival.jpg";
import foliageImg from "@/assets/events/fall-foliage.jpg";
import treeImg from "@/assets/events/rockefeller-tree.jpg";
import poolImg from "@/assets/pool-dusk.jpg";
import suiteImg from "@/assets/suite-detail.jpg";
import terraceImg from "@/assets/breakfast-terrace.jpg";
import rooftopImg from "@/assets/rooftop-bar.jpg";
import courtyardImg from "@/assets/courtyard.jpg";

export type FlowSetup = { recommendedId: string; context?: string; preferences?: UpdatePreferences };

type StepId = "period" | "direction" | "tone" | "extra" | "planning" | "plan" | "generating" | "ready" | "review" | "publishing" | "done";
type Question = "period" | "direction" | "tone" | "extra";

type Props = {
  setup: FlowSetup;
  periodOptions: { id: string; label: string; short: string; dateRange: string; blurb: string; month: number }[];
  baseCopy: PeriodCopy;
  aiCopy: (args: { month: number; tone: string; direction: string; seasonal: SeasonalSuggestion | null; note: string; extendIds: string[] }) => PeriodCopy[];
  performanceFor?: (month: number) => MonthPerformance | undefined;
  learning?: string;
  onPublish: (payload: { periodId: string; copy: PeriodCopy; aiAssisted: boolean; preferences: UpdatePreferences }) => void;
  onClose: () => void;
};

const HORIZONS = [
  { months: 1, title: "1 Month", lead: "Refresh the next upcoming period", note: "Best when you want to keep content closely aligned with what's coming up." },
  { months: 3, title: "3 Months", lead: "Prepare content for the next three periods", note: "A good option when you want to stay ahead while keeping content easy to update." },
  { months: 6, title: "6 Months", lead: "Prepare content further ahead", note: "Useful when you want less frequent maintenance while keeping messaging relevant." },
  { months: 12, title: "12 Months", lead: "Refresh content for the full year", note: "Best when you want a complete annual content refresh." },
];

const seasonImage = (m: number) => (m >= 8 && m <= 10 ? foliageImg : m === 11 || m <= 1 ? treeImg : m >= 5 && m <= 7 ? poolImg : terraceImg);

const directionsFor = (month: number) => [
  { id: "standard", engine: "general", title: "Keep it standard", lead: "Stay consistent with your current content", note: "Refresh your existing messaging while keeping the same approach, structure and hotel voice.", img: lobbyImg },
  { id: "seasonal", engine: "seasonal", title: "Seasonal alignment", lead: "Adapt your content to the time of year", note: "Add relevant seasonal context while keeping it natural and appropriate for your guests.", img: seasonImage(month) },
  { id: "guest", engine: "guest", title: "Focus on the guest experience", lead: "More welcoming and experience-led", note: "Highlight the stay, comfort and relaxation guests can enjoy when they return.", img: suiteImg },
  { id: "promotional", engine: "promotional", title: "More promotional", lead: "Give guests a stronger reason to book", note: "Make offers, benefits and booking opportunities more noticeable — still natural.", img: rooftopImg },
  { id: "fresh", engine: "general", title: "Freshen it up", lead: "Give existing content a noticeable refresh", note: "Keep your core message with new wording, stronger messaging and a more modern feel.", img: courtyardImg },
];
// Combinations that would give conflicting instructions.
const CONFLICTS: Record<string, string[]> = { standard: ["fresh", "promotional"], fresh: ["standard"], promotional: ["standard"] };

const TONES = [
  { id: "warm", engine: "warmer", label: "Warm & Welcoming", lead: "Friendly, inviting and personal", note: "Makes guests feel welcomed and encourages them to return." },
  { id: "professional", engine: "professional", label: "Professional & Polished", lead: "Refined, clear and trustworthy", note: "Keeps the message sophisticated and aligned with a premium brand." },
  { id: "conversational", engine: "conversational", label: "Conversational", lead: "Natural and easygoing", note: "Feels like a personal message rather than a formal email." },
  { id: "direct", engine: "concise", label: "Short & Direct", lead: "Concise and action-focused", note: "Gets to the point quickly and makes the next step clear." },
  { id: "inspiring", engine: "warmer", label: "Inspiring", lead: "Experience-led and aspirational", note: "Focuses on the feeling guests can look forward to." },
  { id: "promotional", engine: "current", label: "Promotional", lead: "Benefit and offer focused", note: "Gives promotions and booking opportunities more emphasis." },
];

const EXAMPLES = ["Focus more on relaxation.", "Don't mention Halloween.", "Keep the CTA focused on direct booking.", "Mention our spa."];

function rangeLabel(startMonth: number, count: number) {
  const s = new Date(Date.UTC(2026, startMonth, 1));
  const e = new Date(Date.UTC(2026, startMonth + count - 1, 1));
  const f = (d: Date, y: boolean) => new Intl.DateTimeFormat("en", { month: "long", ...(y ? { year: "numeric" } : {}), timeZone: "UTC" }).format(d);
  if (count === 1) return f(s, true);
  return s.getUTCFullYear() === e.getUTCFullYear() ? `${f(s, false)}–${f(e, true)}` : `${f(s, true)} – ${f(e, true)}`;
}

const listJoin = (items: string[]) => items.join(" + ");

function acknowledgeNote(n: string) {
  const parts: string[] = [];
  if (/short|concise|brief/i.test(n)) parts.push("keep the messaging short");
  if (/direct book|booking|cta/i.test(n)) parts.push("make direct booking the primary focus");
  if (/relax|spa|unwind/i.test(n)) parts.push("lean into relaxation and wellbeing");
  if (/don'?t mention|no (holiday|halloween|season)/i.test(n)) parts.push("leave that reference out");
  return parts.length ? `Got it. I'll ${parts.join(" and ")}.` : `Got it. I'll use that as guidance: “${n}”`;
}

export function RefreshFlow({ setup, periodOptions, baseCopy, aiCopy, learning, onPublish, onClose }: Props) {
  const recommended = periodOptions.find((p) => p.id === setup.recommendedId) ?? periodOptions[0];
  const first = recommended;
  const [step, setStep] = useState<StepId>("period");
  const [returnToPlan, setReturnToPlan] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [answered, setAnswered] = useState<Question[]>([]);
  const [horizon, setHorizon] = useState<number | null>(3);
  const [dirs, setDirs] = useState<string[]>(["seasonal"]);
  const [toneId, setToneId] = useState<string | null>("warm");
  const [note, setNote] = useState("");
  const [stage, setStage] = useState(0);
  const [generated, setGenerated] = useState<PeriodCopy[]>([]);
  const [seg, setSeg] = useState<"direct" | "ota">("direct");
  const [channel, setChannel] = useState<"email" | "text">("email");
  const [mode, setMode] = useState<"preview" | "compare" | "insight">("preview");
  const [draft, setDraft] = useState<PeriodCopy | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const DIRS = directionsFor(first.month);
  const periodText = rangeLabel(first.month, horizon ?? 1);
  const seasonal = seasonalFor(first.month);
  const suggestionLive: SeasonalSuggestion | null = dirs.includes("seasonal") && !/don'?t mention|no (holiday|halloween|season)/i.test(note) ? seasonal : null;
  const toneObj = TONES.find((t) => t.id === toneId);
  const tone = toneObj?.engine ?? "current";
  const direction = (DIRS.find((d) => d.id === dirs.find((x) => x !== "standard" && x !== "fresh")) ?? DIRS.find((d) => d.id === dirs[0]))?.engine ?? "general";
  const dirTitles = dirs.map((id) => DIRS.find((d) => d.id === id)?.title ?? id);
  const recTone = dirs.includes("promotional") ? "direct" : dirs.includes("guest") ? "inspiring" : "warm";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [step, answered.length]);

  const advance = (q: Question, next: StepId) => {
    setAnswered((a) => (a.includes(q) ? a : [...a, q]));
    if (returnToPlan) { setReturnToPlan(false); setStep("plan"); } else setStep(next);
  };
  const editFrom = (q: Question) => { setReturnToPlan(true); setStep(q); };

  const toggleDir = (id: string) => setDirs((cur) => {
    if (cur.includes(id)) return cur.filter((x) => x !== id);
    const blocked = CONFLICTS[id] ?? [];
    return [...cur.filter((x) => !blocked.includes(x)), id];
  });

  // Planning + generating progress
  const PLAN_STEPS = ["Reviewing your current content", "Reviewing your selected periods", "Applying your content direction", "Applying your tone", "Building your content plan"];
  const GEN_STEPS = ["Reviewing your current content", "Applying your content direction", "Applying your tone", "Preparing the selected periods", "Writing refreshed content", "Preparing your review"];
  useEffect(() => {
    if (step !== "planning" && step !== "generating") return;
    const total = step === "planning" ? PLAN_STEPS.length : GEN_STEPS.length;
    if (stage >= total) {
      if (step === "generating") {
        const copy = aiCopy({ month: first.month, tone, direction, seasonal: suggestionLive, note, extendIds: [] });
        setGenerated(copy);
        setDraft(clone(copy[0]));
      }
      const t = window.setTimeout(() => setStep(step === "planning" ? "plan" : "ready"), 400);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStage((s) => s + 1), 650);
    return () => window.clearTimeout(t);
  }, [step, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const startPlanning = () => { setAnswered((a) => (a.includes("extra") ? a : [...a, "extra"])); setReturnToPlan(false); setStage(0); setStep("planning"); };
  const startGenerate = () => { setStage(0); setStep("generating"); };
  const editDraft = (fn: (c: PeriodCopy) => void) => setDraft((cur) => { if (!cur) return cur; const next = clone(cur); fn(next); return next; });

  const inConversation = ["period", "direction", "tone", "extra", "planning", "plan", "generating", "ready"].includes(step);

  /* ------------ conversation pieces ------------ */
  const Ai = ({ children }: { children: React.ReactNode }) => (
    <Message from="assistant"><MessageContent className="bg-transparent p-0 text-[13.5px] leading-relaxed text-card-foreground">{children}</MessageContent></Message>
  );
  const You = ({ text }: { text: string }) => (
    <Message from="user"><MessageContent className="rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground">{text}</MessageContent></Message>
  );
  const Q = ({ title, sub }: { title: string; sub?: string }) => (
    <div><p className="text-[16px] font-semibold text-card-foreground">{title}</p>{sub && <p className="mt-1 text-[12.5px] text-muted-foreground">{sub}</p>}</div>
  );
  const Rec = () => <span className="rounded-sm bg-highlight px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-highlight-foreground">Recommended</span>;
  const cardCls = (on: boolean) => `group relative block h-auto w-full whitespace-normal rounded-md border p-0 text-left transition-colors ${on ? "border-brand bg-brand-soft/40 ring-1 ring-brand" : "border-border bg-card hover:border-brand/50"}`;
  const Tick = ({ on }: { on: boolean }) => <span className={`absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border ${on ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card"}`}>{on && <Check size={12} />}</span>;
  const ContinueBtn = ({ disabled, onClick, label = "Continue" }: { disabled?: boolean; onClick: () => void; label?: string }) => (
    <div className="flex justify-end"><Button variant="brand" disabled={disabled} onClick={onClick}>{label}<ArrowRight size={14} /></Button></div>
  );
  const dirAck = dirs.length > 1
    ? dirs.includes("seasonal") && dirs.includes("guest") ? "We'll keep the seasonal references subtle while putting the focus on the guest experience." : `I'll combine ${listJoin(dirTitles).toLowerCase()} into one consistent refresh.`
    : `I'll go with ${dirTitles[0]?.toLowerCase()}.`;

  const PlanRow = ({ label, value, q }: { label: string; value: string; q: Question }) => (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0"><p className="text-[10.5px] font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-0.5 text-[13.5px] font-medium text-card-foreground">{value}</p></div>
      <Button size="sm" variant="ghost" onClick={() => editFrom(q)}><Pencil size={12} />Edit</Button>
    </div>
  );

  const Progress = ({ items, at }: { items: string[]; at: number }) => (
    <ol className="space-y-1.5">
      {items.map((label, i) => (
        <li key={label} className={`flex items-center gap-2.5 text-[12.5px] ${i <= at ? "text-card-foreground" : "text-muted-foreground"}`}>
          {i < at ? <Check size={14} className="text-brand" /> : i === at ? <span className="ml-1 mr-0.5 size-2 animate-pulse rounded-full bg-brand" /> : <Circle size={12} className="ml-0.5 text-muted-foreground/50" />}
          {label}
        </li>
      ))}
    </ol>
  );

  if (minimized) {
    return (
      <button onClick={() => setMinimized(false)} className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-left shadow-float transition-colors hover:border-brand/50">
        <AiMark size={28} live={step === "planning" || step === "generating"} />
        <span><span className="block text-[13px] font-semibold text-card-foreground">AI Content Assistant</span><span className="block text-[11.5px] text-muted-foreground">Continue your refresh</span></span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-foreground/25" onMouseDown={(e) => e.target === e.currentTarget && setMinimized(true)}>
      <section role="dialog" aria-modal="true" aria-label="AI Content Assistant" className="flex h-full w-full max-w-[920px] flex-col overflow-hidden border-l border-border bg-card shadow-float">
        <header className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold text-card-foreground">AI Content Assistant</h2>
            <p className="text-[11.5px] text-muted-foreground">Let's refresh your automated invite content · {HOTEL}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMinimized(true)} aria-label="Minimize"><Minus /></Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Button>
        </header>

        {inConversation ? (
          <Conversation className="min-h-0 flex-1 bg-canvas">
            <ConversationContent className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8">
              <div className="flex flex-col items-center gap-3 pb-2 text-center">
                <AiMark size={48} live={step === "planning" || step === "generating"} />
                <p className="text-[20px] font-semibold text-card-foreground">Let's refresh your content.</p>
                {learning && <p className="max-w-lg text-[12px] text-muted-foreground"><Sparkle size={12} className="mr-1 inline text-brand" />{learning}</p>}
              </div>

              {/* Q1 — period */}
              <Ai><MessageResponse>First, how far ahead would you like to refresh your automated invite content?</MessageResponse></Ai>
              {step === "period" ? (
                <div className="space-y-4">
                  <Q title="Refresh for" sub="You can refresh the next period or prepare several upcoming periods at once." />
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {HORIZONS.map((h) => (
                      <Button key={h.months} variant="outline" onClick={() => setHorizon(h.months)} className={cardCls(horizon === h.months)}>
                        <span className="block p-4 pr-10">
                          <span className="flex items-center gap-2"><span className="text-[16px] font-semibold text-card-foreground">{h.title}</span>{h.months === 3 && <Rec />}</span>
                          <span className="mt-1 block text-[12.5px] font-medium text-card-foreground">{h.lead}</span>
                          <span className="mt-1 block text-[11.5px] leading-relaxed text-muted-foreground">{h.note}</span>
                          <span className="mt-2 block text-[11px] text-brand">{rangeLabel(first.month, h.months)}</span>
                        </span>
                        <Tick on={horizon === h.months} />
                      </Button>
                    ))}
                  </div>
                  <p className="rounded-md border border-brand/25 bg-brand-soft/40 px-3.5 py-2.5 text-[12px] text-card-foreground"><Sparkle size={12} className="mr-1.5 inline text-brand" /><b>3 Months is recommended.</b> It covers the upcoming periods while still leaving room to refresh your messaging later.</p>
                  <ContinueBtn disabled={!horizon} onClick={() => advance("period", "direction")} />
                </div>
              ) : answered.includes("period") && (
                <>
                  <You text={`${horizon} month${horizon === 1 ? "" : "s"} · ${periodText}`} />
                  <Ai><MessageResponse>{`Great. We'll refresh your content for ${horizon === 1 ? "the next month" : `the next ${horizon} months`}. That gives us room to keep your messaging fresh while preparing ahead.`}</MessageResponse></Ai>
                </>
              )}

              {/* Q2 — direction */}
              {(step === "direction" || answered.includes("direction")) && step !== "period" && (
                <>
                  <Ai><MessageResponse>How would you like the content to be refreshed?</MessageResponse></Ai>
                  {step === "direction" ? (
                    <div className="space-y-4">
                      <p className="rounded-md border border-brand/25 bg-brand-soft/40 px-3.5 py-2.5 text-[12px] text-card-foreground"><Sparkle size={12} className="mr-1.5 inline text-brand" /><b>Recommended for your period: Seasonal alignment.</b> {monthName(first.month)} is approaching, so a light seasonal refresh can make your content feel timely without changing your overall messaging. AI recommends — you decide.</p>
                      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {DIRS.map((d) => {
                          const on = dirs.includes(d.id);
                          return (
                            <Button key={d.id} variant="outline" onClick={() => toggleDir(d.id)} className={`${cardCls(on)} overflow-hidden`}>
                              <img src={d.img} alt="" className="h-24 w-full object-cover" loading="lazy" />
                              <span className="block p-3.5">
                                <span className="flex flex-wrap items-center gap-2"><span className="text-[13.5px] font-semibold text-card-foreground">{d.title}</span>{d.id === "seasonal" && <Rec />}</span>
                                <span className="mt-1 block text-[12px] font-medium text-card-foreground">{d.lead}</span>
                                <span className="mt-1 block text-[11.5px] leading-relaxed text-muted-foreground">{d.note}</span>
                              </span>
                              <Tick on={on} />
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-[11.5px] text-muted-foreground">Pick one, or combine compatible directions. Conflicting choices are swapped automatically.</p>
                      <ContinueBtn disabled={!dirs.length} onClick={() => advance("direction", "tone")} />
                    </div>
                  ) : (
                    <>
                      <You text={listJoin(dirTitles)} />
                      <Ai><MessageResponse>{dirAck}</MessageResponse></Ai>
                    </>
                  )}
                </>
              )}

              {/* Q3 — tone */}
              {(step === "tone" || (answered.includes("tone") && !["period", "direction"].includes(step))) && (
                <>
                  <Ai><MessageResponse>What tone would you like to use?</MessageResponse></Ai>
                  {step === "tone" ? (
                    <div className="space-y-4">
                      <Q title="Choose a tone" sub="Choose how you'd like the refreshed content to sound. We recommend tones that fit your period and direction." />
                      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {TONES.map((t) => (
                          <Button key={t.id} variant="outline" onClick={() => setToneId(t.id)} className={cardCls(toneId === t.id)}>
                            <span className="block p-3.5 pr-9">
                              <span className="flex flex-wrap items-center gap-2"><span className="text-[13.5px] font-semibold text-card-foreground">{t.label}</span>{t.id === recTone && <Rec />}</span>
                              <span className="mt-1 block text-[12px] font-medium text-card-foreground">{t.lead}</span>
                              <span className="mt-1 block text-[11.5px] leading-relaxed text-muted-foreground">{t.note}</span>
                            </span>
                            <Tick on={toneId === t.id} />
                          </Button>
                        ))}
                      </div>
                      <ContinueBtn disabled={!toneId} onClick={() => advance("tone", "extra")} />
                    </div>
                  ) : (
                    <>
                      <You text={toneObj?.label ?? ""} />
                      <Ai><MessageResponse>{`Perfect. I'll keep the refreshed content ${toneObj?.label.toLowerCase().replace(" & ", " and ")}.`}</MessageResponse></Ai>
                    </>
                  )}
                </>
              )}

              {/* Q4 — anything else */}
              {(step === "extra" || (answered.includes("extra") && ["planning", "plan", "generating", "ready"].includes(step))) && (
                <>
                  <Ai><MessageResponse>Anything else you'd like me to consider?</MessageResponse></Ai>
                  {step === "extra" ? (
                    <div className="space-y-3">
                      <p className="text-[12.5px] text-muted-foreground">Add a specific preference, message, offer or instruction. Or we can keep everything we've selected.</p>
                      {note && <><You text={note} /><Ai><MessageResponse>{acknowledgeNote(note)}</MessageResponse></Ai></>}
                      <div className="flex flex-wrap gap-1.5">
                        {EXAMPLES.map((s) => <Button key={s} variant="outline" size="sm" onClick={() => setNote(s)}>“{s}”</Button>)}
                      </div>
                      <div className="flex justify-end">
                        {note ? <Button variant="brand" onClick={startPlanning}><SparkIcon size={14} />Plan my refresh</Button>
                          : <Button variant="brand" onClick={startPlanning}>No, we're good — plan it<ArrowRight size={14} /></Button>}
                      </div>
                    </div>
                  ) : note ? (
                    <><You text={note} /><Ai><MessageResponse>{acknowledgeNote(note)}</MessageResponse></Ai></>
                  ) : <You text="No, we're good — plan it" />}
                </>
              )}

              {/* Planning */}
              {step === "planning" && (
                <div className="rounded-md border border-border bg-card p-4">
                  <p className="mb-3 text-[13.5px] font-semibold text-card-foreground">Building your refresh plan</p>
                  <Progress items={PLAN_STEPS} at={stage} />
                </div>
              )}

              {/* Plan */}
              {(step === "plan" || step === "generating" || step === "ready") && (
                <>
                  <Ai><MessageResponse>**Your refresh plan is ready.** Here's what I'll update before generating your content.</MessageResponse></Ai>
                  <div className="rounded-md border border-border bg-card p-5">
                    <p className="text-[11px] font-semibold uppercase text-brand">Refresh plan</p>
                    <div className="mt-1">
                      <PlanRow label="Content period" value={periodText} q="period" />
                      <PlanRow label="Content direction" value={listJoin(dirTitles)} q="direction" />
                      <PlanRow label="Tone" value={toneObj?.label ?? ""} q="tone" />
                      <PlanRow label="Additional preferences" value={note || "None — keep everything as selected"} q="extra" />
                    </div>
                    <p className="mt-4 text-[12px] font-semibold text-card-foreground">What AI will do</p>
                    <ul className="mt-2 space-y-1.5">
                      {["Refresh your existing automated invite content", "Keep your current hotel voice", "Adapt messaging for the selected periods",
                        dirs.includes("seasonal") ? "Use subtle seasonal context where appropriate" : null,
                        dirs.includes("guest") ? "Keep the content guest-focused" : null,
                        dirs.includes("promotional") ? "Make booking benefits more noticeable" : null,
                        dirs.includes("fresh") ? "Introduce new, more modern wording" : null,
                        "Apply your selected tone", note ? "Use your additional instructions" : null].filter(Boolean).map((i) => (
                        <li key={i as string} className="flex items-start gap-2 text-[12.5px] text-card-foreground"><Check size={14} className="mt-0.5 shrink-0 text-brand" />{i}</li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-border pt-3 text-[12px] text-muted-foreground">Nothing will be published until you review the generated content.</p>
                    {step === "plan" && (
                      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                        <Button variant="ghost" onClick={() => editFrom("period")}>Edit plan</Button>
                        <Button variant="brand" onClick={startGenerate}><SparkIcon size={14} />Approve &amp; Generate</Button>
                      </div>
                    )}
                  </div>
                  {step === "plan" && <p className="text-center text-[11.5px] text-muted-foreground">Your current content will remain unchanged until you approve the generated version.</p>}
                </>
              )}

              {step === "generating" && (
                <div className="rounded-md border border-border bg-card p-4">
                  <p className="mb-3 text-[13.5px] font-semibold text-card-foreground">Creating your refreshed content</p>
                  <Progress items={GEN_STEPS} at={stage} />
                </div>
              )}

              {step === "ready" && (
                <>
                  <Ai><MessageResponse>**Your refreshed content is ready.** I've prepared the updated content for your review.</MessageResponse></Ai>
                  <div className="flex justify-end"><Button variant="brand" onClick={() => setStep("review")}>Review content<ArrowRight size={14} /></Button></div>
                </>
              )}
              <div ref={endRef} />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto bg-canvas px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-4xl">
          {step === "review" && draft && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
              <section className="min-w-0 space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-[10.5px] font-semibold uppercase text-brand">{first.label}</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-card-foreground">AI-assisted update</p>
                  <p className="text-[11.5px] text-muted-foreground">Updated from your current automated invite content.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1 rounded-md bg-muted p-1">{(["direct", "ota"] as const).map((s) => <Button key={s} size="sm" variant={seg === s ? "brand" : "ghost"} onClick={() => setSeg(s)}>{s === "direct" ? "Direct guests" : "OTA guests"}</Button>)}</div>
                  <div className="flex gap-1 rounded-md bg-muted p-1">{(["email", "text"] as const).map((c) => <Button key={c} size="sm" variant={channel === c ? "secondary" : "ghost"} onClick={() => setChannel(c)}>{c === "email" ? "Email" : "Text"}</Button>)}</div>
                  <div className="ml-auto flex gap-1">
                    {(["preview", "compare", "insight"] as const).map((m) => <Button key={m} size="sm" variant={mode === m ? "secondary" : "ghost"} onClick={() => setMode(m)}>{m === "preview" ? "Preview" : m === "compare" ? "Compare" : "Content insights"}</Button>)}
                  </div>
                </div>
                {mode === "preview" && (channel === "email" ? (
                  <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                    {([["subject", "Subject line"], ["preheader", "Preview text"], ["heading", "Heading"], ["cta", "Button"]] as const).map(([key, label]) => (
                      <label key={key} className="block"><span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">{label}</span>
                        <input className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-card-foreground outline-none transition-colors focus:border-brand" value={draft.email[key]} onChange={(e) => editDraft((c) => { c.email[key] = e.target.value; })} />
                      </label>
                    ))}
                    <label className="block"><span className="mb-1 block text-[11.5px] font-medium text-muted-foreground">Email content</span>
                      <textarea rows={6} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-card-foreground outline-none transition-colors focus:border-brand" value={draft.email.body} onChange={(e) => editDraft((c) => { c.email.body = e.target.value; })} />
                    </label>
                    <p className="text-[11px] text-muted-foreground">You can edit anything here before publishing.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <textarea rows={5} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-card-foreground outline-none transition-colors focus:border-brand" value={draft.text} onChange={(e) => editDraft((c) => { c.text = e.target.value; })} />
                    <p className="mt-2 text-[11px] text-muted-foreground">{draft.text.length} characters · {Math.ceil(draft.text.length / 160)} segment{draft.text.length > 160 ? "s" : ""}</p>
                  </div>
                ))}
                {mode === "compare" && <Compare current={baseCopy} proposed={draft} seg={seg} />}
                {mode === "insight" && <Insights seasonal={suggestionLive?.name ?? null} tone={toneObj?.label ?? "your current tone"} removed={suggestionLive === null} />}
              </section>
              <section className="min-w-0">
                <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground">Live preview</p>
                {channel === "email" ? <EmailMock email={{ subject: draft.email.subject, preheader: draft.email.preheader, heading: draft.email.heading, body: draft.email.body, cta: draft.email.cta }} image="lobby" /> : <div className="flex justify-center rounded-lg border border-border bg-card p-6"><SmsPreview message={fill(draft.text)} sender="Holiday Inn" scale={0.62} /></div>}
              </section>
            </div>
          )}

          {step === "publishing" && draft && (
            <div className="mx-auto max-w-lg space-y-5 py-10 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand"><PartyPopper size={22} /></span>
              <div>
                <h3 className="text-[20px] font-semibold text-card-foreground">Ready to publish?</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground">Publishing this version will make it the current suggested content for {first.label}. Properties using their own content will not be changed.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-left">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Before publishing</p>
                <p className="mt-1 text-[13px] text-card-foreground">0 / 31 properties currently using this content</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">This content is ready and will be suggested to properties after you publish.</p>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="ghost" onClick={() => setStep("review")}>Keep current</Button>
                 <Button variant="brand" onClick={() => onPublish({ periodId: first.id, copy: draft, aiAssisted: true, preferences: { tone, direction, seasonalId: suggestionLive?.id ?? null, note, context: learning } })}>Publish</Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="mx-auto max-w-lg space-y-5 py-10 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand text-brand-foreground"><Check size={24} /></span>
              <div>
                <h3 className="text-[20px] font-semibold text-card-foreground">{first.label} is published</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground">12 / 31 properties using this content. You can check performance in Results at any time.</p>
              </div>
              <Button variant="brand" onClick={onClose}>I'm done for now</Button>
            </div>
          )}
            </div>
          </div>
        )}

        {step === "extra" && (
          <div className="shrink-0 border-t border-border bg-card px-5 py-3"><div className="mx-auto max-w-3xl">
            <PromptInput onSubmit={(m) => { const t = m.text.trim(); if (t) setNote(t); }}>
              <PromptInputTextarea placeholder="Tell the assistant anything else you'd like included…" />
              <PromptInputFooter className="justify-end"><PromptInputSubmit status="ready" className="size-8" /></PromptInputFooter>
            </PromptInput>
          </div></div>
        )}

        {(step === "review" || step === "publishing") && (
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-3">
            <Button variant="ghost" onClick={() => setStep(step === "publishing" ? "review" : "plan")}>Back</Button>
            {step === "review" && <Button variant="brand" onClick={() => setStep("publishing")}>Ready to publish<ArrowRight size={14} /></Button>}
          </footer>
        )}
      </section>
    </div>
  );
}

function periodRange(ids: string[]) {
  const months = ids.map((id) => monthName(Number(id.slice(5)) - 1));
  return months.length === 1 ? `${months[0]} 1–30, 2026` : `${months[0]} → ${months[months.length - 1]} 2026`;
}

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) as T; }

function Compare({ current, proposed, seg }: { current: PeriodCopy; proposed: PeriodCopy; seg: "direct" | "ota" }) {
  const rows = seg === "direct"
    ? [{ label: "Subject", before: current.email.subject, after: proposed.email.subject }, { label: "Heading", before: current.email.heading, after: proposed.email.heading }, { label: "Body", before: current.email.body, after: proposed.email.body }, { label: "Button", before: current.email.cta, after: proposed.email.cta }]
    : [{ label: "Text message", before: current.text, after: proposed.text }];
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-brand"><Sparkle size={13} />Current vs AI suggested — differences highlighted</p>
      {rows.map((row) => {
        const changed = row.before !== row.after;
        return (
          <div key={row.label}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase text-muted-foreground">{row.label}</p>
            <div className={`grid gap-2 sm:grid-cols-2 ${changed ? "" : "opacity-70"}`}>
              <div className="rounded-md border border-border bg-muted/35 p-3"><p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Current</p><p className="text-[12px] leading-relaxed text-card-foreground">{fill(row.before)}</p></div>
              <div className={`rounded-md p-3 ${changed ? "border border-brand/40 bg-brand-soft/40" : "border border-border bg-muted/35"}`}><p className="mb-1 text-[10px] font-semibold uppercase text-brand">AI suggested</p><p className="text-[12px] leading-relaxed text-card-foreground">{fill(row.after)}</p></div>
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-muted-foreground">The AI suggestion never replaces your content until you publish it.</p>
    </div>
  );
}

function Insights({ seasonal, tone, removed }: { seasonal: string | null; tone: string; removed: boolean }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <p className="text-[13.5px] font-semibold text-card-foreground">What changed &amp; why</p>
      <ul className="space-y-1.5">
        {["Shortened the message", "Made the CTA more direct", seasonal ? `Added light ${seasonal} seasonal context` : null].filter(Boolean).map((c) => (
          <li key={c as string} className="flex items-start gap-2 text-[12.5px] text-card-foreground"><Check size={14} className="mt-0.5 shrink-0 text-brand" />{c}</li>
        ))}
      </ul>
      <div className="rounded-md bg-canvas p-3">
        <p className="text-[10.5px] font-semibold uppercase text-brand">Why</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-card-foreground">Previous content with shorter messaging and clearer calls to action showed stronger engagement, so AI applied those patterns to the current version.</p>
      </div>
      {removed && <p className="text-[11.5px] text-muted-foreground">Seasonal context was not included based on your preference.</p>}
      <p className="text-[11.5px] text-muted-foreground">Applied your selected tone — {tone.toLowerCase()}.</p>
    </div>
  );
}
