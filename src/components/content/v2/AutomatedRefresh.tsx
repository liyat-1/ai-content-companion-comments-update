import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, History, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { V2Workspace } from "./V2Workspace";

type Metric = { label: string; prev: number; cur: number; lowerIsBetter?: boolean };
type Version = { month: string; text: string; directful: boolean; updated: string };
type Campaign = {
  id: string; name: string; guest: string; channel: string;
  previous: string; recommended: string; changes: string[]; why: string;
  metrics: Metric[]; learned?: string; prevMonth: string; history: Version[];
};

const C = (id: string, name: string, guest: string, channel: string, previous: string, recommended: string, changes: string[], why: string, m: [number, number, number, number, number, number], learned?: string): Campaign => ({
  id, name, guest, channel, previous, recommended, changes, why, learned, prevMonth: "September 2026",
  metrics: [
    { label: "Click rate", prev: m[0], cur: m[1] },
    { label: "Click-to-book", prev: m[2], cur: m[3] },
    { label: "Spam rate", prev: m[4], cur: m[5], lowerIsBetter: true },
  ],
  history: [
    { month: "September 2026", text: previous, directful: false, updated: "Aug 12" },
    { month: "August 2026", text: previous.replace("Thank you", "Thanks so much"), directful: true, updated: "Jul 18" },
    { month: "July 2026", text: previous.split(". ")[0] + ". We'd love to welcome you back this summer.", directful: false, updated: "Jun 22" },
  ],
});

const CAMPAIGNS: Campaign[] = [
  C("alv", "After Last Visit", "Direct guests", "Email",
    "Thank you for staying with us at Harbor House. We hope you enjoyed your visit and everything our team prepared for you. We look forward to seeing you again sometime soon.",
    "It was a pleasure having you at Harbor House. October brings crisp harbor mornings — come back and enjoy them with us. Book direct for our best rate.",
    ["Shortened the opening", "Made the tone warmer", "Added a clearer direct-booking CTA", "Added light October seasonal context"],
    "Your previous message focused mainly on thanking guests for their stay. We refreshed it with a warmer returning-guest message and a clearer direct-booking CTA.",
    [5.8, 6.2, 2.4, 2.8, 0.5, 0.4]),
  C("m3", "3 Months", "Direct guests", "Email + Text",
    "It has been a few months since your last stay. We would love to see you again. Visit our website to see current offers.",
    "Three months already? Fall is a lovely time on the harbor. Your room is waiting — book direct and enjoy late checkout.",
    ["Opened with a friendlier hook", "Added a direct-booking perk", "Added autumn context"],
    "Guests three months out respond to light, personal reminders. We added a simple perk to give them a reason to book direct this fall.",
    [4.9, 5.4, 1.9, 2.2, 0.4, 0.4]),
  C("m6", "6 Months", "Direct + OTA guests", "Email",
    "We miss you at Harbor House! It's been six months since your stay. Check out what's new and plan your next getaway with us.",
    "Six months since your last harbor escape. We've refreshed our rooms and our autumn menu — see what's new and book your return direct.",
    ["Highlighted what's new at the property", "Clarified the booking CTA"],
    "OTA guests at six months need a reason to book with you instead of a third party. We focused on what's new and the value of booking direct.",
    [4.2, 4.6, 1.6, 1.8, 0.5, 0.4]),
  C("m9", "9 Months", "Direct guests", "Email",
    "Ready for a return? Book direct and save 10%.",
    "It has been nine months since we last welcomed you. As the season changes, we've been thinking of guests like you and the moments you shared with us. Whenever you're ready, we'd love to host you again.",
    ["Made the message more personal", "Added seasonal context", "Softened the booking ask"],
    "Nine-month guests can drift away. We tried a warmer, more personal message to rebuild the connection before asking for a booking.",
    [5.1, 4.7, 3.4, 2.8, 0.3, 0.4],
    "The previous version used shorter messaging and a more direct booking CTA, which generated stronger booking engagement."),
  C("m12", "12 Months", "Direct + OTA guests", "Email + Text",
    "It's been a year! Come celebrate with us again at Harbor House.",
    "A year ago you stayed with us — let's make it a tradition. Celebrate your anniversary trip at Harbor House and book direct for a welcome treat.",
    ["Framed the return as an anniversary", "Added a direct-booking welcome treat"],
    "Anniversary framing performs well for year-out guests. We added a small reason to book direct rather than through an OTA.",
    [5.5, 6.1, 2.1, 2.6, 0.4, 0.3]),
  C("m15", "15 Months", "Direct guests", "Email",
    "We haven't seen you in a while. We hope you'll consider staying with us again.",
    "It's been a while, and Harbor House has changed in all the best ways. Come see the new waterfront terrace — book direct for our best rate.",
    ["Replaced the passive tone with an invitation", "Mentioned the new terrace", "Added a booking CTA"],
    "Your previous message didn't give lapsed guests a reason to return. We gave them something new to see and a clear next step.",
    [3.2, 3.9, 1.1, 1.5, 0.6, 0.5]),
  C("m15p", "15 Months+", "Direct + OTA guests", "Email",
    "Come back to Harbor House. Book direct for 15% off your next stay — this week only.",
    "We'd love to reconnect. Much has changed at Harbor House since your last visit, from our rooms to our restaurant, and we think you'd enjoy discovering it all. Take a look at what's new when you have a moment.",
    ["Made the tone more welcoming", "Highlighted property updates", "Removed the time-limited offer"],
    "Long-lapsed guests can be sensitive to hard sells. We tested a gentler, discovery-led message.",
    [3.6, 3.1, 1.8, 1.2, 0.4, 0.5],
    "The previous version used a clear offer and a short, direct booking CTA, which converted long-lapsed guests better."),
];

