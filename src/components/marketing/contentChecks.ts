export type CheckStatus = "pass" | "warn";
export type ContentCheck = { status: CheckStatus; label: string; detail: string };

const RISKY_WORDS = [
  "free money",
  "act now",
  "urgent",
  "winner",
  "you have won",
  "guaranteed",
  "risk free",
  "click here",
  "buy now",
  "100% free",
  "limited time only",
];

const SHORT_LINK_HOSTS = ["bit.ly", "tinyurl", "t.co", "goo.gl", "ow.ly", "is.gd"];

/**
 * Practical, local-only content checks for a guest-facing message.
 * Everything runs on the current draft text — no external service.
 */
export function checkContent(parts: { label: string; text: string }[]): ContentCheck[] {
  const text = parts.map((p) => p.text).join(" ").trim();
  const checks: ContentCheck[] = [];

  // Risky wording
  const lower = text.toLowerCase();
  const hits = RISKY_WORDS.filter((w) => lower.includes(w));
  checks.push(
    hits.length
      ? { status: "warn", label: "Pressuring wording", detail: `Consider rewording: ${hits.join(", ")}.` }
      : { status: "pass", label: "Tone", detail: "No pressuring or spammy wording found." },
  );

  // Excessive capitals
  const words = text.split(/\s+/).filter(Boolean);
  const shouty = words.filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  const capRatio = words.length ? shouty.length / words.length : 0;
  checks.push(
    capRatio > 0.15 || shouty.length > 3
      ? { status: "warn", label: "Capital letters", detail: "Several words are in full capitals — carriers and guests read this as shouting." }
      : { status: "pass", label: "Capital letters", detail: "Capitalisation looks natural." },
  );

  // Excessive punctuation
  const bangs = (text.match(/!{2,}/g) ?? []).length;
  checks.push(
    bangs > 0
      ? { status: "warn", label: "Punctuation", detail: "Repeated exclamation marks can trigger carrier filters. Use one at most." }
      : { status: "pass", label: "Punctuation", detail: "Punctuation looks calm." },
  );

  // Suspicious links
  const urls = text.match(/https?:\/\/[^\s]+|[a-z0-9-]+\.[a-z]{2,}\/\S*/gi) ?? [];
  const suspicious = urls.filter((u) => SHORT_LINK_HOSTS.some((h) => u.toLowerCase().includes(h)));
  checks.push(
    suspicious.length
      ? { status: "warn", label: "Links", detail: `Shortened links (${suspicious.join(", ")}) are often blocked. Use your booking link.` }
      : { status: "pass", label: "Links", detail: urls.length ? "Links look trustworthy." : "No links included." },
  );

  // Missing context — personalisation or dates
  const hasContext = /\{\{[a-z_]+\}\}/.test(text) || /\b(arrival|check-?in|stay|booking|room)\b/i.test(text);
  checks.push(
    hasContext
      ? { status: "pass", label: "Context", detail: "The message tells guests what it is about." }
      : { status: "warn", label: "Context", detail: "Add a merge tag (like first name) or mention the stay so guests know it is genuine." },
  );

  // Length
  const total = text.length;
  if (total === 0) {
    checks.push({ status: "warn", label: "Length", detail: "The message is empty." });
  } else if (total > 480) {
    checks.push({ status: "warn", label: "Length", detail: `${total} characters is long — guests rarely read past a few sentences.` });
  } else {
    checks.push({ status: "pass", label: "Length", detail: `${total} characters — a comfortable read.` });
  }

  return checks;
}
