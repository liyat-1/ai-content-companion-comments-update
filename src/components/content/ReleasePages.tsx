import { useMemo, useState } from "react";
import { CalendarRange, Check, ChevronDown, GitCompareArrows, Layers, Mail, MessageSquare, Sparkles, TrendingDown, TrendingUp, Users } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { useMarketing } from "@/lib/marketing";
import { PastVersionReview } from "./PastVersionReview";
import { PAST_CAMPAIGN_COPY } from "@/lib/pastCampaignCopy";
import { useCalendar, fmtRange, isCurrent, type ContentPeriod } from "@/lib/calendar";
import { EVENT_IMAGES } from "@/components/content/eventImages";
import { ACTIVE_RELEASE_ID, RELEASES, TOTAL_PROPERTIES, campaignProperties, useSelectedRelease, type Release } from "@/lib/releases";
import { CAMPAIGN_IDS, adoptionSentence, baseline, isPending, periodInsight, periodStat, releaseCoversToday, releasePeriods, releaseRange, type Compare, type Stat } from "@/lib/releaseResults";

const panel = "rounded-lg border border-border bg-card shadow-card";

function statusLabel(r: Release) {
  if (r.id === ACTIVE_RELEASE_ID) return "Live now";
  if (r.id === "default") return "Live fallback";
  return r.status;
}
function coverageNote(r: Release) {
  if (r.id.startsWith("default")) return "Year-round fallback — serves any date no seasonal publication covers";
  return `Seasonal — replaces the year-round content only from ${releaseRange(r)}`;
}

