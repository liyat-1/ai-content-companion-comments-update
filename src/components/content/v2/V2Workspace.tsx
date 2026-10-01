import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MessageSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CampaignEditor } from "@/components/marketing/CampaignEditor";
import { AiMark, EmailMock, fill } from "@/components/content/shared";
import { EDITOR_ID, MONTH_PACKAGES, packageSnippet, useLibrary } from "@/lib/contentLibrary";
import { useMarketing } from "@/lib/marketing";
import { RefreshFlow, type FlowSetup } from "./RefreshFlow";
import { generateCopy } from "./generateCopy";
import {
  HOTEL,
  TOTAL_PROPERTIES,
  USAGE_ROWS,
  dismissPusher,
  publishPeriod,
  restoreHistoricalVersion,
  useV2,
  type Period,
  type PeriodCopy,
} from "@/lib/contentV2";

const REFRESH_IDS: Record<string, string> = {
  "after-last-visit": "alv",
  "lost-3": "m3",
  "lost-6": "m6",
  "lost-9": "m9",
  "lost-12": "m12",
  "lost-15": "m15",
  "lost-15-plus": "m15p",
};

const PERFORMANCE: Record<string, "up" | "down" | "steady"> = {
  "after-last-visit": "up",
  "lost-3": "up",
  "lost-6": "up",
  "lost-9": "down",
  "lost-12": "up",
  "lost-15": "up",
  "lost-15-plus": "down",
};

