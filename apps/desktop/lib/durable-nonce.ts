// Mock durable-nonce module.
//
// In production this calls into the Solana web3 client to create + manage
// a durable nonce account, build offline transactions, and serialize them.
// Here we keep the same exported names + shapes so API routes can
// continue to call .serialize() and persist intent state in localStorage,
// but every chain operation is a synthetic stand-in.

import { mockDelay } from "./mock-config"

export type NonceCacheEntry = {
  noncePubkey: string
  nonce: string // base58 — used as recentBlockhash in production
  authorityPubkey: string
  refreshedAt: number
}

const NONCE_CACHE_KEY = "kumo:nonce"
const PENDING_TX_KEY = "kumo:pending-tx"

const FAKE_NONCE_PUBKEY = "MockNonce1111111111111111111111111111111111"
const FAKE_NONCE_VALUE = "11111111111111111111111111111111"
const FAKE_AUTHORITY = "MockAuthor1ty1111111111111111111111111111111"

// ---- localStorage helpers (unchanged from production) --------------------

export function loadNonceCache(): NonceCacheEntry | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(NONCE_CACHE_KEY)
  return raw ? (JSON.parse(raw) as NonceCacheEntry) : null
}

export function saveNonceCache(entry: NonceCacheEntry): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(NONCE_CACHE_KEY, JSON.stringify(entry))
}

export function storePendingTx(serializedTxB64: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PENDING_TX_KEY, serializedTxB64)
}

export function loadPendingTx(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(PENDING_TX_KEY)
}

export function clearPendingTx(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(PENDING_TX_KEY)
}

// ---- Synthetic chain operations -----------------------------------------

export async function createDurableNonce(_opts?: unknown): Promise<{
  noncePubkey: { toBase58: () => string }
  nonceAccount: { publicKey: { toBase58: () => string } }
}> {
  await mockDelay({ minMs: 300, maxMs: 700 })
  const pk = FAKE_NONCE_PUBKEY
  return {
    noncePubkey: { toBase58: () => pk },
    nonceAccount: { publicKey: { toBase58: () => pk } },
  }
}

export async function refreshNonceFromChain(_opts?: unknown): Promise<NonceCacheEntry> {
  await mockDelay({ minMs: 200, maxMs: 500 })
  const entry: NonceCacheEntry = {
    noncePubkey: FAKE_NONCE_PUBKEY,
    nonce: FAKE_NONCE_VALUE,
    authorityPubkey: FAKE_AUTHORITY,
    refreshedAt: Date.now(),
  }
  saveNonceCache(entry)
  return entry
}

// ---- Offline tx builder -------------------------------------------------

export type OfflineMockTx = {
  __mockTx: true
  signedAt: number
  serialized: string
  serialize: () => Buffer
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function fakeBase58(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)]
  }
  return out
}

/**
 * Returns an opaque tagged object whose .serialize() yields a Buffer the
 * caller can base58-encode. The real implementation builds + signs a
 * Transaction; we just emit a synthetic blob that matches the production
 * envelope shape.
 */
export function buildOfflineTx(_opts: {
  payerSigner: unknown
  cached: NonceCacheEntry
  instructions?: unknown[]
}): OfflineMockTx {
  const serialized = fakeBase58(88)
  return {
    __mockTx: true,
    signedAt: Date.now(),
    serialized,
    serialize: () => Buffer.from(serialized, "utf8"),
  }
}