type State = Record<string, { text?: string; directful?: boolean; updated?: string; extra?: Version[]; reviewed?: boolean }>;
const KEY = "directful-auto-refresh";
const ALV_INITIAL: State = {};

function useStore() {
  const [s, setS] = useState<State>(ALV_INITIAL);
  useEffect(() => { try { const raw = sessionStorage.getItem(KEY); if (raw) setS(JSON.parse(raw)); } catch { /* ignore */ } }, []);
  const patch = (id: string, p: State[string]) => setS((prev) => { const next = { ...prev, [id]: { ...prev[id], ...p } }; sessionStorage.setItem(KEY, JSON.stringify(next)); return next; });
  return { s, patch };
}

const view = (c: Campaign, st: State[string] | undefined) => ({
  text: st?.text ?? c.recommended,
  directful: st?.directful ?? true,
  updated: st?.updated ?? "Updated 2 min ago",
  reviewed: !!st?.reviewed,
  history: [...(st?.extra ?? []), { month: "October 2026", text: c.recommended, directful: true, updated: "Aug 27" }, ...c.history],
});

const prevBetter = (c: Campaign) => c.metrics[1].prev > c.metrics[1].cur;
const fmt = (n: number) => `${n.toFixed(1)}%`;
function Delta({ m }: { m: Metric }) {
  const up = m.cur > m.prev; const good = m.lowerIsBetter ? m.cur < m.prev : m.cur > m.prev;
  if (m.cur === m.prev) return <span className="text-muted-foreground">{fmt(m.cur)}</span>;
  return <span className={good ? "text-success font-semibold" : "text-destructive font-semibold"}>{fmt(m.cur)} {up ? "↑" : "↓"}</span>;
}

