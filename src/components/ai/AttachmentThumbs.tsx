import { FileSpreadsheet, FileText, Film, Presentation, X } from "lucide-react";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";

const extOf = (name: string) => name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";

function FileIcon({ name }: { name: string }) {
  const e = extOf(name).toLowerCase();
  if (["csv", "tsv", "xls", "xlsx", "xlsm", "ods"].includes(e)) return <FileSpreadsheet size={18} className="text-brand" />;
  if (["ppt", "pptx"].includes(e)) return <Presentation size={18} className="text-brand" />;
  return <FileText size={18} className="text-brand" />;
}

/** Thumbnail tile: real preview for images/video, labelled tile for documents. */
export function Thumb({ name, mediaType, url, onRemove, size = 64 }: { name: string; mediaType?: string; url?: string; onRemove?: () => void; size?: number }) {
  const isImage = mediaType?.startsWith("image/") && url;
  const isVideo = mediaType?.startsWith("video/");
  return (
    <div className="group relative shrink-0" style={{ width: isImage || isVideo ? size : undefined }}>
      {isImage ? (
        <img src={url} alt={name} className="rounded-md border border-border object-cover" style={{ width: size, height: size }} />
      ) : isVideo ? (
        <div className="relative overflow-hidden rounded-md border border-border bg-muted" style={{ width: size, height: size }}>
          {!url ? <span className="grid size-full place-items-center text-muted-foreground"><Film size={20} /></span> : url.startsWith("data:image") ? <img src={url} alt={name} className="size-full object-cover" /> : <video src={url} muted preload="metadata" className="size-full object-cover" />}
          <span className="absolute bottom-1 left-1 grid size-5 place-items-center rounded-sm bg-foreground/70 text-background"><Film size={11} /></span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 pl-2 pr-3" style={{ height: size }}>
          <span className="grid size-9 place-items-center rounded-md bg-card shadow-card"><FileIcon name={name} /></span>
          <span className="min-w-0"><span className="block max-w-32 truncate text-[11.5px] font-medium text-card-foreground">{name}</span><span className="block text-[10px] text-muted-foreground">{extOf(name)}</span></span>
        </div>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-card hover:text-foreground">
          <X size={11} />
        </button>
      )}
    </div>
  );
}

export function ComposerThumbs() {
  const { files, remove } = usePromptInputAttachments();
  if (!files.length) return null;
  return (
    <div className="flex gap-2.5 overflow-x-auto px-3 pb-1 pt-3">
      {files.map((f) => <Thumb key={f.id} name={f.filename ?? "Attachment"} mediaType={f.mediaType} url={f.url} onRemove={() => remove(f.id)} />)}
    </div>
  );
}

export type SentFile = { name: string; mediaType: string; preview?: string };

export function SentThumbs({ files }: { files?: SentFile[] }) {
  if (!files?.length) return null;
  return <div className="mb-1.5 flex flex-wrap justify-end gap-2">{files.map((f, i) => <Thumb key={i} name={f.name} mediaType={f.mediaType} url={f.preview} size={56} />)}</div>;
}
