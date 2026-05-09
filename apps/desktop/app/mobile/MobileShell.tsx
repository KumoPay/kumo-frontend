"use client"

import { useCallback, useMemo, useState } from "react"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import Image from "next/image"
import { BackButton } from "./screens/atoms"
import { Home } from "./screens/Home"
import { Contacts } from "./screens/Contacts"
import { History } from "./screens/History"
import { Receive } from "./screens/Receive"
import { Settings } from "./screens/Settings"
import { Connect } from "./screens/Connect"
import { Intent } from "./screens/Intent"
import { Sign } from "./screens/Sign"
import { Queued } from "./screens/Queued"
import { Settled } from "./screens/Settled"
import {
  PAY_FLOW,
  type NavCtx,
  type ScreenId,
  type ScreenRenderer,
  type WalletInfo,
} from "./screens/types"

const SCREENS: Record<ScreenId, ScreenRenderer> = {
  home: Home,
  contacts: Contacts,
  history: History,
  receive: Receive,
  settings: Settings,
  connect: Connect,
  intent: Intent,
  sign: Sign,
  queued: Queued,
  settled: Settled,
}

const slideVariants = {
  enter: (direction: 1 | -1) => ({
    x: direction === 1 ? "100%" : "-25%",
    opacity: direction === 1 ? 1 : 0.6,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 1 | -1) => ({
    x: direction === 1 ? "-25%" : "100%",
    opacity: direction === 1 ? 0.6 : 1,
  }),
}

const SWIPE_BACK_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 400

export function MobileShell() {
  const [stack, setStack] = useState<ScreenId[]>(["connect"])
  const [direction, setDirection] = useState<1 | -1>(1)
  const [airplane, setAirplane] = useState(false)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)

  const current = stack[stack.length - 1]
  const canGoBack = stack.length > 1

  const push = useCallback((id: ScreenId) => {
    setDirection(1)
    setStack((s) => [...s, id])
  }, [])

  const back = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s
      setDirection(-1)
      return s.slice(0, -1)
    })
  }, [])

  const resetHome = useCallback(() => {
    setDirection(-1)
    setStack(["home"])
  }, [])

  const connectWallet = useCallback((w: WalletInfo) => {
    setWallet(w)
    setDirection(1)
    setStack(["home"])
  }, [])

  const disconnectWallet = useCallback(() => {
    setWallet(null)
    setDirection(-1)
    setStack(["connect"])
  }, [])

  const ctx: NavCtx = useMemo(
    () => ({
      push,
      back,
      resetHome,
      airplane,
      setAirplane,
      wallet,
      connectWallet,
      disconnectWallet,
    }),
    [push, back, resetHome, airplane, wallet, connectWallet, disconnectWallet],
  )

  const slots = SCREENS[current](ctx)

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (!canGoBack) return
    const releasedRight =
      info.offset.x > SWIPE_BACK_THRESHOLD ||
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    if (releasedRight) back()
  }

  const inPayFlow = PAY_FLOW.includes(current)
  const payIdx = PAY_FLOW.indexOf(current)
  const isOnConnect = current === "connect"
  const showHeaderActions = wallet !== null && !isOnConnect

  return (
    <div
      className="relative flex flex-col"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-20 -right-16 w-64 h-64 rounded-full bg-lilac opacity-25 blur-3xl" />
        <div className="absolute bottom-32 left-0 w-72 h-72 rounded-full bg-cyan opacity-20 blur-3xl" />
      </div>

      {/* Top status bar */}
      <header className="relative z-20 flex-shrink-0 px-5 pt-3 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {canGoBack ? (
            <BackButton onClick={back} />
          ) : (
            <Image
              src="/state-00.png"
              alt=""
              width={32}
              height={32}
              style={{ width: 32, height: 32, objectFit: "contain" }}
            />
          )}
          <span className="font-display font-extrabold text-navy text-[18px] tracking-[-0.01em]">
            Kumo
          </span>
        </div>

        {showHeaderActions && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAirplane(!airplane)}
              className="pressable inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-extrabold text-[11px]"
              style={{
                background: airplane ? "#C7B5FF" : "#B7F1FF",
                color: "#0B1020",
              }}
            >
              {airplane ? "✈ Airplane" : `● ${wallet?.label ?? ""}`}
            </button>
            <button
              onClick={() => push("settings")}
              aria-label="Settings"
              className="pressable inline-flex items-center justify-center rounded-full bg-white"
              style={{
                width: 32,
                height: 32,
                boxShadow: "0 1px 2px rgba(11,16,32,0.06)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="#0B1020" strokeWidth="2" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  stroke="#0B1020"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* Progress dots — only in pay sub-flow */}
      {inPayFlow && (
        <div className="relative z-20 flex-shrink-0 px-5 mt-1 flex items-center gap-1.5">
          {PAY_FLOW.map((id, i) => {
            const active = i === payIdx
            const done = i < payIdx
            return (
              <span
                key={id}
                className={[
                  "flex-1 h-1.5 rounded-full transition-colors duration-300",
                  active ? "bg-navy" : done ? "bg-cyan" : "bg-sky/50",
                ].join(" ")}
                aria-label={id}
              />
            )
          })}
        </div>
      )}

      {slots.eyebrow && (
        <div className="relative z-20 flex-shrink-0 px-5 mt-2 text-[10px] font-bold tracking-[0.18em] uppercase text-navy/55">
          {slots.eyebrow}
        </div>
      )}

      {/* Scrollable body with stack-style transitions */}
      <main
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 38,
              mass: 0.9,
            }}
            drag={canGoBack ? "x" : false}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.45 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 overflow-y-auto px-5 pt-3 pb-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {slots.body}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky bottom CTA — only when the screen provides one */}
      {slots.cta && (
        <footer
          className="relative z-20 flex-shrink-0 px-5 pt-3 pb-5"
          style={{
            background: "rgba(250,252,255,0.92)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            borderTop: "0.5px solid rgba(183,241,255,1)",
          }}
        >
          {slots.cta}
        </footer>
      )}
    </div>
  )
}
