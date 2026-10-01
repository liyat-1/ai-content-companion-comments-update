import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CalendarRange, Check, Expand, FileSpreadsheet, FileText, Image, Loader2, Minimize2, Paperclip, Pencil, Sparkles, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuItem, PromptInputActionMenuTrigger, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools, usePromptInputAttachments, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { AiMark } from "./shared";
import { ComposerThumbs, SentThumbs, type SentFile } from "@/components/ai/AttachmentThumbs";
import { EVENT_ICONS, EVENT_IMAGES } from "./eventImages";
import { ACCEPT_ALL, prepareAttachments } from "@/lib/attachments";
import { planAssist, type PlanEvent } from "@/lib/ai.functions";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { generateAll, parseTimeframe, readDirection, useLibrary, type Direction, type Idea } from "@/lib/contentLibrary";
import { TODAY, buildPeriods, fmtRange, useCalendar, type CalendarEvent, type ContentPeriod, type PeriodKind } from "@/lib/calendar";

type Phase = "setup" | "plan" | "generating" | "ready";
type GapChoice = "keep" | "ai";
const STEPS = ["After Last Visit", "3 Months", "6 Months", "9 Months", "12 Months", "15 Months+", "Booking Confirmation", "Pre-Arrival", "Welcome Message", "Post-Stay Thank You"];
const pad = (n: number) => String(n).padStart(2, "0");
const monthStart = (m: number) => `2026-${pad(m + 1)}-01`;
const monthEnd = (m: number) => new Date(Date.UTC(2026, m + 1, 0)).toISOString().slice(0, 10);

