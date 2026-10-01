import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UserContent } from "ai";
import type { PreparedAttachment } from "./attachments";

const MODEL = "openai/gpt-6-astra";

export function attachmentParts(files: PreparedAttachment[]): UserContent {
  const parts: Exclude<UserContent, string> = [];
  for (const f of files) {
    if ((f.kind === "image" || f.kind === "video") && f.dataUrl) {
      parts.push({ type: "text", text: f.kind === "video" ? `Attached video "${f.name}" (${f.summary ?? ""}) — representative frame:` : `Attached image "${f.name}":` });
      parts.push({ type: "image", image: f.dataUrl });
    } else if (f.kind === "pdf" && f.dataUrl) {
      parts.push({ type: "file", data: f.dataUrl.split(",")[1], mediaType: "application/pdf", filename: f.name });
    } else if (f.kind === "video") {
      parts.push({ type: "text", text: `Attached video "${f.name}" — no preview frame could be captured in the user's browser, so its contents are unknown. Acknowledge it by name and ask what it shows if that matters.` });
    } else if (f.text) {
      parts.push({ type: "text", text: `Attached file "${f.name}" (${f.summary ?? ""}):\n"""\n${f.text}\n"""` });
    } else {
      parts.push({ type: "text", text: `Attached file "${f.name}" could not be read.` });
    }
  }
  return parts;
}

/** Streams a Responses call and returns the final text. Throws a user-safe message on failure. */
export async function askGateway(system: string, content: UserContent): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("The AI isn't configured yet.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    system,
    messages: [{ role: "user", content }],
    maxRetries: 0,
    onError: ({ error }) => { failure = error; },
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
  });
  let text = "";
  try { text = await result.text; } catch (e) { failure ??= e; }
  if (failure || !text) {
    const status = (failure as { statusCode?: number } | undefined)?.statusCode;
    if (status === 429) throw new Error("The AI is busy right now — try again in a moment.");
    if (status === 402) throw new Error("AI credits have run out. Add credits in Settings → Plans & credits.");
    if (status === 403) throw new Error("AI access is blocked for this workspace.");
    throw new Error("The AI couldn't answer that. Please try again.");
  }
  return text;
}

export function parseJson<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]) as T; } catch { return null; }
}
