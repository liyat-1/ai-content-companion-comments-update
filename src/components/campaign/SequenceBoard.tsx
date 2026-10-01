import {
  Mail,
  MessageSquare,
  Check,
  AlertTriangle,
  Pencil,
  LayoutTemplate,
  Copy,
  Trash2,
  Sparkles,
  Plus,
} from "lucide-react";
import { StepMenu } from "./StepMenu";
import { Connector, DelayControl, Endpoint } from "./StructureBuilder";
import type { ChannelKey, SequenceStep } from "@/lib/sequence";

function StatusChip({ ready }: { ready: boolean }) {
  return ready ? (
    <span className="inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-700">
      <Check size={11} /> Ready
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700">
      <AlertTriangle size={11} /> Needs setup
    </span>
  );
}

function ChannelRow({
  channel,
  step,
  onTemplate,
  onEdit,
}: {
  channel: ChannelKey;
  step: SequenceStep;
  onTemplate: () => void;
  onEdit: () => void;
}) {
  const cfg = step[channel];
  const Icon = channel === "email" ? Mail : MessageSquare;
  const label = channel === "email" ? "Email" : "Text";

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-zinc-100 px-4 py-3">
      <span
        className={`grid size-8 place-items-center ${
          cfg.configured ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-400"
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-zinc-900">{label}</span>
          <StatusChip ready={cfg.configured} />
        </div>
        <p className="mt-0.5 truncate text-[11.5px] text-zinc-500">
          {cfg.configured
            ? cfg.templateName
              ? `${cfg.templateName} · Based on template · Personalised`
              : "Custom message · Personalised"
            : "No message configured"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {cfg.configured ? (
          <>
            {channel === "email" && (
              <button
                onClick={onTemplate}
                className="hidden h-8 items-center gap-1.5 border border-zinc-200 px-2.5 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700 sm:flex"
              >
                <LayoutTemplate size={13} /> Change template
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex h-8 items-center gap-1.5 border border-zinc-200 px-2.5 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
            >
              <Pencil size={13} /> Edit message
            </button>
          </>
        ) : (
          <>
            {channel === "email" && (
              <button
                onClick={onTemplate}
                className="flex h-8 items-center gap-1.5 bg-blue-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <LayoutTemplate size={13} /> Select template
              </button>
            )}
            <button
              onClick={onEdit}
              className={`flex h-8 items-center gap-1.5 px-2.5 text-[11.5px] font-medium transition-colors ${
                channel === "email"
                  ? "border border-zinc-200 text-zinc-700 hover:border-blue-600 hover:text-blue-700"
                  : "bg-blue-600 font-semibold text-white hover:bg-blue-700"
              }`}
            >
              <Sparkles size={13} /> {channel === "email" ? "From scratch" : "Write message"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SequenceBoard({
  steps,
  email,
  text,
  attention,
  onReview,
  onTemplate,
  onEdit,
  onDelay,
  onDuplicate,
  onDelete,
  onAdd,
}: {
  steps: SequenceStep[];
  email: boolean;
  text: boolean;
  attention: { step: SequenceStep; channel: ChannelKey }[];
  onReview: () => void;
  onTemplate: (stepId: string, channel: ChannelKey) => void;
  onEdit: (stepId: string, channel: ChannelKey) => void;
  onDelay: (id: string, d: SequenceStep["delay"]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="mb-6">
        <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">
          Configure your sequence
        </h2>
        <p className="mt-1 text-[12.5px] text-zinc-500">
          Select a template or create a message for each step in your campaign.
        </p>
      </div>

      {attention.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 border border-amber-200 bg-amber-50/70 px-4 py-3">
          <span className="flex items-center gap-2 text-[12.5px] font-medium text-amber-900">
            <AlertTriangle size={14} className="text-amber-600" />
            {attention.length} message{attention.length > 1 ? "s need" : " needs"} your attention
          </span>
          <button
            onClick={onReview}
            className="h-8 border border-amber-300 bg-white px-3 text-[11.5px] font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          >
            Review
          </button>
        </div>
      )}

      <Endpoint label="Campaign starts" start />

      {steps.map((s, i) => {
        const cfgCount = (email ? +s.email.configured : 0) + (text ? +s.text.configured : 0);
        const total = (email ? 1 : 0) + (text ? 1 : 0);
        return (
          <div key={s.id} id={`step-${s.id}`}>
            {s.kind === "followup" ? (
              <Connector>
                <DelayControl delay={s.delay} onChange={(d) => onDelay(s.id, d)} />
              </Connector>
            ) : (
              <Connector />
            )}
            <div className="border border-zinc-200 bg-white">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center text-[11px] font-semibold ${
                      cfgCount === total ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-zinc-900">{s.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-zinc-500">
                      {s.kind === "initial"
                        ? "Sent when the campaign starts"
                        : `Sent ${s.delay.value} ${s.delay.unit} after the previous message`}
                    </p>
                  </div>
                </div>
                <StepMenu
                  label={`${s.name} actions`}
                  items={[
                    {
                      label: email ? "Change template" : "Configure",
                      icon: LayoutTemplate,
                      onSelect: () => onTemplate(s.id, email ? "email" : "text"),
                    },
                    {
                      label: "Edit message",
                      icon: Pencil,
                      onSelect: () => onEdit(s.id, email ? "email" : "text"),
                    },
                    ...(s.kind === "followup"
                      ? [
                          { label: "Duplicate step", icon: Copy, onSelect: () => onDuplicate(s.id) },
                          {
                            label: "Delete step",
                            icon: Trash2,
                            destructive: true,
                            separated: true,
                            onSelect: () => onDelete(s.id),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>

              {email && (
                <ChannelRow
                  channel="email"
                  step={s}
                  onTemplate={() => onTemplate(s.id, "email")}
                  onEdit={() => onEdit(s.id, "email")}
                />
              )}
              {text && (
                <ChannelRow
                  channel="text"
                  step={s}
                  onTemplate={() => onTemplate(s.id, "text")}
                  onEdit={() => onEdit(s.id, "text")}
                />
              )}
            </div>
          </div>
        );
      })}

      <Connector />
      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-zinc-300 bg-white py-3 text-[12.5px] font-semibold text-zinc-600 transition-colors hover:border-blue-600 hover:text-blue-700"
      >
        <Plus size={15} /> Add follow-up
      </button>
      <Connector />
      <Endpoint label="Campaign ends" />
    </div>
  );
}
