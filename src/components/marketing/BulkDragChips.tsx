import { Layers, GripVertical } from "lucide-react";
import { CAMPAIGN_BULK_DRAG_TYPE, type BulkScope } from "@/lib/marketing";

const SCOPES: { key: BulkScope; label: string }[] = [
  { key: "both", label: "All campaigns" },
  { key: "direct", label: "All Direct" },
  { key: "ota", label: "All OTA" },
];

/**
 * Draggable collection chips: drag every waiting campaign at once, either for
 * both guest segments or only Direct / only OTA, onto any column.
 */
export function BulkDragChips({
  count,
  onDragStart,
  onDragEnd,
}: {
  count: number;
  onDragStart: (scope: BulkScope) => void;
  onDragEnd: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="mt-3 rounded-lg border border-dashed border-brand/40 bg-brand-soft/40 p-2">
      <p className="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
        <Layers size={11} /> Drag them all at once
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {SCOPES.map((scope) => (
          <span
            key={scope.key}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(CAMPAIGN_BULK_DRAG_TYPE, scope.key);
              event.dataTransfer.setData("text/plain", `bulk:${scope.key}`);
              event.dataTransfer.effectAllowed = "move";
              onDragStart(scope.key);
            }}
            onDragEnd={onDragEnd}
            title={`Drag all ${count} waiting campaigns`}
            className="flex cursor-grab items-center gap-1 rounded-full border border-brand/40 bg-card px-2 py-1 text-[10.5px] font-semibold text-brand shadow-sm active:cursor-grabbing"
          >
            <GripVertical size={10} className="text-brand/60" />
            {scope.label}
          </span>
        ))}
      </div>
    </div>
  );
}
