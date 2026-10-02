import { useEffect, useRef, useState } from "react";
import { Check, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AiMark } from "@/components/content/shared";
import { editBothAssist, type EditCopy } from "@/lib/ai.functions";

type Audience = "direct" | "ota";
type Proposal = {
  direct: EditCopy | null;
  ota: EditCopy | null;
  directChanges: string[];
  otaChanges: string[];
  why: string;
  applied: Record<Audience, boolean>;
};
type Msg = { role: "user"; text: string } | { role: "ai"; text: string; proposal?: Proposal };

const STARTERS = [
  "Make both warmer. Direct: thank them for booking with us. OTA: explain why booking direct is better.",
  "Shorten both. Direct: more personal. OTA: lead with the direct-booking benefit.",
  "Give both a fall season feel, keep OTA more persuasive.",
];

function render(kind: "email" | "text", c: EditCopy) {
  return kind === "text"
    ? (c.message ?? "")
    : `Subject: ${c.subject ?? ""}\nPreview: ${c.preheader ?? ""}\n\n${c.heading ?? ""}\n\n${c.body ?? ""}\n\nButton: ${c.ctaLabel ?? ""}`;
}

/** One prompt, two audiences: rewrites Direct and OTA content together for explicit review. */
export function AiBothPanel({
  campaign,
  kind,
  direct,
  ota,
  onApply,
  onClose,
  onMinimize,
}: {
  campaign: string;
  kind: "email" | "text";
  direct: EditCopy;
  ota: EditCopy;
  onApply: (audience: Audience, copy: EditCopy) => void;
  onClose: () => void;
  onMinimize: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el && msgs.length) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    const res = await editBothAssist({
      data: {
        text: q,
        kind,
        direct,
        ota,
        campaign,
        history: msgs.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", text: m.text })),
      },
    }).catch(() => ({ error: "The AI couldn't be reached. Please try again." }) as const);
    setBusy(false);
    if ("error" in res && res.error) {
      setMsgs((m) => [...m, { role: "ai", text: `⚠️ ${res.error}` }]);
      return;
    }
    if (!("reply" in res)) return;
    setMsgs((m) => [
      ...m,
      {
        role: "ai",
        text: res.reply || "Here are updates for both audiences.",
        proposal:
          res.direct || res.ota
            ? { direct: res.direct, ota: res.ota, directChanges: res.directChanges, otaChanges: res.otaChanges, why: res.why, applied: { direct: false, ota: false } }
            : undefined,
      },
    ]);
  };

  const apply = (idx: number, which: Audience[]) => {
    const msg = msgs[idx];
    if (msg?.role !== "ai" || !msg.proposal) return;
    const p = msg.proposal;
    which.forEach((a) => {
      const base = a === "direct" ? direct : ota;
      const next = p[a];
      if (next) onApply(a, { ...base, ...next });
    });
    setMsgs((m) =>
      m.map((x, i) =>
        i === idx && x.role === "ai" && x.proposal
          ? { ...x, proposal: { ...x.proposal, applied: { ...x.proposal.applied, ...Object.fromEntries(which.map((a) => [a, true])) } } }
          : x,
      ),
    );
  };

  return (
    <aside aria-label="Directful AI for Direct and OTA" className="ai-rise flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-brand/30 bg-card shadow-lift">
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-brand/20 bg-brand-soft/70 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <AiMark size={32} />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-card-foreground">Edit Direct + OTA together</p>
            <p className="truncate text-[11px] text-muted-foreground">{campaign} · {kind === "email" ? "Email" : "Text"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onMinimize} aria-label="Minimize"><Minimize2 size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X size={16} /></Button>
        </div>
      </header>

      <div ref={listRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
        {msgs.length === 0 && (
          <div className="mx-auto max-w-md py-2 text-center">
            <h3 className="font-display text-[20px] font-semibold leading-tight text-card-foreground">Update both audiences at once</h3>
            <p className="mx-auto mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              Give one direction for both, then add what Direct and OTA should each follow. You'll review each version before anything changes.
            </p>
            <div className="mt-4 space-y-1.5">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="block w-full rounded-md border border-border bg-background px-3 py-2 text-left text-[11.5px] text-muted-foreground transition-colors hover:border-brand/45 hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, idx) =>
          m.role === "user" ? (
            <Message key={idx} from="user" className="max-w-[85%]">
              <MessageContent className="bg-primary px-3 py-2 text-[12.5px] text-primary-foreground">
                <MessageResponse>{m.text}</MessageResponse>
              </MessageContent>
            </Message>
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
                <div className="ml-10 space-y-2">
                  {(["direct", "ota"] as Audience[]).map((a) => {
                    const c = m.proposal![a];
                    if (!c) return null;
                    const done = m.proposal!.applied[a];
                    const changes = a === "direct" ? m.proposal!.directChanges : m.proposal!.otaChanges;
                    return (
                      <div key={a} className={`overflow-hidden rounded-lg border bg-canvas/45 ${done ? "border-border opacity-75" : "border-brand/30 shadow-card"}`}>
                        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{a === "direct" ? "Direct guests" : "OTA guests"}</p>
                          {done ? (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Check size={12} />Applied</span>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => apply(idx, [a])}>Apply</Button>
                          )}
                        </div>
                        <p className="max-h-48 overflow-y-auto whitespace-pre-wrap px-3 py-2 text-[12px] leading-relaxed text-card-foreground">{render(kind, { ...(a === "direct" ? direct : ota), ...c })}</p>
                        {changes.length > 0 && (
                          <ul className="flex flex-wrap gap-1 border-t border-border px-3 py-1.5">
                            {changes.map((ch) => <li key={ch} className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground">{ch}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  {m.proposal.why && <p className="text-[11px] text-muted-foreground">Why: {m.proposal.why}</p>}
                  {(!m.proposal.applied.direct || !m.proposal.applied.ota) && (
                    <Button size="sm" variant="brand" onClick={() => apply(idx, ["direct", "ota"])}>
                      <Check size={13} />Apply to both
                    </Button>
                  )}
                </div>
              )}
            </div>
          ),
        )}
        {busy && (
          <div className="flex items-center gap-3">
            <AiMark size={28} live />
            <Shimmer className="text-[12.5px]">Writing Direct and OTA versions…</Shimmer>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-brand/20 bg-brand-soft/30 px-4 pb-3 pt-2.5">
        <TooltipProvider>
          <PromptInput
            onSubmit={({ text }) => void ask(text)}
            className="[&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-lift"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Make both warmer. Direct: … OTA: …"
              className="min-h-12 max-h-32 px-4 py-2.5 text-[13px]"
            />
            <PromptInputFooter className="border-t border-border/60 px-2.5 py-1.5">
              <PromptInputTools>
                <span className="text-[11px] text-muted-foreground">Updates Direct and OTA {kind === "email" ? "email" : "text"}</span>
              </PromptInputTools>
              <PromptInputSubmit status={busy ? "submitted" : "ready"} disabled={busy} className="size-9 rounded-md bg-foreground text-background hover:bg-foreground/90" />
            </PromptInputFooter>
          </PromptInput>
        </TooltipProvider>
      </div>
    </aside>
  );
}
