import { useMemo, useRef, useState } from "react";
import { FileText, Film, ImagePlus, Library, Search, Upload, X } from "lucide-react";
import { MediaPicker, MediaThumb } from "./MediaPicker";
import { mutate, uid, useMarketing, type MediaItem, type MediaType } from "@/lib/marketing";
import { Button } from "@/components/ui/button";

/**
 * Inline media attacher: folder chips, search, recently added items and the
 * full library. Supports multiple attachments.
 */
export function MediaStrip({
  ids,
  onChange,
  types = ["image", "video", "document"],
  label = "Attachments",
}: {
  ids: string[];
  onChange: (ids: string[]) => void;
  types?: MediaType[];
  label?: string;
}) {
  const { media, folders } = useMarketing();
  const [q, setQ] = useState("");
  const [lib, setLib] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const pool = useMemo(() => media.filter((m) => types.includes(m.type)), [media, types]);
  const attached = ids.map((id) => pool.find((m) => m.id === id)).filter(Boolean) as MediaItem[];

  const query = q.trim().toLowerCase();
  const suggestions = (
    query ? pool.filter((m) => m.name.toLowerCase().includes(query)) : [...pool].sort((a, b) => b.addedAt - a.addedAt)
  )
    .filter((m) => !ids.includes(m.id))
    .slice(0, 10);

  const toggle = (m: MediaItem) =>
    onChange(ids.includes(m.id) ? ids.filter((x) => x !== m.id) : [...ids, m.id]);

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <span className="text-[12.5px] font-semibold tracking-tight text-card-foreground">{label}</span>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {attached.length > 0 ? `${attached.length} attached` : "Choose existing assets for this message."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setLib(true)} className="shrink-0">
          <Library size={14} />
          Browse library
        </Button>
      </div>

      {attached.length > 0 && (
        <div className="flex flex-wrap gap-3 border-b border-border bg-muted/40 p-3">
          {attached.map((m) => (
            <div
              key={m.id}
              className="relative w-28 overflow-hidden rounded-lg border border-border bg-background shadow-card"
            >
              <div className="aspect-[16/10] bg-muted">
                <MediaThumb item={m} />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                {m.type === "video" ? (
                  <Film size={11} className="shrink-0 text-muted-foreground" />
                ) : m.type === "document" ? (
                  <FileText size={11} className="shrink-0 text-muted-foreground" />
                ) : (
                  <ImagePlus size={11} className="shrink-0 text-muted-foreground" />
                )}
                <p className="truncate text-[11px] font-medium text-card-foreground">{m.name}</p>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onChange(ids.filter((x) => x !== m.id))}
                aria-label={`Remove ${m.name}`}
                className="absolute right-1.5 top-1.5 size-6 rounded-full shadow-card"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search media"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.csv,.xls,.xlsx" className="hidden" onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const added: string[] = [];
          mutate((draft) => files.forEach((file) => { const id = uid(); added.push(id); draft.media.unshift({ id, name: file.name, type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document", folder: folders[0] ?? "Uploads", size: `${Math.max(1, Math.round(file.size / 1024))} KB`, url: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : undefined, addedAt: Date.now() }); }));
          onChange([...ids, ...added]);
          event.target.value = "";
        }} />
        <Button variant="brand" size="sm" className="mt-3 w-full" onClick={() => fileRef.current?.click()}><Upload size={14} />Upload from device</Button>

        <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {query ? "Results" : "Recently added"}
        </p>
        <div className="mt-2 flex max-h-44 gap-2 overflow-x-auto overflow-y-hidden pb-1">
          {suggestions.map((m) => (
            <button
              key={m.id}
              onClick={() => toggle(m)}
              title={`Attach ${m.name}`}
              className="w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-background text-left transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-card"
            >
              <div className="aspect-[4/3] bg-muted">
                <MediaThumb item={m} />
              </div>
              <p className="truncate px-1.5 py-1 text-[10.5px] text-muted-foreground">{m.name}</p>
            </button>
          ))}
          {suggestions.length === 0 && (
            <p className="py-3 text-[12.5px] text-muted-foreground">Nothing else to show here.</p>
          )}
        </div>
      </div>

      <MediaPicker
        open={lib}
        multi
        types={types}
        selectedIds={ids}
        onClose={() => setLib(false)}
        onSelect={toggle}
      />
    </section>
  );
}
