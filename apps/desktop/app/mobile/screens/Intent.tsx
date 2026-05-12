"use client"

import Image from "next/image"
import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"

import type { NavCtx, ScreenRenderer } from "./types"

export const Intent: ScreenRenderer = (ctx) => ({
  body: <IntentBody ctx={ctx} />,
  cta: (
    <div className="mx-auto w-full max-w-[320px]">
      <button
        type="button"
        onClick={() => ctx.push("sign")}
        className="pressable mx-auto flex w-full items-center justify-center rounded-[18px] py-[17px] font-display text-[16px] font-bold text-white outline-none"
        style={{
          background: "#7c5cff",
          border: "none",
          boxShadow: "0 12px 28px -6px rgba(124,92,255,0.5)",
        }}
      >
        Create intent
      </button>
    </div>
  ),
})

function IntentBody({ ctx }: { ctx: NavCtx }) {
  const [text, setText] = useState("")
  const [listening, setListening] = useState(false)

  return (
    <IntentComposerFrame
      ctx={ctx}
      text={text}
      setText={setText}
      listening={listening}
      setListening={setListening}
      mascotSrc={ctx.intentPrivate ? "/state-09.png" : "/state-05.png"}
      mascotHeightClass={
        ctx.intentPrivate
          ? "h-[min(142px,39vw)]"
          : "h-[min(124px,34vw)]"
      }
    />
  )
}

/** Shared layout — public (`state-05`) vs private (`state-09`) mascot only. */
function IntentComposerFrame({
  ctx,
  text,
  setText,
  listening,
  setListening,
  mascotSrc,
  mascotHeightClass,
}: {
  ctx: NavCtx
  text: string
  setText: Dispatch<SetStateAction<string>>
  listening: boolean
  setListening: Dispatch<SetStateAction<boolean>>
  mascotSrc: string
  mascotHeightClass: string
}) {
  const toggleVoice = () => setListening((v) => !v)

  return (
    <div className="mx-auto w-full max-w-[320px] pb-2">
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#2dd4bf] bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <span className="size-2 shrink-0 rounded-full bg-[#14b8a6]" aria-hidden />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0f766e]">
          AI Parser · KumoAI · Local
        </span>
      </div>

      <h1 className="mt-4 font-display text-[28px] font-black leading-tight tracking-[-0.03em] text-[#0f172a]">
        New payment
      </h1>
      <p className="mt-2 text-[14px] font-medium leading-snug text-[#6b7380]">
        Describe the payment in plain language.
      </p>

      <div className="relative mt-5">
        <div className="relative z-[2] flex justify-center">
          <Image
            src={mascotSrc}
            alt=""
            width={340}
            height={340}
            priority
            draggable={false}
            className={`${mascotHeightClass} w-auto object-contain object-bottom drop-shadow-[0_10px_28px_rgba(15,23,42,0.1)]`}
          />
        </div>
        <div className="relative z-[1] -mt-[3.25rem] rounded-[24px] border border-black/[0.06] bg-white px-4 pb-4 pt-[3.35rem] shadow-[0_10px_36px_-14px_rgba(15,23,42,0.12)]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Describe your payment"
            className="min-h-[112px] w-full resize-none bg-transparent font-display text-[16px] font-semibold leading-relaxed text-[#111827] outline-none placeholder:text-[#94a3b8]"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => ctx.push("contacts")}
              className="pressable inline-flex items-center gap-2 rounded-full border border-[#c4b5fd]/80 bg-[#ede9fe]/90 px-3 py-2 text-[12px] font-bold text-[#131b34] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#7c5cff]"
            >
              <IconUserSmall />
              Choose contact
            </button>
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={listening ? "Stop dictation" : "Voice dictation"}
              aria-pressed={listening}
              className={[
                "pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none",
                listening ? "kumo-mic-pulse" : "",
              ].join(" ")}
              style={{
                background: listening ? "#C7B5FF" : "#dbefff",
                boxShadow: listening
                  ? "0 0 0 0 rgba(199,181,255,0.5)"
                  : "0 4px 14px rgba(59,130,246,0.18)",
              }}
            >
              {listening ? <StopIcon /> : <MicIcon />}
            </button>
          </div>
        </div>
      </div>

      <PrivacyBelowCard ctx={ctx} />

      {listening ? (
        <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#7c5cff]">
          Listening…
        </p>
      ) : null}
    </div>
  )
}

/** Large Privacy control under the card — matches header toggle. */
function PrivacyBelowCard({ ctx }: { ctx: NavCtx }) {
  if (ctx.intentPrivate) {
    return (
      <button
        type="button"
        onClick={() => ctx.setIntentPrivate(false)}
        aria-pressed
        className="pressable mt-5 flex w-full flex-col items-start gap-1 rounded-[20px] border-[2.5px] border-[#7c5cff] bg-gradient-to-br from-[#faf5ff] via-[#f5f3ff] to-[#ede9fe] px-4 py-4 text-left shadow-[0_14px_36px_-10px_rgba(124,92,255,0.55)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#7c5cff]"
      >
        <span className="flex w-full items-center gap-2.5">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ddd6fe] shadow-[inset_0_0_0_1.5px_rgba(124,92,255,0.35)]"
            aria-hidden
          >
            <IconLockShut />
          </span>
          <span className="min-w-0 flex-1 font-display text-[17px] font-black tracking-[-0.02em] text-[#131b34]">
            Privacy on
          </span>
          <span className="shrink-0 text-[12px] font-extrabold text-[#7c5cff]" aria-hidden>
            ✓
          </span>
        </span>
        <span className="pl-[3.25rem] text-[13px] font-semibold leading-snug text-[#64748b]">
          Tap to use standard routing for this payment.
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => ctx.setIntentPrivate(true)}
      aria-pressed={false}
      className="pressable mt-5 flex w-full flex-col items-start gap-1 rounded-[20px] border-[2.5px] border-[#c4b5fd] bg-white px-4 py-4 text-left shadow-[0_14px_40px_-12px_rgba(124,92,255,0.42)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#7c5cff]"
    >
      <span className="flex w-full items-center gap-2.5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ede9fe]"
          aria-hidden
        >
          <IconLockOpen />
        </span>
        <span className="min-w-0 flex-1 font-display text-[17px] font-black tracking-[-0.02em] text-[#131b34]">
          Privacy off
        </span>
      </span>
      <span className="pl-[3.25rem] text-[13px] font-semibold leading-snug text-[#64748b]">
        Tap to shield metadata for this payment — incognito-style routing.
      </span>
    </button>
  )
}

function IconLockShut() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={5} y={11} width={14} height={10} rx={2} fill="#5b21b6" fillOpacity={0.15} stroke="#5b21b6" strokeWidth={2} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#5b21b6" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function IconLockOpen() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={5} y={11} width={14} height={10} rx={2} stroke="#7c5cff" strokeWidth={2} />
      <path d="M8 11V7a4 4 0 0 1 7.7-1.2" stroke="#7c5cff" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function IconUserSmall() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="#131b34"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="#0f172a" strokeWidth={2} />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"
        stroke="#0f172a"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" fill="#0f172a" />
    </svg>
  )
}
