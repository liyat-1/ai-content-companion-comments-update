import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Offers", emojis: ["🎁", "🏷️", "💸", "✨", "🔥", "⭐", "🎉", "💎", "🥳", "🤩"] },
  { label: "Stay", emojis: ["🛏️", "🏨", "🔑", "🧳", "🚪", "🕐", "⏰", "🌙", "☀️", "🌴"] },
  { label: "Food & drink", emojis: ["☕", "🍳", "🍽️", "🍷", "🍸", "🥂", "🍰", "🍹", "🧁", "🍺"] },
  { label: "Extras", emojis: ["💆", "🧖", "🏊", "🚗", "🐶", "👨‍👩‍👧", "💼", "🎾", "🚲", "❤️"] },
];

/** Small emoji palette used to add emoji to short text fields such as the offer tagline. */
export function EmojiPicker({ onPick, label = "Add emoji" }: { onPick: (emoji: string) => void; label?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Smile size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-2">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-10 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onPick(emoji)}
                    className="rounded-sm py-0.5 text-[15px] leading-none transition-colors hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
