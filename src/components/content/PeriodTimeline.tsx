import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { buildPeriods, fmtRange, isCurrent, useCalendar, type ContentPeriod, type PeriodKind } from "@/lib/calendar";

const KIND_STYLE: Record<PeriodKind, string> = {
  Standard: "bg-muted text-muted-foreground",
  "Event-based": "bg-brand-soft text-brand",
  Seasonal: "bg-accent text-accent-foreground",
};

export function PeriodKindBadge({ kind }: { kind: PeriodKind }) {
  return <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${KIND_STYLE[kind]}`}>{kind}</span>;
}

/** Published content as a timeline of content periods; the period containing today is Current. */
export function PeriodTimeline({ from = "2026-09-01", to = "2026-12-31" }: { from?: string; to?: string }) {
  const { events } = useCalendar();
  const periods = useMemo(() => buildPeriods(events, from, to), [events, from, to]);
  const [sel, setSel] = useState<string | undefined>();
  const selected: ContentPeriod | undefined = periods.find((p) => p.id === sel) ?? periods.find(isCurrent) ?? periods[0];
  return (
    <section aria-label="Content periods" className="mb-6 rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-card-foreground"><CalendarRange size={15} className="text-brand" />Content periods · {fmtRange(from, to)}</div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {periods.map((p) => (
          <button key={p.id} type="button" onClick={() => setSel(p.id)} className={`min-w-[150px] shrink-0 rounded-md border p-2.5 text-left transition-colors ${selected?.id === p.id ? "border-brand bg-brand-soft/40" : "border-border hover:border-brand/40"}`}>
            <span className="flex items-center justify-between gap-2"><PeriodKindBadge kind={p.kind} />{isCurrent(p) && <span className="text-[10px] font-semibold text-brand">Current</span>}</span>
            <span className="mt-1.5 block truncate text-[12px] font-semibold text-card-foreground">{p.name}</span>
            <span className="block text-[10.5px] text-muted-foreground">{fmtRange(p.start, p.end)}</span>
          </button>
        ))}
      </div>
      {selected && <p className="mt-3 border-t border-border pt-3 text-[12px] leading-5 text-muted-foreground"><strong className="text-card-foreground">Why {selected.kind}:</strong> {selected.reason}{selected.windowNote && <span className="block text-[11px]">{selected.windowNote}</span>}</p>}
    </section>
  );
}
