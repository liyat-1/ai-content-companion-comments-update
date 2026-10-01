import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ChevronRight, Pencil, Eye, Pause, Copy } from "lucide-react";
import { Button, ButtonLink, Card, Pill, SectionHeader } from "@/components/ota/OtaShell";
import { JOURNEY, STATUS_COPY, type JourneyStageId } from "@/lib/otaBuster";

export const Route = createFileRoute("/ota/journey")({
  head: () => ({
    meta: [
      { title: "Guest Journey — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "From OTA booking to direct relationship: welcome, pre-arrival, during stay, post-stay, winback and retention in one journey.",
      },
      { property: "og:title", content: "Guest Journey — OTA Buster" },
      {
        property: "og:description",
        content: "Seven guest moments that turn an OTA reservation into a direct relationship.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JourneyPage,
});

const PREARRIVAL_OFFERS = [
  { name: "Room upgrade", detail: "Deluxe King → Suite", price: "$79", revenue: "$1,840", on: true },
  { name: "Breakfast", detail: "Per person, per morning", price: "$18", revenue: "$1,120", on: true },
  { name: "Airport transfer", detail: "Private car, one way", price: "$45", revenue: "$720", on: true },
  { name: "Early check-in", detail: "From 11:00", price: "$25", revenue: "$310", on: false },
  { name: "Late checkout", detail: "Until 15:00", price: "$25", revenue: "$210", on: true },
  { name: "Spa", detail: "60-minute treatment", price: "$95", revenue: "—", on: false },
  { name: "Dining", detail: "Chef's table for two", price: "$120", revenue: "—", on: false },
  { name: "Parking", detail: "Per night", price: "$20", revenue: "—", on: false },
];

function JourneyPage() {
  const [openId, setOpenId] = useState<JourneyStageId>("prearrival");
  const open = JOURNEY.find((s) => s.id === openId)!;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Guest journey"
        title="From OTA booking to direct relationship."
        subtitle="Each step is a guest moment, not a technical trigger. Select a step to see its purpose, what the guest experiences, and what it returns."
        action={<ButtonLink to="/ota/offer" variant="secondary">Direct booking offer</ButtonLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Journey rail */}
        <ol className="space-y-0">
          {JOURNEY.map((s, i) => {
            const active = s.id === openId;
            return (
              <li key={s.id}>
                {i > 0 ? (
                  <div className="flex items-center gap-2 pl-[11px]">
                    <span className="h-4 w-px bg-zinc-300" />
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                      {s.timing}
                    </span>
                  </div>
                ) : null}
                <button
                  onClick={() => setOpenId(s.id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex w-full items-start gap-3 border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? "border-blue-600 bg-blue-50/60"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center text-[10.5px] font-bold ${
                      active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {s.index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-semibold text-zinc-900">{s.name}</span>
                      <span
                        className={`border px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_COPY[s.status].className}`}
                      >
                        {STATUS_COPY[s.status].label}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-zinc-500">{s.purpose}</span>
                  </span>
                  <ChevronRight size={14} className={active ? "text-blue-600" : "text-zinc-300"} />
                </button>
              </li>
            );
          })}
        </ol>

        {/* Stage detail */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] tracking-widest text-zinc-400">{open.index}</p>
                <h3 className="text-[22px] font-semibold tracking-tight text-zinc-900">{open.name}</h3>
                <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-zinc-600">{open.purpose}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary"><Pencil size={13} /> Edit message</Button>
                <Button variant="secondary"><Eye size={13} /> Preview</Button>
                <Button variant="secondary" ariaLabel="Pause step"><Pause size={13} /></Button>
                <Button variant="secondary" ariaLabel="Duplicate step"><Copy size={13} /></Button>
              </div>
            </div>

            {open.blockedReason ? (
              <p className="mt-4 flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-[12.5px] leading-snug text-amber-900">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                  {open.blockedReason}{" "}
                  <button className="font-semibold underline underline-offset-2">Set it up</button>
                </span>
              </p>
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="border border-zinc-200 bg-[#fafafa] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  What the guest experiences
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-700">{open.guestFacing}</p>
                <p className="mt-3 text-[11.5px] text-zinc-500">
                  Sent {open.timing.toLowerCase()} · {open.messages} message{open.messages === 1 ? "" : "s"}
                </p>
              </div>
              <div className="border border-zinc-200 bg-[#fafafa] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  What the hotel gains
                </p>
                <p className="mt-2 text-[24px] font-semibold tabular-nums tracking-tight text-zinc-900">
                  {open.outcomeValue}
                </p>
                <p className="text-[12px] text-zinc-500">{open.outcomeLabel}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-4">
              {open.metrics.map((m) => (
                <div key={m.label} className="bg-white p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{m.label}</p>
                  <p className="mt-1 text-[14px] font-semibold text-zinc-900">{m.value}</p>
                  {m.hint ? <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{m.hint}</p> : null}
                </div>
              ))}
            </div>
          </Card>

          {open.id === "prearrival" ? (
            <Card className="p-5">
              <SectionHeader
                title="Pre-arrival offers"
                subtitle="Choose what genuinely improves the stay. Guests see at most three."
              />
              <div className="mt-4 grid gap-px bg-zinc-200 sm:grid-cols-2">
                {PREARRIVAL_OFFERS.map((o) => (
                  <label
                    key={o.name}
                    className="flex cursor-pointer items-center justify-between gap-3 bg-white p-3.5"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={o.on}
                        className="size-4 accent-blue-600"
                        aria-label={`Offer ${o.name}`}
                      />
                      <span>
                        <span className="block text-[13px] font-semibold text-zinc-900">{o.name}</span>
                        <span className="block text-[11.5px] text-zinc-500">{o.detail}</span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[13px] font-semibold tabular-nums text-zinc-900">{o.price}</span>
                      <span className="block text-[11px] text-zinc-500">{o.revenue} earned</span>
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          ) : null}

          {open.id === "poststay" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <Pill tone="good">Positive feedback · 4–5★</Pill>
                <p className="mt-3 text-[14px] font-semibold text-zinc-900">Happy guest</p>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-zinc-600">
                  <li>Thank the guest in their own words</li>
                  <li>Invite a public review on Google or TripAdvisor</li>
                  <li>Introduce the direct-booking benefit a few days later</li>
                  <li>Add to the returning-guest segment</li>
                </ul>
              </Card>
              <Card className="p-5">
                <Pill tone="warn">Negative feedback · 1–3★</Pill>
                <p className="mt-3 text-[14px] font-semibold text-zinc-900">Service recovery</p>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-zinc-600">
                  <li>Collect private feedback — never a public prompt</li>
                  <li>Notify the duty manager immediately</li>
                  <li>Suppress promotional messaging until resolved</li>
                  <li>Flag the guest for recovery follow-up</li>
                </ul>
                <p className="mt-3 border-l-2 border-amber-300 bg-amber-50 p-2.5 text-[11.5px] leading-snug text-amber-900">
                  Hospitality before revenue: no direct-booking offer is sent while a recovery case is open.
                </p>
              </Card>
            </div>
          ) : null}

          {open.id === "stay" ? (
            <Card className="p-5">
              <SectionHeader title="During your stay" subtitle="A conversation, not a campaign." />
              <div className="mt-4 max-w-md space-y-2">
                <p className="w-fit border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px] text-zinc-800">
                  Hi Sarah — how is everything so far?
                </p>
                <p className="ml-auto w-fit bg-blue-600 px-3 py-2 text-[13px] text-white">
                  Wonderful, thank you. Could we get late checkout?
                </p>
                <p className="w-fit border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px] text-zinc-800">
                  Of course — 14:00 is yours. Anything else we can arrange?
                </p>
              </div>
              <p className="mt-4 text-[12px] text-zinc-500">
                Replies route to the front desk. Requests can be handed to housekeeping, dining, spa or the
                concierge without leaving the thread.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
