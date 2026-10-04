import { createServerFn } from "@tanstack/react-start";
import type { PreparedAttachment } from "./attachments";

type History = { role: "user" | "assistant"; text: string }[];

export type PlanEvent = { name: string; date: string; note: string; kind: "holiday" | "event" };
export type PlanReply = { reply: string; events: PlanEvent[]; startMonth: number | null; endMonth: number | null; error?: string };

export const planAssist = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; files: PreparedAttachment[]; history: History; range: string; plan: string[] }) => d)
  .handler(async ({ data }): Promise<PlanReply> => {
    const { askGateway, attachmentParts, parseJson } = await import("./ai.server");
    const system = `You are the content-planning assistant for Holiday Inn Times Square (New York) inside a hotel guest-messaging tool. You plan seasonal email/text campaigns for returning guests (Direct and OTA). Today is September 2026. Current release window: ${data.range}. Moments currently in the plan: ${data.plan.join(", ") || "none"}.
Read every attachment carefully (sheets, documents, images, video frames, PDFs) and answer the user's actual request specifically, citing concrete details from the files (names, dates, counts, what an image shows). Keep the reply under 120 words, warm and practical, in markdown.
Extract any dated events/holidays relevant to guest messaging from the files or prompt.
Return ONLY JSON: {"reply": string, "events": [{"name": string, "date": "YYYY-MM-DD", "note": string, "kind": "holiday"|"event"}], "startMonth": number|null, "endMonth": number|null}. Months are 0-11 (0=Jan) in 2026; set them only if the user asks to change the release window or the events require it.`;
    const history = data.history.slice(-6).map((m) => `${m.role}: ${m.text}`).join("\n");
    try {
      const text = await askGateway(system, [{ type: "text", text: `${history ? `Conversation so far:\n${history}\n\n` : ""}User: ${data.text || "Please use the attached files."}` }, ...(attachmentParts(data.files) as never[])]);
      const json = parseJson<PlanReply>(text);
      if (!json) return { reply: text, events: [], startMonth: null, endMonth: null };
      return { reply: json.reply ?? "", events: Array.isArray(json.events) ? json.events.slice(0, 60) : [], startMonth: json.startMonth ?? null, endMonth: json.endMonth ?? null };
    } catch (e) {
      return { reply: "", events: [], startMonth: null, endMonth: null, error: (e as Error).message };
    }
  });

export type EditCopy = { subject?: string; preheader?: string; heading?: string; body?: string; ctaLabel?: string; message?: string };
export type EditReply = { reply: string; copy: EditCopy | null; changes: string[]; why: string; error?: string };

export const editAssist = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; files: PreparedAttachment[]; history: History; kind: "email" | "text"; copy: EditCopy; campaign: string }) => d)
  .handler(async ({ data }): Promise<EditReply> => {
    const { askGateway, attachmentParts, parseJson } = await import("./ai.server");
    const fields = data.kind === "email" ? `{"subject","preheader","heading","body","ctaLabel"}` : `{"message"}`;
    const system = `You edit guest-messaging copy for Holiday Inn Times Square (New York). Campaign: ${data.campaign}. Channel: ${data.kind}. Keep merge tags like {first_name} and {booking_link} intact. Text messages stay under ~300 characters with one link.
Current content (JSON): ${JSON.stringify(data.copy)}
Follow the user's request precisely and use concrete details from any attachments (events, dates, offers, what images show). If the user only asks a question, answer it and return "copy": null.
Return ONLY JSON: {"reply": string (short, friendly, markdown), "copy": ${fields} | null, "changes": string[] (up to 4 short bullets), "why": string (one sentence)}.`;
    const history = data.history.slice(-6).map((m) => `${m.role}: ${m.text}`).join("\n");
    try {
      const text = await askGateway(system, [{ type: "text", text: `${history ? `Conversation so far:\n${history}\n\n` : ""}User: ${data.text || "Use the attached files to improve this content."}` }, ...(attachmentParts(data.files) as never[])]);
      const json = parseJson<EditReply>(text);
      if (!json) return { reply: text, copy: null, changes: [], why: "" };
      return { reply: json.reply ?? "", copy: json.copy ?? null, changes: json.changes ?? [], why: json.why ?? "" };
    } catch (e) {
      return { reply: "", copy: null, changes: [], why: "", error: (e as Error).message };
    }
  });

export type BothReply = { reply: string; direct: EditCopy | null; ota: EditCopy | null; directChanges: string[]; otaChanges: string[]; why: string; error?: string };