export function V2Workspace({
  onReview,
  reviewedCampaigns = [],
}: {
  onReview?: (id: string) => void;
  reviewedCampaigns?: string[];
}) {
  const v2 = useV2();
  const { campaigns } = useMarketing();
  const { campaigns: libraryCampaigns } = useLibrary();
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (window.sessionStorage.getItem("content-v2-entered") === "true") setEntered(true);
  }, []);
  const revealContent = () => {
    window.sessionStorage.setItem("content-v2-entered", "true");
    setEntered(true);
  };
  const [flow, setFlow] = useState<FlowSetup | null>(null);
  const [introOpen, setIntroOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contentOpen, setContentOpen] = useState<{
    name: string;
    text: string;
    email?: PeriodCopy["email"];
  } | null>(null);
  const [propsOpen, setPropsOpen] = useState(false);
  const [confirmUse, setConfirmUse] = useState<Period | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const periods = v2.periods;
  const current = periods.find((p) => p.status === "Current") ?? periods[2];
  const nextUp = periods.find((p) => p.status === "Upcoming");
  const shownPeriods = periods;
  const selected = shownPeriods.find((p) => p.id === selectedId) ?? current;
  const selectedIndex = shownPeriods.findIndex((p) => p.id === selected.id);
  const recommended = nextUp ?? current;
  const periodOptions = periods
    .filter((p) => p.status === "Upcoming" || p.status === "Current")
    .map((p) => ({
      id: p.id,
      label: p.label,
      short: p.short,
      month: Number(p.id.slice(5)) - 1,
      dateRange: `${p.short} 1–30, 2026`,
      blurb:
        p.status === "Current"
          ? `${p.short} is active now — the next content your guests will see.`
          : "The next period without fresh content.",
    }));
  const openUpdate = (period: Period = recommended) =>
    setFlow({
      recommendedId: period.id,
      preferences: period.preferences,
      context: period.preferences?.context,
    });
  const showNotice = !entered;
  const pack = MONTH_PACKAGES.find(
    (p) => p.month === Number(selected.id.slice(5)) - 1 && p.year === 2026,
  );
  const invites = campaigns.filter((c) => c.group === "invites");

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        {showNotice ? (
          <section
            className="ai-surface relative flex min-h-[calc(100dvh-170px)] items-center justify-center overflow-hidden rounded-lg border border-border px-5 py-12 text-center sm:px-8"
            aria-label="Refresh your content with AI"
          >
            <div aria-hidden className="ai-grid pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative max-w-2xl">
              <span className="inline-block ai-float">
                <AiMark size={52} live />
              </span>
              <p className="mt-6 text-[11px] font-semibold uppercase text-brand">
                New in Content Library · {HOTEL}
              </p>
              <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight text-card-foreground sm:text-[42px]">
                Write your content with AI
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                A new way to refresh your automated invites. Choose when to update, get
                recommendations, and shape the message in your own voice. Review everything before
                you publish.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                <Button variant="brand" size="lg" onClick={() => openUpdate()}>
                  <Sparkles size={15} />
                  Update with AI
                </Button>
                <Button variant="outline" size="lg" onClick={revealContent}>
                  Keep current content
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setIntroOpen(true)}>
                How it works
              </Button>
            </div>
          </section>
        ) : (
          <>
            <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase text-brand">
                  Content Library / V2
                </p>
                <h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">
                  Your content
                </h1>
                <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
                  One shared set of guest messages, used throughout the year.
                </p>
              </div>
              <Button
                variant="brand"
                onClick={() =>
                  openUpdate(
                    selected.status === "Upcoming" || selected.status === "Current"
                      ? selected
                      : recommended,
                  )
                }
              >
                <Sparkles size={15} />
                Update with AI
              </Button>
            </header>
            {selected.status === "Upcoming" && !v2.pusherDismissed && (
              <section className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-brand/20 bg-brand-soft/35 px-4 py-3 sm:px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                  <CalendarDays size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-card-foreground">
                    Refresh your {selected.short} content
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    The year-round content below is set to run unless you publish a fresh update.
                    Your current content stays live until then.
                  </p>
                </div>
                <Button size="sm" variant="brand" onClick={() => openUpdate(selected)}>
                  <Sparkles size={13} />
                  Refresh {selected.short}
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissPusher}>
                  Not now
                </Button>
              </section>
            )}
            <section
              className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
              aria-label="Monthly published content"
            >
              <div className="ai-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-5 sm:px-6">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous month"
                  disabled={selectedIndex <= 0}
                  onClick={() => setSelectedId(shownPeriods[selectedIndex - 1]?.id ?? null)}
                >
                  <ChevronLeft size={17} />
                </Button>
                <div className="min-w-0 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase text-brand">
                    <CalendarDays size={13} />
                    Content schedule
                  </p>
                  <h2 className="mt-1 text-[22px] font-semibold text-card-foreground">
                    {selected.label}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    <span
                      className={`rounded-sm px-2 py-1 text-[10px] font-semibold ${selected.status === "Current" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {selected.status === "Current"
                        ? "Live now"
                        : selected.status === "Upcoming"
                          ? "Upcoming"
                          : "Previously published"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {selected.status === "Upcoming"
                        ? "Year-round content will run"
                        : selected.originLabel}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-7"
                    onClick={() => setPropsOpen(true)}
                  >
                    <Users size={13} />
                    {selected.status === "Previous"
                      ? `${selected.previouslyUsedBy ?? 0} previously`
                      : `${selected.properties} / ${TOTAL_PROPERTIES} properties using`}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next month"
                  disabled={selectedIndex >= shownPeriods.length - 1}
                  onClick={() => setSelectedId(shownPeriods[selectedIndex + 1]?.id ?? null)}
                >
                  <ChevronRight size={17} />
                </Button>
              </div>
              <div className="space-y-7 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <h3 className="text-[15px] font-semibold text-card-foreground">
                    Automated Invites{" "}
                    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {invites.length}
                    </span>
                  </h3>
                </div>
                {selected.aiAssisted && selected.preferences && (
                  <div className="flex flex-wrap items-start gap-3 border-l-2 border-brand bg-brand-soft/30 px-4 py-3 text-[12px]">
                    <Sparkles size={15} className="mt-0.5 shrink-0 text-brand" />
                    <div>
                      <p className="font-semibold text-card-foreground">
                        How this version was written
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        Tone: {selected.preferences.tone} · Direction:{" "}
                        {selected.preferences.direction}
                        {selected.preferences.note ? ` · “${selected.preferences.note}”` : ""}
                        {selected.preferences.context
                          ? ` · Inspired by: ${selected.preferences.context}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {invites.map((campaign) => {
                    const libraryCampaign = libraryCampaigns.find(
                      (item) => EDITOR_ID[item.id] === campaign.id,
                    );
                    const text =
                      campaign.id === "after-last-visit"
                        ? selected.copy.text
                        : selected.status !== "Upcoming" && libraryCampaign && pack
                          ? packageSnippet(libraryCampaign, pack, "direct")
                          : campaign.variants.direct.text.message;
                    const email =
                      campaign.id === "after-last-visit"
                        ? selected.copy.email
                        : libraryCampaign?.content.direct.email;
                    const refreshId = REFRESH_IDS[campaign.id];
                    const reviewed = refreshId ? reviewedCampaigns.includes(refreshId) : false;
                    const performance = PERFORMANCE[campaign.id] ?? "steady";

                    return (
                      <article
                        key={campaign.id}
                        className={`relative flex min-h-[240px] flex-col overflow-hidden rounded-lg border shadow-card transition-colors ${reviewed ? "border-border bg-card hover:border-brand/30" : "border-warning/45 bg-warning-soft/20 hover:border-warning/60"}`}
                      >
                        {!reviewed && refreshId && (
                          <span
                            aria-hidden
                            className="absolute -right-9 top-3 h-5 w-28 rotate-12 bg-warning/15"
                          />
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                                {campaign.strategy === "text" ? (
                                  <MessageSquare size={15} />
                                ) : (
                                  <Mail size={15} />
                                )}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-[14px] font-semibold text-card-foreground">
                                  {campaign.name}
                                </h4>
                                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock3 size={12} />
                                  {campaign.timing}
                                </p>
                              </div>
                            </div>
                            {refreshId &&
                              (reviewed ? (
                                <span className="flex items-center gap-1 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
                                  <Check size={11} /> Reviewed
                                </span>
                              ) : (
                                <span className="relative -rotate-2 rounded-sm bg-warning px-2 py-1 text-[10px] font-bold text-warning-soft shadow-card">
                                  Pending Review
                                </span>
                              ))}
                          </div>
                          <div className="mt-4 rounded-md bg-canvas p-3">
                            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                              Text preview
                            </p>
                            <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-card-foreground">
                              “{fill(text)}”
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 border-t border-border p-2">
                          <span
                            className={`mr-auto inline-flex items-center gap-1 px-1.5 text-[10px] font-semibold ${performance === "down" ? "text-warning" : performance === "up" ? "text-brand" : "text-muted-foreground"}`}
                          >
                            {performance === "down" ? (
                              <TrendingDown size={12} />
                            ) : (
                              <TrendingUp size={12} />
                            )}
                            {performance === "down"
                              ? "Declining"
                              : performance === "up"
                                ? "Improving"
                                : "Steady"}
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(campaign.id)}>
                            Edit content
                          </Button>
                          {refreshId && onReview && (
                            <Button
                              size="sm"
                              variant="brand"
                              className="ml-auto"
                              onClick={() => onReview(refreshId)}
                            >
                              Review content
                            </Button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
                {selected.status === "Previous" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                    <p className="text-[12px] text-muted-foreground">
                      This version is kept in your content history.
                    </p>
                    <Button variant="outline" onClick={() => setConfirmUse(selected)}>
                      Review & use this version
                    </Button>
                  </div>
                )}
              </div>
            </section>
            <div className="mt-5 text-right">
              <Link
                to="/content/results-v2"
                className="text-[12px] font-semibold text-brand hover:underline"
              >
                View content results →
              </Link>
            </div>
          </>
        )}
      </main>
      {flow && (
        <RefreshFlow
          key={`${flow.recommendedId}-${flow.context ?? ""}`}
          setup={flow}
          periodOptions={periodOptions}
          baseCopy={current.copy}
          aiCopy={({ month, tone, direction, seasonal, note }) => [
            generateCopy(month, tone, direction, seasonal?.name ?? null, note),
          ]}
          learning={flow.context}
          onPublish={({ periodId, copy, preferences }) => {
            publishPeriod(periodId, copy, true, preferences);
            setSelectedId(periodId);
            revealContent();
            setFlow(null);
          }}
          onClose={() => setFlow(null)}
        />
      )}
      <Dialog open={introOpen} onOpenChange={setIntroOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How AI refresh works</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Choose a period and how you want it written. Review the plan and the new messages before
            publishing. Your current version stays available in the schedule.
          </p>
          <div className="flex justify-end">
            <Button
              variant="brand"
              onClick={() => {
                setIntroOpen(false);
                openUpdate();
              }}
            >
              Update with AI
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!contentOpen} onOpenChange={(open) => !open && setContentOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {contentOpen?.name} · {selected.label}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto">
            {contentOpen?.email && <EmailMock email={contentOpen.email} image="lobby" />}
            <div className="rounded-md bg-muted/40 p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                Text message
              </p>
              <p className="mt-1 text-[12px] text-card-foreground">
                {fill(contentOpen?.text ?? "")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={propsOpen} onOpenChange={setPropsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Properties · {selected.label}</DialogTitle>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground">
            {selected.status === "Previous"
              ? `${selected.previouslyUsedBy ?? 0} properties previously used this content.`
              : `${selected.properties} of ${TOTAL_PROPERTIES} properties use this content. Others keep their own version.`}
          </p>
          <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto">
            {USAGE_ROWS.map((row) => (
              <li
                key={row.property}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-[12px]"
              >
                <span className="min-w-0 truncate text-card-foreground">{row.property}</span>
                <span className="shrink-0 text-muted-foreground">
                  {row.using === "suggested" ? "Shared" : "Custom"}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      <Dialog open={!!confirmUse} onOpenChange={(open) => !open && setConfirmUse(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Use {confirmUse?.label} content?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Review the messages in this period before switching. Your current version is kept in
            history; properties using custom content are unchanged.
          </p>
          <div className="max-h-48 overflow-y-auto rounded-md bg-muted/40 p-3 text-[12px] text-card-foreground">
            <p className="font-semibold">{confirmUse?.copy.email.subject}</p>
            <p className="mt-1">{confirmUse?.copy.email.body}</p>
            <p className="mt-2 border-t border-border pt-2">{confirmUse?.copy.text}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmUse(null)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (confirmUse) {
                  restoreHistoricalVersion(confirmUse.id);
                  setSelectedId(confirmUse.id);
                }
                setConfirmUse(null);
              }}
            >
              Use this version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {editing && <CampaignEditor id={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
