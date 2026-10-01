import { createFileRoute } from "@tanstack/react-router";
import { Card, SectionHeader, Stat } from "@/components/ota/OtaShell";
import {
  BENCHMARK,
  CHANNEL_PERFORMANCE,
  JOURNEY,
  OFFER_PERFORMANCE,
  PERFORMANCE_OVERVIEW,
  PROPERTY_PERFORMANCE,
  SEGMENT_PERFORMANCE,
  pct,
} from "@/lib/otaBuster";

export const Route = createFileRoute("/ota/performance")({
  head: () => ({
    meta: [
      { title: "Performance — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "Revenue-first reporting: direct revenue, guests converted, commission avoided and net impact across journeys, segments, offers and properties.",
      },
      { property: "og:title", content: "Performance — OTA Buster" },
      { property: "og:description", content: "How much money did OTA Buster make? Answered first, before engagement metrics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformancePage,
});

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-zinc-200">
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 ${
                  i === 0 ? "text-left" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])} className="border-b border-zinc-100 last:border-0">
              {r.map((cell, i) => (
                <td
                  key={i}
                  className={`px-3 py-2.5 tabular-nums ${
                    i === 0 ? "text-left font-semibold text-zinc-900" : "text-right text-zinc-700"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PerformancePage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="OTA Buster performance"
        title="How much did OTA Buster make?"
        subtitle="Revenue and guests won come first. Opens, clicks and deliverability are supporting evidence, not the scoreboard."
      />

      <div className="grid gap-px bg-zinc-200 sm:grid-cols-3 lg:grid-cols-5">
        {PERFORMANCE_OVERVIEW.map((m, i) => (
          <div key={m.label} className={`p-4 ${i >= 5 ? "bg-blue-50/50" : "bg-white"}`}>
            <Stat label={m.label} value={m.value} />
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <SectionHeader title="Journey performance" />
        <Card className="p-2">
          <Table
            head={["Journey step", "Guests reached", "Engagement", "Outcome"]}
            rows={JOURNEY.map((s) => [
              s.name,
              s.guestsReached.toLocaleString(),
              s.engagement === null ? "—" : pct(s.engagement),
              s.outcomeValue,
            ])}
          />
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <SectionHeader title="Guest segments" />
          <Card className="p-2">
            <Table
              head={["Segment", "Guests", "Conversion", "Revenue", "Best offer"]}
              rows={SEGMENT_PERFORMANCE.map((s) => [
                s.segment,
                s.guests.toLocaleString(),
                pct(s.conversion),
                `$${s.revenue.toLocaleString()}`,
                s.offer,
              ])}
            />
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Offer performance" />
          <Card className="p-2">
            <Table
              head={["Offer", "Bookings", "Conversion", "Revenue", "Cost", "Net"]}
              rows={OFFER_PERFORMANCE.map((o) => [
                o.offer,
                o.bookings.toLocaleString(),
                pct(o.conversion),
                `$${o.revenue.toLocaleString()}`,
                `$${o.cost.toLocaleString()}`,
                `$${o.net.toLocaleString()}`,
              ])}
            />
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Channel performance" />
          <Card className="p-2">
            <Table
              head={["Channel", "Reached", "Engaged", "Direct bookings"]}
              rows={CHANNEL_PERFORMANCE.map((c) => [
                c.channel,
                c.reached.toLocaleString(),
                c.engaged.toLocaleString(),
                c.bookings.toLocaleString(),
              ])}
            />
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Property performance" subtitle="Group-level view across your portfolio." />
          <Card className="p-2">
            <Table
              head={["Property", "OTA guests", "Conversion", "Direct revenue"]}
              rows={PROPERTY_PERFORMANCE.map((p) => [
                p.property,
                p.guests.toLocaleString(),
                pct(p.conversion),
                `$${p.revenue.toLocaleString()}`,
              ])}
            />
          </Card>
        </section>
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="OTA conversion benchmark"
          subtitle="Privacy-safe aggregate across properties in your portfolio."
        />
        <Card className="grid gap-4 p-5 sm:grid-cols-3">
          {[
            ["Your property", BENCHMARK.property, "text-blue-700"],
            ["Portfolio average", BENCHMARK.portfolio, "text-zinc-900"],
            ["Top performing", BENCHMARK.top, "text-emerald-700"],
          ].map(([label, value, tone]) => (
            <div key={label as string}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {label as string}
              </p>
              <p className={`mt-1 text-[24px] font-semibold tabular-nums ${tone as string}`}>
                {pct(value as number)}
              </p>
              <div className="mt-2 h-1.5 w-full bg-zinc-100">
                <div className="h-full bg-current opacity-60" style={{ width: `${(value as number) * 400}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
