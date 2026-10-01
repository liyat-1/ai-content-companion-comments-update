import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Circle, PartyPopper, Plus, Sparkle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkle as SparkIcon } from "@/components/ai/Sparkle";
import { AiMark, EmailMock, fill } from "@/components/content/shared";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { DIRECTIONS, HOTEL, TONES, monthName, seasonalFor, type MonthPerformance, type PeriodCopy, type SeasonalSuggestion, type UpdatePreferences } from "@/lib/contentV2";

export type FlowSetup = { recommendedId: string; context?: string; preferences?: UpdatePreferences };

type StepId = "when" | "how" | "plan" | "generating" | "review" | "publishing" | "done";

const STEP_LABELS: { id: StepId; label: string }[] = [
  { id: "when", label: "Choose when" },
  { id: "how", label: "Choose how" },
  { id: "plan", label: "Review plan" },
  { id: "generating", label: "Generate" },
  { id: "review", label: "Review content" },
  { id: "publishing", label: "Publish" },
];

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

export function RefreshFlow({ setup, periodOptions, baseCopy, aiCopy, performanceFor, learning, onPublish, onClose }: Props) {
  const [step, setStep] = useState<StepId>("when");
  const [selected, setSelected] = useState<string[]>([setup.recommendedId]);
  const [tone, setTone] = useState<string>(setup.preferences?.tone ?? "current");
  const [direction, setDirection] = useState<string>(setup.preferences?.direction ?? "general");
  const [seasonalUsed, setSeasonalUsed] = useState<SeasonalSuggestion | null>(setup.preferences?.seasonalId ? seasonalFor(Number(setup.recommendedId.slice(5)) - 1) : null);
  const [seasonalRemoved, setSeasonalRemoved] = useState(setup.preferences?.seasonalId === null && Boolean(setup.preferences));
  const [note, setNote] = useState(setup.preferences?.note ?? "");
  const [noteOpen, setNoteOpen] = useState(Boolean(setup.preferences?.note));
  const [genStage, setGenStage] = useState(0);
  const [generated, setGenerated] = useState<PeriodCopy[]>([]);
  const [seg, setSeg] = useState<"direct" | "ota">("direct");
  const [channel, setChannel] = useState<"email" | "text">("email");
  const [mode, setMode] = useState<"preview" | "compare" | "insight">("preview");
  const [draft, setDraft] = useState<PeriodCopy | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  const recommended = periodOptions.find((p) => p.id === setup.recommendedId) ?? periodOptions[0];
  const first = periodOptions.find((p) => p.id === selected[0]) ?? recommended;
  const suggestion = useMemo(() => (selected.length ? seasonalFor(first.month) : null), [first, selected.length]);
  const suggestionLive: SeasonalSuggestion | null = seasonalUsed !== null ? seasonalUsed : (!seasonalRemoved ? suggestion : null);

  // Keep the seasonal suggestion in sync when the period changes and the hotel hasn't decided yet.
  useEffect(() => {
    if (selected[0] === setup.recommendedId) return;
    setSeasonalUsed(null);
    setSeasonalRemoved(false);
  }, [selected, setup.recommendedId]);

  const startGenerate = () => {
    setStep("generating");
    setGenStage(0);
  };

  useEffect(() => {
    if (step !== "generating") return;
    if (genStage >= 5) {
      const copy = aiCopy({ month: first.month, tone, direction, seasonal: suggestionLive, note, extendIds: selected.slice(1) });
      setGenerated(copy);
      setDraft(clone(copy[0]));
      const t = window.setTimeout(() => setStep("review"), 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setGenStage((s) => s + 1), 750);
    return () => window.clearTimeout(t);
  }, [step, genStage]); // eslint-disable-line react-hooks/exhaustive-deps

  const editDraft = (fn: (c: PeriodCopy) => void) => setDraft((cur) => { if (!cur) return cur; const next = clone(cur); fn(next); return next; });

  const GEN_STEPS = [
    "Reviewing your current content",
    "Applying your preferences",
    `Checking seasonal context${suggestionLive && suggestionLive.name ? ` — ${suggestionLive.name}` : ""}`,
    "Writing updated content",
    "Preparing your review",
  ];

  const stepIndex = STEP_LABELS.findIndex((s) => s.id === step);
  const assistantIntro = step === "when" ? "Which period should we refresh? Your existing year-round content remains in place until you approve an update. I recommend starting with the next uncovered period, but you can choose another."
    : step === "how" ? `For ${first.label}, I recommend keeping your current voice and using a light, timely angle where it fits. You can change the tone, direction, or tell me what to emphasize.`
    : step === "plan" ? `Here's my suggestion for ${first.label}. Review the choices below, then approve writing. Nothing publishes automatically.`
    : step === "review" ? "Your draft is ready. Compare it with your current message, edit anything you like, then decide whether to publish." : "";
  const submitInstruction = (text: string) => {
    const instruction = text.trim();
    if (!instruction) return;
    setMessages((value) => [...value, { role: "user", text: instruction }]);
    const period = periodOptions.find((option) => instruction.toLowerCase().includes(option.short.toLowerCase()));
    if (step === "when" && period) setSelected([period.id]);
    if (step === "how" || step === "plan") {
      setNote(instruction);
      setNoteOpen(true);
      if (/short|concise/i.test(instruction)) setTone("concise");
      else if (/warm|welcom/i.test(instruction)) setTone("warmer");
      if (/no holiday|no seasonal|general/i.test(instruction)) { setSeasonalUsed(null); setSeasonalRemoved(true); setDirection("general"); }
      else if (/season|event|holiday/i.test(instruction)) setDirection("seasonal");
    }
    setMessages((value) => [...value, { role: "assistant", text: step === "when" ? period ? `I'll focus on ${period.label}. You can adjust the selection before continuing.` : "Choose a period below, or mention its month by name." : "I've added that to your preferences. Review the choices below before I write anything." }]);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-foreground/70 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label="Update with AI" className="flex h-[94vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-float">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <AiMark size={36} live={step === "generating"} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[16px] font-semibold text-card-foreground">Content assistant</h2>
            <p className="text-[11.5px] text-muted-foreground">{HOTEL} · AI suggests, you decide</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-canvas px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-[11px] font-semibold uppercase text-brand">{step === "done" ? "Published" : step === "generating" ? "Writing your update" : STEP_LABELS[stepIndex]?.label}</p>
            {assistantIntro && <Conversation className="mb-6 max-h-[240px] min-h-[120px] rounded-md border border-border bg-card"><ConversationContent className="space-y-3 p-4"><Message from="assistant"><MessageContent className="bg-transparent p-0"><MessageResponse>{assistantIntro}</MessageResponse></MessageContent></Message>{learning && <Message from="assistant"><MessageContent className="bg-transparent p-0"><MessageResponse>{learning}</MessageResponse></MessageContent></Message>}{messages.map((item, index) => <Message key={index} from={item.role}><MessageContent className={item.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent p-0"}><MessageResponse>{item.text}</MessageResponse></MessageContent></Message>)}</ConversationContent><ConversationScrollButton /></Conversation>}
          {step === "when" && (
              <div className="mx-auto max-w-2xl space-y-5">
              <div>
                <h3 className="text-[19px] font-semibold text-card-foreground">What would you like to update?</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">Upcoming periods still use year-round content. Choose when you want something fresh.</p>
              </div>
              {learning && <div className="rounded-md border border-brand/25 bg-brand-soft/50 px-4 py-3 text-[12px] text-card-foreground"><Sparkle size={13} className="mr-1.5 inline text-brand" />{learning}</div>}
              <Button variant="outline" onClick={() => setSelected([recommended.id])} className={`block h-auto w-full whitespace-normal p-4 text-left ${selected[0] === recommended.id ? "border-brand bg-brand-soft/40" : "border-border bg-card"}`}>
                <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase text-brand"><Sparkle size={12} />Recommended update period</p>
                <p className="mt-1.5 text-[17px] font-semibold text-card-foreground">{recommended.label}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{recommended.blurb}</p>
              </Button>
              <div className="flex flex-wrap gap-2">{periodOptions.filter((option) => option.id !== recommended.id).map((option) => <Button key={option.id} variant={selected[0] === option.id ? "brand" : "outline"} size="sm" onClick={() => setSelected([option.id])}>{option.label}</Button>)}</div>
            </div>
          )}

          {step === "how" && (
            <div className="mx-auto max-w-2xl space-y-6">
              <div>
                <h3 className="text-[19px] font-semibold text-card-foreground">How would you like to update your content?</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">AI will use your existing content as a starting point and adapt it for the selected period.</p>
              </div>
              <fieldset>
                <legend className="text-[11px] font-semibold uppercase text-muted-foreground">Tone</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {TONES.map((t) => (
                    <Button key={t.id} variant="outline" onClick={() => setTone(t.id)} className={`block h-auto whitespace-normal p-3 text-left ${tone === t.id ? "border-brand bg-brand-soft/40" : "border-border bg-card"}`}>
                      <p className="text-[13px] font-semibold text-card-foreground">{t.label}{t.id === "current" && <span className="ml-1.5 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-brand">Recommended</span>}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{t.note}</p>
                    </Button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[11px] font-semibold uppercase text-muted-foreground">Direction</legend>
                <p className="mt-1 text-[11.5px] text-muted-foreground">AI can recommend one — you don't have to choose.</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {DIRECTIONS.map((d) => (
                    <Button key={d.id} variant="outline" onClick={() => setDirection(d.id)} className={`block h-auto whitespace-normal p-3 text-left ${direction === d.id ? "border-brand bg-brand-soft/40" : "border-border bg-card"}`}>
                      <p className="text-[13px] font-semibold text-card-foreground">{d.label}{d.id === "general" && <span className="ml-1.5 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-brand">Recommended</span>}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{d.note}</p>
                    </Button>
                  ))}
                </div>
              </fieldset>
              {suggestion && (
                <div className={`rounded-lg border p-4 ${suggestionLive ? "border-brand/30 bg-brand-soft/40" : "border-border bg-card"}`}>
                  <p className="text-[10.5px] font-semibold uppercase text-brand">Suggested for {monthName(first.month)}</p>
                  <p className="mt-1 text-[14px] font-semibold text-card-foreground">{suggestion.emoji} {suggestion.name} — {suggestion.date}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{suggestion.note}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant={suggestionLive ? "brand" : "outline"} onClick={() => { setSeasonalUsed(suggestion); setSeasonalRemoved(false); }}>Use suggestion</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSeasonalUsed(null); setSeasonalRemoved(true); }}>Keep it general</Button>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-[13.5px] font-semibold text-card-foreground">Anything else?</p>
                {!noteOpen ? (
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => setNoteOpen(true)}><Plus size={14} />Add a preference</Button>
                ) : (
                  <div className="mt-2 space-y-2">
                    <Input placeholder="e.g. Focus more on relaxation. Keep the messaging promotional." value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="flex flex-wrap gap-1.5">
                      {["Focus more on relaxation.", "Keep the messaging promotional.", "Don't mention holidays."].map((s) => (
                        <Button key={s} variant="outline" size="sm" onClick={() => setNote(s)}>{s}</Button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Optional and lightweight — AI keeps it simple.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "plan" && (
            <div className="mx-auto max-w-2xl space-y-5">
              <div>
                <h3 className="text-[19px] font-semibold text-card-foreground">Review your update plan</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">What exactly is AI about to do?</p>
              </div>
              <dl className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
                {[["Hotel", HOTEL], ["Audience", "All eligible guests"], ["Content", "Automated Invites"], ["Period", periodRange(selected)]].map(([k, v]) => (
                  <div key={k}><dt className="text-[10.5px] font-semibold uppercase text-muted-foreground">{k}</dt><dd className="mt-0.5 text-[13.5px] font-medium text-card-foreground">{v}</dd></div>
                ))}
              </dl>
              <div className={`rounded-lg border p-4 ${suggestionLive ? "border-brand/30 bg-brand-soft/40" : "border-border bg-card"}`}>
                <p className="text-[10.5px] font-semibold uppercase text-muted-foreground">Seasonal context</p>
                {suggestionLive ? (
                  <>
                    <p className="mt-1 text-[14px] font-semibold text-card-foreground">{suggestionLive.emoji} {suggestionLive.name} — {suggestionLive.date}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">AI will use {suggestionLive.name} as light seasonal context where it fits naturally into your automated invite content.</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setSeasonalUsed(null); setSeasonalRemoved(true); }}><Trash2 size={13} />Remove</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-[13.5px] font-semibold text-card-foreground">No seasonal context</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">AI will focus on refreshing your existing content{selected.length > 1 ? " for the selected periods" : ` for ${first.short}`} without seasonal messaging.</p>
                    {suggestion && <Button size="sm" variant="ghost" className="mt-2" onClick={() => { setSeasonalUsed(suggestion); setSeasonalRemoved(false); }}><Plus size={13} />Add seasonal context</Button>}
                  </>
                )}
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-[13.5px] font-semibold text-card-foreground">How AI will update your content</p>
                <ul className="mt-2 space-y-1.5">
                  {["Refresh your existing automated invite content", "Keep your current hotel voice", tone !== "current" ? `Apply your selected tone — ${TONES.find((t) => t.id === tone)?.label.toLowerCase()}` : "Keep your current tone", suggestionLive ? `Use ${suggestionLive.name} as light seasonal context` : "No seasonal messaging", "Keep content relevant to all eligible guests"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12.5px] text-card-foreground"><Check size={14} className="mt-0.5 shrink-0 text-brand" />{item}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-border pt-3 text-[12px] font-semibold text-card-foreground">Nothing will be published until you review it.</p>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-6 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-xl bg-brand text-brand-foreground ai-pulse"><SparkIcon size={26} /></span>
              <div>
                <h3 className="text-[18px] font-semibold text-card-foreground">Refreshing your content</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{genStage >= 5 ? "Your content is ready — review the updated content before publishing." : "Writing for " + periodRange(selected).toLowerCase() + "."}</p>
              </div>
              <ol className="w-full space-y-2 text-left">
                {GEN_STEPS.map((label, i) => (
                  <li key={label} className={`flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-[12.5px] ${i < genStage ? "border-brand/30 bg-brand-soft/40 text-card-foreground" : i === genStage ? "border-border bg-card text-card-foreground" : "border-border/50 bg-card/50 text-muted-foreground"}`}>
                    {i < genStage ? <Check size={14} className="text-brand" /> : i === genStage ? <span className="size-2 animate-pulse rounded-full bg-brand" /> : <Circle size={12} className="text-muted-foreground/50" />}
                    {label}
                  </li>
                ))}
              </ol>
            </div>
          )}

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
                {mode === "insight" && <Insights seasonal={suggestionLive?.name ?? null} tone={TONES.find((t) => t.id === tone)?.label ?? "your current tone"} removed={suggestionLive === null} />}
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

        {(step === "when" || step === "how" || step === "plan") && <div className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-6"><div className="mx-auto max-w-4xl"><PromptInput onSubmit={(message) => submitInstruction(message.text)}><PromptInputTextarea placeholder={step === "when" ? "Tell me which month you'd like to update…" : "Tell me what you'd like the content to sound like…"} /><PromptInputFooter className="justify-end"><PromptInputSubmit status="ready" className="size-8" /></PromptInputFooter></PromptInput></div></div>}

        {step !== "generating" && step !== "done" && (
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 sm:px-6">
            <Button variant="ghost" disabled={step === "when"} onClick={() => setStep(step === "review" && generated.length ? "generating" : step === "review" ? "plan" : step === "publishing" ? "review" : step === "plan" ? "how" : "when")}>
              <ArrowLeft size={14} />Back
            </Button>
            {step === "when" && <Button variant="brand" disabled={!selected.length} onClick={() => setStep("how")}>Continue<ArrowRight size={14} /></Button>}
            {step === "how" && <Button variant="brand" onClick={() => setStep("plan")}>Continue<ArrowRight size={14} /></Button>}
            {step === "plan" && <Button variant="brand" onClick={startGenerate}><SparkIcon size={14} />Approve &amp; generate</Button>}
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
