import { type NextRequest, NextResponse } from "next/server"
import { getHoneypotCredentials } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const credentials = await getHoneypotCredentials(sessionId)
    return NextResponse.json({ credentials })
  } catch (error) {
    console.error("Get honeypot credentials API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
