import { Wifi, BatteryFull, SignalHigh } from "lucide-react";

/**
 * iPhone 17 Pro Max frame: slim polished titanium rail, hairline bezel,
 * refined Dynamic Island and soft glass reflections. API unchanged.
 */
export function PhoneMockup({
  children,
  scale = 1,
  statusBar = true,
  time = "9:41",
  chrome,
  footer,
  contentClassName = "bg-white",
}: {
  children: React.ReactNode;
  scale?: number;
  statusBar?: boolean;
  time?: string;
  chrome?: React.ReactNode;
  /** Pinned below the scrolling content, above the home indicator. */
  footer?: React.ReactNode;
  contentClassName?: string;
}) {
  // iPhone 17 Pro Max logical screen.
  const W = 440;
  const H = 956;
  return (
    <div className="relative" style={{ width: W * scale, height: H * scale }} aria-hidden={false}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        {/* Outer titanium rail */}
        <div
          className="relative size-full rounded-[4.4rem] p-[2.5px] shadow-[0_70px_150px_-40px_rgba(9,9,11,0.6),0_28px_64px_-25px_rgba(9,9,11,0.5)]"
          style={{
            background:
              "linear-gradient(150deg,#f4f4f5 0%,#c8c8cd 12%,#71717a 38%,#3f3f46 52%,#8e8e95 74%,#e4e4e7 100%)",
          }}
        >
          {/* Rail highlight rings */}
          <div className="pointer-events-none absolute inset-[2.5px] rounded-[4.25rem] ring-[1.5px] ring-inset ring-white/15" />
          <div className="pointer-events-none absolute inset-[3.5px] rounded-[4.2rem] ring-[1px] ring-inset ring-black/35" />

          {/* Side buttons — thin, action button + volume on the left */}
          <span className="absolute -left-[2.5px] top-[150px] h-[32px] w-[2.5px] rounded-l bg-gradient-to-r from-zinc-300 to-zinc-600 shadow-[inset_-1px_0_0_rgba(0,0,0,0.35)]" />
          <span className="absolute -left-[2.5px] top-[208px] h-[58px] w-[2.5px] rounded-l bg-gradient-to-r from-zinc-300 to-zinc-600 shadow-[inset_-1px_0_0_rgba(0,0,0,0.35)]" />
          <span className="absolute -left-[2.5px] top-[282px] h-[58px] w-[2.5px] rounded-l bg-gradient-to-r from-zinc-300 to-zinc-600 shadow-[inset_-1px_0_0_rgba(0,0,0,0.35)]" />
          <span className="absolute -right-[2.5px] top-[240px] h-[92px] w-[2.5px] rounded-r bg-gradient-to-l from-zinc-300 to-zinc-600 shadow-[inset_1px_0_0_rgba(0,0,0,0.35)]" />

          {/* Bezel — hairline on the 17 series */}
          <div className="relative size-full overflow-hidden rounded-[4.15rem] bg-black p-[4px]">
            {/* Screen */}
            <div
              className={`relative flex size-full flex-col overflow-hidden rounded-[3.9rem] ring-1 ring-inset ring-white/5 ${contentClassName}`}
            >
              {statusBar && (
                <div className="relative z-20 flex h-[56px] shrink-0 items-end justify-between px-10 pb-1.5">
                  <span className="text-[16px] font-semibold tracking-tight text-zinc-900">
                    {time}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-900">
                    <SignalHigh size={16} strokeWidth={2.5} />
                    <Wifi size={16} strokeWidth={2.5} />
                    <BatteryFull size={20} strokeWidth={2} />
                  </div>
                </div>
              )}

              {/* Dynamic Island */}
              <div className="pointer-events-none absolute left-1/2 top-[12px] z-30 h-[36px] w-[126px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_2px_rgba(255,255,255,0.04)]">
                <span className="absolute right-3.5 top-1/2 size-[10px] -translate-y-1/2 rounded-full bg-[#0a0a0f] ring-[1.5px] ring-zinc-800/70">
                  <span className="absolute inset-[2px] rounded-full bg-gradient-to-br from-zinc-700/60 to-transparent" />
                </span>
                <span className="absolute left-4 top-1/2 size-[6px] -translate-y-1/2 rounded-full bg-zinc-800/70" />
              </div>

              {/* Subtle glass reflection */}
              <div
                className="pointer-events-none absolute inset-0 z-40 rounded-[3.9rem]"
                style={{
                  background:
                    "linear-gradient(115deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0) 22%,rgba(255,255,255,0) 78%,rgba(255,255,255,0.05) 100%)",
                }}
              />

              {chrome}

              <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {children}
              </div>

              {footer && <div className="relative z-20 shrink-0">{footer}</div>}

              {/* Home indicator */}
              <div className="relative z-20 flex h-7 shrink-0 items-center justify-center">
                <span className="h-[5px] w-[140px] rounded-full bg-zinc-900/85" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
