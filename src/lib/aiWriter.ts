/**
 * Directful AI — sample writing engine.
 * Deterministic, hotel-scoped rewrites so the full Generate → Review → Edit with AI
 * flow can be experienced without a live model. Always works from the CURRENT copy,
 * so manual edits are preserved unless the request says otherwise.
 */

export const HOTEL_PROFILE = {
  name: "Holiday Inn Times Square",
  location: "Midtown Manhattan, New York City",
  voice: "Warm, confident, city-savvy",
  amenities: ["Rooftop bar", "Fitness centre", "Steps from Broadway", "Family rooms"],
  offer: "Book direct and save 15%",
};

export type EmailCopy = { subject: string; preheader: string; heading: string; body: string; ctaLabel: string };
export type TextCopy = { message: string };
export type Copy = { kind: "email"; email: EmailCopy } | { kind: "text"; text: TextCopy };

export type Refinement = { copy: Copy; changes: string[]; why: string; reply: string };

export type Personalize = { tone: string; length: string; focus: string };

export const EDIT_QUICK_ACTIONS = [
  "Make it warmer",
  "Make it more concise",
  "Make it more personal",
  "Make it more persuasive",
  "Make it more premium",
  "Make it more conversational",
  "Add seasonal context",
  "Add our offer",
  "Add our upcoming event",
  "Change the CTA",
  "Rewrite the opening",
  "Create a stronger subject line",
  "Create a text version",
];

export const FEEDBACK_REASONS = [
  "Too generic",
  "Too promotional",
  "Doesn't sound like us",
  "Too long",
  "Not relevant",
  "Wrong event",
  "Wrong tone",
  "I want something different",
];

export const TONES = ["Warm", "Premium", "Friendly", "Conversational", "Professional", "Playful", "Direct"];
export const LENGTHS = ["Short", "Medium", "Detailed"];
export const FOCUSES = ["Return stay", "Direct booking", "Offer", "Hotel experience", "Seasonal experience", "Local event", "Loyalty", "Guest relationship"];

const sentences = (s: string) => s.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) ?? [];
const join = (xs: string[]) => xs.join(" ").replace(/\s+/g, " ").trim();
const pick = <T,>(xs: T[], seed: number) => xs[Math.abs(seed) % xs.length];
const has = (s: string, part: string) => s.toLowerCase().includes(part.toLowerCase().slice(0, 24));

const LINES = {
  warm: ["We've genuinely missed having you with us, {{first_name}}.", "It was a real pleasure hosting you, {{first_name}}.", "Our team still remembers your stay fondly, {{first_name}}."],
  personal: ["Your favourite corner of the city is exactly where you left it.", "We'd love to have your room ready just the way you like it.", "Tell us what made your last stay special and we'll make it happen again."],
  persuasive: ["Rooms for the season are filling quickly — book direct to lock in our best rate.", "Booking direct means the best rate, flexible changes and a team that knows you."],
  season: ["Autumn is settling over Manhattan — crisp evenings, golden light in Central Park and Broadway's new season.", "The city turns golden this time of year, and our rooftop is the perfect place to see it.", "Cooler evenings, cosy rooms and the city lit up for the season — it's a lovely time to return."],
  event: ["With the Midtown Business Conference on October 18, we recommend booking early — we're just a short walk away.", "Visiting for the October 18 conference? You'll be minutes from the venue and back in time for the rooftop."],
  voice: ["From our rooftop to your favourite Broadway show, Midtown is right outside the door."],
  opening: ["The city has missed you, {{first_name}}.", "Times Square is glowing — and your room is waiting, {{first_name}}.", "Ready for another New York moment, {{first_name}}?"],
  subject: ["{{first_name}}, the city is calling you back", "Your room above Times Square is waiting", "Autumn in Midtown — come back, {{first_name}}", "A little New York for you, {{first_name}}", "We saved you a view of the city"],
  cta: ["Plan your return", "Book your stay direct", "See your direct rate", "Reserve your room", "Come back to Midtown"],
};

