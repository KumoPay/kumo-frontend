// Scenario switch + delay helper for the mock backend.
//
// Server reads MOCK_SCENARIO from process.env. Client reads
// localStorage["kumo:mock-scenario"]. Default is "happy".
// See docs/MOCK_MODE.md for the full contract per scenario.

export type MockScenario =
  | "happy"
  | "qvac-down"
  | "qvac-malformed"
  | "mblock-5xx"
  | "mblock-rate-limit"
  | "mblock-validation-error"
  | "slow"

const SCENARIO_KEY = "kumo:mock-scenario"
const VALID: ReadonlyArray<MockScenario> = [
  "happy",
  "qvac-down",
  "qvac-malformed",
  "mblock-5xx",
  "mblock-rate-limit",
  "mblock-validation-error",
  "slow",
]

function isMockScenario(v: string | null | undefined): v is MockScenario {
  return !!v && (VALID as ReadonlyArray<string>).includes(v)
}

export function currentScenario(): MockScenario {
  if (typeof window !== "undefined") {
    const v = window.localStorage.getItem(SCENARIO_KEY)
    if (isMockScenario(v)) return v
  }
  if (typeof process !== "undefined") {
    const v = process.env.MOCK_SCENARIO
    if (isMockScenario(v)) return v
  }
  return "happy"
}

export function setMockScenario(scenario: MockScenario): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SCENARIO_KEY, scenario)
}

export async function mockDelay(opts: { minMs: number; maxMs: number }): Promise<void> {
  const slow = currentScenario() === "slow" ? 4 : 1
  const min = opts.minMs * slow
  const max = opts.maxMs * slow
  const ms = Math.floor(min + Math.random() * (max - min))
  await new Promise((resolve) => setTimeout(resolve, ms))
}
