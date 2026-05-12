"use client"

import { MobileShell } from "./MobileShell"

/** Client boundary for `/mobile` so hooks + wallet state stay on the client tree. */
export default function MobilePageClient() {
  return <MobileShell />
}
