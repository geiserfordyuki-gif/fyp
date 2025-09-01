import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      )
    }

    const user = await authenticateUser(username, password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
