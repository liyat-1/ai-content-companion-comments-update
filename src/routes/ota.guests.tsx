import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Mail, ShieldCheck } from "lucide-react";
import { Button, Card, Pill, SectionHeader, Tooltip } from "@/components/ota/OtaShell";
import { GUESTS, GUEST_FILTERS, GUEST_TIMELINE, type GuestStatus } from "@/lib/otaBuster";

export const Route = createFileRoute("/ota/guests")({
  head: () => ({
    meta: [
      { title: "Guests — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "Know the guest, grow the relationship: conversion score, stay history, feedback and the next best action for every OTA guest.",
      },
      { property: "og:title", content: "Guests — OTA Buster" },
      { property: "og:description", content: "A 360° profile for every OTA guest, with a recommended next action." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuestsPage,
});

const STATUS_PILL: Record<GuestStatus, { label: string; tone: "neutral" | "good" | "warn" | "info" }> = {
  ota: { label: "OTA guest", tone: "neutral" },
  high_intent: { label: "High intent", tone: "info" },
  converted: { label: "Direct guest", tone: "good" },
  recovery: { label: "Recovery", tone: "warn" },
};

function GuestsPage() {
  const [filter, setFilter] = useState<GuestStatus | "all">("all");
  const [openId, setOpenId] = useState(GUESTS[0].id);
  const list = GUESTS.filter((g) => filter === "all" || g.status === filter);
  const guest = GUESTS.find((g) => g.id === openId)!;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Guests"
        title="Know the guest. Grow the relationship."
        subtitle="Every guest carries a conversion score, their history with you, and one clear recommended action."
      />

      <div className="flex flex-wrap gap-1">
        {GUEST_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`border px-3 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              filter === f.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="space-y-px bg-zinc-200">
          {list.map((g) => (
            <button
              key={g.id}
              onClick={() => setOpenId(g.id)}
              className={`flex w-full items-center gap-4 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                g.id === openId ? "bg-blue-50/60" : "bg-white hover:bg-zinc-50"
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center text-[13px] font-bold tabular-nums ${
                  g.score >= 70
                    ? "bg-emerald-50 text-emerald-700"
                    : g.score >= 50
                      ? "bg-blue-50 text-blue-700"
                      : "bg-zinc-100 text-zinc-500"
                }`}
                aria-label={`Direct conversion score ${g.score}`}
              >
                {g.score}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-zinc-900">{g.name}</span>
                  <Pill tone={STATUS_PILL[g.status].tone}>{STATUS_PILL[g.status].label}</Pill>
                  {!g.directContact ? <Pill tone="warn">No direct contact</Pill> : null}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-zinc-500">
                  {g.segment} · {g.source} · Last stay {g.lastStay}
                </span>
                <span className="mt-1.5 block text-[12px] leading-snug text-zinc-700">
                  <strong className="font-semibold">Next:</strong> {g.nextBestAction}
                </span>
              </span>
              <span className="hidden shrink-0 text-right sm:block">
                <span className="block text-[13px] font-semibold tabular-nums text-zinc-900">
                  ${g.lifetimeValue.toLocaleString()}
                </span>
                <span className="block text-[11px] text-zinc-500">lifetime value</span>
              </span>
            </button>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[18px] font-semibold tracking-tight text-zinc-900">{guest.name}</h3>
                <p className="text-[12px] text-zinc-500">{guest.email}</p>
              </div>
              <Pill tone={STATUS_PILL[guest.status].tone}>{STATUS_PILL[guest.status].label}</Pill>
            </div>

            <div className="mt-4 border border-zinc-200 bg-[#fafafa] p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Direct conversion score
                <Tooltip text="An estimated likelihood that this guest will book directly, based on available guest and engagement signals. It is a guide, not a guarantee." />
              </p>
              <p className="mt-1 text-[30px] font-semibold tabular-nums leading-none text-zinc-900">
                {guest.score}
                <span className="ml-2 align-middle text-[12px] font-semibold text-zinc-500">
                  {guest.score >= 70 ? "High potential" : guest.score >= 50 ? "Moderate" : "Low"}
                </span>
              </p>
              <div className="mt-3 h-1.5 w-full bg-zinc-200">
                <div className="h-full bg-blue-600" style={{ width: `${guest.score}%` }} />
              </div>
              <ul className="mt-3 space-y-1 text-[11.5px] text-zinc-600">
                {guest.scoreReasons.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </div>

            <div
              className={`mt-4 border p-3.5 ${
                guest.actionTone === "recover" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Next best action
              </p>
              <p className="mt-1 text-[13px] leading-snug text-zinc-800">{guest.nextBestAction}</p>
              <div className="mt-3">
                <Button variant={guest.actionTone === "recover" ? "secondary" : "primary"}>
                  {guest.actionTone === "recover" ? "Open recovery case" : "Send direct-booking offer"}
                </Button>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
              {[
                ["Guest lifetime value", `$${guest.lifetimeValue.toLocaleString()}`],
                ["Stays", `${guest.stays}`],
                ["Average booking", `$${guest.averageBooking}`],
                ["Room history", guest.room],
                ["Source", guest.source],
                ["Last stay", guest.lastStay],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-zinc-900">{v}</dd>
                </div>
              ))}
            </dl>

            {guest.feedback ? (
              <p className="mt-4 border-l-2 border-zinc-300 pl-3 text-[12px] italic leading-snug text-zinc-600">
                {guest.feedback}
              </p>
            ) : null}

            <div className="mt-4 border-t border-zinc-200 pt-3">
              {guest.contactWindow ? (
                <p className="flex items-start gap-2 text-[11.5px] leading-snug text-amber-800">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  {guest.contactWindow}. After that date this guest may no longer be reachable through the OTA
                  channel.
                </p>
              ) : null}
              <p className="mt-2 flex items-center gap-2 text-[11.5px] text-zinc-600">
                {guest.directContact ? (
                  <>
                    <ShieldCheck size={13} className="text-emerald-600" /> Direct contact available and consented
                  </>
                ) : (
                  <>
                    <Mail size={13} className="text-amber-600" /> No eligible direct contact channel yet
                  </>
                )}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Relationship</p>
            <ol className="mt-3">
              {GUEST_TIMELINE.map((t, i, arr) => (
                <li key={t.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 size-2 shrink-0 ${t.done ? "bg-blue-600" : "border border-zinc-300 bg-white"}`}
                    />
                    {i < arr.length - 1 ? <span className="w-px flex-1 bg-zinc-200" /> : null}
                  </div>
                  <div className="pb-3">
                    <p className={`text-[12.5px] font-semibold ${t.done ? "text-zinc-900" : "text-zinc-400"}`}>
                      {t.label}
                    </p>
                    <p className="text-[11.5px] text-zinc-500">{t.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