const PREMIUM: [RegExp, string][] = [[/Come back/g, "Return"], [/enjoy/g, "savour"], [/great/g, "exceptional"], [/nice/g, "refined"], [/room/g, "room"]];
const CASUAL: [RegExp, string][] = [[/We would/g, "We'd"], [/We are/g, "We're"], [/It is/g, "It's"], [/you are/g, "you're"]];
const OFFER_RX = /(save|%|off\b|discount|deal|rate is locked|best rate)/i;

function addLine(text: string, line: string, front = false) {
  if (has(text, line)) return text;
  return front ? join([line, text]) : join([text, line]);
}

/** Transform a single piece of prose for a request. Returns the new text and change notes. */
function transform(body: string, request: string, seed: number, p?: Personalize): { body: string; changes: string[] } {
  const r = request.toLowerCase();
  let out = body;
  const changes: string[] = [];

  if (/(don'?t|do not|no|remove|without).{0,20}(discount|offer|promo|deal|%)/.test(r)) {
    out = join(sentences(out).filter((s) => !OFFER_RX.test(s)));
    changes.push("Removed the offer mention");
  } else if (/offer|discount|promo|15%/.test(r) || p?.focus === "Offer") {
    out = addLine(out, `${HOTEL_PROFILE.offer} on your next stay.`);
    changes.push("Added your direct booking offer");
  }
  if (/warm/.test(r) || p?.tone === "Warm") { out = addLine(out, pick(LINES.warm, seed), true); changes.push("Warmer opening"); }
  if (/personal|relationship/.test(r) || p?.focus === "Guest relationship") { out = addLine(out, pick(LINES.personal, seed)); changes.push("Added a personal touch"); }
  if (/persuasive|urgent|convert/.test(r) || p?.focus === "Direct booking") { out = addLine(out, pick(LINES.persuasive, seed)); changes.push("Stronger reason to book direct"); }
  if (/season|autumn|fall|winter/.test(r) || p?.focus === "Seasonal experience") { out = addLine(out, pick(LINES.season, seed)); changes.push("Added seasonal reference"); }
  if (/event|conference/.test(r) || p?.focus === "Local event") { out = addLine(out, pick(LINES.event, seed)); changes.push("Added the October 18 conference"); }
  if (/like our hotel|sound like us|our voice|brand/.test(r) || p?.focus === "Hotel experience") { out = addLine(out, LINES.voice[0]); changes.push("Aligned with your brand voice"); }
  if (/premium|luxur|elegant/.test(r) || p?.tone === "Premium") { PREMIUM.forEach(([a, b]) => { out = out.replace(a, b); }); changes.push("More premium wording"); }
  if (/conversational|casual|friendly|playful/.test(r) || p?.tone === "Conversational" || p?.tone === "Friendly") {
    CASUAL.forEach(([a, b]) => { out = out.replace(a, b); });
    if (!/^hi\b/i.test(out)) out = `Hi {{first_name}}! ${out}`;
    changes.push("More conversational tone");
  }
  if (/opening|intro|first line/.test(r)) {
    const s = sentences(out);
    s[0] = pick(LINES.opening, seed);
    out = join(s);
    changes.push("Rewrote the opening");
  }
  if (/concise|short|trim|brief/.test(r) || p?.length === "Short") {
    const s = sentences(out);
    if (s.length > 2) { out = join(s.slice(0, 2)); changes.push("Shortened the copy"); }
  }
  if (p?.length === "Detailed") { out = addLine(out, "Our rooftop bar, family rooms and fitness centre are all ready for you."); changes.push("Added more hotel detail"); }
  return { body: out, changes };
}

export function refine(copy: Copy, request: string, seed = 0, p?: Personalize): Refinement {
  const r = request.toLowerCase();
  if (copy.kind === "text") {
    const { body, changes } = transform(copy.text.message, request, seed, p);
    let message = body;
    if (/cta|call to action|link/.test(r)) { message = message.replace(/\s*\{\{booking_link\}\}/g, ""); message = `${message} ${pick(LINES.cta, seed)}: {{booking_link}}`; changes.push("Changed the CTA"); }
    if (!changes.length) { message = addLine(message, pick([...LINES.personal, ...LINES.season], seed + 1)); changes.push("Fresh wording in the same direction"); }
    return { copy: { kind: "text", text: { message } }, changes, why: whyFor(changes), reply: replyFor(changes, "text message") };
  }

  const email = { ...copy.email };
  const changes: string[] = [];
  if (/subject/.test(r)) { email.subject = pick(LINES.subject.filter((s) => s !== copy.email.subject), seed); changes.push("New subject line"); }
  if (/cta|call to action|button/.test(r)) { email.ctaLabel = pick(LINES.cta.filter((c) => c !== copy.email.ctaLabel), seed); changes.push("Changed the CTA"); }
  if (/text version|sms/.test(r)) {
    const first = sentences(copy.email.body).slice(0, 2).join(" ");
    return {
      copy: { kind: "text", text: { message: `Hi {{first_name}}! ${first} ${email.ctaLabel}: {{booking_link}}`.replace(/\s+/g, " ") } },
      changes: ["Created a text version from this email"],
      why: "Texts work best short, so this keeps the first two sentences and your CTA.",
      reply: "Here's a matching text version based on this email. You can apply it to the Text channel.",
    };
  }
  const t = transform(email.body, request, seed, p);
  email.body = t.body;
  changes.push(...t.changes);
  if (/season|autumn|fall/.test(r) && !/autumn|fall/i.test(email.heading)) { email.heading = "Autumn in New York, the way you remember it"; }
  if (!changes.length) {
    email.body = addLine(email.body, pick([...LINES.personal, ...LINES.season, ...LINES.voice], seed + 2));
    email.subject = pick(LINES.subject, seed + 1);
    changes.push("Fresh wording in the same direction", "New subject line");
  }
  return { copy: { kind: "email", email }, changes, why: whyFor(changes), reply: replyFor(changes, "email") };
}

function whyFor(changes: string[]) {
  const c = changes.join(" ").toLowerCase();
  if (c.includes("seasonal")) return "Your selected period overlaps with autumn, and this campaign currently uses evergreen messaging.";
  if (c.includes("conference")) return "This event falls inside your selected content period and is relevant to guests who may be planning a stay.";
  if (c.includes("offer")) return "Your 15% direct booking offer is active, so it gives returning guests a clear reason to book with you.";
  if (c.includes("shortened")) return "Shorter messages keep the booking action visible sooner.";
  if (c.includes("voice")) return "Your existing content uses a warm, city-savvy tone, so this keeps that style.";
  return "Your existing content already uses a warm, personal tone, so this keeps that style while refreshing the wording.";
}

function replyFor(changes: string[], what: string) {
  return `Here's a suggested update to your ${what}. I kept your current wording and only changed: ${changes.map((c) => c.toLowerCase()).join(", ")}.`;
}

/** Word-level diff: returns tokens marked as added/removed/same. */
export function diffWords(a: string, b: string): { t: string; s: "same" | "add" | "del" }[] {
  const A = a.split(/(\s+)/), B = b.split(/(\s+)/);
  const n = A.length, m = B.length;
  if (n * m > 250_000) return [{ t: a, s: "del" }, { t: " ", s: "same" }, { t: b, s: "add" }];
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: { t: string; s: "same" | "add" | "del" }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: A[i], s: "same" }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: A[i++], s: "del" });
    else out.push({ t: B[j++], s: "add" });
  }
  while (i < n) out.push({ t: A[i++], s: "del" });
  while (j < m) out.push({ t: B[j++], s: "add" });
  return out;
}

