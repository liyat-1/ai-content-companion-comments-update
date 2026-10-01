import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Check,
  ChevronDown,
  Gift,
  GripVertical,
  Info,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BulkDragChips } from "./BulkDragChips";
import {
  CAMPAIGN_BULK_DRAG_TYPE,
  CAMPAIGN_DRAG_TYPE,
  CODE_TYPE_LABEL,
  promotionDuration,
  promotionValidity,
  setVariantPromotion,
  useMarketing,
  type AudienceKey,
  type BulkScope,
  type MarketingCampaign,
  type Promotion,
} from "@/lib/marketing";

const AUDIENCE_KEYS: AudienceKey[] = ["direct", "ota"];
const STORAGE_KEY = "directful.promo-areas-v4";

type Areas = (string | null)[];

function loadAreas(promotions: Promotion[]): Areas {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Areas;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return Array.from({ length: 3 }, (_, i) => promotions[i]?.id ?? null);
}

/** One line of the offer configuration breakdown. */
function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-[3px]">
      <span className="shrink-0 text-[10.5px] text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-[10.5px] font-medium text-card-foreground">{value}</span>
    </div>
  );
}

/** One campaign chip under an offer: which guest segments receive it. */
function SegmentChecks({
  campaign,
  promotionId,
  conflict,
  onToggle,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  campaign: MarketingCampaign;
  promotionId: string;
  conflict: Record<AudienceKey, boolean>;
  onToggle: (audience: AudienceKey, value: boolean) => void;
  onRemove: () => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const ids = { direct: campaign.variants.direct, ota: campaign.variants.ota };
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="flex cursor-grab items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2 shadow-sm active:cursor-grabbing"
    >
      <GripVertical size={12} className="shrink-0 text-muted-foreground/60" />
      <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-card-foreground">{campaign.name}</span>
      {AUDIENCE_KEYS.map((audience) => {
        const checked = ids[audience].promotionMode === "custom" && ids[audience].promotionId === promotionId;
        return (
          <label
            key={audience}
            className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              checked ? "border-brand/50 bg-brand-soft text-brand" : "border-border text-muted-foreground hover:border-brand/40"
            } ${conflict[audience] ? "opacity-50" : ""}`}
            title={conflict[audience] ? "This segment already receives a different offer" : undefined}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={conflict[audience]}
              onChange={(event) => onToggle(audience, event.target.checked)}
              className="sr-only"
            />
            <span className="grid size-2.5 place-items-center rounded-[2px] border border-current">
              {checked && <Check size={8} strokeWidth={3.5} />}
            </span>
            {audience}
          </label>
        );
      })}
      <button
        type="button"
        aria-label={`Remove ${campaign.name} from this offer`}
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X size={11} />
      </button>
    </div>
  );
}

/**
 * Assignment-only promotion surface: a fixed No promotion column of draggable
 * campaigns beside a horizontally scrollable row of offer columns. Each offer
 * keeps its controls behind one "See config details" panel so the board stays
 * calm, and any number of offer columns can be added.
 */
export function PromoDropOverlay({
  campaigns,
  onClose,
}: {
  campaigns: MarketingCampaign[];
  onClose: () => void;
}) {
  const { promotions } = useMarketing();
  const [areas, setAreas] = useState<Areas>(() => loadAreas(promotions));
  const [dragging, setDragging] = useState<string | null>(null);
  const [overArea, setOverArea] = useState<number | null>(null);
  const [picker, setPicker] = useState<number | null>(null);
  const [details, setDetails] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [bulk, setBulk] = useState<BulkScope | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
    } catch {
      /* ignore */
    }
  }, [areas]);

  const byId = (id: string | null) => (id ? promotions.find((p) => p.id === id) ?? null : null);

  const campaignsOn = (promotionId: string) =>
    campaigns.filter((c) =>
      AUDIENCE_KEYS.some(
        (a) => c.variants[a].promotionMode === "custom" && c.variants[a].promotionId === promotionId,
      ),
    );

  /** Guest segments of a campaign that carry no offer yet. */
  const freeAudiences = (campaign: MarketingCampaign): AudienceKey[] =>
    AUDIENCE_KEYS.filter((audience) => campaign.variants[audience].promotionMode !== "custom");

  /** A campaign waits in No promotion while any of its segments is still free. */
  const unassigned = campaigns.filter((campaign) => freeAudiences(campaign).length > 0);


  const beginDrag = (event: React.DragEvent, campaignId: string) => {
    event.dataTransfer.setData(CAMPAIGN_DRAG_TYPE, campaignId);
    event.dataTransfer.setData("text/plain", campaignId);
    event.dataTransfer.effectAllowed = "move";
    setDragging(campaignId);
  };

  /** True when the segment already carries a different offer. */
  const conflictOf = (campaign: MarketingCampaign, promotionId: string): Record<AudienceKey, boolean> => ({
    direct:
      campaign.variants.direct.promotionMode === "custom" &&
      campaign.variants.direct.promotionId !== null &&
      campaign.variants.direct.promotionId !== promotionId,
    ota:
      campaign.variants.ota.promotionMode === "custom" &&
      campaign.variants.ota.promotionId !== null &&
      campaign.variants.ota.promotionId !== promotionId,
  });

  const toggle = (campaignId: string, audience: AudienceKey, promotionId: string, value: boolean) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const conflict = conflictOf(campaign, promotionId);
    if (value && conflict[audience]) {
      setNote(`${campaign.name} · ${audience === "direct" ? "Direct" : "OTA"} guests already receive a different offer. Remove that one first.`);
      return;
    }
    setVariantPromotion(campaignId, audience, value ? promotionId : null);
  };

  /** Dropping a campaign onto an offer moves only its still-free segments. */
  const dropCampaign = (campaignId: string, promotionId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const free = freeAudiences(campaign);
    const target = free.length > 0 ? free : AUDIENCE_KEYS.filter(
      (a) => campaign.variants[a].promotionId === promotionId,
    );
    if (target.length === 0) {
      setNote(`${campaign.name} already carries an offer for both guest segments.`);
      return;
    }
    target.forEach((audience) => setVariantPromotion(campaignId, audience, promotionId));
    setNote(null);
  };


  const audiencesOf = (scope: BulkScope): AudienceKey[] =>
    scope === "both" ? AUDIENCE_KEYS : [scope];

  /** Move every free campaign of a collection onto one offer at once. */
  const dropCollection = (scope: BulkScope, promotionId: string) => {
    const audiences = audiencesOf(scope);
    const moved = campaigns.filter((c) => audiences.every((a) => c.variants[a].promotionMode !== "custom"));
    moved.forEach((c) => audiences.forEach((a) => setVariantPromotion(c.id, a, promotionId)));
    setNote(
      moved.length
        ? `${moved.length} campaign${moved.length === 1 ? "" : "s"} moved onto this offer.`
        : "Every campaign in that collection already carries an offer.",
    );
  };

  /** Clear a whole collection back to No promotion. */
  const clearCollection = (scope: BulkScope) => {
    const audiences = audiencesOf(scope);
    campaigns.forEach((c) => audiences.forEach((a) => setVariantPromotion(c.id, a, null)));
  };

  const allow = (event: React.DragEvent) => {
    const types = event.dataTransfer.types;
    if (!dragging && !bulk && !types.includes(CAMPAIGN_DRAG_TYPE) && !types.includes(CAMPAIGN_BULK_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  /** Collection scope from the drag payload, when a collection is dragged. */
  const draggedScope = (event: React.DragEvent): BulkScope | null =>
    (event.dataTransfer.getData(CAMPAIGN_BULK_DRAG_TYPE) as BulkScope) || bulk;

  /** Campaign id from the drag payload, falling back to the tracked drag. */
  const draggedId = (event: React.DragEvent) => {
    if (draggedScope(event)) return null;
    const plain = event.dataTransfer.getData("text/plain");
    return event.dataTransfer.getData(CAMPAIGN_DRAG_TYPE) || (plain.startsWith("bulk:") ? "" : plain) || dragging;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Promotions</p>
          <h2 className="truncate text-[17px] font-semibold text-card-foreground">Manage promos</h2>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Move campaigns from No promotion to an offer, then choose which guest segments receive it.
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={onClose}>
          Done
        </Button>
      </header>

      <p className="flex items-start gap-2 border-b border-border bg-brand-soft/50 px-4 py-2 text-[11.5px] text-muted-foreground sm:px-6">
        <Info size={13} className="mt-[1px] shrink-0 text-brand" />
        Every campaign starts in No promotion. A campaign can carry one offer per guest segment. Scroll sideways for more
        offers — creating and editing the offers themselves stays in the Promotions tab.
      </p>

      {note && (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-amber-500/10 px-4 py-2 text-[12px] text-foreground sm:px-6">
          <span className="min-w-0">{note}</span>
          <button type="button" onClick={() => setNote(null)} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your offers</p>
          <p className="text-[11px] text-muted-foreground">Drag campaigns into an offer · scroll for more offers</p>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 gap-4">
          {/* Fixed campaign column */}
          <section
            onDragOver={(event) => { allow(event); setOverArea(-1); }}
            onDragLeave={() => setOverArea((current) => (current === -1 ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              const scope = draggedScope(event);
              if (scope) clearCollection(scope);
              else {
                const campaignId = draggedId(event);
                if (campaignId) AUDIENCE_KEYS.forEach((key) => setVariantPromotion(campaignId, key, null));
              }
              setOverArea(null);
              setDragging(null);
              setBulk(null);
            }}
            className={`flex w-[250px] shrink-0 flex-col rounded-xl border p-4 transition-colors sm:w-[270px] ${
              overArea === -1 ? "border-brand bg-brand-soft" : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-2 border-b border-border pb-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Ban size={15} /></span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-card-foreground">No promotion</p>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  {unassigned.length} campaign{unassigned.length === 1 ? "" : "s"} with a free guest segment
                </p>
              </div>
            </div>
            <BulkDragChips
              count={unassigned.length}
              onDragStart={(scope) => setBulk(scope)}
              onDragEnd={() => { setBulk(null); setOverArea(null); }}
            />
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
              {unassigned.map((campaign) => {
                const free = freeAudiences(campaign);
                return (
                  <article
                    key={campaign.id}
                    draggable
                    onDragStart={(event) => beginDrag(event, campaign.id)}
                    onDragEnd={() => { setDragging(null); setOverArea(null); }}
                    className={`flex cursor-grab items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2.5 shadow-sm transition-shadow hover:shadow active:cursor-grabbing ${dragging === campaign.id ? "opacity-50" : ""}`}
                  >
                    <GripVertical size={12} className="shrink-0 text-muted-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-card-foreground">{campaign.name}</p>
                      <p className="truncate text-[10.5px] text-muted-foreground">{campaign.timing}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {AUDIENCE_KEYS.map((audience) => {
                        const isFree = free.includes(audience);
                        return (
                          <span
                            key={audience}
                            title={
                              isFree
                                ? `${audience === "direct" ? "Direct" : "OTA"} guests are still free`
                                : `${audience === "direct" ? "Direct" : "OTA"} guests already carry an offer`
                            }
                            className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              isFree
                                ? "border-border text-muted-foreground"
                                : "border-transparent bg-muted text-muted-foreground/40 line-through"
                            }`}
                          >
                            {audience}
                          </span>
                        );
                      })}
                    </div>
                  </article>
                );
              })}

              {unassigned.length === 0 && (
                <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
                  Drop here to remove a promotion
                </p>
              )}
            </div>
          </section>

          {/* Horizontally scrollable offer columns */}
          <div className="flex min-h-0 min-w-0 flex-1 gap-4 overflow-x-auto pb-1">
            {areas.map((promotionId, index) => {
              const promotion = byId(promotionId);
              const assigned = promotion ? campaignsOn(promotion.id) : [];
              const open = details === index;
              return (
                <section
                  key={index}
                  onDragOver={(event) => {
                    allow(event);
                    setOverArea(index);
                  }}
                  onDragLeave={() => setOverArea((c) => (c === index ? null : c))}
                  onDrop={(event) => {
                    event.preventDefault();
                    const scope = draggedScope(event);
                    setOverArea(null);
                    setDragging(null);
                    setBulk(null);
                    if (scope) {
                      if (promotion) dropCollection(scope, promotion.id);
                      return;
                    }
                    const id = draggedId(event);
                    if (id && promotion) dropCampaign(id, promotion.id);
                  }}
                  className={`flex w-[290px] shrink-0 flex-col rounded-xl border p-4 transition-colors ${
                    overArea === index
                      ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                      : promotion
                        ? "border-brand/30 bg-brand-soft/30"
                        : "border-dashed border-border bg-card"
                  }`}
                >
                  {promotion ? (
                    <>
                      <div className="border-b border-border pb-2.5">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                            <Gift size={14} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px] font-semibold text-card-foreground">{promotion.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                              <Tag size={10} className="shrink-0" />
                              {promotion.code} · {assigned.length} campaign{assigned.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPicker(index)}
                            className="flex-1 rounded-sm border border-brand/40 bg-background px-2 py-1 text-[10.5px] font-semibold text-brand transition-colors hover:bg-brand-soft"
                          >
                            Change offer
                          </button>
                          <button
                            type="button"
                            onClick={() => setAreas((current) => current.map((v, i) => (i === index ? null : v)))}
                            className="flex-1 rounded-sm border border-border bg-background px-2 py-1 text-[10.5px] font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                          >
                            Clear column
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetails(open ? null : index)}
                          aria-expanded={open}
                          className="mt-2 flex w-full items-center justify-between rounded-sm px-1 py-1 text-[10.5px] font-semibold text-brand transition-colors hover:bg-brand-soft/70"
                        >
                          See config details
                          <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        {open && (
                          <div className="mt-1 rounded-md border border-border bg-background px-2.5 py-2">
                            <ConfigRow label="Code type" value={CODE_TYPE_LABEL[promotion.codeType ?? "promo"]} />
                            <ConfigRow label="Code" value={promotion.code} />
                            <ConfigRow
                              label="Discount"
                              value={promotion.discountPercent ? `${promotion.discountPercent}% off` : "No rate discount"}
                            />
                            <ConfigRow
                              label="Minimum nights"
                              value={promotion.minNights ? `${promotion.minNights} nights` : "None"}
                            />
                            <ConfigRow label="Runs" value={promotionValidity(promotion)} />
                            <ConfigRow label="Per guest" value={promotionDuration(promotion)} />
                            <p className="mt-1.5 border-t border-border pt-1.5 text-[10.5px] leading-snug text-muted-foreground">
                              {promotion.detail}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
                        {assigned.map((campaign) => (
                          <SegmentChecks
                            key={campaign.id}
                            campaign={campaign}
                            promotionId={promotion.id}
                            conflict={conflictOf(campaign, promotion.id)}
                            onToggle={(audience, value) => toggle(campaign.id, audience, promotion.id, value)}
                            onRemove={() => AUDIENCE_KEYS.forEach((a) => setVariantPromotion(campaign.id, a, null))}
                            onDragStart={(event) => beginDrag(event, campaign.id)}
                            onDragEnd={() => { setDragging(null); setOverArea(null); }}
                          />
                        ))}
                        {assigned.length === 0 && (
                          <p className="rounded-md border border-dashed border-border px-3 py-5 text-center text-[11px] text-muted-foreground">
                            Drop a campaign here
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center">
                      <p className="text-[12px] font-medium text-muted-foreground">Empty offer column</p>
                      <Button variant="outline" size="sm" onClick={() => setPicker(index)}>
                        Choose promotion
                      </Button>
                      {areas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAreas((current) => current.filter((_, i) => i !== index))}
                          className="flex items-center gap-1 text-[10.5px] text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={11} /> Remove column
                        </button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}

            <button
              type="button"
              onClick={() => setAreas((current) => [...current, null])}
              className="flex w-[150px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
            >
              <Plus size={16} />
              <span className="text-[11.5px] font-medium">Add offer</span>
            </button>
          </div>
        </div>
      </div>

      <PromotionAreaPicker
        open={picker !== null}
        promotions={promotions}
        activeIds={areas}
        onClose={() => setPicker(null)}
        onSelect={(id) => {
          if (picker !== null) setAreas((current) => current.map((v, i) => (i === picker ? id : v)));
          setPicker(null);
        }}
      />
    </div>
  );
}

/** Compact chooser for which offer occupies an area. */
function PromotionAreaPicker({
  open,
  promotions,
  activeIds,
  onClose,
  onSelect,
}: {
  open: boolean;
  promotions: Promotion[];
  activeIds: Areas;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((p) => !q || `${p.name} ${p.detail} ${p.code}`.toLowerCase().includes(q));
  }, [promotions, query]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-lg flex-col overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Choose a promotion</DialogTitle>
          <DialogDescription>Pick which offer fills this column.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search promotions"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {list.map((promotion) => {
              const usedElsewhere = activeIds.includes(promotion.id);
              return (
                <button
                  key={promotion.id}
                  onClick={() => onSelect(promotion.id)}
                  className="flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-left transition-colors hover:border-brand/50"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    <Gift size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-card-foreground">{promotion.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                      {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]} {promotion.code} · {promotionValidity(promotion)}
                    </span>
                    {usedElsewhere && (
                      <span className="mt-1 block text-[10.5px] font-medium text-brand">
                        Already shown in another column — selecting moves it here
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="py-4 text-center text-[12px] text-muted-foreground">No promotions match.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
