import { useEffect, useState } from "react";
import lobby from "@/assets/lobby-arrival.jpg";
import rooftop from "@/assets/rooftop-bar.jpg";
import room from "@/assets/room-balcony.jpg";
import suite from "@/assets/suite-detail.jpg";
import courtyard from "@/assets/courtyard.jpg";
import { Sparkle } from "@/components/ai/Sparkle";
import type { EmailBody, Origin, Status } from "@/lib/contentLibrary";

export const IMAGES: Record<string, string> = { lobby, rooftop, room, suite, courtyard };

/** Animated Directful AI mark — a sparkle inside a sharp brand tile. */
export function AiMark({ size = 32, live = false }: { size?: number; live?: boolean }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-md ai-button ${live ? "ai-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <Sparkle size={Math.round(size * 0.5)} className={live ? "ai-twinkle" : ""} />
      <Sparkle size={Math.round(size * 0.22)} className="absolute right-[18%] top-[16%] opacity-80 ai-twinkle [animation-delay:0.8s]" />
    </span>
  );
}

export function OriginMarker({ origin }: { origin: Origin }) {
  if (origin === "manual") return <span className="text-[11px] text-muted-foreground">Manually created</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
      <Sparkle size={11} />
      {origin === "ai" ? "AI generated" : "AI generated · Edited"}
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  Current: "bg-muted text-muted-foreground",
  "Needs review": "bg-warning-soft text-warning",
  Approved: "bg-brand-soft text-brand",
  Published: "bg-foreground text-background",
};
export function StatusBadge({ status }: { status: Status }) {
  return <span className={`rounded-sm px-1.5 py-0.5 text-[10.5px] font-semibold ${STATUS_STYLE[status]}`}>{status}</span>;
}

/** Types text in progressively so AI replies feel written, not pasted. */
export function useTyped(text: string, speed = 14) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = window.setInterval(() => setN((x) => (x >= text.length ? (window.clearInterval(t), x) : x + 2)), speed);
    return () => window.clearInterval(t);
  }, [text, speed]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

export function AiSays({ text, children }: { text: string; children?: React.ReactNode }) {
  const { shown, done } = useTyped(text);
  return (
    <div className="ai-rise flex gap-3">
      <AiMark size={28} live={!done} />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[14.5px] leading-relaxed text-card-foreground">
          {shown}
          {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brand" />}
        </p>
        {done && children && <div className="ai-rise mt-3">{children}</div>}
      </div>
    </div>
  );
}

export function fill(s: string) {
  return s.replace(/\{first_name\}/g, "Alex").replace(/\{booking_link\}/g, "hi-ts.com/b").replace(/\{[a-z_]+\}/g, "…");
}

export function EmailMock({ email, image, compact = false }: { email: EmailBody; image: string; compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-card">
      {!compact && (
        <div className="border-b border-border bg-muted/50 px-3 py-2">
          <p className="truncate text-[12px] font-semibold text-card-foreground">{fill(email.subject)}</p>
          <p className="truncate text-[11px] text-muted-foreground">{fill(email.preheader)}</p>
        </div>
      )}
      <div className="bg-background">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-card-foreground">Holiday Inn · Times Square</span>
        </div>
        <img src={IMAGES[image] ?? lobby} alt="" className="h-40 w-full object-cover" />
        <div className="space-y-3 px-5 py-5">
          <h3 className="text-[18px] font-semibold leading-tight text-card-foreground">{fill(email.heading)}</h3>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">{fill(email.body)}</p>
          <span className="inline-block rounded-sm bg-brand px-4 py-2 text-[12px] font-semibold text-brand-foreground">{email.cta}</span>
        </div>
        <p className="border-t border-border px-5 py-3 text-[10px] text-muted-foreground">1605 Broadway, New York, NY · Unsubscribe</p>
      </div>
    </div>
  );
}