function diffWords(a: string, b: string) {
  const x = a.split(/\s+/), y = b.split(/\s+/);
  const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const keepA = new Set<number>(), keepB = new Set<number>();
  let i = 0, j = 0;
  while (i < x.length && j < y.length) { if (x[i] === y[j]) { keepA.add(i++); keepB.add(j++); } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  return { x, y, keepA, keepB };
}
function DiffText({ words, keep, kind }: { words: string[]; keep: Set<number>; kind: "old" | "new" }) {
  return <p className="text-[14px] leading-7 text-card-foreground">{words.map((w, i) => <span key={i}>{keep.has(i) ? w : <mark className={kind === "new" ? "rounded-sm bg-brand/15 px-0.5 text-card-foreground" : "rounded-sm bg-muted px-0.5 text-muted-foreground line-through"}>{w}</mark>}{" "}</span>)}</p>;
}
function Compare({ leftTitle, leftMeta, left, rightTitle, rightMeta, right }: { leftTitle: string; leftMeta: string; left: string; rightTitle: string; rightMeta: string; right: string }) {
  const d = useMemo(() => diffWords(left, right), [left, right]);
  return <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-md border border-border bg-card p-5"><p className="text-[13px] font-semibold text-muted-foreground">{leftTitle}</p><p className="mb-3 text-[12px] text-muted-foreground">{leftMeta}</p><DiffText words={d.x} keep={d.keepA} kind="old" /></div>
    <div className="rounded-md border-2 border-brand/40 bg-card p-5 shadow-sm"><p className="text-[13px] font-semibold text-brand">{rightTitle}</p><p className="mb-3 text-[12px] text-muted-foreground">{rightMeta}</p><DiffText words={d.y} keep={d.keepB} kind="new" /></div>
  </div>;
}
const Attribution = ({ directful, full }: { directful: boolean; full?: boolean }) => directful ? <span className="text-[12px] font-semibold text-brand">✦ Directful {full ? "recommendation · AI-assisted" : "suggestion"}</span> : null;

function suggest(text: string) {
  const first = text.split(/(?<=[.!?])\s+/)[0];
  return `${first} Book direct today for our best rate.`;
}

export function AutomatedRefresh() {
  const { s, patch } = useStore();
  const [screen, setScreen] = useState<"announce" | "overview" | "review" | "edit" | "library">("announce");
  const [id, setId] = useState(CAMPAIGNS[0].id);
  const [confirm, setConfirm] = useState<{ text: string; directful: boolean; label: string } | null>(null);
  const [ai, setAi] = useState<{ fromLearning: boolean } | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [histPick, setHistPick] = useState<Version | null>(null);

  useEffect(() => { const v = sessionStorage.getItem(KEY + "-screen"); if (v === "library" || v === "overview") setScreen(v); }, []);
  useEffect(() => { if (screen === "library" || screen === "overview") sessionStorage.setItem(KEY + "-screen", screen); }, [screen]);

  const idx = CAMPAIGNS.findIndex((c) => c.id === id);
  const c = CAMPAIGNS[idx];
  const v = view(c, s[c.id]);
  const reviewedCount = CAMPAIGNS.filter((x) => s[x.id]?.reviewed).length;

  const openReview = (cid: string) => { setId(cid); setScreen("review"); patch(cid, { reviewed: true }); };
  const openEdit = (cid: string) => { setId(cid); setScreen("edit"); };
  const useVersion = (text: string, directful: boolean) => {
    patch(c.id, { text, directful, updated: "Updated just now", extra: [{ month: "October 2026 · new current", text: v.text, directful: v.directful, updated: "Just now" }, ...(s[c.id]?.extra ?? [])] });
  };

  if (screen === "library") {
    return <>
      <div className="border-b border-border bg-card px-6 py-2 text-center text-[13px]">Directful refreshed 7 automated invite campaigns. <button className="font-semibold text-brand hover:underline" onClick={() => setScreen("overview")}>See what Directful recommends →</button></div>
      <V2Workspace />
    </>;
  }

  const goLibrary = () => { sessionStorage.setItem("content-v2-entered", "true"); setScreen("library"); };

  return <MarketingShell title="Automated Invites · Content refresh">
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
      {screen === "announce" && (
        <section className="mx-auto max-w-2xl rounded-md border border-border bg-card p-10">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">Automated Invites</p>
          <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight text-card-foreground">We’ve refreshed your automated invite content</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-card-foreground">Your content was last updated 47 days ago. Directful refreshed it to keep your messaging timely, relevant, and aligned with your current guests and season.</p>
          <p className="mt-3 text-[13px] text-muted-foreground">Directful regularly reviews your automated invite content and recommends fresh messaging when your current content is due for an update.</p>
          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border text-[13px]">
            {[["Program", "Automated Invites"], ["Channels", "Email + Text"], ["Guests", "Direct + OTA guests"], ["Campaigns", "7 campaigns refreshed"]].map(([k, val]) => <div key={k} className="bg-card p-4"><dt className="text-muted-foreground">{k}</dt><dd className="mt-1 font-semibold text-card-foreground">{val}</dd></div>)}
          </dl>
          <p className="mt-4"><Attribution directful full /></p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="brand" size="lg" onClick={() => setScreen("overview")}>See what Directful recommends <ArrowRight size={15} /></Button>
            <Button variant="ghost" onClick={goLibrary}>Go to Content Library</Button>
          </div>
        </section>
      )}

      {screen === "overview" && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="font-display text-[30px] font-semibold text-card-foreground">Directful’s recommendation</h1>
              <p className="mt-1 text-[14px] text-muted-foreground">Here’s what we refreshed, what changed, and how your content is performing.</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-card-foreground"><span className="font-semibold">October 2026</span><span className="text-success">● Published</span><Attribution directful full /></p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-card-foreground">{reviewedCount} of 7 campaigns reviewed</p>
              <p className="text-[12px] text-muted-foreground">No need to review everything — your progress is saved.</p>
              <Button variant="ghost" size="sm" className="mt-1" onClick={goLibrary}>Go to Content Library</Button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAMPAIGNS.map((x) => { const xv = view(x, s[x.id]); const pb = prevBetter(x) && !s[x.id]?.text; return (
              <article key={x.id} className="flex flex-col rounded-md border border-border bg-card p-5">
                <h2 className="text-[16px] font-semibold text-card-foreground">{x.name}</h2>
                <p className="text-[12px] text-muted-foreground">{x.guest} · {x.channel}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 text-[12px]"><Attribution directful={xv.directful} /><span className="text-muted-foreground">{xv.updated}</span></p>
                <div className="mt-4 space-y-1 text-[13px]">
                  {x.metrics.slice(0, 2).map((m) => <p key={m.label} className="flex justify-between"><span className="text-muted-foreground">{m.label}</span><Delta m={m} /></p>)}
                </div>
                <p className="mt-4 text-[12px]">{xv.reviewed ? <span className="text-success">✓ Reviewed</span> : pb ? <span className="text-warning-foreground">● A previous version performed better</span> : <span className="text-brand">● New recommendation</span>}</p>
                <div className="mt-4 flex gap-2 pt-1">
                  <Button size="sm" variant="brand" onClick={() => openReview(x.id)}>Review</Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(x.id)}>Edit content</Button>
                </div>
              </article>); })}
          </div>
        </section>
      )}

      {(screen === "review" || screen === "edit") && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => setScreen("overview")}><ArrowLeft size={14} />All campaigns</Button>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Campaigns">
            {CAMPAIGNS.map((x) => <button key={x.id} onClick={() => screen === "review" ? openReview(x.id) : setId(x.id)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-semibold ${x.id === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{s[x.id]?.reviewed && "✓ "}{x.name}</button>)}
          </nav>
        </div>
      )}

      {screen === "review" && (
        <section className="space-y-8">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div><h1 className="font-display text-[28px] font-semibold text-card-foreground">{c.name}</h1><p className="text-[13px] text-muted-foreground">{c.guest} · {c.channel}</p></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => openReview(CAMPAIGNS[idx - 1].id)}><ChevronLeft size={14} />{CAMPAIGNS[idx - 1]?.name ?? "Previous"}</Button>
              <Button variant="outline" size="sm" disabled={idx === 6} onClick={() => openReview(CAMPAIGNS[idx + 1].id)}>{CAMPAIGNS[idx + 1]?.name ?? "Next"}<ChevronRight size={14} /></Button>
            </div>
          </header>
          <Compare leftTitle="Previous content" leftMeta="Previously published" left={c.previous} rightTitle={v.directful ? "✦ Directful recommendation" : "Current content"} rightMeta={v.updated} right={v.text} />
          <div className="grid gap-6 md:grid-cols-2">
            <div><h3 className="text-[15px] font-semibold text-card-foreground">What changed</h3><ul className="mt-2 space-y-1.5 text-[14px] text-card-foreground">{c.changes.map((t) => <li key={t} className="flex gap-2"><Check size={15} className="mt-1 shrink-0 text-brand" />{t}</li>)}</ul></div>
            <div><h3 className="text-[15px] font-semibold text-card-foreground">Why we updated it</h3><p className="mt-2 text-[14px] leading-relaxed text-card-foreground">{c.why}</p></div>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-card-foreground">How it’s performing</h3>
            <table className="mt-3 w-full max-w-xl text-[14px]"><thead><tr className="border-b border-border text-left text-[12px] text-muted-foreground"><th className="py-2 font-medium">Metric</th><th className="font-medium">Previous</th><th className="font-medium">Directful recommendation</th></tr></thead>
              <tbody>{c.metrics.map((m) => <tr key={m.label} className="border-b border-border"><td className="py-2.5">{m.label}</td><td>{fmt(m.prev)}</td><td><Delta m={m} /></td></tr>)}</tbody></table>
          </div>
          {prevBetter(c) ? (
            <div className="rounded-md border border-warning/50 bg-warning/10 p-6">
              <h3 className="text-[16px] font-semibold text-card-foreground">A previous version performed better</h3>
              <p className="mt-1 text-[14px] text-card-foreground">Your previous version had a higher click-to-book rate than the current content.</p>
              <p className="mt-3 text-[13px]">Previous content: <b>{fmt(c.metrics[1].prev)}</b> · Directful recommendation: <b>{fmt(c.metrics[1].cur)}</b></p>
              <p className="mt-4 text-[13px] font-semibold">What we learned</p><p className="text-[14px] text-card-foreground">{c.learned}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button variant="brand" onClick={() => setConfirm({ text: c.previous, directful: false, label: "Previous content" })}>Use previous content</Button>
                <Button variant="outline" onClick={() => setAi({ fromLearning: true })}><Sparkles size={14} />Improve current content with AI</Button>
                <Button variant="ghost" onClick={() => (idx < 6 ? openReview(CAMPAIGNS[idx + 1].id) : setScreen("overview"))}>Keep current</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-success/40 bg-success/10 p-5">
              <h3 className="text-[15px] font-semibold text-card-foreground">Your content is performing better</h3>
              <p className="mt-1 text-[14px] text-card-foreground">This version is generating stronger engagement than the previous version. Click-to-book: previous {fmt(c.metrics[1].prev)} · current <Delta m={c.metrics[1]} /></p>
            </div>
          )}
          <div className="flex gap-2 border-t border-border pt-6"><Button variant="outline" onClick={() => openEdit(c.id)}>Edit content</Button></div>
        </section>
      )}

      {screen === "edit" && (
        <section className="rounded-md border border-border bg-card p-6">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div><h1 className="font-display text-[26px] font-semibold text-card-foreground">{c.name}</h1><p className="mt-1 flex gap-3 text-[12px]"><Attribution directful={v.directful} full /><span className="text-muted-foreground">{v.updated}</span></p><p className="text-[12px] text-muted-foreground">{c.guest} · {c.channel}</p></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="brand" onClick={() => setAi({ fromLearning: false })}><Sparkles size={14} />Edit with AI</Button>
              <Button variant="outline" onClick={() => setCompareOpen(true)}>Compare to previous</Button>
              <Button variant="ghost" onClick={() => { setHistPick(null); setHistoryOpen(true); }}><History size={14} />Content history</Button>
            </div>
          </header>
          <label className="mt-5 block text-[12px] font-semibold text-muted-foreground" htmlFor="body">Message</label>
          <Textarea id="body" className="mt-2 min-h-[180px] text-[15px] leading-7" value={v.text} onChange={(e) => patch(c.id, { text: e.target.value, directful: false, updated: "Updated just now" })} />
          <p className="mt-2 text-[12px] text-muted-foreground">Changes save automatically and go live for the next send.</p>
          <div className="mt-5 rounded-md border border-border bg-muted/40 p-4"><p className="text-[12px] font-semibold text-card-foreground">Content insight</p><p className="mt-1 text-[13px] text-muted-foreground">Click-to-book {fmt(c.metrics[1].cur)} vs {fmt(c.metrics[1].prev)} previously. {c.learned ?? "Shorter openings and a clear direct-booking CTA tend to perform best for this campaign."}</p></div>
        </section>
      )}
    </main>

    <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
      <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Use this version?</DialogTitle></DialogHeader>
        <p className="text-[14px] text-muted-foreground">This will create a new current version based on the selected content. Your existing history will remain unchanged.</p>
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button><Button variant="brand" onClick={() => { if (confirm) useVersion(confirm.text, confirm.directful); setConfirm(null); setHistoryOpen(false); }}>Use this version</Button></div>
      </DialogContent>
    </Dialog>

    <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
      <DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Compare to previous</DialogTitle></DialogHeader>
        <Compare leftTitle="Previous content" leftMeta={c.prevMonth} left={c.previous} rightTitle="Current content" rightMeta={v.updated} right={v.text} />
      </DialogContent>
    </Dialog>

    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
      <DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Content history · {c.name}</DialogTitle></DialogHeader>
        {!histPick ? <ul className="divide-y divide-border">{v.history.map((h, i) => <li key={i}><button className="flex w-full items-center justify-between py-3 text-left hover:bg-muted/40" onClick={() => setHistPick(h)}><span><span className="block text-[14px] font-semibold text-card-foreground">{h.month}</span><span className="flex gap-3 text-[12px]"><Attribution directful={h.directful} /><span className="text-muted-foreground">Updated {h.updated}</span></span></span><ChevronRight size={15} className="text-muted-foreground" /></button></li>)}</ul>
          : <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setHistPick(null)}><ArrowLeft size={14} />All versions</Button>
            <Compare leftTitle={`Historical version · ${histPick.month}`} leftMeta="Read-only" left={histPick.text} rightTitle="Current content" rightMeta={v.updated} right={v.text} />
            <p className="text-[13px] text-muted-foreground">Why it changed: {c.why}</p>
            <div className="flex justify-end"><Button variant="brand" onClick={() => setConfirm({ text: histPick.text, directful: histPick.directful, label: histPick.month })}>Use this version</Button></div>
          </div>}
      </DialogContent>
    </Dialog>

    {ai && <AiPanel key={c.id + String(ai.fromLearning)} campaign={c} current={v.text} fromLearning={ai.fromLearning} onClose={() => setAi(null)} onUse={(t) => { useVersion(t, true); setAi(null); }} />}
  </MarketingShell>;
}

