import { useEffect, useState } from "react";
import { Check, HelpCircle, Mail, MessageSquare, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CAMPAIGN_DRAG_TYPE,
  STRATEGIES,
  mutate,
  type MarketingCampaign,
  type Strategy,
} from "@/lib/marketing";

const ICONS: Record<Strategy, React.ComponentType<{ size?: number; className?: string }>> = {
  text: MessageSquare,
  text_email: Mail,
  text_fallback: Shuffle,
};

const EXPLANATIONS: Record<Strategy, string> = {
  text: "Every guest gets a text message. Guests without a mobile number on the booking cannot be reached, so make sure your bookings capture numbers.",
  text_email: "Every guest gets both a text and an email. Use this when the message is important enough to see twice, like a check-in reminder with an offer attached.",
  text_fallback: "Guests get a text first. If the text cannot be delivered — a missing or invalid number — the same message goes out by email instead, so nobody is missed.",
};

/**
 * Channel strategy popup: three visible drop columns with the explanation
 * beneath each heading, a fuller "What does this mean?" help control, and
 * staged Apply behaviour.
 */
export function StrategyOverlay({
  open,
  campaigns,
  onClose,
}: {
  open: boolean;
  campaigns: MarketingCampaign[];
  onClose: () => void;
}) {
  const [staged, setStaged] = useState<Record<string, Strategy>>({});
  const [over, setOver] = useState<Strategy | null>(null);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (open) {
      setStaged({});
      setOver(null);
      setHelp(false);
    }
  }, [open]);

  const strategyOf = (c: MarketingCampaign) => staged[c.id] ?? c.strategy;
  const changed = campaigns.filter((c) => staged[c.id] && staged[c.id] !== c.strategy);

  const move = (id: string, strategy: Strategy) => setStaged((current) => ({ ...current, [id]: strategy }));

  const apply = () => {
    mutate((draft) =>
      draft.campaigns.forEach((campaign) => {
        if (staged[campaign.id]) campaign.strategy = staged[campaign.id];
      }),
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-[96vw] max-w-[1180px] flex-col gap-0 overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-6 py-4 pr-12">
          <DialogTitle className="text-[17px]">Manage channel strategy</DialogTitle>
          <DialogDescription>
            Drag a campaign into a channel column to change how it is delivered. Nothing is saved until you apply.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <button
            type="button"
            onClick={() => setHelp((h) => !h)}
            aria-expanded={help}
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
          >
            <HelpCircle size={14} />
            What does this mean?
          </button>
          {help && (
            <div className="mb-4 space-y-2 rounded-md border border-border bg-background px-4 py-3">
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                The channel strategy decides how each automated message reaches the guest. Most properties send text
                first — texts are opened within minutes, while emails can sit unread. Pick <strong>Text + Email</strong>{" "}
                when a message matters twice, and <strong>Text with Email fallback</strong> when you want a safety net
                for bookings without a mobile number. Changes apply to future messages only; nothing already sent
                changes.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {STRATEGIES.map((strategy) => {
              const Icon = ICONS[strategy.value];
              const items = campaigns.filter((c) => strategyOf(c) === strategy.value);
              return (
                <section
                  key={strategy.value}
                  onDragOver={(event) => {
                    if (!event.dataTransfer.types.includes(CAMPAIGN_DRAG_TYPE)) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setOver(strategy.value);
                  }}
                  onDragLeave={() => setOver((current) => (current === strategy.value ? null : current))}
                  onDrop={(event) => {
                    const id = event.dataTransfer.getData(CAMPAIGN_DRAG_TYPE);
                    event.preventDefault();
                    setOver(null);
                    if (id) move(id, strategy.value);
                  }}
                  className={`flex min-h-[260px] flex-col rounded-lg border p-3 transition-colors ${
                    over === strategy.value ? "border-brand bg-brand-soft" : "border-border bg-background"
                  }`}
                >
                  <header className="border-b border-border pb-2.5">
                    <div className="flex items-start gap-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-card-foreground">{strategy.label}</p>
                        <p className="text-[11px] text-muted-foreground">{items.length} campaigns</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">{EXPLANATIONS[strategy.value]}</p>
                  </header>
                  <div className="mt-2.5 flex-1 space-y-2">
                    {items.map((campaign) => {
                      const moved = staged[campaign.id] && staged[campaign.id] !== campaign.strategy;
                      return (
                        <article
                          key={campaign.id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData(CAMPAIGN_DRAG_TYPE, campaign.id);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          className={`cursor-grab rounded-md border bg-card px-3 py-2 shadow-card transition-colors active:cursor-grabbing ${
                            moved ? "border-brand" : "border-border hover:border-brand/45"
                          }`}
                        >
                          <p className="truncate text-[12.5px] font-semibold text-card-foreground">{campaign.name}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{campaign.timing}</p>
                          {moved && (
                            <p className="mt-1 text-[10.5px] font-semibold text-brand">Moved · not applied yet</p>
                          )}
                        </article>
                      );
                    })}
                    {items.length === 0 && (
                      <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-muted-foreground">
                        Drop campaigns here
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3.5">
          <p className="text-[12px] text-muted-foreground">
            {changed.length ? `${changed.length} campaign${changed.length > 1 ? "s" : ""} moved` : "No changes yet"}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="brand" size="sm" onClick={apply} disabled={!changed.length}>
              <Check size={14} />
              Apply changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
