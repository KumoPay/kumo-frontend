import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Monorepo root (kumo-frontend). Fixes Next inferring `C:\\Users\\…` when a stray lockfile exists there. */
const outputFileTracingRoot = path.join(__dirname, "../..")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kumo/shared"],
  outputFileTracingRoot,
}
export default nextConfig
