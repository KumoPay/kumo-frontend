// Mock MagicBlock Private Payments client.
//
// Same exports as the production module — getPrivateBalance + privateTransfer
// + BuiltTransaction — so API routes can call them unchanged. Every result
// is synthetic. Scenario toggles (mblock-5xx, mblock-rate-limit,
// mblock-validation-error) surface the same error shapes as the real API.

import { z } from "zod"
import { mockDelay, currentScenario } from "./mock-config"

const BuildTxSchema = z.object({
  kind: z.string(),
  version: z.enum(["legacy", "v0"]),
  transactionBase64: z.string(),
  sendTo: z.enum(["base", "ephemeral"]),
  recentBlockhash: z.string(),
  lastValidBlockHeight: z.number(),
  instructionCount: z.number(),
  requiredSigners: z.array(z.string()),
  validator: z.string().optional(),
})

export type BuiltTransaction = z.infer<typeof BuildTxSchema>

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
function fakeBase58(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)]
  }
  return out
}

function fakeBase64(byteLength: number): string {
  const buf = Buffer.alloc(byteLength)
  for (let i = 0; i < byteLength; i++) buf[i] = Math.floor(Math.random() * 256)
  return buf.toString("base64")
}

function honorScenarioForMblock(): void {
  const scenario = currentScenario()
  if (scenario === "mblock-5xx") {
    throw new Error("transfer returned unexpected payload (HTTP 502): {\"error\":\"upstream\"}")
  }
  if (scenario === "mblock-rate-limit") {
    throw new Error("transfer failed (RATE_LIMIT): too many requests, retry later")
  }
  if (scenario === "mblock-validation-error") {
    throw new Error("transfer failed (VALIDATION_ERROR): bad amount")
  }
}

export async function getPrivateBalance(opts: {
  pubkey: string
  mint?: string
}): Promise<bigint> {
  await mockDelay({ minMs: 250, maxMs: 700 })
  honorScenarioForMblock()
  // Deterministic-ish balance derived from the pubkey so the UI is stable
  // across reloads but varies per wallet.
  const seed = opts.pubkey.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const usdc = 100 + (seed % 9000)
  return BigInt(usdc * 1_000_000)
}

export async function privateTransfer(opts: {
  fromPubkey: string
  toPubkey: string
  amountUsdc: number
  mint?: string
  fromBalance?: "base" | "ephemeral"
  toBalance?: "base" | "ephemeral"
  memo?: string
  legacy?: boolean
}): Promise<BuiltTransaction> {
  await mockDelay({ minMs: 400, maxMs: 1100 })
  honorScenarioForMblock()

  const sendTo: "base" | "ephemeral" =
    opts.fromBalance === "ephemeral" || opts.toBalance === "ephemeral" ? "ephemeral" : "base"

  return BuildTxSchema.parse({
    kind: "transfer",
    version: opts.legacy ? "legacy" : "v0",
    transactionBase64: fakeBase64(220),
    sendTo,
    recentBlockhash: fakeBase58(44),
    lastValidBlockHeight: 250_000_000 + Math.floor(Math.random() * 10_000),
    instructionCount: 3,
    requiredSigners: [opts.fromPubkey],
    validator: "mock-validator",
  })
}
