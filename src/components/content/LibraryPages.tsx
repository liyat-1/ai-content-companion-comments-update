import { useState } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Sparkle } from "@/components/ai/Sparkle";
import { useLibrary } from "@/lib/contentLibrary";

function Page({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <MarketingShell title={`Content Library · ${title}`}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-[22px] font-semibold tracking-tight text-card-foreground">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>
        <div className="mt-5">{children}</div>
      </div>
    </MarketingShell>
  );
}
const card = "rounded-lg border border-border bg-card shadow-card";

export function HistoryPage() {
  const { campaigns, versions } = useLibrary();
  const [sel, setSel] = useState(campaigns[1]?.id ?? campaigns[0].id);
  const list = versions.filter((v) => v.campaignId === sel);
  return (
    <Page title="History" sub="Every version of every campaign — kept here so the Create workspace stays focused on creating.">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className={`${card} p-1.5`}>
          {campaigns.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} className={`flex w-full justify-between rounded-sm px-3 py-2 text-left text-[12.5px] ${sel === c.id ? "bg-brand-soft font-semibold text-brand" : "hover:bg-muted"}`}>
              {c.name}<span className="text-[11px] text-muted-foreground">v{c.version}</span>
            </button>
          ))}
        </div>
        <ol className={`${card} divide-y divide-border`}>
          {list.map((v, i) => (
            <li key={`${v.v}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-sm bg-muted text-[12px] font-bold text-card-foreground">v{v.v}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-card-foreground">{v.by === "Directful AI" && <Sparkle size={11} className="text-brand" />}{v.label}</span>
                <span className="block text-[11.5px] text-muted-foreground">{v.by} · {v.when}</span>
              </span>
              {i === 0 && <span className="text-[11px] font-semibold text-brand">Current</span>}
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}

const TESTS = [
  { c: "3 Months", el: "Email subject", a: ["Fall in New York is calling", 6.9], b: ["Your room above Times Square awaits", 8.4], s: "Clear leader" },
  { c: "15 Months+", el: "Text message", a: ["No offer", 2.6], b: ["Book direct and save 10%", 2.9], s: "Collecting data" },
  { c: "After Last Visit", el: "Hero image", a: ["Lobby arrival", 3.1], b: ["Rooftop at dusk", 3.2], s: "No clear difference" },
] as const;

export function AbTestsPage() {
  return (
    <Page title="A/B Tests" sub="Tests and results, kept separate from creation.">
      <div className="space-y-3">
        {TESTS.map((t) => (
          <div key={t.c + t.el} className={`${card} p-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-semibold text-card-foreground">{t.c} · {t.el}</h3>
              <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{t.s}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[["A", t.a], ["B", t.b]].map(([k, v]) => {
                const [label, rate] = v as readonly [string, number];
                return <div key={k as string} className="rounded-md bg-muted/50 px-3 py-2.5"><p className="text-[11px] text-muted-foreground">Version {k as string}</p><p className="text-[13px] font-medium text-card-foreground">{label}</p><p className="text-[18px] font-semibold text-card-foreground">{rate}%</p></div>;
              })}
            </div>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-brand/35 px-3 py-1.5 text-[12px] font-semibold text-brand hover:bg-brand-soft"><Sparkle size={11} />Create variation with AI</button>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function SettingsPage() {
  const [voice, setVoice] = useState("Warm, confident, city-savvy. We invite guests back — we don't sell to them.");
  return (
    <Page title="Settings" sub="How Directful AI writes for Holiday Inn Times Square.">
      <div className={`${card} max-w-2xl space-y-4 p-5`}>
        <label className="block"><span className="mb-1 block text-[12px] font-semibold text-card-foreground">Brand voice</span>
          <textarea rows={3} value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px]" /></label>
        {["Always keep a direct-booking reason in invites", "Avoid heavy discount language", "Suggest images from the Media Library"].map((l) => (
          <label key={l} className="flex items-center gap-2.5 text-[13px] text-card-foreground"><input type="checkbox" defaultChecked className="accent-[var(--brand)]" />{l}</label>
        ))}
      </div>
    </Page>
  );
}

export { PublishedPage, PerformancePage } from "./InsightPages";
