import {
  BANNER_THEMES,
  CODE_TYPE_LABEL,
  CURRENT_USER,
  bannerTemplateOf,
  promotionValidity,
  useMarketing,
  type BannerTheme,
  type Promotion,
} from "@/lib/marketing";

type BannerPromotion = Pick<Promotion, "name" | "code" | "codeType" | "discountPercent" | "minNights" | "tagline"> &
  Partial<Promotion>;

/** Deterministic banner tint so every offer keeps the same colour everywhere. */
export function bannerTheme(seed: string, chosen?: string) {
  const picked = BANNER_THEMES.find((theme) => theme.id === chosen);
  if (picked) return picked;
  let n = 0;
  for (let i = 0; i < seed.length; i += 1) n = (n + seed.charCodeAt(i)) % 997;
  return BANNER_THEMES[n % BANNER_THEMES.length];
}

export function bannerTint(seed: string, chosen?: string) {
  return bannerTheme(seed, chosen).gradient;
}

function defaultKicker(fullName: string) {
  const first = fullName.split(" ")[0]?.toUpperCase() ?? "GUEST";
  return `${first}, YOU UNLOCKED`;
}

function useBannerArt(promotion: BannerPromotion) {
  const { media } = useMarketing();
  const pick = (id?: string) => media.find((m) => m.id === id && m.type === "image")?.url;
  return { logo: pick(promotion.logoId), photo: pick(promotion.bannerImageId) };
}

type BannerCtx = {
  promotion: BannerPromotion;
  kicker: string;
  propertyName: string;
  headline: string;
  theme: BannerTheme;
  logo?: string;
  photo?: string;
};

function RibbonBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo } = ctx;
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} px-4 py-7`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-20" />}
      <div className="relative flex items-start justify-between gap-2">
        {logo ? (
          <img src={logo} alt="" loading="lazy" className="size-9 rounded-full bg-white/95 object-contain p-1 shadow-sm" />
        ) : (
          <span className="size-9" />
        )}
        <p className="text-right text-[11px] font-semibold text-white/90">{propertyName}</p>
      </div>
      <div className="relative mt-5 pb-3">
        <span className="absolute -top-3 left-1 z-10 -rotate-[4deg] rounded-[3px] bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-foreground shadow-sm">
          {kicker}
        </span>
        <div className={`rotate-[-2deg] rounded-[3px] ${theme.ribbon} px-4 py-4 pl-8 shadow-md`}>
          <p className="text-[19px] font-extrabold uppercase leading-tight tracking-wide text-white">{headline}</p>
        </div>
      </div>
    </div>
  );
}

function TicketBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} px-4 py-5`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-15" />}
      <div className="relative flex items-stretch gap-3">
        <div className="min-w-0 flex-1 text-white">
          {logo && (
            <img src={logo} alt="" loading="lazy" className="size-8 rounded-full bg-white/95 object-contain p-0.5 shadow-sm" />
          )}
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">{kicker}</p>
          <p className="mt-1.5 text-[16px] font-extrabold uppercase leading-tight">{headline}</p>
        </div>
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-center border-l-2 border-dashed border-white/50 pl-3 text-center text-white">
          <p className="text-[19px] font-extrabold leading-none">{promotion.discountPercent ? `${promotion.discountPercent}%` : "★"}</p>
          <p className="mt-1.5 break-all text-[10px] font-bold uppercase tracking-wider">{promotion.code || "OFFER"}</p>
        </div>
      </div>
      <p className="relative mt-3 text-right text-[10px] font-semibold text-white/85">{propertyName}</p>
    </div>
  );
}

function SpotlightBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative min-h-[158px] bg-gradient-to-br ${theme.gradient} px-4 py-6`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40" />
      <div className="relative flex min-h-[134px] flex-col items-center justify-center text-center text-white">
        {logo && (
          <img src={logo} alt="" loading="lazy" className="size-11 rounded-full bg-white/95 object-contain p-1 shadow" />
        )}
        <p className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/85">
          {propertyName} · {kicker}
        </p>
        <p className="mt-1.5 max-w-[95%] text-[17px] font-extrabold uppercase leading-tight [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
          {headline}
        </p>
        {promotion.discountPercent ? (
          <span className="mt-2.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold" style={{ color: theme.swatch }}>
            {promotion.discountPercent}% OFF
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FrameBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative bg-gradient-to-br ${theme.gradient} p-2.5`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-10" />}
      <div className="relative rounded-[3px] border-2 border-white/70 bg-card px-4 py-5 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{propertyName}</p>
        {logo && <img src={logo} alt="" loading="lazy" className="mx-auto mt-2 size-12 object-contain" />}
        <p className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.swatch }}>
          {kicker}
        </p>
        <p className="mt-1 text-[17px] font-extrabold uppercase leading-tight text-foreground">{headline}</p>
        <span
          className="mt-3 inline-block rounded-sm px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: theme.swatch }}
        >
          {promotion.code || "OFFER"}
        </span>
      </div>
    </div>
  );
}

function MinimalBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, promotion } = ctx;
  return (
    <div className="relative bg-card px-4 pb-4 pt-5">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.gradient}`} />
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-center">
          <p className="text-[30px] font-extrabold leading-none" style={{ color: theme.swatch }}>
            {promotion.discountPercent ? `${promotion.discountPercent}%` : "★"}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {promotion.discountPercent ? "off" : "offer"}
          </p>
        </div>
        <div className="min-w-0 flex-1 border-l border-border pl-4">
          <p className="truncate text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {kicker} · {propertyName}
          </p>
          <p className="mt-1 text-[15.5px] font-extrabold uppercase leading-tight text-foreground">{headline}</p>
          {logo && <img src={logo} alt="" loading="lazy" className="mt-2 size-7 object-contain" />}
        </div>
      </div>
    </div>
  );
}

function SplitBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className="grid min-h-[150px] grid-cols-[42%_58%] bg-card">
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="relative grid h-full place-items-center p-3">
          {logo ? <img src={logo} alt="" loading="lazy" className="max-h-14 max-w-[72px] rounded bg-card/90 object-contain p-1.5" /> : <span className="text-[28px] font-black text-white">{promotion.discountPercent ? `${promotion.discountPercent}%` : "★"}</span>}
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-center px-4 py-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{propertyName}</p>
        <p className="mt-2 text-[9.5px] font-bold uppercase" style={{ color: theme.swatch }}>{kicker}</p>
        <p className="mt-1 text-[16px] font-extrabold uppercase leading-tight text-foreground">{headline}</p>
        {promotion.code && <p className="mt-3 text-[10.5px] font-semibold text-muted-foreground">Use {promotion.code}</p>}
      </div>
    </div>
  );
}

function EditorialBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, promotion } = ctx;
  return (
    <div className="relative overflow-hidden bg-card px-5 py-6">
      <div className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: theme.swatch }} />
      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{propertyName} · {kicker}</p>
          <p className="mt-2 max-w-[320px] text-[22px] font-black uppercase leading-[1.05] text-foreground">{headline}</p>
          <p className="mt-3 text-[11px] font-semibold" style={{ color: theme.swatch }}>{promotion.discountPercent ? `${promotion.discountPercent}% off` : "Exclusive guest offer"}</p>
        </div>
        {logo && <img src={logo} alt="" loading="lazy" className="size-11 shrink-0 object-contain" />}
      </div>
    </div>
  );
}

function BadgeBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className={`relative min-h-[170px] overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
      {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-foreground/45" />
      <div className="relative flex min-h-[170px] items-center justify-center p-5 text-center">
        <div className="grid size-32 place-items-center rounded-full border border-white/60 bg-card/95 p-4 shadow-lift">
          {logo && <img src={logo} alt="" loading="lazy" className="h-6 max-w-16 object-contain" />}
          <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{kicker}</p>
          <p className="text-[14px] font-black uppercase leading-tight text-foreground">{headline}</p>
          <p className="text-[9px] font-semibold" style={{ color: theme.swatch }}>{promotion.discountPercent ? `${promotion.discountPercent}% OFF` : propertyName}</p>
        </div>
      </div>
    </div>
  );
}

function UpgradeBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className="bg-card">
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-foreground/15" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/80">{kicker}</p>
          <p className="mt-1 text-[15px] font-semibold leading-tight">{headline}</p>
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-start gap-2.5">
          {logo ? <img src={logo} alt="" loading="lazy" className="size-8 shrink-0 rounded-md object-contain" /> : <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-soft text-[15px]">▣</span>}
          <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Room upgrade</p><p className="text-[13px] font-semibold text-foreground">{promotion.name}</p></div>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md bg-muted/60 px-3 py-2.5 text-[10px]">
          <span className="text-muted-foreground">Your stay</span><span style={{ color: theme.swatch }}>→</span><span className="text-right font-semibold" style={{ color: theme.swatch }}>{promotion.discountPercent ? `${promotion.discountPercent}% saving` : "Upgraded stay"}</span>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">{promotion.detail}</p>
        <p className="mt-2 text-[9.5px] font-medium text-muted-foreground">{propertyName}</p>
      </div>
    </div>
  );
}

function ScheduleBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  return (
    <div className="bg-card">
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        {photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="relative flex h-full flex-col justify-end p-3 text-white"><p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/80">{kicker}</p><p className="mt-1 text-[15px] font-semibold leading-tight">{headline}</p></div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2.5">{logo ? <img src={logo} alt="" loading="lazy" className="size-8 rounded-md object-contain" /> : <span className="grid size-8 rounded-md bg-brand-soft place-items-center text-brand">◷</span>}<div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Flexible timing</p><p className="text-[13px] font-semibold text-foreground">{promotion.name}</p></div></div>
        <div className="mt-3 rounded-md bg-muted/60 px-3 py-2.5"><div className="flex justify-between text-[9.5px] text-muted-foreground"><span>11:00</span><strong style={{ color: theme.swatch }}>Your stay</strong><span>15:00</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card"><span className="block h-full w-2/3 rounded-full" style={{ backgroundColor: theme.swatch }} /></div></div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">{promotion.detail}</p>
        <p className="mt-2 text-[9.5px] font-medium text-muted-foreground">{propertyName}</p>
      </div>
    </div>
  );
}

