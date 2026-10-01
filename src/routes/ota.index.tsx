import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingDown } from "lucide-react";
import {
  Button,
  ButtonLink,
  Card,
  Pill,
  SectionHeader,
  Stat,
  Tooltip,
} from "@/components/ota/OtaShell";
import {
  DEPENDENCY,
  FUNNEL,
  HEADLINE_KPIS,
  INSIGHTS,
  JOURNEY,
  OPPORTUNITIES,
  OPPORTUNITY_SUMMARY,
  STATUS_COPY,
} from "@/lib/otaBuster";

export const Route = createFileRoute("/ota/")({
  head: () => ({
    meta: [
      { title: "OTA Buster — Turn OTA guests into direct guests · Directful" },
      {
        name: "description",
        content:
          "See how many OTA guests became direct guests, the revenue recovered, the commission avoided, and what to do next.",
      },
      { property: "og:title", content: "OTA Buster — Turn OTA guests into direct guests" },
      {
        property: "og:description",
        content:
          "A guest-conversion engine for hotels: engage OTA guests through the stay, then bring them back direct.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const max = Math.max(...FUNNEL.map((f) => f.count));

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="border border-zinc-200 bg-white">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_1fr] lg:p-8">
          <div>
            <div className="flex items-center gap-2">
              <Pill tone="good">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                Active
              </Pill>
              <span className="text-[11.5px] text-zinc-500">Running across 5 properties</span>
            </div>
            <h1 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-tight text-zinc-900">
              Turn OTA guests into direct guests.
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-[14.5px] leading-relaxed text-zinc-600">
              OTA Buster engages the guests you acquired through Booking.com, Expedia and Airbnb before,
              during and after their stay — then gives them a reason to come back through your own
              booking channel.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink to="/ota/journey">
                Manage OTA Buster <ArrowRight size={14} />
              </ButtonLink>
              <ButtonLink to="/ota/performance" variant="secondary">
                View performance
              </ButtonLink>
              <ButtonLink to="/ota/journey" variant="ghost">
                Preview guest journey
              </ButtonLink>
            </div>
          </div>

          <div className="border border-zinc-200 bg-[#fafafa] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              How it works
            </p>
            <ol className="mt-4 space-y-0">
              {[
                ["Acquire", "The guest books through an OTA."],
                ["Identify", "Directful builds a guest profile where permitted."],
                ["Engage", "Messages that fit each point of the stay."],
                ["Delight", "Relevant upgrades, not blanket offers."],
                ["Listen", "Feedback routed by sentiment."],
                ["Convert", "A reason to book direct next time."],
                ["Retain", "Recognition that earns the third stay."],
              ].map(([label, body], i, arr) => (
                <li key={label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="grid size-5 shrink-0 place-items-center bg-blue-600 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {i < arr.length - 1 ? <span className="w-px flex-1 bg-zinc-200" /> : null}
                  </div>
                  <div className="pb-3">
                    <p className="text-[12.5px] font-semibold text-zinc-900">{label}</p>
                    <p className="text-[11.5px] leading-snug text-zinc-500">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Headline outcome metrics */}
        <div className="grid gap-px border-t border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-5">
          {HEADLINE_KPIS.map((k, i) => (
            <div key={k.id} className={`bg-white p-5 ${i === 1 ? "lg:bg-blue-50/60" : ""}`}>
              <Stat label={k.label} value={k.value} hint={k.hint} tooltip={k.tooltip} emphasis />
              {k.delta ? (
                <p
                  className={`mt-2 text-[11.5px] font-semibold ${
                    k.tone === "up" ? "text-emerald-700" : "text-zinc-500"
                  }`}
                >
                  {k.delta}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Opportunity */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Your OTA opportunity"
          title="Guests you've already paid for."
          subtitle="Directful has identified guests who originally arrived through an OTA channel and could become future direct guests. Select a stage to open that segment."
          action={<ButtonLink to="/ota/guests" variant="secondary">Open guest list</ButtonLink>}
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {OPPORTUNITY_SUMMARY.map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {s.label}
                  </p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums tracking-tight text-zinc-900">
                    {s.value}
                    {s.estimate ? (
                      <span className="ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                        est.
                      </span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              OTA guest → direct guest
            </p>
            <ul className="mt-4 space-y-1.5">
              {FUNNEL.map((f) => (
                <li key={f.id}>
                  <Link
                    to="/ota/guests"
                    className="group block border border-transparent px-2 py-1.5 transition-colors hover:border-zinc-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12.5px] font-semibold text-zinc-800">{f.label}</span>
                      <span className="text-[12.5px] font-semibold tabular-nums text-zinc-900">
                        {f.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full bg-zinc-100">
                      <div
                        className="h-full bg-blue-600 transition-all group-hover:bg-blue-700"
                        style={{ width: `${Math.max(6, (f.count / max) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">{f.note}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Dependency */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Business health"
          title="OTA dependency"
          subtitle="The share of your bookings that arrive through third-party channels."
        />
        <Card className="grid gap-6 p-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="grid grid-cols-3 gap-4">
            {[
              ["Before", DEPENDENCY.before, "text-zinc-400"],
              ["Current", DEPENDENCY.current, "text-blue-700"],
              ["Target", DEPENDENCY.target, "text-emerald-700"],
            ].map(([label, value, tone]) => (
              <div key={label as string}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {label as string}
                </p>
                <p className={`mt-1 text-[26px] font-semibold tabular-nums tracking-tight ${tone as string}`}>
                  {value as number}%
                </p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex h-24 items-end gap-1.5" role="img" aria-label="OTA dependency trending down from 78% to 56%">
              {DEPENDENCY.series.map((v, i) => (
                <div key={i} className="flex-1 bg-blue-100" style={{ height: `${v}%` }}>
                  <div className="h-full w-full bg-blue-600/80" style={{ opacity: 0.35 + i * 0.08 }} />
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[12px] leading-snug text-zinc-600">
              <TrendingDown size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              {DEPENDENCY.insight}
            </p>
          </div>
        </Card>
      </section>

      {/* Journey summary */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Guest journey"
          title="From OTA booking to direct relationship."
          subtitle="Seven moments, one relationship. Open any step to see what the guest receives and what it returns."
          action={<ButtonLink to="/ota/journey" variant="secondary">Open guest journey</ButtonLink>}
        />
        <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">
          {JOURNEY.map((s) => (
            <Link
              key={s.id}
              to="/ota/journey"
              className="group bg-white p-4 transition-colors hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-widest text-zinc-400">{s.index}</span>
                <span className={`border px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_COPY[s.status].className}`}>
                  {STATUS_COPY[s.status].label}
                </span>
              </div>
              <p className="mt-2 text-[14px] font-semibold tracking-tight text-zinc-900">{s.name}</p>
              <p className="mt-1 text-[11.5px] leading-snug text-zinc-500">{s.purpose}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                {s.outcomeLabel}
              </p>
              <p className="text-[15px] font-semibold tabular-nums text-zinc-900">{s.outcomeValue}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Next best actions + insights */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Opportunities"
            title="What to do next."
            action={<ButtonLink to="/ota/opportunities" variant="ghost">See all</ButtonLink>}
          />
          <div className="space-y-px bg-zinc-200">
            {OPPORTUNITIES.slice(0, 3).map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 bg-white p-4">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-zinc-900">{o.headline}</p>
                  <p className="mt-1 text-[12px] leading-snug text-zinc-500">{o.reason}</p>
                  <p className="mt-1.5 text-[11.5px] font-semibold text-blue-700">{o.value}</p>
                </div>
                <Button variant="secondary">{o.action}</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader eyebrow="Directful insights" title="What the data is telling you." />
          <div className="space-y-px bg-zinc-200">
            {INSIGHTS.map((i) => (
              <Card key={i.title} className="border-0 p-4">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-zinc-900">
                  <Sparkles size={14} className="text-blue-600" />
                  {i.title}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-600">{i.body}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  Based on {i.basis}
                  <Tooltip text="Insights appear only when there is enough guest activity to support them." />
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
