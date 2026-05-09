"use client"

import Image from "next/image"
import { Eyebrow, PrimaryCTA, Row, SecondaryCTA } from "./atoms"
import type { ScreenRenderer } from "./types"
import { mock } from "./mock"

export const Settled: ScreenRenderer = (ctx) => ({
  eyebrow: "05 — delivered",
  body: (
    <div>
      <div className="flex justify-center mt-1">
        <Image
          src="/state-05.png"
          alt="Kumo celebrating"
          width={170}
          height={170}
          priority
          style={{ width: 170, height: 170, objectFit: "contain" }}
        />
      </div>
      <div className="font-display font-black text-navy text-[26px] text-center mt-2 tracking-[-0.02em]">
        Delivered! ✨
      </div>
      <div className="text-[12px] text-navy/60 text-center mt-1 leading-relaxed px-2">
        On-chain on devnet via MagicBlock.
      </div>

      <div className="mt-5">
        <Eyebrow>arrived</Eyebrow>
        <div className="mt-2 bg-white rounded-2xl p-4 border border-cyan">
          <span
            className="inline-block px-2.5 py-1 rounded-full font-extrabold text-[10px] text-navy mb-3"
            style={{ background: "#7FE8FF" }}
          >
            ✨ Delivered
          </span>
          <Row k="Recipient" v={mock.intent.recipient} />
          <Row k="Amount" v={`$${mock.intent.amount_usdc} USDC`} />
          <Row
            k="Signature"
            v={`${mock.settlement.signature.slice(0, 6)}…${mock.settlement.signature.slice(-4)}`}
          />
          <Row
            k="Validator"
            v={`${mock.settlement.sessionId.slice(0, 8)}…`}
          />
          <span className="inline-block mt-3 font-display font-extrabold text-navy text-[13px] border-b-[1.5px] border-cyan pb-0.5">
            View on Solscan ↗
          </span>
        </div>
      </div>
    </div>
  ),
  cta: (
    <div className="flex flex-col gap-2">
      <PrimaryCTA onClick={ctx.resetHome}>Send another payment 💖</PrimaryCTA>
      <SecondaryCTA onClick={ctx.resetHome}>Done</SecondaryCTA>
    </div>
  ),
})
