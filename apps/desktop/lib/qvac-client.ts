// Mock QVAC client.
//
// In production this calls a local LLM at http://localhost:11434/v1.
// Here we do a cheap deterministic parse of the input so /api/parse-intent
// returns the same { ok, intent } envelope without any network egress.

import { PaymentIntent, PaymentIntentSchema } from "@kumo/shared"
import { mockDelay, currentScenario } from "./mock-config"

export class QvacUnreachableError extends Error {
  constructor(cause?: unknown) {
    super(
      "QVAC server unreachable at http://localhost:11434/v1. Run `qvac serve` in a separate terminal before using Kumo.",
    )
    this.name = "QvacUnreachableError"
    if (cause) (this as { cause?: unknown }).cause = cause
  }
}

const PRIVATE_TOKENS = ["private", "privately", "confidential", "off the record"]
const STOP_WORDS = new Set([
  "pay",
  "send",
  "transfer",
  "to",
  "for",
  "usd",
  "usdc",
  "dollars",
  "dollar",
  "the",
  "a",
  "an",
  "with",
  "note",
  "memo",
  ...PRIVATE_TOKENS.flatMap((t) => t.split(/\s+/)),
])

function extractAmount(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)/)
  return m ? Number(m[1]) : null
}

function extractRecipient(text: string): string | null {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !/^\d/.test(t))
    .filter((t) => !STOP_WORDS.has(t))
  return tokens[0] ?? null
}

function extractMemo(text: string): string | undefined {
  const forMatch = text.match(/\bfor\s+([a-z0-9 ]+?)(?:\s+(?:privately|private|confidential|off the record)|$)/i)
  if (forMatch) return forMatch[1].trim().slice(0, 120)
  const noteMatch = text.match(/\bnote[: ]\s*(.+)$/i)
  if (noteMatch) return noteMatch[1].trim().slice(0, 120)
  return undefined
}

function isPrivate(text: string): boolean {
  const lower = text.toLowerCase()
  return PRIVATE_TOKENS.some((t) => lower.includes(t))
}

const FIXTURE: PaymentIntent = {
  recipient: "maria",
  amount_usdc: 50,
  private: true,
}

export async function parseIntent(text: string): Promise<PaymentIntent> {
  await mockDelay({ minMs: 600, maxMs: 1500 })

  const scenario = currentScenario()
  if (scenario === "qvac-down") throw new QvacUnreachableError()
  if (scenario === "qvac-malformed") {
    throw new Error("QVAC returned non-JSON: i think you should pay maria")
  }

  const trimmed = text.trim()
  if (!trimmed) return PaymentIntentSchema.parse(FIXTURE)

  const recipient = extractRecipient(trimmed) ?? FIXTURE.recipient
  const amount = extractAmount(trimmed) ?? FIXTURE.amount_usdc
  const intent: PaymentIntent = {
    recipient,
    amount_usdc: amount,
    private: isPrivate(trimmed),
  }
  const memo = extractMemo(trimmed)
  if (memo) intent.memo = memo
  return PaymentIntentSchema.parse(intent)
}
