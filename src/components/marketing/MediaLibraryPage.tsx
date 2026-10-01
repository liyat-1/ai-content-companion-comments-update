import { useRef, useState } from "react";
import { FileUp, Folder, FolderOpen, FolderPlus, Pencil, Search, Trash2, Upload } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { MediaThumb } from "./MediaPicker";
import { mutate, uid, useMarketing, type MediaType } from "@/lib/marketing";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const TYPES: ("all" | MediaType)[] = ["all", "image", "video", "document"];

function typeOf(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

/** Small inline text field used for renaming folders and files. */
function RenameField({
  value,
  onSave,
  onCancel,
  className = "",
}: {
  value: string;
  onSave: (v: string) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const commit = () => {
    const v = draft.trim();
    if (v) onSave(v);
    else onCancel();
  };
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") onCancel();
      }}
      onFocus={(e) => e.currentTarget.select()}
      className={`w-full rounded border border-brand bg-background px-1.5 py-0.5 text-[12.5px] text-foreground outline-none ring-2 ring-brand/20 ${className}`}
    />
  );
}

export function MediaLibraryPage() {
  const { media, folders } = useMarketing();
  const [folder, setFolder] = useState("All");
  const [type, setType] = useState<"all" | MediaType>("all");
  const [q, setQ] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const list = media
    .filter((m) => (folder === "All" ? true : m.folder === folder))
    .filter((m) => (type === "all" ? true : m.type === type))
    .filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.addedAt - a.addedAt);

  const countIn = (f: string) => (f === "All" ? media.length : media.filter((m) => m.folder === f).length);

  const upload = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    if (!arr.length) return;
    const target = folder === "All" ? folders[0] : folder;
    mutate((d) => {
      arr.forEach((f) => {
        d.media.unshift({
          id: uid(),
          name: f.name,
          type: typeOf(f),
          folder: target,
          size: fmtSize(f.size),
          url: f.type.startsWith("image/") || f.type.startsWith("video/") ? URL.createObjectURL(f) : undefined,
          addedAt: Date.now(),
        });
      });
    });
  };

  const createFolder = () => {
    let name = "Untitled folder";
    let i = 2;
    while (folders.includes(name)) name = `Untitled folder ${i++}`;
    mutate((d) => {
      d.folders.push(name);
    });
    setFolder(name);
    setRenamingFolder(name);
  };

  const renameFolder = (from: string, to: string) => {
    if (from === to) return setRenamingFolder(null);
    mutate((d) => {
      if (d.folders.includes(to)) return;
      d.folders = d.folders.map((f) => (f === from ? to : f));
      d.media.forEach((m) => {
        if (m.folder === from) m.folder = to;
      });
    });
    setFolder((cur) => (cur === from ? to : cur));
    setRenamingFolder(null);
  };

  const deleteFolder = (name: string) => {
    mutate((d) => {
      d.folders = d.folders.filter((f) => f !== name);
      d.media = d.media.filter((m) => m.folder !== name);
    });
    setFolder("All");
    setDeleteTarget(null);
  };

  return (
    <MarketingShell title="Media">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Folders</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={createFolder}
              aria-label="New folder"
              title="New folder"
              className="size-7 text-muted-foreground"
            >
              <FolderPlus size={15} />
            </Button>
          </div>

          <button
            onClick={() => setFolder("All")}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${
              folder === "All" ? "bg-brand-soft font-semibold text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Folder size={14} className={folder === "All" ? "text-brand" : "text-muted-foreground"} />
            <span className="flex-1">All media</span>
            <span className="text-[10.5px] tabular-nums text-muted-foreground">{countIn("All")}</span>
          </button>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:block">
           {folders.map((f) => {
            const active = folder === f;
            if (renamingFolder === f) {
              return (
                <div key={f} className="px-2 py-1">
                  <RenameField
                    value={f}
                    onSave={(v) => renameFolder(f, v)}
                    onCancel={() => setRenamingFolder(null)}
                  />
                </div>
              );
            }
            return (
              <div
                key={f}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/media-id");
                  if (id)
                    mutate((d) => {
                      const m = d.media.find((x) => x.id === id);
                      if (m) m.folder = f;
                    });
                }}
                className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] transition-colors ${
                  active ? "bg-brand-soft font-semibold text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <button onClick={() => setFolder(f)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <Folder size={14} className={active ? "text-brand" : "text-muted-foreground"} />
                  <span className="min-w-0 flex-1 truncate">{f}</span>
                  <span className="text-[10.5px] tabular-nums text-muted-foreground">{countIn(f)}</span>
                </button>
                <button
                  onClick={() => setRenamingFolder(f)}
                  aria-label={`Rename ${f}`}
                  className="opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                >
                  <Pencil size={12} />
                </button>
                <button
                   onClick={() => setDeleteTarget(f)}
                  aria-label={`Delete folder ${f}`}
                  className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
           })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={createFolder}
            className="mt-2 w-full border-dashed text-muted-foreground"
          >
            <FolderPlus size={14} />
            New folder
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                {folder === "All" ? <FolderOpen size={19} /> : <Folder size={19} />}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-[16px] font-semibold tracking-tight text-card-foreground">{folder === "All" ? "All media" : folder}</h2>
                <p className="text-[12px] text-muted-foreground">{countIn(folder)} {countIn(folder) === 1 ? "asset" : "assets"}</p>
              </div>
            </div>
            <Button onClick={() => fileRef.current?.click()} size="sm">
              <Upload size={14} />
              Upload files
            </Button>
          </header>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search media"
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-3 flex gap-1 rounded-md bg-muted p-1 text-[12.5px]">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded px-3 py-1.5 font-medium capitalize transition-colors ${
                  type === t ? "bg-card text-card-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All files" : `${t}s`}
              </button>
            ))}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              upload(e.dataTransfer.files);
            }}
            className={`mt-4 rounded-lg border p-4 transition-colors sm:p-5 ${
              dragging ? "border-brand bg-brand-soft" : "border-border bg-card shadow-card"
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="mb-5 h-auto w-full justify-start gap-4 whitespace-normal border-dashed bg-muted/40 px-4 py-4 text-left shadow-none hover:border-brand/60 hover:bg-muted/70 sm:px-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground shadow-card">
                <FileUp size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-foreground">
                  Drop files into {folder === "All" ? folders[0] : folder}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                  Or click to browse images, videos, and documents
                </span>
              </span>
              <span className="hidden rounded-md border border-border bg-background px-3 py-1.5 text-[11.5px] font-medium text-foreground sm:block">
                Choose files
              </span>
            </Button>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {list.map((m) => (
                <div
                  key={m.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/media-id", m.id)}
                  className="group overflow-hidden rounded-lg border border-border bg-card shadow-card transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-lift"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <MediaThumb item={m} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      {renamingItem === m.id ? (
                        <RenameField
                          value={m.name}
                          onSave={(v) => {
                            mutate((d) => {
                              const it = d.media.find((x) => x.id === m.id);
                              if (it) it.name = v;
                            });
                            setRenamingItem(null);
                          }}
                          onCancel={() => setRenamingItem(null)}
                        />
                      ) : (
                        <button
                          onDoubleClick={() => setRenamingItem(m.id)}
                          className="block w-full truncate text-left text-[12.5px] font-medium text-card-foreground"
                          title="Double-click to rename"
                        >
                          {m.name}
                        </button>
                      )}
                      <p className="truncate text-[11px] text-muted-foreground">
                        {m.folder} · {m.size}
                        {m.dims ? ` · ${m.dims}` : ""}
                      </p>
                    </div>
                    <button
                      aria-label={`Rename ${m.name}`}
                      onClick={() => setRenamingItem(m.id)}
                      className="text-muted-foreground/60 transition-colors hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      aria-label={`Delete ${m.name}`}
                      onClick={() =>
                        mutate((d) => {
                          d.media = d.media.filter((x) => x.id !== m.id);
                        })
                      }
                      className="text-muted-foreground/60 transition-colors hover:text-destructive"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="col-span-full grid min-h-44 place-items-center rounded-md border border-dashed border-border bg-muted/25 p-8 text-center">
                  <div>
                    <span className="mx-auto grid size-10 place-items-center rounded-md bg-secondary text-muted-foreground"><FolderPlus size={18} /></span>
                    <p className="mt-3 text-[13px] font-semibold text-foreground">This folder is ready for files</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">Drop them here or use the upload area above.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(value) => !value && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card shadow-float">
          <AlertDialogHeader><AlertDialogTitle>Delete {deleteTarget}?</AlertDialogTitle><AlertDialogDescription>This folder and every file inside it will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && deleteFolder(deleteTarget)}>Delete folder</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MarketingShell>
  );
}
