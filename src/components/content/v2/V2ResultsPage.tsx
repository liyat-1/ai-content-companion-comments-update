import { useState } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { publishPeriod, useV2 } from "@/lib/contentV2";
import { RefreshFlow, type FlowSetup } from "./RefreshFlow";
import { generateCopy } from "./generateCopy";
import { V2Results } from "./V2Results";

export function V2ResultsPage() {
  const { periods } = useV2();
  const [flow, setFlow] = useState<FlowSetup | null>(null);
  const current = periods.find((p) => p.status === "Current") ?? periods[2];
  const next = periods.find((p) => p.status === "Upcoming") ?? current;
  const periodOptions = periods.filter((p) => p.status === "Current" || p.status === "Upcoming").map((p) => ({
    id: p.id, label: p.label, short: p.short, month: Number(p.id.slice(5)) - 1,
    dateRange: `${p.short} 1–30, 2026`, blurb: p.status === "Current" ? `${p.short} is active now.` : "The next period without fresh content.",
  }));
  return <MarketingShell title="Content Library · Results">
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
      <header className="border-b border-border pb-5"><p className="text-[11px] font-semibold uppercase text-brand">Content Library / V2 / Results</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">Content results</h1><p className="mt-1 text-[13px] text-muted-foreground">See what worked in each period and carry it forward into your next update.</p></header>
      <V2Results onImprove={(context) => setFlow({ recommendedId: next.id, context })} />
    </main>
    {flow && <RefreshFlow setup={flow} periodOptions={periodOptions} baseCopy={current.copy} aiCopy={({ month, tone, direction, seasonal, note }) => [generateCopy(month, tone, direction, seasonal?.name ?? null, note)]} learning={flow.context} onPublish={({ periodId, copy, preferences }) => { publishPeriod(periodId, copy, true, preferences); setFlow(null); }} onClose={() => setFlow(null)} />}
  </MarketingShell>;
}
