import { NextResponse } from "next/server"
import { getUniqueSecLabels, getUniqueCatLabels, getUniqueSourceIPs } from "../../../../lib/database"

export async function GET() {
  try {
    const [secLabels, catLabels, sourceIPs] = await Promise.all([
      getUniqueSecLabels(),
      getUniqueCatLabels(),
      getUniqueSourceIPs(),
    ])

    return NextResponse.json({
      secLabels,
      catLabels,
      sourceIPs,
    })
  } catch (error) {
    console.error("Get filters API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
