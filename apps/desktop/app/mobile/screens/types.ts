import type { ReactNode } from "react"

export type ScreenId =
  | "home"
  | "contacts"
  | "history"
  | "receive"
  | "settings"
  | "connect"
  | "alias"
  | "intent"
  | "sign"
  | "queued"
  | "settled"

export const PAY_FLOW: ScreenId[] = ["intent", "sign", "queued", "settled"]

export type WalletInfo = {
  id: string
  label: string
  brand: string
  initial: string
  pubkey: string
  displayName: string
}

export type NavCtx = {
  push: (id: ScreenId) => void
  back: () => void
  /** Reset the stack back to home (used by Settled when payment finishes). */
  resetHome: () => void
  airplane: boolean
  setAirplane: (v: boolean) => void
  /** Currently connected wallet, or null on the connect screen. */
  wallet: WalletInfo | null
  connectWallet: (w: WalletInfo) => void
  disconnectWallet: () => void
  /** Finishes one-time onboarding: saves plain alias and continues to Home + splash. */
  completeAliasOnboarding: (localHandle: string) => void
}

export type ScreenSlots = {
  /** Body content rendered in the scrollable area between header and bottom CTA. */
  body: ReactNode
  /** Sticky bottom-bar content. Omit to render no bottom bar (e.g. wallet picker). */
  cta?: ReactNode
  /** Optional eyebrow shown in the top status bar. */
  eyebrow?: string
}

export type ScreenRenderer = (ctx: NavCtx) => ScreenSlots
