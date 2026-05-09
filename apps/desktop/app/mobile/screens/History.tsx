"use client"

import { SecondaryCTA } from "./atoms"
import type { ScreenRenderer } from "./types"
import { mock } from "./mock"

const formatUsdc = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const History: ScreenRenderer = (ctx) => ({
  body: (
    <div>
      <div className="font-display font-black text-navy text-[28px] tracking-[-0.02em] leading-none mt-1">
        History
      </div>
      <div className="text-[13px] font-semibold text-navy/55 mt-1.5">
        Every Kumo you&apos;ve sent and received.
      </div>

      <div className="mt-4 bg-white rounded-2xl softshadow-sm overflow-hidden">
        {mock.history.map((h, i) => (
          <div
            key={h.id}
            className={[
              "flex items-center gap-3 px-4 py-3.5",
              i < mock.history.length - 1 ? "border-b border-dashed border-navy/8" : "",
            ].join(" ")}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[15px] text-navy"
              style={{ background: h.direction === "out" ? "#C7B5FF" : "#7FE8FF" }}
            >
              {h.direction === "out" ? "↑" : "↓"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-navy text-[14px] truncate">
                {h.direction === "out" ? `Sent to ${h.counterparty}` : `From ${h.counterparty}`}
              </div>
              <div className="text-[11px] text-navy/55 font-semibold">{h.when}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-navy text-[15px]">
                {h.direction === "out" ? "−" : "+"}${formatUsdc(h.amount)}
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-wide mt-0.5"
                style={{
                  color: h.status === "queued" ? "#7B6CC9" : "#0B1020",
                  opacity: h.status === "queued" ? 1 : 0.55,
                }}
              >
                {h.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-navy/55 text-center mt-4 font-semibold">
        Mocked — these never touch a real chain.
      </div>
    </div>
  ),
  cta: <SecondaryCTA onClick={ctx.back}>Back to home</SecondaryCTA>,
})
