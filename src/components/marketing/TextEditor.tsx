import { useRef, useState } from "react";
import { ChevronDown, Gift, Image, Trash2 } from "lucide-react";
import { TagTextArea } from "@/components/campaign/TagTextArea";
import { EmojiPicker } from "./EmojiPicker";
import { MediaStrip } from "./MediaStrip";
import { PromoBanner } from "./PromoBanner";
import { Button } from "@/components/ui/button";
import { MERGE_TAGS, type Promotion, type TextContent } from "@/lib/marketing";

/**
 * Text (SMS) channel controls: message and merge tags first, with media and
 * promotion in an expandable advanced area. The live preview lives beside the
 * audience sections in the campaign editor.
 */
export function TextEditor({
  value,
  onChange,
  promotion,
  onRequestPromotion,
  onRemovePromotion,
}: {
  value: TextContent;
  onChange: (v: TextContent) => void;
  promotion?: Promotion | null;
  onRequestPromotion: () => void;
  onRemovePromotion: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const ids = value.mediaIds ?? [];
  const chars = value.message.length;

  return (
    <div className="min-w-0">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
      <div className="mt-2 flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
        {MERGE_TAGS.map((t) => (
          <button
            key={t.token}
            type="button"
            onClick={() => (ref.current as any)?.__insertToken?.(t.token)}
            className={`rounded px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto shrink-0">
          <EmojiPicker onPick={(emoji) => (ref.current as any)?.__insertToken?.(emoji)} label="Add emoji to message" />
        </span>
      </div>
      <div className="mt-2">
        <TagTextArea
          value={value.message}
          onChange={(message) => onChange({ ...value, message })}
          tags={MERGE_TAGS}
          inputRef={ref}
          placeholder="Write your text message"
          minHeight={150}
        />
      </div>
      <p className="mt-1.5 text-[11.5px] tabular-nums text-muted-foreground">
        {chars} characters · {Math.max(1, Math.ceil(chars / 160))} segment
        {chars > 160 ? "s" : ""}
      </p>

      <div className="mt-5 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setAdvanced((a) => !a)}
          aria-expanded={advanced}
          className="flex w-full items-center justify-between gap-2 text-[12.5px] font-semibold text-card-foreground transition-colors hover:text-brand"
        >
          <span className="flex items-center gap-1.5">
            <Image size={13} className="text-muted-foreground" />
            Media and promotion
          </span>
          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>

        {advanced && (
          <div className="mt-3 space-y-4">
            <MediaStrip ids={ids} onChange={(mediaIds) => onChange({ ...value, mediaIds })} label="Attachments" />

            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-brand-soft text-brand">
                    <Gift size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-card-foreground">
                      {promotion?.name ?? "No promotion attached"}
                    </p>
                  </div>
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
                  <PromoBanner promotion={promotion} className="shadow-none" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
