import { NextResponse } from "next/server"

// which deployment is live right now; the app compares it with the one it was built from (components/UpdateChecker.tsx)
export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({ id: process.env.VERCEL_GIT_COMMIT_SHA || "dev" }, { headers: { "Cache-Control": "no-store" } })
}
