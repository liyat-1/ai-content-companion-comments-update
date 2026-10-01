import { createFileRoute } from "@tanstack/react-router";
import { Card, Pill, SectionHeader } from "@/components/ota/OtaShell";

export const Route = createFileRoute("/ota/settings")({
  head: () => ({
    meta: [
      { title: "Settings — OTA Buster · Directful" },
      {
        name: "description",
        content: "System configuration for OTA Buster: channels, communication rules, privacy and booking-source integrations.",
      },
      { property: "og:title", content: "Settings — OTA Buster" },
      { property: "og:description", content: "Channels, communication rules, privacy and integrations only — strategy lives in the journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const CHANNELS = [
  { name: "Email", status: "Connected", note: "Primary channel for every journey step." },
  { name: "SMS", status: "Connected", note: "Used for pre-arrival and in-stay only." },
  { name: "WhatsApp", status: "Not connected", note: "Available where the property has a verified sender." },
];

const RULES = [
  "Never send more than 4 messages to a guest in any 14-day window.",
  "Only send when the step still applies — a guest who has checked in skips the pre-arrival reminder.",
  "Suppress all promotional messaging while a service-recovery case is open.",
  "Stop the winback sequence the moment a direct booking is detected.",
  "Honour opt-outs immediately across every channel.",
];

const INTEGRATIONS = [
  { name: "Booking.com", status: "Connected", guests: "4,120 reservations" },
  { name: "Expedia", status: "Connected", guests: "2,480 reservations" },
  { name: "Airbnb", status: "Connected", guests: "1,820 reservations" },
  { name: "Property booking engine", status: "Connected", guests: "Direct bookings attributed" },
];

function SettingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Settings"
        title="System configuration only."
        subtitle="Offers, journey timing and guest strategy live where you can see their impact — not in here."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <SectionHeader title="Channels" />
          <div className="space-y-px bg-zinc-200">
            {CHANNELS.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3 bg-white p-4">
                <div>
                  <p className="text-[13.5px] font-semibold text-zinc-900">{c.name}</p>
                  <p className="text-[11.5px] text-zinc-500">{c.note}</p>
                </div>
                <Pill tone={c.status === "Connected" ? "good" : "neutral"}>{c.status}</Pill>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Booking sources" />
          <div className="space-y-px bg-zinc-200">
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="flex items-center justify-between gap-3 bg-white p-4">
                <div>
                  <p className="text-[13.5px] font-semibold text-zinc-900">{i.name}</p>
                  <p className="text-[11.5px] text-zinc-500">{i.guests}</p>
                </div>
                <Pill tone="good">{i.status}</Pill>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Communication rules" />
          <Card className="p-5">
            <ul className="space-y-2 text-[12.5px] leading-relaxed text-zinc-700">
              {RULES.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Privacy & guest data" />
          <Card className="p-5">
            <p className="text-[12.5px] leading-relaxed text-zinc-700">
              Guest data stays limited to what the journey actually needs. Directful never stores government ID
              details beyond the legally required retention period, and communication stops automatically when
              contact eligibility expires or the guest opts out.
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-zinc-700">
              OTA-mediated contact channels have their own limits. Where a channel is closing, the guest profile
              shows the date and whether a compliant direct contact method exists.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