export function AiCreateStudio({ onClose, onMinimize, minimized = false, onReview }: { onClose: () => void; onMinimize: () => void; minimized?: boolean; onReview: () => void }) {
  const { campaigns } = useLibrary();
  const { events } = useCalendar();
  const [phase, setPhase] = useState<Phase>("setup");
  const [range, setRange] = useState({ from: TODAY, to: "2026-12-31" });
  const [direction, setDirection] = useState<Direction>({ tone: ["warm"], avoid: [], notes: [] });
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; files?: SentFile[] }[]>([]);
  const [thinking, setThinking] = useState(false);
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState<CalendarEvent[]>([]);
  const [gaps, setGaps] = useState<Record<string, GapChoice>>({});
  const valid = range.from >= TODAY && range.to >= range.from;
  const periods = useMemo(() => valid ? buildPeriods([...events, ...uploaded.filter((u) => !events.some((e) => e.name === u.name))], range.from, range.to) : [], [events, uploaded, range, valid]);
  const rangeLabel = `${fmtRange(range.from, range.to)}${range.to.slice(0, 4) !== "2026" ? ` ${range.to.slice(0, 4)}` : ""}`;
  const setFrom = (from: string) => setRange((r) => ({ from, to: r.to < from ? from : r.to }));
  const setTo = (to: string) => setRange((r) => ({ from: r.from > to ? to : r.from, to }));

  useEffect(() => { if (phase !== "generating") return; if (step < STEPS.length) { const timer = window.setTimeout(() => setStep((value) => value + 1), 460); return () => window.clearTimeout(timer); } const timer = window.setTimeout(() => setPhase("ready"), 500); return () => window.clearTimeout(timer); }, [phase, step]);

  const submit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text && !message.files.length) return;
    const parsed = parseTimeframe(text);
    if (parsed) setRange({ from: parsed.s <= 8 ? TODAY : monthStart(parsed.s), to: monthEnd(parsed.e) });
    if (text) setDirection((value) => readDirection(text, value));
    setMessages((value) => [...value, { role: "user", text: text || "Use these files.", files: message.files.map((f) => ({ name: f.filename ?? "file", mediaType: f.mediaType ?? "", preview: f.mediaType?.startsWith("image/") ? f.url : undefined })) }]);
    setThinking(true);
    void (async () => {
      const prepared = await prepareAttachments(message.files);
      setMessages((value) => value.map((m, i) => i === value.length - 1 && m.files ? { ...m, files: m.files.map((f, j) => ({ ...f, preview: prepared[j]?.dataUrl?.startsWith("data:image") ? prepared[j].dataUrl : f.preview })) } : m));
      const res = await planAssist({ data: { text, files: prepared, history: messages.map((m) => ({ role: m.role, text: m.text })), range: rangeLabel, plan: periods.map((p) => `${p.kind}: ${p.name} (${fmtRange(p.start, p.end)})`) } }).catch(() => ({ reply: "", events: [], startMonth: null, endMonth: null, error: "The AI couldn't be reached. Please try again." }));
      setThinking(false);
      if (res.error) { setMessages((value) => [...value, { role: "assistant", text: `⚠️ ${res.error}` }]); return; }
      const found = res.events.map(toEvent).filter((e): e is CalendarEvent => e !== null && e.end >= TODAY);
      if (found.length) {
        setUploaded((value) => [...value.filter((v) => !found.some((e) => e.name === v.name)), ...found]);
        if (!parsed) setRange((r) => ({ from: r.from, to: found.reduce((m, e) => (e.end > m ? e.end : m), r.to) }));
      }
      if (!parsed && !found.length && res.startMonth !== null && res.endMonth !== null && res.startMonth <= res.endMonth) setRange({ from: res.startMonth <= 8 ? TODAY : monthStart(res.startMonth), to: monthEnd(res.endMonth) });
      setMessages((value) => [...value, { role: "assistant", text: res.reply || "Done — I’ve reflected that in the plan." }]);
    })();
  };

  const approve = () => {
    const ideas: Idea[] = periods.filter((p) => p.kind !== "Standard" || gaps[p.id] === "ai").map((p) => ({ id: p.id, group: p.kind === "Seasonal" || p.kind === "Standard" ? "Seasonal moments" : "Local events", emoji: p.kind === "Event-based" ? "📅" : "🍂", name: p.kind === "Standard" ? `Seasonal content ${fmtRange(p.start, p.end)}` : p.name, date: fmtRange(p.start, p.end), month: Number(p.start.slice(5, 7)) - 1, fit: p.reason }));
    generateAll(ideas, direction, rangeLabel); setStep(0); setPhase("generating");
  };

  const dates = (compact: boolean) => <div className={`grid items-end gap-2 ${compact ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]" : "grid-cols-1 sm:grid-cols-[1fr_auto_1fr]"}`}><label className="min-w-0 text-[10.5px] font-medium text-muted-foreground">Start date<input type="date" aria-label="Start date" min={TODAY} value={range.from} onChange={(e) => e.target.value && setFrom(e.target.value)} className="mt-1 block h-9 w-full min-w-0 rounded-md border border-border bg-background px-2.5 text-[12px] font-semibold text-card-foreground" /></label><ArrowRight size={13} className="mb-3 hidden shrink-0 text-muted-foreground sm:block" /><label className="min-w-0 text-[10.5px] font-medium text-muted-foreground">End date<input type="date" aria-label="End date" min={range.from} value={range.to} onChange={(e) => e.target.value && setTo(e.target.value)} className="mt-1 block h-9 w-full min-w-0 rounded-md border border-border bg-background px-2.5 text-[12px] font-semibold text-card-foreground" /></label></div>;
  const plan = <PeriodPlan periods={periods} gaps={gaps} setGap={(id, v) => setGaps((g) => ({ ...g, [id]: v }))} compact={minimized} onEdit={() => setPhase("setup")} onApprove={approve} />;
  const chat = <>{messages.map((message, index) => <div key={`${message.role}-${index}`}><SentThumbs files={message.files} /><Message from={message.role} className="mt-4"><MessageContent className={minimized && message.role === "assistant" ? "bg-transparent p-0 text-[12px]" : message.role === "user" && minimized ? "bg-primary text-primary-foreground" : undefined}><MessageResponse>{message.text}</MessageResponse></MessageContent></Message></div>)}{thinking && <Shimmer className="mt-3 text-[12px]">Reading your files and prompt…</Shimmer>}</>;

  if (minimized) {
    return <section aria-label="AI content planner" className="ai-rise flex min-h-[620px] max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lift">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3"><AiMark size={34} live={phase === "generating"} /><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-[13.5px] font-semibold text-card-foreground">Content assistant</p><span className="size-1.5 shrink-0 rounded-full bg-emerald-500" /></div><p className="truncate text-[11px] text-muted-foreground">{rangeLabel} · Holiday Inn Times Square</p></div></div>
        <div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" onClick={onMinimize} aria-label="Expand AI planner"><Expand size={16} /></Button><Button variant="ghost" size="icon" onClick={onClose} disabled={phase === "generating"} aria-label="Close AI planner"><X size={16} /></Button></div>
      </header>
      {phase === "generating" || phase === "ready" ? <CompactGeneration phase={phase} step={step} total={campaigns.length} rangeLabel={rangeLabel} onReview={onReview} /> : <>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="flex items-start gap-3"><AiMark size={30} /><div><h2 className="text-[18px] font-semibold leading-snug text-card-foreground">Plan your upcoming content</h2><p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">Pick exact dates — I’ll split them into content periods from your Events & Holidays calendar.</p></div></div>
          <section className="mt-5 border-y border-border py-4"><p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground"><CalendarRange size={14} className="text-brand" />Timeframe</p>{dates(true)}</section>
          {phase === "setup" ? <Button variant="brand" className="mt-4 w-full" disabled={!valid} onClick={() => setPhase("plan")}>Build my plan <ArrowRight size={14} /></Button> : <div className="mt-4">{plan}</div>}
          {chat}
        </div>
        <CompactComposer onSubmit={submit} />
      </>}
    </section>;
  }

  return <section aria-label="AI content planner" className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-brand/20 bg-card shadow-lift">
    <div className="pointer-events-none absolute inset-0 ai-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
    <header className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md sm:px-6"><div className="flex min-w-0 items-center gap-3"><AiMark size={34} live={phase === "generating"} /><div className="min-w-0"><p className="truncate text-[13.5px] font-semibold text-card-foreground">Localize with AI</p><p className="truncate text-[11px] text-muted-foreground">Holiday Inn Times Square</p></div></div><div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" onClick={onMinimize} aria-label="Minimize AI planner"><Minimize2 /></Button><Button variant="ghost" size="icon" onClick={onClose} disabled={phase === "generating"} aria-label="Close AI planner"><X /></Button></div></header>
    {phase === "generating" || phase === "ready" ? <Generation phase={phase} step={step} total={campaigns.length} rangeLabel={rangeLabel} onReview={onReview} /> : <>
      <Conversation className="relative h-[calc(100vh-20rem)] min-h-[470px]"><ConversationContent className="mx-auto w-full max-w-5xl gap-6 px-4 pb-8 pt-10 sm:px-6">
        <section className="text-center"><span className="ai-float inline-block"><AiMark size={50} live /></span><h2 className="mt-4 font-display text-[30px] font-semibold text-card-foreground sm:text-[38px]">Plan your upcoming content</h2><p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">Choose exact dates. I’ll divide them into Standard, Event-based and Seasonal periods using your Events & Holidays calendar.</p></section>
        <section className="rounded-lg border border-border bg-card p-5 shadow-card"><div className="flex items-center gap-2"><CalendarRange size={17} className="text-brand" /><p className="text-[13px] font-semibold text-card-foreground">When should this content run?</p></div><div className="mt-4 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">{dates(false)}<Button variant="brand" disabled={!valid} onClick={() => setPhase("plan")}>{phase === "plan" ? "Rebuild plan" : "Build my plan"} <ArrowRight /></Button></div>{!valid && <p className="mt-2 text-[11px] text-destructive">Choose a start date from today onward and an end date after it.</p>}</section>
        {phase === "plan" && <><Message from="assistant"><MessageContent><MessageResponse>{`Here’s how I’d cover ${rangeLabel}: ${periods.length} content periods. Nothing is written or published until you approve — and everything goes to Review before it reaches guests.`}</MessageResponse></MessageContent></Message>{plan}</>}
        {chat}
      </ConversationContent><ConversationScrollButton /></Conversation>
      <Composer onSubmit={submit} />
    </>}
  </section>;
}

