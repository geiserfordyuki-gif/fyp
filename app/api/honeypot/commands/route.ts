import { type NextRequest, NextResponse } from "next/server"
import { getHoneypotCommands } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const secLabel = searchParams.get("secLabel") || undefined
    const catLabel = searchParams.get("catLabel") || undefined
    const sourceIp = searchParams.get("sourceIp") || undefined

    const commands = await getHoneypotCommands(search, secLabel, catLabel, sourceIp)
    return NextResponse.json({ commands })
  } catch (error) {
    console.error("Get honeypot commands API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
