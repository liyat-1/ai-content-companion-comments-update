import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, FlaskConical, Mail, MessageSquare, Pencil, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
import { TestCampaignDialog } from "@/components/marketing/MarketingDialogs";
import { Button } from "@/components/ui/button";
import { STRATEGY_LABEL, lastEdit, strategyHasEmail, useMarketing, type MarketingCampaign } from "@/lib/marketing";
import { EDITOR_ID, MONTH_PACKAGES, packageSnippet, publishDraftRelease, useLibrary, type Channel, type LibraryCampaign, type MonthPackage, type Segment } from "@/lib/contentLibrary";
import { Sparkle } from "@/components/ai/Sparkle";
import { toast } from "sonner";
import { History, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RISK, resetReviewed, riskFor, setDismissed, topRelease, useReleaseUi, versionsFor, type Release } from "@/lib/releases";
import { AiCreateStudio } from "./AiCreateStudio";
import { ReviewWorkspace } from "./ReviewWorkspace";
import { StarterScreen } from "./StarterScreen";
import { PeriodKindBadge } from "./PeriodTimeline";
import { TODAY, buildPeriods, fmtRange, isCurrent, useCalendar } from "@/lib/calendar";

const START_MONTH = 8;
const GROUP_LABEL: Record<MarketingCampaign["group"], string> = { invites: "Automated Invites", transactional: "Automated Transactional", in_property: "In-Property Transactional" };

