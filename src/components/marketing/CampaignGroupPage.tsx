import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, MessageSquareText, RotateCcw } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { CampaignCard } from "./CampaignCard";
import { CampaignEditor } from "./CampaignEditor";
import { EditCampaignDialog } from "./EditCampaignDialog";
import { ConfirmRevertDialog, TestCampaignDialog } from "./MarketingDialogs";
import { MarketingTools } from "./MarketingTools";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  GROUP_META,
  defaultVariant,
  mutate,
  useMarketing,
  type CampaignGroup,
} from "@/lib/marketing";

export function CampaignGroupPage({ group }: { group: CampaignGroup }) {
  const state = useMarketing();
  const { campaigns } = state;
  const meta = GROUP_META[group];
  const list = campaigns.filter((campaign) => campaign.group === group);
  const [editing, setEditing] = useState<string | null>(null);
  const [editConfirm, setEditConfirm] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [revertTarget, setRevertTarget] = useState<string | "global" | null>(null);
  const allEnabled = list.length > 0 && list.every((campaign) => campaign.enabled);
  const activeCampaign = campaigns.find((campaign) => campaign.id === editConfirm) ?? null;

  const resetCampaign = (id: string) => mutate((draft) => {
    const campaign = draft.campaigns.find((item) => item.id === id);
    if (!campaign) return;
    campaign.variants.direct = defaultVariant(id, "direct");
    campaign.variants.ota = defaultVariant(id, "ota");
  });

  return (
    <MarketingShell title="Marketing messages">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <nav aria-label="Marketing message sections" className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
          {[
            { label: "Automated invites", to: "/marketing/invites" as const, active: group === "invites" },
            { label: "Automated transactional", to: "/marketing/transactional" as const, active: group === "transactional" },
            { label: "Promotions", to: "/marketing/promotions" as const, active: false },
            { label: "Drip campaign", to: "/campaign" as const, active: false },
          ].map((item) => (
            <Link key={item.to} to={item.to} className={`shrink-0 border-b-2 px-3 py-2 text-[12.5px] font-medium ${item.active ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{item.label}</Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Automated guest communications</p>
            <h2 className="mt-1 text-[22px] font-semibold text-foreground">{meta.title}</h2>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{meta.desc}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Copy size={14} />Copy from...</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => list.forEach((campaign) => resetCampaign(campaign.id))}>Directful suggested setup</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => list.forEach((campaign) => resetCampaign(campaign.id))}>Sister property defaults</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand/20 bg-brand-soft px-4 py-3">
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-brand"><MessageSquareText size={16} /></span><p className="text-[12.5px] text-card-foreground">You have <strong>3000 complimentary texts</strong> available for a drip campaign.</p></div>
          <Button asChild variant="outline" size="sm"><Link to="/campaign">Create a drip campaign</Link></Button>
        </div>

        <div className="mt-5">
          <MarketingTools campaigns={list} />
        </div>

        <section className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div><h3 className="text-[15px] font-semibold text-foreground">{meta.title}</h3><p className="text-[11.5px] text-muted-foreground">{list.filter((campaign) => campaign.enabled).length} active · {list.length} total</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRevertTarget("global")}><RotateCcw size={14} />Revert to suggested content</Button>
              <Button variant="outline" size="sm" onClick={() => mutate((draft) => draft.campaigns.forEach((campaign) => { if (campaign.group === group) campaign.enabled = !allEnabled; }))}>{allEnabled ? "Disable all" : "Enable all campaigns"}</Button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 pb-16 md:grid-cols-2 xl:grid-cols-3">
            {list.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onToggle={(value) => mutate((draft) => { const item = draft.campaigns.find((candidate) => candidate.id === campaign.id); if (item) item.enabled = value; })}
                onEdit={() => setEditConfirm(campaign.id)}
                onTest={() => setTesting(campaign.id)}
                onRevert={() => setRevertTarget(campaign.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <EditCampaignDialog campaign={activeCampaign} open={Boolean(editConfirm)} onClose={() => setEditConfirm(null)} onContinue={() => { const id = editConfirm; setEditConfirm(null); if (id) setEditing(id); }} />
      {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
      <TestCampaignDialog campaign={campaigns.find((campaign) => campaign.id === testing) ?? null} open={Boolean(testing)} onClose={() => setTesting(null)} />
      <ConfirmRevertDialog open={Boolean(revertTarget)} campaignName={revertTarget && revertTarget !== "global" ? campaigns.find((campaign) => campaign.id === revertTarget)?.name : undefined} onClose={() => setRevertTarget(null)} onConfirm={() => { if (revertTarget === "global") list.forEach((campaign) => resetCampaign(campaign.id)); else if (revertTarget) resetCampaign(revertTarget); setRevertTarget(null); }} />
    </MarketingShell>
  );
}
