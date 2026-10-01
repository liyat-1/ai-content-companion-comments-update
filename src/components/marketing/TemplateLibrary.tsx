import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useMarketing, type EmailTemplate } from "@/lib/marketing";

/** Grid of saved email templates, each shown as a real cover photograph. */
export function TemplateLibrary({
  open,
  onClose,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedId?: string;
  onSelect: (t: EmailTemplate) => void;
}) {
  const { templates } = useMarketing();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(templates.map((t) => t.category)))],
    [templates],
  );

  if (!open) return null;
  const query = q.trim().toLowerCase();
  const list = templates
    .filter((t) => (cat === "All" ? true : t.category === cat))
    .filter(
      (t) =>
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.desc.toLowerCase().includes(query),
    );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-float">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-card-foreground">Template library</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Pick a starting point for this email.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
          <div className="relative min-w-[190px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={`rounded-sm px-3 py-1 text-[12px] font-medium transition-colors ${
                  cat === c
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const active = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onSelect(t);
                  onClose();
                }}
                aria-pressed={active}
                className={`group overflow-hidden rounded-lg border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-lift ${
                  active ? "border-brand ring-2 ring-brand/25" : "border-border hover:border-brand/45"
                }`}
              >
                <div className="relative h-52 overflow-hidden bg-muted p-3">
                  <div className="mx-auto h-full max-w-52 overflow-hidden rounded-sm bg-background shadow-card ring-1 ring-border/70">
                    <img src={t.hero} alt={`${t.name} email preview`} loading="lazy" width={480} height={200} className="h-20 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div className="space-y-1.5 px-3 py-2.5"><div className="line-clamp-1 text-[8px] font-semibold text-card-foreground">{t.heading}</div><div className="line-clamp-2 text-[6.5px] leading-relaxed text-muted-foreground">{t.body}</div><span className="mt-1.5 inline-block rounded-sm px-2 py-1 text-[6px] font-semibold text-brand-foreground" style={{ background: t.accent }}>{t.ctaLabel}</span></div>
                  </div>
                  <span className="absolute left-2 top-2 rounded-sm bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur">
                    {t.category}
                  </span>
                  {active && (
                    <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-brand-foreground shadow-md">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="border-t border-border px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-card-foreground">{t.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            );
          })}
          {list.length === 0 && (
            <p className="col-span-full py-10 text-center text-[13px] text-muted-foreground">
              No templates match that search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
