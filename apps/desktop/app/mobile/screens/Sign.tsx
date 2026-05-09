"use client"

import Image from "next/image"
import { Chip, Eyebrow, PrimaryCTA, Row, RowPill } from "./atoms"
import type { ScreenRenderer } from "./types"
import { mock } from "./mock"

export const Sign: ScreenRenderer = (ctx) => ({
  eyebrow: "03 — sign offline",
  body: (
    <div>
      <div className="flex items-end gap-3 mb-4">
        <Image
          src="/state-00.png"
          alt=""
          width={64}
          height={64}
          style={{ width: 64, height: 64, objectFit: "contain" }}
        />
        <div className="bg-white rounded-2xl px-3 py-2 mb-1 softshadow-sm">
          <div className="font-semibold text-[13px] text-navy">
            I read it! Sign to lock it in?
          </div>
        </div>
      </div>

      <Eyebrow>review</Eyebrow>

      <div className="mt-2 bg-white rounded-2xl p-4 border border-sky">
        <Row k="To" v={mock.intent.recipient} />
        <Row k="Amount" v={`$${mock.intent.amount_usdc} USDC`} big />
        <RowPill
          k="Privacy"
          pill={
            <span
              style={{
                background: mock.intent.private ? "#C7B5FF" : "#C4CCD8",
                color: "#0B1020",
                fontWeight: 800,
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              {mock.intent.private ? "🔒 Private mode" : "Public"}
            </span>
          }
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <Chip>💎 wallet signMessage</Chip>
        <Chip>📡 no rpc call</Chip>
        {mock.intent.private && <Chip lilac>🔒 confidential</Chip>}
      </div>

      <div
        className="mt-4 p-4 rounded-2xl border-[1.5px] border-sky"
        style={{ background: "rgba(127,232,255,0.12)" }}
      >
        <div className="font-bold text-[14px] text-navy">Sign with your wallet</div>
        <div className="text-[12px] text-navy/65 mt-1 leading-relaxed">
          Your wallet will pop up to sign the intent hash. No RPC required.
        </div>
      </div>
    </div>
  ),
  cta: (
    <PrimaryCTA onClick={() => ctx.push("queued")}>Sign with wallet</PrimaryCTA>
  ),
})
