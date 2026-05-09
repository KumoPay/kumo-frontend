"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import Image from "next/image"
import { AppOpenSplash } from "./AppOpenSplash"
import {
  readStoredCluster,
  writeStoredCluster,
  type SolanaClusterId,
} from "./cluster-preference"
import { MobileTabBar, type MobileTabId } from "./MobileTabBar"
import { WalletNetworkMenu } from "./WalletNetworkMenu"
import { BackButton } from "./screens/atoms"
import { Home } from "./screens/Home"
import { Contacts } from "./screens/Contacts"
import { History } from "./screens/History"
import { Receive } from "./screens/Receive"
import { Settings } from "./screens/Settings"
import { Connect } from "./screens/Connect"
import { ChooseAlias } from "./screens/ChooseAlias"
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
import { sanitizeKumoLocalPart, KUMO_ALIAS_MIN_LEN } from "./alias-utils"
import {
  clearMobilePersistedState,
  readAliasOnboardingComplete,
  readStoredWallet,
  writeAliasOnboardingComplete,
  writeStoredWallet,
} from "./wallet-storage"

const SCREENS: Record<ScreenId, ScreenRenderer> = {
  home: Home,
  contacts: Contacts,
  history: History,
  receive: Receive,
  settings: Settings,
  connect: Connect,
  alias: ChooseAlias,
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
  const [bootstrapped, setBootstrapped] = useState(false)
  const [stack, setStack] = useState<ScreenId[]>(["connect"])
  const [direction, setDirection] = useState<1 | -1>(1)
  const [airplane, setAirplane] = useState(false)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [showAppSplash, setShowAppSplash] = useState(false)
  const [solanaCluster, setSolanaClusterState] = useState<SolanaClusterId>("devnet")

  useEffect(() => {
    setSolanaClusterState(readStoredCluster())
  }, [])

  const setSolanaCluster = useCallback((id: SolanaClusterId) => {
    writeStoredCluster(id)
    setSolanaClusterState(id)
  }, [])
  useEffect(() => {
    const w = readStoredWallet()
    if (w) {
      setWallet(w)
      if (!readAliasOnboardingComplete()) {
        setStack(["alias"])
      } else {
        setStack(["home"])
        setShowAppSplash(true)
      }
    }
    setBootstrapped(true)
  }, [])

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

  const goToNewPayment = useCallback(() => {
    setDirection(1)
    setStack(["home", "intent"])
  }, [])

  const completeAliasOnboarding = useCallback((localHandle: string) => {
    const slug = sanitizeKumoLocalPart(localHandle)
    if (slug.length < KUMO_ALIAS_MIN_LEN) return

    setWallet((prev) => {
      if (!prev) return prev
      const next = { ...prev, displayName: slug }
      writeStoredWallet(next)
      return next
    })
    writeAliasOnboardingComplete()
    setDirection(1)
    setStack(["home"])
    setShowAppSplash(true)
  }, [])

  const connectWallet = useCallback((w: WalletInfo) => {
    writeStoredWallet(w)
    setWallet(w)
    setDirection(1)
    if (!readAliasOnboardingComplete()) {
      setStack(["alias"])
      return
    }
    setStack(["home"])
    setShowAppSplash(true)
  }, [])

  const disconnectWallet = useCallback(() => {
    clearMobilePersistedState()
    setWallet(null)
    setDirection(-1)
    setStack(["connect"])
    setShowAppSplash(false)
  }, [])

  const ctx: NavCtx = useMemo(
    () => ({
      push,
      back,
      resetHome,
      goToNewPayment,
      airplane,
      setAirplane,
      wallet,
      connectWallet,
      disconnectWallet,
      completeAliasOnboarding,
      solanaCluster,
      setSolanaCluster,
    }),
    [
      push,
      back,
      resetHome,
      goToNewPayment,
      airplane,
      wallet,
      connectWallet,
      disconnectWallet,
      completeAliasOnboarding,
      solanaCluster,
      setSolanaCluster,
    ],
  )

  const dismissAppSplash = useCallback(() => {
    setShowAppSplash(false)
  }, [])

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
  const isHomeDashboard = current === "home" && !canGoBack
  /** Settings: back + centered KUMO (no wallet menu / step bar). */
  const showSettingsHeader =
    wallet && current === "settings" && canGoBack
  /** Same header as Home (logo + wallet, no back) for main tabs under home. */
  const showHomeBrandHeader =
    wallet &&
    ((current === "home" && !canGoBack) ||
      (stack.length === 2 &&
        stack[0] === "home" &&
        ["contacts", "history", "receive"].includes(current)))
  /** Favicon + KUMO + wallet + airplane (Sign / queued). */
  const useBrandedPayHeader =
    wallet && (current === "sign" || current === "queued")
  const isAliasOnboarding = current === "alias"
  const isOnConnect = current === "connect"
  const isMinimalBackdrop = isOnConnect || isAliasOnboarding
  const showHeaderActions =
    wallet !== null && !isOnConnect && !isAliasOnboarding && !isHomeDashboard

  const showMainTabBar = Boolean(
    wallet && !isOnConnect && !isAliasOnboarding && !inPayFlow,
  )

  const activeTab: MobileTabId = useMemo(() => {
    if (current === "contacts") return "contactos"
    if (current === "settings") return "ajustes"
    if (current === "history") return "historial"
    if (PAY_FLOW.includes(current)) return "inicio"
    return "inicio"
  }, [current])

  const onTabInicio = useCallback(() => {
    resetHome()
  }, [resetHome])

  const onTabHistorial = useCallback(() => {
    if (current === "history") return
    setDirection(1)
    setStack(["home", "history"])
  }, [current])

  const onTabContactos = useCallback(() => {
    if (current === "contacts") return
    setDirection(1)
    setStack(["home", "contacts"])
  }, [current])

  const onTabAjustes = useCallback(() => {
    if (current === "settings") return
    setDirection(1)
    setStack(["home", "settings"])
  }, [current])

  if (!bootstrapped) {
    return (
      <div
        className="min-h-[100dvh] bg-[#ede9fe]"
        aria-busy="true"
        aria-label="Loading"
      />
    )
  }

  const shellTintBg =
    current === "home" ||
    (showMainTabBar &&
      ["home", "history", "receive", "contacts", "settings"].includes(current))

  return (
    <div
      className={["relative flex flex-col", shellTintBg ? "bg-[#f9fafb]" : ""].join(" ")}
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute top-20 -right-16 h-64 w-64 rounded-full bg-lilac blur-3xl ${isHomeDashboard ? "opacity-0" : isMinimalBackdrop ? "opacity-10" : "opacity-25"}`}
        />
        <div
          className={`absolute bottom-32 left-0 h-72 w-72 rounded-full bg-cyan blur-3xl ${isHomeDashboard ? "opacity-0" : isMinimalBackdrop ? "opacity-[0.08]" : "opacity-20"}`}
        />
      </div>

      <header className="relative z-20 flex flex-shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-3">
        {showSettingsHeader ? (
          <div className="relative flex min-h-9 w-full min-w-0 items-center justify-center">
            <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
              <BackButton onClick={back} />
            </div>
            <div className="flex items-center justify-center gap-0.5">
              <Image
                src="/favicon-32.png"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06]"
                priority
              />
              <Image
                src="/logo-primary-02.png"
                alt="KUMO"
                width={480}
                height={120}
                className="h-[28px] w-auto max-w-[min(156px,48vw)] shrink-0 object-contain object-center"
                priority
              />
            </div>
          </div>
        ) : showHomeBrandHeader ? (
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-0.5">
              <Image
                src="/favicon-32.png"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06]"
                priority
              />
              <Image
                src="/logo-primary-02.png"
                alt="KUMO"
                width={480}
                height={120}
                className="h-[28px] w-auto max-w-[min(156px,48vw)] shrink-0 object-contain object-left"
                priority
              />
            </div>
            <WalletNetworkMenu
              wallet={wallet}
              cluster={solanaCluster}
              onClusterChange={setSolanaCluster}
            />
          </div>
        ) : current === "settled" && wallet ? (
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-0.5">
              <Image
                src="/favicon-32.png"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06]"
                priority
              />
              <Image
                src="/logo-primary-02.png"
                alt="KUMO"
                width={480}
                height={120}
                className="h-[28px] w-auto max-w-[min(156px,48vw)] shrink-0 object-contain object-left"
                priority
              />
            </div>
            <WalletNetworkMenu
              wallet={wallet}
              cluster={solanaCluster}
              onClusterChange={setSolanaCluster}
            />
          </div>
        ) : useBrandedPayHeader ? (
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-0.5">
              <Image
                src="/favicon-32.png"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06]"
                priority
              />
              <Image
                src="/logo-primary-02.png"
                alt="KUMO"
                width={480}
                height={120}
                className="h-[28px] w-auto max-w-[min(156px,48vw)] shrink-0 object-contain object-left"
                priority
              />
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WalletNetworkMenu
                wallet={wallet}
                cluster={solanaCluster}
                onClusterChange={setSolanaCluster}
              />
              <button
                type="button"
                onClick={() => setAirplane(!airplane)}
                aria-pressed={airplane}
                aria-label={
                  airplane ? "Turn off airplane mode" : "Turn on airplane mode"
                }
                className={[
                  "pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  airplane
                    ? "bg-[#C7B5FF] text-[#0B1020]"
                    : "bg-white text-[#0B1020]",
                ].join(" ")}
                style={{
                  boxShadow: "0 1px 2px rgba(11,16,32,0.06)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </button>
            </div>
          </div>
        ) : showHeaderActions && wallet ? (
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {canGoBack ? <BackButton onClick={back} /> : null}
              <span
                className={[
                  "min-w-0 truncate font-display font-extrabold tracking-[-0.02em] text-navy",
                  isOnConnect ? "text-[15px]" : "text-[18px]",
                ].join(" ")}
              >
                {isOnConnect ? "KUMO" : "Kumo"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WalletNetworkMenu
                wallet={wallet}
                cluster={solanaCluster}
                onClusterChange={setSolanaCluster}
              />
              <button
                type="button"
                onClick={() => setAirplane(!airplane)}
                aria-pressed={airplane}
                aria-label={
                  airplane ? "Turn off airplane mode" : "Turn on airplane mode"
                }
                className={[
                  "pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  airplane
                    ? "bg-[#C7B5FF] text-[#0B1020]"
                    : "bg-white text-[#0B1020]",
                ].join(" ")}
                style={{
                  boxShadow: "0 1px 2px rgba(11,16,32,0.06)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            {canGoBack ? <BackButton onClick={back} /> : null}
            <span
              className={[
                "font-display font-extrabold tracking-[-0.02em] text-navy",
                isOnConnect ? "text-[15px]" : "text-[18px]",
              ].join(" ")}
            >
              {isOnConnect ? "KUMO" : "Kumo"}
            </span>
          </div>
        )}
      </header>

      {/* Progress — payment flow only (not main tabs like Contacts) */}
      {(current === "intent" ||
        current === "sign" ||
        current === "queued" ||
        current === "settled") && (
        <div className="relative z-20 mt-1 flex flex-shrink-0 items-center gap-1.5 px-5">
          {PAY_FLOW.map((id, i) => {
            const active = i === payIdx
            const done = i < payIdx
            return (
              <span
                key={id}
                className={[
                  "flex-1 rounded-full transition-colors duration-300",
                  "h-1.5",
                  active
                    ? "bg-[#a78bfa]"
                    : done
                      ? "bg-[#7dd3fc]"
                      : "bg-[#e2e8f0]",
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
            className={[
              "absolute inset-0 overflow-y-auto px-5 pt-3",
              current === "queued" || current === "settled" ? "pb-4" : "pb-6",
              shellTintBg ? "bg-[#f9fafb]" : "",
            ].join(" ")}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {slots.body}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky bottom CTA — only when the screen provides one */}
      {slots.cta ? (
        <footer
          className={[
            "relative z-20 flex-shrink-0 px-5",
            current === "queued" || current === "settled" ? "pb-3 pt-2" : "pb-5 pt-3",
          ].join(" ")}
          style={
            shellTintBg
              ? {
                  background: "#f9fafb",
                  borderTop: "1px solid #eef0f3",
                }
              : {
                  background: "rgba(250,252,255,0.92)",
                  backdropFilter: "blur(8px) saturate(140%)",
                  WebkitBackdropFilter: "blur(8px) saturate(140%)",
                  borderTop: "0.5px solid rgba(183,241,255,1)",
                }
          }
        >
          {slots.cta}
        </footer>
      ) : null}
      {showMainTabBar ? (
        <MobileTabBar
          activeTab={activeTab}
          onInicio={onTabInicio}
          onHistorial={onTabHistorial}
          onContactos={onTabContactos}
          onAjustes={onTabAjustes}
        />
      ) : null}
      {showAppSplash ? <AppOpenSplash onDismiss={dismissAppSplash} /> : null}
    </div>
  )
}
