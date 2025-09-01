import { type NextRequest, NextResponse } from "next/server"
import { updateUserPassword, authenticateUser } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔎 Incoming body:", body)

    const { userId, currentPassword, newPassword, username } = body

    if (!userId || !currentPassword || !newPassword || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }


    if (!userId || !currentPassword || !newPassword || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Verify current password
    const user = await authenticateUser(username, currentPassword)
    if (!user || user.ID !== userId) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    const success = await updateUserPassword(userId, newPassword)

    if (success) {
      return NextResponse.json({ message: "Password updated successfully" })
    } else {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }
  } catch (error) {
    console.error("Change password API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
