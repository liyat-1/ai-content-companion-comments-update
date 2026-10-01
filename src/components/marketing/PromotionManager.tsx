import { useMemo, useState } from "react";
import { Check, Gift, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mutate, useMarketing, type AudienceKey, type CampaignGroup } from "@/lib/marketing";

type Target = { campaignId: string | "global"; audience: AudienceKey };

export function PromotionManager({ open, group, onClose }: { open: boolean; group: CampaignGroup; onClose: () => void }) {
  const { campaigns, promotions } = useMarketing();
  const list = campaigns.filter((campaign) => campaign.group === group);
  const [targets, setTargets] = useState<Target[]>([]);
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((promotion) => !q || `${promotion.name} ${promotion.detail} ${promotion.code}`.toLowerCase().includes(q));
  }, [promotions, query]);
  const has = (campaignId: Target["campaignId"], audience: AudienceKey) => targets.some((target) => target.campaignId === campaignId && target.audience === audience);
  const toggle = (campaignId: Target["campaignId"], audience: AudienceKey) => setTargets((current) => has(campaignId, audience) ? current.filter((target) => target.campaignId !== campaignId || target.audience !== audience) : [...current, { campaignId, audience }]);
  const apply = () => {
    mutate((draft) => targets.forEach((target) => {
      if (target.campaignId === "global") {
        draft.globalPromotions[target.audience] = promotionId;
        return;
      }
      const campaign = draft.campaigns.find((item) => item.id === target.campaignId);
      if (!campaign) return;
      campaign.variants[target.audience].promotionMode = promotionId ? "custom" : "none";
      campaign.variants[target.audience].promotionId = promotionId;
    }));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[88vh] max-w-5xl flex-col gap-0 overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Manage promotions</DialogTitle>
          <DialogDescription>Select invite audiences, choose one promotion, then apply once.</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 flex-1 md:grid-cols-[1.15fr_0.85fr]">
          <section className="min-h-0 overflow-y-auto border-b border-border p-4 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-[13px] font-semibold text-card-foreground">Invites</h3><span className="text-[11px] text-muted-foreground">{targets.length} selected</span></div>
            <div className="mb-3 rounded-md border border-brand/20 bg-brand-soft p-3">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-card-foreground"><Users size={14} className="text-brand" />Global guest defaults</p>
              <div className="mt-2 flex gap-2">{(["direct", "ota"] as AudienceKey[]).map((audience) => <Button key={audience} type="button" size="sm" variant={has("global", audience) ? "brand" : "outline"} onClick={() => toggle("global", audience)}>{audience === "direct" ? "Direct guests" : "OTA guests"}</Button>)}</div>
            </div>
            <div className="space-y-2">{list.map((campaign) => <div key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5"><span className="text-[12.5px] font-semibold text-card-foreground">{campaign.name}</span><div className="flex gap-1.5">{(["direct", "ota"] as AudienceKey[]).map((audience) => <Button key={audience} type="button" size="sm" variant={has(campaign.id, audience) ? "brand" : "outline"} onClick={() => toggle(campaign.id, audience)}>{audience === "direct" ? "Direct" : "OTA"}</Button>)}</div></div>)}</div>
          </section>
          <section className="flex min-h-[360px] flex-col overflow-hidden p-4">
            <h3 className="text-[13px] font-semibold text-card-foreground">Promotion</h3>
            <div className="relative mt-3"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search promotions" className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" /></div>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              <button onClick={() => setPromotionId(null)} className={`flex w-full items-center gap-3 rounded-md border p-3 text-left ${promotionId === null ? "border-brand bg-brand-soft" : "border-border bg-background"}`}><span className="grid size-8 place-items-center rounded-md bg-muted"><Gift size={15} /></span><span className="text-[12.5px] font-semibold">No promotion</span>{promotionId === null && <Check size={14} className="ml-auto text-brand" />}</button>
              {results.map((promotion) => <button key={promotion.id} onClick={() => setPromotionId(promotion.id)} className={`flex w-full items-start gap-3 rounded-md border p-3 text-left ${promotionId === promotion.id ? "border-brand bg-brand-soft" : "border-border bg-background hover:border-brand/40"}`}><span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-brand"><Gift size={15} /></span><span className="min-w-0 flex-1"><span className="block text-[12.5px] font-semibold text-card-foreground">{promotion.name}</span><span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{promotion.detail}</span></span>{promotionId === promotion.id && <Check size={14} className="shrink-0 text-brand" />}</button>)}
            </div>
          </section>
        </div>
        <DialogFooter className="border-t border-border px-5 py-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="brand" disabled={!targets.length} onClick={apply}><Check size={14} />Apply promotion</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}