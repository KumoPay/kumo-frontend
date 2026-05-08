import { z } from "zod"

// --- PaymentIntent --------------------------------------------------------
// Output of the natural-language → structured intent parser.
// Kept tiny on purpose: any extra field would just give the LLM more rope.

export const PaymentIntentSchema = z.object({
  recipient: z.string().min(1).max(64), // either a base58 pubkey OR a label like "maria" we resolve from a local contact map
  amount_usdc: z.number().positive().max(1_000_000),
  private: z.boolean(),
  memo: z.string().max(120).optional(),
})
export type PaymentIntent = z.infer<typeof PaymentIntentSchema>

// --- SignedOfflineTx ------------------------------------------------------
// What the offline signer hands to the broadcast endpoint after reconnect.

export const SignedOfflineTxSchema = z.object({
  intent: PaymentIntentSchema,
  intent_hash: z.string().regex(/^[0-9a-f]{64}$/i), // sha256 hex
  serialized_tx_b64: z.string(), // serialized signed Solana tx (base58 or base64)
  nonce_account: z.string(),
  signed_at: z.number().int().nonnegative(),
})
export type SignedOfflineTx = z.infer<typeof SignedOfflineTxSchema>

// --- BroadcastResult ------------------------------------------------------

export const BroadcastResultSchema = z.object({
  ok: z.boolean(),
  signature: z.string().optional(),
  magicblock_session_id: z.string().optional(),
  error: z.string().optional(),
})
export type BroadcastResult = z.infer<typeof BroadcastResultSchema>

// --- helpers --------------------------------------------------------------

export function hashIntent(intent: PaymentIntent): Promise<string> {
  // SHA-256 hex of canonical JSON. Used as the on-chain commitment key.
  const canonical = JSON.stringify({
    recipient: intent.recipient,
    amount_usdc: intent.amount_usdc,
    private: intent.private,
    memo: intent.memo ?? "",
  })
  // Works in both Node 20+ and the browser (Web Crypto).
  const enc = new TextEncoder().encode(canonical)
  return crypto.subtle.digest("SHA-256", enc).then((buf) => {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  })
}
