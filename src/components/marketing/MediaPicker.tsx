import { useRef, useState } from "react";
import { X, Image as ImageIcon, Film, FileText, Search, Check, Play, Upload, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mutate, uid, useMarketing, type MediaItem, type MediaType } from "@/lib/marketing";

export const TYPE_ICON: Record<MediaType, React.ComponentType<{ size?: number; className?: string }>> = {
  image: ImageIcon,
  video: Film,
  document: FileText,
};

const extOf = (name: string) => (name.split(".").pop() ?? "file").toUpperCase();

const DOC_TONE: Record<string, string> = {
  PDF: "#dc2626",
  DOC: "#2563eb",
  DOCX: "#2563eb",
  XLS: "#16a34a",
  XLSX: "#16a34a",
  CSV: "#15803d",
  PPT: "#ea580c",
  PPTX: "#ea580c",
};

/** Clean asset thumbnail used consistently across the library and editors. */
export function MediaThumb({ item, className = "" }: { item: MediaItem; className?: string }) {
  if (item.type === "image" && item.url) {
    return (
      <img
        src={item.url}
        alt={item.name}
        loading="lazy"
        className={`block size-full object-cover ${className}`}
      />
    );
  }

  if (item.type === "video") {
    const poster = item.poster ?? item.url;
    return (
      <div className={`group/thumb relative size-full overflow-hidden bg-foreground ${className}`}>
        {poster ? (
          poster === item.url ? (
            <video
              src={item.url}
              muted
              playsInline
              preload="metadata"
              className="size-full object-cover"
            />
          ) : (
            <img src={poster} alt={item.name} loading="lazy" className="size-full object-cover" />
          )
        ) : (
          <div className="grid size-full place-items-center bg-secondary text-muted-foreground">
            <Film size={28} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/5 to-transparent" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-9 place-items-center rounded-full bg-background/92 text-foreground shadow-lg ring-1 ring-border transition-transform duration-200 group-hover/thumb:scale-110">
            <Play size={14} className="ml-0.5 fill-current" />
          </span>
        </span>
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-background backdrop-blur-sm">
          <Film size={9} /> Video · {extOf(item.name)}
        </span>
      </div>
    );
  }

  const ext = extOf(item.name);
  const tone = DOC_TONE[ext] ?? "#52525b";
  return (
    <div className={`relative grid size-full place-items-center overflow-hidden bg-muted p-3 ${className}`}>
      <div className="relative h-full w-[68%] max-w-[96px] overflow-hidden rounded-sm bg-card shadow-md ring-1 ring-border/70">
        <div className="h-3.5 w-full" style={{ background: tone }} />
        <div className="absolute right-0 top-3.5 size-3.5" style={{ background: "#e4e4e7", clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
        <div className="space-y-1.5 px-2.5 pt-3">
          <div className="h-1 w-3/4 rounded-sm bg-muted-foreground/35" />
          <div className="h-1 rounded-sm bg-muted-foreground/20" />
          <div className="h-1 rounded-sm bg-muted-foreground/20" />
          <div className="h-1 w-2/3 rounded-sm bg-muted-foreground/20" />
          <div className="h-1 w-1/2 rounded-sm bg-muted-foreground/20" />
        </div>
        <span
          className="absolute bottom-1.5 left-2 rounded px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide text-white"
          style={{ background: tone }}
        >
          {ext}
        </span>
      </div>
    </div>
  );
}

/**
 * Modal media browser. In multi mode it stays open while
 * you keep picking, so several items can be attached in one visit.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  selectedIds = [],
  multi = false,
  types = ["image", "video", "document"],
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  selectedIds?: string[];
  multi?: boolean;
  types?: MediaType[];
}) {
  const { media, folders } = useMarketing();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    mutate((draft) => Array.from(files).forEach((file) => draft.media.unshift({
      id: uid(),
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
      folder: folder ?? folders[0] ?? "Uploads",
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      url: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : undefined,
      addedAt: Date.now(),
    })));
  };

  if (!open) return null;

  const pool = media.filter((m) => types.includes(m.type));
  const query = q.trim().toLowerCase();
  const list = pool
    .filter((m) => (folder ? m.folder === folder : true))
    .filter((m) => m.name.toLowerCase().includes(query));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[82vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-float">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-card-foreground">Media library</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {multi
                ? "Pick as many items as you need — the library stays open."
                : "Choose one item to attach to this message."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 text-muted-foreground"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex gap-2 border-b border-border px-5 py-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search media"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.csv,.xls,.xlsx" className="hidden" onChange={(event) => { upload(event.target.files); event.target.value = ""; }} />
          <Button variant="brand" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} />Upload files</Button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-48 shrink-0 overflow-y-auto border-r border-border bg-secondary/40 p-3 sm:block">
            <p className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Folders</p>
            <button
              onClick={() => setFolder(null)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${folder === null ? "bg-brand text-brand-foreground" : "text-card-foreground hover:bg-accent"}`}
            >
              <FolderOpen size={14} className="shrink-0" />
              <span className="truncate">All media</span>
              <span className="ml-auto text-[10.5px] opacity-70">{pool.length}</span>
            </button>
            {folders.map((name) => {
              const count = pool.filter((m) => m.folder === name).length;
              const active = folder === name;
              return (
                <button
                  key={name}
                  onClick={() => setFolder(name)}
                  className={`mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${active ? "bg-brand text-brand-foreground" : "text-card-foreground hover:bg-accent"}`}
                >
                  {active ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}
                  <span className="truncate">{name}</span>
                  <span className="ml-auto text-[10.5px] opacity-70">{count}</span>
                </button>
              );
            })}
          </aside>
          <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files); }} className={`grid min-h-[420px] flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-5 transition-colors sm:grid-cols-3 md:grid-cols-4 ${dragging ? "bg-brand-soft" : ""}`}>
            {list.map((m) => {
              const active = selectedIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelect(m);
                    if (!multi) onClose();
                  }}
                  aria-pressed={active}
                  className={`group relative flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-lift ${
                    active ? "border-brand ring-2 ring-brand/25" : "border-border hover:border-brand/45"
                  }`}
                >
                  <div className="h-32 shrink-0 overflow-hidden bg-muted sm:h-36">
                    <MediaThumb item={m} />
                  </div>
                  {active && (
                    <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand text-brand-foreground shadow-md">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <div className="px-2.5 py-2">
                    <p className="truncate text-[12.5px] font-medium text-card-foreground">{m.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {m.folder} · {m.size}
                    </p>
                  </div>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="col-span-full py-10 text-center text-[13px] text-muted-foreground">No media found.</p>
            )}
          </div>
        </div>

        {multi && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-[12.5px] text-muted-foreground">
              {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"} attached
            </p>
            <Button onClick={onClose} size="sm">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