function PeriodPlan({ periods, gaps, setGap, compact, onEdit, onApprove }: { periods: ContentPeriod[]; gaps: Record<string, GapChoice>; setGap: (id: string, v: GapChoice) => void; compact: boolean; onEdit: () => void; onApprove: () => void }) {
  const { events } = useCalendar();
  const byId = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);
  const written = periods.filter((p) => p.kind !== "Standard" || gaps[p.id] === "ai").length;
  return <section aria-label="Content period plan" className="overflow-hidden rounded-lg border border-brand/30 bg-card shadow-lift">
    <div className="ai-surface flex flex-wrap items-end justify-between gap-2 border-b border-brand/15 p-4"><div><p className="text-[10.5px] font-semibold uppercase text-brand">Your content plan</p><h3 className={`${compact ? "text-[15px]" : "font-display text-[20px]"} font-semibold text-card-foreground`}>{periods.length} periods · {written} to write</h3></div><span className="rounded-sm bg-brand-soft px-2 py-1 text-[10.5px] font-semibold text-brand">Direct + OTA · Email + Text</span></div>
    <div className={compact ? "grid gap-2 p-3" : "grid gap-3 p-4 sm:grid-cols-2"}>{periods.map((p) => { const event = p.eventId ? byId.get(p.eventId) : undefined; const image = event?.image ?? (p.eventId ? EVENT_IMAGES[p.eventId] : undefined); const Icon = p.kind === "Standard" ? CalendarDays : EVENT_ICONS[event?.type ?? ""] ?? CalendarDays;
      return <article key={p.id} className="group overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
        <div className={`relative overflow-hidden ${compact ? "h-14" : "h-28"}`}>
          {image ? <img src={image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className={`grid h-full place-items-center ${p.kind === "Standard" ? "bg-gradient-to-br from-muted to-canvas text-muted-foreground" : "bg-brand-soft text-brand"}`}><Icon size={compact ? 16 : 26} strokeWidth={1.75} /></div>}
          <span className="absolute left-2 top-2 rounded-sm bg-card/90 px-1.5 py-0.5 text-[9.5px] font-semibold text-card-foreground shadow-sm backdrop-blur-sm">{fmtRange(p.start, p.end)}</span>
          <span className="absolute right-2 top-2 rounded-sm bg-brand px-1.5 py-0.5 text-[9.5px] font-semibold text-brand-foreground shadow-sm">{p.kind}</span>
        </div>
        <div className="p-3"><p className={`${compact ? "text-[12px]" : "text-[13px]"} font-semibold text-card-foreground`}>{p.name}</p><p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{p.reason}</p>{p.windowNote && <p className="mt-1 text-[10px] text-brand">{p.windowNote}</p>}
          {p.kind === "Standard" && <div role="radiogroup" aria-label={`Gap ${fmtRange(p.start, p.end)}`} className="mt-2 flex flex-wrap gap-1.5">{([["keep", "Keep year-round content"], ["ai", "Write seasonal content with AI"]] as const).map(([v, label]) => <Button key={v} role="radio" aria-checked={(gaps[p.id] ?? "keep") === v} size="sm" variant={(gaps[p.id] ?? "keep") === v ? "secondary" : "ghost"} className="h-7 px-2 text-[10.5px]" onClick={() => setGap(p.id, v)}>{(gaps[p.id] ?? "keep") === v && <Check size={11} />}{label}</Button>)}</div>}
        </div>
      </article>; })}</div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4"><p className="text-[11px] text-muted-foreground">Generated content goes to Review before publishing.</p><div className="flex gap-2"><Button variant="outline" onClick={onEdit}><Pencil />Edit plan</Button><Button variant="brand" disabled={!written} onClick={onApprove}><Sparkles />Approve & write content</Button></div></div>
  </section>;
}

