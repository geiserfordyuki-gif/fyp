import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, addUser } from "../../../lib/database"

export async function GET() {
  try {
    const users = await getAllUsers()
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ID, ...user }) => ({
      id: ID, 
      ...user,
    }))
    
    return NextResponse.json({ users: usersWithoutPasswords })
  } catch (error) {
    console.error("Get users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json()

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Username, password, and role are required" }, { status: 400 })
    }

    if (!["student", "lecturer"].includes(role)) {
      return NextResponse.json({ error: "Role must be either student or lecturer" }, { status: 400 })
    }

    const success = await addUser(username, password, role)

    if (success) {
      return NextResponse.json({ message: "User added successfully" })
    } else {
      return NextResponse.json({ error: "Failed to add user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Add user API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
