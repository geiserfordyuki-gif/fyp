import { type NextRequest, NextResponse } from "next/server"
import { addForumReply, getForumReplies } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const { postid, userid, content } = await request.json()

    const success = await addForumReply(postid, userid, content)

    if (success) {
      return NextResponse.json({ message: "Reply added successfully" })
    } else {
      return NextResponse.json({ error: "Failed to add reply" }, { status: 500 })
    }
  } catch (error) {
    console.error("Add forum reply error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postid = searchParams.get("postid")

    if (!postid) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const replies = await getForumReplies(Number.parseInt(postid))
    return NextResponse.json({ replies })
  } catch (error) {
    console.error("Get forum replies error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
