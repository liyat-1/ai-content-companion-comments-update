import { Check, X } from "lucide-react";
import { LAYOUT_PRESETS, type EmailLayout } from "@/lib/marketing";

/**
 * A miniature of the real thing: the layout is drawn with an actual photograph
 * in every image slot, so the picker shows what the email will look like.
 */
export function LayoutThumb({
  layout,
  accent,
  photo,
}: {
  layout: EmailLayout;
  accent: string;
  photo: string;
}) {
  const img = (className: string, alt = "") => (
    <img src={photo} alt={alt} loading="lazy" className={`bg-muted object-cover ${className}`} />
  );
  const line = <div className="h-1.5 rounded-sm bg-muted-foreground/20" />;
  const short = <div className="h-1.5 w-2/3 rounded-sm bg-muted-foreground/20" />;
  const btn = (
    <div
      className="h-3 w-11 rounded-sm text-[5px] font-semibold leading-3 text-center text-white"
      style={{ background: accent }}
    >
      CTA
    </div>
  );

  return (
    <div className="flex h-[76px] flex-col gap-1 overflow-hidden rounded bg-card p-1.5 shadow-sm ring-1 ring-border/60">
      {layout === "hero_top" && (
        <>
          {img("h-8 w-full rounded-sm")}
          <div className="h-1.5 w-3/4 rounded-sm bg-muted-foreground/45" />
          {line}
          {short}
          {btn}
        </>
      )}

      {layout === "text_only" && (
        <>
          {img("h-1.5 w-full rounded-sm")}
          <div className="h-1.5 w-3/4 rounded-sm bg-muted-foreground/45" />
          {line}
          {line}
          {short}
          {btn}
        </>
      )}

      {layout === "split" && (
        <>
          <div className="flex flex-1 gap-1">
            {img("w-2/5 rounded-sm")}
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
              <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/45" />
              {line}
              {short}
            </div>
          </div>
          {btn}
        </>
      )}

      {layout === "full_bleed" && (
        <div className="relative flex-1 overflow-hidden rounded-sm">
          {img("absolute inset-0 size-full")}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${accent}d9, ${accent}a6)` }}
          />
          <div className="relative flex size-full flex-col items-center justify-center gap-1 px-2">
            <div className="h-2 w-3/4 rounded-sm bg-white/90" />
            <div className="h-1.5 w-1/2 rounded-sm bg-white/50" />
            <div className="mt-0.5 h-3 w-11 rounded-sm bg-white text-center text-[5px] font-semibold leading-3 text-foreground">
              CTA
            </div>
          </div>
        </div>
      )}

      {layout === "gallery_two" && (
        <>
          <div className="h-1.5 w-3/4 rounded-sm bg-muted-foreground/45" />
          {short}
          <div className="flex flex-1 gap-1">
            {img("w-1/2 rounded-sm")}
            {img("w-1/2 rounded-sm")}
          </div>
          {btn}
        </>
      )}

      {layout === "gallery_three" && (
        <>
          {img("h-5 w-full rounded-sm")}
          {short}
          <div className="flex flex-1 gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex-1 overflow-hidden rounded-sm">
                {img("size-full")}
              </span>
            ))}
          </div>
        </>
      )}
      {(layout === "image_left" || layout === "image_right") && (
        <div className={`flex flex-1 gap-1 ${layout === "image_right" ? "flex-row-reverse" : ""}`}>
          {img("w-1/2 rounded-sm")}
          <div className="flex flex-1 flex-col gap-1 pt-1"><div className="h-2 w-4/5 rounded-sm bg-muted-foreground/45" />{line}{short}{btn}</div>
        </div>
      )}
      {layout === "headline_first" && (<><div className="h-2 w-4/5 rounded-sm bg-muted-foreground/45" />{line}{short}{img("mt-0.5 h-8 w-full rounded-sm")}{btn}</>)}
      {layout === "cta_focus" && (<><div className="h-2 w-3/4 rounded-sm bg-muted-foreground/45" />{line}<div className="flex flex-1 items-center gap-1">{img("h-full w-1/3 rounded-sm")}<div className="flex flex-1 justify-center">{btn}</div></div></>)}
    </div>
  );
}

/**
 * Layout picker. It slides in from the left so the live preview on the right
 * stays visible while you try different layouts.
 */
export function LayoutLibrary({
  open,
  onClose,
  value,
  accent,
  photo,
  onSelect,
  layouts,
}: {
  open: boolean;
  onClose: () => void;
  value: EmailLayout;
  accent: string;
  photo: string;
  onSelect: (l: EmailLayout) => void;
  layouts?: EmailLayout[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-[75] flex w-[340px] max-w-[88vw] flex-col border-r border-border bg-card shadow-float">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-[14.5px] font-semibold tracking-tight text-card-foreground">Layout library</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Pick one — the preview updates as you go.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
        >
          <X size={17} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {LAYOUT_PRESETS.map((l) => {
          const active = value === l.value;
          return (
            <button
              key={l.value}
              onClick={() => onSelect(l.value)}
              aria-pressed={active}
              className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-all ${
                active
                  ? "border-brand bg-brand-soft/70 ring-2 ring-brand/25"
                  : "border-border bg-card hover:border-brand/45 hover:bg-muted/40"
              }`}
            >
              <span className="w-[104px] shrink-0">
                <LayoutThumb layout={l.value} accent={accent} photo={l.photo} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-card-foreground">{l.label}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">{l.desc}</span>
              </span>
              {active && (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-border px-3 py-3">
        <button
          onClick={onClose}
          className="w-full rounded-md bg-brand py-2 text-[12.5px] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  );
}
