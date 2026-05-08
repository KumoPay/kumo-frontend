"use client"

// Mock wallet hook + provider that mirrors the surface of
// @solana/wallet-adapter-react's useWallet/useConnection without pulling
// in any Solana toolchain. Only the fields the desktop app actually
// reads are implemented.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { mockDelay } from "./mock-config"

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function fakeBase58(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)]
  }
  return out
}

const MOCK_USER_PUBKEY = "MockUser11111111111111111111111111111111111"

export type MockPublicKey = {
  toBase58: () => string
}

export type MockWalletContextValue = {
  connected: boolean
  publicKey: MockPublicKey | null
  wallet: { adapter: { name: string } } | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signMessage: ((msg: Uint8Array) => Promise<Uint8Array>) | null
  signTransaction: <T>(tx: T) => Promise<T>
}

const MockWalletContext = createContext<MockWalletContextValue | null>(null)

export function MockWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)

  const value = useMemo<MockWalletContextValue>(
    () => ({
      connected,
      publicKey: connected ? { toBase58: () => MOCK_USER_PUBKEY } : null,
      wallet: connected ? { adapter: { name: "Mock Wallet" } } : null,
      async connect() {
        await mockDelay({ minMs: 200, maxMs: 600 })
        setConnected(true)
      },
      async disconnect() {
        setConnected(false)
      },
      signMessage: connected
        ? async (msg: Uint8Array) => {
            await mockDelay({ minMs: 200, maxMs: 600 })
            // 64-byte synthetic signature, the size ed25519 produces.
            const sig = new Uint8Array(64)
            for (let i = 0; i < sig.length; i++) {
              sig[i] = (msg[i % msg.length] ?? 0) ^ (i * 7 + 13)
            }
            return sig
          }
        : null,
      async signTransaction<T>(tx: T): Promise<T> {
        await mockDelay({ minMs: 250, maxMs: 700 })
        return tx
      },
    }),
    [connected],
  )

  return <MockWalletContext.Provider value={value}>{children}</MockWalletContext.Provider>
}

export function useWallet(): MockWalletContextValue {
  const ctx = useContext(MockWalletContext)
  if (!ctx) {
    throw new Error("useWallet must be used inside <MockWalletProvider>")
  }
  return ctx
}

// Mock the connection surface the app needs. /api/broadcast is the source
// of truth for "the tx landed" — this just produces a fake signature when
// the page reaches for client-side sendRawTransaction.
export function useConnection(): {
  connection: { sendRawTransaction: (raw: Uint8Array) => Promise<string> }
} {
  return useMemo(
    () => ({
      connection: {
        async sendRawTransaction(_raw: Uint8Array) {
          await mockDelay({ minMs: 1500, maxMs: 3000 })
          return fakeBase58(88)
        },
      },
    }),
    [],
  )
}

// Drop-in replacement for WalletModalButton. Renders the same kumo-wallet-btn
// styling hook as the production button, so the styles in globals.css apply.
export function MockWalletButton({ children }: { children?: ReactNode }) {
  const { connected, connect, disconnect } = useWallet()
  return (
    <button
      type="button"
      onClick={() => (connected ? disconnect() : connect())}
      className="wallet-adapter-button wallet-adapter-button-trigger"
    >
      {children ?? (connected ? "Connected ✓" : "Connect wallet")}
    </button>
  )
}