/** Rewrites Direct and OTA guest content together from one prompt, keeping each audience distinct. */
export const editBothAssist = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; history: History; kind: "email" | "text"; direct: EditCopy; ota: EditCopy; campaign: string }) => d)
  .handler(async ({ data }): Promise<BothReply> => {
    const { askGateway, parseJson } = await import("./ai.server");
    const fields = data.kind === "email" ? `{"subject","preheader","heading","body","ctaLabel"}` : `{"message"}`;
    const system = `You edit guest-messaging copy for Holiday Inn Times Square (New York). Campaign: ${data.campaign}. Channel: ${data.kind}.
There are two audiences: DIRECT guests (booked directly with the hotel — loyal, reward the relationship) and OTA guests (booked via Expedia/Booking.com — goal is to win their next booking direct, explain why booking direct is better).
Current DIRECT content (JSON): ${JSON.stringify(data.direct)}
Current OTA content (JSON): ${JSON.stringify(data.ota)}
The user gives one instruction that may include shared direction plus audience-specific direction. Apply shared direction to both and audience-specific direction only to that audience. Keep the two versions clearly distinct. Keep merge tags like {first_name} and {booking_link} intact. Text messages stay under ~300 characters with one link. If the user only asks a question, answer and return null copies.
Return ONLY JSON: {"reply": string (short, friendly markdown explaining what you did for each audience), "direct": ${fields} | null, "ota": ${fields} | null, "directChanges": string[] (up to 3 short bullets), "otaChanges": string[] (up to 3), "why": string (one sentence)}.`;
    const history = data.history.slice(-6).map((m) => `${m.role}: ${m.text}`).join("\n");
    try {
      const text = await askGateway(system, [{ type: "text", text: `${history ? `Conversation so far:\n${history}\n\n` : ""}User: ${data.text}` }]);
      const json = parseJson<BothReply>(text);
      if (!json) return { reply: text, direct: null, ota: null, directChanges: [], otaChanges: [], why: "" };
      return { reply: json.reply ?? "", direct: json.direct ?? null, ota: json.ota ?? null, directChanges: json.directChanges ?? [], otaChanges: json.otaChanges ?? [], why: json.why ?? "" };
    } catch (e) {
      return { reply: "", direct: null, ota: null, directChanges: [], otaChanges: [], why: "", error: (e as Error).message };
    }
  });

export type BrandDraft = { voice: string[]; tone: string[]; style: string[]; preferences: string[]; avoid: string[]; summary: string };
export type BrandReply = { reply: string; profile: BrandDraft | null; sources: string[]; error?: string };

/** Conversational brand-profile builder: reads links, files and answers, then proposes a profile to review. */
export const brandAssist = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; files: PreparedAttachment[]; history: History; current: BrandDraft | null }) => d)
  .handler(async ({ data }): Promise<BrandReply> => {
    const { askGateway, attachmentParts, parseJson } = await import("./ai.server");
    const urls = [...new Set((data.text.match(/https?:\/\/[^\s)]+|(?:www\.)[^\s)]+/gi) ?? []))].slice(0, 2);
    const fetched: string[] = [];
    const sources: string[] = [];
    for (const raw of urls) {
      const url = raw.startsWith("http") ? raw : `https://${raw}`;
      try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 DirectfulBot" }, signal: AbortSignal.timeout(9000) });
        const html = await res.text();
        const text = html
          .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;|&amp;|&#\d+;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 7000);
        fetched.push(`Content fetched from ${url}:\n"""\n${text || "(page had no readable text)"}\n"""`);
        sources.push(new URL(url).hostname);
      } catch {
        fetched.push(`The link ${url} could not be opened. Tell the user kindly and ask them to paste the text or attach the file instead.`);
      }
    }
    const system = `You are Directful's brand-voice assistant for a hotel's guest-messaging team. You help them create or refine the hotel's content profile conversationally.
Current profile (JSON or null): ${JSON.stringify(data.current)}
Use any fetched web pages, attached documents/images and the user's answers. Be warm, brief (under 90 words), and specific — cite what you learned from their sources.
If you don't have enough to propose a profile yet, ask ONE focused question (e.g. how should guests feel, words to avoid, formality) and return "profile": null.
When you have enough (or the user asks you to change something), return the full updated profile. Each list has 2-4 short items; "avoid" lists phrases to never use; "summary" is one sentence.
Return ONLY JSON: {"reply": string (markdown), "profile": {"voice": string[], "tone": string[], "style": string[], "preferences": string[], "avoid": string[], "summary": string} | null}.`;
    const history = data.history.slice(-8).map((m) => `${m.role}: ${m.text}`).join("\n");
    try {
      const text = await askGateway(system, [
        { type: "text", text: `${history ? `Conversation so far:\n${history}\n\n` : ""}User: ${data.text || "Please use the attached files."}${fetched.length ? `\n\n${fetched.join("\n\n")}` : ""}` },
        ...(attachmentParts(data.files) as never[]),
      ]);
      const json = parseJson<BrandReply>(text);
      if (!json) return { reply: text, profile: null, sources };
      return { reply: json.reply ?? "", profile: json.profile ?? null, sources };
    } catch (e) {
      return { reply: "", profile: null, sources, error: (e as Error).message };
    }
  });
