import { type NextRequest, NextResponse } from "next/server"
import { deleteUser } from "../../../../lib/database"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }   // ✅ params is Promise
) {
  try {
    const { id } = await context.params          // ✅ await it
    console.log("DELETE user id:", id)

    const userId = Number.parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const success = await deleteUser(userId)
    if (!success) {
      return NextResponse.json({ error: "User not found or could not be deleted" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    )
  }
}
