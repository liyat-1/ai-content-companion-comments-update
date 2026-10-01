import { ChevronLeft, ChevronRight, Video, Mic, Plus } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { renderTokens } from "@/lib/campaign";
import { CODE_TYPE_LABEL, type Promotion } from "@/lib/marketing";

/**
 * iMessage preview matching the current iOS look: floating frosted circular
 * nav buttons, a centred avatar with a glass name pill, grey incoming bubbles
 * and a rounded glass composer.
 */
export function SmsPreview({
  message,
  link,
  imageUrl,
  sender = "Hellas Gadgets",
  scale = 0.78,
  promotion,
}: {
  message: string;
  link?: string;
  imageUrl?: string | null;
  sender?: string;
  scale?: number;
  promotion?: Promotion | null;
}) {
  return (
    <PhoneMockup
      scale={scale}
      contentClassName="bg-white"
      chrome={
        <div className="pointer-events-none relative z-30 -mt-1 flex shrink-0 items-start justify-between px-4 pb-1">
          <span className="grid size-9 place-items-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.10)] ring-1 ring-black/5 backdrop-blur-xl">
            <ChevronLeft size={20} className="text-zinc-800" strokeWidth={2.5} />
          </span>
          <div className="flex flex-col items-center">
            <span className="grid size-[46px] place-items-center rounded-full bg-gradient-to-br from-[#8fd3f4] via-[#a6c1ee] to-[#fbc2eb] text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.14)] ring-1 ring-white/70">
              {sender.slice(0, 2).toUpperCase()}
            </span>
            <span className="mt-1.5 flex items-center gap-0.5 rounded-full bg-white/75 px-2.5 py-1 text-[12px] font-semibold text-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.10)] ring-1 ring-black/5 backdrop-blur-xl">
              {sender}
              <ChevronRight size={12} className="text-zinc-400" strokeWidth={3} />
            </span>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.10)] ring-1 ring-black/5 backdrop-blur-xl">
            <Video size={18} className="text-zinc-800" strokeWidth={2} />
          </span>
        </div>
      }
      footer={
        // Floating frosted composer: detached from the screen edge, sitting on
        // its own glass panel above the home indicator.
        <div className="relative px-4 pb-3 pt-3">
          <div className="flex items-center gap-2.5 rounded-[2rem] bg-white/45 p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.30),0_2px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/60 backdrop-blur-2xl">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-black/5 backdrop-blur-xl">
              <Plus size={21} className="text-zinc-700" strokeWidth={2.5} />
            </span>
            <div className="flex h-11 flex-1 items-center justify-between rounded-full bg-white/70 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-black/10 backdrop-blur-xl">
              <span className="text-[16px] text-zinc-500">iMessage</span>
              <Mic size={18} className="text-zinc-500" />
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-2 px-4 pb-4 pt-3">
        <p className="mb-1 text-center text-[11px] font-medium text-zinc-400">
          iMessage · Today 5:00 PM
        </p>
        {imageUrl && (
          <div className="max-w-[72%] overflow-hidden rounded-[1.4rem] rounded-bl-[0.45rem] shadow-sm ring-1 ring-black/5">
            <img src={imageUrl} alt="" className="block h-40 w-full object-cover" />
          </div>
        )}
        <div className="max-w-[80%] rounded-[1.4rem] rounded-bl-[0.45rem] bg-[#e9e9eb] px-3.5 py-2.5">
          <p className="whitespace-pre-wrap text-[15px] leading-[1.35] text-zinc-900">
            {renderTokens(message)}
          </p>
          {link && (
            <p className="mt-1 break-all text-[14.5px] leading-[1.35] text-[#007aff] underline">
              {link}
            </p>
          )}
        </div>
        {promotion && (
          <div className="max-w-[80%] overflow-hidden rounded-[1.4rem] rounded-bl-[0.45rem] bg-[#e9e9eb]">
            <div className="bg-zinc-900 px-3.5 py-2.5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-300">Your exclusive offer</p>
              <p className="mt-0.5 text-[14.5px] font-semibold leading-snug">{promotion.tagline || promotion.name}</p>
            </div>
            <div className="px-3.5 py-2.5">
              <p className="text-[12.5px] leading-snug text-zinc-600">{promotion.detail}</p>
              <p className="mt-2 text-[12.5px] font-semibold text-[#007aff]">
                {CODE_TYPE_LABEL[promotion.codeType ?? "promo"]}: {promotion.code}
              </p>
            </div>
          </div>
        )}
      </div>

    </PhoneMockup>
  );
}
