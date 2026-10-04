import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  FileText,
  GitCompare,
  Image,
  Minimize2,
  Paperclip,
  Plus,
  RefreshCw,
  Pencil,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { AiMark } from "@/components/content/shared";
import { ComposerThumbs, SentThumbs, type SentFile } from "./AttachmentThumbs";
import { ACCEPT_ALL, prepareAttachments, type AttachmentInput } from "@/lib/attachments";
import { editAssist } from "@/lib/ai.functions";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Sparkle } from "./Sparkle";
import {
  FEEDBACK_REASONS,
  diffWords,
  refine,
  type Copy,
} from "@/lib/aiWriter";
import { ADAPT_BRAND, CHECK_BRAND, HOTEL_PROFILE, STARTING_VOICE, buildPresets, parseTitle, profileBrief } from "@/lib/contentProfile";

type Msg =
  | { role: "user"; text: string; files?: SentFile[] }
  | {
      role: "ai";
      text: string;
      card?: "profile" | "missing" | "starter";
      proposal?: { copy: Copy; changes: string[]; why: string; notes: string[]; state: "open" | "applied" | "kept" };
    };

/** Renders the suggestion as the guest would see it, with additions highlighted against `before`. */
function ChannelPreview({ copy, before }: { copy: Copy; before?: Copy }) {
  const show = (now: string, was?: string) => (was !== undefined ? <DiffInline before={was} after={now} /> : now);
  if (copy.kind === "text") {
    const was = before?.kind === "text" ? before.text.message : undefined;
    return (
      <p className="max-w-[92%] whitespace-pre-wrap rounded-[14px] rounded-bl-sm bg-card px-3 py-2 text-[12.5px] leading-relaxed text-card-foreground shadow-card">
        {show(copy.text.message, was)}
      </p>
    );
  }
  const b = before?.kind === "email" ? before.email : undefined;
  const e = copy.email;
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card text-[12px] text-card-foreground shadow-card">
      <div className="border-b border-border px-3 py-2">
        <p className="font-semibold">{show(e.subject, b?.subject)}</p>
        <p className="text-[11px] text-muted-foreground">{show(e.preheader, b?.preheader)}</p>
      </div>
      <div className="space-y-2 px-3 py-3">
        <p className="font-display text-[15px] font-semibold">{show(e.heading, b?.heading)}</p>
        <p className="whitespace-pre-wrap leading-relaxed">{show(e.body, b?.body)}</p>
        <span className="inline-block rounded-md bg-primary px-3 py-1.5 text-[11.5px] font-semibold text-primary-foreground">{e.ctaLabel}</span>
      </div>
    </div>
  );
}

function DiffInline({ before, after }: { before: string; after: string }) {
  return (
    <>
      {diffWords(before, after).map((p, i) =>
        p.s === "same" ? <span key={i}>{p.t}</span> : p.s === "add" ? <span key={i} className="rounded-sm bg-brand-soft text-brand">{p.t}</span> : null,
      )}
    </>
  );
}

export function copyText(copy: Copy) {
  return copy.kind === "text"
    ? copy.text.message
    : `Subject: ${copy.email.subject}\nPreview: ${copy.email.preheader}\n\n${copy.email.heading}\n\n${copy.email.body}\n\nButton: ${copy.email.ctaLabel}`;
}

export function Diff({ before, after }: { before: string; after: string }) {
  return (
    <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">
      {diffWords(before, after).map((p, i) =>
        p.s === "same" ? (
          <span key={i}>{p.t}</span>
        ) : p.s === "add" ? (
          <span key={i} className="rounded-sm bg-brand-soft text-brand">
            {p.t}
          </span>
        ) : (
          <span key={i} className="text-muted-foreground line-through decoration-destructive/60">
            {p.t}
          </span>
        ),
      )}
    </p>
  );
}

