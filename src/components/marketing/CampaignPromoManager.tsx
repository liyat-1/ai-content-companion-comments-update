import { useMemo, useState } from "react";
import { Check, Gift, Info, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AUDIENCE_LABEL,
  setVariantPromotion,
  useMarketing,
  variantPromotionId,
  type AudienceKey,
  type CampaignGroup,
} from "@/lib/marketing";

const AUDIENCES: AudienceKey[] = ["direct", "ota"];

/**
 * Mini promotion management for the campaigns on the current page. Direct and
 * OTA guests each get their own promotion, changed inline with a search.
 */
export function CampaignPromoManager({
  open,
  group,
  onClose,
}: {
  open: boolean;
  group: CampaignGroup;
  onClose: () => void;
}) {
  const { campaigns, promotions } = useMarketing();
  const list = campaigns.filter((campaign) => campaign.group === group);
  const [changing, setChanging] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter(
      (promotion) => !q || `${promotion.name} ${promotion.detail} ${promotion.code}`.toLowerCase().includes(q),
    );
  }, [promotions, query]);

  const openChange = (key: string) => {
    setChanging((current) => (current === key ? null : key));
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[86vh] w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Manage promo</DialogTitle>
          <DialogDescription>
            Direct and OTA guests can carry a different promotion on the same campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {list.map((campaign) => (
            <div key={campaign.id} className="rounded-md border border-border bg-background">
              <p className="border-b border-border px-3 py-2 text-[12.5px] font-semibold text-card-foreground">
                {campaign.name}
              </p>

              {AUDIENCES.map((audience) => {
                const key = `${campaign.id}:${audience}`;
                const currentId = variantPromotionId(campaign, audience);
                const current = promotions.find((promotion) => promotion.id === currentId) ?? null;
                const isChanging = changing === key;
                return (
                  <div key={audience} className="border-b border-border last:border-b-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {AUDIENCE_LABEL[audience]}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                          <Gift size={12} className={current ? "text-brand" : ""} />
                          {current ? `${current.name} · ${current.code}` : "No promotion"}
                        </p>
                      </div>
                      <Button variant={isChanging ? "brand" : "outline"} size="sm" onClick={() => openChange(key)}>
                        {isChanging ? (
                          <>
                            <X size={13} />
                            Close
                          </>
                        ) : (
                          "Change"
                        )}
                      </Button>
                    </div>

                    {isChanging && (
                      <div className="border-t border-border bg-muted/40 p-3">
                        <div className="relative">
                          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search promotions"
                            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </div>
                        <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                          <button
                            onClick={() => {
                              setVariantPromotion(campaign.id, audience, null);
                              setChanging(null);
                            }}
                            className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-[12px] ${
                              currentId === null
                                ? "border-brand bg-brand-soft"
                                : "border-border bg-background hover:border-brand/40"
                            }`}
                          >
                            <Gift size={13} className="text-muted-foreground" />
                            No promotion
                            {currentId === null && <Check size={13} className="ml-auto text-brand" />}
                          </button>
                          {results.map((promotion) => (
                            <button
                              key={promotion.id}
                              onClick={() => {
                                setVariantPromotion(campaign.id, audience, promotion.id);
                                setChanging(null);
                              }}
                              className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left ${
                                currentId === promotion.id
                                  ? "border-brand bg-brand-soft"
                                  : "border-border bg-background hover:border-brand/40"
                              }`}
                            >
                              <Gift size={13} className="mt-0.5 shrink-0 text-brand" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12px] font-semibold text-card-foreground">
                                  {promotion.name}
                                </span>
                                <span className="block truncate text-[11px] text-muted-foreground">
                                  {promotion.detail}
                                </span>
                              </span>
                              {currentId === promotion.id && <Check size={13} className="shrink-0 text-brand" />}
                            </button>
                          ))}
                          {results.length === 0 && (
                            <p className="px-1 py-2 text-[11.5px] text-muted-foreground">
                              No promotions match that search.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Info size={12} className="text-brand" />
            One promotion per guest segment.
          </p>
          <Button variant="brand" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
