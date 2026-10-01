import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MarketingCampaign } from "@/lib/marketing";

export function ConfirmRevertDialog({ open, campaignName, onClose, onConfirm }: { open: boolean; campaignName?: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent className="border-border bg-card shadow-float">
        <AlertDialogHeader>
          <AlertDialogTitle>Revert content to suggested?</AlertDialogTitle>
          <AlertDialogDescription>
            {campaignName
              ? `Customized content for ${campaignName} will be replaced with Directful’s suggested content. Other campaigns, promotions, templates, and channel strategies will not change.`
              : "This will restore Directful’s suggested content for campaigns that have been customized. Promotions, templates, and channel strategies will not change."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={onConfirm}>Revert</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TestCampaignDialog({ campaign, open, onClose }: { campaign: MarketingCampaign | null; open: boolean; onClose: () => void }) {
  const [channel, setChannel] = useState<"text" | "email">("text");
  const [recipient, setRecipient] = useState("");
  const [sent, setSent] = useState(false);
  if (!campaign) return null;
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Test {campaign.name}</DialogTitle>
          <DialogDescription>Send a preview without changing or activating this campaign.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
            {(["text", "email"] as const).map((value) => (
              <button key={value} disabled={value === "email" && campaign.strategy === "text"} onClick={() => setChannel(value)} className={`flex items-center justify-center gap-1.5 rounded px-3 py-2 text-[12.5px] font-medium ${channel === value ? "bg-card text-card-foreground shadow-card" : "text-muted-foreground disabled:opacity-40"}`}>
                {value === "text" ? <MessageSquare size={14} /> : <Mail size={14} />}{value === "text" ? "Text" : "Email"}
              </button>
            ))}
          </div>
          <label className="block text-[11.5px] font-semibold text-muted-foreground">
            {channel === "text" ? "Mobile number" : "Email address"}
            <input value={recipient} onChange={(event) => { setRecipient(event.target.value); setSent(false); }} placeholder={channel === "text" ? "+1 212 555 0123" : "name@hotel.com"} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          </label>
          {sent && <p className="rounded-md bg-brand-soft px-3 py-2 text-[12px] font-medium text-brand">Test sent successfully.</p>}
        </div>
        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="brand" disabled={!recipient.trim()} onClick={() => setSent(true)}><Send size={14} />Send test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}