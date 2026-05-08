import { describe, it, expect } from "vitest"
import { PaymentIntentSchema } from "@kumo/shared"
import { parseIntent } from "@/lib/qvac-client"

describe("mock parseIntent", () => {
  it("returns a Zod-valid PaymentIntent for the canonical demo input", async () => {
    const intent = await parseIntent("pay maria 50 usdc privately")
    expect(() => PaymentIntentSchema.parse(intent)).not.toThrow()
    expect(intent.recipient).toBe("maria")
    expect(intent.amount_usdc).toBe(50)
    expect(intent.private).toBe(true)
  })
})
