import { useRef, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { calendar, parseCsv } from "@/lib/calendar";

/** Guided calendar upload: drag-and-drop or local file pick, then straight to Events & Holidays. */
export function CalendarUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [stage, setStage] = useState<"idle" | "processing" | "done">("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handle = async (picked?: File | null) => {
    if (!picked) return;
    if (!/\.csv$/i.test(picked.name)) { setError(`${picked.name} is a spreadsheet — export it as CSV (columns name,start,end,type,location) and try again.`); return; }
    setError(""); setFileName(picked.name); setStage("processing");
    await new Promise((resolve) => setTimeout(resolve, 900));
    const rows = parseCsv(await picked.text());
    if (!rows.length) { setError(`No usable rows in ${picked.name}. Use columns name,start,end,type,location.`); setStage("idle"); return; }
    calendar.importRows(rows);
    setCount(rows.length);
    setStage("done");
  };

  const reset = () => { setStage("idle"); setFileName(""); setCount(0); setError(""); setDragging(false); };
  const close = (v: boolean) => { if (!v) reset(); onOpenChange(v); };
  const finish = () => { close(false); void navigate({ to: "/content/events" }); };

  return <Dialog open={open} onOpenChange={close}>
    <DialogContent aria-label="Upload your calendar">
      <DialogHeader>
        <DialogTitle>Upload your events calendar</DialogTitle>
        <DialogDescription>Add the events your hotel already tracks so Directful AI can localize content around them.</DialogDescription>
      </DialogHeader>
      {stage === "done" ? <div className="flex flex-col items-center py-4 text-center"><span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand"><CheckCircle2 size={24} /></span><p className="mt-3 text-[14px] font-semibold text-card-foreground">Added {count} {count === 1 ? "event" : "events"} from {fileName}</p><p className="mt-1 text-[12px] text-muted-foreground">Your calendar now feeds every AI content plan.</p><Button variant="brand" className="mt-4" onClick={finish}>Open Events &amp; Holidays</Button></div>
      : stage === "processing" ? <div className="flex flex-col items-center py-8 text-center"><Loader2 className="animate-spin text-brand" size={26} /><p className="mt-3 text-[13px] font-semibold text-card-foreground">Reading {fileName}…</p><p className="mt-1 text-[11.5px] text-muted-foreground">Matching rows to events, holidays and seasons.</p></div>
      : <div className="space-y-3">
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void handle(e.dataTransfer.files?.[0]); }}
            className={`grid cursor-pointer place-items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${dragging ? "border-brand bg-brand-soft/40" : "border-border hover:border-brand/50 hover:bg-brand-soft/20"}`}
            onClick={() => file.current?.click()} role="button" aria-label="Choose a calendar file" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && file.current?.click()}>
            <span className="grid size-11 place-items-center rounded-md bg-brand-soft text-brand"><Upload size={20} /></span>
            <p className="text-[13px] font-semibold text-card-foreground">Drag and drop your calendar file here</p>
            <p className="text-[11.5px] text-muted-foreground">or <span className="font-semibold text-brand">browse from your local machine</span></p>
            <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-muted-foreground"><FileSpreadsheet size={12} />CSV · columns: name, start, end, type, location</p>
          </div>
          {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11.5px] text-destructive">{error}</p>}
          <input ref={file} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ""; }} />
        </div>}
    </DialogContent>
  </Dialog>;
}
