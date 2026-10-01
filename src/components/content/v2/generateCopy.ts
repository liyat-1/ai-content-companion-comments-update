import type { PeriodCopy } from "@/lib/contentV2";

const MONTH_COPY: Record<number, { subject: string; heading: string; body: string }> = {
  9: { subject: "{first_name}, October in Midtown is yours", heading: "Crisp evenings. Bright lights. Your city.", body: "October is one of the best months to be in New York — crisp walks past Central Park, Broadway at its best and the rooftop lit up over the city. Your room in the heart of Times Square is waiting. Book direct for our best rate and a warm welcome at check-in." },
  10: { subject: "{first_name}, Thanksgiving in Midtown?", heading: "Come back for the parade", body: "The Thanksgiving Parade passes four blocks from our door, and November in Midtown is full of moments worth coming back for. Your room above Times Square is waiting. Book now for our best rate and a warm welcome at check-in." },
  11: { subject: "{first_name}, December belongs in Midtown", heading: "A festive December awaits", body: "Fifth Avenue's holiday windows, the Rockefeller tree and Midtown at its most magical — all steps from your room above Times Square. Book now for our best rate and a warm welcome at check-in." },
  0: { subject: "{first_name}, a new year in New York", heading: "Start the year in the city", body: "January in Midtown is calm, bright and full of possibilities. Your room above Times Square is waiting whenever you're ready. Book direct for our best rate and a warm welcome at check-in." },
};

export function generateCopy(month: number, tone: string, direction: string, seasonal: string | null, note: string): PeriodCopy {
  const base = MONTH_COPY[month] ?? MONTH_COPY[9];
  let body = base.body;
  if (tone === "concise") body = body.split("—")[0].trim() + ". Book now for our best rate.";
  if (tone === "warmer") body = "We'd love to welcome you back. " + body;
  if (direction === "promotional") body = body.replace("Book direct for our best rate", "Our best rate of the season is live — book direct");
  // Preferences guide the rewrite; they are not guest-facing copy.
  if (/short|concise/i.test(note)) body = body.split(".").slice(0, 2).join(".").trim() + ". Book direct for our best rate.";
  if (/relax|rest|unwind/i.test(note)) body = body.replace("Your room", "A restful stay");
  return {
    email: {
      subject: base.subject,
      preheader: seasonal ? "A seasonal reason to come back — plus your best direct rate." : "Your best direct rate, always.",
      heading: base.heading,
      body: seasonal || direction !== "general" ? body : "It's been a while since your last stay. Your room in the heart of Times Square is waiting. Book direct for our best rate and a warm welcome at check-in.",
      cta: tone === "concise" || direction === "promotional" ? "Book now — best rate" : "Plan my return",
    },
    text: seasonal
      ? `Hi {first_name}! ${seasonal} is 4 blocks from us. Your room above Times Square is waiting — best rate direct: {booking_link}`
      : `Hi {first_name}, your room above Times Square is waiting. Best rate direct: {booking_link}`,
  };
}