function IncludedBanner({ ctx }: { ctx: BannerCtx }) {
  const { theme, kicker, propertyName, headline, logo, photo, promotion } = ctx;
  const benefits = [promotion.detail, promotion.discountPercent ? `${promotion.discountPercent}% off your stay` : "Included with this offer", promotion.minNights ? `Available for stays of ${promotion.minNights}+ nights` : "Available on eligible stays"];
  return (
    <div className="bg-card">
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${theme.gradient}`}>{photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}<div className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-3 text-white"><p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/80">{kicker}</p><p className="mt-1 text-[15px] font-semibold leading-tight">{headline}</p></div></div>
      <div className="p-3.5"><div className="flex items-center gap-2.5">{logo ? <img src={logo} alt="" loading="lazy" className="size-8 rounded-md object-contain" /> : <span className="grid size-8 place-items-center rounded-md bg-brand-soft text-brand">◇</span>}<div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Included perks</p><p className="text-[13px] font-semibold text-foreground">{promotion.name}</p></div></div><div className="mt-3 space-y-1.5">{benefits.map((benefit) => <p key={benefit} className="flex gap-2 text-[10.5px] leading-relaxed text-muted-foreground"><span style={{ color: theme.swatch }}>✓</span><span>{benefit}</span></p>)}</div><p className="mt-2 text-[9.5px] font-medium text-muted-foreground">{propertyName}</p></div>
    </div>
  );
}

function BannerFooter({ promotion, showCode = true, showDescription = true }: { promotion: BannerPromotion; showCode?: boolean; showDescription?: boolean }) {
  return (
    <div className="space-y-1 border-t border-border/60 px-3.5 py-2.5">
      {showDescription && promotion.detail && <p className="text-[11px] leading-relaxed text-card-foreground">{promotion.detail}</p>}
      {showCode && (
        <p className="text-[11.5px] font-semibold text-card-foreground">
          {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]}: {promotion.code || "—"}
        </p>
      )}
      <p className="text-[10.5px] text-muted-foreground">
        {promotion.discountPercent ? `${promotion.discountPercent}% off` : "No discount set"}
        {promotion.minNights ? ` · min ${promotion.minNights} night${promotion.minNights === 1 ? "" : "s"}` : ""}
      </p>
      <p className="text-[10.5px] text-muted-foreground">{promotionValidity(promotion as Promotion)}</p>
    </div>
  );
}

/**
 * The offer banner a guest sees. Eight layout templates, eight colour themes,
 * optional logo and background photo from the media library, and fully
 * editable wording. Used as the live preview while an offer is being edited
 * and as the visual for an offer everywhere else.
 */
export function PromoBanner({
  promotion,
  property = "Your hotel",
  className = "",
}: {
  promotion: BannerPromotion;
  property?: string;
  className?: string;
}) {
  const template = bannerTemplateOf(promotion);
  const { logo, photo } = useBannerArt(promotion);
  const kicker = promotion.kicker?.trim() || defaultKicker(CURRENT_USER.name);
  const propertyName = promotion.propertyName?.trim() || property;
  const headline = (promotion.tagline || promotion.name || "The best rate").toUpperCase();
  const theme = bannerTheme(promotion.code || promotion.name || "offer", promotion.bannerStyle);
  const ctx: BannerCtx = { promotion, kicker, propertyName, headline, theme, logo, photo };

  const body =
    template === "ticket" ? (
      <TicketBanner ctx={ctx} />
    ) : template === "spotlight" ? (
      <SpotlightBanner ctx={ctx} />
    ) : template === "frame" ? (
      <FrameBanner ctx={ctx} />
    ) : template === "minimal" ? (
      <MinimalBanner ctx={ctx} />
    ) : template === "split" ? (
      <SplitBanner ctx={ctx} />
    ) : template === "editorial" ? (
      <EditorialBanner ctx={ctx} />
    ) : template === "badge" ? (
      <BadgeBanner ctx={ctx} />
    ) : template === "upgrade" ? (
      <UpgradeBanner ctx={ctx} />
    ) : template === "schedule" ? (
      <ScheduleBanner ctx={ctx} />
    ) : template === "included" ? (
      <IncludedBanner ctx={ctx} />
    ) : (
      <RibbonBanner ctx={ctx} />
    );

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-card shadow-card ${className}`}>
      {body}
      <BannerFooter promotion={promotion} showCode={template !== "ticket"} showDescription={!(["upgrade", "schedule", "included"] as string[]).includes(template)} />
    </div>
  );
}
