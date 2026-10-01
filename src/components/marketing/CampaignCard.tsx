import { useEffect, useState } from "react";
import { Clock, Ellipsis, FlaskConical, Gift, Mail, MessageSquare, Paperclip, Pencil, Power, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AUDIENCE_LABEL,
  CAMPAIGN_DRAG_TYPE,
  MEDIA_DRAG_TYPE,
  STRATEGY_LABEL,
  attachMediaToCampaign,
  campaignMediaIds,
  campaignPromotionsByAudience,
  detachMediaFromCampaign,
  fullTime,
  initialsOf,
  lastEdit,
  timeAgo,
  useMarketing,
  type MarketingCampaign,
} from "@/lib/marketing";

export function CampaignCard({
  campaign,
  selected = false,
  selectable = false,
  onSelect,
  onToggle,
  onEdit,
  onTest,
  onRevert,
}: {
  campaign: MarketingCampaign;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (value: boolean) => void;
  onToggle: (value: boolean) => void;
  onEdit: () => void;
  onTest: () => void;
  onRevert: () => void;
}) {
  const state = useMarketing();
  const edit = lastEdit(campaign);
  const [mounted, setMounted] = useState(false);
  const [over, setOver] = useState(false);
  useEffect(() => setMounted(true), []);
  const hasCustomization = Object.values(campaign.variants).some((variant) => variant.customization.text || variant.customization.email);
  const promos = campaignPromotionsByAudience(state, campaign);
  const mediaIds = campaignMediaIds(campaign);
  const attached = mediaIds.map((id) => state.media.find((item) => item.id === id)).filter(Boolean) as { id: string; name: string }[];

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(CAMPAIGN_DRAG_TYPE, campaign.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(MEDIA_DRAG_TYPE)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        const id = event.dataTransfer.getData(MEDIA_DRAG_TYPE);
        if (!id) return;
        event.preventDefault();
        setOver(false);
        attachMediaToCampaign(campaign.id, id);
      }}
      className={`flex min-h-[188px] flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lift ${over ? "border-brand ring-2 ring-brand/30" : selected ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-brand/40"}`}
    >
      <div className="flex items-start gap-3 px-4 pt-4">
        {selectable && (
          <input type="checkbox" checked={selected} onChange={(event) => onSelect?.(event.target.checked)} aria-label={`Select ${campaign.name}`} className="mt-1 size-4 shrink-0 accent-brand" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold text-card-foreground">{campaign.name}</h3>
          <p className="mt-1 flex items-start gap-1.5 text-[11.5px] leading-snug text-muted-foreground">
            <Clock size={12} className="mt-[2px] shrink-0 text-brand" />
            <span className="min-w-0">{campaign.timing}</span>
          </p>
        </div>
        <Switch checked={campaign.enabled} onCheckedChange={onToggle} aria-label={`${campaign.enabled ? "Disable" : "Enable"} ${campaign.name}`} />
      </div>

      {(promos.direct || promos.ota) && (
        <div className="mx-4 mt-2 flex flex-wrap gap-1.5">
          {promos.direct && promos.direct.id === promos.ota?.id ? (
            <span className="inline-flex min-w-0 items-center gap-1 rounded-sm bg-brand-soft px-2 py-[3px] text-[10.5px] font-semibold text-brand" title={`${promos.direct.name} · ${promos.direct.detail} · ${promos.direct.code}`}>
              <Gift size={10} className="shrink-0" />
              <span className="truncate">{promos.direct.name}</span>
            </span>
          ) : (
            (["direct", "ota"] as const).map((key) =>
              promos[key] ? (
                <span key={key} className="inline-flex min-w-0 items-center gap-1 rounded-sm bg-brand-soft px-2 py-[3px] text-[10.5px] font-semibold text-brand" title={`${AUDIENCE_LABEL[key]} · ${promos[key]!.name} · ${promos[key]!.code}`}>
                  <Gift size={10} className="shrink-0" />
                  <span className="shrink-0 uppercase tracking-wide opacity-70">{key === "direct" ? "Direct" : "OTA"}</span>
                  <span className="truncate">{promos[key]!.name}</span>
                </span>
              ) : null,
            )
          )}
        </div>
      )}


      <div className="mx-4 mt-3 rounded-md border border-border bg-secondary/50 px-3 py-2">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-card-foreground">
          {campaign.strategy === "text" ? <MessageSquare size={13} className="shrink-0 text-brand" /> : <Mail size={13} className="shrink-0 text-brand" />}
          <span className="truncate">{STRATEGY_LABEL[campaign.strategy]}</span>
        </p>
      </div>

      <div className={`mx-4 mt-2.5 rounded-md border border-dashed px-3 py-2 transition-colors ${over ? "border-brand bg-brand-soft" : "border-border"}`}>
        {attached.length === 0 ? (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Paperclip size={11} className="shrink-0" />
            {over ? "Drop to attach media" : "Drag media here to attach"}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {attached.map((item) => (
              <span key={item.id} className="inline-flex max-w-full items-center gap-1 rounded-sm border border-border bg-background px-2 py-0.5 text-[10.5px] text-card-foreground">
                <Paperclip size={10} className="shrink-0 text-muted-foreground" />
                <span className="max-w-[110px] truncate">{item.name}</span>
                <button type="button" onClick={() => detachMediaFromCampaign(campaign.id, item.id)} aria-label={`Remove ${item.name}`} className="text-muted-foreground hover:text-foreground">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-3">
        {edit && (
          <div className="group relative mx-4 mb-3 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10.5px] text-muted-foreground">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[8.5px] font-semibold text-brand-foreground">{initialsOf(edit.by)}</span>
            <span className="truncate font-medium text-card-foreground">{edit.by}</span>
            <span suppressHydrationWarning>· Updated {mounted ? timeAgo(edit.at) : ""}</span>
            <span className="pointer-events-none absolute bottom-7 left-0 z-10 w-56 rounded-md bg-foreground px-2.5 py-2 text-[11px] leading-snug text-background opacity-0 shadow-lift transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              Edited by {edit.by}{mounted ? ` · ${timeAgo(edit.at)}` : ""}
              <span className="mt-0.5 block text-background/70">{AUDIENCE_LABEL[edit.audience]}{mounted ? ` · ${fullTime(edit.at)}` : ""}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 border-t border-border p-2">
          <Button variant="ghost" size="sm" onClick={onTest} className="shrink-0"><FlaskConical size={13} />Test</Button>
          <Button variant="brand" size="sm" onClick={onEdit} className="min-w-0 flex-1"><Pencil size={13} /><span className="truncate">Edit content</span></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label={`More actions for ${campaign.name}`}><Ellipsis size={16} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled={!hasCustomization} onSelect={onRevert}><RotateCcw size={14} />Revert content to suggested</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onToggle(!campaign.enabled)}><Power size={14} />{campaign.enabled ? "Disable campaign" : "Enable campaign"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
