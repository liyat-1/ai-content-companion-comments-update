import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Building2, CalendarRange, Check, ChevronDown, Lightbulb, PenLine, RotateCcw, TrendingUp } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Sparkle } from "@/components/ai/Sparkle";
import { AiMark } from "./shared";
import { CAMPAIGN_PERF, MONTHS, MONTH_PERF, PUBLISHED_VERSIONS, useLibrary } from "@/lib/contentLibrary";

const card = "rounded-xl border border-border bg-card shadow-card";

function Page({ title, sub, actions, children }: { title: string; sub: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <MarketingShell title={`Content Library · ${title}`}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-[26px] font-semibold tracking-tight text-card-foreground">{title}</h2>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{sub}</p>
          </div>
          {actions}
        </div>
        <div className="mt-5 pb-16">{children}</div>
      </div>
    </MarketingShell>
  );
}

/** Month range picker: "Sep → Nov". */
export function TimeframeFilter({ range, onChange, min = 0 }: { range: { s: number; e: number }; onChange: (r: { s: number; e: number }) => void; min?: number }) {
  const sel = "appearance-none bg-transparent pr-4 text-[12.5px] font-semibold text-card-foreground outline-none cursor-pointer";
  return (
    <div className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 shadow-card">
      <CalendarRange size={14} className="text-brand" />
      <label className="relative flex items-center">
        <span className="sr-only">From</span>
        <select aria-label="From month" value={range.s} onChange={(e) => { const v = +e.target.value; onChange({ s: v, e: Math.max(v, range.e) }); }} className={sel}>
          {MONTHS.map((m, i) => i >= min && <option key={m} value={i}>{m}</option>)}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-0 text-muted-foreground" />
      </label>
      <span className="text-muted-foreground">→</span>
      <label className="relative flex items-center">
        <select aria-label="To month" value={range.e} onChange={(e) => { const v = +e.target.value; onChange({ s: Math.min(range.s, v), e: v }); }} className={sel}>
          {MONTHS.map((m, i) => i >= min && <option key={m} value={i}>{m}</option>)}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-0 text-muted-foreground" />
      </label>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex h-9 items-center rounded-md border border-border bg-muted/60 p-0.5">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={`h-8 rounded-[5px] px-3 text-[12px] font-semibold transition-all ${value === o.v ? "bg-card text-brand shadow-card" : "text-muted-foreground hover:text-foreground"}`}>{o.l}</button>
      ))}
    </div>
  );
}

function Delta({ now, before, suffix = "%" }: { now: number; before: number; suffix?: string }) {
  if (!before) return <span className="text-[11.5px] text-muted-foreground">New this year</span>;
  const d = ((now - before) / before) * 100;
  const up = d >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11.5px] font-semibold ${up ? "text-success" : "text-destructive"}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(d).toFixed(0)}{suffix} vs last year
    </span>
  );
}

/* =============================== Published =============================== */

