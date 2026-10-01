import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  MessageSquarePlus,
  BedDouble,
  Send,
  ThumbsUp,
  MessageSquareDashed,
  CheckSquare,
  Image as ImageIcon,
  Gift,
  ChevronDown,
  Globe,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Sparkle,
  FlaskConical,
  History,
  Settings2,
} from "lucide-react";
import propertyPhoto from "../../assets/pool-dusk.jpg";
import { CURRENT_USER, initialsOf } from "@/lib/marketing";

type Item = { label: string; to?: string; icon: React.ComponentType<{ size?: number; className?: string }> };

const GROUPS: { label?: string; items: Item[] }[] = [
  {
    items: [
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Bookings", icon: CalendarDays },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Automated Invites", to: "/marketing/invites", icon: MessageSquarePlus },
      { label: "Automated Transactional", to: "/marketing/transactional", icon: BedDouble },
      { label: "In-Property Automated Transactional", to: "/marketing/in-property", icon: BedDouble },
      { label: "Drip Campaign", to: "/campaign", icon: Send },
      { label: "Guest Responses", icon: ThumbsUp },
      { label: "Before Stay", icon: MessageSquareDashed },
      { label: "Site Abandonment", icon: CheckSquare },
    ],
  },
  {
    label: "Content Library",
    items: [
      { label: "Content", to: "/content", icon: Sparkles },
      { label: "Library V2", to: "/content/v2", icon: Sparkle },
      { label: "Results V2", to: "/content/results-v2", icon: BarChart3 },
      { label: "Events & Holidays", to: "/content/events", icon: CalendarDays },
      { label: "Results", to: "/content/results", icon: BarChart3 },
      { label: "Settings", to: "/content/settings", icon: Settings2 },
    ],
  },
  {
    label: "Marketing Assets",
    items: [
      { label: "Media Library", to: "/marketing/media", icon: ImageIcon },
      { label: "Promotions", to: "/marketing/promotions", icon: Gift },
    ],
  },
];

const MOBILE_NAV = [
  { label: "Invites", to: "/marketing/invites" },
  { label: "Transactional", to: "/marketing/transactional" },
  { label: "In-property", to: "/marketing/in-property" },
  { label: "Media", to: "/marketing/media" },
  { label: "Content", to: "/content" },
  { label: "Library V2", to: "/content/v2" },
  { label: "Results V2", to: "/content/results-v2" },
  { label: "Events", to: "/content/events" },
  { label: "Results", to: "/content/results" },
  { label: "Promotions", to: "/marketing/promotions" },
  { label: "Drip", to: "/campaign" },
];

/**
 * The enterprise application shell: property selector, left navigation and a
 * compact page header. Matches the existing Directful dashboard chrome.
 */
export function MarketingShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-canvas text-foreground">
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-border bg-card transition-[width] lg:flex ${
          collapsed ? "w-[68px]" : "w-[272px]"
        }`}
      >
        <div className={`flex items-center gap-2.5 border-b border-border py-4 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-[14px] font-bold text-brand-foreground">
            D
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold tracking-tight text-card-foreground">Directful</p>
              <p className="text-[10.5px] text-muted-foreground">Guest messaging</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              className="grid size-7 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center border-b border-border py-2">
            <button
              type="button"
              aria-label="Expand sidebar"
              title="Expand sidebar"
              onClick={() => setCollapsed(false)}
              className="grid size-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {!collapsed && (
        <div className="border-b border-border px-3 py-3">
          <button className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-background/70 p-2 text-left transition-colors hover:border-brand/45 hover:bg-muted/60">
            <img
              src={propertyPhoto}
              alt="Property photograph"
              loading="lazy"
              className="size-10 shrink-0 rounded-md object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-card-foreground">
                Holiday Inn Times Square
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">New York City · IHG</span>
            </span>
            <ChevronDown size={15} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
        )}

        <nav className="flex-1 px-2.5 py-3">
          {GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4 border-t border-border pt-4" : ""}>
              {group.label && !collapsed && (
                <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = item.to ? (item.to === "/content" || item.to === "/content/results" ? pathname === item.to : pathname.startsWith(item.to)) : false;
                const cls = `flex w-full items-center gap-2.5 rounded-md py-[7px] text-left text-[12.5px] transition-colors ${
                  collapsed ? "justify-center px-0" : "px-2.5"
                } ${
                  active
                    ? "bg-brand-soft font-semibold text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`;
                const inner = (
                  <>
                    <item.icon size={16} className={active ? "text-brand" : "text-muted-foreground"} />
                    {!collapsed && <span className="min-w-0 flex-1 leading-snug">{item.label}</span>}
                  </>
                );
                return item.to ? (
                  <Link key={item.label} to={item.to} className={cls} title={item.label}>
                    {inner}
                  </Link>
                ) : (
                  <button key={item.label} type="button" className={cls} title={item.label}>
                    {inner}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-foreground text-[11px] font-semibold text-background">
              {initialsOf(CURRENT_USER.name)}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-card-foreground">{CURRENT_USER.name}</p>
                <p className="truncate text-[10.5px] text-muted-foreground">Property administrator</p>
              </div>
            )}
          </div>
          {!collapsed && <p className="px-2 pt-2 text-[10px] text-muted-foreground">Dashboard version 7.73.0</p>}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <h1 className="truncate text-[18px] font-semibold tracking-tight text-card-foreground">{title}</h1>
          <div className="flex items-center gap-3 text-muted-foreground sm:gap-4">
            <Info size={17} className="hidden sm:block" />
            <span className="hidden rounded-sm border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground lg:inline">
              View as client
            </span>
            <Globe size={17} />
            <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-foreground text-[11px] font-semibold text-background lg:hidden">
              {initialsOf(CURRENT_USER.name)}
            </span>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 lg:hidden">
          {MOBILE_NAV.map((item) => {
            const active = item.to === "/content" || item.to === "/content/results" ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  active ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
