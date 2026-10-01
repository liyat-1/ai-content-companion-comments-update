import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type MarketingCampaign } from "@/lib/marketing";

export function EditCampaignDialog({ campaign, open, onClose, onContinue }: { campaign: MarketingCampaign | null; open: boolean; onClose: () => void; onContinue: () => void }) {
  if (!campaign) return null;
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden border-warning/35 bg-card p-0 shadow-float">
        <DialogHeader className="bg-warning-soft px-5 py-5 pr-12 text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-warning text-warning-foreground"><AlertTriangle size={20} /></span>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-warning">Warning</p>
              <DialogTitle className="mt-0.5 text-[17px]">You’re editing an active message</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-3 text-[13px] leading-relaxed text-card-foreground/80">
            Changes to <strong>{campaign.name}</strong> will be used for future invites. Messages already sent to guests cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="brand" onClick={onContinue}>Continue editing<ArrowRight size={14} /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}