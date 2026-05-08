// apps/desktop/app/api/parse-intent/route.ts
//
// Mock-mode: parses natural-language payment intents in process via
// lib/qvac-client. The request/response envelope matches production
// — { ok, intent } on success, { ok: false, error } on failure with
// 503 for "QVAC unreachable" and 422 for everything else.

import { NextRequest, NextResponse } from "next/server"
import { parseIntent, QvacUnreachableError } from "@/lib/qvac-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.text !== "string") {
    return NextResponse.json({ ok: false, error: "Missing `text`" }, { status: 400 })
  }
  try {
    const intent = await parseIntent(body.text)
    return NextResponse.json({ ok: true, intent })
  } catch (e: unknown) {
    if (e instanceof QvacUnreachableError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 503 })
    }
    const msg = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ ok: false, error: msg }, { status: 422 })
  }
}