/** Floating Directful AI workspace shown over the still-visible campaign editor. */
export function AiEditPanel({
  title,
  copy,
  initialContext,
  suggestedActions,
  onApply,
  onClose,
  onEditMyself,
  className = "z-[70]",
  embedded = false,
  onMinimize,
}: {
  title: string;
  copy: Copy;
  initialContext?: string;
  suggestedActions?: string[];
  onApply: (copy: Copy) => void;
  onClose: () => void;
  onEditMyself?: () => void;
  className?: string;
  embedded?: boolean;
  onMinimize?: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: initialContext
        ? `${initialContext}\n\nWould you like me to apply that strength to the current Directful suggestion?`
        : `I'm working on the current ${copy.kind === "email" ? "email" : "text message"} for ${title} — including any edits you've made. What would you like to change?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(0);
  const [lastRequest, setLastRequest] = useState("");
  const [memory, setMemory] = useState<string[]>([]);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll only the transcript — scrollIntoView would also scroll the editor and dialog behind it.
    const list = endRef.current?.parentElement;
    if (list && msgs.length > 1) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const openProposal = () => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.role === "ai" && m.proposal?.state === "open") return m.proposal.copy;
    }
    return null;
  };

  const [busy, setBusy] = useState(false);
  const [voiceReady, setVoiceReady] = useState(HOTEL_PROFILE.defined);
  const ctx = parseTitle(title);
  const presets = buildPresets({ ...ctx, copy, hasHistory: !!initialContext });
  const isEmptyState = !initialContext && msgs.length === 1;
  const createVoice = () =>
    setMsgs((m) => [...m, { role: "ai", text: "Based on your website and previous campaigns, here's a starting voice. I can use it for this campaign and refine it as you create more.", card: "starter" }]);
  const ask = async (
    request: string,
    opts?: { retry?: boolean; created?: boolean },
    files: AttachmentInput[] = [],
  ) => {
    const q = request.trim();
    if ((!q && !files.length) || busy) return;
    if (q === CHECK_BRAND) {
      setMsgs((m) => [...m, { role: "user", text: q }, voiceReady
        ? { role: "ai", text: "This is what I currently use when writing and refining your campaign content.", card: "profile" }
        : { role: "ai", text: "**Your hotel's content voice isn't defined yet.** I couldn't find a clear, consistent writing style yet — I can help you create one from what you already have.", card: "missing" }]);
      return;
    }
    if (q === ADAPT_BRAND && !voiceReady && !opts?.created) {
      setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", text: "**Your content voice isn't defined yet.** I can create a starting voice from the information available for your hotel and use it to improve this campaign.", card: "missing" }]);
      return;
    }
    const notes: string[] = [];
    let extra = `Context: ${ctx.campaign} automated invite, ${ctx.audience} guests (${ctx.audience === "OTA" ? "booked via an OTA — encourage booking direct next time" : "booked direct — reward the relationship"}), ${copy.kind} channel${copy.kind === "text" ? " (keep it SMS-short, one CTA)" : " (subject and preheader work together)"}.`;
    if (q === ADAPT_BRAND) {
      extra += ` Rewrite using this profile. ${profileBrief(HOTEL_PROFILE)} List each concrete change in "changes".`;
      notes.push(opts?.created ? "I created a starting content voice from your available hotel information and used it for this suggestion." : "I used your hotel's content voice to make these changes.");
    }
    if (initialContext && /stronger|pattern|previous/i.test(q)) {
      extra += ` Stronger-performing previous version insight: ${initialContext}`;
      notes.push("I also used the stronger-performing previous version as a reference.");
    }
    const r = q.toLowerCase();
    const nextMemory = [...memory];
    if (/(don'?t|do not|no|without).{0,20}(discount|offer|promo)/.test(r))
      nextMemory.push("don't mention the discount");
    setMemory(nextMemory);
    const open = openProposal();
    const base: Copy = open && !/current version|from the current|start over/.test(r) ? open : copy;
    setLastRequest(q);
    setInput("");
    setCompareIdx(null);
    const sent: SentFile[] = files.map((f) => ({
      name: f.filename ?? "file",
      mediaType: f.mediaType ?? "",
      preview: f.mediaType?.startsWith("image/") ? f.url : undefined,
    }));
    setMsgs((m) => [
      ...m.map((x) =>
        x.role === "ai" && x.proposal?.state === "open"
          ? { ...x, proposal: { ...x.proposal, state: "kept" as const } }
          : x,
      ),
      ...(opts?.retry
        ? []
        : [{ role: "user" as const, text: q || "Use these files.", files: sent }]),
    ]);
    setBusy(true);
    const prepared = await prepareAttachments(files);
    if (prepared.some((p) => p.kind === "video" && p.dataUrl))
      setMsgs((m) =>
        m.map((x, i) =>
          i === m.length - 1 && x.role === "user" && x.files
            ? {
                ...x,
                files: x.files.map((f, j) => ({
                  ...f,
                  preview: prepared[j]?.dataUrl?.startsWith("data:image")
                    ? prepared[j].dataUrl
                    : f.preview,
                })),
              }
            : x,
        ),
      );
    const history = msgs.map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      text: m.text,
    }));
    const request2 = [
      opts?.retry ? `${q}. Give a clearly different take than before.` : q,
      ...nextMemory.filter((c) => !r.includes(c)),
      extra,
    ]
      .filter(Boolean)
      .join(". ");
    const current = base.kind === "email" ? base.email : base.text;
    const res = await editAssist({
      data: {
        text: request2,
        files: prepared,
        history,
        kind: base.kind,
        copy: current,
        campaign: title,
      },
    }).catch(() => ({
      reply: "",
      copy: null,
      changes: [],
      why: "",
      error: "The AI couldn't be reached. Please try again.",
    }));
    setBusy(false);
    if (res.error) {
      setMsgs((m) => [...m, { role: "ai", text: `⚠️ ${res.error}` }]);
      return;
    }
    const next: Copy | null = res.copy
      ? base.kind === "email"
        ? {
            kind: "email",
            email: { ...base.email, ...res.copy } as Copy extends infer C
              ? C extends { kind: "email"; email: infer E }
                ? E
                : never
              : never,
          }
        : { kind: "text", text: { message: res.copy.message ?? base.text.message } }
      : null;
    setMsgs((m) => [
      ...m,
      {
        role: "ai",
        text: res.reply || "Here's a suggestion.",
        proposal: next
          ? { copy: next, changes: res.changes.slice(0, 4), why: res.why, notes, state: "open" }
          : undefined,
      },
    ]);
  };
  void refine;
  void seed;
  void setSeed;

  const setState = (idx: number, state: "applied" | "kept") =>
    setMsgs((m) =>
      m.map((x, i) =>
        i === idx && x.role === "ai" && x.proposal
          ? { ...x, proposal: { ...x.proposal, state } }
          : x,
      ),
    );

  const chip = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${active ? "border-brand bg-brand-soft text-brand" : "border-border text-muted-foreground hover:border-brand/45 hover:text-foreground"}`;

  return (
    <div
      className={
        embedded
          ? "h-full min-h-0"
          : `fixed inset-0 grid place-items-center bg-foreground/25 p-3 backdrop-blur-[3px] sm:p-6 ${className}`
      }
      onMouseDown={(event) => !embedded && event.target === event.currentTarget && onClose()}
    >
      <aside
        role={embedded ? "region" : "dialog"}
        aria-modal={embedded ? undefined : "true"}
        aria-label="Directful AI"
        className={`ai-rise relative flex w-full flex-col overflow-hidden border border-brand/30 bg-card ${embedded ? "h-full min-h-0 rounded-lg shadow-lift" : "max-h-[min(86vh,50rem)] max-w-[48rem] rounded-xl shadow-float"}`}
      >
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-brand/20 bg-brand-soft/70 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <AiMark size={32} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13.5px] font-semibold text-card-foreground">
                  Content assistant
                </p>
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                {title} · {copy.kind === "email" ? "Email" : "Text"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onMinimize && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                aria-label="Minimize Directful AI"
              >
                <Minimize2 size={16} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Directful AI">
              <X size={16} />
            </Button>
          </div>
        </header>

        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 ${isEmptyState ? "flex flex-col" : "space-y-6"}`}>
          {isEmptyState ? (
            <div className="m-auto max-w-md py-2 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-md bg-brand text-brand-foreground shadow-card">
                <Sparkle size={19} />
              </span>
              <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight text-card-foreground">
                What would you like to update?
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
                I know this is the {ctx.campaign} {copy.kind === "email" ? "email" : "text"} for {ctx.audience} guests. Here's what could help most.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {presets.map((action) => (
                  <Button key={action} variant="outline" size="sm" className="rounded-full text-[11px]" onClick={() => void ask(action)}>
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          ) : msgs.map((m, idx) =>
            m.role === "user" ? (
              <div key={idx}>
                <SentThumbs files={m.files} />
                <Message from="user" className="max-w-[85%]">
                  <MessageContent className="bg-primary px-3 py-2 text-[12.5px] text-primary-foreground">
                    <MessageResponse>{m.text}</MessageResponse>
                  </MessageContent>
                </Message>
              </div>
            ) : (
              <div key={idx} className="space-y-3">
                <Message from="assistant" className="max-w-full">
                  <MessageContent className="w-full bg-transparent p-0">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 text-[12.5px] leading-relaxed text-card-foreground">
                      <AiMark size={28} />
                      <MessageResponse className="pt-1">{m.text}</MessageResponse>
                    </div>
                  </MessageContent>
                </Message>
                {m.card === "profile" && (
                  <div className="ml-10 rounded-lg border border-border bg-canvas/45 p-3 text-[12px]">
                    <p className="font-semibold text-card-foreground">Your hotel's content profile</p>
                    <dl className="mt-2 grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
                      <dt className="text-muted-foreground">Brand voice</dt><dd>{HOTEL_PROFILE.voice.join(" · ")}</dd>
                      <dt className="text-muted-foreground">Tone</dt><dd>{HOTEL_PROFILE.tone.join(" · ")}</dd>
                      <dt className="text-muted-foreground">Writing style</dt><dd>{HOTEL_PROFILE.style.join(" · ")}</dd>
                      <dt className="text-muted-foreground">Preferences</dt><dd>{HOTEL_PROFILE.preferences.join(" · ")}</dd>
                      <dt className="text-muted-foreground">Brand assets</dt><dd>{HOTEL_PROFILE.assets.map((a) => `${a.label} ${a.ok ? "✓" : "— Not added"}`).join(" · ")}</dd>
                      <dt className="text-muted-foreground">Content sources</dt><dd>{HOTEL_PROFILE.sources.map((a) => `${a.label} ${a.ok ? "✓" : "— Not added"}`).join(" · ")}</dd>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Button size="sm" variant="brand" onClick={() => void ask(ADAPT_BRAND)}>Edit with AI</Button>
                      <Button size="sm" variant="outline" onClick={() => { setInput("Update our content profile: "); inputRef.current?.focus(); }}>Add or update information</Button>
                    </div>
                  </div>
                )}
                {m.card === "missing" && (
                  <div className="ml-10 flex flex-wrap gap-1.5">
                    <Button size="sm" variant="brand" onClick={createVoice}>Create suggested voice</Button>
                    <Button size="sm" variant="outline" onClick={createVoice}>Analyze our website</Button>
                    <Button size="sm" variant="outline" onClick={createVoice}>Learn from our content</Button>
                    <Button size="sm" variant="ghost" onClick={() => setMsgs((x) => [...x, { role: "ai", text: "No problem — I'll keep using your current content as written. You can set up your voice any time." }])}>Do this later</Button>
                  </div>
                )}
                {m.card === "starter" && (
                  <div className="ml-10 rounded-lg border border-border bg-canvas/45 p-3 text-[12px]">
                    <p className="font-semibold text-card-foreground">Suggested starting voice</p>
                    <ul className="mt-2 space-y-1.5">
                      {STARTING_VOICE.map((v) => <li key={v.name}><span className="font-semibold">{v.name}</span> — <span className="text-muted-foreground">{v.text}</span></li>)}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Button size="sm" variant="brand" onClick={() => { setVoiceReady(true); void ask(ADAPT_BRAND, { created: true }); }}>Use this voice</Button>
                      <Button size="sm" variant="outline" onClick={() => { setInput("Adjust the starting voice: "); inputRef.current?.focus(); }}>Adjust with AI</Button>
                      <Button size="sm" variant="ghost" onClick={() => setMsgs((x) => [...x, { role: "ai", text: "Okay — not now." }])}>Not now</Button>
                    </div>
                  </div>
                )}
                {m.proposal && (
                  <div
                    className={`ml-10 overflow-hidden rounded-lg border bg-canvas/45 ${m.proposal.state === "open" ? "border-brand/30 shadow-card" : "border-border opacity-70"}`}
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <div className="flex rounded-md bg-muted p-0.5 text-[11px] font-semibold">
                        {(["preview", "current"] as const).map((v) => (
                          <button key={v} type="button" onClick={() => setCompareIdx(v === "current" ? idx : null)} className={`rounded px-2 py-0.5 ${(compareIdx === idx) === (v === "current") ? "bg-card text-card-foreground shadow-card" : "text-muted-foreground"}`}>
                            {v === "preview" ? "Preview suggestion" : "Current content"}
                          </button>
                        ))}
                      </div>
                      {m.proposal.state !== "open" && (
                        <span className="text-[11px] text-muted-foreground">
                          {m.proposal.state === "applied" ? "Applied" : "Not used"}
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto bg-muted/30 px-3 py-3">
                      <ChannelPreview copy={compareIdx === idx ? copy : m.proposal.copy} before={compareIdx === idx ? undefined : copy} />
                    </div>
                    <div className="space-y-2 border-t border-border px-3 py-2.5 text-[11.5px]">
                      {m.proposal.notes.map((n) => <p key={n} className="font-semibold text-brand">{n}</p>)}
                      {m.proposal.changes.length > 0 && (
                        <div>
                          <p className="font-semibold text-card-foreground">What I changed</p>
                          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
                            {m.proposal.changes.map((c) => <li key={c}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                      {m.proposal.why && (
                        <div>
                          <p className="font-semibold text-card-foreground">Why</p>
                          <p className="mt-0.5 text-muted-foreground">{m.proposal.why}</p>
                        </div>
                      )}
                    </div>
                    {m.proposal.state === "open" && (
                      <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
                        <Button
                          size="sm"
                          variant="brand"
                          onClick={() => {
                            if (!m.proposal) return;
                            onApply(m.proposal.copy);
                            setState(idx, "applied");
                          }}
                        >
                          <Check size={13} />
                          Use suggestion
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setState(idx, "kept");
                            setFeedbackFor(idx);
                          }}
                        >
                          Keep current
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => ask(lastRequest, { retry: true })}
                        >
                          <RefreshCw size={12} />
                          Try another
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setInput("Edit further: "); inputRef.current?.focus(); }}>
                          Edit further
                        </Button>
                        {onEditMyself && (
                          <Button size="sm" variant="ghost" onClick={onEditMyself}>
                            <Pencil size={12} />
                            Edit myself
                          </Button>
                        )}
                      </div>
                    )}
                    {feedbackFor === idx && (
                      <div className="border-t border-border px-3 py-2.5">
                        <p className="text-[11.5px] font-medium text-card-foreground">
                          Tell Directful AI why{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {FEEDBACK_REASONS.map((f) => (
                            <button
                              key={f}
                              className={chip(false)}
                              onClick={() => {
                                setFeedbackFor(null);
                                ask(`${f}. Try a different direction.`);
                              }}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ),
          )}
          {busy && (
            <div className="flex items-center gap-3">
              <AiMark size={28} live />
              <Shimmer className="text-[12.5px]">Reading your request and files…</Shimmer>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="shrink-0 border-t border-brand/20 bg-brand-soft/30 px-4 pb-3 pt-2.5 sm:px-5">
          {!isEmptyState && (
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {[...(suggestedActions ?? []), ...presets].filter((a, i, all) => all.indexOf(a) === i).slice(0, 6).map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="h-auto shrink-0 whitespace-nowrap px-2.5 py-1 text-[11.5px]"
                  onClick={() => void ask(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}
          <TooltipProvider>
            <PromptInput
              accept={ACCEPT_ALL}
              multiple
              maxFiles={10}
              maxFileSize={25 * 1024 * 1024}
              onError={(e) => toast.error(e.message)}
              onSubmit={({ text, files }) => {
                void ask(
                  text,
                  undefined,
                  files.map((f) => ({ url: f.url, filename: f.filename, mediaType: f.mediaType })),
                );
              }}
              className="[&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-lift [&_[data-slot=input-group]]:focus-within:border-brand"
            >
              <ComposerThumbs />
              <PromptInputTextarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to refine this content…"
                className="min-h-12 max-h-32 px-4 py-2.5 text-[13px]"
              />
              <PromptInputFooter className="border-t border-border/60 px-2.5 py-1.5">
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger
                      className="size-8 rounded-md border border-border bg-background shadow-card"
                      tooltip="Add photos, video, or files"
                    >
                      <Plus size={17} />
                    </PromptInputActionMenuTrigger>
                    <PromptInputActionMenuContent className="w-52 p-1.5">
                      <AttachmentMenuItem icon={<Image size={15} />} label="Add photos" />
                      <AttachmentMenuItem icon={<Video size={15} />} label="Add video" />
                      <AttachmentMenuItem icon={<Paperclip size={15} />} label="Add files" />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">
                    Photos, video, or files
                  </span>
                </PromptInputTools>
                <PromptInputSubmit
                  status="ready"
                  className="size-9 rounded-md bg-foreground text-background hover:bg-foreground/90"
                  disabled={busy}
                />
              </PromptInputFooter>
            </PromptInput>
          </TooltipProvider>
          <p className="mt-1.5 hidden text-center text-[10.5px] text-muted-foreground sm:block">
            Review every suggestion before it changes your content.
          </p>
        </div>
      </aside>
    </div>
  );
}

function AttachmentMenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputActionMenuItem
      onSelect={() => {
        window.setTimeout(() => attachments.openFileDialog(), 50);
      }}
    >
      {icon}
      {label}
    </PromptInputActionMenuItem>
  );
}
