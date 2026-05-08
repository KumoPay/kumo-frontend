// Mock demo wallet. The shape mirrors what the real loadDemoWallet()
// returned so API routes can call .publicKey.toBase58() unchanged.

export const MOCK_DEMO_PUBKEY = "MockWa11et1111111111111111111111111111111111"

export type MockWallet = {
  publicKey: { toBase58: () => string }
}

export function loadDemoWallet(): MockWallet {
  return {
    publicKey: { toBase58: () => MOCK_DEMO_PUBKEY },
  }
}
