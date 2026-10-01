import { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileStack, GripVertical, Info, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { MediaThumb } from "./MediaPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BulkDragChips } from "./BulkDragChips";
import {
  CAMPAIGN_BULK_DRAG_TYPE,
  CAMPAIGN_DRAG_TYPE,
  attachMediaToCampaign,
  audienceMediaIds,
  detachMediaFromCampaign,
  mutate,
  uid,
  useMarketing,
  type AudienceKey,
  type BulkScope,
  type MarketingCampaign,
  type MediaItem,
  type MediaType,
  type MessageChannel,
} from "@/lib/marketing";

const AUDIENCE_KEYS: AudienceKey[] = ["direct", "ota"];
const STORAGE_KEY = "directful.media-slots-v1";

type Slots = Record<MessageChannel, (string | null)[]>;

function typeOf(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

function loadSlots(media: MediaItem[]): Slots {
  const seed = () => Array.from({ length: 3 }, (_, i) => media[i]?.id ?? null);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Slots;
      if (parsed && Array.isArray(parsed.text) && Array.isArray(parsed.email)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { text: seed(), email: seed() };
}

const TYPE_LABEL: Record<MediaType, string> = { image: "Image", video: "Video", document: "Document" };

/** A campaign attached to one file: which guest segments receive it. */
function SegmentChecks({
  campaign,
  mediaId,
  channel,
  onToggle,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  campaign: MarketingCampaign;
  mediaId: string;
  channel: MessageChannel;
  onToggle: (audience: AudienceKey, value: boolean) => void;
  onRemove: () => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
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
        const checked = audienceMediaIds(campaign, audience, channel).includes(mediaId);
        return (
          <label
            key={audience}
            className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              checked ? "border-brand/50 bg-brand-soft text-brand" : "border-border text-muted-foreground hover:border-brand/40"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
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
        aria-label={`Remove ${campaign.name} from this file`}
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X size={11} />
      </button>
    </div>
  );
}

/**
 * Media assignment board built on the same model as promotions: a fixed column
 * of campaigns with nothing attached, beside a horizontally scrollable row of
 * file columns. Each column holds one library file (swap it with Change file)
 * and campaigns are dragged in, with Direct/OTA checkboxes per campaign.
 */
export function MediaAssignOverlay({
  campaigns,
  onClose,
}: {
  campaigns: MarketingCampaign[];
  onClose: () => void;
}) {
  const { media, folders } = useMarketing();
  const [channel, setChannel] = useState<MessageChannel>("text");
  const [slots, setSlots] = useState<Slots>(() => loadSlots(media));
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [picker, setPicker] = useState<number | null>(null);
  const [bulk, setBulk] = useState<BulkScope | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    } catch {
      /* ignore */
    }
  }, [slots]);

  const columns = slots[channel];
  const setColumns = (fn: (current: (string | null)[]) => (string | null)[]) =>
    setSlots((current) => ({ ...current, [channel]: fn(current[channel]) }));

  const itemById = (id: string | null) => (id ? media.find((m) => m.id === id) ?? null : null);

  const campaignsOn = (mediaId: string) =>
    campaigns.filter((c) => AUDIENCE_KEYS.some((a) => audienceMediaIds(c, a, channel).includes(mediaId)));

  const unattached = campaigns.filter((c) =>
    AUDIENCE_KEYS.every((a) => audienceMediaIds(c, a, channel).length === 0),
  );

  const beginDrag = (event: React.DragEvent, campaignId: string) => {
    event.dataTransfer.setData(CAMPAIGN_DRAG_TYPE, campaignId);
    event.dataTransfer.setData("text/plain", campaignId);
    event.dataTransfer.effectAllowed = "move";
    setDragging(campaignId);
  };

  const allow = (event: React.DragEvent) => {
    const types = event.dataTransfer.types;
    if (!dragging && !bulk && !types.includes(CAMPAIGN_DRAG_TYPE) && !types.includes(CAMPAIGN_BULK_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const draggedScope = (event: React.DragEvent): BulkScope | null =>
    (event.dataTransfer.getData(CAMPAIGN_BULK_DRAG_TYPE) as BulkScope) || bulk;

  const draggedId = (event: React.DragEvent) => {
    if (draggedScope(event)) return null;
    const plain = event.dataTransfer.getData("text/plain");
    return event.dataTransfer.getData(CAMPAIGN_DRAG_TYPE) || (plain.startsWith("bulk:") ? "" : plain) || dragging;
  };

  const audiencesOf = (scope: BulkScope): AudienceKey[] => (scope === "both" ? AUDIENCE_KEYS : [scope]);

  /** Attach one file to every free campaign of a collection at once. */
  const dropCollection = (scope: BulkScope, mediaId: string) => {
    const audiences = audiencesOf(scope);
    campaigns
      .filter((c) => audiences.every((a) => !audienceMediaIds(c, a, channel).includes(mediaId)))
      .forEach((c) => attachMediaToCampaign(c.id, mediaId, audiences, channel));
  };

  /** Detach every file of this channel for a whole collection. */
  const clearCollection = (scope: BulkScope) => {
    const audiences = audiencesOf(scope);
    campaigns.forEach((c) =>
      audiences.forEach((a) =>
        audienceMediaIds(c, a, channel).forEach((id) => detachMediaFromCampaign(c.id, id, [a], channel)),
      ),
    );
  };

  /** Remove every file of this channel from a campaign. */
  const clearCampaign = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    AUDIENCE_KEYS.forEach((audience) =>
      audienceMediaIds(campaign, audience, channel).forEach((id) =>
        detachMediaFromCampaign(campaignId, id, [audience], channel),
      ),
    );
  };

  const upload = (files: FileList | File[] | null) => {
    const arr = Array.from(files ?? []);
    if (!arr.length) return;
    const ids: string[] = [];
    mutate((draft) =>
      arr.forEach((file) => {
        const id = uid();
        ids.push(id);
        draft.media.unshift({
          id,
          name: file.name,
          type: typeOf(file),
          folder: folders[0] ?? "Uploads",
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          url: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : undefined,
          addedAt: Date.now(),
        });
      }),
    );
    return ids[0] ?? null;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Media</p>
          <h2 className="truncate text-[17px] font-semibold text-card-foreground">Attach media to campaigns</h2>
          <p className="truncate text-[11.5px] text-muted-foreground">
            Drag campaigns onto a file, then choose which guest segments receive it.
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={onClose}>
          Done
        </Button>
      </header>

      <div className="flex gap-1 border-b border-border bg-card px-4 pt-2 sm:px-6">
        {(["text", "email"] as MessageChannel[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            aria-pressed={channel === c}
            className={`rounded-t-md border-b-2 px-4 py-2 text-[12.5px] font-semibold transition-colors ${
              channel === c ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {c === "text" ? "Text" : "Email"}
          </button>
        ))}
      </div>

      <p className="flex items-start gap-2 border-b border-border bg-brand-soft/50 px-4 py-2 text-[11.5px] text-muted-foreground sm:px-6">
        <Info size={13} className="mt-[1px] shrink-0 text-brand" />
        {channel === "text"
          ? "These files travel with the text message. Scroll sideways for more files, or add another file column."
          : "These images are placed inside the email content. Scroll sideways for more files, or add another file column."}
      </p>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your files</p>
          <p className="text-[11px] text-muted-foreground">Drag campaigns into a file · scroll for more files</p>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 gap-4">
          {/* Fixed campaign column */}
          <section
            onDragOver={(event) => { allow(event); setOver(-1); }}
            onDragLeave={() => setOver((c) => (c === -1 ? null : c))}
            onDrop={(event) => {
              event.preventDefault();
              const scope = draggedScope(event);
              if (scope) clearCollection(scope);
              else {
                const id = draggedId(event);
                if (id) clearCampaign(id);
              }
              setOver(null);
              setDragging(null);
              setBulk(null);
            }}
            className={`flex w-[250px] shrink-0 flex-col rounded-xl border p-4 transition-colors sm:w-[270px] ${
              over === -1 ? "border-brand bg-brand-soft" : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-2 border-b border-border pb-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <FileStack size={15} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-card-foreground">No file attached</p>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  {unattached.length} campaigns with no {channel === "text" ? "text" : "email"} media
                </p>
              </div>
            </div>
            <BulkDragChips
              count={unattached.length}
              onDragStart={(scope) => setBulk(scope)}
              onDragEnd={() => { setBulk(null); setOver(null); }}
            />
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
              {unattached.map((campaign) => (
                <article
                  key={campaign.id}
                  draggable
                  onDragStart={(event) => beginDrag(event, campaign.id)}
                  onDragEnd={() => { setDragging(null); setOver(null); }}
                  className={`flex cursor-grab items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2.5 shadow-sm transition-shadow hover:shadow active:cursor-grabbing ${dragging === campaign.id ? "opacity-50" : ""}`}
                >
                  <GripVertical size={12} className="shrink-0 text-muted-foreground/60" />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-card-foreground">{campaign.name}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">{campaign.timing}</p>
                  </div>
                </article>
              ))}
              {unattached.length === 0 && (
                <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
                  Drop here to remove every file
                </p>
              )}
            </div>
          </section>

          {/* Horizontally scrollable file columns */}
          <div className="flex min-h-0 min-w-0 flex-1 gap-4 overflow-x-auto pb-1">
            {columns.map((mediaId, index) => {
              const item = itemById(mediaId);
              const assigned = item ? campaignsOn(item.id) : [];
              return (
                <section
                  key={index}
                  onDragOver={(event) => { allow(event); setOver(index); }}
                  onDragLeave={() => setOver((c) => (c === index ? null : c))}
                  onDrop={(event) => {
                    event.preventDefault();
                    const scope = draggedScope(event);
                    setOver(null);
                    setDragging(null);
                    setBulk(null);
                    if (scope) {
                      if (item) dropCollection(scope, item.id);
                      return;
                    }
                    const id = draggedId(event);
                    if (id && item) attachMediaToCampaign(id, item.id, AUDIENCE_KEYS, channel);
                  }}
                  className={`flex w-[290px] shrink-0 flex-col rounded-xl border p-4 transition-colors ${
                    over === index
                      ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                      : item
                        ? "border-brand/30 bg-brand-soft/30"
                        : "border-dashed border-border bg-card"
                  }`}
                >
                  {item ? (
                    <>
                      <div className="border-b border-border pb-2.5">
                        <div className="flex items-start gap-2">
                          <span className="size-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                            <MediaThumb item={item} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px] font-semibold text-card-foreground">{item.name}</p>
                            <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                              {TYPE_LABEL[item.type]} · {assigned.length} campaign{assigned.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPicker(index)}
                            className="flex-1 rounded-sm border border-brand/40 bg-background px-2 py-1 text-[10.5px] font-semibold text-brand transition-colors hover:bg-brand-soft"
                          >
                            Change file
                          </button>
                          <button
                            type="button"
                            onClick={() => setColumns((current) => current.map((v, i) => (i === index ? null : v)))}
                            className="flex-1 rounded-sm border border-border bg-background px-2 py-1 text-[10.5px] font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                          >
                            Clear column
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
                        {assigned.map((campaign) => (
                          <SegmentChecks
                            key={campaign.id}
                            campaign={campaign}
                            mediaId={item.id}
                            channel={channel}
                            onToggle={(audience, value) =>
                              value
                                ? attachMediaToCampaign(campaign.id, item.id, [audience], channel)
                                : detachMediaFromCampaign(campaign.id, item.id, [audience], channel)
                            }
                            onRemove={() => detachMediaFromCampaign(campaign.id, item.id, AUDIENCE_KEYS, channel)}
                            onDragStart={(event) => beginDrag(event, campaign.id)}
                            onDragEnd={() => { setDragging(null); setOver(null); }}
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
                      <p className="text-[12px] font-medium text-muted-foreground">Empty file column</p>
                      <Button variant="outline" size="sm" onClick={() => setPicker(index)}>
                        Browse library
                      </Button>
                      {columns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setColumns((current) => current.filter((_, i) => i !== index))}
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
              onClick={() => setColumns((current) => [...current, null])}
              className="flex w-[150px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
            >
              <Plus size={16} />
              <span className="text-[11.5px] font-medium">Add file</span>
            </button>
          </div>
        </div>
      </div>

      <MediaSlotPicker
        open={picker !== null}
        media={media}
        activeIds={columns}
        onUpload={upload}
        onClose={() => setPicker(null)}
        onSelect={(id) => {
          if (picker !== null) setColumns((current) => current.map((v, i) => (i === picker ? id : v)));
          setPicker(null);
        }}
      />
    </div>
  );
}

/** Library chooser for which file occupies a column, with upload. */
function MediaSlotPicker({
  open,
  media,
  activeIds,
  onUpload,
  onClose,
  onSelect,
}: {
  open: boolean;
  media: MediaItem[];
  activeIds: (string | null)[];
  onUpload: (files: FileList | File[] | null) => string | null | undefined;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...media]
      .filter((m) => !q || `${m.name} ${m.folder}`.toLowerCase().includes(q))
      .sort((a, b) => b.addedAt - a.addedAt);
  }, [media, query]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden border-border bg-card p-0 shadow-float">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="text-[16px]">Choose a file</DialogTitle>
          <DialogDescription>Pick a file from the library, or upload a new one.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search media"
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={13} />
              Upload
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.csv,.xls,.xlsx"
              className="hidden"
              onChange={(event) => {
                const id = onUpload(event.target.files);
                event.target.value = "";
                if (id) onSelect(id);
              }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {list.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`overflow-hidden rounded-md border text-left transition-colors hover:border-brand/50 ${
                  activeIds.includes(item.id) ? "border-brand/60 bg-brand-soft/40" : "border-border bg-background"
                }`}
              >
                <span className="block h-20 bg-muted">
                  <MediaThumb item={item} />
                </span>
                <span className="block truncate px-2 py-1.5 text-[11px] text-muted-foreground">{item.name}</span>
              </button>
            ))}
            {list.length === 0 && (
              <p className="col-span-full py-4 text-center text-[12px] text-muted-foreground">No media matches.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