function CompactComposer({ onSubmit }: { onSubmit: (message: PromptInputMessage) => void }) {
  return <div className="border-t border-border bg-card p-3.5"><TooltipProvider><PromptInput accept={ACCEPT_ALL} multiple maxFiles={10} maxFileSize={25 * 1024 * 1024} onError={(e) => toast.error(e.message)} onSubmit={onSubmit} className="[&_[data-slot=input-group]]:rounded-lg [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-background [&_[data-slot=input-group]]:shadow-card [&_[data-slot=input-group]]:focus-within:border-brand"><ComposerThumbs /><PromptInputTextarea placeholder="Ask AI to adjust the plan…" className="min-h-16 px-3.5 py-3 text-[12.5px]" /><PromptInputFooter className="border-t border-border/60 px-2 pb-2 pt-1.5"><PromptInputTools><PromptInputActionMenu><PromptInputActionMenuTrigger tooltip="Add photos, video, or files" className="size-8 rounded-md border border-border bg-card" /><PromptInputActionMenuContent className="w-48"><CompactAttachmentItem icon={<Image size={14} />} label="Add photos" /><CompactAttachmentItem icon={<Video size={14} />} label="Add video" /><CompactAttachmentItem icon={<Paperclip size={14} />} label="Add files" /></PromptInputActionMenuContent></PromptInputActionMenu></PromptInputTools><PromptInputSubmit status="ready" className="size-8 rounded-md bg-foreground text-background hover:bg-foreground/90" /></PromptInputFooter></PromptInput></TooltipProvider></div>;
}

function CompactAttachmentItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  const attachments = usePromptInputAttachments();
  return <PromptInputActionMenuItem onSelect={() => { window.setTimeout(() => attachments.openFileDialog(), 50); }}>{icon}{label}</PromptInputActionMenuItem>;
}

function CompactGeneration({ phase, step, total, rangeLabel, onReview }: { phase: Phase; step: number; total: number; rangeLabel: string; onReview: () => void }) {
  const ready = phase === "ready";
  const current = STEPS[Math.min(step, STEPS.length - 1)];
  return <div className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 overflow-y-auto p-5"><AiMark size={42} live={!ready} /><p className="mt-5 text-[10.5px] font-semibold uppercase text-brand">{ready ? "Content ready for review" : `${Math.min(step + 1, STEPS.length)} of ${STEPS.length}`}</p><h2 className="mt-1 text-[22px] font-semibold leading-tight text-card-foreground">{ready ? rangeLabel : `Writing ${current}`}</h2><p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{ready ? `${total} campaigns are written and waiting in Review.` : "Building Direct and OTA versions for Email and Text."}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${ready ? 100 : Math.min(100, step / STEPS.length * 100)}%` }} /></div><div className="mt-5 space-y-2">{STEPS.slice(Math.max(0, step - 1), Math.min(STEPS.length, step + 4)).map((label, index) => { const actual = Math.max(0, step - 1) + index; const complete = ready || actual < step; return <div key={label} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${actual === step && !ready ? "border-brand/40 bg-brand-soft/50" : "border-border bg-card"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-md ${complete ? "bg-brand text-brand-foreground" : actual === step ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"}`}>{complete ? <Check size={13} /> : actual === step ? <Loader2 size={13} className="animate-spin" /> : <span className="text-[10px]">{actual + 1}</span>}</span><p className="min-w-0 truncate text-[11.5px] font-medium text-card-foreground">{label}</p></div>; })}</div></div>{ready && <div className="border-t border-border p-4"><Button variant="brand" className="w-full" onClick={onReview}>Go to Review <ArrowRight size={14} /></Button></div>}</div>;
}

function Composer({ onSubmit }: { onSubmit: (message: PromptInputMessage) => void }) {
  return <div className="relative border-t border-border bg-card/90 px-4 py-3 backdrop-blur-md"><div className="mx-auto max-w-4xl"><TooltipProvider><PromptInput accept={ACCEPT_ALL} multiple maxFiles={10} maxFileSize={25 * 1024 * 1024} onError={(e) => toast.error(e.message)} onSubmit={onSubmit} className="rounded-lg shadow-lift"><ComposerThumbs /><PromptInputTextarea placeholder="Add hotel context, instructions, or a date range…" /><PromptInputFooter><PromptInputTools><PromptInputActionMenu><PromptInputActionMenuTrigger tooltip="Add context" /><PromptInputActionMenuContent><CompactAttachmentItem icon={<FileSpreadsheet size={14} />} label="Events calendar (CSV / sheet)" /><CompactAttachmentItem icon={<FileText size={14} />} label="Document" /><CompactAttachmentItem icon={<Image size={14} />} label="Photos" /><CompactAttachmentItem icon={<Video size={14} />} label="Video" /></PromptInputActionMenuContent></PromptInputActionMenu><span className="hidden text-[11px] text-muted-foreground sm:inline">Documents, sheets, images, and video</span></PromptInputTools><PromptInputSubmit status="ready" /></PromptInputFooter></PromptInput></TooltipProvider></div></div>;
}

function Generation({ phase, step, total, rangeLabel, onReview }: { phase: Phase; step: number; total: number; rangeLabel: string; onReview: () => void }) {
  const ready = phase === "ready";
  return <main className="relative min-h-[560px] overflow-hidden p-5 sm:p-9"><div className="pointer-events-none absolute inset-0 ai-surface opacity-70" /><section className="relative mx-auto max-w-5xl"><div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr]"><div className="flex flex-col justify-center py-5"><AiMark size={58} live={!ready} /><p className="mt-5 text-[11px] font-semibold uppercase text-brand">{ready ? "Content ready for review" : `${Math.min(step + 1, STEPS.length)} of ${STEPS.length} campaigns`}</p><h2 className="mt-2 font-display text-[28px] font-semibold text-card-foreground sm:text-[36px]">{ready ? `Generated for ${rangeLabel}` : `Writing ${STEPS[Math.min(step, STEPS.length - 1)]}`}</h2><p className="mt-3 max-w-md text-[13px] leading-6 text-muted-foreground">{ready ? "Everything is waiting in Review. Approve campaigns there before anything reaches guests." : "Direct and OTA guest versions are being shaped for Email and Text, then checked against the seasonal plan."}</p><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.min(100, step / STEPS.length * 100)}%` }} /></div></div><div className="grid gap-2 sm:grid-cols-2">{STEPS.map((label, index) => <div key={label} className={`relative overflow-hidden rounded-md border p-3.5 transition-colors ${index < step || ready ? "border-brand/20 bg-card text-card-foreground" : index === step ? "border-brand bg-brand-soft text-brand shadow-card" : "border-border bg-card/60 text-muted-foreground"}`}>{index === step && !ready && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand [animation:ai-sweep_1.2s_ease-in-out_infinite]" />}<div className="flex items-start gap-3">{index < step || ready ? <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground"><Check size={13} /></span> : index === step ? <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-soft text-brand"><Loader2 size={14} className="animate-spin" /></span> : <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-semibold">{index + 1}</span>}<div><p className="text-[12.5px] font-semibold">{label}</p><p className="mt-1 text-[10.5px] opacity-75">{index < step || ready ? "Direct + OTA · Email + Text complete" : index === step ? "Writing guest-specific versions…" : "Queued"}</p></div></div></div>)}</div></div>{ready && <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-brand/25 bg-card p-5 shadow-lift"><span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand"><Sparkles size={18} /></span><div className="min-w-52 flex-1"><p className="text-[13px] font-semibold text-card-foreground">{total} campaigns are ready</p><p className="text-[11.5px] text-muted-foreground">Review each period’s content, then publish it from Review.</p></div><Button variant="brand" onClick={onReview}>Go to Review <ArrowRight /></Button></div>}</section></main>;
}

function toEvent(e: PlanEvent, index: number): CalendarEvent | null {
  const m = e.date?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m || !e.name) return null;
  const d = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return { id: `ai-${index}-${e.name}`, name: e.name, start: d, end: d, type: e.kind === "holiday" ? "Holiday" : "Local event", source: "Added manually", note: e.note || "From your files" };
}
