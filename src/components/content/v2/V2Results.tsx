import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AiMark, EmailMock } from "@/components/content/shared";
import { AUGUST_ALV, RESULTS_MONTHS, useV2 } from "@/lib/contentV2";
import { useMarketing } from "@/lib/marketing";

type CampaignResult = {
  id: string;
  name: string;
  properties: number;
  click: number;
  clickDelta: number;
  ctb: number;
  ctbDelta: number;
  aiInsight: string;
  prior: { label: string; click: number; ctb: number } | null;
  priorBetter: boolean;
};

const CAMPAIGN_RESULTS: Record<string, CampaignResult[]> = {
  "2026-08": [
    {
      id: "alv",
      name: "After Last Visit",
      properties: 4,
      click: 4.1,
      clickDelta: 0.7,
      ctb: 1.9,
      ctbDelta: 0.4,
      aiInsight:
        "The August version outperformed July with guests who stayed 2+ nights — its concise invitation and direct-booking CTA worked well.",
      prior: { label: "July 2026", click: 3.4, ctb: 1.5 },
      priorBetter: false,
    },
    {
      id: "welcome",
      name: "Pre-Arrival Welcome",
      properties: 4,
      click: 3.2,
      clickDelta: -0.3,
      ctb: 1.1,
      ctbDelta: -0.2,
      aiInsight:
        "Slightly below July — send time may be a factor. Try 10:00 AM instead of 8:00 AM for leisure guests.",
      prior: { label: "July 2026", click: 3.5, ctb: 1.3 },
      priorBetter: false,
    },
  ],
  "2026-09": [
    {
      id: "alv",
      name: "After Last Visit",
      properties: 4,
      click: 3.8,
      clickDelta: -0.3,
      ctb: 1.6,
      ctbDelta: -0.3,
      aiInsight:
        "A small dip after August's strong month. The seasonal hook faded — a fresh reason-to-return angle should lift it again.",
      prior: { label: "August 2026", click: 4.1, ctb: 1.9 },
      priorBetter: true,
    },
    {
      id: "welcome",
      name: "Pre-Arrival Welcome",
      properties: 4,
      click: 3.4,
      clickDelta: 0.2,
      ctb: 1.2,
      ctbDelta: 0.1,
      aiInsight:
        "Steady improvement. Guests respond well to the rooftop-bar mention in the heading.",
      prior: { label: "August 2026", click: 3.2, ctb: 1.1 },
      priorBetter: false,
    },
  ],
  "2026-10": [
    {
      id: "alv",
      name: "After Last Visit",
      properties: 4,
      click: 3.6,
      clickDelta: -0.2,
      ctb: 1.5,
      ctbDelta: -0.1,
      aiInsight:
        "The current version is holding steady, but the August parade version still holds the quarter's best click rate at 4.1%.",
      prior: { label: "August 2026", click: 4.1, ctb: 1.9 },
      priorBetter: true,
    },
    {
      id: "welcome",
      name: "Pre-Arrival Welcome",
      properties: 4,
      click: 3.5,
      clickDelta: 0.1,
      ctb: 1.3,
      ctbDelta: 0.1,
      aiInsight: "Consistent. No action needed this period.",
      prior: null,
      priorBetter: false,
    },
  ],
};