export function PublishedPage() {
  const { campaigns } = useLibrary();
  const [range, setRange] = useState({ s: 0, e: 11 });
  const [who, setWho] = useState<"all" | "ai" | "human">("all");
  const [open, setOpen] = useState<string | null>("pv3");
  const [restored, setRestored] = useState<string | null>(null);
  const name = (id: string) => campaigns.find((c) => c.id === id)?.name ?? id;

  const list = PUBLISHED_VERSIONS.filter((p) => p.to >= range.s && p.from <= range.e && (who === "all" || (who === "ai") === p.ai));
  const live = PUBLISHED_VERSIONS.find((p) => p.live)!;
  const notUpdated = live.totalProps - live.aiProps - live.ownProps;

  return (
    <Page
      title="Published"
      sub="Every published version, the months it covers, and how many of your properties use it versus their own written content."
      actions={
        <div className="flex flex-wrap gap-2">
          <TimeframeFilter range={range} onChange={setRange} />
          <Segmented value={who} onChange={setWho} options={[{ v: "all", l: "All" }, { v: "ai", l: "AI written" }, { v: "human", l: "Human written" }]} />
        </div>
      }
    >
      {/* Adoption overview */}
      <section className={`${card} overflow-hidden`}>
        <div className="grid gap-px bg-border sm:grid-cols-4">
          {[
            { k: "Properties", v: live.totalProps, s: "In your portfolio", icon: Building2, tone: "text-card-foreground" },
            { k: "Using published content", v: live.aiProps, s: `${Math.round((live.aiProps / live.totalProps) * 100)}% · ${live.v} ${live.name.split("·")[1]?.trim()}`, icon: Sparkle, tone: "text-brand" },
            { k: "Using their own content", v: live.ownProps, s: "Written by the property team", icon: PenLine, tone: "text-card-foreground" },
            { k: "Not switched yet", v: notUpdated, s: "Still on an older version", icon: RotateCcw, tone: "text-warning" },
          ].map(({ k, v, s, icon: Icon, tone }) => (
            <div key={k} className="bg-card p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground"><Icon size={13} className={tone} />{k}</p>
              <p className={`mt-1 text-[26px] font-semibold tabular-nums ${tone}`}>{v}</p>
              <p className="text-[11.5px] text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 pt-3">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="ai-button" style={{ width: `${(live.aiProps / live.totalProps) * 100}%` }} />
            <div className="bg-foreground/70" style={{ width: `${(live.ownProps / live.totalProps) * 100}%` }} />
            <div className="bg-warning/60" style={{ width: `${(notUpdated / live.totalProps) * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-[11.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full ai-button" />Published content</span>
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-foreground/70" />Own content</span>
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-warning/60" />Not switched</span>
          </div>
        </div>
      </section>

      {/* Versions timeline */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-card-foreground">Versions <span className="ml-1 font-normal text-muted-foreground">{list.length} in {MONTHS[range.s]} → {MONTHS[range.e]}</span></h3>
      </div>
      {list.length === 0 && <div className={`${card} mt-3 p-8 text-center text-[13px] text-muted-foreground`}>Nothing was published for this timeframe.</div>}
      <ol className="relative mt-3 space-y-3 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-border">
        {list.map((p) => {
          const isOpen = open === p.id;
          const status = p.live ? { l: "Live now", c: "bg-success-soft text-success" } : p.note.startsWith("Scheduled") ? { l: "Scheduled", c: "bg-brand-soft text-brand" } : { l: p.note.startsWith("Archived") ? "Archived" : "Replaced", c: "bg-muted text-muted-foreground" };
          return (
            <li key={p.id} className="relative pl-12">
              <span className={`absolute left-0 top-4 grid size-10 place-items-center rounded-lg text-[12px] font-bold ${p.ai ? "ai-button" : "border border-border bg-card text-card-foreground"}`}>{p.v}</span>
              <div className={`${card} ${p.live ? "ai-edge" : ""}`}>
                <button onClick={() => setOpen(isOpen ? null : p.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 p-4 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-card-foreground">{p.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${status.c}`}>{status.l}</span>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">{p.ai && <Sparkle size={10} className="text-brand" />}{p.by}</span>·<span>Published {p.when}</span>·<span>Covers {MONTHS[p.from]} → {MONTHS[p.to]}</span>·<span>{p.campaigns.length} campaigns</span>
                    </span>
                  </span>
                  <span className="hidden w-48 sm:block">
                    <span className="flex justify-between text-[11px] text-muted-foreground"><span><b className="text-card-foreground">{p.aiProps}</b> using it</span><span><b className="text-card-foreground">{p.ownProps}</b> own</span></span>
                    <span className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-muted"><i className="ai-button" style={{ width: `${(p.aiProps / p.totalProps) * 100}%` }} /><i className="bg-foreground/60" style={{ width: `${(p.ownProps / p.totalProps) * 100}%` }} /></span>
                  </span>
                  <span className="w-16 text-right"><span className="block text-[15px] font-semibold tabular-nums text-card-foreground">{p.clickRate}%</span><span className="text-[10.5px] text-muted-foreground">click rate</span></span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ai-rise border-t border-border p-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Campaigns in this version</p>
                        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                          {p.campaigns.map((id, i) => {
                            const used = Math.max(4, p.aiProps - ((i * 3) % 11));
                            return (
                              <div key={id} className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2">
                                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-card-foreground">{name(id)}</span>
                                <span className="text-[11px] tabular-nums text-muted-foreground">{used}/{p.totalProps} properties</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Who uses it</p>
                        <p className="mt-2 text-[12.5px] text-card-foreground"><b>{p.aiProps}</b> properties send this version.</p>
                        <p className="text-[12.5px] text-card-foreground"><b>{p.ownProps}</b> kept their own written content.</p>
                        <p className="mt-1 text-[11.5px] text-muted-foreground">{p.note}</p>
                        {!p.live && (
                          <button onClick={() => setRestored(p.id)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-brand/40 bg-card px-3 py-2 text-[12px] font-semibold text-brand hover:bg-brand-soft">
                            {restored === p.id ? <><Check size={13} />Restored as a draft</> : <><RotateCcw size={13} />Restore this version</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}

/* ============================== Performance ============================== */

const money = (n: number) => `$${(n / 1000).toFixed(1)}k`;

export function PerformancePage() {
  const { campaigns } = useLibrary();
  const [view, setView] = useState<"overview" | "campaign" | "month">("overview");
  const [range, setRange] = useState({ s: 8, e: 10 });
  const [channel, setChannel] = useState<"all" | "email" | "text">("all");

  const months = MONTH_PERF.filter((m) => m.m >= range.s && m.m <= range.e);
  const sum = useMemo(() => months.reduce((a, m) => ({ sent: a.sent + m.sent, clicks: a.clicks + m.clicks, bookings: a.bookings + m.bookings, revenue: a.revenue + m.revenue, lyC: a.lyC + m.ly.clicks, lyB: a.lyB + m.ly.bookings, lyR: a.lyR + m.ly.revenue }), { sent: 0, clicks: 0, bookings: 0, revenue: 0, lyC: 0, lyB: 0, lyR: 0 }), [months]);
  const chMul = channel === "email" ? 0.62 : channel === "text" ? 0.38 : 1;
  const maxRev = Math.max(1, ...months.flatMap((m) => [m.revenue, m.ly.revenue]));
  const rate = (c: string) => { const p = CAMPAIGN_PERF[c]; return channel === "email" ? p.email : channel === "text" ? p.text : +(((p.email || p.text) + (p.text || p.email)) / 2).toFixed(1); };

  return (
    <Page
      title="Performance"
      sub="How your published content performs — overall, per campaign and per month — compared with last year. Sample figures for Holiday Inn Times Square."
      actions={
        <div className="flex flex-wrap gap-2">
          <TimeframeFilter range={range} onChange={setRange} min={6} />
          <Segmented value={channel} onChange={setChannel} options={[{ v: "all", l: "All" }, { v: "email", l: "Email" }, { v: "text", l: "Text" }]} />
        </div>
      }
    >
      <Segmented value={view} onChange={setView} options={[{ v: "overview", l: "Overview" }, { v: "campaign", l: "By campaign" }, { v: "month", l: "By month" }]} />

      {months.length === 0 && <div className={`${card} mt-4 p-8 text-center text-[13px] text-muted-foreground`}>No results yet for this timeframe — pick Jul to Nov.</div>}

      {months.length > 0 && view === "overview" && (
        <div className="ai-rise mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Messages sent", v: Math.round(sum.sent * chMul).toLocaleString(), d: null },
              { k: "Clicks", v: Math.round(sum.clicks * chMul).toLocaleString(), d: [sum.clicks, sum.lyC] },
              { k: "Bookings from content", v: Math.round(sum.bookings * chMul), d: [sum.bookings, sum.lyB] },
              { k: "Revenue", v: money(sum.revenue * chMul), d: [sum.revenue, sum.lyR] },
            ].map(({ k, v, d }) => (
              <div key={k} className={`${card} p-4`}>
                <p className="text-[11.5px] text-muted-foreground">{k}</p>
                <p className="mt-1 text-[24px] font-semibold tabular-nums text-card-foreground">{v}</p>
                {d ? <Delta now={d[0]} before={d[1]} /> : <span className="text-[11.5px] text-muted-foreground">{MONTHS[range.s]} → {MONTHS[range.e]}</span>}
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className={`${card} p-4`}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-card-foreground">Revenue from content</p>
                <span className="flex gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><i className="size-2 rounded-sm ai-button" />2026</span><span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-muted-foreground/30" />2025</span></span>
              </div>
              <div className="mt-4 flex h-48 items-end gap-4">
                {months.map((m) => (
                  <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end justify-center gap-1.5">
                      <div title={`2025: ${money(m.ly.revenue)}`} className="w-1/3 max-w-7 rounded-t-sm bg-muted-foreground/25" style={{ height: `${(m.ly.revenue / maxRev) * 100}%` }} />
                      <div title={`2026: ${money(m.revenue)}`} className="ai-rise w-1/3 max-w-7 rounded-t-sm ai-button" style={{ height: `${(m.revenue / maxRev) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{MONTHS[m.m]}</span>
                  </div>
                ))}
              </div>
            </div>
            <AiNotes range={range} />
          </div>
        </div>
      )}

      {months.length > 0 && view === "campaign" && (
        <div className={`ai-rise ${card} mt-4 overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-left text-[11.5px] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Campaign</th><th className="px-3 py-3 font-medium">Click rate</th><th className="px-3 py-3 font-medium">Direct</th><th className="px-3 py-3 font-medium">OTA</th><th className="px-3 py-3 font-medium">Bookings</th><th className="px-3 py-3 font-medium">vs last year</th><th className="px-4 py-3 font-medium">AI note</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.filter((c) => (channel === "all" || c.channels.includes(channel))).map((c) => {
                const p = CAMPAIGN_PERF[c.id];
                const r = rate(c.id);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3"><span className="font-semibold text-card-foreground">{c.name}</span><span className="block text-[11px] text-muted-foreground">{c.channels.map((x) => (x === "email" ? "Email" : "Text")).join(" + ")}</span></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2"><span className="w-10 font-semibold tabular-nums">{r}%</span><span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><i className="block h-full ai-button" style={{ width: `${Math.min(100, r * 7)}%` }} /></span></div></td>
                    <td className="px-3 py-3 tabular-nums">{p.direct}%</td>
                    <td className="px-3 py-3 tabular-nums">{p.ota}%</td>
                    <td className="px-3 py-3 tabular-nums">{p.bookings || "—"}</td>
                    <td className="px-3 py-3">{p.bookings ? <Delta now={p.bookings} before={p.ly} /> : <span className="text-[11.5px] text-muted-foreground">Service message</span>}</td>
                    <td className="max-w-[240px] px-4 py-3 text-[11.5px] text-muted-foreground">{p.direct - p.ota > 2 ? "OTA guests lag — try a stronger book-direct reason." : p.bookings > p.ly ? "Seasonal subject line is working. Keep it." : p.bookings ? "Flat on last year — test a new hero image." : "Healthy for an operational message."}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {months.length > 0 && view === "month" && (
        <div className="ai-rise mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {months.map((m) => {
            const up = m.bookings >= m.ly.bookings;
            return (
              <div key={m.m} className={`${card} p-4`}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-[20px] font-semibold text-card-foreground">{MONTHS[m.m]} 2026</p>
                  <Delta now={m.revenue} before={m.ly.revenue} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2">
                  {[["Clicks", Math.round(m.clicks * chMul), m.ly.clicks], ["Bookings", Math.round(m.bookings * chMul), m.ly.bookings], ["Revenue", money(m.revenue * chMul), money(m.ly.revenue)]].map(([k, v, ly]) => (
                    <div key={k as string} className="rounded-md bg-muted/50 px-2.5 py-2">
                      <dt className="text-[10.5px] text-muted-foreground">{k}</dt>
                      <dd className="text-[15px] font-semibold tabular-nums text-card-foreground">{v}</dd>
                      <dd className="text-[10.5px] text-muted-foreground">LY {ly}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 flex gap-2 rounded-md bg-brand-soft/60 px-3 py-2.5">
                  <Sparkle size={12} className="mt-0.5 shrink-0 text-brand" />
                  <p className="text-[12px] leading-relaxed text-card-foreground">
                    {m.m === 9 ? "Halloween and the conference lifted clicks. Direct guests booked 18% more." : m.m === 10 ? (up ? "Marathon weekend held demand." : "Marathon messaging went out late — bookings dipped vs last year. Send earlier next year.") : m.m === 8 ? "Autumn content beat last year; the rooftop image drove the most clicks." : up ? "Steady month, ahead of last year." : "Quieter than last year."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}

function AiNotes({ range }: { range: { s: number; e: number } }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const tries = [
    "Give OTA guests in 6–15 Months a clearer book-direct reason.",
    "Send Thanksgiving Parade content in mid-October, not November.",
    "Test the rooftop image against the lobby in After Last Visit.",
  ];
  return (
    <div className={`${card} ai-edge p-4`}>
      <div className="flex items-center gap-2"><AiMark size={26} /><p className="text-[13px] font-semibold text-card-foreground">Directful AI notes</p><span className="ml-auto text-[11px] text-muted-foreground">{MONTHS[range.s]} → {MONTHS[range.e]}</span></div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><TrendingUp size={12} />What happened</p>
      <ul className="mt-1.5 space-y-1.5 text-[12.5px] leading-relaxed text-card-foreground">
        <li>• Revenue from content is up <b className="text-success">19%</b> on last year, led by 3 Months and After Last Visit.</li>
        <li>• Seasonal subject lines out-clicked generic ones by <b>1.3 pts</b>.</li>
        <li>• November slipped slightly — event messages went out too late.</li>
      </ul>
      <p className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><Lightbulb size={12} />What to try next</p>
      <ul className="mt-1.5 space-y-1.5">
        {tries.map((t, i) => (
          <li key={t} className="flex items-start gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-[12.5px] text-card-foreground">
            <span className="min-w-0 flex-1">{t}</span>
            <button onClick={() => setDone((d) => new Set(d).add(i))} className={`shrink-0 rounded-sm px-2 py-0.5 text-[11px] font-semibold ${done.has(i) ? "text-success" : "text-brand hover:bg-brand-soft"}`}>{done.has(i) ? "Added ✓" : "Add to plan"}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
