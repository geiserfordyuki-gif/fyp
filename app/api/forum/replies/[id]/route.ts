import { type NextRequest, NextResponse } from "next/server"
import { deleteForumReply } from "../../../../../lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const replyId = Number.parseInt(params.id)

    if (isNaN(replyId)) {
      return NextResponse.json({ error: "Invalid reply ID" }, { status: 400 })
    }

    const success = await deleteForumReply(replyId)

    if (success) {
      return NextResponse.json({ message: "Reply deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete reply" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete reply API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
