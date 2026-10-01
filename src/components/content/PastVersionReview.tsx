import { useState } from "react";
import { ArrowRight, Check, GitCompareArrows, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { editAssist } from "@/lib/ai.functions";
import { EDITOR_ID, saveCampaign, useLibrary, type Channel, type Segment } from "@/lib/contentLibrary";
import { PAST_CAMPAIGN_COPY } from "@/lib/pastCampaignCopy";
import { Diff } from "@/components/ai/AiEditPanel";
import type { ContentPeriod } from "@/lib/calendar";

export function PastVersionReview({ campaignId, period, currentRate, previousRate, onClose }: { campaignId: string; period: ContentPeriod; currentRate: number; previousRate: number; onClose: () => void }) {
  const { campaigns } = useLibrary();
  const libraryId = Object.keys(EDITOR_ID).find((key) => EDITOR_ID[key] === campaignId);
  const campaign = campaigns.find((item) => item.id === libraryId);
  const past = PAST_CAMPAIGN_COPY[campaignId];
  const [segment, setSegment] = useState<Segment>("direct");
  const [channel, setChannel] = useState<Channel>("email");
  const [proposal, setProposal] = useState<Record<Segment, { email: typeof past.content.direct.email; text: string }> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!campaign || !past) return null;

  const current = campaign.content[segment];
  const previous = past.content[segment];
  const draft = proposal?.[segment];
  const content = (value: { email: typeof previous.email; text: string }) => channel === "text" ? value.text : `Subject: ${value.email.subject}\nPreview: ${value.email.preheader}\n\n${value.email.heading}\n\n${value.email.body}\n\nButton: ${value.email.cta}`;

  const generate = async () => {
    setBusy(true); setError("");
    const next = { direct: { email: { ...campaign.content.direct.email }, text: campaign.content.direct.text }, ota: { email: { ...campaign.content.ota.email }, text: campaign.content.ota.text } };
    try {
      const res = await editAssist({ data: {
        text: `Rewrite this current ${channel} for ${segment} guests using the successful pattern in this historical version, without copying its outdated specifics. Historical version: ${JSON.stringify(channel === "text" ? previous.text : previous.email)}. Why it worked: ${past.learned}. Current content period: ${period.name}, ${period.start} to ${period.end}. Relevant current context: ${period.reason}. Keep the purpose of a post-checkout thank-you, the hotel's voice, and merge tags. Do not claim a causal lift or invent offers or events. Return a complete revised ${channel} draft for review.`,
        files: [], history: [], kind: channel, campaign: `${campaign.name} · ${segment} · ${period.name}`,
        copy: channel === "text" ? { message: current.text } : { subject: current.email.subject, preheader: current.email.preheader, heading: current.email.heading, body: current.email.body, ctaLabel: current.email.cta },
      } });
      if (res.error) throw new Error(res.error);
      if (!res.copy) throw new Error("No rewrite was returned. Try again.");
      if (channel === "text") next[segment].text = res.copy.message ?? current.text;
      else next[segment].email = { ...current.email, subject: res.copy.subject ?? current.email.subject, preheader: res.copy.preheader ?? current.email.preheader, heading: res.copy.heading ?? current.email.heading, body: res.copy.body ?? current.email.body, cta: res.copy.ctaLabel ?? current.email.cta };
      setProposal(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The rewrite couldn't be created."); }
    finally { setBusy(false); }
  };

  const save = () => {
    if (!proposal) return;
    saveCampaign({ ...campaign, status: "Needs review", content: { direct: { ...campaign.content.direct, ...proposal.direct, reviewed: { ...campaign.content.direct.reviewed, [channel]: false } }, ota: { ...campaign.content.ota, ...proposal.ota, reviewed: { ...campaign.content.ota.reviewed, [channel]: false } } } }, `Draft inspired by ${past.label}`);
    onClose();
  };

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="flex max-h-[90vh] w-[min(96vw,980px)] max-w-none flex-col gap-0 overflow-hidden p-0" overlayClassName="bg-foreground/65">
      <DialogHeader className="border-b border-border px-5 py-5 text-left sm:px-7">
        <p className="text-[10px] font-semibold uppercase text-brand">Performance-led review · {past.label}</p>
        <DialogTitle className="mt-2 text-[23px]">{campaign.name}</DialogTitle>
        <DialogDescription className="mt-1">Compare current content with a sample of the stronger past version before drafting an update.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 sm:px-7">
        <div className="flex rounded-md bg-muted p-1">{(["direct", "ota"] as const).map((value) => <Button key={value} size="sm" variant={segment === value ? "brand" : "ghost"} onClick={() => { setSegment(value); setProposal(null); }}>{value === "direct" ? "Direct" : "OTA"}</Button>)}</div>
        <div className="flex rounded-md bg-muted p-1">{campaign.channels.map((value) => <Button key={value} size="sm" variant={channel === value ? "brand" : "ghost"} onClick={() => { setChannel(value); setProposal(null); }}>{value === "email" ? "Email" : "Text"}</Button>)}</div>
        <span className="ml-auto text-[11px] text-muted-foreground">Sample campaign click rate · prior {previousRate}% · current {currentRate}%</span>
      </div>
      <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7">
        <div className="mb-5 border-l-2 border-brand bg-brand-soft/35 px-4 py-3"><p className="flex items-center gap-2 text-[12px] font-semibold text-brand"><Sparkles size={15} />What the past version did differently</p><p className="mt-1 text-[12px] leading-5 text-card-foreground">{past.learned} This is a useful pattern, not proof the wording alone caused the difference.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="min-w-0 border border-border bg-muted/25 p-4"><p className="mb-3 text-[10px] font-semibold uppercase text-muted-foreground">Current · in use</p><p className="whitespace-pre-wrap text-[13px] leading-6 text-card-foreground">{content(current)}</p></section>
          <section className="min-w-0 border border-brand/30 bg-brand-soft/20 p-4"><p className="mb-3 text-[10px] font-semibold uppercase text-brand">Past · {past.label}</p><p className="whitespace-pre-wrap text-[13px] leading-6 text-card-foreground">{content(previous)}</p></section>
        </div>
        {draft && <section className="mt-4 border border-brand/40 bg-card p-4"><p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase text-brand"><GitCompareArrows size={14} />Proposed draft · based on {period.name}</p><Diff before={content(current)} after={content(draft)} /><p className="mt-3 text-[11px] text-muted-foreground">Highlighted wording is new. Saving creates a review draft; it does not publish or send anything.</p></section>}
        {error && <p role="alert" className="mt-4 text-[12px] text-destructive">{error}</p>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-5 py-4 sm:px-7"><p className="text-[11px] text-muted-foreground">Keep current content until you're happy with the draft.</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={onClose}>Keep current</Button><Button variant="brand" disabled={busy} onClick={() => void generate()}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />} {proposal ? "Regenerate draft" : "Write in this direction"}</Button>{proposal && <Button variant="brand" onClick={save}><Check />Save review draft <ArrowRight size={14} /></Button>}</div></footer>
    </DialogContent>
  </Dialog>;
}