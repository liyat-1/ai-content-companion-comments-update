/** Client-side reading of anything a user attaches to the AI panel. */
export type PreparedAttachment = {
  name: string;
  mediaType: string;
  kind: "image" | "video" | "pdf" | "text" | "other";
  /** Extracted readable content (sheets, docs, slides, text). */
  text?: string;
  /** Image (or video frame) data URL sent to the model and used as the thumbnail. */
  dataUrl?: string;
  /** Short human summary, e.g. "2 sheets · 48 rows". */
  summary?: string;
};

export type AttachmentInput = { url: string; filename?: string; mediaType?: string };

const MAX_TEXT = 40_000;
const ext = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

async function toBuffer(url: string) { return (await fetch(url)).arrayBuffer(); }

function downscale(src: string | CanvasImageSource, w: number, h: number, max = 1280): string {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(src as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(downscale(img, img.naturalWidth, img.naturalHeight));
    img.onerror = reject;
    img.src = url;
  });
}

/** Grab a representative frame from a video so the AI can "see" it. */
export function videoFrame(url: string): Promise<{ dataUrl: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true; video.playsInline = true; video.preload = "auto"; video.src = url;
    video.onloadedmetadata = () => { video.currentTime = Math.min(1, (video.duration || 2) / 3); };
    video.onseeked = () => resolve({ dataUrl: downscale(video, video.videoWidth, video.videoHeight), duration: video.duration });
    video.onerror = reject;
    setTimeout(() => reject(new Error("timeout")), 8000);
  });
}

async function readSheet(url: string) {
  const XLSX = await import("xlsx");
  const book = XLSX.read(await toBuffer(url), { type: "array", cellDates: true });
  let rows = 0;
  const text = book.SheetNames.map((name) => {
    const sheet = book.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false, dateNF: "yyyy-mm-dd" });
    rows += csv.split("\n").length;
    return `### Sheet: ${name}\n${csv}`;
  }).join("\n\n");
  return { text, summary: `${book.SheetNames.length} sheet${book.SheetNames.length === 1 ? "" : "s"} · ${rows} rows` };
}

async function readDocx(url: string) {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ arrayBuffer: await toBuffer(url) });
  return value;
}

async function readPptx(url: string) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await toBuffer(url));
  const slides = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));
  const parts = await Promise.all(slides.map(async (f, i) => `Slide ${i + 1}: ${(await zip.files[f].async("string")).match(/<a:t>([^<]*)<\/a:t>/g)?.map((t) => t.replace(/<\/?a:t>/g, "")).join(" ") ?? ""}`));
  return parts.join("\n");
}

export async function prepareAttachments(files: AttachmentInput[]): Promise<PreparedAttachment[]> {
  return Promise.all(files.map(async (file): Promise<PreparedAttachment> => {
    const name = file.filename ?? "file";
    const mediaType = file.mediaType || "application/octet-stream";
    const e = ext(name);
    try {
      if (mediaType.startsWith("image/")) return { name, mediaType, kind: "image", dataUrl: await loadImage(file.url) };
      if (mediaType.startsWith("video/")) {
        const frame = await videoFrame(file.url).catch(() => null);
        return { name, mediaType, kind: "video", dataUrl: frame?.dataUrl, summary: frame ? `${Math.round(frame.duration)}s video` : "Video" };
      }
      if (mediaType === "application/pdf" || e === "pdf") {
        const buf = await toBuffer(file.url);
        const b64 = btoa(Array.from(new Uint8Array(buf), (c) => String.fromCharCode(c)).join(""));
        return { name, mediaType: "application/pdf", kind: "pdf", dataUrl: `data:application/pdf;base64,${b64}`, summary: "PDF" };
      }
      if (["xlsx", "xls", "xlsm", "ods", "numbers"].includes(e) || /spreadsheet|excel/.test(mediaType)) {
        const { text, summary } = await readSheet(file.url);
        return { name, mediaType, kind: "text", text: text.slice(0, MAX_TEXT), summary };
      }
      if (e === "docx" || /wordprocessingml/.test(mediaType)) {
        const text = await readDocx(file.url);
        return { name, mediaType, kind: "text", text: text.slice(0, MAX_TEXT), summary: `${text.split(/\s+/).length} words` };
      }
      if (e === "pptx" || /presentationml/.test(mediaType)) {
        const text = await readPptx(file.url);
        return { name, mediaType, kind: "text", text: text.slice(0, MAX_TEXT), summary: `${text.split("\n").length} slides` };
      }
      // CSV, TSV, TXT, MD, JSON, ICS, HTML… anything text-like.
      const raw = await (await fetch(file.url)).text();
      // eslint-disable-next-line no-control-regex
      const binary = /[\x00-\x08\x0E-\x1F]/.test(raw.slice(0, 2000));
      if (binary) return { name, mediaType, kind: "other", summary: "Unreadable file type" };
      if (e === "csv" || e === "tsv") return { name, mediaType, kind: "text", text: raw.slice(0, MAX_TEXT), summary: `${raw.trim().split(/\r?\n/).length} rows` };
      return { name, mediaType, kind: "text", text: raw.slice(0, MAX_TEXT), summary: `${raw.split(/\s+/).length} words` };
    } catch {
      return { name, mediaType, kind: "other", summary: "Could not read file" };
    }
  }));
}

export const ACCEPT_ALL = "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.csv,.tsv,.txt,.md,.json,.ics,.xls,.xlsx,.xlsm,.ods,.html";
