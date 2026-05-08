# Kumo UI mock

Frontend-only mock of the Kumo desktop app. Pure local Next.js — no QVAC,
no Solana toolchain, no MagicBlock JWT. Every external integration is
replaced with a deterministic in-process mock so designers and frontend
folks can iterate on the UI without spinning up the production stack.

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

No env vars required. The full demo flow runs end to end:
`type intent → parse → sign → reconnect → broadcast → settled`.

## Switching scenarios

The mocks support a few error/latency scenarios for exploring edge states
(QVAC unreachable, MagicBlock 5xx, slow network). Set them via env at
boot or via DevTools at runtime — see [`docs/MOCK_MODE.md`](./docs/MOCK_MODE.md)
for the full list and the request/response contract for each API route.

## Source of truth

The production app this mirrors lives in the main Kumo monorepo. Changes
here are intended to be portable back: workspace layout, file paths,
component shapes, and API response envelopes are kept identical.
