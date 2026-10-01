import { useState } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { V2Results } from "./V2Results";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";

export function V2ResultsPage() {
  const [editing, setEditing] = useState<{ id: string; context: string; actions: string[] } | null>(
    null,
  );
  return (
    <MarketingShell title="Content Library · Results">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        <header className="border-b border-border pb-5">
          <p className="text-[11px] font-semibold uppercase text-brand">
            Content Library / V2 / Results
          </p>
          <h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">
            Content results
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            See what worked in each period and carry it forward into your next update.
          </p>
        </header>
        <V2Results onImprove={(id, context, actions) => setEditing({ id, context, actions })} />
      </main>
      {editing && (
        <CampaignEditor
          id={editing.id}
          initialAiContext={editing.context}
          initialAiActions={editing.actions}
          initialChannel="email"
          onClose={() => setEditing(null)}
        />
      )}
    </MarketingShell>
  );
}
