import { type NextRequest, NextResponse } from "next/server"
import { deleteForumPost } from "../../../../../lib/database"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const postId = Number.parseInt(id)

  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  const success = await deleteForumPost(postId)

  if (success) {
    return NextResponse.json({ message: "Post deleted successfully" })
  } else {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}