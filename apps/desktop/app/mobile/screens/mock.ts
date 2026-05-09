export type Contact = {
  id: string
  name: string
  handle: string
  bg: string
  initial: string
}

export type HistoryEntry = {
  id: string
  direction: "out" | "in"
  counterparty: string
  amount: number
  status: "delivered" | "queued"
  when: string
}

export const mock = {
  walletLabel: "Phantom",
  walletPubkey: "561BgNK9Rt8oNdvv51FEFp9JX9iW8ncWson5BryRvA8z",
  walletDisplayName: "alice.kumo",
  balanceUsdc: 245.3,

  contacts: [
    { id: "alice", name: "Alice Reyes", handle: "@alice", bg: "#7FE8FF", initial: "A" },
    { id: "bob", name: "Bob Kim", handle: "@bob.kumo", bg: "#C7B5FF", initial: "B" },
    { id: "carol", name: "Carol Chen", handle: "@carol", bg: "#B7F1FF", initial: "C" },
    { id: "david", name: "David Park", handle: "@dpark", bg: "#7FE8FF", initial: "D" },
    { id: "elena", name: "Elena Cruz", handle: "@elena", bg: "#C7B5FF", initial: "E" },
  ] as Contact[],

  history: [
    { id: "h1", direction: "out", counterparty: "alice", amount: 1, status: "delivered", when: "just now" },
    { id: "h2", direction: "in", counterparty: "bob", amount: 5, status: "delivered", when: "yesterday" },
    { id: "h3", direction: "out", counterparty: "carol", amount: 12.5, status: "queued", when: "2d ago" },
    { id: "h4", direction: "in", counterparty: "elena", amount: 8, status: "delivered", when: "1w ago" },
    { id: "h5", direction: "out", counterparty: "david", amount: 4.2, status: "delivered", when: "1w ago" },
  ] as HistoryEntry[],

  intent: { recipient: "alice", amount_usdc: 1, private: true },
  intentHash: "3fpa1q9k2bd5e8f7c0a1b2d3e4f5a6b7c8d9e0a1b2c3d4e5f6a7b8c9d0e1f2",
  offlineSig: "5VfS9pXxK7mqL3nE2tB8wN6vR4cYjQzA1dF7gH9iJ0kLmNoPqRsTuVwXyZ",
  settlement: {
    signature: "5VfS9pXxK7mqL3nE2tB8wN6vR4cYjQzA1dF7gH9iJ0kLmN",
    sessionId: "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57",
  },
  text: "pay alice 1 usdc privately",
} as const
