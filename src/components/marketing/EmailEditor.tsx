import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Gift, LayoutTemplate, Rows3, Trash2 } from "lucide-react";
import { TemplateLibrary } from "./TemplateLibrary";
import { EmojiPicker } from "./EmojiPicker";
import { LayoutLibrary, LayoutThumb } from "./LayoutLibrary";
import { PromoBanner } from "./PromoBanner";
import {
  LAYOUT_LABEL,
  LAYOUT_PRESETS,
  normalizeLayout,
  renderPreview,
  useMarketing,
  type EmailContent,
  type EmailLayout,
  type Promotion,
} from "@/lib/marketing";

function Field({
  label,
  value,
  onChange,
  placeholder,
  emoji = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  emoji?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-input bg-background pr-1.5 transition-shadow focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13.5px] text-foreground outline-none"
        />
        {emoji && <EmojiPicker onPick={(e) => onChange(`${value}${e}`)} label={`Add emoji to ${label.toLowerCase()}`} />}
      </div>
    </label>
  );
}

/** Image slot in the preview: the template's cover photo. */
function Banner({ photo, height }: { photo: string; height: number }) {
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <img src={photo} alt="" loading="lazy" className="size-full object-cover" />
    </div>
  );
}

/** Live email preview for one audience — rendered beside the editor controls. */
export function EmailPreview({ value, promotion }: { value: EmailContent; promotion?: Promotion | null }) {
  const { templates } = useMarketing();
  const template = templates.find((t) => t.id === value.templateId) ?? templates[0];
  const accent = template?.accent ?? "#2563eb";
  const layout = normalizeLayout(String(value.layout));
  const heroOf = (i: number) => template?.hero ?? LAYOUT_PRESETS[i % LAYOUT_PRESETS.length].photo;
  const offer = promotion ? (
    <div className="my-5">
      <PromoBanner promotion={promotion} property="Holiday Inn Times Square" className="shadow-none" />
    </div>
  ) : null;

  return (
    <div className="mx-auto max-w-[460px] overflow-hidden rounded-md border border-border bg-card shadow-lift">
      <div className="border-b border-border px-5 py-3">
        <p className="text-[13px] font-semibold text-card-foreground">{renderPreview(value.subject)}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{renderPreview(value.preheader)}</p>
      </div>

      {(layout === "hero_top" || layout === "gallery_three") && <Banner photo={heroOf(0)} height={140} />}

      {layout === "full_bleed" ? (
        <div className="relative px-6 py-12 text-center">
          <img src={heroOf(0)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${accent}e6, ${accent}b3)` }} />
          <div className="relative">
            <h3 className="text-[22px] font-semibold leading-snug text-white">{renderPreview(value.heading)}</h3>
            <p className="mx-auto mt-2.5 max-w-[320px] whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/85">
              {renderPreview(value.body)}
            </p>
            {offer}
            <span className="mt-5 inline-block rounded bg-white px-6 py-3 text-[13px] font-semibold" style={{ color: accent }}>
              {value.ctaLabel}
            </span>
          </div>
        </div>
      ) : layout === "split" || layout === "image_left" || layout === "image_right" ? (
        <div className={`flex gap-4 px-6 py-6 ${layout === "image_right" ? "flex-row-reverse" : ""}`}>
          <div className="w-2/5 shrink-0 overflow-hidden rounded">
            <Banner photo={heroOf(0)} height={132} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold leading-snug text-card-foreground">{renderPreview(value.heading)}</h3>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">{renderPreview(value.body)}</p>
            {offer}
            <span className="mt-4 inline-block rounded px-4 py-2.5 text-[12.5px] font-semibold text-white" style={{ background: accent }}>
              {value.ctaLabel}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-6 py-6 text-left">
          <h3 className="text-[20px] font-semibold leading-snug text-card-foreground">{renderPreview(value.heading)}</h3>
          <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted-foreground">{renderPreview(value.body)}</p>

          {layout === "headline_first" && <div className="mt-4 overflow-hidden rounded"><Banner photo={heroOf(0)} height={120} /></div>}
          {layout === "cta_focus" && <div className="mt-4 overflow-hidden rounded"><Banner photo={heroOf(0)} height={88} /></div>}
          {layout === "gallery_two" && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="overflow-hidden rounded"><Banner photo={heroOf(i)} height={92} /></div>
              ))}
            </div>
          )}
          {layout === "gallery_three" && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden rounded"><Banner photo={heroOf(i + 1)} height={72} /></div>
              ))}
            </div>
          )}

          {offer}

          <span className="mt-5 inline-block rounded px-5 py-3 text-[13px] font-semibold text-white" style={{ background: accent }}>
            {value.ctaLabel}
          </span>
        </div>
      )}

      <div className="border-t border-border px-6 py-4 text-[11px] text-muted-foreground">
        Holiday Inn New York City – Times Square · Unsubscribe
      </div>
    </div>
  );
}

/**
 * Email channel controls: subject, preheader, heading, body and button fields
 * first; template/layout secondary; promotion in an expandable advanced area.
 */
export function EmailEditor({
  value,
  onChange,
  customized = false,
  promotion,
  onRequestPromotion,
  onRemovePromotion,
}: {
  value: EmailContent;
  onChange: (v: EmailContent) => void;
  customized?: boolean;
  promotion?: Promotion | null;
  onRequestPromotion: () => void;
  onRemovePromotion: () => void;
}) {
  const { templates } = useMarketing();
  const [lib, setLib] = useState(false);
  const [layoutLib, setLayoutLib] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<(typeof templates)[number] | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const template = templates.find((t) => t.id === value.templateId) ?? templates[0];
  const accent = template?.accent ?? "#2563eb";
  const layout = normalizeLayout(String(value.layout));

  const set = <K extends keyof EmailContent>(k: K, v: EmailContent[K]) => onChange({ ...value, [k]: v });
  const photo = template?.hero ?? LAYOUT_PRESETS[0].photo;

  return (
    <div className="min-w-0 space-y-4">
      <Field label="Subject" value={value.subject} onChange={(v) => set("subject", v)} emoji />
      <Field label="Preheader" value={value.preheader} onChange={(v) => set("preheader", v)} emoji />
      <Field label="Heading" value={value.heading} onChange={(v) => set("heading", v)} emoji />

      <label className="block">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          Body
          <span className="font-normal normal-case">
            <EmojiPicker onPick={(e) => set("body", `${value.body}${e}`)} label="Add emoji to body" />
          </span>
        </span>
        <textarea
          value={value.body}
          onChange={(e) => set("body", e.target.value)}
          rows={5}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-[13.5px] leading-relaxed text-foreground outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button label" value={value.ctaLabel} onChange={(v) => set("ctaLabel", v)} />
        <Field label="Button link" value={value.ctaUrl} onChange={(v) => set("ctaUrl", v)} />
      </div>

      {/* Template & layout — secondary to copy editing */}
      <section className="grid gap-3 rounded-md border border-border bg-muted/40 p-3 sm:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Template</p>
          <p className="mt-0.5 truncate text-[12.5px] font-semibold text-card-foreground">{template?.name ?? "None"}</p>
          <button
            onClick={() => setLib(true)}
            className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-brand hover:underline"
          >
            <LayoutTemplate size={12} />
            {template ? "Change template" : "Choose template"}
          </button>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Layout</p>
          <p className="mt-0.5 truncate text-[12.5px] font-semibold text-card-foreground">{LAYOUT_LABEL(layout)}</p>
          <button
            onClick={() => setLayoutLib(true)}
            className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-brand hover:underline"
          >
            <Rows3 size={12} />
            Change layout
          </button>
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-muted sm:col-span-2">
          <div className="relative h-16">
            <img src={photo} alt="" loading="lazy" className="size-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: accent }} />
          </div>
        </div>
      </section>

      {/* Advanced — promotion */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setAdvanced((a) => !a)}
          aria-expanded={advanced}
          className="flex w-full items-center justify-between gap-2 text-[12.5px] font-semibold text-card-foreground transition-colors hover:text-brand"
        >
          <span className="flex items-center gap-1.5">
            <Gift size={13} className="text-muted-foreground" />
            Promotion settings
          </span>
          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>

        {advanced && (
          <div className="mt-3 rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-brand-soft text-brand">
                  <Gift size={13} />
                </span>
                <p className="truncate text-[12px] font-semibold text-card-foreground">
                  {promotion?.name ?? "No promotion attached"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {promotion && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemovePromotion}>
                    <Trash2 size={12} />Remove
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onRequestPromotion}>
                  {promotion ? "Change" : "Add promotion"}
                </Button>
              </div>
            </div>
            {promotion && (
              <div className="mx-auto mt-3 max-w-sm">
                <PromoBanner promotion={promotion} property="Holiday Inn Times Square" className="shadow-none" />
              </div>
            )}
          </div>
        )}
      </div>

      <TemplateLibrary
        open={lib}
        onClose={() => setLib(false)}
        selectedId={value.templateId}
        onSelect={(t) => {
          if (customized) {
            setPendingTemplate(t);
            return;
          }
          onChange({
            ...value,
            templateId: t.id,
            layout: t.layout,
            subject: t.heading,
            heading: t.heading,
            body: t.body,
            ctaLabel: t.ctaLabel,
          });
        }}
      />

      <LayoutLibrary
        open={layoutLib}
        onClose={() => setLayoutLib(false)}
        value={layout}
        accent={accent}
        photo={photo}
        onSelect={(l: EmailLayout) => set("layout", l)}
      />

      {pendingTemplate && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-foreground/45 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-float">
            <h3 className="text-[16px] font-semibold text-card-foreground">Change email template?</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">Your written content will be kept where possible. The new template’s default layout will be applied.</p>
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setPendingTemplate(null)} className="rounded-md border border-input px-3 py-2 text-[12.5px] font-medium">Cancel</button><button onClick={() => { onChange({ ...value, templateId: pendingTemplate.id, layout: pendingTemplate.layout }); setPendingTemplate(null); setLib(false); }} className="rounded-md bg-brand px-3 py-2 text-[12.5px] font-semibold text-brand-foreground">Continue</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
