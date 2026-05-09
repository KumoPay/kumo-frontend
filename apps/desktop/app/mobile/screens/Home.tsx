"use client"

import Image from "next/image"
import { PrimaryCTA } from "./atoms"
import type { ScreenRenderer } from "./types"
import { mock } from "./mock"

const formatUsdc = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const Home: ScreenRenderer = (ctx) => ({
  body: (
    <div>
      {/* Greeting */}
      <div className="flex items-center justify-between gap-3 mt-1">
        <div>
          <div className="text-[12px] font-bold tracking-wide uppercase text-navy/55">
            Welcome back
          </div>
          <div className="font-display font-black text-navy text-[26px] tracking-[-0.02em] leading-tight">
            Hi, {ctx.wallet?.displayName ?? "friend"} ☁
          </div>
        </div>
        <div className="animate-breathe">
          <Image
            src="/state-00.png"
            alt=""
            width={56}
            height={56}
            priority
            style={{ width: 56, height: 56, objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Balance card */}
      <div
        className="mt-4 rounded-3xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #7FE8FF 0%, #B7F1FF 55%, #C7B5FF 130%)",
          boxShadow: "0 12px 30px rgba(127,232,255,0.35)",
        }}
      >
        <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-navy/65">
          USDC · devnet
        </div>
        <div className="font-display font-black text-navy text-[40px] tracking-[-0.02em] leading-none mt-2">
          ${formatUsdc(mock.balanceUsdc)}
        </div>
        <div className="text-[12px] font-semibold text-navy/65 mt-2">
          {ctx.wallet?.label ?? "—"} ·{" "}
          {ctx.wallet
            ? `${ctx.wallet.pubkey.slice(0, 5)}…${ctx.wallet.pubkey.slice(-4)}`
            : ""}
        </div>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <Tile label="Receive" icon={<IconReceive />} onClick={() => ctx.push("receive")} />
        <Tile label="Contacts" icon={<IconContacts />} onClick={() => ctx.push("contacts")} />
        <Tile label="History" icon={<IconHistory />} onClick={() => ctx.push("history")} />
      </div>

      {/* Recent activity */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-navy/50">
            recent activity
          </div>
          <button
            onClick={() => ctx.push("history")}
            className="text-[11px] font-extrabold text-navy underline-offset-2 hover:underline"
          >
            See all
          </button>
        </div>

        <div className="bg-white rounded-2xl softshadow-sm overflow-hidden">
          {mock.history.slice(0, 3).map((h, i) => (
            <div
              key={h.id}
              className={[
                "flex items-center gap-3 px-3.5 py-3",
                i < 2 ? "border-b border-dashed border-navy/8" : "",
              ].join(" ")}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[14px] text-navy"
                style={{ background: h.direction === "out" ? "#C7B5FF" : "#7FE8FF" }}
              >
                {h.direction === "out" ? "↑" : "↓"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-navy text-[14px] truncate">
                  {h.direction === "out" ? `To ${h.counterparty}` : `From ${h.counterparty}`}
                </div>
                <div className="text-[11px] text-navy/55 font-semibold">{h.when}</div>
              </div>
              <div className="text-right">
                <div
                  className={[
                    "font-extrabold text-[14px]",
                    h.direction === "out" ? "text-navy" : "text-navy",
                  ].join(" ")}
                >
                  {h.direction === "out" ? "−" : "+"}${formatUsdc(h.amount)}
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: h.status === "queued" ? "#7B6CC9" : "#0B1020", opacity: h.status === "queued" ? 1 : 0.55 }}
                >
                  {h.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-2" />
    </div>
  ),
  cta: <PrimaryCTA onClick={() => ctx.push("intent")}>Pay someone →</PrimaryCTA>,
})

function Tile({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="pressable bg-white rounded-2xl py-4 px-2 flex flex-col items-center gap-1.5 softshadow-sm"
    >
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(127,232,255,0.35)" }}
      >
        {icon}
      </span>
      <span className="font-display font-extrabold text-navy text-[12px]">{label}</span>
    </button>
  )
}

function IconReceive() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"
        stroke="#0B1020"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconContacts() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="#0B1020" strokeWidth="2" />
      <path
        d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
        stroke="#0B1020"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#0B1020" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="#0B1020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