function PublishedCard({ campaign, libraryCampaign, pack, draft, month, monthName, release, forceChannel, reviewed, onEdit, onTest, onReview }: { campaign: MarketingCampaign; libraryCampaign?: LibraryCampaign; pack: MonthPackage; draft: boolean; month: number; monthName: string; release: Release; forceChannel?: Channel; reviewed: boolean; onEdit: () => void; onTest: () => void; onReview?: () => void }) {
  const edit = lastEdit(campaign);
  const channels: Channel[] = strategyHasEmail(campaign.strategy) ? ["text", "email"] : ["text"];
  const [ownChannel, setChannel] = useState<Channel>(channels[0]);
  const channel = forceChannel && channels.includes(forceChannel) ? forceChannel : ownChannel;
  const [segment, setSegment] = useState<Segment>("direct");
  const [history, setHistory] = useState(false);
  const versions = versionsFor(campaign.id, month);
  const live = versions[0];
  const risk = RISK[riskFor(campaign.id)];
  const fallback = libraryCampaign ? packageSnippet(libraryCampaign, pack, segment) : STRATEGY_LABEL[campaign.strategy];
  const content = libraryCampaign ? channel === "email" ? libraryCampaign.content[segment].email.subject : libraryCampaign.content[segment].text : fallback;
  const manual = live.kind === "Manual edit" && !draft;
  return <article className={`group flex min-h-[286px] flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift ${draft ? "border-dashed border-brand/50" : "border-border"}`}>
    {draft && <div className="flex items-center justify-between border-b border-brand/15 bg-brand-soft/50 px-4 py-2 text-[11px] font-semibold"><span className="flex items-center gap-1.5 text-card-foreground"><span className={`size-2 rounded-full ${risk.dot}`} />{risk.label}</span><span className="flex items-center gap-1 text-brand"><Sparkle size={11} />AI generated</span></div>}
    <div className="flex-1 p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">{campaign.strategy === "text" ? <MessageSquare size={15} /> : <Mail size={15} />}</span><div className="min-w-0"><h3 className="truncate text-[15px] font-semibold text-card-foreground">{campaign.name}</h3><p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><Clock3 size={12} />{campaign.timing}</p></div></div><div className="flex shrink-0 items-center gap-1"><span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">v{draft ? live.v + 1 : live.v}</span>{!draft && <span className="rounded-sm bg-brand-soft px-1.5 py-1 text-[10px] font-semibold text-brand">Live</span>}</div></div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3"><div className="flex gap-1">{channels.map((value) => <Button key={value} size="sm" variant={channel === value ? "secondary" : "ghost"} className="h-7 px-2 text-[10.5px]" onClick={() => setChannel(value)}>{value === "email" ? <Mail size={11} /> : <MessageSquare size={11} />}{value === "email" ? "Email" : "Text"}</Button>)}</div><div className="flex gap-1">{(["direct", "ota"] as Segment[]).map((value) => <Button key={value} size="sm" variant={segment === value ? "secondary" : "ghost"} className="h-7 px-2 text-[10.5px]" onClick={() => setSegment(value)}>{value === "direct" ? "Direct" : "OTA"}</Button>)}</div></div>
      <div className="mt-3 rounded-md bg-canvas px-3 py-3"><p className="mb-1.5 text-[9.5px] font-semibold uppercase text-muted-foreground">{STRATEGY_LABEL[campaign.strategy]}</p><p className="line-clamp-3 min-h-12 text-[12px] leading-relaxed text-card-foreground">“{content}”</p></div></div>
    {!draft && <div className="mt-3 flex items-center gap-2 px-4 pb-3 text-[11px] text-muted-foreground">{manual || edit ? <><span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand">{(manual ? live.by : edit!.by).split(" ").map((n) => n[0]).join("")}</span><span className="truncate">Updated · {manual ? live.by : edit!.by} · {manual ? "yesterday" : "recently"}</span></> : <span className="inline-flex items-center gap-1 font-semibold text-brand"><Sparkle size={11} />AI generated</span>}</div>}
    <div className="flex gap-2 border-t border-border p-2">{draft ? <Button variant="brand" size="sm" className="w-full" onClick={onReview}>Review</Button> : <><Button variant="ghost" size="sm" onClick={onTest}><FlaskConical size={14} />Test</Button><Button variant="brand" size="sm" className="flex-1" onClick={onEdit}><Pencil size={14} />Edit content</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label="More actions"><MoreHorizontal size={15} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setHistory(true)}><History size={14} />Version history</DropdownMenuItem></DropdownMenuContent></DropdownMenu></>}</div>
    <Dialog open={history} onOpenChange={setHistory}><DialogContent><DialogHeader><DialogTitle>{campaign.name} · {monthName}</DialogTitle><DialogDescription>Using a previous version creates a new current version, then goes to Review before publishing.</DialogDescription></DialogHeader><ol className="divide-y divide-border rounded-md border border-border">{versions.map((v, i) => <li key={v.v} className="flex items-center gap-3 px-3 py-2.5"><span className="grid size-8 place-items-center rounded-sm bg-muted text-[11.5px] font-bold">v{v.v}</span><span className="min-w-0 flex-1 text-[12px]"><span className="block font-semibold text-card-foreground">{v.kind} · {v.by} · {v.when}</span><span className="block text-muted-foreground">{v.note} · {v.properties} properties</span></span>{i === 0 ? <span className="text-[11px] font-semibold text-brand">Live</span> : <Button size="sm" variant="outline" onClick={() => { setHistory(false); toast.success(`v${versions[0].v + 1} created as a copy of v${v.v} — sent to Review.`); }}>Use this version</Button>}</li>)}</ol></DialogContent></Dialog>
  </article>;
}

export function CreateWorkspace() {
  const [studio, setStudio] = useState(false);
  const [studioMinimized, setStudioMinimized] = useState(false);
  const [entered, setEntered] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const ui = useReleaseUi();
  const [filter, setFilter] = useState<"attention" | "all" | "reviewed">("all");
  const [show, setShow] = useState<Channel>("text");
  const [conflict, setConflict] = useState(false);
  const mk = useMarketing();
  const { campaigns: libraryCampaigns } = useLibrary();
  const { events } = useCalendar();
  const hasDrafts = libraryCampaigns.some((campaign) => campaign.status === "Needs review" || campaign.status === "Approved");
  const periods = useMemo(() => buildPeriods(events, TODAY, "2026-12-31"), [events]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const currentPeriod = periods.findIndex(isCurrent);
  const periodIndex = selectedPeriod && periods.some((p) => p.id === selectedPeriod) ? periods.findIndex((p) => p.id === selectedPeriod) : Math.max(0, currentPeriod);
  const period = periods[periodIndex];
  const month = period ? Number(period.start.slice(5, 7)) - 1 : START_MONTH;
  const year = period ? Number(period.start.slice(0, 4)) : 2026;
  const monthName = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));
  const packages = useMemo(() => MONTH_PACKAGES.filter((pack) => pack.month === month && pack.year === year), [month, year]);
  const [selectedPackages, setSelectedPackages] = useState<Record<string, string>>({ "8-2026": "sep-live", "9-2026": "oct-ai", "10-2026": "nov-default", "11-2026": "dec-default" });
  const selectedPack = packages.find((pack) => pack.id === selectedPackages[`${month}-${year}`]) ?? packages[0] ?? { id: "default", month, year, label: "Original year-round", version: "v1", source: "default" as const, status: isCurrent(period) ? ("Live now" as const) : ("Scheduled" as const), note: period?.reason ?? "Fallback content" };
  const reviewId = (id: string) => libraryCampaigns.find((campaign) => EDITOR_ID[campaign.id] === id && (campaign.status === "Needs review" || campaign.status === "Approved"))?.id;
  const top = topRelease(month, Boolean(ui.reverted[month]));
  const personalize = selectedPack.source === "default" || (month === 8 && selectedPack.id === "sep-live");
  const publish = (range: string) => { const count = publishDraftRelease(range); setStudio(false); setNotice(`${count} campaigns published as the ${range} release.`); };

  return <MarketingShell title="Content Library"><main className={`mx-auto px-4 pb-20 pt-6 sm:px-6 ${studioMinimized ? "grid max-w-[1540px] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]" : studio ? "max-w-[1500px]" : "max-w-7xl"}`}>
    {entered && (!studio || studioMinimized) && <header className={`grid min-w-0 gap-4 pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end ${studioMinimized ? "xl:col-span-2" : ""}`}><div className="min-w-0"><p className="text-[11px] font-semibold uppercase text-brand">Content Library</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:truncate sm:text-[36px]">Published content</h1><p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">View and refine the messages currently reaching your guests.</p></div><Button className="w-fit shrink-0" variant="brand" onClick={() => { setStudio(true); setStudioMinimized(false); }}><Sparkles size={15} />Update with AI</Button></header>}
    {!entered && !studio && <StarterScreen onLocalize={() => { setEntered(true); setStudio(true); setStudioMinimized(false); }} onKeep={() => setEntered(true)} />}
    {notice && <div role="status" className="mb-4 rounded-md bg-brand-soft p-3 text-[12px] font-medium text-brand">{notice}</div>}
    {studio && <div className={studioMinimized ? "order-2 min-w-0 xl:sticky xl:top-4" : ""}><AiCreateStudio minimized={studioMinimized} onMinimize={() => setStudioMinimized((value) => !value)} onClose={() => { setStudio(false); setStudioMinimized(false); }} onReview={() => { setStudio(false); setStudioMinimized(false); setNotice(""); }} /></div>}
    {entered && (!studio || studioMinimized) && <section className={`overflow-hidden rounded-lg border border-border bg-card shadow-card ${studioMinimized ? "order-1 min-w-0" : ""}`} aria-label="Monthly published content">
      <div className="ai-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-5 sm:px-6"><Button variant="outline" size="icon" aria-label="Previous content period" disabled={periodIndex <= 0} onClick={() => setSelectedPeriod(periods[periodIndex - 1]?.id ?? null)}><ChevronLeft /></Button><div className="min-w-0 text-center"><p className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase text-brand"><CalendarDays size={13} />Content schedule</p><h2 className="mt-1 text-[22px] font-semibold text-card-foreground">{monthName} {year}</h2>{period && <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2"><PeriodKindBadge kind={period.kind} /><span className={`rounded-sm px-2 py-1 text-[10px] font-semibold ${isCurrent(period) ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"}`}>{isCurrent(period) ? "Current" : "Scheduled"}</span><span className="text-[11px] font-medium text-muted-foreground">{period.name} · {fmtRange(period.start, period.end)} · {selectedPack.version}</span></div>}{period && <p className="mx-auto mt-1.5 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">{period.reason}</p>}{period?.windowNote && <p className="mt-1 text-[10.5px] text-brand">{period.windowNote}</p>}</div><Button variant="outline" size="icon" aria-label="Next content period" disabled={periodIndex >= periods.length - 1} onClick={() => setSelectedPeriod(periods[periodIndex + 1]?.id ?? null)}><ChevronRight /></Button></div>
      <div className="space-y-10 p-4 sm:p-6">
        {!hasDrafts && top.id === "default" && !ui.dismissed[month] && <div className="relative overflow-hidden rounded-lg border border-brand/20 ai-surface px-5 py-6 shadow-card sm:px-7"><div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground shadow-card"><Sparkle size={20} /></span><div><p className="text-[10.5px] font-semibold uppercase text-brand">{monthName} {year}</p><h2 className="mt-1 font-display text-[21px] font-semibold text-card-foreground">Personalize {monthName} for the season</h2><p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">These {monthName} campaigns are the same as the rest of the year. Personalize the campaigns below and schedule them for the season.</p></div></div><div className="flex gap-2"><Button variant="ghost" onClick={() => setDismissed(month, true)}>Keep current content</Button><Button variant="brand" onClick={() => { setStudio(true); setStudioMinimized(false); }}><Sparkle size={14} />Personalize with AI</Button></div></div></div>}
        {!hasDrafts && top.id === "default" && ui.dismissed[month] && <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-5 py-2.5 text-[12px] text-muted-foreground">Using year-round content · <button className="font-semibold text-brand" onClick={() => { setStudio(true); setStudioMinimized(false); }}>Personalize</button></div>}
        {hasDrafts && <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand/20 bg-brand-soft/40 px-5 py-4 shadow-card"><div className="flex-1"><p className="text-[13px] font-semibold text-card-foreground">Your generated content is ready</p><p className="text-[11.5px] text-muted-foreground">Open any campaign below to review it if you like, or publish now.</p></div><span className="text-[11.5px] text-muted-foreground">Show:</span>{(["text", "email"] as Channel[]).map((c) => <Button key={c} size="sm" variant={show === c ? "secondary" : "ghost"} onClick={() => setShow(c)}>{c === "text" ? "Text" : "Email"}</Button>)}<Button variant="brand" onClick={() => setConflict(true)}>Publish</Button></div>}
        {(["invites", "transactional", "in_property"] as const).map((group) => { const items = mk.campaigns.filter((campaign) => campaign.group === group).sort((a, b) => hasDrafts ? RISK[riskFor(a.id)].order - RISK[riskFor(b.id)].order : 0); if (!items.length) return null; return <section key={group} aria-label={GROUP_LABEL[group]}><div className="mb-4 flex items-center gap-3"><h3 className="text-[16px] font-semibold text-card-foreground">{GROUP_LABEL[group]}</h3><span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">{items.length}</span><span className="h-px flex-1 bg-border" /></div><div className={`grid gap-4 md:grid-cols-2 ${studioMinimized ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>{items.map((campaign) => { const libraryCampaign = libraryCampaigns.find((item) => EDITOR_ID[item.id] === campaign.id); const id = reviewId(campaign.id); return <PublishedCard key={campaign.id} campaign={campaign} libraryCampaign={libraryCampaign} pack={selectedPack} draft={Boolean(id)} month={month} monthName={monthName} release={top} forceChannel={hasDrafts ? show : undefined} reviewed={Boolean(ui.reviewed[campaign.id])} onEdit={() => setEditing(campaign.id)} onTest={() => setTesting(campaign.id)} onReview={id ? () => setReviewing(id) : undefined} />; })}</div></section>; })}</div>
    </section>}
  </main>
  {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
  <TestCampaignDialog campaign={mk.campaigns.find((campaign) => campaign.id === testing) ?? null} open={Boolean(testing)} onClose={() => setTesting(null)} />
  <AlertDialog open={conflict} onOpenChange={setConflict}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>1 manually edited campaign will be replaced — keep it?</AlertDialogTitle><AlertDialogDescription>After Last Visit · September v3 was edited by Maria Chen and is used by 7 properties.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => { resetReviewed(); publish(`${monthName} ${year}`); }}>Keep it</AlertDialogCancel><AlertDialogAction onClick={() => { resetReviewed(); publish(`${monthName} ${year}`); }}>Replace</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  {reviewing && <ReviewWorkspace id={reviewing} onClose={() => setReviewing(null)} />}
  </MarketingShell>;
}
