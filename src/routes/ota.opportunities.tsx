import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, Pill, SectionHeader } from "@/components/ota/OtaShell";
import { GUESTS, INSIGHTS, OPPORTUNITIES } from "@/lib/otaBuster";

export const Route = createFileRoute("/ota/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — OTA Buster · Directful" },
      {
        name: "description",
        content: "Winback radar and next best actions: who to contact, why now, and what it's worth.",
      },
      { property: "og:title", content: "Opportunities — OTA Buster" },
      { property: "og:description", content: "Proactive winback opportunities and per-guest recommended actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Winback radar"
        title="Bring them back — directly."
        subtitle="Directful watches guest behaviour and surfaces the moments worth acting on. Each one explains why it appeared."
      />

      <div className="space-y-px bg-zinc-200">
        {OPPORTUNITIES.map((o) => (
          <div key={o.id} className="flex flex-wrap items-start justify-between gap-4 bg-white p-5">
            <div className="min-w-0 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14.5px] font-semibold text-zinc-900">{o.headline}</p>
                <Pill tone={o.tone === "recover" ? "warn" : o.tone === "watch" ? "neutral" : "info"}>
                  {o.tone === "recover" ? "Recovery" : o.tone === "watch" ? "Watch" : "Convert"}
                </Pill>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-600">{o.reason}</p>
              <p className="mt-2 text-[12px] font-semibold text-blue-700">{o.value}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Review guests</Button>
              <Button variant={o.tone === "recover" ? "secondary" : "primary"}>{o.action}</Button>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <SectionHeader eyebrow="Next best action" title="Guests waiting on a decision." />
        <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 xl:grid-cols-3">
          {GUESTS.slice(0, 3).map((g) => (
            <Card key={g.id} className="border-0 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-zinc-900">{g.name}</p>
                <span className="text-[13px] font-semibold tabular-nums text-blue-700">{g.score}</span>
              </div>
              <p className="text-[11.5px] text-zinc-500">{g.segment}</p>
              <p className="mt-2 text-[12.5px] leading-snug text-zinc-700">{g.nextBestAction}</p>
              <div className="mt-3">
                <Button variant="secondary">Open profile</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Directful insights" title="Patterns worth acting on." />
        <div className="grid gap-px bg-zinc-200 sm:grid-cols-3">
          {INSIGHTS.map((i) => (
            <Card key={i.title} className="border-0 p-4">
              <p className="text-[13px] font-semibold text-zinc-900">{i.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-600">{i.body}</p>
              <p className="mt-2 text-[11px] text-zinc-400">Based on {i.basis}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