function PublicationPicker({ release, onSelect }: { release: Release; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const years = Array.from(new Set(RELEASES.map((r) => r.year))).sort((a, b) => b - a);
  return (
    <section className={`${panel} relative`} aria-label="Selected publication">
      <button type="button" onClick={() => setOpen((v) => !v)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 text-left sm:p-5">
        <span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand"><CalendarRange size={18} /></span>
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase text-muted-foreground">Content you are reviewing</span>
          <span className="mt-1 block truncate text-[17px] font-semibold text-card-foreground">{release.name}</span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{coverageNote(release)}</span>
        </span>
        <span className="flex items-center gap-3"><span className={`hidden rounded-sm px-2 py-1 text-[10px] font-semibold sm:inline ${release.id === ACTIVE_RELEASE_ID ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>{statusLabel(release)}</span><ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} /></span>
      </button>
      {open && <div className="border-t border-border p-3 sm:p-4">
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] leading-5 text-card-foreground"><strong>Year-round fallback</strong> never switches off. It serves every date that no seasonal publication covers.</p>
          <p className="rounded-md border border-brand/15 bg-brand-soft/35 px-3 py-2 text-[11px] leading-5 text-card-foreground"><strong>Seasonal publications</strong> replace the fallback only for their exact dates, then it takes over again.</p>
        </div>
        {years.map((year) => <div key={year} className="mb-4 last:mb-0"><p className="mb-2 px-2 text-[10px] font-bold text-muted-foreground">{year}</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{RELEASES.filter((r) => r.year === year).map((r) => <Button type="button" variant="ghost" key={r.id} onClick={() => { onSelect(r.id); setOpen(false); }} className={`h-auto min-w-0 justify-start rounded-md border p-3 text-left ${r.id === release.id ? "border-brand bg-brand-soft/45" : "border-border hover:border-brand/40"}`}><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[12.5px] font-semibold text-card-foreground">{r.name}</span>{r.id === release.id && <Check size={14} className="shrink-0 text-brand" />}</span><span className="mt-1 block text-[10.5px] font-normal text-muted-foreground">{r.id.startsWith("default") ? "Year-round fallback" : `Seasonal · ${releaseRange(r)}`} · {statusLabel(r)}</span></span></Button>)}</div></div>)}
      </div>}
    </section>
  );
}

const Delta = ({ d }: { d: number }) => <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10.5px] font-semibold ${d >= 0 ? "bg-brand-soft text-brand" : "bg-destructive/10 text-destructive"}`}>{d >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{d >= 0 ? "+" : ""}{d.toFixed(1)} pts</span>;

function avg(stats: Stat[]): Stat {
  const n = stats.length || 1;
  const s = stats.reduce((a, b) => ({ click: a.click + b.click, book: a.book + b.book, spam: a.spam + b.spam }), { click: 0, book: 0, spam: 0 });
  return { click: +(s.click / n).toFixed(1), book: +(s.book / n).toFixed(1), spam: +(s.spam / n).toFixed(2) };
}

function CompareTabs({ value, onChange, date, onDate }: { value: Compare; onChange: (c: Compare) => void; date: string; onDate: (d: string) => void }) {
  const tabs: [Compare, string][] = [["previous", "Previous content"], ["lastYear", "Last year"], ["custom", "Specific date"]];
  return <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-medium text-muted-foreground">Compare with</span><div role="tablist" className="flex rounded-md border border-border bg-muted/40 p-0.5">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={`rounded-[5px] px-3 py-1.5 text-[11.5px] font-semibold ${value === k ? "bg-card text-card-foreground shadow-card" : "text-muted-foreground hover:text-card-foreground"}`}>{l}</button>)}</div>{value === "custom" && <input type="date" aria-label="Comparison date" value={date} onChange={(e) => onDate(e.target.value)} className="h-8 rounded-md border border-border bg-card px-2 text-[11.5px] text-card-foreground" />}</div>;
}

function Overview({ release, periods, compare, date }: { release: Release; periods: ContentPeriod[]; compare: Compare; date: string }) {
  const live = periods.filter((p) => !isPending(p));
  const cur = avg(live.map((p) => periodStat(p)));
  const base = avg(live.map((p) => baseline(periods, p, compare, date).stat));
  const current = periods.find(isCurrent);
  const eventLed = live.filter((p) => p.kind !== "Standard").length;
  const d = cur.click - base.click;
  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="h-1 bg-brand" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase text-brand">{release.source} · {releaseRange(release)}</p>
            <h2 className="mt-1 text-[22px] font-semibold text-card-foreground">{current ? <>You are in <span className="text-brand">{current.name}</span> today</> : release.name}</h2>
            <p className="mt-1 text-[11.5px] text-muted-foreground">{periods.length} content {periods.length === 1 ? "category" : "categories"} in this timeframe{current ? ` · current runs ${fmtRange(current.start, current.end)}` : ""}</p>
          </div>
        </div>
        {live.length ? <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <article className="rounded-md border border-border p-4"><p className="flex items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground"><Users size={12} />Properties using it</p><p className="mt-2 text-[25px] font-semibold text-card-foreground">{release.properties}<span className="text-[13px] font-normal text-muted-foreground"> / {TOTAL_PROPERTIES}</span></p><p className="mt-1 text-[10.5px] text-muted-foreground">{TOTAL_PROPERTIES - release.properties ? `${TOTAL_PROPERTIES - release.properties} kept their own content` : "Every property"}</p></article>
          {([["Click rate", cur.click, base.click, "%"], ["Click-to-book", cur.book, base.book, "%"], ["Spam rate", cur.spam, base.spam, "%"]] as const).map(([l, v, b]) => <article key={l} className="rounded-md border border-border p-4"><p className="text-[10.5px] font-medium text-muted-foreground">{l}</p><p className="mt-2 text-[25px] font-semibold text-card-foreground">{v}%</p><p className="mt-1 text-[10.5px] text-muted-foreground">was {b}%</p></article>)}
        </div> : <p className="mt-5 rounded-md bg-muted/50 p-4 text-[12px] text-muted-foreground">This publication hasn't started sending yet — results appear once its first period begins.</p>}
        {live.length > 0 && <div className="mt-4 flex gap-3 rounded-md bg-brand-soft/40 p-4"><Sparkles size={16} className="mt-0.5 shrink-0 text-brand" /><div className="text-[12px] leading-5 text-card-foreground"><p className="font-semibold">AI insight for this publication <Delta d={d} /></p><p className="mt-1">{d >= 0 ? `Overall click rate is ${d.toFixed(1)} pts ahead. ${eventLed} of ${live.length} live categories are tied to an event or season, and those carry most of the lift.` : `Overall click rate is ${Math.abs(d).toFixed(1)} pts behind.`} {compare === "previous" ? "The content before it ran as standard year-round content with no event attached, which explains why it trailed." : compare === "lastYear" ? "Last year's equivalent content named fewer specific events." : "Travel demand also differs between the two dates, so not all movement comes from the content."}</p></div></div>}
      </div>
    </section>
  );
}

function Categories({ periods, selected, onSelect, compare, date }: { periods: ContentPeriod[]; selected: string; onSelect: (id: string) => void; compare: Compare; date: string }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2"><Layers size={15} className="text-brand" /><h3 className="text-[15px] font-semibold text-card-foreground">Content categories in this timeframe</h3></div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {periods.map((p) => {
          const pending = isPending(p); const s = periodStat(p); const b = baseline(periods, p, compare, date).stat;
          const img = p.eventId ? EVENT_IMAGES[p.eventId] : undefined; const active = p.id === selected;
          return <button key={p.id} type="button" onClick={() => onSelect(p.id)} className={`${panel} w-[230px] shrink-0 overflow-hidden text-left transition ${active ? "ring-2 ring-brand" : "hover:border-brand/40"}`}>
            <div className="relative h-20 bg-gradient-to-br from-brand-soft to-muted">{img && <img src={img} alt="" className="h-full w-full object-cover" />}<span className="absolute left-2 top-2 rounded-sm bg-card/90 px-1.5 py-0.5 text-[9.5px] font-semibold text-card-foreground">{p.kind}</span>{isCurrent(p) && <span className="absolute right-2 top-2 rounded-sm bg-brand px-1.5 py-0.5 text-[9.5px] font-semibold text-brand-foreground">Current</span>}</div>
            <div className="p-3"><p className="truncate text-[12.5px] font-semibold text-card-foreground">{p.name}</p><p className="text-[10.5px] text-muted-foreground">{fmtRange(p.start, p.end)}</p>
              <div className="mt-2 flex items-center justify-between">{pending ? <span className="text-[10.5px] text-muted-foreground">Starts {fmtRange(p.start, p.start)}</span> : <><span className="text-[15px] font-semibold text-card-foreground">{s.click}%<span className="ml-1 text-[9.5px] font-normal text-muted-foreground">click</span></span><Delta d={s.click - b.click} /></>}</div></div>
          </button>;
        })}
      </div>
    </section>
  );
}

function CategoryDetail({ release, periods, period, compare, date }: { release: Release; periods: ContentPeriod[]; period: ContentPeriod; compare: Compare; date: string }) {
  const { campaigns } = useMarketing();
  const [reviewId, setReviewId] = useState<string | null>(null);
  const pending = isPending(period);
  const base = baseline(periods, period, compare, date);
  const cur = periodStat(period);
  return (
    <section className="space-y-3">
      <div className="border-b border-border pb-4">
        <p className="text-[10.5px] font-semibold uppercase text-muted-foreground">{period.kind} · {fmtRange(period.start, period.end)}</p>
        <h3 className="mt-1 text-[18px] font-semibold text-card-foreground">{period.name}</h3>
        {pending ? <p className="mt-2 text-[12px] text-muted-foreground">This category starts {fmtRange(period.start, period.start)} — results will be tracked from that day.</p>
          : <div className="mt-3 flex gap-3 rounded-md bg-brand-soft/40 p-3"><Sparkles size={15} className="mt-0.5 shrink-0 text-brand" /><p className="text-[12px] leading-5 text-card-foreground"><strong>AI insight:</strong> {periodInsight(period, base, cur)} <span className="text-muted-foreground">(vs {base.label})</span></p></div>}
      </div>
      {!pending && <div className="grid gap-4 lg:grid-cols-2">
        {CAMPAIGN_IDS.map((id) => {
          const c = campaigns.find((x) => x.id === id); const name = c?.name ?? id;
          const s = periodStat(period, id); const b = baseline(periods, period, compare, date, id); const d = s.click - b.stat.click;
          const used = campaignProperties(release.id, id);
          return <article key={id} className={`${panel} overflow-hidden`}>
            <div className={`h-1 ${d < 0 ? "bg-warning" : "bg-brand"}`} />
            <div className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">{c?.strategy === "text" ? <MessageSquare size={14} /> : <Mail size={14} />}</span><div className="min-w-0"><p className="truncate text-[14px] font-semibold text-card-foreground">{name}</p><p className="text-[11px] text-muted-foreground">{c?.timing ?? "Scheduled"}</p></div></div><Delta d={d} /></div>
            <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border py-3 text-[10px] text-muted-foreground">{([["Click rate", s.click, b.stat.click], ["Click-to-book", s.book, b.stat.book], ["Spam rate", s.spam, b.stat.spam]] as const).map(([l, v, p]) => <div key={l} className="px-3 first:pl-0"><p>{l}</p><p className="mt-1 text-[20px] font-semibold text-card-foreground">{v}%</p><p>previous {p}%</p></div>)}</div>
            <div className="mt-4 flex items-center gap-2"><Users size={13} className="shrink-0 text-muted-foreground" /><p className="text-[11.5px] text-card-foreground">{adoptionSentence(release.id, name, id)}</p></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-brand" style={{ width: `${(used / TOTAL_PROPERTIES) * 100}%` }} /></div>
            <div className={`mt-4 flex gap-2 border-l-2 p-3 ${d < 0 ? "border-warning bg-warning-soft/40" : "border-brand bg-brand-soft/35"}`}><Sparkles size={14} className={`mt-0.5 shrink-0 ${d < 0 ? "text-warning" : "text-brand"}`} /><div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Content insight</p><p className="mt-1 text-[11.5px] leading-5 text-card-foreground">{d < 0 && PAST_CAMPAIGN_COPY[id] ? `A previous ${name} version performed better. ${PAST_CAMPAIGN_COPY[id].learned}` : periodInsight(period, b, s)}</p></div></div>
            {d < 0 && compare === "previous" && PAST_CAMPAIGN_COPY[id] && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="max-w-[260px] text-[11px] leading-4 text-muted-foreground">Review the current and past copy before using what worked.</p><Button size="sm" variant="brand" onClick={() => setReviewId(id)}><GitCompareArrows size={14} />Review & use this version</Button></div>}
          </div></article>;
        })}
      </div>}
      {reviewId && <PastVersionReview key={`${reviewId}-${period.id}`} campaignId={reviewId} period={period} currentRate={periodStat(period, reviewId).click} previousRate={baseline(periods, period, compare, date, reviewId).stat.click} onClose={() => setReviewId(null)} />}
    </section>
  );
}

function ResultsWorkspace() {
  const [selectedId, setSelectedId] = useSelectedRelease();
  const { events } = useCalendar();
  const release = RELEASES.find((r) => r.id === selectedId) ?? RELEASES[0];
  const periods = useMemo(() => releasePeriods(release, events), [release, events]);
  const [compare, setCompare] = useState<Compare>("previous");
  const [date, setDate] = useState("2025-09-29");
  const [pick, setPick] = useState<string | null>(null);
  const period = periods.find((p) => p.id === pick) ?? periods.find(isCurrent) ?? periods.find((p) => !isPending(p)) ?? periods[0];
  const select = (id: string) => { setSelectedId(id); setPick(null); };
  return (
    <MarketingShell title="Results">
      <main className="mx-auto max-w-[1180px] space-y-5 px-4 pb-16 pt-6 sm:px-6">
         <header className="border-b border-border pb-5"><p className="text-[10.5px] font-semibold uppercase text-brand">Content / Results</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">Content results</h1><p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">Explore how each publication and campaign performed, and carry forward what worked.</p></header>
        <PublicationPicker release={release} onSelect={select} />
        <CompareTabs value={compare} onChange={setCompare} date={date} onDate={setDate} />
        <Overview release={release} periods={periods} compare={compare} date={date} />
        <Categories periods={periods} selected={period.id} onSelect={setPick} compare={compare} date={date} />
        <CategoryDetail release={release} periods={periods} period={period} compare={compare} date={date} />
      </main>
    </MarketingShell>
  );
}

export function ReleasesPage() { return <ResultsWorkspace />; }
export function ResultsPage() { return <ResultsWorkspace />; }
