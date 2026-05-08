// apps/desktop/app/api/broadcast/route.ts
//
// Mock-mode: returns a synthetic settlement envelope with the same
// shape production used to return:
//   { ok: true, signature, magicblock_session_id, send_to }
//
// The 1.5–3s delay preserves the demo's drama beat between BROADCAST
// and the receipt. Honors `mblock-5xx` to return 502.

import { NextRequest, NextResponse } from "next/server"
import { PaymentIntentSchema } from "@kumo/shared"
import { mockDelay, currentScenario } from "@/lib/mock-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function fakeBase58(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)]
  }
  return out
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false, error: "no body" }, { status: 400 })

  const intentParse = PaymentIntentSchema.safeParse(body.intent)
  if (!intentParse.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid intent: " + intentParse.error.message },
      { status: 400 },
    )
  }

  if (typeof body.recipientPubkey !== "string" || !body.recipientPubkey) {
    return NextResponse.json({ ok: false, error: "Missing recipientPubkey" }, { status: 400 })
  }

  await mockDelay({ minMs: 1500, maxMs: 3000 })

  if (currentScenario() === "mblock-5xx") {
    return NextResponse.json(
      { ok: false, error: "Broadcast failed: upstream MagicBlock returned 502" },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    signature: fakeBase58(88),
    magicblock_session_id: "mock-validator",
    send_to: "base",
  })
}
