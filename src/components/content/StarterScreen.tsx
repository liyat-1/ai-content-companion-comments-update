import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { type LucideIcon } from "lucide-react";
import { calendar, daysUntil, fmtRange, TODAY, useCalendar } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ai/Sparkle";
import { EVENT_IMAGES, EVENT_ICONS } from "./eventImages";
import { CalendarUploadDialog } from "./CalendarUploadDialog";

const FAN = ["-rotate-6 translate-y-3", "-rotate-2 -translate-y-1", "rotate-2 -translate-y-1", "rotate-6 translate-y-3"];

function daysLabel(d: string) { const n = daysUntil(d); return n <= 0 ? "Now" : n === 1 ? "Tomorrow" : `In ${n} days`; }

export function StarterScreen({ onLocalize, onKeep }: { onLocalize: () => void; onKeep: () => void }) {
  const { events: all, hasHotelCalendar } = useCalendar();
  const [uploadOpen, setUploadOpen] = useState(false);
  const events = all.filter((e) => e.end >= TODAY).slice(0, 4);
  return (
    <section aria-label="Plan with AI" className="ai-surface relative -mx-4 overflow-hidden px-4 pb-16 pt-12 text-center sm:-mx-6 sm:px-6">
      <div aria-hidden className="ai-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]" />
      <div aria-hidden className="starter-orb pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-brand/25" />
      <div aria-hidden className="starter-orb pointer-events-none absolute -right-16 top-40 size-80 rounded-full bg-warning-soft" style={{ animationDelay: "-6s" }} />
      <div aria-hidden className="starter-orb pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-brand-soft" style={{ animationDelay: "-3s" }} />
      <div className="relative mx-auto max-w-4xl">
        <p className="starter-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand shadow-sm backdrop-blur-sm">
          <span className="relative flex size-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-brand" /></span>
          Holiday Inn Times Square · New York City
        </p>
        <h1 className="starter-rise mt-3 font-display text-[34px] font-semibold leading-tight text-card-foreground sm:text-[46px]" style={{ animationDelay: "60ms" }}>
          Plan your <span className="ai-text">upcoming</span> content
        </h1>
        <p className="starter-rise mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground" style={{ animationDelay: "120ms" }}>
          Directful AI reviews the events, holidays and seasons ahead and recommends where your guest content should change — and where your current content should stay.
        </p>
        <div className="mt-8 flex items-start justify-center py-6">
          {events.map((event, i) => {
            const Icon: LucideIcon = EVENT_ICONS[event.type] ?? Sparkle; const image = event.image ?? EVENT_IMAGES[event.id];
            return (
              <div key={event.id} className="starter-rise mx-0.5 sm:mx-1.5" style={{ animationDelay: `${180 + i * 90}ms`, zIndex: i === 1 || i === 2 ? 10 : 5 }}>
                <div className="starter-float" style={{ animationDelay: `${i * -1.2}s` }}>
                <article className={`group w-40 rounded-lg p-3 text-left shadow-lift transition-all duration-200 hover:z-20 hover:-translate-y-2 hover:rotate-0 hover:scale-105 sm:w-48 sm:p-4 ai-edge ${FAN[i]}`}>
                  <div className="relative h-24 overflow-hidden rounded-md sm:h-28">
                    {image ? (
                      <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center bg-brand-soft/70 text-brand">
                        <Icon size={26} strokeWidth={1.75} />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-sm bg-card/90 px-1.5 py-0.5 text-[9.5px] font-semibold text-card-foreground shadow-sm backdrop-blur-sm">{fmtRange(event.start, event.end)}</span>
                  </div>
                  <h2 className="mt-3 text-[13px] font-semibold leading-snug text-card-foreground sm:text-[14px]">{event.name}</h2>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{event.note ?? event.location}</p>
                  <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-wide text-brand">{daysLabel(event.start)}</p>
                </article>
                </div>
              </div>
            );
          })}
        </div>
        <div className="starter-rise mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "560ms" }}>
          <Button variant="brand" size="lg" className="ai-button" onClick={onLocalize}>
            <Sparkle size={15} />
            {hasHotelCalendar ? "Localize with AI" : "Localize with these"}
          </Button>
          {!hasHotelCalendar && <Button variant="outline" size="lg" className="bg-card/70 backdrop-blur-sm" onClick={() => setUploadOpen(true)}>Upload my calendar</Button>}
          <Button variant="outline" size="lg" className="bg-card/70 backdrop-blur-sm" onClick={onKeep}>
            Keep current
          </Button>
        </div>
        <p className="starter-rise mt-5 text-[12px] text-muted-foreground" style={{ animationDelay: "640ms" }}>
          {hasHotelCalendar ? "Using your hotel calendar plus Directful holidays." : "Showing Directful holidays and seasonal moments only."}{" "}
          <Link to="/content/events" className="font-semibold text-brand hover:underline">Manage events & holidays</Link>
        </p>
      </div>
      <CalendarUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </section>
  );
}
