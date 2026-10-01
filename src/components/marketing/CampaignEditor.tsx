import { useEffect, useMemo, useState } from "react";
import { Check, Eye, History, HelpCircle, Maximize2, RotateCcw, ShieldCheck, X } from "lucide-react";
import { TextEditor } from "./TextEditor";
import { EmailEditor, EmailPreview } from "./EmailEditor";
import { PromotionSelector } from "./PromotionSelector";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { checkContent } from "./contentChecks";
import { AiEditPanel } from "@/components/ai/AiEditPanel";
import { Sparkle } from "@/components/ai/Sparkle";
import type { Copy } from "@/lib/aiWriter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AUDIENCE_LABEL,
  MERGE_TAGS,
  STRATEGY_LABEL,
  defaultVariant,
  effectivePromotion,
  fullTime,
  mutate,
  strategyHasEmail,
  useMarketing,
  type AudienceKey,
  type MarketingCampaign,
} from "@/lib/marketing";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

type Panel = "history" | "help" | "spam" | null;

/** Small round action used for History / Help / Spam check on each section. */
function SectionAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active ? "border-brand bg-brand-soft text-brand" : "border-border text-muted-foreground hover:border-brand/45 hover:text-foreground"
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function CampaignEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const marketing = useMarketing();
  const { campaigns } = marketing;
  const source = campaigns.find((campaign) => campaign.id === id);
  const [draft, setDraft] = useState<MarketingCampaign | null>(() => source ? clone(source) : null);
  const [baseline, setBaseline] = useState(() => source ? JSON.stringify(source) : "");
  const [audience, setAudience] = useState<AudienceKey>("direct");
  const [channel, setChannel] = useState<"text" | "email">("text");
  const [panel, setPanel] = useState<Panel>(null);
  const [confirm, setConfirm] = useState<"leave" | "save" | "revert" | null>(null);
  const [promotionPicker, setPromotionPicker] = useState(false);
  const [rightView, setRightView] = useState<"preview" | "ai" | "minimized">("preview");
  const dirty = useMemo(() => draft ? JSON.stringify(draft) !== baseline : false, [draft, baseline]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  if (!source || !draft) return null;
  const variant = draft.variants[audience];
  const supportsEmail = strategyHasEmail(draft.strategy);
  const activeChannel = supportsEmail ? channel : "text";
  const activePromotion = effectivePromotion(marketing, draft, audience);
  const closeSafely = () => dirty ? setConfirm("leave") : onClose();
  const save = () => {
    mutate((state) => {
      const index = state.campaigns.findIndex((campaign) => campaign.id === id);
      if (index >= 0) state.campaigns[index] = clone(draft);
    });
    setBaseline(JSON.stringify(draft));
    onClose();
  };
  const requestSave = () => draft.enabled && dirty ? setConfirm("save") : save();
  const setVariant = (next: typeof variant, kind: "text" | "email") => setDraft((current) => {
    if (!current) return current;
    const copy = clone(current);
    copy.variants[audience] = next;
    copy.variants[audience].customization[kind] = true;
    copy.variants[audience].customized = copy.variants[audience].customization.text || copy.variants[audience].customization.email;
    copy.variants[audience].editedBy = { by: "Sevket Yilmaz", at: Date.now() };
    return copy;
  });
  const setPromotion = (value: string | null | "inherit") => setDraft((current) => {
    if (!current) return current;
    const copy = clone(current);
    const next = copy.variants[audience];
    next.promotionMode = value === "inherit" ? "inherit" : value === null ? "none" : "custom";
    next.promotionId = value === "inherit" || value === null ? null : value;
    next.editedBy = { by: "Sevket Yilmaz", at: Date.now() };
    return copy;
  });
  const revertCurrent = () => {
    const suggested = defaultVariant(id, audience);
    setDraft((current) => {
      if (!current) return current;
      const copy = clone(current);
      if (activeChannel === "text") {
        copy.variants[audience].text = suggested.text;
        copy.variants[audience].customization.text = false;
      } else {
        copy.variants[audience].email = suggested.email;
        copy.variants[audience].customization.email = false;
      }
      copy.variants[audience].customized = copy.variants[audience].customization.text || copy.variants[audience].customization.email;
      return copy;
    });
    setConfirm(null);
  };

  const channelTab = (active: boolean, disabled = false) => `rounded-md px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${active ? "bg-card text-card-foreground shadow-card" : disabled ? "cursor-not-allowed text-muted-foreground/45" : "text-muted-foreground hover:text-foreground"}`;

  const previewMedia = (variant.text.mediaIds ?? [])
    .map((mid) => marketing.media.find((m) => m.id === mid))
    .find((m) => m?.type === "image" && m.url);

  const spamChecks = checkContent(
    activeChannel === "text"
      ? [{ label: "message", text: variant.text.message }]
      : [
          { label: "subject", text: variant.email.subject },
          { label: "preheader", text: variant.email.preheader },
          { label: "heading", text: variant.email.heading },
          { label: "body", text: variant.email.body },
        ],
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/70 p-2 sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && closeSafely()}>
      <section role="dialog" aria-modal="true" aria-labelledby="campaign-editor-title" className="flex h-[92vh] max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg border border-border bg-canvas shadow-float">
      <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0"><p className="text-[10.5px] font-medium text-muted-foreground">Automated invite</p><h2 id="campaign-editor-title" className="truncate text-[17px] font-semibold text-card-foreground">{draft.name}</h2><p className="truncate text-[11.5px] text-muted-foreground">{STRATEGY_LABEL[draft.strategy]}</p></div>
        </div>
        <div className="flex items-center gap-2"><span className={`mr-auto text-[11.5px] sm:mr-0 ${dirty ? "text-brand" : "text-muted-foreground"}`}>{dirty ? "Unsaved changes" : "All changes saved"}</span><Button variant="brand" size="sm" disabled={!dirty} onClick={requestSave}><Check size={14} />Save changes</Button><Button variant="ghost" size="icon" onClick={closeSafely} aria-label="Close editor"><X size={18} /></Button></div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className={`mx-auto grid max-w-7xl gap-6 ${rightView === "minimized" ? "lg:grid-cols-[minmax(0,1fr)_64px]" : "xl:grid-cols-[minmax(0,1fr)_440px]"}`}>
          <div className="min-w-0">
            {/* Channel tabs — Text and Email each keep their own Direct / OTA sections */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-md bg-muted p-1">
                <button onClick={() => setChannel("text")} className={channelTab(activeChannel === "text")}>Text</button>
                <button onClick={() => supportsEmail && setChannel("email")} disabled={!supportsEmail} className={channelTab(activeChannel === "email", !supportsEmail)}>Email</button>
              </div>
              {!supportsEmail && (
                <span className="text-[11px] text-muted-foreground">
                  This strategy sends text only — email is not part of the plan.
                </span>
              )}
            </div>
            {/* Audience sections */}
            <div className="min-w-0 space-y-3">
            {(["direct", "ota"] as AudienceKey[]).map((key) => {
              const active = audience === key;
              const v = draft.variants[key];
              return (
                <section
                  key={key}
                  className={`overflow-hidden rounded-lg border bg-card shadow-card transition-colors ${active ? "border-brand/45" : "border-border"}`}
                >
                  <button
                    type="button"
                    onClick={() => { setAudience(key); setPanel(null); }}
                    aria-expanded={active}
                    className="flex w-full flex-wrap items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className={`grid size-8 shrink-0 place-items-center rounded-md text-[11px] font-bold ${active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                      {key === "direct" ? "D" : "O"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-card-foreground">
                        {AUDIENCE_LABEL[key]}
                        {v.customized && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-brand align-middle" />}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {v.customization.text || v.customization.email ? "Customized content" : "Suggested content"}
                      </span>
                    </span>
                    {!active && (
                      <span className="hidden text-[11px] text-muted-foreground sm:inline">Click to edit</span>
                    )}
                  </button>

                  {active && (
                    <div className="border-t border-border px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="ml-auto flex flex-wrap items-center gap-1.5">
                           <Button variant="brand" size="sm" className="px-2.5" onClick={() => setRightView("ai")}>
                            <Sparkle size={13} />Edit with AI
                          </Button>
                          <SectionAction icon={History} label="History" active={panel === "history"} onClick={() => setPanel((p) => (p === "history" ? null : "history"))} />
                          <SectionAction icon={HelpCircle} label="Help" active={panel === "help"} onClick={() => setPanel((p) => (p === "help" ? null : "help"))} />
                          <SectionAction icon={ShieldCheck} label="Spam check" active={panel === "spam"} onClick={() => setPanel((p) => (p === "spam" ? null : "spam"))} />
                          <Button variant="ghost" size="sm" className="px-2" disabled={!v.customization[activeChannel]} onClick={() => setConfirm("revert")}>
                            <RotateCcw size={13} />Revert
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-3">
                        {panel === "history" && (
                          <InfoPanel title="History">
                            {v.editedBy ? (
                              <p className="text-[12px] text-card-foreground">
                                Last edited by <strong>{v.editedBy.by}</strong> · {fullTime(v.editedBy.at)}
                              </p>
                            ) : (
                              <p className="text-[12px] text-muted-foreground">This section still uses the suggested content — no edits yet.</p>
                            )}
                            <p className="mt-1.5 text-[11.5px] text-muted-foreground">No earlier revisions are recorded yet. Each save records who edited and when.</p>
                          </InfoPanel>
                        )}
                        {panel === "help" && (
                          <InfoPanel title="Help">
                            <ul className="space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
                              {activeChannel === "text" ? (
                                <>
                                  <li>· Keep texts short — one clear ask works best, and every 160 characters costs another segment.</li>
                                  <li>· Tap a merge tag above the box to insert it; it fills in per guest when the message is sent.</li>
                                  <li>· Attach images or documents under Media and promotion. Images travel as MMS, documents as a link.</li>
                                </>
                              ) : (
                                <>
                                  <li>· The subject decides whether the email is opened — keep it under about 60 characters.</li>
                                  <li>· The preheader shows after the subject in the inbox; use it to extend the subject, not repeat it.</li>
                                  <li>· One button with one clear action converts best. Template and layout stay below the copy.</li>
                                </>
                              )}
                              <li>· Available merge tags: {MERGE_TAGS.map((t) => t.token).join(", ")}.</li>
                            </ul>
                          </InfoPanel>
                        )}
                        {panel === "spam" && (
                          <InfoPanel title="Spam check">
                            <ul className="space-y-1.5">
                              {spamChecks.map((check) => (
                                <li key={check.label} className="flex items-start gap-2 text-[12px]">
                                  <span className={`mt-1 size-1.5 shrink-0 rounded-full ${check.status === "warn" ? "bg-amber-500" : "bg-emerald-500"}`} />
                                  <span className="min-w-0">
                                    <span className="font-semibold text-card-foreground">{check.label}:</span>{" "}
                                    <span className="text-muted-foreground">{check.detail}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <p className="mt-2 text-[11px] text-muted-foreground">Local checks only — carrier filtering can still vary.</p>
                          </InfoPanel>
                        )}
                      </div>

                      <div className="mt-3">
                        {activeChannel === "text" ? (
                          <TextEditor
                            value={v.text}
                            promotion={activePromotion}
                            onChange={(text) => setVariant({ ...v, text }, "text")}
                            onRequestPromotion={() => setPromotionPicker(true)}
                            onRemovePromotion={() => setPromotion(null)}
                          />
                        ) : (
                          <EmailEditor
                            value={v.email}
                            promotion={activePromotion}
                            customized={v.customization.email}
                            onChange={(email) => setVariant({ ...v, email }, "email")}
                            onRequestPromotion={() => setPromotionPicker(true)}
                            onRemovePromotion={() => setPromotion(null)}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          </div>

          {/* The selected audience and channel stay fixed while this area switches context. */}
          <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
            {rightView !== "minimized" && <>
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{rightView === "ai" ? "AI editor" : "Preview"} · {AUDIENCE_LABEL[audience]} · {activeChannel === "text" ? "Text" : "Email"}</p>
              {rightView !== "preview" && <Button variant="ghost" size="sm" onClick={() => setRightView("preview")}><Eye size={13} />Preview</Button>}
            </div>
            </>}
            {rightView === "minimized" && <Button type="button" variant="ghost" onClick={() => setRightView("ai")} className="group flex h-[520px] w-full flex-col justify-between border border-border bg-card px-2 py-4 shadow-card hover:border-brand/30 hover:bg-card" aria-label="Expand Directful AI"><span className="grid size-9 place-items-center rounded-md bg-brand text-brand-foreground shadow-card"><Sparkle size={15} /></span><span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-card-foreground">Directful AI · {AUDIENCE_LABEL[audience]}</span><Maximize2 size={15} className="text-brand transition-transform group-hover:scale-110" /></Button>}
            {rightView === "ai" ? <AiEditPanel
              embedded
              title={`${draft.name} · ${AUDIENCE_LABEL[audience]}`}
              copy={activeChannel === "email" ? { kind: "email", email: { subject: variant.email.subject, preheader: variant.email.preheader, heading: variant.email.heading, body: variant.email.body, ctaLabel: variant.email.ctaLabel } } : { kind: "text", text: { message: variant.text.message } }}
              onApply={(next) => setVariant(next.kind === "email" ? { ...variant, email: { ...variant.email, subject: next.email.subject, preheader: next.email.preheader, heading: next.email.heading, body: next.email.body, ctaLabel: next.email.ctaLabel } } : { ...variant, text: { ...variant.text, message: next.text.message } }, activeChannel)}
              onClose={() => setRightView("preview")}
              onMinimize={() => setRightView("minimized")}
              onEditMyself={() => setRightView("preview")}
            /> : activeChannel === "text" ? (
              <div className="flex max-w-full justify-center overflow-x-auto pb-2 lg:justify-start"><SmsPreview message={variant.text.message} imageUrl={previewMedia?.url ?? null} sender="Holiday Inn" scale={0.62} promotion={activePromotion} /></div>
            ) : <EmailPreview value={variant.email} promotion={activePromotion} />}
          </div>
        </div>
      </div>

      <PromotionSelector
        open={promotionPicker}
        campaignName={`${draft.name} · ${AUDIENCE_LABEL[audience]}`}
        selectedId={variant.promotionMode === "inherit" ? "inherit" : variant.promotionMode === "custom" ? variant.promotionId : null}
        inheritedId={marketing.globalPromotions[audience]}
        allowInherit
        onClose={() => setPromotionPicker(false)}
        onSelect={setPromotion}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(value) => !value && setConfirm(null)}>
        <AlertDialogContent className="border-border bg-card shadow-float">
          <AlertDialogHeader><AlertDialogTitle>{confirm === "leave" ? "Unsaved changes" : confirm === "save" ? "Save changes to active campaign?" : "Revert content to suggested?"}</AlertDialogTitle><AlertDialogDescription>{confirm === "leave" ? "You have unsaved changes. Leave without saving?" : confirm === "save" ? "This campaign is active. Updated content will be used for future messages sent to eligible guests." : `Only ${AUDIENCE_LABEL[audience]} ${activeChannel} content for ${draft.name} will return to Directful’s suggested content.`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{confirm === "leave" ? "Stay and save" : "Cancel"}</AlertDialogCancel><AlertDialogAction className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={confirm === "leave" ? onClose : confirm === "save" ? save : revertCurrent}>{confirm === "leave" ? "Leave" : confirm === "save" ? "Save changes" : "Revert"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </section>
    </div>
  );
}
