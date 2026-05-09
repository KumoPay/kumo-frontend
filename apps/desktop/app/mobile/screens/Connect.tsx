"use client"

import Image from "next/image"
import type { ScreenRenderer, WalletInfo } from "./types"

export const WALLETS: WalletInfo[] = [
  {
    id: "phantom",
    label: "Phantom",
    brand: "#AB9FF2",
    initial: "P",
    pubkey: "561BgNK9Rt8oNdvv51FEFp9JX9iW8ncWson5BryRvA8z",
    displayName: "alice.kumo",
  },
  {
    id: "solflare",
    label: "Solflare",
    brand: "#FC8E2D",
    initial: "S",
    pubkey: "8Hx2T9Wq5cR3vN1mF7yK4eJ6tB2pL0sA9gH8iC3xZ4kV",
    displayName: "alice.sol",
  },
  {
    id: "backpack",
    label: "Backpack",
    brand: "#E33E7F",
    initial: "B",
    pubkey: "3KqV7tM2nP4rW8yL6cF1eR9jD5xA0bH7gT2iZ8kN6sQ4",
    displayName: "alice",
  },
  {
    id: "glow",
    label: "Glow",
    brand: "#FFC83D",
    initial: "G",
    pubkey: "7BzN4xT9rK2pL6mF8eC1yA5jW3vH0iR4dQ7tS2gM9hP6",
    displayName: "alice.glow",
  },
]

export const Connect: ScreenRenderer = (ctx) => ({
  body: (
    <div>
      <div className="text-center pt-2">
        <div className="animate-breathe inline-block">
          <Image
            src="/state-00.png"
            alt="Kumo"
            width={140}
            height={140}
            priority
            style={{ width: 140, height: 140, objectFit: "contain" }}
          />
        </div>

        <div className="font-display font-black text-navy text-[34px] tracking-[-0.02em] mt-1 leading-none">
          Welcome to Kumo
        </div>
        <div className="text-[13px] font-semibold text-navy/55 mt-2 px-3">
          Pay when the signal disappears.
        </div>
      </div>

      <div className="mt-7">
        <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-navy/50 mb-2">
          choose a wallet
        </div>

        <div className="bg-white rounded-2xl softshadow-sm overflow-hidden">
          {WALLETS.map((w, i) => (
            <button
              key={w.id}
              onClick={() => ctx.connectWallet(w)}
              className={[
                "pressable w-full flex items-center gap-3 px-4 py-3.5 text-left",
                i < WALLETS.length - 1 ? "border-b border-dashed border-navy/8" : "",
              ].join(" ")}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-white text-[16px]"
                style={{ background: w.brand }}
              >
                {w.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-navy text-[15px]">{w.label}</div>
                <div className="text-[11px] text-navy/55 font-semibold">
                  Detected · Tap to connect
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 6l6 6-6 6"
                  stroke="#0B1020"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.4"
                />
              </svg>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-navy/55 mt-3 font-semibold text-center px-4 leading-relaxed">
          Devnet only. No real funds will move.
        </div>

        <div className="text-[11px] text-navy/45 mt-4 font-semibold text-center">
          Need devnet USDC?{" "}
          <span className="underline font-bold">faucet.circle.com</span>
        </div>
      </div>
    </div>
  ),
  // No bottom CTA — the wallet rows themselves are the primary action.
})
