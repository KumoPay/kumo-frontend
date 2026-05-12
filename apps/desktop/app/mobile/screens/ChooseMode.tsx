"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"

import { KumoMascot } from "../../../components/kumo-mascot"
import type { NavCtx, ScreenRenderer } from "./types"

export const ChooseMode: ScreenRenderer = (ctx) => ({
  body: <ChooseModeBody />,
  cta: <ChooseModeCta ctx={ctx} />,
})

function ChooseModeBody() {
  const [mode, setMode] = useState<"online" | "offline">("online")

  return (
    <div className="mx-auto w-full max-w-[320px] pb-2">
      <h1 className="font-display text-[26px] font-black leading-tight tracking-[-0.03em] text-[#141b2f]">
        Choose mode
      </h1>
      <p className="mt-2 text-[14px] font-medium leading-snug text-[#6b7380]">
        Select how you want this payment to behave.
      </p>

      <div
        role="tablist"
        aria-label="Payment mode"
        className="mt-6 flex rounded-[14px] bg-[#eef0f4] p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]"
      >
        <ModeTab
          selected={mode === "online"}
          onClick={() => setMode("online")}
          id="mode-online"
          controls="panel-online"
          label="Online"
          icon={<IconWifi />}
          iconAccent="cyan"
        />
        <ModeTab
          selected={mode === "offline"}
          onClick={() => setMode("offline")}
          id="mode-offline"
          controls="panel-offline"
          label="Offline"
          icon={<IconWifiOff />}
          iconAccent="purple"
        />
      </div>

      <div className="mt-8">
        {mode === "online" ? (
          <div id="panel-online" role="tabpanel" aria-labelledby="mode-online">
            <div className="flex flex-col items-center">
              <div className="relative flex justify-center py-2">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_55%,rgba(199,181,255,0.22)_0%,transparent_65%)]"
                  aria-hidden
                />
                <KumoMascot size={176} expression="cheerful" waves />
              </div>
              <h2 className="mt-2 font-display text-[18px] font-black tracking-[-0.02em] text-[#141b2f]">
                Online mode
              </h2>
              <p className="mt-2 text-center text-[14px] font-medium leading-relaxed text-[#6b7380]">
                Broadcast and settle right away while you’re connected. Best for instant payments.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <span className="size-[7px] shrink-0 rounded-full bg-[#10b981]" aria-hidden />
                <span className="text-[12px] font-semibold leading-none text-[#6b7380]">
                  Connected
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div id="panel-offline" role="tabpanel" aria-labelledby="mode-offline">
            <div className="flex flex-col items-center">
              <div className="relative flex justify-center py-2">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_55%,rgba(199,181,255,0.22)_0%,transparent_65%)]"
                  aria-hidden
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-[-8%] top-[52%] z-[1] -translate-y-1/2 opacity-[0.45]"
                >
                  <svg width={52} height={88} viewBox="0 0 58 96" fill="none" className="text-[#c4b5fd]">
                    <path
                      d="M6 18C18 38 26 54 31 71"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.85}
                      strokeDasharray="4 62"
                    />
                    <path
                      d="M2 42C13 53 21 61 31 71"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      opacity={0.75}
                      strokeDasharray="3 50"
                    />
                  </svg>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-[-8%] top-[52%] z-[1] -translate-y-1/2 scale-x-[-1] opacity-[0.45]"
                >
                  <svg width={52} height={88} viewBox="0 0 58 96" fill="none" className="text-[#c4b5fd]">
                    <path
                      d="M6 18C18 38 26 54 31 71"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.85}
                      strokeDasharray="4 62"
                    />
                    <path
                      d="M2 42C13 53 21 61 31 71"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      opacity={0.75}
                      strokeDasharray="3 50"
                    />
                  </svg>
                </div>
                <Image
                  src="/kumo-offline-mascot.png"
                  alt=""
                  width={400}
                  height={400}
                  priority
                  draggable={false}
                  className="relative z-[2] h-[176px] w-auto max-w-[min(260px,78vw)] object-contain object-bottom drop-shadow-[0_12px_36px_rgba(124,92,255,0.18)]"
                />
              </div>
              <h2 className="mt-2 font-display text-[18px] font-black tracking-[-0.02em] text-[#141b2f]">
                Offline mode
              </h2>
              <p className="mt-2 text-center text-[14px] font-medium leading-relaxed text-[#6b7380]">
                Sign your payment now and broadcast when you’re back online. Perfect when the signal drops.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <span className="size-[7px] shrink-0 rounded-full bg-[#94a3b8]" aria-hidden />
                <span className="text-[12px] font-semibold leading-none text-[#6b7380]">
                  Not connected
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {mode === "online" ? "Online mode selected." : "Offline mode selected."}
      </p>
    </div>
  )
}

function ChooseModeCta({ ctx }: { ctx: NavCtx }) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <button
        type="button"
        onClick={() => ctx.push("intent")}
        aria-label="New payment"
        className="pressable mx-auto flex w-full items-center justify-center gap-2 rounded-[18px] py-[17px] font-display text-[16px] font-bold text-white outline-none"
        style={{
          background: "#7c5cff",
          border: "none",
          boxShadow: "0 12px 28px -6px rgba(124,92,255,0.5)",
        }}
      >
        New payment
        <IconArrowRight />
      </button>
    </div>
  )
}

function ModeTab({
  selected,
  onClick,
  id,
  controls,
  label,
  icon,
  iconAccent = "cyan",
}: {
  selected: boolean
  onClick: () => void
  id: string
  controls: string
  label: string
  icon: ReactNode
  iconAccent?: "cyan" | "purple"
}) {
  const iconColor = selected
    ? iconAccent === "purple"
      ? "text-[#9333ea]"
      : "text-[#0ea5e9]"
    : "text-[#64748b]"

  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      className={[
        "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[11px] font-display text-[14px] font-extrabold transition-[background,box-shadow,color] duration-200",
        selected
          ? "bg-white text-[#141b2f] shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
          : "bg-transparent text-[#64748b]",
      ].join(" ")}
    >
      <span className={iconColor}>{icon}</span>
      {label}
    </button>
  )
}

function IconWifi() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M5 12.55a11 11 0 0 1 14.08 0"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M8.53 16.11a6 6 0 0 1 6.95 0"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M12 20h.01"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconWifiOff() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M14.83 14.83 21 21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path
        d="M2 9a15 15 0 0 1 4.88-3m3.9-1.17A12 12 0 0 1 21.87 12M5 12.55a11 11 0 0 1 5.18-2.59"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M10.62 18.1a6 6 0 0 1 4.48 0m-7.05-.51a10 10 0 0 1 2.5-1.57"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="m2 2 20 20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 stroke-current">
      <path d="M5 12h14M13 6l6 6-6 6" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
