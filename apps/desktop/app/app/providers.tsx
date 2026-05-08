"use client"

import { type ReactNode } from "react"
import { MockWalletProvider } from "@/lib/mock-wallet"

export function KumoWalletProvider({ children }: { children: ReactNode }) {
  return <MockWalletProvider>{children}</MockWalletProvider>
}
