import { useState } from "react";
import { X, Mail, MessageSquare, Monitor, Smartphone, Moon, LayoutTemplate } from "lucide-react";
import { EmailPreview } from "../editor/EmailPreview";
import { PhoneMockup } from "../editor/PhoneMockup";
import { SmsPreview } from "../editor/SmsPreview";
import { Select } from "../editor/Select";
import { Field, TextArea, TextInput } from "../editor/controls";
import { TagTextArea, type TagDef } from "./TagTextArea";
import { ScaledEmail } from "./ScaledEmail";
import { DELAY_UNITS, type DelayUnit } from "@/lib/sequence";
import type { Campaign } from "@/lib/campaign";

export type StepDraft = {
  /** SMS copy. */
  message: string;
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  delay?: { value: number; unit: DelayUnit };
};

type PreviewMode = "desktop" | "mobile" | "dark";

/**
 * The only place where editing happens. A large centred overlay: content
 * editor on the left, always-live preview on the right.
 */
export function StepOverlay({
  title,
  text,
  email,
  draft,
  onChange,
  onSave,
  onCancel,
  previewCampaign,
  sender,
  templateName,
  templateReady,
  onChooseTemplate,
  mergeTags,
  media,
  mediaSlot,
}: {
  title: string;
  text: boolean;
  email: boolean;
  draft: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
  previewCampaign: Campaign;
  sender: string;
  templateName: string | null;
  templateReady: boolean;
  onChooseTemplate: () => void;
  mergeTags: (TagDef & { chip: string })[];
  media?: string | null;
  mediaSlot?: React.ReactNode;
}) {
  const [tab, setTab] = useState<"text" | "email">(text ? "text" : "email");
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const showTabs = text && email;
  const channelTab = text && email ? tab : text ? "text" : "email";

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-zinc-900/40 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-label={`Edit ${title}`}
        className="flex h-[92vh] w-full max-w-[1400px] flex-col border border-zinc-300 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        {/* Overlay chrome */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Editing
            </p>
            <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-900">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showTabs && (
              <div className="flex bg-zinc-100 p-0.5">
                {[
                  { id: "text" as const, Icon: MessageSquare, label: "Text" },
                  { id: "email" as const, Icon: Mail, label: "Email" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-pressed={channelTab === t.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      channelTab === t.id
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <t.Icon size={13} /> {t.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={onCancel}
              aria-label="Close editor"
              className="grid size-8 place-items-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Two columns */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="min-h-0 overflow-y-auto border-r border-zinc-200">
            {draft.delay && (
              <section className="border-b border-zinc-100 p-4">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Send timing
                </p>
                <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-2">
                  <Field label="Wait">
                    <input
                      type="number"
                      min={1}
                      aria-label="Delay amount"
                      value={draft.delay.value}
                      onChange={(e) =>
                        onChange({
                          delay: {
                            ...draft.delay!,
                            value: Math.max(1, Number(e.target.value) || 1),
                          },
                        })
                      }
                      className="h-10 w-full border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-blue-600"
                    />
                  </Field>
                  <Field label="Unit">
                    <Select
                      value={draft.delay.unit}
                      options={DELAY_UNITS}
                      ariaLabel="Delay unit"
                      onChange={(unit) => onChange({ delay: { ...draft.delay!, unit } })}
                    />
                  </Field>
                </div>
              </section>
            )}

            {channelTab === "text" && (
              <section className="space-y-4 p-4">
                <Field label="Text message" hint={`${draft.message.length} chars`}>
                  <TagTextArea
                    value={draft.message}
                    onChange={(v) => onChange({ message: v })}
                    tags={mergeTags}
                    minHeight={150}
                    placeholder="Write your text message…"
                  />
                </Field>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Merge tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mergeTags.map((t) => (
                      <button
                        key={t.token}
                        onClick={() => onChange({ message: `${draft.message} ${t.token}`.trim() })}
                        className={`px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {mediaSlot && (
                  <div className="border-t border-zinc-100 pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Image
                    </p>
                    {mediaSlot}
                  </div>
                )}
              </section>
            )}

            {channelTab === "email" && (
              <section className="space-y-4 p-4">
                <div className="flex items-center gap-3 border border-zinc-200 p-3">
                  {templateReady ? (
                    <ScaledEmail campaign={previewCampaign} width={72} height={54} />
                  ) : (
                    <span className="grid size-[54px] w-[72px] place-items-center bg-zinc-100 text-zinc-400">
                      <LayoutTemplate size={18} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-zinc-900">
                      {templateName ?? "No design selected"}
                    </p>
                    <p className="text-[11.5px] text-zinc-500">Email design</p>
                  </div>
                  <button
                    onClick={onChooseTemplate}
                    className="h-9 shrink-0 border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
                  >
                    {templateReady ? "Change" : "Choose"}
                  </button>
                </div>

                <Field label="Subject line">
                  <TextInput value={draft.subject} onChange={(v) => onChange({ subject: v })} />
                </Field>
                <Field label="Pre-header">
                  <TextInput value={draft.preheader} onChange={(v) => onChange({ preheader: v })} />
                </Field>
                <div className="h-px bg-zinc-100" />
                <Field label="Header">
                  <TextInput value={draft.heading} onChange={(v) => onChange({ heading: v })} />
                </Field>
                <Field label="Email body">
                  <TextArea rows={7} value={draft.body} onChange={(v) => onChange({ body: v })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Button label">
                    <TextInput
                      value={draft.ctaLabel}
                      onChange={(v) => onChange({ ctaLabel: v })}
                    />
                  </Field>
                  <Field label="Button link">
                    <TextInput value={draft.ctaUrl} onChange={(v) => onChange({ ctaUrl: v })} />
                  </Field>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Merge tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mergeTags.map((t) => (
                      <button
                        key={t.token}
                        onClick={() => onChange({ body: `${draft.body} ${t.token}`.trim() })}
                        className={`px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Live preview */}
          <div
            className="flex min-h-0 flex-col overflow-hidden"
            style={{ background: channelTab === "email" && mode === "dark" ? "#141518" : "#f4f4f5" }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/70 px-4 py-2 backdrop-blur">
              <p className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Preview · {title}
              </p>
              {channelTab === "email" && (
                <div className="flex bg-zinc-100 p-0.5">
                  {[
                    { id: "desktop" as const, Icon: Monitor },
                    { id: "mobile" as const, Icon: Smartphone },
                    { id: "dark" as const, Icon: Moon },
                  ].map(({ id, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      aria-pressed={mode === id}
                      aria-label={id}
                      className={`px-2.5 py-1 transition-colors ${
                        mode === id
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {channelTab === "text" ? (
                <div className="flex justify-center">
                  <SmsPreview
                    message={draft.message}
                    imageUrl={media ?? null}
                    sender={sender}
                    scale={0.8}
                  />
                </div>
              ) : mode === "mobile" ? (
                <div className="flex justify-center">
                  <PhoneMockup scale={0.78}>
                    <EmailPreview campaign={previewCampaign} interactive={false} width={373} />
                  </PhoneMockup>
                </div>
              ) : (
                <div className="flex justify-center">
                  <EmailPreview
                    campaign={previewCampaign}
                    interactive={false}
                    width={600}
                    dark={mode === "dark"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-zinc-200 px-4 py-3">
          <button
            onClick={onCancel}
            className="h-10 border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
