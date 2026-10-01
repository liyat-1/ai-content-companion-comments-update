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
  EDIT_QUICK_ACTIONS,
  FEEDBACK_REASONS,
  diffWords,
  refine,
  type Copy,
} from "@/lib/aiWriter";

type Msg =
  | { role: "user"; text: string; files?: SentFile[] }
  | {
      role: "ai";
      text: string;
      proposal?: { copy: Copy; changes: string[]; why: string; state: "open" | "applied" | "kept" };
    };

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
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const openProposal = () => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.role === "ai" && m.proposal?.state === "open") return m.proposal.copy;
    }
    return null;
  };

  const [busy, setBusy] = useState(false);
  const isEmptyState = !initialContext && msgs.length === 1;
  const ask = async (
    request: string,
    opts?: { retry?: boolean },
    files: AttachmentInput[] = [],
  ) => {
    const q = request.trim();
    if ((!q && !files.length) || busy) return;
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
          ? { copy: next, changes: res.changes.slice(0, 4), why: res.why, state: "open" }
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
                I’m working from the current {copy.kind === "email" ? "email" : "text message"}. Pick a direction or describe the change below.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {EDIT_QUICK_ACTIONS.filter(
                  (action) => copy.kind === "email" || !/subject|text version/i.test(action),
                )
                  .slice(0, 6)
                  .map((action) => (
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
                {m.proposal && (
                  <div
                    className={`ml-10 overflow-hidden rounded-lg border bg-canvas/45 ${m.proposal.state === "open" ? "border-brand/30 shadow-card" : "border-border opacity-70"}`}
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Suggested update
                      </p>
                      {m.proposal.state !== "open" && (
                        <span className="text-[11px] text-muted-foreground">
                          {m.proposal.state === "applied" ? "Applied" : "Not used"}
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto px-3 py-2.5">
                      {compareIdx === idx ? (
                        <Diff before={copyText(copy)} after={copyText(m.proposal.copy)} />
                      ) : (
                        <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-card-foreground">
                          {copyText(m.proposal.copy)}
                        </p>
                      )}
                    </div>
                    <ul className="flex flex-wrap gap-1 border-t border-border px-3 py-2">
                      {m.proposal.changes.map((c) => (
                        <li
                          key={c}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                    <details className="border-t border-border px-3 py-2 text-[11.5px] text-muted-foreground">
                      <summary className="cursor-pointer select-none font-medium text-card-foreground">
                        Why this suggestion?
                      </summary>
                      <p className="mt-1">{m.proposal.why}</p>
                    </details>
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
                          Apply changes
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCompareIdx(compareIdx === idx ? null : idx)}
                        >
                          <GitCompare size={12} />
                          {compareIdx === idx ? "Hide changes" : "See changes"}
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
          {suggestedActions?.length ? (
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {suggestedActions.slice(0, 3).map((action) => (
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
          ) : null}
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