/* ---------------- Campaign generation ---------------- */

export const AI_INVITES = [
  { id: "after-last-visit", name: "After Last Visit", when: "15 days – 3 months", status: "evergreen" },
  { id: "lost-3", name: "3 Months", when: "3 months", status: "evergreen" },
  { id: "lost-6", name: "6 Months", when: "6 months", status: "evergreen" },
  { id: "lost-9", name: "9 Months", when: "9 months", status: "repetitive" },
  { id: "lost-12", name: "12 Months", when: "12 months", status: "evergreen" },
  { id: "lost-15", name: "15 Months", when: "15 months", status: "repetitive" },
  { id: "lost-15-plus", name: "15 Months+", when: "15+ months", status: "repetitive" },
] as const;

export const OPTION_NAMES = ["Warm & Personal", "Seasonal", "Direct & Promotional"];

const DIRECTIONS = [
  { dir: "Keep the focus on returning guests with a warm thank-you and an easy way back.", why: "This is the first touch after a stay, so it works best personal rather than promotional." },
  { dir: "Autumn return-stay message focused on the experience guests already enjoyed.", why: "Your current message is evergreen. Adding seasonal context can make the message feel more timely." },
  { dir: "Invite guests back for autumn weekends and the October 18 conference.", why: "The 6 Months window lands guests in mid-October, when the conference drives demand." },
  { dir: "Fresh, city-led story to replace a message guests have seen before.", why: "Your current 9 Months copy repeats the 6 Months offer wording." },
  { dir: "Celebrate the anniversary of their stay with a personal invitation.", why: "A one-year moment is a natural, non-promotional reason to reach out." },
  { dir: "Win back lapsed guests with your 15% direct booking offer.", why: "After 15 months, a clear incentive gives guests a reason to choose you again." },
  { dir: "Reintroduce the hotel with what's new, plus a gentle direct offer.", why: "Long-lapsed guests may not remember the details, so this reintroduces the hotel first." },
];
export const directionFor = (i: number) => DIRECTIONS[i % DIRECTIONS.length];

