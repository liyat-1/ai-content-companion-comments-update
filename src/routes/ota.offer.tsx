import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button, Card, Pill, SectionHeader, Tooltip } from "@/components/ota/OtaShell";
import {
  OFFER_RECOMMENDATION,
  OFFER_TEST,
  OFFER_TYPES,
  SEGMENT_OFFERS,
} from "@/lib/otaBuster";

export const Route = createFileRoute("/ota/offer")({
  head: () => ({
    meta: [
      { title: "Direct Booking Offer — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "Give OTA guests a reason to book directly next time — with a recommended offer and the economics behind it.",
      },
      { property: "og:title", content: "Direct Booking Offer — OTA Buster" },
      {
        property: "og:description",
        content: "Choose an incentive, see its cost against avoided OTA commission, and test what converts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfferPage,
});

function OfferPage() {
  const [selected, setSelected] = useState<string[]>(["breakfast"]);
  const [commission, setCommission] = useState(15);
  const [averageBooking, setAverageBooking] = useState(500);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const economics = useMemo(() => {
    const cost = OFFER_TYPES.filter((o) => selected.includes(o.id)).reduce(
      (sum, o) => sum + (o.id === "pct" ? averageBooking * 0.1 : o.estimatedCost),
      0,
    );
    const avoided = (commission / 100) * averageBooking;
    return { cost: Math.round(cost), avoided: Math.round(avoided), net: Math.round(avoided - cost) };
  }, [selected, commission, averageBooking]);

  const label =
    selected.length === 0
      ? "No incentive"
      : OFFER_TYPES.filter((o) => selected.includes(o.id))
          .map((o) => o.name)
          .join(" + ");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Direct booking offer"
        title="Give guests a reason to book direct."
        subtitle="One offer, applied wherever OTA Buster invites a guest back. Combine benefits when it makes sense — a small experience often beats a rate cut."
      />

      <Card className="border-blue-200 bg-blue-50/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              <Sparkles size={13} /> Recommended offer
            </p>
            <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-900">
              {OFFER_RECOMMENDATION.title}
            </p>
            <ul className="mt-3 space-y-1.5">
              {OFFER_RECOMMENDATION.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-[12.5px] leading-snug text-zinc-700">
                  <Check size={14} className="mt-0.5 shrink-0 text-blue-600" />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-zinc-500">{OFFER_RECOMMENDATION.confidence}</p>
          </div>
          <Button onClick={() => setSelected(["breakfast"])}>Use this offer</Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="p-5">
            <SectionHeader title="Offer type" subtitle="Select one, or combine two that complement each other." />
            <div className="mt-4 grid gap-px bg-zinc-200 sm:grid-cols-2">
              {OFFER_TYPES.map((o) => {
                const on = selected.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => toggle(o.id)}
                    aria-pressed={on}
                    className={`flex items-start gap-3 p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                      on ? "bg-blue-50" : "bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center border ${
                        on ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {on ? <Check size={11} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-zinc-900">{o.name}</span>
                        <span className="text-[10.5px] uppercase tracking-wide text-zinc-400">{o.category}</span>
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-zinc-500">{o.description}</span>
                      <span className="mt-1 block text-[11px] text-zinc-400">
                        Cost model: {o.costModel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader
              title="Offer by guest segment"
              subtitle="Where the data supports it, Directful sends a different benefit to different guests."
            />
            <ul className="mt-4 divide-y divide-zinc-100">
              {SEGMENT_OFFERS.map((s) => (
                <li key={s.segment} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-900">{s.segment}</p>
                    <p className="text-[11.5px] leading-snug text-zinc-500">{s.basis}</p>
                  </div>
                  <Pill tone="info">{s.offer}</Pill>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <SectionHeader
              title="Offer test"
              subtitle="Two offers, an even split, measured on net benefit rather than clicks."
              action={<Pill tone={OFFER_TEST.running ? "good" : "neutral"}>{OFFER_TEST.running ? "Running" : "Ended"}</Pill>}
            />
            <div className="mt-4 grid gap-px bg-zinc-200 sm:grid-cols-2">
              {OFFER_TEST.variants.map((v) => {
                const winner = v.name === OFFER_TEST.winner;
                return (
                  <div key={v.name} className={`p-4 ${winner ? "bg-emerald-50/60" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[13.5px] font-semibold text-zinc-900">{v.name}</p>
                      {winner ? <Pill tone="good">Leading</Pill> : null}
                    </div>
                    <dl className="mt-3 space-y-1.5 text-[12px]">
                      {[
                        ["Sends", v.sends.toLocaleString()],
                        ["Direct bookings", v.bookings.toLocaleString()],
                        ["Conversion", `${(v.conversion * 100).toFixed(1)}%`],
                        ["Revenue", `$${v.revenue.toLocaleString()}`],
                        ["Offer cost", `$${v.offerCost.toLocaleString()}`],
                        ["Net", `$${(v.revenue - v.offerCost).toLocaleString()}`],
                      ].map(([k, val]) => (
                        <div key={k} className="flex justify-between">
                          <dt className="text-zinc-500">{k}</dt>
                          <dd className="font-semibold tabular-nums text-zinc-900">{val}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[12px] text-zinc-600">
              Winning offer: <strong className="font-semibold">{OFFER_TEST.winner}</strong> · {OFFER_TEST.lift}.{" "}
              <button className="font-semibold text-blue-700 underline underline-offset-2">
                Make it the default
              </button>
            </p>
          </Card>
        </div>

        {/* Profitability */}
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Your offer</p>
            <p className="mt-2 text-[18px] font-semibold leading-snug tracking-tight text-zinc-900">{label}</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-700">
                  OTA commission rate
                  <Tooltip text="Used to estimate the commission avoided when a guest books direct instead of through an OTA." />
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="range"
                    min={5}
                    max={30}
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="h-1 flex-1 accent-blue-600"
                    aria-label="OTA commission rate"
                  />
                  <span className="w-12 text-right text-[13px] font-semibold tabular-nums">{commission}%</span>
                </div>
              </label>

              <label className="block">
                <span className="text-[11.5px] font-semibold text-zinc-700">Average booking value</span>
                <input
                  type="number"
                  min={50}
                  step={10}
                  value={averageBooking}
                  onChange={(e) => setAverageBooking(Math.max(50, Number(e.target.value) || 50))}
                  className="mt-1.5 w-full border border-zinc-300 px-2.5 py-1.5 text-[13px] font-semibold tabular-nums outline-none focus:border-blue-600"
                />
              </label>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Estimated per converted booking
              </p>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-zinc-600">Commission avoided</dt>
                  <dd className="font-semibold tabular-nums text-zinc-900">${economics.avoided}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-600">Offer cost</dt>
                  <dd className="font-semibold tabular-nums text-zinc-900">−${economics.cost}</dd>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2">
                  <dt className="font-semibold text-zinc-900">Potential net benefit</dt>
                  <dd
                    className={`text-[16px] font-semibold tabular-nums ${
                      economics.net >= 0 ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    ${economics.net}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-snug text-zinc-500">
                These are estimates based on your configured commission rate and average booking value, not
                a guarantee of margin.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button>Save offer</Button>
              <Button variant="secondary">Preview landing page</Button>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Eligibility</p>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-zinc-600">
              <li>Previously booked via an OTA channel</li>
              <li>Reached checkout with valid, consented contact details</li>
              <li>No existing direct booking for the same dates</li>
              <li>Not in an open service-recovery case</li>
              <li>Within messaging frequency limits</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