export function V2Results({
  onImprove,
}: {
  onImprove: (campaignId: string, learning: string, actions: string[]) => void;
}) {
  const { periods } = useV2();
  const { campaigns: allCampaigns } = useMarketing();
  const [mi, setMi] = useState(RESULTS_MONTHS.length - 1);
  const [tab, setTab] = useState<"overview" | "campaigns">("overview");
  const [reviewOpen, setReviewOpen] = useState(false);

  const m = RESULTS_MONTHS[mi];
  const recorded = CAMPAIGN_RESULTS[m.id] ?? [];
  const invites = allCampaigns.filter((campaign) => campaign.group === "invites");
  const campaigns = invites.map((campaign, index) => {
    const existing = recorded.find(
      (result) =>
        result.id ===
        (campaign.id === "after-last-visit"
          ? "alv"
          : campaign.id === "before-arrival"
            ? "welcome"
            : campaign.id),
    );
    if (existing) return { ...existing, id: campaign.id, name: campaign.name };
    const monthShift = mi - 1;
    const click = +(2.8 + index * 0.19 + monthShift * 0.12).toFixed(1);
    const ctb = +(0.9 + index * 0.07 + monthShift * 0.05).toFixed(1);
    const clickDelta = +(((index % 3) - 1) * 0.2 + monthShift * 0.1).toFixed(1);
    const ctbDelta = +(((index % 3) - 1) * 0.1).toFixed(1);
    return {
      id: campaign.id,
      name: campaign.name,
      properties: 4,
      click,
      ctb,
      clickDelta,
      ctbDelta,
      aiInsight:
        clickDelta >= 0
          ? "Engagement is holding steady. Keep the clear invitation and check the next period before changing it."
          : "A small dip from the prior period. Review the timing and make the return invitation more specific before the next update.",
      prior: {
        label: mi === 0 ? "July 2026" : RESULTS_MONTHS[mi - 1].label,
        click: +(click - clickDelta).toFixed(1),
        ctb: +(ctb - ctbDelta).toFixed(1),
      },
      priorBetter: false,
    };
  });
  const alv = campaigns.find((c) => c.priorBetter);
  const improvementLearning = alv?.prior
    ? `August's After Last Visit version outperformed the current one (${alv.prior.click}% vs ${alv.click}% clicks). Its short invitation and direct-booking CTA worked well. Write a fresh version for the next period in that direction.`
    : undefined;

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-card">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Previous month"
            disabled={mi === 0}
            onClick={() => setMi((x) => x - 1)}
          >
            <ChevronLeft size={15} />
          </Button>
          <p className="min-w-[140px] text-center text-[14px] font-semibold text-card-foreground">
            {m.label}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Next month"
            disabled={mi >= RESULTS_MONTHS.length - 1}
            onClick={() => setMi((x) => x + 1)}
          >
            <ChevronRight size={15} />
          </Button>
        </div>
        <div className="flex rounded-md bg-muted p-1">
          {(["overview", "campaigns"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? "secondary" : "ghost"}
              onClick={() => setTab(t)}
            >
              {t === "overview" ? "Overview" : "Campaigns"}
            </Button>
          ))}
        </div>
      </div>

      {tab === "overview" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Click rate",
                value: `${m.click}%`,
                delta: `${m.clickDelta >= 0 ? "+" : ""}${m.clickDelta}% vs prior`,
              },
              {
                label: "Click-to-book",
                value: `${m.ctb}%`,
                delta: `${m.ctbDelta >= 0 ? "+" : ""}${m.ctbDelta}% vs prior`,
              },
              { label: "Sends", value: m.sends, delta: m.sendsDelta },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-card p-4 shadow-card"
              >
                <p className="text-[10.5px] font-semibold uppercase text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-[26px] font-semibold text-card-foreground">{s.value}</p>
                <p
                  className={`text-[11.5px] ${s.delta.startsWith("+") ? "text-brand" : "text-warning"}`}
                >
                  {s.delta}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-lg border border-brand/30 bg-brand-soft/30 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AiMark size={30} />
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold uppercase text-brand">AI insight</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-card-foreground">
                  {m.aiSummary}
                </p>
              </div>
            </div>
          </section>

          {alv?.prior && improvementLearning && (
            <section className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                  <TrendingUp size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-card-foreground">
                    {alv.prior.label} content did better
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {alv.prior.label} clicked {alv.prior.click}% vs {alv.click}% for {alv.name}.
                    Review both messages, then use what worked to write the next version.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)}>
                      Review {alv.prior.label} version
                    </Button>
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() =>
                        onImprove(alv.id, improvementLearning, [
                          "Use the concise return invitation",
                          "Keep the direct-booking CTA",
                          "Add a timely new reason to return",
                        ])
                      }
                    >
                      <Sparkle size={13} />
                      Improve with AI
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {campaigns.map((c) => (
            <article
              key={c.id}
              className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-card-foreground">{c.name}</p>
                <span className="text-[11px] text-muted-foreground">{c.properties} properties</span>
              </div>
              <div className="mt-3 flex gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Click rate
                  </p>
                  <p
                    className={`text-[18px] font-semibold ${c.clickDelta >= 0 ? "text-brand" : "text-warning"}`}
                  >
                    {c.click}%{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({c.clickDelta >= 0 ? "+" : ""}
                      {c.clickDelta})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Click-to-book
                  </p>
                  <p
                    className={`text-[18px] font-semibold ${c.ctbDelta >= 0 ? "text-brand" : "text-warning"}`}
                  >
                    {c.ctb}%{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({c.ctbDelta >= 0 ? "+" : ""}
                      {c.ctbDelta})
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-3">
                <Sparkle size={13} className="mt-0.5 shrink-0 text-brand" />
                <p className="text-[12px] leading-relaxed text-muted-foreground">{c.aiInsight}</p>
              </div>
              {c.priorBetter && c.prior && (
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-warning">
                      <TrendingUp size={12} className="rotate-90" />
                      Declining vs {c.prior.label}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto"
                      onClick={() => {
                        setTab("overview");
                        setReviewOpen(true);
                      }}
                    >
                      Review previous version ({c.prior.click}% clicks)
                    </Button>
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() =>
                        onImprove(
                          c.id,
                          `${c.prior?.label} performed better because it recalled a recognizable moment from the guest’s stay and reached them when they were likely planning another trip. That familiarity made the message feel personally relevant rather than promotional. Keep the current Directful recommendation as the baseline.`,
                          [
                            "Open with a stay memory",
                            "Match the guest’s planning moment",
                            "Make the return feel personal",
                          ],
                        )
                      }
                    >
                      <Sparkle size={12} />
                      Improve with AI
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Review prior version: current vs historical */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-3xl" overlayClassName="bg-foreground/60">
          <DialogHeader>
            <DialogTitle>August version vs {m.label}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[62vh] overflow-y-auto pr-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10.5px] font-semibold uppercase text-muted-foreground">
                  August 2026 · 4.1% clicks
                </p>
                <EmailMock email={AUGUST_ALV.email} image="rooftop" />
              </div>
              <div>
                <p className="mb-2 text-[10.5px] font-semibold uppercase text-muted-foreground">
                  {m.label} · {alv?.click}% clicks
                </p>
                <EmailMock
                  email={periods.find((p) => p.id === m.id)?.copy.email ?? periods[2].copy.email}
                  image="lobby"
                />
              </div>
            </div>
            <div className="mt-4 rounded-md border border-brand/30 bg-brand-soft/30 p-3.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-brand">
                <Sparkle size={12} />
                What to carry forward
              </p>
              <ul className="mt-1.5 space-y-1 text-[12.5px] text-card-foreground">
                <li>
                  • August's copy is shorter and leads with a straightforward return invitation.
                </li>
                <li>
                  • Its “Book now — best rate” button makes the direct-booking benefit explicit.
                  Carry the pattern forward with a timely new message.
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReviewOpen(false)}>
              Close
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                setReviewOpen(false);
                if (improvementLearning && alv)
                  onImprove(alv.id, improvementLearning, [
                    "Use the concise return invitation",
                    "Keep the direct-booking CTA",
                    "Add a timely new reason to return",
                  ]);
              }}
            >
              Improve current suggestion with AI
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