const HEADS = ["We'd love to welcome you back", "Autumn in New York is calling", "Your room above Times Square is ready", "The city has changed — come see it", "One year since your stay", "It's been too long, {{first_name}}", "A lot has changed in Midtown"];

export function generateCopy(i: number, option: number, variation = 0): { email: EmailCopy; text: TextCopy } {
  const name = AI_INVITES[i].name;
  const opener = [
    `Thank you again for staying with us, {{first_name}}. It was a pleasure having you at ${HOTEL_PROFILE.name}.`,
    `Autumn is settling over Manhattan, {{first_name}} — crisp evenings, golden light in Central Park and Broadway's new season.`,
    `{{first_name}}, your next New York stay is better when you book with us directly.`,
  ][option % 3];
  const middle = [
    [
      "Whenever you're ready for another city break, your favourite spot above Times Square is waiting.",
      "We'd love to hear how your stay was — and to welcome you back soon.",
      "Our rooftop is open late, and the team would love to see you again.",
    ],
    [
      "Come back for a slower weekend — rooftop drinks at dusk, a show just around the corner, and a cosy room to return to.",
      "With the Midtown Business Conference on October 18, it's a lovely time to plan a return.",
      "The city is at its best this season, and we're just steps from it all.",
    ],
    [
      `${HOTEL_PROFILE.offer} on your next stay, with flexible changes and our best available rate.`,
      "Booking direct means no middleman — just the best rate and a team that knows you.",
      "Your direct guest rate is waiting whenever you plan your next trip.",
    ],
  ][option % 3];
  const mid = middle[(i + variation) % middle.length];
  const body = `${opener} ${mid}`;
  return {
    email: {
      subject: pick(LINES.subject, i + option + variation),
      preheader: option === 2 ? "Your best rate is always direct." : "Your room above Times Square is ready when you are.",
      heading: option === 1 ? "Autumn in New York is calling" : HEADS[(i + variation) % HEADS.length],
      body,
      ctaLabel: pick(LINES.cta, i + option + variation),
    },
    text: {
      message: `${option === 2 ? `Hi {{first_name}}! ${HOTEL_PROFILE.offer} at ${HOTEL_PROFILE.name}.` : option === 1 ? `Hi {{first_name}}! Autumn in NYC is here 🍂 Come back to ${HOTEL_PROFILE.name}.` : `Hi {{first_name}}, we've missed you at ${HOTEL_PROFILE.name}.`} ${name === "After Last Visit" ? "Thanks again for staying with us." : ""} Book direct: {{booking_link}}`.replace(/\s+/g, " "),
    },
  };
}

export const RECOMMENDED_MEDIA = [
  { name: "Rooftop bar at dusk", reason: "Fits the seasonal, evening-led direction of this campaign." },
  { name: "Deluxe room with city view", reason: "Shows the experience guests already enjoyed." },
];

export const RECOMMENDED_TEMPLATE = { name: "Warm Image + CTA", reason: "Fits this campaign because the message focuses on returning guests and seasonal inspiration." };
