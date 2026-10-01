import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Bell, Info } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/otaBuster";

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/ota", label: "Overview", exact: true },
  { to: "/ota/journey", label: "Guest journey" },
  { to: "/ota/offer", label: "Direct booking offer" },
  { to: "/ota/guests", label: "Guests" },
  { to: "/ota/opportunities", label: "Opportunities" },
  { to: "/ota/performance", label: "Performance" },
  { to: "/ota/settings", label: "Settings" },
];

/** Small label + value pair used across every OTA Buster surface. */
export function Stat({
  label,
  value,
  hint,
  tooltip,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  tooltip?: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
        {tooltip ? <Tooltip text={tooltip} /> : null}
      </div>
      <p
        className={`mt-1.5 tabular-nums tracking-tight text-zinc-900 ${
          emphasis ? "text-[26px] font-semibold" : "text-[19px] font-semibold"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11.5px] leading-snug text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`More information: ${text}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="grid size-3.5 place-items-center text-zinc-400 outline-none hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Info size={12} />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-1/2 top-5 z-50 w-60 -translate-x-1/2 border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-[11.5px] font-normal normal-case leading-snug tracking-normal text-zinc-100 shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-zinc-900">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-zinc-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-zinc-200 bg-white ${className}`}>{children}</div>;
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "info";
}) {
  const tones = {
    neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ButtonLink({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400",
    ghost: "text-blue-700 hover:bg-blue-50",
  } as const;
  return (
    <Link
      to={to as "/"}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-300",
    secondary: "border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400",
    ghost: "text-blue-700 hover:bg-blue-50",
  } as const;
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

/** Page chrome for the whole OTA Buster program. */
export function OtaShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#fafafa] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid size-6 place-items-center bg-zinc-900">
                <span className="size-2 rotate-45 bg-white" />
              </span>
              <span className="text-[13px] font-semibold tracking-tight">Directful</span>
            </Link>
            <span className="h-4 w-px bg-zinc-200" />
            <span className="text-[13px] font-semibold text-zinc-900">OTA Buster</span>
            <Pill tone="good">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Active
            </Pill>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setBellOpen((o) => !o)}
                aria-label="Notifications"
                aria-expanded={bellOpen}
                className="relative grid size-8 place-items-center border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Bell size={14} />
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center bg-blue-600 text-[9px] font-bold text-white">
                  {NOTIFICATIONS.length}
                </span>
              </button>
              {bellOpen ? (
                <div className="absolute right-0 top-10 z-50 w-80 border border-zinc-200 bg-white shadow-xl">
                  <p className="border-b border-zinc-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    What needs you
                  </p>
                  <ul>
                    {NOTIFICATIONS.map((n) => (
                      <li key={n.text} className="flex gap-2.5 border-b border-zinc-100 px-3 py-2.5 last:border-0">
                        <span
                          aria-hidden
                          className={`mt-1.5 size-1.5 shrink-0 ${
                            n.tone === "issue" || n.tone === "recovery" ? "bg-amber-500" : "bg-blue-600"
                          }`}
                        />
                        <span className="text-[12.5px] leading-snug text-zinc-700">{n.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <ButtonLink to="/ota/offer" variant="secondary">
              Direct booking offer
            </ButtonLink>
          </div>
        </div>
        <nav aria-label="OTA Buster sections" className="mx-auto max-w-[84rem] px-4 sm:px-6">
          <ul className="-mb-px flex gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as "/"}
                    className={`inline-block whitespace-nowrap border-b-2 px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
                      active
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-[84rem] px-4 pb-24 pt-8 sm:px-6">{children}</main>
    </div>
  );
}
