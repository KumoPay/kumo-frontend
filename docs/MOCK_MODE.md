# Mock mode

This repo is a UI-only mirror of the production Kumo app. Every
external integration (QVAC, Solana RPC, MagicBlock Private Payments,
LI.FI, the wallet adapter) has been replaced with an in-process mock.
The point: iterate on UI/design without touching the production stack.

The contracts below match the production app's API routes byte-for-byte
so changes made here can be ported back without a shape rewrite.

---

## Switching scenarios

Server-side (boot-time):

```bash
MOCK_SCENARIO=qvac-down pnpm dev
```

Client-side (runtime, from DevTools):

```js
localStorage.setItem("kumo:mock-scenario", "qvac-down")
// reload
```

Reset:

```js
localStorage.removeItem("kumo:mock-scenario")
```

Default is `happy`. Client-side state wins over `process.env`.

### Scenarios

| Name                       | Effect                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `happy`                    | Everything succeeds with realistic latency.                                             |
| `qvac-down`                | `parseIntent` throws `QvacUnreachableError`. `/api/parse-intent` returns 503.           |
| `qvac-malformed`           | `parseIntent` throws "non-JSON" error. `/api/parse-intent` returns 422.                 |
| `mblock-5xx`               | MagicBlock client + `/api/broadcast` return 502.                                        |
| `mblock-rate-limit`        | MagicBlock client throws `RATE_LIMIT`. Routes that depend on it return 502.             |
| `mblock-validation-error`  | MagicBlock client throws `VALIDATION_ERROR`. Routes that depend on it return 502.       |
| `slow`                     | All `mockDelay` calls run at 4× duration. Useful for testing skeletons / busy states.   |

---

## API contracts

### POST `/api/parse-intent`

Parse a natural-language payment instruction.

**Request**

```json
{ "text": "pay maria 50 usdc privately" }
```

**Response — success (200)**

```json
{
  "ok": true,
  "intent": {
    "recipient": "maria",
    "amount_usdc": 50,
    "private": true,
    "memo": "rent april"
  }
}
```

**Response — failure**

- `400` — `{ "ok": false, "error": "Missing `text`" }`
- `503` — `{ "ok": false, "error": "QVAC server unreachable…" }` (scenario `qvac-down`)
- `422` — `{ "ok": false, "error": <message> }` (schema or LLM JSON failure)

---

### POST `/api/build-tx`

Build + sign a durable-nonce transaction "offline".

**Request**

```json
{
  "intent": { "recipient": "maria", "amount_usdc": 50, "private": true },
  "nonce": {
    "noncePubkey": "…",
    "nonce": "…",
    "authorityPubkey": "…",
    "refreshedAt": 1714000000000
  },
  "recipientPubkey": "AMBTMn1TiX3jWcGh9BUnasBq1jix3ShJyu2QTGkSZZxQ"
}
```

**Response — success (200)**

```json
{
  "ok": true,
  "signed_tx_b58": "<88-char base58-ish string>",
  "intent": { ... },
  "intent_hash": "<sha256 hex>",
  "nonce": { ... },
  "signed_at": 1714000000000
}
```

**Response — failure**

- `400` — invalid intent or missing `recipientPubkey`
- `412` — missing cached durable nonce

---

### POST `/api/broadcast`

Settle a queued payment. Mock-mode delays 1.5–3s to preserve the demo's
drama beat between BROADCAST and the receipt.

**Request**

```json
{
  "intent": { "recipient": "maria", "amount_usdc": 50, "private": true },
  "recipientPubkey": "AMBTMn1TiX3jWcGh9BUnasBq1jix3ShJyu2QTGkSZZxQ",
  "signed_tx_b58": "<optional, from /api/build-tx>"
}
```

**Response — success (200)**

```json
{
  "ok": true,
  "signature": "<88-char base58-ish string>",
  "magicblock_session_id": "mock-validator",
  "send_to": "base"
}
```

**Response — failure**

- `400` — invalid intent or missing `recipientPubkey`
- `502` — `{ "ok": false, "error": "Broadcast failed…" }` (scenario `mblock-5xx`)

---

### POST `/api/build-private-transfer`

Build an unsigned MagicBlock private transfer for the client to sign with
its own wallet.

**Request**

```json
{
  "intent": { "recipient": "maria", "amount_usdc": 50, "private": true },
  "recipientPubkey": "AMBTMn1TiX3jWcGh9BUnasBq1jix3ShJyu2QTGkSZZxQ",
  "userPubkey": "MockUser11111111111111111111111111111111111"
}
```

**Response — success (200)**

```json
{
  "ok": true,
  "transaction_b64": "<base64 bytes>",
  "send_to": "base",
  "version": "v0",
  "required_signers": ["…"],
  "validator": "mock-validator",
  "last_valid_block_height": 250000123
}
```

**Response — failure**

- `400` — invalid intent or missing pubkeys
- `502` — `{ "ok": false, "error": "<scenario message>" }` (scenarios `mblock-5xx`, `mblock-rate-limit`, `mblock-validation-error`)

---

## What's mocked, where

- `lib/qvac-client.ts` — deterministic NL → `PaymentIntent` parse + `QvacUnreachableError` re-export.
- `lib/durable-nonce.ts` — synthetic `NonceCacheEntry`, fake serialized tx. localStorage helpers preserved.
- `lib/magicblock-pmts.ts` — synthetic balance + `BuiltTransaction`.
- `lib/wallet.ts` — fake demo pubkey.
- `lib/mock-wallet.tsx` — replaces `@solana/wallet-adapter-react`'s `useWallet`/`useConnection`/`WalletModalButton` for the `/app` shell.
- `lib/mock-config.ts` — scenario switching + `mockDelay`.
