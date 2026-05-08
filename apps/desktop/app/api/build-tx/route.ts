// apps/desktop/app/api/build-tx/route.ts
//
// Mock-mode: returns a synthetic signed-transaction envelope with the
// same shape production used to return:
//   { ok, signed_tx_b58, intent, intent_hash, nonce, signed_at }
//
// signed_tx_b58 is a random 88-char base58-ish string. intent_hash is
// computed via @kumo/shared.hashIntent (works without any backend).

import { NextRequest, NextResponse } from "next/server"
import { PaymentIntentSchema, hashIntent } from "@kumo/shared"
import { buildOfflineTx, type NonceCacheEntry } from "@/lib/durable-nonce"
import { loadDemoWallet } from "@/lib/wallet"

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
  const intent = intentParse.data

  const cached = body.nonce as NonceCacheEntry | undefined
  if (!cached?.nonce || !cached.noncePubkey || !cached.authorityPubkey) {
    return NextResponse.json(
      {
        ok: false,
        error: "No cached durable nonce. Run the online setup flow first to fund a nonce account.",
      },
      { status: 412 },
    )
  }

  if (typeof body.recipientPubkey !== "string" || !body.recipientPubkey) {
    return NextResponse.json(
      { ok: false, error: "Missing recipientPubkey (resolved client-side from contact map)" },
      { status: 400 },
    )
  }

  // The real implementation builds a durable-nonce tx, signs it, and
  // serializes the bytes. We just emit a synthetic envelope matching
  // the production response shape.
  buildOfflineTx({ payerSigner: loadDemoWallet(), cached, instructions: [] })
  const signed_tx_b58 = fakeBase58(88)
  const intent_hash = await hashIntent(intent)

  return NextResponse.json({
    ok: true,
    signed_tx_b58,
    intent,
    intent_hash,
    nonce: cached,
    signed_at: Date.now(),
  })
}
