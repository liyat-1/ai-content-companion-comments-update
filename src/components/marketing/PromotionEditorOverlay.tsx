import { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "./EmojiPicker";
import { MediaPicker } from "./MediaPicker";
import { PromoBanner } from "./PromoBanner";
import {
  BANNER_TEMPLATES,
  BANNER_THEMES,
  CODE_TYPE_LABEL,
  CURRENT_USER,
  mutate,
  uid,
  useMarketing,
  type MediaItem,
  type Promotion,
} from "@/lib/marketing";

/** Tiny schematic that hints at each banner layout. */
function TemplateGlyph({ id, swatch }: { id: string; swatch: string }) {
  return (
    <div className="flex h-12 items-center justify-center rounded-sm border border-border bg-muted/40 p-1.5">
      {id === "ribbon" && (
        <div className="w-full rotate-[-4deg] rounded-[2px] px-1.5 py-2" style={{ backgroundColor: swatch }}>
          <span className="mx-auto block h-1 w-10 rounded-full bg-white/80" />
          <span className="mx-auto mt-1 block h-1 w-14 rounded-full bg-white/40" />
        </div>
      )}
      {id === "ticket" && (
        <div className="flex w-full items-stretch gap-1">
          <div className="flex-1 space-y-1 py-0.5">
            <span className="block h-1 w-full rounded-full" style={{ backgroundColor: swatch }} />
            <span className="block h-1 w-3/4 rounded-full bg-muted-foreground/30" />
            <span className="block h-1 w-1/2 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="w-5 rounded-[2px] border border-dashed" style={{ borderColor: swatch }} />
        </div>
      )}
      {id === "spotlight" && (
        <div
          className="grid size-full place-items-center rounded-[2px]"
          style={{ background: `linear-gradient(135deg, ${swatch}, #111827)` }}
        >
          <span className="size-3.5 rounded-full bg-white/90" />
        </div>
      )}
      {id === "frame" && (
        <div className="grid size-full place-items-center rounded-[2px] border-2" style={{ borderColor: swatch }}>
          <span className="size-3.5 rounded-full" style={{ backgroundColor: swatch }} />
        </div>
      )}
      {id === "minimal" && (
        <div className="flex w-full items-center gap-2">
          <span className="text-[15px] font-extrabold leading-none" style={{ color: swatch }}>
            %
          </span>
          <div className="flex-1 space-y-1 border-l border-border pl-2">
            <span className="block h-1 w-full rounded-full bg-muted-foreground/30" />
            <span className="block h-1 w-2/3 rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      )}
      {id === "split" && (
        <div className="grid size-full grid-cols-[2fr_3fr] overflow-hidden rounded-[2px] border border-border">
          <span style={{ backgroundColor: swatch }} />
          <span className="grid content-center gap-1 px-2"><i className="block h-1 w-full bg-muted-foreground/35" /><i className="block h-1 w-2/3 bg-muted-foreground/20" /></span>
        </div>
      )}
      {id === "editorial" && (
        <div className="w-full border-l-4 px-2" style={{ borderColor: swatch }}><span className="block text-[15px] font-black leading-none">Aa</span><span className="mt-1 block h-1 w-3/4 bg-muted-foreground/25" /></div>
      )}
      {id === "badge" && (
        <div className="grid size-full place-items-center rounded-[2px] bg-muted"><span className="grid size-8 place-items-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: swatch }}>%</span></div>
      )}
      {id === "upgrade" && (
        <div className="grid size-full grid-rows-[1fr_auto] overflow-hidden rounded-[2px] border border-border"><span style={{ backgroundColor: swatch }} /><span className="grid grid-cols-[1fr_auto_1fr] gap-1 bg-card px-1.5 py-1"><i className="h-1 bg-muted-foreground/25" /><b className="text-[7px]" style={{ color: swatch }}>→</b><i className="h-1 bg-muted-foreground/35" /></span></div>
      )}
      {id === "schedule" && (
        <div className="grid size-full grid-rows-[1fr_auto] overflow-hidden rounded-[2px] border border-border"><span style={{ backgroundColor: swatch }} /><span className="px-1.5 py-1"><i className="block h-1 rounded-full bg-muted"><b className="block h-full w-2/3 rounded-full" style={{ backgroundColor: swatch }} /></i></span></div>
      )}
      {id === "included" && (
        <div className="grid size-full grid-cols-[2fr_3fr] overflow-hidden rounded-[2px] border border-border"><span style={{ backgroundColor: swatch }} /><span className="grid content-center gap-1 px-2"><i className="h-1 bg-muted-foreground/35" /><i className="h-1 bg-muted-foreground/25" /><i className="h-1 bg-muted-foreground/20" /></span></div>
      )}
    </div>
  );
}

function MediaSlot({
  label,
  url,
  onOpen,
  onClear,
}: {
  label: string;
  url?: string;
  onOpen: () => void;
  onClear: () => void;
}) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          title={`Choose ${label.toLowerCase()} from the media library`}
          className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted/40 transition-colors hover:border-brand/50"
        >
          {url ? (
            <img src={url} alt="" loading="lazy" className="size-full object-contain p-1" />
          ) : (
            <ImageIcon size={16} className="text-muted-foreground" />
          )}
        </button>
        <div className="min-w-0 text-[11px] text-muted-foreground">
          <button type="button" onClick={onOpen} className="font-medium text-brand hover:underline">
            {url ? "Change" : "Add from media library"}
          </button>
          {url && (
            <>
              {" · "}
              <button type="button" onClick={onClear} className="hover:underline">
                remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "rounded-sm border border-input bg-background px-3 py-2 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClass = "text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground";

/**
 * Pop-up editor for one promotion: offer details plus a banner design section
 * (layout template, colour, logo/photo, editable wording) with a live guest
 * preview. Creating and editing share this overlay; assigning campaigns is a
 * separate surface (PromotionAssignOverlay).
 */
export function PromotionEditorOverlay({ promotion, onClose }: { promotion?: Promotion | null; onClose: () => void }) {
  const editing = promotion ?? null;
  const { media } = useMarketing();
  const [name, setName] = useState(editing?.name ?? "");
  const [detail, setDetail] = useState(editing?.detail ?? "");
  const [code, setCode] = useState(editing?.code ?? "");
  const [codeType, setCodeType] = useState<NonNullable<Promotion["codeType"]>>(editing?.codeType ?? "promo");
  const [discount, setDiscount] = useState(editing?.discountPercent ? String(editing.discountPercent) : "");
  const [minNights, setMinNights] = useState(editing?.minNights ? String(editing.minNights) : "");
  const [tagline, setTagline] = useState(editing?.tagline ?? "");
  const [kicker, setKicker] = useState(editing?.kicker ?? "");
  const [propertyName, setPropertyName] = useState(editing?.propertyName ?? "");
  const [startsAt, setStartsAt] = useState(editing?.startsAt ?? "");
  const [endsAt, setEndsAt] = useState(editing?.endsAt ?? "");
  const [durationDays, setDurationDays] = useState(editing?.durationDays ? String(editing.durationDays) : "");
  const [bannerStyle, setBannerStyle] = useState<string>(editing?.bannerStyle ?? BANNER_THEMES[0].id);
  const [bannerTemplate, setBannerTemplate] = useState<string>(editing?.bannerTemplate ?? "ribbon");
  const [logoId, setLogoId] = useState<string | undefined>(editing?.logoId);
  const [bannerImageId, setBannerImageId] = useState<string | undefined>(editing?.bannerImageId);
  const [picker, setPicker] = useState<"logo" | "photo" | null>(null);
  const [error, setError] = useState("");

  const logoUrl = media.find((m) => m.id === logoId && m.type === "image")?.url;
  const photoUrl = media.find((m) => m.id === bannerImageId && m.type === "image")?.url;

  const preview: Promotion = {
    id: editing?.id ?? "preview",
    name: name || "New promotion",
    detail: detail.trim() || "Custom hotel offer.",
    code: code.trim().toUpperCase() || "OFFER",
    codeType,
    discountPercent: discount ? Number(discount) : undefined,
    minNights: minNights ? Number(minNights) : undefined,
    tagline: tagline.trim() || undefined,
    startsAt: startsAt || undefined,
    endsAt: endsAt || undefined,
    durationDays: durationDays ? Number(durationDays) : undefined,
    bannerStyle,
    bannerTemplate,
    kicker: kicker.trim() || undefined,
    propertyName: propertyName.trim() || undefined,
    logoId,
    bannerImageId,
  };

  const save = () => {
    const clean = name.trim();
    if (!clean) {
      setError("Give the offer a name first.");
      return;
    }
    const values = {
      ...preview,
      name: clean,
      updatedBy: { by: CURRENT_USER.name, at: Date.now() },
    };
    mutate((draft) => {
      if (editing) {
        const target = draft.promotions.find((p) => p.id === editing.id);
        if (target) Object.assign(target, values);
      } else {
        draft.promotions.push({ ...values, id: uid() });
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
            {editing ? "Edit promotion" : "New promotion"}
          </p>
          <h2 className="truncate text-[17px] font-semibold text-card-foreground">{name || "Untitled offer"}</h2>
          <p className="text-[11.5px] text-muted-foreground">
            Set the offer details, then design the guest-facing banner. Assigning campaigns stays a separate step.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Close" onClick={onClose}>
          <X size={16} />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
          <div className="space-y-4">
            <section className="rounded-lg border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Details</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 sm:col-span-2">
                  <span className={labelClass}>Promotion name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 15% off next stay" className={inputClass} />
                </label>
                <label className="grid gap-1 sm:col-span-2">
                  <span className={labelClass}>Short description</span>
                  <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Where the offer applies and who it is for" className={inputClass} />
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Code type</span>
                  <select
                    value={codeType}
                    onChange={(e) => setCodeType(e.target.value as NonNullable<Promotion["codeType"]>)}
                    className={inputClass}
                  >
                    <option value="promo">Promo code</option>
                    <option value="rate">Rate code</option>
                    <option value="corporate">Corporate ID</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>{CODE_TYPE_LABEL[codeType]}</span>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={codeType === "corporate" ? "e.g. CORP-4471" : "e.g. RETURN15"}
                    className={`${inputClass} uppercase`}
                  />
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Discount %</span>
                  <input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    placeholder="e.g. 15"
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Minimum nights</span>
                  <input
                    value={minNights}
                    onChange={(e) => setMinNights(e.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    placeholder="e.g. 2"
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Valid from</span>
                  <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Until</span>
                  <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
                </label>
                <label className="grid gap-1 sm:col-span-2">
                  <span className={labelClass}>How long it lasts per guest (days)</span>
                  <input
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    placeholder="e.g. 30 — leave empty and it runs with no end date"
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Banner design</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Pick a layout and colour, drop in a logo or photo from the media library, and edit every line of wording.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {BANNER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={bannerTemplate === t.id}
                    onClick={() => setBannerTemplate(t.id)}
                    className={`rounded-md border p-2.5 text-left transition-colors ${
                      bannerTemplate === t.id
                        ? "border-brand bg-brand-soft"
                        : "border-border bg-background hover:border-brand/40"
                    }`}
                  >
                    <TemplateGlyph id={t.id} swatch={BANNER_THEMES.find((x) => x.id === bannerStyle)?.swatch ?? "#334155"} />
                    <p className="mt-2 text-[12px] font-semibold text-card-foreground">{t.label}</p>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Banner colour</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {BANNER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    title={theme.label}
                    aria-label={theme.label}
                    aria-pressed={bannerStyle === theme.id}
                    onClick={() => setBannerStyle(theme.id)}
                    className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      bannerStyle === theme.id ? "border-brand ring-2 ring-brand/25" : "border-border"
                    }`}
                    style={{ backgroundColor: theme.swatch }}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MediaSlot label="Logo" url={logoUrl} onOpen={() => setPicker("logo")} onClear={() => setLogoId(undefined)} />
                <MediaSlot
                  label="Background photo"
                  url={photoUrl}
                  onOpen={() => setPicker("photo")}
                  onClear={() => setBannerImageId(undefined)}
                />
              </div>

              <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Banner wording</p>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className={labelClass}>Kicker line</span>
                  <input value={kicker} onChange={(e) => setKicker(e.target.value)} placeholder="e.g. Sevket, you unlocked" className={inputClass} />
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Property name</span>
                  <input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="e.g. Holiday Inn Times Square" className={inputClass} />
                </label>
                <div className="grid gap-1 sm:col-span-2">
                  <span className={labelClass}>Headline on the banner</span>
                  <div className="flex items-center gap-1.5 rounded-sm border border-input bg-background px-2.5 py-1 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                    <input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Stay longer and save 🌙"
                      className="min-w-0 flex-1 bg-transparent py-0.5 text-[12.5px] outline-none"
                    />
                    <EmojiPicker onPick={(emoji) => setTagline((v) => `${v}${emoji}`)} label="Add emoji to the headline" />
                  </div>
                </div>
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Guest preview</p>
              <p className="mt-1 text-[12px] text-muted-foreground">This is how the promotion will appear in guest messages.</p>
              <div className="mx-auto mt-4 max-w-md">
                <PromoBanner promotion={preview} />
              </div>
            </section>

            {error && <p className="text-[11.5px] font-medium text-destructive">{error}</p>}
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-canvas/95 py-3 backdrop-blur">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="brand" size="sm" onClick={save}>
                {editing ? "Save changes" : "Create promotion"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        multi={false}
        types={["image"]}
        selectedIds={picker === "logo" ? (logoId ? [logoId] : []) : bannerImageId ? [bannerImageId] : []}
        onSelect={(item: MediaItem) => {
          if (picker === "logo") setLogoId(item.id);
          else if (picker === "photo") setBannerImageId(item.id);
          setPicker(null);
        }}
      />
    </div>
  );
}
