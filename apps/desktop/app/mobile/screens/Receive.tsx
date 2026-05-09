"use client"

import { Eyebrow, PrimaryCTA, Row } from "./atoms"
import type { ScreenRenderer } from "./types"
import { mock } from "./mock"

export const Receive: ScreenRenderer = (ctx) => ({
  body: (
    <div>
      <div className="font-display font-black text-navy text-[28px] tracking-[-0.02em] leading-none mt-1">
        Receive
      </div>
      <div className="text-[13px] font-semibold text-navy/55 mt-1.5">
        Show this to the sender, or share your handle.
      </div>

      {/* QR card */}
      <div className="mt-5 bg-white rounded-3xl p-5 softshadow flex flex-col items-center">
        <div
          className="rounded-2xl p-4"
          style={{ background: "#FAFCFF" }}
        >
          <MockQR />
        </div>
        <div className="font-display font-black text-navy text-[18px] mt-4 tracking-[-0.01em]">
          {ctx.wallet?.displayName ?? mock.walletDisplayName}
        </div>
        <div className="font-mono text-[11px] text-navy/55 mt-1 break-all text-center max-w-[260px]">
          {ctx.wallet?.pubkey ?? mock.walletPubkey}
        </div>
      </div>

      <div className="mt-4">
        <Eyebrow>details</Eyebrow>
        <div className="mt-2 bg-white rounded-2xl p-4 border border-sky/60">
          <Row k="Network" v="Solana devnet" />
          <Row k="Token" v="USDC" />
          <Row k="Wallet" v={ctx.wallet?.label ?? mock.walletLabel} />
        </div>
      </div>

      <div className="text-[11px] text-navy/55 text-center mt-4 font-semibold">
        Anyone with this address can send you USDC on devnet.
      </div>
    </div>
  ),
  cta: (
    <PrimaryCTA
      onClick={() =>
        navigator.clipboard?.writeText(ctx.wallet?.pubkey ?? mock.walletPubkey)
      }
    >
      Copy address
    </PrimaryCTA>
  ),
})

function MockQR() {
  // Deterministic 21x21 grid — looks QR-ish without encoding anything real.
  const SIZE = 21
  const cells: boolean[][] = []
  for (let y = 0; y < SIZE; y++) {
    const row: boolean[] = []
    for (let x = 0; x < SIZE; x++) {
      // Finder-pattern corners
      const inFinder =
        (x < 7 && y < 7) ||
        (x >= SIZE - 7 && y < 7) ||
        (x < 7 && y >= SIZE - 7)
      if (inFinder) {
        const fx = x < 7 ? x : SIZE - 1 - x
        const fy = y < 7 ? y : SIZE - 1 - y
        const onRing = fx === 0 || fx === 6 || fy === 0 || fy === 6
        const inCore = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
        row.push(onRing || inCore)
        continue
      }
      // Pseudo-random module pattern
      const v = Math.sin((x * 73 + y * 131 + 17) * 0.5) * 10000
      row.push((v - Math.floor(v)) > 0.55)
    }
    cells.push(row)
  }

  const cellSize = 8
  return (
    <svg width={SIZE * cellSize} height={SIZE * cellSize} viewBox={`0 0 ${SIZE * cellSize} ${SIZE * cellSize}`}>
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0B1020"
              rx={1}
            />
          ) : null,
        ),
      )}
    </svg>
  )
}