function AiPanel({ campaign, current, fromLearning, onClose, onUse }: { campaign: Campaign; current: string; fromLearning: boolean; onClose: () => void; onUse: (t: string) => void }) {
  const [prompt, setPrompt] = useState(fromLearning ? "Make the current message shorter and use a more direct booking CTA based on the stronger-performing previous version." : "");
  const [phase, setPhase] = useState<"ask" | "loading" | "done">("ask");
  const result = suggest(current);
  const generate = () => { setPhase("loading"); setTimeout(() => setPhase("done"), 900); };
  return <Sheet open onOpenChange={(o) => !o && onClose()}>
    <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
      <SheetHeader><SheetTitle>✦ Edit with AI · {campaign.name}</SheetTitle></SheetHeader>
      <div className="mt-4 space-y-4 px-1">
        {fromLearning && <div className="rounded-md border border-border bg-muted/40 p-4 text-[13px]"><p className="text-card-foreground">We found that your previous version performed better.</p><p className="mt-2 font-semibold">What we learned</p><p className="text-muted-foreground">{campaign.learned}</p></div>}
        <label className="block text-[12px] font-semibold text-muted-foreground" htmlFor="ai-ins">Instruction</label>
        <Textarea id="ai-ins" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe how you'd like to change this message" className="min-h-[90px]" />
        {phase !== "done" && <Button variant="brand" disabled={!prompt.trim() || phase === "loading"} onClick={generate}>{phase === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}Generate suggestion</Button>}
        {phase === "done" && <>
          <h3 className="pt-2 text-[15px] font-semibold">AI suggestion</h3>
          <Compare leftTitle="Current content" leftMeta="Live now" left={current} rightTitle="AI suggestion" rightMeta="Not published" right={result} />
          <div><p className="text-[13px] font-semibold">What changed</p><ul className="mt-1 list-disc pl-5 text-[13px] text-card-foreground"><li>Shortened the opening</li><li>Removed unnecessary detail</li><li>Added a clearer booking CTA</li></ul></div>
          <div className="flex gap-2"><Button variant="brand" onClick={() => onUse(result)}>Use suggestion</Button><Button variant="ghost" onClick={onClose}>Keep current</Button></div>
        </>}
      </div>
    </SheetContent>
  </Sheet>;
}
