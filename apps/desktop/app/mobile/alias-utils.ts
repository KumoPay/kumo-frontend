/** Normalize local alias: no spaces; letters (any case), digits, and _ only. */
export function sanitizeKumoLocalPart(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 24)
}

export const KUMO_ALIAS_MIN_LEN = 3

/** Strip legacy `.kumo` suffix when showing the handle in UI. */
export function displayWalletAlias(name: string | undefined | null): string {
  if (!name) return ""
  return name.replace(/\.kumo$/i, "")
}
